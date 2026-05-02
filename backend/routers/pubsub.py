import json
import time
import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import aiomqtt

from backend.database import get_db
from backend.models_db import PubSubMessageModel
from backend.models import PublishMessage, APIResponse

router = APIRouter(tags=["pubsub"])
logger = logging.getLogger("pubsub")

# ──────────────────────────────────────────────
# POST /api/pubsub/publish
# ──────────────────────────────────────────────
@router.post("/api/pubsub/publish")
async def publish_message(payload: PublishMessage, db: AsyncSession = Depends(get_db)):
    # 1. Persist to PostgreSQL for history
    record = PubSubMessageModel(
        channel=payload.channel,
        message=payload.message,
        metadata_=payload.metadata or {},
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    # 2. Publish to Eclipse Mosquitto MQTT Broker
    envelope = {
        "type": "message",
        "channel": payload.channel,
        "data": {
            "id": record.id,
            "text": payload.message,
            "metadata": payload.metadata,
            "published_at": record.published_at.isoformat(),
        },
        "timestamp": time.time(),
    }
    
    try:
        async with aiomqtt.Client("broker.hivemq.com", 1883) as client:
            await client.publish(payload.channel, payload=json.dumps(envelope))
            published_to_mqtt = True
    except Exception as e:
        logger.error(f"Failed to publish to MQTT: {e}")
        published_to_mqtt = False

    return APIResponse(
        success=True,
        data={
            "id": record.id,
            "channel": payload.channel,
            "message": payload.message,
            "persisted": True,
            "mqtt_published": published_to_mqtt,
        },
        message=f"Published to MQTT '{payload.channel}' and saved to DB",
    )


# ──────────────────────────────────────────────
# GET /api/pubsub/history/{channel}
# ──────────────────────────────────────────────
@router.get("/api/pubsub/history/{channel}")
async def message_history(channel: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PubSubMessageModel)
        .where(PubSubMessageModel.channel == channel)
        .order_by(desc(PubSubMessageModel.published_at))
        .limit(limit)
    )
    msgs = list(reversed(result.scalars().all()))
    return APIResponse(
        success=True,
        data={"channel": channel, "messages": [m.to_dict() for m in msgs], "count": len(msgs)},
        message=f"Last {len(msgs)} messages in '{channel}'",
    )


# ──────────────────────────────────────────────
# GET /api/pubsub/channels
# ──────────────────────────────────────────────
@router.get("/api/pubsub/channels")
async def list_channels():
    # Since Mosquitto now handles routing, the backend no longer tracks active connections.
    return APIResponse(
        success=True,
        data={"status": "handled_by_mosquitto"},
        message="Active channels are managed by Eclipse Mosquitto",
    )
