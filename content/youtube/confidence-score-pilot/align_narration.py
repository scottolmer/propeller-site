#!/usr/bin/env python3
"""Create word-level timestamps from the final narration audio using local Whisper."""

from pathlib import Path
import json
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio" / "final-narration.mp3"
OUT = ROOT / "audio" / "whisper-alignment.json"
SRT = ROOT / "captions.srt"

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
    item = {
        "start": segment.start,
        "end": segment.end,
        "text": segment.text.strip(),
    }
    payload["segments"].append(item)
    for word in segment.words or []:
        payload["words"].append({
            "start": word.start,
            "end": word.end,
            "text": word.word.strip(),
            "probability": word.probability,
        })

OUT.write_text(json.dumps(payload, indent=2))
def timestamp(value):
    hours = int(value // 3600)
    minutes = int((value % 3600) // 60)
    seconds = int(value % 60)
    millis = int(round((value - int(value)) * 1000))
    return f"{hours:02}:{minutes:02}:{seconds:02},{millis:03}"

with SRT.open("w") as handle:
    for index, segment in enumerate(payload["segments"], 1):
        text = segment["text"]
        text = text.replace("real variants", "real variance")
        text = text.replace("sports book", "sportsbook")
        text = text.replace("promise-winning", "promise winning")
        handle.write(
            f"{index}\n{timestamp(segment['start'])} --> {timestamp(segment['end'])}\n{text}\n\n"
        )
print(f"segments={len(payload['segments'])} words={len(payload['words'])} duration={payload['duration']:.3f}")
