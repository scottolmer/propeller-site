#!/usr/bin/env python3
"""Generate the v6 walkthrough narration locally with Kokoro."""

from pathlib import Path
import os
import re
import sys


ROOT = Path(__file__).resolve().parent
SCRIPT = ROOT / "script-v6.md"
OUTPUT = ROOT / "audio" / "narration-v6.mp3"
TTS_DIR = ROOT.parent / "tts"
TTS_PYTHON = TTS_DIR / ".venv" / "bin" / "python"
if Path(sys.prefix).resolve() != (TTS_DIR / ".venv").resolve():
    if not TTS_PYTHON.exists():
        raise SystemExit(f"Kokoro environment is missing: {TTS_PYTHON}")
    os.execv(str(TTS_PYTHON), [str(TTS_PYTHON), *sys.argv])
sys.path.insert(0, str(TTS_DIR))

from generate_kokoro import DEFAULT_VOICE, synthesize  # noqa: E402


def narration_text() -> str:
    markdown = SCRIPT.read_text()
    text = markdown.split("## Final narration", 1)[1].strip()
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"\n+", " ", text)
    return text.strip()


output = synthesize(narration_text(), OUTPUT, voice=DEFAULT_VOICE)
print(f"provider=Kokoro voice={DEFAULT_VOICE} output={output} bytes={output.stat().st_size}")
