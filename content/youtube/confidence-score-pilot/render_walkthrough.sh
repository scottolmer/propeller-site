#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VIS="$ROOT/walkthrough-visuals"
SEG="$ROOT/walkthrough-render-segments"
OUT="$ROOT/final"
TIMELINE="$ROOT/walkthrough-timeline.tsv"
mkdir -p "$SEG" "$OUT"
rm -f "$SEG"/*.mp4 "$SEG/concat.txt"

index=0
while IFS=$'\t' read -r asset duration; do
  index=$((index + 1))
  image="$VIS/$asset"
  number="$(printf '%02d' "$index")"
  filter="scale=1920:1080,zoompan=z='min(zoom+0.000035,1.016)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,format=yuv420p"
  ffmpeg -nostdin -hide_banner -loglevel error -y \
    -loop 1 -framerate 30 -t "$duration" -i "$image" \
    -vf "$filter" \
    -an -c:v libx264 -preset veryfast -crf 19 -r 30 \
    "$SEG/$number.mp4"
  printf "file '%s'\n" "$SEG/$number.mp4" >> "$SEG/concat.txt"
done < "$TIMELINE"

ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i "$SEG/concat.txt" \
  -i "$ROOT/audio/narration-v6.mp3" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  "$OUT/confidence-score-walkthrough-v6.mp4"

ffmpeg -hide_banner -loglevel error -y \
  -i "$OUT/confidence-score-walkthrough-v6.mp4" \
  -vf "scale=1280:720" -c:v libx264 -preset veryfast -crf 24 \
  -c:a aac -b:a 128k -movflags +faststart \
  "$OUT/confidence-score-walkthrough-v6-review.mp4"
