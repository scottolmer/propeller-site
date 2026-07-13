#!/usr/bin/env python3
"""Refresh the public performance snapshot and static HTML fallbacks.

The historical API exposes two different units:

- ``results-summary`` and confidence buckets count raw graded analysis rows.
- ``results`` applies the current public-ledger collapse rules.

Neither unit is a verified forward-test or ROI record. This script preserves
that distinction, writes a dated machine-readable snapshot, and renders useful
evidence into the initial HTML so crawlers and users do not depend on JS.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
API_BASE = "https://web-production-3c1c4.up.railway.app"
RAW_SUMMARY_URL = f"{API_BASE}/api/public/results-summary"
LEDGER_URL = f"{API_BASE}/api/public/results?days=3650&min_confidence=0&limit=20&offset=0"
BUCKETS_URL = f"{API_BASE}/api/public/results-confidence-buckets?days=3650"
SNAPSHOT_PATH = ROOT / "data" / "performance-snapshot.json"

LIMITATIONS = [
    "Historical analysis rows can include repeated books, lines, snapshots, model runs, and legacy retrospective data.",
    "The deduplicated ledger uses the current API collapse key; it is not a log of uniquely published recommendations.",
    "The public historical feed does not identify every row as forward-tested or backtested and does not expose a public model version.",
    "The historical outcome rate is descriptive only. It is not an ROI, profit, or future-performance claim because price and payout are not consistently available in the public feed.",
]


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={"Accept": "application/json", "User-Agent": "PropellerPicksSnapshot/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f"{url} returned HTTP {response.status}")
        return json.load(response)


def validate_record(label: str, record: dict) -> None:
    required = ("total", "wins", "losses", "pushes", "win_rate")
    missing = [key for key in required if key not in record]
    if missing:
        raise ValueError(f"{label} missing fields: {', '.join(missing)}")
    total = int(record["total"])
    decided = int(record["wins"]) + int(record["losses"]) + int(record["pushes"])
    if total != decided:
        raise ValueError(f"{label} does not reconcile: total={total} outcomes={decided}")


def build_snapshot(raw: dict, ledger: dict, buckets: dict) -> dict:
    overall = raw.get("overall") or {}
    validate_record("raw summary", overall)
    validate_record("deduplicated ledger", ledger)

    sports = [sport for sport in raw.get("sports", []) if sport.get("published")]
    for sport in sports:
        validate_record(f"sport {sport.get('key', 'unknown')}", sport)

    bucket_rows = buckets.get("buckets") or []
    bucket_total = sum(int((bucket.get("all") or {}).get("total", 0)) for bucket in bucket_rows)
    if bucket_total != int(overall["total"]):
        raise ValueError(
            f"confidence buckets do not reconcile to raw summary: buckets={bucket_total} raw={overall['total']}"
        )

    generated_at = ledger.get("generated_at") or raw.get("generated_at")
    if not generated_at:
        generated_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    recent = ledger.get("results") or []
    latest_game_date = max((str(row.get("game_date")) for row in recent if row.get("game_date")), default=None)
    raw_total = int(overall["total"])
    ledger_total = int(ledger["total"])
    top_sport = max(sports, key=lambda sport: int(sport.get("total", 0)), default={})

    return {
        "schema_version": "1.0",
        "generated_at": generated_at,
        "latest_sample_game_date": latest_game_date,
        "canonical_report": "https://propellerpicks.com/results/",
        "historical_database": {
            "unit": "raw graded analysis rows",
            "total": raw_total,
            "wins": int(overall["wins"]),
            "losses": int(overall["losses"]),
            "pushes": int(overall["pushes"]),
            "historical_outcome_rate": float(overall["win_rate"]),
            "rate_formula": "wins / (wins + losses); pushes excluded",
            "source": RAW_SUMMARY_URL,
        },
        "deduplicated_public_ledger": {
            "unit": "prop-result entries after the current public API collapse rules",
            "total": ledger_total,
            "wins": int(ledger["wins"]),
            "losses": int(ledger["losses"]),
            "pushes": int(ledger["pushes"]),
            "historical_outcome_rate": float(ledger["win_rate"]),
            "rate_formula": "wins / (wins + losses); pushes excluded",
            "raw_to_ledger_ratio": round(raw_total / ledger_total, 2) if ledger_total else None,
            "source": LEDGER_URL,
        },
        "coverage": {
            "sports": ["NFL", "NBA", "NHL", "MLB", "soccer", "PGA"],
            "reported_buckets": [sport.get("label") for sport in sports],
            "top_raw_bucket": top_sport.get("label"),
            "top_raw_bucket_share": round(int(top_sport.get("total", 0)) / raw_total * 100, 1)
            if raw_total and top_sport
            else None,
        },
        "raw_sport_buckets": sports,
        "raw_confidence_buckets": bucket_rows,
        "recent_ledger_sample": recent,
        "definitions": {
            "raw_graded_analysis_row": "One decided row stored by a sport analysis pipeline. Repeated books, lines, snapshots, runs, and retrospective records may be represented.",
            "deduplicated_public_ledger_entry": "A row retained after the current public results API collapses historical rows by its documented comparison key. It is not proof of public pre-event publication.",
            "forward_public_recommendation": "A recommendation with an immutable publication time, event start, exact side and line, captured price, and model version, published before the event. This prospective cohort is being separated from the historical archive.",
        },
        "limitations": LIMITATIONS,
        "source_endpoints": {
            "raw_summary": RAW_SUMMARY_URL,
            "deduplicated_ledger": LEDGER_URL,
            "raw_confidence_buckets": BUCKETS_URL,
        },
    }


def format_number(value: int) -> str:
    return f"{int(value):,}"


def format_short(value: int) -> str:
    value = int(value)
    if value >= 1_000_000:
        return f"{value / 1_000_000:.2f}".rstrip("0").rstrip(".") + "M"
    if value >= 1_000:
        return f"{value / 1_000:.0f}K"
    return format_number(value)


def format_percent(value: float) -> str:
    return f"{float(value):.1f}%"


def human_date(value: str) -> str:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed.strftime("%B %-d, %Y")


def replace_text(source: str, attribute: str, value: str) -> str:
    pattern = re.compile(
        rf'(<(?P<tag>[a-z0-9]+)\b[^>]*\b{re.escape(attribute)}(?:=(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?[^>]*>).*?(</(?P=tag)>)',
        flags=re.IGNORECASE | re.DOTALL,
    )
    return pattern.sub(lambda match: match.group(1) + html.escape(str(value)) + match.group(3), source)


def replace_marker(source: str, name: str, content: str) -> str:
    start = f"<!-- PP_{name}_START -->"
    end = f"<!-- PP_{name}_END -->"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), flags=re.DOTALL)
    replacement = f"{start}\n{content.rstrip()}\n{end}"
    if not pattern.search(source):
        raise ValueError(f"Missing marker {name}")
    return pattern.sub(lambda _: replacement, source, count=1)


def sport_cards(snapshot: dict) -> str:
    cards = []
    sports = sorted(snapshot["raw_sport_buckets"], key=lambda row: int(row["total"]), reverse=True)
    for sport in sports:
        label = html.escape(str(sport["label"]))
        key = html.escape(str(sport["key"])[:3].upper())
        rate = format_percent(sport["win_rate"])
        cards.append(
            f'''          <article class="sport-card">
            <div class="sport-card-top"><div class="sport-badge">{key}</div><div class="win-rate">{rate}</div></div>
            <div><h3>{label}</h3><div class="sport-progress" aria-label="{label} raw historical outcome rate"><span style="--fill: {rate}"></span></div></div>
            <div class="sport-meta"><span>{format_number(sport['total'])} raw rows</span><span>{format_number(sport['wins'])}W / {format_number(sport['losses'])}L</span></div>
          </article>'''
        )
    return '''        <div class="sport-grid" data-sport-grid>
''' + "\n".join(cards) + "\n        </div>"


def confidence_cards(snapshot: dict) -> str:
    cards = []
    buckets = [row for row in snapshot["raw_confidence_buckets"] if row.get("key") != "below_55"]
    for bucket in buckets:
        cards.append(
            f'''            <article class="confidence-card">
              <div><h3>{html.escape(str(bucket['label']))}</h3><span>{html.escape(str(bucket['range']))}</span></div>
              <strong>{format_percent(bucket['all']['win_rate'])}</strong>
              <p>{format_short(bucket['all']['total'])} raw rows · {format_percent(bucket['under']['win_rate'])} UNDER · {format_percent(bucket['over']['win_rate'])} OVER</p>
            </article>'''
        )
    return '''          <div class="confidence-strip" data-confidence-strip>
''' + "\n".join(cards) + "\n          </div>"


def bucket_cards(snapshot: dict) -> str:
    cards = []
    for bucket in snapshot["raw_confidence_buckets"]:
        muted = " bucket-card-muted" if bucket.get("key") == "below_55" else ""
        cards.append(
            f'''          <article class="bucket-card{muted}">
            <div class="bucket-topline"><div><h3>{html.escape(str(bucket['label']))}</h3><small>{html.escape(str(bucket['range']))}</small></div><strong>{format_percent(bucket['all']['win_rate'])}</strong></div>
            <div class="bucket-record"><span>{format_short(bucket['all']['total'])} raw rows</span><span>{format_number(bucket['all']['wins'])}-{format_number(bucket['all']['losses'])}-{format_number(bucket['all']['pushes'])}</span></div>
            <div class="bucket-splits" aria-label="{html.escape(str(bucket['label']))} raw over and under split">
              <div><span>OVER</span><strong>{format_percent(bucket['over']['win_rate'])}</strong><small>{format_number(bucket['over']['total'])}</small></div>
              <div><span>UNDER</span><strong>{format_percent(bucket['under']['win_rate'])}</strong><small>{format_number(bucket['under']['total'])}</small></div>
            </div>
          </article>'''
        )
    return '''        <div class="bucket-grid" data-bucket-grid>
''' + "\n".join(cards) + "\n        </div>"


def ledger_rows(snapshot: dict) -> str:
    rows = []
    for row in snapshot["recent_ledger_sample"][:10]:
        result = str(row.get("result") or "push").lower()
        result_class = "result-win" if result == "win" else "result-loss" if result == "loss" else "result-push"
        direction = str(row.get("predicted_direction") or "").upper()
        market = str(row.get("stat_type") or "").replace("_", " ").title()
        bookmaker = str(row.get("bookmaker") or "").replace("_", " ").title()
        rows.append(
            f'''                <tr>
                  <td class="num">{html.escape(str(row.get('game_date') or '--'))}</td>
                  <td><span class="sport-code">{html.escape(str(row.get('sport') or '--'))}</span></td>
                  <td class="player-cell">{html.escape(str(row.get('player_name') or '--'))}</td>
                  <td>{html.escape(f'{market} {direction}')}</td>
                  <td class="num">{html.escape(str(row.get('line') if row.get('line') is not None else '--'))}</td>
                  <td class="num">{format_percent(row.get('confidence_pct') or 0)}</td>
                  <td class="num">{html.escape(str(row.get('actual_value') if row.get('actual_value') is not None else '--'))}</td>
                  <td><span class="result-pill {result_class}">{html.escape(result.upper())}</span></td>
                  <td>{html.escape(bookmaker)}</td>
                </tr>'''
        )
    return '''              <tbody data-ledger-body>
''' + "\n".join(rows) + "\n              </tbody>"


def render_html(snapshot: dict) -> None:
    ledger = snapshot["deduplicated_public_ledger"]
    archive = snapshot["historical_database"]
    generated = human_date(snapshot["generated_at"])
    update_text = f"Static API snapshot · {generated}; live refresh enabled"
    sports_text = f"6 sports / {len(snapshot['coverage']['reported_buckets'])} buckets"

    home_path = ROOT / "index.html"
    home = home_path.read_text(encoding="utf-8")
    for attr, value in (
        ("data-record-updated", update_text),
        ("data-record-total", format_short(ledger["total"])),
        ("data-record-total-secondary", format_short(ledger["total"])),
        ("data-record-total-detail", f"{format_number(ledger['total'])} ledger entries"),
        ("data-record-raw-total", format_short(archive["total"])),
        ("data-record-raw-total-secondary", format_short(archive["total"])),
    ):
        home = replace_text(home, attr, value)
    home_path.write_text(home, encoding="utf-8")

    results_path = ROOT / "results" / "index.html"
    results = results_path.read_text(encoding="utf-8")
    for attr, value in (
        ("data-results-updated", update_text),
        ("data-results-total", format_short(ledger["total"])),
        ("data-results-wins", format_number(ledger["wins"])),
        ("data-results-outcome", f"{format_number(ledger['wins'])}-{format_number(ledger['losses'])}-{format_number(ledger['pushes'])}"),
        ("data-results-sports", sports_text),
        ("data-confidence-note", f"{format_number(archive['total'])} raw historical rows; descriptive outcome rates, not ROI."),
        ("data-ledger-summary", f"Sample from {format_number(ledger['total'])} entries under the current public-ledger collapse rules"),
    ):
        results = replace_text(results, attr, value)
    results = replace_marker(results, "SPORT_SNAPSHOT", sport_cards(snapshot))
    results = replace_marker(results, "CONFIDENCE_SNAPSHOT", confidence_cards(snapshot))
    results = replace_marker(results, "LEDGER_SNAPSHOT", ledger_rows(snapshot))
    results_path.write_text(results, encoding="utf-8")

    track_path = ROOT / "track-record" / "index.html"
    track = track_path.read_text(encoding="utf-8")
    for attr, value in (
        ("data-track-updated", update_text),
        ("data-track-total", format_short(ledger["total"])),
        ("data-track-wins", format_number(ledger["wins"])),
        ("data-track-outcome", f"{format_number(ledger['wins'])}-{format_number(ledger['losses'])}-{format_number(ledger['pushes'])}"),
        ("data-bucket-note", f"{format_number(archive['total'])} raw historical rows. Buckets describe the archive and are not a forward-test or ROI claim."),
    ):
        track = replace_text(track, attr, value)
    track = replace_marker(track, "BUCKET_SNAPSHOT", bucket_cards(snapshot))
    track_path.write_text(track, encoding="utf-8")


def update_llms(snapshot: dict) -> None:
    ledger = snapshot["deduplicated_public_ledger"]
    archive = snapshot["historical_database"]
    generated = human_date(snapshot["generated_at"])
    block = f"""## Current Historical Data Snapshot

Source snapshot generated: {generated}
Canonical explanation: https://propellerpicks.com/results/

- Historical database: {format_number(archive['total'])} raw graded analysis rows.
- Current public-ledger collapse: {format_number(ledger['total'])} prop-result entries.
- Raw-to-ledger ratio: {ledger['raw_to_ledger_ratio']}x.
- Sports represented: NFL, NBA, NHL, MLB, soccer, and PGA.

These historical records include repeated analysis snapshots and legacy retrospective data. They are research records, not a uniquely published forward-test, ROI, profit, or future-performance claim. Use the canonical report before quoting any aggregate figure.
"""
    path = ROOT / "llms.txt"
    source = path.read_text(encoding="utf-8")
    source = re.sub(
        r"## Current Public Record Snapshot\n.*?(?=\n## Safe Public Data Feeds)",
        block.rstrip() + "\n",
        source,
        count=1,
        flags=re.DOTALL,
    )
    source = source.replace("Last verified: 2026-07-07", f"Last verified: {snapshot['generated_at'][:10]}")
    path.write_text(source, encoding="utf-8")


def update_catalog(snapshot: dict) -> None:
    path = ROOT / "data" / "index.json"
    catalog = json.loads(path.read_text(encoding="utf-8"))
    ledger = snapshot["deduplicated_public_ledger"]
    archive = snapshot["historical_database"]
    catalog["generated_at"] = snapshot["generated_at"]
    catalog["performance_snapshot"] = "https://propellerpicks.com/data/performance-snapshot.json"
    catalog["canonical_performance_report"] = "https://propellerpicks.com/results/"
    catalog["record_snapshot"] = {
        "generated_at": snapshot["generated_at"],
        "historical_database_rows": archive["total"],
        "deduplicated_public_ledger_entries": ledger["total"],
        "scope": "Historical analysis archive; includes repeated snapshots and legacy retrospective data.",
        "not_a_claim_of": ["unique published recommendations", "forward-tested performance", "ROI", "profitability"],
        "freshness_note": "Fetch the linked source APIs for current totals and read the canonical performance report before quoting aggregate figures.",
    }
    for feed in catalog.get("safe_public_feeds", []):
        if feed.get("id") == "results-summary":
            feed["description"] = "Aggregate raw graded analysis rows by sport; not unique published recommendations."
        elif feed.get("id") == "results-ledger":
            feed["description"] = "Paginated historical entries after the current public API collapse rules."
        elif feed.get("id") == "confidence-buckets":
            feed["description"] = "Raw historical analysis rows grouped by directional signal range."
    path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true", help="Render from the existing snapshot without network calls")
    args = parser.parse_args()

    if args.offline:
        snapshot = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    else:
        snapshot = build_snapshot(fetch_json(RAW_SUMMARY_URL), fetch_json(LEDGER_URL), fetch_json(BUCKETS_URL))
        SNAPSHOT_PATH.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    render_html(snapshot)
    update_llms(snapshot)
    update_catalog(snapshot)
    print(
        "snapshot="
        f"{snapshot['generated_at']} raw={snapshot['historical_database']['total']} "
        f"ledger={snapshot['deduplicated_public_ledger']['total']}"
    )


if __name__ == "__main__":
    main()
