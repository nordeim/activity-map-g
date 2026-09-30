import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { GUEST_BOOTSTRAP_PATH } from "@/lib/guest";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Login-free first visit: session-less visitors are bounced through the
  // guest bootstrap (which provisions/uses the seeded guest account and
  // signs the session cookie) instead of the old /login wall. /login stays
  // reachable for the demo account; it is just no longer forced.
  const user = await getSessionUser();
  if (!user) redirect(GUEST_BOOTSTRAP_PATH);

  return (
    <div className="min-h-dvh bg-cream">
      {/* Session-12: the avatar disc initial derives from the EMAIL (the
          live shows "S" for sepnetflix… while the profile h1 shows the
          account NAME "Explorer") — so the navbar receives the email. */}
      <Navbar userEmail={user.email} />
      {children}
      <SiteFooter />
    </div>
  );
}
