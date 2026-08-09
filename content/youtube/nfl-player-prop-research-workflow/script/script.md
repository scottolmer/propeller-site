# How to Research NFL Player Props: A Game-Week Workflow

## Production brief

- Primary question: How do you research NFL player props?
- Audience: NFL fans and DFS or pick'em users seeking a repeatable, source-aware research process.
- Search intent: Educational and product-assisted.
- Learning outcome: The viewer can verify the current market, evaluate role, injury, matchup, agents, and confidence, and recognize when no action is the correct outcome.
- Call to action: Read the NFL research guide, then use the NFL analyzer when a verified slate is available.
- Target duration: Approximately 5 to 7 minutes; final timing will conform to the approved Kokoro narration.
- Freshness rule: Capture the current public slate state. Use a historical NFL prop only when clearly labeled historical; never present it as current.

## Verified product facts

- The public NFL slate endpoint reported `offseason`, week 0, zero props, and the message “NFL regular-season props return when the season opens” on July 29, 2026.
- The selected historical UI fixture is Josh Allen, passing yards, archived 2025 Week 17 line 195.5, UNDER direction, directional confidence 62, with eight stored agent values. The underlying analysis row is retrospective and was not a public pregame recommendation.
- The public NFL page states that current research appears only when a verified slate is available.
- A listed NFL prop is researched from the current player, stat, line, platform, and source time.
- Available NFL inputs can include role and volume, position matchup, injury context, game environment, recent form, line movement, and market context.
- Propeller’s displayed NFL direction is supported by available signals; signals without a usable result are skipped.
- Propeller confidence is a 50–100 directional model-confidence score. It is not a calibrated win probability or guarantee.
- Propeller is an independent AI-assisted player-prop research workspace and does not accept wagers or place entries.

## Source register

- Current public NFL research page: https://propellerpicks.com/picks/nfl/
- Companion guide and approved answer language: https://propellerpicks.com/guides/nfl-player-prop-research/
- Current slate state: https://web-production-3c1c4.up.railway.app/api/nfl/props/public-slate
- Official injury-report source: https://www.nfl.com/injuries/
- Public method: https://propellerpicks.com/how-it-works/
- Current analyzer entry: https://propellerpicks.com/analyzer/?sport=nfl
- Shipped NFL agent orchestration: `/Users/scottolmer/Projects/nfl-betting-system/scripts/nfl_analysis/orchestrator.py`
- Shipped web agent-breakdown labels: `/Users/scottolmer/Projects/nfl-betting-system/web/components/props/prop-decision-guide.tsx`
- Shipped mobile product: `/Users/scottolmer/Projects/nfl-betting-system/mobile/`
- Read-only production provenance: `nfl_analysis_results.id=9559`; archived game date 2025-12-29; analyzed 2026-03-03. The render must not imply that this row was published before the game.

## Final narration

The narration-only copy is maintained in `final.txt`. The approved meaning is unchanged; pronunciation-safe wording was applied after the first Kokoro alignment identified ambiguous readings of More/Over, Less/Under, carries, and no-vig.

## Visual direction

The visual spine is a real user journey, not a slide deck:

1. Open the current NFL public board and show its verified slate state.
2. Transition to a clearly labeled Josh Allen historical NFL prop fixture on desktop and mobile. Keep “Historical workflow example — not a live or published pregame recommendation” visible throughout the example.
3. Zoom to the player, stat, exact line, platform, and timestamp in the order narrated.
4. Use restrained editorial overlays for role, official injury-report verification, and game-environment questions.
5. Open the same prop’s saved eight-row breakdown on desktop. On mobile, use the current `AgentBreakdownCard`, which truthfully surfaces DVOA, Volume, Injury, Matchup, and No Vig for this fixture; do not manufacture unsupported mobile rows.
6. Zoom to direction first and confidence second on both platforms.
7. Return to the archived line during the line-movement section, then use a labeled editorial workflow graphic—“Changed line → new research question.” The fixture retains neither a pregame source timestamp nor line-movement history, so do not simulate either.
8. Keep the interface visible behind the final checklist and CTA.

Use Propeller’s dark broadcast-editorial system: `#101311`, `#ff6038`, `#147d50`, and `#f2efe8`; Familjen Grotesk for display, IBM Plex Sans for body, and IBM Plex Mono for data labels. Use subtle camera movement, precise crops, and compact callouts. Label every historical capture with its source date.

## Claim and safety notes

- Do not quote a current player, line, or confidence value in narration.
- The Josh Allen fixture may show its archived line and model values on screen only with the persistent historical-example label; do not describe it as a pregame publication or recommendation.
- The fixture has no retained bookmaker, platform, authentic pregame source timestamp, or line-movement history. Render those fields as unavailable rather than inventing values.
- Avoid the current full web detail page’s derived projection and fallback best-book presentation; those would be misleading for this fixture.
- Avoid the mobile Model Read card during confidence narration because it turns confidence into probability language that contradicts the approved explanation.
- Do not describe confidence as probability, accuracy, edge, or expected profit.
- Do not imply that a line move reveals its cause.
- Do not infer health from a missing or neutral injury signal.
- Do not describe Propeller as a sportsbook or as placing entries.
- Avoid “lock,” “guaranteed,” “risk-free,” “sure thing,” or profitability promises.
- Include responsible-use language in narration and the final YouTube description.
