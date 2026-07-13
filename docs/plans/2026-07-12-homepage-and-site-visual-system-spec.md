# Homepage Mockup Conversion and Site-Wide Visual System Spec

Status: Reviewed draft — ready for implementation approval
Date: 2026-07-12
Repository: `/Users/scottolmer/Projects/propedge-site`
Implementation target: `propellerpicks.com` static site on GitHub Pages
Reference homepage: `mockups/home-ai-winning-v2.html`

## Decision Summary

The implementation will:

1. Replace the current production homepage with the approved AI-forward mockup.
2. Apply the mockup's visual language to all 2,934 public production HTML pages.
3. Preserve the existing `<main>` content of every non-homepage page.
4. Standardize navigation and footer markup across every production page.
5. Standardize fonts, colors, backgrounds, focus states, buttons, cards, forms, tables, and FAQ presentation through shared CSS.
6. Replace all inline and inconsistent browser-tab icons with one canonical Propeller favicon set.
7. Update both this repository and the upstream generators that create blog and analyzer pages so regenerated pages do not revert.
8. Build the migration in page-family stages, then release it through one final production gate.
9. Preserve and refresh the existing machine-readable AEO assets, crawler policy, entity graph, analytics, and social-preview metadata without treating any of them as guaranteed ranking levers.

No GitHub issue, implementation, deployment, or agent execution is authorized by this spec alone.

## Context

The approved homepage mockup presents Propeller as an AI-powered research product using the line `Stop Guessing. Start Winning.`, real web-app screenshots, a real mobile prop-detail screenshot, a live public record, and an editorial utility aesthetic.

The production site is visually fragmented. The homepage, core proof pages, calculators, manually authored SEO pages, blog pages, and generated analyzer pages use competing token sets, fonts, backgrounds, navigation variants, and favicon designs. A visitor can move between two correct Propeller pages and feel as if they changed products.

This work turns the approved homepage into the site's visual source of truth while protecting existing search content, URLs, structured data, tools, and generated-page pipelines.

## Goals

1. Ship the approved homepage design at `/` with production metadata, analytics, accessibility, live data, and fallbacks intact.
2. Make every production page recognizably part of the same Propeller site.
3. Keep non-homepage page content and functionality unchanged.
4. Prevent future generated pages from reintroducing Inter, dark backgrounds, diamond favicons, or legacy navigation.
5. Preserve canonical URLs, structured data, sitemap coverage, and current indexed content.
6. Make the three-blade Propeller mark the browser-tab icon everywhere.
7. Retain useful existing FAQ content and establish a people-first FAQ policy for future AEO work.

## Non-Goals

- Rewriting the body copy of non-homepage pages.
- Changing calculator formulas, analyzer API behavior, results filters, or live-record API contracts.
- Changing canonical URLs, redirecting pages, or removing indexed pages.
- Adding the same FAQ block to every page.
- Rewriting non-homepage copy into artificial answer-engine fragments.
- Adding new performance claims that are not supplied by the live record or approved marketing-claims source.
- Redesigning the authenticated web app or mobile app.
- Changing the sitemap inclusion policy for generated player pages.
- Deploying partial page families before the full release gate passes.
- Implementing experimental protocols such as OKF before they have a verified product need or measurement plan.

## Verified Current State

Verified on 2026-07-12.

### Page Inventory

| Page family | Production HTML files | Current source pattern | Migration requirement |
| --- | ---: | --- | --- |
| Analyzer | 2,690 | Generated player pages plus analyzer hub | Shared shell, visual compatibility layer, generator changes |
| Blog | 193 | Daily, weekly, and monthly generators | Shared shell, visual compatibility layer, generator changes |
| Help | 12 | `scripts/generate_help_pages.py` | Shared shell and preserve current Q&A content |
| Picks | 9 | Hub plus sport/platform pages | Shared shell and page-family visual verification |
| Guides | 6 | Manually authored long-form pages | Shared shell and existing FAQ styling |
| Tools | 4 | Hub plus three payout calculators | Shared shell without changing calculations |
| Compare | 4 | Hub plus comparison pages | Shared shell and existing comparison content |
| Docs | 0 public (3 internal) | `docs/seo/mockups/` | Excluded from migration because the directory is blocked in `robots.txt` |
| Single-route sections | 15 | About, legal, sport/platform, results, method, track record, mobile return | Shared shell and page-family verification |
| Homepage | 1 | `index.html` | Replace with approved mockup implementation |
| **Total** | **2,934 public** | Excludes every `mockups/` directory and `analytics-dashboard/` | Full public production coverage |

The curated sitemap contains 220 URLs. The visual migration covers all production HTML, not only sitemap URLs, because users and crawlers can still reach generated pages outside the sitemap.

### Styling Fragmentation

- Eight CSS files currently compete for homepage, proof-page, tool, navigation, and override responsibilities under `assets/css/`.
- Only 42 production pages load `assets/css/site-white-overrides.css`.
- Most generated pages embed large inline style blocks rather than consuming a shared design system.
- The current homepage uses Archivo, IBM Plex Sans, and IBM Plex Mono.
- Most generated pages use Inter and JetBrains Mono.
- The approved mockup uses Familjen Grotesk, IBM Plex Sans, and IBM Plex Mono.
- `assets/css/site-white-overrides.css:1-69` currently forces the older blue-gray gradient surface and `#ff6b4a` accent.
- `mockups/home-ai-winning-v2.html:13-32` defines the approved paper, ink, orange, success, danger, and typography tokens.

### Favicon Fragmentation

- The pre-migration repository scan covered 2,937 candidate pages, including three internal `docs/seo/mockups/` files; 2,919 declared a favicon.
- 2,284 pages use an orange diamond icon.
- 632 pages use a three-blade Propeller data-URI icon.
- Five pages use the newer three-blade mark on a dark rounded square.
- Eighteen pages do not declare a favicon.
- The blog and analyzer generators in `nfl-betting-system/scripts/social/` still emit the diamond icon.

### FAQ Coverage

- Thirty-three production pages currently have both visible FAQ content and `FAQPage` structured data.
- Coverage is concentrated in help, picks, guides, tools, comparisons, results, the analyzer hub, and the homepage.
- The approved mockup currently omits the production homepage's three useful FAQ answers.

### SEO, Analytics, and Agent-Readable Assets

- The production homepage currently has one H1, a canonical URL, complete Open Graph and Twitter fields, four JSON-LD blocks, and `index, follow, max-image-preview:large` robots metadata.
- The current title is longer than the SEO review target of 60 characters and must be rewritten for the new homepage without changing non-homepage titles.
- The current social image is declared at 3000x1000, an extreme aspect ratio that is not the desired 1.91:1 social-card format.
- The homepage and generated HTML currently reference `G-NLXM4C2G7D`, while older project guidance names a different GA4 measurement ID. The migration must verify the authoritative production ID before changing analytics tags.
- `robots.txt` already allows GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Bingbot, and the general crawler group. This access policy must not regress silently.
- `llms.txt`, `pricing.md`, `data/index.json`, `docs/seo/aeo-target-questions.json`, and `docs/seo/aeo-citation-tracker.md` already exist and are the machine-readable/AEO baseline. The redesign must refresh their dates and links where necessary instead of creating duplicate manifests. The target-question roadmap remains an internal planning asset.
- `docs/seo/aeo-target-questions.json` currently contains 12 target questions and a five-platform, three-run measurement workflow.

## What Is Already Working and Must Not Change

- Existing non-homepage headings, paragraphs, tables, calculators, forms, filters, results, and API-powered content.
- Existing trailing-slash canonical URL convention.
- Existing GA4 measurement and page-specific metadata.
- Existing live-record hydration in `assets/js/live-record.js` and its failure handling.
- Existing mobile navigation behavior in `assets/js/mobile-nav.js`, including Escape, outside-click, link-click, and resize closing.
- Existing FAQ question and answer text on the 33 pages that already contain FAQs.
- Existing compliance language and responsible-gaming links.
- Existing page-specific structured data that accurately represents visible content.

## Approved Visual Source of Truth

### Canonical Color Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#f2efe8` | Primary page background |
| `--paper-light` | `#faf8f3` | Elevated light sections and cards |
| `--ink` | `#101311` | Primary dark surfaces and buttons |
| `--ink-2` | `#191d1a` | Secondary dark surface |
| `--text` | `#141815` | Primary text |
| `--sub` | `#59615b` | Secondary text |
| `--muted` | `#878e88` | Tertiary text and metadata |
| `--line` | `rgba(16, 19, 17, .15)` | Light-surface borders |
| `--line-dark` | `rgba(255, 255, 255, .14)` | Dark-surface borders |
| `--orange` | `#ff6038` | Brand and primary accent |
| `--orange-dark` | `#dd3d16` | Accessible accent text on light surfaces |
| `--orange-wash` | `#ffe1d6` | Accent background and offset shadows |
| `--lime` | `#c8f56a` | Focus and dark-surface data highlight |
| `--green` | `#35cf73` | Positive status and success |
| `--red` | `#ff6f61` | Loss, danger, and negative status only |

Legacy variable names such as `--bg`, `--page`, `--surface`, `--text-1`, `--brand`, `--success`, and `--loss` must alias these canonical tokens. Page-family CSS may consume aliases but may not redefine canonical values.

### Canonical Typography

| Role | Font | Weights | Rule |
| --- | --- | --- | --- |
| Display | Familjen Grotesk | 500, 600, 700 | H1-H3, brand, major calls to action |
| Body | IBM Plex Sans | 400, 500, 600 | Paragraphs, labels, navigation, forms |
| Data | IBM Plex Mono | 500, 600 | Every comparable number, odds, lines, percentages, dates, scores, and tabular metric |

Self-host Latin-subset WOFF2 files for these three families under `assets/fonts/` and declare them once in `site-system.css` with `font-display: swap`. Preload only the homepage's above-the-fold display and body faces. Inter, Archivo, JetBrains Mono, remote Google Fonts requests, and duplicated page-level font declarations must be removed from production templates after visual verification. System fallbacks must keep the page readable when font files fail without causing a material layout shift.

### Canonical Background

The default light page background is the mockup's 32px paper grid:

- `--paper` base.
- One-pixel horizontal and vertical grid lines using `rgba(16, 19, 17, .035)`.
- Dark editorial bands use `--ink` without gradients or decorative blue orbs.
- Page-specific illustrations may remain, but global blue radial gradients and legacy grain layers must not compete with the shared background.

### Visual Language Contract

The design direction is an editorial-industrial research desk: warm paper, hard ink, functional data typography, real product surfaces, restrained orange, and deliberate dark analysis bands. Consistency means shared rules, not flattening every page into the same layout.

Canonical layout rules:

| System | Approved values |
| --- | --- |
| Container | `1220px` maximum, `24px` desktop gutters, `16px` mobile gutters |
| Spacing scale | `4, 8, 12, 16, 24, 32, 48, 64, 80, 112px` |
| Corner radii | `3px` controls/cards, `8px` only for dense utility needs, pill radius only for true statuses/tags |
| Offset shadow | Hard orange or ink offset for primary cards and CTAs |
| Soft shadow | Product screenshots and floating device frames only |
| Breakpoints | `570px`, `820px`, `860px` navigation collapse, `1080px`, `1220px` content cap |
| Motion | `180ms` interaction, `650-700ms` entrance, one shared easing curve |

Component-state requirements:

- Buttons, text links, navigation, inputs, select controls, accordions, cards, and tabs must define default, hover, focus-visible, active, disabled, loading, error, and success states where applicable.
- Status may not rely on green/red color alone. Pair color with text, icon, or shape.
- Focus uses the shared lime treatment and remains visible over both paper and ink surfaces.
- Motion must clarify hierarchy or state, not decorate every component. `prefers-reduced-motion` reduces all nonessential motion to an immediate state change.
- At 200% browser zoom, content and controls must remain usable without horizontal page scrolling at a 1280px viewport.
- Dark analysis bands are intentional punctuation. They must not become the default background for all pages.
- Canonical CSS variables should use a `--pp-*` namespace, with short legacy aliases mapped to them. This prevents page-specific token collisions across thousands of generated files.
- `site-system.css` may not use `!important`. Any temporary `!important` compatibility rule must live in `site-compat.css`, include a comment naming the legacy family, and have a removal condition.

Create a noindex internal component fixture at `mockups/site-system-preview.html` showing every token, text style, component, state, responsive breakpoint, dark/light surface combination, and reduced-motion state. Visual approval of this fixture is required before bulk page migration.

## Proposed Architecture

### Shared Assets

Create these source-of-truth files:

| File | Responsibility |
| --- | --- |
| `assets/css/site-system.css` | Canonical tokens, font assignments, grid background, focus states, navigation, footer, buttons, forms, cards, tables, FAQ presentation, responsive rules |
| `assets/css/site-compat.css` | Scoped aliases and compatibility overrides for legacy inline/page-family CSS |
| `assets/css/home-ai.css` | Homepage-only layout copied and cleaned from the approved mockup |
| `assets/fonts/*.woff2` | Self-hosted, Latin-subset Familjen Grotesk, IBM Plex Sans, and IBM Plex Mono files |
| `assets/js/mobile-nav.js` | One navigation behavior implementation used by every page |
| `assets/js/live-record.js` | Existing live-record behavior, changed only if the new homepage needs selectors or safer fallbacks |
| `favicon.svg` | Canonical orange three-blade mark on a dark rounded square |
| `favicon.ico` | Browser fallback generated from the same source |
| `favicon-32x32.png` | PNG fallback generated from the same source |
| `apple-touch-icon.png` | 180x180 touch icon generated from the same source |
| `images/og-home-ai-1200x630.png` | Dedicated homepage social preview using the new design at the standard 1.91:1 ratio |
| `mockups/site-system-preview.html` | Noindex internal fixture for visual tokens, components, states, and breakpoints |

Every production page must load shared assets in this order:

1. Preload only the page's critical self-hosted WOFF2 fonts, if any.
2. `site-system.css`.
3. Existing page-family CSS required for layout and function after its token/global rules are removed.
4. `site-compat.css` for legacy page families only, loaded last while migration is incomplete.
5. A page-specific stylesheet only when its layout cannot be represented by the shared system.

The homepage loads `site-system.css` followed by `home-ai.css` and does not load `site-compat.css`.

### Shared Shell

Standardize these elements across every production page:

- Top navigation markup, labels, order, URLs, hamburger control, ARIA attributes, and CTA.
- Footer link groups, legal links, and required disclaimer.
- Focus-visible treatment.
- Canonical font and favicon links in `<head>`.

The production navigation contract is exactly:

1. Picks
2. Results
3. Track Record
4. Method
5. Guides
6. Tools
7. Analyzer
8. Web App
9. Get Free Lifetime Access

All marketing links use canonical trailing-slash `https://propellerpicks.com/` URLs. Web App and signup use `https://app.propellerpicks.com/app` and `https://app.propellerpicks.com/signup`. Navigation remains real anchor markup without JavaScript-dependent routing.

Use stable source markers so shell updates are idempotent:

```html
<!-- SITE_NAV_START -->
...
<!-- SITE_NAV_END -->

<!-- SITE_FOOTER_START -->
...
<!-- SITE_FOOTER_END -->
```

Create `scripts/apply_site_shell.py` to update these blocks and head assets across the migration manifest. Running the script twice must produce no second diff.

### Content Preservation Guardrail

For every non-homepage file:

1. Capture the exact substring from the first `<main` opening tag through the matching final `</main>` before migration.
2. Hash it with SHA-256.
3. Apply head, navigation, footer, body-class, and stylesheet changes.
4. Re-hash `<main>`.
5. Fail the migration if any hash changes, except files explicitly listed in an approved exception manifest.

The approved exception list is initially:

- `index.html`, because the homepage is intentionally replaced.
- No other file.

Existing FAQ content is inside `<main>` and therefore remains protected.

## Homepage Conversion Requirements

1. Use `mockups/home-ai-winning-v2.html` as the visual and content reference.
2. Preserve the approved headline `Stop Guessing. Start Winning.`.
3. Use `images/web-app-dashboard-live.png` in the hero.
4. Use `images/web-app-andrew-abbott-prop-detail.png` and `images/app-prop-detail-white-simulator.png` in the cross-device product section.
5. Preserve the live public-record behavior from the production homepage.
6. Do not ship exact hardcoded record totals or win rates as production truth. Exact values must hydrate from the live API. The non-hydrated fallback must be qualitative or use an approved stable threshold.
7. Preserve production indexing. Do not copy the mockup's `noindex, nofollow` tag.
8. Preserve or update the canonical URL, Open Graph tags, Twitter tags, GA4, and applicable JSON-LD.
9. Keep the full required responsible-gaming disclaimer in the footer.
10. Keep the current homepage's three useful FAQ answers near the bottom of `<main>`, styled to the new system and represented by matching `FAQPage` JSON-LD.
11. Load the hero screenshot eagerly with explicit dimensions. Lazy-load screenshots below the first viewport.
12. Serve WebP or AVIF alternatives where they reduce bytes without visibly degrading UI text.
13. Use a unique title under 60 characters that contains the primary phrase `AI player prop research`; target `Propeller Picks | AI Player Prop Research` unless search review supports a better variant.
14. Use a unique meta description under 160 characters that defines the product, includes the web/mobile benefit, and ends with a clear action without an unsupported performance claim.
15. Create a 1200x630 homepage social image and declare its URL, width, height, and MIME type in Open Graph; mirror the same asset in Twitter Card tags.
16. Give every screenshot a standard `<img src>` fallback, explicit width/height, descriptive filename, concise alt text, and nearby visible context. Use `<picture>`/`srcset` for responsive AVIF or WebP variants rather than CSS background images.
17. Consolidate homepage structured data into one `@graph` with stable IDs for `Organization`, `WebSite`, `WebPage`, `SoftwareApplication`, `Dataset`, and `FAQPage`. Reuse `https://propellerpicks.com/#organization` rather than creating duplicate organizations.
18. The structured-data graph must match visible claims, current offer terms, canonical URLs, image assets, and live dataset sources. `dateModified` must reflect a real content/data update, not every CSS deploy.
19. The first visible paragraph must define Propeller Picks and its user benefit in language that works without surrounding marketing copy. Do not write a separate AI-only version.
20. Show a visible last-updated label and source/methodology links adjacent to the live record so performance claims are independently inspectable.
21. Verify the authoritative GA4 measurement ID before editing analytics. Record the decision in the implementation PR and use one ID consistently across the site and generator templates.

## FAQ and AEO Policy

### Recommendation

Use FAQs when they answer real questions specific to the page. Place them near the bottom of `<main>`, normally before the final conversion CTA and footer. Do not treat location or `FAQPage` schema as an independent ranking lever.

### Base Migration Scope

- Retain the homepage's existing three FAQs when implementing the mockup.
- Retain and restyle the existing FAQs on all 33 current FAQ pages.
- Do not add new FAQ copy to the remaining 2,904 pages during the visual migration because the user's content-preservation requirement applies.
- Do not add duplicate FAQ blocks to help pages that are already single-question answer pages.
- Do not generate identical FAQ answers across 2,690 player pages.

### Follow-Up AEO Content Workstream

After the visual migration ships, run a separate content review using `docs/seo/aeo-target-questions.json`, Search Console queries, and `docs/seo/aeo-citation-tracker.md`.

Prioritize unique FAQs on:

1. Homepage and product explanation pages.
2. Results and methodology pages.
3. Tools and calculator pages.
4. Platform and comparison pages.
5. Sport and strategy guide hubs.
6. Picks hubs where questions change by sport or platform.

FAQ requirements:

- Three to six questions per eligible page.
- Questions must come from actual search, support, product, or comparison intent.
- Lead each answer with a direct 40-60 word response before optional detail.
- Answers must be self-contained, accurate, dated where freshness matters, and free of unsupported performance claims.
- Visible FAQ copy and JSON-LD must match exactly.
- Use `FAQPage`, not `QAPage`, for publisher-authored FAQs.
- Accordions must remain in the DOM, keyboard accessible, and usable without JavaScript.
- Pages without meaningful questions should not receive an FAQ merely to satisfy a template.

### Entity, Crawler, and Machine-Readable Requirements

- Use `Propeller Picks` as the canonical entity name in metadata, schema, machine-readable files, and page copy. `Propeller` is an acceptable short navigation label; `PropEdge` is not a current brand synonym.
- Keep one stable Organization `@id`, canonical logo URL, canonical site URL, and `sameAs` set across page schemas.
- Preserve the current explicit `robots.txt` crawler policy unless the owner makes a separate training-versus-citation decision. Add an automated assertion that no deploy accidentally blocks Googlebot, Bingbot, ChatGPT-User, PerplexityBot, or ClaudeBot.
- Treat Google-Extended separately from Google Search crawling. Its policy must not be described as a Google AI Overview ranking control.
- Refresh `llms.txt` and `pricing.md` verification dates, canonical links, product description, public API links, legal language, and current access offer after the homepage content is finalized.
- Validate every URL listed by `llms.txt`, `pricing.md`, and `data/index.json`. Do not create duplicate AI manifests or claim that `llms.txt` is a Google ranking requirement.
- Keep important product definitions, offer details, methodology, record source, and legal limitations in visible static HTML. Machine-readable files supplement the site and do not replace user-visible content.
- Keep OKF and similar experimental agent protocols out of the launch scope. Reconsider only after a supported use case and measurable retrieval gap exist.

### AEO Measurement Baseline

Before launch, run the current 12 questions in `docs/seo/aeo-target-questions.json` three times each across ChatGPT search, Perplexity, Google AI Overviews, Gemini, and Copilot. This produces 180 baseline observations.

Record:

- Propeller mention rate.
- Propeller citation rate.
- Which Propeller URL was cited.
- Competitors mentioned and cited.
- Source domains used.
- Answer accuracy and sentiment.
- Standard Search Console impressions, clicks, CTR, and average position for owned target URLs.
- GA4 referral sessions from major AI-search domains where referrer data is available.

Repeat the same 180-observation set at 30, 60, and 90 days. Do not add or remove prompts mid-comparison; put newly discovered prompts into the next measurement cohort.

[Google's current AI-search guidance](https://developers.google.com/search/docs/appearance/ai-features) says AI Overviews and AI Mode require no special AI markup, and [Google's FAQ rich-result policy](https://developers.google.com/search/blog/2023/08/howto-faq-changes) generally limits FAQ rich results to authoritative government and health sites. The reason to use useful FAQs is human clarity and extractable answers across search and answer engines, not a promised Google rich result.

## Favicon Requirements

The browser-tab logo source of truth is the orange three-blade Propeller mark centered on a dark rounded-square background.

Every production page must include:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="/favicon.ico">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#f2efe8">
```

Remove all inline favicon data URIs from production files and source generators. Root-level `/favicon.ico` remains available for clients that request it without reading HTML.

## Page-Family Execution Plan

### Phase 0: Baseline and Migration Manifest

- Record the 2,934-file public production manifest and the three internal `docs/seo/mockups/` exclusions.
- Capture before screenshots at 1440x900, 834x1112, and 390x844 for representative pages.
- Capture `<main>` hashes for every non-homepage page.
- Record baseline Lighthouse, Core Web Vitals, metadata, canonical, indexability, structured-data, sitemap, robots, analytics, and link-check results for representative pages.
- Verify the authoritative GA4 measurement ID from the deployed site and analytics property; record it as a single migration constant before editing any page.
- Archive the pre-launch AEO benchmark: 12 target questions, three independent runs, and five answer platforms, for 180 timestamped observations.
- Build `mockups/site-system-preview.html` as the visual component fixture and mark it `noindex`.
- Confirm the work runs on a clean branch or isolated worktree without including unrelated current edits.

### Phase 1: Design System and Brand Assets

- Add canonical CSS files, licensed self-hosted font files, social-preview art, and favicon assets.
- Build the shared navigation and footer shell.
- Build the idempotent shell/head migration script.
- Define one stable structured-data entity graph with reusable `@id` values for the Organization, WebSite, WebPage, SoftwareApplication, Dataset, and FAQPage entities used on the homepage.
- Approve the component fixture at desktop, tablet, mobile, dark-band, focus, hover, error, loading, and reduced-motion states before bulk migration.
- Add automated consistency checks before touching page families.

### Phase 2: Homepage

- Convert `index.html` to the approved mockup.
- Externalize inline CSS to `home-ai.css`.
- Restore production metadata, tracking, live data, disclaimer, and FAQs.
- Validate the revised title, meta description, canonical, robots directive, Open Graph/Twitter card, entity graph, one-H1 hierarchy, and schema-visible-content parity.
- Optimize and verify the three product screenshots.

### Phase 3: Manually Authored Core Pages

- Migrate the 54 non-blog, non-player production pages.
- Preserve `<main>` hashes.
- Update page-family CSS to consume shared tokens instead of redefining global colors and fonts.
- Verify calculators, analyzer hub, results, and navigation interactions.

### Phase 4: Blog Pages and Generators

- Migrate all 193 current blog pages.
- Update these upstream generators in `/Users/scottolmer/Projects/nfl-betting-system/scripts/social/`:
  - `daily_blog_generator.py`
  - `weekly_blog_generator.py`
  - `monthly_blog_generator.py`
- Remove diamond favicons and old font requests from generated output.
- Generate one fixture from each generator and verify it consumes the shared system.

### Phase 5: Analyzer Player Pages and Generators

- Migrate all 2,690 player pages.
- Update these upstream generators:
  - `player_pages_generator.py`
  - `player_pages_permanent.py`
- Keep player data, metadata, canonical tags, JSON-LD, and index/noindex decisions unchanged.
- Generate representative fixtures for every sport and compare them against existing content hashes.

### Phase 6: Full-Site QA and Release Gate

- Run consistency, content-hash, link, metadata, indexability, structured-data, crawler-policy, analytics, accessibility, performance, and visual checks.
- Review every page family in current Chrome, Safari, and Firefox at desktop, tablet, mobile, and 200% zoom.
- Verify lab and field Core Web Vitals targets: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 at the 75th percentile where field data is available.
- Confirm the sitemap retains its intended 220-URL inventory and that CSS-only changes do not receive artificial `lastmod` updates.
- Fix generator drift before regenerating or committing bulk page output.
- Merge and deploy only after every acceptance criterion passes.
- Verify production after GitHub Pages and CDN propagation.

### Phase 7: Separate AEO FAQ Expansion

- Use the existing AEO tracker and target-question dataset to choose pages.
- Draft page-specific FAQ copy for review.
- Add FAQs and matching schema only after content approval.
- Refresh `llms.txt`, `pricing.md`, `data/index.json`, and the AEO tracker only when facts, dates, or URLs have changed.
- Repeat the same 180-observation benchmark at 30, 60, and 90 days and compare citation, mention, linked-URL, competitor, source-domain, answer-accuracy, Search Console, and GA4 referral changes.

## Dependency Graph

```text
Phase 0 baseline
      |
      v
Phase 1 shared system + favicon + migration tooling
      |
      +--------> Phase 2 homepage
      |
      +--------> Phase 3 authored/core pages
                       |
                       +--------> Phase 4 blog generators + pages
                       |
                       +--------> Phase 5 analyzer generators + pages
                                            |
                                            v
                                  Phase 6 final release gate
                                            |
                                            v
                                  Phase 7 FAQ content follow-up
```

The shared system and migration checks come first because every later phase depends on stable tokens, shell markup, favicon assets, and content-preservation enforcement. Generator changes must precede or accompany bulk generated-page migration so future jobs cannot undo the work.

## File Reference

| File | Planned change |
| --- | --- |
| `mockups/home-ai-winning-v2.html` | Approved homepage reference; no longer copied directly into production |
| `index.html` | Implement approved homepage with production metadata and behavior |
| `assets/css/site-system.css` | New visual source of truth |
| `assets/css/site-compat.css` | New legacy-page compatibility layer |
| `assets/css/home-ai.css` | New homepage-only layout |
| `assets/fonts/*.woff2` | New licensed, self-hosted Latin WOFF2 files for the canonical families and weights |
| `assets/css/site-white-overrides.css` | Retire after parity is established |
| `assets/css/legacy-seo-nav.css` | Retire after every page uses the shared shell |
| `assets/css/home-white-redesign.css` | Replace homepage dependency; retain temporarily only where required during branch work |
| `assets/css/home-redesign.css` | Remove global token ownership; retain page layouts only until consolidated |
| `assets/css/results-redesign.css` | Consume shared tokens; keep results-specific layout |
| `assets/css/track-record-redesign.css` | Consume shared tokens; keep track-record layout |
| `assets/css/method-redesign.css` | Consume shared tokens; keep method layout |
| `assets/css/tools-redesign.css` | Consume shared tokens; keep calculator and tools layout |
| `assets/js/mobile-nav.js` | One shared navigation implementation |
| `assets/js/live-record.js` | Preserve live data and adapt selectors only as required |
| `images/og-home-ai-1200x630.png` | New canonical homepage Open Graph and Twitter image |
| `mockups/site-system-preview.html` | New noindex component/state fixture for visual approval and regression testing |
| `favicon.svg` | New canonical browser icon |
| `favicon.ico` | New compatibility icon |
| `favicon-32x32.png` | New PNG browser icon |
| `apple-touch-icon.png` | New touch icon |
| `scripts/apply_site_shell.py` | New idempotent head/nav/footer migration tool |
| `scripts/check_site_consistency.py` | New static consistency and forbidden-pattern checker |
| `scripts/verify_main_content.py` | New before/after `<main>` hash verifier |
| `scripts/generate_help_pages.py` | Emit shared shell, fonts, styles, and favicon references |
| `robots.txt` | Preserve the verified search and AI-crawler access policy; fail QA on accidental changes |
| `sitemap.xml` | Preserve intended 220-URL coverage and update `lastmod` only for meaningful page changes |
| `llms.txt` | Refresh verified facts, dates, and canonical links without creating a duplicate manifest |
| `pricing.md` | Keep the machine-readable offer description aligned with visible pricing facts |
| `data/index.json` | Keep the machine-readable data directory and public endpoints valid |
| `docs/seo/aeo-target-questions.json` | Preserve the internal 12-question benchmark set and measurement configuration |
| `docs/seo/aeo-citation-tracker.md` | Archive pre-launch and 30/60/90-day answer-engine observations |
| `nfl-betting-system/scripts/social/daily_blog_generator.py` | Emit shared shell and canonical brand assets |
| `nfl-betting-system/scripts/social/weekly_blog_generator.py` | Emit shared shell and canonical brand assets |
| `nfl-betting-system/scripts/social/monthly_blog_generator.py` | Emit shared shell and canonical brand assets |
| `nfl-betting-system/scripts/social/player_pages_generator.py` | Emit shared shell and canonical brand assets |
| `nfl-betting-system/scripts/social/player_pages_permanent.py` | Emit shared shell and canonical brand assets |

## Acceptance Criteria

1. `/` visually matches the approved mockup at 1440x900, 834x1112, and 390x844, subject only to production metadata, FAQ, disclaimer, and live-data requirements.
2. The homepage contains the approved headline, real web-app hero screenshot, matching Andrew Abbott desktop/mobile detail screenshots, public record, and AI-method sections.
3. The homepage remains indexable and has one canonical URL pointing to `https://propellerpicks.com/`.
4. Exact record values on the homepage come from the live API; API failure does not display stale exact totals or win rates.
5. All 2,934 public production HTML files load `site-system.css`.
6. Only approved legacy families load `site-compat.css`; the homepage does not.
7. All production pages use the approved Familjen Grotesk, IBM Plex Sans, and IBM Plex Mono self-hosted WOFF2 files with `font-display: swap`; only above-the-fold critical files are preloaded.
8. No production page or generator references Inter, Archivo, JetBrains Mono, Google Fonts, or an unapproved font request.
9. Every comparable numeric value uses IBM Plex Mono or inherits the canonical monospace token.
10. Every production page renders the paper-grid background or an approved `--ink` editorial band based on the shared tokens.
11. Every production page uses the same navigation labels, order, destinations, mobile behavior, and CTA.
12. Every production page uses the same footer link structure and required disclaimer.
13. All non-homepage `<main>` hashes match their pre-migration values, with zero unapproved exceptions.
14. Calculator inputs and results are unchanged for all existing calculator regression cases.
15. Analyzer hub and player pages preserve API behavior, metadata, schema, and index/noindex status.
16. Blog, help, and player generators emit the shared CSS, shared shell, approved self-hosted font files, and canonical favicon links.
17. Running the shell migration script twice produces no second diff.
18. All production pages reference `/favicon.svg`, `/favicon.ico`, `/favicon-32x32.png`, and `/apple-touch-icon.png`.
19. No production page or source generator contains the orange diamond favicon or inline favicon data URI.
20. The canonical favicon renders as the orange three-blade Propeller mark on a dark rounded square in Chrome and Safari.
21. The homepage preserves its current three visible FAQs and matching `FAQPage` JSON-LD.
22. All 33 current FAQ pages retain identical question and answer text and valid matching JSON-LD.
23. No duplicate FAQ block is automatically added to pages without approved page-specific questions.
24. All navigation and footer links return a successful response or an intentional redirect.
25. No tested page produces a JavaScript console error, horizontal overflow, inaccessible menu state, or broken image.
26. Keyboard users can reach and identify navigation, FAQ, form, and CTA focus using the shared lime focus treatment.
27. `prefers-reduced-motion` disables nonessential motion.
28. Homepage hero media loaded before the fold stays under 500 KB total transferred bytes on first load; below-fold screenshots are lazy-loaded.
29. Lighthouse scores on the production homepage are at least 90 Accessibility, 90 Best Practices, and 90 SEO on mobile and desktop. Performance must not regress by more than five points from the pre-migration production baseline.
30. The final production verification checks at least one URL from every page family after CDN propagation.
31. The homepage title is no longer than 60 characters, its meta description is no longer than 160 characters, and both accurately describe AI player-prop research without unsupported claims.
32. The homepage Open Graph and Twitter metadata use the canonical `https://propellerpicks.com/` URL and the new 1200x630 social image; the image resolves publicly and renders without cropping critical text or product UI.
33. The homepage has exactly one H1 and a logical heading hierarchy; important descriptive content and answers are present in server-delivered HTML rather than requiring JavaScript execution.
34. Homepage JSON-LD is valid, uses one stable `@graph` with canonical `@id` values, does not duplicate Organization entities, and matches visible claims, FAQs, pricing, links, and record data.
35. No non-homepage title, description, canonical URL, robots directive, index/noindex decision, or valid page-specific structured data changes without an explicitly reviewed exception.
36. The sitemap retains its intended 220 canonical URLs; `lastmod` changes only where page content changes meaningfully, not for shared CSS or shell-only edits.
37. `robots.txt` retains the verified access policy for Googlebot/general search plus GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, and Bingbot; any policy change requires an explicit product decision.
38. `llms.txt`, `pricing.md`, and `data/index.json` contain current facts and only canonical, successful public URLs; visible HTML remains the source of truth when machine-readable summaries differ.
39. The canonical entity name is `Propeller Picks`, with `Propeller` allowed as shorthand; production marketing and structured data contain no legacy `PropEdge` naming.
40. The authoritative GA4 measurement ID is documented and used consistently across all production HTML and generators, with one page-view initialization per page and no duplicate migration tag.
41. The pre-launch AEO benchmark contains 180 timestamped observations: 12 approved target questions times three runs times five platforms, including mentions, citations, linked URLs, competitors, source domains, and answer-accuracy notes.
42. Core Web Vitals meet the good thresholds of LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 at the 75th percentile where field data exists; lab tests show no regression where field data is unavailable.
43. Representative pages pass in current Chrome, Safari, and Firefox at desktop, tablet, mobile, keyboard-only use, reduced-motion mode, and 200% zoom without lost content or horizontal page overflow.
44. The component fixture receives explicit approval for typography, spacing, radii, shadows, paper and ink surfaces, buttons, links, cards, tables, forms, FAQs, loading/error/empty states, focus, and reduced motion before page-family migration begins.
45. New homepage and shared-shell links opened in a new tab use `rel="noopener noreferrer"`; new homepage and shared-shell images have explicit dimensions, meaningful product screenshots have descriptive alt text, and decorative images use empty alt text. Existing non-homepage `<main>` markup remains governed by the content-preservation gate.

## Testing Plan

| Layer | Coverage | Required checks |
| --- | --- | --- |
| Static | All 2,934 public HTML files | Shared CSS, fonts, favicon tags, shell markers, canonical URLs, forbidden legacy patterns |
| Content preservation | All 2,933 public non-homepage files | Before/after protected-content SHA-256 equality |
| Generator fixtures | 3 blog templates, 2 player generators across all supported sports, help generator | Shared asset output, idempotency, content equality |
| Functional | Homepage, results, analyzer, three calculators, mobile menu | Live record, filters, API loading, calculator results, menu states |
| Structured data | Homepage plus all 33 current FAQ pages and representative Article/Breadcrumb pages | Valid JSON, schema-visible-content parity, no duplicate entities |
| Metadata and indexation | Homepage plus every production page through static checks | Titles/descriptions, one H1 where expected, canonical and robots preservation, no unintended noindex, no duplicate homepage entity IDs |
| Entity consistency | All visible brand references and JSON-LD | Canonical `Propeller Picks` naming, stable Organization `@id`, no `PropEdge`, consistent URLs and sameAs links |
| Crawler and machine-readable assets | `robots.txt`, `sitemap.xml`, `llms.txt`, `pricing.md`, `data/index.json` | Expected crawler policy, 220 intended sitemap URLs, valid canonical links, visible-source parity, no accidental exposure of private paths |
| Accessibility | Representative page from every family at desktop and mobile | Landmarks, heading order, focus, contrast, menu ARIA, accordion keyboard behavior |
| Visual regression | Component fixture plus minimum 16 representative URLs at three viewports and 200% zoom | Typography, backgrounds, cards, tables, forms, nav/footer, states, no overflow |
| Browser compatibility | Representative page from every family | Current Chrome, Safari, and Firefox; touch, keyboard, menu, FAQ, forms, responsive images |
| Link integrity | All shared-shell destinations plus sitemap URLs | HTTP status and trailing-slash behavior |
| Performance | Homepage plus analyzer and calculator representatives | Lighthouse, self-hosted font loading, responsive/lazy images, transferred bytes, LCP, INP, CLS |
| Analytics | All production templates and representative live pages | One authoritative GA4 ID, no duplicate initialization, page views and existing events preserved |
| AEO baseline | 12 target questions across five platforms and three runs | 180 timestamped observations with citations, mentions, URLs, competitors, domains, and accuracy notes |
| Production canary | One URL per family after deploy | Assets resolve, correct favicon, no console errors, live data works |

## Effort Estimate

| Workstream | Human team | Codex-assisted execution |
| --- | ---: | ---: |
| Baseline, manifest, and verification tooling | 1 day | 2-3 hours |
| Shared visual system, shell, and favicon assets | 1 day | 3-4 hours |
| Homepage production conversion | 1 day | 3-4 hours |
| Core/manual page migration | 1 day | 3-5 hours plus visual review |
| Blog and analyzer generator updates | 1 day | 3-5 hours |
| SEO/AEO baseline, metadata, entity graph, and social preview | 0.5-1 day | 3-5 hours plus platform collection time |
| Full visual, functional, and production QA | 1.5-2 days | 6-10 hours with human visual approval |
| **Total** | **7-8 days** | **About 3 focused working days** |

The 2,934-public-file count makes automated migration and verification mandatory. Manual per-page editing is not an acceptable implementation path.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Shared CSS breaks a page-specific tool or table | Conversion or utility regression | Scoped compatibility classes, representative visual/functional tests, staged branch work |
| Bulk rewrite changes indexed content | SEO and trust loss | `<main>` hash gate with zero default exceptions |
| Upstream jobs regenerate legacy styles | Visual drift immediately after launch | Update generators before release and test fixtures in CI |
| Favicon remains cached | Users temporarily see old icon | New canonical asset URLs, root ICO fallback, documented cache verification |
| Mockup fallback metrics become stale claims | Compliance and trust risk | Hydrate exact values from live API and use non-exact safe fallback |
| Repeated FAQ copy creates scaled low-value content | SEO/AEO risk | Preserve current FAQs only in base migration; approve unique FAQ content separately |
| FAQ schema is treated as a guaranteed rich-result tactic | Wrong success metric | Measure human usefulness and citation coverage; document Google's limited FAQ rich-result eligibility |
| GA4 guidance and deployed measurement IDs disagree | Missing or split analytics | Verify the live property and deployed tag first; record one authoritative ID before migration |
| Font files are unlicensed, oversized, or block rendering | Legal or performance regression | Verify redistribution rights, subset to required Latin glyphs, ship WOFF2 only, preload sparingly, and keep robust system fallbacks |
| Shared visual consistency expands into content or SEO rewrites | Scope, ranking, and review risk | Enforce `<main>` hashes plus metadata/indexation diffs and require explicit exceptions |
| Entity graph duplicates or contradicts visible content | Search-engine confusion and invalid schema | Use one stable `@graph`, canonical IDs, automated duplicate checks, and visible-content parity tests |
| Answer-engine benchmarks vary between runs | False attribution to the redesign | Preserve prompt wording, run three independent samples per platform, timestamp results, and compare 30/60/90-day trends rather than single answers |
| Current dirty worktree contaminates implementation | Unrelated changes ship | Use a clean branch/worktree and stage only files in this spec |

## Cross-Discipline Review Record

### Frontend Design Review

The review added a concrete visual-language contract instead of relying on the homepage mockup alone: self-hosted typography, spacing and radius scales, breakpoint behavior, deliberate paper/ink surfaces, limited motion, component states, reduced-motion behavior, 200% zoom support, and a noindex component fixture that must be approved before bulk migration. This protects the distinctive editorial-research aesthetic while preventing generic “AI gradient” styling and page-family drift.

### Technical SEO Review

The review added pre-migration metadata and indexation baselines, one-H1 and heading checks, canonical and robots preservation, a 1200x630 social card, responsive image requirements, stable structured-data IDs, sitemap and `lastmod` safeguards, Core Web Vitals targets, browser coverage, and analytics-ID verification. It intentionally does not turn the visual migration into a non-homepage metadata rewrite.

### AI Search/AEO Review

The review preserved the site's existing AI-crawler access policy and machine-readable assets, standardized the Propeller Picks entity graph, required answer-first visible HTML and inspectable sourcing, and defined a repeatable 180-observation baseline with 30/60/90-day follow-up. FAQs remain page-specific and people-first; no blanket FAQ rollout or unsupported claim that `llms.txt` or FAQ schema guarantees citations is permitted.

## External Guidance Used

- [Google Search guidance for AI features](https://developers.google.com/search/docs/appearance/ai-features)
- [Google FAQ rich-result policy update](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Google Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [Google lazy-loading guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google structured-data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

## Release and Rollback

### Release

1. Build all phases on an isolated branch or worktree.
2. Run the complete acceptance suite before opening the final PR.
3. Review generated bulk diffs separately from hand-authored homepage and CSS changes.
4. Sync only the explicitly mapped public-site source changes to `/Users/scottolmer/Projects/nfl-betting-system` generators; do not overwrite that repository's privacy, terms, admin, or marketing-owned files.
5. Re-run both repositories' generator fixtures and static checks after synchronization.
6. Merge once after design, SEO/AEO, analytics, and test approval.
7. Let GitHub Pages deploy from `master`.
8. Wait for CDN propagation, then run the production canary matrix and record the launch date for 30/60/90-day AEO follow-up.

### Rollback

- Revert the single merge commit to restore the prior HTML, CSS, and generator output.
- Keep favicon files additive until the reverted HTML is confirmed live, then remove them in a follow-up cleanup if desired.
- No database, API, or data migration is involved.
- If only the homepage fails, revert the homepage and homepage stylesheet while leaving unused shared assets in place; do not partially leave migrated page families live with inconsistent shells.

## Definition of Done

1. All acceptance criteria pass.
2. The homepage receives explicit desktop and mobile visual approval.
3. A representative page from every family receives visual approval.
4. The non-homepage content hash report shows zero unapproved changes.
5. All current and future generator fixtures consume the shared design system and favicon assets.
6. Production canary verification passes after CDN propagation.
7. The visual migration and future FAQ content expansion remain separate, with the AEO tracker used to select page-specific FAQ work.
8. The authoritative analytics ID, crawler policy, sitemap inventory, machine-readable assets, and structured-data entity graph are documented and verified in production.
9. The pre-launch AEO benchmark is archived and its 30/60/90-day follow-up dates are scheduled in the tracker.
