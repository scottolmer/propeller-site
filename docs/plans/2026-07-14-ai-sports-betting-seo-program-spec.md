# AI Sports Betting SEO Program

## Context

Propeller Picks already has a useful free analyzer, daily sport and platform pages, 2,690 generated player pages, a public historical archive, machine-readable discovery files, and a daily SEO maintenance workflow. It does not yet present those parts as a coherent AI sports betting research category, and several high-value assets identified in the July 14 keyword study do not exist.

The affected users are US sports bettors and pick'em users age 21+ who want player-prop research, existing Propeller users looking for current analysis, publishers and researchers evaluating AI betting tools, and search or answer engines trying to retrieve a trustworthy source. The objective is to publish ten connected assets that satisfy those users without implying guaranteed outcomes, sportsbook operation, calibrated probability, profitability, or a clean prospective history that does not yet exist.

This work is timely because current search results for AI sports betting terms are fragmented, while Propeller already has differentiated product and data foundations. Completion means the ten assets are deployed, useful without signup, internally connected, represented in discovery files, tested by automated checks, reviewed by an independent code-review agent, visually tested in a browser, and verified on production. Search ranking changes are a post-launch measurement outcome, not an acceptance criterion.

## Locked Product Decisions

1. Launch the prospective record at day one with an explicitly small sample and accumulate it over time. Never backfill rows and call them prospectively published.
2. Preserve the research-tool positioning: Propeller analyzes signals; the user makes the decision. No direct wagering instruction, unit sizing, guaranteed outcomes, or profitability claims.
3. Keep `Get Free Lifetime Access` as the main conversion while making each search landing page useful before signup.
4. Index at most 50 eligible player cards per sport. Eligibility requires current data, a useful historical base, a self-canonical page, current metadata, and no stale “today” label.
5. Implement in `propedge-site` using existing public APIs. Do not modify or ship the dirty `nfl-betting-system` checkout. A missing event-start field must be disclosed rather than inferred.

## Verified Current State

Verified July 14, 2026.

| Surface | Current behavior | Gap |
| --- | --- | --- |
| Homepage | Targets AI player-prop research and links core tools | Does not establish the broader AI sports betting research category |
| Analyzer hub | Fetches current public picks client-side from `/api/social/picks/{sport}` | Title and content do not own “AI player prop analyzer”; useful state is not server-rendered |
| Picks pages | Nine canonical sport/platform pages exist and are date-stamped daily | Fresh date can change without fresh rows; AI player-prop language and proof links are inconsistent |
| Player inventory | 2,690 generated pages across five sport buckets | All are `noindex`; “today” modules can be stale; indexing parser no longer matches normalized metadata |
| Historical proof | Results, track record, and `data/performance-snapshot.json` exist | Legacy/repeated rows cannot support prospective or ROI claims |
| Prospective record | No site-owned forward publication ledger | Needs an append-only day-one data contract and public explanation |
| Model documentation | Method page and confidence help exist | No machine-readable version record or focused AI model card |
| AI tool benchmark | No page | Needs first-hand rubric, disclosures, sourced facts, and dated results |
| ChatGPT prompt tool | No page or tool | Needs an interactive research prompt builder and limitations guidance |
| Visual/media kit | Product screenshots and brand images exist | No reusable AI research diagram, methodology visual, or publisher-ready data card |
| Trust layer | About, editorial policy, corrections language, and responsible-use footer exist | New research/comparison pages need named authorship, checked dates, disclosures, and change logs |
| Maintenance | Daily GitHub Actions workflow runs normalization and sitemap scripts | No current-card refresh, prospective capture, or program-specific contract gate |

## What's Working Well: Do Not Break

- Keep the existing light editorial visual system, IBM Plex Sans body family, Familjen Grotesk display family, red accent, navigation, and footer.
- Keep calculator pages, canonical sport/platform URL intent, and existing public API contracts.
- Keep historical archive limitations visible and distinguish raw rows from the collapsed ledger.
- Keep confidence as model conviction, not calibrated win probability.
- Keep legacy performance reports and low-quality player pages out of the index.
- Keep the public analyzer available without signup.
- Preserve unrelated changes in `nfl-betting-system`.

## Proposed Change

### Asset 1: Category-leading AI Player Prop Analyzer

Retitle and refine `/analyzer/` around “Free AI Player Prop Analyzer.” Add an answer-first definition, current server-rendered example/fallback generated by maintenance, exact retrieval time, supported sports, current-data empty state, direct methodology/prospective-record links, and explicit confidence limitations. Keep the live client-side fetch and filters.

### Asset 2: AI Sports Betting Category Hub

Create `/ai-sports-betting/` with a working analyzer preview, category comparison table, current sport links, six-signal explainer, evidence module, FAQ, responsible-use copy, `SoftwareApplication` and breadcrumb markup, and a free-access CTA. Target “free AI sports betting tool,” “AI sports betting analysis,” and “AI betting research.”

### Asset 3: Forward Publication Record

Create `/research/prospective-record/`, `data/prospective-picks.json`, and `scripts/update_prospective_record.py`. The script captures daily public-picks previews with a deterministic immutable publication ID, API `generated_at`, capture time, sport, game date, player, stat, line, direction, confidence, and status. It may settle a captured row only by exact identity match against the public results feed. It must never alter the originally captured fields.

The API does not expose event start time or prove outcome timing, so version 1 must label rows “first observed in the public picks preview” and set `before_event_start_verified: false`. It must skip identities already present in the public results feed and must not claim pregame publication, outcome-unknown ordering, or ROI. Empty initial state is valid and useful.

### Asset 4: Model Card and Methodology Version

Create `/guides/how-ai-sports-betting-works/` and `data/methodology-version.json`. Document inputs, sport-specific agents, update cadence, missing-data behavior, confidence semantics, known failure modes, version history, leakage controls at the level publicly verifiable today, and the distinction between accuracy, calibration, closing-line value, and profit.

### Asset 5: Original AI Player-Prop Tool Benchmark

Create `/research/ai-player-prop-benchmark/`. Use a dated, disclosed rubric covering current-data visibility, player-prop breadth, inspectable reasoning, line context, free usefulness, public evidence, pricing transparency, and responsible claims. Include sourced facts for Propeller and named competitors, disclose Propeller ownership, allow competitors to win categories, and avoid unverified scores. Version 1 is an editorial benchmark, not a performance bakeoff.

### Asset 6: Fresh Sport and Platform Pages

Add consistent AI player-prop terminology, precise update/source labels, current-data empty states, and links to the analyzer, model card, forward record, and player cards on all nine `/picks/*` pages. Update dates only alongside a daily API refresh attempt. The workflow must not represent stale rows as current.

### Asset 7: Current, Selectively Indexed Player Cards

Create `scripts/refresh_player_cards.py` to fetch current sport feeds, match players to generated pages, and replace a marker-delimited current-analysis block. Current cards show game date, retrieval time, available stat lines, direction, confidence, and a source/limitations note. Pages without current props receive an honest no-current-market state and must not include “today” data from a prior date.

Repair `scripts/apply_analyzer_indexing.py` so it parses normalized graded-row metadata and indexes only pages that have a current-card marker for the requested slate date, meet the 100-row minimum, and rank in the top 50 eligible pages per sport. The sitemap and popular-player links must use the selected list.

### Asset 8: ChatGPT Sports Betting Research Prompt Builder

Create `/tools/ai-betting-prompt-builder/` as an accessible client-side form. Inputs: sport, market, player/event, line, source/platform, research goal, and optional context. Output: a copyable research prompt that requires timestamped data, injury/lineup checks, relevant samples, market context, counterarguments, missing-data disclosure, and a no-action conclusion when evidence is weak. It must not generate picks, guaranteed outcomes, or bankroll advice.

### Asset 9: Visual, Video, and Embeddable Proof Assets

Create a lightweight methodology diagram, benchmark share card, and forward-record share card using site-native HTML/CSS/SVG so they remain accessible and maintainable. Add descriptive image metadata and Open Graph art for the new category hub. Reuse real product screenshots. Do not fabricate product UI or performance charts.

### Asset 10: Trust and Authorship Layer

Every new category, research, guide, and tool page must show Scott Olmer as publisher/author where appropriate, a checked/updated date, editorial and corrections links, commercial-interest disclosure on comparisons, research-only and 21+ language, and a visible change log. Update the data manifest, `llms.txt`, AEO targets, sitemap, homepage/footer hubs, and relevant internal links.

## Architecture and Dependency Graph

```text
Public picks/results APIs
          |
          +--> daily capture + current-card refresh scripts
          |                 |
          |                 +--> prospective JSON + player HTML
          |                 +--> selective indexing + sitemap
          |
Shared site system ---------+--> category hub / model card / benchmark
                            +--> prompt builder / sport pages / analyzer
                            +--> trust, manifests, AEO, internal links

Data contracts --> customer pages --> automated gates --> browser QA
                                              |
                                              +--> agent review --> ship/deploy
```

The data contracts and freshness gates precede public claims. Shared components and page templates precede browser QA. Shipping occurs only after automated checks and independent review are clean.

## Data Contracts

### `data/prospective-picks.json`

```json
{
  "schema_version": "1.0",
  "generated_at": "ISO-8601",
  "publication_definition": "First observed in the public picks preview; event-start ordering and outcome timing are not verified.",
  "before_event_start_verified": false,
  "records": [
    {
      "publication_id": "sha256 prefix",
      "published_at": "ISO-8601 from API",
      "captured_at": "ISO-8601 workflow time",
      "sport": "mlb",
      "game_date": "YYYY-MM-DD",
      "player_name": "string",
      "stat_type": "string",
      "line": 0.5,
      "direction": "OVER|UNDER",
      "model_score": 33.6,
      "confidence": 66,
      "status": "open|win|loss|push|void",
      "settled_at": null,
      "actual_value": null,
      "result_id": null
    }
  ]
}
```

Captured identity fields are immutable. Settlement fields may transition once from open to a terminal state. Re-runs are idempotent.

### `data/methodology-version.json`

```json
{
  "schema_version": "1.0",
  "current_version": "2026.07",
  "effective_date": "2026-07-14",
  "confidence_definition": "Directional model conviction, not calibrated win probability.",
  "sports": ["mlb", "nba", "nfl", "nhl", "soccer"],
  "versions": [{"version": "2026.07", "date": "2026-07-14", "summary": "Initial public model card."}]
}
```

## Files Reference

| File | Change |
| --- | --- |
| `analyzer/index.html` | Reposition, add static current fallback, evidence links, and limitations |
| `ai-sports-betting/index.html` | New category hub |
| `research/prospective-record/index.html` | New forward-record page |
| `research/ai-player-prop-benchmark/index.html` | New benchmark |
| `guides/how-ai-sports-betting-works/index.html` | New model card |
| `tools/ai-betting-prompt-builder/index.html` | New interactive tool |
| `assets/css/ai-research.css` | Shared customer-facing design system extension |
| `assets/js/ai-prompt-builder.js` | Prompt builder behavior and copy state |
| `assets/js/prospective-record.js` | Progressive enhancement for record table |
| `data/prospective-picks.json` | Append-only forward publication ledger |
| `data/methodology-version.json` | Public method version contract |
| `scripts/update_prospective_record.py` | Capture and settle public preview rows |
| `scripts/refresh_player_cards.py` | Current-card generation and stale-state removal |
| `scripts/apply_analyzer_indexing.py` | Current-data eligibility and fixed row parsing |
| `scripts/check_ai_search_assets.py` | Program-wide contract gate |
| `scripts/update_picks_freshness.py` | Couple date labels to refresh metadata |
| `scripts/generate_sitemap.py` | Automatically includes eligible new pages/data |
| `.github/workflows/seo-maintenance.yml` | Add capture, refresh, and contract checks |
| `picks/*/index.html` | Current-source and AI player-prop modules |
| `index.html`, `tools/index.html`, `guides/index.html` | Hub/internal links |
| `data/index.json`, `llms.txt` | Discovery entries |
| `docs/seo/aeo-target-questions.json` | New AI betting question cluster |
| `docs/seo/ai-sports-betting-keyword-strategy-2026-07-14.md` | Strategy source artifact |

## Acceptance Criteria

1. `/analyzer/` targets “AI player prop analyzer,” remains functional without signup, shows a current or explicitly unavailable state, and links to method and forward record.
2. `/ai-sports-betting/` is indexable, self-canonical, useful without signup, and contains the tool, category, evidence, and responsible-use modules specified above.
3. The forward ledger capture is idempotent, preserves captured fields, labels event-start verification as false, supports an empty initial state, and never presents historical rows as prospective.
4. The model card and methodology JSON define confidence as conviction rather than probability and publish a visible version/change history.
5. The benchmark discloses Propeller ownership, cites checked sources, publishes its rubric, and contains no unsupported performance ranking.
6. All nine picks pages contain accurate source/update language, AI player-prop internal links, and no stale rows labeled as today.
7. Player-page refresh removes stale “today” modules; only current, eligible pages can be indexed; no more than 50 pages per sport enter `scripts/analyzer_indexed.txt`.
8. The prompt builder works with keyboard and pointer input, validates required fields, copies a structured research prompt, and never emits a guaranteed pick or stake recommendation.
9. New visual assets use real product/data content, include accessible text alternatives, and render without horizontal overflow at 390px, 768px, and 1440px viewports.
10. Every new public page includes canonical metadata, unique title/description/H1, shared navigation/footer, authorship or publisher context, checked date, editorial/corrections link, and responsible-use language.
11. `data/index.json`, `llms.txt`, AEO targets, sitemap, and visible internal hubs include the new canonical assets.
12. Existing calculators, results, track record, methodology, analyzer fetch, and signup attribution continue to work.
13. All repository consistency/schema/sitemap checks and the new AI asset contract check pass.
14. Browser QA covers every new page plus analyzer, picks hub, one sport page, one current player card, tools hub, guides hub, homepage, results, and mobile navigation at desktop and mobile sizes with zero critical or high visual/function defects.
15. An independent agent reviews the final diff. All critical/high findings and all accepted medium findings are fixed and reverified.
16. The PR is merged and GitHub Pages production returns HTTP 200 for every new canonical URL, serves the new JSON contracts, and passes a post-deploy smoke test.

## Testing Plan

| Layer | What | Minimum |
| --- | --- | ---: |
| Unit/script | Prospective ID/idempotency/immutability, result matching, stale-card removal, indexing eligibility, prompt output | 15 checks |
| Static integration | Canonical, metadata, shared shell, schema parity, discovery, sitemap, no stale “today” labels | All indexable pages |
| API integration | Public picks and public results success/empty/error handling | 5 sports plus failure fixtures |
| Browser E2E | New pages, analyzer interaction, prompt generation/copy, record filtering, navigation, responsive layout | 12 routes × 2 viewports |
| Production smoke | New routes/data, canonical tags, JS/CSS assets, no console errors | All new canonical assets |

## Failure Modes and Rollback

- API unavailable: preserve the prior ledger, render an unavailable timestamped state, and do not relabel stale data as current.
- Partial API response: validate required fields and skip invalid records with a logged count.
- Duplicate workflow run: deterministic IDs and append-only merge produce no duplicate records.
- Result mismatch: leave the row open rather than guessing.
- Stale player card: replace the current module with an unavailable state and remove index eligibility.
- Broken customer page or required check: block commit/merge.
- Production regression: revert the website PR; GitHub Pages redeploys the prior master commit. Data files are versioned in Git and recoverable.

## Effort Breakdown

| Component | Relative effort |
| --- | ---: |
| Data contracts, capture, current-card refresh, indexing, tests | 30% |
| Category hub, analyzer, model card, and shared design | 25% |
| Benchmark, prompt builder, visuals, and trust layer | 20% |
| Picks/player integration, manifests, AEO, internal links | 10% |
| Automated verification, browser QA, review fixes | 10% |
| Ship, deploy, and production verification | 5% |

## Out of Scope

- Changing model weights, prediction logic, calibration, or sportsbook/pick'em ingestion.
- Claiming rankings, traffic, conversion lift, ROI, profitability, or calibration before post-launch evidence exists.
- Backfilling the forward ledger with historical rows.
- Indexing all 2,690 player pages.
- Building a chatbot, autonomous betting agent, bet placement, bankroll manager, or sportsbook integration.
- Modifying unrelated work in the dirty `nfl-betting-system` checkout.
- Paid keyword-tool procurement or paid media execution.

## Definition of Done

All sixteen acceptance criteria are evidenced by files, automated output, browser captures/logs, agent review, merged PR state, and live production responses. Intent, unmerged local work, or a passing narrow test does not count as completion.
