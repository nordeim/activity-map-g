"use client";

// The Profile canvas — session-12 re-measure: the live redesigned the page
// into TWO glass cards (896px container): the identity card (rounded-36,
// bg-white/78, border-white/70) with the Profile eyebrow (12px/600 #72706C),
// the account identity as the h1 (72px serif — session-14 re-measure: the
// live now shows the USERNAME "sepnetflix2023"), the EMAIL as the 16px
// #555550 line below it ("Your Roam account" was removed upstream), the
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

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type BookingTab = "upcoming" | "past" | "all";
type CategoryFilter = PlaceCategory | "all";

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.25em] text-[#72706C]";

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

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => (b.startDate ? new Date(b.startDate).getTime() : Infinity) >= now,
  );
  const past = bookings.filter((b) =>
    b.startDate ? new Date(b.startDate).getTime() < now : false,
  );

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
    <main className="relative mx-auto max-w-4xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
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
          sitting at the very top of the padded main (y≈64 on desktop). */}
      <div className="relative mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-ink transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span className="sr-only">Go back</span>
        </button>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Sign out
        </button>
      </div>

      {/* Identity card — the live's session-12 glass panel (rounded-36,
          bg-white/78, border-white/70). Session-16: the identity block is
          CENTERED on phones (text-center) and goes left from md. */}
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/78 p-5 text-center shadow-[0_8px_24px_rgba(14,14,14,0.08)] sm:p-8 md:text-left">
        <p className={cn(EYEBROW, "mb-3")}>Profile</p>
          {/* Session-14: the h1 carries the account identity (the seeded
              username), with the EMAIL rendered below it. */}
          <h1 className="font-serif text-[clamp(42px,9vw,72px)] leading-[0.98] tracking-[-0.06em] text-ink">
            {user.name}
          </h1>
          {/* Session-14: the live shows the account EMAIL on this line
              ("Your Roam account" is gone from the reference). */}
          <p className="mt-2 text-base text-[#555550]">{user.email}</p>

          {/* The live's stat chips — cream outlined 34px pills (session-12:
              the Explorer badge lost its dark fill; all three match).
              Session-16: the icons are map-pin / SUN / HEART on the live
              (was flame / compass). */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="flex h-[34px] items-center gap-1.5 rounded-full border border-black/[0.06] bg-cream px-4 text-xs font-medium text-black/55">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden /> Augsburg
            </span>
            <span className="flex h-[34px] items-center gap-1.5 rounded-full border border-black/[0.06] bg-cream px-4 text-xs font-medium text-black/55">
              <Sun className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden /> 0 day streak
            </span>
            <span className="flex h-[34px] items-center gap-1.5 rounded-full border border-black/[0.06] bg-cream px-4 text-xs font-medium text-black/55">
              <Heart className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden /> Explorer
            </span>
          </div>

          {/* Saved places — the live's dark button into /favourites
              (heart icon + the bare label, no count). */}
          <Link
            href="/favourites"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Heart className="h-4 w-4" strokeWidth={2} aria-hidden />
            Saved places
          </Link>
        </section>

        {/* Bookings card — the live's session-12 glass panel (rounded-32,
            mt-8): Trips eyebrow, the 36px "My bookings" h2 + count,
            FULL-WIDTH tab pair, the category filter chips, empty state. */}
        <section className="mt-8 rounded-[32px] border border-white/70 bg-white/78 p-5 shadow-[0_14px_34px_rgba(14,14,14,0.1)] sm:p-8">
          <p className={EYEBROW}>Trips</p>
          <div className="mt-3 flex items-baseline justify-between">
            <h2 className="font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-ink">
              My bookings
            </h2>
            <span className="text-xs font-semibold text-[#555550]">{bookings.length}</span>
          </div>

          {/* Session-12: the Upcoming/Past pair is FULL-WIDTH — one 44px
              12px pill per half (the live's 411×44 tabs). */}
          <div className="mt-6 grid grid-cols-2 gap-2" role="tablist" aria-label="Booking filters">
            {(
              [
                ["upcoming", `Upcoming (${upcoming.length})`],
                ["past", `Past (${past.length})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-full text-xs font-semibold transition",
                  tab === value
                    ? "bg-white text-ink shadow-[0_6px_16px_rgba(14,14,14,0.1)]"
                    : "text-[#555550] hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* The All/Eat/Stay/Do category chips (38px/12px, live's compact
              set). */}
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
                  "flex h-[38px] items-center gap-1.5 rounded-full px-4 text-xs font-semibold capitalize transition",
                  cat === value
                    ? "bg-ink text-white"
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
            <div className="mt-6 flex flex-col items-center rounded-[26px] border border-black/[0.06] bg-white px-5 py-8 text-center">
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
