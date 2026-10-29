#!/usr/bin/env python3
"""Promote the approved homepage mockup into the production homepage."""

from __future__ import annotations

import json
import re
from pathlib import Path

from apply_site_shell import migrate_html


ROOT = Path(__file__).resolve().parents[1]
MOCKUP = ROOT / "mockups" / "home-lookup.html"
OUTPUT = ROOT / "index.html"
CSS_OUTPUT = ROOT / "assets" / "css" / "home-lookup.css"
CSS_VERSION = "20261027"
BODY_CLASS = "pp-site-system pp-home pp-lookup"

TITLE = "Propeller Picks: AI Player Prop Research in Plain English"
APP_STORE_URL = "https://apps.apple.com/app/id6760788202"
PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.propellerpicks.propeller&utm_source=na_Med"
DESCRIPTION = (
    "Free AI-assisted player prop research for DFS and pick'em players. Look up any player, see which way "
    "the research leans and why, on iOS, Android, or web."
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
    (
        "Can I inspect Propeller's methodology and record?",
        "Yes. Review the historical graded analysis rows, the separate First-observed capture, and how Propeller works. The current ledger does not independently verify event-start ordering or outcome timing. You can also read our AI research transparency benchmark.",
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
                "sameAs": [
                    "https://x.com/propellerpicks",
                    "https://www.youtube.com/@propellerpicks",
                    "https://apps.apple.com/app/id6760788202",
                    "https://play.google.com/store/apps/details?id=com.propellerpicks.propeller",
                ],
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
                "dateModified": "2026-10-26",
            },
            {
                "@type": "SoftwareApplication",
                "@id": "https://propellerpicks.com/#software",
                "name": "Propeller Picks",
                "applicationCategory": "SportsApplication",
                "operatingSystem": "Web, iOS, Android",
                "url": "https://propellerpicks.com/",
                "installUrl": [
                    "https://app.propellerpicks.com/signup",
                    APP_STORE_URL,
                    PLAY_STORE_URL,
                ],
                "image": "https://propellerpicks.com/images/og-home-ai-1200x630.png",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Free tier",
                        "price": "0",
                        "priceCurrency": "USD",
                        "description": "Free account with no payment card required.",
                    },
                    {
                        "@type": "Offer",
                        "name": "Full workspace",
                        "price": "15.00",
                        "priceCurrency": "USD",
                        "description": "Monthly subscription, tax included, with no automatic trial.",
                        "url": "https://propellerpicks.com/pricing/",
                    },
                ],
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
  <meta name="color-scheme" content="dark">
  <script src="/assets/js/analytics-loader.js?v=20260716"></script>
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
  <link rel="preload" href="/images/mobile-props-board-phone.webp" as="image" type="image/webp" fetchpriority="high">
  <link rel="stylesheet" href="/assets/css/home-lookup.css?v={CSS_VERSION}">
</head>"""


def main() -> None:
    source = MOCKUP.read_text(encoding="utf-8")
    style = re.search(r"<style>(.*?)</style>", source, flags=re.DOTALL)
    if not style:
        raise SystemExit("Mockup style block not found")
    css = style.group(1).strip().replace("../assets/fonts/", "/assets/fonts/")
    CSS_OUTPUT.write_text(css + "\n", encoding="utf-8")

    html = re.sub(r"<head>.*?</head>", head(), source, count=1, flags=re.DOTALL)
    html = html.replace('<body class="pp-lookup">', f'<body class="{BODY_CLASS}">', 1)
    for relative in ("images", "assets", "data", "analyzer"):
        html = html.replace(f"../{relative}/", f"/{relative}/")
    html = migrate_html(html, OUTPUT, True)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"wrote={OUTPUT.relative_to(ROOT)} css={CSS_OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
