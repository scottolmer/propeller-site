# Production manifest

## Package identity

- Slug: `underdog-payout-calculator-walkthrough`
- Concept: “How Much Do Underdog Picks Pay? Calculate Payouts Before You Enter”
- Production state: Publicly published.
- Built August 16 and logo-corrected August 17, 2026 on branch `codex/youtube-five-video-batch`.
- Final 1080p master: `final/master-1080p.mp4`.
- Upload/publication: Published on YouTube on August 17, 2026.

## Current versions

- Script: `script/final.txt` (v1)
- Narration: `audio/narration.mp3` (v2) with preserved `audio/narration-v1.mp3` and `audio/narration-v2.mp3`
- Alignment: `audio/alignment.json` and preserved `audio/alignment-v1.json`
- Caption JSON: `captions/captions.json` and preserved `captions/captions-v1.json`
- Upload captions: `captions/upload-en.srt` and preserved `captions/upload-en-v1.srt`
- Review render: `review/review.mp4` (v4, 1280×720), with v1 through v3 preserved; v3 has normalized audio but the superseded three-bar logo
- Thumbnail: `thumbnail/thumbnail.png` (v3, canonical Propeller mark, 1280×720), with fallback-font v1 and wrong-logo `thumbnail-v2-wrong-logo.png` preserved
- Contact sheet: `review/contact-sheet.jpg`
- Representative frames: `review/frames/`
- Metadata package: `youtube-package.md`
- Final master: `final/master-1080p.mp4` (1920×1080, H.264/AAC, 202.000 seconds)

## Provenance

- Narration provider: local Kokoro 0.9.4-compatible environment.
- Voice: `am_michael`.
- Narration source of truth: `audio/narration.mp3` / `audio/narration-v2.mp3`, 201.175 seconds, mono MP3, 44.1 kHz, approximately -17.52 LUFS integrated and -1.68 dBFS true peak.
- Word alignment: faster-whisper `base.en` through the bundled production aligner.
- Alignment result: 454 exact-script words, 432 direct timestamp matches, 52 timed SRT cues.
- Review composition: Remotion 4.0.512, 30 fps, 202.000 seconds.
- Product capture source: current local `tools/underdog-payout-calculator/index.html`, captured August 16, 2026 at 1440×1000 desktop and 390×844 mobile.
- Visual system: Propeller paper/ink/orange broadcast-editorial treatment with real calculator captures and clearly editorial rule graphics.
- Font loading: exact bundled Familjen Grotesk and IBM Plex WOFF2 bytes are generated into embedded data URLs and injected with inline `@font-face` CSS, eliminating the intermittent Remotion font-loader hold. The original fallback-font review is preserved as v1; v2 through current v4 use the verified sans brand type.
- Brand mark: current source, review, thumbnail, contact sheet, and representative frames use the canonical orange three-spoke Propeller mark. The superseded three-bar treatment is preserved only in explicitly versioned prior artifacts.

## Official rule evidence

- https://help.underdogsports.com/en/articles/13780101-pick-em-standard-flex-entry-payouts
- https://help.underdogsports.com/en/articles/10730924-payout-differences-and-discrepancies
- https://help.underdogsports.com/en/articles/8923390-state-eligibility
- https://help.underdogsports.com/en/articles/11102893-can-i-switch-to-classic-pick-em

All were checked August 16, 2026. The current Underdog entry screen and official terms control.

## Source-drift warning

At capture time, the local companion page displayed a stale 10x value for a 4-pick Standard entry, while Underdog’s official help page checked August 16, 2026 listed 12x. The video never shows or narrates that stale value. Its neutral calculator capture uses 5 picks, and its worked examples use only 5-pick Standard and 6-pick Flex values that match the official table. The companion calculator was updated August 17, 2026 to use the current 12x four-pick Standard value.

## Validation summary

- Remotion lint and TypeScript: passed.
- Master media: H.264 High, AAC LC, 1920×1080, 30 fps, 202.000 seconds, 4:2:0 full-range `yuvj420p`; fast-start confirmed with `moov` before `mdat`.
- Master full audio/video decode: passed with no FFmpeg errors.
- Master integrated loudness: -17.59 LUFS; true peak -4.69 dBFS; loudness range 2.30 LU.
- Master black-frame scan: no qualifying interval at 0.5 seconds / pixel threshold 0.02.
- Master silence scan: no qualifying interval above 1.5 seconds at -45 dB.
- Master 12-scene representative visual inspection: passed for the canonical orange three-spoke Propeller mark, embedded Familjen Grotesk/IBM Plex fonts, scene correspondence, readable focal points, safe captions, and stale-value exclusion.
- Review media: v4/current H.264 High, AAC LC, 1280×720, 30 fps, 202.000 seconds, 4:2:0 pixel format.
- Review full decode: passed with no FFmpeg errors.
- Black-frame scan: no qualifying interval at 0.5 seconds / pixel threshold 0.02.
- Silence scan: no qualifying interval above 1.5 seconds at -45 dB.
- Current review integrated loudness: -17.58 LUFS; true peak -4.72 dBFS. Current narration file: approximately -17.52 LUFS and -1.68 dBFS true peak. Timing is unchanged at 201.175 seconds.
- Thumbnail: 1280×720 PNG, 94,647 bytes, under 2 MB; visually verified with the canonical Propeller mark and sans brand type.
- Captions: 52 exact-script cues; monotonic validation recorded in package validator output.
- Contact sheet and representative frames: regenerated from v4 and inspected for the canonical Propeller mark across all 12 scenes, scene correspondence, readable focal points, safe captions, and stale-value exclusion.
- Logo/font proof: `review/frames/logo-font-proof-v4.png` visually confirms the canonical three-spoke mark plus Familjen Grotesk and IBM Plex supporting type.
- Master SHA-256: `cbeb240c621f963a647494022e5b3b91c30b7799546a2cacb425fdb0ed012806`.
- Package validator: passed with zero errors and zero warnings after the master checksum was recorded.

## Pending gates

- None for YouTube publication.

## YouTube publication

- Video ID: `eDEo1qPA2xQ`
- Public URL: `https://youtu.be/eDEo1qPA2xQ`
- Channel: Propeller Picks (`UCa0YkBvX4qlzV3J8QS7u1sg`)
- Uploaded August 17, 2026 with the approved title, description, custom thumbnail, English (United States) SRT captions, Sports category, not-made-for-kids audience, no playlist, no paid promotion, and no altered-content disclosure.
- YouTube Studio verification after the user changed visibility: Public, uploaded thumbnail, subtitle control, HD processing complete, and no notices.
