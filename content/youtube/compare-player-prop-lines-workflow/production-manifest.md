# Production manifest

- Project: `compare-player-prop-lines-workflow`
- Concept: “How to Compare Player Prop Odds Quickly: A Desktop Research Workflow”
- Package state: publicly published
- Script approval: user-authorized autonomous Wave A batch production
- Narration: Kokoro `am_michael`, 222.600 seconds, 44.1 kHz mono MP3 source
- Alignment: 549 script words, 533 exact timestamp matches, remaining words interpolated by the alignment tool, 65 caption cues
- Review render: H.264/AAC, 1280x720, 30 fps, 222.700 seconds; audio normalized derivative of the preserved Remotion render
- Review audio: measured -16.45 LUFS integrated, -1.32 dB true peak, 2.60 LU loudness range
- Master render: H.264/AAC, 1920x1080, 30 fps, yuvj420p, 222.700 seconds, 16,973,236 bytes, fast-start
- Master audio: AAC stereo at 48 kHz; measured -16.44 LUFS integrated, -1.40 dB true peak, 2.60 LU loudness range
- Preserved raw master: direct Remotion render at `final/master-1080p-v1-raw.mp4`, 222.656 seconds and 20,527,240 bytes
- Captions: timed English SRT plus aligned JSON; 65 monotonic, non-overlapping cues and 549 tokens
- Thumbnail: 1280x720 PNG, 135,387 bytes
- Product evidence: fresh public Analyzer and Pick6 calculator captures at desktop and mobile sizes, collected 2026-08-16
- Truth boundary: Propeller is shown as one evidence layer in a manual workflow and is never described as automatically comparing every sportsbook or platform
- Illustrative data: all platform names, line examples, prices, and payout contexts in editorial graphics are visibly illustrative rather than current market claims
- Semantic QA: all nine beats use the required ten-column TSV schema, place `verified` in the status column, and are verified against the rendered review plus 18 master scene-start/midpoint frames
- Technical QA: Remotion ESLint and TypeScript pass; full master decode passes; master is fast-start and 4:2:0; no black segments longer than 0.5 seconds and no silence longer than 1.5 seconds at -45 dB detected
- Caption timing notice: four interpolated word tokens have zero active-highlight duration at phrase boundaries; each word remains visible in its burned caption page, while the complete 65-cue upload SRT is monotonic and non-overlapping
- Package validator: passed with zero errors and zero warnings after refreshed checksums
- Dependency notice: `npm audit` reports two low-severity notices in the scaffolded Remotion dependency tree; no forced dependency rewrite was applied
- Release status: 1080p master published on the Propeller Picks channel on August 17, 2026
- Companion content: `/guides/compare-player-prop-lines/` is implemented and references the public YouTube video ID

## Current artifacts

- Script: `script/final.txt`
- Script and evidence notes: `script/script.md`
- Narration: `audio/narration.mp3`
- Alignment: `audio/alignment.json`
- Caption JSON: `captions/captions.json`
- Upload captions: `captions/upload-en.srt`
- Review video: `review/review.mp4`
- Contact sheet: `review/contact-sheet.jpg`
- Representative frames: `review/frames/review-01-hook.jpg` through `review/frames/review-09-close.jpg`
- Thumbnail: `thumbnail/thumbnail.png`
- Master video: `final/master-1080p.mp4`
- Master QA contact sheet: `final/master-contact-sheet.jpg`
- Master QA frames: `final/qa-frames/01a-hook-start.jpg` through `final/qa-frames/09b-close-mid.jpg`
- Metadata package: `youtube-package.md`
- Semantic map: `semantic-map.tsv`
- Checksums: `checksums.sha256`

## Preserved versions

- Narration and alignment: `audio/narration-v1.mp3`, `audio/alignment-v1.json`
- Captions: `captions/captions-v1.json`, `captions/upload-en-v1.srt`
- Raw Remotion review: `review/review-v1.mp4`
- Audio-normalized review: `review/review-v2.mp4`
- Contact sheets: `review/contact-sheet-v1.jpg`, `review/contact-sheet-v2.jpg`
- Thumbnails: `thumbnail/thumbnail-v1.png`, `thumbnail/thumbnail-v2.png`, `thumbnail/thumbnail-v3.png`
- Raw master: `final/master-1080p-v1-raw.mp4`

## Source evidence

- `https://propellerpicks.com/analyzer/` and local `analyzer/index.html`, checked 2026-08-16: exact displayed line, direction, confidence, freshness, platform-rule verification, and research-only boundary.
- `https://propellerpicks.com/help/does-propeller-show-no-vig-odds/` and local help source, checked 2026-08-16: no-vig is a market-implied estimate where available, not a true outcome probability or guarantee.
- `https://propellerpicks.com/tools/pick6-payout-calculator/` and local calculator source, checked 2026-08-16: the currently displayed multiplier and final platform terms control; payout arithmetic is not ROI, EV, or profitability.

## YouTube publication

- Video ID: `NLmhM3BshPw`
- Public URL: `https://youtu.be/NLmhM3BshPw`
- Channel: Propeller Picks (`UCa0YkBvX4qlzV3J8QS7u1sg`)
- Uploaded August 17, 2026 with the approved title, description, custom thumbnail, English (United States) SRT captions, Sports category, not-made-for-kids audience, no playlist, no paid promotion, and no altered-content disclosure.
- YouTube Studio verification after the user changed visibility: Public, uploaded thumbnail, subtitle control, HD processing complete, and no notices.
