import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    // v2.21: the live's tab-title format, re-measured 2026-10-01 on every
    // route — the home page renders the bare app name "Activity Map", and
    // every subpage renders "<Short> | Activity Map" (the map page is
    // "Discover | Activity Map"; the place detail is "Place Page |
    // Activity Map" — the live never puts the place name in the tab). The
    // legal pages already used this format; the old "ROAM — Augsburg City
    // Guide" / "X · ROAM" branding is retired.
    default: "Activity Map",
    template: "%s | Activity Map",
  },
  description:
    "Augsburg restaurants, hotels and experiences in one calm guide. Plan a trip, browse the city, and plot everything on the map.",
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#571AFF" stroke-width="2.4" stroke-linecap="round"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8"/></svg>',
          ),
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F7F4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The live app (session 3) loads Libre Baskerville + Inter only —
            Poppins was removed after session 2. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
