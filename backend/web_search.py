"""Optional Tavily public-web candidate search."""

from __future__ import annotations

import httpx

from settings import Settings


def search_candidates(query: str, settings: Settings) -> list[dict]:
    if not settings.allow_external_search:
        raise RuntimeError("Set ALLOW_EXTERNAL_SEARCH=true before sending text to web search")
    if settings.web_search_provider != "tavily" or not settings.tavily_api_key:
        raise RuntimeError("Configure WEB_SEARCH_PROVIDER=tavily and TAVILY_API_KEY")
    response = httpx.post(
        "https://api.tavily.com/search",
        json={"api_key": settings.tavily_api_key, "query": query[:400], "max_results": settings.web_search_max_results},
        timeout=20,
    )
    response.raise_for_status()
    data = response.json()
    return [{
        "url": item.get("url", ""),
        "title": item.get("title", ""),
        "content": (item.get("content") or "")[:5000],
        "provider_score": item.get("score"),
    } for item in data.get("results", []) if item.get("url")]
