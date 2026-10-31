"""Lexical comparison and traceable passage evidence."""

from __future__ import annotations

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from documents import normalize_text


def _passages(text: str, width: int = 90, overlap: int = 18) -> list[str]:
    words = text.split()
    return [" ".join(words[i : i + width]) for i in range(0, len(words), max(1, width - overlap))]


def compare_text(left: str, right: str, threshold: float = 0.28) -> dict:
    a, b = normalize_text(left), normalize_text(right)
    if not a or not b:
        return {"method": "tfidf_cosine", "score": 0.0, "matched_passages": []}
    passages_a, passages_b = _passages(a), _passages(b)
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), strip_accents="unicode")
    try:
        global_vectors = vectorizer.fit_transform([a, b])
        score = float(cosine_similarity(global_vectors[0], global_vectors[1])[0, 0])
        all_passages = vectorizer.transform(passages_a + passages_b)
        local = cosine_similarity(all_passages[: len(passages_a)], all_passages[len(passages_a) :])
    except ValueError:
        return {"method": "tfidf_cosine", "score": 0.0, "matched_passages": []}
    matches = []
    for idx, row in enumerate(local):
        source_idx = int(row.argmax())
        local_score = float(row[source_idx])
        if local_score >= threshold:
            matches.append({
                "submission_excerpt": passages_a[idx],
                "source_excerpt": passages_b[source_idx],
                "score": round(local_score, 6),
            })
    matches.sort(key=lambda item: item["score"], reverse=True)
    return {"method": "tfidf_cosine", "score": round(score, 6), "matched_passages": matches[:20]}
