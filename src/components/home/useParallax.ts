"use client";

// useParallax — the live app's home-showcase image parallax (session-31
// re-measure): every showcase image element carries a permanent zoom/crop
// model — the STAY cards' imgs render `transform: translateY(8%)
// scale(1.16)` (a 16% tighter crop than the plain 118% fill) and the
// SIGHTS' imgs sit inside oversized `-inset-y-[16%]` wrappers (132% of the
// card height, clipped by the square card, NO extra scale) — and the
// translateY interpolates with scroll: +8% of the element's height when
// it sits far BELOW the viewport, ~0 when centered, negative as it exits
// above (measured on the live at 1280×900: +35.9px far-below, ~0
// centered, −32.1 above — slope ≈ 0.05×distance, clamped ±8%).
//
// Session-61 re-measure: the live's parallax is DESKTOP-ONLY — at 390 the
// stay imgs AND the sights imgs compute transform: none at every scroll
// position. The listener therefore no-ops below md (and clears any stale
// desktop transforms on the way out).
//
// The element's `data-parallax` attribute carries its scale factor
// ("1.16" for the stay imgs, "" for the scale-less sights wrappers); the
// base `translateY(8%)` renders in the initial SSR markup (no hydration
// mismatch — it matches the live's own initial inline style) and the
// single passive rAF-throttled listener per SECTION drives the live values.

import { useEffect, useRef } from "react";

export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let raf: number | null = null;

    const apply = () => {
      raf = null;
      // Session-61: desktop-only — below md the live computes none.
      if (window.innerWidth < 768) {
        root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          el.style.transform = "";
        });
        return;
      }
      const vh = window.innerHeight;
      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height === 0) return;
        const center = r.top + r.height / 2;
        const dist = center - vh / 2;
        const max = r.height * 0.08; // ±8% of the element's own height
        const ty = Math.max(-max, Math.min(max, dist * 0.05));
        const scale = el.dataset.parallax || "1";
        el.style.transform =
          scale !== "1" ? `translateY(${ty}px) scale(${scale})` : `translateY(${ty}px)`;
      });
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

  return ref;
}
