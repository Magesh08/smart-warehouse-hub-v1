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

    # 2. Orders Summary
    total_orders = (await db.execute(select(func.count(OrderModel.id)))).scalar_one()
    pending_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.PENDING.value))).scalar_one()
    picking_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.PICKING.value))).scalar_one()
    completed_orders = (await db.execute(select(func.count(OrderModel.id)).where(OrderModel.status == OrderStatus.COMPLETED.value))).scalar_one()

    # 3. Recent Activity (latest 10 pubsub logs)
    activity_query = select(PubSubMessageModel).order_by(desc(PubSubMessageModel.published_at)).limit(10)
    activity_result = await db.execute(activity_query)
    recent_activity = [m.to_dict() for m in activity_result.scalars().all()]

    return APIResponse(
        success=True,
        data={
            "inventory": {
                "total_items": total_items,
                "low_stock": low_stock,
                "out_of_stock": out_of_stock,
                "categories": categories_count,
            },
            "orders": {
                "total_today": total_orders,
                "pending": pending_orders,
                "picking": picking_orders,
                "completed": completed_orders,
            },
            "system": {
                "status": "ok",
                "db_status": "ok",
            },
            "recent_activity": recent_activity,
        },
        message="Dashboard summary loaded successfully"
    )