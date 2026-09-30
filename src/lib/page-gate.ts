// Page-level session gate (v2.18 — deep-link-preserving guest bootstrap).
//
// History: the (app)/(bare) LAYOUTS used to redirect session-less visitors to
// the bootstrap without a next param, so every fresh deep link (a shared
// /place/x URL, a bookmarked /eat, /profile itself) bounced to "/" — the
// visitor's destination was lost (the live source preserves logged-out deep
// links; pinned by tests/e2e/guest.spec.ts). A layout CANNOT learn the
// request path (verified empirically: headers() exposes only proxy headers
// and layouts receive no pathname), while every PAGE knows its own path —
// so the gate moved one level down:
//
//   page (no session) → 307 /api/auth/guest?next=<this page's path>
//   handler: ensureGuestUser → sign roam_session → Set-Cookie → 303 <next>
//
// The layouts are now chrome-only: they resolve the session for the Navbar
// (rendering it only when a user exists — the parallel-render window before
// the page's 307 aborts the response) and no longer redirect.
//
// requireUser lives here — NOT in guest.ts — so next/navigation's redirect
// import never touches the pure, unit-tested guest module. The return type
// is non-null, which lets the pages drop their `user!` assertions: the gate
// guarantees the session for everything below it.
//
// Unguarded-page safety: a future page that forgets requireUser fails LOUDLY
// (its own user!.uid / user?.uid code paths surface the null session as a
// 500 or a visible logged-out shell), never silently — and every route's
// cookie-less deep-link behavior is pinned by the E2E corpus.

import { redirect } from "next/navigation";
import { getSessionUser, type SessionPayload } from "@/lib/auth";
import { guestBootstrapUrl } from "@/lib/guest";

/**
 * Resolve the session for an authenticated page, or 307 the session-less
 * visitor through the guest bootstrap with the page's own path as next —
 * the deep link survives the login-free first visit. Always returns a user
 * on the code path that continues.
 */
export async function requireUser(next: string): Promise<SessionPayload> {
  const user = await getSessionUser();
  if (!user) redirect(guestBootstrapUrl(next));
  return user;
}
