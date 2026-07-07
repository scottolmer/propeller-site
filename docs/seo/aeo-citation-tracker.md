# AEO Citation Tracker

Last updated: 2026-07-07

This file defines the recurring answer-engine visibility workflow for Propeller Picks. The public target-question set lives at `/data/aeo-target-questions.json`.

## Monthly Workflow

1. Export the last 28 days of Google Search Console queries and pages.
2. Update `/data/aeo-target-questions.json` when new high-impression question patterns appear.
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
