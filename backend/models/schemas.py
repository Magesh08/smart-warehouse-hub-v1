"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional, Any
import time


class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    value: Optional[float] = None
    tags: Optional[list[str]] = []


class ItemUpdate(BaseModel): 
    name: Optional[str] = None
    description: Optional[str] = None
    value: Optional[float] = None
    tags: Optional[list[str]] = None


class PublishMessage(BaseModel):
    channel: str
    message: str
    metadata: Optional[dict[str, Any]] = {}


class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    timestamp: float = None

    def __init__(self, **data):
        if "timestamp" not in data or data["timestamp"] is None:
            data["timestamp"] = time.time()
        super().__init__(**data)
