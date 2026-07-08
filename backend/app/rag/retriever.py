"""
BetterBee — RAG Retriever.

Retrieves candidate document chunks from ChromaDB and performs optional query expansion.
"""

import uuid
import structlog
from typing import Any

from app.rag.interfaces.embeddings import EmbeddingProvider
from app.rag.interfaces.vectorstore import VectorStoreProvider, SearchResult

logger = structlog.get_logger(__name__)


class WorkspaceRetriever:
    """Retrieves document chunks relevant to a user query within a workspace."""

    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        vector_store_provider: VectorStoreProvider,
    ) -> None:
        self.embeddings = embedding_provider
        self.vector_store = vector_store_provider

    async def retrieve(
        self,
        query: str,
        workspace_id: uuid.UUID,
        top_k: int = 20,
    ) -> list[SearchResult]:
        """
        Embed the query and retrieve top_k candidate chunks from ChromaDB.
        """
        log = logger.bind(workspace_id=str(workspace_id), query=query)
        log.debug("Initiating vector retrieval")

        # 1. Generate embedding for query
        query_vector = await self.embeddings.embed_text(query)

        # 2. Query ChromaDB workspace collection
        collection_name = str(workspace_id)
        results = await self.vector_store.search(
            collection_name=collection_name,
            query_embedding=query_vector,
            top_k=top_k,
        )

        log.debug("Vector retrieval complete", candidate_count=len(results))
        return results
