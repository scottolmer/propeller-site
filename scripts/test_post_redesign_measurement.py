from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import pathlib
import tempfile
import unittest
from datetime import date


ROOT = pathlib.Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "post_redesign_measurement", ROOT / "scripts" / "generate_post_redesign_measurement.py"
)
assert SPEC and SPEC.loader
MEASUREMENT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MEASUREMENT)


class MockCollector:
    def __init__(self) -> None:
        self.calls: list[tuple[date, date]] = []

    def collect(self, start: date, end: date) -> dict[str, object]:
        self.calls.append((start, end))
        post = start >= date(2026, 8, 18)
        return {
            "overview": {
                "sessions": 20 if post else 10, "active_users": 12 if post else 8,
                "engaged_sessions": 10 if post else 4, "engagement_duration_seconds": 120 if post else 40,
            },
            "channels": [{"channel": "Organic Search", "sessions": 10 if post else 5, "engagedSessions": 5 if post else 2, "keyEvents": 1}],
            "devices": [{"device": "mobile", "sessions": 8 if post else 4, "engagedSessions": 4 if post else 2, "keyEvents": 1}],
            "landing_pages": [{"landing_page": "/", "sessions": 9 if post else 3, "engagedSessions": 4 if post else 1, "keyEvents": 1}],
            "events": [
                {"event_name": "signup_click", "eventCount": 4 if post else 2},
                {"event_name": "research_cta_click", "eventCount": 3 if post else 0},
                {"event_name": "sign_up", "eventCount": 0},
                {"event_name": "calculator_completed", "eventCount": 2 if post else 1},
                {"event_name": "analyzer_completed", "eventCount": 3 if post else 0},
            ],
        }


class PostRedesignMeasurementTests(unittest.TestCase):
    def test_no_comparison_is_due_before_the_clean_post_release_window(self) -> None:
        self.assertIsNone(MEASUREMENT.due_phase(date(2026, 8, 26)))
        self.assertEqual(MEASUREMENT.due_phases(date(2026, 8, 26)), [])

    def test_windows_exclude_august_17_and_use_the_approved_baselines(self) -> None:
        seven_day = MEASUREMENT.due_phase(date(2026, 8, 27))
        fourteen_day = MEASUREMENT.due_phase(date(2026, 9, 3))
        assert seven_day and fourteen_day
        self.assertEqual(seven_day["post_start"], date(2026, 8, 18))
        self.assertEqual(seven_day["post_end"], date(2026, 8, 24))
        self.assertEqual(seven_day["baseline_start"], date(2026, 8, 10))
        self.assertEqual(seven_day["baseline_end"], date(2026, 8, 16))
        self.assertEqual(fourteen_day["post_start"], date(2026, 8, 18))
        self.assertEqual(fourteen_day["post_end"], date(2026, 8, 31))
        self.assertEqual(fourteen_day["baseline_start"], date(2026, 8, 3))
        self.assertEqual(fourteen_day["baseline_end"], date(2026, 8, 16))

    def test_fixture_filters_unknown_fields_and_rejects_duplicate_or_nonfinite_values(self) -> None:
        rows = MEASUREMENT.safe_daily_rows({"daily": [{
            "date": "2026-08-18", "sessions": 10, "sign_ups": 2,
            "email": "person@example.com", "service_account_email": "service@example.com",
        }]})
        self.assertEqual(rows, [{"date": "2026-08-18", "sessions": 10, "sign_ups": 2}])
        with self.assertRaises(ValueError):
            MEASUREMENT.safe_daily_rows({"daily": [{"date": "2026-08-18"}, {"date": "2026-08-18"}]})
        with self.assertRaises(ValueError):
            MEASUREMENT.safe_daily_rows({"daily": [{"date": "2026-08-18", "sessions": float("nan")} ]})
        with self.assertRaises(ValueError):
            MEASUREMENT.FixtureCollector({
                "daily": [],
                "ranges": {"2026-08-03..2026-08-16": {"overview": {"email": "person@example.com"}}},
            })

    def test_report_has_private_aggregate_slices_and_descriptive_deltas(self) -> None:
        report = MEASUREMENT.build_report(MockCollector(), date(2026, 9, 3))
        self.assertEqual(MEASUREMENT.OVERVIEW_METRICS["activeUsers"], "active_users")
        self.assertNotIn("totalUsers", MEASUREMENT.OVERVIEW_METRICS)
        self.assertEqual(report["meta"]["status"], "complete")
        self.assertEqual(set(report["phases"]), {"7d", "14d"})
        phase = report["phases"]["7d"]
        self.assertEqual(phase["overview"]["sessions"], {"post": 20, "baseline": 10, "percent_change": 100.0})
        self.assertEqual(phase["overview"]["cta_clicks"], {"post": 7, "baseline": 2, "percent_change": 250.0})
        self.assertEqual(phase["overview"]["sign_ups"], {"post": 0, "baseline": 0, "percent_change": None})
        self.assertEqual(phase["overview"]["calculator_completed"], {"post": 2, "baseline": 1, "percent_change": 100.0})
        self.assertEqual(phase["overview"]["engagement_rate"], {"post": 50.0, "baseline": 40.0, "percent_change": 25.0})
        self.assertEqual(phase["channels"][0]["sessions"]["percent_change"], 100.0)
        self.assertIn("devices", phase)
        self.assertIn("landing_pages", phase)
        self.assertIn("events", phase)
        self.assertIn("does not establish", report["meta"]["interpretation"])
        self.assertNotIn("person@example.com", json.dumps(report))

    def test_unattended_main_uses_collector_and_fixed_private_output(self) -> None:
        collector = MockCollector()
        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "private-output"
            stream = io.StringIO()
            with contextlib.redirect_stdout(stream):
                code = MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--output-dir", str(output)],
                    collector_factory=lambda: collector,
                )
            path = output / MEASUREMENT.DEFAULT_OUTPUT_NAME
            self.assertEqual(code, 0)
            self.assertEqual(stream.getvalue().strip(), str(path.resolve()))
            self.assertTrue(path.exists())
            self.assertTrue(collector.calls)
            first_content = path.read_text(encoding="utf-8")
            self.assertFalse(MEASUREMENT.write_idempotent(path, json.loads(first_content)))

    def test_august_18_unattended_run_writes_baseline_only(self) -> None:
        collector = MockCollector()
        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "private-output"
            with contextlib.redirect_stdout(io.StringIO()):
                code = MEASUREMENT.main(
                    ["--as-of", "2026-08-18", "--output-dir", str(output)],
                    collector_factory=lambda: collector,
                )
            report = json.loads((output / MEASUREMENT.DEFAULT_OUTPUT_NAME).read_text(encoding="utf-8"))
            self.assertEqual(code, 0)
            self.assertEqual(report["phases"], {})
            self.assertEqual(report["baseline"]["overview"]["sign_ups"], 0)
            self.assertEqual(collector.calls, [(date(2026, 8, 3), date(2026, 8, 16))])

    def test_scheduled_runs_are_quiet_between_new_milestones(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "private-output"
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-18", "--output-dir", str(output)],
                    collector_factory=MockCollector,
                ), 0)
            called = False
            def factory() -> MockCollector:
                nonlocal called
                called = True
                return MockCollector()
            stream = io.StringIO()
            with contextlib.redirect_stdout(stream):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-26", "--output-dir", str(output)],
                    collector_factory=factory,
                ), 0)
            self.assertFalse(called)
            self.assertEqual(stream.getvalue(), "")

            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--output-dir", str(output)],
                    collector_factory=MockCollector,
                ), 0)
            called = False
            with contextlib.redirect_stdout(stream := io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-09-02", "--output-dir", str(output)],
                    collector_factory=factory,
                ), 0)
            self.assertFalse(called)
            self.assertEqual(stream.getvalue(), "")

    def test_malformed_existing_report_is_not_treated_as_complete(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = pathlib.Path(temp_dir) / MEASUREMENT.DEFAULT_OUTPUT_NAME
            path.write_text('{"meta":"invalid"}', encoding="utf-8")
            self.assertEqual(MEASUREMENT.completed_milestones(path), set())

    def test_unattended_failure_writes_sanitized_blocked_artifact(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "private-output"
            with contextlib.redirect_stdout(io.StringIO()):
                code = MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--output-dir", str(output)],
                    collector_factory=lambda: (_ for _ in ()).throw(RuntimeError("secret@example.com /tmp/key.json")),
                )
            payload = json.loads((output / "post-redesign-measurement-blocked.json").read_text(encoding="utf-8"))
            self.assertEqual(code, 1)
            self.assertEqual(payload["meta"]["status"], "blocked")
            self.assertEqual(payload["blocker"], "ga4_query_failed")
            self.assertNotIn("secret@example.com", json.dumps(payload))

    def test_later_failure_preserves_the_last_complete_report(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "private-output"
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-18", "--output-dir", str(output)], collector_factory=MockCollector,
                ), 0)
            complete_path = output / MEASUREMENT.DEFAULT_OUTPUT_NAME
            complete = complete_path.read_text(encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--output-dir", str(output)],
                    collector_factory=lambda: (_ for _ in ()).throw(RuntimeError("authentication failure")),
                ), 1)
            self.assertEqual(complete_path.read_text(encoding="utf-8"), complete)
            self.assertTrue((output / "post-redesign-measurement-blocked.json").exists())

    def test_repeat_failure_for_the_same_milestone_is_quiet(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "private-output"
            failing = lambda: (_ for _ in ()).throw(RuntimeError("authentication failure"))
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--output-dir", str(output)], collector_factory=failing,
                ), 1)
            stream = io.StringIO()
            with contextlib.redirect_stdout(stream):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-28", "--output-dir", str(output)], collector_factory=failing,
                ), 0)
            self.assertEqual(stream.getvalue(), "")

    def test_fixture_injection_remains_available_without_calling_ga4(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            directory = pathlib.Path(temp_dir)
            fixture = directory / "fixture.json"
            fixture.write_text(json.dumps({"daily": [
                {"date": "2026-08-10", "sessions": 5},
                {"date": "2026-08-18", "sessions": 10},
            ]}), encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                code = MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--input", str(fixture), "--output-dir", str(directory / "out")],
                    collector_factory=lambda: (_ for _ in ()).throw(AssertionError("GA4 must not be called for a fixture")),
                )
            report = json.loads((directory / "out" / MEASUREMENT.DEFAULT_OUTPUT_NAME).read_text(encoding="utf-8"))
            self.assertEqual(code, 0)
            self.assertEqual(report["meta"]["data_source"], "fixture")
            self.assertEqual(report["phases"]["7d"]["overview"]["sessions"]["post"], 10)

    def test_fixture_report_does_not_suppress_the_next_live_ga4_run(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            directory = pathlib.Path(temp_dir)
            output = directory / "out"
            fixture = directory / "fixture.json"
            fixture.write_text(json.dumps({"daily": [
                {"date": "2026-08-10", "sessions": 5},
                {"date": "2026-08-18", "sessions": 10},
            ]}), encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--input", str(fixture), "--output-dir", str(output)],
                ), 0)

            collector = MockCollector()
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(MEASUREMENT.main(
                    ["--as-of", "2026-08-27", "--output-dir", str(output)],
                    collector_factory=lambda: collector,
                ), 0)
            report = json.loads((output / MEASUREMENT.DEFAULT_OUTPUT_NAME).read_text(encoding="utf-8"))
            self.assertTrue(collector.calls)
            self.assertEqual(report["meta"]["data_source"], "ga4")

    def test_not_due_is_quiet_and_does_not_create_a_collector(self) -> None:
        called = False
        def factory() -> MockCollector:
            nonlocal called
            called = True
            return MockCollector()
        stream = io.StringIO()
        with contextlib.redirect_stdout(stream):
            code = MEASUREMENT.main(["--as-of", "2026-08-17"], collector_factory=factory)
        self.assertEqual(code, 0)
        self.assertFalse(called)
        self.assertEqual(stream.getvalue(), "")

    def test_output_must_resolve_outside_the_repo(self) -> None:
        with self.assertRaises(ValueError):
            MEASUREMENT.resolve_output_path(ROOT / "private-analytics")


if __name__ == "__main__":
    unittest.main()
