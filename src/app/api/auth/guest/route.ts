import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySessionToken } from "@/lib/auth";
import { ensureGuestUser, sanitizeNextPath } from "@/lib/guest";

export const dynamic = "force-dynamic";

// Guest bootstrap (login-free first visit): the (app)/(bare) layouts redirect
// session-less visitors here; this handler provisions/uses the seeded guest
// account, signs the ordinary roam_session cookie (7-day TTL), and 303s back
// to the SANITISED next path (default "/" — see sanitizeNextPath for the
// open-redirect / loop guards, pinned by tests/guest.test.ts).
//
// Deliberately NOT rate-limited: there are no credentials to brute-force, and
// once the guest row exists the work is one indexed findUnique + one HMAC
// sign — the same order as any page render.

export async function GET(req: NextRequest) {
  const next = sanitizeNextPath(req.nextUrl.searchParams.get("next"));

  // An existing valid session (demo or guest) is never clobbered — hitting
  // the bootstrap while signed in just routes onward.
  if (verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return seeOther(next);
  }

  const guest = await ensureGuestUser(db.user);
  const res = seeOther(next);
  res.cookies.set(
    SESSION_COOKIE,
    signSession({ uid: guest.id, email: guest.email, name: guest.name }),
    sessionCookieOptions(),
  );
  return res;
}

/**
 * A 303 whose Location is a RELATIVE reference (HTTP spec: RFC 9110 §10.2.2 —
 * a URI-reference the CLIENT resolves against the origin it is browsing).
 * The bootstrap used to synthesise an absolute URL from req.nextUrl.origin,
 * which a reverse proxy forwarding `Host: localhost:3000` alongside
 * `X-Forwarded-Proto: https` turned into `https://localhost:3000` on the
 * live deployment — bouncing the public site's visitors onto the origin
 * box's localhost (the layout gates' relative 307 worked fine through the
 * same proxy). A relative Location keeps the visitor on whichever origin
 * they are actually browsing — localhost dev, a preview URL, or the public
 * site — with zero configuration. NextResponse.redirect() demands an
 * absolute URL, hence the hand-rolled response; `next` is always
 * sanitizeNextPath output (a local absolute path — no "//", "/\", control
 * chars), so it is safe to emit verbatim.
 */
function seeOther(next: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: next } });
}
