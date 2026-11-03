from io import BytesIO
from threading import Barrier
from zipfile import ZipFile

import external_tools
from settings import Settings


def test_ai_providers_are_disabled_without_opt_in_or_keys(monkeypatch):
    def unexpected_request(*args, **kwargs):
        raise AssertionError("An unconfigured provider must not receive text")

    monkeypatch.setattr(external_tools.httpx, "post", unexpected_request)
    settings = Settings()
    assert external_tools.detect_with_sapling("text", settings)["status"] == "not_configured"
    assert external_tools.submit_plagiarismcheck("x" * 100, settings)["status"] == "not_configured"


def test_sapling_uses_zero_retention(monkeypatch):
    class Response:
        def raise_for_status(self):
            pass
        def json(self):
            return {"score": 0.71, "verdict": "ai"}

    def fake_post(url, **kwargs):
        assert url == "https://api.sapling.ai/api/v1/aidetect"
        assert kwargs["json"]["zero_retention"] is True
        assert kwargs["json"]["key"] == "test-key"
        return Response()

    monkeypatch.setattr(external_tools.httpx, "post", fake_post)
    settings = Settings(allow_external_detectors=True, sapling_api_key="test-key")
    assert external_tools.detect_with_sapling("text", settings)["result"]["score"] == 0.71


def test_plagiarismcheck_submission_returns_pollable_id(monkeypatch):
    class Response:
        def raise_for_status(self):
            pass
        def json(self):
            return {"success": True, "data": {"text": {"id": 42}}}

    def fake_post(url, **kwargs):
        assert url == "https://plagiarismcheck.org/api/v1/text"
        assert kwargs["headers"]["X-API-TOKEN"] == "test-key"
        assert kwargs["data"]["language"] == "en"
        return Response()

    monkeypatch.setattr(external_tools.httpx, "post", fake_post)
    settings = Settings(allow_external_detectors=True, plagiarismcheck_api_key="test-key")
    result = external_tools.submit_plagiarismcheck("A sufficiently long sample passage. " * 4, settings)
    assert result == {"provider": "plagiarismcheck", "status": "submitted", "check_id": "42"}


def test_dolos_builds_zip_from_active_and_comparison_code(monkeypatch):
    class Response:
        def raise_for_status(self):
            pass
        def json(self):
            return {"id": "12345", "status": "queued", "html_url": "https://dolos.ugent.be/report"}

    def fake_post(url, **kwargs):
        assert url == "https://dolos.ugent.be/api/reports"
        archive = ZipFile(BytesIO(kwargs["files"]["dataset[zipfile]"][1]))
        assert len(archive.namelist()) == 2
        return Response()

    monkeypatch.setattr(external_tools.httpx, "post", fake_post)
    settings = Settings(allow_external_code_check=True)
    result = external_tools.submit_dolos(
        {"id": "a1", "filename": "main.py", "extracted_text": "print(1)"},
        [{"id": "b2", "filename": "copy.py", "extracted_text": "print(1)"}], settings,
    )
    assert result["status"] == "queued"
    assert result["report_id"] == "12345"


def test_document_orchestrator_runs_every_provider_concurrently_and_logs_errors(monkeypatch, caplog):
    import logging

    caplog.set_level(logging.INFO, logger="terabox.external_tools")
    barrier = Barrier(2)

    def make_check(provider):
        def call(*_args):
            barrier.wait(timeout=3)
            return {"provider": provider, "status": "completed", "result": {"score": 0.4}}
        return call

    monkeypatch.setattr(external_tools, "submit_plagiarismcheck", make_check("plagiarismcheck"))
    def fail_sapling(*_args):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(external_tools, "detect_with_sapling", fail_sapling)

    class Pipeline:
        def web_search(self, submission_id):
            barrier.wait(timeout=3)
            return [{"source_type": "web", "score": 0.7, "source_id": "https://example.org",
                     "evidence": {"source_excerpt": "private source passage"}}]

    settings = Settings(allow_external_search=True, web_search_provider="tavily")
    checks = external_tools.run_all_checks(
        {"id": "submission", "content_type": "document", "extracted_text": "text"},
        object(), Pipeline(), settings,
    )
    assert {check["provider"] for check in checks} == {"sapling", "plagiarismcheck", "tavily"}
    assert next(check for check in checks if check["provider"] == "sapling")["status"] == "failed"
    assert next(check for check in checks if check["provider"] == "tavily")["status"] == "completed"
    assert caplog.text.count("External provider output:") == 3
    assert '"provider": "sapling"' in caplog.text
    assert "<redacted 22 chars>" in caplog.text
    assert "private source passage" not in caplog.text
