#!/usr/bin/env python3
"""Regression contract for the analyzer-versus-optimizer search intent."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GUIDE = "/guides/ai-player-prop-analyzer-vs-dfs-optimizer/"
EVIDENCE = "/research/evidence/"
RESEARCH = "/research/"


def source(path: str) -> str:
    return (ROOT / path.strip("/") / "index.html").read_text(encoding="utf-8")


def assert_canonical(markup: str, path: str) -> None:
    assert f'<link rel="canonical" href="https://propellerpicks.com{path}">' in markup
    assert f'https://propellerpicks.com{path}' in markup


def main() -> None:
    guide = source(GUIDE)
    evidence = source(EVIDENCE)
    research = source(RESEARCH)
    analyzer = source("/analyzer/")
    guide_index = source("/guides/")
    llms = (ROOT / "llms.txt").read_text(encoding="utf-8")
    catalog = json.loads((ROOT / "data/index.json").read_text(encoding="utf-8"))
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")

    assert_canonical(guide, GUIDE)
    assert_canonical(evidence, EVIDENCE)
    assert_canonical(research, RESEARCH)
    assert '"@type":"Article"' in guide
    assert '"@type":"BreadcrumbList"' in guide
    assert '"@type":"FAQPage"' in guide
    for phrase in (
        "A player-prop analyzer helps you evaluate one displayed player-stat line",
        "A DFS optimizer uses a group of candidates, projections, and stated constraints",
        "does not build, rank, or submit DFS entries",
        "not a calibrated win probability",
        "free to use without an account",
        "/picks/prizepicks/",
        "/picks/underdog/",
        "/picks/pick6/",
        EVIDENCE,
    ):
        assert phrase in guide, f"guide missing required boundary: {phrase}"

    for phrase in (
        "/guides/how-ai-sports-betting-works/",
        "/data/methodology-version.json",
        "/data/product-facts.json",
        "/results/",
        "/research/prospective-record/",
        "/data/prospective-picks.json",
        "/editorial-policy/",
        "not a performance claim",
    ):
        assert phrase in evidence, f"evidence hub missing source or limitation: {phrase}"

    assert f'href="{GUIDE}"' in analyzer
    assert f'href="{GUIDE}"' in guide_index
    assert f"https://propellerpicks.com{GUIDE}" in llms
    assert f"https://propellerpicks.com{EVIDENCE}" in llms
    assert f"https://propellerpicks.com{RESEARCH}" in llms
    page_ids = {item["id"] for item in catalog["answer_engine_pages"]}
    assert {"analyzer-vs-dfs-optimizer", "research-evidence-hub", "research-library"} <= page_ids
    assert f"https://propellerpicks.com{GUIDE}" in sitemap
    assert f"https://propellerpicks.com{EVIDENCE}" in sitemap
    assert f"https://propellerpicks.com{RESEARCH}" in sitemap

    print("analyzer_optimizer_ownership=ok guide_and_evidence_hub=indexed")


if __name__ == "__main__":
    main()
