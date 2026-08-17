#!/usr/bin/env python3
"""Regression checks for Propeller's public mobile-app calls to action."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_STORE_URL = "https://apps.apple.com/app/id6760788202"
PLAY_STORE_URL = (
    "https://play.google.com/store/apps/details?"
    "id=com.propellerpicks.propeller&utm_source=na_Med"
)


class PlayStoreContracts(unittest.TestCase):
    def test_homepage_and_source_link_to_google_play(self) -> None:
        for relative in ("index.html", "mockups/home-ai-winning-v2.html"):
            source = (ROOT / relative).read_text(encoding="utf-8")
            self.assertIn(PLAY_STORE_URL.replace("&", "&amp;"), source)
            self.assertIn("Get Propeller Picks on Google Play", source)
            self.assertIn("Google Play", source)

    def test_homepage_and_source_link_to_app_store(self) -> None:
        for relative in ("index.html", "mockups/home-ai-winning-v2.html"):
            source = (ROOT / relative).read_text(encoding="utf-8")
            self.assertIn(APP_STORE_URL, source)
            self.assertIn("Download Propeller Picks on the App Store", source)
            self.assertIn("Get the mobile app · iOS + Android", source)

    def test_homepage_schema_exposes_google_play_install_url(self) -> None:
        source = (ROOT / "index.html").read_text(encoding="utf-8")
        documents = re.findall(
            r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
            source,
            flags=re.DOTALL,
        )
        graph = json.loads(documents[0])["@graph"]
        software = next(node for node in graph if node.get("@type") == "SoftwareApplication")
        self.assertIn(APP_STORE_URL, software["installUrl"])
        self.assertIn(PLAY_STORE_URL, software["installUrl"])
        self.assertIn("iOS", software["operatingSystem"])
        self.assertIn("Android", software["operatingSystem"])

    def test_mobile_return_keeps_both_store_fallbacks(self) -> None:
        source = (ROOT / "mobile-return/index.html").read_text(encoding="utf-8")
        self.assertIn("https://apps.apple.com/app/id6760788202", source)
        self.assertIn(PLAY_STORE_URL.replace("&", "&amp;"), source)
        self.assertIn("Install from Google Play", source)

    def test_google_play_clicks_have_a_dedicated_event(self) -> None:
        analytics = (ROOT / "assets/js/analytics-events.js").read_text(encoding="utf-8")
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('host === "play.google.com"', analytics)
        self.assertIn('name: "play_store_click"', analytics)
        self.assertIn("/assets/css/home-ai.css?v=20260815", homepage)
        self.assertIn("/assets/js/analytics-events.js?v=20260817", homepage)


if __name__ == "__main__":
    unittest.main()
