// Booking-time classification seam (session 48 / v2.19).
//
// The profile's Upcoming/Past tabs classify a booking by WHEN its stay
// starts. The rule is CALENDAR-DAY based, not instant-based: a reservation
// made now for TONIGHT (19:00) is still upcoming — flipping it to "Past" at
// midnight, before the reservation happens, contradicts the request form's
// own time field and the Upcoming tab's empty-state copy ("No upcoming
// reservations. Time to explore.").
//
// The instant comparison this replaces (new Date(startDate).getTime() <
// Date.now()) time-bombed the E2E corpus at the 2026-10-01 UTC midnight
// boundary and mis-filed same-day bookings on the deployed mirror (a
// tonight-19:00 booking landed under "Past (1)").
//
// Day normalisation uses the LOCAL calendar parts of both dates (via
// Date.UTC of the parts), so a UTC-midnight-parsed "2026-10-01" and the
// viewer's same-day clock compare as the same day in the demo deployment's
// timezones (UTC, +0800). Bookings without a parseable start date are never
// "past" — they stay in the Upcoming bucket, matching the previous contract
// (a null startDate rendered as Infinity in the old filter).

/**
 * Is this booking's stay already over — i.e. did its start DAY fully pass?
 * Same-day and future bookings are upcoming. Null, empty, or unparseable
 * start dates are never past (they stay under Upcoming).
 */
export function isBookingPast(
  startDate: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (startDate === null || startDate === undefined || startDate === "") return false;

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  if (Number.isNaN(start.getTime())) return false;

  // Day ordinal from the LOCAL calendar parts — the wall-clock time inside
  // the day is deliberately ignored (only the day matters).
  const dayOf = (d: Date): number =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

  return dayOf(start) < dayOf(now);
}
