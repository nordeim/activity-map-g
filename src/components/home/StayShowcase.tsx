"use client";

import { StayCard } from "@/components/places/StayCard";
import { LetterReveal } from "./LetterReveal";
import { useParallax } from "./useParallax";
import type { PlaceDTO } from "@/types";

// The Choose Your Vibe stay showcase — re-measured from the live app
// (sessions 6 + 8 + 12 + 31 + 74): the big serif headline ("Choose Your
// Vibe, Select The Dates & Enjoy Your Ultimate Getaway", #1A1A1A) with
// the live's per-letter scroll reveal (cream → ink, LetterReveal),
// CENTER-ALIGNED (session-31) with the subtitle a centered 14px #888580
// line — and all twelve stays as SQUARE photo cards (the shared StayCard
// design: aspect 1/1, rounded 24, dark bg, white Inter 18px dsk / 24px
// mob title overlaid at the photo bottom, address + "€€€ · ★ rating"
// meta, ghost Learn More + white Book Now pills, heart overlay).
// Session-14: the grid fills COLUMN-MAJOR from md (3 columns × 4 stacked
// cards; visual row 1 reads Courtyard | Maison | Velvet) over the BARE
// 1178px grid (no container side padding) at an 18px gap → 381px cards;
// one column on phones (row flow — DOM order == visual order below md).
//
// Session-74 (v2.32) RESTRUCTURE — the live retired the session-61/63
// fanning grid and rebuilt the section as a STICKY-HEADING + PASS-THROUGH
// architecture (structure verified stable across reloads + time + scroll):
//
//   SECTION (relative, bg cream, 2632 tall at 1280)
//   ├── DIV absolute inset-0 — the 18px graph-paper texture at 0.36
//   ├── DIV md:sticky md:top-0 md:h-screen (relative + auto at mobile)
//   │   └── pt-88/px-18 (mobile: pt-48/px-18/pb-18): h2 + subtitle
//   └── SECTION (the grid section)
//       └── pt-112/1178-centering/pb-144 (mobile: pt-20/pb-56)
//           └── UL grid-cols-3 — 3 column wrappers × 4 cards, 381×381
//
// The heading PINS at viewport y 88 (its sticky block is vh-tall from
// md, top-0, carrying pt-88) while the grid slides up and PAINTS OVER
// it — the grid section comes LATER in DOM order so it wins the paint
// order (verified by screenshot: the cards cover the pinned h2). The
// grid itself renders STATICALLY: no middle-column raise, no card
// fanning/rotation (the live computes identity transforms at every
// scroll; the fan driver is deleted). The three li[data-fan-col]
// wrappers stay (the live keeps them for the column-major 12-card
// distribution — the attribute name survives as the E2E column hook).
// The stay-img parallax REMAINS (the live's imgs still carry
// scale(1.16) + the scroll ty ±8% of the LAYOUT height — useParallax).

export function StayShowcase({ stays }: { stays: PlaceDTO[] }) {
  const parallaxRef = useParallax<HTMLElement>();

  if (stays.length === 0) return null;
  return (
    <section id="stay-showcase" ref={parallaxRef} className="relative w-full bg-cream">
      {/* Session-74 (v2.32): the live's texture layer — the 18px
          graph-paper grid at 0.36 opacity spanning the whole section
          (the live's own absolute layer; the vibe section had NO
          texture in the session-≤73 model). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.36] [background-image:linear-gradient(to_right,rgba(20,20,19,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.055)_1px,transparent_1px)] [background-size:18px_18px]"
      />

      {/* The sticky heading block — vh-tall from md, pins at top 0
          (the h2 rides at viewport y 88 via the block's pt-88) while
          the grid section scrolls up and paints over it. Below md the
          live renders the heading RELATIVE with pt-48/pb-18 (no pin).
          Session-31: the container pads px-[18px] and the h2 carries
          mx-auto max-w-[94vw] (at 1280 the box lands 1203 wide @x=38). */}
      <div
        data-vibe-heading
        className="relative px-[18px] pb-[18px] pt-[48px] text-center md:sticky md:top-0 md:h-screen md:pb-0 md:pt-[88px]"
      >
        <LetterReveal
          text="Choose Your Vibe, Select The Dates & Enjoy Your Ultimate Getaway"
          className="mx-auto max-w-[94vw] font-serif text-[40px] leading-[1.08] tracking-[-0.06em] text-[#1A1A1A] sm:text-[clamp(40px,7.2vw,112px)]"
        />
        <p className="mx-auto mt-5 max-w-md text-sm text-[#8A8780]">
          Pick a stay that matches your mood, from quiet design hotels to rooftop city escapes.
        </p>
      </div>

      {/* The grid section — the live's nested SECTION: pt-112 / the
          1178 centered grid / pb-144 at md (mobile: pt-20 / pb-56). The
          section comes AFTER the sticky block in DOM order so the grid
          paints OVER the pinned heading (the live's own pass-through).
          Session-26: below md the grid pads px-[18px] — the cards render
          INSET (354 wide at 390), not full-bleed. */}
      <section
        data-vibe-grid-section
        className="mx-auto w-full max-w-[1178px] pb-[56px] pt-[20px] md:pb-[144px] md:pt-[112px]"
      >
        <ul className="relative flex flex-col gap-[18px] px-[18px] md:grid md:grid-cols-3 md:gap-[18px] md:px-0">
          {[0, 1, 2].map((col) => (
            <li key={col} data-fan-col={col} className="flex flex-col gap-[18px]">
              {stays.slice(col * 4, col * 4 + 4).map((stay) => (
                <StayCard key={stay.slug} place={stay} home />
              ))}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
