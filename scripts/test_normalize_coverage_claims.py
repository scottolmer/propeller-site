#!/usr/bin/env python3
"""Regression tests for coverage-claim normalization."""

from __future__ import annotations

import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from normalize_coverage_claims import normalize


class NormalizeCoverageClaimsTests(unittest.TestCase):
    def test_powered_by_agent_copy_is_normalized_in_one_pass(self) -> None:
        source = "Analysis details. Powered by 8 agents. Updated daily."
        expected = (
            "Analysis details. Powered by sport-specific analysis signals. "
            "Updated daily."
        )

        self.assertEqual(normalize(source), expected)

    def test_normalization_is_idempotent(self) -> None:
        source = "Analysis details. Powered by 8 agents. Updated daily."
        normalized = normalize(source)

        self.assertEqual(normalize(normalized), normalized)


if __name__ == "__main__":
    unittest.main()
