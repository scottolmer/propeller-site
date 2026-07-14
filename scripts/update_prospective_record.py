#!/usr/bin/env python3
"""Capture public preview rows into an append-only forward publication ledger.

The public preview does not expose event start time. This script therefore
records when a row became publicly retrievable but never claims that the row
was captured before the event started. Captured identity fields are immutable;
only settlement fields may transition from open to a terminal state.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import math
import pathlib
import urllib.error
import urllib.request
from typing import Any
from zoneinfo import ZoneInfo


ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "prospective-picks.json"
API = "https://web-production-3c1c4.up.railway.app"
SPORTS = ("mlb", "nba", "nfl", "nhl", "soccer")
TERMINAL = {"win", "loss", "push", "void"}
IMMUTABLE_FIELDS = (
    "publication_id",
    "sport",
    "game_date",
    "player_name",
    "stat_type",
    "line",
    "direction",
    "model_score",
    "confidence",
)


def iso_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def get_json(url: str, timeout: int = 25) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": "PropellerSEO/1.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def stable_number(value: Any) -> float | int:
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("non-finite number")
    return int(number) if number.is_integer() else number


def identity_parts(row: dict[str, Any]) -> tuple[str, ...]:
    return (
        str(row["sport"]).lower(),
        str(row["game_date"]),
        str(row["player_name"]).strip().casefold(),
        str(row["stat_type"]).strip().lower(),
        str(stable_number(row["line"])),
        str(row["direction"]).strip().upper(),
        str(stable_number(row["model_score"])),
        str(int(row["confidence"])),
    )


def publication_id(row: dict[str, Any]) -> str:
    raw = "|".join(identity_parts(row)).encode("utf-8")
    return "pub_" + hashlib.sha256(raw).hexdigest()[:20]


def normalize_pick(sport: str, game_date: str, generated_at: str, captured_at: str,
                   pick: dict[str, Any]) -> dict[str, Any] | None:
    required = ("player_name", "stat_type", "line", "final_direction", "final_score", "confidence")
    if any(pick.get(key) in (None, "") for key in required):
        return None
    direction = str(pick["final_direction"]).upper()
    if direction not in {"OVER", "UNDER"}:
        return None
    try:
        row = {
            "published_at": generated_at,
            "captured_at": captured_at,
            "sport": sport,
            "game_date": game_date,
            "player_name": str(pick["player_name"]).strip(),
            "stat_type": str(pick["stat_type"]).strip().lower(),
            "line": stable_number(pick["line"]),
            "direction": direction,
            "model_score": stable_number(pick["final_score"]),
            "confidence": int(pick["confidence"]),
            "status": "open",
            "settled_at": None,
            "actual_value": None,
            "result_id": None,
        }
    except (TypeError, ValueError):
        return None
    row["publication_id"] = publication_id(row)
    return {"publication_id": row.pop("publication_id"), **row}


def result_key(row: dict[str, Any]) -> tuple[str, str, str, str, str, str]:
    direction = row.get("direction", row.get("predicted_direction", ""))
    return (
        str(row.get("sport", "")).lower(),
        str(row.get("game_date", "")),
        str(row.get("player_name", "")).strip().casefold(),
        str(row.get("stat_type", "")).strip().lower(),
        str(stable_number(row.get("line", 0))),
        str(direction).upper(),
    )


def settle(records: list[dict[str, Any]], results: list[dict[str, Any]], settled_at: str) -> int:
    candidates: dict[tuple[str, ...], list[dict[str, Any]]] = {}
    for result in results:
        status = str(result.get("result", "")).lower()
        if status not in TERMINAL:
            continue
        try:
            candidates.setdefault(result_key(result), []).append(result)
        except (TypeError, ValueError):
            continue
    changed = 0
    for record in records:
        if record.get("status") != "open":
            continue
        matches = candidates.get(result_key(record), [])
        outcomes = {(str(row.get("result", "")).lower(), row.get("actual_value")) for row in matches}
        if len(outcomes) != 1:
            continue
        result = sorted(matches, key=lambda row: str(row.get("result_id", "")))[0]
        record["status"] = str(result["result"]).lower()
        record["settled_at"] = settled_at
        record["actual_value"] = result.get("actual_value")
        record["result_id"] = result.get("result_id")
        changed += 1
    return changed


def merge(existing: list[dict[str, Any]], incoming: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    by_id = {row["publication_id"]: row for row in existing}
    added = 0
    for row in incoming:
        current = by_id.get(row["publication_id"])
        if current:
            if any(current.get(field) != row.get(field) for field in IMMUTABLE_FIELDS):
                raise ValueError(f"immutable publication collision: {row['publication_id']}")
            continue
        by_id[row["publication_id"]] = row
        added += 1
    records = sorted(by_id.values(), key=lambda row: (row["game_date"], row["published_at"], row["publication_id"]))
    return records, added


def load(path: pathlib.Path) -> dict[str, Any]:
    if not path.exists():
        return {
            "schema_version": "1.0",
            "generated_at": iso_now(),
            "publication_definition": "First observed in the Propeller public picks preview. Event-start ordering and outcome timing are not verified because the public preview does not expose event start time.",
            "before_event_start_verified": False,
            "records": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def fetch_results(days: int = 14) -> dict[str, Any]:
    """Fetch the bounded public results feed without exceeding its 500-row cap."""
    combined: list[dict[str, Any]] = []
    generated_at = ""
    total = 0
    offset = 0
    while True:
        payload = get_json(f"{API}/api/public/results?days={days}&min_confidence=0&limit=500&offset={offset}")
        batch = payload.get("results", [])
        combined.extend(batch)
        generated_at = str(payload.get("generated_at") or generated_at)
        total = int(payload.get("total") or len(combined))
        if not batch or len(combined) >= total:
            break
        offset += len(batch)
    return {"results": combined, "generated_at": generated_at, "total": total}


def unresolved_lookback(records: list[dict[str, Any]], as_of: str, minimum: int = 30, cap: int = 3650) -> int:
    """Keep postponed and late-corrected open rows eligible for settlement."""
    as_of_date = dt.date.fromisoformat(as_of)
    open_dates = []
    for row in records:
        if row.get("status") != "open":
            continue
        try:
            open_dates.append(dt.date.fromisoformat(str(row["game_date"])))
        except (KeyError, ValueError):
            continue
    if not open_dates:
        return minimum
    return min(cap, max(minimum, (as_of_date - min(open_dates)).days + 7))


def exclude_already_resulted(incoming: list[dict[str, Any]], results: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    keys = set()
    for result in results:
        if str(result.get("result", "")).lower() not in TERMINAL:
            continue
        try:
            keys.add(result_key(result))
        except (TypeError, ValueError):
            continue
    kept = [row for row in incoming if result_key(row) not in keys]
    return kept, len(incoming) - len(kept)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Slate date in YYYY-MM-DD; defaults to current ET date")
    parser.add_argument("--output", type=pathlib.Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--fixture-dir", type=pathlib.Path,
                        help="Read picks-{sport}.json and results.json instead of network")
    args = parser.parse_args()
    game_date = args.date or dt.datetime.now(ZoneInfo("America/New_York")).date().isoformat()
    run_started_at = iso_now()
    document = load(args.output)
    if document.get("before_event_start_verified") is not False:
        raise ValueError("before_event_start_verified must remain false until the API exposes event time")
    fetch_errors: list[str] = []
    results_payload: dict[str, Any] | None = None
    try:
        results_payload = (json.loads((args.fixture_dir / "results.json").read_text())
                           if args.fixture_dir else fetch_results(unresolved_lookback(document.get("records", []), game_date)))
    except (OSError, json.JSONDecodeError, urllib.error.URLError):
        fetch_errors.append("results:unavailable")
    incoming: list[dict[str, Any]] = []
    for sport in SPORTS:
        try:
            payload = (json.loads((args.fixture_dir / f"picks-{sport}.json").read_text())
                       if args.fixture_dir else get_json(f"{API}/api/social/picks/{sport}?game_date={game_date}&limit=100"))
        except (OSError, json.JSONDecodeError, urllib.error.URLError) as exc:
            fetch_errors.append(f"{sport}:{type(exc).__name__}")
            continue
        observed_at = iso_now()
        generated_at = str(payload.get("generated_at") or observed_at)
        for pick in payload.get("props", []):
            row = normalize_pick(sport, str(payload.get("game_date") or game_date), generated_at, observed_at, pick)
            if row:
                incoming.append(row)

    incoming, skipped_resulted = exclude_already_resulted(
        incoming, results_payload.get("results", []) if results_payload else []
    )
    records, added = merge(document.get("records", []), incoming)
    if results_payload:
        settled = settle(records, results_payload.get("results", []), str(results_payload.get("generated_at") or run_started_at))
    else:
        settled = 0

    document["generated_at"] = iso_now()
    document["records"] = records
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(document, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"records={len(records)} added={added} skipped_resulted={skipped_resulted} settled={settled} "
          f"errors={','.join(fetch_errors) or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
