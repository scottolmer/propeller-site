#!/usr/bin/env python3
"""Remove stale hard-coded tier limits from generated marketing pages."""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "docs", "mockups"}

REPLACEMENTS = (
    ("Free tier includes 5 analyzed props per day. No credit card required.", "Current access and availability are shown at signup."),
    ("5 fully analyzed picks per day. No credit card. See exactly why each prop is scored the way it is - before you enter.", "Open the workspace to inspect the reasoning behind available props. Current access terms are shown at signup."),
    ("with premium access available through the Propeller app.", "with current access details shown in the Propeller app."),
    ("Free users receive the top 3 picks each day. Premium subscribers unlock the full ranked slate across all sports.", "A public sample may be shown on this page. Current full-slate availability and access details are shown in the app."),
    ("Showing <strong>5 free picks</strong> today. Unlock all NHL picks plus NBA, NFL, MLB, and more with Propeller Premium.", "Showing a public sample when available. Open the Propeller app for current full-slate availability and access details."),
    ("Unlock premium picks", "Open the full slate"),
    ("Unlock Premium", "Open Full Slate"),
    ("Premium pick — unlock to view", "Full app pick — open to view"),
    ("Premium Pick", "Full App Pick"),
)


def normalize(source: str) -> str:
    for old, new in REPLACEMENTS:
        source = source.replace(old, new)
    return source


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    files = [
        path for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)
    ]
    changed = []
    for path in sorted(files):
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
