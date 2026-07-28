#!/usr/bin/env python3
"""Regression checks for the recurring AEO measurement contract."""

from __future__ import annotations

import csv
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "docs" / "seo" / "aeo-target-questions.json"
AUGUST_TARGETS = ROOT / "docs" / "seo" / "aeo-target-questions-2026-08.json"


def load_importer():
    spec = importlib.util.spec_from_file_location(
        "import_aeo_observations",
        ROOT / "scripts" / "import_aeo_observations.py",
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def generate_matrix(path: Path, targets: Path = TARGETS) -> list[dict[str, str]]:
    subprocess.run(
        [
            "python3",
            str(ROOT / "scripts" / "create_aeo_baseline.py"),
            "--date",
            "2026-07-16",
            "--targets",
            str(targets),
            "--output",
            str(path),
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_rows(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def complete_rows(rows: list[dict[str, str]]) -> None:
    for row in rows:
        row.update({
            "checked_at": "2026-07-16T15:00:00+00:00",
            "status": "completed",
            "answer_surface": "present",
            "propeller_mentioned": "no",
            "propeller_cited": "no",
            "answer_accurate": "not_applicable",
            "accuracy_notes": "No Propeller-specific claim to grade.",
            "answer_summary": "The engine returned a substantive answer without mentioning Propeller.",
            "evidence_url": "https://example.com/evidence",
            "reviewer": "Test Runner",
        })


class AeoMeasurementTests(unittest.TestCase):
    def test_platforms_are_sources_not_competitors(self) -> None:
        importer = load_importer()
        self.assertEqual("official_platform", importer.source_type_for("prizepicks.com"))
        self.assertEqual("official_platform", importer.source_type_for("pick6.draftkings.com"))
        self.assertNotIn("prizepicks.com", importer.COMPETITOR_DOMAINS)
        self.assertEqual("PropsBot", importer.COMPETITOR_DOMAINS["propsbot.ai"])
        self.assertEqual("propeller_owned", importer.source_type_for("help.propellerpicks.com"))
        self.assertEqual("publisher_editorial", importer.source_type_for("evilpropellerpicks.com"))
        self.assertEqual("official_platform", importer.source_type_for("support.prizepicks.com"))

    def test_frozen_contract_has_20_unique_questions_and_five_platforms(self) -> None:
        config = json.loads(TARGETS.read_text(encoding="utf-8"))
        archived = json.loads((ROOT / "docs" / "seo" / "aeo-contracts" / f"{config['contract_version']}.json").read_text(encoding="utf-8"))
        targets = config["target_questions"]
        self.assertEqual(20, len(targets))
        self.assertEqual(20, len({target["id"] for target in targets}))
        self.assertEqual(20, len({target["question"] for target in targets}))
        self.assertEqual(3, config["measurement_instructions"]["runs_per_prompt"])
        self.assertEqual(
            {"ChatGPT Search", "Perplexity", "Google AI Overviews", "Gemini", "Copilot"},
            set(config["measurement_instructions"]["platforms"]),
        )
        self.assertEqual(
            set(config["measurement_instructions"]["platforms"]),
            set(config["measurement_instructions"]["platform_modes"]),
        )
        self.assertEqual(config, archived)

    def test_generator_produces_unique_300_row_matrix_that_validates(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            matrix = Path(directory) / "snapshot.csv"
            rows = generate_matrix(matrix)
            self.assertEqual(300, len(rows))
            self.assertEqual(300, len({row["observation_id"] for row in rows}))
            incomplete = subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix)],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(0, incomplete.returncode)
            self.assertIn("snapshot is incomplete: 300 observations", incomplete.stderr)

            draft = Path(directory) / "draft.md"
            subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix), "--draft", "--output", str(draft)],
                check=True,
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertIn("DRAFT — NON-COMPARABLE", draft.read_text(encoding="utf-8"))

    def test_versioned_august_targets_materialize_a_valid_draft_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            matrix = Path(directory) / "august.csv"
            rows = generate_matrix(matrix, AUGUST_TARGETS)
            self.assertEqual(300, len(rows))
            self.assertEqual({"2026-08-nfl-v1"}, {row["contract_version"] for row in rows})

            draft = Path(directory) / "august-draft.md"
            subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix), "--draft", "--output", str(draft)],
                check=True,
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertIn("Contract: `2026-08-nfl-v1`", draft.read_text(encoding="utf-8"))

    def test_complete_matrix_passes_and_embeds_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            matrix = Path(directory) / "snapshot.csv"
            rows = generate_matrix(matrix)
            complete_rows(rows)
            write_rows(matrix, rows)
            result = subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix)],
                check=True,
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertIn("rows=300", result.stdout)
            self.assertEqual({"2026-07-v1"}, {row["contract_version"] for row in rows})
            self.assertEqual(1, len({row["contract_hash"] for row in rows}))
            self.assertTrue(rows[0]["contract_hash"].startswith("sha256:"))

    def test_completed_rows_reject_contract_drift_and_missing_provenance(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            matrix = Path(directory) / "snapshot.csv"
            rows = generate_matrix(matrix)
            complete_rows(rows)
            rows[0]["prompt"] = "A different question"
            rows[1]["checked_at"] = ""
            rows[2]["evidence_url"] = "not-a-url"
            write_rows(matrix, rows)
            result = subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix)],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(0, result.returncode)
            self.assertIn("prompt does not match the frozen contract", result.stderr)
            self.assertIn("completed row needs checked_at", result.stderr)
            self.assertIn("evidence_url must be an absolute HTTP(S) URL", result.stderr)

    def test_missing_contract_column_fails_cleanly(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            matrix = Path(directory) / "snapshot.csv"
            rows = generate_matrix(matrix)
            for row in rows:
                del row["contract_hash"]
            write_rows(matrix, rows)
            result = subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix), "--draft"],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(0, result.returncode)
            self.assertIn("matrix is missing required fields", result.stderr)

    def test_citation_and_absent_surface_consistency(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            matrix = Path(directory) / "snapshot.csv"
            rows = generate_matrix(matrix)
            complete_rows(rows)
            rows[0].update({
                "propeller_mentioned": "no",
                "propeller_cited": "yes",
                "propeller_url_cited": "https://example.com/fake",
                "cited_domains": "example.com",
                "source_types": "publisher_editorial",
            })
            rows[1].update({
                "answer_surface": "absent",
                "propeller_mentioned": "yes",
                "answer_accurate": "accurate",
            })
            rows[2].update({
                "propeller_mentioned": "yes",
                "propeller_cited": "yes",
                "propeller_url_cited": "propellerpicks.com/path",
                "cited_domains": "propellerpicks.com",
                "source_types": "propeller_owned",
                "answer_accurate": "unverifiable",
            })
            write_rows(matrix, rows)
            result = subprocess.run(
                ["python3", str(ROOT / "scripts" / "summarize_aeo_snapshot.py"), str(matrix)],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(0, result.returncode)
            self.assertIn("propeller_url_cited must be an exact Propeller URL", result.stderr)
            self.assertIn("cited=yes needs propellerpicks.com in cited_domains", result.stderr)
            self.assertIn("absent answer surface requires propeller_mentioned=no", result.stderr)

    def test_accuracy_grading_is_conservative(self) -> None:
        importer = load_importer()
        self.assertEqual("not_applicable", importer.grade_accuracy("No brand claim.", False)[0])
        self.assertEqual("unverifiable", importer.grade_accuracy("Propeller Picks is worth considering.", True)[0])
        self.assertEqual("accurate", importer.grade_accuracy("Propeller Picks is a player-prop research tool.", True)[0])
        self.assertEqual("inaccurate", importer.grade_accuracy("Propeller Picks is a sportsbook.", True)[0])
        self.assertNotEqual("inaccurate", importer.grade_accuracy("Propeller's payout calculator estimates entry win probability.", True)[0])
        self.assertEqual("inaccurate", importer.grade_accuracy("Propeller's confidence score is a calibrated win probability.", True)[0])


if __name__ == "__main__":
    unittest.main()
