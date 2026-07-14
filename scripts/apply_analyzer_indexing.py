#!/usr/bin/env python3
"""Selectively index the highest-value analyzer player pages.

Ranks players per sport by graded-pick volume (parsed from each page's meta
description) and flips robots noindex -> index for the top N per sport,
keeping the long tail noindexed. Writes the chosen URLs to
scripts/analyzer_indexed.txt for the sitemap generator.

Idempotent. Run after the analyzer pipeline regenerates pages (the generator
emits noindex, so this must run after every regeneration), then run
generate_sitemap.py.

Usage: python3 scripts/apply_analyzer_indexing.py [--per-sport 50] [--min-graded 100]
"""
import argparse
import datetime
import pathlib
import re
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPORTS = ["nba", "nfl", "nhl", "mlb", "soccer"]
GRADED_RE = re.compile(r"(?:across|·)\s*([\d,]+)\s+graded\s+(?:analysis\s+rows|picks)", re.I)
CURRENT_RE = re.compile(
    r'<section[^>]+data-current-props="true"[^>]+data-slate-date="([0-9-]+)"', re.I
)
NOINDEX = '<meta name="robots" content="noindex,follow">'
INDEX = '<meta name="robots" content="index,follow,max-image-preview:large">'


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--per-sport", type=int, default=50)
    parser.add_argument("--min-graded", type=int, default=100,
                        help="quality gate: minimum graded picks to index")
    parser.add_argument("--date", help="Required current-card slate date; default current ET date")
    args = parser.parse_args()
    required_date = args.date or datetime.datetime.now(ZoneInfo("America/New_York")).date().isoformat()

    chosen = []
    for sport in SPORTS:
        ranked = []
        for page in sorted((ROOT / "analyzer" / sport).glob("*/index.html")):
            head = page.read_text()[:4000]
            m = GRADED_RE.search(head)
            graded = int(m.group(1).replace(",", "")) if m else 0
            full = page.read_text()
            current = CURRENT_RE.search(full)
            has_current = bool(current and current.group(1) == required_date)
            ranked.append((graded, has_current, page))
        ranked.sort(key=lambda t: t[0], reverse=True)
        eligible = [(g, p) for g, is_current, p in ranked if g >= args.min_graded and is_current]
        top = {p for _, p in eligible[: args.per_sport]}

        flipped = reverted = 0
        for graded, _, page in ranked:
            html = page.read_text()
            if page in top:
                if NOINDEX in html:
                    page.write_text(html.replace(NOINDEX, INDEX, 1))
                    flipped += 1
                slug = page.parent.name
                chosen.append(f"/analyzer/{sport}/{slug}/")
            elif INDEX in html:
                # No longer in the top set: return to noindex.
                page.write_text(html.replace(INDEX, NOINDEX, 1))
                reverted += 1
        print(f"{sport}: current {sum(1 for _, c, _ in ranked if c)}, top {len(top)} indexed ({flipped} flipped, "
              f"{reverted} reverted, min graded "
              f"{min((g for g, p in eligible[:args.per_sport]), default=0)})")

    out = ROOT / "scripts" / "analyzer_indexed.txt"
    out.write_text("\n".join(chosen) + "\n")
    print(f"wrote {len(chosen)} URLs to {out.relative_to(ROOT)} for slate {required_date}")


if __name__ == "__main__":
    main()
