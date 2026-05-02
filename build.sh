#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  boulty-v1 Local Stack Builder"
echo "=========================================="

# ── Python venv ──
if [ ! -d ".venv" ]; then
  echo "[1/4] Creating Python venv..."
  python3 -m venv .venv
fi
echo "[1/6] Installing Python deps..."
.venv/bin/pip install -q -r requirements.txt

# (Mosquitto installation block removed since we use public HiveMQ)

# ── PostgreSQL ──
echo "[3/6] Starting PostgreSQL and running migrations..."
if [ ! -d ".pgdata" ]; then
  echo "  Initializing local database cluster in .pgdata..."
  initdb -D .pgdata
fi

# Only try to start if it isn't already running
if ! pg_ctl -D .pgdata status > /dev/null 2>&1; then
  pg_ctl -D .pgdata -l /tmp/boulty_pg.log -o "-p 5435" start > /dev/null 2>&1 || true
  sleep 2
fi

createuser -p 5435 -s boulty 2>/dev/null || true
createdb -p 5435 -O boulty boulty_db 2>/dev/null || true
.venv/bin/alembic upgrade head

# ── FastAPI backend ──
echo "[4/6] Starting FastAPI on :8000..."
pkill -f "uvicorn backend.main:app" 2>/dev/null || true
sleep 1
PYTHONPATH="$SCRIPT_DIR" .venv/bin/uvicorn backend.main:app \
  --host 0.0.0.0 --port 8000 --log-level info \
  > /tmp/boulty_fastapi.log 2>&1 &
echo $! > /tmp/boulty_fastapi.pid
echo "  FastAPI PID: $!"
sleep 2

# ── Nginx ──
echo "[5/6] Setting up Nginx on :8080..."

# Nginx cannot handle spaces in 'root' directive — create a symlink to a clean path
ln -sfn "$SCRIPT_DIR/frontend" /tmp/boulty_frontend

# Generate nginx config using the symlinked path
sed "s|FRONTEND_PATH|/tmp/boulty_frontend|g" "$SCRIPT_DIR/nginx/nginx.conf" > /tmp/boulty_nginx.conf
echo "  Nginx config written with root: /tmp/boulty_frontend"

# Kill any existing boulty nginx
pkill -f "nginx.*boulty_nginx.conf" 2>/dev/null || true
sleep 1
/usr/local/bin/nginx -c /tmp/boulty_nginx.conf
echo "  Nginx started on :8080"

# ── Open browser ──
echo "[6/6] Opening browser..."
sleep 1
open "http://localhost:8080" 2>/dev/null || true

echo ""
echo "✅ boulty-v1 is running!"
echo "   Web UI   → http://localhost:8080"
echo "   FastAPI  → http://localhost:8000"
echo "   API Docs → http://localhost:8000/docs"
echo "   PubSub   → Public HiveMQ Cloud Broker (broker.hivemq.com)"
echo ""
echo "   Logs:"
echo "     FastAPI: tail -f /tmp/boulty_fastapi.log"
echo "     Nginx:   tail -f /tmp/boulty_nginx_access.log"
echo ""
echo "   Run 'bash stop.sh' to stop all services."
