#!/usr/bin/env python3
"""Create a private, descriptive GA4 comparison for the August 17 release.

The report is deliberately local-only. It contains aggregate GA4 rows and
never writes credentials, account identifiers, or visitor-level data. August
17 is excluded from every comparison because it was the release day.
"""

from __future__ import annotations

import argparse
import json
import math
import os
from datetime import date, datetime
from pathlib import Path
from typing import Any, Callable, Iterable, Protocol
from zoneinfo import ZoneInfo


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = Path.home() / ".codex" / "private-analytics" / "propedge-post-redesign"
DEFAULT_OUTPUT_NAME = "post-redesign-measurement.json"
CONFIG_PATH = Path.home() / ".config" / "claude-seo" / "google-api.json"
DEFAULT_SERVICE_ACCOUNT = Path.home() / "Projects" / "nfl-betting-system" / "config" / "ga-service-account.json"
GA_PROPERTY = "properties/525454922"
TIMEZONE = "America/Chicago"
ALLOWED_METRICS = (
    "active_users",
    "new_users",
    "sessions",
    "cta_clicks",
    "sign_ups",
    "calculator_completed",
    "analyzer_completed",
)
OVERVIEW_METRICS = {
    "activeUsers": "active_users",
    "newUsers": "new_users",
    "sessions": "sessions",
    "engagedSessions": "engaged_sessions",
    "screenPageViews": "page_views",
    "eventCount": "event_count",
    "keyEvents": "key_events",
    "userEngagementDuration": "engagement_duration_seconds",
}
CTA_EVENT_NAMES = frozenset({
    "signup_click",
    "web_app_click",
    "app_store_click",
    "play_store_click",
    "analyzer_cta_click",
    "research_cta_click",
})
SLICE_SPECS = (
    ("channels", "sessionDefaultChannelGroup", "channel", ("sessions", "totalUsers", "newUsers", "engagedSessions", "eventCount", "keyEvents"), "sessions"),
    ("devices", "deviceCategory", "device", ("sessions", "totalUsers", "engagedSessions", "eventCount", "keyEvents"), "sessions"),
    ("landing_pages", "landingPage", "landing_page", ("sessions", "totalUsers", "engagedSessions", "eventCount", "keyEvents"), "sessions"),
    ("events", "eventName", "event_name", ("eventCount", "totalUsers", "keyEvents"), "eventCount"),
)
BASELINE = {"start": date(2026, 8, 3), "end": date(2026, 8, 16)}
BASELINE_DUE = date(2026, 8, 18)
PHASES = (
    {
        "name": "7d",
        "due": date(2026, 8, 27),
        "post_start": date(2026, 8, 18),
        "post_end": date(2026, 8, 24),
        "baseline_start": date(2026, 8, 10),
        "baseline_end": date(2026, 8, 16),
    },
    {
        "name": "14d",
        "due": date(2026, 9, 3),
        "post_start": date(2026, 8, 18),
        "post_end": date(2026, 8, 31),
        "baseline_start": date(2026, 8, 3),
        "baseline_end": date(2026, 8, 16),
    },
)


class Collector(Protocol):
    def collect(self, start: date, end: date) -> dict[str, Any]: ...


def parse_iso_date(value: str) -> date:
    return date.fromisoformat(value)


def chicago_today() -> date:
    return datetime.now(ZoneInfo(TIMEZONE)).date()


def due_phases(as_of: date) -> list[dict[str, Any]]:
    return [phase for phase in PHASES if as_of >= phase["due"]]


def due_phase(as_of: date) -> dict[str, Any] | None:
    """Compatibility helper for the newest fully due comparison."""
    available = due_phases(as_of)
    return available[-1] if available else None


def baseline_is_due(as_of: date) -> bool:
    return as_of >= BASELINE_DUE


def numeric(value: Any) -> int | float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError("Fixture metrics must be finite numbers.")
    return value


def safe_daily_rows(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Filter fixture rows to allowlisted aggregates and reject corrupt dates."""
    daily = payload.get("daily", [])
    if not isinstance(daily, list):
        raise ValueError("Fixture daily must be an array.")
    rows: list[dict[str, Any]] = []
    seen_dates: set[date] = set()
    for raw in daily:
        if not isinstance(raw, dict) or not isinstance(raw.get("date"), str):
            raise ValueError("Each fixture row must have an ISO date.")
        day = parse_iso_date(raw["date"])
        if day in seen_dates:
            raise ValueError("Fixture daily rows may not contain duplicate dates.")
        seen_dates.add(day)
        row: dict[str, Any] = {"date": raw["date"]}
        for metric in ALLOWED_METRICS:
            if metric in raw:
                row[metric] = numeric(raw[metric])
        rows.append(row)
    return rows


def totals(rows: Iterable[dict[str, Any]], start: date, end: date) -> dict[str, int | float]:
    output: dict[str, int | float] = {metric: 0 for metric in ALLOWED_METRICS}
    for row in rows:
        day = parse_iso_date(row["date"])
        if start <= day <= end:
            for metric in ALLOWED_METRICS:
                if metric in row:
                    output[metric] += numeric(row[metric])
    return output


def percent_change(current: int | float, baseline: int | float) -> float | None:
    if baseline == 0:
        return None
    return round((current - baseline) / baseline * 100, 1)


def compact_number(value: str) -> int | float:
    as_float = float(value)
    if not math.isfinite(as_float):
        raise ValueError("GA4 returned a non-finite aggregate.")
    return int(as_float) if as_float.is_integer() else round(as_float, 4)


def load_local_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        return {}
    try:
        payload = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


class GA4Collector:
    def __init__(self, client: Any, request_types: dict[str, Any]):
        self.client = client
        self.request_types = request_types

    def report(self, start: date, end: date, metrics: tuple[str, ...], dimension: str | None = None, limit: int = 15) -> list[dict[str, Any]]:
        DateRange = self.request_types["DateRange"]
        Dimension = self.request_types["Dimension"]
        Metric = self.request_types["Metric"]
        OrderBy = self.request_types["OrderBy"]
        RunReportRequest = self.request_types["RunReportRequest"]
        request = RunReportRequest(
            property=GA_PROPERTY,
            date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
            dimensions=[Dimension(name=dimension)] if dimension else [],
            metrics=[Metric(name=name) for name in metrics],
            order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name=metrics[0]), desc=True)] if dimension else [],
            limit=limit if dimension else 1,
        )
        response = self.client.run_report(request)
        records: list[dict[str, Any]] = []
        for row in response.rows:
            record: dict[str, Any] = {}
            if dimension:
                record[dimension] = row.dimension_values[0].value
            for index, metric in enumerate(metrics):
                record[metric] = compact_number(row.metric_values[index].value)
            records.append(record)
        return records

    def collect(self, start: date, end: date) -> dict[str, Any]:
        overview_rows = self.report(start, end, tuple(OVERVIEW_METRICS))
        overview_raw = overview_rows[0] if overview_rows else {}
        result: dict[str, Any] = {
            "overview": {output: overview_raw.get(source, 0) for source, output in OVERVIEW_METRICS.items()}
        }
        for name, dimension, output_dimension, metrics, _ in SLICE_SPECS:
            rows = self.report(start, end, metrics, dimension, limit=100000 if name == "events" else 15)
            result[name] = [
                {output_dimension: row.get(dimension, "(not set)"), **{metric: row.get(metric, 0) for metric in metrics}}
                for row in rows
            ]
        return result


def create_ga_collector() -> GA4Collector:
    """Use the same local credential convention as the analytics dashboard."""
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, OrderBy, RunReportRequest
    from google.oauth2 import service_account

    config = load_local_config()
    credential_path = Path(
        os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        or config.get("service_account_path")
        or DEFAULT_SERVICE_ACCOUNT
    ).expanduser()
    if not credential_path.exists():
        raise FileNotFoundError("Local GA4 credentials are unavailable.")
    credentials = service_account.Credentials.from_service_account_file(
        str(credential_path), scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    return GA4Collector(
        BetaAnalyticsDataClient(credentials=credentials),
        {"DateRange": DateRange, "Dimension": Dimension, "Metric": Metric, "OrderBy": OrderBy, "RunReportRequest": RunReportRequest},
    )


class FixtureCollector:
    """Dependency-free fixture seam used by tests and manual local replays."""
    def __init__(self, payload: dict[str, Any]):
        self.rows = safe_daily_rows(payload)
        self.ranges = payload.get("ranges", {})
        if not isinstance(self.ranges, dict):
            raise ValueError("Fixture ranges must be an object when supplied.")

    def collect(self, start: date, end: date) -> dict[str, Any]:
        key = f"{start.isoformat()}..{end.isoformat()}"
        supplied = self.ranges.get(key)
        if supplied is not None:
            if not isinstance(supplied, dict):
                raise ValueError("Fixture range values must be objects.")
            return supplied
        return {"overview": totals(self.rows, start, end), **{name: [] for name, *_ in SLICE_SPECS}}


def derived_overview_metrics(events: Iterable[dict[str, Any]], overview: dict[str, Any]) -> dict[str, int | float]:
    """Add stable conversion and engagement metrics, including observed zeroes."""
    event_totals: dict[str, int | float] = {}
    for row in events:
        if not isinstance(row, dict):
            continue
        event_name = str(row.get("event_name", ""))
        value = row.get("eventCount", 0)
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            event_totals[event_name] = event_totals.get(event_name, 0) + numeric(value)
    sessions = numeric(overview.get("sessions", 0))
    active_users = numeric(overview.get("active_users", 0))
    engaged_sessions = numeric(overview.get("engaged_sessions", 0))
    engagement_duration = numeric(overview.get("engagement_duration_seconds", 0))
    return {
        "cta_clicks": sum(event_totals.get(name, 0) for name in CTA_EVENT_NAMES),
        "sign_ups": event_totals.get("sign_up", 0),
        "calculator_completed": event_totals.get("calculator_completed", 0),
        "analyzer_completed": event_totals.get("analyzer_completed", 0),
        "engagement_rate": round((engaged_sessions / sessions) * 100, 2) if sessions else 0,
        "average_engagement_seconds_per_active_user": round(engagement_duration / active_users, 2) if active_users else 0,
    }


def normalized_snapshot(snapshot: dict[str, Any]) -> dict[str, Any]:
    overview = dict(snapshot.get("overview", {}))
    events = snapshot.get("events", [])
    overview.update(derived_overview_metrics(events if isinstance(events, list) else [], overview))
    return {**snapshot, "overview": overview}


def compare_overview(post: dict[str, Any], baseline: dict[str, Any]) -> dict[str, dict[str, int | float | None]]:
    names = sorted(set(post) | set(baseline))
    return {
        name: {
            "post": numeric(post.get(name, 0)),
            "baseline": numeric(baseline.get(name, 0)),
            "percent_change": percent_change(numeric(post.get(name, 0)), numeric(baseline.get(name, 0))),
        }
        for name in names
    }


def compare_slice(post: list[dict[str, Any]], baseline: list[dict[str, Any]], dimension: str) -> list[dict[str, Any]]:
    post_by_dimension = {str(row.get(dimension, "(not set)")): row for row in post if isinstance(row, dict)}
    base_by_dimension = {str(row.get(dimension, "(not set)")): row for row in baseline if isinstance(row, dict)}
    rows: list[dict[str, Any]] = []
    for value in sorted(set(post_by_dimension) | set(base_by_dimension)):
        current, previous = post_by_dimension.get(value, {}), base_by_dimension.get(value, {})
        metrics = sorted((set(current) | set(previous)) - {dimension})
        comparison: dict[str, Any] = {dimension: value}
        for metric in metrics:
            if isinstance(current.get(metric, 0), (int, float)) and isinstance(previous.get(metric, 0), (int, float)):
                post_value, baseline_value = numeric(current.get(metric, 0)), numeric(previous.get(metric, 0))
                comparison[metric] = {"post": post_value, "baseline": baseline_value, "percent_change": percent_change(post_value, baseline_value)}
        rows.append(comparison)
    return rows


def phase_report(collector: Collector, phase: dict[str, Any]) -> dict[str, Any]:
    post = normalized_snapshot(collector.collect(phase["post_start"], phase["post_end"]))
    baseline = normalized_snapshot(collector.collect(phase["baseline_start"], phase["baseline_end"]))
    report: dict[str, Any] = {
        "windows": {
            "post": {"start": phase["post_start"].isoformat(), "end": phase["post_end"].isoformat()},
            "baseline": {"start": phase["baseline_start"].isoformat(), "end": phase["baseline_end"].isoformat()},
        },
        "overview": compare_overview(post.get("overview", {}), baseline.get("overview", {})),
    }
    for name, _, dimension, _, _ in SLICE_SPECS:
        report[name] = compare_slice(post.get(name, []), baseline.get(name, []), dimension)
    return report


def report_meta(as_of: date, status: str) -> dict[str, Any]:
    return {
        "status": status,
        "release_date": "2026-08-17",
        "excluded_release_date": "2026-08-17",
        "as_of": as_of.isoformat(),
        "timezone": TIMEZONE,
        "ga4_property": "525454922",
        "privacy": "aggregate GA4 metrics only; no credentials, service-account identifiers, query parameters, or personal data",
        "interpretation": "This is a descriptive before-and-after comparison and does not establish that the homepage redesign caused any change.",
    }


def build_report(collector: Collector, as_of: date, phases: Iterable[dict[str, Any]] | None = None) -> dict[str, Any]:
    phases = list(due_phases(as_of) if phases is None else phases)
    baseline = normalized_snapshot(collector.collect(BASELINE["start"], BASELINE["end"]))
    return {
        "meta": report_meta(as_of, "complete"),
        "baseline": {
            "window": {"start": BASELINE["start"].isoformat(), "end": BASELINE["end"].isoformat()},
            **baseline,
        },
        "phases": {phase["name"]: phase_report(collector, phase) for phase in phases},
    }


def blocked_report(as_of: date, phases: Iterable[dict[str, Any]]) -> dict[str, Any]:
    return {
        "meta": report_meta(as_of, "blocked"),
        "blocker": "ga4_query_failed",
        "due_phases": [phase["name"] for phase in phases],
        "next_step": "Restore the local GA4 service-account access and rerun this command. No credentials or error details are recorded here.",
    }


def resolve_output_path(output_dir: Path) -> Path:
    resolved = output_dir.expanduser().resolve()
    if resolved == REPO_ROOT or REPO_ROOT in resolved.parents:
        raise ValueError("Output directory must resolve outside the repository.")
    return resolved / DEFAULT_OUTPUT_NAME


def write_idempotent(path: Path, payload: dict[str, Any]) -> bool:
    content = json.dumps(payload, indent=2, sort_keys=True) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True


def load_fixture(path: Path) -> FixtureCollector:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("Fixture must be a JSON object.")
    return FixtureCollector(payload)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--as-of", type=parse_iso_date, default=chicago_today())
    parser.add_argument("--input", type=Path, help="Optional local aggregate-metrics fixture JSON.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None, collector_factory: Callable[[], Collector] = create_ga_collector) -> int:
    args = parse_args(argv)
    phases = due_phases(args.as_of)
    if not baseline_is_due(args.as_of):
        return 0
    output_path = resolve_output_path(args.output_dir)
    blocked_path = output_path.with_name("post-redesign-measurement-blocked.json")
    try:
        collector = load_fixture(args.input) if args.input else collector_factory()
        report = build_report(collector, args.as_of, phases)
        exit_code = 0
    except Exception:  # Do not persist auth paths, account IDs, or upstream details.
        report = blocked_report(args.as_of, phases)
        exit_code = 1
    destination = output_path if exit_code == 0 else blocked_path
    write_idempotent(destination, report)
    print(destination)
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
