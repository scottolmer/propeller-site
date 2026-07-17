#!/usr/bin/env python3
"""Generate sitemap.xml with content-aware last-modified dates.

Shared shell, favicon, analytics, and organization-name edits should not make
thousands of pages appear newly published. A semantic fingerprint tracks the
page-specific title, description, canonical/robots directives, and visible
content outside the managed navigation and footer.
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import html
import json
import pathlib
import re
import subprocess
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo


ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = "https://propellerpicks.com"
SITEMAP = ROOT / "sitemap.xml"
MANIFEST = ROOT / "data" / "sitemap-fingerprints.json"
SKIP_DIRS = {".git", "analytics-dashboard", "assets", "docs", "images", "mockups", "node_modules", "scripts"}
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\'][^>]*content=["\'][^"\']*noindex', re.I)
CANONICAL_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', re.I)


def page_url(rel: pathlib.Path) -> str:
    if rel.name == "index.html":
        parent = rel.parent.as_posix()
        return f"{BASE}/" if parent == "." else f"{BASE}/{parent}/"
    return f"{BASE}/{rel.as_posix()}"


def parse_dates(source: str) -> dict[str, str]:
    if not source:
        return {}
    try:
        root = ET.fromstring(source)
    except ET.ParseError:
        return {}
    namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    dates = {}
    for node in root.findall("s:url", namespace):
        loc = node.findtext("s:loc", default="", namespaces=namespace)
        lastmod = node.findtext("s:lastmod", default="", namespaces=namespace)
        if loc and lastmod:
            dates[loc] = lastmod
    return dates


def existing_dates(reseed: bool = False) -> dict[str, str]:
    if reseed:
        return parse_dates(git_content("sitemap.xml") or "")
    return parse_dates(SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else "")


def load_manifest() -> dict:
    if not MANIFEST.exists():
        return {}
    try:
        return json.loads(MANIFEST.read_text(encoding="utf-8")).get("entries", {})
    except (json.JSONDecodeError, OSError):
        return {}


def git_content(rel: str) -> str | None:
    result = subprocess.run(
        ["git", "show", f"HEAD:{rel}"], cwd=ROOT, capture_output=True, text=True
    )
    return result.stdout if result.returncode == 0 else None


def git_lastmod(rel: str) -> str | None:
    result = subprocess.run(
        ["git", "log", "-1", "--format=%as", "--", rel], cwd=ROOT, capture_output=True, text=True
    )
    return result.stdout.strip() or None


def field(source: str, pattern: str) -> str:
    match = re.search(pattern, source, re.I | re.S)
    return html.unescape(match.group(1)).strip() if match else ""


def semantic_html(source: str) -> str:
    metadata = [
        field(source, r"<title>(.*?)</title>"),
        field(source, r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']\s*/?>'),
        field(source, r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']'),
        field(source, r'<meta\s+name=["\']robots["\']\s+content=["\'](.*?)["\']\s*/?>'),
    ]
    body = field(source, r"<body\b[^>]*>(.*?)</body>") or source
    body = re.sub(r"<!-- PP_SITE_NAV_START -->.*?<!-- PP_SITE_NAV_END -->", " ", body, flags=re.I | re.S)
    body = re.sub(r"<!-- PP_SITE_FOOTER_START -->.*?<!-- PP_SITE_FOOTER_END -->", " ", body, flags=re.I | re.S)
    body = re.sub(r"<nav\b.*?</nav>", " ", body, flags=re.I | re.S)
    body = re.sub(r"<footer\b.*?</footer>", " ", body, flags=re.I | re.S)
    body = re.sub(r"<(script|style|noscript|template|svg)\b.*?</\1>", " ", body, flags=re.I | re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body)
    visible = html.unescape(body)
    return "\n".join(" ".join(part.split()) for part in [*metadata, visible])


def digest(source: str, is_html: bool) -> str:
    content = semantic_html(source) if is_html else source
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def current_entries() -> list[tuple[str, str, pathlib.Path, bool]]:
    entries = []
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        source = path.read_text(encoding="utf-8", errors="ignore")
        if NOINDEX_RE.search(source):
            continue
        url = page_url(rel)
        canonical = CANONICAL_RE.search(source)
        if canonical and canonical.group(1).rstrip("/") != url.rstrip("/"):
            continue
        entries.append((url, rel.as_posix(), path, True))
    return entries


def build(reseed: bool = False) -> tuple[str, str]:
    today = datetime.datetime.now(ZoneInfo("America/New_York")).date().isoformat()
    old_dates = existing_dates(reseed=reseed)
    old_manifest = {} if reseed else load_manifest()
    records = []
    new_manifest = {}

    for url, rel, path, is_html in current_entries():
        source = path.read_text(encoding="utf-8", errors="ignore")
        fingerprint = digest(source, is_html)
        prior = old_manifest.get(url)
        if prior and prior.get("fingerprint") == fingerprint:
            lastmod = prior.get("lastmod") or old_dates.get(url) or git_lastmod(rel) or today
        elif not old_manifest:
            head = git_content(rel)
            unchanged_from_head = head is not None and digest(head, is_html) == fingerprint
            lastmod = (old_dates.get(url) or git_lastmod(rel) or today) if unchanged_from_head else today
        else:
            lastmod = today
        records.append((url, lastmod))
        new_manifest[url] = {"fingerprint": fingerprint, "lastmod": lastmod, "source": rel}

    records.sort(key=lambda item: (item[0] != f"{BASE}/", item[0].count("/"), item[0]))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod in records:
        lines.append(f"  <url><loc>{html.escape(url)}</loc><lastmod>{lastmod}</lastmod></url>")
    lines.append("</urlset>")
    sitemap = "\n".join(lines) + "\n"
    manifest = json.dumps({"schema_version": 1, "entries": new_manifest}, indent=2, sort_keys=True) + "\n"
    return sitemap, manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail instead of writing when generated files differ")
    parser.add_argument("--reseed", action="store_true", help="Rebuild the initial manifest by comparing semantic content with HEAD")
    args = parser.parse_args()
    if args.check and args.reseed:
        parser.error("--check and --reseed cannot be combined")
    sitemap, manifest = build(reseed=args.reseed)
    mismatches = []
    if not SITEMAP.exists() or SITEMAP.read_text(encoding="utf-8") != sitemap:
        mismatches.append(SITEMAP)
    if not MANIFEST.exists() or MANIFEST.read_text(encoding="utf-8") != manifest:
        mismatches.append(MANIFEST)
    if args.check and mismatches:
        print("out_of_date=" + ",".join(path.relative_to(ROOT).as_posix() for path in mismatches))
        raise SystemExit(1)
    if not args.check:
        SITEMAP.write_text(sitemap, encoding="utf-8")
        MANIFEST.write_text(manifest, encoding="utf-8")
    print(f"urls={sitemap.count('<url>')} changed={len(mismatches)}")


if __name__ == "__main__":
    main()
