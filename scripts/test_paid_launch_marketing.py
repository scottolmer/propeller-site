#!/usr/bin/env python3
"""Static contract checks for the future-dated paid marketing launch."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    errors: list[str] = []
    facts = json.loads((ROOT / "data" / "product-facts.json").read_text(encoding="utf-8"))
    offer = facts["access"]["subscription_offer"]
    pricing = (ROOT / "pricing" / "index.html").read_text(encoding="utf-8")
    shell = (ROOT / "scripts" / "apply_site_shell.py").read_text(encoding="utf-8")
    terms = (ROOT / "terms" / "index.html").read_text(encoding="utf-8")
    deletion = (ROOT / "delete-account" / "index.html").read_text(encoding="utf-8")

    expected = {"offer_id": "monthly-2026-09-29", "starts_at": "2026-09-29T20:00:00Z", "timezone": "America/Chicago", "currency": "USD", "monthly_price": "9.99", "trial_days": 14, "card_required": True, "annual_plan": False}
    for key, value in expected.items():
        if offer.get(key) != value:
            errors.append(f"offer {key} drifted: {offer.get(key)!r}")
    for phrase in ("September 29, 2026", "14 days", "$9.99", "payment card", "renews monthly", "Existing free accounts keep their access unless they choose a paid plan.", "Founder 500 lifetime core entitlements remain honored."):
        if phrase not in pricing:
            errors.append(f"pricing missing {phrase!r}")
    if "annual" in pricing.lower() and "No annual plan is offered." not in pricing:
        errors.append("pricing must state that no annual plan is offered")
    for source_name, source in (("terms", terms), ("delete account", deletion)):
        for phrase in ("14-day trial", "$9.99", "Existing free accounts keep their access unless they choose a paid plan."):
            if phrase not in source:
                errors.append(f"{source_name} missing {phrase!r}")
    for phrase in ('https://propellerpicks.com/pricing/">Pricing', 'mailto:support@propellerpicks.com">Support', 'site-nav-pricing'):
        if phrase not in shell:
            errors.append(f"shared shell missing {phrase!r}")
    for path in ROOT.rglob("*.html"):
        if any(part in {".git", "docs", "reports", "mockups", "analytics-dashboard"} for part in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding="utf-8")
        for forbidden in ('href="/#pricing"', "Start Free Trial", "Get Free Access", "Get Free Lifetime Access"):
            if forbidden.casefold() in source.casefold():
                errors.append(f"{path.relative_to(ROOT)} retains {forbidden!r}")
                break
    if errors:
        print("paid_launch_marketing=failed")
        print("\n".join(errors[:100]))
        return 1
    print("paid_launch_marketing=ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
