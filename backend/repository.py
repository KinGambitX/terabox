"""SQLite persistence for development/small deployments; portable to Postgres later."""

from __future__ import annotations

import json
from pathlib import Path
import sqlite3
from typing import Any
from contextlib import contextmanager


class Repository:
    def __init__(self, path: Path):
        self.path = Path(path)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=20)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        db.execute("PRAGMA journal_mode = WAL")
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def initialize(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS submissions (
                    id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    language TEXT,
                    extracted_text TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    embedding_json TEXT,
                    embedding_model TEXT,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS results (
                    id TEXT PRIMARY KEY,
                    submission_id TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    method TEXT NOT NULL,
                    score REAL NOT NULL,
                    evidence_json TEXT NOT NULL,
                    review_status TEXT NOT NULL DEFAULT 'pending',
                    review_note TEXT,
                    explanation TEXT,
                    explanation_model TEXT,
                    created_at TEXT NOT NULL,
                    UNIQUE(submission_id, source_id, source_type, method)
                );
                CREATE INDEX IF NOT EXISTS idx_results_submission ON results(submission_id);
                CREATE INDEX IF NOT EXISTS idx_submissions_content_type ON submissions(content_type);
            """)

    def add_submission(self, row: dict[str, Any]) -> None:
        with self.connect() as db:
            db.execute("""INSERT INTO submissions
                (id, filename, content_type, language, extracted_text, file_path, created_at)
                VALUES (:id, :filename, :content_type, :language, :extracted_text, :file_path, :created_at)""", row)

    def list_submissions(self, *, content_type: str | None = None) -> list[dict[str, Any]]:
        query = "SELECT id, filename, content_type, language, created_at FROM submissions"
        args: tuple = ()
        if content_type:
            query += " WHERE content_type = ?"
            args = (content_type,)
        query += " ORDER BY created_at DESC"
        with self.connect() as db:
            return [dict(row) for row in db.execute(query, args).fetchall()]

    def get_submission(self, submission_id: str) -> dict[str, Any] | None:
        with self.connect() as db:
            row = db.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
            if row is None:
                return None
            result = dict(row)
        result["embedding"] = json.loads(result["embedding_json"]) if result["embedding_json"] else None
        result.pop("embedding_json")
        return result

    def comparable_submissions(self, submission_id: str, content_type: str) -> list[dict[str, Any]]:
        with self.connect() as db:
            rows = db.execute(
                "SELECT * FROM submissions WHERE id != ? AND content_type = ? ORDER BY created_at DESC",
                (submission_id, content_type),
            ).fetchall()
            results = [dict(row) for row in rows]
        for row in results:
            row["embedding"] = json.loads(row["embedding_json"]) if row["embedding_json"] else None
            row.pop("embedding_json")
        return results

    def save_embedding(self, submission_id: str, embedding: list[float], model: str) -> None:
        with self.connect() as db:
            db.execute("UPDATE submissions SET embedding_json = ?, embedding_model = ? WHERE id = ?",
                       (json.dumps(embedding), model, submission_id))

    def save_results(self, rows: list[dict[str, Any]]) -> None:
        if not rows:
            return
        with self.connect() as db:
            db.executemany("""INSERT INTO results
                (id, submission_id, source_id, source_type, method, score, evidence_json, created_at)
                VALUES (:id, :submission_id, :source_id, :source_type, :method, :score, :evidence_json, :created_at)
                ON CONFLICT(submission_id, source_id, source_type, method) DO UPDATE SET
                    score = excluded.score, evidence_json = excluded.evidence_json, created_at = excluded.created_at""", rows)

    def list_results(self, *, submission_id: str | None = None) -> list[dict[str, Any]]:
        query = "SELECT * FROM results"
        args: tuple = ()
        if submission_id:
            query += " WHERE submission_id = ?"
            args = (submission_id,)
        query += " ORDER BY score DESC, created_at DESC"
        with self.connect() as db:
            rows = [dict(row) for row in db.execute(query, args).fetchall()]
        return [self._decode_result(row) for row in rows]

    def get_result(self, result_id: str) -> dict[str, Any] | None:
        with self.connect() as db:
            row = db.execute("SELECT * FROM results WHERE id = ?", (result_id,)).fetchone()
        return self._decode_result(dict(row)) if row else None

    @staticmethod
    def _decode_result(row: dict[str, Any]) -> dict[str, Any]:
        row["evidence"] = json.loads(row.pop("evidence_json"))
        return row

    def review_result(self, result_id: str, status: str, note: str | None) -> dict[str, Any] | None:
        with self.connect() as db:
            changed = db.execute("UPDATE results SET review_status = ?, review_note = ? WHERE id = ?",
                                 (status, note, result_id)).rowcount
        return self.get_result(result_id) if changed else None

    def save_explanation(self, result_id: str, explanation: str, model: str) -> None:
        with self.connect() as db:
            db.execute("UPDATE results SET explanation = ?, explanation_model = ? WHERE id = ?",
                       (explanation, model, result_id))

    def delete_submission(self, submission_id: str) -> dict[str, Any] | None:
        row = self.get_submission(submission_id)
        if row is None:
            return None
        with self.connect() as db:
            db.execute("DELETE FROM results WHERE submission_id = ? OR source_id = ?", (submission_id, submission_id))
            db.execute("DELETE FROM submissions WHERE id = ?", (submission_id,))
        return row
