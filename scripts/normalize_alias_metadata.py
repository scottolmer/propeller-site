#!/usr/bin/env python3
"""Keep legacy sport-page metadata aligned with each declared canonical URL."""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ALIASES = {
    "nba": "https://propellerpicks.com/picks/nba/",
    "nfl": "https://propellerpicks.com/picks/nfl/",
    "nhl": "https://propellerpicks.com/picks/nhl/",
    "mlb": "https://propellerpicks.com/picks/mlb/",
    "soccer": "https://propellerpicks.com/picks/soccer/",
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed: list[Path] = []
    for sport, canonical in ALIASES.items():
        path = ROOT / sport / "index.html"
        source = path.read_text(encoding="utf-8")
        updated = source.replace(f"https://propellerpicks.com/{sport}/", canonical)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"alias_pages={len(ALIASES)} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
