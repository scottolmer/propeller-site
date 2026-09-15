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
    def test_every_production_page_loads_one_shared_loader_and_no_legacy_config(self) -> None:
        pages = apply_site_shell.production_files(include_home=True)
        self.assertGreater(len(pages), 3_000)
        for path in pages:
            source = path.read_text(encoding="utf-8")
            self.assertEqual(source.count("/assets/js/analytics-loader.js"), 1, path)
            self.assertNotRegex(source, apply_site_shell.LEGACY_ANALYTICS_CONFIG_RE, path)

    def test_migration_replaces_duplicate_loader_tags_and_legacy_config(self) -> None:
        source = """<head>
<script src=\"/assets/js/analytics-loader.js?v=old\"></script>
<script>gtag('config', 'G-NLXM4C2G7D');</script>
<script src=\"/assets/js/analytics-loader.js?v=duplicate\"></script>
</head>"""
        migrated = apply_site_shell.ensure_analytics_loader(
            apply_site_shell.remove_legacy_analytics_config(source)
        )
        self.assertEqual(migrated.count("/assets/js/analytics-loader.js"), 1)
        self.assertNotIn("gtag('config', 'G-NLXM4C2G7D');", migrated)


if __name__ == "__main__":
    unittest.main()
