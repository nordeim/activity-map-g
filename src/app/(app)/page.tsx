import { requireUser } from "@/lib/page-gate";
import { countPlaces, listHomePlaces, listPlacesForUser } from "@/lib/places";
import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { RecommendedRoute } from "@/components/home/RecommendedRoute";
import { HighlightedRestaurants } from "@/components/home/HighlightedRestaurants";
import { StayShowcase } from "@/components/home/StayShowcase";
import { HighlightedSights } from "@/components/home/HighlightedSights";

// The Highlights page, structured exactly like the live app's home (session 2
// parity): photo hero + glass planner pill → the three category cards → the
// Recommended Route itinerary → the blue Highlighted Restaurants band → the
// Choose Your Vibe stay showcase → the Highlighted Sights grid → the More
// Things to Do hand-off → the site footer.

// Session-12 re-measure: the live re-shuffled the HOME stay showcase
// independently of the /stay browse order (the browse grid is unchanged).
// The showcase renders this pinned order (measured off the live's
// "Choose Your Vibe" section, 2026-09-25); stays missing from the map keep
// their browse position at the end.
const HOME_STAY_ORDER: readonly string[] = [
  "courtyard-stay",
  "terra-boutique",
  "brass-marble",
  "canal-hideaway",
  "maison-altstadt",
  "garden-suite",
  "river-house",
  "rooftop-atelier",
  "velvet-residence",
  "cloud-nine-hotel",
  "the-linen-house",
  "arcade-rooms",
];

export default async function HomePage() {
  // v2.18: the page owns the path-aware session gate (deep links survive the
  // login-free bootstrap — the layout can't know the request path).
  const user = await requireUser("/");
  const uid = user.uid;
  const [counts, route, sights, restaurants, stays] = await Promise.all([
    countPlaces(),
    listHomePlaces("home-route-"),
    listHomePlaces("home-sight-", uid),
    listHomePlaces("home-restaurant-"),
    listPlacesForUser(uid, "stay"),
  ]);
  const orderedStays = [...stays].sort((a, b) => {
    const ia = HOME_STAY_ORDER.indexOf(a.slug);
    const ib = HOME_STAY_ORDER.indexOf(b.slug);
    // Unmapped slugs keep their relative browse order at the end.
    return (ia === -1 ? HOME_STAY_ORDER.length : ia) - (ib === -1 ? HOME_STAY_ORDER.length : ib);
  });

  return (
    <>
      {/* Session-23: main carries NO bottom padding — the live's home
          hands the More-pill off FLUSH to the footer (the footer's own
          pt-64/pt-32 provides the gap; the section + wrapper paddings
          carry the mobile 22px). */}
      <main>
        <Hero />
        <CategoryCards counts={counts} signedInName={user.name} />
        <RecommendedRoute stops={route} />
        <HighlightedRestaurants restaurants={restaurants} />
        <StayShowcase stays={orderedStays} />
        <HighlightedSights sights={sights} />
      </main>
      {/* The footer is a sibling of <main> — a footer nested inside <main>
          loses its contentinfo landmark role. */}
    </>
  );
}
