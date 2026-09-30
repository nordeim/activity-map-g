// The BARE layout (session-16): the live app renders /profile WITHOUT the
// global chrome — no navbar at any breakpoint and no footer; the only
// controls are the page's own floating Back + Sign out buttons. This route
// group therefore provides only the chrome-less wrapper; the session gate
// (login-free guest bootstrap) lives in the page itself —
// (bare)/profile/page.tsx calls requireUser("/profile") — because a layout
// cannot learn the request path, and the page-level gate is what keeps deep
// links alive through the bootstrap (v2.18; see src/lib/page-gate.ts).
// Every other authenticated surface stays in the (app) group with the full
// chrome.
export default function BareLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-cream">{children}</div>;
}
