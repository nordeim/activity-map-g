import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, signSession, verifyPassword, verifySessionToken } from "@/lib/auth";
import {
  GUEST_AVATAR_COLOR,
  GUEST_BOOTSTRAP_PATH,
  GUEST_EMAIL,
  GUEST_NAME,
  ensureGuestUser,
  hashGuestPassword,
  sanitizeNextPath,
} from "@/lib/guest";
import { GET as guestBootstrap } from "@/app/api/auth/guest/route";

// Guest bootstrap (login-free first visit): the (app)/(bare) layouts bounce
// session-less visitors through GET /api/auth/guest, which provisions/uses the
// seeded guest account, signs the 7-day session cookie, and 303s back to a
// SANITISED next path. These tests pin the pure seams (identity, password
// unpredictability, create-or-reuse, open-redirect guard) plus the route
// handler itself — the Prisma dependency is swapped for an in-memory fake so
// no SQLite file is needed (same style as tests/db-path.test.ts / auth.test.ts).

const ORIGIN = "http://localhost:3000";

// An in-memory stand-in for the Prisma user delegate. vi.hoisted keeps the
// reference alive before the vi.mock factory below runs.
const fakeUsers = vi.hoisted(() => {
  interface Row {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    avatarColor: string;
  }
  const rows: Row[] = [];
  const store = {
    rows,
    findUnique: vi.fn(
      async (args: { where: { email: string } }): Promise<Row | null> =>
        rows.find((r) => r.email === args.where.email) ?? null,
    ),
    upsert: vi.fn(
      async (args: { where: { email: string }; create: Omit<Row, "id">; update: object }): Promise<Row> => {
        const existing = rows.find((r) => r.email === args.where.email);
        if (existing) return existing; // unique email → the race loser UPDATEs
        const row: Row = { id: `guest-${rows.length + 1}`, ...args.create };
        rows.push(row);
        return row;
      },
    ),
  };
  return store;
});

vi.mock("@/lib/db", () => ({ db: { user: fakeUsers } }));

function request(path = GUEST_BOOTSTRAP_PATH, cookie?: string): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, cookie ? { headers: { cookie } } : undefined);
}

// ---------------------------------------------------------------------------
// The seeded guest account contract
// ---------------------------------------------------------------------------

describe("guest identity", () => {
  it("pins the guest account identity used by the seed and the bootstrap", () => {
    expect(GUEST_EMAIL).toBe("guest@roam.local");
    expect(GUEST_NAME).toBe("Guest");
    expect(GUEST_AVATAR_COLOR).toBe("#996CE4");
    expect(GUEST_BOOTSTRAP_PATH).toBe("/api/auth/guest");
  });

  it("hashes a FRESH random secret on every call — no two hashes match", () => {
    const a = hashGuestPassword();
    const b = hashGuestPassword();
    // The app-wide scrypt format: 16-byte hex salt + 64-byte hex hash.
    expect(a).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(b).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(a).not.toBe(b);
  });

  it("never verifies against guessable plaintexts", () => {
    // The random secret is discarded at generation time, so /api/auth/login
    // can never sign the guest account in — the hash must reject every guess.
    const stored = hashGuestPassword();
    for (const guess of ["", "password", "guest", "guest@roam.local", "12345678", "$Abcd1234"]) {
      expect(verifyPassword(guess, stored)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// ensureGuestUser — create-or-reuse, race-safe
// ---------------------------------------------------------------------------

describe("ensureGuestUser", () => {
  beforeEach(() => {
    fakeUsers.rows.length = 0;
  });

  it("creates the guest account when it is missing", async () => {
    const guest = await ensureGuestUser(fakeUsers);
    expect(guest.email).toBe(GUEST_EMAIL);
    expect(guest.name).toBe(GUEST_NAME);
    expect(fakeUsers.rows).toHaveLength(1);
    expect(fakeUsers.rows[0]?.avatarColor).toBe(GUEST_AVATAR_COLOR);
    expect(fakeUsers.rows[0]?.passwordHash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it("reuses the existing guest account without creating a duplicate", async () => {
    await ensureGuestUser(fakeUsers);
    const again = await ensureGuestUser(fakeUsers);
    expect(again.email).toBe(GUEST_EMAIL);
    expect(fakeUsers.rows).toHaveLength(1);
    expect(fakeUsers.upsert).toHaveBeenCalledTimes(1); // only the first call wrote
  });

  it("settles a concurrent create race through upsert, not a duplicate row", async () => {
    // Two first-visits interleave: both miss on findUnique, both upsert —
    // the unique email turns the loser's upsert into an UPDATE that resolves
    // to the winner's row.
    const first = await ensureGuestUser(fakeUsers);
    const second = await ensureGuestUser({
      ...fakeUsers,
      findUnique: vi.fn(async () => null), // the race window: row not yet visible
    });
    expect(second.id).toBe(first.id);
    expect(fakeUsers.rows).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// sanitizeNextPath — the open-redirect / loop guard
// ---------------------------------------------------------------------------

describe("sanitizeNextPath", () => {
  it("defaults to / for missing, empty, or whitespace-only params", () => {
    expect(sanitizeNextPath(undefined)).toBe("/");
    expect(sanitizeNextPath(null)).toBe("/");
    expect(sanitizeNextPath("")).toBe("/");
    expect(sanitizeNextPath("   ")).toBe("/");
  });

  it("keeps local absolute paths, query strings included", () => {
    expect(sanitizeNextPath("/")).toBe("/");
    expect(sanitizeNextPath("/eat")).toBe("/eat");
    expect(sanitizeNextPath("/place/courtyard-stay?tab=info")).toBe("/place/courtyard-stay?tab=info");
    expect(sanitizeNextPath("/map?place=map-brass-marble")).toBe("/map?place=map-brass-marble");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(sanitizeNextPath("https://evil.example")).toBe("/");
    expect(sanitizeNextPath("http://evil.example/phish")).toBe("/");
    expect(sanitizeNextPath("//evil.example")).toBe("/");
    expect(sanitizeNextPath("/\\evil.example")).toBe("/");
  });

  it("rejects relative paths without a leading slash", () => {
    expect(sanitizeNextPath("eat")).toBe("/");
    expect(sanitizeNextPath("evil.example")).toBe("/");
  });

  it("rejects embedded control characters (header injection)", () => {
    expect(sanitizeNextPath("/eat\r\nSet-Cookie: x=1")).toBe("/");
    expect(sanitizeNextPath("/ea\tt")).toBe("/");
    expect(sanitizeNextPath("/ea\u0000t")).toBe("/");
  });

  it("refuses the guest bootstrap itself (redirect-loop guard)", () => {
    expect(sanitizeNextPath(GUEST_BOOTSTRAP_PATH)).toBe("/");
    expect(sanitizeNextPath(`${GUEST_BOOTSTRAP_PATH}?next=/eat`)).toBe("/");
  });
});

// ---------------------------------------------------------------------------
// Guest session tokens (the stateless cookie the bootstrap issues)
// ---------------------------------------------------------------------------

describe("guest session tokens", () => {
  it("round-trips a guest payload through sign → verify", () => {
    const token = signSession({ uid: "u1", email: GUEST_EMAIL, name: GUEST_NAME });
    const payload = verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.uid).toBe("u1");
    expect(payload?.email).toBe(GUEST_EMAIL);
    expect(payload?.name).toBe(GUEST_NAME);
  });

  it("rejects a tampered token", () => {
    const token = signSession({ uid: "u1", email: GUEST_EMAIL, name: GUEST_NAME });
    expect(verifySessionToken(`${token}x`)).toBeNull();
  });

  it("rejects a correctly-signed but expired token", () => {
    // Forge a validly-signed payload whose exp is in the past — only the
    // expiry branch should reject it.
    const past = { uid: "u1", email: GUEST_EMAIL, name: GUEST_NAME, exp: Date.now() - 1000 };
    const body = Buffer.from(JSON.stringify(past)).toString("base64url");
    const sig = createHmac("sha256", process.env.AUTH_SECRET || "insecure-dev-secret-change-me")
      .update(body)
      .digest("base64url");
    expect(verifySessionToken(`${body}.${sig}`)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/guest — the bootstrap handler
// ---------------------------------------------------------------------------

describe("GET /api/auth/guest", () => {
  beforeEach(() => {
    fakeUsers.rows.length = 0;
    vi.clearAllMocks();
  });

  it("signs a session-less visitor in as the guest and redirects to the guide", async () => {
    const res = await guestBootstrap(request());

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");

    const cookie = res.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    expect(cookie).toBeDefined();
    const token = cookie!.split(";")[0]!.slice(SESSION_COOKIE.length + 1);
    const payload = verifySessionToken(token);
    expect(payload?.uid).toBe(fakeUsers.rows[0]?.id);
    expect(payload?.email).toBe(GUEST_EMAIL);
    expect(payload?.name).toBe(GUEST_NAME);
    // httpOnly session cookie per src/lib/auth.ts's options.
    expect(cookie).toContain("HttpOnly");
  });

  it("reuses the existing guest row on a later bootstrap (no duplicate users)", async () => {
    await guestBootstrap(request());
    const res = await guestBootstrap(request());
    expect(res.status).toBe(303);
    expect(fakeUsers.rows).toHaveLength(1);
  });

  it("honours a safe ?next path", async () => {
    const res = await guestBootstrap(request(`/api/auth/guest?next=${encodeURIComponent("/eat?people=2")}`));
    expect(res.headers.get("location")).toBe("/eat?people=2");
  });

  it("refuses open redirects — hostile ?next values fall back to /", async () => {
    for (const evil of [
      "https://evil.example",
      "http://evil.example/phish",
      "//evil.example",
      "/\\evil.example",
      "eat",
      "/eat\r\nSet-Cookie: x=1",
      GUEST_BOOTSTRAP_PATH,
    ]) {
      const res = await guestBootstrap(request(`/api/auth/guest?next=${encodeURIComponent(evil)}`));
      expect(res.headers.get("location")).toBe("/");
    }
  });

  it("never clobbers an existing valid session", async () => {
    const token = signSession({ uid: "demo-1", email: "demo@example.com", name: "demo" });
    const res = await guestBootstrap(request("/api/auth/guest?next=/eat", `${SESSION_COOKIE}=${token}`));

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/eat");
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${SESSION_COOKIE}=`))).toBe(false);
    expect(fakeUsers.findUnique).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Origin-agnostic 303 (the live-site regression behind a reverse proxy)
// ---------------------------------------------------------------------------

describe("GET /api/auth/guest — relative, origin-agnostic Location", () => {
  beforeEach(() => {
    fakeUsers.rows.length = 0;
    vi.clearAllMocks();
  });

  it("emits a RELATIVE Location — the server-computed origin is never echoed", async () => {
    // Regression (live deploy behind a reverse proxy): the proxy forwarded
    // Host: localhost:3000 while passing X-Forwarded-Proto: https, so
    // req.nextUrl.origin computed as https://localhost:3000 and the
    // pre-v2.17 handler baked that into an ABSOLUTE Location — bouncing
    // https://activity-map.jesspete.shop visitors onto the origin box's
    // localhost. The Location must be a bare path so the CLIENT resolves it
    // against whichever origin it is actually browsing.
    const mangled = await guestBootstrap(new NextRequest("https://localhost:3000/api/auth/guest"));
    expect(mangled.status).toBe(303);
    expect(mangled.headers.get("location")).toBe("/");
    expect(mangled.headers.get("location")).not.toMatch(/^https?:/);

    const normal = await guestBootstrap(request());
    expect(normal.headers.get("location")).toBe("/");
  });

  it("keeps ANY browsing origin — localhost dev and the public site alike", async () => {
    const res = await guestBootstrap(request());
    const location = res.headers.get("location") ?? "";
    // A relative reference resolves against the origin the client is on —
    // the "maintain the same external URL" contract from the live incident.
    expect(new URL(location, "https://activity-map.jesspete.shop").href).toBe(
      "https://activity-map.jesspete.shop/",
    );
    expect(new URL(location, "http://localhost:3000").href).toBe("http://localhost:3000/");
  });

  it("honours ?next= as a relative Location that stays on the browsing origin", async () => {
    const res = await guestBootstrap(request(`/api/auth/guest?next=${encodeURIComponent("/eat")}`));
    const location = res.headers.get("location") ?? "";
    expect(location).toBe("/eat");
    expect(new URL(location, "https://activity-map.jesspete.shop").href).toBe(
      "https://activity-map.jesspete.shop/eat",
    );
  });

  it("an already-signed-in visitor gets the same relative 303 (no origin echo)", async () => {
    const token = signSession({ uid: "demo-1", email: "demo@example.com", name: "demo" });
    const res = await guestBootstrap(
      new NextRequest("https://localhost:3000/api/auth/guest?next=/eat", {
        headers: { cookie: `${SESSION_COOKIE}=${token}` },
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/eat");
    expect(res.headers.get("location")).not.toContain("localhost");
  });
});
