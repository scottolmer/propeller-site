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
            if other is page:
                continue
            output = help_pages.render_page(other)
            self.assertNotIn('.table-scroll', output)
            self.assertIn('class="summary"', output)
            self.assertIn('>Get Free Access</a>', output)


if __name__ == '__main__':
    unittest.main()
