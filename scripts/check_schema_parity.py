#!/usr/bin/env python3
"""Require FAQ structured data to match text users can read on the page."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from sync_faq_schema import FAQParser


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "mockups"}
JSON_LD_RE = re.compile(
    r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)


def normalize(value: object) -> str:
    return " ".join(str(value or "").split())


def walk(value: object):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def faq_entries(document: object):
    for node in walk(document):
        types = node.get("@type")
        if types == "FAQPage" or isinstance(types, list) and "FAQPage" in types:
            for question in node.get("mainEntity", []):
                if not isinstance(question, dict) or question.get("@type") != "Question":
                    continue
                answer = question.get("acceptedAnswer") or {}
                yield normalize(question.get("name")), normalize(answer.get("text"))


def main() -> None:
    errors: list[str] = []
    checked_pages = 0
    checked_entries = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in EXCLUDED for part in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding="utf-8")
        blocks = JSON_LD_RE.findall(source)
        if not blocks:
            continue
        parser = FAQParser()
        parser.feed(source)
        visible_entries = parser.items
        page_has_faq = False
        schema_entries: list[tuple[str, str]] = []
        for index, block in enumerate(blocks, 1):
            try:
                document = json.loads(block)
            except json.JSONDecodeError as exc:
                errors.append(f"{path.relative_to(ROOT)} JSON-LD block {index}: {exc}")
                continue
            for question, answer in faq_entries(document):
                page_has_faq = True
                checked_entries += 1
                schema_entries.append((question, answer))
        if page_has_faq:
            checked_pages += 1
            if schema_entries != visible_entries:
                errors.append(
                    f"{path.relative_to(ROOT)} FAQ schema pairs differ from visible FAQ pairs: "
                    f"schema={len(schema_entries)} visible={len(visible_entries)}"
                )

    print(f"faq_pages={checked_pages} faq_entries={checked_entries} errors={len(errors)}")
    if errors:
        print("\n".join(errors[:200]))
        sys.exit(1)


if __name__ == "__main__":
    main()
