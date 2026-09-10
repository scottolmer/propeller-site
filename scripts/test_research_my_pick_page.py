"""Focused public-page contracts for the Research My Pick discovery surface."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "tools/research-my-pick/index.html"
HUB = ROOT / "tools/index.html"


class ResearchMyPickPageTests(unittest.TestCase):
    def setUp(self) -> None:
        self.page = PAGE.read_text(encoding="utf-8")
        self.hub = HUB.read_text(encoding="utf-8")

    def test_page_is_canonical_and_discoverable_from_tools(self) -> None:
        url = "https://propellerpicks.com/tools/research-my-pick/"
        self.assertIn(f'<link rel="canonical" href="{url}">', self.page)
        self.assertIn('href="/tools/research-my-pick/"', self.hub)
        self.assertIn(url, (ROOT / "sitemap.xml").read_text(encoding="utf-8"))

    def test_page_links_to_the_live_tool(self) -> None:
        app_url = "https://app.propellerpicks.com/research/my-pick"
        self.assertGreaterEqual(self.page.count(f'href="{app_url}"'), 2)
        for sport in ("nfl", "mlb", "nba"):
            self.assertIn(f'href="{app_url}?sport={sport}"', self.page)
        self.assertNotIn('aria-disabled="true"', self.page)
        self.assertIn("Research my pick", self.page)
        self.assertIn("Research an upcoming NFL, MLB, or NBA player prop", self.hub)

    def test_multisport_markets_are_advertised_with_data_availability_conditions(self) -> None:
        for market in ("passing yards", "passing touchdowns", "passing completions", "passing interceptions", "rushing yards", "rushing attempts", "receiving yards", "receptions"):
            self.assertIn(market, self.page.lower())
        self.assertIn("Eight offensive markets", self.page)
        self.assertIn("Current DFS prop options can appear when available", self.page)
        self.assertIn("a board listing is not required", self.page)
        for market in ("hits", "total bases", "pitcher strikeouts", "points", "rebounds", "assists", "three-pointers made"):
            self.assertIn(market, self.page.lower())
        self.assertIn("upcoming game and fresh verified data", self.page)
        self.assertIn("NBA games may be unavailable during the offseason", self.page)
        self.assertIn("Research My Pick does not show a score", self.page)
        self.assertNotIn("Tackles", self.page)
        self.assertNotIn("defensive sacks", self.page.lower())

    def test_copy_does_not_promise_a_result_for_every_player(self) -> None:
        self.assertIn("A result can still be withheld", self.page)
        self.assertIn("does not provide enough support for research", self.page)

    def test_score_is_not_presented_as_win_probability_or_payout(self) -> None:
        self.assertIn("Historical support", self.page)
        self.assertIn("Past results are compared with your line", self.page)
        self.assertIn("Recent games count more; small samples pull support toward 50", self.page)
        self.assertIn("Research notes add context; Historical support is not a win probability", self.page)
        self.assertIn("not a payout estimate or guarantee", self.page)
        self.assertIn("Win, Loss, Push, or Void", self.page)

    def test_available_application_schema_matches_current_scope(self) -> None:
        blocks = re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', self.page, re.S)
        schemas = [json.loads(block) for block in blocks]
        schema = next(item for item in schemas if item.get("@type") == "WebApplication")
        self.assertEqual(schema["url"], "https://propellerpicks.com/tools/research-my-pick/")
        self.assertTrue(schema["isAccessibleForFree"])
        self.assertIn("NFL, MLB, or NBA", schema["description"])


if __name__ == "__main__":
    unittest.main()
