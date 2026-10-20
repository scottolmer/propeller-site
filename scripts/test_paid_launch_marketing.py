#!/usr/bin/env python3
"""Guard the live standalone pilot offer and preserved free access."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    errors = []
    facts = json.loads((ROOT / 'data/product-facts.json').read_text())
    offer = facts['access']['subscription_offer']
    expected = dict(offer_id='propeller-monthly-15', status='pilot', currency='USD',
                    monthly_price='15.00', billing_period='month', included_products=['Propeller Picks'],
                    launch_date='2026-10-19', trial_days=0, card_required=True, checkout_enabled=True,
                    tax_behavior='inclusive', customer_total='15.00')
    for key, value in expected.items():
        if offer.get(key) != value: errors.append(f'offer {key} drifted')
    pricing = (ROOT / 'pricing/index.html').read_text()
    for phrase in ('Create a free account', 'No card required.', 'Existing free accounts keep their access.',
                   'Existing Founder 500 lifetime core entitlements remain honored.', 'Monthly subscription · Limited pilot',
                   '$15', 'includes applicable tax', 'Full Propeller workspace.', 'MCP access for compatible AI tools',
                   'Review subscription availability', 'up to five current picks'):
        if phrase not in pricing: errors.append(f'pricing missing {phrase!r}')
    for name in ('pricing.md', 'llms.txt', 'PRODUCT.md'):
        source = (ROOT / name).read_text()
        if 'MCP access for compatible AI tools' not in source: errors.append(f'{name}: MCP feature missing')
        if '$9.99' in source or '14 days free' in source: errors.append(f'{name}: obsolete purchase terms')
    for name in ('terms/index.html', 'delete-account/index.html'):
        source = (ROOT / name).read_text()
        for phrase in ('Existing free accounts keep their access.', 'No payment card is required'):
            if phrase not in source: errors.append(f'{name}: missing {phrase!r}')
    spec = importlib.util.spec_from_file_location('normalizer', ROOT / 'scripts/normalize_access_language.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    for original in ('Get lifetime-free access', 'Start Free Trial', 'Get Free Access',
                     'Free lifetime core access is currently available while Founder 500 launch spots remain.',
                     'Get All ${allPicks.length} Picks Free\n        </a>'):
        normalized = module.normalize(original)
        if module.normalize(normalized) != normalized: errors.append('normalizer is not idempotent')
        if 'lifetime-free' in normalized or 'launch spots remain' in normalized: errors.append('normalizer creates new permanent acquisition promise')
    for path in ROOT.rglob('*.html'):
        if any(part in {'.git','docs','reports','mockups','analytics-dashboard'} for part in path.relative_to(ROOT).parts): continue
        source = path.read_text()
        for forbidden in ('Start Free Trial','Start 14-day free trial','Card required. Then $9.99/month unless canceled.',
                          'Get lifetime-free access','Propeller Picks + Rally'):
            if forbidden.casefold() in source.casefold(): errors.append(f'{path.relative_to(ROOT)} retains {forbidden!r}')
    if errors:
        print('paid_launch_marketing=failed\n' + '\n'.join(errors[:100])); return 1
    print('paid_launch_marketing=ok'); return 0

if __name__ == '__main__': raise SystemExit(main())
