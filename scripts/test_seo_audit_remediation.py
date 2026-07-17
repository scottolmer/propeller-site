#!/usr/bin/env python3
"""Regression contract for the July 2026 SEO audit remediation."""

from __future__ import annotations

import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SPORT_ALIASES = {
    "nba": "/picks/nba/",
    "nfl": "/picks/nfl/",
    "nhl": "/picks/nhl/",
    "mlb": "/picks/mlb/",
    "soccer": "/picks/soccer/",
}
GUIDES = (
    "guides/how-to-analyze-player-props/index.html",
    "guides/nba-prop-betting/index.html",
    "guides/prizepicks-strategy/index.html",
    "guides/pick6-strategy/index.html",
    "guides/underdog-strategy/index.html",
)
FORBIDDEN_AUDIT_PHRASES = (
    "67% win rate on 14k+",
    "profitable prop analysis",
    "consistently outperforms",
    "highest-edge window",
    "highest-edge opportunities",
    "exploitable inefficiency",
    "that disagreement is exploitable",
    "single most actionable edge",
    "directly improves long-term results",
    "legal-sports-report.com/dfs",
    "books set low lines",
    "most underpriced signal",
    "actually produce returns over time",
    "six-pick entries offer 40x",
    "highest win rates:",
    "true edge will produce",
    "no-vig true probability",
    "books misprice",
    "most underpriced variable",
    "edge window is real",
    "profitable analysis process",
    "still beatable",
    "edge is in the stat types",
    "can create useful edges",
    "can still be mispriced",
    "most repeatable edges",
    "with the highest edge",
    "confidence scores you can act on",
)


def american_implied(odds: int) -> float:
    if odds < 0:
        return abs(odds) / (abs(odds) + 100)
    return 100 / (odds + 100)


def no_vig_pair(first: int, second: int) -> tuple[float, float]:
    raw = american_implied(first), american_implied(second)
    total = sum(raw)
    return raw[0] / total, raw[1] / total


def sitemap_urls() -> list[str]:
    root = ET.parse(ROOT / "sitemap.xml").getroot()
    return [node.text or "" for node in root.iter() if node.tag.endswith("loc")]


def local_path(url: str) -> Path:
    path = urlparse(url).path.strip("/")
    return ROOT / (path or ".") / "index.html"


class SeoAuditRemediationTests(unittest.TestCase):
    def test_legacy_sport_aliases_are_minimal_noindex_redirects(self) -> None:
        for sport, target in SPORT_ALIASES.items():
            source = (ROOT / sport / "index.html").read_text(encoding="utf-8")
            self.assertIn('<meta name="robots" content="noindex,follow">', source)
            self.assertIn(f'<link rel="canonical" href="https://propellerpicks.com{target}">', source)
            self.assertIn(f'content="0;url={target}"', source)
            self.assertIn(f"window.location.replace('{target}')", source)
            self.assertIn(f'href="{target}"', source)
            self.assertNotIn('content="index, follow', source)
            self.assertLess(len(source.encode("utf-8")), 4_000)

    def test_sitemap_contains_only_self_canonical_indexable_html(self) -> None:
        urls = sitemap_urls()
        self.assertGreaterEqual(len(urls), 55)
        self.assertFalse(any(url.endswith((".json", ".txt", ".md")) for url in urls))
        for url in urls:
            path = local_path(url)
            self.assertTrue(path.exists(), f"missing HTML source for {url}")
            source = path.read_text(encoding="utf-8")
            self.assertNotRegex(source, r'<meta name="robots" content="[^"]*noindex')
            self.assertIn(f'<link rel="canonical" href="{url}">', source)

    def test_popular_player_links_never_target_unapproved_pages(self) -> None:
        approved = {
            f"/{line.strip('/')}/" for line in (ROOT / "scripts/analyzer_indexed.txt").read_text().split()
        }
        targets = [ROOT / "analyzer/index.html"] + [
            ROOT / "picks" / sport / "index.html" for sport in SPORT_ALIASES
        ]
        for path in targets:
            source = path.read_text(encoding="utf-8")
            for block in re.findall(
                r"<!-- popular-players:start -->(.*?)<!-- popular-players:end -->",
                source,
                flags=re.S,
            ):
                links = re.findall(r'href="(/analyzer/[^"#?]+/)"', block)
                self.assertEqual(set(links) - approved, set(), str(path.relative_to(ROOT)))

    def test_audited_claims_do_not_recur_on_indexable_pages(self) -> None:
        for url in sitemap_urls():
            source = local_path(url).read_text(encoding="utf-8").lower()
            for phrase in FORBIDDEN_AUDIT_PHRASES:
                self.assertNotIn(phrase, source, f"{url}: {phrase}")

    def test_no_vig_examples_are_mathematically_correct(self) -> None:
        first, second = no_vig_pair(-110, -110)
        self.assertAlmostEqual(first, 0.5, places=9)
        self.assertAlmostEqual(second, 0.5, places=9)
        first, second = no_vig_pair(-130, 110)
        self.assertAlmostEqual(first, 0.542744, places=6)
        self.assertAlmostEqual(second, 0.457256, places=6)
        nba = (ROOT / "guides/nba-prop-betting/index.html").read_text(encoding="utf-8")
        self.assertIn("raw implied probability is approximately 52.38%", nba)
        self.assertIn("produces a 50%/50% no-vig estimate", nba)

    def test_strategy_guides_expose_truthful_named_review(self) -> None:
        methodology = json.loads((ROOT / "data/methodology-version.json").read_text(encoding="utf-8"))
        for rel in GUIDES:
            source = (ROOT / rel).read_text(encoding="utf-8")
            blocks = re.findall(
                r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', source, flags=re.S
            )
            article = next(
                payload
                for payload in (json.loads(block) for block in blocks)
                if payload.get("@type") == "Article"
            )
            self.assertEqual(article.get("reviewedBy", {}).get("name"), "Scott Olmer")
            self.assertIn('href="/about/">Scott Olmer', source)
            self.assertIn('href="/editorial-policy/"', source)
            self.assertIn('data-editorial-sources="true"', source)
            self.assertIn('href="/how-it-works/"', source)
            self.assertIn(f'version {methodology["current_version"]}', source)
            self.assertIn('href="/data/methodology-version.json"', source)


if __name__ == "__main__":
    unittest.main()
