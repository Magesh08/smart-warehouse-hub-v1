"""
warehouse_ws.py — WebSocket endpoint for real-time warehouse domain updates.
"""
import asyncio
import json
import logging
from typing import Set
import aiomqtt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.core.config import settings

router = APIRouter(tags=["warehouse-ws"])
logger = logging.getLogger("warehouse_ws")

_clients: Set[WebSocket] = set()
_mqtt_task: asyncio.Task | None = None


async def _mqtt_subscriber_loop():
    """Background task: listens to MQTT events on warehouse/# and forwards them to WS clients."""
    logger.info("📡 Warehouse WS MQTT subscriber loop started")
    while True:
        try:
            async with aiomqtt.Client(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT) as client:
                await client.subscribe("warehouse/#")
                async for message in client.messages:
                    payload_str = message.payload.decode("utf-8")
                    try:
                        payload = json.loads(payload_str)
                    except Exception:
                        payload = {"raw": payload_str}
                    
                    # Forward message to all active WebSocket clients
                    dead: Set[WebSocket] = set()
                    msg_str = json.dumps(payload)
                    for ws in list(_clients):
                        try:
                            await ws.send_text(msg_str)
                        except Exception:
                            dead.add(ws)
                    _clients.difference_update(dead)
        except Exception as e:
            logger.error(f"MQTT subscriber loop error: {e}. Reconnecting in 5s...")
            await asyncio.sleep(5)


@router.websocket("/ws/warehouse")
async def warehouse_ws(websocket: WebSocket):
    global _mqtt_task
    await websocket.accept()
    _clients.add(websocket)
    logger.info(f"Warehouse WS client connected. Total: {len(_clients)}")

    # Start MQTT subscriber loop singleton if not active
    if _mqtt_task is None or _mqtt_task.done():
        _mqtt_task = asyncio.create_task(_mqtt_subscriber_loop())

    try:
        while True:
            # Keep alive and wait for close
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        _clients.discard(websocket)
        logger.info(f"Warehouse WS client disconnected. Total: {len(_clients)}")