# Sourced production notes

## Editorial scope

This is a product-led desktop and mobile walkthrough. Its order is: find current Propeller research, confirm the player/stat/line, read direction and confidence separately, inspect the dated agent evidence, check freshness, then verify the actual PrizePicks projection. It does not teach prompt building, general six-signal analysis, payout math, entry construction, or an NFL-specific workflow.

## Current-source audit

- `https://propellerpicks.com/picks/prizepicks/` displayed August 17, 2026 when captured and contained no July 28 date.
- The page's current public preview returned five MLB rows and no NBA or NHL rows during the production audit.
- `https://web-production-3c1c4.up.railway.app/api/mlb/props/by-game-date/2026-08-17` supplied the detailed agent record and source-analysis time `2026-08-17T20:30:12Z`.
- `https://web-production-3c1c4.up.railway.app/api/dfs/lines?sport=mlb&game_date=2026-08-17&platform=prizepicks` returned no platform-backed PrizePicks lines at capture time.
- `https://www.prizepicks.com/help-center/player-picks` was used only for Player Picks terminology, never to establish availability of the featured projection.

## Matching product captures

Desktop and mobile use the same August 17 row: Christian Franklin, Baltimore, RBIs 0.5, Under, 79 model confidence. They never switch to a different player or line. When narration says player/stat/line, the exact fields are enlarged. When it says direction/confidence, those fields are isolated. When it discusses the agent breakdown, the five dated evidence cards are on screen. When it discusses freshness, the analysis date and timestamp are enlarged.

The final line check does not invent a PrizePicks screenshot. It uses a persistently labeled “ILLUSTRATIVE WORKFLOW · NOT LIVE PRIZEPICKS UI” interaction to demonstrate searching the player, matching the stat, and comparing the exact projection. The following beat states the captured platform-backed result was empty and that the row's recorded market source was not PrizePicks. The persistent workflow rule is “no verified match means stop.”

## Visual provenance

- Desktop public page: `captures/desktop/current-prizepicks-research-2026-08-17.png`
- Mobile public page: `captures/mobile/current-prizepicks-research-2026-08-17.png`
- Desktop detail: `captures/desktop/current-analyzer-christian-franklin-2026-08-17.png`
- Accepted assets are copied into `remotion/public/assets/`; the erroneous desktop-layout mobile miscapture is not used.
- Current-example labels include the exact August 17 date so the recording cannot later be mistaken for live data.

## Narration and build

- Narration: local Kokoro stock voice `am_michael`; no ElevenLabs use.
- Alignment: locally generated word timing drives burned-in captions and the timed English SRT.
- Video: Remotion walkthrough, not a slide deck; actual desktop/mobile page captures remain the visual spine and the crop changes with the narrated task.

## Release boundary

No upload, YouTube ID, `VideoObject`, playable embed, deployment, or public visibility is included before explicit approval. Release-time integration uses the existing lazy player and analytics placement attributes only after both real IDs exist.
