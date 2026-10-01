// The identity seam (v2.21) — how a session renders its identity surfaces.
//
// The live's identity contract is STATE-DEPENDENT (re-measured 2026-10-01,
// after the live went OPEN — anonymous visitors now browse every page):
//
//   AUTHENTICATED (the demo account): profile h1 = the account name
//     ("sepnetflix2023"), the 16px subtitle = the account EMAIL, and the
//     desktop navbar avatar = the email-derived INITIAL ("S") on the black
//     36×36 disc — exactly the v2.20 contract, unchanged.
//
//   ANONYMOUS (the live's logged-out state): profile h1 = "Explorer", the
//     subtitle = the STATIC "Your Roam account" line (no address), and the
//     desktop navbar avatar = the white 17px stroke-2 lucide-user glyph on
//     the same black disc. The live's anonymous state is read-only (heart
//     taps do not persist); the clone's guest ACCOUNT carries the anonymous
//     look while keeping favourites/bookings working — the documented
//     deliberate divergence.
//
// The clone's GUEST ACCOUNT (guest@roam.local — see src/lib/guest.ts, the
// login-free bootstrap) IS its anonymous state: every fresh visit is signed
// in as the guest. So the guest renders the live's ANONYMOUS contract, and
// every real account renders the AUTHENTICATED one. This module is the
// single decision point.
//
// PURITY + CLIENT SAFETY: the Navbar and ProfileView are CLIENT components,
// and src/lib/guest.ts imports node:crypto — so the seam lives HERE, with
// zero imports, and guest.ts re-exports the constants (single source of
// truth, no server code in the browser bundle). Pinned by
// tests/identity.test.ts; the surfaces are pinned by the guest/auth E2E
// specs and the mobile-navigation avatar spec.

export const GUEST_EMAIL = "guest@roam.local";

/** The live's ANONYMOUS default identity — what the guest account renders. */
export const GUEST_NAME = "Explorer";

/** The live's static anonymous profile subtitle (measured 2026-10-01). */
export const ANON_PROFILE_SUBTITLE = "Your Roam account";

/**
 * Does this session email belong to the shared guest (anonymous) account?
 * Case- and whitespace-insensitive — a defensive trim the live's own email
 * comparison does not need (its anonymous state has no email at all).
 */
export function isGuestEmail(email: string): boolean {
  return email.trim().toLowerCase() === GUEST_EMAIL;
}

/**
 * The 16px #555550 profile subtitle line: the STATIC anonymous line for the
 * guest, the account email for every real (authenticated) session.
 */
export function profileSubtitle(email: string): string {
  return isGuestEmail(email) ? ANON_PROFILE_SUBTITLE : email;
}

/**
 * Which glyph does the DESKTOP navbar avatar disc carry? The guest renders
 * the white 17px stroke-2 lucide-user icon (the live's anonymous avatar);
 * real accounts render the email-derived initial ("S"). The MOBILE tab-bar
 * user icon is the 18px stroke-2 glyph for everyone — no seam there.
 */
export function avatarIsIcon(email: string): boolean {
  return isGuestEmail(email);
}
