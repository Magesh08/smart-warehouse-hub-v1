"""
Inventory router for Smart Warehouse: CRUD operations and stats.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from backend.db import get_db
from backend.core.auth_utils import get_current_active_user
from backend.core.event_publisher import publish_event
from backend.models.warehouse_models import InventoryItemModel, InventoryStatus, UserModel
from backend.models.warehouse_schemas import (
    APIResponse,
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
)

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("", response_model=List[InventoryItemResponse])
async def list_inventory(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """List all inventory items, optionally filtered by search, category, or status."""
    query = select(InventoryItemModel)
    if search:
        query = query.where(
            (InventoryItemModel.name.ilike(f"%{search}%"))
            | (InventoryItemModel.sku.ilike(f"%{search}%"))
            | (InventoryItemModel.description.ilike(f"%{search}%"))
        )
    if category:
        query = query.where(InventoryItemModel.category == category)
    if status:
        query = query.where(InventoryItemModel.status == status)

    query = query.order_by(InventoryItemModel.sku)
    result = await db.execute(query)
    items = result.scalars().all()
    return items


@router.get("/stats")
async def get_inventory_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Retrieve aggregated stats for warehouse inventory."""
    # Total distinct items/SKUs
    total_result = await db.execute(select(func.count(InventoryItemModel.id)))
    total_items = total_result.scalar_one()

    # Low stock items count
    low_stock_result = await db.execute(
        select(func.count(InventoryItemModel.id)).where(InventoryItemModel.status == InventoryStatus.LOW_STOCK.value)
    )
    low_stock = low_stock_result.scalar_one()

    # Out of stock items count
    out_of_stock_result = await db.execute(
        select(func.count(InventoryItemModel.id)).where(InventoryItemModel.status == InventoryStatus.OUT_OF_STOCK.value)
    )
    out_of_stock = out_of_stock_result.scalar_one()

    # Categories count
    categories_result = await db.execute(select(func.count(func.distinct(InventoryItemModel.category))))
    categories_count = categories_result.scalar_one()

    return {
        "total_items": total_items,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "categories": categories_count,
    }


@router.get("/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Retrieve details for a single inventory item."""
    result = await db.execute(select(InventoryItemModel).where(InventoryItemModel.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.post("", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    payload: InventoryItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Create a new inventory item and broadcast event."""
    # Check if SKU exists
    existing = await db.execute(select(InventoryItemModel).where(InventoryItemModel.sku == payload.sku))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="SKU already exists")

    # Determine status based on stock level
    status_val = InventoryStatus.IN_STOCK.value
    if payload.quantity == 0:
        status_val = InventoryStatus.OUT_OF_STOCK.value
    elif payload.quantity <= payload.min_stock_level:
        status_val = InventoryStatus.LOW_STOCK.value

    item = InventoryItemModel(
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        rack=payload.rack,
        slot=payload.slot,
        quantity=payload.quantity,
        min_stock_level=payload.min_stock_level,
        category=payload.category,
        tags=payload.tags,
        value=payload.value,
        status=status_val,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)

    # Publish MQTT domain event
    await publish_event("warehouse/inventory", "inventory.created", item.to_dict(), db)

    return item


@router.patch("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: int,
    payload: InventoryItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Update details of an inventory item and broadcast event."""
    result = await db.execute(select(InventoryItemModel).where(InventoryItemModel.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    # Update fields
    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, val)

    # Recalculate status if quantity or min_stock_level changes
    if payload.quantity is not None or payload.min_stock_level is not None:
        if item.quantity == 0:
            item.status = InventoryStatus.OUT_OF_STOCK.value
        elif item.quantity <= item.min_stock_level:
            item.status = InventoryStatus.LOW_STOCK.value
        else:
            item.status = InventoryStatus.IN_STOCK.value

    db.add(item)
    await db.flush()
    await db.refresh(item)

    # Publish MQTT domain event
    await publish_event("warehouse/inventory", "inventory.updated", item.to_dict(), db)

    return item


@router.delete("/{item_id}")
async def delete_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Delete an inventory item and broadcast event."""
    result = await db.execute(select(InventoryItemModel).where(InventoryItemModel.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    item_dict = item.to_dict()
    await db.delete(item)
    await db.flush()

    # Publish MQTT domain event
    await publish_event("warehouse/inventory", "inventory.deleted", item_dict, db)

    return {"success": True, "message": f"Inventory item {item_dict['sku']} deleted successfully"}