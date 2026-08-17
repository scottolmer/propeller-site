# Production manifest

## Package identity

- Slug: `prizepicks-power-play-vs-flex-play`
- Concept: “PrizePicks Power Play vs. Flex Play: Picks, Payouts & Rules Explained”
- Production state: Publicly published.
- Built: August 16, 2026 on branch `codex/youtube-five-video-batch`.
- Final 1080p master: Rendered and validated August 17, 2026.
- Upload/publication: Published on YouTube on August 17, 2026.

## Current versions

- Script: `script/final.txt` (v1)
- Narration: `audio/narration.mp3` (v2), with `audio/narration-v1.mp3` and `audio/narration-v2.mp3` preserved
- Alignment: `audio/alignment.json`, with `audio/alignment-v1.json` preserved
- Caption JSON: `captions/captions.json`, with `captions/captions-v1.json` preserved
- Upload captions: `captions/upload-en.srt`, with `captions/upload-en-v1.srt` preserved
- Review render: `review/review.mp4` (v2, 1280×720), with fallback-font `review/review-v1.mp4` preserved
- Thumbnail: `thumbnail/thumbnail.png` (corrected sans, 1280×720), with fallback-font `thumbnail/thumbnail-v1.png` preserved
- Contact sheet: `review/contact-sheet.jpg`
- Representative frames: `review/frames/`
- Final master: `final/master-1080p.mp4` (1920×1080)
- Master QA contact sheet: `final/qa/master-contact-sheet.jpg`
- Master QA frames: `final/qa/`
- Metadata package: `youtube-package.md`

## Provenance

- Narration provider: local Kokoro 0.9.4-compatible environment.
- Voice: `am_michael`.
- Narration source of truth: `audio/narration.mp3` / `audio/narration-v2.mp3`, 260.000 seconds, mono MP3, 44.1 kHz, approximately -17.42 LUFS integrated and -1.69 dB true peak.
- Word alignment: 596 exact-script words represented by 69 timed SRT cues.
- Review composition: Remotion 4.0.512, 30 fps, 260.053 seconds.
- Product capture source: current local `tools/prizepicks-payout-calculator/index.html`, captured August 16, 2026 at desktop and mobile sizes.
- Visual system: Propeller ink/paper/orange broadcast-editorial treatment with real calculator captures and explicitly labelled editorial rule graphics.
- Font loading: exact bundled Familjen Grotesk and IBM Plex WOFF2 bytes are embedded as data URLs and injected with inline `@font-face` CSS. This removed the intermittent Remotion font-loader hold while preserving the verified brand type.

## Official rule evidence

- https://www.prizepicks.com/help-center/payouts
- https://www.prizepicks.com/help-center/potential-outcomes
- https://www.prizepicks.com/help-center/player-picks
- https://www.prizepicks.com/help-center/dnps-reboots-and-ties
- https://www.prizepicks.com/help-center/eligibility

All were checked August 16, 2026. The current individual lineup details screen and location-specific terms control.

## Source-drift warnings

- Current official PrizePicks material includes a two-pick Flex tier. The companion calculator was updated August 17, 2026 to support the current two-pick Flex outcomes, while the video retains its sourced editorial chart and supported four-pick calculator scenario.
- A stale search-index snapshot showed 5x for four-pick Flex. Direct live checks of both the Payouts and Potential Outcomes pages showed 6x. The video uses 6x and explicitly tells viewers to verify the current individual details screen.

## Validation summary

- Remotion lint and TypeScript: passed.
- Review media: H.264 High, AAC, 1280×720, 30 fps, 260.053 seconds, 4:2:0 pixel format.
- Review full decode: passed with no FFmpeg errors.
- Current review integrated loudness: -14.50 LUFS; true peak -1.32 dBFS; LRA 2.10 LU.
- Black-frame scan: no qualifying interval at 0.5 seconds / pixel threshold 0.02.
- Silence scan: no qualifying interval above 1.5 seconds at -45 dB.
- Thumbnail: 1280×720 PNG, 125,244 bytes, under 2 MB; visually verified as correct sans brand type.
- Captions: 69 ordered, non-overlapping cues ending at 259.380 seconds.
- Semantic map: all 10 beats verified.
- Contact sheet and representative frames: inspected for scene correspondence, readable focal points, safe captions, and correct brand typography.
- Package checksums: recorded in `checksums.sha256` and verified.
- Final master: H.264 High, AAC LC, 1920×1080, 30 fps, full-range 4:2:0 pixel format, 260.053 seconds, 21,668,075 bytes, fast-start.
- Final master full decode: passed for all 7,800 frames with no FFmpeg errors.
- Final master loudness: -14.5 LUFS integrated; -1.3 dBFS true peak; 2.1 LU LRA.
- Final master black-frame scan: no qualifying interval at 0.5 seconds / pixel threshold 0.02.
- Final master silence scan: no qualifying interval above 1.5 seconds at -45 dB.
- Final master representative frames and contact sheet: inspected at 1920×1080 for correct sans brand fonts, scene correspondence, readable focal points, safe captions, and absence of personal data.
- Final master SHA-256: `fd919d81ba51d1ef5dc385921a0f6d4bbd31434b78383afa1597d6f4cca583de`.

## Pending gates

- None for YouTube publication.

## YouTube publication

- Video ID: `s2NGgkyWOZs`
- Public URL: `https://youtu.be/s2NGgkyWOZs`
- Channel: Propeller Picks (`UCa0YkBvX4qlzV3J8QS7u1sg`)
- Uploaded August 17, 2026 with the approved title, description, custom thumbnail, English (United States) SRT captions, Sports category, not-made-for-kids audience, no playlist, no paid promotion, and no altered-content disclosure.
- YouTube Studio verification after the user changed visibility: Public, uploaded thumbnail, subtitle control, HD processing complete, and no notices.
