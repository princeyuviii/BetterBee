"""
BetterBee — OpenAI Embedding Provider.
"""

import structlog
from langchain_openai import OpenAIEmbeddings

from app.rag.interfaces.embeddings import EmbeddingProvider

logger = structlog.get_logger(__name__)


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """Cloud OpenAI Embedding Provider using langchain-openai."""

    def __init__(self, model: str, api_key: str | None) -> None:
        self.model = model
        self.client = OpenAIEmbeddings(
            model=model,
            api_key=api_key,
        )
        logger.info("OpenAI embedding provider initialized", model=model)

    async def embed_text(self, text: str) -> list[float]:
        try:
            return await self.client.aembed_query(text)
        except Exception as e:
            logger.error("OpenAI embedding failed", error=str(e), model=self.model)
            from app.core.exceptions import ProviderError
            raise ProviderError("OpenAI Embeddings", str(e))

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        try:
            return await self.client.aembed_documents(texts)
        except Exception as e:
            logger.error("OpenAI batch embedding failed", error=str(e), model=self.model)
            from app.core.exceptions import ProviderError
            raise ProviderError("OpenAI Embeddings", str(e))

    def get_dimensions(self) -> int:
        if "text-embedding-3-small" in self.model:
            return 1536
        elif "text-embedding-3-large" in self.model:
            return 3072
        return 1536  # Default fallback dimension
