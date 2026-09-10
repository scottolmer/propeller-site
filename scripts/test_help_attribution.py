#!/usr/bin/env python3
"""Behavioral tests for truthful help-page attribution."""

from __future__ import annotations

import copy
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import generate_help_pages as help_pages


def webpage_schema(source: str) -> dict:
    for block in re.findall(
        r'<script type="application/ld\+json">\s*(.*?)\s*</script>', source, flags=re.S
    ):
        payload = json.loads(block)
        if payload.get("@type") == "WebPage":
            return payload
    raise AssertionError("WebPage JSON-LD was not rendered")


class HelpAttributionTests(unittest.TestCase):
    def test_designated_author_is_visible_and_matches_meta_and_schema(self) -> None:
        page = copy.deepcopy(help_pages.PAGES[0])
        source = help_pages.render_page(page)
        schema = webpage_schema(source)
        self.assertEqual(schema["author"], page["attribution"]["author"])
        self.assertIn('<meta name="author" content="Scott Olmer">', source)
        self.assertIn("By <a href=\"https://propellerpicks.com/about/\">Scott Olmer</a>, designated author", source)
        self.assertIn("Produced and reviewed through automated AI workflows.", source)
        self.assertIn('<a href="/editorial-policy/">Editorial policy</a>.', source)
        self.assertNotIn("reviewedBy", schema)

    def test_person_author_requires_a_recorded_authorized_byline(self) -> None:
        attribution = help_pages.designated_author_attribution()
        attribution.pop("authorized_byline")
        with self.assertRaisesRegex(ValueError, "authorized_byline"):
            help_pages.validate_attribution(attribution)

    def test_unauthorized_person_author_fails_even_with_another_persons_byline_record(self) -> None:
        attribution = help_pages.designated_author_attribution()
        attribution["author"] = {
            "@type": "Person", "name": "Jordan Example", "url": "https://example.com/jordan"
        }
        with self.assertRaisesRegex(ValueError, "must match the person author"):
            help_pages.validate_attribution(attribution)

    def test_organization_fallback_is_allowed_for_an_unconfigured_page(self) -> None:
        attribution = help_pages.designated_author_attribution()
        attribution["author"] = attribution["publisher"].copy()
        attribution.pop("authorized_byline")
        help_pages.validate_attribution(attribution)

    def test_contributor_requires_real_role_and_contribution_proof(self) -> None:
        attribution = help_pages.designated_author_attribution()
        attribution["contributors"] = [{
            "@type": "Person",
            "name": "Jordan Example",
            "url": "https://example.com/jordan",
            "role": "Product walkthrough contributor",
        }]
        with self.assertRaisesRegex(ValueError, "contribution_proof"):
            help_pages.validate_attribution(attribution)

    def test_contributor_only_credit_does_not_change_the_designated_author(self) -> None:
        page = copy.deepcopy(help_pages.PAGES[0])
        page["attribution"]["contributors"] = [{
            "@type": "Person",
            "name": "Jordan Example",
            "url": "https://example.com/jordan",
            "role": "Product walkthrough contributor",
            "contribution_proof": "EV-2026-09-10-product-walkthrough",
        }]
        source = help_pages.render_page(page)
        schema = webpage_schema(source)
        self.assertEqual(schema["author"]["name"], "Scott Olmer")
        self.assertEqual(schema["contributor"][0]["name"], "Jordan Example")
        self.assertNotIn("contribution_proof", json.dumps(schema))
        self.assertIn("Contributor: <a href=\"https://example.com/jordan\">Jordan Example</a>", source)

    def test_review_credit_requires_review_proof_and_is_visible_when_present(self) -> None:
        attribution = help_pages.designated_author_attribution()
        attribution["reviewer"] = {
            "@type": "Person", "name": "Jordan Example", "url": "https://example.com/jordan"
        }
        with self.assertRaisesRegex(ValueError, "review_proof"):
            help_pages.validate_attribution(attribution)

        page = copy.deepcopy(help_pages.PAGES[0])
        page["attribution"]["reviewer"] = {
            "@type": "Person",
            "name": "Jordan Example",
            "url": "https://example.com/jordan",
            "review_proof": "RV-2026-09-10-editorial-review",
        }
        source = help_pages.render_page(page)
        self.assertEqual(webpage_schema(source)["reviewedBy"]["name"], "Jordan Example")
        self.assertIn("Reviewed by <a href=\"https://example.com/jordan\">Jordan Example</a>.", source)

    def test_generated_help_pages_are_current_and_policy_does_not_promise_universal_human_review(self) -> None:
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts/generate_help_pages.py"), "--check"],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        policy = (ROOT / "editorial-policy/index.html").read_text(encoding="utf-8")
        self.assertIn("drafted and reviewed through automated AI workflows", policy)
        self.assertIn("does not claim that Scott personally drafted, reviewed, or observed every article", policy)
        self.assertIn("only when that review occurred and a review record exists", policy)
        self.assertNotIn("a named human reviews factual claims", policy)
        registry = json.loads((ROOT / "data/editorial-attribution.json").read_text(encoding="utf-8"))
        author = registry["authors"][0]
        self.assertTrue(author["byline_authorized"])
        self.assertIn("All Propeller Picks articles", author["authorization"]["scope"])


if __name__ == "__main__":
    unittest.main()
