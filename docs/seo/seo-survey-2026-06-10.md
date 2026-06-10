# Propeller Picks — Complete SEO Survey

Date: 2026-06-10
Data: Google Search Console, last 28 days (2026-05-12 → 2026-06-08) + full site audit

## 1. Where the site stands

- **96 clicks / 15,766 impressions / 0.61% CTR / avg position 10.9** over 28 days.
- Impressions jumped ~5x in late May (≈250/day → 800–1,850/day), driven almost entirely by `/guides/prizepicks-strategy/` starting to rank top-10 for the "PrizePicks power play rules/picks" query cluster.
- **Mobile CTR 1.29% vs desktop 0.16%.** Desktop impressions are heavily polluted by AI-assistant queries (full prompts appear in the query report: "analyze these player prop betting lines…", "=== your strategy ===…"). A large share of impressions will never click — Propeller is being *read by AI tools*, which makes winning AI citations a real channel, but raw CTR understates human performance.
- US = 13.5K of 15.8K impressions. International is noise; ignore.

## 2. What is working (double down)

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| /tools/underdog-payout-calculator/ | 31 | 1,547 | 7.5 |
| /tools/prizepicks-payout-calculator/ | 26 | 3,853 | 7.1 |
| / (homepage, mostly brand) | 13 | 167 | 23.1 |
| /guides/nba-prop-betting/ | 6 | 1,821 | 14.5 |
| /picks/underdog/ | 6 | 554 | 15.1 |
| /tools/pick6-payout-calculator/ | 6 | 361 | 10.3 |

**The three payout calculators produce 63 of 96 clicks (66%).** "underdog flex payout calculator" converts at 16% CTR at position 3.6. Utility pages with a clear promise win clicks; content pages get impressions but no clicks.

## 3. The biggest problems, in priority order

### P1 — Zero-click content at scale
`/guides/prizepicks-strategy/` : **5,409 impressions, 0 clicks, position 9.** Also
`/guides/underdog-strategy/` (444 imp, 0 clicks, pos 8.5) and `/compare/pick6-vs-prizepicks/` (489 imp, 0 clicks, pos 10.4).
Causes: (a) AI/zero-click queries; (b) the snippet doesn't promise anything the SERP answer box doesn't already give; (c) position 8–11 is page-one-bottom. Fix = answer-first restructure (Mockup B), question-form H1s, tables Google can lift, and a calculator hook in the meta description ("+ free payout calculator") to give humans a reason to click.

### P2 — "Today" pages aren't fresh
Every `/picks/*` page says "Updated Daily" but **hasn't been touched since June 1** (dateModified stuck at 2026-05-29). The daily pipeline updates `/blog/daily/` (which is `noindex`!) and `/analyzer/`, but not the indexed money pages. Queries like "underdog picks today" (pos 35.6), "best underdog picks today" (42.9), "nhl props" (46.8), "nba player props" (44–57) demand freshness. The freshest content on the site is hidden from Google; the stale pages are what Google ranks.
**Fix: point the daily pipeline at `/picks/*` — date in title/H1, today's top-prop rows, yesterday's graded results, real dateModified.** (Mockup A.)

### P3 — Internal-link starvation from the redesigned pages
The redesigned homepage links to **only 5 internal pages** (picks, results, track-record, how-it-works, tools). No guides, no calculators, no analyzer, no sport/platform pages. Same for /results/, /track-record/, /how-it-works/. The site's highest-authority page passes almost nothing to the pages that earn the clicks. Legacy pages have a full nav; redesigned pages dropped it.
**Fix: one global nav + sitemap footer on every page** (Mockup C).

### P4 — Keyword cannibalization triplets
Three indexed pages target each platform: `/prizepicks/` + `/picks/prizepicks/` + `/guides/prizepicks-strategy/` (same for pick6/underdog), and `/nba/` + `/picks/nba/` + `/guides/nba-prop-betting/` for each sport. GSC shows Google splitting them (e.g. /nba/ at pos 74.5 while /picks/nba/ sits at 30). GitHub Pages can't 301, so:
- Keep the intent split: `/picks/x/` = today's picks; `/guides/x-strategy/` = evergreen strategy.
- Root `/prizepicks/`, `/pick6/`, `/underdog/`, and root sport pages: set `rel=canonical` to the corresponding guide/picks page (or meta-refresh + canonical), remove from sitemap, and stop linking to them internally.

### P5 — Indexation misallocation
- `/blog/daily/` (90 pages of exactly the "picks today" content searchers want) is `noindex`. Meanwhile 2,637 analyzer player pages are `noindex` yet still earning impressions (breece-hall: 22 imp @ pos 9.1; player-name queries like "who provides projections for breece hall" appear in GSC). Player pages are a long-tail asset being thrown away.
- **Fix:** keep daily blog noindex (thin/expiring) but feed its content into `/picks/*`. Selectively index the top ~50–150 players per sport (stars with search volume), add them to the sitemap, and link them from picks pages.
- Stray bug: `/blog/daily/2026-04-18.html` is missing `noindex`.

### P6 — Sitemap and metadata hygiene
- Sitemap has 44 URLs; 18 carry `lastmod 2026-04-12`; April/May monthly result pages (indexable) are missing; lastmod doesn't update when pages change. Generate it daily in the pipeline.
- Claim inconsistency: `/guides/` meta says "59.8% verified accuracy"; homepage says 66.5%; soccer monthly reports say 84%+. Pick one canonical, defensible framing (live record number) and propagate.
- Homepage title "Propeller Picks — Prop Research on Desktop and Mobile" wastes the brand query; brand-position is 23 — add Organization schema with `sameAs` (Twitter/app), and consider "Propeller Picks: AI Player Prop Research | 1.4M+ Props Graded".

### P7 — Content gaps with demonstrated demand (queries already in GSC)
- "underdog payout chart" / "prizepicks payout chart" / "pick 6 payout chart" — charts exist on calculator pages; add anchor sections + chart-specific titles/headings (cheap wins at existing positions 7–19).
- "prop analyzer free / prop bet analyzer / prizepicks optimizer / lineup optimizer" cluster (pos 30–60, dozens of queries): `/analyzer/` needs to be a real tool page, retitled "Free Prop Bet Analyzer".
- Soccer (pos 59–94) and NHL (37–47): far off; treat as secondary unless the picks-freshness fix lifts them.
- "prizepicks cheat sheet today" (pos 21–33): `/picks/prizepicks/` already title-targets this; freshness fix should move it.

## 4. Redesign verdict

**No full visual redesign.** The visual system is modern, consistent, and credible. What's needed is an *SEO-architecture* redesign of three surfaces (mockups in `docs/seo/mockups/`):

- **A. `picks-today-template.html`** — daily picks pages: dated H1, updated-today badge, today's top props table, yesterday's graded proof module, link hub, global footer. Regenerated daily by the existing pipeline.
- **B. `guide-answer-first-template.html`** — guides: question H1, 40-word direct-answer box, quick-facts + payout tables above the fold (snippet/AI-citation bait), calculator CTA, existing depth below.
- **C. `homepage-hub-footer.html`** — homepage bands (Free Tools first — they're the proven winners — then Today's Picks, Guides) + the global sitemap footer for every page on the site.

## 5. Recommended execution order

1. Global footer + nav unification on all indexed pages (P3) — biggest authority fix, pure addition, no risk.
2. Daily pipeline → `/picks/*` freshness (P2) + sitemap auto-generation (P6).
3. Answer-first restructure of the four guides + CTR-bait meta descriptions (P1).
4. Canonical cleanup of root sport/platform duplicates (P4).
5. Calculator page "chart" anchors + analyzer retitle (P7 quick wins).
6. Selective analyzer player indexing, top players only, monitored (P5).
7. Claims consistency + Organization schema (P6).

Measure: re-export GSC in 28 days; targets — CTR ≥1.5% overall, "picks today" cluster into top 15, calculators holding top 5, indexed-page count stable (no analyzer index bloat).
