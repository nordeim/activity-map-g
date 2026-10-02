"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Sun,
  UtensilsCrossed,
  BedDouble,
  Compass,
  MapPin,
  Heart,
} from "lucide-react";

// The site footer — session-23 re-measure (the footer had drifted since
// session 2): the live renders a COMPACT shrink-wrapped centered GLASS pill
// — border 1px #E8E6DC, backdrop blur(40px) saturate(1.5), the soft
// 0 2px 12px rgba(14,14,14,0.08) shadow — carrying the six view links as
// icon cells (a 3-column grid on phones capped at 390).
// Session-32 re-measure: the DESKTOP pill grew on the live — the grown
// model 646×118 (radius 34, pad 12px 16px, gap 12, the links 92×92 tiles
// with 24px icons over 12px/600 labels). The MOBILE (<md) pill is UNCHANGED
// (the 3-col grid, max-w 390, r-28, pad 8/10, gap 8, the 104×78 tiles).
// Session-33 re-measure: the growth is SCROLL-LINKED and CONTINUOUS — the
// desktop pill renders the COMPACT model (506×96, gap 8, r-28, pad 8/10,
// links 74×78 r-18, icons 20px, labels 11px) while the footer is offscreen
// and interpolates LINEARLY with the footer's visible fraction p (gap
// 8+4p, pad (8+4p)/(10+6p), radius 28+6p, links 74+18p × 78+14p with
// radius 18+6p, icons 20+4p, labels 11+1p) — compacting back when it
// leaves. The per-frame updates are smoothed by the 120ms linear
// transitions (globals.css: footer-pill-transition on the pill,
// footer-link-transition on the links — the md+ list composing the growth
// entries with the 300ms hover entries). The links carry the VIOLET hover
// (footer-link-hover: translateY(-12px) scale(1.1) composed into one
// matrix over the #571AFF fill, white text, the 0 16px 34px /0.28 glow;
// the svg its own group-hover scale 1.1) at BOTH breakpoints; the icons'
// stroke-width is 2.1 and the labels track −0.01em.
// The footer element itself owns the vertical padding (pt-32/pb-24 mobile,
// pt-64/pb-56 desktop) with NO top margin — every page's last section hands
// off to the footer's own pt. The inner is max-w-5xl (1024). The legal row
// is a justify-between ROW from md (© 12px #8A8780 left, the Privacy /
// Accessibility links right, gap 8px/20px) and a centered column on phones.
// Rendered from the (app) layout on every authenticated page (live parity).

const FOOTER_LINKS = [
  { href: "/", label: "Highlights", icon: Sun },
  { href: "/eat", label: "Eat", icon: UtensilsCrossed },
  { href: "/stay", label: "Stay", icon: BedDouble },
  { href: "/do", label: "Do", icon: Compass },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/favourites", label: "Favourites", icon: Heart },
] as const;

export function SiteFooter() {
  const footerRef = useRef<HTMLElement | null>(null);

  // Session-33: the desktop pill's scroll-linked growth. The footer's
  // visible fraction p = clamp((viewportBottom − footerTop) / height, 0, 1)
  // is written as the --footer-p CSS var (rAF-throttled, passive) — the
  // md+ calc classes in the markup interpolate the compact→grown geometry
  // through it. Below md the var is INERT (the mobile classes never read
  // it — the pill stays the static 3-col model, like the live's own
  // mobile-override stylesheet). SSR renders p=0: the compact model, the
  // live's own initial state.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = footer.getBoundingClientRect();
      let frac = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / rect.height)
      );
      // Session-74 (v2.32): snap to the fully-grown model at the document
      // end. The body/documentElement scrollHeight delta (~22px, present
      // on BOTH sites — session-72's measurement) leaves the footer's
      // last sliver unreachable at max scroll, pinning p at 0.9992 (the
      // radius computing 33.9952px instead of 34). The live renders the
      // exact grown model (646×118) at its own max scroll; the snap
      // reproduces that within 1px of the body's end.
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 1) {
        frac = 1;
      }
      footer.style.setProperty("--footer-p", frac.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // Session-26 re-measure: the live's footer carries the horizontal
    // padding itself (`px-5`) and switches its vertical pads at **sm**
    // (640), not md — the inner is BARE (no px, no gap; the legal row's
    // own mt spaces it).
    <footer ref={footerRef} className="bg-cream px-5 pt-8 pb-6 sm:pt-16 sm:pb-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <nav
          aria-label="Footer"
          className="grid w-full max-w-[390px] grid-cols-3 gap-2 rounded-[28px] border border-[#E8E6DC] bg-white py-2 px-2.5 transition-none shadow-[0_2px_12px_rgba(14,14,14,0.08)] backdrop-blur-[40px] backdrop-saturate-[1.5] md:flex md:w-fit md:max-w-none md:flex-wrap md:items-end md:justify-center md:footer-pill-transition md:gap-[calc(8px_+_var(--footer-p,0)_*_4px)] md:rounded-[calc(28px_+_var(--footer-p,0)_*_6px)] md:py-[calc(8px_+_var(--footer-p,0)_*_4px)] md:px-[calc(10px_+_var(--footer-p,0)_*_6px)]"
        >
          {FOOTER_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex h-[78px] flex-col items-center justify-center gap-2 rounded-[18px] border border-black/[0.04] bg-white/55 text-[#141413] footer-link-transition footer-link-hover md:h-[calc(78px_+_var(--footer-p,0)_*_14px)] md:w-[calc(74px_+_var(--footer-p,0)_*_18px)] md:rounded-[calc(18px_+_var(--footer-p,0)_*_6px)]"
            >
              <Icon
                className="h-5 w-5 transition-transform duration-300 md:h-[calc(20px_+_var(--footer-p,0)_*_4px)] md:w-[calc(20px_+_var(--footer-p,0)_*_4px)]"
                strokeWidth={2.1}
                aria-hidden
              />
              <span className="font-inter text-[11px] font-semibold tracking-[-0.01em] md:text-[calc(11px_+_var(--footer-p,0)_*_1px)]">
                {label}
              </span>
            </Link>
          ))}
        </nav>
        {/* Session-26 re-measure: the legal row carries the live's chrome —
            a 1px black/[0.05] TOP HAIRLINE at every breakpoint, pt-3
            (12px) phones / sm:pt-5 (20px), and its own mt-4/sm:mt-8
            margin — and the row switches to the space-between ROW at
            **sm** (640), matching the live's own breakpoint mix. Below md
            the live's override caps the row at max-w 390 CENTERED (same
            as the pill) — at 640 the row renders 390 wide @x=125. */}
        <div className="mt-4 flex w-full max-w-[390px] flex-col items-center gap-2 border-t border-black/[0.05] pt-3 text-center sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-5 sm:text-left md:max-w-none">
          <p className="text-xs text-[#8A8780]">© 2026 Roam. Activity Map for Augsburg.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#8A8780]">
            <Link
              href="/privacy-policy"
              className="underline-offset-2 hover:text-ink hover:underline"
            >
              Privacy policy
            </Link>
            <Link
              href="/accessibility-statement"
              className="underline-offset-2 hover:text-ink hover:underline"
            >
              Accessibility Statement
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
