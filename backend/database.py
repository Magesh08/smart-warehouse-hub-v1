"""
Async SQLAlchemy engine and session factory for boulty-v1.
Database: PostgreSQL via asyncpg driver.
"""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://boulty@localhost:5435/boulty_db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,           # Set True to log all SQL queries
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,   # Verify connection health before use
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields a DB session, closes after request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
