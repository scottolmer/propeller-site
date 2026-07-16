#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from sync_faq_schema import FAQParser


class FAQParserTests(unittest.TestCase):
    def parse(self, source: str) -> list[tuple[str, str]]:
        parser = FAQParser()
        parser.feed(source)
        return parser.items

    def test_paragraph_question_is_not_captured_as_answer(self):
        source = '<div class="faq-item"><p class="faq-q">Question?</p><p class="faq-a">Exact answer.</p></div>'
        self.assertEqual(self.parse(source), [("Question?", "Exact answer.")])

    def test_question_answer_duplication_is_visible_to_contract(self):
        source = '<div class="faq-item"><p class="faq-q">Question?</p><p class="faq-a">Question?</p></div>'
        self.assertEqual(self.parse(source), [("Question?", "Question?")])
        self.assertEqual(self.parse(source)[0][0], self.parse(source)[0][1])


if __name__ == "__main__":
    unittest.main()
