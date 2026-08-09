# Propeller local text to speech

Propeller's default YouTube narration provider is Kokoro. It runs locally, does
not require an API key, and writes audio that can be used directly by Remotion.

The local environment is installed at `.venv`. To rebuild it on another Mac:

```sh
brew install espeak-ng
python3.11 -m venv content/youtube/tts/.venv
content/youtube/tts/.venv/bin/pip install -r content/youtube/tts/requirements.txt
```

Python 3.11 and the pinned inference stack in `requirements.txt` are intentional.
Kokoro 0.9.4 leaves PyTorch and Transformers unconstrained, and newer
transitive releases can be incompatible with one another.

## Default voice

- Provider: Kokoro 0.9.4
- Model: `hexgrad/Kokoro-82M`
- Voice: `am_michael`
- Output: mono MP3 at 44.1 kHz / 128 kbps, or 24 kHz PCM WAV

## Generate narration

From the repository root:

```sh
python3 content/youtube/tts/generate_kokoro.py \
  --input path/to/voiceover.txt \
  --output path/to/voiceover.mp3
```

Use `--speed 0.95` for a more deliberate delivery or `--voice VOICE_ID` to
audition another installed Kokoro voice. The first generation downloads the
model and selected voice into the ignored `content/youtube/tts/.cache` folder.

Existing completed Propeller videos retain their original narration. Running a
video's `generate_*.py` script regenerates that video's narration with Kokoro.
