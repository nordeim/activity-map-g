// Seed: mirrors the reference app's data (ROAM — Augsburg City Guide).
// Idempotent: clears domain tables, then inserts the captured entity data
// (12 Eat + 12 Stay + 18 Do places) plus the demo login user and the guest
// account (the login-free first visit — see src/lib/guest.ts).
// Run: npm run db:seed  (or: npx tsx prisma/seed.ts)

import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";
import { readFileSync } from "fs";
import path from "path";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

interface EntityRecord {
  [key: string]: unknown;
}

function loadData(name: string): EntityRecord[] {
  const file = path.join(__dirname, "data", `${name}.json`);
  return JSON.parse(readFileSync(file, "utf-8")) as EntityRecord[];
}

// ---------------------------------------------------------------------------
// Deterministic coordinates per neighborhood (Augsburg, Bavaria).
// The reference app's entities carry no lat/lng, yet its map plots markers
// across the old town — we reproduce that by anchoring each neighborhood to
// its real-world location and jittering per-slug so markers don't overlap.
// ---------------------------------------------------------------------------
const NEIGHBORHOOD_ANCHORS: Record<string, [number, number]> = {
  "Dom Viertel": [48.3735, 10.8958],
  "Rathausplatz": [48.3688, 10.8975],
  "Maximilianstraße": [48.3652, 10.8932],
  Fuggerei: [48.3705, 10.9038],
  "Lechviertel": [48.3699, 10.9022],
  "Lech Quarter": [48.3699, 10.9022],
  Altstadt: [48.3688, 10.898],
  "Old Town": [48.3688, 10.898],
  Innenstadt: [48.3675, 10.8965],
  Jakobervorstadt: [48.3732, 10.9012],
  "Jakoberstraße": [48.3734, 10.9018],
  Siebentischwald: [48.3483, 10.9037],
  "Botanical Garden": [48.3522, 10.8944],
  Stadtmarkt: [48.3669, 10.8951],
  Textilviertel: [48.3608, 10.9122],
  Pfersee: [48.3657, 10.8769],
  Haunstetten: [48.3283, 10.9117],
  Oberhausen: [48.3769, 10.8845],
  Kriegshaber: [48.3578, 10.8719],
  Annstraße: [48.3665, 10.8977],
  "Fuggerstraße": [48.3645, 10.8995],
};

const AUGSBURG_CENTER: [number, number] = [48.3713, 10.8982];

function jitter(slug: string, scale = 0.0022): [number, number] {
  // Stable string hash → deterministic ±scale offset.
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = ((h >>> 0) % 1000) / 1000 - 0.5;
  const b = (((h >>> 10) % 1000) / 1000 - 0.5);
  return [a * scale, b * scale];
}

function coordsFor(neighborhood: string | null, slug: string): [number, number] {
  const anchor = neighborhood ? NEIGHBORHOOD_ANCHORS[neighborhood] : undefined;
  const base = anchor ?? AUGSBURG_CENTER;
  const [dy, dx] = jitter(slug);
  return [base[0] + dy, base[1] + dx];
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function int(v: unknown): number | null {
  const n = num(v);
  return n === null ? null : Math.round(n);
}

function jsonArray(v: unknown): string | null {
  if (Array.isArray(v) && v.length > 0) return JSON.stringify(v);
  return null;
}

async function main() {
  // Idempotency: wipe domain data, keep schema.
  await db.booking.deleteMany();
  await db.savedPlace.deleteMany();
  await db.place.deleteMany();
  await db.user.deleteMany();

  // Demo user — mirrors the reference app's login. Session-12 re-measure:
  // the live account's identity renders the USERNAME ("sepnetflix2023") as
  // the profile h1 with the EMAIL as the subtitle line; the avatar initial
  // still derives from the EMAIL ("S").
  const demo = await db.user.create({
    data: {
      email: "sepnetflix2023@outlook.com",
      // Session-14: the live account's identity now renders the USERNAME
      // as the profile h1 — seeded to match ("Explorer" was the session-12
      // live value; the account has since changed).
      name: "sepnetflix2023",
      passwordHash: hashPassword("$Abcd1234"),
      avatarColor: "#111111",
    },
  });
  console.log(`seeded user: ${demo.email}`);

  // Guest account — the login-free first visit (src/lib/guest.ts). The
  // password is a RANDOM 32-byte secret whose plaintext is discarded right
  // here: the row carries a valid scrypt hash for the schema, but the guest
  // can never be signed into through /api/auth/login. The runtime bootstrap
  // (GET /api/auth/guest) re-creates this row on demand for legacy DBs, so
  // an un-seeded database still gets a working guest experience.
  const guest = await db.user.create({
    data: {
      email: "guest@roam.local",
      name: "Guest",
      passwordHash: hashPassword(randomBytes(32).toString("hex")),
      avatarColor: "#996CE4",
    },
  });
  console.log(`seeded guest user: ${guest.email}`);

  const categories: Array<{ file: string; category: string; sortBase: number }> = [
    { file: "eat", category: "eat", sortBase: 0 },
    { file: "stay", category: "stay", sortBase: 100 },
    { file: "do", category: "do", sortBase: 200 },
  ];

  let count = 0;
  for (const { file, category, sortBase } of categories) {
    const records = loadData(file);
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const slug = String(r.slug ?? `${category}-${i}`);
      const [lat, lng] = coordsFor(str(r.neighborhood), slug);
      await db.place.create({
        data: {
          slug,
          name: String(r.name ?? slug),
          category,
          subCategory: str(r.sub_category),
          shortDescription: str(r.short_description),
          description: str(r.description),
          coverImageUrl: str(r.cover_image_url),
          galleryImages: jsonArray(r.gallery_images),
          priceRange: num(r.price_range),
          price: num(r.price),
          priceLabel: str(r.price_label),
          nightlyPrice: num(r.nightly_price),
          currency: str(r.currency) ?? "EUR",
          avgRating: num(r.avg_rating) ?? 0,
          reviewCount: int(r.review_count) ?? 0,
          isBookable: r.is_bookable === true,
          neighborhood: str(r.neighborhood),
          address: str(r.address),
          openingHours: str(r.opening_hours),
          durationMin: int(r.duration_min),
          minParty: int(r.min_party),
          maxParty: int(r.max_party),
          vibeTags: jsonArray(r.vibe_tags),
          cuisineTags: jsonArray(r.cuisine_tags),
          amenities: jsonArray(r.amenities),
          roomTypes: jsonArray(r.room_types),
          highlights: jsonArray(r.highlights),
          tags: jsonArray(r.tags),
          status: str(r.status) ?? "published",
          lat,
          lng,
          sortOrder: sortBase + i,
        },
      });
      count++;
    }
  }

  console.log(`seeded ${count} places (eat/stay/do) → ${process.env.DATABASE_URL ?? "db/custom.db"}`);

  // ---------------------------------------------------------------------------
  // Home-only content (session 2 parity): the Recommended Route itinerary
  // stops, the Highlighted Sights grid, and the Highlighted Restaurants strip.
  // These rows carry status "home" — browses and counts filter on
  // status "published", so the 12/12/18 category views stay untouched while
  // /place/home-route-* | home-sight-* | home-restaurant-* resolve like the
  // reference app's home links.
  // ---------------------------------------------------------------------------
  interface HomeRecord {
    [key: string]: unknown;
  }
  const home = JSON.parse(readFileSync(path.join(__dirname, "data", "home.json"), "utf-8")) as {
    route: HomeRecord[];
    sights: HomeRecord[];
    restaurants: HomeRecord[];
  };
  const homeGroups: Array<{ records: HomeRecord[]; category: string; sortBase: number }> = [
    { records: home.route, category: "mixed", sortBase: 300 },
    { records: home.sights, category: "mixed", sortBase: 400 },
    { records: home.restaurants, category: "mixed", sortBase: 500 },
  ];
  let homeCount = 0;
  for (const { records, sortBase } of homeGroups) {
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const slug = String(r.slug);
      const [lat, lng] = coordsFor(str(r.neighborhood), slug);
      await db.place.create({
        data: {
          slug,
          name: String(r.name),
          category: typeof r.category === "string" ? r.category : "do",
          subCategory: str(r.sub_category),
          shortDescription: str(r.short_description),
          description: str(r.description),
          coverImageUrl: str(r.cover_image_url),
          galleryImages: jsonArray([r.cover_image_url]),
          priceRange: num(r.price_range),
          price: num(r.price),
          priceLabel: str(r.price_label),
          currency: "EUR",
          avgRating: num(r.avg_rating) ?? 0,
          reviewCount: int(r.review_count) ?? 0,
          isBookable: r.is_bookable === true,
          neighborhood: str(r.neighborhood),
          address: str(r.address),
          openingHours: str(r.opening_hours),
          durationMin: int(r.duration_min),
          vibeTags: jsonArray(r.vibe_tags),
          cuisineTags: jsonArray(r.cuisine_tags),
          highlights: jsonArray(r.highlights),
          tags: jsonArray(r.tags),
          status: "home",
          lat,
          lng,
          sortOrder: sortBase + i,
        },
      });
      homeCount++;
    }
  }
  console.log(`seeded ${homeCount} home-only places (route/sights/restaurants, status "home")`);

  // ---------------------------------------------------------------------------
  // Map demo places (session 3 parity): the live map renders a hardcoded set
  // of 9 demo pins (bundle array `oP`, ids map-*) — NOT the browse entities
  // (none of the Eat/Stay/Do entities carry coordinates on the live app).
  // Seeded with status "map" so only the map view selects them.
  // ---------------------------------------------------------------------------
  const mapFile = JSON.parse(readFileSync(path.join(__dirname, "data", "map.json"), "utf-8")) as {
    places: HomeRecord[];
  };
  let mapCount = 0;
  for (let i = 0; i < mapFile.places.length; i++) {
    const r = mapFile.places[i];
    await db.place.create({
      data: {
        slug: String(r.slug),
        name: String(r.name),
        category: typeof r.category === "string" ? r.category : "do",
        subCategory: str(r.sub_category),
        shortDescription: str(r.short_description),
        description: str(r.description),
        coverImageUrl: str(r.cover_image_url),
        galleryImages: jsonArray([r.cover_image_url]),
        priceRange: num(r.price_range),
        price: num(r.price),
        currency: "EUR",
        avgRating: num(r.avg_rating) ?? 0,
        reviewCount: int(r.review_count) ?? 0,
        isBookable: r.is_bookable === true,
        neighborhood: str(r.neighborhood),
        vibeTags: jsonArray(r.vibe_tags),
        cuisineTags: jsonArray(r.cuisine_tags),
        amenities: jsonArray(r.amenities),
        tags: jsonArray(r.tags),
        status: "map",
        lat: num(r.lat),
        lng: num(r.lng),
        sortOrder: 600 + i,
      },
    });
    mapCount++;
  }
  console.log(`seeded ${mapCount} map demo places (status "map")`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
