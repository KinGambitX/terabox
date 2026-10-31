"""Configured vector persistence for Qdrant."""

from __future__ import annotations

from typing import Any
import uuid

from settings import Settings


class QdrantVectorStore:
    def __init__(self, settings: Settings):
        from qdrant_client import QdrantClient, models

        self.settings = settings
        self.models = models
        self.client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key, timeout=5)
        collection = settings.qdrant_collection
        if not self.client.collection_exists(collection):
            self.client.create_collection(collection_name=collection, vectors_config=models.VectorParams(
                size=settings.embedding_dimensions, distance=models.Distance.COSINE,
            ))

    def upsert(self, vector_id: str, vector: list[float], payload: dict[str, Any]) -> None:
        _check(vector, self.settings.embedding_dimensions)
        point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, vector_id))
        self.client.upsert(collection_name=self.settings.qdrant_collection, wait=True, points=[
            self.models.PointStruct(id=point_id, vector=vector, payload={**payload, "vector_id": vector_id})
        ])

    def search(self, vector: list[float], limit: int = 10) -> list[dict[str, Any]]:
        _check(vector, self.settings.embedding_dimensions)
        if not 1 <= limit <= 100:
            raise ValueError("limit must be between 1 and 100")
        result = self.client.query_points(collection_name=self.settings.qdrant_collection,
                                          query=vector, limit=limit, with_payload=True)
        return [{"vector_id": point.payload.get("vector_id"), "payload": point.payload, "score": point.score}
                for point in result.points]

    def close(self) -> None:
        self.client.close()


def create_vector_store(settings: Settings):
    if settings.vector_store == "qdrant":
        return QdrantVectorStore(settings)
    raise RuntimeError("Vector storage is disabled; set VECTOR_STORE=qdrant")


def _check(vector: list[float], expected: int) -> None:
    if len(vector) != expected:
        raise ValueError(f"Expected a {expected}-dimension vector, got {len(vector)}")
