# Project Progress

## Product report

- Reworked `PRDODUCT.Md` into a software-only document and source-code plagiarism review platform.
- Removed the multisensor IoT, hardware prototype, and classroom behaviour monitoring design.
- Specified comparisons between uploaded submissions and candidate public web sources.
- Described TF-IDF lexical similarity, hosted Hugging Face semantic inference, and normalized token-based code comparison.
- Added Groq as an optional evidence-grounded explanation service, with optional LangChain orchestration; model explanations do not calculate similarity or decide misconduct.
- Added web-source provenance, privacy/security constraints, evaluation plans, and appendices for data, testing, processing, reporting, and risks.
- Kept performance measures as planned evaluation until actual test results are available.
- Updated `PRDODUCT.Md` to match the implemented Next.js/FastAPI/MongoDB Atlas/Qdrant/PydanticAI architecture, local sentence-transformers inference, and optional Groq gating. Added SourceLens as the app name and recorded prototype checks separately from formal accuracy evaluation.

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

## Frontend visual direction update — 2026-11-01

- Switched the frontend to the supplied dark visual reference: near-black canvas, charcoal surfaces, subtle dividers, Inter typography, and restrained blue data accents.
- Built the public landing header with the reusable white radial `BrandButton` linking to `/workspace`.
- Reworked `/design-system` to document the dark palette, white pill action, and mascot logo system.
- Added the reusable `SourceLensLogo` and `SiftMascot` components, with Sift as the named SourceLens mascot, and updated the static logo and app icon.
- Applied the new surface, text, divider, and button tokens to the existing workspace styles and updated `AGENTS.md` with the new visual standards.
- Added the centered SourceLens hero with a responsive sample review interface and Documents / Source code / Web sources selector.
- Installed `torph` and used `TextMorph` for the user-selected hero phrase, with reduced-motion support and no automatic cycling.
- Added a reduced-motion-aware moving pill to the hero selector and widened the workspace dashboard layout.
- Extended the design-system palette with restrained source and review-state colors used in the hero and dashboard.
- Rebuilt the landing product preview as a taller, wider review dashboard with weekly summary, submission queue, passage comparison, ranked sources, and recent activity.
- Used the shared `BrandButton`, Torph for user-selected score and heading changes, and distinct danger, warning, success, and source-type colors for meaningful review states.
- Reworked `/workspace` around the supplied Unsplash mountain image with a wider light dashboard shell, an evidence review queue, a status summary, and responsive navigation; kept all example records labeled as examples.
- Kept landing preview content fixed when modes change; only the user-selected headline phrase morphs through Torph. The selector pill uses a direct transform spring and respects reduced motion.
- Installed and applied Hallmark app-screen guidance. Hallmark kept-content scan reports 0 failures, 0 reflexes, and 0 warnings; lint, TypeScript, and diff checks pass.
- Follow-up: removed the mountain image and photo credit, and changed the workspace shell to an edge-to-edge, viewport-height dashboard.
- Follow-up: placed the supplied mountain image in the workspace hero only, with a masked fade into the copy and clipped rounded panel corners; the page background remains plain.
- Reshaped workspace metrics into one lead summary and a vertical list of three secondary values. Replaced the hand-built chart with accessible Apache ECharts visualizations derived from example review rows. Removed the “Sample workspace” badge, Academic Integrity switcher, and instructor workspace label.
- Replaced the generic submission table and recent-activity panel with a single-column evidence queue, working course/status filters, status pills, and a similarity comparison chart. Kept the sample records marked and removed the CRM-style table styling.
- Added separate Text, Web links, Source code, and Files submission routes, plus a source-library empty state with links into those flows. Forms validate local input and state that the analysis API is not connected, so content is neither sent nor stored.
