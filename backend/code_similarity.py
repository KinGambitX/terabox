"""Normalized token comparison for supported source files."""

from __future__ import annotations

from difflib import SequenceMatcher
import re

from tree_sitter_language_pack import get_parser

_LEXER = re.compile(r"[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|[^\s]")


def tokenize_code(source: str, language: str) -> list[str]:
    try:
        parser = get_parser(language)
        source_bytes = source.encode("utf-8")
        tree = parser.parse(source_bytes)
        tokens: list[str] = []

        def visit(node) -> None:
            if "comment" in node.type:
                return
            if node.child_count == 0:
                token = source_bytes[node.start_byte : node.end_byte].decode("utf-8", "replace")
                if not token.strip():
                    return
                if node.type in {"identifier", "type_identifier", "field_identifier", "property_identifier"}:
                    tokens.append("IDENT")
                elif "string" in node.type or "character" in node.type:
                    tokens.append("STRING")
                elif any(part in node.type for part in ("integer", "float", "number")):
                    tokens.append("NUMBER")
                else:
                    tokens.append(token)
                return
            for child in node.children:
                visit(child)

        visit(tree.root_node)
        if tokens:
            return tokens
    except (LookupError, ValueError, TypeError):
        pass
    return _LEXER.findall(source)


def compare_code(left: str, right: str, language: str) -> dict:
    a, b = tokenize_code(left, language), tokenize_code(right, language)
    matcher = SequenceMatcher(None, a, b, autojunk=False)
    blocks = [
        {"submission_token_start": block.a, "source_token_start": block.b, "token_count": block.size}
        for block in matcher.get_matching_blocks() if block.size >= 3
    ]
    return {
        "method": "normalized_token_sequence",
        "language": language,
        "score": round(matcher.ratio(), 6) if a and b else 0.0,
        "matched_token_blocks": blocks,
    }
