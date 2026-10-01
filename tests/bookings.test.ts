import { describe, expect, it } from "vitest";

import { isBookingPast } from "@/lib/bookings";

// The booking-time classification seam (session 48 / v2.19).
//
// The contract: a booking is "past" ONLY when its start CALENDAR DAY is
// strictly before the viewer's today. A reservation made now for TONIGHT
// (19:00) stays under Upcoming until its day ends — the instant comparison
// this replaces flipped same-day bookings to Past at 00:00 UTC, before the
// reservation ever happened (reproduced live on the deployed mirror and
// time-bombed in the E2E corpus at the 2026-10-01 UTC midnight boundary).
//
// Day-normalisation uses the LOCAL calendar parts of both dates, so a
// UTC-midnight-parsed "2026-10-01" and the viewer's same-day "now" compare
// equal in the demo deployment's timezones (UTC, +0800).

describe("isBookingPast (the calendar-day booking classification)", () => {
  it("classifies yesterday's booking as past", () => {
    // 2026-09-30 23:00 "now" vs a start on 2026-09-30 00:00 → different logic:
    // here the start is a full calendar day before the now-day.
    const now = new Date(2026, 8, 30, 23, 0); // Sep 30 2026, 23:00 local
    expect(isBookingPast("2026-09-29", now)).toBe(true);
    expect(isBookingPast(new Date(2026, 8, 29, 12, 0), now)).toBe(true);
  });

  it("keeps a booking that STARTS TODAY upcoming — even at 00:00 sharp", () => {
    // The exact time-bomb case: the clock passed UTC midnight but the
    // reservation is for today. (new Date("2026-10-01") = 00:00 UTC.)
    const now = new Date(2026, 9, 1, 0, 43); // Oct 1 2026, 00:43 local
    expect(isBookingPast("2026-10-01", now)).toBe(false);
  });

  it("keeps a booking that starts today upcoming late in the day", () => {
    const now = new Date(2026, 9, 1, 23, 59);
    expect(isBookingPast("2026-10-01", now)).toBe(false);
    expect(isBookingPast(new Date(2026, 9, 1, 0, 0), now)).toBe(false);
  });

  it("classifies tomorrow's booking as upcoming", () => {
    const now = new Date(2026, 9, 1, 12, 0);
    expect(isBookingPast("2026-10-02", now)).toBe(false);
  });

  it("treats a missing start date as never past (the no-date bucket stays Upcoming)", () => {
    const now = new Date(2026, 9, 1, 12, 0);
    expect(isBookingPast(null, now)).toBe(false);
    expect(isBookingPast(undefined, now)).toBe(false);
    expect(isBookingPast("", now)).toBe(false);
  });

  it("treats an unparseable start date as never past instead of throwing", () => {
    const now = new Date(2026, 9, 1, 12, 0);
    expect(isBookingPast("not-a-date", now)).toBe(false);
  });

  it("ignores the wall-clock time inside the start day (only the day matters)", () => {
    const now = new Date(2026, 9, 1, 9, 0);
    // Both starts are ON Oct 1 — one before "now", one after: same verdict.
    expect(isBookingPast(new Date(2026, 9, 1, 1, 0), now)).toBe(false);
    expect(isBookingPast(new Date(2026, 9, 1, 23, 0), now)).toBe(false);
    // ...and both starts are ON Sep 30 — again one verdict.
    expect(isBookingPast(new Date(2026, 8, 30, 23, 0), now)).toBe(true);
    expect(isBookingPast(new Date(2026, 8, 30, 1, 0), now)).toBe(true);
  });

  it("defaults to the current clock when no now is supplied", () => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    // A booking for TODAY is upcoming right now — deterministic forever.
    expect(isBookingPast(todayIso)).toBe(false);
    // The ISO string of "this day last week" is safely in the past.
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const lastWeekIso = `${lastWeek.getFullYear()}-${String(lastWeek.getMonth() + 1).padStart(2, "0")}-${String(
      lastWeek.getDate(),
    ).padStart(2, "0")}`;
    expect(isBookingPast(lastWeekIso)).toBe(true);
  });
});
