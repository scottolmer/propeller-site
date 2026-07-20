#!/usr/bin/env python3
"""Generate local, production-ready narration with Kokoro."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import subprocess
import sys
import tempfile

# Configure the cache before Hugging Face or Kokoro is imported.
ROOT = Path(__file__).resolve().parent
VENV_PYTHON = ROOT / ".venv" / "bin" / "python"
if Path(sys.prefix).resolve() != (ROOT / ".venv").resolve():
    if not VENV_PYTHON.exists():
        raise SystemExit(f"Kokoro environment is missing: {VENV_PYTHON}")
    os.execv(str(VENV_PYTHON), [str(VENV_PYTHON), *sys.argv])

os.environ.setdefault("HF_HOME", str(ROOT / ".cache" / "huggingface"))
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import numpy as np
import soundfile as sf
from kokoro import KPipeline


SAMPLE_RATE = 24_000
DEFAULT_VOICE = "am_michael"
MODEL_REPOSITORY = "hexgrad/Kokoro-82M"


def synthesize(text: str, output: Path, voice: str = DEFAULT_VOICE, speed: float = 1.0) -> Path:
    """Synthesize text and write WAV or MP3 audio to output."""
    text = text.strip()
    if not text:
        raise ValueError("Narration text is empty")
    if speed <= 0:
        raise ValueError("Speed must be greater than zero")

    output = output.expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    pipeline = KPipeline(
        lang_code="a",
        repo_id=MODEL_REPOSITORY,
        device="cpu",
    )
    chunks: list[np.ndarray] = []
    for result in pipeline(text, voice=voice, speed=speed, split_pattern=r"\n+"):
        if result.audio is not None:
            chunks.append(result.audio.detach().cpu().numpy())

    if not chunks:
        raise RuntimeError("Kokoro did not return any audio")

    audio = np.concatenate(chunks).astype(np.float32, copy=False)
    suffix = output.suffix.lower()
    if suffix == ".wav":
        sf.write(output, audio, SAMPLE_RATE, subtype="PCM_16")
    elif suffix == ".mp3":
        with tempfile.TemporaryDirectory(prefix="propeller-kokoro-") as temp_dir:
            wave_path = Path(temp_dir) / "narration.wav"
            sf.write(wave_path, audio, SAMPLE_RATE, subtype="PCM_16")
            subprocess.run(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-y",
                    "-i",
                    str(wave_path),
                    "-ar",
                    "44100",
                    "-ac",
                    "1",
                    "-b:a",
                    "128k",
                    str(output),
                ],
                check=True,
            )
    else:
        raise ValueError("Output must use a .wav or .mp3 extension")

    return output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--input", type=Path, help="UTF-8 text file to narrate")
    source.add_argument("--text", help="Text to narrate")
    parser.add_argument("--output", type=Path, required=True, help="Output .wav or .mp3")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="Kokoro voice ID")
    parser.add_argument("--speed", type=float, default=1.0, help="Speaking speed multiplier")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    text = args.input.read_text(encoding="utf-8") if args.input else args.text
    output = synthesize(text, args.output, voice=args.voice, speed=args.speed)
    print(f"provider=Kokoro voice={args.voice} output={output} bytes={output.stat().st_size}")


if __name__ == "__main__":
    main()
