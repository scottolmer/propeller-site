#!/usr/bin/env python3
"""Regression tests for critical-render Lighthouse delivery fixes."""

from __future__ import annotations

import re
import unittest
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SITEMAP_URL_RE = re.compile(r"<loc>https://propellerpicks\.com(?P<path>/[^<]*)</loc>")


def public_pages() -> list[Path]:
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    pages = []
    for match in SITEMAP_URL_RE.finditer(sitemap):
        path = urlparse(match.group("path")).path.strip("/")
        pages.append(ROOT / path / "index.html" if path else ROOT / "index.html")
    return pages


class LighthouseDeliveryTest(unittest.TestCase):
    def test_public_pages_do_not_block_on_remote_analytics_or_lucide(self) -> None:
        for path in public_pages():
            source = path.read_text(encoding="utf-8")
            self.assertNotIn("googletagmanager.com/gtag/js", source, path)
            self.assertNotIn("unpkg.com/lucide", source, path)

    def test_hero_copy_does_not_wait_for_animation_javascript(self) -> None:
        for path in public_pages():
            source = path.read_text(encoding="utf-8")
            if 'class="hero' in source and 'class="fade-in' in source:
                self.assertIn('id="pp-critical-hero"', source, path)

    def test_local_lucide_subset_is_small_and_api_compatible(self) -> None:
        path = ROOT / "assets/js/lucide-subset.js"
        source = path.read_text(encoding="utf-8")
        self.assertLess(path.stat().st_size, 16_000)
        self.assertIn("window.lucide", source)
        self.assertIn("createIcons", source)
        included = set(re.findall(r'"([a-z0-9-]+)":"<', source))
        used: set[str] = set()
        for page in public_pages():
            used.update(re.findall(r'data-lucide=["\']([a-z0-9-]+)', page.read_text(encoding="utf-8")))
        self.assertEqual(used - included, set())
        self.assertTrue({"arrow-up", "arrow-down"}.issubset(included))
        self.assertTrue((ROOT / "assets/js/LICENSE-lucide.txt").exists())

    def test_analytics_is_queued_then_loaded_after_critical_render(self) -> None:
        source = (ROOT / "assets/js/analytics-loader.js").read_text(encoding="utf-8")
        self.assertIn("window.dataLayer", source)
        self.assertIn("requestIdleCallback", source)
        self.assertIn("pointerdown", source)
        self.assertIn("googletagmanager.com/gtag/js", source)

    def test_homepage_live_record_waits_until_load_and_idle(self) -> None:
        source = (ROOT / "assets/js/live-record.js").read_text(encoding="utf-8")
        self.assertIn("window.addEventListener('load', scheduleHydration", source)
        self.assertIn("requestIdleCallback(startHydration", source)
        self.assertNotIn("\n  hydrateForwardRoi().finally(hydrateRecord);\n", source)

    def test_shared_fonts_do_not_swap_after_first_paint(self) -> None:
        source = (ROOT / "assets/css/site-system.css").read_text(encoding="utf-8")
        self.assertEqual(source.count("font-display: optional"), 4)
        self.assertNotIn("font-display: swap", source)


if __name__ == "__main__":
    unittest.main()
