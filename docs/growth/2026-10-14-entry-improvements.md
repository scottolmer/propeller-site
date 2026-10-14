# Public research entry improvements — October 14, 2026

## Authority and release boundary

Scott approved three analytics-backed growth improvements. The supplied authoritative subscription plan was read at `docs/plans/2026-10-14-propeller-free-preview-subscription/plan.md` in the documentation-only application worktree, branch `codex/propeller-free-paid-plan-20261014151859-bdd110`. The supported Codex thread discovery confirmed **Discuss subscription launch timing**, ID `01a13ac2-154d-7052-a7b0-d3f53e5e5f53`.

That plan preserves existing accounts' full access, proposes up to five current preview picks per sport for future accounts, and optional standalone Propeller at $15/month with no trial. Public analyzers and calculators stay free. October 20 is a preparation milestone, not an automatic billing/cutoff date. Its implementation and activation had not begun when read.

This change is limited to public entry pages, their maintenance copy guard, and tests. It does not implement or enable billing, move a cutoff, change entitlements, modify Stripe, announce a launch date, or update analytics account settings. Neutral account CTAs point to the existing signup route and refer to current in-app terms. Actual signup/checkout behavior is owned by the subscription workstream and must be verified before the growth changes are released. New $15 purchase or preview promises must not be published until that contract is accepted and deployed.

Overlap: subscription plan task 7 owns marketing facts and the access normalizer; task 9 owns funnel measurement. Reconcile this normalizer/test diff when implementing task 7. The product-fact ledger, pricing/legal pages, app signup, and billing policy remain unchanged here. These growth edits do not complete the full subscription plan.

## Live evidence that sharpened the changes

GA4: **Propeller - Marketing Website**, account 385145456, **propellersite**, property 525454922. Reports were read October 14 for **September 16–October 13, 2026**, using 100% of available data. Latest-day processing completeness was not independently established.

- `/picks/prizepicks`: 364 landing sessions, 29 seconds average engagement/session, one key event.
- `/analyzer`: 349 landing sessions, 53 seconds average engagement/session, 59 key events.
- `/tools/prizepicks-payout-calculator`: 320 landing sessions, 25 seconds average engagement/session, three key events.
- `/tools/underdog-payout-calculator`: 306 landing sessions, 14 seconds average engagement/session, one key event. Its device breakdown recorded 275 mobile sessions (13 seconds, zero key events), 30 desktop (14 seconds, one key event), and two tablet. Device rows can overlap a session and are not additive.

Current key-event configuration contains `analyzer_completed`, `sign_up`, and `purchase`. Only `analyzer_completed` showed an active stream; `sign_up` and `purchase` showed **No stream data detected**. The period's event list had `signup_click` (100 events, 92 users), but no `sign_up` or `purchase`. This does not prove no real registrations or payments occurred: the account funnel cannot be reconstructed from this property.

Hostname breakdown contained only `propellerpicks.com` and `127.0.0.1`, with no app subdomain row. Production-host events included `calculator_started` 363/318 users, `calculator_completed` 271/242 users, `analyzer_completed` 72/67 users, `signup_click` 100/92 users, and `web_app_click` 12/10 users. These are aggregate events, not a joined sequential funnel or a signup drop-off percentage. One extra analyzer completion occurred on localhost. Native-app behavior is not established by this property.

[GA landing-page report](https://analytics.google.com/analytics/web/#/a385145456p525454922/reports/explorer?r=landing-page)

[GA Events report](https://analytics.google.com/analytics/web/#/a385145456p525454922/reports/explorer?r=top-events)

[GA key-event configuration](https://analytics.google.com/analytics/web/#/a385145456p525454922/admin/events/hub)

GSC domain **sc-domain:propellerpicks.com**, Web search, **September 14–October 11 vs August 17–September 13**, last update six hours ago. Exact query **prizepicks cheat sheet today** mapped entirely to `https://propellerpicks.com/picks/prizepicks/`: 123 clicks / 1,573 impressions versus 76 / 1,060; CTR 7.8% versus 7.2%, position 6.5 versus 5.6. This supports the page choice, not a claim it is the lowest-CTR opportunity.

[GSC query-to-page mapping](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Apropellerpicks.com&num_of_days=28&compare_date=PREV&query=!prizepicks%20cheat%20sheet%20today&breakdown=page)

## Implementation

1. Public tools and the daily PrizePicks entry use **Explore Propeller**, avoiding new permanent/full-free grants. The analyzer adds a contextual next step only after nonempty search results; it hides on empty results or sport changes. Access normalization preserves that neutral wording on repeated maintenance.
2. Underdog has a clearly labeled $10/five-pick worked example, optional collapsed scenario controls, accessible results focus, and live recalculation after amount/pick changes. The example produces the existing $200 base payout and does not count as a user calculator completion/start. Payout tables and research handoff destinations are unchanged.
3. The PrizePicks title/description match cheat-sheet research intent. A slate date is labeled as requested, not as analysis freshness. Undated/mismatched feeds and malformed rows are withheld. Empty/unreachable feeds never imply no games. A feed generation time is explicitly separate from unavailable source-analysis time. All actual public response rows (up to five per sport) render without fake duplicate/blurred teaser rows. Model confidence is a score out of 100, not a win probability.

## Validation and measurement

Focused Node/Python suites cover payouts, event deduplication, example completion exclusion, CTA navigation, stale/empty/malformed feeds, analyzer availability, and repeated access normalization. The current offer contract also passes; access normalization scanned 3,247 pages with zero changes. Independent review found and resolved an empty-state schedule claim.

Rendered checks used an isolated local server. Its analytics-loader response was disabled so calculator QA did not emit completion events to production. Mobile width 390 verified the example payout and next research links. The PrizePicks preview loaded ten real current-slate public rows and explicitly distinguished response generation from source-analysis time. No prediction-feed fixtures were uploaded or changed.

After a reviewed release, compare production-host mobile Underdog calculator starts/completions and onward research clicks; compare analyzer completion and account-entry clicks by landing cohort. Reconcile actual `sign_up`/paid events with the launch team's consent-aware, cross-host funnel before claiming signup or revenue lift. Query CTR/position/impressions should be reviewed together. No lift is promised or inferred from this implementation.

## Rollback

Revert this growth commit on the marketing release branch and rerun the same focused suites/maintenance guard before publishing. No database, entitlement, checkout, or analytics settings need rollback. Reverse-patch applicability is checked against the exact candidate; the parent owns release and any deployment decision. Never roll back the subscription cutoff or protected access as part of this marketing rollback.
