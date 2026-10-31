"""MongoDB persistence for submissions and similarity review records."""

from __future__ import annotations

import json
from typing import Any

from pymongo import ASCENDING, DESCENDING, MongoClient


class Repository:
    def __init__(self, uri: str, database: str, *, client=None):
        self._owns_client = client is None
        self.client = client if client is not None else (
            MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000) if uri else None
        )
        self.database = self.client[database] if self.client is not None else None
        self.submissions = self.database["submissions"] if self.database is not None else None
        self.results = self.database["results"] if self.database is not None else None

    def initialize(self) -> None:
        if self.client is None:
            raise RuntimeError("MONGODB_URI is required; add the MongoDB Atlas URI to backend/.env")
        if self._owns_client:
            self.client.admin.command("ping")
        self.submissions.create_index([("id", ASCENDING)], unique=True)
        self.submissions.create_index([("content_type", ASCENDING), ("created_at", DESCENDING)])
        self.results.create_index([("id", ASCENDING)], unique=True)
        self.results.create_index(
            [("submission_id", ASCENDING), ("source_id", ASCENDING),
             ("source_type", ASCENDING), ("method", ASCENDING)], unique=True,
        )
        self.results.create_index([("submission_id", ASCENDING), ("score", DESCENDING)])

    @staticmethod
    def _without_mongo_id(row: dict[str, Any] | None) -> dict[str, Any] | None:
        if row is not None:
            row.pop("_id", None)
        return row

    def add_submission(self, row: dict[str, Any]) -> None:
        self.submissions.insert_one({**row, "embedding": None, "embedding_model": None})

    def list_submissions(self, *, content_type: str | None = None) -> list[dict[str, Any]]:
        query = {"content_type": content_type} if content_type else {}
        cursor = self.submissions.find(
            query,
            {"_id": 0, "id": 1, "filename": 1, "content_type": 1,
             "language": 1, "created_at": 1},
        ).sort("created_at", DESCENDING)
        return list(cursor)

    def get_submission(self, submission_id: str) -> dict[str, Any] | None:
        return self._without_mongo_id(self.submissions.find_one({"id": submission_id}))

    def comparable_submissions(self, submission_id: str, content_type: str) -> list[dict[str, Any]]:
        rows = self.submissions.find(
            {"id": {"$ne": submission_id}, "content_type": content_type},
        ).sort("created_at", DESCENDING)
        return [self._without_mongo_id(row) for row in rows]

    def save_embedding(self, submission_id: str, embedding: list[float], model: str) -> None:
        self.submissions.update_one(
            {"id": submission_id}, {"$set": {"embedding": embedding, "embedding_model": model}},
        )

    def save_results(self, rows: list[dict[str, Any]]) -> None:
        for row in rows:
            identity = {
                "submission_id": row["submission_id"], "source_id": row["source_id"],
                "source_type": row["source_type"], "method": row["method"],
            }
            self.results.update_one(identity, {
                "$set": {
                    "score": row["score"], "evidence": json.loads(row["evidence_json"]),
                    "created_at": row["created_at"],
                },
                "$setOnInsert": {
                    "id": row["id"], **identity, "review_status": "pending",
                    "review_note": None, "explanation": None, "explanation_model": None,
                },
            }, upsert=True)

    def list_results(self, *, submission_id: str | None = None) -> list[dict[str, Any]]:
        query = {"submission_id": submission_id} if submission_id else {}
        rows = self.results.find(query).sort([("score", DESCENDING), ("created_at", DESCENDING)])
        return [self._decode_result(row) for row in rows]

    def get_result(self, result_id: str) -> dict[str, Any] | None:
        row = self.results.find_one({"id": result_id})
        return self._decode_result(row) if row else None

    @classmethod
    def _decode_result(cls, row: dict[str, Any]) -> dict[str, Any]:
        result = cls._without_mongo_id(row)
        if "evidence_json" in result:
            result["evidence"] = json.loads(result.pop("evidence_json"))
        return result

    def review_result(self, result_id: str, status: str, note: str | None) -> dict[str, Any] | None:
        changed = self.results.update_one(
            {"id": result_id}, {"$set": {"review_status": status, "review_note": note}},
        )
        return self.get_result(result_id) if changed.matched_count else None

    def save_explanation(self, result_id: str, explanation: str, model: str) -> None:
        self.results.update_one(
            {"id": result_id}, {"$set": {"explanation": explanation, "explanation_model": model}},
        )

    def delete_submission(self, submission_id: str) -> dict[str, Any] | None:
        row = self.get_submission(submission_id)
        if row is None:
            return None
        self.results.delete_many({"$or": [
            {"submission_id": submission_id}, {"source_id": submission_id},
        ]})
        self.submissions.delete_one({"id": submission_id})
        return row

    def close(self) -> None:
        if self.client is not None:
            self.client.close()
