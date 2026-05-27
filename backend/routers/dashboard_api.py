"""
Dashboard Router for Smart Warehouse: aggregates inventory, order, system status, and recent activity logs.
"""
import time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc

from backend.db import get_db
from backend.core.auth_utils import get_current_active_user
from backend.models.warehouse_models import InventoryItemModel, InventoryStatus, OrderModel, OrderStatus, UserModel
from backend.models.db_models import PubSubMessageModel
from backend.models.warehouse_schemas import APIResponse
from backend.core.uptime import get_uptime_seconds, get_uptime_human

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Retrieve consolidated dashboard metrics."""
    # 1. Inventory Summary
    total_items = (await db.execute(select(func.count(InventoryItemModel.id)))).scalar_one()
    low_stock = (await db.execute(select(func.count(InventoryItemModel.id)).where(InventoryItemModel.status == InventoryStatus.LOW_STOCK.value))).scalar_one()
    out_of_stock = (await db.execute(select(func.count(InventoryItemModel.id)).where(InventoryItemModel.status == InventoryStatus.OUT_OF_STOCK.value))).scalar_one()
    categories_count = (await db.execute(select(func.count(func.distinct(InventoryItemModel.category))))).scalar_one()
    in_stock = total_items - out_of_stock

    # 2. Orders Summary
    total_orders = (await db.execute(select(func.count(OrderModel.id)))).scalar_one()
    pending_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.PENDING.value))).scalar_one()
    picking_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.PICKING.value))).scalar_one()
    completed_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.COMPLETED.value))).scalar_one()
    cancelled_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.CANCELLED.value))).scalar_one()

    # 3. Recent Activity (latest 10 pubsub logs)
    activity_query = select(PubSubMessageModel).order_by(desc(PubSubMessageModel.published_at)).limit(10)
    activity_result = await db.execute(activity_query)
    raw_activities = activity_result.scalars().all()
    
    recent_activity = []
    for m in raw_activities:
        recent_activity.append({
            "id": m.id,
            "channel": m.channel,
            "message": m.message,
            "eventType": m.metadata_.get("event_type", "default"),
            "timestamp": m.published_at.isoformat() if m.published_at else None,
        })

    uptime = get_uptime_seconds()

    return APIResponse(
        success=True,
        data={
            "inventory": {
                "totalSkus": total_items,
                "inStock": in_stock,
                "lowStock": low_stock,
                "outOfStock": out_of_stock,
                "categoriesCount": categories_count,
            },
            "orders": {
                "totalToday": total_orders,
                "pending": pending_orders,
                "picking": picking_orders,
                "completed": completed_orders,
                "cancelled": cancelled_orders,
            },
            "system": {
                "dbStatus": "ok",
                "uptimeSeconds": int(uptime),
                "uptimeHuman": get_uptime_human(uptime),
                "timestamp": time.time(),
            },
            "recent_activity": recent_activity,
        },
        message="Dashboard summary loaded successfully"
    )