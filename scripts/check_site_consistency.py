#!/usr/bin/env python3
"""Static consistency gate for the Propeller production HTML inventory."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PARTS = {
    "mockups",
    "analytics-dashboard",
    "docs",
    "content",
    "node_modules",
    ".git",
}
REQUIRED = (
    '/assets/css/site-system.css',
    '/favicon.svg',
    '/favicon.ico',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    'class="pp-site-nav"',
    'class="pp-site-footer"',
    '/assets/js/site-nav.js',
)
FORBIDDEN = (
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "api.fontshare.com",
    'rel="icon" type="image/svg+xml" href="data:',
    "<path d='M16 2L28 16L16 30L4 16Z'",
)
REDIRECT_RE = re.compile(
    r'<meta\s+http-equiv="refresh"\s+content="0;\s*url=(/[^";]+)"', re.I
)
CANONICAL_RE = re.compile(
    r'<link\s+rel="canonical"\s+href="https://propellerpicks\.com(/[^"#?]+)"', re.I
)


def files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts)
    )


def main() -> None:
    errors: list[str] = []
    html_files = files()
    for path in html_files:
        html = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT)
        redirect = REDIRECT_RE.search(html)
        if redirect and '<meta name="robots" content="noindex,follow">' in html:
            canonical = CANONICAL_RE.search(html)
            target = redirect.group(1)
            if not canonical or canonical.group(1) != target:
                errors.append(f"{rel}: redirect target and canonical must match")
            if f"window.location.replace('{target}')" not in html:
                errors.append(f"{rel}: redirect page must include a location.replace fallback")
            if f'href="{target}"' not in html:
                errors.append(f"{rel}: redirect page must include a visible fallback link")
            continue
        for required in REQUIRED:
            if required not in html:
                errors.append(f"{rel}: missing {required}")
        for forbidden in FORBIDDEN:
            if forbidden in html:
                errors.append(f"{rel}: forbidden {forbidden}")
        if path != ROOT / "index.html" and "/assets/css/site-compat.css" not in html:
            errors.append(f"{rel}: missing compatibility layer")
        if path == ROOT / "index.html" and "/assets/css/site-compat.css" in html:
            errors.append("index.html: homepage must not load compatibility layer")
        if len(re.findall(r'class="pp-site-nav"', html)) != 1:
            errors.append(f"{rel}: expected exactly one shared navigation")
        if len(re.findall(r'class="pp-site-footer"', html)) != 1:
            errors.append(f"{rel}: expected exactly one shared footer")

    print(f"files={len(html_files)} errors={len(errors)}")
    for error in errors[:100]:
        print(error)
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
