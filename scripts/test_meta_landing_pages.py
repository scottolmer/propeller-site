#!/usr/bin/env python3
"""Regression checks for Meta paid-ad landing pages, attribution, and homepage offer alignment."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LP_PATHS = (
    "lp/entry-check/index.html",
    "lp/ledger/index.html",
    "lp/tonights-board/index.html",
)


class MetaLandingPageContracts(unittest.TestCase):
    def test_landing_pages_remove_exit_navigation_and_bad_play_utm(self) -> None:
        for rel in LP_PATHS:
            with self.subTest(page=rel):
                html = (ROOT / rel).read_text(encoding="utf-8")
                self.assertNotIn("pp-site-nav__links", html)
                self.assertNotIn("pp-site-footer__grid", html)
                self.assertNotIn("utm_source=na_Med", html)
                self.assertNotIn('href="https://propellerpicks.com/"', html)
                self.assertIn('/assets/js/signup-attribution.js?v=20261124', html)
                self.assertIn('/assets/js/analytics-events.js?v=20260817', html)
                self.assertIn("og-home-ai-1200x630.png", html)

    def test_landing_ads_css_uses_swap_font_display(self) -> None:
        css = (ROOT / "assets/css/landing-ads.css").read_text(encoding="utf-8")
        self.assertGreaterEqual(css.count("font-display: swap"), 3)

    def test_entry_check_discloses_mobile_app_and_sport_coverage(self) -> None:
        html = (ROOT / "lp/entry-check/index.html").read_text(encoding="utf-8")
        self.assertIn("Check My Slip", html)
        self.assertIn("MLB, NBA, and NFL", html)
        self.assertIn("mobile app", html.lower())

    def test_tonights_board_removes_free_picks_escape_and_loads_live_preview(self) -> None:
        html = (ROOT / "lp/tonights-board/index.html").read_text(encoding="utf-8")
        self.assertNotIn('href="/picks/"', html)
        self.assertIn("/assets/js/lp-live-preview.js", html)
        self.assertIn("data-lp-board-body", html)

    def test_ledger_lp_leads_with_proof_before_trial_cta_and_shows_mixed_outcomes(self) -> None:
        html = (ROOT / "lp/ledger/index.html").read_text(encoding="utf-8")
        self.assertLess(html.index("data-record-raw-total"), html.index('data-cta-id="lp-ledger-hero-signup"'))
        self.assertNotIn('href="/results/"', html)
        self.assertNotIn('href="/track-record/"', html)
        self.assertIn("lp-chip--hit", html)
        self.assertIn("lp-chip--miss", html)

    def test_results_page_reconciles_units_and_deduplicates_recent_sample(self) -> None:
        html = (ROOT / "results/index.html").read_text(encoding="utf-8")
        self.assertIn("data-results-raw-total", html)
        self.assertIn("/assets/js/analytics-events.js?v=20260817", html)
        self.assertIn("/assets/js/signup-attribution.js?v=20261124", html)
        tbody = re.search(r'<tbody data-ledger-body>(.*?)</tbody>', html, flags=re.DOTALL)
        self.assertIsNotNone(tbody)
        players = re.findall(r'<td class="player-cell">(.*?)</td>', tbody.group(1))
        self.assertGreaterEqual(len(players), 5)
        self.assertEqual(len(players), len(set(players)), f"Duplicate players in recent sample: {players}")
        self.assertIn("result-win", tbody.group(1))
        self.assertIn("result-loss", tbody.group(1))

    def test_homepage_surfaces_trial_offer_removes_hero_mcp_and_fixes_nav_metric(self) -> None:
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        hero = html.split("</section>", 1)[0]
        self.assertIn('name="theme-color" content="#031a2c"', html)
        self.assertIn("Start 7-day free trial", hero)
        self.assertIn("$15/mo", hero)
        self.assertNotIn("MCP", hero)
        self.assertNotIn("utm_source=na_Med", html)
        self.assertNotIn('data-analytics-event="signup_click" data-cta-id="site-nav-pricing"', html)
        self.assertIn('data-analytics-event="pricing_click" data-cta-id="site-nav-pricing"', html)

    def test_conversion_pages_load_analytics_events_and_attribution(self) -> None:
        for rel in (
            "pricing/index.html",
            "results/index.html",
            "track-record/index.html",
            "how-it-works/index.html",
            "picks/index.html",
        ):
            with self.subTest(page=rel):
                html = (ROOT / rel).read_text(encoding="utf-8")
                self.assertIn("/assets/js/analytics-events.js?v=20260817", html)
                self.assertIn("/assets/js/signup-attribution.js?v=20261124", html)


if __name__ == "__main__":
    unittest.main()
