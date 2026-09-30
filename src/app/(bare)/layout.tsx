import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { GUEST_BOOTSTRAP_PATH } from "@/lib/guest";

// The BARE layout (session-16): the live app renders /profile WITHOUT the
// global chrome — no navbar at any breakpoint and no footer; the only
// controls are the page's own floating Back + Sign out buttons. This route
// group therefore re-implements ONLY the auth gate from the (app) layout
// (server-side session resolution + the guest-bootstrap redirect for
// session-less visitors) and deliberately omits the Navbar and the
// SiteFooter. Every other authenticated surface stays in the (app) group
// with the full chrome.
export default async function BareLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect(GUEST_BOOTSTRAP_PATH);

  return <div className="min-h-dvh bg-cream">{children}</div>;
}
