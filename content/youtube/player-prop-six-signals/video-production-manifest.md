# Player-prop six-signals video production manifest

## Final outputs

- Master: `final/player-prop-six-signals.mp4`
  - 1920 × 1080
  - 30 fps
  - H.264 video, AAC stereo audio
  - Duration: 413.013 seconds (6:53.01)
  - Size: 59,972,578 bytes
  - SHA-256: `f90d91043d82a07b0ce67c2ee433606afb025e3253967430ec5a3f77a15ee45e`
- Review: `final/player-prop-six-signals-review.mp4`
  - 1280 × 720
  - 30 fps
  - H.264 video, AAC stereo audio
  - Duration: 413.013 seconds (6:53.01)
  - Size: 30,722,736 bytes
  - SHA-256: `e8f4fb6974028361fdc4801fb2cc845d5ea4e9ef96eaa2ac0b3c6980cf53c0ec`

## Production approach

- Voiceover timing is based on 983 word-level timestamps in `audio/voiceover-alignment.json`.
- Real Propeller desktop and mobile captures are used for the product walkthrough.
- Product captures are explicitly labeled as a historical walkthrough.
- The 24.5-point example and cross-sport explanations use clearly labeled editorial graphics so an unrelated live line is never shown beneath the narration.
- Captions are burned into both outputs with active-word highlighting.
- The visual system uses Propeller's production colors and local brand fonts: Familjen Grotesk, IBM Plex Sans, and IBM Plex Mono.

## Verification

- ESLint and TypeScript pass.
- Both video outputs decode completely with FFmpeg.
- Master and review files contain H.264 video and AAC audio streams.
- Representative source frames and a contact sheet from the encoded review are stored in `review/`.

## Rebuild

From `remotion/`:

```bash
npm run prepare-assets
npm run lint
npm run render:review
npm run render:master
```
