#!/usr/bin/env bash
# Session 27 screenshot additions + refresh — the remediated route-stop
# chrome (the time pill's shadow + hairline + PER-STOP category icon, the
# bordered link card, the lh-1.1 serif title, the map-pin meta row, the
# violet Learn More hover) and the responsive login fields (16px text-base
# inputs + h-11 button below sm). Requires the production server on :3000.
# NOTE: agent-browser 0.38.x renders BLANK element screenshots of the tall
# sticky route section — the element captures run through Playwright
# instead (scripts/capture-screens-v8-session27.mjs); the viewport-level
# refreshes (01) still run through agent-browser.
set -euo pipefail

OUT="/home/z/my-project/activity-map/docs/screenshots"
URL=http://localhost:3000
mkdir -p "$OUT"

# ---------- Refresh the affected viewport shots (agent-browser) ----------
agent-browser set viewport 1280 800 > /dev/null 2>&1
agent-browser open "$URL/" > /dev/null 2>&1
sleep 6
agent-browser screenshot "$OUT/01-home-highlights.png" > /dev/null 2>&1
echo "refreshed 01-home-highlights.png"

# ---------- Element captures (Playwright — see note above) ----------
node /home/z/my-project/activity-map/scripts/capture-screens-v8-session27.mjs

# ---------- Sanity: non-empty captures ----------
python3 - <<'PY'
from PIL import Image
import statistics, sys
ok = True
for name, min_std in [
    ("01-home-highlights.png", 20),
    ("11-home-route.png", 20),
    ("30-desktop-route-stop-chrome.png", 10),
    ("31-mobile-route-stop-chrome.png", 20),
    ("32-mobile-login-fields.png", 20),
    ("22-login-card.png", 20),
]:
    path = f"/home/z/my-project/activity-map/docs/screenshots/{name}"
    try:
        im = Image.open(path).convert("L")
        std = statistics.pstdev(im.getdata())
        status = "OK" if std >= min_std else "BLANK"
        print(f"{status} {name} std={std:.1f}")
        if std < min_std:
            ok = False
    except Exception as e:
        print(f"FAIL {name}: {e}")
        ok = False
sys.exit(0 if ok else 1)
PY

echo "SESSION-27 CAPTURES DONE"
