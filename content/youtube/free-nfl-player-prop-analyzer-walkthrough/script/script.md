# How to Use a Free NFL Player Prop Analyzer

## Production brief

- Primary question: What is a free NFL player prop analyzer, and how do you use one correctly?
- Target query: `free NFL player prop analyzer`
- Search intent: High-intent product tutorial.
- Audience: NFL DFS and pick'em researchers preparing for the 2026 season.
- CTA: `https://propellerpicks.com/analyzer/?sport=nfl`
- Target duration: about 5 minutes.
- Current narration: `script/final.txt`.

## Factual sources

1. `https://propellerpicks.com/analyzer/?sport=nfl`
   - Verified July 31, 2026.
   - The public Analyzer is free, requires no account, exposes five sport tabs including NFL, and displays the player, stat, line, direction, confidence context, and limitations when current data exists.
   - The page distinguishes an analyzer from an optimizer and says Propeller does not place entries or wagers.

2. `https://web-production-3c1c4.up.railway.app/api/nfl/props/public-slate`
   - Verified July 31, 2026 at approximately 16:23 UTC.
   - Returned `state=offseason`, `season=2026`, `week=0`, `total=0`, no current props, and the message “NFL regular-season props return when the season opens.”

3. `https://propellerpicks.com/picks/nfl/`
   - Verified July 31, 2026.
   - Owns NFL-specific current research and availability context. It directs viewers to the free NFL Analyzer and the canonical NFL research guide.

4. `https://propellerpicks.com/guides/nfl-player-prop-research/`
   - Verified July 31, 2026.
   - Canonical educational owner for the source-aware NFL game-week workflow.

5. Read-only production record `nfl_analysis_results.id=9559`.
   - Josh Allen, archived 2025 Week 17 passing yards, line 195.5, Under direction, directional confidence 62.
   - Retrospective interface fixture. It was not a live line at capture time and was not a published pregame recommendation.

6. `data/product-facts.json`, `data/sport-answer-modules.json`, and the shipped product UI/source.
   - Confidence is directional signal strength from 50 to 100, not calibrated win probability.
   - Sport-specific signal availability varies; no universal agent count should be claimed.

## Visual rules

- Start with the current free Analyzer on desktop and mobile.
- Show the NFL tab and current zero-slate state while the narration explains availability.
- Before any historical player detail appears, introduce a full-screen disclosure.
- Keep “HISTORICAL INTERFACE EXAMPLE · NOT A LIVE LINE” visible on every historical desktop and mobile frame.
- Zoom to the exact player, stat, and line when those words are spoken.
- Zoom to the direction before revealing or emphasizing confidence.
- Show desktop and mobile confidence UI only during the confidence explanation.
- Show the public result card's “Build AI research prompt” handoff while the narration explains the next research step.
- If the deeper workspace appears at all, use only a brief, explicitly labeled cutaway. Do not show an agent breakdown as part of the free Analyzer workflow.
- Do not imply the public free Analyzer exposes every signed-in workspace detail.
- End on the canonical Analyzer, methodology, results, and NFL guide links.

## Claim guardrails

- Never call confidence a hit rate, accuracy estimate, calibrated probability, or guarantee.
- Do not say training camp means current props are available.
- Do not present a historical line as current.
- Do not claim that line movement proves an edge.
- Do not publish a universal number of NFL agents or signals.
- Propeller is independent research software, not a sportsbook or entry-submission tool.
