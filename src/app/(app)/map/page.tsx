import { requireUser } from "@/lib/page-gate";
import { listMapPlaces } from "@/lib/places";
import { MapExplorer } from "@/components/map/MapExplorer";

export const metadata = { title: "Discover" };
// v2.21: the live's map tab title is "Discover | Activity Map" (measured
// 2026-10-01) — not "Map".

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string; category?: string }>;
}) {
  const [user, sp] = await Promise.all([requireUser("/map"), searchParams]);
  // The map renders the nine demo pins (status "map") — the browse entities
  // never appear on the live app's map (session 3 parity).
  const places = await listMapPlaces(user.uid);

  const initialCategory =
    sp.category === "eat" || sp.category === "stay" || sp.category === "do" ? sp.category : null;

  return <MapExplorer places={places} focusSlug={sp.place ?? null} initialCategory={initialCategory} />;
}
