# Propeller social launch film — review manifest

- Format: 1080 × 1920, 9:16, 30 fps
- Duration: 84 seconds
- Voice: local Kokoro stock voice `am_michael`
- Master: `final/master-1080x1920.mp4` (H.264/AAC)
- Review copy: `review/review.mp4` (540 × 960)
- Captions: burned into the video and available at `captions/upload-en.srt`
- Cover: `thumbnail/social-cover.png` (9:16)
- Product captures: illustrative July 2026 captures, visibly labelled in the film
- Publication: not requested; no upload or posting was attempted

## QA completed

- TypeScript and ESLint passed.
- Master and review copy decode successfully with matching 84-second duration.
- Confidence, desktop model breakdown, mobile Agent Breakdown, player line, and MLB fantasy range visuals were inspected in the final render.
- Caption grouping was constrained so captions do not preview a following scene's narration.
- Mobile line and confidence clips are top-anchored to the exact player, direction, line, and confidence area; the agent scene uses a dedicated mobile Agent Breakdown crop.
- Captions use stable, clause-level cards rather than word-follow animation, so viewers have time to read each phrase.
