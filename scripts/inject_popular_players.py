#!/usr/bin/env python3
"""Inject "Popular Player Analysis" link sections pointing at the indexed
analyzer player pages (crawl paths + internal links for the pages flipped to
index by apply_analyzer_indexing.py).

Targets:
- /analyzer/index.html  : top 10 players per sport
- /picks/{sport}/index.html : top 8 players for that sport

Idempotent via <!-- popular-players --> markers; re-running replaces the
block, so the pipeline can run this after apply_analyzer_indexing.py.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
MARK_START = "<!-- popular-players:start -->"
MARK_END = "<!-- popular-players:end -->"
SPORT_LABEL = {"nba": "NBA", "nfl": "NFL", "nhl": "NHL", "mlb": "MLB",
               "soccer": "Soccer"}


def player_name(sport: str, slug: str) -> str:
    page = ROOT / "analyzer" / sport / slug / "index.html"
    m = re.search(r"<title>([^<]+?) Prop Analysis", page.read_text()[:2000])
    return m.group(1) if m else slug.replace("-", " ").title()


def load_indexed():
    by_sport = {}
    for line in (ROOT / "scripts" / "analyzer_indexed.txt").read_text().split():
        parts = line.strip("/").split("/")  # analyzer/<sport>/<slug>
        if len(parts) == 3:
            by_sport.setdefault(parts[1], []).append(parts[2])
    return by_sport


def chip_block(sport: str, slugs, heading: str) -> str:
    links = "\n".join(
        f'      <a href="/analyzer/{sport}/{slug}/" '
        f'style="display:inline-block;padding:8px 14px;margin:0 8px 8px 0;'
        f'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);'
        f'border-radius:999px;font-size:13px;color:#94A3B8;text-decoration:none;">'
        f'{player_name(sport, slug)}</a>'
        for slug in slugs)
    return f"""{MARK_START}
<section aria-label="{heading}" style="padding:36px 0;border-top:1px solid rgba(255,255,255,0.06);">
  <div class="container" style="max-width:1120px;margin:0 auto;padding:0 24px;">
    <h2 style="font-size:18px;font-weight:700;color:#F1F5F9;margin:0 0 4px;">{heading}</h2>
    <p style="font-size:13px;color:#64748B;margin:0 0 16px;">AI confidence and historical outcome summaries for evidence-qualified player pages.</p>
    <div>
{links}
    </div>
  </div>
</section>
{MARK_END}"""


def inject(path: pathlib.Path, block: str) -> str:
    html = path.read_text()
    if MARK_START in html:
        html = re.sub(re.escape(MARK_START) + r".*?" + re.escape(MARK_END),
                      "", html, flags=re.S)
        status = "replaced"
    else:
        status = "inserted"
    footer_marker = "<!-- PP_SITE_FOOTER_START -->"
    idx = html.rfind(footer_marker)
    if idx == -1:
        idx = html.rfind("<footer")
    if idx == -1:
        return "no <footer>, skipped"
    html = html[:idx].rstrip() + "\n" + block + "\n" + html[idx:]
    html = re.sub(
        r"<!-- PP_SITE_FOOTER_START -->\s*<footer",
        "<!-- PP_SITE_FOOTER_START -->\n<footer",
        html,
        count=1,
    )
    path.write_text(html)
    return status


def main() -> None:
    by_sport = load_indexed()

    # Analyzer hub: one block with top 10 per sport.
    hub_parts = []
    for sport in ["nba", "nfl", "nhl", "mlb", "soccer"]:
        slugs = by_sport.get(sport, [])[:10]
        if not slugs:
            continue
        links = "\n".join(
            f'      <a href="/analyzer/{sport}/{slug}/" '
            f'style="display:inline-block;padding:8px 14px;margin:0 8px 8px 0;'
            f'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);'
            f'border-radius:999px;font-size:13px;color:#94A3B8;text-decoration:none;">'
            f'{player_name(sport, slug)}</a>'
            for slug in slugs)
        hub_parts.append(
            f'    <h3 style="font-size:14px;font-weight:700;color:#F1F5F9;'
            f'margin:18px 0 10px;">{SPORT_LABEL[sport]}</h3>\n'
            f'    <div>\n{links}\n    </div>')
    hub_block = f"""{MARK_START}
<section aria-label="Popular player prop analysis" style="padding:36px 0;border-top:1px solid rgba(255,255,255,0.06);">
  <div class="container" style="max-width:1120px;margin:0 auto;padding:0 24px;">
    <h2 style="font-size:18px;font-weight:700;color:#F1F5F9;margin:0 0 4px;">Popular Player Prop Analysis</h2>
    <p style="font-size:13px;color:#64748B;margin:0;">The most-graded players in the model right now.</p>
{chr(10).join(hub_parts)}
  </div>
</section>
{MARK_END}"""
    if not hub_parts:
        hub_block = f"{MARK_START}\n{MARK_END}"
    print("analyzer/index.html:", inject(ROOT / "analyzer/index.html", hub_block))

    # Sport picks pages: top 8 for that sport.
    for sport in SPORT_LABEL:
        slugs = by_sport.get(sport, [])
        page = ROOT / "picks" / sport / "index.html"
        if not page.exists():
            continue
        block = (
            chip_block(sport, slugs[:8], f"Popular {SPORT_LABEL[sport]} Player Analysis")
            if slugs
            else f"{MARK_START}\n{MARK_END}"
        )
        print(f"picks/{sport}/index.html:", inject(page, block))


if __name__ == "__main__":
    main()
