#!/usr/bin/env bash
# Session 4 screenshot refresh — 14 captures from the remediated dev server.
# Method (session-3 v2): viewport captures for 01–10, full-page home capture
# + PIL crop for the 11–14 section captures. Requires the dev server on :3000
# and an authenticated agent-browser session (login done before running).
set -euo pipefail

OUT="/home/z/my-project/activity-map/docs/screenshots"
TMP="/tmp/screens"
mkdir -p "$OUT" "$TMP"

# 01–08: desktop viewport captures (1280×800)
agent-browser set viewport 1280 800 > /dev/null

capture() { # path outfile wait_ms
  agent-browser open "http://localhost:3000$1" > /dev/null
  sleep "$3"
  agent-browser screenshot "$2" > /dev/null
  echo "captured $(basename "$2")"
}

capture "/"            "$TMP/01-home-highlights.png" 6
capture "/eat"         "$TMP/02-eat.png" 4
capture "/stay"        "$TMP/03-stay.png" 4
capture "/do"          "$TMP/04-do.png" 4
capture "/map"         "$TMP/05-map.png" 8
capture "/place/courtyard-stay" "$TMP/06-place-detail.png" 5
capture "/favourites"  "$TMP/07-favourites.png" 4
capture "/profile"     "$TMP/08-profile.png" 4

# 09–10: mobile viewport captures (390×844)
agent-browser set viewport 390 844 > /dev/null
capture "/"    "$TMP/09-mobile-home.png" 6
capture "/eat" "$TMP/10-mobile-eat.png" 4

# Full-page home capture at desktop for section cropping (11–14)
agent-browser set viewport 1280 800 > /dev/null
agent-browser open "http://localhost:3000/" > /dev/null
sleep 6
agent-browser screenshot --full "$TMP/home-full.png" > /dev/null
echo "captured home-full.png"

# Harvest the section rects for cropping (route/restaurants/stays/sights)
agent-browser eval 'JSON.stringify({
  route: document.querySelector("#recommended-route") ? document.getElementById("recommended-route").getBoundingClientRect().toJSON() : null,
  restaurants: document.querySelector("#highlighted-restaurants") ? document.getElementById("highlighted-restaurants").getBoundingClientRect().toJSON() : null,
  stays: document.querySelector("#stay-showcase") ? document.getElementById("stay-showcase").getBoundingClientRect().toJSON() : null,
  sights: document.querySelector("#highlighted-sights") ? document.getElementById("highlighted-sights").getBoundingClientRect().toJSON() : null,
  scrollY: window.scrollY, pageH: document.documentElement.scrollHeight
})' > /tmp/section-rects.json
echo "harvested section rects"

echo "RAW CAPTURES DONE"
