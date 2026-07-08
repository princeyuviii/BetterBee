"""
BetterBee — Chunk Repository.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chunk import Chunk
from app.repositories.base import BaseRepository


class ChunkRepository(BaseRepository[Chunk]):
    """Repository handling database access for Chunk ORM model."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Chunk)
