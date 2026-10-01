"use client";

// The square dark stay card (re-measured sessions 3 + 6): aspect-square,
// rounded-[24px], bg #181818, the image at h-[118%] (hover: scale 1.06 +
// brightness 75) — with the name (Inter 18px medium, tracking −0.03em), the
// address + meta row, and the ghost "Learn More" + white "Book Now" pill
// buttons that slide up on md-hover (always visible on touch sizes).
// `home` = the home showcase variant (session-6): the meta-right reads
// "€€€ · ★ 4.8" (price symbols + star + rating) instead of price +
// sub-category; the pills render at the live's session-28 34px height
// with the bordered Book Now.

import Link from "next/link";
import { Star } from "lucide-react";
import type { PlaceDTO } from "@/types";
import { cn, priceRangeSymbols } from "@/lib/utils";
import { SaveButton } from "./SaveButton";

export function StayCard({ place, home = false }: { place: PlaceDTO; home?: boolean }) {
  return (
    <article className="group h-full">
      <Link href={`/place/${place.slug}`} className="block h-full">
        <div className="relative aspect-square cursor-pointer overflow-hidden rounded-[24px] bg-[#181818] shadow-[0_18px_44px_rgba(14,14,14,0.1)] transition-transform duration-300 ease-out group-hover:-translate-y-1">
          {place.coverImageUrl ? (
            home ? (
              /* Session-31: the HOME showcase model — the live's imgs carry
               * a permanent 1.16 zoom + the scroll parallax (translateY 8%
               * below the viewport → 0 centered → negative above; NO hover
               * zoom/brightness — the live's transform/filter sit still on
               * hover). The /stay BROWSE variant keeps its plain fill +
               * the session-6 hover model (verified: transform none there).
               * Session-61: the live's parallax is DESKTOP-ONLY — on phones
               * the home imgs compute transform: none at every scroll (the
               * 118% fill is pure layout). The initial transform therefore
               * lives in an md-gated ARBITRARY-PROPERTY class (Tailwind v4's
               * translate/scale utilities emit the individual properties —
               * the arbitrary form pins the composed `transform`); the
               * useParallax listener (also md-gated) overrides it inline
               * per frame from md up. */
              <img
                src={place.coverImageUrl}
                alt={place.name}
                loading="lazy"
                data-parallax="1.16"
                className="h-[118%] w-full object-cover md:[transform:translateY(8%)_scale(1.16)] md:transition-transform md:duration-[260ms] md:ease-out"
              />
            ) : (
              <img
                src={place.coverImageUrl}
                alt={place.name}
                loading="lazy"
                className="h-[118%] w-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.06] group-hover:brightness-75"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-white/20">
              {place.name.charAt(0)}
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/[0.96]"
          />

          {/* The heart: the SaveButton's own responsive chrome (session-61:
              44px below md, 36px from md) — positioned 16px inset. */}
          <SaveButton
            placeId={place.id}
            initialSaved={place.saved ?? false}
            className="absolute left-4 top-4 z-10"
          />

          {/* Session-60 re-measure: the live REMOVED the white star-rating
              badge from the HOME showcase variant (the rating survives only
              in the meta line's "€€ · ★ 4.5" text) — the /stay BROWSE
              variant keeps its badge. */}
          {!home && (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5">
              <Star className="h-[13px] w-[13px] fill-ink text-ink" aria-hidden />
              <span className="text-xs font-bold text-ink">{place.avgRating.toFixed(1)}</span>
            </div>
          )}

          {/* Session-60: the live's bottom block — bottom-18 on phones,
          -30px from md, the pills row mt-14px with the 18px/220-260ms
          reveal (was mt-3/300ms/16px). */}
          <div className="absolute bottom-[18px] left-[18px] right-[18px] text-white transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:bottom-[-30px] md:group-hover:-translate-y-12">
            {/* Session-61 re-measure: the line-heights are
                VARIANT-SPECIFIC — the HOME cards render lh 1.5 (36px mob
                / 27px dsk on the h3; the p 18.6px mob / 18px dsk) while
                the /stay BROWSE cards keep leading-tight (30/22.5) and
                the p's text-xs default at md (16px). */}
            <h3
              className={cn(
                "text-[24px] font-medium tracking-[-0.03em] text-white md:text-lg",
                home ? "leading-normal" : "leading-tight",
              )}
            >
              {place.name}
            </h3>
            <p
              className={cn(
                "mt-2 flex justify-between gap-3 text-xs leading-[1.55] text-white/70",
                home ? "md:leading-normal" : "md:leading-4",
              )}
            >
              <span className="truncate">{place.address ?? place.neighborhood ?? "Augsburg"}</span>
              <span className="shrink-0">
                {home ? (
                  <>
                    <span className="text-[13px] text-white">{priceRangeSymbols(place.priceRange)}</span>
                    {" · ★ "}
                    <span className="text-[13px] font-semibold text-white">
                      {place.avgRating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[13px] text-white">{place.price ?? place.nightlyPrice ?? ""}</span>
                    {place.subCategory ? ` · ${place.subCategory}` : ""}
                  </>
                )}
              </span>
            </p>
            <div className="mt-3.5 flex translate-y-0 gap-2 opacity-100 transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-y-[18px] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
              {/* Session-28 re-measure: the home-showcase pills carry the
                  live's inline 34px height (was the session-6 41px
                  override) with the Learn More border/bg at white/[0.36]
                  and white/[0.08], and the Book Now gained a 1px
                  white/[0.92] border — the /stay BROWSE variant stays at
                  the 36px h-9 borderless chrome. */}
              <span
                className={cn(
                  "flex flex-1 items-center justify-center rounded-full text-xs transition-all duration-200",
                  home
                    ? "h-[34px] border border-white/[0.36] bg-white/[0.08] font-semibold text-white hover:border-roam hover:bg-roam hover:shadow-[0_12px_28px_rgba(87,26,255,0.28)]"
                    : "h-9 border border-white/35 bg-white/10 font-semibold text-white hover:border-roam hover:bg-roam hover:shadow-[0_12px_28px_rgba(87,26,255,0.28)]",
                )}
              >
                Learn More
              </span>
              <span
                className={cn(
                  "flex flex-1 items-center justify-center rounded-full text-xs transition-all duration-200",
                  home
                    ? "h-[34px] border border-white/[0.92] bg-white font-bold text-black hover:bg-roam hover:text-white hover:shadow-[0_12px_28px_rgba(87,26,255,0.28)]"
                    : "h-9 bg-white font-bold text-black hover:bg-roam hover:text-white hover:shadow-[0_12px_28px_rgba(87,26,255,0.28)]",
                )}
              >
                Book Now
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
