#!/usr/bin/env python3
"""Replace generated player-page slate blocks with current or honest empty states.

Every generated page gets a marker-delimited card for the requested ET slate.
Only pages matched to a valid current public preview receive
data-current-props="true"; selective indexing uses that marker as a hard gate.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import pathlib
import re
import unicodedata
import urllib.error
import urllib.request
from collections import defaultdict
from typing import Any
from zoneinfo import ZoneInfo


ROOT = pathlib.Path(__file__).resolve().parents[1]
API = "https://web-production-3c1c4.up.railway.app"
SPORTS = ("mlb", "nba", "nfl", "nhl", "soccer")
START = "<!-- CURRENT_PLAYER_CARD_START -->"
END = "<!-- CURRENT_PLAYER_CARD_END -->"
LEGACY_RE = re.compile(r"<!-- TODAY_PROPS_START -->.*?<!-- TODAY_PROPS_END -->", re.S)
CURRENT_RE = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)


def get_json(url: str, timeout: int = 25) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": "PropellerSEO/1.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def readable_stat(value: str) -> str:
    return value.replace("_", " ").replace("+", " + ").title()


def fmt_number(value: Any) -> str:
    number = float(value)
    return str(int(number)) if number.is_integer() else f"{number:g}"


def validate_payload(payload: dict[str, Any], requested_date: str,
                     now: dt.datetime | None = None) -> tuple[bool, str]:
    """Reject cached, malformed, or non-public feed payloads before rendering/indexing."""
    if str(payload.get("game_date") or "") != requested_date:
        return False, "Current feed date did not match the requested slate."
    if payload.get("source") != "propeller-public-picks-preview":
        return False, "Current feed source was not the public picks preview."
    generated_at = str(payload.get("generated_at") or "")
    try:
        generated = dt.datetime.fromisoformat(generated_at.replace("Z", "+00:00"))
        requested = dt.date.fromisoformat(requested_date)
    except ValueError:
        return False, "Current feed timestamp was missing or invalid."
    if generated.tzinfo is None:
        return False, "Current feed timestamp did not include a timezone."
    now = now or dt.datetime.now(dt.timezone.utc)
    if now.tzinfo is None:
        raise ValueError("validation clock must include a timezone")
    eastern = ZoneInfo("America/New_York")
    if now.astimezone(eastern).date() != requested:
        return False, "Requested slate was not the current Eastern date."
    if generated.astimezone(eastern).date() != requested:
        return False, "Current feed timestamp did not match the requested Eastern slate."
    age = now.astimezone(dt.timezone.utc) - generated.astimezone(dt.timezone.utc)
    if age < dt.timedelta(minutes=-15):
        return False, "Current feed timestamp was unreasonably far in the future."
    if age > dt.timedelta(hours=30):
        return False, "Current feed timestamp was too old to represent the current slate."
    if not isinstance(payload.get("props"), list):
        return False, "Current feed rows were malformed."
    return True, ""


def current_block(sport: str, date: str, generated_at: str, props: list[dict[str, Any]]) -> str:
    rows = []
    for prop in props[:12]:
        try:
            stat = html.escape(readable_stat(str(prop["stat_type"])))
            line = html.escape(fmt_number(prop["line"]))
            direction = html.escape(str(prop["final_direction"]).upper())
            confidence = int(prop["confidence"])
        except (KeyError, TypeError, ValueError):
            continue
        rows.append(
            "<tr>"
            f'<td style="color:#F1F5F9;font-weight:700">{stat}</td>'
            f'<td style="font-family:IBM Plex Mono,monospace;font-weight:700;color:#F1F5F9">{line}</td>'
            f'<td style="color:{"#5EEAD4" if direction == "OVER" else "#FDA4AF"};font-weight:800">{direction}</td>'
            f'<td style="font-family:IBM Plex Mono,monospace;font-weight:800;color:#F1F5F9">{confidence}</td>'
            "</tr>"
        )
    if not rows:
        return empty_block(sport, date, "The public preview returned no valid rows for this player.")
    label = dt.date.fromisoformat(date).strftime("%B %-d, %Y")
    safe_generated = html.escape(generated_at)
    return f'''{START}
<section class="tp-section current-player-card" data-current-props="true" data-slate-date="{date}" aria-labelledby="currentPlayerProps">
  <div class="tp-header"><div class="tp-live"></div><h2 id="currentPlayerProps">Current public props · {label}</h2></div>
  <p style="font-size:12px;color:#CBD5E1;margin:0 0 12px">Public preview generated <time datetime="{safe_generated}">{safe_generated}</time>. Lines can move; verify the current market before making a decision.</p>
  <div class="card" style="border:none;box-shadow:none"><table>
    <thead><tr><th>Market</th><th>Line</th><th>Model read</th><th>Confidence</th></tr></thead>
    <tbody>{''.join(rows)}</tbody>
  </table></div>
  <p style="font-size:11px;color:#CBD5E1;margin:12px 0 0">Confidence is directional model conviction, not a guaranteed outcome or calibrated win probability. <a href="/guides/how-ai-sports-betting-works/" style="color:#FDBA74">How the model works</a></p>
</section>
{END}'''


def empty_block(sport: str, date: str, reason: str = "No current public props are listed for this player.") -> str:
    return f'''{START}
<section class="tp-section current-player-card" data-current-props="false" data-slate-date="unavailable" aria-labelledby="currentPlayerProps">
  <div class="tp-header"><h2 id="currentPlayerProps">No current public props</h2></div>
  <p style="font-size:13px;color:#CBD5E1;margin:0">{html.escape(reason)} This page keeps its dated historical summary, but it is not presenting an old line as today's market. <a href="/analyzer/?sport={sport}" style="color:#FDBA74">Check the live {sport.upper()} board</a>.</p>
</section>
{END}'''


def replace_block(source: str, block: str) -> str:
    if CURRENT_RE.search(source):
        return CURRENT_RE.sub(block, source, count=1)
    if LEGACY_RE.search(source):
        return LEGACY_RE.sub(block, source, count=1)
    marker = '<div class="stats-grid">'
    index = source.find(marker)
    if index == -1:
        raise ValueError("player page has no insertion point")
    end = source.find("</div>\n</div>", index)
    if end == -1:
        raise ValueError("player page stats block is malformed")
    return source[:end + 6] + "\n\n" + block + source[end + 6:]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Slate date in YYYY-MM-DD; defaults to current ET date")
    parser.add_argument("--fixture-dir", type=pathlib.Path)
    args = parser.parse_args()
    date = args.date or dt.datetime.now(ZoneInfo("America/New_York")).date().isoformat()
    changed = current = errors = 0
    for sport in SPORTS:
        payload: dict[str, Any] = {}
        fetch_error = ""
        try:
            payload = (json.loads((args.fixture_dir / f"picks-{sport}.json").read_text())
                       if args.fixture_dir else get_json(f"{API}/api/social/picks/{sport}?game_date={date}&limit=100"))
        except (OSError, json.JSONDecodeError, urllib.error.URLError) as exc:
            fetch_error = f"Current feed unavailable ({type(exc).__name__})."
        if not fetch_error:
            valid, validation_error = validate_payload(payload, date)
            if not valid:
                fetch_error = validation_error
                payload = {}
        by_slug: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for prop in payload.get("props", []):
            name = str(prop.get("player_name") or "").strip()
            if name:
                by_slug[slugify(name)].append(prop)
        generated_at = str(payload.get("generated_at") or "unavailable")
        for page in sorted((ROOT / "analyzer" / sport).glob("*/index.html")):
            block = (current_block(sport, date, generated_at, by_slug[page.parent.name])
                     if by_slug.get(page.parent.name) else empty_block(sport, date, fetch_error or "No current public props are listed for this player."))
            if 'data-current-props="true"' in block:
                current += 1
            source = page.read_text(encoding="utf-8")
            try:
                output = replace_block(source, block)
            except ValueError as exc:
                # Permanent dated player pages have no TODAY_PROPS block. They
                # remain noindex archive pages and are intentionally untouched.
                if "no insertion point" in str(exc):
                    continue
                print(f"ERROR {page.relative_to(ROOT)}: {exc}")
                errors += 1
                continue
            if output != source:
                page.write_text(output, encoding="utf-8")
                changed += 1
    print(f"pages_changed={changed} current_players={current} errors={errors} slate={date}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
