"""Submission read and deterministic analysis tools."""

from typing import Any

from pydantic_ai import RunContext

from tools.context import AgentDependencies


def inspect_submission(ctx: RunContext[AgentDependencies]) -> dict[str, Any]:
    """Read metadata for the active submission without exposing its full text."""
    ctx.deps.invoked_tools.append("inspect_submission")
    row = ctx.deps.repository.get_submission(ctx.deps.submission_id)
    if row is None:
        return {"error": "Submission not found"}
    return {
        "id": row["id"], "filename": row["filename"], "content_type": row["content_type"],
        "language": row["language"], "created_at": row["created_at"],
        "text_length": len(row["extracted_text"]),
    }


def run_similarity_analysis(ctx: RunContext[AgentDependencies]) -> dict[str, Any]:
    """Run fixed lexical/code/semantic comparisons and return stored evidence."""
    ctx.deps.invoked_tools.append("run_similarity_analysis")
    try:
        results = ctx.deps.pipeline.analyze_submission(ctx.deps.submission_id)
    except LookupError as exc:
        return {"error": str(exc)}
    compact = [{
        "result_id": item["id"], "source_id": item["source_id"], "source_type": item["source_type"],
        "method": item["method"], "score": item["score"], "evidence": item["evidence"],
    } for item in results[:20]]
    return {"submission_id": ctx.deps.submission_id, "result_count": len(results), "results": compact}
