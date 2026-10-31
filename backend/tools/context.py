from dataclasses import dataclass, field

from pipeline import AnalysisPipeline
from repository import Repository
from settings import Settings


@dataclass
class AgentDependencies:
    repository: Repository
    pipeline: AnalysisPipeline
    settings: Settings
    submission_id: str
    invoked_tools: list[str] = field(default_factory=list)
