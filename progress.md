# Project Progress

## Product report

- Reworked `PRDODUCT.Md` into a software-only document and source-code plagiarism review platform.
- Removed the multisensor IoT, hardware prototype, and classroom behaviour monitoring design.
- Specified comparisons between uploaded submissions and candidate public web sources.
- Described TF-IDF lexical similarity, hosted Hugging Face semantic inference, and normalized token-based code comparison.
- Added Groq as an optional evidence-grounded explanation service, with optional LangChain orchestration; model explanations do not calculate similarity or decide misconduct.
- Added web-source provenance, privacy/security constraints, evaluation plans, and appendices for data, testing, processing, reporting, and risks.
- Kept performance measures as planned evaluation until actual test results are available.
- The report still describes its original Node.js/Next API and optional LangChain/Groq explanation proposal; reconcile those sections with the implemented FastAPI/PydanticAI/Qdrant backend before final submission.

## Repository organization

- Moved the Next.js application, components, static assets, package manifests, TypeScript settings, lint configuration, and app README into `frontend/`.
- Moved the three visual reference images into `design/`.
- Replaced the initial analysis-only backend with a FastAPI service in `backend/`; Next.js can call its authenticated `/api/v1` routes server-to-server.
- Added upload, extraction, lexical/code comparison, persistence, analysis, review, web-candidate, vector-search, and agent-run routes.
- Added a PydanticAI review coordinator with scoped tools under `backend/tools/` and agent code under `backend/agents/`. It can inspect submissions, run deterministic comparisons, retrieve from Qdrant, and search public candidates when explicitly requested; it cannot change reviewer decisions.
- Installed the PydanticAI package and its official `building-pydantic-ai-agents` skill. Groq access is configured and the live agent smoke test passed; external calls remain gated by `ALLOW_EXTERNAL_AI`.
- Installed the `logo-design` skill from `kaankiziltug/logo-design-skill` at `.agents/skills/logo-design/`; it includes design references, SVG review and testing scripts, and logo asset export tools.
- Selected Qdrant and added `backend/docker-compose.yml`; local Qdrant v1.20.0 is running on loopback and its upsert/search/delete path was exercised.
- Added `backend/.env.example` and an ignored local `backend/.env`. Atlas, Qdrant, local embeddings, and optional provider settings are configured there; secrets stay out of Git.
- Added route and agent tool-call tests. Unit tests use mocked database/provider services; live Atlas, Qdrant, Groq, Tavily, and local embedding checks have been performed.

## Backend database and API update — 2026-10-31

- Replaced SQLite metadata persistence with MongoDB in the FastAPI backend. MongoDB Atlas is the only submission/result/review database; Next.js must call FastAPI rather than connect to Atlas directly.
- Kept Qdrant as the separate vector store. Semantic vectors are written from locally computed Hugging Face model embeddings.
- Added `backend/API.md` with frontend connection guidance, all API routes, request/response examples, MongoDB document fields, Qdrant responsibilities, and AWS deployment notes.
- Updated `backend/.env.example` and local `backend/.env` with `MONGODB_URI` and `MONGODB_DATABASE`. Atlas connectivity has now been verified from the running API.
- Started the FastAPI server at `http://127.0.0.1:8012` against the configured Atlas cluster. Uploaded two labeled synthetic documents and retained them for inspection. Atlas saved both submissions and two report rows for the candidate; Qdrant contains vectors for both.
- Authenticated `/readyz` passed. Live report scores: TF-IDF `0.964`, local Hugging Face semantic `0.883`. Candidate submission ID: `6bbb18db-4c09-49e8-abb0-3bcf829b2a63`; report can be read from `/api/v1/results?submission_id=<id>`.
- Hosted Hugging Face Inference returned HTTP 402 due exhausted credits; embeddings now run locally on CPU with the public 384-dimensional model. The model downloaded and produced valid embeddings without using inference credits; submission text is not sent to hosted inference.
- Backend test suite: 8 passed; `pip check` is clean. Local sentence-transformers inference avoids hosted Hugging Face inference credits; the hosted endpoint had returned HTTP 402 before the switch.
