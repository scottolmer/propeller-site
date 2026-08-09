#!/usr/bin/env python3
"""Generate the player-prop six-signals narration locally with Kokoro."""

from pathlib import Path
import os
import sys


ROOT = Path(__file__).resolve().parent
SCRIPT = ROOT / "voiceover-final.txt"
OUTPUT_DIR = ROOT / "audio"
OUTPUT = OUTPUT_DIR / "voiceover-final.mp3"
TTS_DIR = ROOT.parent / "tts"
TTS_PYTHON = TTS_DIR / ".venv" / "bin" / "python"
if Path(sys.prefix).resolve() != (TTS_DIR / ".venv").resolve():
    if not TTS_PYTHON.exists():
        raise SystemExit(f"Kokoro environment is missing: {TTS_PYTHON}")
    os.execv(str(TTS_PYTHON), [str(TTS_PYTHON), *sys.argv])
sys.path.insert(0, str(TTS_DIR))

from generate_kokoro import DEFAULT_VOICE, synthesize  # noqa: E402


output = synthesize(SCRIPT.read_text(encoding="utf-8"), OUTPUT, voice=DEFAULT_VOICE)
print(f"provider=Kokoro voice={DEFAULT_VOICE} output={output} bytes={output.stat().st_size}")
