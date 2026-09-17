"""Protect content maintenance from renderer/optimizer and access-copy drift."""
import unittest
from pathlib import Path
from scripts.apply_site_shell import migrate_html, ROOT
from scripts.optimize_lighthouse_delivery import optimize, CRITICAL_HERO
from scripts.generate_help_pages import render_page, PAGES
import sys
sys.path.insert(0, str(ROOT / "scripts"))
from scripts.generate_comparison_pages import render as render_comparison
import json

class ContentMaintenanceCompositionTests(unittest.TestCase):
    def test_shell_optimizer_repeated_composition_is_stable(self):
        path = ROOT / 'guides/player-prop-research-log/index.html'
        source = '<html><head></head><body><nav></nav><main><section class="hero"><h1 class="fade-in">Question</h1></section></main><footer></footer></body></html>'
        rendered = optimize(migrate_html(migrate_html(source, path, False), path, False))
        again = optimize(migrate_html(rendered, path, False))
        self.assertEqual(rendered, again)
        self.assertEqual(rendered, migrate_html(rendered, path, False))
        self.assertEqual(rendered.count(CRITICAL_HERO), 1)
        self.assertLess(rendered.index(CRITICAL_HERO), rendered.index('analytics-loader.js'))

    def test_dark_guide_keeps_one_dark_theme_after_shell(self):
        path = ROOT / 'guides/player-prop-research-log/index.html'
        source = '<html><head><meta name="theme-color" content="#031a2c"></head><body class="pp-research-log"><nav></nav><main>Question</main><footer></footer></body></html>'
        rendered = migrate_html(source, path, False)
        self.assertEqual(rendered.count('name="theme-color"'), 1)
        self.assertIn('name="theme-color" content="#031a2c"', rendered)

    def test_pricing_keeps_its_custom_dark_style_without_legacy_compat(self):
        path = ROOT / 'pricing/index.html'
        rendered = migrate_html(path.read_text(), path, False)
        self.assertNotIn('/assets/css/site-compat.css', rendered)
        self.assertIn('name="theme-color" content="#031a2c"', rendered)

    def test_real_help_and_comparison_composition_is_stable(self):
        payload = json.loads((ROOT / 'data/comparison-pages.json').read_text())
        cases = [(ROOT / 'help' / page['slug'] / 'index.html', render_page(page)) for page in PAGES]
        cases += [(ROOT / 'compare' / page['slug'] / 'index.html', render_comparison(page, str(page.get('checked_date', payload['checked_date'])))) for page in payload['pages']]
        for path, source in cases:
            rendered = optimize(migrate_html(source, path, False))
            self.assertEqual(rendered, optimize(migrate_html(rendered, path, False)), str(path))

    def test_help_generation_does_not_reintroduce_unqualified_free_access(self):
        for page in PAGES:
            self.assertNotIn('>Get Free Access</a>', render_page(page))

if __name__ == '__main__': unittest.main()
