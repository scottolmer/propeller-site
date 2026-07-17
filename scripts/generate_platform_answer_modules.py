#!/usr/bin/env python3
"""Generate answer-first modules on existing canonical platform pages."""

from __future__ import annotations

import argparse
import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "platform-intent-map.json"
HEAD_START = "<!-- PP_PLATFORM_ANSWER_HEAD_START -->"
HEAD_END = "<!-- PP_PLATFORM_ANSWER_HEAD_END -->"
BODY_START = "<!-- PP_PLATFORM_ANSWER_START -->"
BODY_END = "<!-- PP_PLATFORM_ANSWER_END -->"
HEAD_BLOCK = (
    f'{HEAD_START}\n'
    '<link rel="stylesheet" href="/assets/css/sport-answer-modules.css?v=20260716b">\n'
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


def render_module(platform: dict[str, object]) -> str:
    module = platform["answer_module"]
    compact_class = " pp-platform-answer--compact" if module.get("compact") else ""
    cards = "\n".join(
        f'''      <article class="pp-sport-answer__card">
        <span class="pp-sport-answer__index">{index:02d}</span>
        <h3>{esc(card["title"])}</h3>
        <p>{esc(card["body"])}</p>
      </article>'''
        for index, card in enumerate(module["cards"], 1)
    )
    source = platform["official_source"]
    evidence_links = "".join(
        f'<a href="{esc(item["url"])}">{esc(item["label"])}</a>'
        for item in platform["evidence_links"]
    )
    return f'''{BODY_START}
<section class="pp-sport-answer pp-platform-answer pp-platform-answer--{esc(platform["slug"])}{compact_class}" id="platform-research-answer" aria-labelledby="platform-research-answer-heading">
  <div class="container pp-sport-answer__inner">
    <p class="pp-sport-answer__eyebrow">{esc(module["eyebrow"])}</p>
    <h2 class="pp-sport-answer__heading" id="platform-research-answer-heading">{esc(module["heading"])}</h2>
    <p class="pp-sport-answer__direct">{esc(module["direct_answer"])}</p>
    <div class="pp-sport-answer__grid">
{cards}
    </div>
    <p class="pp-sport-answer__availability"><strong>Freshness</strong><span>{esc(module["availability_note"])}</span></p>
    <p class="pp-sport-answer__availability"><strong>Platform check</strong><span>{esc(module["platform_note"])} Terminology checked <time datetime="{esc(source["checked"])}">July 16, 2026</time> against <a href="{esc(source["url"])}">{esc(source["label"])}</a>.</span></p>
    <div class="pp-sport-answer__evidence" aria-label="Propeller Picks evidence and permanent URL"><strong>Evidence</strong><span>{evidence_links}</span></div>
    <div class="pp-sport-answer__actions">
      <a class="pp-sport-answer__cta" href="#picks">View current research <span aria-hidden="true">&rarr;</span></a>
      <span class="pp-sport-answer__links"><a href="{esc(platform["payout_calculator"])}">Payout calculator</a><a href="{esc(platform["strategy_guide"])}">Strategy guide</a><a href="/analyzer/">Player prop analyzer</a></span>
    </div>
    <p class="pp-sport-answer__disclosure">Propeller Picks is an independent AI-assisted player-prop research workspace designed for DFS and pick'em platforms. It does not accept wagers, place wagers, submit entries, or guarantee outcomes, and it is not affiliated with {esc(platform["name"])}.</p>
  </div>
</section>
{BODY_END}'''


def update_page(platform: dict[str, object], *, write: bool = True) -> tuple[Path, bool]:
    path = ROOT / str(platform["current_research"]).strip("/") / "index.html"
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

    rendered = render_module(platform)
    if BODY_START in output or BODY_END in output:
        if output.count(BODY_START) != 1 or output.count(BODY_END) != 1:
            raise ValueError(f"invalid body marker count: {path}")
        output = replace_managed(output, BODY_START, BODY_END, rendered)
    else:
        anchor = str(platform["insertion_anchor"])
        if anchor not in output:
            raise ValueError(f"insertion anchor missing in {path}: {anchor}")
        output = output.replace(anchor, f"{rendered}\n\n{anchor}", 1)

    changed = output != source
    if changed and write:
        path.write_text(output, encoding="utf-8")
    return path, changed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if generation would change files")
    args = parser.parse_args()
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    platforms = payload.get("platforms", [])
    if len(platforms) != 3:
        raise ValueError("platform intent map must contain exactly three platforms")

    changed_paths: list[Path] = []
    for platform in platforms:
        path, changed = update_page(platform, write=not args.check)
        print(f"{'changed' if changed else 'current'} {path.relative_to(ROOT)}")
        if changed:
            changed_paths.append(path)

    if args.check and changed_paths:
        print("platform answer modules are out of date")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
