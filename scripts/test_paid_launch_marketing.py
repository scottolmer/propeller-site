#!/usr/bin/env python3
"""Static contract checks for lifetime-free access before a paid launch."""

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

    expected = {"offer_id": "monthly-rally-15", "status": "not_launched", "status_verified_on": "2026-10-01", "currency": "USD", "monthly_price": "15.00", "billing_period": "month", "included_products": ["Propeller Picks", "Rally"], "launch_date": None, "trial_days": None, "card_required": None}
    for key, value in expected.items():
        if offer.get(key) != value:
            errors.append(f"offer {key} drifted: {offer.get(key)!r}")
    for phrase in ("Create a free account", "Lifetime-free access. No card required.", "Free lifetime core access is currently available while Founder 500 launch spots remain.", "Existing free accounts keep their access.", "Existing Founder 500 lifetime core entitlements remain honored.", "Planned · Not launched", "$15", "Propeller Picks + Rally"):
        if phrase not in pricing:
            errors.append(f"pricing missing {phrase!r}")
    for source_name, source in (("terms", terms), ("delete account", deletion)):
        for phrase in ("lifetime", "No payment card is required", "Existing free accounts keep their access."):
            if phrase not in source:
                errors.append(f"{source_name} missing {phrase!r}")
    for phrase in ('https://propellerpicks.com/pricing/">Pricing', 'mailto:support@propellerpicks.com">Support', 'site-nav-pricing'):
        if phrase not in shell:
            errors.append(f"shared shell missing {phrase!r}")
    for path in ROOT.rglob("*.html"):
        if any(part in {".git", "docs", "reports", "mockups", "analytics-dashboard"} for part in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding="utf-8")
        for forbidden in ('href="/#pricing"', "Start Free Trial", "Start 14-day free trial", "Card required. Then $9.99/month unless canceled.", "Launch Propeller Free"):
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
