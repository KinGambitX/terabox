import json

import mongomock

from repository import Repository


def test_result_listing_discards_legacy_scores_without_match_evidence():
    repository = Repository("mongodb://unit.test", "test", client=mongomock.MongoClient())
    repository.initialize()
    common = {
        "submission_id": "candidate", "source_type": "internal",
        "created_at": "2026-11-03T00:00:00+00:00", "review_status": "pending",
    }
    repository.save_results([
        {
            **common, "id": "good", "source_id": "source", "method": "tfidf_cosine", "score": 1.0,
            "evidence_json": json.dumps({"matched_passages": [{"source_excerpt": "matched text"}]}),
        },
        {
            **common, "id": "stale", "source_id": "other", "method": "huggingface_embedding_cosine", "score": -0.2,
            "evidence_json": json.dumps({"source_excerpt": "no demonstrated match"}),
        },
    ])

    results = repository.list_results(submission_id="candidate")
    assert [result["id"] for result in results] == ["good"]
    assert repository.results.count_documents({"id": "stale"}) == 0
