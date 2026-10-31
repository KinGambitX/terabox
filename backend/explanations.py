"""Optional Groq explanation constrained to persisted comparison evidence."""

from __future__ import annotations

from groq import Groq

from settings import Settings


def explain(evidence: dict, settings: Settings) -> tuple[str, str]:
    if not settings.allow_external_ai:
        raise RuntimeError("Set ALLOW_EXTERNAL_AI=true before sending evidence to Groq")
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    result = Groq(api_key=settings.groq_api_key).chat.completions.create(
        model=settings.groq_model,
        temperature=0,
        messages=[
            {"role": "system", "content": (
                "Explain the supplied similarity evidence briefly. Do not infer intent, "
                "declare misconduct, add facts, or change any computed score. Say when "
                "the evidence is insufficient to establish copying."
            )},
            {"role": "user", "content": str(evidence)},
        ],
    )
    return result.choices[0].message.content or "", settings.groq_model
