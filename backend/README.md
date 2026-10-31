# TeraBox Analysis API

Authenticated FastAPI service for document and source-code similarity review.
It stores source files and metadata locally, extracts supported formats,
compares each new submission with prior submissions of the same type, and
returns evidence and method-specific scores. Hugging Face embeddings run locally
when enabled. Groq, web search, and vector persistence are optional integrations.

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
the key in the `X-API-Key` header. MongoDB Atlas stores submission and review
records. Set `MONGODB_URI` in `.env` before starting the backend. Original files
remain in `backend/data/uploads/`. The environment example selects Qdrant; start
its local container before using vector retrieval:

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

Copy `.env.example` to `.env`, set `MONGODB_URI` to the Atlas connection string,
and set `MONGODB_DATABASE` to the application database name. Local `.env` is
ignored by Git. In deployed environments, inject secrets through the
platform's secret manager instead.

- `API_KEY` protects all data routes. Keep it on a trusted server; do not ship
  it to browser JavaScript. The Next.js server should call this API.
- `APP_ENV=production` requires a unique API key of at least 32 characters and
  rejects wildcard CORS. Set `CORS_ORIGINS` to trusted origins.
- `MONGODB_URI` and `MONGODB_DATABASE` configure MongoDB Atlas. `UPLOAD_DIR`,
  `MAX_UPLOAD_SIZE_MB`, and `MAX_TEXT_CHARS` configure local file storage and
  input limits. Use a persistent object store for uploads when deploying.
- Semantic embeddings run locally when `ENABLE_SEMANTIC=true`; the model weights
  download from Hugging Face on first use. `HF_TOKEN` is optional for model
  downloads and does not enable paid hosted inference. Set the model name and its
  exact `EMBEDDING_DIMENSIONS`. Local embedding calls do not send submission text
  to Hugging Face.
- Groq explanations require `ALLOW_EXTERNAL_AI=true` and `GROQ_API_KEY`.
- The PydanticAI agent uses `AGENT_MODEL`, `AGENT_TIMEOUT_SECONDS`, and
  `AGENT_MAX_TOOL_CALLS`. The default model is Groq's current GPT-OSS 120B
  tool-calling model; the `/agent/run` route requires `GROQ_API_KEY` and
  `ALLOW_EXTERNAL_AI=true` because its prompt may include returned evidence.
  Semantic embeddings are computed locally and only require `ENABLE_SEMANTIC=true`.
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
returns token ranges. Local Hugging Face semantic embeddings store
model-specific vectors in Qdrant and calculate cosine similarity. Scores are
method-specific review signals, not probabilities or misconduct decisions.
Review states are stored separately from machine evidence.

MongoDB Atlas stores application metadata; Qdrant stores semantic vectors.
Original uploads still use local file storage and need a persistent AWS object
store before containers can be replaced or scaled across instances. Also add
per-user authorization, backups, malware scanning, retention policy, and
monitoring. API-key authentication is intended for trusted server-to-server
access, not direct public browser access.
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

Repository tests use an in-memory MongoDB mock. External-provider success paths
are exercised with fakes. Live Atlas, Groq, Tavily, or Qdrant
credentials/services are not needed by tests.
