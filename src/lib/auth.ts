// Authentication: scrypt password hashing + HMAC-signed session cookies.
//
// Sessions are stateless: the cookie carries { uid, email, name, exp } plus
// an HMAC-SHA256 signature keyed by AUTH_SECRET (env; falls back to an
// insecure dev-only constant when unset — see .env.example). Tampering with
// the payload invalidates the signature; expired payloads are rejected.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "roam_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  return process.env.AUTH_SECRET || "insecure-dev-secret-change-me";
}

// ---- Passwords ------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

// ---- Session tokens --------------------------------------------------------

export interface SessionPayload {
  uid: string;
  email: string;
  name: string;
  exp: number;
}

export function signSession(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---- Cookie helpers (server actions / route handlers) ----------------------

export const SESSION_COOKIE = COOKIE_NAME;

/**
 * Secure cookies require HTTPS. An HTTP preview (localhost, sandbox
 * `next start`) must keep the flag off even when NODE_ENV=production,
 * otherwise the session cookie is silently dropped and login never sticks.
 */
export function cookieSecureFlag(
  nodeEnv = process.env.NODE_ENV,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): boolean {
  const origin = (siteUrl ?? "").trim();
  if (origin.startsWith("https://")) return true;
  if (origin.startsWith("http://")) return false;
  return nodeEnv === "production";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecureFlag(),
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

/** Read the current session from the request cookies (RSC / route handler). */
export async function getSessionUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}
