# AEO Citation Tracker

## August 2026 NFL launch measurement

`aeo-target-questions-2026-08.json` is a new, frozen 20-question target set for the August NFL launch period. It preserves the core product, tool, education, trust, and comparison intents while adding five NFL-specific questions that map to the NFL research guide, public slate state, and analyzer deep link. Do not overwrite the July target set or compare a new August run directly with the incomplete July draft. Materialize the August blank matrix with:

```bash
python3 scripts/create_aeo_baseline.py \
  --targets docs/seo/aeo-target-questions-2026-08.json \
  --date 2026-08-01 \
  --output docs/seo/aeo-baseline-2026-08-01.csv
```

The frozen contract is 20 prompts × 5 platforms × 3 fresh runs = 300 manual observations. A blank matrix is not an observation and must not be reported as a citation result.

Last updated: 2026-07-13

This file defines the recurring answer-engine visibility workflow for Propeller Picks. The internal target-question set lives at `docs/seo/aeo-target-questions.json` and is intentionally not published as a discovery asset.

The initial 12-question × 5-platform × 3-run matrix is stored in `docs/seo/aeo-baseline-2026-07-13.csv`. Its 180 observations are intentionally marked `pending_manual_platform_run`; no answer-engine mention or citation has been fabricated. Complete the rows in authenticated, fresh sessions after the revised site is deployed and crawlable.

## Monthly Workflow

1. Export the last 28 days of Google Search Console queries and pages.
2. Update `docs/seo/aeo-target-questions.json` when new high-impression question patterns appear.
3. For each target question, run three fresh checks in ChatGPT search, Perplexity, Google AI Overviews, Gemini, and Copilot.
4. Record whether Propeller is mentioned, whether a Propeller URL is cited, which competitors are mentioned, and which domains are cited.
5. Prioritize changes in this order: cited-source gap, stale owned-page facts, missing FAQ/schema, missing third-party citation opportunity.

## Fields To Track Per Run

| Field | Purpose |
| --- | --- |
| Date | Keeps freshness visible. |
| Platform | Separates ChatGPT, Perplexity, Google, Gemini, and Copilot behavior. |
| Prompt | Exact prompt tested. |
| Propeller mentioned | Share-of-voice signal. |
| Propeller cited | Citation signal. |
| Propeller URL cited | Shows which owned page is being retrieved. |
| Competitors mentioned | Competitive visibility. |
| Competitors cited | Competitor citation source quality. |
| Cited domains | Source targets for outreach or content parity. |
| Answer summary | Short description of how the platform answered. |
| Follow-up actions | Page update, schema update, help page, or third-party citation work. |

## Initial Priority From Search Console

The 2026-07-05 export shows the strongest existing demand around payout calculators and platform-rule questions:

- PrizePicks calculator and payout queries.
- Underdog flex payout calculator and payout chart queries.
- PrizePicks 5-of-6 and 6-pick Power/Flex questions.
- Pick6 payout calculator and Pick6 vs PrizePicks questions.
- Player prop analyzer and prop research queries.
- NBA prop odds and NBA prop strategy queries.

## Rules

- Do not fabricate AI visibility. Empty or unfavorable results should be recorded as-is.
- Do not cite stale hardcoded win-rate claims when a live Propeller source exists.
- Treat Reddit, Quora, YouTube, and affiliate/listicle pages as citation surfaces, not places to manufacture fake mentions.
- Update the owned page before chasing third-party mentions if the owned page has stale facts, missing schema, or weak answer structure.
