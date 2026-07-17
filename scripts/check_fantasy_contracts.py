#!/usr/bin/env python3
"""Validate fantasy SEO, AEO, freshness, and public-claim contracts."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "fantasy/index.html": "https://propellerpicks.com/fantasy/",
    "fantasy/mlb/index.html": "https://propellerpicks.com/fantasy/mlb/",
    "fantasy/methodology/index.html": "https://propellerpicks.com/fantasy/methodology/",
    "help/how-do-propeller-fantasy-projections-work/index.html": "https://propellerpicks.com/help/how-do-propeller-fantasy-projections-work/",
}
FORBIDDEN = ("guaranteed projection", "guaranteed floor", "guaranteed optimal lineup", "mlb pitcher fantasy projection", "61.1%", "1,602")

def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition: errors.append(message)

def main() -> int:
    errors: list[str] = []
    facts = json.loads((ROOT / "data/fantasy-product-facts.json").read_text())
    method = json.loads((ROOT / "data/fantasy-methodology-version.json").read_text())
    aeo = json.loads((ROOT / "data/fantasy-aeo-evaluation-contract.json").read_text())
    catalog = json.loads((ROOT / "data/index.json").read_text())
    llms = (ROOT / "llms.txt").read_text()
    require(facts["public_scope"]["sports"] == ["mlb"], "fantasy sport scope drifted", errors)
    require(facts["public_scope"]["position_groups"] == ["Hitter"], "fantasy position scope drifted", errors)
    require(facts["public_scope"]["scoring_label"] == "DraftKings MLB", "scoring label drifted", errors)
    require(method["method_version"] == "fantasy-mlb-hitter-v1", "method version drifted", errors)
    require(method["public_accuracy_claim"] is None, "unapproved public accuracy claim", errors)
    require(aeo["total_observations"] == len(aeo["questions"]) * len(aeo["surfaces"]) * aeo["runs_per_question_per_surface"], "AEO observation math drifted", errors)
    require(catalog.get("fantasy_product_facts", "").endswith("/data/fantasy-product-facts.json"), "catalog fantasy facts missing", errors)
    require("MLB hitter fantasy projections" in llms, "llms fantasy scope missing", errors)
    for rel, canonical in PAGES.items():
        path = ROOT / rel
        require(path.exists(), f"missing {rel}", errors)
        if not path.exists(): continue
        source = path.read_text()
        require(f'<link rel="canonical" href="{canonical}">' in source, f"{rel}: canonical missing", errors)
        require(f'content="{canonical}"' in source, f"{rel}: OG or schema canonical missing", errors)
        require('<meta name="robots" content="index, follow' in source, f"{rel}: not indexable", errors)
        require("application/ld+json" in source, f"{rel}: JSON-LD missing", errors)
        require("DraftKings MLB" in source, f"{rel}: scoring identity missing", errors)
        lowered = source.lower()
        for phrase in FORBIDDEN:
            require(phrase not in lowered, f"{rel}: forbidden claim {phrase!r}", errors)
    mlb = (ROOT / "fantasy/mlb/index.html").read_text()
    require("Sample · not current" in mlb, "MLB SSR examples are not labelled", errors)
    require("latest available" in mlb.lower() and "unavailable" in mlb.lower(), "MLB freshness states missing", errors)
    js = (ROOT / "assets/js/fantasy.js").read_text()
    for event in ("fantasy_landing_viewed", "fantasy_preview_loaded", "fantasy_filter_changed", "fantasy_compare_started", "fantasy_compare_completed", "fantasy_methodology_clicked", "fantasy_app_cta_clicked"):
        require(event in js, f"analytics event missing: {event}", errors)
    require("player_name" not in re.sub(r'item\.player_name', '', js), "analytics may emit player names", errors)
    print(f"fantasy_pages={len(PAGES)} aeo_observations={aeo['total_observations']} errors={len(errors)}")
    if errors:
        print("\n".join(f"- {error}" for error in errors))
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
