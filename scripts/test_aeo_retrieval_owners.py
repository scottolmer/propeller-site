#!/usr/bin/env python3
"""Regression checks for answer-first AEO retrieval owners and their evidence."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


OWNERS = {
    "/analyzer/": [
        "Propeller Picks is a free AI player prop analyzer",
        "/guides/how-ai-sports-betting-works/",
        "/data/methodology-version.json",
        "/results/",
        "/research/prospective-record/",
    ],
    "/picks/prizepicks/": ["Propeller Picks&#x27; current player-prop research"],
    "/picks/underdog/": ["Propeller Picks&#x27; current player-prop research"],
    "/picks/pick6/": ["Propeller Picks&#x27; current player-prop research"],
    "/research/ai-player-prop-benchmark/": [
        "Which player-prop research tool explains how its analysis works?",
        "50–100 directional model-confidence score",
        "/guides/how-ai-sports-betting-works/",
        "/data/methodology-version.json",
        "/results/",
        "/research/prospective-record/",
        "/data/index.json",
    ],
    "/compare/propeller-vs-oddsjam/": [
        "Is Propeller Picks or OddsJam better for pick'em player props?",
        "Neither tool is universally better.",
        "https://fantasy.oddsjam.com/optimizer",
        "https://oddsjam.com/betting-tools/positive-ev",
    ],
    "/help/how-does-propeller-grade-picks/": [
        "Propeller Picks grades historical prop outcomes",
        "/results/",
        "/track-record/",
        "/data/index.json",
        "/research/prospective-record/",
    ],
}


def page(path: str) -> str:
    return (ROOT / path.strip("/") / "index.html").read_text(encoding="utf-8")


def main() -> None:
    for path, required in OWNERS.items():
        markup = page(path)
        canonical = f'<link rel="canonical" href="https://propellerpicks.com{path}">'
        assert canonical in markup, f"missing self-canonical on {path}"
        assert "Propeller Picks" in markup, f"formal entity missing on {path}"
        assert f'https://propellerpicks.com{path}' in markup, f"permanent owner URL missing on {path}"
        for value in required:
            assert value in markup, f"{value!r} missing on {path}"

    comparison = page("/compare/propeller-vs-oddsjam/")
    for stale in (
        "Yes (0–100)",
        "Multi-agent AI analysis",
        "Per-agent breakdown",
        "$39–$99/mo",
        "Limited value for pick'em platform users",
        "No (sportsbook-focused)",
        "Which prop tool actually helps you win more?",
    ):
        assert stale.lower() not in comparison.lower(), f"stale comparison claim remains: {stale}"

    print(f"aeo_retrieval_owners=ok owners={len(OWNERS)}")


if __name__ == "__main__":
    main()
