"""
Declarative base for all SQLAlchemy ORM models.
Separated to prevent circular imports between models and engine.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
