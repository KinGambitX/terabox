from pipeline import AnalysisPipeline
from settings import Settings


class EmbeddingRepository:
    def save_embedding(self, *_args):
        pass

    def _persist_vector(self, *_args):
        pass


def test_semantic_match_requires_stored_overlap_and_nonnegative_score():
    pipeline = AnalysisPipeline(EmbeddingRepository(), Settings())
    passage = (
        "Urban trees reduce neighborhood heat by providing shade and releasing moisture. "
        "Planting plans should consider local temperatures, available water, buildings, "
        "and the needs of residents who use the streets every day."
    )
    current = {"id": "candidate", "extracted_text": passage}

    exact = {
        "id": "source", "extracted_text": passage,
        "embedding": [1.0, 0.0], "embedding_model": "test-model",
    }
    rows = pipeline._semantic_results(current, [exact], [1.0, 0.0], "test-model")
    assert len(rows) == 1
    assert rows[0]["score"] == 1.0
    assert json_evidence(rows[0])["matched_passages"]

    negative_match = {**exact, "embedding": [-1.0, 0.0]}
    assert pipeline._semantic_results(current, [negative_match], [1.0, 0.0], "test-model") == []

    related_but_unmatched = {
        **exact,
        "extracted_text": "Trees, shade, and city temperatures influence public spaces.",
    }
    assert pipeline._semantic_results(current, [related_but_unmatched], [1.0, 0.0], "test-model") == []


def json_evidence(row):
    import json

    return json.loads(row["evidence_json"])
