#!/usr/bin/env python3
"""Regression contract for platform search-intent ownership."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAP = json.loads((ROOT / "data/platform-intent-map.json").read_text())


def source(path: str) -> str:
    return (ROOT / path.strip("/") / "index.html").read_text()


def title(markup: str) -> str:
    match = re.search(r"<title>(.*?)</title>", markup, re.S | re.I)
    assert match
    return html.unescape(re.sub(r"<[^>]+>", "", match.group(1))).strip()


def h1(markup: str) -> str:
    match = re.search(r"<h1\b[^>]*>(.*?)</h1>", markup, re.S | re.I)
    assert match
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", match.group(1))).split())


def assert_canonical(markup: str, path: str) -> None:
    expected = f'<link rel="canonical" href="https://propellerpicks.com{path}">'
    assert expected in markup, f"missing canonical {expected}"


def main() -> None:
    assert len(MAP["platforms"]) == 3
    llms = (ROOT / "llms.txt").read_text()
    all_html = [path for path in ROOT.rglob("*.html") if "node_modules" not in path.parts]

    for platform in MAP["platforms"]:
        current = source(platform["current_research"])
        calculator = source(platform["payout_calculator"])
        guide = source(platform["strategy_guide"])
        alias = source(platform["legacy_alias"])

        for key in ("current_research", "payout_calculator", "strategy_guide"):
            assert_canonical(source(platform[key]), platform[key])
            assert f"https://propellerpicks.com{platform[key]}" in llms

        assert len(title(current)) <= 60, title(current)
        assert "picks today" in title(current).lower(), title(current)
        assert "current research" in current.lower() or "research board" in current.lower()
        assert 'id="strategy"' not in current
        assert "what is the best" not in current.lower()

        assert len(title(calculator)) <= 60, title(calculator)
        assert "payout calculator" in title(calculator).lower(), title(calculator)

        assert len(title(guide)) <= 60, title(guide)
        assert "strategy guide" in title(guide).lower(), title(guide)
        assert "strategy guide" in h1(guide).lower(), h1(guide)
        assert "picks today" not in title(guide).lower()
        assert "payout" not in title(guide).lower()

        assert '<meta name="robots" content="noindex,follow">' in alias
        assert_canonical(alias, platform["strategy_guide"])
        assert f'url={platform["strategy_guide"]}' in alias

        legacy_href = f'href="{platform["legacy_alias"]}"'
        offenders = [str(path.relative_to(ROOT)) for path in all_html if legacy_href in path.read_text()]
        assert offenders == [], f"legacy alias links remain: {offenders[:10]}"

    analyzer = source(MAP["shared_analyzer"])
    assert_canonical(analyzer, MAP["shared_analyzer"])
    assert "player prop analyzer" in title(analyzer).lower()
    for platform in MAP["platforms"]:
        assert f'href="{platform["current_research"]}"' in analyzer

    assert 'href="/picks/prizepicks/">PrizePicks Strategy</a>' not in "\n".join(
        path.read_text() for path in (ROOT / "blog/daily").glob("*.html")
    )
    print("platform_intent_ownership=ok platforms=3 canonical_surfaces=10")


if __name__ == "__main__":
    main()
