import datetime
import pathlib
import re
import unittest

from scripts import render_picks_snapshot as snap

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "scripts/fixtures/picks_snapshot"
DAY = "2026-11-09"
CAPTURED = datetime.datetime(2026, 11, 9, 23, 30, tzinfo=datetime.timezone.utc)


def feeds(day=DAY):
    return {sport: snap.load_feed(sport, day, FIXTURES) for sport in ("nba", "mlb", "nhl", "nfl")}


class PicksSnapshot(unittest.TestCase):
    def test_rows_are_rendered_with_date_capture_time_and_score_scale(self):
        block = snap.render_block(snap.PAGES["picks/prizepicks/index.html"], feeds(), DAY, CAPTURED)
        self.assertIn("5 free research rows for Monday, November 9, 2026", block)
        self.assertIn("Snapshot captured November 9, 2026 at 6:30 PM ET", block)
        self.assertIn("C.J. McCollum", block)
        self.assertIn("More (Over)", block)
        self.assertIn("63/100", block)
        self.assertIn("not a win probability", block)
        self.assertIn("not a PrizePicks feed", block)
        self.assertNotRegex(block, r">\d+%<")

    def test_wrong_slate_date_is_never_shown_as_rows(self):
        other = feeds("2026-11-10")
        self.assertEqual(other["nba"]["status"], "unavailable")
        block = snap.render_block(snap.PAGES["picks/nba/index.html"], other, "2026-11-10", CAPTURED)
        self.assertNotIn("<table", block)
        self.assertIn("No older slate is shown as current", block)

    def test_nfl_rows_are_deduplicated_validated_and_escaped(self):
        nfl = feeds()["nfl"]
        self.assertEqual([row["line"] for row in nfl["rows"]], [231.5])
        block = snap.render_block(snap.PAGES["picks/nfl/index.html"], feeds(), DAY, CAPTURED)
        self.assertIn("NFL Week 9 player prop research", block)
        self.assertIn("BUF vs MIN", block)
        self.assertIn("Leans this way on how the opposing defense has played, the matchup and recent results.", block)
        self.assertNotIn("<script>alert", block)

    def test_apply_is_idempotent_and_adds_the_companion_script_once(self):
        page = '<main>\n    <div id="picksOutput" style="display:none;"></div>\n</main>\n</body>'
        block = snap.render_block(snap.PAGES["picks/nba/index.html"], feeds(), DAY, CAPTURED)
        once = snap.apply(page, block, '<div id="picksOutput"')
        self.assertEqual(snap.apply(once, block, '<div id="picksOutput"'), once)
        self.assertEqual(once.count("picks-snapshot.js"), 1)
        self.assertLess(once.index(snap.START), once.index('<div id="picksOutput"'))

    def test_pages_carry_a_snapshot_and_keep_empty_state_copy_out_of_page_text(self):
        for rel in snap.PAGES:
            with self.subTest(page=rel):
                source = (ROOT / rel).read_text()
                self.assertEqual(source.count(snap.START), 1)
                self.assertEqual(source.count(snap.SCRIPT_TAG), 1)
                self.assertRegex(source, r'id="picksSnapshot" data-slate-date="\d{4}-\d{2}-\d{2}"')
                empty = re.search(r'<div id="picksEmpty"[^>]*>(.*?)</div>', source, re.S)
                if empty:
                    self.assertEqual(empty.group(1).strip(), "")
                    self.assertIn('<template id="picksEmptyTemplate">', source)
                self.assertNotIn("Games Scheduled Today", source)


if __name__ == "__main__":
    unittest.main()
