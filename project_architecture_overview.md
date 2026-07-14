# BetterBee: Enterprise RAG Knowledge Engine
### Architecture, Technology Stack, and Engineering Decisions

BetterBee is a secure, multi-tenant Retrieval-Augmented Generation (RAG) knowledge engine that allows users to create private workspaces, upload document libraries, and chat with their files in real time. 

This document explains **what** technologies are used, **how** they are integrated, and the engineering rationale (**why**) behind the architectural design decisions.

---

## 1. The Technology Stack (What is Used)

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15+ (React 19)** | Responsive, forced dark-mode user interface with glassmorphic design, workspace management, document uploading, and real-time chat. |
| **Authentication** | **Clerk** | Secure user management, session handling, and tenant (workspace) separation. |
| **Backend API** | **FastAPI (Python 3.12+)** | High-performance asynchronous REST API serving as the orchestration layer. |
| **Asynchronous Queue** | **Celery + Redis** | Background worker queue (Celery) and message broker (Redis) for parsing files and generating embeddings asynchronously. |
| **Relational Database** | **PostgreSQL (Supabase)** | Stores relational metadata (users, workspaces, document registry, chat sessions, message histories). |
| **Vector Database** | **ChromaDB** | Vector store holding document chunk embeddings and performing semantic similarity retrieval. |
| **File Storage** | **AWS S3** | Cloud object storage hosting the raw documents (PDFs, DOCX, XLSX). |
| **LLM Generator** | **Groq (Llama 3.3)** | Generates grounded answers by processing retrieved document context. |
| **Embeddings** | **HuggingFace (all-MiniLM-L6-v2)** | Converts text chunks into 384-dimensional semantic vectors. |
| **Reranker** | **Cross-Encoder (ms-marco-MiniLM-L-6-v2)** | Re-scores retrieved candidate chunks against the user query for high-precision retrieval. |

---

## 2. System Workflows (How it is Used)

### A. Document Upload & Ingestion Flow
```
[Client (Next.js)] ───(1. Request Presigned URL)───> [FastAPI Backend]
       │                                                    │
(2. Upload Bytes)                                           │
       ▼                                                    ▼
 [AWS S3 Bucket] <────(3. Trigger Background Task)──── [Celery Worker]
                                                            │
                                                   (4. Parse & Chunk)
                                                            ▼
                                                       [ChromaDB]
```
1. **Presigned Upload**: The client asks the backend for a secure S3 pre-signed PUT URL. The client uploads the file directly to **AWS S3**.
2. **Task Queuing**: Once uploaded, the client notifies the API, which registers the document in **PostgreSQL** (status: `uploaded`) and pushes a task to **Redis**.
3. **Background Worker Processing**: The **Celery worker** downloads the file from S3, parses the text (using `pypdf`/`python-docx`), splits it into semantic chunks (1000 tokens, 200 overlap), generates vector embeddings using a local HuggingFace provider, and writes them to **ChromaDB** (status: `indexed`).

### B. Chat & Retrieval (RAG) Flow
1. **User Query**: The user sends a question inside a workspace.
2. **First-Stage Retrieval (Bi-Encoder)**: The backend embeds the query and fetches the **top 20** most similar chunks from **ChromaDB**.
3. **Second-Stage Reranking (Cross-Encoder)**: The top 20 chunks are paired with the query and re-scored using a **Cross-Encoder**. Only the **top 5** highest-scoring chunks are retained.
4. **Context Synthesis**: The system constructs a prompt combining the top 5 chunks, chat history, and the query.
5. **Answer Generation**: The prompt is sent to **Groq (Llama 3.3)** to stream the answer back to the user via Server-Sent Events (SSE).

---

## 3. Engineering Decisions (Why it is Used)

### A. Decoupled Ingestion (Why Celery + Redis?)
* **Decision**: Decoupling file ingestion from the web server.
* **Why**: PDF parsing, text extraction, and vector embedding are highly CPU-bound. If processed inside the FastAPI thread, it would block the Uvicorn workers, slowing down the API for all users and causing gateway timeouts (504s) on large files. Using Celery and Redis guarantees that FastAPI remains fast and responsive.

### B. Presigned S3 Uploads (Why Direct Uploads?)
* **Decision**: Frontend uploads files directly to AWS S3 using presigned URLs.
* **Why**: Routing file uploads through a backend API consumes server memory, disk space, and bandwidth. Direct-to-S3 uploads bypass the backend completely, avoiding server memory bottlenecks and letting S3 handle the file bandwidth scaling.

### C. Two-Stage Retrieval (Why Cross-Encoder Reranking?)
* **Decision**: Applying a Cross-Encoder reranker over vector search results.
* **Why**: Standard vector search (Bi-encoders) calculates document embeddings independently, which can miss fine-grained semantic relations. A Cross-Encoder feeds the query and chunk *together* through self-attention layers, yielding far more accurate relevance scoring. This eliminates irrelevant chunks and reduces LLM hallucinations.

### D. Production Scale Fixes (Why PgBouncer & OOM Optimizations?)
* **Decision 1**: Disabling Asyncpg statement caching (`statement_cache_size=0`).
* **Why**: In production, Supabase uses PgBouncer in transaction pooling mode. PgBouncer routes queries across shared connections dynamically, causing cached prepared statements to break. Disabling the cache allows asyncpg to run smoothly with PgBouncer.
* **Decision 2**: Lazy-importing PyTorch and HuggingFace models inside providers.
* **Why**: Eagerly importing PyTorch at startup consumes over 350MB of RAM, causing the FastAPI server to crash with Out-of-Memory (OOM) errors on 512MB RAM cloud containers. Moving these imports inside a `_lazy_load()` method keeps the baseline startup RAM under 80MB.
