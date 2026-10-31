"""Tool-using academic integrity review coordinator."""

from pydantic import BaseModel, Field
from pydantic_ai import Agent, Tool, UsageLimits
from pydantic_ai.capabilities import Caching

from settings import Settings
from tools.retrieval import search_public_sources, search_related_submissions
from tools.submissions import inspect_submission, run_similarity_analysis


class AgentReport(BaseModel):
    summary: str = Field(description="Concise summary grounded in tool results")
    evidence_ids: list[str] = Field(default_factory=list, description="Result IDs supporting the summary")
    suggested_next_steps: list[str] = Field(default_factory=list)
    human_review_required: bool = True


INSTRUCTIONS = """You coordinate evidence review for an academic similarity system.
Use tools to retrieve stored facts and deterministic comparison results; never
invent scores, sources, or excerpts. Similarity is not proof of plagiarism.
Never decide misconduct, infer intent, or change a review status. Keep the
reviewer as the decision-maker. Use Qdrant retrieval when a user asks about
related submissions. Search the public web only when the user explicitly asks
for web sources; that operation may send a short submission excerpt to an
external provider. State when a tool is unavailable or returns no evidence.
Return a concise report with the IDs of results that support it."""


def build_agent(settings: Settings, model: str | None = None) -> Agent:
    """Build an explicitly named, bounded PydanticAI agent for one API run."""
    return Agent(
        model or settings.agent_model,
        name="terabox_integrity_review_agent",
        output_type=AgentReport,
        instructions=INSTRUCTIONS,
        capabilities=[Caching()],
        tools=[
            Tool(inspect_submission),
            Tool(run_similarity_analysis),
            Tool(search_related_submissions),
            Tool(search_public_sources),
        ],
    )


def usage_limits(settings: Settings) -> UsageLimits:
    return UsageLimits(
        request_limit=settings.agent_max_tool_calls + 2,
        tool_calls_limit=settings.agent_max_tool_calls,
    )
