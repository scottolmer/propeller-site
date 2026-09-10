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

    def test_page_links_to_the_guest_capable_app_tool(self) -> None:
        self.assertGreaterEqual(self.page.count('https://app.propellerpicks.com/research/my-pick'), 2)
        self.assertIn("one complete guest analysis", self.page.lower())
        self.assertIn("save and track", self.page.lower())

    def test_supported_markets_are_explicit_and_defensive_markets_are_not_advertised(self) -> None:
        for market in ("Passing Yards", "Rushing Yards", "Receiving Yards", "Receptions", "Points", "Rebounds", "Assists", "Made Three-Pointers", "Hits", "Total Bases", "Pitcher Strikeouts"):
            self.assertIn(market, self.page)
        self.assertNotIn("Tackles", self.page)
        self.assertNotIn("defensive sacks", self.page.lower())

    def test_score_is_not_presented_as_win_probability_or_payout(self) -> None:
        self.assertIn("not a win probability, payout estimate, or guarantee", self.page)
        self.assertIn("Win, Loss, Push, or Void", self.page)

    def test_software_application_schema_is_valid(self) -> None:
        blocks = re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', self.page, re.S)
        schemas = [json.loads(block) for block in blocks]
        schema = next(item for item in schemas if item.get("@type") == "SoftwareApplication")
        self.assertEqual(schema["url"], "https://propellerpicks.com/tools/research-my-pick/")
        self.assertEqual(schema["offers"]["price"], "0")


if __name__ == "__main__":
    unittest.main()
