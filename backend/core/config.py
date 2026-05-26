"""
boulty-v1 — Centralized Configuration (Single Source of Truth)

All settings are loaded from  env/.env  via pydantic-settings.
Every module should import:  from backend.core.config import settings
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve the path to env/.env relative to the project root
_PROJECT_ROOT = Path(__file__).resolve().parents[2]  # backend/core/config.py → project root
_ENV_FILE = _PROJECT_ROOT / "env" / ".env"


class Settings(BaseSettings):
    """
    All configuration for boulty-v1.
    Values are loaded from env/.env and can be overridden by real environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── PostgreSQL ──────────────────────────────────────────────
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5435
    POSTGRES_USER: str = "boulty"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "boulty_db"

    # ── Database Pool ───────────────────────────────────────────
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_ECHO: bool = False

    # ── pgAdmin ─────────────────────────────────────────────────
    PGADMIN_DEFAULT_EMAIL: str = "admin@boulty.local"
    PGADMIN_DEFAULT_PASSWORD: str = "changeme"
    PGADMIN_PORT: int = 5050

    # ── SSH Tunnel ──────────────────────────────────────────────
    SSH_HOST: str = ""
    SSH_PORT: int = 22
    SSH_USER: str = ""
    SSH_PASSWORD: str = ""

    # ── MQTT / PubSub ───────────────────────────────────────────
    MQTT_BROKER_HOST: str = "broker.hivemq.com"
    MQTT_BROKER_PORT: int = 1883

    # ── FastAPI ─────────────────────────────────────────────────
    FASTAPI_HOST: str = "0.0.0.0"
    FASTAPI_PORT: int = 8000
    DEBUG: bool = False
    LOG_LEVEL: str = "info"

    # ── Nginx ───────────────────────────────────────────────────
    NGINX_PORT: int = 8080

    # ── Computed Properties ─────────────────────────────────────

    @property
    def database_url(self) -> str:
        """Sync driver URL (used by Alembic offline mode)."""
        password_part = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
        return (
            f"postgresql://{self.POSTGRES_USER}{password_part}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def async_database_url(self) -> str:
        """Async driver URL (used by SQLAlchemy async engine)."""
        password_part = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}{password_part}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


# ── Singleton instance — import this everywhere ────────────────
settings = Settings()
