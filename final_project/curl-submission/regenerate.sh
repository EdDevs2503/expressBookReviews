#!/usr/bin/env bash
# Regenerates Option 1 (AI-graded) deliverables per lab-instructions.md:
# Tasks 1–9 + Task 14: named text files = first line curl command, then full terminal output.
# Task 13 (Option 1): public GitHub URL of general.js in file `generaljs-url` (lab does not name this file).
# Does not include session cookies (not a lab deliverable).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PORT="$(grep -E 'const\s+PORT\s*=' index.js | head -1 | sed -n 's/.*PORT\s*=\s*\([0-9][0-9]*\).*/\1/p')"
PORT="${PORT:-5001}"
B="http://localhost:${PORT}"

GITHUB_USER="${GITHUB_USER:-EdDevs2503}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

# Cookie jar path used in saved commands (run regenerate.sh from final_project, or adjust paths).
COOKIE_REL="./curl-submission/.lab-cookies"
COOKIE="$OUT/.lab-cookies"
rm -f "$COOKIE"
trap 'rm -f "$COOKIE"; lsof -ti :'"$PORT"' | xargs kill -9 2>/dev/null || true' EXIT

lsof -ti ":$PORT" | xargs kill -9 2>/dev/null || true
sleep 0.2
node index.js > /tmp/curl-lab-server.log 2>&1 &
sleep 1

U="labuser$(date +%s)"

# Lab sample: line 1 = curl command (no leading $), following lines = full output.
write_curl() {
  local name="$1"
  local cmd="$2"
  printf '%s\n' "$cmd" > "$OUT/$name"
  eval "$cmd" >> "$OUT/$name" 2>&1 || true
  printf '\n' >> "$OUT/$name"
}

write_curl getallbooks "curl -sS \"$B/\""
write_curl getbooksbyISBN "curl -sS \"$B/isbn/1\""
write_curl getbooksbyauthor "curl -sS -g \"$B/author/Chinua%20Achebe\""
write_curl getbooksbytitle "curl -sS -g \"$B/title/Things%20Fall%20Apart\""
write_curl getbookreview "curl -sS \"$B/review/1\""
write_curl register "curl -sS -X POST \"$B/register\" -H 'Content-Type: application/json' -d '{\"username\":\"$U\",\"password\":\"pwd12345\"}'"
write_curl login "curl -sS -c \"$COOKIE_REL\" -X POST \"$B/customer/login\" -H 'Content-Type: application/json' -d '{\"username\":\"$U\",\"password\":\"pwd12345\"}'"
# Task 8: review as query param; session cookie from login
write_curl reviewadded "curl -sS -b \"$COOKIE_REL\" -X PUT \"$B/customer/auth/review/1?review=Great%20book\" -H 'Content-Type: application/json' -d '{}'"
write_curl deletereview "curl -sS -b \"$COOKIE_REL\" -X DELETE \"$B/customer/auth/review/1\""

# Task 14 (exact command from lab, with username substituted)
{
  printf '%s\n' "curl -s https://api.github.com/repos/${GITHUB_USER}/expressBookReviews | jq '.parent.full_name'"
  curl -s "https://api.github.com/repos/${GITHUB_USER}/expressBookReviews" | jq '.parent.full_name' 2>&1
  printf '\n'
} > "$OUT/githubrepo"

# Task 13 Option 1: public GitHub URL to general.js (blob page)
printf '%s\n' "https://github.com/${GITHUB_USER}/expressBookReviews/blob/${GITHUB_BRANCH}/final_project/router/general.js" > "$OUT/generaljs-url"

rm -f "$OUT/session.cookies"
rm -f "$COOKIE"
echo "Wrote lab deliverables under $OUT (base URL $B). Re-run from final_project: ./curl-submission/regenerate.sh"
