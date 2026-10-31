# Analysis backend

This Python environment is reserved for plagiarism analysis and AI features. It
contains document extraction, lexical and semantic similarity, source-code
tokenization, and optional evidence-grounded explanations.

The Next.js application owns the web API, authentication, authorization,
submission workflow, persistence, and reporting. This backend has no FastAPI
or authentication layer. Pydantic is not a direct dependency or used for API
schemas; the Groq SDK may install it as a transitive dependency.

## Environment setup

From this directory, create and activate the virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

On Windows, activate with `.venv\\Scripts\\activate`.

Configure approved Hugging Face and optional Groq API credentials in the
runtime environment; never commit secrets or submit private work to an
external service without approval. API availability, free-tier limits, and
model access depend on the selected provider and model.

## Dependency roles

- `scikit-learn`: TF-IDF and lexical cosine similarity.
- `huggingface_hub`: call hosted Hugging Face inference APIs for semantic
  comparison; no local model weights are installed.
- `pypdf` and `python-docx`: PDF and DOCX text extraction.
- `tree-sitter-language-pack`: source-code parsing/tokenization support.
- `groq`: optional explanation generation from already-computed evidence.
- `langchain`, `langchain-groq`, and `langchain-huggingface`: optional
  orchestration and provider integrations for the hosted APIs.
- `numpy`: numerical operations used by the analysis pipeline.
