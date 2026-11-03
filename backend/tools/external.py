"""PydanticAI entry point for the configured external review providers."""

from typing import Any

from pydantic_ai import RunContext

from external_tools import run_all_checks
from tools.context import AgentDependencies


def run_external_provider_checks(ctx: RunContext[AgentDependencies]) -> dict[str, Any]:
    """Run all applicable AI, web, or code providers in parallel for the active submission."""
    ctx.deps.invoked_tools.append("run_external_provider_checks")
    submission = ctx.deps.repository.get_submission(ctx.deps.submission_id)
    if submission is None:
        return {"error": "Submission not found"}
    return {"checks": run_all_checks(submission, ctx.deps.repository, ctx.deps.pipeline, ctx.deps.settings)}
