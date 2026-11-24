#!/usr/bin/env python3
"""Point player-page breadcrumbs at the matching sport analyzer hub.

The external player-page generator still emits level 3 of the breadcrumb as
``/analyzer/?sport=<sport>``. Sports that have a dedicated hub page
(``/analyzer/<sport>/``) should link there instead, both in the visible
``Breadcrumb`` nav and in the ``BreadcrumbList`` JSON-LD. Sports without a hub
keep their current filtered-analyzer link.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

BREADCRUMB_NAV_RE = re.compile(
    r'(<nav\b[^>]*\baria-label=["\']Breadcrumb["\'][^>]*>)(.*?)(</nav>)',
    re.IGNORECASE | re.DOTALL,
)
JSON_LD_RE = re.compile(
    r'(<script\b[^>]*\btype=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
    re.IGNORECASE | re.DOTALL,
)


def hub_sports(root: Path = ROOT) -> list[str]:
    analyzer = root / "analyzer"
    if not analyzer.is_dir():
        return []
    return sorted(
        path.parent.name
        for path in analyzer.glob("*/index.html")
        if path.is_file()
    )


def _normalize_nav(match: re.Match[str], sport: str) -> str:
    opening, body, closing = match.groups()
    href_re = re.compile(
        r'(href=)(["\'])/analyzer/\?sport=' + re.escape(sport) + r"\2",
        re.IGNORECASE,
    )
    body = href_re.sub(rf"\1\2/analyzer/{sport}/\2", body)
    return opening + body + closing


def _normalize_json_ld(match: re.Match[str], sport: str) -> str:
    opening, body, closing = match.groups()
    if '"BreadcrumbList"' not in body:
        return opening + body + closing
    item_re = re.compile(
        r'("item"\s*:\s*")https://propellerpicks\.com/analyzer/\?sport='
        + re.escape(sport)
        + r'(")',
        re.IGNORECASE,
    )
    body = item_re.sub(
        rf"\1https://propellerpicks.com/analyzer/{sport}/\2",
        body,
    )
    return opening + body + closing


def normalize(source: str, sport: str, hubs: set[str]) -> str:
    """Rewrite breadcrumb links for ``sport`` only when its hub exists."""
    if sport not in hubs:
        return source
    source = BREADCRUMB_NAV_RE.sub(lambda match: _normalize_nav(match, sport), source)
    source = JSON_LD_RE.sub(lambda match: _normalize_json_ld(match, sport), source)
    return source


def main(argv: list[str] | None = None, root: Path = ROOT) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)

    hubs = set(hub_sports(root))
    analyzer = root / "analyzer"
    if not analyzer.is_dir():
        print("sport_hub_links_checked=0 changed=0 hubs=none")
        return 0
    paths = sorted(
        path
        for sport_dir in (path for path in analyzer.iterdir() if path.is_dir())
        for path in sport_dir.glob("*/index.html")
    )
    changed: list[Path] = []
    for path in paths:
        source = path.read_text(encoding="utf-8")
        updated = normalize(source, path.parent.parent.name, hubs)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")

    print(
        f"sport_hub_links_checked={len(paths)} changed={len(changed)} "
        f"hubs={','.join(sorted(hubs)) or 'none'}"
    )
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
