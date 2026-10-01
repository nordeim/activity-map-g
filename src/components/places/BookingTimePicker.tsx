"use client";

// The booking form's TIME field (v2.22, session 53) — the live's
// PICKER-TRIGGER button + time-list popover, measured on the live app
// 2026-10-01:
//
//   * The TRIGGER: the same chrome as the dates trigger — h-11 (44px)
//     w-full rounded-2xl (16px), #DDDBD5 border, justify-between — with
//     the clock icon (16px, stroke 1.8) + the rotating chevron-down
//     (15px, stroke 2). Empty shows the #888580 "Choose time" span.
//   * The POPOVER: the shared chrome (cream #F8F7F4, r-24, #DDDBD5
//     hairline, the 0 20px 48 /0.14 shadow, 12px padding, phones UP /
//     md+ DOWN) carrying a `grid gap-1` list of 29 time buttons
//     (08:00 → 22:00, 30-minute steps): h-10 (40px) rounded-2xl cells,
//     white with the black hover; the SELECTED slot renders the violet
//     #571AFF fill + the 0 10 22 /0.22 glow + a 15px check icon on the
//     right (hence justify-between).
//   * A click selects the time, closes the popover, and the trigger
//     shows the chosen "19:00". The hidden 1×1 input carries the value
//     (required).
//
// The slot list is the pure seam's buildTimeSlots() (src/lib/
// booking-picker.ts, pinned by tests/booking-picker.test.ts).

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Clock } from "lucide-react";
import { buildTimeSlots } from "@/lib/booking-picker";
import { cn } from "@/lib/utils";

// Session-55 re-measure (v2.23): the live's picker chrome contract —
// * The TRIGGER carries NO aria-label/aria-expanded (its accessible name
//   is the wrapping label's text, "Time*"); the hidden input is NOT
//   readOnly.
// * The popover container carries NO font-inter (the live's doesn't —
//   the slot buttons carry their own).
// * The unselected slot's hover shadow is 0.12 (was 0.08).

const SLOTS = buildTimeSlots();

export function BookingTimePicker({
  value,
  onChange,
  label = "Time*",
}: {
  value: string | null;
  onChange: (value: string) => void;
  // Session-60: the STAY forms' label reads "Preferred Check-In Time*"
  // (the live differentiates by category; eat/do keep "Time*").
  label?: string;
}) {
  const [open, setOpen] = useState(false);
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

  return (
    <label
      ref={rootRef}
      className="relative block text-xs font-semibold text-[#3a3a3a]"
    >
      {label}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex h-11 w-full items-center justify-between rounded-2xl border border-[#DDDBD5] bg-white px-4 text-left text-sm text-ink outline-none transition-all duration-200 hover:border-[#571AFF] hover:shadow-[0_8px_22px_rgba(87,26,255,0.10)] focus:border-[#571AFF] focus:shadow-[0_8px_22px_rgba(87,26,255,0.14)]"
      >
        <span className={value ? "text-ink" : "text-muted"}>
          {value ?? "Choose time"}
        </span>
        <span className="flex items-center gap-2 text-ink">
          <Clock className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          <ChevronDown
            className={cn("h-[15px] w-[15px] transition-transform duration-200", open && "rotate-180")}
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </button>
      {/* The live's 1×1 hidden input carrying the time value (required,
          not readOnly — the live's contract). */}
      <input
        type="text"
        name="time"
        tabIndex={-1}
        aria-hidden
        value={value ?? ""}
        required
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
      />
      {open ? (
        <div
          data-booking-time-list
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-[30000] w-full -translate-x-1/2 rounded-[24px] border border-[#DDDBD5] bg-[#F8F7F4] p-3 shadow-[0_20px_48px_rgba(14,14,14,0.14)] md:bottom-auto md:top-[calc(100%+8px)]"
        >
          <div className="grid gap-1">
            {SLOTS.map((slot) => {
              const selected = slot === value;
              return (
                <button
                  key={slot}
                  type="button"
                  className={cn(
                    "flex h-10 items-center justify-between rounded-2xl px-3 font-inter text-sm transition-all duration-200",
                    selected
                      ? "bg-[#571AFF] text-white shadow-[0_10px_22px_rgba(87,26,255,0.22)]"
                      : "bg-white text-ink hover:bg-black hover:text-white hover:shadow-[0_10px_22px_rgba(14,14,14,0.12)]",
                  )}
                  onClick={() => {
                    onChange(slot);
                    setOpen(false);
                  }}
                >
                  <span>{slot}</span>
                  {selected ? <Check className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </label>
  );
}
