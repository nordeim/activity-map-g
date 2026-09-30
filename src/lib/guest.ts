// Guest bootstrap (login-free first visit).
//
// The (app) and (bare) layouts used to redirect("/login") every session-less
// visitor into the auth wall. The remediated contract: a FRESH visitor is
// transparently signed in as the seeded GUEST ACCOUNT instead — no login
// required — while /login stays reachable for the demo account (live-parity
// chrome, pinned by tests/e2e/auth.spec.ts).
//
// Server Components cannot set cookies and this repo deliberately ships NO
// middleware, so the bootstrap lives in a route handler:
//
//   layout (no session) → 307 GET /api/auth/guest
//   handler: ensureGuestUser → sign roam_session → Set-Cookie → 303 <next>
//
// The guest is ONE shared account (email guest@roam.local) — the
// "necessary seed data" for a fresh visit is the User row itself (favourites
// and bookings hang off it; the 78-place catalogue is global and already
// seeded). It is provisioned two ways, belt-and-braces:
//   1. prisma/seed.ts seeds it alongside the demo user;
//   2. ensureGuestUser() re-creates it on demand for legacy/un-seeded DBs —
//      idempotent and race-safe (upsert, not create) — see tests/guest.test.ts.
//
// The guest password is a RANDOM 256-bit secret hashed with the app-wide
// scrypt format whose plaintext is discarded at generation time: the account
// carries a valid passwordHash for the schema but can never be signed into
// through /api/auth/login. Guest sessions are ordinary HMAC roam_session
// cookies (7-day TTL), so every existing getSessionUser() consumer —
// favourites, bookings, profile, /api/auth/me — works unchanged.

import { randomBytes } from "node:crypto";
import { hashPassword } from "./auth";

export const GUEST_EMAIL = "guest@roam.local";
export const GUEST_NAME = "Guest";
export const GUEST_AVATAR_COLOR = "#996CE4"; // the schema's User default
export const GUEST_BOOTSTRAP_PATH = "/api/auth/guest";

export interface GuestUser {
  id: string;
  email: string;
  name: string;
}

/**
 * The minimal Prisma user-delegate surface ensureGuestUser needs, injected as
 * a parameter (the repo's pure-seam pattern — see src/lib/db-path.ts) so the
 * create-or-reuse logic is unit-testable without a SQLite file. `db.user`
 * satisfies this structurally.
 */
export interface GuestUserStore {
  findUnique(args: { where: { email: string } }): Promise<GuestUser | null>;
  upsert(args: {
    where: { email: string };
    create: { email: string; name: string; passwordHash: string; avatarColor: string };
    update: { [key: string]: never };
  }): Promise<GuestUser>;
}

/** A fresh, never-verifiable password hash for the guest account. */
export function hashGuestPassword(): string {
  return hashPassword(randomBytes(32).toString("hex"));
}

/**
 * Find-or-create the shared guest account. Idempotent; safe under
 * concurrency because the miss-path UPSERTs — the unique email turns a
 * racing second writer into an UPDATE that resolves to the first row.
 */
export async function ensureGuestUser(store: GuestUserStore): Promise<GuestUser> {
  const existing = await store.findUnique({ where: { email: GUEST_EMAIL } });
  if (existing) return existing;
  return store.upsert({
    where: { email: GUEST_EMAIL },
    create: {
      email: GUEST_EMAIL,
      name: GUEST_NAME,
      passwordHash: hashGuestPassword(),
      avatarColor: GUEST_AVATAR_COLOR,
    },
    update: {},
  });
}

/**
 * Sanitise the `?next=` redirect target of the guest bootstrap. Only LOCAL
 * ABSOLUTE paths are honoured ("/eat", "/place/x?tab=info"); everything else
 * falls back to "/":
 *   - no leading slash ("eat") or absolute URLs ("https://evil.example"),
 *   - protocol-relative ("//evil.example") and backslash ("/\\evil.example")
 *     open-redirect tricks,
 *   - embedded control characters (Location-header injection),
 *   - the guest bootstrap path ITSELF (a self-referencing next would loop
 *     layout → bootstrap → bootstrap → …).
 */
export function sanitizeNextPath(raw: string | null | undefined): string {
  const value = (raw ?? "").trim();
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (hasControlChars(value)) return "/";
  if (value.startsWith(GUEST_BOOTSTRAP_PATH)) return "/";
  return value;
}

/** True when the value carries an embedded C0/C1 control character. */
function hasControlChars(value: string): boolean {
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}
