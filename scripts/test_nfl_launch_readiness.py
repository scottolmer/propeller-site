#!/usr/bin/env python3
"""Regression contract for NFL launch discovery, freshness, and deep linking."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "guides" / "nfl-player-prop-research" / "index.html"
PICKS = ROOT / "picks" / "nfl" / "index.html"
ANALYZER = ROOT / "analyzer" / "index.html"


class NflLaunchReadinessTests(unittest.TestCase):
    def test_nfl_guide_is_indexable_and_accountable(self) -> None:
        source = GUIDE.read_text(encoding="utf-8")
        self.assertIn("<title>How to Research NFL Player Props (2026) | Propeller</title>", source)
        self.assertIn('https://propellerpicks.com/guides/nfl-player-prop-research/', source)
        self.assertIn('content="index, follow', source)
        self.assertIn('"name":"Scott Olmer"', source)
        self.assertIn('data-editorial-sources="true"', source)
        self.assertIn("NFL injury report", source)
        self.assertIn("not a calibrated win probability", source)

    def test_nfl_analyzer_entry_point_preserves_sport_intent(self) -> None:
        analyzer = ANALYZER.read_text(encoding="utf-8")
        picks = PICKS.read_text(encoding="utf-8")
        self.assertIn("function requestedSport()", analyzer)
        self.assertIn("loadSport(initialSport)", analyzer)
        self.assertIn('href="/analyzer/?sport=nfl"', picks)

    def test_public_discovery_surfaces_explain_nfl_slate_state(self) -> None:
        catalog = json.loads((ROOT / "data" / "index.json").read_text(encoding="utf-8"))
        feeds = {feed["id"]: feed for feed in catalog["safe_public_feeds"]}
        self.assertEqual(feeds["nfl-public-slate"]["method"], "GET")
        self.assertIn("historical rows as current", feeds["nfl-public-slate"]["description"])
        llms = (ROOT / "llms.txt").read_text(encoding="utf-8")
        self.assertIn("NFL public slate state", llms)
        self.assertIn("NFL player-prop research guide", llms)

    def test_august_aeo_cohort_is_frozen_and_complete(self) -> None:
        targets = json.loads((ROOT / "docs" / "seo" / "aeo-target-questions-2026-08.json").read_text(encoding="utf-8"))
        self.assertEqual(targets["version"], "2026-08-nfl-v1")
        self.assertEqual(len(targets["target_questions"]), 20)
        instructions = targets["measurement_instructions"]
        self.assertEqual(instructions["expected_observations"], 20 * len(instructions["platforms"]) * instructions["runs_per_prompt"])
        ids = {target["id"] for target in targets["target_questions"]}
        self.assertTrue({"nfl-player-prop-research", "nfl-prop-analyzer", "nfl-props-today"}.issubset(ids))

    def test_legacy_alias_remains_a_minimal_noindex_interim(self) -> None:
        source = (ROOT / "nfl" / "index.html").read_text(encoding="utf-8")
        self.assertIn('<meta name="robots" content="noindex,follow">', source)
        self.assertRegex(source, r'content="0;url=/picks/nfl/"')
        self.assertIn("window.location.replace('/picks/nfl/')", source)


if __name__ == "__main__":
    unittest.main()
