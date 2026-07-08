"""
BetterBee — Ollama Embedding Provider.
"""

import structlog
from langchain_ollama import OllamaEmbeddings

from app.rag.interfaces.embeddings import EmbeddingProvider

logger = structlog.get_logger(__name__)


class OllamaEmbeddingProvider(EmbeddingProvider):
    """Local Ollama Embedding Provider using langchain-ollama."""

    def __init__(self, model: str, base_url: str) -> None:
        self.model = model
        self.base_url = base_url
        self.client = OllamaEmbeddings(
            model=model,
            base_url=base_url,
        )
        logger.info("Ollama embedding provider initialized", model=model, base_url=base_url)

    async def embed_text(self, text: str) -> list[float]:
        try:
            return await self.client.aembed_query(text)
        except Exception as e:
            logger.error("Ollama embedding failed", error=str(e), model=self.model)
            from app.core.exceptions import ProviderError
            raise ProviderError("Ollama Embeddings", str(e))

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        try:
            return await self.client.aembed_documents(texts)
        except Exception as e:
            logger.error("Ollama batch embedding failed", error=str(e), model=self.model)
            from app.core.exceptions import ProviderError
            raise ProviderError("Ollama Embeddings", str(e))

    def get_dimensions(self) -> int:
        # nomic-embed-text generates 768-dimensional vectors by default
        if "nomic" in self.model:
            return 768
        return 1024  # Default fallback dimension
