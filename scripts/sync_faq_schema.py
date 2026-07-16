#!/usr/bin/env python3
"""Copy visible FAQ questions and answers into matching FAQPage JSON-LD."""

from __future__ import annotations

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "analytics-dashboard", "mockups"}
SCRIPT_RE = re.compile(
    r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
    re.I | re.S,
)


def classes(attrs: list[tuple[str, str | None]]) -> set[str]:
    return set(dict(attrs).get("class", "").split())


def normalize(value: object) -> str:
    return " ".join(str(value or "").split())


class FAQParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.item_depth: int | None = None
        self.question_depth: int | None = None
        self.answer_depth: int | None = None
        self.ignored_depth: int | None = None
        self.question: list[str] = []
        self.answer: list[str] = []
        self.items: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.depth += 1
        if dict(attrs).get("aria-hidden") == "true" and self.ignored_depth is None:
            self.ignored_depth = self.depth
        css = classes(attrs)
        if css.intersection({"faq-item", "home-faq__item", "faq-card"}) and self.item_depth is None:
            self.item_depth = self.depth
            self.question, self.answer = [], []
            return
        if self.item_depth is None:
            return
        if self.question_depth is None and not self.question and (
            tag in {"h3", "summary"} or "faq-question" in css or "faq-question-text" in css or "faq-q" in css
        ):
            self.question_depth = self.depth
        elif self.answer_depth is None and not self.answer and (
            "faq-answer" in css or "faq-answer-inner" in css or "faq-a" in css or tag == "p"
        ):
            self.answer_depth = self.depth

    def handle_endtag(self, tag: str) -> None:
        if self.ignored_depth == self.depth:
            self.ignored_depth = None
        if self.question_depth == self.depth:
            self.question_depth = None
        if self.answer_depth == self.depth:
            self.answer_depth = None
        if self.item_depth == self.depth:
            question, answer = normalize(" ".join(self.question)), normalize(" ".join(self.answer))
            if question and answer:
                self.items.append((question, answer))
            self.item_depth = None
        self.depth = max(0, self.depth - 1)

    def handle_data(self, data: str) -> None:
        if self.ignored_depth is not None:
            return
        if self.question_depth is not None:
            self.question.append(data)
        if self.answer_depth is not None:
            self.answer.append(data)


def faq_nodes(value: object):
    if isinstance(value, dict):
        types = value.get("@type")
        if types == "FAQPage" or isinstance(types, list) and "FAQPage" in types:
            yield value
        for child in value.values():
            yield from faq_nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from faq_nodes(child)


def sync(source: str, path: Path) -> tuple[str, int]:
    parser = FAQParser()
    parser.feed(source)
    visible = parser.items
    changed = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal changed
        try:
            document = json.loads(match.group(2))
        except json.JSONDecodeError:
            return match.group(0)
        nodes = list(faq_nodes(document))
        if not nodes:
            return match.group(0)
        schema_questions = [question for node in nodes for question in node.get("mainEntity", [])]
        if len(schema_questions) != len(visible):
            raise ValueError(
                f"{path.relative_to(ROOT)} has {len(visible)} visible FAQ items but {len(schema_questions)} schema entries"
            )
        for schema_question, (question, answer) in zip(schema_questions, visible):
            accepted = schema_question.setdefault("acceptedAnswer", {"@type": "Answer"})
            if schema_question.get("name") != question or accepted.get("text") != answer:
                schema_question["name"] = question
                accepted["text"] = answer
                changed += 1
        if not changed:
            return match.group(0)
        return match.group(1) + "\n" + json.dumps(document, indent=2, ensure_ascii=False) + "\n" + match.group(3)

    return SCRIPT_RE.sub(replace, source), changed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    pages = entries = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in EXCLUDED for part in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding="utf-8")
        if "FAQPage" not in source or "faq-item" not in source:
            continue
        updated, count = sync(source, path)
        if count:
            pages += 1
            entries += count
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"changed_pages={pages} changed_entries={entries}")
    if args.check and pages:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
