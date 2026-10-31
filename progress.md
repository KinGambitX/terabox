# Project Progress

## Product report

- Reworked `PRDODUCT.Md` into a software-only document and source-code plagiarism review platform.
- Removed the multisensor IoT, hardware prototype, and classroom behaviour monitoring design.
- Specified comparisons between uploaded submissions and candidate public web sources.
- Described TF-IDF lexical similarity, hosted Hugging Face semantic inference, and normalized token-based code comparison.
- Added Groq as an optional evidence-grounded explanation service, with optional LangChain orchestration; model explanations do not calculate similarity or decide misconduct.
- Added web-source provenance, privacy/security constraints, evaluation plans, and appendices for data, testing, processing, reporting, and risks.
- Kept performance measures as planned evaluation until actual test results are available.

## Repository organization

- Moved the Next.js application, components, static assets, package manifests, TypeScript settings, lint configuration, and app README into `frontend/`.
- Moved the three visual reference images into `design/`.
- Configured `backend/` for plagiarism analysis and AI integrations only; Next.js owns the web API, authentication, submissions, persistence, and reports.
- Added `backend/requirements.txt` and created `backend/.venv` with dependencies for TF-IDF, document extraction, code tokenization, hosted Hugging Face and Groq APIs, and LangChain integrations.
- Kept local embedding-model packages out of the environment; no PyTorch or `sentence-transformers` is installed. The installed analysis and integration packages passed an import check.
