from fastapi.testclient import TestClient

from main import create_app
from settings import Settings


API_KEY = "test-api-key-which-is-long-enough"


def make_client(tmp_path):
    settings = Settings(
        app_env="test",
        api_key=API_KEY,
        cors_origins=("http://localhost:3000",),
        db_path=tmp_path / "test.sqlite3",
        upload_dir=tmp_path / "uploads",
        max_upload_size_mb=1,
        max_text_chars=100_000,
    )
    return TestClient(create_app(settings)), {"X-API-Key": API_KEY}


def test_health_ready_auth_and_submission_analysis_routes(tmp_path):
    client, auth = make_client(tmp_path)
    with client:
        assert client.get("/healthz").json()["status"] == "ok"
        assert client.get("/readyz").status_code == 401
        assert client.get("/readyz", headers=auth).json()["status"] == "ready"
        assert client.get("/api/v1/submissions", headers=auth).json() == {"items": []}

        first = client.post("/api/v1/submissions", headers=auth,
                            files={"file": ("first.txt", b"A distinct academic passage about graph algorithms and sorting.")})
        assert first.status_code == 200, first.text
        first_id = first.json()["submission"]["id"]

        second = client.post("/api/v1/submissions", headers=auth,
                             files={"file": ("second.txt", b"A distinct academic passage about graph algorithms and sorting.")})
        assert second.status_code == 200, second.text
        second_id = second.json()["submission"]["id"]
        assert second.json()["results"]

        assert client.get("/api/v1/submissions", headers=auth).status_code == 200
        assert client.get(f"/api/v1/submissions/{second_id}", headers=auth).json()["id"] == second_id
        assert client.post(f"/api/v1/analyses/{second_id}", headers=auth).status_code == 200

        results = client.get(f"/api/v1/results?submission_id={second_id}", headers=auth).json()["items"]
        assert results
        result_id = results[0]["id"]
        assert client.get(f"/api/v1/results/{result_id}", headers=auth).status_code == 200
        reviewed = client.patch(f"/api/v1/results/{result_id}/review", headers=auth,
                                json={"status": "reviewed", "note": "Checked the excerpts"})
        assert reviewed.status_code == 200
        assert reviewed.json()["review_status"] == "reviewed"
        assert client.patch(f"/api/v1/results/{result_id}/review", headers=auth,
                            json={"status": "automatic-guilt"}).status_code == 422

        assert client.post(f"/api/v1/results/{result_id}/explanation", headers=auth).status_code == 503
        assert client.post(f"/api/v1/analyses/{second_id}/web-search", headers=auth).status_code == 503
        assert client.post("/api/v1/vectors/search", headers=auth,
                           json={"text": "some query"}).status_code == 503
        assert client.post("/api/v1/agent/run", headers=auth,
                           json={"submission_id": second_id, "message": "review this"}).status_code == 503
        assert client.delete(f"/api/v1/submissions/{first_id}", headers=auth).status_code == 200
        assert client.get(f"/api/v1/submissions/{first_id}", headers=auth).status_code == 404
        assert client.get("/api/v1/results/no-such-result", headers=auth).status_code == 404


def test_upload_validation_and_code_comparison(tmp_path):
    client, auth = make_client(tmp_path)
    with client:
        unsupported = client.post("/api/v1/submissions", headers=auth,
                                  files={"file": ("malware.exe", b"no")})
        assert unsupported.status_code == 415
        malformed = client.post("/api/v1/submissions", headers=auth,
                                files={"file": ("broken.pdf", b"not a pdf")})
        assert malformed.status_code == 422
        oversized = client.post("/api/v1/submissions", headers=auth,
                                files={"file": ("large.txt", b"x" * (1024 * 1024 + 1))})
        assert oversized.status_code == 413

        first = client.post("/api/v1/submissions", headers=auth,
                            files={"file": ("one.py", b"def add(first, second):\n    return first + second\n")})
        second = client.post("/api/v1/submissions", headers=auth,
                             files={"file": ("two.py", b"def sum_values(a, b):\n    return a + b\n")})
        assert first.status_code == second.status_code == 200
        result = second.json()["results"][0]
        assert result["method"] == "normalized_token_sequence"
        assert result["evidence"]["score"] > 0.5


def test_authentication_and_filter_validation(tmp_path):
    client, auth = make_client(tmp_path)
    with client:
        assert client.get("/api/v1/submissions").status_code == 401
        assert client.get("/api/v1/submissions", headers={"X-API-Key": "incorrect"}).status_code == 401
        assert client.get("/api/v1/submissions?content_type=invalid", headers=auth).status_code == 422


def test_external_provider_routes_with_fakes(tmp_path, monkeypatch):
    import main
    import pipeline

    settings = Settings(
        app_env="test", api_key=API_KEY, db_path=tmp_path / "test.sqlite3",
        upload_dir=tmp_path / "uploads", enable_semantic=True, allow_external_ai=True,
        hf_token="fake-token", vector_store="qdrant", allow_external_search=True,
        web_search_provider="tavily", tavily_api_key="fake-key",
    )

    class FakeStore:
        def upsert(self, vector_id, vector, payload):
            pass

        def search(self, vector, limit):
            return [{"vector_id": "nearby-1", "score": 0.9}]

        def close(self):
            pass

    monkeypatch.setattr(main, "embed_text", lambda text, config: ([0.1] * config.embedding_dimensions, config.hf_embedding_model))
    monkeypatch.setattr(main, "create_vector_store", lambda config: FakeStore())
    monkeypatch.setattr(main, "explain", lambda evidence, config: ("The excerpts overlap.", "fake-model"))
    monkeypatch.setattr(pipeline, "embed_text", lambda text, config: ([0.1] * config.embedding_dimensions, config.hf_embedding_model))
    monkeypatch.setattr(pipeline, "create_vector_store", lambda config: FakeStore())
    monkeypatch.setattr(pipeline, "search_candidates", lambda query, config: [{
        "url": "https://example.test/source", "title": "Candidate", "content": "A passage from a public web source.",
        "provider_score": 0.8,
    }])

    client = TestClient(create_app(settings))
    auth = {"X-API-Key": API_KEY}
    with client:
        uploaded = client.post("/api/v1/submissions", headers=auth,
                               files={"file": ("essay.txt", b"A passage from a public web source.")})
        assert uploaded.status_code == 200
        submission_id = uploaded.json()["submission"]["id"]
        web = client.post(f"/api/v1/analyses/{submission_id}/web-search", headers=auth)
        assert web.status_code == 200
        web_result = next(item for item in web.json()["results"] if item["source_type"] == "web")
        assert web_result["evidence"]["url"] == "https://example.test/source"

        vector = client.post("/api/v1/vectors/search", headers=auth, json={"text": "a query", "limit": 2})
        assert vector.status_code == 200
        assert vector.json()["items"][0]["score"] == 0.9

        explanation = client.post(f"/api/v1/results/{web_result['id']}/explanation", headers=auth)
        assert explanation.status_code == 200
        assert explanation.json()["generated"] is True


def test_pydantic_agent_invokes_scoped_tool_with_test_model(tmp_path):
    from agents.academic_integrity import build_agent, usage_limits
    from pipeline import AnalysisPipeline
    from repository import Repository
    from tools.context import AgentDependencies
    from pydantic_ai.models.test import TestModel

    settings = Settings(app_env="test", api_key=API_KEY, db_path=tmp_path / "agent.sqlite3",
                        upload_dir=tmp_path / "uploads")
    repository = Repository(settings.db_path)
    repository.initialize()
    repository.add_submission({
        "id": "submission-a", "filename": "essay.txt", "content_type": "document",
        "language": None, "extracted_text": "A small reviewable text.",
        "file_path": str(tmp_path / "essay.txt"), "created_at": "2026-10-31T00:00:00+00:00",
    })
    dependencies = AgentDependencies(repository, AnalysisPipeline(repository, settings), settings, "submission-a")
    agent = build_agent(settings, model="test")
    with agent.override(model=TestModel(call_tools=["inspect_submission"])):
        result = agent.run_sync("Inspect this submission.", deps=dependencies, usage_limits=usage_limits(settings))
    assert dependencies.invoked_tools == ["inspect_submission"]
    assert result.output.human_review_required is True


def test_agent_route_with_stubbed_model_run(tmp_path, monkeypatch):
    import agents.academic_integrity as academic_agent
    from types import SimpleNamespace
    from agents.academic_integrity import AgentReport

    settings = Settings(app_env="test", api_key=API_KEY, db_path=tmp_path / "agent-route.sqlite3",
                        upload_dir=tmp_path / "uploads", allow_external_ai=True, groq_api_key="fake-key")

    class StubAgent:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *_):
            return False

        async def run(self, prompt, *, deps, usage_limits, timeout):
            deps.invoked_tools.append("inspect_submission")
            return SimpleNamespace(output=AgentReport(
                summary="Metadata tool was used.", evidence_ids=[], suggested_next_steps=["Review the records."],
            ), usage=SimpleNamespace(requests=2, tool_calls=1))

    monkeypatch.setattr(academic_agent, "build_agent", lambda config: StubAgent())
    client = TestClient(create_app(settings))
    auth = {"X-API-Key": API_KEY}
    with client:
        uploaded = client.post("/api/v1/submissions", headers=auth,
                               files={"file": ("agent.txt", b"Evidence stays local until a model call is enabled.")})
        submission_id = uploaded.json()["submission"]["id"]
        response = client.post("/api/v1/agent/run", headers=auth,
                               json={"submission_id": submission_id, "message": "Inspect the submission."})
        assert response.status_code == 200, response.text
        assert response.json()["tools_invoked"] == ["inspect_submission"]
        assert response.json()["report"]["human_review_required"] is True
