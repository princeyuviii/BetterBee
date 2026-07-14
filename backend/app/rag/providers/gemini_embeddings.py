"""
BetterBee — Google Gemini Embedding Provider.
"""

import structlog
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.rag.interfaces.embeddings import EmbeddingProvider

logger = structlog.get_logger(__name__)


class GeminiEmbeddingProvider(EmbeddingProvider):
    """Cloud Google Gemini Embedding Provider using langchain-google-genai."""

    def __init__(self, model: str, api_key: str | None) -> None:
        self.model = model
        self.client = GoogleGenerativeAIEmbeddings(
            model=model,
            google_api_key=api_key,
        )
        logger.info("Gemini embedding provider initialized", model=model)

    async def embed_text(self, text: str) -> list[float]:
        try:
            return await self.client.aembed_query(text)
        except Exception as e:
            logger.error("Gemini embedding failed", error=str(e), model=self.model)
            from app.core.exceptions import ProviderError
            raise ProviderError("Gemini Embeddings", str(e))

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        try:
            return await self.client.aembed_documents(texts)
        except Exception as e:
            logger.error("Gemini batch embedding failed", error=str(e), model=self.model)
            from app.core.exceptions import ProviderError
            raise ProviderError("Gemini Embeddings", str(e))

    def get_dimensions(self) -> int:
        # text-embedding-004 uses 768 dimensions by default
        return 768
