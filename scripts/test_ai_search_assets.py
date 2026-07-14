#!/usr/bin/env python3
from __future__ import annotations

import copy
import datetime as dt
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import update_prospective_record as ledger
import refresh_player_cards as cards


class ProspectiveLedgerTests(unittest.TestCase):
    def pick(self, **overrides):
        value = {"player_name": "Test Player", "stat_type": "hits", "line": 1.5, "final_direction": "OVER", "final_score": 22.5, "confidence": 77}
        value.update(overrides)
        return value

    def test_publication_id_is_deterministic(self):
        one = ledger.normalize_pick("mlb", "2026-07-14", "2026-07-14T12:00:00Z", "2026-07-14T12:01:00Z", self.pick())
        two = ledger.normalize_pick("mlb", "2026-07-14", "later", "later", self.pick())
        self.assertEqual(one["publication_id"], two["publication_id"])

    def test_invalid_direction_is_skipped(self):
        self.assertIsNone(ledger.normalize_pick("mlb", "2026-07-14", "now", "now", self.pick(final_direction="LEAN")))

    def test_merge_is_idempotent_and_preserves_original_times(self):
        original = ledger.normalize_pick("mlb", "2026-07-14", "published-1", "captured-1", self.pick())
        repeat = ledger.normalize_pick("mlb", "2026-07-14", "published-2", "captured-2", self.pick())
        merged, added = ledger.merge([copy.deepcopy(original)], [repeat])
        self.assertEqual(added, 0)
        self.assertEqual(merged[0]["captured_at"], "captured-1")

    def test_collision_detects_immutable_change(self):
        original = ledger.normalize_pick("mlb", "2026-07-14", "now", "now", self.pick())
        collision = copy.deepcopy(original)
        collision["player_name"] = "Changed"
        with self.assertRaises(ValueError):
            ledger.merge([original], [collision])

    def test_unambiguous_result_settles_once(self):
        record = ledger.normalize_pick("mlb", "2026-07-14", "now", "now", self.pick())
        result = {"sport":"mlb","game_date":"2026-07-14","player_name":"Test Player","stat_type":"hits","line":1.5,"predicted_direction":"OVER","result":"win","actual_value":2,"result_id":"r1"}
        self.assertEqual(ledger.settle([record], [result], "settled"), 1)
        self.assertEqual(record["status"], "win")
        self.assertEqual(ledger.settle([record], [result], "later"), 0)

    def test_conflicting_results_remain_open(self):
        record = ledger.normalize_pick("mlb", "2026-07-14", "now", "now", self.pick())
        base = {"sport":"mlb","game_date":"2026-07-14","player_name":"Test Player","stat_type":"hits","line":1.5,"predicted_direction":"OVER","actual_value":2}
        self.assertEqual(ledger.settle([record], [{**base,"result":"win"},{**base,"result":"loss"}], "settled"), 0)

    def test_already_resulted_identity_is_not_newly_published(self):
        record = ledger.normalize_pick("mlb", "2026-07-14", "now", "now", self.pick())
        result = {"sport":"mlb","game_date":"2026-07-14","player_name":"Test Player","stat_type":"hits","line":1.5,"predicted_direction":"OVER","result":"win"}
        kept, skipped = ledger.exclude_already_resulted([record], [result])
        self.assertEqual(kept, [])
        self.assertEqual(skipped, 1)

    def test_lookback_reaches_oldest_open_row(self):
        records = [{"status":"open", "game_date":"2026-01-01"}, {"status":"win", "game_date":"2020-01-01"}]
        self.assertEqual(ledger.unresolved_lookback(records, "2026-07-14"), 201)


class PlayerCardTests(unittest.TestCase):
    def test_slugify_handles_punctuation(self):
        self.assertEqual(cards.slugify("José Altuve Jr."), "jose-altuve-jr")

    def test_empty_card_is_explicitly_not_current(self):
        block = cards.empty_block("mlb", "2026-07-14")
        self.assertIn('data-current-props="false"', block)
        self.assertIn("not presenting an old line as today's market", block)

    def test_empty_card_does_not_churn_with_calendar_date(self):
        self.assertEqual(cards.empty_block("mlb", "2026-07-14"), cards.empty_block("mlb", "2026-07-15"))

    def test_current_card_has_slate_and_confidence_limit(self):
        block = cards.current_block("mlb", "2026-07-14", "now", [self.pick_row()])
        self.assertIn('data-current-props="true"', block)
        self.assertIn('data-slate-date="2026-07-14"', block)
        self.assertIn("not a guaranteed outcome", block)

    def test_current_payload_rejects_wrong_date(self):
        payload = {"game_date":"2026-07-13","generated_at":"2026-07-13T15:00:00Z","source":"propeller-public-picks-preview","props":[]}
        valid, reason = cards.validate_payload(payload, "2026-07-14")
        self.assertFalse(valid)
        self.assertIn("date", reason)

    def test_current_payload_accepts_public_feed_for_slate(self):
        payload = {"game_date":"2026-07-14","generated_at":"2026-07-14T15:00:00Z","source":"propeller-public-picks-preview","props":[]}
        now = dt.datetime(2026, 7, 14, 16, 0, tzinfo=dt.timezone.utc)
        self.assertEqual(cards.validate_payload(payload, "2026-07-14", now), (True, ""))

    def test_current_payload_rejects_future_eastern_date(self):
        payload = {"game_date":"2026-07-14","generated_at":"2026-07-15T23:59:00Z","source":"propeller-public-picks-preview","props":[]}
        now = dt.datetime(2026, 7, 14, 16, 0, tzinfo=dt.timezone.utc)
        valid, reason = cards.validate_payload(payload, "2026-07-14", now)
        self.assertFalse(valid)
        self.assertTrue("Eastern slate" in reason or "future" in reason)

    def test_current_payload_rejects_stale_timestamp(self):
        payload = {"game_date":"2026-07-14","generated_at":"2026-07-13T05:00:00Z","source":"propeller-public-picks-preview","props":[]}
        now = dt.datetime(2026, 7, 14, 16, 0, tzinfo=dt.timezone.utc)
        valid, reason = cards.validate_payload(payload, "2026-07-14", now)
        self.assertFalse(valid)
        self.assertTrue("Eastern slate" in reason or "too old" in reason)

    def test_replace_legacy_block(self):
        source = "before<!-- TODAY_PROPS_START -->stale<!-- TODAY_PROPS_END -->after"
        self.assertEqual(cards.replace_block(source, "CURRENT"), "beforeCURRENTafter")

    @staticmethod
    def pick_row():
        return {"stat_type":"hits","line":1.5,"final_direction":"OVER","confidence":77}


if __name__ == "__main__":
    unittest.main()
