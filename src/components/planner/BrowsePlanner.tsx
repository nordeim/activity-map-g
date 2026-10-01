"use client";

// The unified BROWSE planner (session-8 re-measure): the live app replaced
// the clone's "search row + separate 2×2 planner card" with ONE container —
//
//   mobile (<md): a WHITE CARD (radius 30, bg white/92, shadow
//   0 12 28 rgba(14,14,14,0.1)) stacking
//     [ cream search pill (r22, h54) ]
//     [ cream "Let's Plan Your Trip / Select dates" row (h52) ]
//     [ cream "People / 2" row (h52) ]
//     [ two circular icon action buttons, centered ]
//   — NOT sticky (the live card scrolls away on phones);
//
//   desktop (md+): one sticky WHITE PILL (radius 999, h-68) with the search
//   input inline, the labelled date + people segments, and the two icon
//   buttons at the end.
//
// Behavior: the search input filters the grid live (parent state); the
// date/people fields AUTO-FORWARD — choosing a range or a party size
// routes back to the same browse with people/start_date/end_date (the
// server page date-filters the grid). The first action button scrolls to
// the filter-chip row; the second links the map view. The date popover is
// the shared DateRangePicker.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CalendarDays, Users, Search, SlidersHorizontal, Map, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { plannerDateLabel, plannerSearchUrl, type PlannerType } from "@/lib/planner";
import { DateRangePicker } from "./DateRangePicker";
import type { PlaceCategory } from "@/types";

const CATEGORY_TYPE: Record<PlaceCategory, PlannerType> = {
  eat: "Restaurants",
  stay: "Hotels",
  do: "Attractions",
};

export function BrowsePlanner({
  category,
  searchPlaceholder,
  query,
  onQueryChange,
  initialPeople = 2,
  initialStart = null,
  initialEnd = null,
}: {
  category: PlaceCategory;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (q: string) => void;
  initialPeople?: number;
  initialStart?: string | null;
  initialEnd?: string | null;
}) {
  const router = useRouter();
  const [start, setStart] = useState<string | null>(initialStart);
  const [end, setEnd] = useState<string | null>(initialEnd);
  const [people, setPeople] = useState<number>(initialPeople);
  const [open, setOpen] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);

  const type = CATEGORY_TYPE[category];

  function forward(next: { people?: number; start?: string | null; end?: string | null }) {
    router.push(
      plannerSearchUrl(type, next.people ?? people, next.start ?? start, next.end ?? end),
    );
  }

  function scrollToChips() {
    chipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const fieldPill =
    "flex items-center gap-3 rounded-[22px] bg-[rgba(248,247,244,0.55)] px-4 text-left";
  // Session-57 (v2.24): the live's GLASS icon buttons — the 1px black/5
  // hairline, the cream/55 bg, the inset white-highlight shadow, and the
  // hover that inverts to dark with the lift + scale.
  const iconBtn =
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,0,0.05)] bg-[rgba(248,247,244,0.55)] text-[#141413] shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:bg-[#0E0E0E] hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.24)] md:h-12 md:w-12";

  return (
    <div className="sticky top-[10px] z-30 md:top-24">
      <div
        className={cn(
          "browse-planner-card relative mx-auto w-full rounded-[30px] border border-white/70 bg-white/[0.92] p-2.5 shadow-[0_12px_28px_rgba(14,14,14,0.1),inset_0_1px_0_rgba(255,255,255,0.88)]",
          "md:flex md:items-center md:gap-2 md:rounded-full md:bg-white md:p-1.5 md:shadow-[0_8px_22px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.88)]",
          open && "z-[30000]",
        )}
      >
        {/* The search pill — filters the grid live (both breakpoints). */}
        <div className={cn(fieldPill, "h-[54px] md:h-auto md:flex-1")}>
          <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.8} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search places"
            className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-black/40"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-muted"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          ) : null}
        </div>

        {/* Dates — the labelled field (opens the range popover). */}
        <div className="mt-3 md:mt-0">
          <button
            type="button"
            aria-label="Choose trip dates"
            onClick={() => setOpen((o) => !o)}
            className={cn(fieldPill, "min-h-[54px] w-full md:w-auto md:gap-2")}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-[#141413]" strokeWidth={2} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[12px] font-medium leading-none text-muted">
                Let&apos;s Plan Your Trip
              </span>
              <span className="block truncate text-sm font-semibold leading-tight text-[#141413]">
                {plannerDateLabel(start, end)}
              </span>
            </span>
          </button>
        </div>

        {/* People — invisible native select (the live's stepper values);
            session-24: the live groups date+people at a 6px gap (mt-1.5). */}
        <div className="relative mt-1.5 md:mt-0">
          <div className={cn(fieldPill, "min-h-[54px] w-full md:w-auto md:gap-2")}>
            <Users className="h-4 w-4 shrink-0 text-[#141413]" strokeWidth={2} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[12px] font-medium leading-none text-muted">People</span>
              <span className="block text-sm font-semibold leading-tight text-[#141413]">
                {people}
              </span>
            </span>
          </div>
          <select
            aria-label="Number of people"
            value={people}
            onChange={(e) => {
              setPeople(Number(e.target.value));
              forward({ people: Number(e.target.value) });
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* The two circular icon actions (live parity): filters → the
            chips row; the second → the map view. Session-57 (v2.24): the
            live's second glyph is the MAP outline (was map-pin), both
            icons stroke 2. */}
        <div className="mt-3 flex items-center justify-center gap-3 md:mt-0 md:justify-end">
          <button
            type="button"
            aria-label="Open category filters"
            onClick={scrollToChips}
            className={iconBtn}
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
          <Link href="/map" aria-label="Open the map view" className={iconBtn}>
            <Map className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        {open && (
          <DateRangePicker
            start={start}
            end={end}
            onSelect={({ from, to }) => {
              setStart(from);
              setEnd(to);
            }}
            onClose={() => {
              setOpen(false);
              forward({});
            }}
          />
        )}
      </div>

      {/* The chips anchor — the filters button scrolls here. */}
      <div ref={chipsRef} aria-hidden className="h-0" />
    </div>
  );
}
