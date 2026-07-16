#!/usr/bin/env python3
"""Fail when the AI sports betting research program loses a public contract."""

from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = {
    "ai-sports-betting/index.html": ("Free AI Sports Betting Tool", "/ai-sports-betting/"),
    "guides/how-ai-sports-betting-works/index.html": ("How AI Sports Betting Analysis Works", "/guides/how-ai-sports-betting-works/"),
    "research/ai-player-prop-benchmark/index.html": ("AI Player Prop Tools Compared", "/research/ai-player-prop-benchmark/"),
    "research/prospective-record/index.html": ("Forward ROI Record", "/research/prospective-record/"),
    "tools/ai-betting-prompt-builder/index.html": ("AI Sports Betting Prompt Builder", "/tools/ai-betting-prompt-builder/"),
}
PICKS = [ROOT / "picks" / "index.html", *sorted((ROOT / "picks").glob("*/index.html"))]
FORBIDDEN = ("guaranteed winner", "guaranteed pick", "risk-free bet")


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for rel, (title_phrase, canonical_path) in PAGES.items():
        path = ROOT / rel
        require(path.exists(), f"missing {rel}", errors)
        if not path.exists():
            continue
        source = path.read_text(encoding="utf-8")
        require(title_phrase.lower() in source.lower(), f"{rel}: unique title phrase missing", errors)
        require(f'https://propellerpicks.com{canonical_path}' in source, f"{rel}: canonical missing", errors)
        require('<meta name="robots" content="index, follow' in source, f"{rel}: not indexable", errors)
        require('<h1' in source, f"{rel}: H1 missing", errors)
        require(re.search(r'<span class="air-byline">[^<]*Scott Olmer[^<]*</span>', source), f"{rel}: visible byline missing", errors)
        require('/editorial-policy/' in source, f"{rel}: corrections/editorial link missing", errors)
        require('21+' in source and '1-800-GAMBLER' in source, f"{rel}: responsible-use footer missing", errors)
        require('/assets/css/ai-research.css' in source, f"{rel}: shared design missing", errors)
        for phrase in FORBIDDEN:
            require(phrase not in source.lower(), f"{rel}: forbidden claim '{phrase}'", errors)

    ledger = json.loads((ROOT / "data/prospective-picks.json").read_text(encoding="utf-8"))
    require(ledger.get("before_event_start_verified") is False, "ledger event-start flag must be false", errors)
    require("not verified" in ledger.get("publication_definition", "").lower(), "ledger limitation missing", errors)
    require("first observed" in ledger.get("publication_definition", "").lower(), "ledger first-observed definition missing", errors)
    require("before the outcome was known" not in ledger.get("publication_definition", "").lower(), "ledger makes an unverified outcome-timing claim", errors)
    ids = [row.get("publication_id") for row in ledger.get("records", [])]
    require(len(ids) == len(set(ids)), "ledger publication IDs are not unique", errors)

    method = json.loads((ROOT / "data/methodology-version.json").read_text(encoding="utf-8"))
    confidence_definition = method.get("confidence_definition", "").lower()
    require(
        "not calibrated win probability" in confidence_definition
        or "not a calibrated win probability" in confidence_definition,
        "confidence definition drifted",
        errors,
    )

    require(len(PICKS) == 9, f"expected 9 picks pages, found {len(PICKS)}", errors)
    for path in PICKS:
        source = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT)
        require("AI player-prop research" in source, f"{rel}: research module missing", errors)
        require("/research/prospective-record/" in source, f"{rel}: forward record link missing", errors)
        require("not win probability" in source, f"{rel}: confidence limitation missing", errors)

    indexed = [line for line in (ROOT / "scripts/analyzer_indexed.txt").read_text().splitlines() if line]
    by_sport: dict[str, int] = {}
    for url in indexed:
        match = re.fullmatch(r"/analyzer/([^/]+)/[^/]+/", url)
        require(bool(match), f"invalid indexed player URL: {url}", errors)
        if match:
            by_sport[match.group(1)] = by_sport.get(match.group(1), 0) + 1
            page = ROOT / url.strip("/") / "index.html"
            source = page.read_text(encoding="utf-8")
            require('data-current-props="true"' in source, f"indexed page lacks current data: {url}", errors)
    for sport, count in by_sport.items():
        require(count <= 50, f"{sport} has {count} indexed player cards", errors)

    prompt_js = (ROOT / "assets/js/ai-prompt-builder.js").read_text(encoding="utf-8")
    for phrase in ("primary sources", "no action", "Do not recommend a stake", "strongest case for each side"):
        require(phrase in prompt_js, f"prompt builder missing requirement: {phrase}", errors)

    for rel in (
        "images/ai-sports-betting-research.png",
        "images/forward-publication-record.png",
        "images/ai-player-prop-benchmark.png",
        "images/ai-sports-betting-research.svg",
        "images/forward-publication-record.svg",
        "images/ai-player-prop-benchmark.svg",
    ):
        require((ROOT / rel).exists() and (ROOT / rel).stat().st_size > 1000, f"share asset missing or empty: {rel}", errors)

    if errors:
        print("AI search asset contract failures:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"ai_search_assets=ok pages={len(PAGES)} picks_pages={len(PICKS)} ledger_rows={len(ids)} indexed_players={len(indexed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
