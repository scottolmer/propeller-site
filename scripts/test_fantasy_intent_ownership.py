#!/usr/bin/env python3
"""Keep fantasy acquisition pages from cannibalizing existing prop intents."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main() -> int:
    data = json.loads((ROOT / "data/platform-intent-map.json").read_text())
    fantasy = data["feature_intents"]["fantasy"]
    expected = {
        "category_owner": "/fantasy/",
        "current_mlb_utility_owner": "/fantasy/mlb/",
        "methodology_owner": "/fantasy/methodology/",
        "support_owner": "/help/how-do-propeller-fantasy-projections-work/",
    }
    errors = [f"{key}: expected {value}, got {fantasy.get(key)}" for key, value in expected.items() if fantasy.get(key) != value]
    owners = list(expected.values())
    if len(owners) != len(set(owners)):
        errors.append("fantasy intent owners must be unique")
    separate = fantasy.get("separate_intents", {})
    if "/picks/mlb/" not in separate or "/analyzer/" not in separate:
        errors.append("existing MLB prop intents are not explicitly separated")
    for url in owners:
        path = ROOT / url.strip("/") / "index.html"
        if not path.exists(): errors.append(f"missing owner page {url}")
    print(f"fantasy_intent_owners={len(owners)} errors={len(errors)}")
    if errors:
        print("\n".join(f"- {error}" for error in errors))
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
