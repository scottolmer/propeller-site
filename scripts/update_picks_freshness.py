#!/usr/bin/env python3
"""Stamp today's date into the /picks/ pages so the indexed "today" pages
stay fresh: <title>/og/twitter titles, H1, hero date label, and JSON-LD
dateModified. Idempotent — safe to run every day from the content pipeline
(run generate_sitemap.py afterwards so lastmod follows).

Usage: python3 scripts/update_picks_freshness.py [--date YYYY-MM-DD]
"""
import argparse
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

PAGES = [
    "picks/index.html",
    "picks/nba/index.html",
    "picks/nfl/index.html",
    "picks/nhl/index.html",
    "picks/mlb/index.html",
    "picks/soccer/index.html",
    "picks/prizepicks/index.html",
    "picks/pick6/index.html",
    "picks/underdog/index.html",
]

# Matches "Today" optionally followed by a previously stamped date.
TODAY_RE = re.compile(r"Today(?:, [A-Z][a-z]+ \d{1,2})?")


def stamp(html: str, day: datetime.date) -> str:
    label = f"{day.strftime('%B')} {day.day}"          # e.g. "June 10"
    full_label = f"{label}, {day.year}"                # e.g. "June 10, 2026"
    iso = day.isoformat()

    # 1. <title> and social titles: "... Today" -> "... Today, June 10"
    def title_sub(m):
        return TODAY_RE.sub(f"Today, {label}", m.group(0), count=1)

    html = re.sub(r"<title>[^<]*</title>", title_sub, html, count=1)
    html = re.sub(r'<meta property="og:title" content="[^"]*"', title_sub, html, count=1)
    html = re.sub(r'<meta name="twitter:title" content="[^"]*"', title_sub, html, count=1)

    # 2. First H1 containing "Today"
    def h1_sub(m):
        return TODAY_RE.sub(f"Today, {label}", m.group(0), count=1)

    html = re.sub(r"<h1[^>]*>.*?</h1>", h1_sub, html, count=1, flags=re.S)

    # 3. Hero date label rendered server-side (client JS may overwrite with
    #    the same value).
    html = re.sub(r'(<span id="heroDateLabel">)[^<]*(</span>)',
                  rf"\g<1>{full_label}\g<2>", html, count=1)

    # 4. JSON-LD dateModified
    html = re.sub(r'("dateModified":\s*")[0-9-]+(")', rf"\g<1>{iso}\g<2>", html)

    return html


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Override date (YYYY-MM-DD), default today")
    args = parser.parse_args()
    day = (datetime.date.fromisoformat(args.date) if args.date
           else datetime.date.today())

    failures = 0
    for rel in PAGES:
        path = ROOT / rel
        if not path.exists():
            print(f"MISSING {rel}", file=sys.stderr)
            failures += 1
            continue
        html = path.read_text()
        out = stamp(html, day)
        changed = out != html
        if changed:
            path.write_text(out)
        print(f"{'stamped' if changed else 'current'} {rel}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
