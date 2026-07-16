#!/usr/bin/env python3
"""Regression contract for generated sport-specific analyzer answers."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "sport-answer-modules.json"


class SportAnswerModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.payload = json.loads(DATA.read_text(encoding="utf-8"))
        cls.pages = cls.payload["pages"]

    def test_release_cohort_is_evidence_backed(self) -> None:
        self.assertEqual({page["slug"] for page in self.pages}, {"mlb", "nfl"})
        for page in self.pages:
            evidence = page["gsc_evidence"]
            self.assertEqual(evidence["date_range"], "2026-06-16 to 2026-07-13")
            self.assertGreater(evidence["impressions"], 0)
            self.assertEqual(page["canonical_target"], f'/picks/{page["slug"]}/')

    def test_data_contract_preserves_product_facts(self) -> None:
        for page in self.pages:
            answer_words = re.findall(r"\b[\w'/-]+\b", page["direct_answer"])
            self.assertGreaterEqual(len(answer_words), 40)
            self.assertLessEqual(len(answer_words), 65)
            card_copy = " ".join(card["body"] for card in page["cards"])
            self.assertIn("50-100 directional model-confidence score", card_copy)
            self.assertIn("not a calibrated win probability or guarantee", card_copy)
            self.assertIn("Missing or neutral signals are skipped", card_copy)
            combined = f'{page["direct_answer"]} {card_copy} {page["availability_note"]}'.lower()
            for forbidden in ("lock", "guaranteed win", "automatic lineup", "agent count", "win rate"):
                self.assertNotIn(forbidden, combined)

    def test_pages_contain_one_crawlable_module(self) -> None:
        for page in self.pages:
            path = ROOT / page["canonical_target"].strip("/") / "index.html"
            source = path.read_text(encoding="utf-8")
            self.assertEqual(source.count("<!-- PP_SPORT_ANSWER_HEAD_START -->"), 1)
            self.assertEqual(source.count("<!-- PP_SPORT_ANSWER_HEAD_END -->"), 1)
            self.assertEqual(source.count("<!-- PP_SPORT_ANSWER_START -->"), 1)
            self.assertEqual(source.count("<!-- PP_SPORT_ANSWER_END -->"), 1)
            self.assertEqual(source.count('id="sport-analyzer-answer"'), 1)
            self.assertIn(page["heading"], source)
            self.assertIn(page["direct_answer"], source)
            module = source.split("<!-- PP_SPORT_ANSWER_START -->", 1)[1].split("<!-- PP_SPORT_ANSWER_END -->", 1)[0]
            self.assertIn('<a class="pp-sport-answer__cta" href="/analyzer/">', module)
            self.assertIn("does not accept wagers, place entries, or guarantee outcomes", module)

    def test_nfl_has_visible_no_slate_qualification(self) -> None:
        nfl = next(page for page in self.pages if page["slug"] == "nfl")
        source = (ROOT / "picks/nfl/index.html").read_text(encoding="utf-8")
        self.assertIn(nfl["availability_note"], source)
        self.assertIn("offseason", nfl["availability_note"].lower())
        self.assertIn("empty state", nfl["availability_note"].lower())

    def test_modules_do_not_duplicate_faq_markup(self) -> None:
        for page in self.pages:
            source = (ROOT / page["canonical_target"].strip("/") / "index.html").read_text(encoding="utf-8")
            module = source.split("<!-- PP_SPORT_ANSWER_START -->", 1)[1].split("<!-- PP_SPORT_ANSWER_END -->", 1)[0]
            self.assertNotIn("FAQPage", module)
            self.assertNotIn("faq-item", module)


if __name__ == "__main__":
    unittest.main()
