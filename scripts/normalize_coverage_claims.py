#!/usr/bin/env python3
"""Remove universal prop-coverage claims that public feeds cannot prove."""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = {
    "every available player prop": "the player props currently available",
    "Every available player prop": "The player props currently available",
    "every available prop line": "the prop lines currently available",
    "Every available prop line": "The prop lines currently available",
    "every available NBA player prop": "the NBA player props currently available",
    "Every available NBA player prop": "The NBA player props currently available",
    "on every player prop": "on each listed player prop",
    "On every player prop": "On each listed player prop",
    "score every player prop": "score listed player props",
    "scores every player prop": "scores listed player props",
    "scoring every player prop": "scoring listed player props",
    "analyze every player prop": "analyze listed player props",
    "analyzes every player prop": "analyzes listed player props",
    "analyzing every player prop": "analyzing listed player props",
    "score every NBA player prop": "score listed NBA player props",
    "scores every NBA player prop": "scores listed NBA player props",
    "analyze every NBA player prop": "analyze listed NBA player props",
    "analyzes every NBA player prop": "analyzes listed NBA player props",
    "score every NHL player prop": "score listed NHL player props",
    "scores every NHL player prop": "scores listed NHL player props",
    "analyze every NHL player prop": "analyze listed NHL player props",
    "analyzes every NHL player prop": "analyzes listed NHL player props",
    "score every MLB player prop": "score listed MLB player props",
    "scores every MLB player prop": "scores listed MLB player props",
    "analyze every MLB player prop": "analyze listed MLB player props",
    "analyzes every MLB player prop": "analyzes listed MLB player props",
    "Propeller generates a confidence score for every available player prop":
        "Propeller generates a confidence score for listed player props",
    "Every prop analyzed by Propeller receives": "Each listed prop receives",
    "without manually evaluating every available prop":
        "without manually evaluating every listed prop",
    "Every game on today's schedule, every player prop, every confidence score":
        "Available games, listed player props, and their confidence scores",
    "Every MLB game day. Every prop type. Eight agents scoring every batter and pitcher":
        "On active MLB slates, eight agents score listed batter and pitcher props",
    "Every NBA game night. Every prop type. Eight agents scoring every player":
        "On active NBA slates, eight agents score listed player props",
    "Every NHL game night. Every prop type. Six agents scoring every player":
        "On active NHL slates, six agents score listed player props",
    "Every NFL Sunday. Every prop type. Eight agents scoring every player":
        "On active NFL slates, eight agents score listed player props",
    "Every EPL and MLS matchday. Every prop type. Seven agents scoring every confirmed starter":
        "On active EPL and MLS slates, seven agents score listed props for confirmed starters",
    "Every sport. Every game day. Eight agents scoring every player prop":
        "Across supported sports and active slates, eight agents score listed player props",
    "Every sport. Every prop type. Eight agents scoring every player every game day":
        "Across supported sports and active slates, eight agents score listed player props",
    "every prop with confidence ratings": "listed props with confidence ratings",
    "score every prop with confidence percentages": "score listed props with confidence scores",
    "score every prop with confidence ratings": "score listed props with confidence ratings",
    "score every prop independently": "score each listed prop independently",
    "scoring every prop": "scoring listed props",
    "analyzing every prop": "analyzing listed props",
    "calibrated weighted average": "weighted combination",
    "percentage confidence score": "model confidence score",
    "confidence percentages": "model confidence scores",
    "confidence percentage": "model confidence score",
    "confidence score from 50% to 100%": "confidence score on a 50 to 100 scale",
    "a number from 50 to 100": "a model signal on a 50 to 100 scale",
    "confidence score above 60%": "confidence score above 60",
    "props scoring above 60% confidence": "props scoring above 60",
    "65% confidence": "a confidence score of 65",
    "67% confidence": "a confidence score of 67",
    "68% confidence": "a confidence score of 68",
    "62% confidence": "a confidence score of 62",
    "52% confidence score": "a confidence score of 52",
    "a 58% prop": "a prop with a score of 58",
    "50% is neutral and 100% is maximum conviction":
        "50 is neutral and 100 is maximum model conviction",
    "currently available across all sports": "currently available across supported sports",
    "Every sport. Every game day. Eight agents scoring listed player props":
        "Across supported sports and active slates, eight agents score listed player props",
    "Confidence percentages, not gut feelings": "Model confidence scores, not gut feelings",
    "The agents are weighted by their historical predictive accuracy on NBA props specifically — not a generic model, but a backtested, sport-specific calibration.":
        "The agents use sport-specific weights rather than a single generic configuration. The resulting score is a directional model signal, not a calibrated win probability.",
}

FORBIDDEN = (
    "every available player prop",
    "every available prop line",
    "score every player prop",
    "scores every player prop",
    "scoring every player prop",
    "analyze every player prop",
    "analyzes every player prop",
    "analyzing every player prop",
    "every prop analyzed by propeller",
)


def iter_html() -> list[Path]:
    return [
        path
        for path in ROOT.rglob("*.html")
        if not any(part in {".git", "node_modules"} for part in path.parts)
    ]


def normalize(text: str) -> str:
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    return text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    paths = iter_html()
    changed = 0
    violations: list[str] = []
    for path in paths:
        original = path.read_text()
        updated = normalize(original)
        if updated != original:
            changed += 1
            if not args.check:
                path.write_text(updated)
        lowered = updated.lower()
        for phrase in FORBIDDEN:
            if phrase in lowered:
                violations.append(f"{path.relative_to(ROOT)}: {phrase}")

    print(f"checked={len(paths)} changed={changed} violations={len(violations)}")
    for violation in violations[:50]:
        print(violation)
    if violations or (args.check and changed):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
