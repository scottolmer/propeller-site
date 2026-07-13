#!/usr/bin/env python3
"""Snapshot and compare protected page content across shell migrations."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PARTS = {"mockups", "analytics-dashboard", ".git"}
NAV_RE = re.compile(r"<nav\b[^>]*>.*?</nav>", re.IGNORECASE | re.DOTALL)
FOOTER_RE = re.compile(r"<footer\b[^>]*>", re.IGNORECASE | re.DOTALL)
MAIN_RE = re.compile(r"<main\b[^>]*>.*?</main>", re.IGNORECASE | re.DOTALL)
BODY_RE = re.compile(r"<body\b[^>]*>", re.IGNORECASE)


def files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if path != ROOT / "index.html"
        and not any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts)
    )


def protected(html: str) -> str:
    main = MAIN_RE.search(html)
    if main:
        return main.group(0)

    start = BODY_RE.search(html)
    start_index = start.end() if start else 0
    for nav in NAV_RE.finditer(html, start_index):
        opening = html[nav.start() : html.find(">", nav.start()) + 1].lower()
        if "breadcrumb" not in opening:
            start_index = nav.end()
            break
    footer = FOOTER_RE.search(html, start_index)
    end_index = footer.start() if footer else len(html)
    content = html[start_index:end_index]
    content = re.sub(
        r"^[ \t]*<!-- PP_SITE_NAV_END -->[ \t]*\r?\n?",
        "",
        content,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    content = re.sub(
        r"^[ \t]*<!-- PP_SITE_FOOTER_START -->[ \t]*\r?\n?",
        "",
        content,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    content = re.sub(
        r"\s*<script\b[^>]+src=[\"']/assets/js/site-nav\.js[^\"']*[\"'][^>]*>\s*</script>\s*",
        "\n",
        content,
        flags=re.IGNORECASE,
    )
    content = re.sub(r"\s*</body>\s*</html>\s*$", "\n", content, flags=re.IGNORECASE)
    return content


def digest(path: Path) -> str:
    return hashlib.sha256(protected(path.read_text(encoding="utf-8")).encode()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["snapshot", "verify"])
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()

    current = {str(path.relative_to(ROOT)): digest(path) for path in files()}
    if args.mode == "snapshot":
        args.manifest.write_text(json.dumps(current, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(f"snapshotted={len(current)} manifest={args.manifest}")
        return

    expected = json.loads(args.manifest.read_text(encoding="utf-8"))
    mismatches = sorted(path for path, value in current.items() if expected.get(path) != value)
    missing = sorted(set(expected) - set(current))
    added = sorted(set(current) - set(expected))
    print(f"verified={len(current)} mismatches={len(mismatches)} missing={len(missing)} added={len(added)}")
    for label, paths in (("mismatch", mismatches), ("missing", missing), ("added", added)):
        for path in paths[:20]:
            print(f"{label}: {path}")
    if mismatches or missing or added:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
