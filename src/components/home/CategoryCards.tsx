// The three category cards anchored at the home hero's bottom edge —
// re-measured from the live app (sessions 10 + 12 + 16 + 25 + 60): glass
// cards (bg rgba(255,255,255,0.58) mobile · 0.34 desktop, blur 28 +
// saturate 160%, radius 20 at BOTH breakpoints, the 1px white/0.36 hairline,
// the 0 8 22/0.12 drop + inset 1px white/0.42 highlight) carrying the Inter
// 14px/600 count label ("12 Hotels") and a SLIDING ROW DECK — four 36px
// items: the three curated rows (each a 28×28 rounded-8 glass icon cell
// (white/0.48 + white/0.52 border, 13px lucide icon, stroke #111111) beside
// a 12px/500 title (ink, ellipsis) with a 12px 30%-black subtitle) + the
// View All pill as the 4th item (violet #571AFF on phones / near-black
// #141413 from md; 36px tall, radius 999).
//
// Session-60: the deck rides inside a 124px window (md) — `overflow:
// visible` + `clip-path: inset(0px)` — that HIDES the pill at rest and, on
// md-hover, slides the deck `translateY(-44px)` (0.35s
// cubic-bezier(0.22,1,0.36,1)) while expanding the window's clip to
// `inset(0px -36px -36px)` — the hover reveal. On phones the window renders
// its full 168px (all four items visible).
//
// Session-60: the DESKTOP row became a 3D FAN — the wrapper carries
// `transform: scale(1.15)` (the visible cards measure 265 wide / rows 41 /
// cells 32), each card sits in a `perspective: 800px` slot, and the INNER
// card tilts rotateY(18deg) (left, origin right center), rotateY(0deg)
// (middle), rotateY(-18deg) (right, origin left center) — flattening to
// rotateY(0) on hover (0.5s cubic-bezier(0.22,1,0.36,1)). The old external
// hanging 229×54 View All pill is GONE.
//
// Mobile layout: a horizontal SNAP CAROUSEL — the live's
// today-category-cards row scrolls sideways (three 306px cards, snap-center,
// no-scrollbar), flat (no scale, no tilt). Desktop: the centered three-card
// fan row that ends flush with the hero photo's bottom edge (the -mt
// overlap in the page).

import Link from "next/link";
import {
  Building2, BedDouble, Sparkles, UtensilsCrossed, Wine, Coffee, Landmark, Palette, FerrisWheel,
} from "lucide-react";
import type { PlaceCategory } from "@/types";

interface CardSpec {
  category: PlaceCategory;
  href: string;
  countLabel: string;
  rows: { icon: React.ElementType; title: string; subtitle: string }[];
}

const CARDS: CardSpec[] = [
  {
    category: "stay",
    href: "/stay",
    countLabel: "Hotels",
    rows: [
      { icon: Building2, title: "Design hotels", subtitle: "City center" },
      { icon: BedDouble, title: "Boutique stays", subtitle: "Old Town" },
      { icon: Sparkles, title: "Top rated rooms", subtitle: "Tonight" },
    ],
  },
  {
    category: "eat",
    href: "/eat",
    countLabel: "Places to Eat",
    rows: [
      { icon: UtensilsCrossed, title: "Fine dining", subtitle: "Rathausplatz" },
      { icon: Wine, title: "Casual bistros", subtitle: "Maximilianstraße" },
      { icon: Coffee, title: "Street food & cafés", subtitle: "Altstadt" },
    ],
  },
  {
    category: "do",
    href: "/do",
    countLabel: "Sights to Discover",
    rows: [
      { icon: Landmark, title: "Dom & Old Town", subtitle: "History" },
      { icon: Palette, title: "Fuggerei quarter", subtitle: "Art" },
      { icon: FerrisWheel, title: "Rathausplatz views", subtitle: "Fun" },
    ],
  },
];

function CategoryCard({
  counts,
  spec,
  width,
  fanIndex,
}: {
  counts: Record<PlaceCategory, number>;
  spec: CardSpec;
  width: "mobile" | "desktop";
  fanIndex?: number;
}) {
  return (
    <article
      data-category-card
      data-fan-index={fanIndex}
      className={[
        // Session-60: the live's glass shell — 14px top / 14px sides /
        // 12px bottom padding, radius 20 at both breakpoints (the mobile
        // 24 is gone), the 1px white/0.36 hairline, the drop + inset
        // highlight shadow pair, blur 28 + saturate 160% (arbitrary rgba/
        // property forms for deterministic computed strings).
        "group/card relative flex cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.36)] pt-[14px] px-[14px] pb-[12px]",
        "shadow-[0_8px_22px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.42)]",
        "[backdrop-filter:blur(28px)_saturate(160%)]",
        width === "mobile" ? "w-[306px] shrink-0 snap-center bg-[rgba(255,255,255,0.58)]" : "w-[230px] bg-[rgba(255,255,255,0.34)]",
        // Session-60: the 3D FAN (desktop only) — the inner card tilts
        // ±18° (origin at its INNER edge), flattening on hover across the
        // live's 0.5s cubic-bezier(0.22,1,0.36,1). Arbitrary property
        // forms keep the computed `transform` strings exact.
        width === "desktop" && fanIndex === 0
          ? "md:[transform:rotateY(18deg)] md:[transform-origin:right_center] md:hover:[transform:rotateY(0deg)]"
          : "",
        width === "desktop" && fanIndex === 1 ? "md:[transform:rotateY(0deg)]" : "",
        width === "desktop" && fanIndex === 2
          ? "md:[transform:rotateY(-18deg)] md:[transform-origin:left_center] md:hover:[transform:rotateY(0deg)]"
          : "",
        width === "desktop" ? "md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Session-60: the header row — the live's flex justify-between
          wrapper with mb-10px, the Inter 14px/600 label. */}
      <h2 className="mb-[10px] flex items-center justify-between text-sm font-semibold leading-5 text-ink">
        {counts[spec.category]} {spec.countLabel}
      </h2>

      {/* Session-60: the sliding rows deck — a 124px window at md (the
          clip-path hides the 4th item at rest; hover expands the clip)
          around the absolute 8px-gap column of 36px items. On phones the
          window renders the full 168px (all four items visible). */}
      <div
        data-rows-window
        className={[
          "relative h-[168px] overflow-visible",
          "md:h-[124px] md:[clip-path:inset(0px)] md:group-hover/card:[clip-path:inset(0px_-36px_-36px)]",
        ].join(" ")}
      >
        <ul
          data-rows-deck
          className="absolute inset-x-0 top-0 flex flex-col gap-2 md:[transform:translateY(0px)] md:transition-transform md:duration-[350ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:[transform:translateY(-44px)]"
        >
          {/* Session-60: the live renders its session-10 internals (36px
              rows, 28×28 cells) at BOTH breakpoints — the desktop's 1.15
              row scale makes the visible cells 32×32 and the rows 41px. */}
          {spec.rows.map(({ icon: Icon, title, subtitle }) => (
            <li key={title} className="flex h-9 shrink-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.52)] bg-[rgba(255,255,255,0.48)] text-[#111111]">
                <Icon className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-[#141413]">{title}</span>
                <span className="block truncate text-xs font-normal text-black/30">{subtitle}</span>
              </span>
            </li>
          ))}

          {/* Session-60: the View All pill is the deck's 4th item — violet
              on phones, near-black from md — clipped at rest, hover-revealed
              with the sliding deck (the old external hanging pill is
              gone). */}
          <li className="h-9 shrink-0">
            <Link
              href={spec.href}
              className="flex h-9 w-full items-center justify-center rounded-full bg-roam text-xs font-semibold tracking-[0.03em] text-white transition-colors duration-200 hover:bg-roam-deep md:bg-[#141413] md:hover:bg-black"
            >
              View All
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
}

export function CategoryCards({
  counts,
}: {
  counts: Record<PlaceCategory, number>;
  signedInName?: string | null;
}) {
  return (
    // Session-60: the -mt retuned for the shorter fan cards (182px layout
    // vs the old 215px) so the cards' visual top lands at y≈674 and the
    // route heading section at y≈924 — the live's measured positions.
    <section aria-label="Browse the guide" className="relative z-10 -mt-8 md:-mt-[230px]">
      {/* Mobile: the horizontal snap carousel (session-10 live parity — the
          cards swipe sideways; no-scrollbar is the safety valve).
          Session-26 re-measure: the live's override pads the track
          18/18/40 and tightens the gap to 12px (gap-3) — the cards ride
          the hero photo's bottom edge at y≈578. The pb stays 2: the live's
          pb-40 overflows its fixed-height hero (invisible to its flow). */}
      <div
        id="category-cards"
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[18px] pt-[18px] pb-2 md:hidden"
      >
        {CARDS.map((spec) => (
          <CategoryCard key={spec.category} counts={counts} spec={spec} width="mobile" />
        ))}
      </div>

      {/* Desktop: the centered three-card 3D FAN row (session-60) — the
          wrapper carries transform: scale(1.15) (so the 230px cards measure
          265 wide, the 12px gap 13.8), the slots carry perspective 800px,
          and the inner cards tilt ±18° (flattening on hover). The pb
          clears the visual bottom of the fanned cards so the route
          section's heading trap starts where the live's does. */}
      <div
        data-category-fan
        className="hidden items-end justify-center gap-3 px-4 pb-10 md:flex md:[transform:scale(1.15)]"
      >
        {CARDS.map((spec, i) => (
          <div key={spec.category} data-fan-slot className="shrink-0 [perspective:800px]">
            <CategoryCard counts={counts} spec={spec} width="desktop" fanIndex={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
