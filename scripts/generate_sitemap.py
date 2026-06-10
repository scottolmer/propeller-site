#!/usr/bin/env python3
"""Generate sitemap.xml from the actual state of the site.

Includes every page that is (a) not noindex and (b) self-canonical — so the
root duplicate pages whose canonical points elsewhere are excluded
automatically, and analyzer pages flipped to index are included
automatically. lastmod comes from the file's last git commit, or today if
the file has uncommitted changes.

Run daily after content updates:
    python3 scripts/update_picks_freshness.py
    python3 scripts/apply_analyzer_indexing.py
    python3 scripts/inject_popular_players.py
    python3 scripts/generate_sitemap.py
"""
import datetime
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://propellerpicks.com"
SKIP_DIRS = {".git", "docs", "scripts", "node_modules", "images", "assets"}

NOINDEX_RE = re.compile(r'<meta name="robots" content="[^"]*noindex', re.I)
CANONICAL_RE = re.compile(r'<link rel="canonical" href="([^"]+)"')


def dirty_files() -> set:
    out = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT,
                         capture_output=True, text=True).stdout
    return {line[3:].strip() for line in out.splitlines() if line.strip()}


def git_lastmod(rel: str) -> str | None:
    out = subprocess.run(["git", "log", "-1", "--format=%as", "--", rel],
                         cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return out or None


def page_url(rel: pathlib.Path) -> str:
    if rel.name == "index.html":
        parent = str(rel.parent).replace("\\", "/")
        return f"{BASE}/" if parent == "." else f"{BASE}/{parent}/"
    return f"{BASE}/{rel.as_posix()}"


def main() -> None:
    today = datetime.date.today().isoformat()
    dirty = dirty_files()
    entries = []

    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        head = path.read_text(errors="ignore")[:6000]
        if NOINDEX_RE.search(head):
            continue
        url = page_url(rel)
        m = CANONICAL_RE.search(head)
        if m and m.group(1).rstrip() != url:
            continue  # canonicalized elsewhere
        rel_s = rel.as_posix()
        lastmod = today if rel_s in dirty else (git_lastmod(rel_s) or today)
        entries.append((url, lastmod))

    # Homepage first, then shallow before deep, then alphabetical.
    entries.sort(key=lambda e: (e[0] != f"{BASE}/", e[0].count("/"), e[0]))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod in entries:
        lines.append(f"  <url><loc>{url}</loc><lastmod>{lastmod}</lastmod></url>")
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n")
    print(f"sitemap.xml written: {len(entries)} URLs")


if __name__ == "__main__":
    main()
