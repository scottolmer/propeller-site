#!/usr/bin/env python3
"""Generate answer-first sport analyzer modules on existing canonical pages."""

from __future__ import annotations

import argparse
import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "sport-answer-modules.json"
HEAD_START = "<!-- PP_SPORT_ANSWER_HEAD_START -->"
HEAD_END = "<!-- PP_SPORT_ANSWER_HEAD_END -->"
BODY_START = "<!-- PP_SPORT_ANSWER_START -->"
BODY_END = "<!-- PP_SPORT_ANSWER_END -->"
HEAD_BLOCK = (
    f'{HEAD_START}\n'
    '<link rel="stylesheet" href="/assets/css/sport-answer-modules.css?v=20260716">\n'
    f'{HEAD_END}'
)


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def replace_managed(source: str, start: str, end: str, content: str) -> str:
    if start not in source or end not in source:
        raise ValueError(f"managed markers missing: {start} / {end}")
    before, rest = source.split(start, 1)
    _, after = rest.split(end, 1)
    return f"{before}{content}{after}"


def render_module(page: dict[str, object]) -> str:
    cards = "\n".join(
        f'''      <article class="pp-sport-answer__card">
        <span class="pp-sport-answer__index">{index:02d}</span>
        <h3>{esc(card["title"])}</h3>
        <p>{esc(card["body"])}</p>
      </article>'''
        for index, card in enumerate(page["cards"], 1)
    )
    sport = esc(page["sport"])
    return f'''{BODY_START}
<section class="pp-sport-answer pp-sport-answer--{esc(page["slug"])}" id="sport-analyzer-answer" aria-labelledby="sport-analyzer-answer-heading">
  <div class="container pp-sport-answer__inner">
    <p class="pp-sport-answer__eyebrow">{esc(page["eyebrow"])}</p>
    <h2 class="pp-sport-answer__heading" id="sport-analyzer-answer-heading">{esc(page["heading"])}</h2>
    <p class="pp-sport-answer__direct">{esc(page["direct_answer"])}</p>
    <div class="pp-sport-answer__grid">
{cards}
    </div>
    <p class="pp-sport-answer__availability"><strong>Availability note</strong><span>{esc(page["availability_note"])}</span></p>
    <div class="pp-sport-answer__actions">
      <a class="pp-sport-answer__cta" href="/analyzer/">{esc(page["cta_label"])} <span aria-hidden="true">&rarr;</span></a>
      <span class="pp-sport-answer__links"><a href="/how-it-works/">Read the method</a><a href="/results/">Inspect public results</a></span>
    </div>
    <p class="pp-sport-answer__disclosure">Propeller is an independent AI-assisted player-prop research workspace designed for DFS and pick'em platforms. It does not accept wagers, place entries, or guarantee outcomes.</p>
  </div>
</section>
{BODY_END}'''


def update_page(page: dict[str, object], *, write: bool = True) -> tuple[Path, bool]:
    path = ROOT / str(page["canonical_target"]).strip("/") / "index.html"
    source = path.read_text(encoding="utf-8")

    if HEAD_START in source or HEAD_END in source:
        if source.count(HEAD_START) != 1 or source.count(HEAD_END) != 1:
            raise ValueError(f"invalid head marker count: {path}")
        output = replace_managed(source, HEAD_START, HEAD_END, HEAD_BLOCK)
    else:
        anchor = "<!-- PP_SITE_HEAD_END -->"
        if anchor not in source:
            raise ValueError(f"site head anchor missing: {path}")
        output = source.replace(anchor, f"{anchor}\n{HEAD_BLOCK}", 1)

    module = render_module(page)
    if BODY_START in output or BODY_END in output:
        if output.count(BODY_START) != 1 or output.count(BODY_END) != 1:
            raise ValueError(f"invalid body marker count: {path}")
        output = replace_managed(output, BODY_START, BODY_END, module)
    else:
        anchor = str(page["insertion_anchor"])
        if anchor not in output:
            raise ValueError(f"insertion anchor missing in {path}: {anchor}")
        output = output.replace(anchor, f"{module}\n\n{anchor}", 1)

    changed = output != source
    if changed and write:
        path.write_text(output, encoding="utf-8")
    return path, changed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if generation would change files")
    args = parser.parse_args()
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    pages = payload.get("pages", [])
    if not pages:
        raise ValueError("sport answer module data has no pages")

    changed_paths: list[Path] = []
    for page in pages:
        path, changed = update_page(page, write=not args.check)
        print(f"{'changed' if changed else 'current'} {path.relative_to(ROOT)}")
        if changed:
            changed_paths.append(path)

    if args.check and changed_paths:
        print("sport answer modules are out of date")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
