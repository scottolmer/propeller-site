# Fantasy Projections SEO and AEO Roadmap

**Product:** Propeller Picks  
**Scope:** Website acquisition and answer-engine visibility for the fantasy projections feature, plus the reusable launch system for future features  
**Prepared:** July 16, 2026  
**Audience:** Founder, product, engineering, design, content, analytics, and growth  
**Status:** Internal implementation roadmap. This is not public marketing copy.  
**Primary website:** `https://propellerpicks.com/`  
**Signed-in web app:** `https://app.propellerpicks.com/app/fantasy`  

---

## 1. Executive decision

Propeller should launch a dedicated, public fantasy acquisition cluster instead of trying to make the signed-in web app rank.

The recommended architecture is:

1. `/fantasy/` owns the broad product and category intent: market-powered fantasy projections, what Propeller's fantasy feature does, who it is for, and how the approach differs from generic season-long projection tables.
2. `/fantasy/mlb/` owns the live utility intent: today's MLB fantasy projections, daily fantasy baseball hitter projections, floor/projection/ceiling, and Sit/Start comparison.
3. `/fantasy/methodology/` becomes the evidence and citation owner only after the public methodology, scoring identity, range calibration, limitations, and version history are approved for publication.
4. `/fantasy/research/market-vs-recent-form/` becomes an original-research citation asset only after the backtest is reviewed, frozen, reproducible, and cleared for public claims.

Do not create indexable NFL, NBA, player, date, matchup, or league pages at launch. MLB is the only live fantasy market board. NFL and NBA may be named as planned sports on the hub, but they must not receive indexable landing pages until their product and content gates pass.

This recommendation preserves the site's existing canonical ownership:

- `/analyzer/` remains the generic free AI player prop analyzer owner.
- `/picks/mlb/` remains the current MLB player-prop research owner.
- `/guides/how-ai-sports-betting-works/` remains the player-prop model card.
- `/fantasy/` and `/fantasy/mlb/` introduce a distinct fantasy-points and Sit/Start job, not a renamed prop board.

### What success means

The feature should create a measurable path:

```text
Fantasy question or projection query
  -> public, indexable answer or utility
  -> useful preview interaction
  -> signed-in fantasy board
  -> qualified account creation or returning-user activation
```

Rankings, AI citations, and impressions are leading indicators. The business outcome is qualified fantasy-board use and attributed signup or reactivation.

---

## 2. Evidence baseline

### 2.1 What is live in the product

The shipped web and mobile feature is narrower and more defensible than the phrase “fantasy projections” by itself suggests.

| Product fact | Current state | Public-language implication |
|---|---|---|
| Supported sport | MLB only | Say “MLB projections are live.” Do not imply live NFL or NBA coverage. |
| Main output | Projected fantasy points | Define the scoring basis wherever the number is shown. |
| Range output | Floor and ceiling around today's projection | Explain that these are range estimates, not minimum and maximum guarantees. |
| Comparison | Select two same-group players for Sit/Start | Say that Propeller compares projected scoring; do not claim roster optimization. |
| Player groups | Hitters only in the current market-board response | Do not market pitcher projections until the backend returns them reliably. The clients can represent a pitcher group, but current service output labels every projection as `Hitter`. |
| Projection inputs | Current component prop markets plus recent form for uncovered scoring components | Never simplify this to “sportsbooks predict fantasy points” or “AI knows the outcome.” |
| Range method | Recent player scoring variance centered on today's projection | Publish the percentile and calibration claim only from an approved, dated methodology ledger. |
| Scoring | Current backend labels the board as DraftKings MLB scoring | Use precise descriptive trademark language and an independence disclaimer. |
| Refresh behavior | Web query refetches every 60 seconds; mobile supports pull-to-refresh | Public pages need a visible “data as of” time and a stale-state policy. |
| Empty state | Board waits for sufficient current component markets | Explain unavailable slates honestly. Do not show a blank indexable template. |
| Other sports | Product UI says they activate after market model and scoring ranges are calibrated | Keep them off the index until that statement is true and the page has real utility. |

### 2.2 Methodology facts found in the implementation

These are internal source facts, not automatically approved marketing claims:

- MLB projections use current consensus component markets where available and recent-form averages for scoring components without a current market.
- The implementation uses MLB hitter scoring components such as hits, runs, RBIs, total bases, doubles, triples, home runs, walks, hit by pitch, and stolen bases.
- The floor and ceiling require at least five historical games.
- The range starts with recent 20th and 80th percentile distances from the recent median, centers those distances on today's projection, and applies a stored spread multiplier.
- The code comment records a July 14, 2026 calibration sample of 1,602 hitter outcomes and reports 61.1% empirical coverage after widening the raw range. This must be independently reproduced and added to an approved public methodology record before it appears in marketing copy, structured data, media pitches, or AI-readable files.
- The current public fantasy endpoint rejects unsupported sports and unsupported scoring platforms.

### 2.3 Current website and search baseline

As checked July 16-17, 2026:

- `https://propellerpicks.com/fantasy/` returns 404.
- `https://app.propellerpicks.com/app/fantasy` routes unauthenticated visitors to login, so it is not an acquisition landing page.
- The live XML sitemap exposes 56 URLs at the time of the check. The repository generator currently has a larger pending set, so deployment state and local source must be reconciled before launch.
- The site already has a valid crawl foundation, canonical intent map, structured-data checks, product-fact ledger, `llms.txt`, public data catalog, and AEO measurement contract.
- The latest complete SEO audit found no critical crawl blocker, but it identified slow mobile visual completion on the analyzer template, non-HTML files in the Google sitemap, duplicate alias handling, authority gaps, and historical claim precision as priorities.
- The July AEO snapshot is still a draft: 255 of 300 observations are complete. Its completed rows report a 40.0% Propeller mention rate and 24.3% citation rate, but the snapshot is explicitly non-comparable until all required observations pass the completeness gate.

### 2.4 External result-set pattern

Current search results separate several intents that Propeller must not collapse:

- Season-long and rest-of-season projection tables.
- Daily fantasy point projections.
- Salary-cap DFS lineup optimizers.
- Fantasy roster, waiver, and trade tools.
- Start/Sit editorial advice.
- Pick'em and player-prop research.

FantasyPros, RotoWire, RotoBaller, FanGraphs-style projection ecosystems, and newer fantasy assistants compete for these searches. Their result pages show why intent precision matters: a daily projection table is not a lineup optimizer, a Sit/Start recommendation is not a season-long ranking, and a pick'em prop projection is not automatically a league-specific fantasy projection.

Propeller's strongest initial position is **daily MLB fantasy points derived from current market information, with a player-specific range and a fast two-player comparison**. That is specific, useful, and consistent with the product.

---

## 3. Non-negotiable product and language rules

### 3.1 Category definition

Use this working definition until a public claim review approves final copy:

> Propeller's MLB fantasy projections estimate a player's fantasy-point output for the current slate using available player markets and recent performance data. Each eligible player can include a projected score and a recent-variance range for comparing likely downside, expected scoring, and upside.

### 3.2 Terms that must stay distinct

| Term | Meaning | Must not be presented as |
|---|---|---|
| Projection | Estimated fantasy-point output under a stated scoring format | Guaranteed result, actual platform line, win probability |
| Floor | Lower range estimate under the published method | Minimum score, worst possible outcome |
| Ceiling | Upper range estimate under the published method | Maximum score, best possible outcome |
| Range coverage | Historical share of outcomes inside a stated interval | Projection accuracy, hit rate, profitability |
| Sit/Start | Relative comparison of two projected scores | Full lineup optimizer, personalized roster advice |
| Market-derived | Uses current market information as model inputs | Official platform feed, endorsement, certainty |
| Confidence | Existing prop direction strength score | Fantasy projection probability unless a new calibrated target is built |
| Accuracy | Error or decision performance under a defined test | Profit, ROI, or future guarantee |

### 3.3 Prohibited claims

Do not publish any of the following unless the product and public evidence change:

- “Best lineup optimizer,” “optimal lineup,” or “automatically optimizes your roster.”
- “Most accurate projections” or a competitor accuracy ranking without a reproducible independent benchmark.
- “Guaranteed floor,” “safe play,” “lock,” “sure start,” or “can't miss.”
- “Official DraftKings projections,” “powered by DraftKings,” or wording that implies affiliation.
- Live NFL or NBA fantasy projections.
- League-sync, scoring customization, roster import, waiver, trade, or season-long projections on the public feature pages unless the current shipped experience exposes and supports them.
- Profit, ROI, expected value, or betting outcome claims for fantasy projection usage.

### 3.4 Required disclosures

Every public fantasy utility should visibly state:

1. The supported sport and scoring format.
2. The slate date and last data update.
3. The projection's input classes at a useful level.
4. What floor and ceiling mean.
5. That projections involve uncertainty.
6. That Propeller is independent from referenced platforms.
7. That current markets and player availability can change.

---

## 4. Canonical intent and URL architecture

### 4.1 Launch architecture

| URL | Canonical job | Primary intent | Index policy | Launch state |
|---|---|---|---|---|
| `/fantasy/` | Fantasy category and feature hub | fantasy projections tool, market-powered fantasy projections, Propeller fantasy | Index | Build first |
| `/fantasy/mlb/` | Live MLB projection utility | MLB fantasy projections today, daily fantasy baseball projections, MLB Sit/Start tool | Index when useful public preview exists | Build first |
| `/fantasy/methodology/` | Projection and range methodology | how fantasy projections work, market-derived projections, floor and ceiling method | Index only after evidence review | Phase 2 |
| `/fantasy/research/market-vs-recent-form/` | Original research | do betting markets improve fantasy projections, market vs recent form | Index only after reproducibility and editorial review | Phase 3 |
| `/help/how-do-propeller-fantasy-projections-work/` | Short support answer | how does Propeller calculate fantasy projections | Index; concise; canonical to itself | Phase 2 |

### 4.2 Existing pages and their boundaries

| Existing owner | It continues to own | It must not absorb |
|---|---|---|
| `/analyzer/` | Generic AI player prop analysis and product intent | Daily fantasy scoring tables or Sit/Start intent |
| `/picks/mlb/` | Current MLB prop-research board | Generic fantasy projection intent |
| `/tools/` | Utility discovery | The full fantasy category explanation |
| `/guides/how-ai-sports-betting-works/` | Player-prop model card | Fantasy range calibration unless the page clearly routes to the separate method |
| `/compare/*/` | Fair product comparison | Unverified fantasy competitor claims or self-awarded accuracy rankings |

### 4.3 Future sport architecture

Reserve, but do not publish, these paths:

- `/fantasy/nfl/`
- `/fantasy/nba/`
- `/fantasy/nhl/`

A future sport page earns indexability only when all of these gates pass:

1. The sport is live in both web and mobile or has an approved platform-specific exception.
2. Its scoring identity is explicit and tested.
3. Its projection target is defined.
4. Historical or shadow validation is complete enough to support the public description.
5. The page has current, unique utility beyond a sport-name substitution.
6. Empty, stale, postponed, off-season, and low-coverage states are specified.
7. It has distinct search demand or a strategic product reason.
8. The page is linked from the fantasy hub and included in the sitemap only after launch.
9. Metadata, structured data, analytics, and AEO prompts are ready.
10. Product facts, `llms.txt`, the data catalog, help content, and app-store descriptions are consistent.

### 4.4 Pages not to create yet

- Date archives such as `/fantasy/mlb/2026-07-16/`.
- One URL per player.
- One URL per matchup.
- One URL per platform scoring variant.
- Thin “best fantasy projection” listicles.
- Programmatic “Player A vs Player B” pages.
- “Coming soon” pages for unsupported sports.

These could produce large cohorts with unstable data and little unique value. Revisit them only after the programmatic-page gates in section 15 pass.

---

## 5. Search demand and query portfolio

Keyword tools and Search Console should determine final prioritization. The following portfolio is a hypothesis map, not claimed search volume.

### 5.1 Launch cluster: category and product

| Query family | Intent | Owner | Content requirement |
|---|---|---|---|
| fantasy projections tool | Commercial investigation | `/fantasy/` | Clear category definition, supported sport, preview, differentiation |
| AI fantasy projections | Commercial investigation | `/fantasy/` | Explain where AI/modeling contributes without vague “AI-powered” claims |
| market-based fantasy projections | Methodology | `/fantasy/` then methodology | Direct definition and why current markets may add context |
| fantasy projection app | Product | `/fantasy/` | Web and mobile availability, screenshots, account path |
| free fantasy projections | Utility/commercial | `/fantasy/` | State exactly what is public and what requires sign-in |
| Propeller Picks fantasy projections | Branded | `/fantasy/` | Canonical product facts and navigation |

### 5.2 MLB daily utility cluster

| Query family | Intent | Owner | Content requirement |
|---|---|---|---|
| MLB fantasy projections today | Live utility | `/fantasy/mlb/` | Current slate, update time, hitter rankings, method summary |
| daily fantasy baseball projections | Live utility | `/fantasy/mlb/` | Hitter results and scoring label; qualify the scope visibly |
| MLB fantasy points projections | Live utility | `/fantasy/mlb/` | Projected points, range, scoring definition |
| fantasy baseball projections today | Live utility | `/fantasy/mlb/` | Date-specific visible state on evergreen URL |
| MLB hitter projections today | Live utility | `/fantasy/mlb/` | Hitter subsection and meaningful rows |
| MLB pitcher projections today | Future live utility | `/fantasy/mlb/` or a later distinct owner | Do not target until pitcher data is reliably present and explained |
| MLB fantasy floor ceiling projections | Evaluation | `/fantasy/mlb/` | Range explainer, examples, limitations |
| fantasy baseball start sit tool | Decision support | `/fantasy/mlb/` | Two-player comparison, not lineup optimization |
| who should I start in fantasy baseball today | Decision support | `/fantasy/mlb/` | Explain the tool's relative comparison and scoring limits |
| compare MLB fantasy players | Decision support | `/fantasy/mlb/` | Interactive comparison plus crawlable worked example |

### 5.3 Methodology and education cluster

| Query family | Intent | Owner | Content requirement |
|---|---|---|---|
| how are fantasy baseball projections calculated | Education | `/fantasy/methodology/` | Inputs, scoring, assumptions, version |
| what does floor and ceiling mean in fantasy | Education | Methodology or help | Direct definitions with example |
| market-based fantasy baseball projections | Education | Methodology | Market input mechanics and limitations |
| fantasy projection vs player prop line | Comparison | Methodology | Clear distinction between outputs |
| how often fantasy projections update | Freshness | Help or MLB page | Actual refresh behavior and slate caveats |
| are fantasy projections accurate | Evaluation | Methodology/research | Error metrics and limitations, never unsupported reassurance |

### 5.4 Research and authority cluster

| Query family | Intent | Owner | Evidence needed |
|---|---|---|---|
| betting markets vs fantasy projections | Research | Research report | Frozen dataset, method, sample, uncertainty |
| do player props predict fantasy points | Research | Research report | Sport/scoring-specific test and limitations |
| recent form vs market fantasy projections | Research | Research report | Reproducible comparison and untouched test set |
| fantasy projection interval calibration | Technical | Methodology/research | Coverage target, empirical coverage, sample dates |

### 5.5 Future sports

Add future keyword families only after the corresponding product gate passes:

- NFL: weekly fantasy football projections, PPR projections, half-PPR projections, start/sit, floor/ceiling, position comparisons.
- NBA: daily fantasy basketball points, minutes-sensitive projections, floor/ceiling, player comparisons.
- NHL: daily fantasy hockey points and goalie/skater-specific intent.

Each sport needs its own scoring and methodology map. Do not clone MLB copy.

### 5.6 Negative intent map

Do not optimize the launch pages for:

- DFS lineup optimizer.
- Salary optimizer.
- Draft assistant or mock draft.
- Rest-of-season rankings.
- Dynasty rankings.
- Waiver wire or trade analyzer.
- Sportsbook picks, locks, guaranteed wins, or betting tips.
- Official DraftKings, ESPN, Yahoo, FanDuel, or Sleeper projections.

If the product later ships one of these jobs, give it a separate intent owner instead of broadening the fantasy projection page until its topic becomes unclear.

---

## 6. Content strategy and topical model

### 6.1 The topic cluster

The fantasy hub should answer the parent topic, while supporting pages handle distinct jobs:

```text
/fantasy/
├── What the feature is
├── Who it helps
├── MLB live now
├── Daily vs season-long distinction
├── Projection vs prop-line distinction
├── Floor/projection/ceiling overview
├── Sit/Start overview
├── Web and mobile access
├── Link to live MLB utility
├── Link to methodology
└── Link to evidence/research when approved

/fantasy/mlb/
├── Today's board
├── Hitter view at launch
├── Pitcher view only after the product gate passes
├── Floor/projected/ceiling sorting
├── Two-player comparison
├── Visible worked example
├── Data timestamp and slate status
├── Scoring and independence note
├── Method summary
└── Links to method, product, and signup
```

This structure covers likely query fan-out without making one thin page for every phrase.

### 6.2 Launch content inventory

#### `/fantasy/` required sections

1. Direct definition in the opening paragraph.
2. “MLB is live now” status block.
3. Product preview using real or clearly labeled sample data.
4. “How it works” in three steps: gather current market inputs, calculate the fantasy-points projection, estimate a player-specific range.
5. Clear distinction table: daily projection, season-long projection, player prop line, lineup optimizer.
6. Sit/Start comparison example.
7. Web and mobile product availability.
8. Methodology and uncertainty section.
9. FAQ built from real questions.
10. CTA to the live public preview and signed-in board.

#### `/fantasy/mlb/` required sections

1. Server-rendered title, date, status, and direct answer before the interactive board.
2. Public preview with enough real utility to satisfy the query.
3. Hitter controls at launch. Add pitcher controls only after pitcher projections are live and validated.
4. Sort by floor, projected, and ceiling.
5. Two-player Sit/Start comparison.
6. Static worked example that remains meaningful if the API fails.
7. “What changed since the last update?” only if the system can support it accurately.
8. Explanation of scoring and input coverage.
9. Range interpretation and limitations.
10. Links to methodology, fantasy hub, relevant MLB prop research, and signup.

### 6.3 Answer blocks

Use normal paragraphs and sections written for people. Do not fragment the page into artificial “AI chunks.” Each high-value section should still begin with a complete answer.

Examples:

**What are Propeller MLB fantasy projections?**  
Propeller MLB fantasy projections estimate a player's fantasy-point output for the current slate. The current method combines available player-market information with recent performance data for scoring components that do not have a usable market.

**What do floor and ceiling mean?**  
The floor and ceiling are lower and upper range estimates around today's projection. They describe a modeled range based on recent player scoring variance; they are not guaranteed minimum or maximum scores.

**Is this a lineup optimizer?**  
No. The current fantasy feature ranks eligible MLB hitters and compares two players at a time. It does not build a salary-cap lineup or optimize an entire fantasy roster.

Final published wording must match the approved product-fact and methodology ledgers.

### 6.4 Worked example standard

Every feature page should include one crawlable example that:

- Uses labeled sample data or an archived, dated real observation.
- Shows the projection and range.
- Explains the input count without exposing private model data.
- Explains why one player ranks above another.
- States the scoring format.
- Avoids hindsight language after the game.
- Does not imply the example predicts the outcome with certainty.

### 6.5 Editorial formats that can earn citations

Prioritize:

- Public methodology with formulas and limitations.
- Dated calibration reports.
- Market-versus-recent-form research.
- Projection error reports by sport and position.
- Transparent change logs when model versions change.
- Balanced definitions and comparison tables.
- Public datasets only when licensing and redistribution rights are clear.

Avoid generic “10 fantasy tips” content unless Propeller has original data or product experience that makes it non-commodity.

---

## 7. Page experience and frontend design brief

The public fantasy pages should feel like an editorial sports research desk connected to a live instrument panel. They should not look like a generic SaaS landing page or a casino promotion.

### 7.1 Design direction

**Concept:** live scouting board with publication-grade explanation.  
**Tone:** precise, energetic, data-forward, independent.  
**Memorable element:** the floor-to-ceiling range is the visual spine of the page, with the projection visibly centered in context rather than presented as an isolated “magic number.”

### 7.2 Visual system

- Preserve Propeller's established green accent and brand continuity.
- Use the site's existing distinctive typography and avoid introducing a separate fantasy microsite style.
- Give projected points the strongest hierarchy; floor and ceiling support it.
- Show freshness as a quiet data-status element, not a flashing urgency device.
- Use real table semantics on desktop and labeled card rows on narrow screens.
- Keep color meaningful. Do not make the floor red or ceiling green if that implies bad/good outcomes rather than range position.
- Use subtle motion only when the board refreshes or a comparison is completed. Respect `prefers-reduced-motion`.
- Avoid fake charts, decorative odds tickers, coins, chips, sportsbook motifs, and neon casino visuals.

### 7.3 Recommended page composition

```text
Breadcrumb
H1 + direct answer + current MLB status
Primary CTA: View today's projections
Secondary CTA: How the projections work

Live preview panel
  Slate date / updated time / scoring label
  Hitters
  Pitchers only after launch readiness
  Floor | Projected | Ceiling
  Ranked preview rows

Sit/Start comparison demo
  Player A range
  Player B range
  Relative projected difference
  Limitation note

How it works
Daily vs season-long vs props vs optimizer comparison
Method and uncertainty
Web + mobile product screenshots
FAQ
Final CTA
Editorial sources / reviewed date / correction link
```

### 7.4 Mobile requirements

- The direct answer and first useful projection must appear before a long brand hero.
- No horizontal page overflow at 320, 360, 390, 412, and 430 CSS pixels.
- Table alternatives must retain labels; do not rely on column position alone.
- Tap targets should be at least 44 by 44 CSS pixels where practical.
- The selected comparison state must be announced to assistive technology.
- Sticky controls must not hide headings, focused elements, or CTA targets.
- The page must remain useful at 200% text zoom.

### 7.5 Performance budgets

Treat these as engineering targets, measured at the 75th percentile for real users where field data exists:

- LCP: 2.5 seconds or better.
- INP: 200 milliseconds or better.
- CLS: 0.1 or better.

Additional launch budgets:

- Server-render the direct answer, headings, example, and initial preview rows.
- Avoid client-side rendering for all meaningful content.
- Reserve dimensions for screenshots and live rows.
- Defer analytics and interaction code that is not needed for first content.
- Use responsive AVIF/WebP screenshots and lazy-load below-the-fold media.
- Test one cold mobile Lighthouse run and repeatable WebPageTest runs, then validate field data after traffic accumulates.

---

## 8. Technical SEO specification

### 8.1 Rendering

The marketing site is static. Build the launch pages as generated HTML with a resilient enhancement layer:

1. Static HTML contains the direct answer, methodology summary, worked example, FAQ, and an initial public preview snapshot.
2. JavaScript refreshes live rows after load.
3. If the API fails, the page keeps the static explanation and shows a truthful slate status.
4. Search crawlers and agents receive meaningful content without signing in or executing the app bundle.

### 8.2 Public data contract

Do not expose the private app endpoint indiscriminately. Create a curated public fantasy endpoint or generated snapshot with:

- Sport.
- Slate date.
- Scoring label.
- Generated/updated time.
- Public player identifier or safe display name.
- Position group.
- Projected points.
- Floor and ceiling when eligible.
- Input count.
- Method version.
- Stale status.
- Public-use and attribution notes.

Exclude private model weights, proprietary market inventory, account data, rich agent breakdowns, internal confidence components, or licensed data that cannot be redistributed.

Add the endpoint to `/data/index.json` and the curated public agent API only after privacy, license, rate-limit, and product reviews.

### 8.3 URL and canonical rules

- Use lowercase paths with trailing slashes to match the site.
- Add self-referencing canonicals.
- Keep query parameters for filters and sorting non-canonical.
- Do not generate separate indexable URLs for `?position=hitter`, `?sort=floor`, platform, or date filters.
- If filters become shareable, canonical them to the base live page unless a distinct page passes the unique-utility gate.
- Add true 301/308 redirects for any abandoned fantasy aliases if the hosting layer permits them.

### 8.4 Index and stale-state policy

`/fantasy/` can remain indexable year-round because its product explanation is evergreen.

`/fantasy/mlb/` should remain indexable in season if it always provides a useful explanation, current status, and a clearly labeled prior/example state. It must not present old rows as current.

State rules:

| State | Visible behavior | Search behavior |
|---|---|---|
| Live slate | Current rows and update time | Index |
| Markets not posted | Explanation, expected update condition, no fake rows | Index |
| Off day | State that no MLB slate is available; retain educational utility | Index |
| API error | Keep static content, show retrieval error | Index unless prolonged systemic failure |
| Stale snapshot | Label timestamp and suppress “today” claims | Index; alert maintenance |
| Unsupported sport | No public sport URL | 404 until launch |
| Retired feature | Useful replacement and permanent redirect, or 410 if no replacement | Remove from sitemap |

### 8.5 Sitemap

- Add only canonical HTML landing pages intended to appear in Google Search.
- Keep JSON, `llms.txt`, pricing Markdown, and machine-readable feeds discoverable through visible links and the data catalog, not the Google sitemap unless there is a deliberate indexing decision.
- Update `lastmod` only after substantive page or data changes under a documented policy.
- The generator must verify 200 status, canonical match, indexability, and content fingerprint before adding a fantasy URL.

### 8.6 Internal links

Add descriptive links from:

- Homepage feature navigation or product grid.
- `/tools/`.
- `/picks/mlb/` with anchor language distinguishing fantasy points from player props.
- `/analyzer/` where projection-versus-line education is relevant.
- MLB guide content when it genuinely supports the reader's next task.
- Help center.
- Footer product navigation.

Do not sitewide-link every future sport or create keyword-heavy footer lists.

### 8.7 Metadata hypothesis

Final titles and descriptions should be tested against real query data. Initial hypotheses:

**`/fantasy/`**  
Title: `Fantasy Projections Tool for Web & Mobile | Propeller Picks`  
H1: `Market-powered fantasy projections, built for clearer decisions`  
Description: `Compare Propeller's daily MLB fantasy-point projections, player-specific ranges, and two-player Sit/Start views. MLB is live now on web and mobile.`

**`/fantasy/mlb/`**  
Title: `MLB Fantasy Projections Today | Propeller Picks`  
H1: `Today's MLB fantasy projections`  
Description: `View current MLB fantasy-point projections for eligible hitters, compare floor, projected score, and ceiling, and test a two-player Sit/Start decision.`

Do not add “pitchers” to the title, description, H1, answer block, or structured data until the service returns validated pitcher projections.

### 8.8 Image and video search

- Produce one annotated fantasy-board image with descriptive alt text.
- Produce one Sit/Start comparison image.
- Use stable filenames such as `propeller-mlb-fantasy-projections-board.avif`.
- Add captions that state the sport, view, and scoring context.
- Consider a short, transcript-backed product demo after the pages are stable.
- Add video structured data only when a real embedded video and required properties exist.

---

## 9. Structured data plan

Structured data should describe visible content. It is not an AEO ranking switch.

### 9.1 `/fantasy/`

Recommended graph:

- `WebPage`.
- `BreadcrumbList`.
- Existing `Organization` entity reference.
- `SoftwareApplication` or `WebApplication` only if its visible product facts, operating systems, access model, and offers can be represented truthfully.
- `FAQPage` as semantic markup if visible FAQ parity is exact. Do not expect a Google FAQ rich result for this site type.

Do not invent ratings, review counts, prices, or application category properties.

### 9.2 `/fantasy/mlb/`

Recommended graph:

- `WebPage`.
- `BreadcrumbList`.
- `ItemList` for a visible ranked preview only if item order and names match the rendered page.
- `Dataset` only if Propeller publishes a stable, documented, downloadable dataset with license, creator, temporal coverage, and distribution metadata. A transient API response alone is not enough reason.

Do not mark every player as a `Person` merely to increase entity count. Do not use `SportsEvent` without accurate event identity, start time, teams, and visible event content.

### 9.3 Methodology and research pages

- `Article` or `TechArticle` for the method, with real author/reviewer, dates, headline, description, and version.
- `Dataset` for a published research dataset when licensing allows it.
- `ClaimReview` is not appropriate for Propeller reviewing its own model claims.

### 9.4 Validation gates

1. JSON parses.
2. Every claim matches visible copy.
3. Canonical and schema URLs agree.
4. Dates reflect real publication and substantive review.
5. Visible FAQ and schema answers match exactly.
6. Rich Results Test and Schema.org Validator are checked.
7. Regression tests cover supported and empty states.

---

## 10. AEO and AI-search strategy

### 10.1 The visibility ladder

Track each stage separately:

1. Retrieved.
2. Cited.
3. Mentioned.
4. Recommended.
5. Recommended against.
6. Converted or assisted.

An AI answer may cite Propeller's methodology while recommending a larger fantasy platform. That is citation success but not recommendation success.

### 10.2 Platform requirements

#### Google AI Overviews and AI Mode

- The page must be indexed and snippet-eligible.
- Google's core SEO and quality systems apply.
- There is no required AI schema, Markdown mirror, or `llms.txt` benefit in Google Search.
- Google may use query fan-out, so the topical cluster matters more than exact-match page proliferation.
- As of June 2026, Google is rolling out a dedicated Generative AI performance report to a subset of Search Console properties. It reports impressions, pages, countries, devices for Search, and dates. Check whether the Propeller property has access; retain controlled prompt testing because the report does not replace cross-platform mention, citation, accuracy, or recommendation measurement.

#### ChatGPT Search

- Explicitly allow `OAI-SearchBot` and verify published IP access if a WAF is added.
- Treat `GPTBot` training access as a separate business choice.
- `ChatGPT-User` is user-triggered and is not the Search inclusion control.

#### Claude

- Explicitly document `Claude-SearchBot`, `Claude-User`, and `ClaudeBot` choices.
- The current wildcard allow means the missing tokens are not blocked, but the policy is incomplete and hard to audit.
- Remove reliance on the legacy `anthropic-ai` token after verifying current official guidance.

#### Perplexity

- Explicitly allow `PerplexityBot` for search.
- Document the separate `Perplexity-User` fetcher.
- Verify WAF access against current published IP ranges if applicable.

#### Bing and Copilot

- Keep `Bingbot` crawlable.
- Add Bing Webmaster Tools verification and diagnostics.
- Evaluate IndexNow for new, updated, and removed evergreen fantasy URLs. Do not submit every 60-second data refresh.

### 10.3 Robots policy decision

The current file allows search and training crawlers broadly. Replace implicit policy with an approved matrix:

| Agent | Purpose | Recommended default | Owner decision required |
|---|---|---:|---:|
| Googlebot | Google Search and Search AI | Allow | No |
| Google-Extended | Some non-Search training/grounding uses | Neutral; decide separately | Yes |
| OAI-SearchBot | ChatGPT Search | Allow | No |
| GPTBot | OpenAI model training | Separate policy | Yes |
| ChatGPT-User | User-triggered fetch | Allow | No |
| Claude-SearchBot | Claude search | Allow | No |
| Claude-User | User-triggered fetch | Allow | No |
| ClaudeBot | Anthropic model training | Separate policy | Yes |
| PerplexityBot | Perplexity Search | Allow | No |
| Perplexity-User | User-triggered fetch | Allow | No |
| Bingbot | Bing/Copilot search foundation | Allow | No |

### 10.4 Machine-readable assets

Update, but do not oversell:

- `llms.txt`: add the fantasy hub, live MLB page, public method, and public data feed after each exists.
- `/data/index.json`: add the approved product facts, public endpoint, method version, and safe-use notes.
- `/pricing.md`: add fantasy availability only if access conditions are current and consistent.
- Curated agent OpenAPI: add a read-only fantasy snapshot endpoint only after public-data review.
- OKF: treat as an experiment. Do not prioritize it ahead of public pages, method evidence, crawler controls, and measurement.

### 10.5 Citation-worthy facts

Build a small public fact set that can be quoted safely:

- What the feature does.
- Which sport is live.
- Which scoring format is used.
- Which input classes are used.
- How often the public board is refreshed.
- How floor and ceiling are constructed.
- Minimum history requirement.
- Method version and last substantive review.
- Calibration sample and coverage only after independent reproduction.
- Limitations and unsupported use cases.

Each fact needs one canonical source and a source-of-truth owner.

### 10.6 Third-party presence

Earn corroboration through useful evidence, not manufactured mentions:

- Pitch the methodology or research dataset to fantasy baseball analysts and data journalists.
- Offer a reproducible market-versus-form analysis with limitations.
- Create a short expert demo for YouTube with a full transcript and source links.
- Keep app-store feature descriptions and screenshots current so AI systems see consistent web and mobile facts.
- Participate in fantasy communities only when answering real questions. Disclose affiliation.
- Do not create or edit Wikipedia pages for promotional purposes.

---

## 11. AEO question set and measurement contract

Do not modify the frozen July 20-question core in the middle of its incomplete 300-observation run.

### 11.1 Supplemental launch benchmark

Create a separate fantasy supplement with 12 questions across the same five platforms and three fresh runs: 180 observations.

1. What is a good free MLB fantasy projection tool?
2. Where can I find today's MLB fantasy points projections?
3. What is the best fantasy baseball start sit tool?
4. Which MLB fantasy projection tools show floor and ceiling?
5. How are daily fantasy baseball projections calculated?
6. What does floor and ceiling mean in fantasy baseball projections?
7. Are betting markets useful for fantasy baseball projections?
8. What is the difference between a fantasy projection and a player prop line?
9. Is Propeller Picks a fantasy lineup optimizer?
10. Does Propeller Picks have MLB fantasy projections?
11. Does Propeller Picks support NFL or NBA fantasy projections?
12. How often does Propeller update its MLB fantasy projections?

### 11.2 Observation fields

Reuse the existing contract fields and add:

- Fantasy intent class.
- Sport.
- Answer date sensitivity.
- Product-scope accuracy.
- Method accuracy.
- Scoring-format accuracy.
- Unsupported-feature hallucination.
- Cited Propeller URL role: hub, live utility, method, research, help, app store, other.

### 11.3 Baseline timing

Run three waves:

1. Pre-index baseline before public pages launch.
2. Post-index check after the URLs are indexed and crawler logs show access.
3. 30-day comparable benchmark using identical prompts and modes.

Do not infer causation from one answer change. Report completed denominators and retain blocked, absent, rate-limited, and inconclusive runs.

### 11.4 Core-contract evolution

At the next approved version boundary, decide whether fantasy replaces any weak or obsolete core questions. Preserve the old immutable contract and do not splice new fantasy questions into historical rates.

---

## 12. Analytics and attribution

### 12.1 Event model

Add privacy-safe website events:

| Event | Trigger | Required parameters |
|---|---|---|
| `fantasy_landing_viewed` | Public fantasy page view | page type, sport, landing path |
| `fantasy_preview_loaded` | Non-empty public preview loads | sport, slate date, row-count bucket, stale state |
| `fantasy_filter_changed` | Position group or sort change | sport, filter, sort |
| `fantasy_compare_started` | First player selected | sport, position group |
| `fantasy_compare_completed` | Two players selected | sport, position group, projection-gap bucket |
| `fantasy_methodology_clicked` | Method link selected | source page |
| `fantasy_app_cta_clicked` | App CTA selected | source page, CTA placement, auth state when known |
| `fantasy_signup_started` | Signup handoff begins | first/last-touch campaign fields |
| `fantasy_signup_completed` | Authoritative backend confirms new account | existing authoritative signup contract plus fantasy source |

Do not send player names, raw search strings, roster data, or account-sensitive fantasy selections to GA4.

### 12.2 Cross-domain continuity

Preserve the current first-touch and last-touch handoff from `propellerpicks.com` to `app.propellerpicks.com`. Add feature-source fields without replacing the existing attribution contract:

- `feature=fantasy`
- `feature_sport=mlb`
- `landing_page=/fantasy/` or `/fantasy/mlb/`
- CTA placement

### 12.3 Reporting views

Build a fantasy scorecard with separate sections:

**Discovery**

- Non-brand impressions and clicks.
- Query-to-page ownership.
- Indexed canonical pages.
- Google Generative AI impressions if the report is available.

**Engagement**

- Preview load rate.
- Compare completion rate.
- Methodology click rate.
- App CTA rate.

**Activation**

- Qualified signup rate by landing page.
- Signed-in fantasy board view within 7 days.
- Returning-account fantasy reactivation.

**AEO**

- Mention, citation, and recommendation rates.
- Factual accuracy.
- Unsupported-feature hallucination rate.
- Cited page distribution.

**Authority**

- Earned referring domains.
- Independent mentions.
- Research or methodology citations.
- App-store and video citation share.

### 12.4 Decision rules

- High impressions, weak CTR: inspect query-to-page match and snippet before creating a new URL.
- Strong clicks, weak preview engagement: improve usefulness and above-fold clarity.
- Strong preview use, weak app CTA: test CTA framing and access explanation.
- Strong app CTA, weak signup: inspect cross-domain handoff and registration friction.
- Strong citations, weak recommendations: pursue independent corroboration and product proof.
- Wrong AI facts: correct the canonical source before outreach.
- Unsupported-sport hallucinations: make the live MLB boundary more explicit across owned and third-party surfaces.

---

## 13. Launch roadmap

### Phase 0: truth, ownership, and contracts (days 0-5)

**Goal:** lock what can be said and where it belongs.

Tasks:

1. Create `data/fantasy-product-facts.json` or extend the existing product ledger with fantasy-specific fields.
2. Create a public-method approval record with input classes, scoring, range semantics, current sport, unsupported features, and last verification date.
3. Reproduce the stored calibration result and document sample construction before public use.
4. Record pitcher projections as not live in the launch ledger and define the later activation gate.
5. Confirm trademark-safe scoring language.
6. Approve `/fantasy/` and `/fantasy/mlb/` ownership in the intent map.
7. Define the public preview size and access model.
8. Decide search-versus-training crawler policy.
9. Freeze the supplemental 12-question AEO contract.
10. Capture pre-launch GSC, rank, and AEO baselines.

Exit criteria:

- Product, method, and claim ledgers are approved.
- No unsupported feature appears in planned metadata.
- Canonical owners are recorded.
- Public data contract is reviewed.

### Phase 1: acquisition foundation (days 5-14)

**Goal:** ship useful, indexable public surfaces.

Tasks:

1. Build `/fantasy/`.
2. Build `/fantasy/mlb/` with server-rendered public preview and resilient empty states.
3. Add internal links from the homepage, tools hub, MLB page, analyzer, help, and footer where relevant.
4. Add metadata, canonical tags, Open Graph, and approved structured data.
5. Add responsive images and alt text.
6. Update sitemap with HTML pages only.
7. Update `llms.txt` and data catalog after the pages are live.
8. Add explicit current search crawler tokens to robots policy.
9. Add analytics events and cross-domain feature attribution.
10. Add IndexNow only for URL-level publication changes, not live-row refreshes.

Exit criteria:

- Pages return 200, self-canonical, and indexable.
- Meaningful content is present without JavaScript.
- Public preview is useful and license-safe.
- Mobile, accessibility, schema, and performance gates pass.
- Existing analyzer and MLB prop intent tests remain green.

### Phase 2: explanation and citation layer (days 14-30)

**Goal:** make the feature understandable and quotable.

Tasks:

1. Publish `/fantasy/methodology/` after review.
2. Publish the concise help answer.
3. Add a versioned methodology JSON file.
4. Add a crawlable worked comparison.
5. Produce one annotated screenshot and one short transcript-backed demo.
6. Run the post-index AEO wave.
7. Inspect crawler logs for Googlebot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, and Bingbot.
8. Check whether Search Console's Generative AI report is available.

Exit criteria:

- Every public claim has a canonical source.
- AI answers can resolve live sport, scoring, method, and limitations correctly.
- No new structured-data mismatch.

### Phase 3: original research and authority (days 30-60)

**Goal:** create evidence competitors cannot cheaply copy.

Tasks:

1. Review and reproduce the market-versus-form backtest.
2. Publish the research page, method, sample dates, exclusions, uncertainty, and downloadable aggregate data if licensing allows.
3. Add a correction and revision log.
4. Build a qualified publisher and analyst prospect list.
5. Prepare source-specific outreach briefs; do not contact anyone without explicit approval.
6. Add the research asset to the AEO prompt set.
7. Track citations separately from recommendations.

Exit criteria:

- The report is reproducible from frozen inputs.
- No metric is called “accuracy” without its exact definition.
- At least one distribution format is easy to cite: HTML table, chart with transcript, or downloadable aggregate.

### Phase 4: measured expansion (days 60-90)

**Goal:** improve the winning surfaces and prepare the next sport.

Tasks:

1. Review GSC query/page cohorts after a stable observation window.
2. Complete the 30-day AEO supplement.
3. Review fantasy-assisted signup and activation quality.
4. Fix the highest-impact mismatch in the existing pages.
5. Select the next sport only from product readiness, seasonality, and demand evidence.
6. Build a shadow page in a non-indexed environment for the next sport.
7. Run the full sport launch gate before publishing.

---

## 14. Prioritized backlog

| Priority | Work item | Owner | Dependency | Acceptance evidence |
|---:|---|---|---|---|
| P0 | Fantasy product-fact ledger | Product + engineering | Current implementation | Reviewed JSON and tests |
| P0 | Reproduce range calibration | Data/engineering | Frozen outcome sample | Reproducible report with uncertainty |
| P0 | Canonical intent-map update | SEO | Product approval | Contract test passes |
| P0 | Public fantasy preview contract | Backend + legal/data | License review | Safe fields, rate limits, stale policy |
| P0 | `/fantasy/` page | Web/design/content | Fact ledger | Rendered desktop/mobile review |
| P0 | `/fantasy/mlb/` live utility | Web/backend/design | Public preview | Useful no-JS content and live enhancement |
| P0 | Analytics and attribution | Analytics + web app | Existing signup contract | DebugView and authoritative signup proof |
| P0 | Sitemap/robots/canonical updates | SEO/engineering | URLs live | Automated crawl checks |
| P1 | Fantasy methodology page | Data/content | Method approval | Sources, reviewer, version, limitations |
| P1 | Supplemental AEO benchmark | SEO | Frozen questions | 180 complete observations |
| P1 | Images and demo video | Design/content | Stable UI | Accessible media and transcript |
| P1 | Bing Webmaster Tools/IndexNow | SEO/engineering | Ownership verification | Successful URL notification and crawl |
| P1 | Crawler log dashboard | Engineering | Log access | Verified search-bot requests |
| P1 | Method JSON and data-catalog entry | Engineering/SEO | Public method | Contract tests pass |
| P2 | Market-versus-form research | Data/editorial | Reproducible analysis | Public report and correction path |
| P2 | Earned citation program | PR/content | Research asset | Qualified list and approved pitches |
| P2 | Next-sport shadow launch | Product/engineering | Readiness gates | Non-indexed QA environment |
| P3 | Programmatic player or comparison pages | SEO/product | Demand and unique utility | Cohort gate and rollback plan |

---

## 15. Programmatic expansion gate

Do not create large fantasy page cohorts until all conditions are met.

### 15.1 Page-level requirements

- Stable user intent.
- Unique current data or functionality.
- Enough visible information to complete the task.
- Defined source and timestamp.
- Correct canonical owner.
- Useful empty and stale states.
- Distinct title and H1 generated from more than token substitution.
- Links from real user journeys.
- No private, licensed, or sensitive leakage.

### 15.2 Cohort requirements

- Explicit inclusion rule.
- Explicit noindex/removal rule.
- Sitemap generation rule.
- Sample-based rendered QA.
- Automated uniqueness and data-depth tests.
- GSC cohort label.
- Conversion and engagement instrumentation.
- Rollback condition.

### 15.3 Candidate future cohorts

In order of plausible value:

1. Sport pages after product launch.
2. Stable scoring-format explainers after the product supports them.
3. High-demand player pages with current projection, inputs, history, and unique explanation.
4. Matchup pages with verified events and sufficient unique data.

Date archives and every possible player comparison remain low priority because they are easy to scale and hard to keep uniquely useful.

---

## 16. Reusable SEO/AEO launch system for every future feature

Every new feature should complete this one-page intake before public SEO work begins.

### 16.1 Feature intake

**Product job**

- What user decision does the feature improve?
- What does it output?
- Who can access it?
- Which sports, platforms, devices, and account states are live?

**Truth contract**

- What is each score or number?
- What is it not?
- Which source fields populate it?
- What are the empty, stale, and failure states?
- Which claims have reproducible evidence?

**Intent contract**

- What query family is new?
- Which existing page is closest?
- Can the existing page be strengthened?
- If a new URL is necessary, what single job does it own?
- Which query families are exclusions?

**Public utility**

- What can a visitor use without signing in?
- What crawlable example proves the value?
- What private or licensed fields must stay hidden?

**AEO contract**

- What five facts should an answer engine state correctly?
- What questions will be tested?
- Which page is canonical for each answer?
- What third-party evidence could legitimately corroborate it?

**Measurement contract**

- What is the pre-launch baseline?
- What events show real use?
- What downstream activation matters?
- What 30/60/90-day decision will the data inform?

### 16.2 Feature launch sequence

```text
1. Verify product truth
2. Assign canonical intent
3. Decide whether a new URL is justified
4. Build public utility and resilient HTML
5. Add sources, method, and limitations
6. Add structured data that matches the page
7. Instrument acquisition through activation
8. Establish SEO and AEO baselines
9. Launch and verify crawl/index/render
10. Measure before expanding
11. Publish original evidence
12. Earn independent corroboration
```

### 16.3 Required source-of-truth files

The long-term system should maintain:

- Product fact ledger.
- Canonical intent map.
- Methodology version ledger.
- Public data catalog.
- Structured-data contracts.
- AEO prompt contracts and immutable snapshots.
- Sitemap fingerprints.
- Feature analytics dictionary.
- Claim and correction log.

### 16.4 Definition of done for a feature landing page

A feature page is not done because it exists. It is done when:

- The feature is live as described.
- The page has a unique canonical job.
- A visitor can understand and test the value.
- The main content is available without heavy client rendering.
- Metadata and visible headings agree.
- Schema matches visible facts.
- Empty and stale states are honest.
- Mobile and accessibility checks pass.
- Search and AI-search crawlers can access it.
- Analytics prove the path to activation.
- The page is included in maintenance and regression tests.
- A 30-day measurement review is scheduled.

---

## 17. Quality assurance plan

### 17.1 Automated checks

Add tests for:

- Required fantasy fact fields.
- Forbidden unsupported-sport and optimizer claims.
- Canonical ownership conflicts with analyzer and MLB picks pages.
- Title, description, H1, canonical, Open Graph, and schema URL alignment.
- FAQ visible/schema parity.
- Public preview timestamp and stale rules.
- Floor less than or equal to projection; ceiling greater than or equal to projection when both exist.
- Minimum-history behavior.
- Empty and error-state HTML.
- Sitemap inclusion only for eligible pages.
- `llms.txt` and data-catalog links.
- Generator idempotence.
- Privacy-safe analytics payloads.
- No horizontal overflow in automated browser widths.

### 17.2 Manual review matrix

Test:

- Desktop Chrome, Safari, and Firefox.
- iPhone Safari sizes.
- Android Chrome sizes.
- Keyboard-only navigation.
- VoiceOver or equivalent screen reader pass.
- 200% text zoom.
- Reduced motion.
- Slow 4G and failed API.
- Live slate, no slate, partial hitter data, stale data, and unsupported sport. Add pitcher-state tests when that output launches.
- Authenticated and unauthenticated CTA paths.

### 17.3 Search verification

- Fetch live headers and final HTML.
- Inspect rendered DOM and JSON-LD.
- Validate canonical and robots directives.
- Submit and inspect in Search Console.
- Confirm sitemap discovery.
- Check Bing Webmaster Tools.
- Inspect bot logs.
- Run the exact AEO prompt supplement.
- Preserve screenshots and cited URLs as evidence.

---

## 18. Risk register

| Risk | Likelihood | Impact | Control |
|---|---:|---:|---|
| Fantasy page cannibalizes MLB prop page | Medium | High | Explicit intent map, distinct copy, query/page monitoring |
| “Market-derived” is interpreted as official affiliation | Medium | High | Independence disclosure and precise source language |
| Range is marketed as guaranteed | Medium | High | Definition, UI labels, claim tests, reviewer gate |
| Unsupported sports get indexed early | High | Medium | 404 until launch, no sitemap, no coming-soon pages |
| Public page is thin because all value stays behind login | High | High | Useful public preview and crawlable example |
| Live data becomes stale | Medium | High | Timestamp, stale threshold, alert, fallback state |
| Licensed data is exposed | Low/Medium | High | Public contract and legal/data review |
| Competitor comparison becomes self-promotional | Medium | Medium | Balanced criteria, first-party sources, independent evidence |
| AI answers hallucinate lineup optimization | High | Medium | Explicit “what it is not” facts and prompt monitoring |
| Analytics double-count signup | Low | High | Preserve authoritative backend new-account flag |
| More URLs dilute authority | High | Medium | Strengthen canonical pages and enforce cohort gates |
| Methodology changes silently | Medium | High | Version ledger, dateModified rules, change log |
| Search snippets overstate freshness | Medium | High | Generated dates only from actual data and review events |

---

## 19. 30/60/90-day scorecard

Set numeric targets only after the pre-launch baseline. Use directional decision rules now.

### Day 30

- Both launch pages indexed or diagnosed.
- Query-to-page ownership is clean.
- Public preview and compare events are firing.
- Fantasy first/last-touch attribution reaches the app.
- AEO supplement is complete.
- No high-severity fact errors or unsupported-sport claims.
- Bot access is verified.

### Day 60

- At least one search query cohort shows sustained impressions.
- Engagement identifies which job matters most: rankings, range, or Sit/Start.
- Methodology page earns retrieval or citation evidence.
- Research asset is published or held with a documented evidence gap.
- Page performance has field data or a clear collection plan.

### Day 90

- Decide whether to scale content, improve the existing pages, or pause expansion.
- Select the next sport only if product and demand gates pass.
- Evaluate earned authority and recommendation rate.
- Compare fantasy-assisted signup quality with site baseline.
- Version the AEO core only through the formal contract process.

---

## 20. Immediate next actions

1. Approve the two-page launch architecture.
2. Assign an owner to the fantasy product-fact ledger.
3. Reproduce the range calibration and decide what can be public.
4. Confirm exact scoring terminology and keep pitcher language out of the launch pages.
5. Define the public preview endpoint and row limit.
6. Add fantasy ownership to the intent map.
7. Build `/fantasy/` and `/fantasy/mlb/` from the design and technical briefs above.
8. Add analytics while preserving the existing signup-attribution contract.
9. Freeze and run the supplemental AEO benchmark.
10. Measure for a stable window before creating another fantasy URL.

---

## 21. Primary external references

- Google Search Central, [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Google Search Central, [Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- Google Search Central, [Search Generative AI performance reports in Search Console](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)
- Google Search Central, [Software application structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- Google Search Central, [Dataset structured data](https://developers.google.com/search/docs/appearance/structured-data/dataset)
- OpenAI, [Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- Anthropic, [Web crawler controls](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- Perplexity, [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- IndexNow, [Protocol documentation](https://www.indexnow.org/documentation)

### Internal evidence used

- `docs/seo/competitor-seo-aeo-paid-search-strategy-2026-07-15.html`
- `docs/seo/complete-seo-audit-2026-07-16.html`
- `docs/seo/aeo-citation-tracker.md`
- `docs/seo/aeo-snapshot-2026-07-16.md`
- `docs/seo/aeo-target-questions.json`
- `data/product-facts.json`
- `data/platform-intent-map.json`
- `llms.txt`
- `robots.txt`
- Shipped fantasy web, mobile, API, service, and test implementations in `nfl-betting-system`

---

## Final operating principle

The fantasy launch should not be a content-volume exercise. Its advantage is the combination of live utility, a distinct market-derived method, transparent uncertainty, and consistent web/mobile product proof. Build two strong canonical pages, publish the method only when the evidence is ready, measure the entire path to activation, and make every future feature pass the same truth and utility gates before it earns a URL.
