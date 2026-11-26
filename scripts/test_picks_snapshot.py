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
        self.assertIn("6 free research rows for Monday, November 9, 2026", block)
        self.assertIn("(NFL, NBA)", block)
        self.assertLess(block.index("Josh Allen"), block.index("C.J. McCollum"))
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

    def test_each_player_appears_once_per_table(self):
        rows = [
            {"player_name": "Brandon Miller", "stat_type": stat, "line": 20.5,
             "final_score": 38, "final_direction": "UNDER"}
            for stat in ("pts_ast", "pra", "pts_reb")
        ] + [
            {"player_name": "Ivica Zubac", "stat_type": "rebounds", "line": 11.5,
             "final_score": 39, "final_direction": "UNDER"},
            {"player_name": " brandon miller ", "stat_type": "rebounds", "line": 5.5,
             "final_score": 40, "final_direction": "UNDER"},
        ]
        kept = snap.valid_rows(rows)
        self.assertEqual([row["player_name"] for row in kept], ["Brandon Miller", "Ivica Zubac"])
        self.assertEqual(kept[0]["stat_type"], "pts_ast")

    def test_analyzer_hub_caps_rows_per_sport_and_stays_visible_beside_search(self):
        config = snap.PAGES["analyzer/index.html"]
        block = snap.render_block(config, feeds(), DAY, CAPTURED)
        self.assertIn('data-keep-live="true"', block)
        self.assertIn("<h2", block)
        self.assertIn("Top player prop research for Monday, November 9, 2026", block)
        self.assertIn("Search above to see any player&#x27;s current lines.", block)
        self.assertNotIn("The page loads the latest rows", block)
        for sport in config["feeds"]:
            self.assertLessEqual(len(snap.page_rows(config, feeds()[sport])), 3)
        rows = block.count("<tr>") - block.count("<thead><tr>")
        self.assertEqual(int(re.search(r'data-row-count="(\d+)"', block).group(1)), rows)
        self.assertNotRegex(block, r">\d+%<")
        self.assertNotIn('data-keep-live', snap.render_block(snap.PAGES["picks/nba/index.html"], feeds(), DAY, CAPTURED))

    def test_analyzer_anchor_exists_on_the_page(self):
        source = (ROOT / "analyzer/index.html").read_text()
        self.assertIn(snap.PAGES["analyzer/index.html"]["anchor"], source)

    def test_sport_hub_generator_keeps_the_snapshot_block(self):
        from scripts import generate_sport_analyzer_pages as gen
        for slug in ("nba", "nfl"):
            with self.subTest(hub=slug):
                rel = f"analyzer/{slug}/index.html"
                config = snap.PAGES[rel]
                self.assertTrue(config["keep_live"])
                page = next(p for p in gen.PAGES if p["slug"] == slug)
                fresh = gen.migrate_html(gen.render(page), ROOT / rel, False)
                self.assertIn(config["anchor"], fresh)
                block = snap.render_block(config, feeds(), DAY, CAPTURED)
                current = snap.apply(fresh, block, config["anchor"])
                carried = gen.carry_snapshot(fresh, current, slug)
                self.assertEqual(carried.count(snap.START), 1)
                self.assertIn(block, carried)
                self.assertEqual(gen.carry_snapshot(fresh, None, slug), fresh)

    def test_name_variants_of_one_player_share_a_row(self):
        rows = [
            {"player_name": name, "stat_type": stat, "line": 18.5,
             "final_score": 35, "final_direction": "UNDER"}
            for name, stat in (("Joe Milton", "pass_completions"),
                               ("Joe Milton III", "player_pass_completions"),
                               ("Jaime Jaquez Jr.", "points"),
                               ("Jaime Jaquez Jr", "rebounds"),
                               ("De'Anthony Melton", "points"))
        ]
        kept = snap.valid_rows(rows)
        self.assertEqual([row["player_name"] for row in kept],
                         ["Joe Milton", "Jaime Jaquez Jr.", "De'Anthony Melton"])

    def test_apply_is_idempotent_and_adds_the_companion_script_once(self):
        page = '<main>\n    <div id="picksOutput" style="display:none;"></div>\n</main>\n</body>'
        block = snap.render_block(snap.PAGES["picks/nba/index.html"], feeds(), DAY, CAPTURED)
        once = snap.apply(page, block, '<div id="picksOutput"')
        self.assertEqual(snap.apply(once, block, '<div id="picksOutput"'), once)
        self.assertEqual(once.count("picks-snapshot.js"), 1)
        self.assertLess(once.index(snap.START), once.index('<div id="picksOutput"'))

    def test_prizepicks_hero_time_matches_its_snapshot(self):
        source = (ROOT / "picks/prizepicks/index.html").read_text()
        captured = re.search(r'id="picksSnapshot"[^>]*data-captured-at="([^"]+)"', source)
        hero = re.search(r'<time id="cheatSheetUpdated" datetime="([^"]+)">([^<]+)</time>', source)
        self.assertIsNotNone(captured)
        self.assertIsNotNone(hero)
        self.assertEqual(hero.group(1), captured.group(1))
        self.assertIn("ET", hero.group(2))

    def test_hero_last_updated_uses_the_capture_time(self):
        page = '<p>Last updated <time id="cheatSheetUpdated" datetime="2020-01-01T00:00:00Z">old</time>.</p>'
        out = snap.stamp_hero_updated(page, CAPTURED)
        self.assertIn('datetime="2026-11-09T23:30:00Z"', out)
        self.assertIn(">November 9, 2026 at 6:30 PM ET<", out)
        self.assertEqual(snap.stamp_hero_updated(out, CAPTURED), out)
        self.assertEqual(snap.stamp_hero_updated("<p>none</p>", CAPTURED), "<p>none</p>")

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

    def test_non_empty_snapshot_has_no_loading_or_visible_empty_state(self):
        for rel, config in snap.PAGES.items():
            with self.subTest(page=rel):
                page = (ROOT / rel).read_text()
                block = snap.render_block(config, feeds(), DAY, CAPTURED)
                rendered = snap.apply(page, block, config["anchor"])
                rendered = snap.set_static_state(
                    rendered, DAY, snap.snapshot_row_count(rendered) > 0
                )
                visible = visible_page_text(rendered)
                self.assertNotIn("Loading today's", visible)
                self.assertNotIn("No Current Research to Show", visible)
                self.assertNotIn("No Research Rows to Show Right Now", visible)
                skeleton = re.search(
                    r'<div\b[^>]*\bid="picksSkeletonGrid"[^>]*>', rendered, re.I
                )
                if skeleton:
                    self.assertRegex(skeleton.group(0), r'display\s*:\s*none')
                availability = re.search(
                    r'<p\b[^>]*\bid="picksAvailability"[^>]*>(.*?)</p>', rendered, re.S
                )
                if availability:
                    self.assertIn("Showing research from Monday, November 9, 2026", availability.group(1))

    def test_empty_snapshot_shows_its_own_dated_message_without_loading(self):
        empty_feeds = {
            sport: {"status": "unavailable", "rows": [], "note": ""}
            for sport in ("nba", "mlb", "nhl", "nfl")
        }
        config = snap.PAGES["picks/prizepicks/index.html"]
        block = snap.render_block(config, empty_feeds, DAY, CAPTURED)
        self.assertIn("No older slate is shown as current", block)
        rendered = snap.apply(
            (ROOT / "picks/prizepicks/index.html").read_text(), block, config["anchor"]
        )
        rendered = snap.set_static_state(rendered, DAY, False)
        self.assertIn("No research rows for Monday, November 9, 2026.", rendered)
        self.assertNotIn("Loading today's", visible_page_text(rendered))
        self.assertNotIn("picks-loading", rendered)

    def test_static_state_is_idempotent_and_removes_the_nfl_loading_block(self):
        page = (
            '<p id="picksAvailability" role="status">Loading today\'s picks&hellip;</p>\n'
            '<div class="picks-grid" id="picksSkeletonGrid" aria-hidden="true">\n'
            '  <div class="skeleton-card"></div>\n'
            "</div>\n"
            '<div id="picks-container">\n'
            '  <div class="picks-loading" id="picks-loading" role="status">\n'
            '    <div class="picks-loading-spinner" aria-hidden="true"></div>\n'
            "    <p>Loading today's NFL picks&hellip;</p>\n"
            "  </div>\n"
            "</div>\n"
            '<div id="picksEmpty"></div>\n'
            '<template id="picksEmptyTemplate"><h3>No Current Research to Show</h3></template>\n'
        )
        once = snap.set_static_state(page, DAY, True)
        self.assertNotIn("Loading today's", once)
        self.assertIn("Showing research from Monday, November 9, 2026.", once)
        self.assertRegex(once, r'id="picksSkeletonGrid"[^>]*display\s*:\s*none')
        self.assertNotIn('id="picks-loading"', once)
        self.assertIn("No Current Research to Show", once)  # inert template copy
        self.assertEqual(snap.set_static_state(once, DAY, True), once)

        empty = snap.set_static_state(page, DAY, False)
        self.assertIn("No research rows for Monday, November 9, 2026.", empty)
        self.assertNotIn("Loading today's", empty)
        self.assertNotIn('id="picks-loading"', empty)


def visible_page_text(page: str) -> str:
    """Drop inert template/script/style blocks before checking rendered copy."""
    for tag in ("template", "script", "style"):
        page = re.sub(rf"<{tag}\b.*?</{tag}>", "", page, flags=re.S | re.I)
    return page


if __name__ == "__main__":
    unittest.main()
