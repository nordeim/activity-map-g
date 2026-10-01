"use client";

// The booking form's DATES field (v2.22, session 53) — the live's
// PICKER-TRIGGER button + date-range calendar popover, measured on the
// live app 2026-10-01:
//
//   * The TRIGGER: type="button", h-11 (44px) w-full rounded-2xl (16px)
//     with the #DDDBD5 border, justify-between — the value/placeholder
//     span on the left (#888580 "Choose dates" empty, ink when set) and
//     the calendar-days icon (16px, stroke 1.8) + a chevron-down (15px,
//     stroke 2) that rotates 180° while the popover is open on the
//     right. Violet border + glow on hover/focus.
//   * The POPOVER: cream #F8F7F4, r-24, #DDDBD5 hairline, the
//     0 20px 48 /0.14 shadow, 12px padding — anchored to the relative
//     label, opening UP on phones (bottom-[calc(100%+8px)]) and DOWN
//     from md (md:bottom-auto md:top-[calc(100%+8px)]).
//   * The CALENDAR: a white rounded-2xl month row wrapping a 36px
//     rounded-full month SELECT (the current month + 11 forward), the
//     10px S M T W T F S weekday row, and the 42-cell Sunday-first grid
//     (36px rounded-full cells): past days disabled in #C8C6C0,
//     next-month trailing days in white/60 muted, in-month days white
//     with the black hover, range ENDPOINTS on the violet #571AFF with
//     its 0 10 22 /0.24 glow, IN-RANGE days on the #F0E9FF tint.
//   * The RANGE semantics: first click = start (the trigger reads
//     "Thu 15 Oct — select end date"), second click = end (the trigger
//     reads "Thu 15 Oct — Sat 17 Oct" and the popover CLOSES). The
//     hidden 1×1 input carries "2026-10-15 to 2026-10-17" (required).
//
// Pure logic lives in the client-safe seam src/lib/booking-picker.ts
// (pinned by tests/booking-picker.test.ts); the surfaces are pinned by
// the browse.spec booking tests.

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
  BOOKING_WEEKDAY_LABELS,
  bookingMonthOptions,
  bookingRangeValue,
  buildBookingCalendar,
  formatBookingRangeLabel,
  isoDate,
  type BookingDayCell,
  type BookingRange,
} from "@/lib/booking-picker";
import { cn } from "@/lib/utils";

// Session-55 re-measure (v2.23): the live's picker chrome contract —
// * The TRIGGER carries NO aria-label/aria-expanded (its accessible name
//   is the wrapping label's text, "Dates*"); the hidden input is NOT
//   readOnly.
// * The MONTH ROW is two children: a `relative flex-1` wrapper (the
//   font-bold month select + the ABSOLUTE pointer-events-none chevron
//   inset right-5) and the calendar-days icon (stroke 2) at the END.
// * The WEEKDAY row is font-bold UPPERCASE tracking-[0.12em].
// * The popover container carries NO font-inter (the live's doesn't).
// * The in-month day-cell hover shadow is 0.12 (was 0.08).

export function BookingDatePicker({
  range,
  onChange,
}: {
  range: BookingRange;
  onChange: (range: BookingRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const anchor = range.start ?? new Date();
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });
  const rootRef = useRef<HTMLLabelElement>(null);

  // Outside clicks + Escape close the popover (the live's behavior).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = useMemo(() => new Date(), []);
  const cells = useMemo(() => buildBookingCalendar(month, today), [month, today]);
  const options = useMemo(() => bookingMonthOptions(today), [today]);

  const startIso = range.start ? isoDate(range.start) : null;
  const endIso = range.end ? isoDate(range.end) : null;

  function dayClass(cell: BookingDayCell): string {
    const base =
      "flex h-9 items-center justify-center rounded-full text-sm transition-all duration-200";
    const d = isoDate(cell.date);
    if (startIso && (d === startIso || (endIso !== null && d === endIso))) {
      return cn(base, "bg-[#571AFF] text-white shadow-[0_10px_22px_rgba(87,26,255,0.24)]");
    }
    if (startIso && endIso && d > startIso && d < endIso) {
      return cn(base, "bg-[#F0E9FF] text-[#571AFF]");
    }
    if (cell.past) return cn(base, "cursor-not-allowed text-[#C8C6C0]");
    if (!cell.inMonth) return cn(base, "bg-white/60 text-muted hover:bg-black hover:text-white");
    return cn(
      base,
      "bg-white text-ink hover:bg-black hover:text-white hover:shadow-[0_10px_22px_rgba(14,14,14,0.12)]",
    );
  }

  function pickDay(cell: BookingDayCell) {
    if (cell.past) return;
    const d = isoDate(cell.date);
    // No start yet, or a complete range → (re)start at the clicked day.
    if (!startIso || endIso) {
      onChange({ start: cell.date, end: null });
      return;
    }
    // An earlier click mid-pick restarts the range; a later (or equal)
    // click completes it and CLOSES the popover (the live's contract).
    if (d < startIso) {
      onChange({ start: cell.date, end: null });
      return;
    }
    onChange({ start: range.start, end: cell.date });
    setOpen(false);
  }

  const monthValue = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  return (
    <label
      ref={rootRef}
      className="relative block text-xs font-semibold text-[#3a3a3a]"
    >
      Dates*
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex h-11 w-full items-center justify-between rounded-2xl border border-[#DDDBD5] bg-white px-4 text-left text-sm text-ink outline-none transition-all duration-200 hover:border-[#571AFF] hover:shadow-[0_8px_22px_rgba(87,26,255,0.10)] focus:border-[#571AFF] focus:shadow-[0_8px_22px_rgba(87,26,255,0.14)]"
      >
        <span className={range.start ? "text-ink" : "text-muted"}>
          {range.start ? formatBookingRangeLabel(range) : "Choose dates"}
        </span>
        <span className="flex items-center gap-2 text-ink">
          <CalendarDays className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          <ChevronDown
            className={cn("h-[15px] w-[15px] transition-transform duration-200", open && "rotate-180")}
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </button>
      {/* The live's 1×1 hidden input carrying the range value (required,
          not readOnly — the live's contract). */}
      <input
        type="text"
        name="dates"
        tabIndex={-1}
        aria-hidden
        value={bookingRangeValue(range)}
        required
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
      />
      {open ? (
        <div
          data-booking-calendar
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-[30000] w-full -translate-x-1/2 rounded-[24px] border border-[#DDDBD5] bg-[#F8F7F4] p-3 shadow-[0_20px_48px_rgba(14,14,14,0.14)] md:bottom-auto md:top-[calc(100%+8px)]"
        >
          {/* Session-55 re-measure (v2.23): the live's month row — a
              relative flex-1 wrapper (the font-bold select + the absolute
              pointer-events-none chevron inset right-5) and the
              calendar-days icon (stroke 2) at the row's END. */}
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-ink">
            <div className="relative flex-1">
              <select
                value={monthValue}
                onChange={(e) => {
                  const [y, m] = e.target.value.split("-").map(Number);
                  setMonth(new Date(y, m - 1, 1));
                }}
                className="h-9 w-full appearance-none rounded-full border border-[#DDDBD5] bg-[#F8F7F4] px-3 pr-12 font-inter text-sm font-bold text-ink outline-none transition-all duration-200 hover:border-[#571AFF] focus:border-[#571AFF]"
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-5 top-1/2 h-[15px] w-[15px] -translate-y-1/2"
                strokeWidth={2}
                aria-hidden
              />
            </div>
            <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            {BOOKING_WEEKDAY_LABELS.map((wd, i) => (
              <span key={i}>{wd}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const d = isoDate(cell.date);
              return (
                <button
                  key={d}
                  type="button"
                  data-day={cell.date.getDate()}
                  data-date={d}
                  disabled={cell.past}
                  aria-label={d}
                  className={dayClass(cell)}
                  onClick={() => pickDay(cell)}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </label>
  );
}
