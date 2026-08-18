# What Is in a PrizePicks Cheat Sheet?

## Final narration

See `final.txt`.

## Factual sources and capture record

- Live companion page: `https://propellerpicks.com/picks/prizepicks/`, captured 2026-08-17 around 20:40 UTC. The visible row showed Christian Franklin, BAL, RBIs 0.5, UNDER, 79% confidence on matching desktop and responsive-mobile captures.
- Propeller current analysis detail: `https://web-production-3c1c4.up.railway.app/api/mlb/props/by-game-date/2026-08-17`. Christian Franklin was analyzed at `2026-08-17T20:30:12`; agent evidence included NoVig, HitRate, Injury, Ballpark, and Usage. The Injury rationale reported no injury data available. The record's bookmaker was `underdog`, not PrizePicks.
- Propeller platform truth check: `https://web-production-3c1c4.up.railway.app/api/dfs/lines?sport=mlb&game_date=2026-08-17&platform=prizepicks` returned an empty array during production. This is why the video says no verified PrizePicks match was available.
- Propeller public-preview endpoint: `https://web-production-3c1c4.up.railway.app/api/social/picks/mlb?game_date=2026-08-17&limit=5` returned five current-date Propeller rows with response `generated_at` around 20:39 UTC. That response time is not treated as source-analysis time.
- Official terminology: `https://www.prizepicks.com/help-center/player-picks`, last updated July 16, 2026 when checked. Used only for Player Picks, More/Less, projection, and final-lineup terminology; not used as proof of a current player projection.

## Production notes

- Evergreen answer structure: identity and exact line; freshness; injuries and missing data; supporting evidence; direction versus confidence; limitations; final PrizePicks platform check.
- Current captures are dated on screen and are never described as verified PrizePicks-native lines.
- The line-check failure is persistent and explicit. No scene calls the row a current PrizePicks projection.
- Use the public page as the walkthrough spine. Use a branded evidence panel derived from the dated API record because the public page does not expose the agent breakdown. Label that panel `CURRENT PROPELLER ANALYSIS · AUG 17, 2026` and its final state `NO VERIFIED PRIZEPICKS MATCH`.
- Avoid payout rules, Power versus Flex, generic six-signal teaching, prompt-building, and general analyzer instruction so this video remains distinct from existing channel videos.
