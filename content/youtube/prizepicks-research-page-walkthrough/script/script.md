# How to Use the PrizePicks Research Page: From Cheat Sheet to Line Check

## Final narration

See `final.txt`.

## Factual sources and capture record

- Live research page: `https://propellerpicks.com/picks/prizepicks/`, captured on desktop and responsive mobile on 2026-08-17 around 20:40 UTC.
- Public preview endpoint: `https://web-production-3c1c4.up.railway.app/api/social/picks/mlb?game_date=2026-08-17&limit=5`. The current row used throughout is Christian Franklin, BAL, RBIs 0.5, UNDER, 79% confidence.
- Current analysis detail: `https://web-production-3c1c4.up.railway.app/api/mlb/props/by-game-date/2026-08-17`. The matching row's `analyzed_at` is `2026-08-17T20:30:12`, `bookmaker` is `underdog`, and the agent breakdown contains NoVig, HitRate, Injury, Ballpark, and Usage.
- PrizePicks platform line check: `https://web-production-3c1c4.up.railway.app/api/dfs/lines?sport=mlb&game_date=2026-08-17&platform=prizepicks` returned `[]` at production time. No scene may state or imply that the 0.5 line was verified in PrizePicks.
- Official Player Picks terminology: `https://www.prizepicks.com/help-center/player-picks`, checked during production. Use the live PrizePicks board as final authority for projection availability.

## Production notes

- Product flow: dated public page; exact row on desktop; matching row on mobile; line and confidence focus; current agent-evidence panel; analysis timestamp; platform-line check; explicit no-match stop state.
- The public page is not a PrizePicks-native feed. Keep that source boundary visible whenever the dated row is on screen.
- Use purposeful crops and callouts on the exact card. Do not show the AI prompt-builder link as a workflow step.
- The agent breakdown is a branded editorial reconstruction from the current Propeller API record because the public companion page does not expose that full detail. It must be labeled with the date and source boundary.
- The final platform-check scene says `NO VERIFIED PRIZEPICKS MATCH` and shows the empty result, not a fabricated PrizePicks screenshot.
- This video owns the operational page-to-line-check sequence. It does not reteach the generic analyzer, six-signal framework, Power versus Flex, NFL process, or ChatGPT prompt creation.
