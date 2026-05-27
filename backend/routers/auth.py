"""
Authentication router for Smart Warehouse: login, registration, and user profile endpoints.
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.db import get_db
from backend.core.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    oauth2_scheme,
)
from backend.models.warehouse_models import UserModel
from backend.models.warehouse_schemas import (
    APIResponse,
    UserLogin,
    UserCreate,
    UserUpdate,
    UserResponse,
    TokenResponse,
)

logger = logging.getLogger("auth_router")
router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── POST /api/auth/login ──
@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate a user and return a JWT access token.
    """
    result = await db.execute(select(UserModel).where(UserModel.username == payload.username))
    user = result.scalars().first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is inactive",
        )
    
    from datetime import datetime, timedelta, timezone
    from backend.core.config import settings
    from backend.models.warehouse_models import UserTokenModel

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.now(timezone.utc) + expires_delta
    access_token = create_access_token(data={"sub": user.username}, expires_delta=expires_delta)
    
    db_token = UserTokenModel(
        token=access_token,
        user_id=user.id,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(db_token)
    await db.flush()

    return {
        "accessToken": access_token,
        "tokenType": "bearer",
        "user": user.to_dict()
    }


# ── POST /api/auth/logout ──
@router.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoke the current user session token.
    """
    from backend.models.warehouse_models import UserTokenModel
    result = await db.execute(select(UserTokenModel).where(UserTokenModel.token == token))
    db_token = result.scalars().first()
    if db_token:
        db_token.is_revoked = True
        db.add(db_token)
        await db.flush()
    return {"success": True, "message": "Successfully logged out"}


# ── GET /api/auth/me ──
@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get the profile details of the currently logged-in user.
    """
    return current_user.to_dict()


# ── POST /api/auth/register (Admin Only) ──
@router.post("/register", response_model=UserResponse, dependencies=[Depends(get_current_admin_user)])
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create/register a new user in the warehouse system. (Admin only)
    """
    # Check if username exists
    user_exists = await db.execute(select(UserModel).where(UserModel.username == payload.username))
    if user_exists.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    email_exists = await db.execute(select(UserModel).where(UserModel.email == payload.email))
    if email_exists.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = UserModel(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=True
    )
    
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)
    
    logger.info(f"Admin registered new user: {new_user.username} with role {new_user.role}")
    return new_user.to_dict()


# ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
# ── USER MANAGEMENT ENDPOINTS (Admin Only, mounted on separate subrouter)
# ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
user_router = APIRouter(prefix="/api/users", tags=["user-management"], dependencies=[Depends(get_current_admin_user)])

@user_router.get("", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    """
    List all registered users in the system. (Admin only)
    """
    result = await db.execute(select(UserModel).order_by(UserModel.id))
    users = result.scalars().all()
    return [u.to_dict() for u in users]


@user_router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's role or status. (Admin only)
    """
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if payload.email is not None:
        user.email = payload.email
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
        
    db.add(user)
    await db.flush()
    await db.refresh(user)
    
    return user.to_dict()


@user_router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a user from the system. (Admin only)
    """
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    return {"success": True, "message": f"User {user.username} deleted successfully"}