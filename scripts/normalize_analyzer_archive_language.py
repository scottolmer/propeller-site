#!/usr/bin/env python3
"""Label analyzer history as descriptive rows, not unique published picks."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def normalize(source: str) -> str:
    source = source.replace(
        "Prop Analysis &amp; Win Rate — AI Confidence Scores",
        "Historical Prop Analysis — AI Signal Context",
    ).replace(
        "Prop Analysis & Win Rate — AI Confidence Scores",
        "Historical Prop Analysis — AI Signal Context",
    ).replace(
        "Props &amp; Win Rate | Propeller",
        "Historical Prop Analysis | Propeller Picks",
    ).replace(
        "Props & Win Rate | Propeller",
        "Historical Prop Analysis | Propeller Picks",
    )
    source = re.sub(
        r"([0-9]+(?:\.[0-9]+)?%) win rate across ([0-9,]+) graded picks\.",
        r"\1 historical outcome rate across \2 graded analysis rows; repeated snapshots or retrospective data may be included.",
        source,
    )
    source = source.replace(">Win Rate</", ">Historical Outcome Rate</")
    source = source.replace(">Win Rate<", ">Historical Outcome Rate<")
    source = source.replace(
        "Win rates reflect graded predictions against actual outcomes.",
        "Historical rates summarize graded analysis rows; repeated snapshots and retrospective data may be included, so they are not a forward-tested ROI claim.",
    )
    source = source.replace(
        "Win rates reflect graded picks against actual outcomes.",
        "Historical rates summarize graded analysis rows; repeated snapshots and retrospective data may be included, so they are not a forward-tested ROI claim.",
    )
    if 'content="noindex,follow"' in source and 'data-current-props="true"' not in source:
        source = source.replace("Prop Analysis Today", "Historical Prop Analysis")
        source = source.replace("Props Today | Propeller", "Historical Prop Analysis | Propeller Picks")
        source = source.replace(" props today.", " historical prop records.")
        source = source.replace(
            "Updated daily.",
            "Historical records may include repeated snapshots or retrospective data.",
        )
    return source


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    files = sorted((ROOT / "analyzer").glob("*/*/index.html"))
    changed = []
    for path in files:
        source = path.read_text(encoding="utf-8")
        updated = normalize(source)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"checked={len(files)} changed={len(changed)}")
    if args.check and changed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
