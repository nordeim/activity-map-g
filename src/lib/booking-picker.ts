// The booking-form picker seam (v2.22, session 53) — the pure logic behind
// the BookingForm's Dates/Time PICKER popovers, measured on the live app
// (2026-10-01): the live renders type="button" triggers ("Choose dates" /
// "Choose time") that open (a) a date-RANGE calendar — a 42-cell
// Sunday-first grid with a month SELECT (the current month + 11 forward),
// past days disabled in #C8C6C0, next-month trailing days in white/60
// muted, range endpoints on the violet #571AFF with its glow, in-range
// days on the #F0E9FF tint — and (b) a 29-slot time list (08:00 → 22:00,
// 30-minute steps). The trigger label runs "Thu 15 Oct — select end date"
// mid-pick and "Thu 15 Oct — Sat 17 Oct" complete; the hidden input value
// is "<iso> to <iso>" once complete.
//
// PURITY + CLIENT SAFETY: the BookingForm is a CLIENT component — like
// src/lib/identity.ts, this module keeps ZERO imports so it never drags
// server code into the browser bundle. Pinned by
// tests/booking-picker.test.ts.

export interface BookingRange {
  start: Date | null;
  end: Date | null;
}

export interface BookingDayCell {
  date: Date;
  /** True when the date belongs to the grid's focus month. */
  inMonth: boolean;
  /** True when the date is strictly before TODAY (day precision). */
  past: boolean;
}

export interface BookingMonthOption {
  /** The ISO month value ("2026-10") the select carries. */
  value: string;
  /** The visible "October 2026" label. */
  label: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** The live's weekday row: S M T W T F S (Sunday-first). */
export const BOOKING_WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/**
 * The 29 selectable times: 08:00 → 22:00 in 30-minute steps (the live's
 * popover list, measured 2026-10-01).
 */
export function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

/** The zero-padded LOCAL ISO date — "2026-10-15". */
export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The local DAY ORDINAL — used for the past-day comparison (day precision). */
function dayOrdinal(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/** The live's trigger date label — "Thu 15 Oct". */
export function formatBookingDateLabel(d: Date): string {
  const wd = WEEKDAYS[d.getDay()];
  const mon = MONTHS[d.getMonth()].slice(0, 3);
  return `${wd} ${d.getDate()} ${mon}`;
}

/**
 * The live's trigger range label: "" empty, "Thu 15 Oct — select end
 * date" mid-pick, "Thu 15 Oct — Sat 17 Oct" complete. A single-day range
 * (start === end) collapses to the one date label.
 */
export function formatBookingRangeLabel(range: BookingRange): string {
  if (!range.start) return "";
  const startLabel = formatBookingDateLabel(range.start);
  if (!range.end) return `${startLabel} — select end date`;
  if (dayOrdinal(range.end) === dayOrdinal(range.start)) return startLabel;
  return `${startLabel} — ${formatBookingDateLabel(range.end)}`;
}

/**
 * The hidden input's value: EMPTY until the range completes (the live's
 * input stayed blank mid-pick), then "2026-10-15 to 2026-10-17". A
 * single-day range renders "<iso> to <iso>" with the same day.
 */
export function bookingRangeValue(range: BookingRange): string {
  if (!range.start || !range.end) return "";
  return `${isoDate(range.start)} to ${isoDate(range.end)}`;
}

/**
 * Split the hidden input's value into the POST payload parts. Returns
 * null for anything but a COMPLETE range value — never a partial POST.
 */
export function parseBookingRangeValue(
  value: string | null | undefined,
): { start: string; end: string } | null {
  if (!value) return null;
  const parts = value.split(" to ");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { start: parts[0], end: parts[1] };
}

/**
 * The 42-cell calendar grid for a focus month: six Sunday-first weeks
 * starting on the Sunday on/before the 1st. October 2026 (a
 * Thursday-start month) anchors on Sunday Sept 27 and ends on Saturday
 * Nov 7 — exactly the live's measured grid. Past days (before today,
 * day precision — today itself is NOT past) are flagged for the
 * disabled #C8C6C0 cells; next-month trailing days land not-in-month
 * and (being future, since the month options only run forward) not-past
 * for the white/60 muted cells.
 */
export function buildBookingCalendar(month: Date, today: Date): BookingDayCell[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(1 - first.getDay()); // back to the Sunday on/before the 1st
  const todayOrdinal = dayOrdinal(today);
  const cells: BookingDayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      date,
      inMonth: date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear(),
      past: dayOrdinal(date) < todayOrdinal,
    });
  }
  return cells;
}

/**
 * The month SELECT's options: the current month + 11 forward ("October
 * 2026" … "September 2027") — the live's 12-option list. The value is
 * the ISO month the select carries; the label is the full month name.
 */
export function bookingMonthOptions(now: Date): BookingMonthOption[] {
  const options: BookingMonthOption[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return options;
}

/** The month label for a grid's focus month — "October 2026". */
export function bookingMonthLabel(month: Date): string {
  return `${MONTHS[month.getMonth()]} ${month.getFullYear()}`;
}
