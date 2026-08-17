# Production script and factual notes

## Narration

The narration-only source is `final.txt`. The user authorized autonomous script decisions for Wave A on August 16, 2026; the wording is approved for local Kokoro narration.

## Current official sources

1. [Underdog: Pick'em Standard & Flex Entry Payouts](https://help.underdogsports.com/en/articles/13780101-pick-em-standard-flex-entry-payouts), checked August 16, 2026. Current published base table; says payouts include the entry fee, Flex supports 3–8 picks, selection multipliers and correlated projections can adjust payouts, and the current selection details matter.
2. [Underdog: Payout Differences and Discrepancies](https://help.underdogsports.com/en/articles/10730924-payout-differences-and-discrepancies), checked August 16, 2026. Says Flex amounts can be “up-to” amounts and Champions payouts may vary with the prize pool.
3. [Underdog: State Eligibility](https://help.underdogsports.com/en/articles/8923390-state-eligibility), checked August 16, 2026. Current location-by-location availability list and explanation that unavailable modes do not appear.
4. [Underdog: Can I switch to Classic Pick'em?](https://help.underdogsports.com/en/articles/11102893-can-i-switch-to-classic-pick-em), checked August 16, 2026. Says physical location determines whether Classic or Champions is available.

## Product evidence

- Local source: `tools/underdog-payout-calculator/index.html` at branch `codex/youtube-five-video-batch`, captured August 16, 2026.
- Walkthrough examples intentionally use only values that match the official table checked that day:
  - 5-pick Standard: 20x base multiplier.
  - 6-pick Flex: 25x for 6/6, 2.6x for 5/6, and 0.25x for 4/6.
- The local page separately shows a stale 10x 4-pick Standard value while the official help page currently says 12x. That value is excluded from narration and all captures. This drift is a publication warning for the companion page, not authorization to edit it in this assignment.

## Visual direction

The treatment is a broadcast-editorial “receipt tape” product film: dark ink background, Propeller orange as the calculation operator, paper panels for formulas, and real desktop/mobile calculator captures as the walkthrough spine. Official-rule context uses clearly labeled editorial cards rather than screenshots of Underdog's authenticated product.

## Compliance language

- Scenario estimator, not a prediction.
- Possible payout, not promised profit.
- Payout includes the original entry amount.
- Final Underdog entry screen and official terms control.
- Propeller does not accept wagers or operate as a sportsbook.
