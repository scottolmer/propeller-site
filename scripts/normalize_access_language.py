#!/usr/bin/env python3
"""Remove stale hard-coded tier limits from generated marketing pages."""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "docs", "mockups"}
GROWTH_ENTRY_PAGES = {
    "analyzer/index.html", "picks/prizepicks/index.html",
    "tools/prizepicks-payout-calculator/index.html",
    "tools/underdog-payout-calculator/index.html",
    "tools/pick6-payout-calculator/index.html",
}

# Public acquisition tools stay free. Their account CTAs must survive the
# prospective launch without promising a new permanent full-workspace grant.
ENTRY_REPLACEMENTS = (
    ("Explore Propeller free", "Explore Propeller"),
    ("Get lifetime-free core access to the full research workspace.", "Keep your research in one workspace."),
    ("Research the props behind the entry with lifetime-free core access.", "Research the props behind the entry."),
    ("Launch spots remain. Save your research and put this payout math beside confidence, line value, movement, and supporting context. No card is required. This public calculator stays free and separate.", "Put this payout math beside player research, line context, and supporting evidence. Explore the account workspace and review its current access terms. This public calculator stays free."),
    ("Launch spots remain. Create an account to save your research and use the full workspace. No card is required. This calculator remains free.", "Explore the account workspace and review its current access terms. This calculator remains free without an account."),
    ("No card required.", "Public tools stay free. Account access terms are shown in the app."),
)

REPLACEMENTS = (
    ("Get lifetime-free access", "Explore Propeller free"),
    ("get lifetime-free access", "explore Propeller free"),
    ("Lifetime-free access. No card required.", "Explore free. No card required."),
    ("Free lifetime core access is currently available while Founder 500 launch spots remain.", "Explore Propeller free. Current full access remains free before the future transition."),
    ("Free lifetime core access while Founder 500 launch spots remain", "Free access before the future transition"),

    ("Get Free Lifetime Access", "Explore Propeller free"),
    ("Get Free Access", "Explore Propeller free"),
    ("Get free access", "Explore Propeller free"),
    ("get free access", "explore Propeller free"),
    ("Start Free Trial", "Explore Propeller free"),
    ("Start Free", "Explore Propeller free"),
    ("Launch Propeller Free", "Explore Propeller free"),
    ("Start 14-day free trial", "Explore Propeller free"),
    ("Card required. Then $9.99/month unless canceled.", "No card required."),
    ("Get All Picks Free", "Open the full research workspace"),
    ("Get All ${allPicks.length} Picks Free\n        </a>", "Explore Propeller free\n        </a>\n        <p style=\"font-size:13px; color:var(--text-tertiary); margin:10px 0 0;\">No card required.</p>"),
    ("Get All ${totalAvailable} Picks Free\n        </a>", "Get lifetime-free access\n        </a>\n        <p style=\"font-size:13px; color:var(--text-tertiary); margin:10px 0 0;\">No card required.</p>"),
    ('href="/#pricing"', 'href="/pricing/"'),
    ("Free tier includes 5 analyzed props per day. No credit card required.", "Current access and availability are shown at signup."),
    ("5 fully analyzed picks per day. No credit card. See exactly why each prop is scored the way it is - before you enter.", "Open the workspace to inspect the reasoning behind available props. Current access terms are shown at signup."),
    ("with premium access available through the Propeller app.", "with current access details shown in the Propeller app."),
    ("Free users receive the top 3 picks each day. Premium subscribers unlock the full ranked slate across all sports.", "A public sample may be shown on this page. Current full-slate availability and access details are shown in the app."),
    ("Showing <strong>5 free picks</strong> today. Unlock all NHL picks plus NBA, NFL, MLB, and more with Propeller Premium.", "Showing a public sample when available. Open the Propeller app for current full-slate availability and access details."),
    ("Unlock premium picks", "Open the full slate"),
    ("Unlock Premium", "Open Full Slate"),
    ("Premium pick — unlock to view", "Full app pick — open to view"),
    ("Premium Pick", "Full App Pick"),
    ("Founder 500 members get free lifetime core access while launch spots remain.", "Free lifetime core access is currently available while Founder 500 launch spots remain. No card required."),
    ("Free lifetime core access while launch spots remain.", "Free lifetime core access is currently available while Founder 500 launch spots remain. No card required."),
    ("Founder 500 free lifetime core access while launch spots remain", "Free lifetime core access while Founder 500 launch spots remain"),
    ("Founder 500 core access is free while launch spots remain.", "Free lifetime core access is currently available while Founder 500 launch spots remain."),
    ("Free core access while spots remain", "Free lifetime core access while Founder 500 launch spots remain"),
    ("Propeller Picks is a free AI-assisted player-prop research tool designed for DFS and pick'em platforms.", "Propeller Picks offers a free public AI-assisted player-prop analyzer designed for DFS and pick'em research. The public tool is separate from the subscriber workspace."),
    ("Current access and availability are shown at signup.", "No card required. Current availability is confirmed at signup."),
)


def normalize(source: str, *, growth_entry: bool = False) -> str:
    for old, new in REPLACEMENTS:
        source = source.replace(old, new)
    if growth_entry:
        for old, new in ENTRY_REPLACEMENTS:
            source = source.replace(old, new)
    source = source.replace("Get lifetime-free access", "Explore Propeller free")
    source = source.replace("get lifetime-free access", "explore Propeller free")
    source = source.replace("Free lifetime core access is currently available while Founder 500 launch spots remain.", "Explore Propeller free. Current full access remains free before the future transition.")
    source = source.replace("Free lifetime core access while Founder 500 launch spots remain", "Free access before the future transition")
    return source


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    files = [
        path for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)
    ]
    changed = []
    for path in sorted(files):
        source = path.read_text(encoding="utf-8")
        updated = normalize(source, growth_entry=path.relative_to(ROOT).as_posix() in GROWTH_ENTRY_PAGES)
        if updated != source:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"checked={len(files)} changed={len(changed)}")
    if args.check and changed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
