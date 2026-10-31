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
- Installed the PydanticAI package and its official `building-pydantic-ai-agents` skill. Model API access remains unconfigured until the project owner adds `GROQ_API_KEY` and opts into `ALLOW_EXTERNAL_AI`.
- Selected Qdrant and added `backend/docker-compose.yml`; local Qdrant v1.20.0 is running on loopback and its upsert/search/delete path was exercised.
- Added `backend/.env.example` and an ignored local `backend/.env`. The local config selects Qdrant; Hugging Face embeddings, Groq calls, and Tavily search remain explicitly gated.
- Added route and agent tool-call tests. Current result: 6 tests pass; no live model API key has been used.
