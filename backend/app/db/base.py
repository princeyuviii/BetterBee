"""
BetterBee — SQLAlchemy Base & Mixins.

DeclarativeBase for all ORM models.
Reusable mixins for timestamps and soft-delete.
All models import from here to ensure Alembic discovers them.
"""

import uuid
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


class TimestampMixin:
    """Adds created_at and updated_at columns to a model.

    Both columns use server-side defaults for consistency across app instances.
    """

    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Adds soft-delete capability via a deleted_at column.

    Records with deleted_at != None are considered deleted.
    Queries should filter by deleted_at.is_(None) unless explicitly including deleted records.
    """

    deleted_at: Mapped[datetime | None] = mapped_column(default=None)


class UUIDPrimaryKeyMixin:
    """Adds a UUID primary key column."""

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
