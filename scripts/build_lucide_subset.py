#!/usr/bin/env python3
"""Maintain the local Lucide icon subset used by public pages."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "assets/js/lucide-subset.js"
HEADER = "/* Lucide icon subset v0.344.0. See /assets/js/LICENSE-lucide.txt. */\n(function(){'use strict';\n"
REQUIRED_DYNAMIC_ICONS = {
    "arrow-up": '<path d="m5 12 7-7 7 7" /> <path d="M12 19V5" />',
    "arrow-down": '<path d="M12 5v14" /> <path d="m19 12-7 7-7-7" />',
}


def build(source: str) -> str:
    start = source.index("const ICONS=") + len("const ICONS=")
    end = source.index(";\nfunction createIcons", start)
    icons = json.loads(source[start:end])
    icons.update(REQUIRED_DYNAMIC_ICONS)
    payload = json.dumps(dict(sorted(icons.items())), separators=(",", ":"), ensure_ascii=True)
    return f"{HEADER}const ICONS={payload}{source[end:].rstrip()}\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    source = TARGET.read_text(encoding="utf-8")
    updated = build(source)
    changed = updated != source
    if changed and not args.check:
        TARGET.write_text(updated, encoding="utf-8")
    print(f"lucide_subset_changed={int(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
