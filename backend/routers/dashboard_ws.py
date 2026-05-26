"""
dashboard_ws.py — WebSocket endpoint for real-time dashboard updates.

Pushes backend health + Nginx networking stats every 5 seconds to all
connected browser clients, eliminating the need for HTTP polling.
"""
import asyncio
import json
import logging
import time
from typing import Set, Optional

import httpx
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from backend.core.config import settings

router = APIRouter(tags=["dashboard-ws"])
logger = logging.getLogger("dashboard_ws")


# ── Response Schemas for API Documentation ──────────────────────────────────
class BackendStats(BaseModel):
    status: str = Field(..., description="Status of the backend ('ok' or 'error')")
    uptime_human: str = Field(..., description="Human-readable uptime duration")
    version: str = Field(..., description="Application version")
    items_count: Optional[int] = Field(None, description="Total number of items in the database")

class NetworkingStats(BaseModel):
    nginx_ok: bool = Field(..., description="Whether Nginx is reachable and healthy")
    latency_ms: int = Field(..., description="Latency to Nginx in milliseconds (-1 if error)")
    x_process_time: str = Field(..., description="Process time response header value")
    x_server: str = Field(..., description="Server software name (usually 'nginx')")

class DashboardWSMessage(BaseModel):
    type: str = Field("dashboard_update", description="Type of message ('dashboard_update')")
    timestamp: float = Field(..., description="Unix timestamp of when the stats were collected")
    backend: BackendStats
    networking: NetworkingStats

class WebSocketInfoResponse(BaseModel):
    message: str = Field(..., description="Helpful message explaining how to connect")
    websocket_url_nginx: str = Field(..., description="WebSocket URL when connecting through Nginx reverse proxy")
    websocket_url_direct: str = Field(..., description="WebSocket URL when connecting directly to FastAPI")
    expected_message_schema: DashboardWSMessage = Field(..., description="The schema of the messages pushed by the WebSocket every 5 seconds")


# ── HTTP GET endpoint (docs and helper info) ──────────────────────────────────
@router.get("/ws/dashboard", response_model=WebSocketInfoResponse)
async def dashboard_ws_info(request: Request):
    """
    Get WebSocket connection details and payload schemas.
    
    If accessed via HTTP GET (e.g., via Curl, browser, or Swagger UI), this returns
    instructions on how to establish a WebSocket connection and the exact JSON schema
    of the real-time messages pushed by the server.
    """
    host = request.headers.get("host", f"localhost:{settings.FASTAPI_PORT}")
    proto = "wss" if request.url.is_secure else "ws"
    
    websocket_url_current = f"{proto}://{host}/ws/dashboard"
    
    return WebSocketInfoResponse(
        message="This is a WebSocket endpoint. Please connect using a WebSocket client (e.g. ws:// or wss://).",
        websocket_url_nginx=f"ws://localhost:{settings.NGINX_PORT}/ws/dashboard",
        websocket_url_direct=websocket_url_current,
        expected_message_schema=DashboardWSMessage(
            type="dashboard_update",
            timestamp=time.time(),
            backend=BackendStats(
                status="ok",
                uptime_human="0h 5m 23s",
                version="1.0.0",
                items_count=42
            ),
            networking=NetworkingStats(
                nginx_ok=True,
                latency_ms=12,
                x_process_time="12ms",
                x_server="nginx"
            )
        )
    )


# ── Track all connected dashboard clients ──────────────────────────────────
_clients: Set[WebSocket] = set()
_push_task: asyncio.Task | None = None


# ── Helpers ────────────────────────────────────────────────────────────────
async def _build_payload() -> dict:
    """Collect all stats that were previously fetched by individual HTTP polls."""
    health_data = {}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"http://127.0.0.1:{settings.FASTAPI_PORT}/api/health", timeout=3)
            health_data = r.json()
    except Exception as e:
        health_data = {"status": "error", "error": str(e)}

    t_nginx = time.time()
    nginx_ok = False
    nginx_latency_ms = -1
    try:
        async with httpx.AsyncClient() as client:
            r2 = await client.get(f"http://127.0.0.1:{settings.NGINX_PORT}/nginx-health", timeout=3)
            nginx_latency_ms = round((time.time() - t_nginx) * 1000)
            nginx_ok = r2.status_code == 200
    except Exception:
        pass

    # Fetch item count
    items_count = None
    try:
        async with httpx.AsyncClient() as client:
            r3 = await client.get(f"http://127.0.0.1:{settings.FASTAPI_PORT}/api/demo/stats", timeout=3)
            d = r3.json()
            items_count = d.get("data", {}).get("items_count")
    except Exception:
        pass

    return {
        "type": "dashboard_update",
        "timestamp": time.time(),
        "backend": {
            "status": health_data.get("status", "error"),
            "uptime_human": health_data.get("uptime_human", "—"),
            "version": health_data.get("version", "—"),
            "items_count": items_count,
        },
        "networking": {
            "nginx_ok": nginx_ok,
            "latency_ms": nginx_latency_ms,
            "x_process_time": f"{nginx_latency_ms}ms" if nginx_ok else "—",
            "x_server": "nginx" if nginx_ok else "—",
        },
    }


async def _broadcast(payload: dict):
    """Send a JSON message to every connected client; drop dead ones."""
    dead: Set[WebSocket] = set()
    msg = json.dumps(payload)
    for ws in list(_clients):
        try:
            await ws.send_text(msg)
        except Exception:
            dead.add(ws)
    _clients.difference_update(dead)


async def _push_loop():
    """Background task: collect stats and broadcast every 5 seconds."""
    logger.info("📡 Dashboard WS push loop started")
    while True:
        if _clients:
            try:
                payload = await _build_payload()
                await _broadcast(payload)
            except Exception as e:
                logger.warning(f"Push loop error: {e}")
        await asyncio.sleep(5)


# ── WebSocket endpoint ─────────────────────────────────────────────────────
@router.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket):
    global _push_task
    await websocket.accept()
    _clients.add(websocket)
    logger.info(f"Dashboard WS client connected. Total: {len(_clients)}")

    # Start push loop singleton
    if _push_task is None or _push_task.done():
        _push_task = asyncio.create_task(_push_loop())

    # Send an immediate snapshot so the client doesn't wait 5s
    try:
        payload = await _build_payload()
        await websocket.send_text(json.dumps(payload))
    except Exception:
        pass

    try:
        # Keep the socket alive; wait for any client-sent messages (or close)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        _clients.discard(websocket)
        logger.info(f"Dashboard WS client disconnected. Total: {len(_clients)}")
