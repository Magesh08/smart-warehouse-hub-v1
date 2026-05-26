from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import time

from backend.db import get_db
from backend.models import Item, ItemUpdate, APIResponse
from backend.models.db_models import ItemModel

router = APIRouter(prefix="/api/demo", tags=["demo"])


# ──────────────────────────────────────────────
# GET /api/demo/items  — list all items
# ──────────────────────────────────────────────
@router.get("/items")
async def get_items(
    limit: Optional[int] = 50,
    offset: Optional[int] = 0,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ItemModel).order_by(ItemModel.id).limit(limit).offset(offset)
    )
    items = result.scalars().all()
    total = await db.scalar(select(func.count()).select_from(ItemModel))
    return APIResponse(
        success=True,
        data={"items": [i.to_dict() for i in items], "total": total, "limit": limit, "offset": offset},
        message=f"Fetched {len(items)} items",
    )


# ──────────────────────────────────────────────
# GET /api/demo/items/{item_id}
# ──────────────────────────────────────────────
@router.get("/items/{item_id}")
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await db.get(ItemModel, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    return APIResponse(success=True, data=item.to_dict())


# ──────────────────────────────────────────────
# POST /api/demo/items — create new item
# ──────────────────────────────────────────────
@router.post("/items", status_code=201)
async def create_item(item: Item, db: AsyncSession = Depends(get_db)):
    new_item = ItemModel(
        name=item.name,
        description=item.description,
        value=item.value,
        tags=item.tags or [],
    )
    db.add(new_item)
    await db.flush()   # assigns id without full commit
    await db.refresh(new_item)
    return APIResponse(success=True, data=new_item.to_dict(), message="Item created successfully")


# ──────────────────────────────────────────────
# PATCH /api/demo/items/{item_id} — partial update
# ──────────────────────────────────────────────
@router.patch("/items/{item_id}")
async def update_item(item_id: int, update: ItemUpdate, db: AsyncSession = Depends(get_db)):
    item = await db.get(ItemModel, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    patch = update.model_dump(exclude_unset=True)
    for key, val in patch.items():
        setattr(item, key, val)
    await db.flush()
    await db.refresh(item)
    return APIResponse(success=True, data=item.to_dict(), message="Item updated")


# ──────────────────────────────────────────────
# DELETE /api/demo/items/{item_id}
# ──────────────────────────────────────────────
@router.delete("/items/{item_id}")
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await db.get(ItemModel, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    data = item.to_dict()
    await db.delete(item)
    return APIResponse(success=True, data=data, message="Item deleted")


# ──────────────────────────────────────────────
# GET /api/demo/health
# ──────────────────────────────────────────────
@router.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count()).select_from(ItemModel))
    return {
        "status": "ok",
        "service": "boulty-v1-backend",
        "items_in_db": total,
        "storage": "PostgreSQL",
        "timestamp": time.time(),
    }


# ──────────────────────────────────────────────
# GET /api/demo/stats
# ──────────────────────────────────────────────
_start_time = time.time()

@router.get("/stats")
async def stats(db: AsyncSession = Depends(get_db)):
    uptime = time.time() - _start_time
    total = await db.scalar(select(func.count()).select_from(ItemModel))
    return APIResponse(
        success=True,
        data={
            "uptime_seconds": round(uptime, 2),
            "uptime_human": f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s",
            "items_count": total,
            "server": "boulty-v1 FastAPI",
            "storage": "PostgreSQL (asyncpg)",
            "version": "1.0.0",
        },
    )
