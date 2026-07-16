#!/usr/bin/env python3
"""Regression tests for platform-intent link normalization."""

from __future__ import annotations

import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from normalize_platform_intent_links import normalize


class NormalizePlatformIntentLinksTests(unittest.TestCase):
    def test_current_research_links_are_not_labeled_as_strategy(self) -> None:
        source = (
            '<a href="/picks/prizepicks/">PrizePicks Strategy</a>'
            '<a href="/picks/underdog/">Underdog Strategy</a>'
            '<a href="/picks/pick6/">Pick6 Strategy</a>'
        )
        normalized = normalize(source)

        self.assertIn('<a href="/picks/prizepicks/">PrizePicks Research</a>', normalized)
        self.assertIn('<a href="/picks/underdog/">Underdog Research</a>', normalized)
        self.assertIn('<a href="/picks/pick6/">Pick6 Research</a>', normalized)

    def test_strategy_guide_link_is_unchanged(self) -> None:
        source = '<a href="/guides/prizepicks-strategy/">PrizePicks Strategy</a>'

        self.assertEqual(normalize(source), source)

    def test_normalization_is_idempotent(self) -> None:
        source = '<a href="/picks/prizepicks/">PrizePicks Strategy</a>'
        normalized = normalize(source)

        self.assertEqual(normalize(normalized), normalized)


if __name__ == "__main__":
    unittest.main()
