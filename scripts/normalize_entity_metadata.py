#!/usr/bin/env python3
"""Normalize the formal product entity name in generated HTML metadata.

Visible navigation may use the shorter ``Propeller`` brand label. Formal
publisher, author, WebSite, Organization, application, and Open Graph metadata
uses ``Propeller Picks`` so search and answer engines resolve one entity.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "mockups"}

REPLACEMENTS = (
    (re.compile(r'(<meta\s+name=["\']author["\']\s+content=["\'])Propeller(["\'])', re.I), r'\1Propeller Picks\2'),
    (re.compile(r'(<meta\s+name=["\']application-name["\']\s+content=["\'])Propeller(["\'])', re.I), r'\1Propeller Picks\2'),
    (re.compile(r'(<meta\s+property=["\']og:site_name["\']\s+content=["\'])Propeller(["\'])', re.I), r'\1Propeller Picks\2'),
    (re.compile(r'("name"\s*:\s*")Propeller("\s*[,}])'), r'\1Propeller Picks\2'),
)


def html_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)
    )


def normalize(source: str) -> str:
    for pattern, replacement in REPLACEMENTS:
        source = pattern.sub(replacement, source)
    return source


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail when a file still needs normalization")
    args = parser.parse_args()

    changed = []
    for path in html_files():
        source = path.read_text(encoding="utf-8")
        updated = normalize(source)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")

    print(f"checked={len(html_files())} changed={len(changed)}")
    if args.check and changed:
        for path in changed[:20]:
            print(path.relative_to(ROOT))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
