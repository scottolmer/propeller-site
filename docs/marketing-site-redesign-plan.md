# Propeller Picks Marketing Site Redesign Plan

Date: 2026-05-31
Owner: Propeller Picks
Working branch: `codex/founder-500-marketing`
Safe worktree: `/Users/scottolmer/Projects/propedge-site-founder500`

## Objective

Redesign `propellerpicks.com` so the marketing site feels like the front door to a standalone web and mobile research product, not an older app-download landing page. The site should sell three ideas immediately:

1. Propeller Picks helps users stop guessing and research props with more structure.
2. Propeller Picks works across desktop and mobile.
3. Propeller Picks has analyzed and graded more than 1 million props, with a live verified record.

The redesign should preserve SEO value, keep daily/generated pages working, and avoid compliance risk from unsupported performance claims.

## Current State

The marketing site is a static HTML/CSS/JS repo served by GitHub Pages. It is separate from the Railway web app at `app.propellerpicks.com`.

The current site has strong SEO breadth, but the implementation is fragmented:

- Each page carries large page-specific CSS blocks.
- Navigation, footer, disclaimers, and CTAs are repeated across pages.
- Some pages still lead with App Store-only language even though the web app is now a first-class product.
- Performance language is inconsistent across pages.
- The homepage has already moved toward Founder 500, but the full site has not been brought into the same visual/product story.
- The canonical result source already exists at `https://web-production-3c1c4.up.railway.app/api/public/results-summary`.

Important repo note: `/Users/scottolmer/Projects/propedge-site` currently has unresolved conflicts. Implementation should proceed in `/Users/scottolmer/Projects/propedge-site-founder500` unless that changes.

## Design Direction

The visual direction should be product-led, dark, dense, and credible. The site should feel like a sharp research desk for sports props: high signal, live data, real product screenshots, restrained motion, and bold typography.

The homepage concept to carry forward:

- H1: `Stop Guessing. Start Winning.`
- H2: `Prop research on desktop and mobile.`
- Body: `Analyze the full slate on the web app, save the props you care about, and keep your research with you in the mobile companion app. Founder 500 members get free lifetime access across web and mobile.`
- Proof module label: `Current Verified Record`
- Primary proof: `1.4M+ props analyzed and graded`
- Secondary proof: live model win rate and W-L-P record
- CTA: `Get Free Lifetime Access`
- Secondary CTA: `Review Track Record` or `See Results`

Visual principles:

- Use actual product surfaces, not abstract SVGs.
- Show the web app and mobile app together in the first viewport.
- Use orange as the action/brand color, green for positive model outcomes, red only for losses/injury/danger.
- Use a distinctive display face, restrained body face, and monospace for every number.
- Avoid generic marketing cards stacked endlessly. Use bands, product surfaces, tables, ledgers, phone screenshots, and live stat modules.
- Keep content dense but scannable. Propeller should feel practical, not fluffy.

## Site Architecture

### Primary Navigation

Recommended top-level nav:

- `Picks`
- `Results`
- `How It Works`
- `Tools`
- `Web App`
- CTA: `Get Free Lifetime Access`

Secondary/footer structure:

- Daily Picks: NBA, NFL, NHL, MLB, Soccer, PrizePicks, Pick6, Underdog
- Product: Web App, Mobile App, Daily Digest, Props Board, Parlays, Tracker
- Proof: Results, Track Record, Methodology
- Learn: Guides, Compare, Blog
- Tools: Payout calculators, Analyzer
- Company: About, Privacy, Terms

### Page Groups

#### 1. Homepage

Purpose: sell the full product and Founder 500 offer.

Sections:

- Hero with web dashboard, real mobile screenshot, live verified record.
- Product workflow: find slate, inspect prop, compare books, track outcome.
- Live record strip: analyzed and graded count, win rate, W-L-P, updated status.
- Web + mobile surfaces: desktop for research depth, mobile for saved props/digest/tracker.
- Feature bands: Props Board, Prop Detail, Parlays, Tracker, Daily Digest.
- Founder 500 block: free lifetime core access for first 500 eligible users.
- Compliance/legal footnote.
- FAQ.

Data:

- Fetch `GET https://web-production-3c1c4.up.railway.app/api/public/results-summary`.
- Render `overall.total`, `overall.win_rate`, `overall.wins`, `overall.losses`, `overall.pushes`.
- Fallback to a conservative static message if the API fails: `1M+ props analyzed and graded`.

#### 2. Results / Track Record

Purpose: make the big homepage claim auditable.

Recommendation: keep `/results/` as the public ledger and make `/track-record/` the narrative proof page. Cross-link heavily.

`/results/` should include:

- Current verified record hero.
- Sport filters.
- Date range filters.
- Confidence threshold explanation.
- Recent graded rows.
- Sport-by-sport totals.
- Methodology notes.

`/track-record/` should include:

- Big record summary.
- Sport cards.
- Calibration explanation.
- Win-rate by confidence bucket.
- Stat-type performance.
- Over/under splits.
- What counts as win/loss/push.
- Responsible gaming disclaimer.

#### 3. How It Works

Purpose: explain the product without sounding like generic AI marketing.

Sections:

- The daily workflow: collect props, score, compare markets, explain, track.
- 8-agent system, but shown as a model panel rather than prose-heavy cards.
- Confidence vs edge: what each means.
- Why line movement/book comparison matters.
- What the model does not promise.

Tone:

- Replace vague "AI analyzes every prop" language with concrete workflow language.
- Use live/product-like visuals from the web app drawer and mobile Prop Detail.

#### 4. Picks Hub and Daily Picks Pages

Purpose: SEO and daily acquisition.

Hub `/picks/`:

- "Today's prop research by sport and platform."
- Cards for NBA/NFL/NHL/MLB/Soccer and platform pages.
- Live status: last updated, available sports, top edge/high confidence counts where available.

Sport daily pages:

- Keep generated pipeline compatibility.
- Add consistent header/nav/footer.
- Show sample top props, but avoid implying every analysis is an official recommendation unless it is.
- Link to full web app filters.

Platform daily pages:

- PrizePicks, Pick6, Underdog should explain how Propeller research applies to that format.
- Keep compliance language clean: research tool, not sportsbook, no guarantee.

#### 5. Sport Landing Pages

Purpose: SEO entry points and sport-specific credibility.

Pages:

- `/nba/`
- `/nfl/`
- `/nhl/`
- `/mlb/`
- `/soccer/`

Template:

- Sport-specific hero with live/latest slate context.
- Product screenshots relevant to the sport.
- Top markets/stat types.
- Current public record for that sport if available.
- Link to today's picks and app signup.
- FAQ tuned for the sport.

#### 6. Platform Pages

Purpose: convert DFS/pick'em search intent.

Pages:

- `/prizepicks/`
- `/pick6/`
- `/underdog/`

Template:

- "Use Propeller research before building your card."
- Explain how props, confidence, edge, and parlay/stacking tools map to platform decisions.
- Payout calculator link.
- Comparison links.
- CTA to web app.

#### 7. Compare and Guides

Purpose: SEO and education.

Keep these pages, but unify them visually and tighten claims:

- `/compare/`
- `/compare/*`
- `/guides/`
- `/guides/*`

Rules:

- Keep search intent intact.
- Use shared nav/footer.
- Avoid turning comparison pages into attack ads.
- Use "research workflow" as the differentiator.

#### 8. Tools and Analyzer

Purpose: utility-led acquisition.

`/tools/`:

- Make it feel like a tool shelf, not a link list.
- Payout calculators should keep fast, simple forms.

`/analyzer/`:

- Treat as a lightweight preview of the app's player detail experience.
- Keep API-powered behavior intact.
- Add clearer fallback/loading states.

## Design System Plan

Create shared assets instead of repeating styles on each page:

- `assets/css/tokens.css`
- `assets/css/layout.css`
- `assets/css/components.css`
- `assets/css/pages/home.css`
- `assets/js/site.js`
- `assets/js/live-record.js`

Core tokens:

- Background: near-black product surface.
- Brand: orange.
- Success: green.
- Loss/danger: red.
- Warning: amber.
- Text hierarchy: white, slate-muted, deep-muted.
- Borders: low-opacity white.
- Radius: mostly 8-18px depending on density; avoid overly bubbly UI.
- Numbers: monospace.

Reusable components:

- Header/nav.
- Mobile nav treatment.
- Footer with required disclaimer.
- Button styles.
- Live record card.
- Product screenshot frame.
- Phone screenshot frame.
- Feature band.
- Sport/platform card.
- Results table.
- FAQ.
- Sticky mobile CTA.

## Dynamic Data Plan

### Current Verified Record

Use existing endpoint:

`GET https://web-production-3c1c4.up.railway.app/api/public/results-summary`

Expected shape:

```json
{
  "overall": {
    "total": 1412714,
    "wins": 939122,
    "losses": 473592,
    "pushes": 0,
    "win_rate": 66.5,
    "published": true
  },
  "sports": []
}
```

Homepage display:

- `1.4M+` as the big count.
- `1,412,714 total props` as detail.
- `66.5%` model win rate.
- `939,122W - 473,592L - 0P`.
- Label: `Live from graded results API`.

Fallback:

- If API fails, show `1M+ props analyzed and graded`.
- Hide or soften exact W-L-P values if live data is unavailable.

Future improvement:

- Add a purpose-built `/api/public/marketing-record` endpoint only if we need a curated subset. For now, the existing endpoint supports the user's preferred "over 1 million analyzed and graded" positioning.

## SEO Plan

Preserve existing indexed URLs. Do not remove URLs unless there is a deliberate redirect strategy.

Requirements:

- Keep canonical trailing slash URLs.
- Preserve sitemap coverage.
- Update titles/descriptions around "prop research on desktop and mobile."
- Add structured data for Product, SoftwareApplication, FAQPage, BreadcrumbList where relevant.
- Avoid hardcoded static performance claims in metadata that can drift from live data.
- For pages where meta descriptions need a claim, use stable phrasing like "1M+ props analyzed and graded" if we are comfortable with that threshold remaining true.

High-priority SEO pages to preserve:

- `/`
- `/results/`
- `/track-record/`
- `/how-it-works/`
- `/picks/`
- `/picks/nba/`
- `/picks/mlb/`
- `/nba/`
- `/mlb/`
- `/prizepicks/`
- `/pick6/`
- `/underdog/`
- `/tools/`
- `/guides/`
- `/compare/`

## Compliance and Claim Rules

Required footer language:

`Propeller is a research and analysis tool. We do not accept wagers or operate as a sportsbook. All analysis is for informational purposes only and does not constitute gambling advice. Must be 21+. If gambling is a problem, call 1-800-GAMBLER.`

Use:

- analyzed and graded
- current verified record
- model win rate
- confidence
- edge
- lean over/under
- past performance does not guarantee future results

Avoid:

- guaranteed
- sure thing
- easy money
- lock
- risk-free
- guaranteed profit

When using "winning" in hero copy, keep proof and disclaimers nearby.

## Implementation Phases

### Phase 0: Repo Cleanup and Baseline

Goal: avoid working in the conflicted `master` worktree.

Tasks:

- Continue in `/Users/scottolmer/Projects/propedge-site-founder500`.
- Confirm whether current draft PR branch should remain the active redesign branch or whether to create `codex/marketing-site-redesign`.
- Inventory all generated pages and scripts that may overwrite site files.
- Capture baseline screenshots of key pages.
- Save current live HTML if needed for rollback.

Deliverable:

- Clean branch ready for redesign work.

### Phase 1: Design System Foundation

Goal: make the static site maintainable.

Tasks:

- Add shared CSS token/component files.
- Add shared JS helpers for live record and small interactions.
- Build reusable nav/footer snippets or establish a repeatable copy pattern if staying fully static.
- Move homepage concept assets into production asset paths.
- Normalize CTA links to `https://app.propellerpicks.com/signup`.
- Normalize login links to `https://app.propellerpicks.com/login`.

Deliverable:

- One production-ready shared shell used by the homepage first.

### Phase 2: Homepage Redesign

Goal: ship the new front door.

Tasks:

- Implement revised Concept A as `/index.html`.
- Use real web app and mobile screenshots.
- Wire live record card to `/api/public/results-summary`.
- Add fallback state.
- Add Founder 500 section.
- Add product workflow and feature bands.
- Add FAQ.
- Add structured data.
- Verify desktop, tablet, and mobile.

Deliverable:

- New homepage ready for PR review.

### Phase 3: Proof Pages

Goal: make the claims auditable.

Tasks:

- Redesign `/results/` around live verified ledger.
- Redesign `/track-record/` around narrative proof and methodology.
- Use the same live data source.
- Ensure filters and tables still work.
- Remove stale static claims that conflict with live totals.

Deliverable:

- Proof layer that supports the homepage claim.

### Phase 4: Product Explanation Pages

Goal: explain why Propeller is different.

Tasks:

- Redesign `/how-it-works/`.
- Update `/about/` to match the current business/product story.
- Add or revise methodology/data-source pages only if they support trust and SEO.

Deliverable:

- Clear methodology story tied to real product screens.

### Phase 5: Acquisition Pages

Goal: preserve and improve SEO funnels.

Tasks:

- Redesign `/picks/` hub.
- Update sport landing pages.
- Update platform pages.
- Update compare and guides hub pages.
- Keep generated daily pages compatible with existing scripts.

Deliverable:

- Unified SEO funnel with consistent CTAs and design.

### Phase 6: Tools and Analyzer

Goal: make utility pages feel like part of the product.

Tasks:

- Redesign `/tools/`.
- Update payout calculators visually without breaking calculations.
- Update `/analyzer/` loading/error/product preview states.

Deliverable:

- Utility pages that look current and convert to the app.

### Phase 7: QA, PR, and Launch

Goal: ship without breaking SEO or compliance.

Tasks:

- Run static link checks.
- Validate canonical tags.
- Validate JSON-LD.
- Check all pages at desktop and mobile widths.
- Verify live record API hydration and fallback.
- Verify no overlapping text.
- Verify no unsupported/static win-rate claims remain.
- Update sitemap lastmod dates where appropriate.
- Create PR, review, merge to `master`.
- GitHub Pages deploys automatically.
- Wait for CDN cache and verify production.

Deliverable:

- Full redesigned marketing site live on `propellerpicks.com`.

## Verification Checklist

For each redesigned page:

- Page loads locally.
- No console errors.
- Mobile width screenshot reviewed.
- Desktop screenshot reviewed.
- Header nav links work.
- Footer links work.
- CTA links go to web app signup/login as intended.
- Required disclaimer appears.
- Meta title and description are accurate.
- Canonical URL is correct.
- JSON-LD parses if present.
- Text does not overlap.
- Numbers use monospace.
- API data has fallback if used.

## Recommended Build Order

1. Homepage.
2. Results.
3. Track Record.
4. How It Works.
5. Picks hub.
6. Sport pages.
7. Platform pages.
8. Tools and analyzer.
9. Compare/guides.
10. About/legal/footer cleanup.

This order puts the most important conversion and proof surfaces first, then follows with SEO coverage.

## Open Decisions

1. Should the full redesign stay on `codex/founder-500-marketing`, or should we branch a new `codex/marketing-site-redesign` from it?
2. Should the homepage record use `overall` from `/api/public/results-summary` permanently, or should we later add `/api/public/marketing-record` for a curated definition?
3. Should App Store links remain secondary while TestFlight/App Store approval is pending, or should they be hidden until the free build is approved?
4. Should the public site say "mobile companion app" or "mobile app" now that Android is planned?
5. Which mobile screenshot should be primary in the homepage hero: Props Board, Daily Digest, Prop Detail, or Tracker?

## Recommendation

Proceed with the redesign in the existing Founder 500 worktree and keep the first implementation tightly scoped to the homepage plus shared design system. The homepage is where the new story has the most leverage, and it will establish the visual language for the rest of the site.

Once the homepage is approved, redesign `/results/` and `/track-record/` next so the "1M+ props analyzed and graded" claim has a credible proof path immediately behind it.
