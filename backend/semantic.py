"""Local Hugging Face sentence embeddings for semantic similarity."""

from __future__ import annotations

from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from settings import Settings


@lru_cache(maxsize=2)
def _model(model_name: str) -> SentenceTransformer:
    return SentenceTransformer(model_name, device="cpu")


def embed_text(text: str, settings: Settings) -> tuple[list[float], str]:
    if not settings.enable_semantic:
        raise RuntimeError("Set ENABLE_SEMANTIC=true to run local embeddings")
    vector = _model(settings.hf_embedding_model).encode(
        text, convert_to_numpy=True, normalize_embeddings=True,
    )
    vector = np.asarray(vector, dtype=np.float32).reshape(-1)
    if vector.size != settings.embedding_dimensions:
        raise ValueError(
            f"Model returned {vector.size} dimensions; EMBEDDING_DIMENSIONS is {settings.embedding_dimensions}"
        )
    return vector.tolist(), settings.hf_embedding_model


def cosine_score(left: list[float], right: list[float]) -> float:
    a, b = np.asarray(left, dtype=float), np.asarray(right, dtype=float)
    if a.shape != b.shape:
        raise ValueError("Embedding dimensions differ")
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    return float(np.dot(a, b) / denom) if denom else 0.0
