# TeraBox Analysis API

Authenticated FastAPI service for document and source-code similarity review.
It stores source files and metadata locally, extracts supported formats,
compares each new submission with prior submissions of the same type, and
returns evidence and method-specific scores. Hugging Face, Groq, web search,
and vector persistence are optional integrations and are disabled unless
explicitly configured.

## Local setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Set a private local `API_KEY` in `.env`. The template contains a development
placeholder; production startup rejects it. Start the service with:

```bash
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
```

Interactive docs are at `http://127.0.0.1:8000/docs` outside production. Send
the key in the `X-API-Key` header. The default store is local SQLite plus local
file storage under `backend/data/`. The checked-in environment example selects
Qdrant; start its local container before using vector retrieval:

```bash
docker compose up -d qdrant
```

```bash
curl -H 'X-API-Key: your-local-key' http://127.0.0.1:8000/api/v1/submissions
curl -H 'X-API-Key: your-local-key' -F 'file=@assignment.pdf' \
  http://127.0.0.1:8000/api/v1/submissions
curl -H 'X-API-Key: your-local-key' -H 'Content-Type: application/json' \
  -d '{"submission_id":"YOUR_SUBMISSION_ID","message":"Compare this submission with prior work."}' \
  http://127.0.0.1:8000/api/v1/agent/run
```

## Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/healthz` | Liveness check; no key required |
| GET | `/readyz` | Authenticated readiness/database check |
| POST | `/api/v1/submissions` | Validate, save, extract and analyze a file |
| GET | `/api/v1/submissions` | List metadata; optional `content_type=document|code` |
| GET | `/api/v1/submissions/{id}` | Get submission metadata |
| DELETE | `/api/v1/submissions/{id}` | Delete source file and associated results |
| POST | `/api/v1/analyses/{id}` | Re-run internal comparisons |
| POST | `/api/v1/analyses/{id}/web-search` | Search public candidates and compare provider excerpts |
| POST | `/api/v1/agent/run` | Run the PydanticAI coordinator with bounded tools |
| GET | `/api/v1/results` | List results; optional `submission_id` |
| GET | `/api/v1/results/{id}` | Get one result and evidence |
| PATCH | `/api/v1/results/{id}/review` | Set reviewer status/note |
| POST | `/api/v1/results/{id}/explanation` | Optional evidence-grounded Groq summary |
| POST | `/api/v1/vectors/search` | Embed text and query configured vector store |

Accepted document formats: TXT, Markdown, PDF, DOCX. Accepted code extensions
and parser languages are listed in `documents.py`. Scanned PDFs without an
embedded text layer return a clear extraction error; OCR is not bundled.

## Environment

Copy `.env.example` to `.env`. Local `.env` is ignored by Git. In deployed
environments, inject secrets through the platform's secret manager instead.

- `API_KEY` protects all data routes. Keep it on a trusted server; do not ship
  it to browser JavaScript. The Next.js server should call this API.
- `APP_ENV=production` requires a unique API key of at least 32 characters and
  rejects wildcard CORS. Set `CORS_ORIGINS` to trusted origins.
- `DB_PATH`, `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB`, and `MAX_TEXT_CHARS` configure
  local persistence and input limits. Use persistent encrypted storage and a
  reverse proxy request-size limit when deploying.
- Semantic inference runs only when both `ENABLE_SEMANTIC=true` and
  `ALLOW_EXTERNAL_AI=true`; provide `HF_TOKEN`, `HF_EMBEDDING_MODEL`, and the
  model's exact `EMBEDDING_DIMENSIONS`.
- Groq explanations require `ALLOW_EXTERNAL_AI=true` and `GROQ_API_KEY`.
- The PydanticAI agent uses `AGENT_MODEL`, `AGENT_TIMEOUT_SECONDS`, and
  `AGENT_MAX_TOOL_CALLS`. The default model is Groq's current GPT-OSS 120B
  tool-calling model; the `/agent/run` route requires `GROQ_API_KEY` and
  `ALLOW_EXTERNAL_AI=true` because its prompt may include returned evidence.
  Semantic embeddings additionally require `ENABLE_SEMANTIC=true` and `HF_TOKEN`.
- Qdrant is the only supported vector database. `VECTOR_STORE=qdrant` enables
  it; set `VECTOR_STORE=none` to disable vector persistence. Configure it with
  `QDRANT_URL`, optional `QDRANT_API_KEY`, and `QDRANT_COLLECTION`.
- Public web search runs only when `ALLOW_EXTERNAL_SEARCH=true`,
  `WEB_SEARCH_PROVIDER=tavily`, and `TAVILY_API_KEY` are configured. It sends a
  short excerpt of the submission to Tavily and stores provider excerpts/URLs,
  not a full web crawl.

## Pipeline and boundaries

Lexical document similarity uses TF-IDF cosine similarity and returns matched
passage excerpts. Code similarity compares normalized token sequences and
returns token ranges. Hosted semantic similarity stores model-specific vectors
and calculates cosine similarity. Scores are method-specific review signals,
not probabilities or misconduct decisions. Review states are stored separately
from machine evidence.

This backend currently uses SQLite and local file storage by default. A single
instance with persistent disk is appropriate for development and a small
prototype; multi-instance production should move metadata/files to shared,
managed services and add a job queue, per-user authorization, backups, malware
scanning, retention policy, and monitoring. API-key authentication is intended
for trusted server-to-server access, not direct public browser access.
Agent tools live in `tools/`. They can inspect one active submission, run
deterministic analysis, query Qdrant, and search web candidates only when the
reviewer explicitly requests it. They cannot alter review status. Agent
telemetry stays local: tool names and run errors are logged without exporting
prompts or excerpts to a hosted observability service.

## Tests

Run route and pipeline tests without provider credentials:

```bash
.venv/bin/pytest -q
```

External-provider success paths are exercised with fakes. Live Hugging Face,
Groq, Tavily, or Qdrant credentials/services are not needed by tests.
