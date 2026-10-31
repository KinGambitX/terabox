"""Qdrant and public candidate retrieval tools."""

from typing import Any

from pydantic_ai import RunContext

from semantic import embed_text
from tools.context import AgentDependencies
from vector_store import create_vector_store


def search_related_submissions(ctx: RunContext[AgentDependencies], limit: int = 5) -> dict[str, Any]:
    """Retrieve nearest indexed submissions from the selected vector database."""
    ctx.deps.invoked_tools.append("search_related_submissions")
    settings = ctx.deps.settings
    if settings.vector_store != "qdrant":
        return {"error": "The agent's related-submission tool is configured for Qdrant"}
    if not 1 <= limit <= 20:
        return {"error": "limit must be between 1 and 20"}
    submission = ctx.deps.repository.get_submission(ctx.deps.submission_id)
    if submission is None:
        return {"error": "Submission not found"}
    embedding = submission.get("embedding")
    model = submission.get("embedding_model")
    try:
        if embedding is None or not model:
            embedding, model = embed_text(submission["extracted_text"], settings)
            ctx.deps.repository.save_embedding(submission["id"], embedding, model)
        store = create_vector_store(settings)
        try:
            matches = store.search(embedding, limit + 1)
            if not any(match.get("vector_id") == submission["id"] for match in matches):
                store.upsert(submission["id"], embedding, {
                    "submission_id": submission["id"], "filename": submission["filename"],
                    "content_type": submission["content_type"], "model": model,
                })
                matches = store.search(embedding, limit + 1)
        finally:
            store.close()
    except Exception as exc:
        return {"error": f"Vector retrieval unavailable: {type(exc).__name__}"}
    return {"model": model, "matches": [
        match for match in matches if match.get("vector_id") != submission["id"]
    ][:limit]}


def search_public_sources(ctx: RunContext[AgentDependencies]) -> dict[str, Any]:
    """Search public-web candidates only when external search is explicitly enabled."""
    ctx.deps.invoked_tools.append("search_public_sources")
    try:
        results = ctx.deps.pipeline.web_search(ctx.deps.submission_id)
    except Exception as exc:
        return {"error": f"Public search unavailable: {type(exc).__name__}"}
    return {"results": [{
        "result_id": item["id"], "url": item["source_id"], "score": item["score"],
        "method": item["method"], "evidence": item["evidence"],
    } for item in results if item["source_type"] == "web"]}
