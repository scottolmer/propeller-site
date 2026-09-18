"""Protect content maintenance from renderer/optimizer and access-copy drift."""
import unittest
from pathlib import Path
from scripts.apply_site_shell import migrate_html, ROOT, NAVIGATION_PAGES
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

    def test_comparison_guide_keeps_dark_theme_after_shell(self):
        path = ROOT / 'guides/compare-player-prop-lines/index.html'
        source = '<html><head></head><body class="pp-compare-lines"><nav></nav><main>Question</main><footer></footer></body></html>'
        rendered = migrate_html(source, path, False)
        self.assertEqual(rendered.count('name="theme-color"'), 1)
        self.assertIn('name="theme-color" content="#031a2c"', rendered)
        stable = optimize(migrate_html(rendered, path, False))
        self.assertEqual(stable, optimize(migrate_html(stable, path, False)))

    def test_pricing_keeps_its_custom_dark_style_without_legacy_compat(self):
        path = ROOT / 'pricing/index.html'
        rendered = migrate_html(path.read_text(), path, False)
        self.assertNotIn('/assets/css/site-compat.css', rendered)
        self.assertIn('name="theme-color" content="#031a2c"', rendered)

    def test_navigation_regeneration_keeps_current_style_and_content(self):
        # Generators may emit legacy head links and no design body class.
        # The route must restore the current theme without rewriting behavior.
        content = '<main><h1>Research</h1><button id="filter">Filter</button><p>Verified facts.</p></main>'
        source = ('<html><head>\n<link rel="stylesheet" href="/assets/css/site-white-overrides.css?v=old">\n'
                  '<style>.page-layout{display:grid}</style>\n</head>\n<body>\n<nav></nav>\n'
                  + content + '\n<footer></footer>\n<script src="/page-controls.js"></script>\n</body></html>')
        for relative in NAVIGATION_PAGES:
            with self.subTest(route=relative):
                path = ROOT / relative
                rendered = optimize(migrate_html(source, path, False))
                self.assertIn(content, rendered)
                self.assertIn('/page-controls.js', rendered)
                self.assertIn('.page-layout{display:grid}', rendered)
                self.assertIn('pp-nav-page', rendered)
                self.assertIn('name="theme-color" content="#031a2c"', rendered)
                self.assertNotIn('site-white-overrides.css', rendered)
                self.assertNotIn('site-compat.css', rendered)
                self.assertEqual(rendered.count('/assets/css/navigation-pages.css'), 1)
                self.assertLess(rendered.index('site-system.css'), rendered.index('navigation-pages.css'))
                self.assertEqual(rendered, optimize(migrate_html(rendered, path, False)))
        # The migration is confined to top-level navigation destinations.
        other = migrate_html(source, ROOT / 'guides/example/index.html', False)
        self.assertNotIn('pp-nav-page', other)
        self.assertIn('site-compat.css', other)

    def test_real_help_and_comparison_composition_is_stable(self):
        payload = json.loads((ROOT / 'data/comparison-pages.json').read_text())
        cases = [(ROOT / 'help' / page['slug'] / 'index.html', render_page(page)) for page in PAGES]
        cases += [(ROOT / 'compare' / page['slug'] / 'index.html', render_comparison(page, str(page.get('checked_date', payload['checked_date'])))) for page in payload['pages']]
        for path, source in cases:
            rendered = optimize(migrate_html(source, path, False))
            self.assertEqual(rendered, optimize(migrate_html(rendered, path, False)), str(path))

    def test_refreshed_archive_indexing_survives_later_maintenance(self):
        import tempfile
        from unittest.mock import patch
        from scripts import apply_analyzer_indexing as indexing
        from scripts.refresh_player_cards import current_block, replace_block
        from scripts.normalize_entity_metadata import normalize as entity
        from scripts.normalize_platform_intent_links import normalize as platform
        from scripts.normalize_analyzer_archive_language import normalize as archive
        from scripts.normalize_coverage_claims import normalize as coverage
        from scripts.normalize_access_language import normalize as access
        from scripts.sync_faq_schema import sync
        from scripts.optimize_lighthouse_delivery import GTM
        # Keep these inputs independent of the daily player-page generator.
        # Cover all three supported refresh insertion points with dated cards.
        cards = {
            'legacy-card': '<!-- TODAY_PROPS_START -->old slate<!-- TODAY_PROPS_END -->',
            'current-card': '<!-- CURRENT_PLAYER_CARD_START -->old slate<!-- CURRENT_PLAYER_CARD_END -->',
            'stats-only': '<div class="stats-grid"><div>150 graded picks</div>\n</div>',
        }
        slugs = tuple(cards)
        with tempfile.TemporaryDirectory() as directory:
            temp = Path(directory)
            (temp / 'scripts').mkdir()
            for slug in slugs:
                source = f'''<!doctype html>
<html><head>
<title>Player Historical Prop Analysis</title>
<meta name="description" content="Historical outcome rate across 150 graded analysis rows.">
{indexing.NOINDEX}
{GTM}
</head>
<body>
<nav></nav>
<main>
<h1>Player historical analysis</h1>
{cards[slug]}
</main>
<footer></footer>
</body>
</html>'''
                refreshed = replace_block(source, current_block('mlb', '2026-09-17', '2026-09-17T13:00:00Z',
                    [{'stat_type': 'hits', 'line': 0.5, 'final_direction': 'OVER', 'confidence': 60}]))
                target = temp / 'analyzer/mlb' / slug / 'index.html'
                target.parent.mkdir(parents=True)
                target.write_text(refreshed)
            # Run the real index selection, not a hand-edited robots marker.
            with patch.object(indexing, 'ROOT', temp), patch('sys.argv', ['indexing', '--date', '2026-09-17']):
                indexing.main()
            for slug in slugs:
                path = ROOT / 'analyzer/mlb' / slug / 'index.html'
                source = (temp / 'analyzer/mlb' / slug / 'index.html').read_text()
                self.assertIn(indexing.INDEX, source, slug)
                source = migrate_html(source, path, False)
                for normalizer in (entity, platform, archive, coverage):
                    source = normalizer(source)
                source = access(source)
                source, _ = sync(source, path)
                source = optimize(source)
                self.assertIn(indexing.INDEX, source, slug)
                self.assertIn('data-current-props="true"', source, slug)
                self.assertNotIn('googletagmanager.com/gtag/js', source, slug)
                self.assertEqual(source.count('/assets/js/analytics-loader.js'), 1, slug)
                self.assertIn('/assets/js/analytics-loader.js?v=20260915', source, slug)
                self.assertEqual(source, migrate_html(source, path, False), slug)
                self.assertEqual(source, optimize(source), slug)
                # Also cover an already-normalized input where removal of the
                # adjacent loader consumes whitespace before the managed head.
                reintroduced = source.replace('</head>', GTM + '\n</head>')
                repeated = optimize(migrate_html(reintroduced, path, False))
                self.assertEqual(repeated.count('/assets/js/analytics-loader.js'), 1, slug)
                self.assertEqual(repeated, migrate_html(repeated, path, False), slug)
                self.assertEqual(repeated, optimize(repeated), slug)

    def test_help_generation_does_not_reintroduce_unqualified_free_access(self):
        for page in PAGES:
            self.assertNotIn('>Get Free Access</a>', render_page(page))

if __name__ == '__main__': unittest.main()
