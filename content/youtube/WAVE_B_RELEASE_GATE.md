# Wave B release gate

The two approved review packages are Public and externally verified. Their real IDs are deployed and live-verified on the companion pages.

- Cheat-sheet explainer: `z-IRp7LxgXc` — Public, embeddable, 1080p, 12 chapters, en-US captions, approved pinned comment, thumbnail and checks passed.
- Research-page walkthrough: `yO6gWjmH_5w` — Public, embeddable, 1080p, 15 chapters, en-US captions, approved pinned comment, thumbnail and checks passed.

After Scott approves the exact review packages and explicitly chooses the visibility:

1. Completed August 17, 2026: uploaded the approved masters as Private videos with their supplied thumbnails, metadata, and timed SRT captions.
2. Completed August 17, 2026: confirmed 1080p owner playback, caption tracks, thumbnails, chapters, description links, Private visibility, and the exact review URLs.
3. Completed August 18, 2026: obtained explicit approval for Public visibility and webpage deployment.
4. Completed August 18, 2026: made both videos Public with embedding enabled and verified them from an external client and the owner watch pages.
5. Completed August 18, 2026: applied the real IDs and public upload dates with:

   ```bash
   python3 scripts/apply_wave_b_video_integrations.py \
     --cheat-sheet-video-id z-IRp7LxgXc \
     --walkthrough-video-id yO6gWjmH_5w \
     --cheat-sheet-upload-date 2026-08-18 \
     --walkthrough-upload-date 2026-08-18
   ```

6. Completed August 18, 2026: passed the website tests, merged PR #68, completed GitHub Pages runs `32188584256` and `32188895040`, matched the final live bytes to `origin/master` at `9d1761dbe`, and verified each live lazy player, analytics placement, internal link, transcript, and `VideoObject` against the public video.

The script refuses placeholder IDs. Both Public videos and companion pages are released; no publication or deployment gates remain.
