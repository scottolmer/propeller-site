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
    def test_every_page_has_expected_faqs_sources_and_research_links(self):
        expected_pick_links = {
            "prizepicks": "/picks/prizepicks/",
            "underdog": "/picks/underdog/",
            "pick6": "/picks/pick6/",
        }
        expected_faq_counts = {"prizepicks": 8, "underdog": 8, "pick6": 8}
        for name, picks_link in expected_pick_links.items():
            with self.subTest(page=name):
                page = source(name)
                self.assertEqual(len(faq_schema(page)["mainEntity"]), expected_faq_counts[name])
                self.assertEqual(page.count('class="faq-item"'), expected_faq_counts[name])
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
        self.assertIn("published base return for four correct picks is 0.25x", page)
        self.assertIn("not an ROI or profitability estimate", page)
        self.assertNotIn("Scenario expected return", page)
        self.assertNotIn('class="result-label">Profit', page)
        self.assertNotIn('class="flex-cell header">Profit', page)
        self.assertIn("function money(value)", page)
        self.assertIn("money(Math.abs(payoutMinusEntry))", page)
        self.assertIn("money(amount*t.mult)", page)
        self.assertNotIn("payoutMinusEntry.toFixed(0)", page)
        self.assertNotIn("(amount*t.mult).toFixed(0)", page)

    def test_six_pick_flex_quarter_return_keeps_cents(self):
        entry = 10.0
        payout = entry * 0.25
        self.assertEqual(f"${payout:,.2f}", "$2.50")
        self.assertEqual(f"-${abs(payout - entry):,.2f}", "-$7.50")

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
        self.assertIn("Pick count and entry amount cannot derive that current multiplier", page)
        self.assertIn("does not estimate ROI, expected value, or profitability", page)
        self.assertNotIn("Scenario expected return", page)
        self.assertNotIn("const scenarioReturn", page)

    def test_public_calculator_claims_match_product_fact_ledger(self):
        facts = json.loads((ROOT / "data/product-facts.json").read_text(encoding="utf-8"))
        calculators = facts["payout_calculators"]
        self.assertEqual(
            calculators["underdog"]["six_pick_flex_four_correct_base_return"],
            "0.25x",
        )
        self.assertTrue(
            calculators["draftkings_pick6"]["requires_visitor_entered_final_screen_multiplier"]
        )
        self.assertFalse(
            calculators["draftkings_pick6"]["pick_count_alone_determines_multiplier"]
        )
        self.assertFalse(calculators["claim_policy"]["estimates_roi"])
        self.assertFalse(calculators["claim_policy"]["recommends_profitability"])


if __name__ == "__main__":
    unittest.main()
