#!/usr/bin/env python3
"""Require public product claims to match the canonical fact ledger."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "docs", "mockups", "node_modules"}
AGENT_COUNT_RE = re.compile(
    r"\b(?:6[-–]8|6|7|8|9|10|six|seven|eight|nine|ten)[- ](?:(?:specialized|independent|analytical|active|AI|MLB|NFL|NBA|NHL|soccer|analysis) )*agents?\b",
    re.I,
)
COUNTED_AGENT_CARD_RE = re.compile(
    r'class=["\'][^"\']*(?:hero-stat-value|stat-card-value|stat-number)[^"\']*["\'][^>]*>\s*'
    r'(?:6[-–]8|6|7|8|9|10|six|seven|eight|nine|ten)\s*</[^>]+>\s*'
    r'<[^>]+class=["\'][^"\']*(?:hero-stat-label|stat-card-label|stat-label)[^"\']*["\'][^>]*>[^<]{0,80}\bagents?\b',
    re.I | re.S,
)


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    facts = json.loads((ROOT / "data/product-facts.json").read_text(encoding="utf-8"))
    method = json.loads((ROOT / "data/methodology-version.json").read_text(encoding="utf-8"))
    catalog = json.loads((ROOT / "data/index.json").read_text(encoding="utf-8"))
    llms = (ROOT / "llms.txt").read_text(encoding="utf-8")
    pricing = (ROOT / "pricing.md").read_text(encoding="utf-8")

    require(facts.get("formal_name") == "Propeller Picks", "formal name drifted", errors)
    require(facts.get("accepts_wagers") is False, "accepts_wagers must be false", errors)
    require(facts.get("places_wagers") is False, "places_wagers must be false", errors)
    require(facts.get("sportsbook") is False, "sportsbook must be false", errors)
    require(len(facts.get("signed_in_product_sports", [])) == 6, "signed-in sport count must be six", errors)
    require(len(facts.get("public_analyzer_sports", [])) == 5, "public analyzer sport count must be five", errors)
    require(len(facts.get("public_result_buckets", [])) == 6, "public result bucket count must be six", errors)
    require(
        method.get("public_analyzer_sports") == facts.get("public_analyzer_sports"),
        "methodology public analyzer sports drifted",
        errors,
    )
    require(
        method.get("signed_in_product_sports") == facts.get("signed_in_product_sports"),
        "methodology signed-in sports drifted",
        errors,
    )
    require(catalog.get("product_facts", "").endswith("/data/product-facts.json"), "catalog product-facts link missing", errors)
    require("does not publish a universal agent count" in llms, "llms agent-count policy missing", errors)
    require("not a calibrated win probability or guarantee" in llms, "llms confidence limitation missing", errors)
    require(facts["access"]["founder_500_offer"] in pricing, "pricing offer differs from fact ledger", errors)

    checked = 0
    for path in ROOT.rglob("*.html"):
        if any(part in EXCLUDED for part in path.relative_to(ROOT).parts):
            continue
        checked += 1
        source = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT)
        match = AGENT_COUNT_RE.search(source)
        if match:
            errors.append(f"{rel}: unversioned agent-count claim {match.group(0)!r}")
        if COUNTED_AGENT_CARD_RE.search(source):
            errors.append(f"{rel}: unversioned agent-count card")
        if "Get Free Lifetime Access" in source:
            errors.append(f"{rel}: unqualified lifetime-access CTA")
        if re.search(r"confidence score from 20 to 80|confidence score of 20 to 80", source, re.I):
            errors.append(f"{rel}: obsolete confidence display range")
        if re.search(r"scores? (?:below 50|below 35|35 and below|38 and below)", source, re.I):
            errors.append(f"{rel}: raw directional score presented as displayed confidence")
        if re.search(r"Platforms(?: Supported)?:[^<\n]{0,120}FanDuel", source, re.I):
            errors.append(f"{rel}: FanDuel presented as a core supported DFS platform")
        if "AI-powered sports analysis platform" in source:
            errors.append(f"{rel}: generic product-type description")
        if (
            ". powered by sport-specific" in source
            or ">sport-specific analysis signals" in source
            or ">sport-specific analysis<" in source
        ):
            errors.append(f"{rel}: low-quality lowercase normalization artifact")
        if re.search(r"all (?:six|seven|eight|[678]) scores|weighted average of all agents", source, re.I):
            errors.append(f"{rel}: fixed-count or all-agent availability claim")
        if "Strong Over Confidence" in source:
            errors.append(f"{rel}: confidence magnitude incorrectly implies direction")
        if (
            str(rel).startswith("analyzer/")
            and 'content="noindex,follow"' in source
            and 'data-current-props="true"' not in source
            and re.search(r"prop analysis today|props today|updated daily", source, re.I)
        ):
            errors.append(f"{rel}: stale current-day claim on a historical analyzer page")

    priority = [
        "about/index.html",
        "picks/index.html",
        "help/what-is-propeller-picks/index.html",
        "help/what-sports-does-propeller-support/index.html",
    ]
    for rel in priority:
        source = (ROOT / rel).read_text(encoding="utf-8")
        lowered = source.lower()
        require(
            "not a sportsbook" in lowered or "do not accept wagers or operate as a sportsbook" in lowered,
            f"{rel}: product-type limitation missing",
            errors,
        )

    print(f"product_facts=checked html_pages={checked} errors={len(errors)}")
    if errors:
        print("\n".join(f"- {error}" for error in errors[:200]))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
