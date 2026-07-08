"""
BetterBee — Document Chunking.

Splits large extracted text into smaller, overlapping semantic chunks for vector embedding.
Preserves page/sheet/slide metadata during splitting.
"""

from typing import Any
import structlog
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LCDocument

from app.core.config import get_settings

logger = structlog.get_logger(__name__)


class Chunker:
    """Handles splitting of text using LangChain's RecursiveCharacterTextSplitter."""

    def __init__(self, chunk_size: int | None = None, chunk_overlap: int | None = None) -> None:
        settings = get_settings()
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
        
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )
        logger.info(
            "Chunker initialized",
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
        )

    def split_text(
        self,
        text: str,
        page_metadata: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Splits raw text into metadata-aware chunks.
        
        If page_metadata contains multiple entries (e.g., PDF pages or Excel sheets),
        each page is chunked individually to preserve page number context.
        """
        # If we only have 1 page/metadata entry, split the whole text
        if len(page_metadata) <= 1:
            meta = page_metadata[0] if page_metadata else {}
            lc_docs = [LCDocument(page_content=text, metadata=meta)]
            split_docs = self.splitter.split_documents(lc_docs)
        else:
            # We have page-by-page breakdowns (e.g., PDFs)
            # We split the text roughly by double newline or reconstruct it.
            # A simple approach: split pages, assign metadata, chunk each page
            pages = text.split("\n\n")
            
            # Pad or trim pages to match metadata length
            lc_docs = []
            for i, page_text in enumerate(pages):
                if i < len(page_metadata):
                    meta = page_metadata[i]
                else:
                    meta = page_metadata[-1] if page_metadata else {}
                
                if page_text.strip():
                    lc_docs.append(LCDocument(page_content=page_text, metadata=meta))
            
            split_docs = self.splitter.split_documents(lc_docs)

        # Convert LangChain documents to simple dicts
        chunks = []
        for idx, doc in enumerate(split_docs):
            chunks.append({
                "chunk_index": idx,
                "content": doc.page_content,
                "token_count": len(doc.page_content.split()),  # Simple word count approximation
                "metadata": doc.metadata,
            })
            
        logger.debug("Document chunking complete", total_chunks=len(chunks))
        return chunks
