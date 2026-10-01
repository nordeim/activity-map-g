import { LoginForm } from "@/components/auth/LoginForm";

// v2.21: /login renders the auth card for EVERYONE. The live's /login does
// not redirect authenticated visitors (measured signed-in: the path stays
// /login, the card renders) — the mirror's old bounce-to-/ was clone
// invention, removed. The page stays PUBLIC (no requireUser gate — a
// session-less visitor sees the card without bootstrapping), exactly like
// the live's login route; a signed-in visitor who submits the form simply
// re-signs (the POST sets a fresh session cookie and router.refresh()s).
export const metadata = {
  // The live's /login tab title is the bare app name (measured 2026-10-01,
  // authenticated and anonymous alike) — an ABSOLUTE title so the layout's
  // "%s | Activity Map" template does not append its suffix.
  title: { absolute: "Activity Map" },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 py-10">
      {/* Session-10 re-measure: the live login page is a PLAIN white page —
          no photographic wash, no gradient. The card is centered at
          max-w-[448px]. */}
      <div className="relative z-10 w-full max-w-[448px]">
        <LoginForm />
      </div>
    </main>
  );
}
