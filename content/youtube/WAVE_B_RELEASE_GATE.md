# Wave B release gate

The two approved review packages are uploaded and owner-verified as Private. They are deliberately not public or embedded yet.

- Cheat-sheet explainer: `z-IRp7LxgXc` — Private, 1080p, captioned, checks passed.
- Research-page walkthrough: `yO6gWjmH_5w` — Private, 1080p, captioned, checks passed.

After Scott approves the exact review packages and explicitly chooses the visibility:

1. Completed August 17, 2026: uploaded the approved masters as Private videos with their supplied thumbnails, metadata, and timed SRT captions.
2. Completed August 17, 2026: confirmed 1080p owner playback, caption tracks, thumbnails, chapters, description links, Private visibility, and the exact review URLs.
3. Obtain explicit approval for public visibility.
4. Make both videos public in coordination with the companion-page release.
5. Apply the real IDs—never placeholders—with:

   ```bash
   python3 scripts/apply_wave_b_video_integrations.py \
     --cheat-sheet-video-id REAL_11_CHARACTER_ID \
     --walkthrough-video-id REAL_11_CHARACTER_ID \
     --cheat-sheet-upload-date YYYY-MM-DD \
     --walkthrough-upload-date YYYY-MM-DD
   ```

6. Run the website tests and verify each live lazy player, analytics placement, internal link, transcript, and `VideoObject` against the public video.

The script refuses placeholder IDs. Until this sequence is approved and completed, each companion page keeps a non-clickable pending block and omits `VideoObject` schema.
