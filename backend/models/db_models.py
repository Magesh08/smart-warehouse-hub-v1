"""
SQLAlchemy ORM models for boulty-v1.
These define the database table structure.
"""
from datetime import datetime, timezone
from sqlalchemy import Integer, String, Float, Text, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from backend.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class ItemModel(Base):
    """Persistent items table — replaces the in-memory dict."""
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    value: Mapped[float | None] = mapped_column(Float, nullable=True)
    tags: Mapped[list] = mapped_column(JSONB, default=list, nullable=False, server_default="[]")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, server_default=func.now()
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "value": self.value,
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PubSubMessageModel(Base):
    """Persistent log of all published PubSub messages."""
    __tablename__ = "pubsub_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    channel: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column(
        "metadata", JSONB, default=dict, nullable=False, server_default="{}"
    )
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), index=True
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "channel": self.channel,
            "message": self.message,
            "metadata": self.metadata_ or {},
            "published_at": self.published_at.isoformat() if self.published_at else None,
        }
