"""
Orders router for Smart Warehouse: CRUD operations and stats.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from backend.db import get_db
from backend.core.auth_utils import get_current_active_user
from backend.core.event_publisher import publish_event
from backend.models.warehouse_models import OrderModel, OrderItemModel, OrderStatus, UserModel
from backend.models.warehouse_schemas import (
    APIResponse,
    OrderCreate,
    OrderUpdate,
    OrderStatusUpdate,
    OrderResponse,
)

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """List all orders in the warehouse."""
    query = select(OrderModel)
    if status:
        query = query.where(OrderModel.status == status)

    query = query.order_by(OrderModel.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders


@router.get("/stats")
async def get_orders_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Retrieve aggregated counts of orders by status."""
    # Count today's orders (all orders)
    total_result = await db.execute(select(func.count(OrderModel.id)))
    total_today = total_result.scalar_one()

    # Count by status
    pending = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.PENDING.value))).scalar_one()
    picking = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.PICKING.value))).scalar_one()
    completed = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.COMPLETED.value))).scalar_one()
    cancelled = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.CANCELLED.value))).scalar_one()

    return {
        "total_today": total_today,
        "pending": pending,
        "picking": picking,
        "completed": completed,
        "cancelled": cancelled,
    }


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Retrieve details for a single order by database ID."""
    result = await db.execute(select(OrderModel).where(OrderModel.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Create a new warehouse order and assign picking items."""
    # Check if orderId already exists
    existing = await db.execute(select(OrderModel).where(OrderModel.order_id == payload.order_id))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Order ID already exists")

    new_order = OrderModel(
        order_id=payload.order_id,
        status=OrderStatus.PENDING.value,
        progress=0,
        notes=payload.notes,
    )
    db.add(new_order)
    await db.flush()

    # Create related line items
    for item in payload.items:
        new_item = OrderItemModel(
            order_id=new_order.id,
            sku=item.sku,
            name=item.name,
            quantity=item.quantity,
        )
        db.add(new_item)

    await db.flush()
    await db.refresh(new_order)

    # Publish MQTT domain event
    await publish_event("warehouse/orders", "order.created", new_order.to_dict(), db)

    return new_order


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Update general fields of an order."""
    result = await db.execute(select(OrderModel).where(OrderModel.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(order, field, val)

    db.add(order)
    await db.flush()
    await db.refresh(order)

    # Publish MQTT domain event
    await publish_event("warehouse/orders", "order.status_changed", order.to_dict(), db)

    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Update picking status of an order."""
    result = await db.execute(select(OrderModel).where(OrderModel.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Set new status
    order.status = payload.status
    if payload.status == OrderStatus.COMPLETED.value:
        order.progress = 100

    db.add(order)
    await db.flush()
    await db.refresh(order)

    # Publish MQTT domain event
    await publish_event("warehouse/orders", "order.status_changed", order.to_dict(), db)

    return order


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Cancel/delete an order from the warehouse."""
    result = await db.execute(select(OrderModel).where(OrderModel.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order_dict = order.to_dict()
    await db.delete(order)
    await db.flush()

    # Publish MQTT domain event
    await publish_event("warehouse/orders", "order.deleted", order_dict, db)

    return {"success": True, "message": f"Order {order_dict['orderId']} cancelled successfully"}