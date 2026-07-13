#!/usr/bin/env python3
"""
Generate a local GA4 + Google Search Console snapshot for the analytics dashboard.

The output file is intentionally gitignored because it contains private analytics
aggregates. No credentials are written to disk by this script.
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from xml.etree import ElementTree

try:
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        DateRange,
        Dimension,
        Metric,
        OrderBy,
        RunRealtimeReportRequest,
        RunReportRequest,
    )
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError as exc:
    print("Missing Google API libraries.", file=sys.stderr)
    print("Run with the project venv:", file=sys.stderr)
    print(
        "  /Users/scottolmer/Projects/nfl-betting-system/.venv/bin/python "
        "scripts/generate_analytics_dashboard.py",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc


REPO_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = Path.home() / ".config" / "claude-seo" / "google-api.json"
DEFAULT_SERVICE_ACCOUNT = (
    Path.home() / "Projects" / "nfl-betting-system" / "config" / "ga-service-account.json"
)
DEFAULT_OUTPUT = REPO_ROOT / "analytics-dashboard" / "data" / "analytics-dashboard.json"
DEFAULT_GA_PROPERTY = "properties/525454922"
DEFAULT_GSC_PROPERTY = "sc-domain:propellerpicks.com"
SITE_ORIGIN = "https://propellerpicks.com"
PERIODS = (7, 28, 90)
GSC_LAG_DAYS = 3
AI_REFERRER_PATTERNS = (
    ("chatgpt", "ChatGPT"),
    ("openai", "OpenAI"),
    ("perplexity", "Perplexity"),
    ("copilot", "Copilot"),
    ("claude", "Claude"),
    ("anthropic", "Claude"),
    ("gemini", "Gemini"),
    ("bard", "Gemini"),
    ("poe.com", "Poe"),
    ("you.com", "You.com"),
    ("phind", "Phind"),
    ("ai-assistant", "AI Assistant"),
)

SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
]


def load_local_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text())
    except (OSError, json.JSONDecodeError):
        return {}


def normalize_ga_property(value: str | None) -> str:
    if not value:
        return DEFAULT_GA_PROPERTY
    value = value.strip()
    if value.startswith("properties/"):
        return value
    return f"properties/{value}"


def parse_number(value: str) -> int | float | str:
    try:
        as_float = float(value)
    except (TypeError, ValueError):
        return value
    if as_float.is_integer():
        return int(as_float)
    return round(as_float, 4)


def pct_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None if current == 0 else 100.0
    return round(((current - previous) / previous) * 100, 1)


def compact_row(row: dict[str, Any], keys: list[str]) -> dict[str, Any]:
    return {key: row.get(key, 0) for key in keys}


def ai_referrer_label(source_medium: str) -> str | None:
    normalized = source_medium.lower()
    for pattern, label in AI_REFERRER_PATTERNS:
        if pattern in normalized:
            return label
    return None


def summarize_ai_referrals(
    source_medium_rows: list[dict[str, Any]],
    channel_rows: list[dict[str, Any]],
    previous_source_medium_rows: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    sources: list[dict[str, Any]] = []
    totals = {
        "sessions": 0,
        "users": 0,
        "newUsers": 0,
        "engagedSessions": 0,
        "eventCount": 0,
    }

    for row in source_medium_rows:
        source_medium = str(row.get("sessionSourceMedium", ""))
        assistant = ai_referrer_label(source_medium)
        if not assistant:
            continue
        entry = {
            "assistant": assistant,
            "sourceMedium": source_medium,
            "sessions": row.get("sessions", 0),
            "users": row.get("totalUsers", 0),
            "newUsers": row.get("newUsers", 0),
            "engagedSessions": row.get("engagedSessions", 0),
            "eventCount": row.get("eventCount", 0),
        }
        sources.append(entry)
        for key in totals:
            totals[key] += int(entry.get(key, 0) or 0)

    channel_rows_ai = [
        row
        for row in channel_rows
        if str(row.get("sessionDefaultChannelGroup", "")).lower() == "ai assistant"
    ]
    channel_sessions = sum(int(row.get("sessions", 0) or 0) for row in channel_rows_ai)
    channel_users = sum(int(row.get("totalUsers", 0) or 0) for row in channel_rows_ai)

    previous = None
    if previous_source_medium_rows is not None:
        previous = summarize_ai_referrals(previous_source_medium_rows, [], None)
        totals["delta"] = {
            "sessions": pct_change(totals["sessions"], previous["sessions"]),
            "users": pct_change(totals["users"], previous["users"]),
            "eventCount": pct_change(totals["eventCount"], previous["eventCount"]),
        }

    return {
        **totals,
        "channelSessions": channel_sessions,
        "channelUsers": channel_users,
        "sources": sorted(sources, key=lambda row: row["sessions"], reverse=True),
        "previous": previous,
    }


def page_path(url_or_path: str) -> str:
    if not url_or_path:
        return "/"
    if url_or_path.startswith("http"):
        parsed = urlparse(url_or_path)
        path = parsed.path or "/"
    else:
        path = url_or_path
    if not path.startswith("/"):
        path = f"/{path}"
    return path


def local_sitemap_summary() -> dict[str, Any]:
    sitemap = REPO_ROOT / "sitemap.xml"
    if not sitemap.exists():
        return {"urlCount": 0, "lastModified": None}
    try:
        root = ElementTree.parse(sitemap).getroot()
        namespace = ""
        if root.tag.startswith("{"):
            namespace = root.tag.split("}")[0] + "}"
        urls = root.findall(f".//{namespace}url")
        lastmods = [
            node.text
            for node in root.findall(f".//{namespace}lastmod")
            if node.text
        ]
        return {
            "urlCount": len(urls),
            "lastModified": max(lastmods) if lastmods else None,
        }
    except ElementTree.ParseError:
        return {"urlCount": 0, "lastModified": None, "error": "Could not parse sitemap.xml"}


def build_clients() -> tuple[BetaAnalyticsDataClient, Any, dict[str, str]]:
    config = load_local_config()
    credential_path = Path(
        os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        or config.get("service_account_path")
        or DEFAULT_SERVICE_ACCOUNT
    ).expanduser()

    if not credential_path.exists():
        raise FileNotFoundError(f"Service account file not found: {credential_path}")

    credentials = service_account.Credentials.from_service_account_file(
        str(credential_path),
        scopes=SCOPES,
    )
    ga_property = normalize_ga_property(
        os.environ.get("GA4_PROPERTY_ID") or config.get("ga4_property_id")
    )
    gsc_property = (
        os.environ.get("GSC_PROPERTY")
        or config.get("default_property")
        or DEFAULT_GSC_PROPERTY
    )

    return (
        BetaAnalyticsDataClient(credentials=credentials),
        build("searchconsole", "v1", credentials=credentials, cache_discovery=False),
        {
            "gaProperty": ga_property,
            "gscProperty": gsc_property,
            "serviceAccountEmail": getattr(credentials, "service_account_email", ""),
        },
    )


def ga_report(
    client: BetaAnalyticsDataClient,
    ga_property: str,
    start_date: str,
    end_date: str,
    metrics: list[str],
    dimensions: list[str] | None = None,
    order_metric: str | None = None,
    limit: int | None = None,
) -> list[dict[str, Any]]:
    dimensions = dimensions or []
    order_bys = []
    if order_metric:
        order_bys.append(
            OrderBy(
                metric=OrderBy.MetricOrderBy(metric_name=order_metric),
                desc=True,
            )
        )

    request = RunReportRequest(
        property=ga_property,
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name=name) for name in dimensions],
        metrics=[Metric(name=name) for name in metrics],
        order_bys=order_bys,
        limit=limit or 0,
    )
    response = client.run_report(request)

    rows: list[dict[str, Any]] = []
    for row in response.rows:
        record: dict[str, Any] = {}
        for index, name in enumerate(dimensions):
            record[name] = row.dimension_values[index].value
        for index, name in enumerate(metrics):
            record[name] = parse_number(row.metric_values[index].value)
        rows.append(record)
    return rows


def ga_overview(
    client: BetaAnalyticsDataClient,
    ga_property: str,
    start_date: str,
    end_date: str,
) -> dict[str, Any]:
    metrics = [
        "totalUsers",
        "newUsers",
        "sessions",
        "screenPageViews",
        "engagedSessions",
        "averageSessionDuration",
        "bounceRate",
        "eventCount",
        "keyEvents",
    ]
    row = (ga_report(client, ga_property, start_date, end_date, metrics) or [{}])[0]
    sessions = float(row.get("sessions", 0) or 0)
    engaged = float(row.get("engagedSessions", 0) or 0)
    return {
        "users": row.get("totalUsers", 0),
        "newUsers": row.get("newUsers", 0),
        "sessions": row.get("sessions", 0),
        "pageViews": row.get("screenPageViews", 0),
        "engagedSessions": row.get("engagedSessions", 0),
        "engagementRate": round((engaged / sessions) * 100, 2) if sessions else 0,
        "avgSessionDuration": row.get("averageSessionDuration", 0),
        "bounceRate": round(float(row.get("bounceRate", 0) or 0) * 100, 2),
        "eventCount": row.get("eventCount", 0),
        "keyEvents": row.get("keyEvents", 0),
    }


def ga_realtime(client: BetaAnalyticsDataClient, ga_property: str) -> dict[str, Any]:
    active = 0
    pages: list[dict[str, Any]] = []
    try:
        response = client.run_realtime_report(
            RunRealtimeReportRequest(
                property=ga_property,
                metrics=[Metric(name="activeUsers")],
            )
        )
        if response.rows:
            active = int(response.rows[0].metric_values[0].value)

        page_response = client.run_realtime_report(
            RunRealtimeReportRequest(
                property=ga_property,
                dimensions=[Dimension(name="unifiedScreenName")],
                metrics=[Metric(name="activeUsers")],
            )
        )
        for row in page_response.rows:
            pages.append(
                {
                    "page": row.dimension_values[0].value,
                    "activeUsers": int(row.metric_values[0].value),
                }
            )
    except Exception as exc:
        return {"activeUsers": 0, "pages": [], "error": str(exc)}

    return {"activeUsers": active, "pages": pages[:20]}


def ga_period(
    client: BetaAnalyticsDataClient,
    ga_property: str,
    start_date: date,
    end_date: date,
    previous_start: date,
    previous_end: date,
) -> dict[str, Any]:
    start = start_date.isoformat()
    end = end_date.isoformat()
    prev_start = previous_start.isoformat()
    prev_end = previous_end.isoformat()

    overview = ga_overview(client, ga_property, start, end)
    previous = ga_overview(client, ga_property, prev_start, prev_end)
    overview["delta"] = {
        key: pct_change(float(overview.get(key, 0) or 0), float(previous.get(key, 0) or 0))
        for key in ("users", "sessions", "pageViews", "eventCount")
    }

    daily = ga_report(
        client,
        ga_property,
        start,
        end,
        ["totalUsers", "sessions", "screenPageViews", "eventCount"],
        ["date"],
        limit=500,
    )

    channels = ga_report(
        client,
        ga_property,
        start,
        end,
        ["sessions", "totalUsers", "newUsers", "engagedSessions", "eventCount", "keyEvents"],
        ["sessionDefaultChannelGroup"],
        "sessions",
        15,
    )
    source_medium = ga_report(
        client,
        ga_property,
        start,
        end,
        ["sessions", "totalUsers", "newUsers", "engagedSessions", "eventCount"],
        ["sessionSourceMedium"],
        "sessions",
        25,
    )
    previous_source_medium = ga_report(
        client,
        ga_property,
        prev_start,
        prev_end,
        ["sessions", "totalUsers", "newUsers", "engagedSessions", "eventCount"],
        ["sessionSourceMedium"],
        "sessions",
        50,
    )

    return {
        "dateRange": {"start": start, "end": end},
        "previousDateRange": {"start": prev_start, "end": prev_end},
        "overview": overview,
        "previousOverview": previous,
        "daily": daily,
        "channels": channels,
        "sourceMedium": source_medium,
        "aiReferrals": summarize_ai_referrals(source_medium, channels, previous_source_medium),
        "landingPages": ga_report(
            client,
            ga_property,
            start,
            end,
            [
                "sessions",
                "totalUsers",
                "screenPageViews",
                "engagedSessions",
                "averageSessionDuration",
                "bounceRate",
                "eventCount",
                "keyEvents",
            ],
            ["landingPagePlusQueryString"],
            "sessions",
            40,
        ),
        "pages": ga_report(
            client,
            ga_property,
            start,
            end,
            ["screenPageViews", "totalUsers", "averageSessionDuration", "eventCount"],
            ["pagePath"],
            "screenPageViews",
            60,
        ),
        "events": ga_report(
            client,
            ga_property,
            start,
            end,
            ["eventCount", "totalUsers", "keyEvents"],
            ["eventName"],
            "eventCount",
            40,
        ),
        "countries": ga_report(
            client,
            ga_property,
            start,
            end,
            ["totalUsers", "sessions"],
            ["country"],
            "totalUsers",
            20,
        ),
        "cities": ga_report(
            client,
            ga_property,
            start,
            end,
            ["totalUsers", "sessions"],
            ["city"],
            "totalUsers",
            25,
        ),
        "devices": ga_report(
            client,
            ga_property,
            start,
            end,
            ["totalUsers", "sessions", "bounceRate"],
            ["deviceCategory"],
            "totalUsers",
            10,
        ),
        "browsers": ga_report(
            client,
            ga_property,
            start,
            end,
            ["totalUsers", "sessions"],
            ["browser"],
            "totalUsers",
            15,
        ),
        "operatingSystems": ga_report(
            client,
            ga_property,
            start,
            end,
            ["totalUsers", "sessions"],
            ["operatingSystem"],
            "totalUsers",
            15,
        ),
        "newReturning": ga_report(
            client,
            ga_property,
            start,
            end,
            ["totalUsers", "sessions"],
            ["newVsReturning"],
            "totalUsers",
            5,
        ),
    }


def gsc_query(
    service: Any,
    gsc_property: str,
    start_date: str,
    end_date: str,
    dimensions: list[str] | None = None,
    search_type: str = "web",
    max_rows: int = 25000,
) -> list[dict[str, Any]]:
    dimensions = dimensions or []
    rows: list[dict[str, Any]] = []
    start_row = 0
    page_size = min(25000, max_rows)

    while start_row < max_rows:
        body: dict[str, Any] = {
            "startDate": start_date,
            "endDate": end_date,
            "type": search_type,
            "dataState": "final",
            "rowLimit": min(page_size, max_rows - start_row),
            "startRow": start_row,
        }
        if dimensions:
            body["dimensions"] = dimensions

        response = service.searchanalytics().query(
            siteUrl=gsc_property,
            body=body,
        ).execute()
        batch = response.get("rows", [])
        if not batch:
            break

        for row in batch:
            keys = row.get("keys", [])
            record: dict[str, Any] = {
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": round(float(row.get("ctr", 0)) * 100, 2),
                "position": round(float(row.get("position", 0)), 1),
            }
            for index, dimension in enumerate(dimensions):
                record[dimension] = keys[index] if index < len(keys) else ""
            rows.append(record)

        if len(batch) < body["rowLimit"]:
            break
        start_row += len(batch)

    return rows


def gsc_totals(
    service: Any,
    gsc_property: str,
    start_date: str,
    end_date: str,
    search_type: str = "web",
) -> dict[str, Any]:
    rows = gsc_query(
        service,
        gsc_property,
        start_date,
        end_date,
        dimensions=[],
        search_type=search_type,
        max_rows=1,
    )
    return rows[0] if rows else {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}


def gsc_sitemaps(service: Any, gsc_property: str) -> list[dict[str, Any]]:
    response = service.sitemaps().list(siteUrl=gsc_property).execute()
    sitemaps: list[dict[str, Any]] = []
    for sitemap in response.get("sitemap", []):
        sitemaps.append(
            {
                "path": sitemap.get("path"),
                "lastSubmitted": sitemap.get("lastSubmitted"),
                "isPending": sitemap.get("isPending", False),
                "isIndex": sitemap.get("isSitemapsIndex", False),
                "type": sitemap.get("type"),
                "warnings": sitemap.get("warnings", 0),
                "errors": sitemap.get("errors", 0),
                "contents": sitemap.get("contents", []),
            }
        )
    return sitemaps


def aggregate_gsc_by_path(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    aggregate: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"clicks": 0, "impressions": 0, "weightedPosition": 0.0}
    )
    for row in rows:
        path = page_path(row.get("page", ""))
        item = aggregate[path]
        impressions = int(row.get("impressions", 0))
        item["clicks"] += int(row.get("clicks", 0))
        item["impressions"] += impressions
        item["weightedPosition"] += float(row.get("position", 0) or 0) * impressions

    for path, item in aggregate.items():
        impressions = item["impressions"]
        item["path"] = path
        item["ctr"] = round((item["clicks"] / impressions) * 100, 2) if impressions else 0
        item["position"] = round(item["weightedPosition"] / impressions, 1) if impressions else 0
        item.pop("weightedPosition", None)
    return dict(aggregate)


def build_content_matrix(ga_data: dict[str, Any], gsc_pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    ga_pages = {
        page_path(row.get("pagePath", "")): row
        for row in ga_data.get("pages", [])
    }
    gsc_by_path = {
        page_path(row.get("page", "")): row
        for row in gsc_pages
    }
    paths = list(dict.fromkeys(list(ga_pages.keys()) + list(gsc_by_path.keys())))
    matrix = []
    for path in paths:
        ga_row = ga_pages.get(path, {})
        gsc_row = gsc_by_path.get(path, {})
        matrix.append(
            {
                "path": path,
                "pageViews": ga_row.get("screenPageViews", 0),
                "users": ga_row.get("totalUsers", 0),
                "avgSessionDuration": ga_row.get("averageSessionDuration", 0),
                "eventCount": ga_row.get("eventCount", 0),
                "clicks": gsc_row.get("clicks", 0),
                "impressions": gsc_row.get("impressions", 0),
                "ctr": gsc_row.get("ctr", 0),
                "position": gsc_row.get("position", 0),
            }
        )
    return sorted(
        matrix,
        key=lambda row: (
            int(row.get("clicks", 0)) + int(row.get("users", 0)),
            int(row.get("impressions", 0)) + int(row.get("pageViews", 0)),
        ),
        reverse=True,
    )[:70]


QUESTION_RE = re.compile(r"^(how|what|why|when|where|which|can|does|do|is|are|should|will)\b", re.I)


def gsc_period(
    service: Any,
    gsc_property: str,
    start_date: date,
    end_date: date,
    previous_start: date,
    previous_end: date,
) -> dict[str, Any]:
    start = start_date.isoformat()
    end = end_date.isoformat()
    prev_start = previous_start.isoformat()
    prev_end = previous_end.isoformat()

    totals = gsc_totals(service, gsc_property, start, end)
    previous_totals = gsc_totals(service, gsc_property, prev_start, prev_end)
    totals["delta"] = {
        key: pct_change(float(totals.get(key, 0) or 0), float(previous_totals.get(key, 0) or 0))
        for key in ("clicks", "impressions")
    }

    queries = gsc_query(service, gsc_property, start, end, ["query"], max_rows=5000)
    pages = gsc_query(service, gsc_property, start, end, ["page"], max_rows=2000)
    query_pages = gsc_query(service, gsc_property, start, end, ["query", "page"], max_rows=10000)
    previous_pages = gsc_query(service, gsc_property, prev_start, prev_end, ["page"], max_rows=2000)

    quick_wins = [
        row
        for row in query_pages
        if 4 <= float(row.get("position", 0) or 0) <= 10
        and int(row.get("impressions", 0) or 0) >= 20
    ]
    low_ctr = [
        row
        for row in query_pages
        if int(row.get("impressions", 0) or 0) >= 20
        and float(row.get("ctr", 0) or 0) < 2
        and float(row.get("position", 0) or 0) <= 15
    ]
    questions = [
        row
        for row in queries
        if QUESTION_RE.search(str(row.get("query", "")))
    ]

    prev_by_path = {page_path(row.get("page", "")): row for row in previous_pages}
    decay = []
    for row in pages:
        path = page_path(row.get("page", ""))
        prev = prev_by_path.get(path)
        if not prev:
            continue
        click_delta = int(row.get("clicks", 0)) - int(prev.get("clicks", 0))
        impression_delta = int(row.get("impressions", 0)) - int(prev.get("impressions", 0))
        if click_delta < 0 or impression_delta < -10:
            decay.append(
                {
                    "page": row.get("page", ""),
                    "path": path,
                    "clicks": row.get("clicks", 0),
                    "previousClicks": prev.get("clicks", 0),
                    "clickDelta": click_delta,
                    "impressions": row.get("impressions", 0),
                    "previousImpressions": prev.get("impressions", 0),
                    "impressionDelta": impression_delta,
                    "position": row.get("position", 0),
                }
            )

    search_types = []
    for search_type in ("web", "image", "video", "news", "discover", "googleNews"):
        try:
            type_totals = gsc_totals(service, gsc_property, start, end, search_type)
            type_totals["type"] = search_type
            search_types.append(type_totals)
        except Exception as exc:
            search_types.append({"type": search_type, "error": str(exc), "clicks": 0, "impressions": 0})

    return {
        "dateRange": {"start": start, "end": end},
        "previousDateRange": {"start": prev_start, "end": prev_end},
        "totals": totals,
        "previousTotals": previous_totals,
        "daily": gsc_query(service, gsc_property, start, end, ["date"], max_rows=500),
        "queries": sorted(queries, key=lambda row: row.get("clicks", 0), reverse=True)[:80],
        "pages": sorted(pages, key=lambda row: row.get("clicks", 0), reverse=True)[:80],
        "queryPages": sorted(query_pages, key=lambda row: row.get("clicks", 0), reverse=True)[:120],
        "countries": gsc_query(service, gsc_property, start, end, ["country"], max_rows=250),
        "devices": gsc_query(service, gsc_property, start, end, ["device"], max_rows=25),
        "appearances": gsc_query(service, gsc_property, start, end, ["searchAppearance"], max_rows=50),
        "quickWins": sorted(quick_wins, key=lambda row: row.get("impressions", 0), reverse=True)[:35],
        "lowCtr": sorted(low_ctr, key=lambda row: row.get("impressions", 0), reverse=True)[:35],
        "questions": sorted(questions, key=lambda row: row.get("impressions", 0), reverse=True)[:35],
        "decay": sorted(decay, key=lambda row: (row.get("clickDelta", 0), row.get("impressionDelta", 0)))[:30],
        "searchTypes": search_types,
    }


def generate_snapshot() -> dict[str, Any]:
    ga_client, gsc_service, settings = build_clients()
    ga_property = settings["gaProperty"]
    gsc_property = settings["gscProperty"]

    today = date.today()
    ga_end = today
    gsc_end = today - timedelta(days=GSC_LAG_DAYS)

    snapshot: dict[str, Any] = {
        "meta": {
            "site": SITE_ORIGIN,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "generatedDateLocal": today.isoformat(),
            "defaultPeriod": 28,
            "periods": list(PERIODS),
            "gaProperty": ga_property,
            "gscProperty": gsc_property,
            "gscFinalDataLagDays": GSC_LAG_DAYS,
            "serviceAccountEmail": settings.get("serviceAccountEmail"),
        },
        "local": {
            "sitemap": local_sitemap_summary(),
        },
        "realtime": ga_realtime(ga_client, ga_property),
        "sitemaps": gsc_sitemaps(gsc_service, gsc_property),
        "periods": {},
    }

    for days in PERIODS:
        ga_start = ga_end - timedelta(days=days - 1)
        ga_prev_end = ga_start - timedelta(days=1)
        ga_prev_start = ga_prev_end - timedelta(days=days - 1)

        gsc_start = gsc_end - timedelta(days=days - 1)
        gsc_prev_end = gsc_start - timedelta(days=1)
        gsc_prev_start = gsc_prev_end - timedelta(days=days - 1)

        print(f"Fetching {days}-day GA4 window {ga_start} to {ga_end}...")
        ga_data = ga_period(ga_client, ga_property, ga_start, ga_end, ga_prev_start, ga_prev_end)

        print(f"Fetching {days}-day GSC window {gsc_start} to {gsc_end}...")
        gsc_data = gsc_period(gsc_service, gsc_property, gsc_start, gsc_end, gsc_prev_start, gsc_prev_end)

        snapshot["periods"][str(days)] = {
            "ga": ga_data,
            "gsc": gsc_data,
            "contentMatrix": build_content_matrix(ga_data, gsc_data["pages"]),
        }

    return snapshot


def main() -> None:
    output_path = Path(os.environ.get("DASHBOARD_OUTPUT", DEFAULT_OUTPUT)).expanduser()
    snapshot = generate_snapshot()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(snapshot, indent=2, sort_keys=True))
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
