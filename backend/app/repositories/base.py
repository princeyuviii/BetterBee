"""
BetterBee — Generic Base Repository.

Implements the Repository Pattern with a generic base class.
All data access goes through repositories — services never touch the session directly.
"""

import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Generic repository providing standard CRUD operations.

    Subclasses specify the model type and can add domain-specific queries.

    Usage:
        class UserRepository(BaseRepository[User]):
            def __init__(self, session: AsyncSession):
                super().__init__(session, User)

            async def get_by_email(self, email: str) -> User | None:
                ...
    """

    def __init__(self, session: AsyncSession, model: type[T]) -> None:
        self._session = session
        self._model = model

    async def get_by_id(self, id: uuid.UUID) -> T | None:
        """Fetch a single record by its primary key."""
        return await self._session.get(self._model, id)

    async def create(self, **kwargs: Any) -> T:
        """Create and persist a new record."""
        instance = self._model(**kwargs)
        self._session.add(instance)
        await self._session.flush()
        await self._session.refresh(instance)
        return instance

    async def update(self, instance: T, **kwargs: Any) -> T:
        """Update an existing record's attributes."""
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        await self._session.flush()
        await self._session.refresh(instance)
        return instance

    async def delete(self, instance: T) -> None:
        """Hard-delete a record from the database."""
        await self._session.delete(instance)
        await self._session.flush()

    async def list(
        self,
        *,
        offset: int = 0,
        limit: int = 50,
        order_by: str | None = None,
        filters: list[Any] | None = None,
    ) -> tuple[list[T], int]:
        """List records with pagination, ordering, and filtering.

        Args:
            offset: Number of records to skip.
            limit: Maximum number of records to return.
            order_by: Column name to sort by (prefix with '-' for descending).
            filters: List of SQLAlchemy filter conditions.

        Returns:
            Tuple of (records, total_count).
        """
        query = select(self._model)

        if filters:
            for condition in filters:
                query = query.where(condition)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self._session.execute(count_query)).scalar() or 0

        # Apply ordering
        if order_by:
            descending = order_by.startswith("-")
            column_name = order_by.lstrip("-")
            column = getattr(self._model, column_name, None)
            if column is not None:
                query = query.order_by(column.desc() if descending else column.asc())

        # Apply pagination
        query = query.offset(offset).limit(limit)

        result = await self._session.execute(query)
        records = list(result.scalars().all())

        return records, total

    async def exists(self, id: uuid.UUID) -> bool:
        """Check if a record exists by primary key."""
        query = select(func.count()).where(self._model.id == id)
        count = (await self._session.execute(query)).scalar() or 0
        return count > 0
