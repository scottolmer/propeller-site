#!/usr/bin/env python3
"""Generate static help pages used for answer-engine coverage."""
from __future__ import annotations
import argparse

import html
import json
from pathlib import Path

try:
    from scripts.apply_site_shell import migrate_html
except ModuleNotFoundError:
    from apply_site_shell import migrate_html

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://propellerpicks.com"
UPDATED = "2026-07-15"


PAGES = [
    {
        "slug": "what-is-propeller-picks",
        "title": "What Is Propeller Picks?",
        "description": "Propeller Picks is an AI-assisted player-prop research workspace designed for DFS and pick'em platforms.",
        "h1": "What is Propeller Picks?",
        "summary": "Propeller Picks is an AI-assisted player-prop research workspace for web and mobile. It uses sport-specific analysis signals, publishes a documented historical results archive, and helps users compare prop context before making their own decisions. Propeller is not a sportsbook and does not accept or place wagers.",
        "sections": [
            ("What Propeller Helps With", "Propeller helps users research player props by combining matchup context, injury and role changes, historical hit rates, market probability, recent form, and confidence scoring in one workflow."),
            ("Who It Is For", "Propeller was designed for people researching player lines used on PrizePicks, Underdog Fantasy, and DraftKings Pick6. Sportsbook lines such as FanDuel may appear only as market context."),
            ("What Propeller Is Not", "Propeller is not a sportsbook, does not set lines, does not submit entries or place wagers, and does not pay out entries. It is independent and is not affiliated with the platforms it references."),
        ],
        "faqs": [
            ("What is Propeller Picks?", "Propeller Picks is an AI player prop research workspace for web and mobile. It analyzes over/under props with sport-specific signals, directional scores, a documented historical archive, and player-context pages."),
            ("Does Propeller Picks place bets for users?", "No. Propeller Picks does not place bets, accept wagers, or pay out entries. Users are responsible for their own decisions and local laws."),
            ("What platforms was Propeller designed for?", "Propeller was designed for DFS and pick'em research used with PrizePicks, Underdog Fantasy, and DraftKings Pick6. Sportsbook lines such as FanDuel may appear only as market context. Propeller does not submit entries and is not affiliated with those platforms."),
        ],
        "related": ["/analyzer/", "/how-it-works/", "/results/", "/track-record/"],
    },
    {
        "slug": "is-propeller-a-sportsbook",
        "title": "Is Propeller Picks a Sportsbook?",
        "description": "Propeller Picks is not a sportsbook. It is a player prop research and analytics product.",
        "h1": "Is Propeller Picks a sportsbook?",
        "summary": "No. Propeller Picks is not a sportsbook and does not accept wagers. Propeller provides analytics, confidence scores, public results, calculators, and research workflows so users can evaluate player props independently.",
        "sections": [
            ("What Propeller Does", "Propeller organizes player prop research and gives each analyzed prop a confidence score based on multiple data signals."),
            ("What Propeller Does Not Do", "Propeller does not set betting lines, hold balances, process deposits, accept entries, pay winnings, or act as a sportsbook."),
            ("User Responsibility", "Users are responsible for following local laws, platform rules, and responsible-gaming practices. Past performance does not guarantee future results."),
        ],
        "faqs": [
            ("Is Propeller Picks a sportsbook?", "No. Propeller Picks is a sports analytics and information service. It does not accept wagers, place bets, or pay out winnings."),
            ("Can I bet inside Propeller Picks?", "No. Propeller does not offer wagering. It provides research tools and links to public information so users can evaluate props themselves."),
            ("Is Propeller betting advice?", "No. Propeller provides analytics and informational context. It should not be treated as financial, legal, or betting advice."),
        ],
        "related": ["/terms/", "/privacy/", "/how-it-works/", "/results/"],
    },
    {
        "slug": "how-does-propeller-grade-picks",
        "title": "How Does Propeller Grade Picks?",
        "description": "How Propeller grades public prop results, tracks wins/losses/pushes, and keeps a transparent results ledger.",
        "h1": "How does Propeller grade picks?",
        "summary": "Propeller grades historical prop outcomes as wins, losses, or pushes after results are available. The Results page defines the archive's two counting units, links the source APIs, and explains why legacy rows are not a uniquely published forward-test or ROI record.",
        "sections": [
            ("Grading Outcomes", "A graded prop is marked as a win when the analyzed side beats the listed line, a loss when it does not, and a push when the result lands exactly on the line or is otherwise graded neutral."),
            ("Canonical Archive Source", "The Results page is the canonical explanation. It separates raw graded analysis rows from entries retained after the current public API collapse rules and links each machine-readable source."),
            ("Why Totals Change", "Totals change as historical rows are added, graded, corrected, or collapsed under current API rules. Always quote the unit and snapshot date, and do not treat either total as a forward-tested ROI record."),
        ],
        "faqs": [
            ("How does Propeller grade picks?", "Propeller grades historical prop outcomes as wins, losses, or pushes after final results are available. The Results page explains the units, sources, and limitations of that archive."),
            ("Where can I inspect Propeller results?", "Use /results/ for the canonical archive explanation and /track-record/ for grading methodology. Machine-readable sources are linked from /data/index.json."),
            ("Do past Propeller results guarantee future performance?", "No. The historical archive includes repeated analysis snapshots and legacy retrospective data. It is research context, not a forward-tested ROI claim, and past performance does not guarantee future results."),
        ],
        "related": ["/results/", "/track-record/", "/data/index.json", "/llms.txt"],
    },
    {
        "slug": "what-sports-does-propeller-support",
        "title": "What Sports Does Propeller Support?",
        "description": "Current Propeller sports coverage for player prop analysis, public results, and daily pick previews.",
        "h1": "What sports does Propeller support?",
        "summary": "Propeller's signed-in product supports NFL, NBA, MLB, NHL, soccer, and PGA. The free public analyzer currently exposes NBA, NHL, MLB, NFL, and soccer. Soccer is represented in public results through EPL and MLS buckets.",
        "sections": [
            ("Signed-In Product Sports", "The signed-in product supports NFL, NBA, MLB, NHL, soccer, and PGA. Availability varies by season, slate, and data."),
            ("Free Public Analyzer Sports", "The free public analyzer currently exposes NBA, NHL, MLB, NFL, and soccer. Soccer is represented in public results through EPL and MLS buckets."),
            ("Platform Coverage", "Coverage can vary by platform because Pick6, PrizePicks, Underdog, and sportsbooks may offer different sports, stat types, and slates."),
            ("Where To Check", "Use the picks hub, analyzer, and public data catalog to confirm current sport coverage before relying on any specific slate."),
        ],
        "faqs": [
            ("What sports does Propeller support?", "The signed-in product supports NFL, NBA, MLB, NHL, soccer, and PGA. The free public analyzer currently exposes NBA, NHL, MLB, NFL, and soccer. Public result buckets include NFL, NBA, NHL, MLB, EPL, and MLS."),
            ("Does Propeller support soccer props?", "Yes. Propeller includes soccer coverage, with public result buckets for EPL and MLS where available."),
            ("Does sport coverage change?", "Yes. Sport and stat coverage can vary by season, platform, data availability, and public publishing rules."),
        ],
        "related": ["/picks/", "/analyzer/", "/results/", "/data/index.json"],
    },
    {
        "slug": "does-propeller-support-prizepicks",
        "title": "Does Propeller Support PrizePicks?",
        "description": "How Propeller supports PrizePicks More/Less prop research, payout calculators, and strategy pages.",
        "h1": "Does Propeller support PrizePicks?",
        "summary": "Yes. Propeller supports PrizePicks research by analyzing over/under style player props, surfacing confidence scores, and linking users to PrizePicks-specific picks, payout calculators, and strategy content.",
        "sections": [
            ("How It Maps To PrizePicks", "PrizePicks uses More/Less choices on player projections. Propeller analyzes the same directional question: whether a player is more likely to go over or under a listed line."),
            ("PrizePicks Tools", "The PrizePicks payout calculator shows Power Play and Flex Play payout math, while the PrizePicks strategy guide explains entry sizing, Flex vs Power, and common mistakes."),
            ("Important Limits", "Propeller does not submit PrizePicks entries or guarantee outcomes. Always confirm final lines, payouts, and rules inside PrizePicks before entering."),
        ],
        "faqs": [
            ("Does Propeller support PrizePicks?", "Yes. Propeller supports PrizePicks-style player prop research by analyzing More/Less decisions with confidence scores and related context."),
            ("Does Propeller have PrizePicks picks today?", "Propeller publishes PrizePicks-focused pages and public pick previews where available. Check /picks/prizepicks/ for the current public page."),
            ("Does Propeller calculate PrizePicks payouts?", "Yes. The PrizePicks payout calculator at /tools/prizepicks-payout-calculator/ estimates Power Play and Flex Play returns from entry size and pick count."),
        ],
        "related": ["/picks/prizepicks/", "/tools/prizepicks-payout-calculator/", "/guides/prizepicks-strategy/", "/compare/pick6-vs-prizepicks/"],
    },
    {
        "slug": "does-propeller-support-pick6",
        "title": "Does Propeller Support DraftKings Pick6?",
        "description": "How Propeller supports DraftKings Pick6 player prop research and Pick6 strategy.",
        "h1": "Does Propeller support Pick6?",
        "summary": "Yes. Propeller supports Pick6 research by scoring over/under player props, highlighting confidence direction, and linking users to Pick6-specific pick pages, payout calculators, and strategy guides.",
        "sections": [
            ("How It Maps To Pick6", "Pick6 entries ask users to choose over or under on player props. Propeller's confidence score is built around that same directional decision."),
            ("Pick6 Tools", "Propeller includes a Pick6 payout calculator, a Pick6 strategy guide, and Pick6-focused pick pages for public research workflows."),
            ("Line Differences", "Pick6 and other platforms can post different lines for the same player and stat. Propeller users should compare the final platform line before making a decision."),
        ],
        "faqs": [
            ("Does Propeller support Pick6?", "Yes. Propeller supports Pick6-style player prop research with over/under confidence scores and Pick6-specific content."),
            ("Can Propeller compare Pick6 and PrizePicks?", "Yes. The Pick6 vs PrizePicks comparison page explains rules, entry styles, and how Propeller analysis applies to both formats."),
            ("Does Propeller enter Pick6 contests?", "No. Propeller is a research tool and does not submit entries on Pick6 or any other platform."),
        ],
        "related": ["/picks/pick6/", "/tools/pick6-payout-calculator/", "/guides/pick6-strategy/", "/compare/pick6-vs-prizepicks/"],
    },
    {
        "slug": "does-propeller-support-underdog",
        "title": "Does Propeller Support Underdog Fantasy?",
        "description": "How Propeller supports Underdog Fantasy prop research, payouts, and strategy content.",
        "h1": "Does Propeller support Underdog Fantasy?",
        "summary": "Yes. Propeller supports Underdog Fantasy research by analyzing over/under player props, surfacing confidence direction, and linking to Underdog-focused public picks, payout calculators, and strategy content.",
        "sections": [
            ("How It Maps To Underdog", "Underdog entries use player prop choices with payout structures that vary by entry type. Propeller helps evaluate the player-stat side of the decision."),
            ("Underdog Tools", "Propeller includes Underdog pick pages, an Underdog payout calculator, and an Underdog strategy guide for public research."),
            ("Check Final Rules", "Underdog payout rules and available entry types can vary. Confirm final payout and rules inside Underdog before entering."),
        ],
        "faqs": [
            ("Does Propeller support Underdog Fantasy?", "Yes. Propeller supports Underdog-style player prop research with confidence scores and related payout/strategy content."),
            ("Does Propeller have an Underdog payout calculator?", "Yes. The Underdog payout calculator is available at /tools/underdog-payout-calculator/."),
            ("Does Propeller submit Underdog entries?", "No. Propeller provides research and analysis only. It does not submit entries or place wagers."),
        ],
        "related": ["/picks/underdog/", "/tools/underdog-payout-calculator/", "/guides/underdog-strategy/", "/picks/"],
    },
    {
        "slug": "how-do-confidence-scores-work",
        "title": "How Do Propeller Confidence Scores Work?",
        "description": "What Propeller's 50–100 directional confidence score means and why it is not a win probability.",
        "h1": "How do Propeller confidence scores work?",
        "summary": "Propeller displays a More/Over or Less/Under direction plus a 50–100 model-confidence score. Higher values show stronger support for the displayed side. The score is not a calibrated win probability or guarantee.",
        "sections": [
            ("How To Read The Score", "Read the displayed direction first, then the 50–100 confidence value. A value near 50 is closer to neutral; a higher value means stronger support for that displayed side."),
            ("What Goes Into A Score", "Signals can include matchup quality, role and minutes, injury cascade effects, game environment, recent form, hit-rate context, and market probability."),
            ("How To Use Scores Responsibly", "Confidence is not certainty. Use scores as one input alongside current line, payout format, injury news, and your own risk rules."),
        ],
        "faqs": [
            ("How do Propeller confidence scores work?", "Propeller displays a direction plus a 50–100 confidence score. Higher values show stronger support for the displayed More/Over or Less/Under side; they are not win probabilities."),
            ("Is a high Propeller score guaranteed to win?", "No. A high score indicates stronger model confidence, not certainty. Sports outcomes are inherently uncertain."),
            ("What signals affect Propeller confidence?", "Signals can include matchup, role, injuries, game environment, recent form, historical hit rates, market probability, and platform line context."),
        ],
        "related": ["/how-it-works/", "/analyzer/", "/guides/how-to-analyze-player-props/", "/track-record/"],
    },
    {
        "slug": "how-do-i-use-propeller-for-nba-pra-props",
        "title": "How Do I Use Propeller for NBA PRA Props?",
        "description": "How to use Propeller when evaluating NBA points + rebounds + assists props.",
        "h1": "How do I use Propeller for NBA PRA props?",
        "summary": "To use Propeller for NBA PRA props, start with the listed PRA line, check the confidence direction, then review minutes, usage, matchup, injury cascade, pace, and role context. PRA combines points, rebounds, and assists, so role stability matters more than one isolated box-score trend.",
        "sections": [
            ("What PRA Means", "PRA stands for points plus rebounds plus assists. It is a combined stat prop that rewards all-around involvement instead of one single stat category."),
            ("What To Check First", "Start with expected minutes and usage. A player with stable minutes, ball-handling duties, and rebounding opportunity has more paths to clear a PRA line."),
            ("Where Propeller Helps", "Propeller helps surface whether multiple signals agree on the same direction, which is useful for combined-stat props that can hit in several ways."),
        ],
        "faqs": [
            ("How do I use Propeller for NBA PRA props?", "Use Propeller by checking the PRA line, confidence direction, expected minutes, usage, injury cascade, pace, and matchup context before deciding whether the over or under has value."),
            ("What is an NBA PRA prop?", "An NBA PRA prop combines a player's points, rebounds, and assists into one total. The pick wins if the combined total clears the listed line for the selected direction."),
            ("What matters most for PRA props?", "Minutes, usage, role stability, matchup, pace, and injury-driven opportunity matter most because PRA can be reached through scoring, rebounding, or passing volume."),
        ],
        "related": ["/guides/nba-prop-betting/", "/picks/nba/", "/analyzer/", "/guides/how-to-analyze-player-props/"],
    },
    {
        "slug": "does-propeller-show-no-vig-odds",
        "title": "Does Propeller Show No-Vig Odds?",
        "description": "How Propeller uses no-vig market probability as part of player prop analysis.",
        "h1": "Does Propeller show no-vig odds?",
        "summary": "Propeller uses no-vig market probability as one of several player prop analysis signals where data is available. No-vig analysis removes the bookmaker margin from odds to estimate a cleaner implied probability, then compares that market signal with matchup, role, injury, and form context.",
        "sections": [
            ("What No-Vig Means", "No-vig probability removes the sportsbook margin from both sides of a market to estimate the market's cleaner view of the true probability."),
            ("How Propeller Uses It", "No-vig analysis can help identify when a platform line or price disagrees with broader market expectations, but it is only one signal inside the larger confidence score."),
            ("Why It Is Not Enough Alone", "Market probability can be useful, but player prop decisions also depend on minutes, usage, matchup, injury news, and payout structure."),
        ],
        "faqs": [
            ("Does Propeller show no-vig odds?", "Propeller uses no-vig market probability as part of its analysis where data is available. It should be read alongside matchup, role, injury, and game-context signals."),
            ("What is no-vig analysis?", "No-vig analysis removes the sportsbook's built-in margin from odds to estimate a cleaner implied probability for each side of a market."),
            ("Can no-vig odds guarantee an edge?", "No. No-vig probability is a useful market signal, but it does not guarantee an edge or a winning outcome."),
        ],
        "related": ["/guides/how-to-analyze-player-props/", "/analyzer/", "/how-it-works/", "/tools/"],
    },
    {
        "slug": "how-often-are-propeller-picks-updated",
        "title": "How Often Are Propeller Picks Updated?",
        "description": "How often Propeller public picks, previews, and results data can change.",
        "h1": "How often are Propeller picks updated?",
        "summary": "Propeller public pick previews and results data can update as new slates, lines, injuries, and grading results become available. For current picks, use the picks pages. For settled outcomes and record totals, use the public results ledger and data catalog.",
        "sections": [
            ("Current Picks", "Current pick availability depends on sport, slate timing, public publishing rules, and upstream data availability."),
            ("Results Updates", "Results update after outcomes are graded. The results page and public summary API are the canonical places to check current totals."),
            ("Why A Pick Can Change", "Props can change when lines move, players are ruled in or out, projected roles shift, or a slate locks."),
        ],
        "faqs": [
            ("How often are Propeller picks updated?", "Propeller pick previews can update when new slates, lines, injuries, and model outputs are available. Check the current picks pages for the latest public preview."),
            ("Where do I see current Propeller picks?", "Current public pick previews are available from the picks hub at /picks/ and sport or platform-specific picks pages where available."),
            ("Where do I see settled Propeller results?", "Settled results are available on /results/ and /track-record/, with machine-readable sources linked from /data/index.json."),
        ],
        "related": ["/picks/", "/results/", "/track-record/", "/data/index.json"],
    },
]


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def absolute_url(path: str) -> str:
    if path.startswith("http"):
        return path
    return BASE_URL + path


def json_ld(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)


def render_related(paths: list[str]) -> str:
    items = []
    labels = {
        "/analyzer/": "Prop Analyzer",
        "/how-it-works/": "How It Works",
        "/results/": "Results",
        "/track-record/": "Track Record",
        "/terms/": "Terms",
        "/privacy/": "Privacy",
        "/data/index.json": "Data Catalog",
        "/llms.txt": "llms.txt",
        "/picks/": "Picks Hub",
        "/picks/prizepicks/": "PrizePicks Picks",
        "/picks/pick6/": "Pick6 Picks",
        "/picks/underdog/": "Underdog Picks",
        "/picks/nba/": "NBA Picks",
        "/tools/": "Tools",
        "/tools/prizepicks-payout-calculator/": "PrizePicks Calculator",
        "/tools/pick6-payout-calculator/": "Pick6 Calculator",
        "/tools/underdog-payout-calculator/": "Underdog Calculator",
        "/guides/prizepicks-strategy/": "PrizePicks Strategy",
        "/guides/pick6-strategy/": "Pick6 Strategy",
        "/guides/underdog-strategy/": "Underdog Strategy",
        "/guides/nba-prop-betting/": "NBA Prop Guide",
        "/guides/how-to-analyze-player-props/": "Player Prop Guide",
        "/compare/pick6-vs-prizepicks/": "Pick6 vs PrizePicks",
    }
    for path in paths:
        items.append(f'<a href="{esc(path)}">{esc(labels.get(path, path))}</a>')
    return "\n          ".join(items)


def page_schema(page: dict) -> tuple[dict, dict, dict]:
    url = f"{BASE_URL}/help/{page['slug']}/"
    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page["title"],
        "url": url,
        "description": page["description"],
        "dateModified": UPDATED,
        "inLanguage": "en-US",
        "isPartOf": {"@type": "WebSite", "name": "Propeller Picks", "url": BASE_URL},
        "publisher": {"@type": "Organization", "name": "Propeller Picks", "url": BASE_URL},
        "author": {"@type": "Person", "name": "Scott Olmer", "url": f"{BASE_URL}/about/"},
    }
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL},
            {"@type": "ListItem", "position": 2, "name": "Help", "item": f"{BASE_URL}/help/"},
            {"@type": "ListItem", "position": 3, "name": page["title"], "item": url},
        ],
    }
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {"@type": "Answer", "text": answer},
            }
            for question, answer in page["faqs"]
        ],
    }
    return webpage, breadcrumb, faq


BASE_CSS = """
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; color: var(--pp-text, #141815); background: var(--pp-paper, #f2efe8); font-family: var(--pp-body, sans-serif); line-height: 1.65; }
a { color: inherit; }
.page { min-height: 100vh; }
.container { width: min(1100px, calc(100% - 48px)); margin: 0 auto; }
.hero { padding: 88px 0 52px; border-bottom: 1px solid var(--pp-line, rgba(16,19,17,.15)); background: var(--pp-paper-light, #faf8f3); }
.crumbs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; color: var(--pp-muted, #626a64); font: 500 12px/1.5 var(--pp-mono, monospace); text-transform: uppercase; }
.crumbs a { color: var(--pp-orange-dark, #dd3d16); text-decoration: none; }
h1, h2, h3 { margin-top: 0; color: var(--pp-ink, #101311); font-family: var(--pp-display, sans-serif); line-height: 1.05; }
h1 { max-width: 900px; margin-bottom: 20px; font-size: clamp(44px, 7vw, 76px); letter-spacing: -.045em; }
h2 { margin-bottom: 18px; font-size: clamp(28px, 4vw, 40px); letter-spacing: -.025em; }
h3 { margin-bottom: 10px; font-size: 21px; }
.summary { max-width: 850px; color: var(--pp-sub, #59615b); font-size: 19px; }
.updated { margin-top: 16px; color: var(--pp-muted, #626a64); font: 500 12px/1.5 var(--pp-mono, monospace); }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
.card, .section-card, .faq-item, .related a { border: 1px solid var(--pp-line, rgba(16,19,17,.15)); border-radius: 4px; background: #fff; }
.card { display: block; padding: 22px; text-decoration: none; box-shadow: 4px 4px 0 var(--pp-orange-wash, #ffe1d6); transition: transform .18s; }
.card:hover { transform: translate(-2px, -2px); }
.card strong { display: block; margin-bottom: 8px; color: var(--pp-ink, #101311); }
.card span, .section-card p, .faq-item p { color: var(--pp-sub, #59615b); }
.section { padding: 48px 0; border-top: 1px solid var(--pp-line, rgba(16,19,17,.15)); }
.answer-box { margin-top: 28px; padding: 24px; border-left: 5px solid var(--pp-orange, #ff6038); background: var(--pp-orange-wash, #ffe1d6); }
.answer-box p { margin: 0; color: var(--pp-ink, #101311); }
.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 36px; align-items: start; padding-top: 52px; }
.section-card, .faq-item { margin-bottom: 16px; padding: 24px; }
.section-card p, .faq-item p { margin: 0; }
.faq-list { display: grid; gap: 14px; }
.related { position: sticky; top: 88px; display: grid; gap: 10px; }
.related a { display: block; padding: 13px 14px; color: var(--pp-ink, #101311); text-decoration: none; font-size: 14px; }
.related a:hover { border-color: var(--pp-orange, #ff6038); }
.cta { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin: 48px 0 72px; padding: 28px; border: 1px solid var(--pp-ink, #101311); background: var(--pp-ink, #101311); color: #fff; }
.cta h2 { color: #fff; }
.button { display: inline-flex; min-height: 46px; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 3px; background: var(--pp-orange, #ff6038); color: var(--pp-ink, #101311); text-decoration: none; font-weight: 800; white-space: nowrap; }
@media (max-width: 820px) { .container { width: min(100% - 32px, 1100px); } .hero { padding: 64px 0 40px; } .grid, .content-grid { grid-template-columns: 1fr; } .related { position: static; } .cta { align-items: flex-start; flex-direction: column; } }
"""


def render_page(page: dict) -> str:
    url = f"{BASE_URL}/help/{page['slug']}/"
    webpage, breadcrumb, faq = page_schema(page)
    sections = "\n".join(
        f"""        <section class="section-card">
          <h2>{esc(title)}</h2>
          <p>{esc(text)}</p>
        </section>"""
        for title, text in page["sections"]
    )
    faqs = "\n".join(
        f"""        <div class="faq-item">
          <h3>{esc(question)}</h3>
          <p>{esc(answer)}</p>
        </div>"""
        for question, answer in page["faqs"]
    )
    related = render_related(page["related"])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-NLXM4C2G7D"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-NLXM4C2G7D');
</script>
<title>{esc(page['title'])} | Propeller Help</title>
<meta name="description" content="{esc(page['description'])}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(page['title'])}">
<meta property="og:description" content="{esc(page['description'])}">
<meta property="og:image" content="{BASE_URL}/images/og-image.png">
<meta property="og:image:width" content="3000">
<meta property="og:image:height" content="1000">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@propellerpicks">
<meta name="twitter:title" content="{esc(page['title'])}">
<meta name="twitter:description" content="{esc(page['description'])}">
<meta name="twitter:image" content="{BASE_URL}/images/og-image.png">
<meta name="author" content="Scott Olmer">
<meta name="theme-color" content="#f2efe8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">
{json_ld(webpage)}
</script>
<script type="application/ld+json">
{json_ld(breadcrumb)}
</script>
<script type="application/ld+json">
{json_ld(faq)}
</script>
<style>{BASE_CSS}</style>
</head>
<body>
<div class="page">
  <nav class="nav">
    <div class="container nav-inner">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span><span>Propeller Picks</span></a>
      <div class="nav-links">
        <a href="/analyzer/">Analyzer</a>
        <a href="/results/">Results</a>
        <a href="/track-record/">Track Record</a>
        <a href="/tools/">Tools</a>
        <a href="/help/">Help</a>
      </div>
    </div>
  </nav>

  <main>
    <header class="hero">
      <div class="container">
        <div class="crumbs"><a href="/">Home</a><span>/</span><a href="/help/">Help</a><span>/</span><span>{esc(page['title'])}</span></div>
        <h1>{esc(page['h1'])}</h1>
        <p class="summary">{esc(page['summary'])}</p>
        <p class="updated">Last updated: {UPDATED}</p>
        <div class="answer-box"><p><strong>Direct answer:</strong> {esc(page['summary'])}</p></div>
      </div>
    </header>

    <div class="container content-grid">
      <article>
{sections}
        <section class="section">
          <h2>Frequently Asked Questions</h2>
          <div class="faq-list">
{faqs}
          </div>
        </section>
      </article>
      <aside class="related" aria-label="Related pages">
          {related}
      </aside>
    </div>

    <div class="container">
      <section class="cta">
        <div>
          <h2>Research today's props</h2>
          <p>Use Propeller's public tools, results, and analyzer pages before making your own platform decisions.</p>
        </div>
        <a class="button" href="https://app.propellerpicks.com/signup" rel="noopener">Get Free Access</a>
      </section>
    </div>
  </main>

  <footer>
    <div class="container">Propeller Picks is for research and analysis only. Propeller is not a sportsbook and does not accept wagers. If you or someone you know has a gambling problem, call or text 1-800-GAMBLER.</div>
  </footer>
</div>
</body>
</html>
"""


def render_hub() -> str:
    url = f"{BASE_URL}/help/"
    cards = "\n".join(
        f"""        <a class="card" href="/help/{esc(page['slug'])}/">
          <strong>{esc(page['title'])}</strong>
          <span>{esc(page['description'])}</span>
        </a>"""
        for page in PAGES
    )
    item_list = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Propeller Picks Help Articles",
        "itemListElement": [
            {"@type": "ListItem", "position": idx, "name": page["title"], "url": f"{url}{page['slug']}/"}
            for idx, page in enumerate(PAGES, start=1)
        ],
    }
    collection = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Propeller Picks Help Center",
        "url": url,
        "description": "Answer-first help articles about Propeller Picks, supported sports, grading, confidence scores, and platform support.",
        "dateModified": UPDATED,
        "isPartOf": {"@type": "WebSite", "name": "Propeller Picks", "url": BASE_URL},
    }
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL},
            {"@type": "ListItem", "position": 2, "name": "Help", "item": url},
        ],
    }
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-NLXM4C2G7D"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-NLXM4C2G7D');
</script>
<title>Propeller Picks Help Center | Product, Scoring, Platforms</title>
<meta name="description" content="Answer-first help articles about Propeller Picks, supported platforms, sports, grading, confidence scores, and prop research workflows.">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="Propeller Picks Help Center">
<meta property="og:description" content="Answer-first help articles about Propeller Picks, supported platforms, sports, grading, confidence scores, and prop research workflows.">
<meta property="og:image" content="{BASE_URL}/images/og-image.png">
<meta property="og:image:width" content="3000">
<meta property="og:image:height" content="1000">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@propellerpicks">
<meta name="twitter:title" content="Propeller Picks Help Center">
<meta name="twitter:description" content="Answer-first help articles about Propeller Picks, supported platforms, sports, grading, confidence scores, and prop research workflows.">
<meta name="twitter:image" content="{BASE_URL}/images/og-image.png">
<meta name="theme-color" content="#f2efe8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">
{json_ld(collection)}
</script>
<script type="application/ld+json">
{json_ld(breadcrumb)}
</script>
<script type="application/ld+json">
{json_ld(item_list)}
</script>
<style>{BASE_CSS}</style>
</head>
<body>
<div class="page">
  <nav class="nav">
    <div class="container nav-inner">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span><span>Propeller Picks</span></a>
      <div class="nav-links">
        <a href="/analyzer/">Analyzer</a>
        <a href="/results/">Results</a>
        <a href="/track-record/">Track Record</a>
        <a href="/tools/">Tools</a>
        <a href="/compare/">Compare</a>
      </div>
    </div>
  </nav>
  <main>
    <header class="hero">
      <div class="container">
        <div class="crumbs"><a href="/">Home</a><span>/</span><span>Help</span></div>
        <h1>Propeller Picks Help Center</h1>
        <p class="summary">Answer-first product, scoring, platform, and results pages for Propeller Picks. These articles are written for users and structured so search and answer engines can cite accurate product facts.</p>
        <p class="updated">Last updated: {UPDATED}</p>
      </div>
    </header>
    <section class="section">
      <div class="container">
        <h2>Product and Platform Answers</h2>
        <div class="grid">
{cards}
        </div>
      </div>
    </section>
    <div class="container">
      <section class="cta">
        <div>
          <h2>Need current data?</h2>
          <p>Use the public results pages and data catalog for current record and supported-feed details.</p>
        </div>
        <a class="button" href="/data/index.json">Open Data Catalog</a>
      </section>
    </div>
  </main>
  <footer>
    <div class="container">Propeller Picks is for research and analysis only. Propeller is not a sportsbook and does not accept wagers. If you or someone you know has a gambling problem, call or text 1-800-GAMBLER.</div>
  </footer>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if generated pages are out of date")
    args = parser.parse_args()
    help_dir = ROOT / "help"
    help_dir.mkdir(exist_ok=True)
    changed: list[Path] = []
    hub_path = help_dir / "index.html"
    outputs = [(hub_path, migrate_html(render_hub(), hub_path, False))]
    for page in PAGES:
        out_dir = help_dir / page["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        page_path = out_dir / "index.html"
        outputs.append((page_path, migrate_html(render_page(page), page_path, False)))
    for path, output in outputs:
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current != output:
            changed.append(path)
            if not args.check:
                path.write_text(output, encoding="utf-8")
    print(f"help_pages={len(outputs)} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
