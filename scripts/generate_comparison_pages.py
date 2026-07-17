#!/usr/bin/env python3
"""Generate the disclosed Propeller competitor-comparison pilot.

The source data is intentionally small and editorially reviewed. This is not a
Cartesian-product page generator: every page needs competitor-specific facts,
official sources, balanced strengths, and an exact visible/schema FAQ match.
"""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

from apply_site_shell import FOOTER, NAV, migrate_html


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "comparison-pages.json"
REFERENCE = ROOT / "compare" / "propeller-vs-oddsjam" / "index.html"
HUB = ROOT / "compare" / "index.html"
LLMS = ROOT / "llms.txt"
HUB_ITEMLIST_START = "<!-- PP_GENERATED_COMPARISON_ITEMLIST_START -->"
HUB_ITEMLIST_END = "<!-- PP_GENERATED_COMPARISON_ITEMLIST_END -->"
HUB_CARDS_START = "<!-- PP_GENERATED_COMPARISON_CARDS_START -->"
HUB_CARDS_END = "<!-- PP_GENERATED_COMPARISON_CARDS_END -->"
LLMS_START = "# PP_GENERATED_COMPARISON_LINKS_START"
LLMS_END = "# PP_GENERATED_COMPARISON_LINKS_END"


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def json_script(payload: object) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2).replace("</", "<\\/")


def marker(value: str | None, blue: bool = False) -> str:
    if not value:
        return ""
    return f'<span class="winner-badge">{esc(value)}</span>'


def source_link(source: dict[str, str]) -> str:
    url = source["url"]
    attrs = ' rel="nofollow noopener noreferrer" target="_blank"' if url.startswith("http") else ""
    return f'<a href="{esc(url)}"{attrs}>{esc(source["label"])}</a>'


def reference_style() -> str:
    """Reuse the established detail-page CSS instead of creating a new family."""
    source = REFERENCE.read_text(encoding="utf-8")
    match = re.search(r"<style>(.*?)</style>", source, flags=re.DOTALL)
    if not match:
        raise ValueError(f"comparison reference has no inline style: {REFERENCE}")
    return match.group(1)


def render(page: dict[str, object], checked_date: str) -> str:
    competitor = str(page["competitor"])
    slug = str(page["slug"])
    canonical = f"https://propellerpicks.com/compare/{slug}/"
    faqs = list(page["faqs"])
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["q"],
                "acceptedAnswer": {"@type": "Answer", "text": item["a"]},
            }
            for item in faqs
        ],
    }
    web_schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page["title"],
        "url": canonical,
        "description": page["description"],
        "datePublished": page.get("date_published", "2026-07-15"),
        "dateModified": page.get("date_modified", "2026-07-15"),
        "author": {"@type": "Person", "name": "Scott Olmer"},
        "publisher": {
            "@type": "Organization",
            "name": "Propeller Picks",
            "url": "https://propellerpicks.com/",
        },
        "inLanguage": "en-US",
    }
    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Propeller Picks", "item": "https://propellerpicks.com/"},
            {"@type": "ListItem", "position": 2, "name": "Compare", "item": "https://propellerpicks.com/compare/"},
            {"@type": "ListItem", "position": 3, "name": f"Propeller vs {competitor}", "item": canonical},
        ],
    }

    rows = "\n".join(
        f'''<tr>
          <td>{esc(row["label"])}</td>
          <td class="col-propedge">{esc(row["propeller"])}{marker(row.get("propeller_tag"))}</td>
          <td class="col-other">{esc(row["competitor"])}{marker(row.get("competitor_tag"), blue=True)}</td>
        </tr>'''
        for row in page["rows"]
    )
    propeller_wins = "".join(f"<li>{esc(item)}</li>" for item in page["propeller_wins"])
    competitor_wins = "".join(f"<li>{esc(item)}</li>" for item in page["competitor_wins"])
    sources = "".join(source_link(item) for item in page["sources"])
    faq_html = "\n".join(
        f'<div class="faq-item fade-in"><p class="faq-q">{esc(item["q"])}</p><p class="faq-a">{esc(item["a"])}</p></div>'
        for item in faqs
    )
    style = reference_style()

    return f'''<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{esc(page["title"])}</title>
  <meta name="description" content="{esc(page["description"])}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="author" content="Scott Olmer">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{esc(page["title"])}">
  <meta property="og:description" content="{esc(page["description"])}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://propellerpicks.com/images/ai-player-prop-benchmark.png">
  <meta property="og:image:alt" content="Propeller and {esc(competitor)} player prop tool comparison">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@propellerpicks">
  <meta name="twitter:title" content="{esc(page["title"])}">
  <meta name="twitter:description" content="{esc(page["description"])}">
  <meta name="twitter:image" content="https://propellerpicks.com/images/ai-player-prop-benchmark.png">
  <script type="application/ld+json">{json_script(web_schema)}</script>
  <script type="application/ld+json">{json_script(breadcrumb_schema)}</script>
  <script type="application/ld+json">{json_script(faq_schema)}</script>
  <script src="/assets/js/lucide-subset.js?v=20260716" defer></script>
  <style>{style}
  .compare-scroll-hint {{ display:none; margin:0 0 12px; color:var(--text-tertiary); font:600 12px/1.4 var(--font-mono); letter-spacing:.04em; text-align:right; text-transform:uppercase; }}
  .faq-item .faq-q, .faq-item .faq-a {{ background:transparent !important; border-color:transparent !important; box-shadow:none !important; }}
  @media (max-width:639px) {{ .compare-scroll-hint {{ display:block; }} }}
  </style>
  <link rel="stylesheet" href="../../assets/css/site-white-overrides.css?v=20260625-white-site">
  <style id="pp-critical-hero">.hero .fade-in{{opacity:1;transform:none;transition:none}}</style>
  <!-- PP_SITE_HEAD_START -->
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="alternate icon" href="../../favicon.ico">
  <link rel="icon" href="../../favicon-32x32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <meta name="theme-color" content="#f2efe8">
  <link rel="stylesheet" href="../../assets/css/site-system.css?v=20260712">
  <link rel="stylesheet" href="../../assets/css/site-compat.css?v=20260712">
  <!-- PP_SITE_HEAD_END -->
</head>
<body class="pp-site-system pp-family-core">
<div class="grain-overlay" aria-hidden="true"></div>
<div class="bg-orbs" aria-hidden="true"><div class="bg-orb bg-orb-1"></div><div class="bg-orb bg-orb-2"></div><div class="bg-orb bg-orb-3"></div></div>
{NAV}
<main id="main">
  <section class="hero"><div class="container"><div class="hero-content">
    <nav aria-label="Breadcrumb" class="breadcrumb fade-in"><a href="/">Home</a><svg class="breadcrumb-sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg><a href="/compare/">Compare</a><svg class="breadcrumb-sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg><span>Propeller vs {esc(competitor)}</span></nav>
    <h1 class="fade-in delay-1"><span>Propeller</span> vs {esc(competitor)}</h1>
    <p class="fade-in delay-2">{esc(page["deck"])}</p>
    <div class="hero-buttons fade-in delay-3"><a href="/analyzer/" class="btn btn-primary">Try the Free Analyzer</a><a href="#comparison" class="btn btn-secondary">See Full Comparison</a></div>
  </div></div></section>

  <section class="section compare-section" id="comparison" aria-labelledby="compare-heading"><div class="container">
    <p class="label section-label fade-in">Feature Breakdown · Checked {esc(checked_date)}</p>
    <h2 class="section-title fade-in" id="compare-heading">Propeller vs <span>{esc(competitor)}</span></h2>
    <p class="compare-scroll-hint">Swipe to compare →</p>
    <div class="compare-table-wrap fade-in"><table class="compare-table" aria-label="Propeller vs {esc(competitor)} feature comparison"><thead><tr><th>Feature</th><th class="col-propedge">Propeller</th><th>{esc(competitor)}</th></tr></thead><tbody>{rows}</tbody></table></div>
  </div></section>

  <section class="section" id="approaches" aria-labelledby="approaches-heading"><div class="container">
    <p class="label section-label fade-in">Understanding the Difference</p><h2 class="section-title fade-in" id="approaches-heading">Two Tools, Two Philosophies</h2>
    <div class="explainer-grid">
      <div class="card explainer-card fade-in"><span class="explainer-label explainer-label-propedge">PROPELLER</span><h3>Built for DFS and Pick'em</h3><p>{esc(page["propeller_summary"])}</p><p>{esc(page["jargon_callout"])}</p><ul>{propeller_wins}</ul></div>
      <div class="card explainer-card fade-in delay-1"><span class="explainer-label explainer-label-other">{esc(competitor).upper()}</span><h3>Best for a Different Research Job</h3><p><strong>{esc(page["competitor_best"])}</strong></p><p>{esc(page["competitor_summary"])}</p><ul>{competitor_wins}</ul></div>
    </div>
    <div class="internal-links fade-in"><a href="/analyzer/">Try the Prop Analyzer</a><a href="/picks/prizepicks/">PrizePicks Research</a><a href="/picks/underdog/">Underdog Research</a><a href="/picks/pick6/">Pick6 Research</a></div>
  </div></section>

  <section class="section why-section" id="verdict" aria-labelledby="verdict-heading"><div class="container">
    <p class="label section-label fade-in">The Short Answer</p><h2 class="section-title fade-in" id="verdict-heading">Which Tool Fits <span>Your Workflow?</span></h2>
    <div class="why-body fade-in"><p>{esc(page["verdict"])}</p><p><strong>{esc(page["verdict_note"])}</strong></p><p>Propeller Picks publishes this comparison and has a commercial interest in the outcome. We identify where {esc(competitor)} is stronger and do not assign a win-rate ranking.</p></div>
    <div class="internal-links fade-in">{sources}</div>
  </div></section>

  <section class="section" id="faq" aria-labelledby="faq-heading"><div class="container"><p class="label section-label fade-in">Common Questions</p><h2 class="section-title fade-in" id="faq-heading">Frequently Asked Questions</h2><div class="faq-list">{faq_html}</div></div></section>

  <section class="final-cta" id="get-started" aria-labelledby="cta-heading"><div class="container"><div class="fade-in"><p class="label section-label" style="margin-bottom:16px">Get Free Access</p><h2 id="cta-heading">Player-prop research<br><span>without the jargon.</span></h2><p>Propeller was designed to be used with DFS and pick'em platforms. Inspect the evidence behind available player lines, then make your own decision.</p><div class="cta-actions"><a href="/analyzer/" class="btn btn-primary">Try the Free Analyzer</a><p style="font-size:14px;color:var(--text-tertiary);margin:0">Independent research tool. No wager placement or platform affiliation.</p></div></div></div></section>
</main>
{FOOTER}
<script>
if (window.lucide) window.lucide.createIcons();
const comparisonObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {{ if (entry.isIntersecting) {{ entry.target.classList.add('visible'); comparisonObserver.unobserve(entry.target); }} }}), {{ threshold: .12 }});
document.querySelectorAll('.fade-in').forEach((element) => comparisonObserver.observe(element));
</script>
</body>
</html>
'''


def replace_managed_block(source: str, start: str, end: str, body: str, path: Path) -> str:
    pattern = re.compile(rf"{re.escape(start)}.*?{re.escape(end)}", re.DOTALL)
    if not pattern.search(source):
        raise ValueError(f"managed comparison block missing in {path}: {start}")
    replacement = f"{start}\n{body.rstrip()}\n{end}"
    return pattern.sub(lambda _: replacement, source, count=1)


def render_hub_itemlist(pages: list[dict[str, object]]) -> str:
    legacy = [
        ("Propeller vs BettingPros", "https://propellerpicks.com/compare/propeller-vs-bettingpros/"),
        ("Propeller vs OddsJam", "https://propellerpicks.com/compare/propeller-vs-oddsjam/"),
        ("Pick6 vs PrizePicks", "https://propellerpicks.com/compare/pick6-vs-prizepicks/"),
    ]
    generated = [
        (f'Propeller vs {page["competitor"]}', f'https://propellerpicks.com/compare/{page["slug"]}/')
        for page in pages
    ]
    # Match the visible hub order: generated comparison cards first, then the
    # three legacy cards that remain immediately below the managed block.
    items = [*generated, *legacy]
    payload = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Prop Betting Tool Comparisons",
        "itemListElement": [
            {"@type": "ListItem", "position": position, "name": name, "url": url}
            for position, (name, url) in enumerate(items, 1)
        ],
    }
    return f'<script type="application/ld+json">\n{json_script(payload)}\n</script>'


def render_hub_cards(pages: list[dict[str, object]]) -> str:
    cards = []
    for index, page in enumerate(pages):
        delay = "" if index % 3 == 0 else f" delay-{index % 3}"
        competitor = esc(page["competitor"])
        slug = esc(page["slug"])
        cards.append(
            f'''      <a href="/compare/{slug}/" class="compare-card fade-in{delay}" aria-label="Read comparison: Propeller vs {competitor}">
        <span class="compare-card-vs">vs</span>
        <h3>Propeller vs {competitor}</h3>
        <p>{esc(page["hub_summary"])}</p>
        <span class="compare-card-link">Compare <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </a>'''
        )
    return "\n\n".join(cards)


def render_llms_links(pages: list[dict[str, object]]) -> str:
    return "\n".join(
        f'- Propeller vs {page["competitor"]}: https://propellerpicks.com/compare/{page["slug"]}/'
        for page in pages
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if generated pages are out of date")
    args = parser.parse_args()
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    pages = list(payload["pages"])
    slugs: set[str] = set()
    changed: list[Path] = []
    for page in pages:
        slug = str(page["slug"])
        if slug in slugs:
            raise ValueError(f"duplicate comparison slug: {slug}")
        slugs.add(slug)
        if not page.get("hub_summary") or len(page["rows"]) < 8 or len(page["sources"]) < 4 or len(page["faqs"]) < 3:
            raise ValueError(f"{slug}: comparison quality gate failed")
        target = ROOT / "compare" / slug / "index.html"
        output = migrate_html(render(page, str(page.get("checked_date", payload["checked_date"]))), target, False)
        current = target.read_text(encoding="utf-8") if target.exists() else None
        if current != output:
            changed.append(target)
            if not args.check:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(output, encoding="utf-8")

    hub_source = HUB.read_text(encoding="utf-8")
    hub_output = replace_managed_block(hub_source, HUB_ITEMLIST_START, HUB_ITEMLIST_END, render_hub_itemlist(pages), HUB)
    hub_output = replace_managed_block(hub_output, HUB_CARDS_START, HUB_CARDS_END, render_hub_cards(pages), HUB)
    if hub_source != hub_output:
        changed.append(HUB)
        if not args.check:
            HUB.write_text(hub_output, encoding="utf-8")

    llms_source = LLMS.read_text(encoding="utf-8")
    llms_output = replace_managed_block(llms_source, LLMS_START, LLMS_END, render_llms_links(pages), LLMS)
    if llms_source != llms_output:
        changed.append(LLMS)
        if not args.check:
            LLMS.write_text(llms_output, encoding="utf-8")
    print(f"comparisons={len(slugs)} changed={len(changed)}")
    for path in changed:
        print(path.relative_to(ROOT))
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
