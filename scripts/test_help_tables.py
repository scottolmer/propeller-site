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
        self.assertIn('Last updated: 2026-10-13', html)
        self.assertIn('href="/guides/player-prop-research-log/" rel="noopener">Name the missing clock', html)
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
            if other['slug'] == 'how-do-i-use-propeller-for-nba-pra-props':
                pra = help_pages.render_page(other)
                self.assertEqual(pra.count('<table '), 1)
                self.assertEqual(pra.count('scope="row"'), 3)
                self.assertIn('id="pra-components-example"', pra)
                self.assertIn('pp-pra-page', pra)
                self.assertNotIn('class="summary"', pra)
                self.assertIn('>Inspect an available player line</a>', pra)
                continue
            if other['slug'] == 'how-do-confidence-scores-work':
                confidence = help_pages.render_page(other)
                self.assertEqual(confidence.count('<table '), 1)
                self.assertEqual(confidence.count('scope="row"'), 3)
                self.assertIn('Fictional reading exercise', confidence)
                self.assertIn('pp-confidence-page', confidence)
                self.assertIn('FtkX3AuujJk', confidence)
                self.assertNotIn('class="summary"', confidence)
                self.assertIn('September 10, 2026', confidence)
                continue
            if other['slug'] == 'is-propeller-a-sportsbook':
                boundaries = help_pages.render_page(other)
                self.assertEqual(boundaries.count('<table '), 1)
                self.assertEqual(boundaries.count('scope="row"'), 3)
                self.assertIn('Public research actions and their limits', boundaries)
                self.assertIn('Last updated: 2026-10-08', boundaries)
                self.assertIn('pp-replay-room', boundaries)
                self.assertIn('>Explore the public research tools</a>', boundaries)
                continue
            if other['slug'] == 'does-propeller-show-no-vig-odds':
                no_vig = help_pages.render_page(other)
                self.assertEqual(no_vig.count('<table '), 2)
                self.assertEqual(no_vig.count('scope="row"'), 6)
                self.assertIn('52.17%', no_vig)
                self.assertIn('47.83%', no_vig)
                self.assertIn('Cannot normalize this two-sided example', no_vig)
                self.assertIn('Rows stack on small screens.', no_vig)
                self.assertIn('Last updated: 2026-10-11', no_vig)
                self.assertNotIn('datePublished', no_vig)
                self.assertIn('pp-no-vig-page', no_vig)
                continue
            if other["slug"] == "how-do-propeller-fantasy-projections-work":
                continue
            if other is page:
                continue
            output = help_pages.render_page(other)
            self.assertNotIn('.table-scroll', output)
            self.assertIn('class="summary"', output)
            self.assertIn('>Get started</a>', output)

    def test_freshness_visual_survives_generation_and_normalization(self):
        from normalize_coverage_claims import normalize
        page = next(p for p in help_pages.PAGES if p['slug'] == 'how-often-are-propeller-picks-updated')
        path = help_pages.ROOT / 'help' / page['slug'] / 'index.html'
        generated = help_pages.migrate_html(help_pages.render_page(page), path, False)
        normalized = normalize(generated)
        self.assertEqual(normalized, generated)
        self.assertEqual(normalize(normalized), normalized)
        self.assertEqual(normalized.count('<figure class="help-hero-media">'), 1)
        self.assertEqual(normalized.count('<table '), 2)
        self.assertEqual(normalized.count('scope="row"'), 10)
        self.assertIn('id="timestamp-key"', normalized)
        self.assertIn('Rows stack on small screens.', normalized)
        self.assertIn('#clock-audit td:nth-child(2):before { content:"Observed value"', normalized)
        self.assertIn('#change-checklist td:nth-child(3):before { content:"When to wait"', normalized)
        self.assertNotIn('datePublished', normalized)
        for other in help_pages.PAGES:
            if other is not page:
                self.assertNotIn('pp-freshness-page', help_pages.render_page(other))

    def test_fantasy_sort_preserves_data_mobile_labels_schema_and_normalization(self):
        from normalize_coverage_claims import normalize
        page = next(p for p in help_pages.PAGES if p['slug'] == 'how-do-propeller-fantasy-projections-work')
        sections = {s.get('id'): s for s in page['content_sections']}
        self.assertEqual(sections['historical-sort']['table']['rows'], [
            ['Pete Crow-Armstrong','0.7','11.9','36.4'], ['Jake McCarthy','7.8','10.4','20.3']])
        rows = sections['three-sort-example']['table']['rows']
        self.assertEqual(rows, [['Example Hitter A','4.0','10.0','16.0'],
                                ['Example Hitter B','6.0','9.0','12.0'],
                                ['Example Hitter C','3.0','8.0','20.0']])
        for index, expected in [(2, ['A','B','C']), (1, ['B','A','C']), (3, ['C','A','B'])]:
            self.assertEqual([r[0][-1] for r in sorted(rows, key=lambda r: float(r[index]), reverse=True)], expected)
        path = help_pages.ROOT / 'help' / page['slug'] / 'index.html'
        output = help_pages.migrate_html(help_pages.render_page(page), path, False)
        self.assertEqual(normalize(output), output)
        self.assertEqual(normalize(normalize(output)), output)
        self.assertEqual(output.count('<table '), 2)
        self.assertEqual(output.count('scope="row"'), 5)
        self.assertEqual(output.count('<figure class="help-hero-media">'), 1)
        self.assertIn('source marked stale · two rows only', output)
        self.assertIn('not model output or current players', output)
        self.assertIn('width="1600" height="1000"', output)
        self.assertIn('/images/content/PP-20260927/cover.png', output)
        for index, label in [(2,'Floor'), (3,'Point projection'), (4,'Ceiling')]:
            self.assertIn('td:nth-child('+str(index)+'):before { content:"'+label+'"', output)
        self.assertNotIn('datePublished', output)
        self.assertNotIn('reviewedBy', output)
        webpage, _, faq = help_pages.page_schema(page)
        self.assertEqual(webpage['author']['name'], 'Scott Olmer')
        self.assertEqual(webpage['dateModified'], '2026-10-14')
        for (question, answer), entity in zip(page['faqs'], faq['mainEntity']):
            self.assertEqual(entity['name'], question)
            self.assertEqual(entity['acceptedAnswer']['text'], answer)
            self.assertIn('<h3>'+help_pages.esc(question)+'</h3>', output)
            self.assertIn('<p>'+help_pages.esc(answer)+'</p>', output)
        for other in help_pages.PAGES:
            if other is not page:
                self.assertNotIn('pp-fantasy-sort-page', help_pages.render_page(other))

    def test_pra_example_keeps_combined_arithmetic_and_faq_parity(self):
        page = next(p for p in help_pages.PAGES if p['slug'] == 'how-do-i-use-propeller-for-nba-pra-props')
        example = next(s for s in page['content_sections'] if s.get('id') == 'pra-components-example')
        self.assertEqual(example['table']['rows'], [['A','24','5','5','34'], ['B','14','12','8','34'], ['C','25','4','3','32']])
        for label, points, rebounds, assists, total in example['table']['rows']:
            self.assertEqual(sum(map(int, (points, rebounds, assists))), int(total))
        output = help_pages.render_page(page)
        schema = help_pages.page_schema(page)[2]['mainEntity']
        self.assertEqual(len(schema), 4)
        for (question, answer), entity in zip(page['faqs'], schema):
            self.assertEqual(entity['name'], question)
            self.assertEqual(entity['acceptedAnswer']['text'], answer)
            self.assertIn('<h3>' + help_pages.esc(question) + '</h3>', output)
            self.assertIn('<p>' + help_pages.esc(answer) + '</p>', output)
        self.assertIn('33.5 PRA', output)
        self.assertIn('scroll-margin-top:112px', output)
        self.assertNotIn('reviewedBy', output)
        self.assertNotIn('more paths to clear', output)

    def test_optional_section_id_and_after_paragraph_are_escaped(self):
        output = help_pages.render_content_section({'title':'Safe', 'id':'x" onclick="bad',
            'paragraphs':[], 'after_paragraphs':['<script>bad</script>']})
        self.assertIn('id="x&quot; onclick=&quot;bad"', output)
        self.assertNotIn('<script>', output)
        self.assertIn('&lt;script&gt;', output)

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
