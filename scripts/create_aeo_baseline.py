#!/usr/bin/env python3
"""Create a non-fabricated AEO observation matrix for manual platform checks."""

from __future__ import annotations

import argparse
import csv
import json
from datetime import date
from pathlib import Path

try:
    from aeo_contract import assert_archived_contract, contract_hash
except ModuleNotFoundError:  # Support import from the repository root in tests.
    from scripts.aeo_contract import assert_archived_contract, contract_hash


ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "docs" / "seo" / "aeo-target-questions.json"
FIELDS = [
    "contract_version", "contract_hash", "observation_id", "date", "checked_at", "question_id", "priority", "intent", "platform", "run",
    "prompt", "owned_url", "status", "answer_surface", "propeller_mentioned", "propeller_cited",
    "propeller_url_cited", "competitors_mentioned", "competitors_cited", "cited_domains", "source_types",
    "answer_accurate", "accuracy_notes", "answer_summary", "follow_up_actions", "evidence_url", "reviewer",
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--targets", default=str(TARGETS), help="Versioned target-question JSON to materialize")
    parser.add_argument("--output")
    args = parser.parse_args()
    targets = Path(args.targets)
    config = json.loads(targets.read_text(encoding="utf-8"))
    try:
        assert_archived_contract(config)
    except ValueError as error:
        raise SystemExit(f"ERROR: {error}") from error
    frozen_hash = contract_hash(config)
    output = Path(args.output) if args.output else ROOT / "docs" / "seo" / f"aeo-baseline-{args.date}.csv"
    if not output.is_absolute():
        output = ROOT / output
    rows = []
    for target in config["target_questions"]:
        for platform in config["measurement_instructions"]["platforms"]:
            for run in range(1, int(config["measurement_instructions"]["runs_per_prompt"]) + 1):
                rows.append({
                    "contract_version": config["contract_version"],
                    "contract_hash": frozen_hash,
                    "observation_id": f"{args.date}__{target['id']}__{platform.lower().replace(' ', '-')}__r{run}",
                    "date": args.date,
                    "checked_at": "",
                    "question_id": target["id"],
                    "priority": target["priority"],
                    "intent": target["intent"],
                    "platform": platform,
                    "run": run,
                    "prompt": target["question"],
                    "owned_url": target["owned_url"],
                    "status": "pending_manual_platform_run",
                    "answer_surface": "",
                    "propeller_mentioned": "",
                    "propeller_cited": "",
                    "propeller_url_cited": "",
                    "competitors_mentioned": "",
                    "competitors_cited": "",
                    "cited_domains": "",
                    "source_types": "",
                    "answer_accurate": "",
                    "accuracy_notes": "",
                    "answer_summary": "",
                    "follow_up_actions": "",
                    "evidence_url": "",
                    "reviewer": "",
                })
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    try:
        display_output = output.relative_to(ROOT)
    except ValueError:
        display_output = output
    print(f"output={display_output} rows={len(rows)}")


if __name__ == "__main__":
    main()
