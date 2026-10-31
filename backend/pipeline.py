"""Upload-to-evidence analysis orchestration."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import uuid

from code_similarity import compare_code
from repository import Repository
from semantic import cosine_score, embed_text
from settings import Settings
from similarity import compare_text
from vector_store import create_vector_store
from web_search import search_candidates


class AnalysisPipeline:
    def __init__(self, repository: Repository, settings: Settings):
        self.repository = repository
        self.settings = settings

    def analyze_submission(self, submission_id: str) -> list[dict]:
        current = self.repository.get_submission(submission_id)
        if current is None:
            raise LookupError("Submission not found")
        comparables = self.repository.comparable_submissions(submission_id, current["content_type"])
        if current["content_type"] == "code":
            comparables = [row for row in comparables if row.get("language") == current.get("language")]
        output: list[dict] = []
        vector = None
        model = None
        if self.settings.enable_semantic and self.settings.allow_external_ai and current["content_type"] == "document":
            vector, model = embed_text(current["extracted_text"], self.settings)
            self.repository.save_embedding(submission_id, vector, model)
            output.extend(self._semantic_results(current, comparables, vector, model))
            self._persist_vector(submission_id, current, vector, model)
        for source in comparables:
            if current["content_type"] == "document":
                result = compare_text(current["extracted_text"], source["extracted_text"])
            else:
                result = compare_code(current["extracted_text"], source["extracted_text"], current["language"] or "unknown")
            output.append(self._result_row(current["id"], source["id"], "internal", result))
        self.repository.save_results(output)
        return self.repository.list_results(submission_id=submission_id)

    def _semantic_results(self, current: dict, sources: list[dict], vector: list[float], model: str) -> list[dict]:
        rows = []
        for source in sources:
            target = source.get("embedding")
            if target is None or source.get("embedding_model") != model:
                target, source_model = embed_text(source["extracted_text"], self.settings)
                self.repository.save_embedding(source["id"], target, source_model)
                self._persist_vector(source["id"], source, target, source_model)
            score = cosine_score(vector, target)
            result = {
                "method": "huggingface_embedding_cosine",
                "model": model,
                "score": round(score, 6),
                "submission_excerpt": current["extracted_text"][:800],
                "source_excerpt": source["extracted_text"][:800],
            }
            rows.append(self._result_row(current["id"], source["id"], "internal", result))
        return rows

    def _persist_vector(self, submission_id: str, submission: dict, vector: list[float], model: str) -> None:
        if self.settings.vector_store == "none":
            return
        store = create_vector_store(self.settings)
        try:
            store.upsert(submission_id, vector, {
                "submission_id": submission_id,
                "filename": submission["filename"],
                "content_type": submission["content_type"],
                "model": model,
            })
        finally:
            store.close()

    def web_search(self, submission_id: str) -> list[dict]:
        submission = self.repository.get_submission(submission_id)
        if submission is None:
            raise LookupError("Submission not found")
        query = submission["extracted_text"][:400]
        candidates = search_candidates(query, self.settings)
        rows = []
        for candidate in candidates:
            result = compare_text(submission["extracted_text"], candidate["content"])
            result.update({
                "provider": "tavily",
                "url": candidate["url"],
                "title": candidate["title"],
                "provider_score": candidate["provider_score"],
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
            })
            rows.append(self._result_row(submission_id, candidate["url"], "web", result))
        self.repository.save_results(rows)
        return self.repository.list_results(submission_id=submission_id)

    @staticmethod
    def _result_row(submission_id: str, source_id: str, source_type: str, result: dict) -> dict:
        method = result["method"]
        stable_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{submission_id}:{source_type}:{source_id}:{method}"))
        return {
            "id": stable_id,
            "submission_id": submission_id,
            "source_id": source_id,
            "source_type": source_type,
            "method": method,
            "score": float(result.get("score", 0)),
            "evidence_json": json.dumps(result, ensure_ascii=False),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
