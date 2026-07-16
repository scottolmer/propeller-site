#!/usr/bin/env python3
"""Focused content-contract tests for the three DFS payout calculators."""

from __future__ import annotations

import json
import pathlib
import re
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = {
    "prizepicks": ROOT / "tools/prizepicks-payout-calculator/index.html",
    "underdog": ROOT / "tools/underdog-payout-calculator/index.html",
    "pick6": ROOT / "tools/pick6-payout-calculator/index.html",
}


def source(name: str) -> str:
    return PAGES[name].read_text(encoding="utf-8")


def faq_schema(page: str) -> dict:
    for raw in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        page,
        flags=re.DOTALL | re.IGNORECASE,
    ):
        data = json.loads(raw)
        if data.get("@type") == "FAQPage":
            return data
    raise AssertionError("FAQPage schema not found")


class SharedCalculatorContracts(unittest.TestCase):
    def test_every_page_has_seven_faqs_sources_and_research_links(self):
        expected_pick_links = {
            "prizepicks": "/picks/prizepicks/",
            "underdog": "/picks/underdog/",
            "pick6": "/picks/pick6/",
        }
        for name, picks_link in expected_pick_links.items():
            with self.subTest(page=name):
                page = source(name)
                self.assertEqual(len(faq_schema(page)["mainEntity"]), 7)
                self.assertEqual(page.count('class="faq-item"'), 7)
                self.assertIn("Verified July", page)
                self.assertIn('class="source-note"', page)
                self.assertIn(f'href="{picks_link}"', page)
                self.assertIn('href="/analyzer/"', page)
                self.assertIn("scenario", page.lower())


class PrizePicksContracts(unittest.TestCase):
    def test_standard_minimum_guarantee_rates_remain_distinguished(self):
        page = source("prizepicks")
        self.assertIn("mult:37.5", page)
        self.assertIn("mult:25", page)
        self.assertIn("standard Player Pick", page)
        self.assertIn("details screen can display a different multiplier", page)
        self.assertIn("https://www.prizepicks.com/help-center/payouts", page)

    def test_invalid_custom_amount_resets_visible_state(self):
        page = source("prizepicks")
        self.assertIn("if (!Number.isFinite(v) || v <= 0)", page)
        self.assertIn("amount = 20", page)
        self.assertIn("refreshIfVisible()", page)


class UnderdogContracts(unittest.TestCase):
    def test_base_table_and_modifier_maximum_are_distinguished(self):
        page = source("underdog")
        self.assertIn("120x eight-pick Standard base payout", page)
        self.assertIn("5,000x maximum multiplier", page)
        self.assertIn("2:3.5", page)
        self.assertIn("8:120", page)
        self.assertIn("8:[{need:8,mult:80}", page)

    def test_invalid_custom_amount_resets_visible_state(self):
        page = source("underdog")
        self.assertIn("if(!Number.isFinite(raw)||raw<=0)", page)
        self.assertIn("amount=20", page)
        self.assertIn("refreshIfVisible()", page)


class Pick6Contracts(unittest.TestCase):
    def test_user_supplies_current_draftkings_multiplier(self):
        page = source("pick6")
        self.assertIn('id="guaranteedMultiplier"', page)
        self.assertIn("minimum guaranteed Base Payout", page)
        self.assertIn("Extra Winnings", page)
        self.assertNotIn("const PAYOUTS", page)
        self.assertNotIn("40x", page)
        self.assertIn("payout = amount * mult", page)
        self.assertIn("const scenarioReturn = (payout * prob) - amount", page)


if __name__ == "__main__":
    unittest.main()
