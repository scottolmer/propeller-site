# Site maintenance scripts

These keep the SEO-critical state of the site fresh. The daily content
pipeline should run them in this order after it regenerates pages:

```bash
python3 scripts/update_picks_freshness.py     # date-stamp the /picks/ "today" pages
python3 scripts/apply_analyzer_indexing.py    # re-select top analyzer players to index
python3 scripts/inject_popular_players.py     # refresh player link sections
python3 scripts/apply_site_shell.py --include-home
python3 scripts/normalize_entity_metadata.py  # keep one formal entity name
python3 scripts/normalize_analyzer_archive_language.py
python3 scripts/normalize_access_language.py
python3 scripts/set_archive_indexing.py       # noindex legacy performance reports
python3 scripts/sync_faq_schema.py            # visible FAQ copy is canonical
python3 scripts/refresh_performance_snapshot.py
python3 scripts/generate_sitemap.py           # content-aware lastmod values
```

All scripts are idempotent and safe to run repeatedly.

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
- **apply_site_shell.py** — applies the shared light visual system, favicon,
  navigation, footer, Help link, and Editorial Policy link to generated pages.
- **normalize_entity_metadata.py** — normalizes formal Organization, WebSite,
  publisher, author, application, and Open Graph names to `Propeller Picks`.
- **normalize_analyzer_archive_language.py** — labels player-page rates as
  historical outcome summaries over graded analysis rows and adds the same
  repeat/retrospective-data limitation used by the canonical Results page.
- **normalize_coverage_claims.py** — limits coverage wording to listed or
  currently available props and keeps confidence language distinct from a
  calibrated win-probability claim.
- **normalize_access_language.py** — removes stale hard-coded free/premium
  limits from generated pages and defers current availability to signup.
- **set_archive_indexing.py** — keeps legacy monthly performance reports and
  design mockups `noindex` until the prospective publication ledger has enough
  settled data for defensible reporting.
- **sync_faq_schema.py** and **check_schema_parity.py** — copy visible FAQ copy
  into FAQPage JSON-LD and fail when structured answers drift from the page.
- **refresh_performance_snapshot.py** — reconciles raw historical rows with the
  collapsed public ledger, writes a dated JSON snapshot, and renders static HTML
  fallbacks for the homepage, Results, and Track Record pages.
- **generate_sitemap.py** — includes every indexable self-canonical page and
  preserves `lastmod` when the page-specific semantic fingerprint is unchanged.
  Shared shell changes do not falsely refresh the entire site. Use `--check`
  in CI; use `--reseed` only when intentionally rebuilding the manifest against
  `HEAD`. Never hand-edit `sitemap.xml` or the fingerprint manifest.

Verification:

```bash
python3 scripts/check_site_consistency.py
python3 scripts/apply_site_shell.py --check --include-home
python3 scripts/normalize_entity_metadata.py --check
python3 scripts/normalize_analyzer_archive_language.py --check
python3 scripts/normalize_coverage_claims.py --check
python3 scripts/normalize_access_language.py --check
python3 scripts/set_archive_indexing.py --check
python3 scripts/sync_faq_schema.py --check
python3 scripts/check_schema_parity.py
python3 scripts/generate_sitemap.py --check
```
