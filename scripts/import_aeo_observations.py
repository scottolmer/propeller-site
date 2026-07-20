#!/usr/bin/env python3
"""Merge captured answer-engine observations into a generated AEO matrix."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

try:
    from aeo_contract import is_domain
except ModuleNotFoundError:  # Support import from the repository root in tests.
    from scripts.aeo_contract import is_domain


ROOT = Path(__file__).resolve().parents[1]
PRODUCT_FACTS = json.loads((ROOT / "data" / "product-facts.json").read_text(encoding="utf-8"))
SOURCE_TYPE_ALIASES = {
    "owned": "propeller_owned",
    "competitor": "competitor_owned",
    "publisher": "publisher_editorial",
    "ugc": "community_forum",
    "video_social": "social_video",
    "directory": "app_directory",
}
COMPETITOR_DOMAINS = {
    "actionnetwork.com": "Action Network",
    "bettingpros.com": "BettingPros",
    "dailyfantasyfuel.com": "Daily Fantasy Fuel",
    "dimers.com": "Dimers",
    "establishtherun.com": "Establish The Run",
    "fantasylabs.com": "FantasyLabs",
    "linemate.io": "LineMate",
    "oddsjam.com": "OddsJam",
    "oddsreference.com": "Odds Reference",
    "oddsshopper.com": "OddsShopper",
    "outlier.bet": "Outlier",
    "pikkit.com": "Pikkit",
    "playerprops.ai": "PlayerProps.ai",
    "propjuice.ai": "PropJuice",
    "props.cash": "Props.Cash",
    "propsbot.ai": "PropsBot",
    "propsoptimizer.com": "Props Optimizer",
    "rithmm.com": "Rithmm",
    "rotogrinders.com": "RotoGrinders",
    "rotobot.ai": "RotoBot",
    "sickfade.com": "SickFade",
}
PLATFORM_DOMAINS = {
    "draftkings.com": "DraftKings",
    "pick6.draftkings.com": "DraftKings Pick6",
    "fanduel.com": "FanDuel",
    "prizepicks.com": "PrizePicks",
    "underdogfantasy.com": "Underdog Fantasy",
}
PLATFORM_NAMES = set(PLATFORM_DOMAINS.values()) | {"Underdog"}


def split_values(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in re.split(r"[;|]", str(value or "")) if item.strip()]


def domain_for(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().removeprefix("www.")
    except ValueError:
        return ""


def source_type_for(domain: str) -> str:
    if is_domain(domain, "propellerpicks.com"):
        return "propeller_owned"
    if any(is_domain(domain, root) for root in PLATFORM_DOMAINS):
        return "official_platform"
    if any(is_domain(domain, root) for root in COMPETITOR_DOMAINS):
        return "competitor_owned"
    if any(is_domain(domain, root) for root in ("reddit.com", "quora.com")):
        return "community_forum"
    if any(is_domain(domain, root) for root in ("youtube.com", "tiktok.com", "instagram.com")):
        return "social_video"
    if any(is_domain(domain, root) for root in ("apps.apple.com", "play.google.com")):
        return "app_directory"
    return "publisher_editorial" if domain else ""


def grade_accuracy(text: str, mentioned: bool) -> tuple[str, str]:
    if not mentioned:
        return "not_applicable", "No Propeller-specific claim to grade."
    lowered = re.sub(r"\s+", " ", text.lower())
    contradictions = [
        (r"propeller(?: picks)?\s*\(formerly propedge\)|propeller(?: picks)?[^.]{0,100}formerly propedge", "Propeller was incorrectly described as formerly PropEdge."),
        *([(r"propeller(?: picks)?[^.]{0,140}(?:accepts?|places?) (?:real-money )?(?:wagers|bets|entries)", "Propeller does not accept or place wagers or entries.")] if not PRODUCT_FACTS["accepts_wagers"] and not PRODUCT_FACTS["places_wagers"] else []),
        *([(r"propeller(?: picks)?[^.]{0,120}(?:is|operates as) (?:an? )?sportsbook", "Propeller is a research tool, not a sportsbook.")] if not PRODUCT_FACTS["sportsbook"] else []),
        (r"propeller(?: picks)?[^.]{0,160}(?:entry|lineup|prizepicks) optimizer", "Propeller does not provide an entry or lineup optimizer."),
        (r"propeller(?: picks)?[^.]{0,160}confidence(?: score)?[^.]{0,80}(?:calibrated )?win probability", "Propeller confidence is not a calibrated win probability."),
        (r"propeller(?: picks)?[^.]{0,160}(?:guarantees?|guaranteed)", "Propeller does not guarantee outcomes."),
        (r"propeller(?: picks)?[^.]{0,160}(?:official|native) (?:prizepicks|underdog|draftkings|pick6) (?:feed|integration)", "Propeller is independent and does not claim an official platform feed."),
        (r"propeller(?: picks)?[^.]{0,120}\b\d+\s+(?:ai )?agents\b", "Propeller does not publish a universal agent count."),
    ]
    for pattern, note in contradictions:
        if re.search(pattern, lowered):
            return "inaccurate", f"Checked against data/product-facts.json: {note}"
    supported_claims = [r"propeller(?: picks)?[^.]{0,160}(?:research|analysis) (?:tool|workspace|platform)"]
    if not PRODUCT_FACTS["accepts_wagers"] and not PRODUCT_FACTS["places_wagers"]:
        supported_claims.append(r"propeller(?: picks)?[^.]{0,160}(?:does not|doesn't) (?:accept|place) (?:wagers|bets|entries)")
    if not PRODUCT_FACTS["sportsbook"]:
        supported_claims.append(r"propeller(?: picks)?[^.]{0,160}(?:is not|isn't) (?:a )?sportsbook")
    if "independent" in PRODUCT_FACTS["platform_relationship"].lower():
        supported_claims.append(r"propeller(?: picks)?[^.]{0,160}(?:independent|not affiliated)")
    if "free to use" in PRODUCT_FACTS["access"]["public_analyzer"].lower():
        supported_claims.append(r"propeller(?: picks)?[^.]{0,160}(?:free to use|free analyzer|free player.prop)")
    if any(re.search(pattern, lowered) for pattern in supported_claims):
        return "accurate", "The captured Propeller claim matches an explicit fact in data/product-facts.json."
    return "unverifiable", "The captured text mentions Propeller, but no explicit claim could be verified against data/product-facts.json."


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("matrix", type=Path)
    args = parser.parse_args()
    matrix = args.matrix if args.matrix.is_absolute() else ROOT / args.matrix
    observations = json.load(sys.stdin)

    with matrix.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    row_by_key = {(row["question_id"], row["platform"], row["run"]): row for row in rows}

    updated = 0
    for observation in observations:
        platform = str(observation.get("platform", "")).replace("ChatGPT search", "ChatGPT Search")
        key = (str(observation.get("question_id", "")), platform, str(observation.get("run", "")))
        if key not in row_by_key:
            raise SystemExit(f"Unknown observation key: {key}")
        row = row_by_key[key]
        propeller_cited = str(observation.get("propeller_cited") or "no")
        propeller_url = str(observation.get("propeller_url_cited") or "")
        follow_up = str(observation.get("follow_up_actions") or "")
        if propeller_cited == "yes" and not propeller_url:
            follow_up = ";".join(filter(None, [follow_up, "Resolve exact Propeller citation URL; domain-only evidence is not publishable"]))

        all_urls = split_values(observation.get("all_urls"))
        if propeller_url:
            all_urls.append(propeller_url)
        cited_domains = split_values(observation.get("cited_domains"))
        cited_domains.extend(domain_for(url) for url in all_urls)
        cited_domains = sorted({domain for domain in cited_domains if domain})

        source_types = [SOURCE_TYPE_ALIASES.get(item, item) for item in split_values(observation.get("source_types"))]
        source_types.extend(source_type_for(domain) for domain in cited_domains)
        source_types = sorted({item for item in source_types if item})

        competitors = [
            name for name in split_values(observation.get("competitors_cited"))
            if name not in PLATFORM_NAMES
        ]
        competitors.extend(
            name
            for domain, name in COMPETITOR_DOMAINS.items()
            if any(is_domain(cited_domain, domain) for cited_domain in cited_domains)
        )
        competitors = sorted(set(competitors))

        mentioned = str(observation.get("propeller_mentioned") or observation.get("brand_mentioned") or "no") == "yes"
        raw_text = str(observation.get("raw_text") or observation.get("answer_summary") or "")
        accuracy, accuracy_notes = grade_accuracy(raw_text, mentioned)
        evidence = observation.get("evidence_url")
        if not isinstance(evidence, str):
            evidence = "https://chatgpt.com/?temporary-chat=true" if platform == "ChatGPT Search" else ""

        row.update({
            "checked_at": str(observation.get("checked_at") or datetime.now(timezone.utc).isoformat()),
            "status": "failed_inconclusive" if propeller_cited == "yes" and not propeller_url else str(observation.get("status") or "completed"),
            "answer_surface": str(observation.get("answer_surface") or "present"),
            "propeller_mentioned": "yes" if mentioned else "no",
            "propeller_cited": propeller_cited,
            "propeller_url_cited": propeller_url,
            "competitors_mentioned": ";".join(
                name for name in split_values(observation.get("competitors_mentioned"))
                if name not in PLATFORM_NAMES
            ),
            "competitors_cited": ";".join(competitors),
            "cited_domains": ";".join(cited_domains),
            "source_types": ";".join(source_types),
            "answer_accurate": accuracy,
            "accuracy_notes": accuracy_notes,
            "answer_summary": str(observation.get("answer_summary") or "").replace("\n", " ")[:700],
            "follow_up_actions": follow_up,
            "evidence_url": evidence,
            "reviewer": "Codex",
        })
        updated += 1

    with matrix.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(f"updated={updated} matrix={matrix.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
