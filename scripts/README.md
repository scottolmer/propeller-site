# Site maintenance scripts

These keep the SEO-critical state of the site fresh. The daily content
pipeline should run them in this order after it regenerates pages:

```bash
python3 scripts/update_picks_freshness.py     # date-stamp the /picks/ "today" pages
python3 scripts/apply_analyzer_indexing.py    # re-select top analyzer players to index
python3 scripts/inject_popular_players.py     # refresh player link sections
python3 scripts/generate_sitemap.py           # rebuild sitemap.xml with real lastmod
```

All four are idempotent — safe to run repeatedly.

- **update_picks_freshness.py** — stamps today's date into title/H1/og/JSON-LD
  `dateModified` and the hero date label of every `/picks/*` page. The pages
  are indexed for "… today" queries; Google demotes them when they look stale.
- **apply_analyzer_indexing.py** — flips `noindex` → `index` on the top 50
  analyzer player pages per sport (minimum 100 graded picks), reverts pages
  that drop out, and writes the list to `scripts/analyzer_indexed.txt`.
  **Must run after the analyzer generator**, which emits `noindex` on every page.
- **inject_popular_players.py** — maintains the "Popular Player Analysis"
  link blocks on `/analyzer/` and the sport picks pages (crawl paths to the
  indexed player pages). Marker-delimited; replaces its own block on re-run.
- **generate_sitemap.py** — walks the site, includes every page that is not
  `noindex` and is self-canonical, sets `lastmod` from git history (or today
  for uncommitted changes). Never hand-edit sitemap.xml.
