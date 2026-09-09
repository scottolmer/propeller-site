# Search content implementation — September 9, 2026

Release scope: codex/nfl-search-content-20260909. Publication authorized September 9, 2026; deployment status is recorded by the GitHub Pages build and release verification.

## Scope

1. Refreshed the NFL research guide and added `/guides/early-season-nfl-props/`: changed roles, current injury sources, a source worksheet, and an explicitly hypothetical sample-size calculation.
2. Refreshed the existing PrizePicks and Pick6 strategy guides and payout-calculator content. Preserved calculator JavaScript, numeric payout tables, video embeds, and analytics. Added worked outcome and payout checks; removed unsupported universal entry-size and staking advice.
3. Added `/guides/underdog-streaks-champions-payouts/` and linked it from the Classic calculator. Streak progression and Champions settlement are compatible concepts, not mutually exclusive entry choices.
4. Added original arithmetic and research worksheets, dated primary-source links, visible FAQs matched to schema, contextual internal links, and generated sitemap entries.

## Evidence and measurement

The private research package is in `/Users/scottolmer/Documents/Codex/2026-09-09/propeller-video-research/`. GSC evidence ended September 6; GA4 comparison covered August 10–September 6. Do not interpret pre-kickoff NFL demand as in-season demand or these local changes as measured traffic gains.

After publication, compare page/query clicks, impressions, CTR and average position over matched 28-day windows. Separate NFL seasonality from the evergreen platform pages. Use production-hostname organic landing sessions and existing calculator/CTA events as the behavioral checks. No observed AI citation uplift is claimed; the pending AEO snapshot is not a scored result.

## Validation

Passed site consistency, structured-data contracts, product-fact consistency, visible/schema FAQ parity, canonical platform-intent ownership, NFL launch readiness, eight calculator contracts, and six calculator-event tests. Relevant shell, metadata, access, coverage, strategy, FAQ, icon, delivery, and sitemap maintenance checks were idempotent. Updated the calculator contract to accept a dated Rules checked or Verified label rather than hardcoding the old month.

Browser review covered both new guides, including narrow-screen document widths; fixed NFL hero and worksheet contrast. Calculator JavaScript was unchanged; existing calculator contracts and instrumentation tests passed. No production deployment or live post-release acceptance was performed.
