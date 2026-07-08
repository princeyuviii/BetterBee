"""
BetterBee — User Repository.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository handling database access for User ORM model."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_clerk_id(self, clerk_id: str) -> User | None:
        """Fetch a user by their Clerk identifier."""
        query = select(User).where(User.clerk_id == clerk_id)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        """Fetch a user by their email address."""
        query = select(User).where(User.email == email)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()
