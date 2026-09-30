import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // v2.18: chrome-only layout. The session is resolved for the Navbar; the
  // PATH-AWARE guest-bootstrap gate lives in each page (requireUser(next) in
  // src/lib/page-gate.ts) because a layout cannot learn the request path —
  // the page-level gate is what keeps deep links alive through the
  // login-free first visit (pinned by tests/e2e/guest.spec.ts). A future
  // page in this group MUST call requireUser: the gate is the login-free
  // contract, and an ungated page fails loudly (its own user-dependent data
  // path surfaces the missing session), never silently.
  //
  // The Navbar renders only when a session resolves: during the brief
  // parallel-render window before a session-less page's 307 aborts the
  // response, user is null and no chrome is produced.
  const user = await getSessionUser();

  return (
    <div className="min-h-dvh bg-cream">
      {/* Session-12: the avatar disc initial derives from the EMAIL (the
          live shows "S" for sepnetflix… while the profile h1 shows the
          account NAME "Explorer") — so the navbar receives the email. */}
      {user ? <Navbar userEmail={user.email} /> : null}
      {children}
      <SiteFooter />
    </div>
  );
}
