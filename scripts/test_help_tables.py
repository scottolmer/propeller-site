"""Behavioral checks for optional help tables and freshness content."""
import copy
import unittest
import generate_help_pages as help_pages


class HelpTableTests(unittest.TestCase):
    def test_table_text_is_escaped_and_headers_are_semantic(self):
        html = help_pages.render_content_section({
            'title': '<script>bad</script>', 'paragraphs': ['<b>plain</b>'],
            'table': {'caption': 'A & B', 'headers': ['Kind', 'Value'],
                      'rows': [['<img src=x>', '"quoted" & safe']]}})
        self.assertNotIn('<script>', html)
        self.assertNotIn('<img', html)
        self.assertIn('&lt;b&gt;plain&lt;/b&gt;', html)
        self.assertIn('<caption>A &amp; B</caption>', html)
        self.assertIn('scope="col"', html)
        self.assertIn('scope="row"', html)
        self.assertIn('tabindex="0"', html)

    def test_malformed_table_fails_instead_of_mislabeling_cells(self):
        with self.assertRaises(ValueError):
            help_pages.render_content_section({'title': 'T', 'paragraphs': [],
                'table': {'caption': 'C', 'headers': ['A','B'], 'rows': [['only A']]}})

    def test_freshness_scope_and_default_page_isolation(self):
        page = next(p for p in help_pages.PAGES if p['slug'] == 'how-often-are-propeller-picks-updated')
        html = help_pages.render_page(page)
        self.assertEqual(html.count('<table '), 2)
        self.assertIn('marketObservedAt: null', html)
        self.assertIn('analysisAt: null', html)
        self.assertIn('15:17:05 UTC', html)
        self.assertIn('Last updated: 2026-09-12', html)
        self.assertIn('href="/picks/" rel="noopener">Check current public research', html)
        self.assertEqual(html.count('class="answer-box"'), 1)
        self.assertNotIn('class="summary"', html)
        for other in help_pages.PAGES:
            if other['slug'] == 'what-sports-does-propeller-support':
                coverage = help_pages.render_page(other)
                self.assertEqual(coverage.count('<table '), 1)
                self.assertEqual(coverage.count('scope="row"'), 5)
                self.assertIn('Signed-in documented scope', coverage)
                self.assertIn('PGA is no longer supported', coverage)
                self.assertIn('pp-coverage-page', coverage)
                self.assertIn('/assets/css/coverage-article.css', coverage)
                self.assertIn('September 10, 2026', coverage)
                self.assertIn('Last updated: 2026-09-14', coverage)
                self.assertEqual(coverage.count('class="answer-box"'), 1)
                self.assertNotIn('class="summary"', coverage)
                continue
            if other['slug'] == 'how-does-propeller-grade-picks':
                grading = help_pages.render_page(other)
                self.assertEqual(grading.count('<table '), 2)
                self.assertEqual(grading.count('scope="row"'), 9)
                self.assertIn('Fictional grading examples: line 5 rebounds.', grading)
                self.assertIn('Last updated: 2026-09-23', grading)
                self.assertIn('pp-grading-page', grading)
                self.assertIn('pp-replay-room', grading)
                self.assertEqual(grading.count('class="answer-box"'), 1)
                self.assertNotIn('class="summary"', grading)
                self.assertIn('href="/results/" rel="noopener">Inspect the archive', grading)
                self.assertIn('width="1200" height="630"', grading)
                self.assertIn('Read the record with its definitions', grading)
                continue
            if other is page:
                continue
            output = help_pages.render_page(other)
            self.assertNotIn('.table-scroll', output)
            self.assertIn('class="summary"', output)
            self.assertIn('>Get started</a>', output)

    def test_optional_media_and_cta_escape_text_and_preserve_defaults(self):
        page = copy.deepcopy(help_pages.PAGES[0])
        default = help_pages.render_page(page)
        self.assertIn('content="https://propellerpicks.com/images/og-image.png"', default)
        self.assertIn('content="3000"', default)
        self.assertIn("Research today's props", default)
        self.assertNotIn('help-hero-media', default)
        page['hero_image'] = {'src': '/test.png?x="bad"', 'alt': '<script>bad</script>',
                              'width': 1200, 'height': 630, 'caption': '<b>Caption</b>'}
        page['cta'] = {'heading': '<script>Title</script>', 'body': '<b>Body</b>',
                       'href': '/results/', 'label': 'Inspect'}
        output = help_pages.render_page(page)
        self.assertIn('&lt;script&gt;bad&lt;/script&gt;', output)
        self.assertIn('&lt;b&gt;Caption&lt;/b&gt;', output)
        self.assertIn('&lt;script&gt;Title&lt;/script&gt;', output)
        self.assertIn('&lt;b&gt;Body&lt;/b&gt;', output)
        self.assertIn('/test.png?x=&quot;bad&quot;', output)
        self.assertIn('content="1200"', output)


if __name__ == '__main__':
    unittest.main()
