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

Last updated: 2026-07-16

This file defines the recurring answer-engine visibility workflow for Propeller Picks. The active internal target-question set lives at `docs/seo/aeo-target-questions.json`; immutable copies in `docs/seo/aeo-contracts/` keep historical snapshots independently verifiable after a future contract change.

The frozen monthly contract is 20 questions × 5 platforms × 3 fresh runs, or 300 observations. The July matrix is `docs/seo/aeo-snapshot-2026-07-16.csv`; its generated rollup is `docs/seo/aeo-snapshot-2026-07-16.md`. The older 12-question `aeo-baseline-2026-07-13.csv` remains as an honest record of the unrun placeholder and is not a comparable snapshot.

## Monthly Workflow

1. Export the last 28 days of Google Search Console queries and pages.
2. Review new high-impression question patterns, but keep the frozen 20-question core unchanged for month-over-month comparability. Propose replacements separately and version the set when a change is approved.
3. Generate the matrix with `python3 scripts/create_aeo_baseline.py --date YYYY-MM-DD --output docs/seo/aeo-snapshot-YYYY-MM-DD.csv`.
4. For each target question, run three fresh checks in the frozen modes: ChatGPT Temporary Chat with Instant 5.5 and Web search enabled; signed-in Perplexity default search; US-English Google AI Mode/AI Overview; signed-in Gemini default mode in a new chat; and Copilot Temporary chat in Smart mode.
5. Record whether the AI answer surface appeared, whether Propeller was mentioned, whether a Propeller URL was cited, which competitors and domains were cited, source type, and factual accuracy.
6. Require all 300 observations and generate the rollup with `python3 scripts/summarize_aeo_snapshot.py docs/seo/aeo-snapshot-YYYY-MM-DD.csv --output docs/seo/aeo-snapshot-YYYY-MM-DD.md`. Incomplete matrices fail by default; `--draft` is only for a non-comparable working report.
7. Prioritize changes in this order: wrong fact, wrong owned page, missing citation, missing content, missing third-party citation opportunity.

## Fields To Track Per Run

| Field | Purpose |
| --- | --- |
| Contract version/hash | Proves which frozen questions, modes, and field contract produced the row. |
| Date | Keeps freshness visible. |
| Platform | Separates ChatGPT, Perplexity, Google, Gemini, and Copilot behavior. |
| Prompt | Exact prompt tested. |
| Propeller mentioned | Share-of-voice signal. |
| Propeller cited | Citation signal. |
| Propeller URL cited | Shows which owned page is being retrieved. |
| Competitors mentioned | Competitive visibility. |
| Competitors cited | Competitor citation source quality. |
| Cited domains | Source targets for outreach or content parity. |
| Source types | Separates owned, official-platform, competitor, publisher, community, video/social, directory, and other citations. |
| Answer accurate | Grades Propeller claims as accurate, mixed, inaccurate, unverifiable, or not applicable. |
| Accuracy notes | Records the exact contradiction or evidence used for the grade. |
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
- Count only citations inside the generated answer. A normal Google web result below an AI Overview is not an AI citation.
- Use `answer_surface=absent` for a valid Google run where no AI Overview/AI Mode answer appears; do not convert an ordinary SERP ranking into an AEO mention.
- Use semicolon-separated values for multiple competitors, domains, source types, URLs, and actions so the rollup remains deterministic.
- Factual accuracy grades Propeller claims against the current product-fact ledger. If Propeller is not mentioned, use `not_applicable`; if evidence cannot resolve a claim, use `unverifiable`.
- Preserve exact prompts, the five platforms, three runs, US English, and the frozen 20-question core for comparable monthly rates.
- Do not publish a snapshot as the monthly baseline unless the default completeness gate passes. Retain blocked rows honestly and retry them before closing the monthly run; use `--draft` only for an explicitly non-comparable working report.
- A completed row must preserve its generated observation ID, exact prompt, target metadata, timestamp, reviewer, and evidence URL.
- A Propeller citation is complete only when the exact cited Propeller URL was captured. Domain-only evidence remains `failed_inconclusive` until rerun or manually resolved from evidence.
