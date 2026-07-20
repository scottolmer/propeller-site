#!/usr/bin/env python3
"""Validate and summarize one Propeller Picks monthly AEO observation matrix."""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse

try:
    from aeo_contract import contract_hash, is_domain, load_archived_contract
except ModuleNotFoundError:  # Support import from the repository root in tests.
    from scripts.aeo_contract import contract_hash, is_domain, load_archived_contract


ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "docs" / "seo" / "aeo-target-questions.json"
PLATFORMS = ["ChatGPT Search", "Perplexity", "Google AI Overviews", "Gemini", "Copilot"]
BOOLEAN_VALUES = {"yes", "no"}
ACCURACY_VALUES = {"accurate", "mixed", "inaccurate", "unverifiable", "not_applicable"}
SURFACE_VALUES = {"present", "absent"}
FINAL_STATUSES = {"completed"}
NONFINAL_STATUSES = {
    "pending_manual_platform_run",
    "blocked_authentication",
    "blocked_captcha",
    "failed_inconclusive",
}
REQUIRED_FIELDS = {
    "contract_version", "contract_hash", "observation_id", "date", "checked_at", "question_id",
    "priority", "intent", "platform", "run", "prompt", "owned_url", "status", "answer_surface",
    "propeller_mentioned", "propeller_cited", "propeller_url_cited", "competitors_mentioned",
    "competitors_cited", "cited_domains", "source_types", "answer_accurate", "accuracy_notes",
    "answer_summary", "follow_up_actions", "evidence_url", "reviewer",
}


def split_values(value: str) -> list[str]:
    return [part.strip() for part in value.split(";") if part.strip()]


def pct(numerator: int, denominator: int) -> str:
    return "—" if not denominator else f"{100 * numerator / denominator:.1f}%"


def validate(rows: list[dict[str, str]], config: dict) -> list[str]:
    errors: list[str] = []
    targets = config["target_questions"]
    target_by_id = {target["id"]: target for target in targets}
    expected_runs = int(config["measurement_instructions"]["runs_per_prompt"])
    expected_keys = {
        (target["id"], platform, str(run))
        for target in targets
        for platform in PLATFORMS
        for run in range(1, expected_runs + 1)
    }
    actual_keys = [(row["question_id"], row["platform"], row["run"]) for row in rows]
    expected_hash = contract_hash(config)
    if len(targets) != 20:
        errors.append(f"target set must contain exactly 20 questions; found {len(targets)}")
    if set(config["measurement_instructions"]["platforms"]) != set(PLATFORMS):
        errors.append("platform set does not match the five benchmark platforms")
    if len(actual_keys) != len(set(actual_keys)):
        errors.append("duplicate question/platform/run rows found")
    missing = expected_keys - set(actual_keys)
    extra = set(actual_keys) - expected_keys
    if missing:
        errors.append(f"missing {len(missing)} expected observations")
    if extra:
        errors.append(f"found {len(extra)} unexpected observations")

    allowed_source_types = set(config["measurement_instructions"]["source_type_values"])
    snapshot_dates = {row.get("date", "") for row in rows}
    if len(snapshot_dates) != 1 or "" in snapshot_dates:
        errors.append("all observations must share one non-empty snapshot date")
    for line, row in enumerate(rows, start=2):
        prefix = f"row {line} ({row.get('observation_id') or 'no id'})"
        if row["question_id"] not in target_by_id:
            errors.append(f"{prefix}: unknown question_id")
            continue
        target = target_by_id[row["question_id"]]
        expected_id = f"{row['date']}__{target['id']}__{row['platform'].lower().replace(' ', '-')}__r{row['run']}"
        expected_fields = {
            "contract_version": config["contract_version"],
            "contract_hash": expected_hash,
            "observation_id": expected_id,
            "priority": target["priority"],
            "intent": target["intent"],
            "prompt": target["question"],
            "owned_url": target["owned_url"],
        }
        for field, expected in expected_fields.items():
            if row.get(field, "") != expected:
                errors.append(f"{prefix}: {field} does not match the frozen contract")
        if row["status"] not in FINAL_STATUSES | NONFINAL_STATUSES:
            errors.append(f"{prefix}: invalid status {row['status']!r}")
        if row["status"] != "completed":
            continue
        for field in ("checked_at", "reviewer", "evidence_url"):
            if not row.get(field, "").strip():
                errors.append(f"{prefix}: completed row needs {field}")
        try:
            checked_at = datetime.fromisoformat(row["checked_at"].replace("Z", "+00:00"))
            if checked_at.tzinfo is None:
                raise ValueError
        except ValueError:
            errors.append(f"{prefix}: checked_at must be an ISO-8601 timestamp with timezone")
        evidence = urlparse(row.get("evidence_url", ""))
        if evidence.scheme not in {"http", "https"} or not evidence.netloc:
            errors.append(f"{prefix}: evidence_url must be an absolute HTTP(S) URL")
        if row["answer_surface"] not in SURFACE_VALUES:
            errors.append(f"{prefix}: completed row needs answer_surface present/absent")
        for field in ("propeller_mentioned", "propeller_cited"):
            if row[field] not in BOOLEAN_VALUES:
                errors.append(f"{prefix}: {field} must be yes/no")
        if row["answer_accurate"] not in ACCURACY_VALUES:
            errors.append(f"{prefix}: invalid answer_accurate value")
        if row["propeller_cited"] == "yes" and not row["propeller_url_cited"]:
            errors.append(f"{prefix}: cited=yes needs propeller_url_cited")
        if row["propeller_cited"] == "yes":
            cited_url = urlparse(row["propeller_url_cited"])
            if cited_url.scheme not in {"http", "https"} or not cited_url.netloc or not is_domain(row["propeller_url_cited"], "propellerpicks.com"):
                errors.append(f"{prefix}: propeller_url_cited must be an exact Propeller URL")
            if not any(is_domain(domain, "propellerpicks.com") for domain in split_values(row["cited_domains"])):
                errors.append(f"{prefix}: cited=yes needs propellerpicks.com in cited_domains")
            if "propeller_owned" not in split_values(row["source_types"]):
                errors.append(f"{prefix}: cited=yes needs propeller_owned source type")
        if row["propeller_mentioned"] == "no" and row["answer_accurate"] != "not_applicable":
            errors.append(f"{prefix}: no Propeller mention must use not_applicable accuracy")
        if row["answer_surface"] == "absent":
            for field in ("propeller_mentioned", "propeller_cited"):
                if row[field] != "no":
                    errors.append(f"{prefix}: absent answer surface requires {field}=no")
            if row["propeller_url_cited"]:
                errors.append(f"{prefix}: absent answer surface cannot have a Propeller URL")
        elif not row["answer_summary"].strip():
            errors.append(f"{prefix}: present answer surface needs answer_summary")
        invalid_types = set(split_values(row["source_types"])) - allowed_source_types
        if invalid_types:
            errors.append(f"{prefix}: invalid source types {sorted(invalid_types)}")
    return errors


def summarize(rows: list[dict[str, str]], config: dict, source: Path, draft: bool = False) -> str:
    complete = [row for row in rows if row["status"] == "completed"]
    mentioned = [row for row in complete if row["propeller_mentioned"] == "yes"]
    cited = [row for row in complete if row["propeller_cited"] == "yes"]
    accurate = [row for row in mentioned if row["answer_accurate"] == "accurate"]
    inaccurate_or_mixed = [row for row in mentioned if row["answer_accurate"] in {"mixed", "inaccurate"}]
    unverifiable = [row for row in mentioned if row["answer_accurate"] == "unverifiable"]
    domains = sorted({domain for row in complete for domain in split_values(row["cited_domains"])})
    date = rows[0]["date"] if rows else "unknown"

    display_source = source.relative_to(ROOT) if source.is_relative_to(ROOT) else source
    lines = [
        f"# Monthly AEO Snapshot — {date}",
        "",
        *( ["> **DRAFT — NON-COMPARABLE:** This snapshot is incomplete and must not be used as the monthly benchmark.", ""] if draft else [] ),
        f"Source matrix: `{display_source}`",
        f"Contract: `{config['contract_version']}` (`{contract_hash(config)}`)",
        "",
        "## Executive scorecard",
        "",
        "| Metric | Result |",
        "| --- | ---: |",
        f"| Completed observations | {len(complete)} / {len(rows)} |",
        f"| Propeller mention rate | {pct(len(mentioned), len(complete))} |",
        f"| Propeller citation rate | {pct(len(cited), len(complete))} |",
        f"| Verified accurate Propeller claims | {pct(len(accurate), len(mentioned))} |",
        f"| Inaccurate or mixed Propeller claims | {len(inaccurate_or_mixed)} |",
        f"| Unverifiable Propeller claims | {len(unverifiable)} |",
        f"| Unique cited domains | {len(domains)} |",
        "",
        "Rates use completed observations only. Factual accuracy uses all Propeller mentions as the denominator; rows without an explicit ledger-resolvable claim remain `unverifiable`, and rows without a Propeller mention are `not_applicable`.",
        "",
        "## By platform",
        "",
        "| Platform | Complete | Mention rate | Citation rate | AI surface absent |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for platform in PLATFORMS:
        platform_rows = [row for row in complete if row["platform"] == platform]
        platform_mentions = sum(row["propeller_mentioned"] == "yes" for row in platform_rows)
        platform_cites = sum(row["propeller_cited"] == "yes" for row in platform_rows)
        absent = sum(row["answer_surface"] == "absent" for row in platform_rows)
        lines.append(
            f"| {platform} | {len(platform_rows)} | {pct(platform_mentions, len(platform_rows))} | "
            f"{pct(platform_cites, len(platform_rows))} | {absent} |"
        )

    lines.extend([
        "",
        "## By question",
        "",
        "| Question | Complete | Mentions | Citations | Competitors cited |",
        "| --- | ---: | ---: | ---: | --- |",
    ])
    target_by_id = {target["id"]: target for target in config["target_questions"]}
    for question_id, target in target_by_id.items():
        question_rows = [row for row in complete if row["question_id"] == question_id]
        competitors = sorted({item for row in question_rows for item in split_values(row["competitors_cited"])})
        lines.append(
            f"| {target['question']} | {len(question_rows)} | "
            f"{sum(row['propeller_mentioned'] == 'yes' for row in question_rows)} | "
            f"{sum(row['propeller_cited'] == 'yes' for row in question_rows)} | "
            f"{', '.join(competitors) or '—'} |"
        )

    domain_counts = Counter(domain for row in complete for domain in split_values(row["cited_domains"]))
    lines.extend([
        "",
        "## Most-cited domains",
        "",
        "| Domain | Citations |",
        "| --- | ---: |",
    ])
    for domain, count in domain_counts.most_common(20):
        lines.append(f"| {domain} | {count} |")
    if not domain_counts:
        lines.append("| — | 0 |")

    follow_ups = Counter(action for row in complete for action in split_values(row["follow_up_actions"]))
    lines.extend(["", "## Follow-up queue", ""])
    if follow_ups:
        lines.extend(f"- {action} ({count} observations)" for action, count in follow_ups.most_common())
    else:
        lines.append("- No follow-up actions recorded yet.")

    nonfinal = Counter(row["status"] for row in rows if row["status"] != "completed")
    if nonfinal:
        lines.extend(["", "## Incomplete observations", ""])
        lines.extend(f"- `{status}`: {count}" for status, count in sorted(nonfinal.items()))
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("matrix", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--require-complete", action="store_true", help="deprecated compatibility flag; completeness is required by default")
    parser.add_argument("--draft", action="store_true", help="allow an incomplete, prominently marked non-comparable report")
    args = parser.parse_args()
    matrix = args.matrix if args.matrix.is_absolute() else ROOT / args.matrix
    with matrix.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = set(reader.fieldnames or [])
        rows = list(reader)
    missing_fields = REQUIRED_FIELDS - fields
    if missing_fields:
        raise SystemExit(f"ERROR: matrix is missing required fields: {sorted(missing_fields)}")
    versions = {row.get("contract_version", "") for row in rows}
    if len(versions) != 1 or "" in versions:
        raise SystemExit("ERROR: snapshot must contain exactly one non-empty contract_version")
    try:
        config = load_archived_contract(next(iter(versions)))
    except ValueError as error:
        raise SystemExit(f"ERROR: {error}") from error
    errors = validate(rows, config)
    if args.draft and args.require_complete:
        errors.append("--draft cannot be combined with --require-complete")
    incomplete = [row for row in rows if row["status"] != "completed"]
    if incomplete and not args.draft:
        errors.append(f"snapshot is incomplete: {len(incomplete)} observations are not completed; use --draft only for a non-comparable working report")
    if errors:
        raise SystemExit("\n".join(f"ERROR: {error}" for error in errors))
    report = summarize(rows, config, matrix, draft=args.draft)
    if args.output:
        output = args.output if args.output.is_absolute() else ROOT / args.output
        if args.check:
            if not output.exists() or output.read_text(encoding="utf-8") != report:
                display_output = output.relative_to(ROOT) if output.is_relative_to(ROOT) else output
                raise SystemExit(f"ERROR: {display_output} is stale; regenerate it")
        else:
            output.write_text(report, encoding="utf-8")
            display_output = output.relative_to(ROOT) if output.is_relative_to(ROOT) else output
            print(f"output={display_output}")
    display_matrix = matrix.relative_to(ROOT) if matrix.is_relative_to(ROOT) else matrix
    print(f"validated={display_matrix} rows={len(rows)}")


if __name__ == "__main__":
    main()
