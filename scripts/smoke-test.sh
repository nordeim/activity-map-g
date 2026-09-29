#!/usr/bin/env bash
# ROAM (Augsburg City Guide) end-to-end API smoke test.
# Boots the production Next.js server, exercises auth + places +
# favourites + bookings, prints PASS/FAIL per step, cleans up, exits
# non-zero on any failure.
set -u
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

BASE="http://localhost:3000"
CJ="/tmp/roam-smoke-cookies.txt"
PASS=0; FAIL=0

say() { printf '%s\n' "$*"; }
ok()  { PASS=$((PASS+1)); say "PASS: $*"; }
bad() { FAIL=$((FAIL+1)); say "FAIL: $*"; }

# ---- 0. clean slate: kill any server holding port 3000 ----
# `next start` renames its worker process to `next-server (vX.Y.Z)`, so the
# plain "next start" pkill pattern MISSES it — an orphan holding :3000 with
# a spent in-memory rate limiter then fails the next run with phantom
# 429/401s (the session-6 stale-server lesson, npm-runtime edition). Kill
# by PORT via ss instead (lsof is blind in some sandboxes); precise, and it
# catches both process names.
kill_port() {
  ss -tlnp 2>/dev/null | awk -v p=":$1" 'index($4, p"\t") > 0 || $4 ~ p"$"' \
    | grep -oP 'pid=\K[0-9]+' | sort -u | xargs -r -n1 kill 2>/dev/null
  return 0
}
kill_port 3000
pkill -f "next start" 2>/dev/null || true
sleep 1
rm -f "$CJ" /tmp/smoke-*.json

# ---- 1. boot server ----
# DATABASE_URL is pinned explicitly so a stray parent-directory .env can
# never hijack the resolution (the repo's own .env default is the same).
DATABASE_URL="file:../db/custom.db" AUTH_SECRET="smoke-test-secret" \
  npx next start -p 3000 > /tmp/smoke-server.log 2>&1 < /dev/null &
SRV=$!
disown $SRV 2>/dev/null || true

ready=0
for i in $(seq 1 30); do
  if curl -s --max-time 2 "$BASE/api/health" | grep -q '"ok"'; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != "1" ]; then
  bad "server did not become ready"; kill_port 3000; kill $SRV 2>/dev/null; exit 1
fi
ok "server ready (health check)"

# ---- 2. login ----
code=$(curl -s -o /tmp/smoke-login.json -w "%{http_code}" --max-time 10 \
  -c "$CJ" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"sepnetflix2023@outlook.com","password":"$Abcd1234"}')
if [ "$code" = "200" ] && grep -q '"ok":true' /tmp/smoke-login.json; then ok "login (200)"; else bad "login -> $code $(cat /tmp/smoke-login.json)"; fi

# ---- 3. wrong password must be rejected ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"sepnetflix2023@outlook.com","password":"WrongPassword!"}')
if [ "$code" = "401" ]; then ok "wrong password rejected (401)"; else bad "wrong password -> $code"; fi

# ---- 4. unauthenticated access must be 401 ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/places")
if [ "$code" = "401" ]; then ok "unauthenticated places blocked (401)"; else bad "unauth places -> $code"; fi

# ---- 5. reads ----
for ep in "places" "places?category=stay" "places/courtyard-stay" "favourites" "bookings" "auth/me"; do
  code=$(curl -s -o "/tmp/smoke-$(echo $ep | tr '/?=' '___').json" -w "%{http_code}" --max-time 10 -b "$CJ" "$BASE/api/$ep")
  if [ "$code" = "200" ] && grep -q '"ok":true' "/tmp/smoke-$(echo $ep | tr '/?=' '___').json"; then ok "GET /api/$ep"; else bad "GET /api/$ep -> $code"; fi
done

# ---- 6. category filter returns the seeded counts ----
if python3 -c "import json,sys; d=json.load(open('/tmp/smoke-places_category_stay.json')); sys.exit(0 if len(d['data']['places'])==12 else 1)"; then
  ok "GET /api/places?category=stay returns 12 stays"
else
  bad "category filter count mismatch"
fi

PLACE_ID=$(python3 -c "import json;print(json.load(open('/tmp/smoke-places.json'))['data']['places'][0]['id'])")

# ---- 7. save a favourite ----
code=$(curl -s -o /tmp/smoke-fav.json -w "%{http_code}" --max-time 10 -b "$CJ" \
  -X POST "$BASE/api/favourites" -H "Content-Type: application/json" \
  -d "{\"placeId\":\"$PLACE_ID\"}")
if [ "$code" = "201" ] && grep -q '"ok":true' /tmp/smoke-fav.json; then ok "save favourite (201)"; else bad "save favourite -> $code $(cat /tmp/smoke-fav.json)"; fi

# ---- 8. favourites list carries it ----
if python3 -c "import json,sys; d=json.load(open('/tmp/smoke-places.json')); sys.exit(0)"; then
  curl -s --max-time 10 -b "$CJ" "$BASE/api/favourites" -o /tmp/smoke-favlist.json
  if python3 -c "import json,sys; d=json.load(open('/tmp/smoke-favlist.json')); sys.exit(0 if any(p['id']=='$PLACE_ID' for p in d['data']['places']) else 1)"; then
    ok "favourites list contains the saved place"
  else
    bad "favourites list missing the saved place"
  fi
fi

# ---- 9. booking: happy path + date-order validation ----
code=$(curl -s -o /tmp/smoke-booking.json -w "%{http_code}" --max-time 10 -b "$CJ" \
  -X POST "$BASE/api/bookings" -H "Content-Type: application/json" \
  -d "{\"placeId\":\"$PLACE_ID\",\"startDate\":\"2026-10-01\",\"endDate\":\"2026-10-03\",\"guests\":2}")
if [ "$code" = "201" ] && grep -q '"ok":true' /tmp/smoke-booking.json; then ok "create booking (201)"; else bad "create booking -> $code $(cat /tmp/smoke-booking.json)"; fi

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" \
  -X POST "$BASE/api/bookings" -H "Content-Type: application/json" \
  -d "{\"placeId\":\"$PLACE_ID\",\"startDate\":\"2026-10-05\",\"endDate\":\"2026-10-01\"}")
if [ "$code" = "400" ]; then ok "checkout-before-checkin rejected (400)"; else bad "bad date order -> $code"; fi

# ---- 10. remove the favourite ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" \
  -X DELETE "$BASE/api/favourites" -H "Content-Type: application/json" \
  -d "{\"placeId\":\"$PLACE_ID\"}")
if [ "$code" = "200" ]; then ok "remove favourite (200)"; else bad "remove favourite -> $code"; fi

# ---- 11. logout ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" -c "$CJ" -X POST "$BASE/api/auth/logout")
if [ "$code" = "200" ]; then ok "logout (200)"; else bad "logout -> $code"; fi

# ---- 12. session cookie invalidated after logout ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" "$BASE/api/places")
if [ "$code" = "401" ]; then ok "post-logout places blocked (401)"; else bad "post-logout places -> $code"; fi

# ---- 13. page render ----
code=$(curl -s -o /tmp/smoke-page.html -w "%{http_code}" --max-time 15 "$BASE/login")
if [ "$code" = "200" ] && grep -q "<!DOCTYPE html" /tmp/smoke-page.html; then ok "login page renders (200)"; else bad "login page -> $code"; fi

# ---- 14. authenticated app routes redirect to /login when signed out ----
for path in eat stay do map favourites profile; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/$path")
  if [ "$code" = "307" ] || [ "$code" = "302" ]; then ok "GET /$path redirects signed-out users"; else bad "GET /$path -> $code (expected 307/302)"; fi
done
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/not-a-real-page")
if [ "$code" = "404" ]; then ok "unknown path 404s"; else bad "unknown path -> $code"; fi

# ---- 15. rate limiting on /api/auth/login (10 attempts / 15 min / IP) ----
# Steps 2, 3 and 15 consumed 2 attempts; 9 more reach the limit, so a
# later attempt must answer 429 RATE_LIMITED with a Retry-After header.
limited=0
for i in $(seq 1 9); do
  code=$(curl -s -o /tmp/smoke-rl.json -w "%{http_code}" --max-time 10 \
    -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"sepnetflix2023@outlook.com","password":"WrongPassword!"}')
  if [ "$code" = "429" ]; then limited=$((limited+1)); fi
done
if [ "$limited" -ge 1 ] && grep -q 'RATE_LIMITED' /tmp/smoke-rl.json; then
  ok "login rate limit engages (429 RATE_LIMITED)"
else
  bad "rate limit -> last code $code $(cat /tmp/smoke-rl.json)"
fi

# ---- shutdown ----
# Kill the npx wrapper AND the next-server child holding :3000 (killing
# $SRV alone orphans the renamed worker — see the clean-slate note above).
kill $SRV 2>/dev/null
kill_port 3000
say ""
say "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
