"use client";

// The booking request form on the place detail page — re-measured from the
// live app (session 3, re-measured sessions 14 + 18): a SEPARATE white
// card (aside, rounded-28, black/8 hairline, no shadow — session-18: the
// card moved BELOW the hero photo into the detail grid's form column)
// leading with the "Book Now" 18px/600 h3 + the "Send your booking request
// for <place>." 14px #888580 subtitle, then Name*, Surname*, Dates*
// ("Choose dates"), Time* ("Choose time"), Phone, Email*, Message — all
// SINGLE-COLUMN full-width 44px fields with 16px corner radii (session-18:
// the live moved off rounded-full) — and the violet #571AFF 48px "Book
// Now" submit (a full pill, unchanged). Submitting posts to
// /api/bookings (guests stay server-clamped; the request fields are
// persisted on the Booking row).
//
// Session-53 (v2.22): the Dates/Time fields are the live's PICKER
// TRIGGER buttons (BookingDatePicker + BookingTimePicker — a date-range
// calendar popover and a 29-slot time list; the free-text inputs were
// clone invention), the success note is the live's PLAIN centered
// 12px/600 #2A6B3A line (no background pill), and the form RESETS after
// a successful submit (the placeholders return).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { PlaceCategory } from "@/types";
import { BookingDatePicker } from "./BookingDatePicker";
import { BookingTimePicker } from "./BookingTimePicker";
import { isoDate, type BookingRange } from "@/lib/booking-picker";

export interface BookablePlace {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  isBookable: boolean;
  nightlyPrice: number | null;
  price: number | null;
  priceLabel: string | null;
  currency: string;
  avgRating: number;
  reviewCount: number;
  minParty: number | null;
  maxParty: number | null;
}

export function BookingForm({ place }: { place: BookablePlace }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [range, setRange] = useState<BookingRange>({ start: null, end: null });
  const [time, setTime] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!place.isBookable || status === "busy") return;
    setStatus("busy");
    setNote(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: place.id,
          // Session-53 (v2.22): the range picker's own endpoints — the
          // start and the END (the old form sent the same string twice).
          startDate: range.start ? isoDate(range.start) : null,
          endDate: range.end ? isoDate(range.end) : null,
          guests: 2,
          name,
          surname,
          time,
          phone,
          email,
          message,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setNote(body.error ?? "Could not send the booking request.");
        return;
      }
      setStatus("done");
      // Session-53: the live's success copy (a plain centered line — see
      // the note render below).
      setNote(`Your booking request for ${place.name} has been sent.`);
      // Session-53: the live's form RESETS after a successful submit.
      setName("");
      setSurname("");
      setRange({ start: null, end: null });
      setTime(null);
      setPhone("");
      setEmail("");
      setMessage("");
      router.refresh();
    } catch {
      setStatus("error");
      setNote("Could not reach the server. Please try again.");
    }
  }

  if (!place.isBookable) {
    return (
      <aside
        id="book-now-card"
        className="scroll-mt-24 rounded-[28px] border border-[rgba(14,14,14,0.08)] bg-white p-6 md:p-8"
      >
        <p className="text-sm leading-relaxed text-secondary">
          This stop is browse-only — drop by any time, no reservation needed.
        </p>
      </aside>
    );
  }

  // Session-14 re-measure: the live's fields are single-column 44px rows
  // (was a 2-column 48px grid); the Dates/Time pickers carry the 600-weight
  // #888580 "Choose …" placeholder text like the live's picker buttons.
  // Session-18 re-measure: the field corners are 16px radii (the live moved
  // off rounded-full); the textarea matches at 16px. Session-53: the
  // Dates/Time rows moved into the picker components (label-wrapped
  // trigger buttons + popovers).
  const field =
    "flex h-11 w-full items-center rounded-[16px] border border-[#DDDBD5] bg-white px-5 text-sm font-medium text-ink outline-none transition placeholder:text-black/35 focus:border-roam/50";
  // Session-28 re-measure: the live's labels are 12px/600 #3A3A3A with
  // the asterisk INLINE in the same color (no violet span).
  const label = "mb-1.5 block text-xs font-semibold text-[#3a3a3a]";

  return (
    <aside
      id="book-now-card"
      className="scroll-mt-24 rounded-[28px] border border-[rgba(14,14,14,0.08)] bg-white p-6 md:p-8"
    >
      {/* Session-14 re-measure: the live leads with the 18px "Book Now"
          heading and demoted the request line to a 14px #888580 subtitle.
          Session-18: the live renders it as an h3 inside the aside card. */}
      <h3 className="text-lg font-semibold text-ink">Book Now</h3>
      <p className="mt-1 text-sm text-[#888580]">
        Send your booking request for {place.name}.
      </p>

      {/* Session-55 re-measure (v2.23): the live's form carries font-inter
          (the form-level font contract). */}
      <form id="book-now" onSubmit={submit} className="mt-6 space-y-4 font-inter">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={label} htmlFor="booking-name">
            Name*
          </label>
          <input
            id="booking-name"
            aria-label="Name"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className={label} htmlFor="booking-surname">
            Surname*
          </label>
          <input
            id="booking-surname"
            aria-label="Surname"
            className={field}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
        <BookingDatePicker range={range} onChange={setRange} />
        {/* Session-60 re-measure: the live differentiates the time field's
            label by category — the STAY forms read "Preferred Check-In
            Time*" (the eat/do forms keep "Time*"). */}
        <BookingTimePicker
          value={time}
          onChange={setTime}
          label={place.category === "stay" ? "Preferred Check-In Time*" : "Time*"}
        />
        <div>
          <label className={label} htmlFor="booking-phone">
            Phone
          </label>
          <input
            id="booking-phone"
            aria-label="Phone"
            className={field}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
          />
        </div>
        <div>
          <label className={label} htmlFor="booking-email">
            Email*
          </label>
          <input
            id="booking-email"
            aria-label="Email"
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className={label} htmlFor="booking-message">
            Message
          </label>
          <textarea
            id="booking-message"
            aria-label="Message"
            className="min-h-[106px] w-full rounded-[16px] border border-black/10 bg-white px-5 py-4 text-sm font-medium text-ink outline-none transition placeholder:text-black/35 focus:border-roam/50"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Anything the host should know?"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "busy"}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-roam text-sm font-semibold text-white shadow-[0_12px_28px_rgba(87,26,255,0.28)] transition hover:bg-roam-deep disabled:opacity-60"
      >
        {status === "busy" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Book Now
      </button>

      {note ? (
        <p
          role="status"
          className={
            status === "error"
              ? "mt-4 text-center text-xs font-semibold text-red-700"
              : "mt-4 text-center text-xs font-semibold text-[#2A6B3A]"
          }
        >
          {note}
        </p>
      ) : null}
      </form>
    </aside>
  );
}
