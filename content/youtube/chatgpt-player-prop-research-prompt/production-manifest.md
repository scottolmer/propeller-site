# Production manifest

## Deliverable

- Topic: Can ChatGPT Analyze Player Props? A Better Research Prompt, Its Limits, and a Smarter Workflow
- Final narration: 313.25 seconds, 734 words
- Voice: local Kokoro, `am_michael`
- Master specification: 1920 × 1080, 30 fps, H.264 video, AAC audio, yuv420p
- Captions: English upload SRT plus grouped, stable on-screen captions

## Production decisions

- The edit is answer-first: ChatGPT can organize research, but it is not presented as the current-data source or as a prediction engine.
- The current Prompt Builder is the primary product walkthrough. All shown example inputs are illustrative.
- Detail-level Propeller UI scenes are labeled `ILLUSTRATIVE HISTORICAL CAPTURE • JUL 2026` so they cannot be mistaken for a current board or recommendation.
- The agent scene uses the agent-breakdown UI only. The confidence scene separately focuses on the displayed score and direction, and avoids probability language.
- Captions are assembled into short phrase cues rather than word-by-word animation to preserve reading time.

## Source-of-truth references

- `tools/ai-betting-prompt-builder/index.html`
- `assets/js/ai-prompt-builder.js`
- `guides/how-ai-sports-betting-works/index.html`
- `data/product-facts.json`

## Required QA before upload

- Confirm the master decodes without errors and retains 1920 × 1080 / 30 fps / AAC.
- Confirm the SRT is timestamped and monotonic.
- Review visual checkpoints, especially mobile line, mobile agent breakdown, and mobile confidence crops.
- Confirm all historical product detail is labeled on-screen.
- Confirm title, description, chapters, disclaimer, thumbnail, and captions match the final edit.

## Publication status

The package is for review only. No YouTube upload has been created, and no visibility setting has been approved.

## Completed QA

- The final master completed a full FFmpeg decode check.
- Video metadata verified: 1920 × 1080, 30 fps, H.264, yuv420p / TV range; audio: AAC; duration: 313.32 seconds.
- `validate_video_package.py` passed with no errors or warnings, including semantic-map and checksum checks.
