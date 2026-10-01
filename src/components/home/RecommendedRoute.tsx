"use client";

// The Recommended Route — re-measured from the live app (sessions 3 + 6 +
// 8 + 18 + 20 + 27 + 60): a scroll-driven section.
//
//   1. a 140vh "heading trap" (-mb-[110vh]) whose centered
//      "Recommended Route" heading (clamp 38px→72px, ls −0.045em, lh 1.05)
//      rides a min-h-screen sticky overlay (pt 120px) that FADES OUT
//      across ~178px of scroll from the section's top (session-60: the
//      live's heading is GONE by the time the map pins — the old mirror
//      kept it visible over the map until the trap's tail);
//   2. the route body — a 416.65vh trap (session-60; was 420vh):
//      below lg: a 220vh trap pinning a FULL-VIEWPORT CARTO MAP before
//      the stop cards flow (the panel pulls up -12vh over the trap's
//      tail); the mobile map does NOT pan (the head dot travels screen
//      y 225→619) and there is NO mobile progress chip;
//      from lg: a 50/50 split — the CARTO MAP pinned left at half the
//      viewport (the wrapping g panning translate(750−headX, 750−headY)
//      to keep the head dot at the panel's center) while the stop cards
//      ride the right half (bg #F8F7F4 + the 18px graph-paper overlay,
//      masked radially), CENTERED on the panel's middle (top-1/2 +
//      translateY(-50% + offset)) — cards 576 wide inside the left-8/
//      right-8 absolute slot, the CONTINUOUS scroll-linked choreography
//      (card i crosses the center at progress i/(N−1), 0.665px per
//      scroll px, tent-fading ±380px) — with the SPLIT-COLOR progress
//      pill at bottom-24 (the violet fill sweeping right under the dark
//      text clipped to the unfilled right + a white duplicate clipped
//      to the filled left).
//
// The map itself (session-60): an svg viewBox 0 0 1500 1500
// (preserveAspectRatio xMidYMid slice) carrying 25 Carto
// light_nolabels z14 tiles (the 8697-8701 × 5642-5646 cell range, 502px
// cells in a 5×5 grid at −500..2002 — public, no key), the DASHED base
// path (rgba(20,20,19,0.15) w5, dash 10 8), the SOLID #141413 progress
// path (the same geometry, dashoffset tracking the trap progress), five
// cream waypoint circles (r13, #F8F7F4 fill, #141413 stroke 2.5), and
// the ink head dot (r7 + drop-shadow) that rides the path.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Coffee, Utensils, Palette, Martini, Leaf, MapPin } from "lucide-react";
import { cn, priceRangeSymbols } from "@/lib/utils";
import { withCartoKey } from "@/lib/carto";
import type { PlaceDTO } from "@/types";

// Session-27: each stop carries the live's PER-STOP category icon in its
// time pill (measured on the live: coffee / utensils / palette / martini /
// leaf — 14px svgs at stroke-width 1.8, stroke #141413). Session-60: the
// gallery stop's meta line shows a DURATION note ("· 90 min") instead of
// the rating (the live's City Gallery meta: "Rathausplatz · 90 min · € ·
// Culture").
const STOPS: Array<{
  time: string;
  title: string;
  icon: typeof Coffee;
  metaNote?: string;
}> = [
  { time: "9:00 AM", title: "Morning Coffee", icon: Coffee },
  { time: "1:00 PM", title: "Lunch Break", icon: Utensils },
  { time: "4:00 PM", title: "Afternoon Culture", icon: Palette, metaNote: "· 90 min" },
  { time: "7:00 PM", title: "Sunset Drinks", icon: Martini },
  { time: "9:30 PM", title: "Dinner", icon: Leaf },
];

// The live card's meta parts (session-27: rendered as SEPARATE spans in a
// gap-1.5 flex-wrap row after a 14px map-pin svg — was one joined string).
function stopMetaParts(p: PlaceDTO, metaNote?: string): string[] {
  const parts: string[] = [];
  if (p.neighborhood) parts.push(p.neighborhood);
  if (metaNote) {
    parts.push(metaNote);
  } else if (p.avgRating) {
    parts.push(`· ${p.avgRating} rating`);
  }
  const symbols = priceRangeSymbols(p.priceRange);
  if (symbols) parts.push(`· ${symbols}`);
  if (p.subCategory) parts.push(`· ${p.subCategory}`);
  return parts;
}

/* ---------------- the Carto map geometry (session-60) ---------------- */

// The live's route geometry — a near-vertical wavy walk through Augsburg's
// center on the z14 tile grid (total arc length ≈ 703).
const ROUTE_D =
  "M 748 400 C 745 440 750 465 755 500 C 760 535 762 562 758 600 C 755 635 750 658 745 695 C 740 730 735 762 738 810 C 740 855 748 885 752 940 C 755 990 752 1040 750 1100";

const ROUTE_WAYPOINTS: Array<{ x: number; y: number }> = [
  { x: 748, y: 400 },
  { x: 758, y: 600 },
  { x: 745, y: 695 },
  { x: 752, y: 940 },
  { x: 750, y: 1100 },
];

type Pt = { x: number; y: number };

function cubicAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

// The arc-length table — 64 samples per cubic segment (pure JS, no DOM:
// deterministic on both server and client).
const ROUTE_TABLE: { pts: Pt[]; cum: number[] } = (() => {
  const nums = (ROUTE_D.match(/-?[\d.]+/g) ?? []).map(Number);
  let cur: Pt = { x: nums[0], y: nums[1] };
  const pts: Pt[] = [cur];
  const cum: number[] = [0];
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const p1 = { x: nums[i], y: nums[i + 1] };
    const p2 = { x: nums[i + 2], y: nums[i + 3] };
    const p3 = { x: nums[i + 4], y: nums[i + 5] };
    for (let s = 1; s <= 64; s++) {
      const pt = cubicAt(cur, p1, p2, p3, s / 64);
      const prev = pts[pts.length - 1];
      pts.push(pt);
      cum.push(cum[cum.length - 1] + Math.hypot(pt.x - prev.x, pt.y - prev.y));
    }
    cur = p3;
  }
  return { pts, cum };
})();

const ROUTE_LENGTH = ROUTE_TABLE.cum[ROUTE_TABLE.cum.length - 1];

// The head dot's position at a fraction of the route (binary-searched
// against the cumulative table, then linearly interpolated).
function routePointAt(fraction: number): Pt {
  const target = Math.max(0, Math.min(1, fraction)) * ROUTE_LENGTH;
  let lo = 0;
  let hi = ROUTE_TABLE.cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ROUTE_TABLE.cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const segLen = ROUTE_TABLE.cum[i] - ROUTE_TABLE.cum[i - 1];
  const t = segLen === 0 ? 0 : (target - ROUTE_TABLE.cum[i - 1]) / segLen;
  const a = ROUTE_TABLE.pts[i - 1];
  const b = ROUTE_TABLE.pts[i];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// The 5×5 Carto light_nolabels z14 tile grid (session-60: the live's
// 8697-8701 × 5642-5646 cell range, 502px cells at a 500px step — the 2px
// overlap hides the tile seams). Session-63: every href carries the
// operator's CARTO key (src/lib/carto.ts) — keyless URLs serve the
// provider's "API KEY REQUIRED" watermark placeholder.
const TILE_ZOOM = 14;
const TILE_X0 = 8697;
const TILE_Y0 = 5642;
const TILE_PX = 502;
const TILE_STEP = 500;
const TILES: Array<{ href: string; x: number; y: number }> = Array.from(
  { length: 25 },
  (_, i) => {
    const ix = i % 5;
    const iy = Math.floor(i / 5);
    return {
      href: withCartoKey(
        `https://a.basemaps.cartocdn.com/light_nolabels/${TILE_ZOOM}/${TILE_X0 + ix}/${TILE_Y0 + iy}.png`,
      ),
      x: -500 + ix * TILE_STEP,
      y: -500 + iy * TILE_STEP,
    };
  },
);

// The map svg — shared by both breakpoints. `pan` (lg+) shifts the whole
// group to keep the head dot at the viewBox center (750, 750); on phones
// the group stays put (translate(0, 0)) while the head travels.
function RouteMapSvg({ progress, pan }: { progress: number; pan: boolean }) {
  const head = routePointAt(progress / 100);
  const tx = pan ? 750 - head.x : 0;
  const ty = pan ? 750 - head.y : 0;
  return (
    <svg
      aria-hidden
      viewBox="0 0 1500 1500"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <g style={{ transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)` }}>
        {TILES.map((t) => (
          <image key={t.href} href={t.href} x={t.x} y={t.y} width={TILE_PX} height={TILE_PX} />
        ))}
        {/* The dashed base path (the unplanned remainder). */}
        <path
          d={ROUTE_D}
          fill="none"
          stroke="rgba(20,20,19,0.15)"
          strokeWidth={5}
          strokeDasharray="10 8"
        />
        {/* The solid progress path — the dashoffset tracks the trap scroll. */}
        <path
          d={ROUTE_D}
          fill="none"
          stroke="#141413"
          strokeWidth={5}
          style={{
            strokeDasharray: ROUTE_LENGTH,
            strokeDashoffset: ROUTE_LENGTH * (1 - progress / 100),
            transition: "none",
          }}
        />
        {/* The five cream waypoints. */}
        {ROUTE_WAYPOINTS.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={13} fill="#F8F7F4" stroke="#141413" strokeWidth={2.5} opacity={0.95} />
          </g>
        ))}
        {/* The ink head dot riding the path. */}
        <circle
          cx={head.x}
          cy={head.y}
          r={7}
          fill="#141413"
          style={{ filter: "drop-shadow(rgba(20,20,19,0.5) 0 0 6px)" }}
        />
      </g>
    </svg>
  );
}

// The SPLIT-COLOR progress pill (lg only) — the live's session-60 design:
// a white 218×36 pill whose violet fill (left-anchored, width = progress%)
// sweeps right beneath the dark text clipped to the unfilled right
// (100−progress)% and a white duplicate clipped to the filled left.
function RouteProgressPill({ pct }: { pct: number }) {
  const widthStyle = { width: `${pct}%`, transition: "width 360ms cubic-bezier(0.22, 1, 0.36, 1)" };
  const restStyle = {
    width: `${100 - pct}%`,
    transition: "width 360ms cubic-bezier(0.22, 1, 0.36, 1)",
  };
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-center">
      <div
        data-route-pill
        className="relative h-9 w-[218px] overflow-hidden rounded-full border border-[#E8E6DC] bg-white shadow-[0_8px_22px_rgba(14,14,14,0.08)] font-neue text-xs tracking-[0.04em] text-[#141413] tabular-nums backdrop-blur-[10px]"
      >
        <div data-pill-fill className="absolute inset-y-0 left-0 bg-roam" style={widthStyle} />
        <span className="absolute inset-y-0 right-0 z-[1] overflow-hidden" style={restStyle}>
          <span className="absolute inset-y-0 right-0 flex w-[218px] items-center justify-center px-4 text-ink">
            {pct}% of your day planned
          </span>
        </span>
        <span aria-hidden className="absolute inset-y-0 left-0 z-[2] overflow-hidden" style={widthStyle}>
          <span className="absolute inset-y-0 left-0 flex w-[218px] items-center justify-center px-4 text-white">
            {pct}% of your day planned
          </span>
        </span>
      </div>
    </div>
  );
}

export function RecommendedRoute({ stops }: { stops: PlaceDTO[] }) {
  const trapRef = useRef<HTMLDivElement>(null);
  const mobileTrapRef = useRef<HTMLDivElement>(null);
  const headingSectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  // Session-20: the desktop choreography state — isDesktop gates the inline
  // transform/opacity (the mobile flow MUST stay static), trapScrollPx is
  // the trap's scrollable height (416.65vh − 100vh, defaulting to the 800px
  // reference viewport's 2533 until the first scroll measures it).
  const [isDesktop, setIsDesktop] = useState(false);
  const [trapScrollPx, setTrapScrollPx] = useState(2533);
  // Session-60: the heading overlay's fade — 1 → 0 across ~178px of scroll
  // from the heading section's top (the live's measured curve: 1.0 @top,
  // 0.91 @+16px, 0.57 @+76px, 0.23 @+136px, 0 @+178px).
  const [headingFade, setHeadingFade] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let raf: number | null = null;
    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        const trap = trapRef.current;
        const isLg = window.matchMedia("(min-width: 1024px)").matches;
        if (trap && isLg && trap.offsetHeight > 0) {
          // Desktop: progress across the scroll trap (0 → 100).
          const r = trap.getBoundingClientRect();
          const total = Math.max(r.height - window.innerHeight, 1);
          const clamped = Math.min(Math.max(-r.top / total, 0), 1);
          setProgress(clamped * 100);
          setTrapScrollPx(total);
        } else {
          // Mobile (session-18): progress across the pinned route VISUAL's
          // scroll region — the map's path fills while the region scrolls
          // (0% at rest, 100% as the visual releases into the stop cards).
          const region = mobileTrapRef.current;
          if (region && region.offsetHeight > 0) {
            const r = region.getBoundingClientRect();
            const total = Math.max(r.height - window.innerHeight, 1);
            const clamped = Math.min(Math.max(-r.top / total, 0), 1);
            setProgress(clamped * 100);
          }
        }
        // Session-60: the heading overlay's fade.
        const heading = headingSectionRef.current;
        if (heading) {
          const r = heading.getBoundingClientRect();
          const fade = Math.max(0, Math.min(1, 1 + r.top / 178));
          setHeadingFade(fade);
        }
        raf = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  if (stops.length === 0) return null;
  const step = 100 / Math.max(stops.length, 1);
  const passedStops = Math.round(progress / step);
  // Session-20: the active card is the one NEAREST the slot (the live's
  // continuous choreography) — round(), not floor().
  const activeIndex = Math.min(stops.length - 1, Math.round(progress / step));
  const pct = Math.round(progress);

  return (
    <>
      {/* 1 — the heading trap: tall section, pinned centered heading.
          Session-26: the live HIDES this section below lg and renders the
          heading INSIDE the pinned mobile trap instead (see below) — the
          desktop h2 keeps this sticky wrapper at lg+.
          Session-60: the overlay is min-h-screen and FADES OUT across
          ~178px of scroll from the section's top (the live's heading is
          gone by the time the map pins). */}
      <section
        aria-label="Recommended Route heading"
        ref={headingSectionRef}
        className="relative hidden -mb-[110vh] h-[140vh] bg-cream lg:block"
      >
        <div
          data-heading-overlay
          className="pointer-events-none sticky top-0 z-20 flex min-h-screen justify-center px-6 pb-4 pt-[7.5rem] text-center"
          style={{ opacity: headingFade, willChange: "opacity" }}
        >
          <h2 className="font-serif text-[38px] leading-[1.05] tracking-[-0.045em] text-[#141413] md:text-[clamp(38px,6vw,72px)]">
            Recommended Route
          </h2>
        </div>
      </section>

      {/* 2 — the route body — session-60 re-measure: below lg the live
          pins a FULL-VIEWPORT CARTO MAP (the 25-tile grid + the dashed/
          solid route paths + the cream waypoints + the ink head dot, sticky
          for the 220vh trap's span) BEFORE the stop cards flow (the panel
          pulls up -12vh over the trap's tail); the mobile map does NOT
          pan and carries NO progress chip. lg+ = a 416.65vh trap with the
          50/50 split — the panning map pinned left, the graph-paper
          waypoint panel right, the center-based card slot, and the
          split-color progress pill. */}
      <section id="recommended-route" className="relative bg-cream">
        <div ref={trapRef} className="relative lg:h-[416.65vh]">
          {/* The mobile trap — the pinned full-viewport Carto map. */}
          <div ref={mobileTrapRef} className="relative h-[220vh] lg:hidden">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
              {/* Session-26: the live's mobile route heading — pinned
                  inside the trap at viewport y=68, the live's clamp font
                  (42.9px at 390, capped 48), lh ≈1.02, tracking −0.055em,
                  width min(92vw, 360px) centered. */}
              <h2 className="pointer-events-none absolute left-1/2 top-[68px] z-20 w-[min(92vw,360px)] -translate-x-1/2 text-center font-serif text-[clamp(38px,11vw,48px)] leading-[1.02] tracking-[-0.055em] text-[#141413]">
                Recommended Route
              </h2>
              <RouteMapSvg progress={progress} pan={false} />
            </div>
          </div>

          {/* Session-60: the sticky is a plain 50/50 flex — the waypoint
              panel STRETCHES to the full 100vh (no items-start — the
              cards' top-1/2 centers resolve against the 800px panel). */}
          <div className="lg:sticky lg:top-0 lg:flex lg:h-screen">
            {/* The route map — pinned (lg+) with the head-centering pan
                and the split-color progress pill. Session-20: the live's
                split is 50/50 — the visual panel is half the viewport
                (640px at 1280). */}
            <div className="sticky top-0 hidden h-screen w-1/2 shrink-0 overflow-hidden lg:block">
              <RouteMapSvg progress={progress} pan={isDesktop} />
              <RouteProgressPill pct={pct} />
            </div>

            {/* The stops panel — mobile (session-18): the flowing text
                cards BELOW the pinned map (session-60: the live's panel
                pulls up -12vh over the trap's tail); session-20: the
                panel pads px-[18px]. lg+ (session-60): the graph-paper
                waypoint panel — the cards CENTER on the panel's middle
                (top-1/2 + translateY(-50% + offset)) at 576 wide inside
                the left-8/right-8 absolute slot, riding the CONTINUOUS
                scroll-linked choreography. */}
            <div className="relative -mt-[12vh] flex-1 overflow-visible px-[18px] pb-10 pt-0 md:px-8 lg:mt-0 lg:overflow-hidden lg:px-0 lg:pb-0 lg:pt-0">
              {/* Session-60: the live's 18px graph-paper overlay on the
                  waypoint panel (opacity 0.42, radially masked so the
                  grid dissolves before the panel's edges). */}
              <div
                data-graph-paper
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden opacity-[0.42] lg:block"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(20,20,19,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,19,0.055) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                  maskImage: "radial-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 54%, transparent 86%)",
                  WebkitMaskImage: "radial-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 54%, transparent 86%)",
                }}
              />
              {stops.map((place, i) => {
                const stop = STOPS[i] ?? { time: "", title: place.name, icon: Coffee };
                const active = i === activeIndex;
                // Session-20/60: the continuous choreography — card i
                // crosses the CENTER at progress i/(N−1); rel is the px
                // offset from the center (positive = below, negative =
                // exited above); opacity tents ±380px around the center.
                // The motion runs at 0.665px per scroll px of trap travel
                // with the live's 120ms linear transitions. Mobile
                // (isDesktop false) stays a static flowing list — no
                // inline styles.
                const crossing = stops.length > 1 ? i / (stops.length - 1) : 0;
                const rel = (crossing - progress / 100) * trapScrollPx * 0.665;
                const cardOpacity = Math.max(0, Math.min(1, 1 - Math.abs(rel) / 380));
                const desktopStyle = isDesktop
                  ? {
                      transform: `translateY(calc(-50% + ${Math.round(rel)}px))`,
                      opacity: cardOpacity,
                      transition: "opacity 120ms linear, transform 120ms linear",
                    }
                  : undefined;
                return (
                  <article
                    key={place.slug}
                    data-stop-index={i}
                    data-active={active}
                    style={desktopStyle}
                    className={cn(
                      "mx-auto mt-7 block first:mt-0",
                      // lg+: the center-based swapping stack — every card
                      // is absolute at the panel's middle; the inline
                      // transform/opacity drive the scroll-linked motion
                      // (session-20/60).
                      "lg:absolute lg:inset-y-auto lg:left-8 lg:right-8 lg:top-1/2 lg:mt-0",
                      "lg:data-[active=false]:pointer-events-none",
                    )}
                  >
                    {/* The time pill — white, radius 999 (session-20
                        re-measure: px-3 py-1, 12px/400, gap-2; session-22:
                        the text carries the live's +0.05em tracking; the
                        pill's mb-4 spaces the serif title). Session-27
                        re-measure: the live RE-ADDED the soft shadow + a
                        1px hairline border + a PER-STOP category icon
                        (stroke-width 1.8) + dimmer #3A3A3A text. */}
                    <span
                      data-stop-time={stop.time}
                      className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(14,14,14,0.1)] bg-white px-3 py-1 text-xs font-normal leading-[18px] tracking-[0.05em] text-[#3A3A3A] shadow-[0_8px_22px_rgba(14,14,14,0.06)]"
                    >
                      <stop.icon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                      {stop.time}
                    </span>

                    {/* The serif stop title — dark on cream (no photo).
                        Session-10: h2, matching the live's stop headings. */}
                    <h2 className="mb-2 font-serif text-[44px] font-normal leading-[1.1] tracking-[-0.02em] text-[#141413] lg:text-[48px]">
                      {stop.title}
                    </h2>

                    {/* The white info card (the live's link card) —
                        session-20: rounded-28 max-w-md (448px at desktop,
                        full-width at mobile), p-5, mt-7, the lighter
                        0 8px 28px/0.08 shadow, the 20px/600 h3 place
                        name, the 13px #72706C meta line. */}
                    <Link
                      href={`/place/${place.slug}`}
                      className="mt-7 block max-w-md rounded-[28px] border border-[rgba(14,14,14,0.08)] bg-white p-5 shadow-[0_8px_28px_rgba(14,14,14,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(14,14,14,0.10)]"
                    >
                      <h3 className="text-[20px] font-semibold leading-[30px] tracking-[-0.02em] text-[#141413]">
                        {place.name}
                      </h3>
                      <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-normal text-[#72706A]">
                        <MapPin
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2}
                          stroke="#72706A"
                          aria-hidden
                        />
                        {stopMetaParts(place, stop.metaNote).map((part, idx) => (
                          <span key={idx}>{part}</span>
                        ))}
                      </span>
                      {place.shortDescription && (
                        <span className="mt-4 block text-sm leading-relaxed text-[#3a3a3a]">
                          {place.shortDescription}
                        </span>
                      )}
                      <span
                        data-learn-more
                        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white transition hover:bg-roam hover:shadow-[0_12px_28px_rgba(87,26,255,0.28)]"
                      >
                        Learn More
                      </span>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
