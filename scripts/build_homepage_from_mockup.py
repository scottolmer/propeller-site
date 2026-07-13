#!/usr/bin/env python3
"""Promote the approved AI homepage mockup into the production homepage."""

from __future__ import annotations

import json
import re
from pathlib import Path

from apply_site_shell import migrate_html


ROOT = Path(__file__).resolve().parents[1]
MOCKUP = ROOT / "mockups" / "home-ai-winning-v2.html"
OUTPUT = ROOT / "index.html"
CSS_OUTPUT = ROOT / "assets" / "css" / "home-ai.css"

TITLE = "Propeller Picks | AI Player Prop Research"
DESCRIPTION = (
    "AI player prop research with inspectable matchup, usage, injury, market, and form signals. "
    "Analyze today's board free on desktop and mobile."
)

FAQS = [
    (
        "Is Propeller a sportsbook?",
        "No. Propeller is a research and analysis tool. We do not accept wagers or place bets for users.",
    ),
    (
        "What does the record include?",
        "The public archive has two units: raw graded analysis rows and entries retained after the current API collapse rules. It includes repeated snapshots and legacy retrospective data, so it is not a uniquely published forward-test or ROI record.",
    ),
    (
        "Why desktop and mobile?",
        "The desktop web app is built for deeper slate research. Mobile is for quick checks, saved props, alerts, and digest workflows when you are away from the desk.",
    ),
]


def schema() -> str:
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://propellerpicks.com/#organization",
                "name": "Propeller Picks",
                "url": "https://propellerpicks.com/",
                "logo": "https://propellerpicks.com/favicon.svg",
                "sameAs": ["https://x.com/propellerpicks"],
            },
            {
                "@type": "WebSite",
                "@id": "https://propellerpicks.com/#website",
                "url": "https://propellerpicks.com/",
                "name": "Propeller Picks",
                "publisher": {"@id": "https://propellerpicks.com/#organization"},
            },
            {
                "@type": "WebPage",
                "@id": "https://propellerpicks.com/#webpage",
                "url": "https://propellerpicks.com/",
                "name": TITLE,
                "description": DESCRIPTION,
                "isPartOf": {"@id": "https://propellerpicks.com/#website"},
                "about": {"@id": "https://propellerpicks.com/#software"},
                "dateModified": "2026-07-12",
            },
            {
                "@type": "SoftwareApplication",
                "@id": "https://propellerpicks.com/#software",
                "name": "Propeller Picks",
                "applicationCategory": "SportsApplication",
                "operatingSystem": "Web, iOS, Android",
                "url": "https://propellerpicks.com/",
                "installUrl": "https://app.propellerpicks.com/signup",
                "image": "https://propellerpicks.com/images/og-home-ai-1200x630.png",
                "description": "AI-powered player prop research with inspectable confidence signals, line context, saved props, and a public historical results archive.",
                "featureList": [
                    "Player prop research",
                    "Inspectable confidence signals",
                    "Line and market context",
                    "Saved prop tracking",
                    "Public historical results archive",
                ],
                "publisher": {"@id": "https://propellerpicks.com/#organization"},
            },
            {
                "@type": "Dataset",
                "@id": "https://propellerpicks.com/#results-dataset",
                "name": "Propeller Picks Public Results Summary",
                "description": "A dated historical archive of raw graded analysis rows and entries retained under the current public-ledger collapse rules. It is not a forward-tested ROI record.",
                "url": "https://propellerpicks.com/data/index.json",
                "creator": {"@id": "https://propellerpicks.com/#organization"},
                "license": "https://propellerpicks.com/terms/",
                "distribution": [
                    {
                        "@type": "DataDownload",
                        "encodingFormat": "application/json",
                        "contentUrl": "https://web-production-3c1c4.up.railway.app/api/public/results-summary",
                    },
                    {
                        "@type": "DataDownload",
                        "encodingFormat": "application/json",
                        "contentUrl": "https://propellerpicks.com/data/index.json",
                    },
                ],
            },
            {
                "@type": "FAQPage",
                "@id": "https://propellerpicks.com/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": question,
                        "acceptedAnswer": {"@type": "Answer", "text": answer},
                    }
                    for question, answer in FAQS
                ],
            },
        ],
    }
    return json.dumps(graph, indent=2, ensure_ascii=False)


def head() -> str:
    return f"""<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{TITLE}</title>
  <meta name="description" content="{DESCRIPTION}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://propellerpicks.com/">
  <meta property="og:title" content="{TITLE}">
  <meta property="og:description" content="{DESCRIPTION}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://propellerpicks.com/">
  <meta property="og:image" content="https://propellerpicks.com/images/og-home-ai-1200x630.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="Propeller Picks AI player prop research workspace">
  <meta property="og:site_name" content="Propeller Picks">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{TITLE}">
  <meta name="twitter:description" content="{DESCRIPTION}">
  <meta name="twitter:image" content="https://propellerpicks.com/images/og-home-ai-1200x630.png">
  <meta name="twitter:image:alt" content="Propeller Picks AI player prop research workspace">
  <meta name="twitter:site" content="@propellerpicks">
  <meta name="twitter:creator" content="@propellerpicks">
  <meta name="color-scheme" content="light">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-NLXM4C2G7D"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-NLXM4C2G7D');
  </script>
  <script type="application/ld+json">
{schema()}
  </script>
  <link rel="preload" href="/assets/fonts/familjen-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/ibm-plex-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/home-ai.css?v=20260712">
</head>"""


def faq_section() -> str:
    cards = "\n".join(
        f"""          <details class="home-faq__item">
            <summary>{question}<span aria-hidden="true">+</span></summary>
            <p>{answer}</p>
          </details>"""
        for question, answer in FAQS
    )
    return f"""    <section class="home-faq" aria-labelledby="home-faq-title">
      <div class="container home-faq__grid">
        <div class="home-faq__intro scroll-reveal">
          <p class="section-kicker">04 / The useful questions</p>
          <h2 id="home-faq-title">Know what the system is—and what it is not.</h2>
          <p>Direct answers about the product, the public record, and how desktop and mobile fit together.</p>
        </div>
        <div class="home-faq__list scroll-reveal">
{cards}
        </div>
      </div>
    </section>

"""


CSS_ADDITIONS = r"""

/* Keep the largest above-the-fold content immediately paintable. */
.hero .enter {
  opacity: 1;
  transform: none;
  animation: none;
}

.record-update {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.record-source-links { display: inline-flex; flex-wrap: wrap; gap: 12px; }
.record-source-links a { color: var(--orange-dark); font-weight: 600; text-decoration: none; }
.record-source-links a:hover { text-decoration: underline; }

.home-faq {
  padding: 112px 0;
  border-top: 1px solid var(--line);
  background: var(--paper-light);
}

.home-faq__grid {
  display: grid;
  grid-template-columns: 0.78fr 1.22fr;
  gap: 95px;
  align-items: start;
}

.home-faq__intro h2 {
  max-width: 620px;
  margin: 0;
  font: 600 clamp(44px, 5vw, 68px)/0.96 var(--display);
  letter-spacing: -0.056em;
}

.home-faq__intro > p:last-child {
  max-width: 480px;
  margin: 24px 0 0;
  color: var(--sub);
  font-size: 16px;
  line-height: 1.68;
}

.home-faq__list { border-top: 1px solid var(--ink); }

.home-faq__item {
  border-bottom: 1px solid var(--line);
}

.home-faq__item summary {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: var(--ink);
  font: 600 21px/1.25 var(--display);
  cursor: pointer;
  list-style: none;
}

.home-faq__item summary::-webkit-details-marker { display: none; }
.home-faq__item summary span { color: var(--orange); font: 500 25px/1 var(--mono); transition: transform 180ms ease; }
.home-faq__item[open] summary span { transform: rotate(45deg); }
.home-faq__item p { max-width: 720px; margin: -3px 48px 23px 0; color: var(--sub); font-size: 14px; line-height: 1.7; }

@media (max-width: 820px) {
  .home-faq { padding: 80px 0; }
  .home-faq__grid { grid-template-columns: 1fr; gap: 44px; }
  .record-update { align-items: flex-start; flex-direction: column; gap: 8px; }
}
"""


def main() -> None:
    source = MOCKUP.read_text(encoding="utf-8")
    style = re.search(r"<style>(.*?)</style>", source, flags=re.DOTALL)
    if not style:
        raise SystemExit("Mockup style block not found")
    CSS_OUTPUT.write_text(style.group(1).strip() + CSS_ADDITIONS + "\n", encoding="utf-8")

    html = re.sub(r"<head>.*?</head>", head(), source, count=1, flags=re.DOTALL)
    html = html.replace("<body>", '<body class="pp-site-system pp-home">', 1)
    html = html.replace("../images/", "/images/").replace("../assets/", "/assets/")
    html = html.replace(
        '<img src="/images/web-app-dashboard-live.png" width="1462" height="797"',
        '<img src="/images/web-app-dashboard-live.png" srcset="/images/web-app-dashboard-live-640.avif 640w, /images/web-app-dashboard-live-1024.avif 1024w, /images/web-app-dashboard-live.png 1462w" sizes="(max-width: 1080px) calc(100vw - 32px), 56vw" width="1462" height="797" fetchpriority="high" decoding="async"',
    )
    html = html.replace(
        '<img src="/images/web-app-andrew-abbott-prop-detail.png" width="1462" height="797"',
        '<img src="/images/web-app-andrew-abbott-prop-detail.png" width="1462" height="797" loading="lazy" decoding="async"',
    )
    html = html.replace(
        '<img src="/images/app-prop-detail-white-simulator.png" alt=',
        '<img src="/images/app-prop-detail-white-simulator.png" width="1206" height="2622" loading="lazy" decoding="async" alt=',
    )
    html = html.replace("Public graded record", "Documented historical archive")
    html = html.replace(
        '<div class="proof-item proof-live"><small>Verified record</small><strong>● Live</strong><span data-record-updated>Snapshot · Jul 7, 2026 · live API in production</span></div>',
        '<div class="proof-item proof-live"><small>Historical archive</small><strong>● Dated</strong><span data-record-updated>Static snapshot; live refresh enabled</span></div>',
    )
    html = html.replace(
        '<div class="proof-item"><small>Graded props</small><strong data-record-total>2M+</strong><span data-record-total-detail>2,099,988 total props</span></div>',
        '<div class="proof-item"><small>Collapsed ledger</small><strong data-record-total>284K</strong><span data-record-total-detail>284,005 ledger entries</span></div>',
    )
    html = html.replace(
        '<div class="proof-item"><small>Recorded outcomes</small><strong data-record-outcome>1.41M W · 687.5K L · 30 P</strong><span>Pushes tracked separately</span></div>',
        '<div class="proof-item"><small>Historical database</small><strong data-record-raw-total>2.12M</strong><span>Raw graded analysis rows</span></div>',
    )
    html = html.replace(
        '<div class="proof-item"><small>Historical win rate</small><strong data-record-win-rate>67.3%</strong><span>Past performance is not predictive</span></div>',
        '<div class="proof-item"><small>Known limits</small><strong>No ROI claim</strong><span>Repeats and retrospective data included</span></div>',
    )
    html = html.replace(
        '<div class="record-copy scroll-reveal"><p class="section-kicker">03 / Proof before the pitch</p><h2>Trust the record, not the promise.</h2><p>Every published model output is logged before the result is known, graded against the final stat, and rolled into a public record you can inspect.</p><a class="button" href="/results/">Inspect every graded result →</a></div>',
        '<div class="record-copy scroll-reveal"><p class="section-kicker">03 / Evidence before the pitch</p><h2>Read the unit before the number.</h2><p>The public archive separates raw graded analysis rows from entries retained after the API’s current collapse rules. It also discloses repeats, retrospective data, and why the archive is not a forward-tested ROI claim.</p><a class="button" href="/results/">Read the archive and definitions →</a></div>',
    )
    html = re.sub(
        r'<div class="record-board scroll-reveal">.*?<div class="record-update" data-record-updated>Snapshot · Jul 7, 2026 · live API in production</div></div>',
        '<div class="record-board scroll-reveal"><div class="record-head"><span>Public historical archive</span><span>● API connected</span></div><div class="record-main"><div class="record-primary"><small>Collapsed ledger entries</small><strong data-record-total-secondary>284K</strong><span>Entries retained under the current public API rules.</span></div><div class="record-stats"><div class="record-stat"><small>Raw database rows</small><strong data-record-raw-total-secondary>2.12M</strong></div><div class="record-stat"><small>Evidence status</small><strong>Research archive</strong></div></div></div><div class="record-update"><span data-record-updated>Static snapshot; live refresh enabled</span><span class="record-source-links"><a href="/results/">Source data</a><a href="/how-it-works/">Methodology</a></span></div></div>',
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = html.replace('    <section class="final-cta">', faq_section() + '    <section class="final-cta">', 1)
    old_nav_start = html.find('    const nav = document.querySelector(".nav");')
    old_nav_end_marker = '    window.addEventListener("resize", () => { if (window.matchMedia("(min-width: 861px)").matches) setNavigationOpen(false); });\n\n'
    if old_nav_start != -1:
        old_nav_end = html.find(old_nav_end_marker, old_nav_start)
        if old_nav_end == -1:
            raise SystemExit("Mockup navigation script end marker not found")
        html = html[:old_nav_start] + html[old_nav_end + len(old_nav_end_marker) :]
    html = migrate_html(html, OUTPUT, True)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"wrote={OUTPUT.relative_to(ROOT)} css={CSS_OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
