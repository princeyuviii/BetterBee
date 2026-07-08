# 🐝 BetterBee

**Your team's private AI workspace for trustworthy knowledge retrieval and document intelligence.**

> The project is designed using interchangeable AI components. Embedding models, rerankers, vector databases, and LLM providers can be swapped without modifying business logic.

---

## What is BetterBee?

BetterBee is a production-ready SaaS application that enables teams to securely organize, search, and interact with their internal knowledge using AI.

Users upload documents once. The platform indexes them asynchronously. Users ask questions in natural language. The system retrieves relevant information, reranks it, generates grounded answers, and always includes citations with full explainability.

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Framer Motion |
| **Backend** | FastAPI, Python 3.12+, SQLAlchemy 2.0 (async), Pydantic, Alembic |
| **Authentication** | Clerk (Google, GitHub, Email) |
| **Database** | Supabase PostgreSQL |
| **Vector Store** | ChromaDB (Persistent Client) |
| **Storage** | AWS S3 |
| **AI Providers** | Groq, Ollama, OpenAI, Anthropic, Gemini (swappable via config) |
| **Background Jobs** | Celery + Redis |
| **Observability** | structlog, Request IDs, Health Checks, Latency Metrics |

---

## Architecture

```
Frontend (Next.js 15)  →  Backend (FastAPI)  →  PostgreSQL (Supabase)
                                ↓
                          RAG Pipeline
                       ┌───────┴───────┐
                  LLM Interface    VectorStore Interface
                       │                │
              ┌────────┼────────┐   ChromaDB (Persistent)
              │        │        │
           Groq    Ollama    OpenAI
                              Anthropic
                              Gemini
                                ↓
                          Celery Workers  ←  Redis
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (for Redis)
- Ollama (for local LLM inference)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd Better

# 2. Copy environment variables
cp .env.example backend/.env
cp .env.example frontend/.env.local  # Edit with Clerk keys

# 3. Start infrastructure (Redis)
docker compose up -d

# 4. Setup backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head

# 5. Setup frontend
cd ../frontend
npm install

# 6. Pull Ollama models (if using Ollama)
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# 7. Start development
make dev  # From project root
```

### Individual Services

```bash
make backend   # FastAPI on :8000
make frontend  # Next.js on :3000
make celery    # Celery worker
```

---

## Project Structure

```
BetterBee/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── core/      # Config, auth, middleware, logging
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── repositories/ # Data access
│   │   ├── rag/       # AI pipeline (interface-based)
│   │   ├── prompts/   # Centralized prompt management
│   │   └── workers/   # Celery tasks
│   └── tests/
├── frontend/          # Next.js 15 application
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── providers/
│       ├── services/
│       ├── stores/
│       └── types/
├── docker/            # Dockerfiles
├── docs/              # Documentation
└── scripts/           # Setup & utility scripts
```

---

## Architecture Principles

- **Dependency Injection** — Services receive dependencies via constructors / `Depends()`
- **Repository Pattern** — All DB access through repository classes
- **Service Layer** — Business logic in `services/`, routes are thin
- **SOLID** — Single responsibility, open/closed, interface segregation
- **Interface-Based Design** — All external integrations behind ABCs
- **Provider Abstraction** — Swap LLM/embedding/vector store via config
- **Async-First** — All I/O uses `async/await`
- **Feature-First Organization** — Code grouped by domain

---

## License

MIT
