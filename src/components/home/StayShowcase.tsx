"use client";

import { useEffect, useRef } from "react";
import { StayCard } from "@/components/places/StayCard";
import { LetterReveal } from "./LetterReveal";
import { useParallax } from "./useParallax";
import type { PlaceDTO } from "@/types";

// The Choose Your Vibe stay showcase — re-measured from the live app
// (sessions 6 + 8 + 12 + 31): the big serif headline ("Choose Your Vibe,
// Select The Dates & Enjoy Your Ultimate Getaway", #1A1A1A) with the
// live's per-letter scroll reveal (cream → ink, LetterReveal) — session-31:
// the heading block is CENTER-ALIGNED (the live changed it from the
// session-12 left-aligned model) with the subtitle a centered 14px
// #888580 line — and all twelve stays as SQUARE photo cards (the shared
// StayCard design: aspect 1/1, rounded 24, dark bg, white Inter 18px dsk
// / 24px mob title overlaid at the photo bottom, address + "€€€ · ★
// rating" meta, ghost Learn More + white Book Now pills, heart overlay).
// Session-14: the grid fills COLUMN-MAJOR from md (3 columns × 4 stacked
// cards; visual row 1 reads Courtyard | Maison | Velvet) over the BARE
// 1178px grid (no container side padding) at an 18px gap → 381px cards;
// one column on phones (row flow — DOM order == visual order below md).
// Session-31: a client component — the section owns the parallax listener
// driving its cards' [data-parallax] imgs (the 1.16 zoom + the scroll ty).
//
// Session-61 re-measure: the live's grid became a STAGGERED FANNING grid
// on desktop — the grid now renders THREE explicit column wrappers
// (li[data-fan-col]) whose MIDDLE column rises with scroll (translateY →
// −0.2 × the column height, i.e. −315px at 1576px) while the outer
// columns' cards fan outward: rotate(∓6°) about the bottom-LEFT corner
// plus translateX(∓38px), each card's phase driven by its own viewport
// traversal ((vh − top)/(vh + height) — the row pitch staggers them so
// the top cards settle first). Settled values verified on the live at
// 1280×900: col1 card0 rect [−78, 341] (w 418), col3 card0 [836, 1255]
// (w 418), matrix ±0.104528 = ±6.000°, the middle ty = −315.24. On
// phones (below md) the live computes transform: none at EVERY scroll —
// the whole effect is md+ only (the driver resets on narrow viewports).

export function StayShowcase({ stays }: { stays: PlaceDTO[] }) {
  const parallaxRef = useParallax<HTMLElement>();
  const fanRef = useRef<HTMLUListElement>(null);

  // The fan driver — one passive rAF-throttled scroll listener. All
  // geometry reads are TRANSFORM-IMMUNE (the ul's own rect + the
  // wrappers' offsetTop inside the positioned ul), so the transforms it
  // just wrote can never feed back into the next frame's math. (Runs on
  // an empty grid too — the effect just no-ops without its columns.)
  useEffect(() => {
    const ul = fanRef.current;
    if (!ul) return;

    let raf: number | null = null;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    const apply = () => {
      raf = null;
      const cols = [...ul.children] as HTMLElement[];
      if (cols.length !== 3) return;
      const cards = [...ul.querySelectorAll<HTMLElement>("[data-fan-card]")];

      // Below md the live renders the section FLAT — clear any stale
      // desktop transforms and do nothing else.
      if (window.innerWidth < 768) {
        cols[1].style.transform = "";
        for (const c of cards) c.style.transform = "";
        return;
      }

      const vh = window.innerHeight;
      const gridR = ul.getBoundingClientRect();

      // The middle column: rises to −0.2 × its own height as the grid
      // traverses the viewport (p=0 with the grid top 38px above the
      // viewport bottom; p=1 with the grid bottom 38px below the top).
      const p = clamp01((vh - 38 - gridR.top) / (gridR.height + vh - 76));
      const colH = cols[1].getBoundingClientRect().height; // translateY keeps height
      cols[1].style.transform = p > 0 ? `translateY(${(-0.2 * colH * p).toFixed(2)}px)` : "";

      // The outer cards: rotate(∓6°) about the bottom-left + the ∓38px
      // slide, phased by each wrapper's own traversal. (offsetTop is
      // layout-only, so the fan's own transforms never skew the input.)
      for (const card of cards) {
        const col = Number(card.dataset.fanCard);
        if (col === 1) {
          card.style.transform = "";
          continue;
        }
        const top = gridR.top + card.offsetTop;
        const h = card.offsetHeight;
        if (h === 0) continue;
        const prog = clamp01((vh - top) / (vh + h));
        if (prog <= 0) {
          card.style.transform = "";
          continue;
        }
        const dir = col === 0 ? -1 : 1;
        card.style.transformOrigin = "0 100%";
        card.style.transform =
          `translateX(${(dir * 38 * prog).toFixed(2)}px) rotate(${(dir * 6 * prog).toFixed(3)}deg)`;
      }
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  if (stays.length === 0) return null;
  return (
    <section id="stay-showcase" ref={parallaxRef} className="w-full pt-[112px]">
      {/* Session-31 re-measure: the live now CENTER-ALIGNS the heading
          text — the container pads px-[18px] and the h2 carries
          mx-auto max-w-[94vw] (at 1280 the box lands 1203 wide @x=38 with
          20.4px auto margins; below ~640 the container inner width binds
          and the box is full-bleed-inset). The rendered lines sit
          symmetrically; the subtitle stays centered. */}
      <div className="w-full px-[18px] text-center">
        <LetterReveal
          text="Choose Your Vibe, Select The Dates & Enjoy Your Ultimate Getaway"
          className="mx-auto max-w-[94vw] font-serif text-[40px] leading-[1.08] tracking-[-0.06em] text-[#1A1A1A] sm:text-[clamp(40px,7.2vw,112px)]"
        />
        <p className="mx-auto mt-5 max-w-md text-sm text-[#8A8780]">
          Pick a stay that matches your mood, from quiet design hotels to rooftop city escapes.
        </p>
      </div>

      {/* Session-14: the 1178px grid carries NO horizontal padding at
          md+ (the live's grid box IS 1178 — 381px cards at an 18px gap)
          and fills column-major (3 li[data-fan-col] wrappers × 4 cards;
          visual row 1 reads Courtyard | Maison | Velvet). Session-26:
          below md the live's mobile grid pads px-[18px] — the cards
          render INSET (354 wide at 390), not full-bleed, and the three
          columns simply stack (the same DOM order as the old row flow).
          Session-61: the ul is POSITIONED (relative) so the fan driver
          can read each wrapper's offsetTop transform-immunely, and the
          middle column's translateY + the outer cards' rotation fan are
          driven by the listener above. */}
      <div className="mx-auto w-full max-w-[1178px] pb-[144px]">
        <ul
          ref={fanRef}
          className="relative flex flex-col gap-[18px] px-[18px] md:grid md:grid-cols-3 md:gap-[18px] md:px-0"
        >
          {[0, 1, 2].map((col) => (
            <li key={col} data-fan-col={col} className="flex flex-col gap-[18px]">
              {stays.slice(col * 4, col * 4 + 4).map((stay) => (
                <div key={stay.slug} data-fan-card={col}>
                  <StayCard place={stay} home />
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
