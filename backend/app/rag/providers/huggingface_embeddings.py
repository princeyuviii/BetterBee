"""
BetterBee — HuggingFace (SentenceTransformers) Embedding Provider.
"""

import structlog
from sentence_transformers import SentenceTransformer

from app.rag.interfaces.embeddings import EmbeddingProvider

logger = structlog.get_logger(__name__)


class HuggingFaceEmbeddingProvider(EmbeddingProvider):
    """Local HuggingFace Embedding Provider using sentence-transformers."""

    def __init__(self, model: str = "all-MiniLM-L6-v2") -> None:
        self.model_name = model
        self.model = None  # Lazy load to prevent startup delay
        logger.info("HuggingFace embedding provider registered", model=model)

    def _lazy_load(self) -> None:
        if self.model is None:
            logger.info("Loading sentence-transformers model into memory...", model=self.model_name)
            self.model = SentenceTransformer(self.model_name)
            logger.info("Sentence-transformers model loaded successfully")

    async def embed_text(self, text: str) -> list[float]:
        try:
            self._lazy_load()
            assert self.model is not None
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error("HuggingFace embedding failed", error=str(e), model=self.model_name)
            from app.core.exceptions import ProviderError
            raise ProviderError("HuggingFace Embeddings", str(e))

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            self._lazy_load()
            assert self.model is not None
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error("HuggingFace batch embedding failed", error=str(e), model=self.model_name)
            from app.core.exceptions import ProviderError
            raise ProviderError("HuggingFace Embeddings", str(e))

    def get_dimensions(self) -> int:
        self._lazy_load()
        assert self.model is not None
        return int(self.model.get_sentence_embedding_dimension())
