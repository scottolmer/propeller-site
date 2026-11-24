#!/usr/bin/env python3
"""Compute per-pick break-even win rates from the published payout charts.

The multipliers below are the standard multipliers already rendered on the
PrizePicks and Underdog payout calculator pages. This script does not fetch,
invent, or update multipliers; scripts/test_calculator_breakeven.py checks the
constants against the published chart rows and checks the visible break-even
tables against these calculations.

Math:
- All-or-nothing entries (PrizePicks Power, Underdog Standard):
      p = (1 / M) ** (1 / n)
- Flex / insurance entries:
      sum_k C(n, k) * p**k * (1-p)**(n-k) * M_k = 1, solved by bisection.

Display values round half-up to one decimal place so the displayed break-even
rate is not understated. For example, a 6-pick Power at 37.5x is 54.659%, shown
as 54.7%.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Mapping


@dataclass(frozen=True)
class BreakEvenEntry:
    platform: str
    label: str
    picks: int
    # Correct picks -> published multiplier. Power/Standard entries only list
    # the all-correct row; Flex entries list every published result row.
    multipliers: Mapping[int, float]

    @property
    def all_or_nothing(self) -> bool:
        return set(self.multipliers) == {self.picks}


# PrizePicks Power Play payout chart: 2 through 6 picks.
PRIZEPICKS_POWER = {
    2: 3.0,
    3: 6.0,
    4: 10.0,
    5: 20.0,
    6: 37.5,
}

# PrizePicks Flex Play payout chart: only the result rows published on the page.
PRIZEPICKS_FLEX = {
    2: {2: 2.0, 1: 0.5},
    3: {3: 3.0, 2: 1.0},
    4: {4: 6.0, 3: 1.5},
    5: {5: 10.0, 4: 2.0, 3: 0.4},
    6: {6: 25.0, 5: 2.0, 4: 0.4},
}

# Underdog Standard payout chart: 2 through 8 picks.
UNDERDOG_STANDARD = {
    2: 3.5,
    3: 6.5,
    4: 12.0,
    5: 20.0,
    6: 35.0,
    7: 65.0,
    8: 120.0,
}

# Underdog Flex payout chart: all-correct, one-miss, and two-miss rows.
UNDERDOG_FLEX = {
    3: {3: 3.25, 2: 1.09},
    4: {4: 6.0, 3: 1.4},
    5: {5: 10.0, 4: 2.5},
    6: {6: 25.0, 5: 2.6, 4: 0.25},
    7: {7: 40.0, 6: 2.75, 5: 0.5},
    8: {8: 80.0, 7: 3.0, 6: 1.0},
}

ENTRIES = tuple(
    [BreakEvenEntry("PrizePicks", "Power Play", picks, {picks: multiplier})
     for picks, multiplier in PRIZEPICKS_POWER.items()]
    + [BreakEvenEntry("PrizePicks", "Flex Play", picks, multipliers)
       for picks, multipliers in PRIZEPICKS_FLEX.items()]
    + [BreakEvenEntry("Underdog", "Standard", picks, {picks: multiplier})
       for picks, multiplier in UNDERDOG_STANDARD.items()]
    + [BreakEvenEntry("Underdog", "Flex", picks, multipliers)
       for picks, multipliers in UNDERDOG_FLEX.items()]
)


def expected_return(p: float, picks: int, multipliers: Mapping[int, float]) -> float:
    """Expected payout per unit staked when each pick hits with probability p."""
    return sum(
        math.comb(picks, correct)
        * (p ** correct)
        * ((1.0 - p) ** (picks - correct))
        * multipliers.get(correct, 0.0)
        for correct in range(picks + 1)
    )


def flex_breakeven(picks: int, multipliers: Mapping[int, float]) -> float:
    """Solve expected_return(p) = 1 for a partial-payout entry."""
    low, high = 0.0, 1.0
    for _ in range(200):
        mid = (low + high) / 2.0
        if expected_return(mid, picks, multipliers) < 1.0:
            low = mid
        else:
            high = mid
    return (low + high) / 2.0


def break_even(entry: BreakEvenEntry) -> float:
    if entry.all_or_nothing:
        return (1.0 / entry.multipliers[entry.picks]) ** (1.0 / entry.picks)
    return flex_breakeven(entry.picks, entry.multipliers)


def format_pct(probability: float) -> str:
    """Format a probability as a one-decimal percentage, rounded half-up."""
    percentage = Decimal(str(probability)) * 100
    rounded = percentage.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    return f"{rounded}%"


def main() -> int:
    for platform in ("PrizePicks", "Underdog"):
        print(platform)
        for entry in ENTRIES:
            if entry.platform != platform:
                continue
            probability = break_even(entry)
            print(
                f"  {entry.label} {entry.picks} picks: "
                f"{format_pct(probability)} (exact {probability * 100:.4f}%)"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
