"use client";

// The trip planner, re-measured from the live app (sessions 3 + 6):
//
//   ( [📅 Select dates] [👥 2] [📍 Restaurants] [⌕] )
//
// Each segment is a control whose LABEL sits above (opacity-0 → revealed on
// hover, the value row nudging down 2px) — the dates segment is a BUTTON
// that opens the DateRangePicker popover; People and Type of Activities are
// labels with an INVISIBLE native <select> overlaid (absolute, opacity-0)
// so the pill keeps its clean look while remaining fully operable. The
// search button is a transparent disc that inverts to black on hover and
// carries data-ready once anything is chosen.
//
// Two skins:
// - "glass" (the home hero): session-6 re-measure — below md the planner
//   renders as a near-opaque WHITE CARD (bg white/94, radius 30, p-2, big
//   soft shadow, 2-col grid `1fr 76px` with two rows: [dates|people] then
//   [type|search], every field a gray pill rgba(242,241,238,0.76) radius 20
//   h-50). From md up it is the frosted GLASS PILL (#F8F7F4/35 + blur,
//   ≤548px, 4-col grid). Searching routes to the category page:
//   /eat|/stay|/do?people=N&start_date&end_date (never the map).
// - "white" (the browse pages): solid white pill, sticky shell.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Users, MapPinned, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLANNER_TYPES,
  plannerDateLabel,
  plannerIsReady,
  plannerSearchUrl,
  type PlannerType,
} from "@/lib/planner";
import { DateRangePicker } from "./DateRangePicker";

export function TripPlanner({
  variant = "glass",
  initialStart,
  initialEnd,
  initialPeople = 2,
  initialType = "Restaurants",
  className,
}: {
  variant?: "glass" | "white";
  initialStart?: string | null;
  initialEnd?: string | null;
  initialPeople?: number;
  initialType?: PlannerType;
  className?: string;
}) {
  const router = useRouter();
  const [start, setStart] = useState<string | null>(initialStart ?? null);
  const [end, setEnd] = useState<string | null>(initialEnd ?? null);
  const [people, setPeople] = useState<number>(initialPeople);
  const [type, setType] = useState<PlannerType>(initialType);
  const [open, setOpen] = useState(false);

  const ready = plannerIsReady(start, end, people, type);

  function search() {
    router.push(plannerSearchUrl(type, people, start, end));
  }

  const labelClass =
    "pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2 -translate-y-1 whitespace-nowrap text-[12px] font-medium leading-none text-muted opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100";
  const valueClass =
    "flex min-w-0 items-center justify-center gap-1.5 text-xs font-semibold text-[#141413] transition-transform duration-500 ease-out group-hover:translate-y-2";
  const segmentClass =
    // Mobile (<md, glass variant): every segment is a GRAY field pill
    // (rgba(242,241,238,0.76), radius 20) inside the white planner card;
    // from md the segments go transparent inside the glass pill again.
    "group relative min-w-0 cursor-pointer rounded-[20px] border border-transparent bg-[rgba(242,241,238,0.76)] text-center shadow-none transition-all duration-500 ease-out md:rounded-full md:bg-transparent hover:border-white/60 hover:bg-[#F8F7F4]/50 hover:shadow-[0_8px_20px_rgba(14,14,14,0.08),inset_0_1px_0_rgba(255,255,255,0.48)]";
  const hiddenSelect =
    "absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] cursor-pointer rounded-full opacity-0";

  return (
    <div
      // Session-16: the live's mobile card escapes the hero's px-6
      // content — 358px wide at x=16 (16px viewport margins) via -mx-2;
      // from md the frosted pill re-centers (mx-auto, max-w 548).
      className={cn(
        "trip-planner-card relative -mx-2 mt-4 rounded-[30px] p-2 md:mx-auto",
        variant === "glass"
          ? // Session-5: below md a near-opaque white CARD (radius 30, p-2,
            // big soft shadow); from md the frosted GLASS PILL returns.
            // Session-61 re-measure: the live's mobile card is
            // rgba(255,255,255,0.94) (not /95) and its shadow carries the
            // 1px white INSET top highlight on top of the 0 16 34 drop.
            "z-50 w-[calc(100%+16px)] border border-transparent bg-white/94 shadow-[0_16px_34px_rgba(14,14,14,0.16),inset_0_1px_0_rgba(255,255,255,0.94)] md:w-full md:max-w-[548px] md:rounded-full md:border-white/35 md:bg-[#F8F7F4]/35 md:p-1 md:shadow-[0_8px_22px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.42)] md:backdrop-blur-[28px] md:backdrop-saturate-150"
          : "w-full border border-black/5 bg-white/95 p-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.08)]",
        open && "z-[30000]",
        className,
      )}
    >
      <div
        className={cn(
          "grid items-stretch gap-1 overflow-hidden rounded-[24px] md:rounded-full", // session-16: the live's 4px mobile gap
          "grid-cols-[minmax(0,1fr)_76px] md:grid-cols-[minmax(42px,220px)_minmax(42px,90px)_minmax(42px,170px)_46px]",
        )}
      >
        {/* Dates — the lead segment (button → range popover). */}
        <button
          type="button"
          aria-label="Choose trip dates"
          onClick={() => setOpen((o) => !o)}
          className={cn(segmentClass, "flex min-h-[50px] items-center justify-center px-[15px] md:min-h-[40px]")}
        >
          <p className={labelClass}>Let&apos;s Plan Your Trip</p>
          <span className={cn(valueClass, "w-full")}>
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#141413]" strokeWidth={2} aria-hidden />
            <span className="truncate" style={{ maxWidth: 210 }}>
              {plannerDateLabel(start, end)}
            </span>
          </span>
        </button>

        {/* People 1–8 — invisible native select overlay. A plain div (NOT a
            <label aria-label=…>): the select below carries the only
            aria-label, keeping getByLabel single-matched for specs and AT. */}
        <div
          className={cn(segmentClass, "flex min-h-[50px] items-center justify-center px-[15px] md:min-h-[40px]")}
        >
          <p className={labelClass}>People</p>
          <span className={cn(valueClass, "w-full")}>
            <Users className="h-3.5 w-3.5 shrink-0 text-[#141413]" strokeWidth={2} aria-hidden />
            <span className="min-w-0 truncate" style={{ maxWidth: 34 }}>
              {people}
            </span>
          </span>
          <select
            aria-label="Number of people"
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className={hiddenSelect}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Type of Activities — invisible native select overlay (same
            single-aria-label pattern as the People segment). */}
        <div
          className={cn(segmentClass, "flex min-h-[50px] items-center justify-center px-[15px] md:min-h-[40px]")}
        >
          <p className={labelClass}>Type of Activities</p>
          <span className={cn(valueClass, "w-full")}>
            <MapPinned className="h-3.5 w-3.5 shrink-0 text-[#141413]" strokeWidth={2} aria-hidden />
            <span className="min-w-0 truncate" style={{ maxWidth: 126 }}>
              {type}
            </span>
          </span>
          <select
            aria-label="Type of Activities"
            value={type}
            onChange={(e) => setType(e.target.value as PlannerType)}
            className={hiddenSelect}
          >
            {PLANNER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Search — the round button (transparent → black on hover). */}
        <button
          type="button"
          aria-label="Search trip matches"
          data-ready={ready ? "true" : "false"}
          onClick={search}
          className="flex h-[50px] w-full items-center justify-center rounded-[20px] border border-transparent bg-[rgba(242,241,238,0.76)] text-[#141413] transition-colors duration-300 hover:bg-[#0e0e0e] hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.28)] md:h-[46px] md:rounded-full md:bg-transparent md:backdrop-blur-[18px]"
        >
          <Search className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {open && (
        <DateRangePicker
          start={start}
          end={end}
          onSelect={({ from, to }) => {
            setStart(from);
            setEnd(to);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
