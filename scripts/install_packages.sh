#!/usr/bin/env bash
# Install the exact dependency set from package.json (session-36 alignment:
# zustand / tailwindcss-animate / class-variance-authority removed — zero src
# imports; deepmerge-ts pinned to ^8.0.2 via npm overrides to clear
# GHSA-ggr8-5vv4-36mx in the prisma CLI chain).
# Runtime deps + dev deps in one pass; the npm CLI keeps package-lock.json
# authoritative — never hand-edit it.
set -euo pipefail
cd "$(dirname "$0")/.."

npm install \
  @prisma/client clsx leaflet lucide-react next \
  prisma react react-dom react-leaflet tailwind-merge \
  tsx tw-animate-css \
  @playwright/test @tailwindcss/postcss @types/leaflet @types/node \
  @types/react @types/react-dom eslint eslint-config-next postcss \
  tailwindcss typescript vitest

npx prisma generate
