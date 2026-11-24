#!/usr/bin/env python3
"""Recompute the PAYOUT calculator break-even tables and check the HTML."""

from __future__ import annotations

import json
import pathlib
import re
import unittest

from scripts import compute_breakeven as be


ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = {
    "PrizePicks": ROOT / "tools/prizepicks-payout-calculator/index.html",
    "Underdog": ROOT / "tools/underdog-payout-calculator/index.html",
}
ROW_RE = re.compile(
    r'<tr data-entry="(?P<entry>[^"]+)" data-picks="(?P<picks>\d+)">'
    r'<td>[^<]+</td><td>\d+</td><td class="multiplier">(?P<pct>[\d.]+)%</td></tr>'
)


def fmt_multiplier(value: float) -> str:
    return f"{value:g}"


def html_rows(page: str) -> list[tuple[str, int, str]]:
    return [
        (match.group("entry"), int(match.group("picks")), match.group("pct"))
        for match in ROW_RE.finditer(page)
    ]


class BreakEvenMath(unittest.TestCase):
    def test_six_pick_power_reference_value(self):
        entry = next(
            item for item in be.ENTRIES
            if item.platform == "PrizePicks" and item.label == "Power Play" and item.picks == 6
        )
        probability = be.break_even(entry)
        self.assertAlmostEqual(probability, 0.54659, delta=0.00001)
        self.assertEqual(be.format_pct(probability), "54.7%")
        self.assertIn(
            '<tr data-entry="Power Play" data-picks="6"><td>Power Play</td><td>6</td>'
            '<td class="multiplier">54.7%</td></tr>',
            PAGES["PrizePicks"].read_text(encoding="utf-8"),
        )

    def test_display_values_round_half_up_to_one_decimal(self):
        expected = {
            ("PrizePicks", "Power Play", 2): "57.7%",
            ("PrizePicks", "Power Play", 3): "55.0%",
            ("PrizePicks", "Power Play", 4): "56.2%",
            ("PrizePicks", "Power Play", 5): "54.9%",
            ("PrizePicks", "Power Play", 6): "54.7%",
            ("PrizePicks", "Flex Play", 2): "61.8%",
            ("PrizePicks", "Flex Play", 3): "57.7%",
            ("PrizePicks", "Flex Play", 4): "55.0%",
            ("PrizePicks", "Flex Play", 5): "54.3%",
            ("PrizePicks", "Flex Play", 6): "54.2%",
            ("Underdog", "Standard", 2): "53.5%",
            ("Underdog", "Standard", 3): "53.6%",
            ("Underdog", "Standard", 4): "53.7%",
            ("Underdog", "Standard", 5): "54.9%",
            ("Underdog", "Standard", 6): "55.3%",
            ("Underdog", "Standard", 7): "55.1%",
            ("Underdog", "Standard", 8): "55.0%",
            ("Underdog", "Flex", 3): "55.4%",
            ("Underdog", "Flex", 4): "55.6%",
            ("Underdog", "Flex", 5): "54.7%",
            ("Underdog", "Flex", 6): "53.8%",
            ("Underdog", "Flex", 7): "55.4%",
            ("Underdog", "Flex", 8): "55.1%",
        }
        actual = {
            (entry.platform, entry.label, entry.picks): be.format_pct(be.break_even(entry))
            for entry in be.ENTRIES
        }
        self.assertEqual(actual, expected)

    def test_flex_entries_solve_the_binomial_break_even_equation(self):
        for entry in be.ENTRIES:
            if entry.all_or_nothing:
                continue
            with self.subTest(entry=entry):
                probability = be.break_even(entry)
                self.assertAlmostEqual(
                    be.expected_return(probability, entry.picks, entry.multipliers),
                    1.0,
                    places=9,
                )
                self.assertLess(
                    be.expected_return(probability - 1e-4, entry.picks, entry.multipliers),
                    1.0,
                )
                self.assertGreater(
                    be.expected_return(probability + 1e-4, entry.picks, entry.multipliers),
                    1.0,
                )

    def test_every_published_entry_has_a_break_even_value(self):
        expected_prizepicks = 5 + 5  # Power 2-6, Flex 2-6
        expected_underdog = 7 + 6  # Standard 2-8, Flex 3-8
        self.assertEqual(
            sum(entry.platform == "PrizePicks" for entry in be.ENTRIES),
            expected_prizepicks,
        )
        self.assertEqual(
            sum(entry.platform == "Underdog" for entry in be.ENTRIES),
            expected_underdog,
        )
        for entry in be.ENTRIES:
            with self.subTest(entry=entry):
                self.assertGreater(be.break_even(entry), 0.0)
                self.assertLess(be.break_even(entry), 1.0)


class BreakEvenTables(unittest.TestCase):
    def test_html_tables_match_computed_values(self):
        expected = {
            (entry.platform, entry.label, entry.picks): be.format_pct(be.break_even(entry))
            for entry in be.ENTRIES
        }
        for platform, path in PAGES.items():
            with self.subTest(platform=platform):
                page = path.read_text(encoding="utf-8")
                rows = html_rows(page)
                self.assertEqual(
                    len(rows),
                    sum(entry.platform == platform for entry in be.ENTRIES),
                )
                for label, picks, pct in rows:
                    key = (platform, label, picks)
                    self.assertIn(key, expected)
                    self.assertEqual(f"{pct}%", expected[key])

    def test_constants_are_the_published_payout_chart_rows(self):
        prizepicks = PAGES["PrizePicks"].read_text(encoding="utf-8")
        underdog = PAGES["Underdog"].read_text(encoding="utf-8")

        for picks, multiplier in be.PRIZEPICKS_POWER.items():
            with self.subTest(platform="PrizePicks", entry="Power Play", picks=picks):
                self.assertIn(
                    f'<tr><td>{picks} Picks</td><td>{picks}/{picks} correct</td>'
                    f'<td class="multiplier">{fmt_multiplier(multiplier)}x</td>',
                    prizepicks,
                )

        for picks, multipliers in be.PRIZEPICKS_FLEX.items():
            for correct, multiplier in multipliers.items():
                with self.subTest(platform="PrizePicks", entry="Flex Play", picks=picks, correct=correct):
                    self.assertIn(
                        f'<tr><td>{picks}-Pick Flex</td><td>{correct}/{picks} correct</td>'
                        f'<td class="multiplier">{fmt_multiplier(multiplier)}x</td>',
                        prizepicks,
                    )

        for picks, multiplier in be.UNDERDOG_STANDARD.items():
            with self.subTest(platform="Underdog", entry="Standard", picks=picks):
                self.assertIn(
                    f'<tr><td>{picks} Picks</td>'
                    f'<td class="multiplier">{fmt_multiplier(multiplier)}x</td>',
                    underdog,
                )

        for picks, multipliers in be.UNDERDOG_FLEX.items():
            with self.subTest(platform="Underdog", entry="Flex", picks=picks):
                one_miss = multipliers.get(picks - 1)
                two_misses = multipliers.get(picks - 2)
                self.assertIn(
                    f'<tr><td>{picks}-Pick Flex</td>'
                    f'<td class="multiplier">{fmt_multiplier(multipliers[picks])}x</td>'
                    f'<td>{fmt_multiplier(one_miss)}x</td>'
                    f'<td>{fmt_multiplier(two_misses) + "x" if two_misses is not None else "—"}</td></tr>',
                    underdog,
                )

    def test_quoted_sentence_and_checked_date_use_the_pages_existing_dates(self):
        checks = (
            (
                PAGES["PrizePicks"],
                "September 9, 2026",
                "At the standard rates checked September 9, 2026, a 6-pick PrizePicks "
                "Power Play needs each pick to hit about 54.7% of the time to break even.",
            ),
            (
                PAGES["Underdog"],
                "November 14, 2026",
                "At the standard rates checked November 14, 2026, a 6-pick Underdog "
                "Standard entry needs each pick to hit about 55.3% of the time to break even.",
            ),
        )
        for path, date, sentence in checks:
            with self.subTest(page=path.name):
                page = path.read_text(encoding="utf-8")
                self.assertIn(f"Rules checked {date}", page)
                self.assertIn(f"Payouts checked: {date}.", page)
                self.assertIn(sentence, page)
                self.assertIn("Break-even assumes each pick hits independently", page)

    def test_all_jsonld_blocks_still_parse(self):
        pattern = re.compile(
            r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            re.DOTALL | re.IGNORECASE,
        )
        for platform, path in PAGES.items():
            with self.subTest(platform=platform):
                blocks = pattern.findall(path.read_text(encoding="utf-8"))
                self.assertGreaterEqual(len(blocks), 3)
                for raw in blocks:
                    json.loads(raw)


if __name__ == "__main__":
    unittest.main()
