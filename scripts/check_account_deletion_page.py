#!/usr/bin/env python3
"""Verify the public account-deletion and age-disclosure contract."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PARTS = {
    ".git",
    "analytics-dashboard",
    "content",
    "docs",
    "mockups",
    "node_modules",
    "reports",
}
REDIRECT_RE = re.compile(
    r'<meta\s+http-equiv=["\']refresh["\'][^>]+content=["\']0;\s*url=', re.I
)


def production_pages() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts)
    )


def main() -> int:
    errors: list[str] = []
    page = ROOT / "delete-account" / "index.html"
    source = page.read_text(encoding="utf-8") if page.exists() else ""

    required_page_phrases = (
        '<link rel="canonical" href="https://propellerpicks.com/delete-account/">',
        '<meta name="robots" content="index, follow">',
        "More",
        "Delete Account",
        "Apple App Store",
        "Google Play",
        "Stripe-backed subscription is canceled",
        "Refund requests are handled separately",
        "research and analysis tool",
        "do not accept wagers or operate as a sportsbook",
        'href="/privacy/"',
    )
    if not page.exists():
        errors.append("delete-account/index.html is missing")
    for phrase in required_page_phrases:
        if phrase not in source:
            errors.append(f"delete-account/index.html is missing: {phrase}")

    for pattern in (r"within\s+\d+\s+(?:business\s+)?days?", r"\d+[- ]day deletion"):
        if re.search(pattern, source, re.I):
            errors.append("delete-account/index.html contains a numeric deletion-time promise")

    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in {".html", ".md", ".txt"}:
            continue
        if any(part in {".git", "node_modules"} for part in path.relative_to(ROOT).parts):
            continue
        if "Must be 21+." in path.read_text(encoding="utf-8"):
            errors.append(f"{path.relative_to(ROOT)}: stale 21+ language")

    checked = 0
    for path in production_pages():
        html = path.read_text(encoding="utf-8")
        if REDIRECT_RE.search(html) and 'content="noindex,follow"' in html:
            continue
        checked += 1
        rel = path.relative_to(ROOT)
        if "Must be 18+." not in html:
            errors.append(f"{rel}: 18+ footer language missing")
        if "Must be 21+." in html:
            errors.append(f"{rel}: stale 21+ footer language")
        if "https://propellerpicks.com/delete-account/" not in html:
            errors.append(f"{rel}: public deletion link missing")

    print(f"account_deletion_page={'ok' if not errors else 'failed'} production_pages={checked} errors={len(errors)}")
    for error in errors[:100]:
        print(f"- {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
