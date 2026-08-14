#!/usr/bin/env python3
"""Regression checks for answer-first AEO retrieval owners and their evidence."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


OWNERS = {
    "/analyzer/": [
        "Propeller Picks is a free player prop analyzer with AI-assisted, plain-language research",
        "Is there a free player prop analyzer with no account required?",
        "/guides/ai-player-prop-analyzer-vs-dfs-optimizer/",
        "/guides/how-ai-sports-betting-works/",
        "/data/methodology-version.json",
        "/results/",
        "/research/prospective-record/",
    ],
    "/picks/prizepicks/": ["Propeller Picks&#x27; current player-prop research"],
    "/picks/underdog/": ["Propeller Picks&#x27; current player-prop research"],
    "/picks/pick6/": ["Propeller Picks&#x27; current player-prop research"],
    "/research/ai-player-prop-benchmark/": [
        "Which AI player-prop tools show their methodology and results?",
        "50–100 directional model-confidence score",
        "How Propeller grades and publishes its evidence.",
        "final stat finishes above the listed line",
        "equals the listed line, the result is graded as a push or neutral",
        "/guides/how-ai-sports-betting-works/",
        "/data/methodology-version.json",
        "/results/",
        "/research/prospective-record/",
        "/track-record/",
        "/help/how-does-propeller-grade-picks/",
        "/data/performance-snapshot.json",
        "/data/index.json",
    ],
    "/ai-sports-betting/": [
        "What is a free AI sports betting tool for player props?",
        "Propeller Picks is a free AI-assisted player-prop research tool",
        "public analyzer works without an account",
        "designed for DFS and pick'em platforms",
        "does not accept wagers, place entries, or operate as a sportsbook",
        "/analyzer/",
        "/guides/how-ai-sports-betting-works/",
        "/research/prospective-record/",
        "/data/product-facts.json",
    ],
    "/guides/ai-player-prop-analyzer-vs-dfs-optimizer/": [
        "Research a line. Do not confuse that with building an entry.",
        "Propeller’s public analyzer helps research a listed line.",
        "does not build, rank, or submit DFS entries",
        "/analyzer/",
        "/research/evidence/",
        "/data/methodology-version.json",
        "/data/product-facts.json",
        "/results/",
        "/research/prospective-record/",
    ],
    "/research/evidence/": [
        "Evidence before",
        "A public evidence map—not a performance claim.",
        "/guides/how-ai-sports-betting-works/",
        "/data/methodology-version.json",
        "/results/",
        "/research/prospective-record/",
        "/data/prospective-picks.json",
        "/editorial-policy/",
    ],
    "/research/": [
        "Methods, data, and",
        "/research/evidence/",
        "/guides/how-ai-sports-betting-works/",
        "/research/prospective-record/",
        "/results/",
        "/research/ai-player-prop-benchmark/",
    ],
    "/tools/ai-betting-prompt-builder/": [
        "What is a good ChatGPT prompt for sports betting research?",
        "fresh primary sources",
        "no-action conclusion",
        "/analyzer/",
        "/guides/how-ai-sports-betting-works/",
        "/research/ai-player-prop-benchmark/",
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

    homepage = (ROOT / "index.html").read_text(encoding="utf-8")
    assert homepage.count('/research/ai-player-prop-benchmark/') >= 2, (
        "homepage must promote the benchmark in both the record copy and evidence links"
    )
    assert "First-observed capture" in homepage, "homepage publication boundary missing"
    assert '"dateModified": "2026-08-14"' in homepage, "homepage schema date is stale"
    assert "does not independently verify event-start ordering or outcome timing" in homepage, (
        "homepage must disclose the prospective ledger timing limitation"
    )
    for stale in ("before the result is known", "Logged before results"):
        assert stale not in homepage, f"unsupported homepage timing claim remains: {stale}"

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
