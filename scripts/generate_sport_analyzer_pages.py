#!/usr/bin/env python3
"""Generate the sport-specific public analyzer pages (/analyzer/nfl/, /analyzer/nba/).

Each page is the free analyzer locked to one sport, with sport-specific research
notes. The shared hub (/analyzer/) stays the multi-sport owner; /picks/<sport>/
stays the daily picks owner. Output is passed through the site shell so the
daily maintenance run leaves it unchanged.

Usage: python3 scripts/generate_sport_analyzer_pages.py [--check]
"""

from __future__ import annotations

import argparse
import html
import json
from pathlib import Path

try:
    from scripts.apply_site_shell import migrate_html
except ModuleNotFoundError:
    from apply_site_shell import migrate_html


ROOT = Path(__file__).resolve().parents[1]
SITE = "https://propellerpicks.com"
ASSET_VERSION = "20261026"

CONFIDENCE_ANSWER = (
    "It is a 50-100 directional model-confidence score showing how strongly the available signals "
    "support the displayed More/Over or Less/Under direction. It is not a calibrated win probability "
    "or a guarantee."
)
WAGER_ANSWER = (
    "No. Propeller is a research tool. It does not accept wagers, place wagers, or submit DFS or "
    "pick'em entries, and it is not affiliated with PrizePicks, Underdog Fantasy, or DraftKings Pick6."
)

PAGES = [
    {
        "slug": "nfl",
        "label": "NFL",
        "title": "Free NFL Player Prop Analyzer: Today's Lines | Propeller",
        "description": "Free NFL prop analyzer with no account needed. Search this week's passing, rushing, and receiving lines and see the AI's over or under lean and why.",
        "h1": "Free NFL player prop analyzer",
        "lede": "Search a player on the current NFL slate and see which way the research leans on their passing, rushing, or receiving line, with the reasons in plain English. No account is needed, and Propeller never places entries or wagers.",
        "placeholder": "Search an NFL player, like Saquon Barkley",
        "signals_heading": "What the NFL analyzer looks at",
        "signals": [
            ("Role and volume", "How much the offense is expected to lean on the player this week, from their recent share of the work."),
            ("Position matchup", "How the opposing defense has handled the player's position, not just its overall ranking."),
            ("Injury cascades", "Who is out on either side, and whose role grows or shrinks because of it."),
            ("Game environment", "The expected game script and conditions that change how much a team throws or runs."),
            ("Recent form and line movement", "How the player has trended lately and how the posted line has moved since it opened."),
        ],
        "prop_types": ["Passing yards", "Completions", "Interceptions", "Rushing yards", "Receptions", "Receiving yards"],
        "timing_heading": "When NFL lines move",
        "timing": [
            ("Midweek", "Practice reports start to show who is limited. Lines open and early movement begins."),
            ("Friday", "Game-status designations come out. Roles behind an injured starter become clearer."),
            ("Game day", "Inactive lists post about 90 minutes before kickoff. Recheck the player, stat, line, and timestamp before you use any analysis."),
        ],
        "empty_answer": "The public feed only shows current NFL lines. During the offseason, the preseason ramp, or days without listed games there may be none, and older analysis is never relabeled as current.",
        "related": [
            ("Today's NFL picks", "/picks/nfl/"),
            ("NFL player prop research guide", "/guides/nfl-player-prop-research/"),
            ("NBA prop analyzer", "/analyzer/nba/"),
            ("Analyzer for every sport", "/analyzer/"),
        ],
    },
    {
        "slug": "nba",
        "label": "NBA",
        "title": "Free NBA Player Prop Analyzer: Today's Lines | Propeller",
        "description": "Free NBA prop analyzer with no account needed. Search tonight's points, rebounds, assists, and PRA lines and see the AI's over or under lean and why.",
        "h1": "Free NBA player prop analyzer",
        "lede": "Search a player on tonight's NBA slate and see which way the research leans on their points, rebounds, assists, or PRA line, with the reasons in plain English. No account is needed, and Propeller never places entries or wagers.",
        "placeholder": "Search an NBA player, like Jayson Tatum",
        "signals_heading": "What the NBA analyzer looks at",
        "signals": [
            ("Minutes and role", "How long the player is expected to be on the court. Minutes multiply every other stat."),
            ("Usage after injuries", "When a teammate sits, who absorbs the shots, touches, and minutes that open up."),
            ("Pace and matchup", "How many possessions the game is likely to have and how the opponent defends the player's spots."),
            ("Rest and schedule", "Back-to-backs and dense stretches that can trim minutes or efficiency."),
            ("Recent form and market context", "Recent production, shooting context, and how the posted line has moved."),
        ],
        "prop_types": ["Points", "Rebounds", "Assists", "Pts + Reb + Ast", "Pts + Reb", "Pts + Ast", "Reb + Ast", "3-pointers made"],
        "timing_heading": "When NBA lines move",
        "timing": [
            ("Afternoon", "Injury reports update and lines settle as teams confirm who is available."),
            ("Pregame", "Late scratches and starting lineups land in the hour or so before tip-off."),
            ("Tip-off", "Lines close. Recheck the player, stat, line, and timestamp before you use any analysis."),
        ],
        "empty_answer": "The public feed only shows current NBA lines. On days without listed games, or when public data is unavailable, there may be none, and older analysis is never relabeled as current.",
        "related": [
            ("Today's NBA picks", "/picks/nba/"),
            ("NBA prop research guide", "/guides/nba-prop-betting/"),
            ("NFL prop analyzer", "/analyzer/nfl/"),
            ("Analyzer for every sport", "/analyzer/"),
        ],
    },
]


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def faq_items(page: dict) -> list[tuple[str, str]]:
    label = page["label"]
    return [
        (f"Is the {label} prop analyzer free?",
         f"Yes. You can search current {label} player lines and read the research lean without an account. Public tools stay free. Account access terms are shown in the app."),
        (f"Why don't I see any {label} props?", page["empty_answer"]),
        ("What does the confidence score mean?", CONFIDENCE_ANSWER),
        ("Does Propeller place bets or entries?", WAGER_ANSWER),
    ]


def json_ld(page: dict) -> str:
    url = f"{SITE}/analyzer/{page['slug']}/"
    graph = [
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": page["h1"].replace("Free ", "Free ", 1),
            "url": url,
            "description": page["description"],
            "applicationCategory": "SportsApplication",
            "operatingSystem": "Web",
            "isAccessibleForFree": True,
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
            "publisher": {"@type": "Organization", "name": "Propeller Picks", "url": f"{SITE}/"},
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": "Prop Analyzer", "item": f"{SITE}/analyzer/"},
                {"@type": "ListItem", "position": 3, "name": f"{page['label']} analyzer", "item": url},
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faq_items(page)
            ],
        },
    ]
    return "\n".join(
        f'<script type="application/ld+json">\n{json.dumps(node, indent=2, ensure_ascii=False)}\n</script>'
        for node in graph
    )


def render(page: dict) -> str:
    slug, label = page["slug"], page["label"]
    url = f"{SITE}/analyzer/{slug}/"
    signals = "\n".join(
        f'        <div class="sa-signal"><dt>{esc(t)}</dt><dd>{esc(b)}</dd></div>' for t, b in page["signals"]
    )
    chips = "\n".join(f'        <li>{esc(t)}</li>' for t in page["prop_types"])
    timing = "\n".join(
        f'        <li><strong>{esc(t)}</strong><span>{esc(b)}</span></li>' for t, b in page["timing"]
    )
    faqs = "\n".join(
        f'      <details class="faq-item"><summary>{esc(q)}</summary><p class="faq-answer">{esc(a)}</p></details>'
        for q, a in faq_items(page)
    )
    related = "\n".join(f'        <a href="{esc(h)}">{esc(t)}</a>' for t, h in page["related"])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>{esc(page["title"])}</title>
<meta name="description" content="{esc(page["description"])}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(page["title"])}">
<meta property="og:description" content="{esc(page["description"])}">
<meta property="og:image" content="{SITE}/images/og-image.png">
<meta property="og:site_name" content="Propeller Picks">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(page["title"])}">
<meta name="twitter:description" content="{esc(page["description"])}">
<meta name="twitter:image" content="{SITE}/images/og-image.png">
<link rel="preload" href="/assets/fonts/familjen-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/analyzer-sport.css?v={ASSET_VERSION}">
<link rel="stylesheet" href="/assets/css/analyzer-save-panel.css?v={ASSET_VERSION}b">
<script src="/assets/js/analyzer-events.js?v=20260715" defer></script>
<script src="/assets/js/analyzer-save-panel.js?v={ASSET_VERSION}" defer></script>
<script src="/assets/js/sport-analyzer.js?v={ASSET_VERSION}" defer></script>
{json_ld(page)}
</head>
<body class="pp-sport-analyzer-page">
<nav></nav>

<main class="sa-page" data-sport="{slug}" data-sport-label="{label}">
  <section class="sa-hero" aria-labelledby="sa-heading">
    <nav class="sa-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/analyzer/">Prop Analyzer</a><span aria-hidden="true">/</span><span aria-current="page">{label}</span></nav>
    <h1 id="sa-heading">{esc(page["h1"])}</h1>
    <p class="sa-lede">{esc(page["lede"])}</p>

    <form class="sa-search" id="saForm" role="search" action="/analyzer/" method="get">
      <input type="hidden" name="sport" value="{slug}">
      <label class="sa-visually-hidden" for="saInput">Search {label} player name</label>
      <input class="sa-search__input" id="saInput" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="{esc(page["placeholder"])}">
      <button class="sa-search__button" type="submit">Analyze</button>
    </form>
    <p class="sa-status" id="saStatus" role="status" aria-live="polite">Checking the current {label} feed.</p>
    <div class="sa-suggest" id="saSuggest" hidden></div>
  </section>

  <section class="sa-results" aria-label="{label} player prop results">
    <p class="sa-results__meta" id="saMeta" aria-live="polite"></p>
    <div class="sa-grid" id="saGrid"></div>
  </section>

  <section class="sa-band" aria-labelledby="sa-signals-heading">
    <h2 id="sa-signals-heading">{esc(page["signals_heading"])}</h2>
    <div>
      <dl class="sa-signals">
{signals}
      </dl>
      <p class="sa-note">Only the signals available for a prop count toward its score. Missing or neutral signals are skipped, and availability varies by slate. <a href="/guides/how-ai-sports-betting-works/">How the analysis works</a></p>
    </div>
  </section>

  <section class="sa-band" aria-labelledby="sa-props-heading">
    <h2 id="sa-props-heading">{label} props you can search</h2>
    <div>
      <ul class="sa-chips">
{chips}
      </ul>
      <p class="sa-note">The lines on any day depend on the slate and the public feed.</p>
    </div>
  </section>

  <section class="sa-band" aria-labelledby="sa-timing-heading">
    <h2 id="sa-timing-heading">{esc(page["timing_heading"])}</h2>
    <ol class="sa-timeline">
{timing}
    </ol>
  </section>

  <section class="sa-band" aria-labelledby="sa-faq-heading">
    <h2 id="sa-faq-heading">Questions</h2>
    <div class="sa-faq">
{faqs}
    </div>
  </section>

  <section class="sa-band sa-band--links" aria-labelledby="sa-more-heading">
    <h2 id="sa-more-heading">More {label} research</h2>
    <div class="sa-links">
{related}
    </div>
  </section>
</main>

<footer></footer>
<script src="/assets/js/analytics-events.js?v=20260817" defer></script>
<script src="/assets/js/signup-attribution.js?v=20260712" defer></script>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed = []
    for page in PAGES:
        path = ROOT / "analyzer" / page["slug"] / "index.html"
        output = migrate_html(render(page), path, False)
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current != output:
            changed.append(path)
            if not args.check:
                path.write_text(output, encoding="utf-8")
    print(f"sport_analyzer_pages={len(PAGES)} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
