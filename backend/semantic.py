"""Optional hosted Hugging Face embeddings, disabled unless explicitly enabled."""

from __future__ import annotations

import numpy as np
from huggingface_hub import InferenceClient

from settings import Settings


def embed_text(text: str, settings: Settings) -> tuple[list[float], str]:
    if not settings.enable_semantic or not settings.allow_external_ai:
        raise RuntimeError("Enable ENABLE_SEMANTIC and ALLOW_EXTERNAL_AI to call Hugging Face")
    if not settings.hf_token:
        raise RuntimeError("HF_TOKEN is required for hosted embeddings")
    result = InferenceClient(model=settings.hf_embedding_model, token=settings.hf_token).feature_extraction(text)
    array = np.asarray(result, dtype=float)
    if array.ndim == 1:
        pooled = array
    elif array.ndim == 2:
        pooled = array[0] if array.shape[0] == 1 else array.mean(axis=0)
    else:
        pooled = array.reshape(-1, array.shape[-1]).mean(axis=0)
    if pooled.size != settings.embedding_dimensions:
        raise ValueError(
            f"Model returned {pooled.size} dimensions; EMBEDDING_DIMENSIONS is {settings.embedding_dimensions}"
        )
    return pooled.tolist(), settings.hf_embedding_model


def cosine_score(left: list[float], right: list[float]) -> float:
    a, b = np.asarray(left, dtype=float), np.asarray(right, dtype=float)
    if a.shape != b.shape:
        raise ValueError("Embedding dimensions differ")
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    return float(np.dot(a, b) / denom) if denom else 0.0
