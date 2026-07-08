"""
BetterBee — Embedding Provider Interface.
"""

from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """Abstract interface defining operations for generating text embeddings."""

    @abstractmethod
    async def embed_text(self, text: str) -> list[float]:
        """
        Generate a vector embedding for a single text snippet.
        """
        pass

    @abstractmethod
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Generate vector embeddings for a list of text snippets.
        """
        pass

    @abstractmethod
    def get_dimensions(self) -> int:
        """
        Return the size (number of dimensions) of the generated vectors.
        """
        pass
