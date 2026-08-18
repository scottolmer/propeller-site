# Production manifest

## Package identity

- Slug: `prizepicks-research-page-walkthrough`
- Concept: “How to Use the PrizePicks Research Page: From Cheat Sheet to Line Check”
- Production state: public-published; exact review package and Public visibility approved.
- Built: August 17, 2026 on branch `codex/youtube-five-video-batch`.
- YouTube: Public and externally verified at `https://youtu.be/yO6gWjmH_5w` on August 18, 2026.

## Current versions

- Script: `script/final.txt` and sourced notes in `script/script.md` / `production-notes.md`
- Narration: `audio/narration.mp3` (normalized v2); source render preserved as `audio/narration-v1.mp3`
- Alignment: `audio/alignment.json`
- Caption JSON: `captions/captions.json`
- Timed upload captions: `captions/upload-en.srt`
- Semantic map: `semantic-map.tsv` (15 verified beats)
- Review render: `review/review.mp4` (normalized v4, 1280×720); versioned copy at `review/review-v4.mp4`
- Thumbnail: `thumbnail/thumbnail.png` (1280×720); source still preserved as `thumbnail/thumbnail-v1.png`
- Review contact sheet and frames: `review/contact-sheet.jpg`, `review/contact-sheet-v4.jpg`, `review/frames/final/`
- Final master: `final/master-1080p.mp4` (normalized v4, 1920×1080); versioned copy at `final/master-1080p-v4.mp4`
- Master QA sheet and frames: `final/qa/master-contact-sheet.jpg`, `final/qa/`
- YouTube metadata: `youtube-package.md`
- State/provenance: `production.json`
- Public YouTube entry: `yO6gWjmH_5w`; approved metadata, public 1280×720 thumbnail, 15 chapters, English (United States) timed captions, 1080p playback, embedding, and approved pinned comment verified.

## Provenance and source boundary

- Narration provider/voice: local Kokoro, stock `am_michael`; ElevenLabs was not used.
- Narration: mono MP3, 44.1 kHz, 128 kbps, 255.100 seconds.
- Alignment: all 562 script words represented; 69 ordered SRT cues.
- Visual system: Remotion 4.0.512, 30 fps, actual desktop/mobile captures as the visual spine, cursor-guided interactions, burned-in captions with an 88 px lower safe margin, and narration-aligned line/confidence/agent/freshness focus.
- Accepted captures: the same August 17, 2026 Christian Franklin RBIs 0.5, Under, 79 row on desktop and mobile. The rejected desktop-layout mobile miscapture is isolated under `captures/rejected/` and is not used.
- Detailed evidence: source-analysis timestamp `2026-08-17T20:30:12Z`; five agent cards including an explicit missing-injury-data limitation.
- Platform result: the platform-backed PrizePicks endpoint returned no record and the analysis source identified a different market. The final-board interaction is persistently labeled `ILLUSTRATIVE WORKFLOW · NOT LIVE PRIZEPICKS UI`, then the workflow shows the captured empty result and correctly ends with no verified match.

Full sourced notes and URLs are recorded in `production-notes.md` and `production.json`.

## Validation summary

- Remotion lint and TypeScript: passed.
- Review: H.264 High, AAC LC, 1280×720, 30 fps, 255.200 seconds, 20,107,317 bytes.
- Master: H.264 High, AAC LC, 1920×1080, 30 fps, full-range 4:2:0, 255.200 seconds, 21,974,946 bytes, fast-start.
- Master audio: stereo AAC, 48 kHz, -14.5 LUFS integrated, -2.3 dBFS true peak.
- Full review and master decodes: passed with no FFmpeg errors.
- Black-frame scan: no qualifying interval at 0.5 seconds / pixel threshold 0.02.
- Silence scan: no qualifying interval above 1.5 seconds at -45 dB.
- Thumbnail: 1280×720 PNG, 336,485 bytes, below 2 MB.
- Captions: 562 ordered word timings and 69 ordered SRT cues; final word ends at 254.260 seconds.
- Semantic map: all 15 beats verified against the final cut; evidence-card highlights use aligned spoken-word timestamps and the missing-input scene starts on Injury.
- Contact sheets and master representative frames: inspected for exact desktop/mobile match, correct source date, readable player/stat/line, direction/confidence, agent breakdown, freshness, persistent illustrative labeling, and the failed platform check.
- Independent visual review: passed after cursor, caption-safe, illustrative-flow, and narration-aligned evidence-timing corrections.
- Independent code/package review: passed with all declared deliverables present and no remaining blocker.
- Website: managed integration markers, shared lazy player, analytics placement, transcript, internal links, schema readiness, pending-player state, and release-ID refusal/idempotency checks passed.

## Pending gates

- None. The companion page deployed successfully through GitHub Pages run `32188895040`; live bytes matched `origin/master` at `9d1761dbe`, and the real-ID lazy player, analytics placement, internal links, transcript, and `VideoObject` were verified in production.
