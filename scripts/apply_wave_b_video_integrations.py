#!/usr/bin/env python3
"""Apply approved Wave B YouTube IDs to their companion pages.

This is intentionally a release-time step. It refuses placeholders and only
replaces content inside the managed Wave B marker pairs.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path


YOUTUBE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
DURATION_RE = re.compile(r"^PT(?=\d|[HM])(?:\d+H)?(?:\d+M)?(?:\d+S)?$")


def validate_video_id(value: str) -> str:
    if not YOUTUBE_ID_RE.fullmatch(value) or "VIDEO_ID" in value.upper():
        raise argparse.ArgumentTypeError("YouTube IDs must be real 11-character IDs")
    return value


def validate_date(value: str) -> str:
    try:
        dt.date.fromisoformat(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("upload dates must use YYYY-MM-DD") from exc
    return value


def validate_duration(value: str) -> str:
    if not DURATION_RE.fullmatch(value):
        raise argparse.ArgumentTypeError("durations must use ISO 8601, for example PT3M53S")
    return value


def replace_managed(text: str, start: str, end: str, body: str) -> str:
    pattern = re.compile(
        rf"(?P<start><!-- {re.escape(start)} -->).*?(?P<end><!-- {re.escape(end)} -->)",
        re.DOTALL,
    )
    match = pattern.search(text)
    if not match:
        raise ValueError(f"missing managed marker pair: {start} / {end}")
    return text[: match.start()] + f"<!-- {start} -->\n{body}\n<!-- {end} -->" + text[match.end() :]


def video_object(
    *,
    title: str,
    description: str,
    video_id: str,
    upload_date: str,
    duration: str,
    page_url: str,
) -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": title,
        "description": description,
        "thumbnailUrl": f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg",
        "uploadDate": upload_date,
        "duration": duration,
        "embedUrl": f"https://www.youtube.com/embed/{video_id}",
        "contentUrl": f"https://www.youtube.com/watch?v={video_id}",
        "mainEntityOfPage": page_url,
    }
    return '<script type="application/ld+json">' + json.dumps(payload, separators=(",", ":")) + "</script>"


def video_card(
    *,
    title: str,
    video_id: str,
    placement: str,
    alt: str,
    prompt: str,
    takeaway: str,
) -> str:
    return (
        f'<div class="pp-video-card" data-video-id="{video_id}" '
        f'data-video-title="{title}" data-video-placement="{placement}">'
        '<div class="pp-video-card__stage"><button class="pp-video-card__button" '
        f'type="button" data-video-play aria-label="Play {title}">'
        f'<img class="pp-video-card__thumb" src="https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg" '
        f'alt="{alt}" width="1280" height="720" loading="lazy">'
        '<span class="pp-video-card__play" aria-hidden="true"><svg viewBox="0 0 24 24" '
        'fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>'
        f'<span class="pp-video-card__prompt"><strong>{prompt}</strong><span>Play walkthrough</span></span>'
        f'</button></div><p class="pp-video-card__takeaway"><strong>Key takeaway:</strong> {takeaway}</p></div>'
    )


def apply_integrations(
    root: Path,
    *,
    cheat_id: str,
    walkthrough_id: str,
    cheat_date: str,
    walkthrough_date: str,
    cheat_duration: str,
    walkthrough_duration: str,
) -> None:
    cheat_path = root / "guides/prizepicks-cheat-sheet/index.html"
    walkthrough_path = root / "picks/prizepicks/index.html"

    cheat_title = "What Is in a PrizePicks Cheat Sheet?"
    cheat_description = "A plain-language explainer of exact lines, freshness, evidence, confidence, missing inputs, limitations, and the final PrizePicks platform check."
    cheat = cheat_path.read_text()
    cheat = replace_managed(
        cheat,
        "PP_VIDEOOBJECT_START",
        "PP_VIDEOOBJECT_END",
        video_object(
            title=cheat_title,
            description=cheat_description,
            video_id=cheat_id,
            upload_date=cheat_date,
            duration=cheat_duration,
            page_url="https://propellerpicks.com/guides/prizepicks-cheat-sheet/",
        ),
    )
    cheat = replace_managed(
        cheat,
        "PP_VIDEO_EMBED_START",
        "PP_VIDEO_EMBED_END",
        video_card(
            title=cheat_title,
            video_id=cheat_id,
            placement="prizepicks_cheat_sheet_guide_primary",
            alt="PrizePicks cheat sheet fields and line-check explainer video thumbnail",
            prompt="A useful cheat sheet shows the question, evidence, age, and limits.",
            takeaway="Match the exact player, stat, and line, inspect freshness and missing inputs, then verify the actual PrizePicks projection.",
        ),
    )

    walkthrough_title = "How to Use the PrizePicks Research Page: From Cheat Sheet to Line Check"
    walkthrough_description = "A desktop and mobile walkthrough for finding current Propeller research, matching the exact row, reading evidence and freshness, and stopping when the PrizePicks projection cannot be verified."
    walkthrough = walkthrough_path.read_text()
    walkthrough = replace_managed(
        walkthrough,
        "PP_WALKTHROUGH_VIDEOOBJECT_START",
        "PP_WALKTHROUGH_VIDEOOBJECT_END",
        video_object(
            title=walkthrough_title,
            description=walkthrough_description,
            video_id=walkthrough_id,
            upload_date=walkthrough_date,
            duration=walkthrough_duration,
            page_url="https://propellerpicks.com/picks/prizepicks/",
        ),
    )
    walkthrough = replace_managed(
        walkthrough,
        "PP_WALKTHROUGH_VIDEO_START",
        "PP_WALKTHROUGH_VIDEO_END",
        video_card(
            title=walkthrough_title,
            video_id=walkthrough_id,
            placement="prizepicks_research_page_walkthrough_primary",
            alt="PrizePicks research page desktop and mobile line-check walkthrough video thumbnail",
            prompt="Follow the same exact-row workflow on desktop and mobile.",
            takeaway="Confirm player, stat, line, direction, confidence, evidence, and age, then stop when the current PrizePicks projection does not match.",
        ),
    )

    cheat_path.write_text(cheat)
    walkthrough_path.write_text(walkthrough)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--cheat-sheet-video-id", required=True, type=validate_video_id)
    parser.add_argument("--walkthrough-video-id", required=True, type=validate_video_id)
    parser.add_argument("--cheat-sheet-upload-date", required=True, type=validate_date)
    parser.add_argument("--walkthrough-upload-date", required=True, type=validate_date)
    parser.add_argument("--cheat-sheet-duration", default="PT3M53S", type=validate_duration)
    parser.add_argument("--walkthrough-duration", default="PT4M15S", type=validate_duration)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    apply_integrations(
        args.root,
        cheat_id=args.cheat_sheet_video_id,
        walkthrough_id=args.walkthrough_video_id,
        cheat_date=args.cheat_sheet_upload_date,
        walkthrough_date=args.walkthrough_upload_date,
        cheat_duration=args.cheat_sheet_duration,
        walkthrough_duration=args.walkthrough_duration,
    )
