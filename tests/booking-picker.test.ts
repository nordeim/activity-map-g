import { describe, expect, it } from "vitest";
import {
  buildBookingCalendar,
  buildTimeSlots,
  bookingMonthOptions,
  bookingRangeValue,
  formatBookingDateLabel,
  formatBookingRangeLabel,
  isoDate,
  parseBookingRangeValue,
} from "@/lib/booking-picker";

// The booking-form picker seam (v2.22) — every contract here was measured on
// the live app's BookingForm popovers (session 53, 2026-10-01):
//   * the time list = 29 slots, 08:00 → 22:00, 30-minute steps;
//   * the trigger labels = "Thu 15 Oct" date labels joined by an em-dash,
//     with the "— select end date" intermediate state;
//   * the hidden input value = "<iso> to <iso>";
//   * the calendar = a 42-cell Sunday-first grid with past days disabled
//     (October 2026 renders Sept 27 … Nov 7);
//   * the month select = the current month + 11 forward, "October 2026".

const oct = (day: number) => new Date(2026, 9, day); // October 2026
const today = new Date(2026, 9, 1);

describe("buildTimeSlots", () => {
  it("renders 29 slots (08:00 → 22:00 at 30-minute steps)", () => {
    const slots = buildTimeSlots();
    expect(slots).toHaveLength(29);
    expect(slots[0]).toBe("08:00");
    expect(slots[1]).toBe("08:30");
    expect(slots[slots.length - 1]).toBe("22:00");
  });

  it("keeps every slot on a :00 or :30 boundary", () => {
    for (const slot of buildTimeSlots()) {
      expect(slot).toMatch(/^(0[89]|1[0-9]|2[0-2]):(00|30)$/);
    }
  });
});

describe("formatBookingDateLabel", () => {
  it("renders the live's 'Ddd DD Mon' label", () => {
    expect(formatBookingDateLabel(oct(15))).toBe("Thu 15 Oct");
    expect(formatBookingDateLabel(oct(17))).toBe("Sat 17 Oct");
    expect(formatBookingDateLabel(new Date(2026, 10, 1))).toBe("Sun 1 Nov");
  });
});

describe("formatBookingRangeLabel", () => {
  it("renders the intermediate 'select end date' state while the range is open", () => {
    expect(formatBookingRangeLabel({ start: oct(15), end: null })).toBe(
      "Thu 15 Oct — select end date",
    );
  });

  it("renders the complete 'start — end' label", () => {
    expect(formatBookingRangeLabel({ start: oct(15), end: oct(17) })).toBe(
      "Thu 15 Oct — Sat 17 Oct",
    );
  });

  it("renders an empty label when nothing is picked", () => {
    expect(formatBookingRangeLabel({ start: null, end: null })).toBe("");
  });

  it("collapses a single-day range to one label", () => {
    expect(formatBookingRangeLabel({ start: oct(15), end: oct(15) })).toBe("Thu 15 Oct");
  });
});

describe("bookingRangeValue", () => {
  it("stays empty until the range completes (the live's hidden input is blank mid-pick)", () => {
    expect(bookingRangeValue({ start: oct(15), end: null })).toBe("");
    expect(bookingRangeValue({ start: null, end: null })).toBe("");
  });

  it("renders the live's '<iso> to <iso>' value", () => {
    expect(bookingRangeValue({ start: oct(15), end: oct(17) })).toBe(
      "2026-10-15 to 2026-10-17",
    );
  });

  it("renders a single-day range as '<iso> to <iso>' with the same day", () => {
    expect(bookingRangeValue({ start: oct(15), end: oct(15) })).toBe("2026-10-15 to 2026-10-15");
  });
});

describe("parseBookingRangeValue", () => {
  it("splits a complete value into the POST payload parts", () => {
    expect(parseBookingRangeValue("2026-10-15 to 2026-10-17")).toEqual({
      start: "2026-10-15",
      end: "2026-10-17",
    });
  });

  it("returns null for empty or malformed values (never a partial POST)", () => {
    expect(parseBookingRangeValue("")).toBeNull();
    expect(parseBookingRangeValue("2026-10-15")).toBeNull();
    expect(parseBookingRangeValue(null)).toBeNull();
  });
});

describe("buildBookingCalendar", () => {
  it("renders exactly 42 cells (six Sunday-first weeks)", () => {
    const cells = buildBookingCalendar(new Date(2026, 9, 1), today);
    expect(cells).toHaveLength(42);
  });

  it("anchors October 2026 on Sunday Sept 27 and ends on Saturday Nov 7 (the live's measured grid)", () => {
    const cells = buildBookingCalendar(new Date(2026, 9, 1), today);
    expect(isoDate(cells[0].date)).toBe("2026-09-27");
    expect(isoDate(cells[41].date)).toBe("2026-11-07");
  });

  it("marks the 31 in-month October days", () => {
    const cells = buildBookingCalendar(new Date(2026, 9, 1), today);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(31);
    expect(cells.filter((c) => c.inMonth)[0].date.getDate()).toBe(1);
  });

  it("flags past days (before today) as past — the disabled #C8C6C0 cells", () => {
    const cells = buildBookingCalendar(new Date(2026, 9, 1), today);
    // Sept 27-30 are before Oct 1 → past; Oct 1 (today) is NOT past.
    expect(cells.slice(0, 4).every((c) => c.past)).toBe(true);
    expect(cells[4].past).toBe(false);
  });

  it("flags in-month past days too (a mid-month today)", () => {
    const cells = buildBookingCalendar(new Date(2026, 9, 1), new Date(2026, 9, 15));
    const oct2 = cells[5];
    expect(oct2.past).toBe(true);
    const oct15 = cells[18];
    expect(oct15.past).toBe(false); // today itself is never past
  });

  it("classifies trailing next-month days as not past and not inMonth (the white/60 muted cells)", () => {
    const cells = buildBookingCalendar(new Date(2026, 9, 1), today);
    const nov = cells[41];
    expect(nov.inMonth).toBe(false);
    expect(nov.past).toBe(false);
  });
});

describe("bookingMonthOptions", () => {
  it("offers the current month + 11 forward (the live's 12-option select)", () => {
    const opts = bookingMonthOptions(today);
    expect(opts).toHaveLength(12);
    expect(opts[0].label).toBe("October 2026");
    expect(opts[11].label).toBe("September 2027");
  });

  it("labels options with the full month name + year", () => {
    const opts = bookingMonthOptions(today);
    expect(opts[2].label).toBe("December 2026");
    expect(opts[3].label).toBe("January 2027");
  });
});

describe("isoDate", () => {
  it("renders the zero-padded local ISO date", () => {
    expect(isoDate(oct(5))).toBe("2026-10-05");
    expect(isoDate(new Date(2026, 10, 1))).toBe("2026-11-01");
  });
});
