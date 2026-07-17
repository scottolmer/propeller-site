#!/usr/bin/env python3
"""Generate conservative legacy sport aliases for GitHub Pages.

GitHub Pages cannot emit per-path HTTP redirects. These small alias documents
therefore use noindex, a canonical, an immediate meta refresh, and a normal
anchor as the safest available interim redirect contract.
"""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ALIASES = {
    "nba": ("NBA", "/picks/nba/"),
    "nfl": ("NFL", "/picks/nfl/"),
    "nhl": ("NHL", "/picks/nhl/"),
    "mlb": ("MLB", "/picks/mlb/"),
    "soccer": ("Soccer", "/picks/soccer/"),
}


def alias_document(label: str, target: str) -> str:
    canonical = f"https://propellerpicks.com{target}"
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{label} player prop research moved | Propeller Picks</title>
  <meta name="description" content="Propeller's {label} player prop research page has moved to its canonical location.">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="{canonical}">
  <meta http-equiv="refresh" content="0;url={target}">
  <script>window.location.replace('{target}');</script>
  <style>
    body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2efe8;color:#101311;font:16px/1.6 system-ui,sans-serif}}
    main{{width:min(560px,calc(100% - 40px));padding:40px;border:1px solid #101311;background:#fff;box-shadow:9px 9px 0 #ff6038}}
    a{{color:#b33114;font-weight:750;text-underline-offset:3px}}
  </style>
</head>
<body>
  <main>
    <h1>{label} player prop research moved</h1>
    <p>The current {label} research board now lives at its canonical URL.</p>
    <p><a href="{target}">Continue to {label} player prop research</a></p>
  </main>
</body>
</html>
'''


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed: list[Path] = []
    for sport, (label, target) in ALIASES.items():
        path = ROOT / sport / "index.html"
        expected = alias_document(label, target)
        source = path.read_text(encoding="utf-8")
        if source != expected:
            changed.append(path)
            if not args.check:
                path.write_text(expected, encoding="utf-8")
    print(f"alias_pages={len(ALIASES)} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
