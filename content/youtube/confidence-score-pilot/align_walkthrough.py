#!/usr/bin/env python3
"""Create word-level timestamps and captions for the v6 walkthrough narration."""

from pathlib import Path
import json
from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio" / "narration-v6.mp3"
OUT = ROOT / "audio" / "walkthrough-alignment.json"
SRT = ROOT / "captions-v6.srt"

model = WhisperModel("base.en", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    str(AUDIO),
    language="en",
    beam_size=5,
    word_timestamps=True,
    vad_filter=False,
)

payload = {
    "language": info.language,
    "language_probability": info.language_probability,
    "duration": info.duration,
    "segments": [],
    "words": [],
}

for segment in segments:
    payload["segments"].append({
        "start": segment.start,
        "end": segment.end,
        "text": segment.text.strip(),
    })
    for word in segment.words or []:
        payload["words"].append({
            "start": word.start,
            "end": word.end,
            "text": word.word.strip(),
            "probability": word.probability,
        })

OUT.write_text(json.dumps(payload, indent=2))


def timestamp(value: float) -> str:
    hours = int(value // 3600)
    minutes = int((value % 3600) // 60)
    seconds = int(value % 60)
    millis = int(round((value - int(value)) * 1000))
    return f"{hours:02}:{minutes:02}:{seconds:02},{millis:03}"


with SRT.open("w") as handle:
    for index, segment in enumerate(payload["segments"], 1):
        handle.write(
            f"{index}\n{timestamp(segment['start'])} --> {timestamp(segment['end'])}\n"
            f"{segment['text']}\n\n"
        )

print(
    f"segments={len(payload['segments'])} words={len(payload['words'])} "
    f"duration={payload['duration']:.3f}"
)
