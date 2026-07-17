#!/usr/bin/env python3
"""Check the small set of primary sources used by strategy guides."""

from __future__ import annotations

import time
import urllib.error
import urllib.request


SOURCES = {
    "DraftKings Pick6 how to play": "https://pick6.draftkings.com/how-to-play-pick6",
    "PrizePicks Help Center": "https://www.prizepicks.com/help-center",
    "Underdog Fantasy": "https://underdogfantasy.com/",
    "NBA advanced team stats": "https://www.nba.com/stats/teams/advanced",
    "Basketball Reference usage glossary": "https://www.basketball-reference.com/about/glossary.html#usg",
    "ESPN NBA injuries": "https://www.espn.com/nba/injuries",
    "FantasyPros NBA defense vs position": "https://www.fantasypros.com/nba/defense-vs-position.php",
}
DEFINITELY_BROKEN = {404, 410}
REACHABLE_BUT_RESTRICTED = {401, 403, 429}


def status(url: str) -> int:
    headers = {"User-Agent": "PropellerEditorialSourceCheck/1.0 (+https://propellerpicks.com/editorial-policy/)"}
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            request = urllib.request.Request(url, headers=headers, method="GET")
            with urllib.request.urlopen(request, timeout=20) as response:
                return int(response.status)
        except urllib.error.HTTPError as error:
            if error.code in REACHABLE_BUT_RESTRICTED | DEFINITELY_BROKEN:
                return error.code
            last_error = error
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = error
        if attempt == 0:
            time.sleep(1)
    raise RuntimeError(str(last_error))


def main() -> int:
    failures = []
    for label, url in SOURCES.items():
        try:
            code = status(url)
            state = "reachable" if code < 400 or code in REACHABLE_BUT_RESTRICTED else "broken"
            print(f"{code}\t{state}\t{label}\t{url}")
            if code in DEFINITELY_BROKEN or code >= 500:
                failures.append(f"{label}: HTTP {code}")
        except RuntimeError as error:
            print(f"ERROR\tunreachable\t{label}\t{url}\t{error}")
            failures.append(f"{label}: {error}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
