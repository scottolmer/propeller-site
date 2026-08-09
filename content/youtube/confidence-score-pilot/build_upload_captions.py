#!/usr/bin/env python3
"""Build an exact-script SRT for the final confidence-score narration."""

from difflib import SequenceMatcher
from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parent
SCRIPT = ROOT / "script-v6.md"
ALIGNMENT = ROOT / "audio" / "walkthrough-alignment.json"
OUTPUT = ROOT / "captions-upload-en.srt"


def normalize(token: str) -> str:
    token = token.lower().replace("’", "'")
    return re.sub(r"[^a-z0-9]", "", token)


def timestamp(value: float) -> str:
    millis = max(0, round(value * 1000))
    hours, remainder = divmod(millis, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds, millis = divmod(remainder, 1_000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{millis:03}"


def wrap_two_lines(text: str, target_width: int = 42) -> str:
    if len(text) <= target_width:
        return text
    words = text.split()
    split_at = min(
        range(1, len(words)),
        key=lambda index: abs(
            len(" ".join(words[:index])) - len(" ".join(words[index:]))
        ),
    )
    return f"{' '.join(words[:split_at])}\n{' '.join(words[split_at:])}"


markdown = SCRIPT.read_text()
exact_text = markdown.split("## Final narration", 1)[1].strip()
exact_tokens = exact_text.split()
alignment = json.loads(ALIGNMENT.read_text())
asr_words = alignment["words"]

exact_normalized = [normalize(token) for token in exact_tokens]
asr_normalized = [normalize(word["text"]) for word in asr_words]
matcher = SequenceMatcher(None, exact_normalized, asr_normalized, autojunk=False)

mapped: dict[int, int] = {}
for exact_start, asr_start, length in matcher.get_matching_blocks():
    for offset in range(length):
        mapped[exact_start + offset] = asr_start + offset

timings: list[tuple[float, float]] = [(0.0, 0.0)] * len(exact_tokens)
for exact_index, asr_index in mapped.items():
    timings[exact_index] = (asr_words[asr_index]["start"], asr_words[asr_index]["end"])

mapped_indices = sorted(mapped)
boundaries = [-1, *mapped_indices, len(exact_tokens)]
for boundary_index in range(len(boundaries) - 1):
    left = boundaries[boundary_index]
    right = boundaries[boundary_index + 1]
    if right - left <= 1:
        continue

    missing = list(range(left + 1, right))
    left_time = asr_words[mapped[left]]["end"] if left >= 0 else 0.0
    right_time = (
        asr_words[mapped[right]]["start"]
        if right < len(exact_tokens)
        else alignment["duration"]
    )
    available = max(0.08 * len(missing), right_time - left_time)
    step = available / len(missing)
    for offset, exact_index in enumerate(missing):
        timings[exact_index] = (
            left_time + offset * step,
            left_time + (offset + 1) * step,
        )

cues: list[dict[str, object]] = []
current: list[int] = []


def flush() -> None:
    if not current:
        return
    cues.append(
        {
            "start": timings[current[0]][0],
            "end": timings[current[-1]][1],
            "text": " ".join(exact_tokens[index] for index in current),
        }
    )
    current.clear()


for index, token in enumerate(exact_tokens):
    candidate = " ".join(exact_tokens[item] for item in [*current, index])
    current.append(index)
    sentence_end = token.endswith((".", "?", "!"))
    clause_end = token.endswith((",", ";", ":"))
    duration = timings[current[-1]][1] - timings[current[0]][0]
    if (
        len(current) >= 11
        or len(candidate) >= 76
        or duration >= 5.2
        or (sentence_end and len(current) >= 4)
        or (clause_end and len(current) >= 7)
    ):
        flush()

flush()

for index, cue in enumerate(cues):
    start = float(cue["start"])
    end = float(cue["end"])
    next_start = float(cues[index + 1]["start"]) if index + 1 < len(cues) else alignment["duration"]
    cue["start"] = max(0.0, start - 0.04)
    cue["end"] = max(start + 0.65, min(end + 0.12, next_start - 0.03))

for index in range(len(cues) - 1):
    next_start = float(cues[index + 1]["start"])
    cues[index]["end"] = min(float(cues[index]["end"]), next_start - 0.01)

with OUTPUT.open("w") as handle:
    for index, cue in enumerate(cues, 1):
        wrapped = wrap_two_lines(str(cue["text"]))
        handle.write(
            f"{index}\n{timestamp(float(cue['start']))} --> {timestamp(float(cue['end']))}\n"
            f"{wrapped}\n\n"
        )

print(
    f"cues={len(cues)} exact_words={len(exact_tokens)} "
    f"timestamp_matches={len(mapped)} last_end={float(cues[-1]['end']):.3f} "
    f"output={OUTPUT}"
)
