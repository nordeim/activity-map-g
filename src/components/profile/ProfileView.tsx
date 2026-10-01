"use client";

// The Profile canvas — session-12 re-measure: the live redesigned the page
// into TWO glass cards (896px container): the identity card (rounded-36,
// bg-white/78, border-white/70) with the Profile eyebrow (12px/600 #72706C),
// the account identity as the h1 (72px serif — session-50 re-measure: the
// live's identity surface oscillated BACK to the session-14 contract: the
// h1 renders the account name "sepnetflix2023"), the account EMAIL as the
// 16px #555550 line below it (the STATIC "Your Roam account" line the
// session-48 measurement captured is gone again), the
// cream outlined chips (Augsburg / 0 day streak / Explorer), and the dark
// heart Saved-places button; then the bookings card (rounded-32, mt-8) with
// the Trips eyebrow, the "My bookings" h2 at 36px, FULL-WIDTH Upcoming/Past
// tabs (44px/12px), the All/Eat/Stay/Do filters (38px/12px), and the white
// rounded-26 empty state (48px icon circle + 14px #72706C line).
//
// Session-16 re-measure: the live's profile is a CHROME-LESS page (the
// (bare) route group renders it without the Navbar/footer) carrying a
// FULL-PAGE fixed 18px graph-paper grid overlay at 40% opacity, the outer
// block running px-5/pt-10 → md:px-8/md:pt-16 with the main at max-w-4xl,
// the identity block CENTERED on phones (text-center → md:text-left), the
// Go back / Sign out controls as translucent white/80 pills at the top, and
// the chip icons map-pin / sun / heart.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isBookingPast } from "@/lib/bookings";
import {
  ArrowLeft,
  CalendarDays,
  LogOut,
  MapPin,
  Sparkles,
  Sun,
  Heart,
  Ticket,
  UtensilsCrossed,
  BedDouble,
} from "lucide-react";
import type { BookingDTO, PlaceCategory } from "@/types";
import { cn } from "@/lib/utils";
import { profileSubtitle } from "@/lib/identity";

type BookingTab = "upcoming" | "past" | "all";
type CategoryFilter = PlaceCategory | "all";

const EYEBROW = "font-inter text-xs font-semibold uppercase tracking-[0.18em] text-[#72706A]";

export function ProfileView({
  user,
  bookings,
  favouriteCount,
}: {
  user: { name: string; email: string };
  bookings: BookingDTO[];
  favouriteCount: number | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<BookingTab>("upcoming");
  const [cat, setCat] = useState<CategoryFilter>("all");

  // Session-48: the Upcoming/Past split routes through the pure
  // isBookingPast seam (src/lib/bookings.ts) — CALENDAR-DAY based, so a
  // reservation for TONIGHT stays under Upcoming until its day ends (the
  // instant comparison this replaces flipped same-day bookings to Past at
  // 00:00 UTC, before the reservation happened).
  const now = useMemo(() => new Date(), []);
  const upcoming = bookings.filter((b) => !isBookingPast(b.startDate, now));
  const past = bookings.filter((b) => isBookingPast(b.startDate, now));

  const byCategory = (list: BookingDTO[]) =>
    cat === "all" ? list : list.filter((b) => b.placeCategory === cat);
  const shown =
    tab === "upcoming" ? byCategory(upcoming) : tab === "past" ? byCategory(past) : byCategory(bookings);

  // Login-free first visit: signing out ends the CURRENT session and returns
  // to the guide, where the (app) gate re-bootstraps a fresh guest session
  // — the visitor never lands back on the /login wall (the demo login stays
  // reachable by navigating to /login directly).
  //
  // v2.18: a FULL browser navigation, not router.replace/refresh. The
  // bootstrap re-establishes the guest session through a 307→303 chain that
  // only a top-level navigation can follow — the App Router's RSC soft-nav
  // cannot follow a server redirect that targets a route handler (it renders
  // an empty shell with no navbar/main instead; pinned by guest.spec's
  // sign-out test). Login keeps router.refresh() because its POST response
  // sets the session cookie directly — no redirect chain to follow.
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    // The App Router's lint rule prefers router navigation for internal
    // paths — but this is the one documented place where that is impossible:
    // the RSC soft-nav cannot follow the bootstrap's redirect-to-route-handler
    // chain (it renders an empty shell). A top-level navigation is REQUIRED
    // here; see the comment block above and guest.spec's sign-out pin.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    // Session-57 (v2.24): the live's PADDING MODEL — the page div carries
    // the padding (px-5/pt-10 → md:px-8/md:pt-16) with the main at
    // max-w-4xl carrying NONE, so both cards span the full 896px at md+
    // (the mirror's old main-carried padding capped them at 832).
    <div className="min-h-screen px-5 pb-24 pt-10 md:px-8 md:pt-16">
    <main className="relative mx-auto max-w-4xl">
      {/* Session-16 re-measure: the live's profile carries a FULL-PAGE
          graph-paper grid texture — a fixed, pointer-events-none, 40%-
          opacity 18px crossing (rgba(20,20,19,0.055) lines) spanning the
          whole viewport behind both cards (unlike the favourites page,
          where the texture stops after the heading block). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(20,20,19,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.055)_1px,transparent_1px)] [background-size:18px_18px]"
      />

      {/* The top row — session-16: the live's controls are translucent
          white/80 pills (the Go back disc 44×44 + the Sign out pill),
          sitting at the very top of the padded main (y≈64 on desktop).
          Session-57 (v2.24): the live's GLASS refresh — both pills carry
          the 1px black/6 hairline, the 0 8 22 /0.08 shadow, backdrop-
          blur-xl, and the hover LIFT that inverts them to dark. */}
      <div className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(0,0,0,0.06)] bg-white/80 text-[#141413] shadow-[0_8px_22px_rgba(14,14,14,0.08)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#141413] hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.16)]"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          <span className="sr-only">Go back</span>
        </button>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.06)] bg-white/80 px-4 py-3 font-inter text-sm font-semibold text-[#141413] shadow-[0_8px_22px_rgba(14,14,14,0.08)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#141413] hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.16)]"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Sign out
        </button>
      </div>

      {/* Identity card — the live's session-12 glass panel (rounded-36,
          bg-white/78, border-white/70). Session-16: the identity block is
          CENTERED on phones (text-center) and goes left from md.
          Session-57 (v2.24): the live's GLASS refresh — the compound
          0 18 44 /0.10 + inset-white-highlight shadow, backdrop-blur-24,
          and p-5 → md:p-8 (the sm:p-8 intermediate dropped). The live's
          bg-white/78 class DOES NOT COMPUTE (its CDN skips the non-
          standard /78 step — the rendered bg is TRANSPARENT + the blur
          frosting), so the mirror drops the tint to match the computed
          card (248,247,244 — the cream, not 78% white). */}
      <section className="overflow-hidden rounded-[36px] border border-white/70 p-5 text-center shadow-[0_18px_44px_rgba(14,14,14,0.10),inset_0_1px_0_rgba(255,255,255,0.70)] backdrop-blur-[24px] md:p-8 md:text-left">
        <p className={cn(EYEBROW, "mb-3")}>Profile</p>
          {/* Session-50: the h1 carries the account identity (the seeded
              name — the live's current value "sepnetflix2023").
              Session-57 (v2.24): the live's responsive form — text-[55px]
              on phones growing to md:text-[72px], line-height 0.92. */}
          <h1 className="font-serif text-[55px] font-normal leading-[0.92] tracking-[-0.06em] text-ink md:text-[72px]">
            {user.name}
          </h1>
          {/* v2.21: the subtitle is STATE-DEPENDENT (the identity seam,
              src/lib/identity.ts): the live went open, and its ANONYMOUS
              profile renders the STATIC "Your Roam account" line (no
              address) — the guest (the clone's anonymous state) renders
              that; every real account keeps the v2.20 contract: the account
              EMAIL as the 16px #555550 line. Session-57 (v2.24): the live's
              responsive 14px→16px form with the 20px top margin. */}
          <p className="mt-5 max-w-xl font-inter text-sm leading-7 text-[#555550] md:text-base">{profileSubtitle(user.email)}</p>

          {/* The live's stat chips — cream outlined pills (session-12:
              the Explorer badge lost its dark fill; all three match).
              Session-16: the icons are map-pin / SUN / HEART on the live
              (was flame / compass). Session-57 (v2.24): the live's py-2
              pills with font-semibold #555550 text + the 13px stroke-2
              icons. */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.06)] bg-[#F8F7F4] px-4 py-2 font-inter text-xs font-semibold text-[#555550]">
              <MapPin className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden /> Augsburg
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.06)] bg-[#F8F7F4] px-4 py-2 font-inter text-xs font-semibold text-[#555550]">
              <Sun className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden /> 0 day streak
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.06)] bg-[#F8F7F4] px-4 py-2 font-inter text-xs font-semibold text-[#555550]">
              <Heart className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden /> Explorer
            </span>
          </div>

          {/* Saved places — the live's dark button into /favourites
              (heart icon + the bare label, no count). Session-57 (v2.24):
              the live's VIOLET hover + the lift + the base shadow. */}
          <Link
            href="/favourites"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0E0E0E] px-5 py-3 font-inter text-sm font-semibold text-white shadow-[0_12px_28px_rgba(14,14,14,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#571AFF] hover:shadow-[0_16px_34px_rgba(87,26,255,0.24)]"
          >
            <Heart className="h-4 w-4" strokeWidth={2} aria-hidden />
            Saved places
          </Link>
        </section>

        {/* Bookings card — the live's session-12 glass panel (rounded-32,
            mt-8): Trips eyebrow, the 36px "My bookings" h2 + count,
            FULL-WIDTH tab pair, the category filter chips, empty state.
            Session-57 (v2.24): backdrop-blur-20 + the /0.08 shadow +
            md:p-7. */}
        <section className="mt-8 rounded-[32px] border border-white/70 p-5 shadow-[0_14px_34px_rgba(14,14,14,0.08)] backdrop-blur-[20px] md:p-7">
          <p className={EYEBROW}>Trips</p>
          <div className="mt-3 flex items-baseline justify-between">
            <h2 className="mt-1 font-serif text-4xl font-normal leading-[1.05] tracking-[-0.05em] text-ink">
              My bookings
            </h2>
            <span className="rounded-full bg-[#F8F7F4] px-3 py-1.5 font-inter text-xs font-semibold text-[#555550]">{bookings.length}</span>
          </div>

          {/* Session-12: the Upcoming/Past pair is FULL-WIDTH — one 44px
              12px tab per half (the live's 411×44 tabs). Session-57
              (v2.24): the live's re-measure — the 18px radius (not pill),
              the 0 8 18 /0.08 active shadow, the #141413 active /
              #72706A inactive text, gap-1.5, font-inter, and the label
              "Upcoming(N)" with NO space before the paren. */}
          <div className="mt-6 grid grid-cols-2 gap-2" role="tablist" aria-label="Booking filters">
            {(
              [
                ["upcoming", `Upcoming(${upcoming.length})`],
                ["past", `Past(${past.length})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "flex h-11 items-center justify-center gap-1.5 rounded-[18px] font-inter text-xs font-semibold transition-all duration-300 ease-out",
                  tab === value
                    ? "bg-white text-[#141413] shadow-[0_8px_18px_rgba(14,14,14,0.08)]"
                    : "text-[#72706A] hover:text-[#141413]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* The All/Eat/Stay/Do category chips (38px/12px, live's compact
              set). Session-57 (v2.24): the live's px-4 py-2.5 form + the
              VIOLET hover with the lift. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(
              [
                ["all", "All", Sun],
                ["eat", "eat", UtensilsCrossed],
                ["stay", "stay", BedDouble],
                ["do", "do", Ticket],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCat(value)}
                aria-pressed={cat === value}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 font-inter text-xs font-semibold capitalize transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#571AFF] hover:text-white hover:shadow-[0_12px_28px_rgba(87,26,255,0.18)]",
                  cat === value
                    ? "bg-[#141413] text-white"
                    : "bg-white text-[#555550] hover:text-ink",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            /* Session-12: the live's empty state — a white rounded-26
                bordered panel with the 48px icon circle + the 14px #72706C
                line (no CTA button). */
            <div className="mt-6 flex flex-col items-center rounded-[26px] border border-[rgba(0,0,0,0.06)] bg-white px-5 py-8 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream">
                <Sparkles className="h-5 w-5 text-black/40" strokeWidth={1.5} aria-hidden />
              </span>
              <p className="text-sm text-[#72706C]">No upcoming reservations. Time to explore.</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {shown.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </ul>
          )}
        </section>
    </main>
    </div>
  );
}

function BookingRow({ booking }: { booking: BookingDTO }) {
  return (
    <li>
      <Link
        href={`/place/${booking.placeSlug}`}
        className="flex items-center gap-4 rounded-2xl bg-cream p-3.5 transition hover:bg-cream-deep"
      >
        {booking.coverImageUrl ? (
          <img
            src={booking.coverImageUrl}
            alt={booking.placeName}
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{booking.placeName}</p>
          <p className="mt-0.5 text-xs text-black/50">
            {booking.startDate
              ? new Date(booking.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "Date to be decided"}
            {booking.endDate
              ? ` – ${new Date(booking.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
              : ""}
            {booking.time ? ` · ${booking.time}` : ""}
            {booking.name ? ` · ${booking.name}${booking.surname ? ` ${booking.surname}` : ""}` : ""}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black/50 shadow-float">
          <CalendarDays className="h-3 w-3" aria-hidden />
          {booking.placeCategory}
        </span>
      </Link>
    </li>
  );
}
