#!/usr/bin/env python3
"""Keep legacy performance reports and design mockups out of search indexes."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MONTHLY = sorted((ROOT / "blog" / "monthly").glob("*-results-*.html"))
MOCKUPS = [
    ROOT / "mockups" / "mobile-white-home-a.html",
    ROOT / "mockups" / "mobile-white-home-b.html",
    ROOT / "mockups" / "mobile-white-home-c.html",
    ROOT / "mockups" / "mobile-white-home-recommended.html",
]


def noindex(source: str) -> str:
    tag = '<meta name="robots" content="noindex, follow">'
    pattern = re.compile(r'<meta\s+name=["\']robots["\'][^>]*>', re.I)
    if pattern.search(source):
        return pattern.sub(tag, source, count=1)
    return re.sub(r'(<meta\s+name=["\']viewport["\'][^>]*>)', r'\1\n  ' + tag, source, count=1, flags=re.I)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed = []
    for path in MONTHLY + MOCKUPS:
        source = path.read_text(encoding="utf-8")
        updated = noindex(source)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"checked={len(MONTHLY) + len(MOCKUPS)} changed={len(changed)}")
    if args.check and changed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
