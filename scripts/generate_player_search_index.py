#!/usr/bin/env python3
"""Build the homepage player-search index from the analyzer player pages."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "player-search.json"
SPORTS = ("nfl", "nba", "mlb", "nhl", "soccer")
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.DOTALL | re.IGNORECASE)


def player_name(title: str) -> str:
    name = html.unescape(title)
    for separator in (" Historical", " —", " |"):
        name = name.split(separator)[0]
    name = " ".join(name.split())
    if name == name.lower():
        name = " ".join(word[:1].upper() + word[1:] for word in name.split())
    return name


def build() -> str:
    players: list[list[str]] = []
    seen: set[tuple[str, str]] = set()
    for sport in SPORTS:
        for page in sorted((ROOT / "analyzer" / sport).glob("*/index.html")):
            match = TITLE_RE.search(page.read_text(encoding="utf-8", errors="ignore")[:4000])
            if not match:
                continue
            name = player_name(match.group(1))
            key = (sport, name.casefold())
            if not name or key in seen:
                continue
            seen.add(key)
            players.append([name, sport, page.parent.name])
    document = {
        "source": "Titles of /analyzer/<sport>/<slug>/ player pages",
        "fields": ["name", "sport", "slug"],
        "players": players,
    }
    return json.dumps(document, ensure_ascii=False, separators=(",", ":")) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if the committed index is out of date")
    args = parser.parse_args()
    expected = build()
    current = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
    if args.check:
        if current != expected:
            print(f"out_of_date={OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"player_search_index=current players={len(json.loads(expected)['players'])}")
        return 0
    OUTPUT.write_text(expected, encoding="utf-8")
    print(f"wrote={OUTPUT.relative_to(ROOT)} players={len(json.loads(expected)['players'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
