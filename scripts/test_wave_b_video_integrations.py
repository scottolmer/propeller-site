#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "wave_b_integrations", ROOT / "scripts/apply_wave_b_video_integrations.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


class WaveBIntegrationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        for relative in (
            "guides/prizepicks-cheat-sheet/index.html",
            "picks/prizepicks/index.html",
        ):
            target = self.root / relative
            target.parent.mkdir(parents=True)
            target.write_text((ROOT / relative).read_text())

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def apply(self) -> None:
        MODULE.apply_integrations(
            self.root,
            cheat_id="AbCdEfG1234",
            walkthrough_id="XyZ9876_-ab",
            cheat_date="2026-08-17",
            walkthrough_date="2026-08-17",
            cheat_duration="PT3M53S",
            walkthrough_duration="PT4M15S",
        )

    def test_applies_real_ids_schema_lazy_embed_and_analytics_placement(self) -> None:
        self.apply()
        cheat = (self.root / "guides/prizepicks-cheat-sheet/index.html").read_text()
        walkthrough = (self.root / "picks/prizepicks/index.html").read_text()
        for text, video_id, placement in (
            (cheat, "AbCdEfG1234", "prizepicks_cheat_sheet_guide_primary"),
            (walkthrough, "XyZ9876_-ab", "prizepicks_research_page_walkthrough_primary"),
        ):
            self.assertIn('"@type":"VideoObject"', text)
            self.assertIn(f'data-video-id="{video_id}"', text)
            self.assertIn(f'data-video-placement="{placement}"', text)
            self.assertIn(f"youtube-nocookie.com", (ROOT / "assets/js/video-embeds.js").read_text())
            self.assertNotIn("data-video-release-pending", text)
        self.assertIn("From cheat sheet to line check", walkthrough)
        self.assertIn("Read the walkthrough transcript", walkthrough)
        self.assertIn("What belongs in a cheat sheet?", walkthrough)

    def test_is_idempotent(self) -> None:
        self.apply()
        before = {p: (self.root / p).read_text() for p in (
            "guides/prizepicks-cheat-sheet/index.html",
            "picks/prizepicks/index.html",
        )}
        self.apply()
        after = {p: (self.root / p).read_text() for p in before}
        self.assertEqual(before, after)

    def test_rejects_placeholders_and_invalid_values(self) -> None:
        for value in ("VIDEO_ID", "__VIDEO_ID__", "too-short", "abcdefghijkl"):
            with self.assertRaises(Exception):
                MODULE.validate_video_id(value)
        with self.assertRaises(Exception):
            MODULE.validate_date("08/17/2026")
        with self.assertRaises(Exception):
            MODULE.validate_duration("3:53")


if __name__ == "__main__":
    unittest.main()
