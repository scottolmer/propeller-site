#!/usr/bin/env python3
"""Guard current lifetime-free access copy on conversion-focused public pages."""

from __future__ import annotations

import json
import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CTA = "Get lifetime-free access"
TERMS = "No card required."
CURRENT_PAGES = (
    "index.html",
    "pricing/index.html",
    "analyzer/index.html",
    "picks/index.html",
    "picks/mlb/index.html",
    "picks/nba/index.html",
    "picks/nhl/index.html",
    "picks/soccer/index.html",
    "picks/prizepicks/index.html",
    "picks/pick6/index.html",
    "picks/underdog/index.html",
)
STALE_PHRASES = (
    "Launch Propeller Free",
    "Start 14-day free trial",
    "Card required. Then",
    "paid plan opens September 29",
    "Coming September 29, 2026",
    "future paid plan",
    "upcoming paid plan",
    "Get All Picks Free",
    "Free to start",
)


def main() -> int:
    errors: list[str] = []
    facts = json.loads((ROOT / "data/product-facts.json").read_text(encoding="utf-8"))
    offer = facts["access"]["subscription_offer"]
    expected = {
        "status": "not_launched",
        "status_verified_on": "2026-10-01",
        "offer_id": "monthly-rally-15",
        "currency": "USD",
        "monthly_price": "15.00",
        "billing_period": "month",
        "included_products": ["Propeller Picks", "Rally"],
        "launch_date": None,
        "trial_days": None,
        "card_required": None,
    }
    for key, value in expected.items():
        if offer.get(key) != value:
            errors.append(f"product facts {key} drifted: {offer.get(key)!r}")

    for relative in CURRENT_PAGES:
        source = (ROOT / relative).read_text(encoding="utf-8")
        accepted_cta = CTA in source or (relative == "pricing/index.html" and "Create a free account" in source)
        if not accepted_cta:
            errors.append(f"{relative}: missing current lifetime-free CTA")
        if TERMS not in source:
            errors.append(f"{relative}: missing no-card disclosure")
        cursor = 0
        while (cta_at := source.find(CTA, cursor)) >= 0:
            terms_at = source.find(TERMS, cta_at)
            if terms_at < 0 or terms_at - cta_at > 4_000:
                errors.append(f"{relative}: lifetime-free CTA lacks nearby no-card disclosure")
            cursor = cta_at + len(CTA)
        for phrase in STALE_PHRASES:
            if phrase.casefold() in source.casefold():
                errors.append(f"{relative}: retains stale copy {phrase!r}")

    for relative in ("pricing/index.html", "terms/index.html", "delete-account/index.html"):
        source = (ROOT / relative).read_text(encoding="utf-8")
        for phrase in ("lifetime", "No payment card is required", "A paid subscription offer has not launched"):
            if phrase.casefold() not in source.casefold():
                errors.append(f"{relative}: missing offer fact {phrase!r}")

    pricing = (ROOT / "pricing/index.html").read_text(encoding="utf-8")
    for phrase in (
        "Existing free accounts keep their access.",
        "Free lifetime core access is currently available while Founder 500 launch spots remain.",
        "Existing Founder 500 lifetime core entitlements remain honored.",
        "Public tools stay free.",
    ):
        if phrase not in pricing:
            errors.append(f"pricing/index.html: missing preserved-access fact {phrase!r}")
    for phrase in ("Planned · Not launched", "$15", "Propeller Picks + Rally", "No launch date is announced", "not a current integration"):
        if phrase not in pricing:
            errors.append(f"pricing/index.html: missing planned-tier fact {phrase!r}")
    for forbidden in ("September 29", "$9.99", "14-day trial", "Card required. Then"):
        if forbidden.casefold() in pricing.casefold():
            errors.append(f"pricing/index.html: advertises inactive legacy term {forbidden!r}")

    normalizer_path = ROOT / "scripts/normalize_access_language.py"
    spec = importlib.util.spec_from_file_location("normalize_access_language", normalizer_path)
    if spec is None or spec.loader is None:
        errors.append("normalizer could not be loaded")
    else:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        generated = "<a>Launch Propeller Free</a><p>Free tier includes 5 analyzed props per day. No credit card required.</p>"
        normalized = module.normalize(generated)
        if CTA not in normalized or TERMS not in normalized:
            errors.append("normalizer does not upgrade generated lifetime-free CTA and disclosure copy")
        if module.normalize(normalized) != normalized:
            errors.append("normalizer is not idempotent for current lifetime-free access")
        dynamic = "<a>Get All ${allPicks.length} Picks Free\n        </a>"
        dynamic_normalized = module.normalize(dynamic)
        if CTA not in dynamic_normalized or TERMS not in dynamic_normalized:
            errors.append("normalizer does not upgrade generated dynamic lifetime-free CTA and disclosure copy")
        if module.normalize(dynamic_normalized) != dynamic_normalized:
            errors.append("normalizer is not idempotent for the dynamic current offer")

    if errors:
        print("current_subscription_offer=failed")
        print("\n".join(errors))
        return 1
    print(f"current_subscription_offer=ok pages={len(CURRENT_PAGES)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
