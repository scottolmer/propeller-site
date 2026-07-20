#!/usr/bin/env python3
"""Keep the NFL research page's historical-row evidence aligned with the public snapshot."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data" / "performance-snapshot.json"
PAGE = ROOT / "picks" / "nfl" / "index.html"


def nfl_total() -> int:
    snapshot = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    bucket = next((row for row in snapshot.get("raw_sport_buckets", []) if row.get("key") == "nfl"), None)
    if not bucket or not isinstance(bucket.get("total"), int):
        raise ValueError("performance snapshot is missing the NFL raw-row total")
    return bucket["total"]


def render(source: str, total: int) -> str:
    count = f"{total:,}"
    source, description_changes = re.subn(
        r'("description": "NFL player prop research with matchup, injury, and market context\. Live slate research appears only when verified, alongside a transparent historical archive of )[0-9,]+( NFL analysis rows\.")',
        rf'\g<1>{count}\g<2>',
        source,
        count=1,
    )
    source, hero_changes = re.subn(
        r'(<span class="hero-stat-value">)[0-9,]+(</span>\s*<span class="hero-stat-label">Historical NFL Rows</span>)',
        rf'\g<1>{count}\g<2>',
        source,
        count=1,
    )
    source, card_changes = re.subn(
        r'(<span class="stat-card-value">)[0-9,]+(</span>\s*<span class="stat-card-label">Raw historical NFL analysis rows</span>)',
        rf'\g<1>{count}\g<2>',
        source,
        count=1,
    )
    if (description_changes, hero_changes, card_changes) != (1, 1, 1):
        raise ValueError("NFL page evidence markers are missing or changed unexpectedly")
    return source


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    source = PAGE.read_text(encoding="utf-8")
    updated = render(source, nfl_total())
    changed = source != updated
    if changed and not args.check:
        PAGE.write_text(updated, encoding="utf-8")
    print(f"nfl_page_evidence={'changed' if changed else 'current'}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
