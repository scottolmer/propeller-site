#!/usr/bin/env python3
"""Write a dated, static snapshot of the public research preview into the
/picks/ pages, so the rows exist in the HTML before any JavaScript runs.

Why: the picks pages load their rows client-side. Readers that do not run
JavaScript (most AI answer-engine crawlers, and a search engine's first HTML
pass) saw only a loading skeleton plus hidden empty-state copy. This script
puts the same public preview rows the page would fetch into a marker-delimited
block, labelled with the slate date and the capture time.

Honesty rules this script keeps:
- Only rows from the public preview feeds the page itself uses are written.
- Every snapshot states its slate date and capture time. It is never called
  live, and /assets/js/picks-snapshot.js hides it in the browser as soon as
  live rows arrive, or immediately when its slate date is not today (ET).
- If a feed fails or is empty, the block says so with a timestamp. Rows from
  an older slate are never carried forward.
- A network failure never fails the pipeline: the page keeps a same-day
  snapshot if it has one, otherwise it gets the dated "unavailable" note.

Idempotent for a given feed response. Marker-delimited; replaces its own block.

Usage:
  python3 scripts/render_picks_snapshot.py
  python3 scripts/render_picks_snapshot.py --date 2026-11-09 --fixtures scripts/fixtures/picks_snapshot
"""
import argparse
import datetime
import html
import json
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent.parent
API = "https://web-production-3c1c4.up.railway.app"
ET = ZoneInfo("America/New_York")
START = "<!-- picks-snapshot:start -->"
END = "<!-- picks-snapshot:end -->"
BLOCK_RE = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)
SCRIPT_TAG = '<script src="/assets/js/picks-snapshot.js?v=20261109"></script>'
ROW_LIMIT = 5

SPORT_LABELS = {"nba": "NBA", "mlb": "MLB", "nhl": "NHL", "nfl": "NFL", "soccer": "Soccer"}

# rel path -> feeds, the anchor the block is inserted before, direction words,
# and the platform named in the "check the line" note.
PAGES = {
    "picks/prizepicks/index.html": {
        "feeds": ["nba", "mlb", "nhl"], "anchor": '<div id="picksOutput"',
        "words": ("More", "Less"), "platform": "PrizePicks",
    },
    "picks/underdog/index.html": {
        "feeds": ["nba", "mlb", "nhl"], "anchor": '<div id="picksOutput"',
        "words": ("Higher", "Lower"), "platform": "Underdog Fantasy",
    },
    "picks/pick6/index.html": {
        "feeds": ["nba", "mlb", "nhl"], "anchor": '<div id="picksOutput"',
        "words": ("More", "Less"), "platform": "DraftKings Pick6",
    },
    "picks/nba/index.html": {
        "feeds": ["nba"], "anchor": '<div id="picksOutput"',
        "words": ("Over", "Under"), "platform": None,
    },
    "picks/nfl/index.html": {
        "feeds": ["nfl"], "anchor": '<div id="picks-container"',
        "words": ("Over", "Under"), "platform": None,
    },
}

STAT_LABELS = {
    "points": "Points", "rebounds": "Rebounds", "assists": "Assists",
    "threes": "3-Pointers Made", "three_pointers_made": "3-Pointers Made",
    "steals": "Steals", "blocks": "Blocks", "turnovers": "Turnovers",
    "pra": "Points + Rebounds + Assists", "pts_reb_ast": "Points + Rebounds + Assists",
    "pts_rebs_asts": "Points + Rebounds + Assists",
    "pts_reb": "Points + Rebounds", "pts_rebs": "Points + Rebounds",
    "pts_ast": "Points + Assists", "pts_asts": "Points + Assists",
    "reb_ast": "Rebounds + Assists", "rebs_asts": "Rebounds + Assists",
    "strikeouts": "Strikeouts", "pitcher_strikeouts": "Pitcher Strikeouts",
    "hits": "Hits", "total_bases": "Total Bases", "runs": "Runs", "rbi": "RBI",
    "home_runs": "Home Runs", "walks": "Walks",
    "shots": "Shots on Goal", "goals": "Goals", "saves": "Saves",
    "power_play_points": "Power Play Points",
    "pass_yds": "Passing Yards", "passing_yards": "Passing Yards",
    "rush_yds": "Rushing Yards", "rushing_yards": "Rushing Yards",
    "rec_yds": "Receiving Yards", "receiving_yards": "Receiving Yards",
    "receptions": "Receptions", "pass_tds": "Passing Touchdowns",
    "passing_touchdowns": "Passing Touchdowns", "completions": "Completions",
    "carries": "Carries", "rush_attempts": "Rushing Attempts",
}

# Plain-language names for the NFL signals the public slate reports.
NFL_SIGNALS = {
    "Matchup": "the matchup", "DVOA": "how the opposing defense has played",
    "Injury": "injury news", "EnhancedTrends": "recent results",
    "AdvancedStats": "advanced player stats", "Volume": "expected workload",
}


def esc(value) -> str:
    return html.escape(str(value), quote=True)


def stat_label(raw: str) -> str:
    return STAT_LABELS.get(raw) or raw.replace("_", " ").title()


def is_number(value) -> bool:
    try:
        return value is not None and value != "" and float(value) == float(value)
    except (TypeError, ValueError):
        return False


def confidence(row) -> int:
    reported = row.get("confidence")
    if is_number(reported) and 50 <= float(reported) <= 100:
        return round(float(reported))
    return round(abs(float(row["final_score"]) - 50) + 50)


def valid_rows(rows, slate_date=None):
    """Mirror assets/js/prizepicks-slate.js, then keep one row per player and stat."""
    seen, out = set(), []
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict):
            continue
        name, stat = row.get("player_name"), row.get("stat_type")
        if not (isinstance(name, str) and name.strip() and isinstance(stat, str) and stat.strip()):
            continue
        if not (is_number(row.get("line")) and is_number(row.get("final_score"))):
            continue
        if not 0 <= float(row["final_score"]) <= 100:
            continue
        if row.get("final_direction") not in ("OVER", "UNDER"):
            continue
        if slate_date and row.get("game_date") and row["game_date"] != slate_date:
            continue
        key = (name.strip().lower(), stat.strip().lower())
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
        if len(out) == ROW_LIMIT:
            break
    return out


def fetch_json(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": "propeller-site-snapshot/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def load_feed(sport: str, slate_date: str, fixtures):
    """Return {"status": "ok"|"empty"|"unavailable", "rows": [...], "note": str}."""
    try:
        if fixtures:
            data = json.loads((fixtures / f"{sport}.json").read_text())
        elif sport == "nfl":
            data = fetch_json(f"{API}/api/nfl/props/public-slate")
        else:
            data = fetch_json(f"{API}/api/social/picks/{sport}?game_date={slate_date}&limit={ROW_LIMIT}")
    except (OSError, ValueError, urllib.error.URLError) as error:
        print(f"WARN {sport}: feed unavailable ({error})", file=sys.stderr)
        return {"status": "unavailable", "rows": [], "note": ""}

    if sport == "nfl":
        state = data.get("state") if isinstance(data, dict) else None
        if state != "ready":
            return {"status": "empty", "rows": [], "note": ""}
        rows = valid_rows(data.get("props"))
        week = data.get("week")
        note = f"Week {int(week)}" if is_number(week) else ""
        return {"status": "ok" if rows else "empty", "rows": rows, "note": note}

    if not isinstance(data, dict) or data.get("game_date") != slate_date:
        return {"status": "unavailable", "rows": [], "note": ""}
    rows = valid_rows(data.get("props"), slate_date)
    return {"status": "ok" if rows else "empty", "rows": rows, "note": ""}


def nfl_reasons(row) -> str:
    """Name the reported signals that lean the same way as the row, strongest first."""
    breakdown = row.get("agent_breakdown")
    if not isinstance(breakdown, dict):
        return ""
    leaning = []
    for name, signal in breakdown.items():
        if name not in NFL_SIGNALS or not isinstance(signal, dict):
            continue
        score = signal.get("score")
        if signal.get("direction") == row["final_direction"] and is_number(score):
            strength = abs(float(score) - 50)
            if strength >= 5:
                leaning.append((strength, NFL_SIGNALS[name]))
    leaning.sort(reverse=True)
    names = [label for _, label in leaning[:3]]
    if not names:
        return ""
    joined = names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]
    return f"Leans this way on {joined}."


CELL = 'style="padding:10px 12px;border-bottom:1px solid var(--glass-border);text-align:left;vertical-align:top;"'
HEAD = ('style="padding:8px 12px;border-bottom:1px solid var(--glass-border-active);text-align:left;'
        'font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--text-tertiary);font-weight:600;"')


def table(sport: str, feed: dict, words, long_date: str) -> str:
    label = SPORT_LABELS[sport]
    over_word, under_word = words
    is_nfl = sport == "nfl"
    scope = f"{label} {feed['note']}".strip() if is_nfl else label
    head = ["Player", "Stat", "Line", "Lean", "Confidence (50 to 100)"]
    if is_nfl:
        head.insert(1, "Game")
        head.append("Why")
    lines = [
        '<div style="overflow-x:auto;margin:0 0 20px;">',
        '<table style="width:100%;border-collapse:collapse;font-size:15px;">',
        f'<caption style="text-align:left;font-weight:600;padding:0 0 8px;color:var(--text-primary);">'
        f'{esc(scope)} player prop research, {esc(long_date)}</caption>',
        "<thead><tr>" + "".join(f"<th scope=\"col\" {HEAD}>{esc(h)}</th>" for h in head) + "</tr></thead>",
        "<tbody>",
    ]
    for row in feed["rows"]:
        name = row["player_name"].strip()
        href = f"/analyzer/?sport={sport}&q={urllib.parse.quote(name)}"
        over = row["final_direction"] == "OVER"
        word = over_word if over else under_word
        lean = word if word in ("Over", "Under") else f"{word} ({'Over' if over else 'Under'})"
        line = float(row["line"])
        cells = [f'<a href="{esc(href)}" style="color:var(--accent);font-weight:600;text-decoration:none;">{esc(name)}</a>']
        if is_nfl:
            team, opponent = row.get("team"), row.get("opponent")
            cells.append(esc(f"{team} vs {opponent}") if team and opponent else esc(team or ""))
        cells += [esc(stat_label(row["stat_type"])), esc(f"{line:g}"), esc(lean), f"{confidence(row)}/100"]
        if is_nfl:
            cells.append(esc(nfl_reasons(row)))
        lines.append("<tr>" + "".join(f"<td {CELL}>{cell}</td>" for cell in cells) + "</tr>")
    lines += ["</tbody>", "</table>", "</div>"]
    return "\n".join(lines)


def render_block(config: dict, feeds: dict, slate_date: str, captured: datetime.datetime) -> str:
    day = datetime.date.fromisoformat(slate_date)
    long_date = f"{day.strftime('%A, %B')} {day.day}, {day.year}"
    captured_et = captured.astimezone(ET)
    captured_label = (f"{captured_et.strftime('%B')} {captured_et.day}, {captured_et.year} at "
                      f"{captured_et.strftime('%I:%M %p').lstrip('0')} ET")
    with_rows = [s for s in config["feeds"] if feeds[s]["status"] == "ok"]
    unavailable = [s for s in config["feeds"] if feeds[s]["status"] == "unavailable"]
    total = sum(len(feeds[s]["rows"]) for s in with_rows)
    platform = config["platform"]
    check = (f"These are Propeller Picks research rows, not a {platform} feed. Lines move, so match the player, "
             f"stat, and line on {platform} before you play."
             if platform else
             "Lines move, so confirm the player, stat, and current line before you act.")
    note_style = 'style="font-size:14px;color:var(--text-secondary);margin:0 0 16px;"'

    parts = [
        START,
        f'<div id="picksSnapshot" data-slate-date="{esc(slate_date)}" '
        f'data-captured-at="{esc(captured.strftime("%Y-%m-%dT%H:%M:%SZ"))}" data-row-count="{total}" '
        'style="margin:0 0 28px;">',
    ]
    if total:
        sports = ", ".join(SPORT_LABELS[s] for s in with_rows)
        parts.append(
            f'<p {note_style}><strong>{total} free research {"row" if total == 1 else "rows"} for {esc(long_date)}</strong> '
            f'({esc(sports)}). Snapshot captured {esc(captured_label)}. The page loads the latest rows when it opens. '
            f'Each row shows which way the research leans and a 50 to 100 confidence score, which is not a win probability. '
            f'{esc(check)}</p>')
        for sport in with_rows:
            parts.append(table(sport, feeds[sport], config["words"], long_date))
    else:
        reason = ("The research feed could not be reached" if len(unavailable) == len(config["feeds"])
                  else "No public research rows were available")
        parts.append(
            f'<p {note_style}>{reason} for {esc(long_date)} when this page was last refreshed, '
            f'{esc(captured_label)}. The page checks again when it opens. No older slate is shown as current.</p>')
    parts += ["</div>", END]
    return "\n".join(parts) + "\n"


def existing_slate_date(page: str):
    block = BLOCK_RE.search(page)
    match = re.search(r'data-slate-date="([0-9-]+)"', block.group(0)) if block else None
    return match.group(1) if match else None


def apply(page: str, block: str, anchor: str) -> str:
    if BLOCK_RE.search(page):
        page = BLOCK_RE.sub(lambda _: block, page, count=1)
    else:
        index = page.find(anchor)
        if index == -1:
            raise ValueError(f"anchor not found: {anchor}")
        line_start = page.rfind("\n", 0, index) + 1
        page = page[:line_start] + block + page[line_start:]
    if SCRIPT_TAG not in page:
        page = re.sub(r'<script src="/assets/js/picks-snapshot\.js[^"]*"></script>\n?', "", page)
        # apply_site_shell.py keeps site-nav.js as the last script before </body>.
        nav = re.search(r'[ \t]*<script src="/assets/js/site-nav\.js[^>]*></script>\n(?=</body>)', page)
        at = nav.start() if nav else page.find("</body>")
        page = page[:at] + SCRIPT_TAG + "\n" + page[at:]
    return page


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Slate date YYYY-MM-DD (default: today, Eastern time)")
    parser.add_argument("--fixtures", help="Read <sport>.json from this directory instead of the network")
    parser.add_argument("--captured-at", help="Override capture time (ISO 8601, UTC) for reproducible output")
    args = parser.parse_args()

    slate_date = args.date or datetime.datetime.now(ET).date().isoformat()
    captured = (datetime.datetime.fromisoformat(args.captured_at.replace("Z", "+00:00")) if args.captured_at
                else datetime.datetime.now(datetime.timezone.utc))
    fixtures = pathlib.Path(args.fixtures) if args.fixtures else None

    needed = sorted({sport for config in PAGES.values() for sport in config["feeds"]})
    feeds = {sport: load_feed(sport, slate_date, fixtures) for sport in needed}

    for rel, config in PAGES.items():
        path = ROOT / rel
        if not path.exists():
            print(f"MISSING {rel}", file=sys.stderr)
            continue
        page = path.read_text()
        all_down = all(feeds[s]["status"] == "unavailable" for s in config["feeds"])
        if all_down and existing_slate_date(page) == slate_date:
            print(f"kept {rel} (feed unavailable, same-day snapshot retained)")
            continue
        try:
            out = apply(page, render_block(config, feeds, slate_date, captured), config["anchor"])
        except ValueError as error:
            print(f"SKIP {rel}: {error}", file=sys.stderr)
            continue
        if out != page:
            path.write_text(out)
        rows = sum(len(feeds[s]["rows"]) for s in config["feeds"])
        print(f"snapshot {rel}: {rows} rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
