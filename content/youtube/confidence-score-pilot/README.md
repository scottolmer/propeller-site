# Confidence score pilot package

## Ready to upload

- `final/confidence-score-walkthrough-v6.mp4` — rebuilt 1920×1080 product-walkthrough master, 5:32.5
- `final/confidence-score-walkthrough-v6-review.mp4` — smaller 720p walkthrough review copy
- `captions-v6.srt` — captions aligned from the walkthrough narration
- `script-v6.md` — interface-led narration matching the real historical example
- `final/confidence-score-pilot.mp4` — 1920×1080 master, 5:41.7
- `thumbnail.png` — 1920×1080 YouTube thumbnail
- `captions.srt` — full narration captions aligned from the final audio
- `youtube-package.md` — title, description, chapters, tags, and pinned comment

## Source assets

- `audio/final-narration.mp3` — selected ElevenLabs stock voice
- `script.md` — final narration and accuracy notes
- `storyboard.md` — visual plan and shot list
- `transcript.txt` — clean spoken transcript
- `captures/` — real Propeller website and authenticated app captures
- `visuals/` — rendered 1920×1080 scene cards

## Review and rebuild

- `review/walkthrough-video-contact-v6.jpg` — representative frame from all 22 rendered walkthrough scenes
- `walkthrough-alignment-v6.md` — exact narration-to-interface map
- `build_walkthrough_assets.py` — regenerates the professional desktop/mobile walkthrough frames
- `render_walkthrough.sh` — renders the v6 walkthrough master and review copy
- `final/confidence-score-pilot-review.mp4` — smaller 720p review copy
- `review/contact-sheet-v5.jpg` — representative-frame contact sheet for the strict semantic cut
- `review/semantic-checks-v5.jpg` — sentence-level visual QA at the key walkthrough transitions
- `review/four-checks-actual-audio-v4.mp4` — review clip covering the four checks and matching screens
- `review/score-methodology-actual-audio-v4.mp4` — review clip covering raw score, normalized confidence, and market probability
- `alignment-v5.md` — exact narration-to-visual map and semantic matching rules
- `audio/whisper-alignment.json` — local word-level timestamps from the finished narration
- `build_assets.py` — regenerates scene cards, thumbnail, transcript, and captions
- `render_video.sh` — regenerates the master and review videos with FFmpeg

The v5 strict semantic cut never shows a different real score, side, line, or stat while the narrator explains the 72 / OVER 6.5 example. Real desktop screens appear only during matching board, evidence, and model-workflow narration. Timing comes from word-level transcription of the finished ElevenLabs audio rather than estimated reading speed.

The v6 cut replaces the slide-deck approach with a product walkthrough. The narration uses one real historical prop consistently across desktop and mobile, explicitly distinguishes the 79-confidence example from the meaning of a hypothetical 72, and shows the exact confidence, line, Why This Lean, Model Read, and agent-breakdown locations as they are discussed.
