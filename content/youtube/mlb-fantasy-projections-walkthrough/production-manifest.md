# Production manifest

## Approved creative

- Concept: How to Use Propeller’s MLB Fantasy Projections: Floor, Ceiling & Sit/Start
- Script approval: Explicit user approval on July 18, 2026
- Narration: Local Kokoro 0.9.4, stock voice `am_michael`
- Narration duration: 324.85 seconds
- Alignment: 752 exact words, 738 direct ASR matches, 89 caption cues

## Visual provenance

- Public desktop fantasy landing and MLB board captured July 18, 2026 from `propellerpicks.com`.
- Real public-board states captured for Projected, Floor, and Ceiling at 1600 × 1000.
- Real responsive public-board states captured at 430 × 932.
- Live player values were verified against the public Fantasy API on July 18, 2026.
- The authenticated web Sit/Start interface and native mobile Fantasy screen are source-faithful Remotion reconstructions based on the shipped `origin/main` components and the same live data.
- The authenticated browser bridge and iOS simulator were unavailable during capture. Reconstructions are labeled inside the video and are not represented as raw screenshots.

## Brand and editorial system

- Treatment: Broadcast-editorial product walkthrough
- Primary dark: `#101311`
- Primary orange: `#ff6038`
- Success green: `#147d50`
- Paper: `#f2efe8`
- Accent lime: `#bdf477`
- Display: Familjen Grotesk
- Body: IBM Plex Sans
- Data labels: IBM Plex Mono

## Current deliverables

- Script: `script/final.txt`
- Narration: `audio/narration.mp3`
- Alignment: `audio/alignment.json`
- Upload captions: `captions/upload-en.srt`
- Caption JSON: `captions/captions.json`
- Remotion source: `remotion/`
- Review render: `review/review.mp4`
- Contact sheet: `review/contact-sheet.jpg`
- 1080p master: `final/master-1080p.mp4`
- Thumbnail: `thumbnail/thumbnail.png`
- YouTube metadata: `youtube-package.md`
- Checksums: `checksums.sha256`

## Technical validation

- Master: 1920 × 1080, 30 fps, H.264/AAC, 4:2:0, 324.928 seconds
- Review: 1280 × 720, 30 fps, H.264/AAC, 324.928 seconds
- Thumbnail: 1280 × 720 PNG, 150 KB
- Upload captions: 89 monotonic, non-overlapping English cues
- Full master decode: Passed
- Remotion lint and TypeScript: Passed
- Package validator: Passed with zero errors and zero warnings

## Review limitations

- The review cut has not yet received explicit user approval.
- The 1080p master is complete but is not authorized for upload until the review package is approved.
- YouTube upload and publication are not authorized.
