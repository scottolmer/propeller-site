#!/usr/bin/env python3
"""Render the payout chart images on the payout calculator pages.

Why: Google shows an Images block on payout searches ("prizepicks payout
chart", "underdog payout calculator"). The calculator pages had HTML tables
but no image to appear there. This script draws an SVG chart from the page's
own payout tables and places it, with alt text and a caption, right after
those tables.

Honesty rule: every number in the image is read from the page's HTML tables.
Nothing is typed in here, so the image cannot drift from the table. Change
the table, rerun this script, and the image follows.

Idempotent and marker-delimited.

Usage:
  python3 scripts/render_payout_charts.py          # write
  python3 scripts/render_payout_charts.py --check  # exit 1 if anything is stale
"""
import argparse
import html
import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
START = "<!-- payout-chart-image:start -->"
END = "<!-- payout-chart-image:end -->"
BLOCK_RE = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)

# DESIGN.md palette.
NIGHT, NAVY, CREAM, MUTED, BLUE, ORANGE = "#031a2c", "#06243a", "#f7f1e7", "#b8d3df", "#54c8ff", "#ff5b23"
FONT = "Helvetica, Arial, sans-serif"

CHARTS = [
    {
        "page": "tools/prizepicks-payout-calculator/index.html",
        "image": "images/charts/prizepicks-payout-chart-2026.svg",
        "title": "PrizePicks Payout Chart 2026",
        "tables": [
            ("PrizePicks Power Play payout chart", "Power Play (all picks must hit)"),
            ("PrizePicks Flex Play payout chart", "Flex Play (partial wins)"),
        ],
        "footnote": "Standard Player Pick rates. Promotions and special projections can change the payout; "
                    "confirm the final screen in the PrizePicks app.",
        "alt": "PrizePicks payout chart for 2026. Power Play pays {power}. "
               "Flex Play pays partial wins too, for example {flex}.",
    },
    {
        "page": "tools/underdog-payout-calculator/index.html",
        "image": "images/charts/underdog-payout-chart-2026.svg",
        "title": "Underdog Payout Chart 2026",
        "tables": [
            ("Underdog Standard payout chart", "Standard (all picks must hit)"),
            ("Underdog Flex payout chart", "Flex (partial wins)"),
        ],
        "footnote": "Published base payouts. Modifiers, promotions and entry terms can change the amount; "
                    "confirm the final screen in the Underdog app.",
        "alt": "Underdog payout chart for 2026. Standard entries pay {power}. "
               "Flex entries pay partial wins too, for example {flex}.",
    },
]


class TableParser(HTMLParser):
    """Collect header and body cell text for one table, found by its wrapper's aria-label."""

    def __init__(self, label: str):
        super().__init__(convert_charrefs=True)
        self.label = label
        self.armed = self.inside = False
        self.section = None
        self.cell = None
        self.head, self.rows, self.row = [], [], None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("aria-label") == self.label and attrs.get("role") == "region":
            self.armed = True
        elif tag == "table" and self.armed and not self.inside and not self.rows:
            self.inside = True
        elif self.inside:
            if tag in ("thead", "tbody"):
                self.section = tag
            elif tag == "tr":
                self.row = []
            elif tag in ("td", "th"):
                self.cell = []

    def handle_endtag(self, tag):
        if not self.inside:
            return
        if tag in ("td", "th") and self.cell is not None:
            self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.section == "thead":
                self.head = self.row
            elif self.section == "tbody":
                self.rows.append(self.row)
            self.row = None
        elif tag == "table":
            self.inside = self.armed = False

    def handle_data(self, data):
        if self.inside and self.cell is not None:
            self.cell.append(data)


def read_table(page: str, label: str):
    parser = TableParser(label)
    parser.feed(page)
    if not parser.head or not parser.rows:
        raise ValueError(f"table not found or empty: {label}")
    return parser.head, parser.rows


def esc(value) -> str:
    return html.escape(str(value), quote=True)


def svg_chart(title: str, sections, footnote: str) -> tuple[str, int, int]:
    width, pad, row_h, head_h = 1200, 48, 46, 40
    y = pad + 44
    body = [f'<text x="{pad}" y="{y}" font-size="38" font-weight="700" fill="{CREAM}">{esc(title)}</text>']
    y += 24
    for subtitle, head, rows in sections:
        y += 40
        body.append(f'<text x="{pad}" y="{y}" font-size="24" font-weight="700" fill="{BLUE}">{esc(subtitle)}</text>')
        y += 18
        col_w = (width - 2 * pad) / len(head)
        body.append(f'<rect x="{pad}" y="{y}" width="{width - 2 * pad}" height="{head_h}" fill="{NAVY}"/>')
        for i, cell in enumerate(head):
            body.append(f'<text x="{pad + 16 + i * col_w:.0f}" y="{y + 26}" font-size="17" font-weight="700" '
                        f'fill="{MUTED}">{esc(cell.upper())}</text>')
        y += head_h
        for r, row in enumerate(rows):
            if r % 2:
                body.append(f'<rect x="{pad}" y="{y}" width="{width - 2 * pad}" height="{row_h}" fill="{NAVY}" opacity=".55"/>')
            for i, cell in enumerate(row):
                multiplier = re.fullmatch(r"\d+(\.\d+)?x", cell) is not None
                color = ORANGE if multiplier else CREAM
                weight = "700" if multiplier else "400"
                body.append(f'<text x="{pad + 16 + i * col_w:.0f}" y="{y + 30}" font-size="21" font-weight="{weight}" '
                            f'fill="{color}">{esc(cell)}</text>')
            y += row_h
        body.append(f'<line x1="{pad}" y1="{y}" x2="{width - pad}" y2="{y}" stroke="{BLUE}" stroke-opacity=".5"/>')
    y += 40
    body.append(f'<text x="{pad}" y="{y}" font-size="16" fill="{MUTED}">{esc(footnote)}</text>')
    y += 26
    body.append(f'<text x="{pad}" y="{y}" font-size="16" fill="{MUTED}">propellerpicks.com</text>')
    height = y + pad - 10
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
           f'font-family="{FONT}" role="img" aria-labelledby="t">\n<title id="t">{esc(title)}</title>\n'
           f'<rect width="{width}" height="{height}" fill="{NIGHT}"/>\n' + "\n".join(body) + "\n</svg>\n")
    return svg, width, height


def alt_text(chart: dict, sections) -> str:
    _, power_head, power_rows = sections[0]
    multiplier_col = next(i for i, h in enumerate(power_head) if h.lower() == "multiplier")
    power = ", ".join(f"{row[multiplier_col]} for {row[0].lower()}" for row in power_rows)
    _, flex_head, flex_rows = sections[1]
    last = flex_rows[-1]
    lower = [h.lower() for h in flex_head]
    if "result" in lower:
        # One row per result (PrizePicks): "6-Pick Flex pays 25x for 6/6, 2x for 5/6 and 0.4x for 4/6"
        r, m = lower.index("result"), lower.index("multiplier")
        group = [row for row in flex_rows if row[0] == last[0]]
        parts = [f"{row[m]} for {row[r].replace(' correct', '')}" for row in group]
    else:
        # One row per entry with result columns (Underdog): "8-Pick Flex pays 80x all correct, ..."
        parts = [f"{v} {h.lower()}" for h, v in zip(flex_head[1:], last[1:]) if v not in ("—", "-", "")]
    joined = parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " and " + parts[-1]
    flex = f"{last[0]} pays {joined}"
    return chart["alt"].format(power=power, flex=flex)


def figure(chart: dict, width: int, height: int, alt: str) -> str:
    src = "/" + chart["image"]
    return "\n".join([
        START,
        '<figure class="payout-chart-image" style="margin:28px 0 8px;">',
        f'  <img src="{esc(src)}" alt="{esc(alt)}" width="{width}" height="{height}" loading="lazy" decoding="async" '
        'style="display:block;width:100%;height:auto;border-radius:12px;border:1px solid rgba(84,200,255,.24);">',
        f'  <figcaption style="font-size:14px;color:var(--text-2, #b8d3df);margin-top:8px;">{esc(chart["title"])} as an image, '
        'drawn from the tables above. Save it or share it; the tables stay the source.</figcaption>',
        "</figure>",
        END,
    ]) + "\n"


def place(page: str, block: str, last_label: str) -> str:
    if BLOCK_RE.search(page):
        return BLOCK_RE.sub(lambda _: block, page, count=1)
    at = page.find(f'aria-label="{last_label}"')
    if at == -1:
        raise ValueError(f"anchor table not found: {last_label}")
    close = page.find("</table></div>", at)
    if close == -1:
        raise ValueError(f"table close not found: {last_label}")
    close += len("</table></div>")
    line_end = page.find("\n", close) + 1
    return page[:line_end] + block + page[line_end:]


def build(chart: dict):
    page_path = ROOT / chart["page"]
    page = page_path.read_text(encoding="utf-8")
    sections = []
    for label, subtitle in chart["tables"]:
        head, rows = read_table(page, label)
        sections.append((subtitle, head, rows))
    svg, width, height = svg_chart(chart["title"], sections, chart["footnote"])
    new_page = place(page, figure(chart, width, height, alt_text(chart, sections)), chart["tables"][-1][0])
    return page_path, page, new_page, ROOT / chart["image"], svg


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale = []
    for chart in CHARTS:
        page_path, page, new_page, image_path, svg = build(chart)
        current_svg = image_path.read_text(encoding="utf-8") if image_path.exists() else None
        for path, before, after in ((page_path, page, new_page), (image_path, current_svg, svg)):
            if before != after:
                stale.append(path.relative_to(ROOT))
                if not args.check:
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text(after, encoding="utf-8")
    print(f"payout_charts={len(CHARTS)} changed={len(stale)}" + (f" {[str(p) for p in stale]}" if stale else ""))
    return 1 if args.check and stale else 0


if __name__ == "__main__":
    sys.exit(main())
