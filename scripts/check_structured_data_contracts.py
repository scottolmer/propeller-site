#!/usr/bin/env python3
"""Verify canonical URL parity across HTML, Open Graph, and JSON-LD."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "docs", "mockups", "node_modules"}
CANONICAL_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', re.I)
OG_RE = re.compile(r'<meta\s+property=["\']og:url["\']\s+content=["\']([^"\']+)', re.I)
JSON_LD_RE = re.compile(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.I | re.S)


def typed(value: object, expected: str) -> bool:
    if not isinstance(value, dict):
        return False
    kinds = value.get("@type")
    return kinds == expected or isinstance(kinds, list) and expected in kinds


def documents(value: object):
    if isinstance(value, dict):
        yield value
        graph = value.get("@graph")
        if isinstance(graph, list):
            yield from graph
    elif isinstance(value, list):
        yield from value


def main() -> int:
    errors: list[str] = []
    checked = 0
    for path in ROOT.rglob("*.html"):
        if any(part in EXCLUDED for part in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding="utf-8")
        canonical_match = CANONICAL_RE.search(source)
        if not canonical_match:
            continue
        checked += 1
        canonical = canonical_match.group(1)
        og_match = OG_RE.search(source)
        if og_match and og_match.group(1) != canonical:
            errors.append(f"{path.relative_to(ROOT)}: og:url differs from canonical")
        for index, block in enumerate(JSON_LD_RE.findall(source), 1):
            try:
                payload = json.loads(block)
            except json.JSONDecodeError as exc:
                errors.append(f"{path.relative_to(ROOT)}: invalid JSON-LD block {index}: {exc}")
                continue
            for node in documents(payload):
                if typed(node, "BreadcrumbList"):
                    elements = node.get("itemListElement") or []
                    final = elements[-1] if elements else {}
                    item = final.get("item") if isinstance(final, dict) else None
                    if item and item != canonical:
                        errors.append(f"{path.relative_to(ROOT)}: final breadcrumb URL differs from canonical")
                elif node.get("url") and typed(node, "WebPage") and node["url"] != canonical:
                    errors.append(f"{path.relative_to(ROOT)}: WebPage URL differs from canonical")
    print(f"structured_data_pages={checked} errors={len(errors)}")
    if errors:
        print("\n".join(f"- {error}" for error in errors[:200]))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
