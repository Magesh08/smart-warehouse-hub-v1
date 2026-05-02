#!/usr/bin/env bash
echo "Stopping boulty-v1 services..."

# Stop FastAPI
if [ -f /tmp/boulty_fastapi.pid ]; then
  kill "$(cat /tmp/boulty_fastapi.pid)" 2>/dev/null && echo "  ✓ FastAPI stopped"
  rm -f /tmp/boulty_fastapi.pid
fi
pkill -f "uvicorn backend.main:app" 2>/dev/null || true

# Stop Nginx
nginx -c /tmp/boulty_nginx.conf -s stop 2>/dev/null || true
pkill -f "nginx.*boulty" 2>/dev/null && echo "  ✓ Nginx stopped"

# (Removed Mosquitto kill command since we use HiveMQ)

# Stop PostgreSQL
if [ -d ".pgdata" ]; then
  pg_ctl -D .pgdata stop 2>/dev/null && echo "  ✓ PostgreSQL stopped"
fi

echo "✅ All boulty-v1 services stopped."
