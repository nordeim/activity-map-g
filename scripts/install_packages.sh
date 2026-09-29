#!/usr/bin/env bash
# Install the exact dependency set from package.json (session-35 alignment).
# Runtime deps + dev deps in one pass; the npm CLI keeps package-lock.json
# authoritative — never hand-edit it.
set -euo pipefail
cd "$(dirname "$0")/.."

npm install \
  @prisma/client class-variance-authority clsx leaflet lucide-react next \
  prisma react react-dom react-leaflet tailwind-merge tailwindcss-animate \
  tsx tw-animate-css zustand \
  @playwright/test @tailwindcss/postcss @types/leaflet @types/node \
  @types/react @types/react-dom eslint eslint-config-next postcss \
  tailwindcss typescript vitest

npx prisma generate
