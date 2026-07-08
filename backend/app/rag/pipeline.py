"""
BetterBee — RAG Ingestion & Query Pipeline.

Combines retrieval, cross-encoder reranking, and grounded answer generation.
Generates rich explainability metadata.
"""

import time
import uuid
from typing import AsyncGenerator, Any
import structlog

from app.rag.interfaces.llm import LLMProvider
from app.rag.interfaces.reranker import RerankerProvider
from app.rag.retriever import WorkspaceRetriever
from app.prompts.answer import build_answer_prompt

logger = structlog.get_logger(__name__)


class RAGPipeline:
    """Orchestrates document chunk retrieval, reranking, and LLM text generation."""

    def __init__(
        self,
        retriever: WorkspaceRetriever,
        reranker: RerankerProvider,
        llm_provider: LLMProvider,
    ) -> None:
        self.retriever = retriever
        self.reranker = reranker
        self.llm = llm_provider

    async def answer(
        self,
        query: str,
        workspace_id: uuid.UUID,
        chat_history: list[dict[str, str]],
        workspace_name: str = "Unknown",
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Runs the RAG query pipeline and yields events for streaming.
        
        Events yielded:
        - {"type": "token", "content": str}
        - {"type": "citations", "content": list[dict]}
        - {"type": "explain", "content": dict}
        """
        print(f"\n💬 Query\n"
              f"────────────────────────────\n"
              f"\"{query}\"")

        log = logger.bind(workspace_id=str(workspace_id), query=query)
        log.info("Starting RAG pipeline execution")

        t_start = time.perf_counter()

        # 1. Retrieval Phase
        t0 = time.perf_counter()
        retrieved_results = await self.retriever.retrieve(query, workspace_id, top_k=20)
        t_retrieval = (time.perf_counter() - t0) * 1000

        # Prepare retrieved chunk details for explainability
        retrieved_details = [
            {
                "id": r.id,
                "document": r.document,
                "score": r.score,
                "filename": r.metadata.get("filename", "Unknown"),
                "page_number": r.metadata.get("page_number"),
                "sheet_name": r.metadata.get("sheet_name"),
                "slide_number": r.metadata.get("slide_number"),
                "chunk_index": r.metadata.get("chunk_index"),
            }
            for r in retrieved_results
        ]

        if not retrieved_results:
            log.warning("No context chunks retrieved. Yielding final empty response.")
            yield {"type": "token", "content": "I could not find any documents related to your question in this workspace."}
            yield {
                "type": "explain",
                "content": {
                    "confidence": 0.0,
                    "retrieved_chunks": [],
                    "reranked_chunks": [],
                    "latencies": {
                        "retrieval_ms": round(t_retrieval, 2),
                        "reranking_ms": 0.0,
                        "generation_ms": 0.0,
                    },
                    "model_info": self.llm.get_model_info()._asdict(),
                }
            }
            return

        # 2. Rerank Phase
        t0 = time.perf_counter()
        candidate_texts = [r.document for r in retrieved_results]
        candidate_metadatas = [r.metadata for r in retrieved_results]
        
        reranked_results = await self.reranker.rerank(
            query=query,
            documents=candidate_texts,
            metadatas=candidate_metadatas,
            top_k=5,
        )
        t_reranking = (time.perf_counter() - t0) * 1000

        print(f"🔍 Retrieval\n"
              f"────────────────────────────\n"
              f"Candidates {len(retrieved_results)}\n"
              f"Reranked   {len(reranked_results)}")

        # Map reranked index back to retrieved_details for full info
        reranked_details = []
        context_parts = []
        citations = []

        for rank_idx, r in enumerate(reranked_results):
            orig_candidate = retrieved_results[r.index]
            meta = orig_candidate.metadata
            filename = meta.get("filename", "Unknown")
            
            # Format slide/page reference
            page_ref = ""
            if "page_number" in meta:
                page_ref = f"page {meta['page_number']}"
            elif "sheet_name" in meta:
                page_ref = f"sheet {meta['sheet_name']}"
            elif "slide_number" in meta:
                page_ref = f"slide {meta['slide_number']}"

            # Format for LLM context injection
            context_parts.append(
                f"Source: [{filename}] {page_ref}\n"
                f"Content: {r.document}\n"
            )

            # Store citation metadata
            citations.append({
                "filename": filename,
                "page_number": meta.get("page_number"),
                "sheet_name": meta.get("sheet_name"),
                "slide_number": meta.get("slide_number"),
                "content_preview": r.document[:200] + "...",
            })

            reranked_details.append({
                "id": orig_candidate.id,
                "document": r.document,
                "score": r.score,  # Cross-Encoder score (typically logit or sigmoid)
                "filename": filename,
                "page_number": meta.get("page_number"),
                "sheet_name": meta.get("sheet_name"),
                "slide_number": meta.get("slide_number"),
                "chunk_index": meta.get("chunk_index"),
                "rank": rank_idx + 1,
            })

        # 3. Build generation prompt
        context_str = "\n\n".join(context_parts)
        prompt_messages = build_answer_prompt(
            query=query,
            context=context_str,
            chat_history=chat_history,
        )

        # 4. Stream response from LLM
        t0 = time.perf_counter()
        
        # Yield citations first so UI knows references are coming
        yield {"type": "citations", "content": citations}

        full_response_text = ""
        async for token in self.llm.stream(prompt_messages):
            full_response_text += token
            yield {"type": "token", "content": token}
            
        t_generation_ms = (time.perf_counter() - t0) * 1000
        t_generation_s = t_generation_ms / 1000

        # Estimate token count
        token_count_est = int(len(full_response_text.split()) * 1.3) + 10
        model_name = self.llm.get_model_info().model_name
        if "llama-3.3" in model_name.lower() or "llama3.3" in model_name.lower():
            model_disp = "Llama 3.3"
        elif "llama" in model_name.lower():
            model_disp = "Llama"
        else:
            model_disp = model_name

        print(f"🤖 Generation\n"
              f"────────────────────────────\n"
              f"Model      {model_disp}\n"
              f"Latency    {t_generation_s:.2f} s\n"
              f"Tokens     {token_count_est}\n")

        t_generation = t_generation_ms

        # Calculate a mock confidence score based on average rerank scores
        # We normalize CrossEncoder logit scores roughly to a percentage
        avg_score = sum(r.score for r in reranked_results) / len(reranked_results)
        # Normalization approximation
        confidence = min(0.99, max(0.1, 1.0 / (1.0 + 2.0 ** -avg_score)))

        # 5. Yield final explainability event
        yield {
            "type": "explain",
            "content": {
                "confidence": round(confidence * 100, 2),
                "retrieved_chunks": retrieved_details,
                "reranked_chunks": reranked_details,
                "latencies": {
                    "retrieval_ms": round(t_retrieval, 2),
                    "reranking_ms": round(t_reranking, 2),
                    "generation_ms": round(t_generation, 2),
                    "total_ms": round((time.perf_counter() - t_start) * 1000, 2),
                },
                "model_info": self.llm.get_model_info()._asdict(),
            }
        }
