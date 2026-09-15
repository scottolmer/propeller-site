#!/usr/bin/env python3
"""Keep legacy GA pages routed through the shared reporting loader."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import apply_site_shell  # noqa: E402


class AnalyticsLoaderCoverageTest(unittest.TestCase):
    def test_legacy_analytics_pages_load_one_shared_loader_first(self) -> None:
        pages = []
        for path in apply_site_shell.production_files(include_home=True):
            source = path.read_text(encoding="utf-8")
            if apply_site_shell.LEGACY_ANALYTICS_ID in source:
                pages.append((path, source))

        self.assertGreater(len(pages), 3_000)
        for path, source in pages:
            self.assertEqual(source.count("/assets/js/analytics-loader.js"), 1, path)
            self.assertLess(
                source.index("/assets/js/analytics-loader.js"),
                source.index(apply_site_shell.LEGACY_ANALYTICS_ID),
                path,
            )

    def test_migration_replaces_duplicate_loader_tags_without_touching_legacy_config(self) -> None:
        source = """<head>
<script src=\"/assets/js/analytics-loader.js?v=old\"></script>
<script>gtag('config', 'G-NLXM4C2G7D');</script>
<script src=\"/assets/js/analytics-loader.js?v=duplicate\"></script>
</head>"""
        migrated = apply_site_shell.ensure_analytics_loader(source)
        self.assertEqual(migrated.count("/assets/js/analytics-loader.js"), 1)
        self.assertIn("gtag('config', 'G-NLXM4C2G7D');", migrated)
        self.assertLess(
            migrated.index("/assets/js/analytics-loader.js"),
            migrated.index("G-NLXM4C2G7D"),
        )


if __name__ == "__main__":
    unittest.main()
