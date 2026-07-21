#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
BACKEND_PORT="${BACKEND_PORT:-3075}"
FRONTEND_PORT="${FRONTEND_PORT:-3074}"
[[ -d backend/node_modules ]] || { echo "Missing backend/node_modules; install dependencies explicitly first." >&2; exit 1; }
if [[ "${NODE_ENV:-}" == "test" ]]; then
  exec npm --prefix backend start
fi
[[ -d frontend/node_modules ]] || { echo "Missing frontend/node_modules; install dependencies explicitly first." >&2; exit 1; }
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is already in use; refusing to stop another process." >&2; exit 1; fi
done
(cd backend && npm start) & BACKEND_PID=$!
(cd frontend && BROWSER=none PORT="$FRONTEND_PORT" npm start) & FRONTEND_PID=$!
cleanup() { kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
echo "Family Office API: http://127.0.0.1:$BACKEND_PORT; UI: http://127.0.0.1:$FRONTEND_PORT"
wait "$BACKEND_PID" "$FRONTEND_PID"
