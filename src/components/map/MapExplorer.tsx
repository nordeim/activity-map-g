"use client";

// The map view (re-measured from the live app, session 3): serif "Map"
// headline + the calm subheading, a white search bar, the category filter
// pills (All Places / Restaurants / Hotels / Sights), the rounded Leaflet
// canvas with dot markers over the nine demo pins, the "0 events · N
// places" status badge, the geolocation notice ("📍 Location permission
// denied · showing approximate area"), the stats chips ("Augsburg center /
// N places / € pricing"), and the "Places on the map" section below. The
// Leaflet bundle is browser-only, so the canvas mounts via next/dynamic
// with ssr:false.

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Star, X, Sparkles, SlidersHorizontal, Map as MapIcon, UtensilsCrossed, BedDouble } from "lucide-react";
import type { PlaceCategory, PlaceDTO } from "@/types";
import { cn, priceRangeSymbols } from "@/lib/utils";

const LeafletCanvas = dynamic(() => import("./LeafletCanvas").then((m) => m.LeafletCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-3xl bg-cream-deep text-sm text-black/40">
      Loading map…
    </div>
  ),
});

const FILTERS: { label: string; value: PlaceCategory | "all"; icon: React.ElementType }[] = [
  { label: "All Places", value: "all", icon: MapIcon },
  { label: "Restaurants", value: "eat", icon: UtensilsCrossed },
  { label: "Hotels", value: "stay", icon: BedDouble },
  { label: "Sights", value: "do", icon: Star },
];

// Session-16 re-measure: the live's list-card eyebrow — eats read
// "RESTAURANT", stays "HOTEL", and the do-places carry their SUB-CATEGORY
// uppercased (LANTERN WALK / ROOFTOP MUSIC / ART WORKSHOP — the live's
// hardcoded array labels its event entries that way, not "SIGHT").
function mapListEyebrow(place: PlaceDTO): string {
  if (place.category === "eat") return "Restaurant";
  if (place.category === "stay") return "Hotel";
  return (place.subCategory ?? "Sight").toUpperCase();
}

export function MapExplorer({
  places,
  focusSlug,
  initialCategory,
}: {
  places: PlaceDTO[];
  focusSlug: string | null;
  initialCategory: PlaceCategory | null;
  planner?: { dates: string | null; guests: string | null };
}) {
  // Session-65: the live's search is SUBMIT-DRIVEN — typing never filters
  // ("brass" typed left 9 markers for 2s on the live); only Enter submits.
  // The input text and the submitted query are SEPARATE states: a pill
  // click filters within the visible set and, when the intersection is
  // EMPTY, falls back to the pill-only set (the query resets while the
  // input text stays stale — "brass" + Restaurants → 3 on the live);
  // a query submitted while a pill is active is pure AND (brass +
  // Restaurants active + Enter → 0 "No places").
  const [inputText, setInputText] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filter, setFilter] = useState<PlaceCategory | "all">(initialCategory ?? "all");
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // The live app asks for geolocation and falls back to an "approximate
  // area" notice when permission is denied (the default in most browsers).
  useEffect(() => {
    let cancelled = false;
    const fallback = () => {
      if (!cancelled) setGeoNotice("Location permission denied · showing approximate area");
    };
    if (!("geolocation" in navigator)) {
      Promise.resolve().then(fallback);
      return () => {
        cancelled = true;
      };
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        if (!cancelled) setGeoNotice(null);
      },
      fallback,
      { timeout: 4000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const haystack = (place: PlaceDTO) =>
    [place.name, place.neighborhood, place.subCategory, place.vibeTags.join(" "), place.cuisineTags.join(" "), place.tags.join(" "), place.amenities.join(" ")]
      .join(" ")
      .toLowerCase();

  const visible = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    return places.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      return haystack(p).includes(q);
    });
  }, [places, submittedQuery, filter]);

  // Session-65: the live's pill-click model — filter WITHIN the visible
  // set; an EMPTY intersection falls back to the pill-only set (the
  // submitted query resets, the input text stays stale).
  const selectFilter = (value: PlaceCategory | "all") => {
    if (submittedQuery.trim()) {
      const q = submittedQuery.trim().toLowerCase();
      const intersection = places.filter(
        (p) => (value === "all" || p.category === value) && haystack(p).includes(q),
      );
      setFilter(value);
      if (intersection.length === 0) setSubmittedQuery("");
    } else {
      setFilter(value);
    }
  };

  // Derived: the deep-link focus (?place=slug) only counts when the current
  // filter keeps the place visible (drives the flyTo — session-30: the pin
  // click navigates directly, so there is no selection state anymore).
  const active = focusSlug;
  const activeVisible = active ? visible.some((p) => p.slug === active) : false;
  const focusVisible = activeVisible ? active : null;

  return (
    <main className="w-full">
      {/* Headline — session-14 re-measure: the live's map heading matches
          the browse pattern (full-width max-w-7xl block, h1 y≈168 via
          md:pt-24, subtitle 14px #3A3A3A). Session-18 re-measure: the
          heading became a FULL-BLEED relative section carrying the 18px
          graph-paper texture at 40% opacity — and the live's textured
          block WRAPS the search bar + the filter pills too (section
          h≈413 at 1280), like the browse views. */}
      {/* Session-68 (v2.29): the bottom padding retargeted to the live's
          measured pill→frame gaps — 44px on phones / 32px at md (the live's
          own pills row carries its py-8 and ends flush at the frame; the
          v2.28 tree rendered 22px mobile / 40px desktop with the frame up
          to 40px high). */}
      <section className="relative overflow-visible px-4 pb-[44px] pt-[60px] md:px-8 md:pb-8 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(20,20,19,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.055)_1px,transparent_1px)] [background-size:18px_18px]"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-7xl text-center">
            {/* Session-57 (v2.24): the live's h1 — 50.7px on phones (the
                browse-h1 mobile scaling) with the 0.92 leading, no own
                margin (the subtitle's mt carries the gap). */}
            <h1 className="font-serif text-[clamp(42px,13vw,55px)] font-normal leading-[0.92] tracking-[-0.06em] text-ink">
              Map
            </h1>
            {/* Session-57 (v2.24): the live's centered max-w-xl subtitle. */}
            <p className="mx-auto mt-3.5 max-w-xl px-6 font-inter text-sm text-[#3A3A3A] md:mt-6 md:px-0">
              Augsburg restaurants, hotels and experiences plotted across the old town.
            </p>
          </div>

          {/* Search + filters — session-24 re-measure: the live rebuilt
              this area into a STICKY glass "command center"
              (.discover-filter-shell): top-10 on phones / top-96 at md,
              inner radius 30/34, bg white/92 phones / white/78 md, the 1px
              white/70 hairline, the 0 8px 22px /0.10 shadow — wrapping the
              ORIGINAL search pill (h-48, r-full, black/5 border, cream/55)
              + the 56px cream/55 filter button; the category pills render
              below as a centered scrollable row. Session-18's textured
              heading section wraps it all (live parity). Session-68: the
              mb-2 is GONE — the live's pills row ends flush at the frame
              (its own py-8 carries the desktop gap). */}
          <section>
            <div className="map-filter-shell sticky top-[10px] z-30 md:top-24">
            <div className="rounded-[30px] border border-white/70 bg-white/92 p-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.10)] md:rounded-[34px] md:bg-white/78 md:p-2">
            {/* Session-68 (v2.29): while a query is SUBMITTED the live
                restructures this container to a COLUMN at every
                breakpoint (the filter button drops below the search pill;
                the desktop card grows 66 → 164) — the md:flex-row only
                applies at rest. The live's own structure: the search pill
                + the status row share ONE w-full wrapper, the filter
                button follows as a sibling. */}
            <div
              className={cn(
                "flex flex-col gap-3",
                !submittedQuery.trim() && "md:flex-row md:items-center",
              )}
            >
          {/* Session-68 (F5 fix): the search row's OLD `flex-1` set
              flex-basis: 0% which OVERRIDES h-12 for the main axis inside
              the parent's flex COLUMN on phones — the row collapsed to
              34px (the 32px icon cell + 2px border) with a 20px input.
              The live's row renders 48px with a 44px input. Fix: the
              WRAPPER carries the mobile-safe w-full / md:flex-1 and the
              row itself keeps h-12 + the input's own h-11. */}
          <div className="w-full md:flex-1">
          <div className="map-search-row flex h-12 w-full items-center gap-2 rounded-full border border-black/5 bg-[rgba(248,247,244,0.55)] px-2 shadow-none">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-roam text-white">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </span>
            <input
              type="search"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                // Session-65: the live submits the query on Enter (typing
                // alone never filters).
                if (e.key === "Enter") setSubmittedQuery(inputText);
              }}
              placeholder="Try: romantic hotels with a pool"
              aria-label="Search the map"
              className="h-11 w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-black/40"
            />
            {inputText ? (
              <button
                type="button"
                onClick={() => {
                  // Session-65: clearing resets BOTH the text and the
                  // submitted query (the visible set falls back to the pill
                  // state) — the live's pill-only fallback.
                  setInputText("");
                  setSubmittedQuery("");
                }}
                aria-label="Clear search"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/40 hover:bg-black/5 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
          {/* Session-68 (v2.29): the live's search STATUS PILL — while a
              query is SUBMITTED a violet pill renders INSIDE the search
              wrapper, directly BELOW the search pill (the live's pending
              template text; its resolved text is LLM-generated,
              non-replicable — documented divergence). Chrome measured on
              the live: the row mt-2 flex items-center gap-2 flex-wrap; the
              pill inline-flex gap-1.5 (6px), the 11×11 sparkles icon +
              12px/600 #571AFF text (lh 18px), bg #F0EAFF, the 1px #D8CAFF
              border, radius 12, pad 5/10 → 30px tall. */}
          {submittedQuery.trim() ? (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="map-search-status inline-flex items-center gap-1.5 rounded-xl border border-[#D8CAFF] bg-[#F0EAFF] px-2.5 py-[5px] text-xs font-semibold leading-[18px] text-[#571AFF]">
                <Sparkles className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                Searching for {submittedQuery.trim()}-related options in Augsburg.
              </span>
            </div>
          ) : null}
          </div>
          <div className="flex shrink-0 justify-center md:justify-end">
          <button
            type="button"
            aria-label="Open map filters"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-black/5 bg-[rgba(248,247,244,0.55)] text-ink transition hover:bg-cream md:h-12 md:w-12"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          </button>
          </div>
            </div>
            </div>
            </div>

        {/* Filter pills — session-12 live chrome: 41px tall with 12px
            text; the ACTIVE pill is violet-tinted (bg #F0EAFF, border
            #D8CAFF, text #571AFF); inactive = white +
            rgba(14,14,14,0.08) + #555550. Session-24 re-measure: weight
            600, 44px min-height touch targets on phones, a centered
            non-wrapping scrollable row at gap-2 below the shell. */}
        {/* Session-68 (v2.29): the mobile mt bumped 14 → 26 so the pills
            land at the live's y (the live's pills row renders its own 8px
            pad + the taller F5-fixed shell above; measured: pills y 409,
            frame y 497 on both sites). Session-68: the row is
            LEFT-ALIGNED at mobile (the live's overflowing row starts at
            x=16 with Sights clipped right — scrollable; justify-center
            center-clipped BOTH ends, leaving the first pill unreachable)
            and centered from md where the content fits. */}
        <div className="no-scrollbar mt-[26px] flex items-center justify-start gap-2 overflow-x-auto md:mt-[52px] md:justify-center">
          {FILTERS.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => selectFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                "flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-[10px] text-xs font-semibold transition-all md:min-h-[41px]",
                filter === value
                  ? "border-[#D8CAFF] bg-[#F0EAFF] text-[#571AFF]"
                  : "border-[rgba(14,14,14,0.08)] bg-white text-[#555550] hover:border-black/25",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              {label}
            </button>
          ))}
        </div>
          </section>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-8">

      {/* Map canvas — session-12: the live's desktop height is 620px
          (measured at 1280). Session-65 re-measure: the live's MOBILE canvas
          is a FIXED 356×310 (measured at 390×{700,844,1000} — height never
          moves), not the clone's 62vh — below md the canvas is a fixed
          310px-tall card. Session-68 (v2.29) — the FRAME re-measured on the
          live: `overflow-hidden rounded-[32px] border border-white/70
          bg-white shadow-[0_18px_44px_rgba(14,14,14,0.10)]` with radius
          28px on phones, and the frame BOX heights 312/622 (the border
          included) so the inner canvas lands at the live's exact
          356×310 / 1214×620 — the old rounded-3xl + border-black/5 +
          shadow-card + h-[620px] left the canvas 2px short. */}
      <section className="relative">
        <div className="map-canvas-frame relative h-[312px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_18px_44px_rgba(14,14,14,0.10)] md:h-[622px] md:rounded-[32px]">
          <LeafletCanvas places={visible} activeSlug={focusVisible} />
          {/* Session-68 (v2.29): the live's canvas status chip —
              "0 events · N places" at top-right INSIDE the canvas (the
              live's own data carries an events entity type the clone does
              not model, so the events count is always 0 — matching the
              live's rendered text; the places count is the visible set,
              updating with every filter/search change). Chrome measured on
              the live: absolute top-3 right-3 z-[400] white rounded-full
              pill (px-3 py-1.5) + the 0 1px 3px /0.05 + 0 4px 16px /0.07
              shadow, 12px/600 #141413. */}
          <span className="map-events-chip absolute right-3 top-3 z-[400] flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold leading-[18px] text-[#141413] shadow-[0_1px_3px_rgba(14,14,14,0.05),0_4px_16px_rgba(14,14,14,0.07)]">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E0E0E]" />
            {/* The live's own text does NOT pluralize-check ("0 events ·
                1 places" measured on the live) — match it exactly. */}
            0 events · {visible.length} places
          </span>
        </div>

        {/* The live's bottom stats overlay: Augsburg center · N places ·
            € pricing (session-8 — replaces the old top-right status
            badge). Session-29 re-measure: the pills carry NO shadow (the
            live dropped the 0 6px 16px /0.08 — plain white pills). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-white px-3 py-2">Augsburg center</span>
          <span className="rounded-full bg-white px-3 py-2">
            {visible.length} {visible.length === 1 ? "place" : "places"}
          </span>
          <span className="rounded-full bg-white px-3 py-2">€ pricing</span>
        </div>
      </section>

      {/* Geolocation notice (the live app's permission banner). */}
      <section className="mt-6">
        {geoNotice ? (
          <p className="mb-4 text-center text-sm text-muted">📍 {geoNotice}</p>
        ) : null}
      </section>

      {/* Session-30: the live renders NO selected-place card and no "Tap a
          dot" hint below the canvas (the pin click navigates directly) —
          both clone inventions removed. */}

      {/* Places on the map — the live app's bottom section. Session-14
          re-measure: the list cards are TEXT-ONLY (no photos) — 24px-radius
          white cards with the black/8 hairline. Session-16 re-measure: the
          live's card is a FOUR-row layout — the eyebrow and the €-price
          share ONE justified row (price right), the 15px/600 ink title
          below, and the 12px #888580 NEIGHBORHOOD line at the bottom
          (card h≈119, pad 16). Session-29 re-measure: the eyebrow renders
          as a CREAM PILL (bg #F8F7F4, full radius, pad 4px 10px — 26px
          tall), the eyebrow row drops the fixed height for mb-3 (12px),
          the neighborhood line carries a 12px MapPin icon, and the grid
          gap is 12px. */}
      <section id="places-list" className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-4xl tracking-[-0.05em] text-ink">Places on the map</h2>
            <p className="mt-1 text-sm text-muted">Fictional restaurants, hotels and things to do.</p>
          </div>
          {/* Session-65: the live's list-header COUNT CHIP — the bare count
              in a white rounded-full pill (px-3 py-1.5, 12px font-semibold)
              on the right of the header row (reads 0 in the empty state). */}
          <span className="rounded-full bg-white px-3 py-1.5 font-inter text-xs font-semibold text-ink">
            {visible.length}
          </span>
        </div>
        {visible.length === 0 ? (
          submittedQuery.trim() ? (
            /* Session-70 (v2.30): the live's search-RESOLVED zero state —
             * a WHITE CARD (rounded-[28px] bg-white py-14 text-center,
             * [32,1370,1216,166] at desktop) carrying "No places found" at
             * 20px Libre Baskerville ink #0E0E0E (lh 28). The live renders
             * this once its async search resolves with no results; the
             * plain muted "No places" line below is its PENDING/no-query
             * presentation — our deterministic search resolves instantly,
             * so a submitted query keys the card. */
            <div
              className="map-empty-card rounded-[28px] bg-white py-14 text-center"
              role="status"
            >
              <p className="font-serif text-xl leading-7 text-ink">
                No places found
              </p>
            </div>
          ) : (
            /* Session-65: the live's 0-result state renders a "No places"
             * line while no query is submitted (the pending/no-query
             * presentation). */
            <p className="py-10 text-center text-sm text-muted">No places</p>
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((place) => (
              <Link
                key={place.id}
                href={`/place/${place.slug}`}
                className="group rounded-[24px] border border-[rgba(14,14,14,0.08)] bg-white p-4 transition-colors duration-300 hover:border-black/20"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-cream px-2.5 py-1 text-xs font-semibold uppercase leading-[18px] tracking-[0.08em] text-[#555550]">
                    {mapListEyebrow(place)}
                  </p>
                  <p className="shrink-0 text-[13px] text-[#72706C]">
                    {priceRangeSymbols(place.priceRange ?? 2)}
                  </p>
                </div>
                <p className="text-[15px] font-semibold leading-snug text-ink">{place.name}</p>
                <p className="mt-2 flex items-center gap-1 truncate text-xs text-[#888580]">
                  <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                  {place.neighborhood ?? "Augsburg"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
      </div>
    </main>
  );
}
