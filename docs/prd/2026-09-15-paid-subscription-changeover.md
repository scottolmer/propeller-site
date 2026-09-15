# Paid subscription changeover — audit and PRD

Status: audit, implementation, production deployment, test-mode acceptance, and configuration restoration are complete. The offer remains deliberately time-gated until September 29, 2026 at 20:00 UTC. Processed GA4 reporting remains pending.

## Approved outcome

- Launch the new subscription offer September 29, 2026 at 3:00 p.m. America/Chicago (20:00 UTC).
- New subscribers receive a 14-day trial, then pay $9.99 USD per month. A trial beginning at launch cannot charge before October 13.
- Existing free users keep free access until they explicitly choose a paid plan. Existing Founder lifetime core entitlements are preserved.
- No annual plan, automatic migration to paid billing, real test charges, or early activation.
- Retain currently free public tools and research previews; distinguish these from the subscriber workspace.
- Deliver an audited, tested implementation and rendered review surfaces before production rollout.

## Verified billing configuration

Read-only Stripe inspection on September 15 confirmed the deployed `STRIPE_PRICE_MONTHLY` is `price_1TNxtgASfLoN8zqEb5H89B8a`, active, live-mode, USD 999 cents, interval month, product Propeller Pro Monthly. No price creation or change is needed. The existing flow collects a card in Stripe Checkout; the new offer must disclose that and automatic monthly renewal after the trial.

## Visitor and account journeys

1. Before launch: pricing explains the upcoming offer and current access; paid checkout cannot begin early.
2. At/after launch: a new visitor sees the same price, 14-day trial, card/renewal/cancellation disclosure on the website, signup, pricing and Stripe Checkout.
3. Existing free/Founder account: keeps its authorized access, is never automatically sent to Checkout, and can voluntarily choose a paid plan after launch.
4. Incomplete Checkout: the account remains usable for free/preview content and can resume checkout without duplicate subscriptions.
5. Trial/paid subscriber: confirmed Stripe state grants subscriber access; a failed or abandoned payment does not.
6. Payment problem/cancellation: billing management remains available independently of premium access; current paid-period access is honored according to the existing policy.

## Audit findings and implementation requirements

| ID | Priority | Evidence and problem | Required outcome / acceptance |
| --- | --- | --- | --- |
| LAUNCH-01 | P0 | `web/lib/founder-launch.ts` and `api/config.py` independently default launch flags on. | Backend owns the effective instant and offer. Test just before, at, and after launch; frontend cannot authorize an early trial/charge. |
| LAUNCH-02 | P0 | `web/lib/user-context.tsx` grants all signed-in users access from a public flag, rather than individual entitlements. | Derive access from the account; preserve existing free/Founder access under the approved policy. |
| LAUNCH-03 | P0 | Registration grants a seven-day trial before card collection; Checkout uses seven days. | Postlaunch registration alone never starts a subscription trial. Confirmed Stripe trial uses exactly 14 days and the configured $9.99 monthly price. |
| LAUNCH-04 | P0 | Checkout failure can strand a created account; retry gates reject cardless trials; customer_email creates fresh customers on retries. | Recoverable signup/checkout, bound to the existing account/customer; duplicate requests do not create duplicate subscriptions. |
| LAUNCH-05 | P0 | Expired/free users lack a Settings upgrade route; feature gates point existing users at signup. | Explicit authenticated opt-in and recovery; preserve free access and offer billing management whenever a billing relationship exists. |
| LAUNCH-06 | P0 | Paid result limits are implemented in browser components; full data may still arrive from APIs. | Enforce paid capabilities on the server while retaining deliberately free public tools/previews and existing-user access. Document the capability boundary. |
| LAUNCH-07 | P0 | Global “Get Free Access” and lifetime-free offer across 3,285 HTML files; 1,559 pages contain legacy links to missing `/#pricing`; 780 pages say “Start Free Trial” without current offer disclosure. | Real Pricing page, durable CTA routing, consistent facts/generators, no broken pricing anchors or obsolete global paid-offer claims. Preserve truthful free-tool claims. |
| LAUNCH-08 | P0 | App Pricing advertises only $0 forever; marketing has only pricing.md and no discoverable paid plan. | Accessible desktop/mobile Pricing with $9.99/month, 14-day trial, launch timing, existing-user promise, card/renewal disclosure, cancellation/support links. |
| LAUNCH-09 | P1 | Webhook sync 404 is acknowledged; billing state omits subscription ID/status/period. | Persist sufficient subscription identity/state for replay and support; failed sync returns retryable failure; stale events cannot revoke a newer subscription. |
| LAUNCH-10 | P1 | Past-due users can lose the portal link; cancellation/renewal disclosures are incomplete. | Clear paid/trial/past-due/canceled states; accessible portal, end-of-period cancellation and support/refund contact. |
| LAUNCH-11 | P1 | Finite premium promo codes do not expire; redemption count can race. | Time-limited access expires correctly and redemption limits are enforced atomically; existing lifetime grants remain independent. |
| LAUNCH-12 | P1 | Extension checks premium literally and rejects valid lifetime/trial accounts. | Use the shared core entitlement check consistently for existing core features. |
| LAUNCH-13 | P1 | Pricing/support absent from shared footer/navigation; terms and deletion pages lack trial changeover context. | Discoverable pricing and support, consistent subscription/cancellation/deletion explanations without inventing refund guarantees or legal obligations. |
| LAUNCH-14 | P1 | Offer attribution is missing from click/checkout metadata. | Preserve existing custom analytics and the verified GA4 first-payment conversion. Add only safe offer/version context where useful; purchase still comes only from confirmed payment. |

Inventory counts are repository audit snapshots, not traffic metrics. Sources: marketing `data/product-facts.json`, `data/comparison-pages.json`, `scripts/apply_site_shell.py`; app `web/lib/founder-launch.ts`, `web/lib/stripe.ts`, `web/lib/user-context.tsx`, `web/app/api/auth`, `web/app/api/stripe`; backend `api/routers/auth.py`, `api/routers/billing.py`, `api/services/founder_access_service.py`.

## Implementation sequence and ownership

1. Establish server-owned offer/time/entitlement contract and existing-user policy.
2. Implement backend account/billing integrity and web checkout/UI against that contract in separate file scopes.
3. Update marketing facts, generators, Pricing, shared navigation, relevant offer copy and policy explanations.
4. Integrate; run clock-boundary, account-state, signup/OAuth, checkout retry, webhook, promo and analytics tests.
5. Review rendered desktop and mobile web journeys, including failure/recovery states. Prepare PRs and local review URLs.
6. Production rollout applied additive schema/config, retained the paid start date, verified Stripe mode/price, and completed a test-mode subscription/replay without a customer charge.

## Open owner decisions

- A follow-up about full workspace versus limited preview is pending. The safe implementation preserves current product access for every account created before the cutoff; it does not downgrade anyone while that question is unanswered. An explicit later override can narrow access only after an owner decision.
- Retain end-of-paid-period cancellation and case-by-case refunds through support? Asked; pending.

## Verification required

- Before/at/after launch; timezone and 14-day arithmetic.
- Existing free, Founder lifetime, newly registered pre/postlaunch, abandoned Checkout, trial, paid, past-due, canceled and expired promo account states.
- Consistent backend authorization and UI, email/OAuth parity, no duplicate customers/subscriptions on retry.
- Correct price/trial in Stripe request; signed webhook replay and out-of-order state protection.
- Free tool and subscriber capability tests; no accidental loss of existing entitlements.
- Representative homepage, Pricing, signup, Settings, analyzer, article/comparison and legal pages render at desktop and mobile widths with working links and no horizontal overflow.
- Existing GA4 `purchase`, `start_trial`, calculator/analyzer/prompt/signup custom events preserved.
- Generated site checks, app type/build and focused backend tests; independent review.

## Explicit limits

No native app release, advertising launch, tax configuration change, new price, customer charge, unsolicited customer email or blanket revocation of free access is authorized by this work. Public tool pricing remains free where it is free today. The completed test-mode acceptance did not send customer email or change the authorized access policy.

## Implementation evidence

- The canonical backend policy uses `2026-09-29T20:00:00Z`; prelaunch paid checkout is unavailable. The public offer includes USD 9.99/month and 14 days.
- Existing accounts are identified by creation time before the cutoff. Preservation does not require a production data backfill. Founder lifetime entitlements remain independent of subscription status.
- Backend integration verification: 152 passing tests covering clock boundaries, account access, subscription replay/binding, signup/OAuth, Founder/promo, DFS, Assistant, GA4, schema migration, and mounted-router preview boundaries.
- Marketing Pricing rendered at 1440px desktop and 390px mobile; no document overflow, and the mobile menu exposes Pricing. Final copy/navigation refinements are included.
- Upstream daily/weekly/monthly article generators now route pricing CTAs to `/pricing/` and no longer advertise a trial starting before launch.
- Stripe's [webhook guidance](https://docs.stripe.com/webhooks#event-ordering) confirms delivery can be duplicated or out of order and timestamps can tie. The implementation must retrieve current subscription state and serialize account updates rather than rely on timestamps alone.

## Production deployment and acceptance evidence

- Marketing PR [#90](https://github.com/scottolmer/propeller-site/pull/90) released the offer copy, pricing route, shared navigation/footer links, and analytics contract. Marketing PR [#91](https://github.com/scottolmer/propeller-site/pull/91) then aligned `/pricing/` with the current homepage visual system. The live page was checked at 390×844 with no horizontal overflow (`pageWidth` 380).
- Application/API PR [#194](https://github.com/scottolmer/nfl-betting-system/pull/194) merged at `bbd5f23ce4efc30ba2c911b6a10a35ba166abdc9`. Both Railway services reported successful deployment. The migration applied 11 additive columns and the subscription index without altering existing grants.
- The authenticated live checkout boundary returns HTTP 503 with “Subscription checkout is not open yet” before launch. The live offer remains `2026-09-29T20:00:00Z`, USD 9.99, and a 14-day trial.
- Stripe test-mode acceptance created subscription `sub_1UG2mIASfLoN8zqEb8Tw4L5N` with a 1,209,600-second trial and invoice `in_1UG2mPASfLoN8zqE41CuACyJ` for USD 9.99, paid at 20:16:37Z. The test account was then canceled back to free access with `trial_used=true`, `legacy=false`, and zero emails sent.
- A signed replay delivered `purchase` and `start_trial` to the ledger with HTTP 204 on the first attempt. GA4 Realtime recorded exactly one of each at 20:16:59.273Z, approximately 22.27 seconds later. The `purchase` event is verified as a GA key event for the current day.
- The follow-up API redeploy `9bccb773-371e-41c6-9fc9-29d360ec6499` completed successfully on `bbd5f23c`; its health check passed and `GA4_ALLOW_TEST_EVENTS` is confirmed `false`. The standard processed GA report had no rows yet, which is expected reporting delay; this record does not claim recognized revenue in that processed report.

### Local review surfaces

- Marketing: http://127.0.0.1:8086/pricing/
- Backend offer: http://127.0.0.1:8016/api/public/subscription-offer (disposable local SQLite; no scheduled jobs)
- Web application: http://127.0.0.1:3006/pricing. The local test clock was advanced for postlaunch verification and reset to the real prelaunch date for handoff. Production rollout and test-mode acceptance are recorded above.

## Resolution register

| Items | Resolution |
| --- | --- |
| LAUNCH-01–03 | Backend offer/time authority, exact cutoff, 14-day Stripe trial; signup alone starts no paid trial. Existing accounts retain full access by creation cutoff until confirmed voluntary opt-in. |
| LAUNCH-04–05 | Customer/session reuse, repeat-trial prevention, recoverable Checkout, authenticated Settings opt-in; no automatic enrollment of existing accounts or promo-entitled new accounts. |
| LAUNCH-06 | Server preview caps on six sports' workspace feeds plus equivalent Best Picks, Edge Finder and team aliases. Mounted-router tests cover large limits, filters and offsets. Deliberately public tools/data remain public. |
| LAUNCH-07–08 | Real marketing Pricing page, matching app Pricing, shared navigation/footer, obsolete copy and pricing-anchor cleanup, updated source generators. |
| LAUNCH-09–10 | Persistent Stripe identity/state, per-account synchronization lock, replay/ordering safeguards, approved live/test price validation, status/date/cancellation display, billing portal remains accessible after payment failure. |
| LAUNCH-11–12 | Finite promo expiration with serialized redemption and shared extension access checks; lifetime grants preserved. |
| LAUNCH-13–14 | Pricing/support and billing/deletion guidance, preserved GA4 payment conversion and custom events, matching offer ID across repositories. |

### Review and test results

- Independent final code review found no remaining P0/P1 issue in the reviewed scope. Two material findings—wrong-price entitlement and grandfathered access surviving paid opt-in—were fixed and covered by regression tests.
- Marketing facts, site consistency, paid-offer checks, generator freshness and analytics tests pass. No broken `/#pricing` link or obsolete global free-access CTA remains in the checked production inventory; the CTA check is case-insensitive.
- Cross-repository offer comparison matches offer ID, date/timezone, price/currency, trial length and card requirement.
- App production build/typecheck and 90 focused web tests pass; final display refinements are included in the review surface.
- Browser review: marketing Pricing at 1440px and 390px; homepage, comparison and free analyzer at 390px; app Pricing/signup at desktop/mobile, plus existing-free, trial, past-due and Founder Settings with disposable local accounts.
- Simulated postlaunch API profiles: existing-free/Founder/trial/paid retain access; new-free and past-due do not receive subscriber workspace access. Failed local Checkout keeps existing full access and offers retry. Past-due Billing remains accessible. Trial Billing states the end date and next charge; Founder lifetime stays clear.
- No tracked database, credential, log or generated test artifact was changed. Primary dirty checkouts were preserved.

### Release boundary

The implementation uses the user's existing-access instruction conservatively: preserve current full access until an explicit subscription choice, and retain existing cancellation/refund handling. The earlier optional full/preview and refund-policy questions have not authorized any narrower access or new refund promise.

No customer charge, native release, campaign or customer message was performed. Production deployment, deployed Stripe/GA4 test-mode subscription/replay acceptance, and configuration restoration are complete. The remaining nonblocking evidence is appearance of the already-confirmed events in the delayed processed GA report. The release runbook in the app repository is `docs/billing/paid-launch-2026-09-29.md`.
