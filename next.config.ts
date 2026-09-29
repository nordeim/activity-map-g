import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production `next start` (npm run start / Playwright webServer). Prisma's
  // SQLite engine must stay external so the query binary is not bundled away.
  serverExternalPackages: ["@prisma/client", "prisma"],
  reactStrictMode: true,
  poweredByHeader: false,
  // Remote place imagery is served by the reference app's media CDN.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.base44.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
