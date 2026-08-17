# PrizePicks Power Play vs. Flex Play — sourced production script

## Narration

The narration source of truth is [`final.txt`](final.txt). The user authorized autonomous script decisions for Wave A on August 16, 2026.

## Current factual sources

All official pages were opened and rechecked on **August 16, 2026**.

1. [PrizePicks — Payouts](https://www.prizepicks.com/help-center/payouts), last updated August 11, 2026.
   - Current standard Power and Flex payout rates.
   - Current two-pick Flex tiers.
   - Individual details-screen disclosure controls.
   - Reasons a displayed payout can vary.
   - DNP, Reboot, and tied-projection payout reversion summary.
2. [PrizePicks — Player Picks](https://www.prizepicks.com/help-center/player-picks), last updated July 16, 2026.
   - Player Picks normally use two to six projections.
   - Lineups require athletes from at least two teams.
   - Colorado requires at least three projections.
   - Sport-specific scoring restrictions and variable member limits exist.
3. [PrizePicks — DNPs, Reboots, and Ties](https://www.prizepicks.com/help-center/dnps-reboots-and-ties), last updated August 11, 2026.
   - DNP and eligible Reboot reversion behavior.
   - Tied projections lower a tier without being removed for minimum-pick or same-team eligibility.
   - Reboot eligibility and activity thresholds are sport-specific.
4. [PrizePicks — Eligibility](https://www.prizepicks.com/help-center/eligibility), last updated August 14, 2026.
   - Product access, minimum age, eligible sports, and lineup rules vary by jurisdiction.
5. [PrizePicks — Potential Outcomes](https://www.prizepicks.com/help-center/potential-outcomes), last updated August 5, 2026.
   - Distinguishes Leaderboard Win and Minimum Guarantee paths.
   - Repeats the current standard Minimum Guarantee payout table.

### Source-conflict resolution

- A search-index snapshot initially returned a stale `5x` value for the four-pick Flex all-correct tier on the Potential Outcomes page.
- Fresh direct HTTPS fetches on August 16, 2026 showed `6x` in both live official pages: Payouts (updated August 11) and Potential Outcomes (updated August 5). The live Payouts page is both newer and specifically dedicated to payout structures.
- The script therefore uses `6x` for the dated standard-rate example, while repeatedly making the individual details screen the controlling source for any actual lineup.

## Local product evidence

- `tools/prizepicks-payout-calculator/index.html`, inspected August 16, 2026.
- The local calculator currently models the published standard Player Pick rates and labels visitor-entered hit rate as a scenario assumption rather than a Propeller prediction.
- Fresh captures will use a four-pick, $20 comparison because that path is supported and visually clear in both desktop and mobile layouts.
- The official help page now lists a two-pick Flex tier, while the local calculator currently exposes Flex beginning at three picks. The narration therefore shows the official two-pick rule in a branded editorial chart and does not claim the calculator can demonstrate that tier.

## Production notes

- Opening answer lands inside the first 15 seconds.
- Use the real calculator as the visual spine for scenario math and interaction.
- Use editorial rule cards for the complete payout chart, regional variability, and DNP/Reboot/tie behavior.
- The official details screen itself is not captured because this production does not use a PrizePicks account or submit an entry; show a clearly labeled editorial representation instead.
- “Payout” means the total returned amount in the calculator examples, not profit.
- Avoid `lock`, `guaranteed`, `risk-free`, “best play,” ROI claims, and any recommendation to enter.
- No final 1080p master, upload, or publication is authorized in this wave.
