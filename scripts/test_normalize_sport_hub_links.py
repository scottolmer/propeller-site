#!/usr/bin/env python3
"""Regression tests for sport-hub breadcrumb link normalization."""

from __future__ import annotations

import contextlib
import io
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from normalize_sport_hub_links import hub_sports, main, normalize


HUBS = {"nba", "nfl"}

PAGE = """<!doctype html>
<html><body>
<nav aria-label="Breadcrumb" class="bc">
<a href="/">Home</a>
<a href="/analyzer/">Prop Analyzer</a>
<a href="/analyzer/?sport={sport}">{label}</a>
<span style="color:#94A3B8">{player}</span>
</nav>
<p><a href="/analyzer/?sport={sport}" style="color:#FDBA74">Check the live {label} board</a>.</p>
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"Home","item":"https://propellerpicks.com"}},{{"@type":"ListItem","position":2,"name":"Prop Analyzer","item":"https://propellerpicks.com/analyzer/"}},{{"@type":"ListItem","position":3,"name":"{label}","item":"https://propellerpicks.com/analyzer/?sport={sport}"}},{{"@type":"ListItem","position":4,"name":"{player}","item":"https://propellerpicks.com/analyzer/{sport}/{slug}/"}}]}}
</script>
</body></html>
"""


def page(sport: str, label: str, player: str, slug: str) -> str:
    return PAGE.format(sport=sport, label=label, player=player, slug=slug)


class NormalizeSportHubLinksTests(unittest.TestCase):
    def test_rewrites_visible_breadcrumb(self) -> None:
        source = page("nba", "NBA", "Aaron Gordon", "aaron-gordon")
        normalized = normalize(source, "nba", HUBS)

        self.assertIn('<a href="/analyzer/nba/">NBA</a>', normalized)
        self.assertNotIn('<a href="/analyzer/?sport=nba">NBA</a>', normalized)

    def test_rewrites_breadcrumb_json_ld(self) -> None:
        source = page("nfl", "NFL", "Josh Allen", "josh-allen")
        normalized = normalize(source, "nfl", HUBS)

        self.assertIn(
            '"item":"https://propellerpicks.com/analyzer/nfl/"',
            normalized,
        )
        self.assertNotIn(
            '"item":"https://propellerpicks.com/analyzer/?sport=nfl"',
            normalized,
        )
        self.assertIn(
            '"item":"https://propellerpicks.com/analyzer/nfl/josh-allen/"',
            normalized,
        )

    def test_leaves_non_breadcrumb_sport_link_alone(self) -> None:
        source = page("nba", "NBA", "Aaron Gordon", "aaron-gordon")
        normalized = normalize(source, "nba", HUBS)

        self.assertIn(
            '<a href="/analyzer/?sport=nba" style="color:#FDBA74">'
            "Check the live NBA board</a>",
            normalized,
        )

    def test_leaves_sport_without_hub_alone(self) -> None:
        source = page("mlb", "MLB", "Aaron Judge", "aaron-judge")

        self.assertEqual(normalize(source, "mlb", HUBS), source)

    def test_normalization_is_idempotent(self) -> None:
        source = page("nba", "NBA", "Aaron Gordon", "aaron-gordon")
        normalized = normalize(source, "nba", HUBS)

        self.assertEqual(normalize(normalized, "nba", HUBS), normalized)

    def test_discovers_only_sports_with_a_hub(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            (root / "analyzer" / "nba").mkdir(parents=True)
            (root / "analyzer" / "nba" / "index.html").write_text("hub", encoding="utf-8")
            (root / "analyzer" / "mlb").mkdir(parents=True)

            self.assertEqual(hub_sports(root), ["nba"])

    def test_check_mode_exits_non_zero_until_page_is_normalized(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            nba_page = root / "analyzer" / "nba" / "aaron-gordon" / "index.html"
            nba_page.parent.mkdir(parents=True)
            nba_page.write_text(
                page("nba", "NBA", "Aaron Gordon", "aaron-gordon"),
                encoding="utf-8",
            )
            (root / "analyzer" / "nba" / "index.html").write_text("hub", encoding="utf-8")
            mlb_page = root / "analyzer" / "mlb" / "aaron-judge" / "index.html"
            mlb_page.parent.mkdir(parents=True)
            mlb_page.write_text(
                page("mlb", "MLB", "Aaron Judge", "aaron-judge"),
                encoding="utf-8",
            )
            mlb_source = mlb_page.read_text(encoding="utf-8")

            with contextlib.redirect_stdout(io.StringIO()) as output:
                self.assertEqual(main(["--check"], root=root), 1)
            self.assertIn("sport_hub_links_checked=2 changed=1", output.getvalue())

            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(main([], root=root), 0)
            self.assertIn('<a href="/analyzer/nba/">NBA</a>', nba_page.read_text(encoding="utf-8"))
            self.assertEqual(mlb_page.read_text(encoding="utf-8"), mlb_source)

            with contextlib.redirect_stdout(io.StringIO()) as output:
                self.assertEqual(main(["--check"], root=root), 0)
            self.assertIn("changed=0", output.getvalue())


if __name__ == "__main__":
    unittest.main()
