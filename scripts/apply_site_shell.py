#!/usr/bin/env python3
"""Apply the canonical Propeller head assets, navigation, and footer.

The migration is deliberately idempotent and does not modify protected page
content between the primary navigation and footer.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PARTS = {"mockups", "analytics-dashboard", ".git"}
STATIC_REDIRECT_RE = re.compile(
    r'<meta\s+http-equiv=["\']refresh["\']\s+content=["\']0;\s*url=/[^"\']+["\']',
    re.IGNORECASE,
)

HEAD_BLOCK = """  <!-- PP_SITE_HEAD_START -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#f2efe8">
  <link rel="stylesheet" href="/assets/css/site-system.css?v=20260712">
  {compat}<​!-- PP_SITE_HEAD_END -->""".replace("<​!", "<!")

NAV = """<!-- PP_SITE_NAV_START -->
<nav class="pp-site-nav" aria-label="Primary navigation">
  <div class="pp-site-nav__inner">
    <a class="pp-brand" href="https://propellerpicks.com/" aria-label="Propeller Picks home">
      <span class="pp-brand__mark" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>Propeller</span>
    </a>
    <button class="pp-site-nav__menu" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="ppSiteNavLinks">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>
    </button>
    <div class="pp-site-nav__links" id="ppSiteNavLinks">
      <a href="https://propellerpicks.com/picks/" data-section="picks">Picks</a>
      <a href="https://propellerpicks.com/results/" data-section="results">Results</a>
      <a href="https://propellerpicks.com/track-record/" data-section="track-record">Track Record</a>
      <a href="https://propellerpicks.com/how-it-works/" data-section="how-it-works">Method</a>
      <a href="https://propellerpicks.com/guides/" data-section="guides">Guides</a>
      <a href="https://propellerpicks.com/tools/" data-section="tools">Tools</a>
      <a href="https://propellerpicks.com/analyzer/" data-section="analyzer">Analyzer</a>
      <a href="https://app.propellerpicks.com/app" rel="noopener noreferrer">Web App</a>
      <a class="pp-site-nav__cta" href="https://app.propellerpicks.com/signup" rel="noopener noreferrer">Get Free Lifetime Access</a>
    </div>
  </div>
</nav>
<!-- PP_SITE_NAV_END -->"""

FOOTER = """<!-- PP_SITE_FOOTER_START -->
<footer class="pp-site-footer">
  <div class="pp-site-footer__inner">
    <div class="pp-site-footer__grid">
      <div class="pp-site-footer__brand">
        <a class="pp-brand" href="https://propellerpicks.com/" aria-label="Propeller Picks home">
          <span class="pp-brand__mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>Propeller</span>
        </a>
        <p class="pp-site-footer__copy">AI-powered player prop research with inspectable signals, practical tools, and a documented historical archive.</p>
      </div>
      <div class="pp-site-footer__column">
        <h2>Research</h2>
        <a href="https://propellerpicks.com/picks/">Picks</a>
        <a href="https://propellerpicks.com/analyzer/">Analyzer</a>
        <a href="https://propellerpicks.com/tools/">Tools</a>
        <a href="https://propellerpicks.com/guides/">Guides</a>
      </div>
      <div class="pp-site-footer__column">
        <h2>Proof</h2>
        <a href="https://propellerpicks.com/results/">Results</a>
        <a href="https://propellerpicks.com/track-record/">Track Record</a>
        <a href="https://propellerpicks.com/how-it-works/">Method</a>
        <a href="https://propellerpicks.com/help/">Help</a>
        <a href="https://propellerpicks.com/blog/">Blog</a>
      </div>
      <div class="pp-site-footer__column">
        <h2>Company</h2>
        <a href="https://propellerpicks.com/about/">About</a>
        <a href="https://propellerpicks.com/editorial-policy/">Editorial Policy</a>
        <a href="https://propellerpicks.com/privacy/">Privacy</a>
        <a href="https://propellerpicks.com/terms/">Terms</a>
        <a href="https://x.com/propellerpicks" target="_blank" rel="noopener noreferrer">Twitter / X</a>
      </div>
    </div>
    <p class="pp-site-footer__legal">Propeller is a research and analysis tool. We do not accept wagers or operate as a sportsbook. All analysis is for informational purposes only and does not constitute gambling advice. Must be 21+. If gambling is a problem, call <a href="tel:18004262537">1-800-GAMBLER</a>. Past performance does not guarantee future results.<br>© 2026 Propeller Picks.</p>
  </div>
</footer>
<!-- PP_SITE_FOOTER_END -->"""

NAV_RE = re.compile(r"<nav\b[^>]*>.*?</nav>", re.IGNORECASE | re.DOTALL)
FOOTER_RE = re.compile(r"<footer\b[^>]*>.*?</footer>", re.IGNORECASE | re.DOTALL)
BODY_RE = re.compile(r"<body\b([^>]*)>", re.IGNORECASE)


def production_files(include_home: bool) -> list[Path]:
    files = []
    for path in ROOT.rglob("*.html"):
        if any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts):
            continue
        if not include_home and path == ROOT / "index.html":
            continue
        html = path.read_text(encoding="utf-8")
        if '<meta name="robots" content="noindex,follow">' in html and STATIC_REDIRECT_RE.search(html):
            continue
        files.append(path)
    return sorted(files)


def remove_managed_head(html: str) -> str:
    html = re.sub(
        r"\s*<!-- PP_SITE_HEAD_START -->.*?<!-- PP_SITE_HEAD_END -->\s*",
        "\n",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    html = re.sub(
        r"\s*<noscript>\s*<link\b[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com|api\.fontshare\.com)[^>]*>\s*</noscript>\s*",
        "\n",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    html = re.sub(
        r"\s*<link\b[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com|api\.fontshare\.com)[^>]*>\s*",
        "\n",
        html,
        flags=re.IGNORECASE,
    )
    head_end = re.search(r"</head>", html, flags=re.IGNORECASE)
    if head_end:
        head = html[: head_end.start()]
        tail = html[head_end.start() :]
        kept = []
        for line in head.splitlines(keepends=True):
            lowered = line.lower()
            is_icon = "<link" in lowered and "rel=" in lowered and "icon" in lowered
            is_orphaned_data_icon = "</svg>\">" in lowered or "</svg>'>" in lowered
            if is_icon or is_orphaned_data_icon:
                continue
            kept.append(line)
        html = "".join(kept) + tail
    return html


def family_class(path: Path, home: bool) -> str | None:
    if home:
        return None
    relative = path.relative_to(ROOT)
    if len(relative.parts) >= 4 and relative.parts[0] == "analyzer":
        return "pp-family-player"
    if relative.parts[0] == "blog":
        return "pp-family-blog"
    if relative.parts[0] == "help":
        return "pp-family-help"
    return "pp-family-core"


def add_body_class(html: str, home: bool, family: str | None) -> str:
    def replace(match: re.Match[str]) -> str:
        attrs = match.group(1)
        class_match = re.search(r"\bclass=([\"'])(.*?)\1", attrs, flags=re.IGNORECASE | re.DOTALL)
        wanted = ["pp-site-system"] + (["pp-home"] if home else []) + ([family] if family else [])
        if class_match:
            classes = class_match.group(2).split()
            for name in wanted:
                if name not in classes:
                    classes.append(name)
            updated = " ".join(classes)
            attrs = attrs[: class_match.start(2)] + updated + attrs[class_match.end(2) :]
        else:
            attrs += f' class="{" ".join(wanted)}"'
        return f"<body{attrs}>"

    return BODY_RE.sub(replace, html, count=1)


def replace_primary_nav(html: str) -> str:
    managed = re.search(
        r"<!-- PP_SITE_NAV_START -->.*?<!-- PP_SITE_NAV_END -->",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if managed:
        return html[: managed.start()] + NAV + html[managed.end() :]
    for match in NAV_RE.finditer(html):
        opening = html[match.start() : html.find(">", match.start()) + 1].lower()
        if "breadcrumb" in opening:
            continue
        return html[: match.start()] + NAV + html[match.end() :]
    body = BODY_RE.search(html)
    if not body:
        raise ValueError("No <body> tag")
    return html[: body.end()] + "\n" + NAV + html[body.end() :]


def replace_footer(html: str) -> str:
    managed = re.search(
        r"<!-- PP_SITE_FOOTER_START -->.*?<!-- PP_SITE_FOOTER_END -->",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if managed:
        return html[: managed.start()] + FOOTER + html[managed.end() :]
    match = FOOTER_RE.search(html)
    if match:
        return html[: match.start()] + FOOTER + html[match.end() :]
    closing = re.search(r"</body>", html, flags=re.IGNORECASE)
    if not closing:
        raise ValueError("No </body> tag")
    return html[: closing.start()] + FOOTER + "\n" + html[closing.start() :]


def ensure_script(html: str) -> str:
    html = re.sub(
        r"\s*<script\b[^>]+src=[\"']/assets/js/site-nav\.js[^\"']*[\"'][^>]*>\s*</script>\s*",
        "\n",
        html,
        flags=re.IGNORECASE,
    )
    closing = re.search(r"</body>", html, flags=re.IGNORECASE)
    if not closing:
        raise ValueError("No </body> tag")
    script = '  <script src="/assets/js/site-nav.js?v=20260712" defer></script>\n'
    return html[: closing.start()] + script + html[closing.start() :]


def migrate_html(original: str, path: Path, home: bool) -> str:
    html = remove_managed_head(original)
    compat = "" if home else '<link rel="stylesheet" href="/assets/css/site-compat.css?v=20260712">\n  '
    block = HEAD_BLOCK.format(compat=compat)
    html = re.sub(r"</head>", block + "\n</head>", html, count=1, flags=re.IGNORECASE)
    html = add_body_class(html, home, family_class(path, home))
    html = replace_primary_nav(html)
    html = replace_footer(html)
    html = ensure_script(html)
    return html


def migrate(path: Path, home: bool) -> bool:
    original = path.read_text(encoding="utf-8")
    html = migrate_html(original, path, home)
    if html != original:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--include-home", action="store_true")
    parser.add_argument("--check", action="store_true", help="Fail if migration would change files")
    args = parser.parse_args()

    changed = []
    for path in production_files(args.include_home):
        before = path.read_text(encoding="utf-8") if args.check else None
        did_change = migrate(path, path == ROOT / "index.html")
        if did_change:
            changed.append(path)
            if args.check and before is not None:
                path.write_text(before, encoding="utf-8")

    print(f"checked={len(production_files(args.include_home))} changed={len(changed)}")
    if args.check and changed:
        for path in changed[:20]:
            print(path.relative_to(ROOT))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
