"""Validated runtime settings loaded from environment or backend/.env."""

from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path

from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env", override=False)


def _bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_env: str = "development"
    api_key: str = "dev-key-change-this"
    cors_origins: tuple[str, ...] = ("http://localhost:3000",)
    upload_dir: Path = ROOT / "data" / "uploads"
    mongodb_uri: str | None = None
    mongodb_database: str = "terabox"
    max_upload_size_mb: int = 20
    max_text_chars: int = 2_000_000
    hf_token: str | None = None
    hf_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimensions: int = 384
    enable_semantic: bool = False
    allow_external_ai: bool = False
    groq_api_key: str | None = None
    groq_model: str = "openai/gpt-oss-120b"
    agent_enabled: bool = True
    agent_model: str = "groq:openai/gpt-oss-120b"
    agent_timeout_seconds: int = 60
    agent_max_tool_calls: int = 6
    vector_store: str = "none"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = None
    qdrant_collection: str = "passage_embeddings"
    web_search_provider: str = "none"
    tavily_api_key: str | None = None
    allow_external_search: bool = False
    web_search_max_results: int = 5

    @classmethod
    def from_env(cls) -> "Settings":
        cors = tuple(item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if item.strip())
        try:
            settings = cls(
                app_env=os.getenv("APP_ENV", "development").strip().lower(),
                api_key=os.getenv("API_KEY", "dev-key-change-this"),
                cors_origins=cors,
                upload_dir=Path(os.getenv("UPLOAD_DIR", str(ROOT / "data" / "uploads"))).expanduser(),
                mongodb_uri=os.getenv("MONGODB_URI") or None,
                mongodb_database=os.getenv("MONGODB_DATABASE", "terabox"),
                max_upload_size_mb=int(os.getenv("MAX_UPLOAD_SIZE_MB", "20")),
                max_text_chars=int(os.getenv("MAX_TEXT_CHARS", "2000000")),
                hf_token=os.getenv("HF_TOKEN") or None,
                hf_embedding_model=os.getenv("HF_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
                embedding_dimensions=int(os.getenv("EMBEDDING_DIMENSIONS", "384")),
                enable_semantic=_bool("ENABLE_SEMANTIC", False),
                allow_external_ai=_bool("ALLOW_EXTERNAL_AI", False),
                groq_api_key=os.getenv("GROQ_API_KEY") or None,
                groq_model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
                agent_enabled=_bool("AGENT_ENABLED", True),
                agent_model=os.getenv("AGENT_MODEL", "groq:openai/gpt-oss-120b"),
                agent_timeout_seconds=int(os.getenv("AGENT_TIMEOUT_SECONDS", "60")),
                agent_max_tool_calls=int(os.getenv("AGENT_MAX_TOOL_CALLS", "6")),
                vector_store=os.getenv("VECTOR_STORE", "none").strip().lower(),
                qdrant_url=os.getenv("QDRANT_URL", "http://localhost:6333"),
                qdrant_api_key=os.getenv("QDRANT_API_KEY") or None,
                qdrant_collection=os.getenv("QDRANT_COLLECTION", "passage_embeddings"),
                web_search_provider=os.getenv("WEB_SEARCH_PROVIDER", "none").strip().lower(),
                tavily_api_key=os.getenv("TAVILY_API_KEY") or None,
                allow_external_search=_bool("ALLOW_EXTERNAL_SEARCH", False),
                web_search_max_results=int(os.getenv("WEB_SEARCH_MAX_RESULTS", "5")),
            )
        except ValueError as exc:
            raise ValueError(f"Invalid environment setting: {exc}") from exc
        settings.validate()
        return settings

    def validate(self) -> None:
        if self.app_env not in {"development", "test", "production"}:
            raise ValueError("APP_ENV must be development, test, or production")
        if self.max_upload_size_mb < 1 or self.max_text_chars < 1:
            raise ValueError("Upload and text limits must be positive")
        if self.agent_timeout_seconds < 1 or self.agent_max_tool_calls < 1:
            raise ValueError("Agent timeout and tool-call limit must be positive")
        if self.embedding_dimensions < 1:
            raise ValueError("EMBEDDING_DIMENSIONS must be positive")
        if self.vector_store not in {"none", "qdrant"}:
            raise ValueError("VECTOR_STORE must be none or qdrant")
        if self.web_search_provider not in {"none", "tavily"}:
            raise ValueError("WEB_SEARCH_PROVIDER must be none or tavily")
        if self.web_search_provider == "tavily" and not self.tavily_api_key:
            raise ValueError("TAVILY_API_KEY is required when WEB_SEARCH_PROVIDER=tavily")
        if self.app_env == "production":
            if len(self.api_key) < 32 or self.api_key == "dev-key-change-this":
                raise ValueError("Production requires a unique API_KEY of at least 32 characters")
            if "*" in self.cors_origins:
                raise ValueError("Wildcard CORS is not allowed in production")
            if self.vector_store == "qdrant" and not self.qdrant_api_key:
                raise ValueError("Production Qdrant requires QDRANT_API_KEY")


def get_settings() -> Settings:
    return Settings.from_env()
