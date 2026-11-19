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

TRIAL_NOTE = "Card required. Cancel anytime before day 7 and you won't be charged."

# Public acquisition tools stay free. Their account CTAs must survive the
# prospective launch without promising a new permanent full-workspace grant.
ENTRY_REPLACEMENTS = (
    ("Explore Propeller free", "Start your 7-day free trial"),
    ("Get lifetime-free core access to the full research workspace.", "Keep your research in one workspace."),
    ("Research the props behind the entry with lifetime-free core access.", "Research the props behind the entry."),
    ("Launch spots remain. Save your research and put this payout math beside confidence, line value, movement, and supporting context. No card is required. This public calculator stays free and separate.", "Put this payout math beside player research, line context, and supporting evidence. Start a 7-day free trial to open the full workspace. This public calculator stays free."),
    ("Launch spots remain. Create an account to save your research and use the full workspace. No card is required. This calculator remains free.", "Start a 7-day free trial to save your research and use the full workspace. This calculator remains free without an account."),
    ("No card required.", TRIAL_NOTE),
    ("Public tools stay free. Account access terms are shown in the app.", TRIAL_NOTE),
)

REPLACEMENTS = (
    ("Get lifetime-free access", "Start your 7-day free trial"),
    ("get lifetime-free access", "start your 7-day free trial"),
    ("Lifetime-free access. No card required.", "7 days free, then $15/mo. " + TRIAL_NOTE),
    ("Free lifetime core access is currently available while Founder 500 launch spots remain.", "Start your 7-day free trial. Existing accounts keep full access free."),
    ("Free lifetime core access while Founder 500 launch spots remain", "7-day free trial"),

    ("Get Free Lifetime Access", "Start your 7-day free trial"),
    ("Get Free Access", "Start your 7-day free trial"),
    ("Get free access", "Start your 7-day free trial"),
    ("get free access", "start your 7-day free trial"),
    ("Start Free Trial", "Start your 7-day free trial"),
    ("Start Free", "Start your 7-day free trial"),
    ("Launch Propeller Free", "Start your 7-day free trial"),
    ("Start 14-day free trial", "Start your 7-day free trial"),
    ("Card required. Then $9.99/month unless canceled.", TRIAL_NOTE),
    ("Get All Picks Free", "Start your 7-day free trial"),
    ("Get All ${allPicks.length} Picks Free\n        </a>", "Start your 7-day free trial\n        </a>\n        <p style=\"font-size:13px; color:var(--text-tertiary); margin:10px 0 0;\">" + TRIAL_NOTE + "</p>"),
    ("Get All ${totalAvailable} Picks Free\n        </a>", "Start your 7-day free trial\n        </a>\n        <p style=\"font-size:13px; color:var(--text-tertiary); margin:10px 0 0;\">" + TRIAL_NOTE + "</p>"),
    ('href="/#pricing"', 'href="/pricing/"'),
    ("Free tier includes 5 analyzed props per day. No credit card required.", "Start your 7-day free trial, then $15/month. A card is required to start the trial; cancel anytime before the trial ends and you won't be charged."),
    ("5 fully analyzed picks per day. No credit card. See exactly why each prop is scored the way it is - before you enter.", "Start a 7-day free trial to inspect the reasoning behind available props. A card is required to start the trial; cancel anytime before the trial ends and you won't be charged."),
    ("with premium access available through the Propeller app.", "with the full workspace available through the Propeller app."),
    ("Free users receive the top 3 picks each day. Premium subscribers unlock the full ranked slate across all sports.", "The public analyzer shows a sample. The full workspace starts with a 7-day free trial, then $15/month."),
    ("Showing <strong>5 free picks</strong> today. Unlock all NHL picks plus NBA, NFL, MLB, and more with Propeller Premium.", "Showing a public sample when available. Start a 7-day free trial to open the full slate."),
    ("Unlock premium picks", "Start your 7-day free trial"),
    ("Unlock Premium", "Start your 7-day free trial"),
    ("Premium pick — unlock to view", "Full app pick — open to view"),
    ("Premium Pick", "Full App Pick"),
    ("Founder 500 members get free lifetime core access while launch spots remain.", "Existing Founder 500 lifetime core entitlements remain honored."),
    ("Free lifetime core access while launch spots remain.", "Existing Founder 500 lifetime core entitlements remain honored."),
    ("Founder 500 free lifetime core access while launch spots remain", "Existing Founder 500 lifetime core entitlements remain honored"),
    ("Founder 500 core access is free while launch spots remain.", "Existing Founder 500 lifetime core entitlements remain honored."),
    ("Free core access while spots remain", "Existing Founder 500 lifetime core entitlements remain honored"),
    ("Propeller Picks is a free AI-assisted player-prop research tool designed for DFS and pick'em platforms.", "Propeller Picks offers a free public AI-assisted player-prop analyzer designed for DFS and pick'em research. The public tool is separate from the subscriber workspace."),
    ("Current access and availability are shown at signup.", "Start your 7-day free trial. A card is required to start the trial."),
    ("No card required.", TRIAL_NOTE),
)


def normalize(source: str, *, growth_entry: bool = False) -> str:
    for old, new in REPLACEMENTS:
        source = source.replace(old, new)
    if growth_entry:
        for old, new in ENTRY_REPLACEMENTS:
            source = source.replace(old, new)
    source = source.replace("Get lifetime-free access", "Start your 7-day free trial")
    source = source.replace("get lifetime-free access", "start your 7-day free trial")
    source = source.replace("Free lifetime core access is currently available while Founder 500 launch spots remain.", "Start your 7-day free trial. Existing accounts keep full access free.")
    source = source.replace("Free lifetime core access while Founder 500 launch spots remain", "7-day free trial")
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
