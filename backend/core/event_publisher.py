import json
import time
import logging
import aiomqtt
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.db_models import PubSubMessageModel
from backend.core.config import settings

logger = logging.getLogger("event_publisher")

async def publish_event(channel: str, event_type: str, data: dict, db: AsyncSession):
    """
    Publish domain event to MQTT + persist to DB for log history.
    """
    # 1. Save to pubsub_messages table
    record = PubSubMessageModel(
        channel=channel,
        message=json.dumps(data),
        metadata_={"event_type": event_type}
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    # 2. Publish to Eclipse PubSub MQTT Broker
    envelope = {
        "type": event_type,
        "channel": channel,
        "data": {
            "id": record.id,
            "text": json.dumps(data),
            "metadata": {"event_type": event_type},
            "published_at": record.published_at.isoformat(),
        },
        "timestamp": time.time(),
    }
    
    try:
        async with aiomqtt.Client(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT) as client:
            await client.publish(channel, payload=json.dumps(envelope))
    except Exception as e:
        logger.error(f"Failed to publish event to MQTT: {e}")