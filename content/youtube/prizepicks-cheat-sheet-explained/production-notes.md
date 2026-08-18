# Sourced production notes

## Editorial scope

This is the evergreen, answer-engine-focused explainer. It defines what a trustworthy cheat sheet contains: identity, exact line, source-analysis time, evidence, missing inputs, direction, confidence, limitations, and a final platform check. It intentionally does not repeat the ChatGPT Prompt Builder, general Analyzer, six-signals, payout-rules, or NFL workflow videos.

## Current-source audit

- The live companion page at `https://propellerpicks.com/picks/prizepicks/` displayed August 17, 2026 and no longer contained the previously reported July 28 date when checked at 20:40 UTC on August 17, 2026.
- The public MLB detail endpoint at `https://web-production-3c1c4.up.railway.app/api/mlb/props/by-game-date/2026-08-17` provided the dated Christian Franklin analysis and source-analysis timestamp `2026-08-17T20:30:12Z`.
- The platform-backed check at `https://web-production-3c1c4.up.railway.app/api/dfs/lines?sport=mlb&game_date=2026-08-17&platform=prizepicks` returned an empty array at capture time.
- Official terminology was checked against `https://www.prizepicks.com/help-center/player-picks`; it is not used as evidence that a specific projection was available.

## Dated example

The desktop and mobile captures show the same first row: Christian Franklin, Baltimore, RBIs 0.5, Under, 79 model confidence. The dated analysis detail included hit-rate, ballpark, usage, market, and injury agents. The injury agent said no injury report data was available. That missing input is presented as a limitation.

Because the platform-backed PrizePicks endpoint was empty and the analysis record identified a different market source, the row is labeled current Propeller research from August 17—not a current PrizePicks projection. The line-check result is persistently shown as “NO VERIFIED PRIZEPICKS MATCH.”

## Visual provenance

- Desktop public page: `captures/desktop/current-prizepicks-research-2026-08-17.png`
- Mobile public page: `captures/mobile/current-prizepicks-research-2026-08-17.png`
- Desktop detail: `captures/desktop/current-analyzer-christian-franklin-2026-08-17.png`
- The Remotion composition uses only the accepted matching captures copied to `remotion/public/assets/`.
- Every dated example receives an August 17 label. Editorial evidence cards are visibly marked as dated analysis, and the failed platform check is not represented as a current board screenshot.

## Narration and build

- Narration: local Kokoro with stock voice `am_michael`; no ElevenLabs use.
- Alignment: script-to-audio timing generated locally and used for burned-in captions and the upload SRT.
- Video: Remotion walkthrough composition with browser-framed product captures, progressive exact-section focus, agent-evidence cards, and explicit source-boundary graphics.

## Release boundary

No upload, YouTube ID, `VideoObject`, playable embed, deployment, or public visibility is included before explicit approval. The companion page carries a non-clickable pending block and the release script refuses placeholder IDs.
