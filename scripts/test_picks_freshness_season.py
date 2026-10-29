import datetime
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import update_picks_freshness as freshness

PAGE = """<title>MLB Prop Picks Today, October 29 [Free]</title>
<meta property="og:title" content="MLB Prop Picks Today, October 29 &mdash; Free"
<h1><span>Today, October 29</span> &mdash; AI Analysis</h1>
"dateModified": "2026-10-29"
"""


def run(html, rel, day):
    if freshness.in_season(rel, day):
        return freshness.stamp(html, day)
    return freshness.stamp_offseason(html)


class SeasonalFreshnessTest(unittest.TestCase):
    def test_mlb_hub_switches_to_offseason_label_and_stops_dating(self):
        out = run(PAGE, "picks/mlb/index.html", datetime.date(2026, 11, 1))
        self.assertNotIn("Today", out)
        self.assertEqual(out.count(freshness.OFFSEASON_LABEL), 3)
        self.assertIn('"dateModified": "2026-10-29"', out)

    def test_mlb_hub_restores_dated_today_label_in_season(self):
        off = run(PAGE, "picks/mlb/index.html", datetime.date(2027, 1, 10))
        back = run(off, "picks/mlb/index.html", datetime.date(2027, 3, 1))
        self.assertIn("<title>MLB Prop Picks Today, March 1 [Free]</title>", back)
        self.assertIn("<span>Today, March 1</span>", back)
        self.assertIn('"dateModified": "2027-03-01"', back)
        self.assertNotIn(freshness.OFFSEASON_LABEL, back)

    def test_year_round_hubs_keep_stamping(self):
        out = run(PAGE, "picks/nba/index.html", datetime.date(2026, 12, 5))
        self.assertIn("Today, December 5", out)


if __name__ == "__main__":
    unittest.main()
