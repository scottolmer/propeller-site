# Production manifest

## Package identity

- Slug: `prizepicks-cheat-sheet-explained`
- Concept: “What Is in a PrizePicks Cheat Sheet?”
- Production state: public-published; exact review package and Public visibility approved.
- Built: August 17, 2026 on branch `codex/youtube-five-video-batch`.
- YouTube: Public and externally verified at `https://youtu.be/z-IRp7LxgXc` on August 18, 2026.

## Current versions

- Script: `script/final.txt` and sourced notes in `script/script.md` / `production-notes.md`
- Narration: `audio/narration.mp3` (normalized v2); source render preserved as `audio/narration-v1.mp3`
- Alignment: `audio/alignment.json`
- Caption JSON: `captions/captions.json`
- Timed upload captions: `captions/upload-en.srt`
- Semantic map: `semantic-map.tsv` (12 verified beats)
- Review render: `review/review.mp4` (normalized v4, 1280×720); versioned copy at `review/review-v4.mp4`
- Thumbnail: `thumbnail/thumbnail.png` (1280×720); source still preserved as `thumbnail/thumbnail-v1.png`
- Review contact sheet and frames: `review/contact-sheet.jpg`, `review/contact-sheet-v4.jpg`, `review/frames/final/`
- Final master: `final/master-1080p.mp4` (normalized v4, 1920×1080); versioned copy at `final/master-1080p-v4.mp4`
- Master QA sheet and frames: `final/qa/master-contact-sheet.jpg`, `final/qa/`
- YouTube metadata: `youtube-package.md`
- State/provenance: `production.json`
- Public YouTube entry: `z-IRp7LxgXc`; approved metadata, public 1280×720 thumbnail, 12 chapters, English (United States) timed captions, 1080p playback, embedding, and approved pinned comment verified.

## Provenance and source boundary

- Narration provider/voice: local Kokoro, stock `am_michael`; ElevenLabs was not used.
- Narration: mono MP3, 44.1 kHz, 128 kbps, 232.900 seconds.
- Alignment: all 532 script words represented; 64 ordered SRT cues.
- Visual system: Remotion 4.0.512, 30 fps, cursor-guided browser walkthrough graphics, burned-in captions with an 88 px lower safe margin, and narration-aligned line/confidence/evidence/freshness focus.
- Accepted public-page captures: matching desktop and mobile August 17, 2026 captures of Christian Franklin RBIs 0.5, Under, 79 model confidence.
- Dated detail: source-analysis timestamp `2026-08-17T20:30:12Z`; hit-rate, ballpark, usage, market, and injury agents; injury input unavailable.
- Platform result: no platform-backed PrizePicks record at capture time. The video persistently labels the row as dated Propeller research and ends with “NO VERIFIED PRIZEPICKS MATCH.”

Full sourced notes and URLs are recorded in `production-notes.md` and `production.json`.

## Validation summary

- Remotion lint and TypeScript: passed.
- Review: H.264 High, AAC LC, 1280×720, 30 fps, 233.000 seconds, 17,304,296 bytes.
- Master: H.264 High, AAC LC, 1920×1080, 30 fps, full-range 4:2:0, 233.000 seconds, 18,843,227 bytes, fast-start.
- Master audio: stereo AAC, 48 kHz, -14.6 LUFS integrated, -2.4 dBFS true peak.
- Full review and master decodes: passed with no FFmpeg errors.
- Black-frame scan: no qualifying interval at 0.5 seconds / pixel threshold 0.02.
- Silence scan: no qualifying interval above 1.5 seconds at -45 dB.
- Thumbnail: 1280×720 PNG, 308,215 bytes, below 2 MB.
- Captions: 532 ordered word timings and 64 ordered SRT cues; final word ends at 231.900 seconds.
- Semantic map: all 12 beats verified against the final cut; evidence-card highlights use the aligned spoken-word timestamps.
- Contact sheets and master representative frames: inspected for correct scene correspondence, readable focal points, 88 px caption safety, matching dated examples, and absence of a fabricated platform line.
- Independent visual review: passed after cursor, caption-safe, and narration-aligned evidence-timing corrections.
- Independent code/package review: passed with all declared deliverables present and no remaining blocker.
- Website: shared shell, structured-data, sitemap, release-ID refusal, idempotency, pending-player, and desktop/mobile-responsive layout checks passed.

## Pending gates

- None. The companion page deployed successfully through GitHub Pages run `32188895040`; live bytes matched `origin/master` at `9d1761dbe`, and the real-ID lazy player, analytics placement, internal links, transcript, and `VideoObject` were verified in production.
