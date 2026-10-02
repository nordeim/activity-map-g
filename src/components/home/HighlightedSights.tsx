"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { SaveButton } from "@/components/places/SaveButton";
import { useParallax } from "./useParallax";
import type { PlaceDTO } from "@/types";

// The Highlighted Sights grid — re-measured from the live app (sessions 6 +
// 8 + 31): six calm stops (Fuggerei → Schaezlerpalais) as SQUARE photo cards
// (aspect 1/1, rounded 24, dark bg) with the heart overlay, the white
// rating pill, and the in-card bottom overlay — Inter 24px/500 (mobile) /
// 18px/500 (desktop) white title, the neighborhood | category meta row, and
// the VIOLET Learn More pill that slides in on hover. Closes with the
// "More Things to Do" hand-off to /do as a DARK pill (session-8: bg
// #111111, white text, no border). Session-31: each img sits inside an
// OVERSIZED -inset-y-[16%] wrapper (132% of the card height, clipped by
// the square card) whose translateY parallax-interpolates with scroll.

export function HighlightedSights({ sights }: { sights: PlaceDTO[] }) {
  const parallaxRef = useParallax<HTMLElement>();
  if (sights.length === 0) return null;
  // Session-23: the section's bottom padding is the live's mobile
  // pill→footer hand-off (22px); desktop hands off flush (0).
  // Session-74 (v2.32): the section carries its OWN top padding — pt-48
  // phones / pt-144 at md — stacked AFTER the vibe grid section's pb
  // (the live's grid-end → sights h2 gap: 283px at 1280 / 104px at 390;
  // the clone rendered the vibe's pb alone).
  return (
    <section
      id="highlighted-sights"
      ref={parallaxRef}
      className="w-full pb-[22px] pt-[48px] md:pb-0 md:pt-[144px]"
    >
      <div className="mx-auto mb-10 max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-[42px] leading-[1.05] tracking-[-0.055em] text-ink sm:text-[clamp(42px,6.5vw,86px)]">
          Highlighted Sights
        </h2>
        <p className="mt-4 text-sm font-light text-black/60 sm:text-base">
          Six calm stops for a scenic Augsburg route between meals, stays, and evening plans.
        </p>
      </div>

      {/* Session-14 re-measure: the live's sights grid is the BARE 1120px
          box (x≈80 at 1280, 360px cards at a 20px gap — no container side
          padding). Session-26: below md the live's mobile grid pads px-4 —
          the cards render INSET (358 wide at 390), not full-bleed. */}
      <div className="mx-auto w-full max-w-[1120px]">
        <ul className="relative mx-auto mt-16 grid grid-cols-1 gap-5 px-4 md:grid-cols-3 md:px-0">
        {sights.map((sight) => (
          <li key={sight.slug}>
            <article className="group h-full">
              <Link href={`/place/${sight.slug}`} className="block h-full">
                <div className="relative aspect-square cursor-pointer overflow-hidden rounded-[24px] bg-[#181818] shadow-[0_18px_44px_rgba(14,14,14,0.1)] transition-transform duration-300 ease-out group-hover:-translate-y-1">
                {sight.coverImageUrl ? (
                  <div
                    data-parallax=""
                    className="absolute inset-x-0 -inset-y-[16%]"
                    style={{ transform: "translateY(8%)", transition: "transform 260ms ease-out" }}
                  >
                    <img
                      src={sight.coverImageUrl}
                      alt={sight.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-white/20">
                    {sight.name.charAt(0)}
                  </div>
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/[0.72]"
                />

                <SaveButton
                  placeId={sight.id}
                  initialSaved={sight.saved ?? false}
                  className="absolute left-4 top-4"
                />
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5">
                  <Star className="h-[13px] w-[13px] fill-ink text-ink" aria-hidden />
                  <span className="text-xs font-bold text-ink">{sight.avgRating.toFixed(1)}</span>
                </span>

                {/* The in-card bottom overlay — title + meta on the photo
                    (session-8: inside the card, not hanging below), the
                    violet Learn More pill slides up on hover. */}
                <div className="absolute bottom-[18px] left-[18px] right-[18px] font-inter text-white transition-transform duration-300 ease-out group-hover:-translate-y-3">
                  <h3 className="m-0 text-[24px] font-medium leading-tight tracking-[-0.03em] text-white md:text-[18px]">
                    {sight.name}
                  </h3>
                  <p className="mt-2 flex items-center justify-between gap-3 text-xs text-white/70">
                    <span className="truncate">{sight.neighborhood}</span>
                    <span className="shrink-0">{sight.subCategory}</span>
                  </p>
                  <div className="mt-3 flex translate-y-4 items-center justify-center opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="flex h-9 w-full items-center justify-center rounded-full bg-roam text-xs font-bold text-white shadow-[0_12px_28px_rgba(87,26,255,0.28)]">
                      Learn More
                    </span>
                  </div>
                </div>
                </div>
              </Link>
            </article>
          </li>
        ))}
        </ul>
      </div>

      {/* The More Things to Do hand-off — a DARK pill (session-8 live
          re-measure: bg #111111, white text, 166×46, radius 999).
          Session-23: the last sight card → the pill is 32px on BOTH
          breakpoints (mt-8, no pb — the footer takes it from here). */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/do"
          className="flex h-[46px] items-center justify-center rounded-full bg-[#111111] px-8 text-sm font-semibold text-white transition hover:bg-black"
        >
          More Things to Do
        </Link>
      </div>
    </section>
  );
}
