#!/usr/bin/env python3
"""Apply deterministic critical-render delivery fixes to public HTML."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

try:
    from scripts.apply_site_shell import ensure_analytics_loader
except ModuleNotFoundError:
    from apply_site_shell import ensure_analytics_loader


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "content", "docs", "mockups", "node_modules"}
GTM = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-NLXM4C2G7D"></script>'
LUCIDE = '<script src="https://unpkg.com/lucide@0.344.0"></script>'
LUCIDE_SUBSET = '<script src="/assets/js/lucide-subset.js?v=20260716" defer></script>'
CRITICAL_HERO = '<style id="pp-critical-hero">.hero .fade-in{opacity:1;transform:none;transition:none}</style>'


def optimize(source: str) -> str:
    if GTM in source:
        # Newly indexable archive pages can already have the shared loader.
        # Removing legacy gtag changes its canonical location; normalize now
        # so the subsequent shell check sees one current loader in that place.
        source = ensure_analytics_loader(source.replace(GTM, ""))
    source = source.replace(LUCIDE, LUCIDE_SUBSET)
    if 'class="hero' in source and 'class="fade-in' in source:
        # Keep critical CSS before the shared loader, matching the shell renderer.
        # Preserve existing whitespace when the pair is already canonical.
        loader = r'<script\s+src="/assets/js/analytics-loader\.js[^"\n]*"\s*></script>'
        if re.search(re.escape(CRITICAL_HERO) + r"\s*" + loader, source):
            return source
        source = re.sub(
            rf"[ \t]*{re.escape(CRITICAL_HERO)}[ \t]*\n?",
            "",
            source,
        )
        loader_match = re.search(loader, source)
        if loader_match:
            return source[:loader_match.start()] + CRITICAL_HERO + "\n  " + source[loader_match.start():]
        marker = "<!-- PP_SITE_HEAD_START -->"
        if marker in source:
            source = re.sub(
                rf"[ \t]*{re.escape(marker)}",
                f"  {CRITICAL_HERO}\n  {marker}",
                source,
                count=1,
            )
        else:
            source = source.replace("</head>", f"{CRITICAL_HERO}\n</head>", 1)
    return source


def files() -> list[Path]:
    paths: list[Path] = []
    for path in ROOT.rglob("*.html"):
        if any(part in EXCLUDED for part in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding="utf-8", errors="ignore").lower()
        if re.search(r'<meta\s+name=["\']robots["\'][^>]*content=["\'][^"\']*noindex', source):
            continue
        paths.append(path)
    return paths


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed: list[Path] = []
    for path in files():
        source = path.read_text(encoding="utf-8")
        updated = optimize(source)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"lighthouse_delivery_pages={len(files())} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
