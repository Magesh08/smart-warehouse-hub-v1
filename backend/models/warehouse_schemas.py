"""
Pydantic schemas for Smart Warehouse domain entities: Inventory, Orders, and Users.
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field
from backend.models.warehouse_models import InventoryStatus, OrderStatus, UserRole


# ── Common response wrapper ──
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    timestamp: float = Field(default_factory=datetime.utcnow().timestamp)


# ── Inventory Schemas ──────────────────────────────────────────────

class InventoryItemBase(BaseModel):
    sku: str = Field(..., max_length=50, description="Stock Keeping Unit")
    name: str = Field(..., max_length=255, description="Item Name")
    description: Optional[str] = None
    rack: str = Field(..., max_length=10, description="Warehouse Rack location")
    slot: str = Field(..., max_length=10, description="Warehouse Slot location")
    quantity: int = Field(default=0, ge=0)
    min_stock_level: int = Field(default=10, ge=0)
    category: str = Field(default="General", max_length=100)
    tags: list[str] = Field(default_factory=list)
    value: Optional[float] = Field(default=None, ge=0.0)


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    sku: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    rack: Optional[str] = Field(None, max_length=10)
    slot: Optional[str] = Field(None, max_length=10)
    quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[list[str]] = None
    value: Optional[float] = Field(None, ge=0.0)
    status: Optional[str] = None


class InventoryItemResponse(InventoryItemBase):
    id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Order Schemas ──────────────────────────────────────────────────

class OrderItemBase(BaseModel):
    sku: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    quantity: int = Field(default=1, ge=1)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    order_id: str = Field(..., max_length=20, alias="orderId")
    status: str = Field(default=OrderStatus.PENDING.value)
    assigned_robot: Optional[str] = Field(default=None, max_length=20, alias="assignedRobot")
    progress: int = Field(default=0, ge=0, le=100)
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class OrderCreate(BaseModel):
    order_id: str = Field(..., max_length=20, alias="orderId")
    items: list[OrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class OrderUpdate(BaseModel):
    assigned_robot: Optional[str] = Field(None, max_length=20, alias="assignedRobot")
    progress: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    status: Optional[str] = None

    class Config:
        populate_by_name = True


class OrderStatusUpdate(BaseModel):
    status: str


class OrderResponse(OrderBase):
    id: int
    items: list[OrderItemResponse] = []
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


# ── User & Auth Schemas ────────────────────────────────────────────

class UserBase(BaseModel):
    username: str = Field(..., max_length=100)
    email: str
    full_name: Optional[str] = Field(None, max_length=255, alias="fullName")
    role: str = Field(default=UserRole.VIEWER.value)

    class Config:
        populate_by_name = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = Field(None, max_length=255, alias="fullName")
    role: Optional[str] = None
    is_active: Optional[bool] = Field(None, alias="isActive")

    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    id: int
    is_active: bool = Field(..., alias="isActive")
    created_at: Optional[datetime] = Field(None, alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str = Field(..., alias="accessToken")
    token_type: str = Field(default="bearer", alias="tokenType")
    user: UserResponse

    class Config:
        populate_by_name = True