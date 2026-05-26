#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  boulty-v1 Local Stack Builder"
echo "=========================================="

# ── Load environment config ──
if [ -f "env/.env" ]; then
  echo "[0/6] Loading environment from env/.env..."
  set -a
  source env/.env
  set +a
else
  echo "⚠️  env/.env not found! Copy env/.env.example to env/.env"
  echo "   cp env/.env.example env/.env"
  exit 1
fi

# ── Python venv ──
if [ ! -d ".venv" ]; then
  echo "[1/6] Creating Python venv..."
  python3 -m venv .venv
fi
echo "[1/6] Installing Python deps..."
.venv/bin/pip install -q -r requirements.txt

# (PubSub installation block removed since we use public HiveMQ)

# ── PostgreSQL ──
echo "[3/6] Starting PostgreSQL and running migrations..."
if [ ! -d ".pgdata" ]; then
  echo "  Initializing local database cluster in .pgdata..."
  initdb -D .pgdata
fi

# Only try to start if it isn't already running
if ! pg_ctl -D .pgdata status > /dev/null 2>&1; then
  pg_ctl -D .pgdata -l /tmp/boulty_pg.log -o "-p ${POSTGRES_PORT}" start > /dev/null 2>&1 || true
  sleep 2
fi

createuser -p "${POSTGRES_PORT}" -s "${POSTGRES_USER}" 2>/dev/null || true
createdb -p "${POSTGRES_PORT}" -O "${POSTGRES_USER}" "${POSTGRES_DB}" 2>/dev/null || true
.venv/bin/alembic upgrade head

# ── FastAPI backend ──
echo "[4/6] Starting FastAPI on :${FASTAPI_PORT}..."
pkill -f "uvicorn backend.main:app" 2>/dev/null || true
sleep 1
PYTHONPATH="$SCRIPT_DIR" .venv/bin/uvicorn backend.main:app \
  --host "${FASTAPI_HOST}" --port "${FASTAPI_PORT}" --log-level "${LOG_LEVEL}" \
  > /tmp/boulty_fastapi.log 2>&1 &
echo $! > /tmp/boulty_fastapi.pid
echo "  FastAPI PID: $!"
sleep 2

# ── Nginx ──
echo "[5/6] Setting up Nginx on :${NGINX_PORT}..."

# Nginx cannot handle spaces in 'root' directive — create a symlink to a clean path
ln -sfn "$SCRIPT_DIR/frontend" /tmp/boulty_frontend

# Generate nginx config using the symlinked path
sed "s|FRONTEND_PATH|/tmp/boulty_frontend|g" "$SCRIPT_DIR/nginx/nginx.conf" > /tmp/boulty_nginx.conf
echo "  Nginx config written with root: /tmp/boulty_frontend"

# Kill any existing boulty nginx
pkill -f "nginx.*boulty_nginx.conf" 2>/dev/null || true
sleep 1
/usr/local/bin/nginx -c /tmp/boulty_nginx.conf
echo "  Nginx started on :${NGINX_PORT}"

# ── Open browser ──
echo "[6/6] Opening browser..."
sleep 1
open "http://localhost:${NGINX_PORT}" 2>/dev/null || true

echo ""
echo "✅ boulty-v1 is running!"
echo "   Web UI   → http://localhost:${NGINX_PORT}"
echo "   FastAPI  → http://localhost:${FASTAPI_PORT}"
echo "   API Docs → http://localhost:${FASTAPI_PORT}/docs"
echo "   PubSub   → ${MQTT_BROKER_HOST}:${MQTT_BROKER_PORT}"
echo ""
echo "   Logs:"
echo "     FastAPI: tail -f /tmp/boulty_fastapi.log"
echo "     Nginx:   tail -f /tmp/boulty_nginx_access.log"
echo ""
echo "   Config:  env/.env"
echo "   Run 'bash stop.sh' to stop all services."
