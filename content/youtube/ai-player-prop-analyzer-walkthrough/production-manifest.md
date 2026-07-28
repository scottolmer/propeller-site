# Production manifest

## Current artifacts

| Artifact | Current file | Notes |
|---|---|---|
| Narration | `audio/narration-v1.mp3` | Kokoro `am_michael`; 238.701 seconds; mono 44.1 kHz MP3. |
| Alignment | `audio/alignment-v1.json` | 594 exact script tokens; 586 ASR timestamp matches. |
| Captions | `captions/upload-en-v1.srt` | Timed English upload captions; 69 cues. |
| Review cut | `review/review-v1.mp4` | 1280×720 H.264/AAC; 30 fps. |
| Master | `final/master-1080p-v2.mp4` | 1920×1080 H.264/AAC; 30 fps; yuv420p limited range; fast-start. |
| Thumbnail | `thumbnail/thumbnail-v1.png` | 1280×720 PNG; 721 KB. |

## Visual provenance

- Current public analyzer and current authenticated mobile empty-slate captures were collected on July 21, 2026.
- The current public feed returned no rows. The video represents this truthfully with a labelled no-current-props state.
- The detailed desktop and mobile product walkthrough uses one internally consistent July 2026 historical example. Every such scene carries the on-screen label `ILLUSTRATIVE HISTORICAL CAPTURE · JULY 2026`.

## Review QA completed

- Script and narration timing matched against the semantic map.
- Frame checks inspected confidence, agent breakdown, freshness/no-current-props, and closing scenes.
- Review cut fully decoded with FFmpeg.
- Remotion lint and TypeScript checks passed before render.
- Uploaded privately to the verified Propeller Picks channel as `FNvAvgBtq9o` on July 21, 2026. The approved metadata, thumbnail, English language, Sports category, and timed English captions are present.
- SD and HD processing completed; copyright and Community Guidelines checks reported no issues. Public release and scheduling remain intentionally separate approval steps.
