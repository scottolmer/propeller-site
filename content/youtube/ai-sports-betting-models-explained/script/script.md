# Final script: How AI Sports Betting Models Actually Work (And What They Can’t Tell You)

## Viewer answer

An AI player-prop model organizes relevant, available sport-specific evidence around the exact player, market, direction, and current line. Propeller exposes the supporting and conflicting signals in an agent breakdown and summarizes their directional strength with a confidence score. It does not produce a guarantee or calibrated win probability, and incomplete or changed context can make passing the right outcome.

## Narration

The narration-only production script is in [`final.txt`](final.txt).

## Structure and required visual pairing

| Beat | Visual requirement |
|---|---|
| Hook and limitation | Real desktop analyzer context; keep the line, direction, and score separate. |
| Exact question | Zoom to the player, stat, displayed direction, and current line on desktop and mobile. |
| Inputs | Move through real matching desktop agent cards and their mobile counterparts; use a minimal editorial signal map only to introduce the groups. |
| Agents | Use the same prop to show support, conflict, and the strongest driver. |
| Confidence | Show desktop and mobile confidence views precisely while stating it is not a probability or guarantee. |
| Failure modes | Show freshness, current-state, changed-line, or unavailable-data UI truthfully. Label detailed historical assets if live examples are unavailable. |
| Responsible workflow | Replay the actual UI order from line through agents to freshness and decision. |
| Closing | End on current desktop and mobile analyzer surfaces with the CTA and research-only disclaimer. |

## Factual source notes

- `guides/how-ai-sports-betting-works/index.html`: The public model card says confidence is directional conviction rather than probability, identifies market/form/role/matchup/availability/context inputs, and names missing-data, freshness, market-movement, and failure-mode rules.
- `guides/how-to-analyze-player-props/index.html`: Propeller uses sport-specific signals; representative agent categories include injury, matchup, no-vig, pace, usage, minutes, hit rate, and rest. Only available signals contribute.
- `help/how-do-confidence-scores-work/index.html`: The product displays a direction plus a 50–100 confidence score, where higher values mean stronger support for the displayed side—not a win probability or guarantee.
- `help/is-propeller-a-sportsbook/index.html`: Propeller is not a sportsbook and does not accept wagers.

## Production notes

- This video intentionally differs from the existing confidence and six-signals videos: it explains the model system, available-input behavior, disagreement, and limits before demonstrating the product workflow.
- Do not show a live recommendation unless it is current, internally consistent across desktop and mobile, and captured close to render time. Otherwise use a clearly visible `ILLUSTRATIVE HISTORICAL CAPTURE` treatment.
- The script refers to representative signal categories, not a promise that all categories appear on every sport, market, or current slate.
