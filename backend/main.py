"""TeraBox analysis API."""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import hmac
import logging
from pathlib import Path
import uuid
from typing import Literal

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from documents import SUPPORTED_TYPES, extract_content
from explanations import explain
from pipeline import AnalysisPipeline
from repository import Repository
from semantic import embed_text
from settings import Settings, get_settings
from vector_store import create_vector_store


logger = logging.getLogger("terabox.api")
class ReviewUpdate(BaseModel):
    status: Literal["pending", "reviewed", "relevant", "dismissed"]
    note: str | None = Field(default=None, max_length=4000)


class VectorSearchRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    limit: int = Field(default=10, ge=1, le=100)


class AgentRequest(BaseModel):
    submission_id: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=6000)


def create_app(settings: Settings | None = None, repository: Repository | None = None) -> FastAPI:
    config = settings or get_settings()
    config.validate()
    repo = repository or Repository(config.mongodb_uri, config.mongodb_database)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        config.upload_dir.mkdir(parents=True, exist_ok=True)
        repo.initialize()
        yield

    app = FastAPI(
        title="TeraBox Analysis API",
        version="1.0.0",
        description="Authenticated document and source-code similarity analysis service.",
        docs_url=None if config.app_env == "production" else "/docs",
        redoc_url=None if config.app_env == "production" else "/redoc",
        openapi_url=None if config.app_env == "production" else "/openapi.json",
        lifespan=lifespan,
    )
    app.state.settings = config
    app.state.repository = repo
    app.state.pipeline = AnalysisPipeline(repo, config)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(config.cors_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-API-Key"],
    )

    def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
        if not x_api_key or not hmac.compare_digest(x_api_key, config.api_key):
            raise HTTPException(status_code=401, detail="Valid X-API-Key header required")

    def public_submission(row: dict) -> dict:
        return {
            "id": row["id"], "filename": row["filename"], "content_type": row["content_type"],
            "language": row.get("language"), "created_at": row["created_at"],
            "text_length": len(row.get("extracted_text", "")),
        }

    @app.get("/healthz", tags=["system"])
    def healthz():
        return {"status": "ok", "service": "terabox-analysis"}

    @app.get("/readyz", tags=["system"], dependencies=[Depends(require_api_key)])
    def readyz():
        try:
            repo.list_submissions()
            if config.vector_store != "none":
                store = create_vector_store(config)
                store.close()
        except Exception as exc:
            logger.exception("Database readiness check failed")
            raise HTTPException(status_code=503, detail="A configured persistence service is unavailable") from exc
        return {"status": "ready", "database": "ok", "vector_store": config.vector_store}

    @app.post("/api/v1/submissions", tags=["submissions"], dependencies=[Depends(require_api_key)])
    def upload_submission(file: UploadFile = File(...)):
        filename = Path((file.filename or "upload").replace("\\", "/")).name
        if Path(filename).suffix.lower() not in SUPPORTED_TYPES:
            raise HTTPException(status_code=415, detail="Unsupported file type")
        max_bytes = config.max_upload_size_mb * 1024 * 1024
        content = file.file.read(max_bytes + 1)
        if len(content) > max_bytes:
            raise HTTPException(status_code=413, detail=f"File exceeds {config.max_upload_size_mb} MB limit")
        try:
            extracted, content_type, language = extract_content(filename, content, config.max_text_chars)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        submission_id = str(uuid.uuid4())
        destination = config.upload_dir / f"{submission_id}{Path(filename).suffix.lower()}"
        try:
            destination.write_bytes(content)
            repo.add_submission({
                "id": submission_id, "filename": filename, "content_type": content_type,
                "language": language, "extracted_text": extracted, "file_path": str(destination),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            results = app.state.pipeline.analyze_submission(submission_id)
        except Exception as exc:
            logger.exception("Submission pipeline failed for %s", submission_id)
            raise HTTPException(status_code=502, detail="Submission saved but analysis pipeline failed") from exc
        return {"submission": public_submission(repo.get_submission(submission_id)), "results": results}

    @app.get("/api/v1/submissions", tags=["submissions"], dependencies=[Depends(require_api_key)])
    def list_submissions(content_type: str | None = Query(default=None, pattern="^(document|code)$")):
        return {"items": repo.list_submissions(content_type=content_type)}

    @app.get("/api/v1/submissions/{submission_id}", tags=["submissions"], dependencies=[Depends(require_api_key)])
    def get_submission(submission_id: str):
        row = repo.get_submission(submission_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Submission not found")
        return public_submission(row)

    @app.delete("/api/v1/submissions/{submission_id}", tags=["submissions"], dependencies=[Depends(require_api_key)])
    def delete_submission(submission_id: str):
        row = repo.delete_submission(submission_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Submission not found")
        try:
            Path(row["file_path"]).unlink(missing_ok=True)
        except OSError:
            logger.exception("Could not remove stored file for %s", submission_id)
        return {"deleted": submission_id}

    @app.post("/api/v1/analyses/{submission_id}", tags=["analysis"], dependencies=[Depends(require_api_key)])
    def analyze_submission(submission_id: str):
        try:
            results = app.state.pipeline.analyze_submission(submission_id)
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("Analysis failed for %s", submission_id)
            raise HTTPException(status_code=502, detail="Analysis pipeline failed") from exc
        return {"submission_id": submission_id, "results": results}

    @app.get("/api/v1/results", tags=["results"], dependencies=[Depends(require_api_key)])
    def list_results(submission_id: str | None = None):
        return {"items": repo.list_results(submission_id=submission_id)}

    @app.get("/api/v1/results/{result_id}", tags=["results"], dependencies=[Depends(require_api_key)])
    def get_result(result_id: str):
        result = repo.get_result(result_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Result not found")
        return result

    @app.patch("/api/v1/results/{result_id}/review", tags=["results"], dependencies=[Depends(require_api_key)])
    def review_result(result_id: str, update: ReviewUpdate):
        result = repo.review_result(result_id, update.status, update.note)
        if result is None:
            raise HTTPException(status_code=404, detail="Result not found")
        return result

    @app.post("/api/v1/results/{result_id}/explanation", tags=["AI"], dependencies=[Depends(require_api_key)])
    def explain_result(result_id: str):
        result = repo.get_result(result_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Result not found")
        try:
            explanation, model = explain({"method": result["method"], "score": result["score"],
                                          "evidence": result["evidence"]}, config)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("Explanation provider failed")
            raise HTTPException(status_code=502, detail="Explanation provider failed") from exc
        repo.save_explanation(result_id, explanation, model)
        return {"result_id": result_id, "model": model, "generated": True, "text": explanation}

    @app.post("/api/v1/analyses/{submission_id}/web-search", tags=["web"], dependencies=[Depends(require_api_key)])
    def web_search(submission_id: str):
        try:
            results = app.state.pipeline.web_search(submission_id)
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("Web search provider failed")
            raise HTTPException(status_code=502, detail="Web search provider failed") from exc
        return {"submission_id": submission_id, "results": results}

    @app.post("/api/v1/vectors/search", tags=["vectors"], dependencies=[Depends(require_api_key)])
    def vector_search(body: VectorSearchRequest):
        if not config.enable_semantic:
            raise HTTPException(status_code=503, detail="Semantic embedding is disabled")
        try:
            vector, model = embed_text(body.text, config)
            store = create_vector_store(config)
            try:
                matches = store.search(vector, body.limit)
            finally:
                store.close()
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("Vector search failed")
            raise HTTPException(status_code=502, detail="Vector search failed") from exc
        return {"model": model, "items": matches}

    @app.post("/api/v1/agent/run", tags=["agent"], dependencies=[Depends(require_api_key)])
    async def run_agent(body: AgentRequest):
        if not config.agent_enabled:
            raise HTTPException(status_code=503, detail="Agent is disabled")
        if not config.allow_external_ai:
            raise HTTPException(status_code=503, detail="Set ALLOW_EXTERNAL_AI=true to send evidence to the agent model")
        if not config.groq_api_key:
            raise HTTPException(status_code=503, detail="GROQ_API_KEY is not configured")
        if repo.get_submission(body.submission_id) is None:
            raise HTTPException(status_code=404, detail="Submission not found")
        from agents.academic_integrity import build_agent, usage_limits
        from tools.context import AgentDependencies

        agent = build_agent(config)
        dependencies = AgentDependencies(repo, app.state.pipeline, config, body.submission_id)
        prompt = f"Active submission: {body.submission_id}\nReviewer request: {body.message}"
        try:
            async with agent:
                result = await agent.run(
                    prompt,
                    deps=dependencies,
                    usage_limits=usage_limits(config),
                    timeout=config.agent_timeout_seconds,
                )
        except Exception as exc:
            logger.exception("Agent run failed for submission %s", body.submission_id)
            raise HTTPException(status_code=502, detail="Agent run failed; inspect server logs") from exc
        logger.info("Agent run completed for %s; tools=%s requests=%s",
                    body.submission_id, dependencies.invoked_tools, result.usage.requests)
        return {
            "submission_id": body.submission_id,
            "model": config.agent_model,
            "report": result.output.model_dump(mode="json"),
            "tools_invoked": dependencies.invoked_tools,
            "usage": {"requests": result.usage.requests, "tool_calls": result.usage.tool_calls},
        }

    return app


app = create_app()
