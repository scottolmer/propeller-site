#!/usr/bin/env python3
"""Keep platform link labels aligned with their declared search intent."""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "docs", "mockups", "node_modules"}

REPLACEMENTS = {
    '<a href="/picks/prizepicks/">PrizePicks Strategy</a>':
        '<a href="/picks/prizepicks/">PrizePicks Research</a>',
    '<a href="/picks/underdog/">Underdog Strategy</a>':
        '<a href="/picks/underdog/">Underdog Research</a>',
    '<a href="/picks/pick6/">Pick6 Strategy</a>':
        '<a href="/picks/pick6/">Pick6 Research</a>',
}


def normalize(source: str) -> str:
    for old, new in REPLACEMENTS.items():
        source = source.replace(old, new)
    return source


def iter_html() -> list[Path]:
    return [
        path
        for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    paths = iter_html()
    changed: list[Path] = []
    for path in paths:
        source = path.read_text(encoding="utf-8")
        updated = normalize(source)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")

    print(f"platform_intent_links_checked={len(paths)} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
