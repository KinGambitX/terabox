"""Optional, opt-in adapters for external originality providers."""

from __future__ import annotations

from io import BytesIO
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable
from zipfile import ZIP_DEFLATED, ZipFile

import httpx

from settings import Settings


logger = logging.getLogger("terabox.external_tools")
_PRIVATE_OUTPUT_FIELDS = {"text", "content", "document", "extracted_text", "submission_excerpt", "source_excerpt", "sentence"}


def _redact_text(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: f"<redacted {len(item)} chars>" if (
                key.lower() in _PRIVATE_OUTPUT_FIELDS
                or any(part in key.lower() for part in ("excerpt", "content", "document", "text"))
            ) and isinstance(item, str)
            else _redact_text(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [_redact_text(item) for item in value]
    if isinstance(value, str) and len(value) > 300:
        return f"<redacted long response: {len(value)} chars>"
    return value


def _log_provider_output(result: dict[str, Any]) -> None:
    logger.info("External provider output: %s", json.dumps(_redact_text(result), ensure_ascii=False, default=str))


def detect_with_sapling(text: str, settings: Settings) -> dict[str, Any]:
    if not settings.allow_external_detectors or not settings.sapling_api_key:
        return {"provider": "sapling", "status": "not_configured"}
    response = httpx.post(
        "https://api.sapling.ai/api/v1/aidetect",
        json={"key": settings.sapling_api_key, "text": text[:200_000], "zero_retention": True},
        timeout=45,
    )
    response.raise_for_status()
    return {"provider": "sapling", "status": "completed", "result": response.json()}


def submit_plagiarismcheck(text: str, settings: Settings) -> dict[str, Any]:
    if not settings.allow_external_detectors or not settings.plagiarismcheck_api_key:
        return {"provider": "plagiarismcheck", "status": "not_configured"}
    if len(text) < 80:
        return {"provider": "plagiarismcheck", "status": "skipped", "reason": "minimum_80_characters"}
    response = httpx.post(
        "https://plagiarismcheck.org/api/v1/text",
        headers={"X-API-TOKEN": settings.plagiarismcheck_api_key},
        data={"language": "en", "text": text},
        timeout=45,
    )
    response.raise_for_status()
    payload = response.json()
    check_id = payload.get("data", {}).get("text", {}).get("id")
    if check_id is None:
        raise ValueError("PlagiarismCheck did not return a check ID")
    return {"provider": "plagiarismcheck", "status": "submitted", "check_id": str(check_id)}


def get_plagiarismcheck_report(check_id: str, settings: Settings) -> dict[str, Any]:
    if not settings.allow_external_detectors or not settings.plagiarismcheck_api_key:
        raise RuntimeError("Enable external detectors and configure PLAGIARISMCHECK_API_KEY")
    headers = {"X-API-TOKEN": settings.plagiarismcheck_api_key}
    status_response = httpx.get(
        f"https://plagiarismcheck.org/api/v1/text/{check_id}", headers=headers, timeout=30,
    )
    status_response.raise_for_status()
    state = status_response.json().get("data", {}).get("state")
    if state != 5:
        result = {"provider": "plagiarismcheck", "status": "processing", "check_id": check_id, "state": state}
        _log_provider_output(result)
        return result
    report_response = httpx.get(
        f"https://plagiarismcheck.org/api/v1/text/report/{check_id}", headers=headers, timeout=30,
    )
    report_response.raise_for_status()
    result = {"provider": "plagiarismcheck", "status": "completed", "check_id": check_id,
              "result": report_response.json()}
    _log_provider_output(result)
    return result


def submit_dolos(submission: dict, sources: list[dict], settings: Settings) -> dict[str, Any]:
    if not settings.allow_external_code_check:
        return {"provider": "dolos", "status": "not_configured"}
    payload = BytesIO()
    with ZipFile(payload, "w", ZIP_DEFLATED) as archive:
        archive.writestr(f"candidate/{submission['filename']}", submission["extracted_text"])
        for source in sources[:3]:
            archive.writestr(f"source-{source['id'][:8]}/{source['filename']}", source["extracted_text"])
    if len(sources) == 0:
        return {"provider": "dolos", "status": "skipped", "reason": "no_comparable_code_submissions"}
    archive_bytes = payload.getvalue()
    if len(archive_bytes) > 9 * 1024 * 1024:
        return {"provider": "dolos", "status": "skipped", "reason": "dataset_exceeds_9_mb"}
    response = httpx.post(
        f"{settings.dolos_api_url}/reports",
        data={"dataset[name]": submission["filename"]},
        files={"dataset[zipfile]": ("sourcelens-code.zip", archive_bytes, "application/zip")},
        timeout=60,
    )
    response.raise_for_status()
    report = response.json()
    return {"provider": "dolos", "status": report.get("status", "queued"),
            "report_id": str(report.get("id", "")), "html_url": report.get("html_url"),
            "report_url": report.get("url")}


def get_dolos_report(report_id: str, settings: Settings) -> dict[str, Any]:
    if not settings.allow_external_code_check:
        raise RuntimeError("Set ALLOW_EXTERNAL_CODE_CHECK=true before using Dolos")
    if not report_id.isdigit():
        raise ValueError("Invalid Dolos report ID")
    response = httpx.get(f"{settings.dolos_api_url}/reports/{report_id}", timeout=30)
    response.raise_for_status()
    result = response.json()
    _log_provider_output({"provider": "dolos", "result": result})
    return result


def _compact_ai_result(check: dict[str, Any]) -> dict[str, Any]:
    result = check.get("result")
    if not isinstance(result, dict):
        return check
    if check["provider"] == "sapling":
        keys = ("score", "ai_fraction", "verdict", "low_confidence", "low_confidence_reasons", "sentence_scores")
        result = {key: result[key] for key in keys if key in result}
    return {**check, "result": result}


def run_all_checks(submission: dict, repository, pipeline, settings: Settings) -> list[dict[str, Any]]:
    """Run all matching provider checks concurrently; unconfigured tools report their state."""
    tasks: list[tuple[str, Callable[[], dict[str, Any]]]] = []
    if submission["content_type"] == "document":
        text = submission["extracted_text"]
        tasks.extend([
            ("sapling", lambda: detect_with_sapling(text, settings)),
            ("plagiarismcheck", lambda: submit_plagiarismcheck(text, settings)),
        ])
        if settings.allow_external_search and settings.web_search_provider == "tavily":
            def search_web():
                rows = pipeline.web_search(submission["id"])
                matches = [row for row in rows if row["source_type"] == "web"]
                for match in matches:
                    evidence = match.get("evidence") or {}
                    logger.info(
                        "Tavily source URL checked: url=%s score=%s matched_passages=%s",
                        evidence.get("url") or match.get("source_id"),
                        match.get("score"),
                        len(evidence.get("matched_passages", [])),
                    )
                return {"provider": "tavily", "status": "completed" if matches else "no_matches", "results": matches}
            tasks.append(("tavily", search_web))
        else:
            tasks.append(("tavily", lambda: {"provider": "tavily", "status": "not_configured"}))
    else:
        sources = [row for row in repository.comparable_submissions(submission["id"], "code")
                   if row.get("language") == submission.get("language")]
        tasks.append(("dolos", lambda: submit_dolos(submission, sources, settings)))

    def run(task: tuple[str, Callable[[], dict[str, Any]]]) -> dict[str, Any]:
        provider, operation = task
        try:
            result = operation()
            result = _compact_ai_result(result) if provider == "sapling" else result
        except Exception as exc:
            response = getattr(exc, "response", None)
            status_code = getattr(response, "status_code", None)
            try:
                upstream_error = _redact_text(response.json()) if response is not None else None
            except Exception:
                upstream_error = {"body_bytes": len(response.content)} if response is not None else None
            logger.error(
                "External provider call failed provider=%s status_code=%s error=%s detail=%s upstream=%s",
                provider, status_code, type(exc).__name__, str(exc)[:500],
                json.dumps(upstream_error, ensure_ascii=False, default=str),
            )
            result = {
                "provider": provider,
                "status": "failed",
                "error": type(exc).__name__,
                "detail": str(exc)[:500],
                "status_code": status_code,
                "upstream_error": upstream_error,
            }
        _log_provider_output(result)
        return result

    with ThreadPoolExecutor(max_workers=len(tasks)) as executor:
        return list(executor.map(run, tasks))
