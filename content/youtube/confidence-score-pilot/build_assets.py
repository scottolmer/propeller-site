#!/usr/bin/env python3
"""Build the visual scene cards, thumbnail, captions, and video render manifest."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap
import re

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "visuals"
CAP = ROOT / "captures"
OUT.mkdir(exist_ok=True)

W, H = 1920, 1080
INK = "#101311"
PANEL = "#1b211e"
PANEL_2 = "#252d29"
WHITE = "#f8faf8"
MUTED = "#aeb8b1"
ORANGE = "#ff6038"
GREEN = "#24c486"
RED = "#ff6f61"
LINE = "#354039"

FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
MONO = "/System/Library/Fonts/SFNSMono.ttf"


def font(size, bold=False, mono=False):
    path = MONO if mono else FONT
    index = 1 if bold and not mono else 0
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except Exception:
        return ImageFont.truetype(path, size=size)


def canvas():
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    for x in range(0, W, 96):
        d.line((x, 0, x, H), fill="#171c19", width=1)
    for y in range(0, H, 96):
        d.line((0, y, W, y), fill="#171c19", width=1)
    d.rectangle((0, 0, 18, H), fill=ORANGE)
    brand(d)
    return im, d


def brand(d):
    cx, cy = 92, 70
    d.ellipse((cx-9, cy-9, cx+9, cy+9), fill=ORANGE)
    for ang in (-90, 30, 150):
        import math
        x2 = cx + int(34 * math.cos(math.radians(ang)))
        y2 = cy + int(34 * math.sin(math.radians(ang)))
        d.line((cx, cy, x2, y2), fill=ORANGE, width=10)
    d.text((145, 39), "PROPELLER", font=font(30, True), fill=WHITE)
    d.text((147, 76), "P I C K S", font=font(14, True, True), fill=ORANGE)


def label(d, text, x=110, y=150):
    d.text((x, y), text.upper(), font=font(20, True, True), fill=ORANGE)


def center_text(d, text, y, size=72, color=WHITE, max_width=1600, bold=True):
    f = font(size, bold)
    lines = textwrap.wrap(text, width=max(10, int(max_width / (size * .55))))
    yy = y
    for line in lines:
        box = d.textbbox((0, 0), line, font=f)
        d.text(((W-(box[2]-box[0]))/2, yy), line, font=f, fill=color)
        yy += size * 1.18
    return yy


def card(d, xy, title, body="", accent=ORANGE):
    d.rounded_rectangle(xy, radius=24, fill=PANEL, outline=LINE, width=2)
    x1, y1, x2, y2 = xy
    d.rectangle((x1, y1, x1+10, y2), fill=accent)
    d.text((x1+38, y1+28), title, font=font(30, True), fill=WHITE)
    if body:
        lines = textwrap.wrap(body, width=max(12, int((x2-x1-75)/20)))
        d.multiline_text((x1+38, y1+78), "\n".join(lines), font=font(23), fill=MUTED, spacing=10)


def screenshot_scene(name, title, source, crop=None, note="REAL PRODUCT VIEW · HISTORICAL EXAMPLE"):
    im, d = canvas()
    label(d, note)
    d.text((110, 195), title, font=font(54, True), fill=WHITE)
    shot = Image.open(CAP / source).convert("RGB")
    if crop:
        shot = shot.crop(crop)
    frame = (110, 285, 1810, 980)
    fw, fh = frame[2]-frame[0], frame[3]-frame[1]
    shot.thumbnail((fw, fh), Image.Resampling.LANCZOS)
    bg = Image.new("RGB", (fw, fh), "#eef1ef")
    bg.paste(shot, ((fw-shot.width)//2, (fh-shot.height)//2))
    bg = bg.filter(ImageFilter.GaussianBlur(0.15))
    im.paste(bg, (frame[0], frame[1]))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(frame, radius=18, outline="#566159", width=3)
    d.rounded_rectangle((135, 305, 475, 348), radius=16, fill="#111713")
    d.text((155, 315), "propellerpicks.com/app", font=font(18, mono=True), fill=MUTED)
    im.save(OUT / name)


def mobile_scene(name, title, source, crop, steps):
    """Place a readable crop of the real mobile app beside walkthrough notes."""
    im, d = canvas()
    label(d, "MOBILE COMPANION APP · REAL PRODUCT VIEW")
    title_lines = textwrap.wrap(title, width=34)
    d.multiline_text((110, 205), "\n".join(title_lines), font=font(48, True), fill=WHITE, spacing=8)
    y = 355 if len(title_lines) == 1 else 405
    for number, heading, body in steps:
        d.rounded_rectangle((110, y, 920, y+150), radius=22, fill=PANEL, outline=LINE, width=2)
        d.text((145, y+35), number, font=font(36, True, True), fill=ORANGE)
        d.text((235, y+25), heading, font=font(30, True), fill=WHITE)
        d.text((235, y+74), body, font=font(22), fill=MUTED)
        y += 175
    shot = Image.open(CAP / source).convert("RGB").crop(crop)
    shot.thumbnail((760, 825), Image.Resampling.LANCZOS)
    sx = 1085 + (720-shot.width)//2
    sy = 170 + (840-shot.height)//2
    d.rounded_rectangle((1045, 145, 1845, 1030), radius=46, fill="#eef1f4", outline=ORANGE, width=7)
    im.paste(shot, (sx, sy))
    d.rounded_rectangle((1045, 145, 1845, 1030), radius=46, outline="#081018", width=8)
    im.save(OUT / name)


def web_focus_scene(name, title, source, crop, callout, accent=ORANGE):
    """Show a large, legible crop from the authenticated desktop product."""
    im, d = canvas()
    label(d, "WEB APP WALKTHROUGH · REAL HISTORICAL PROP")
    d.text((110, 205), title, font=font(55, True), fill=WHITE)
    shot = Image.open(CAP / source).convert("RGB").crop(crop)
    shot.thumbnail((1660, 690), Image.Resampling.LANCZOS)
    frame = (110, 310, 1810, 970)
    fw, fh = frame[2]-frame[0], frame[3]-frame[1]
    bg = Image.new("RGB", (fw, fh), "#eef1ef")
    bg.paste(shot, ((fw-shot.width)//2, (fh-shot.height)//2))
    im.paste(bg, (frame[0], frame[1]))
    d.rounded_rectangle(frame, radius=22, outline=accent, width=7)
    d.rounded_rectangle((1190, 895, 1775, 950), radius=16, fill=INK)
    d.text((1220, 910), callout, font=font(22, True), fill=accent)
    im.save(OUT / name)


def confidence_focus_scene(name, platform, source, context_crop, confidence_crop, note):
    """Build an explicit full-view-to-confidence close-up frame for the edit."""
    im, d = canvas()
    label(d, f"{platform} · CONFIDENCE CLOSE-UP")
    d.text((110, 205), "This is the number to read with the direction", font=font(52, True), fill=WHITE)
    source_im = Image.open(CAP / source).convert("RGB")
    context = source_im.crop(context_crop)
    context.thumbnail((820, 650), Image.Resampling.LANCZOS)
    context = context.filter(ImageFilter.GaussianBlur(1.3)).point(lambda p: int(p*.62))
    im.paste(context, (115, 330))
    close = source_im.crop(confidence_crop)
    scale = min(780/close.width, 580/close.height)
    close = close.resize((int(close.width*scale), int(close.height*scale)), Image.Resampling.LANCZOS)
    cx = 1020 + (760-close.width)//2
    cy = 330 + (570-close.height)//2
    d.rounded_rectangle((975, 300, 1825, 945), radius=30, fill="#f7f8f7", outline=ORANGE, width=10)
    im.paste(close, (cx, cy))
    d.rounded_rectangle((975, 300, 1825, 945), radius=30, outline=ORANGE, width=10)
    d.text((110, 995), note, font=font(28, True), fill=MUTED)
    im.save(OUT / name)


def save(name, draw_fn):
    im, d = canvas()
    draw_fn(im, d)
    im.save(OUT / name)


def build():
    save("01-hook.png", lambda im, d: (
        label(d, "Confidence scores, explained"),
        center_text(d, "72%", 235, 280, ORANGE),
        center_text(d, "Does this mean a 72% chance of winning?", 650, 58, WHITE),
    ))

    def distinction(im, d):
        label(d, "The direct answer")
        center_text(d, "CONFIDENCE", 245, 108, WHITE)
        center_text(d, "≠", 405, 125, ORANGE)
        center_text(d, "PROBABILITY", 575, 108, WHITE)
        center_text(d, "Model conviction is not a guaranteed outcome.", 785, 38, MUTED)
    save("02-distinction.png", distinction)

    def question(im, d):
        label(d, "Every prop starts with one question")
        center_text(d, "Will the player finish…", 245, 64)
        card(d, (250, 460, 875, 760), "OVER", "Above the listed player-stat line", GREEN)
        card(d, (1045, 460, 1670, 760), "UNDER", "Below the listed player-stat line", ORANGE)
        center_text(d, "Direction answers which side.", 855, 40, MUTED)
    save("03-question.png", question)

    def signals(im, d):
        label(d, "Independent signal families")
        items = [("ROLE & USAGE", "Expected opportunity"), ("RECENT FORM", "What has changed lately"),
                 ("MATCHUP", "Opponent and position context"), ("INJURIES", "Availability and opportunity"),
                 ("ENVIRONMENT", "Pace, venue, weather"), ("MARKET", "Available lines and prices")]
        for i, (t, b) in enumerate(items):
            col, row = i % 3, i // 3
            x, y = 110 + col*580, 280 + row*300
            card(d, (x, y, x+520, y+230), t, b, GREEN if i < 3 else ORANGE)
    save("04-signals.png", signals)

    screenshot_scene("05-board.png", "Scan the board, then inspect the evidence", "app-props-board-viewport.png", (200, 80, 1740, 1000))

    def example(im, d):
        label(d, "Illustrative example")
        d.rounded_rectangle((235, 255, 1685, 850), radius=32, fill="#f7f8f7", outline="#4b5650", width=3)
        d.text((300, 315), "STARTING PITCHER · STRIKEOUTS", font=font(24, True, True), fill="#667068")
        d.text((300, 390), "Over 6.5", font=font(88, True), fill="#172019")
        d.text((300, 540), "DIRECTION", font=font(18, True, True), fill="#6a746d")
        d.text((300, 585), "OVER", font=font(58, True), fill="#0d8e60")
        d.text((1120, 540), "CONFIDENCE", font=font(18, True, True), fill="#6a746d")
        d.text((1120, 585), "72", font=font(120, True, True), fill=ORANGE)
        d.text((1320, 650), "/ 100", font=font(30, True, True), fill="#6a746d")
        center_text(d, "OVER tells you the side · 72 tells you the strength", 900, 37, MUTED)
    save("06-example.png", example)

    def meter(im, d):
        label(d, "Think of it as a model-conviction meter")
        center_text(d, "WEAKER", 300, 34, MUTED)
        d.rounded_rectangle((280, 470, 1640, 590), radius=60, fill="#29322d")
        d.rounded_rectangle((280, 470, 1258, 590), radius=60, fill=GREEN)
        d.ellipse((1195, 430, 1325, 630), fill=WHITE, outline=ORANGE, width=12)
        d.text((1220, 472), "72", font=font(50, True, True), fill=INK)
        d.text((280, 650), "conflicted", font=font(27), fill=MUTED)
        d.text((875, 650), "moderate", font=font(27), fill=MUTED)
        d.text((1490, 650), "stronger", font=font(27), fill=MUTED)
        center_text(d, "Stronger agreement still leaves uncertainty.", 790, 48, WHITE)
    save("07-meter.png", meter)

    def uncertainty(im, d):
        label(d, "Sports outcomes contain real variance")
        items = [("LATE LINEUP CHANGE", "Role can change"), ("MARKET MOVE", "The line can move"),
                 ("EARLY EXIT", "Playing time can disappear"), ("GAME SCRIPT", "Blowouts change opportunity")]
        for i, (t,b) in enumerate(items):
            x = 150 + (i%2)*835; y = 300 + (i//2)*280
            card(d, (x, y, x+760, y+215), t, b, RED)
        center_text(d, "The score starts your research. It does not end it.", 900, 40, WHITE)
    save("08-uncertainty.png", uncertainty)

    def checks(im, d):
        label(d, "When you see a 72, check four things")
        items = [("01", "Direction + line", "Over 6.5 is not over 7.5"), ("02", "Freshness", "Timestamp, injuries, role, market"),
                 ("03", "Underlying signals", "Broad agreement or one outlier?"), ("04", "Platform + payout", "A signal is not the same as value")]
        for i,(n,t,b) in enumerate(items):
            y=265+i*175
            d.rounded_rectangle((185,y,1735,y+135), radius=20, fill=PANEL, outline=LINE, width=2)
            d.text((225,y+26),n,font=font(50,True,True),fill=ORANGE)
            d.text((360,y+22),t,font=font(37,True),fill=WHITE)
            d.text((850,y+31),b,font=font(27),fill=MUTED)
    save("09-checks.png", checks)

    screenshot_scene("10-evidence.png", "Open the reasoning—not just the score", "app-why-this-lean-clean.png", (390, 145, 1710, 910))
    screenshot_scene("11-models.png", "Look for agreement across model families", "app-model-breakdown-clean.png", (390, 130, 1710, 950))

    def raw_scale(im, d):
        label(d, "Inside the model")
        center_text(d, "RAW DIRECTIONAL SCORE", 235, 65)
        d.line((300, 540, 1620, 540), fill=WHITE, width=10)
        d.polygon([(300,540),(350,505),(350,575)], fill=ORANGE)
        d.polygon([(1620,540),(1570,505),(1570,575)], fill=GREEN)
        d.ellipse((925,500,995,570), fill=WHITE)
        d.text((902,600), "50", font=font(45,True,True), fill=WHITE)
        d.text((300,650), "UNDER", font=font(58,True), fill=ORANGE)
        d.text((1390,650), "OVER", font=font(58,True), fill=GREEN)
        center_text(d, "The raw score is centered around 50.", 825, 40, MUTED)
    save("12-raw-scale.png", raw_scale)

    def normalized(im, d):
        label(d, "The product separates direction from strength")
        card(d, (180, 310, 870, 775), "DIRECTION", "Which side does the model favor?\n\nOVER or UNDER", ORANGE)
        card(d, (1050, 310, 1740, 775), "CONFIDENCE", "How strongly do the available signals support that side?\n\n72 / 100", GREEN)
        center_text(d, "A strong UNDER can still carry high confidence.", 865, 43, WHITE)
    save("13-normalized.png", normalized)

    def compare(im, d):
        label(d, "Two different measurements")
        card(d, (170, 310, 870, 790), "PROPELLER CONFIDENCE", "Summarizes model conviction and agreement across signals.", GREEN)
        card(d, (1050, 310, 1750, 790), "IMPLIED PROBABILITY", "Derived from a market price and its associated odds.", ORANGE)
        center_text(d, "Useful together. Not interchangeable.", 875, 48, WHITE)
    save("14-compare.png", compare)

    screenshot_scene("15-product.png", "Direction, confidence, evidence, and market context", "app-real-prop-detail-clean.png", (390, 70, 1710, 1000))

    def workflow(im, d):
        label(d, "The practical rule")
        steps = [("SCAN", "Find stronger signals"), ("INVESTIGATE", "Open the evidence"), ("VERIFY", "Line + latest context"), ("DECIDE", "Act or skip")]
        for i,(t,b) in enumerate(steps):
            x=90+i*460
            card(d,(x,390,x+390,680),t,b,GREEN if i<3 else ORANGE)
            if i<3:
                d.line((x+405,535,x+445,535),fill=MUTED,width=7)
                d.polygon([(x+445,535),(x+426,521),(x+426,549)],fill=MUTED)
        center_text(d, "Skipping is a valid outcome.", 815, 44, MUTED)
    save("16-workflow.png", workflow)

    def definition(im, d):
        label(d, "So what does 72 mean?")
        center_text(d, "72", 190, 260, ORANGE)
        center_text(d, "A comparatively strong directional signal", 565, 55, WHITE)
        d.text((400,760), "NOT a win probability", font=font(38,True), fill=MUTED)
        d.text((1100,760), "NOT a guarantee", font=font(38,True), fill=MUTED)
    save("17-definition.png", definition)

    def end(im, d):
        label(d, "Research the question. Inspect the evidence.")
        center_text(d, "PropellerPicks.com", 300, 92, WHITE)
        center_text(d, "Player-prop research you can inspect.", 470, 48, MUTED)
        d.rounded_rectangle((650,650,1270,760), radius=24, fill=ORANGE)
        d.text((767,674), "SUBSCRIBE FOR THE NEXT GUIDE", font=font(28,True), fill=INK)
        center_text(d, "Informational research only · 21+ where applicable · 1-800-GAMBLER", 900, 25, MUTED)
    save("18-end.png", end)

    def exact_line_check(im, d):
        label(d, "Check 1 · Direction and line")
        center_text(d, "72 CONFIDENCE", 220, 72, ORANGE)
        card(d, (205, 410, 875, 765), "OVER 6.5 STRIKEOUTS", "This is the line the score analyzed.", GREEN)
        card(d, (1045, 410, 1715, 765), "OVER 7.5 STRIKEOUTS", "A different line means a different question.", RED)
        center_text(d, "Same player. Different decision.", 850, 43, WHITE)
    save("09a-line-check.png", exact_line_check)

    def freshness_check(im, d):
        label(d, "Check 2 · Freshness")
        center_text(d, "Is the analysis still current?", 230, 64, WHITE)
        items = [("TIMESTAMP", "When did the analysis run?"),
                 ("MARKET", "Has the line moved?"),
                 ("INJURY", "Has the status changed?"),
                 ("ROLE", "Is the expected usage intact?")]
        for i, (title, body) in enumerate(items):
            x = 145 + (i % 2) * 835
            y = 420 + (i // 2) * 245
            card(d, (x, y, x + 760, y + 190), title, body, ORANGE)
    save("09b-freshness.png", freshness_check)

    def platform_check(im, d):
        label(d, "Check 4 · Platform and payout")
        center_text(d, "The signal can be the same.", 230, 60, WHITE)
        center_text(d, "The economics can be different.", 315, 60, ORANGE)
        names = ["PICK6", "PRIZEPICKS", "UNDERDOG", "SPORTSBOOK"]
        for i, name in enumerate(names):
            x = 85 + i * 460
            card(d, (x, 515, x + 390, 755), name, "Verify the exact line and payout.", GREEN if i < 3 else ORANGE)
        center_text(d, "Direction does not determine value by itself.", 850, 40, MUTED)
    save("09c-platform.png", platform_check)

    # Preserve the original explainer slides before the product-led variants overwrite them.
    base_assets = [
        "01-hook.png", "02-distinction.png", "03-question.png", "04-signals.png",
        "05-board.png", "06-example.png", "07-meter.png", "08-uncertainty.png",
        "09-checks.png", "10-evidence.png", "11-models.png", "12-raw-scale.png",
        "13-normalized.png", "14-compare.png", "15-product.png", "16-workflow.png",
        "17-definition.png", "18-end.png",
    ]
    for asset in base_assets:
        Image.open(OUT / asset).save(OUT / f"base-{asset}")

    # Product-led revision: replace most explainer cards with real walkthrough views.
    confidence_focus_scene(
        "02-distinction.png", "MOBILE APP", "mobile-detail.png",
        (0, 165, 1320, 1680), (820, 250, 1290, 690),
        "Confidence and chance to hit are shown as separate measurements."
    )
    mobile_scene(
        "03-question.png", "Start on the Picks board", "mobile-picks.png", (0, 245, 1320, 2140),
        [("01", "Choose a sport", "The active sport controls the slate."),
         ("02", "Scan the ranked board", "Direction, line, source, and confidence stay together."),
         ("03", "Open a pick", "Tap a row to inspect the full reasoning.")]
    )
    mobile_scene(
        "04-signals.png", "Use the Slate Snapshot to orient yourself", "mobile-slate.png", (0, 260, 1320, 2390),
        [("01", "Check the slate", "Game count, first start time, and available picks."),
         ("02", "Open the best candidate", "The app surfaces props worth investigating."),
         ("03", "Keep context attached", "The line and confidence remain visible.")]
    )
    web_focus_scene(
        "05-board.png", "Scan and sort the desktop Props Board", "app-props-board-viewport.png",
        (200, 65, 1710, 950), "BOARD → PLAYER → PROP DETAIL"
    )
    web_focus_scene(
        "06-example.png", "Open a prop to see the whole decision", "app-real-prop-detail-clean.png",
        (420, 130, 1700, 365), "PLAYER + DIRECTION + LINE + MARKET SNAPSHOT"
    )
    confidence_focus_scene(
        "07-meter.png", "WEB APP", "app-real-prop-detail-clean.png",
        (420, 130, 1700, 535), (875, 365, 1088, 520),
        "The direction is LEAN LESS. The confidence score is 79."
    )
    mobile_scene(
        "08-uncertainty.png", "Check the exact line before anything else", "mobile-detail.png", (0, 200, 1320, 1820),
        [("01", "Read the direction", "MORE or LESS appears beside the line."),
         ("02", "Confirm the number", "A move from 6.5 to 7.5 changes the question."),
         ("03", "Review recent results", "Use the game log as context, not certainty.")]
    )
    mobile_scene(
        "09-checks.png", "Filter the board without losing context", "mobile-controls.png", (0, 865, 1320, 2865),
        [("01", "Sort by confidence", "Use the score to prioritize research."),
         ("02", "Choose a market", "Narrow the board to the stat you understand."),
         ("03", "Match your platform", "Line sources can show different numbers.")]
    )
    web_focus_scene(
        "10-evidence.png", "Read Why This Lean", "app-why-this-lean-clean.png",
        (390, 180, 1710, 940), "ROLE + MATCHUP + FORM + LINE CONTEXT"
    )
    web_focus_scene(
        "11-models.png", "Check agreement across model families", "app-model-breakdown-clean.png",
        (390, 170, 1710, 990), "BROAD AGREEMENT IS MORE INFORMATIVE"
    )
    web_focus_scene(
        "12-raw-scale.png", "See how raw direction becomes confidence", "how-it-works.png",
        (60, 170, 1860, 1000), "RAW SCORE → DIRECTION + NORMALIZED STRENGTH"
    )
    mobile_scene(
        "13-normalized.png", "Separate confidence from predicted hit chance", "mobile-model-read.png", (0, 600, 1320, 2865),
        [("01", "Read the confidence", "This summarizes conviction in the displayed side."),
         ("02", "Read chance to hit separately", "It is a different estimate with a different meaning."),
         ("03", "Inspect the signal mix", "See which inputs are doing the work.")]
    )
    web_focus_scene(
        "14-compare.png", "Compare the model with the available market", "app-real-prop-detail-clean.png",
        (1285, 130, 1710, 945), "IMPLIED PROBABILITY COMES FROM PRICE"
    )
    mobile_scene(
        "15-product.png", "Find a player or narrow the slate", "mobile-search.png", (0, 420, 1320, 2520),
        [("01", "Search by player", "Jump directly to the props you care about."),
         ("02", "Keep confidence visible", "Every result carries its score and line."),
         ("03", "Open the detail", "Verify the reasoning before deciding.")]
    )
    mobile_scene(
        "16-workflow.png", "A simple new-user workflow", "mobile-picks.png", (0, 755, 1320, 2660),
        [("01", "SCAN", "Use confidence to choose what to inspect first."),
         ("02", "OPEN", "Review line, game log, and model read."),
         ("03", "VERIFY", "Check current information and your platform."),
         ("04", "DECIDE OR SKIP", "Skipping is always a valid outcome.")]
    )

    # Thumbnail: exact 72-confidence example; no contradictory product values.
    thumb, td = canvas()
    td.rounded_rectangle((900, 205, 1815, 925), radius=34, fill="#f7f8f7", outline=ORANGE, width=8)
    td.text((965, 275), "PITCHER STRIKEOUTS", font=font(28, True, True), fill="#667068")
    td.text((965, 360), "OVER 6.5", font=font(82, True), fill="#172019")
    td.text((965, 525), "DIRECTION", font=font(20, True, True), fill="#6a746d")
    td.text((965, 570), "OVER", font=font(60, True), fill="#0d8e60")
    td.text((1405, 525), "CONFIDENCE", font=font(20, True, True), fill="#6a746d")
    td.text((1405, 565), "72", font=font(125, True, True), fill=ORANGE)
    td.text((120, 240), "72%", font=font(250, True, True), fill=ORANGE)
    td.text((125, 540), "CONFIDENCE", font=font(70, True), fill=WHITE)
    td.text((125, 635), "WHAT IT", font=font(70, True), fill=WHITE)
    td.text((125, 730), "ACTUALLY MEANS", font=font(70, True), fill=WHITE)
    td.rounded_rectangle((125, 850, 770, 925), radius=20, fill=RED)
    td.text((175, 862), "NOT WIN PROBABILITY", font=font(34, True), fill=INK)
    thumb.save(ROOT / "thumbnail.png", quality=95)

    # Strict semantic cut: each visual matches the words spoken during its interval.
    # Product captures appear only when their visible content illustrates that exact
    # workflow concept; invented 72/OVER/6.5 values never share a frame with a
    # different real score, side, line, or stat.
    timeline = [
        ("base-01-hook.png", 7.280),
        ("base-02-distinction.png", 19.400),
        ("base-03-question.png", 7.120),
        ("base-04-signals.png", 19.300),
        ("11-models.png", 9.020),
        ("base-13-normalized.png", 5.920),
        ("base-06-example.png", 16.040),
        ("base-02-distinction.png", 13.140),
        ("base-07-meter.png", 17.500),
        ("base-08-uncertainty.png", 19.220),
        ("base-16-workflow.png", 4.040),
        ("base-09-checks.png", 3.080),
        ("09a-line-check.png", 13.520),
        ("09b-freshness.png", 9.580),
        ("10-evidence.png", 10.480),
        ("11-models.png", 7.280),
        ("09c-platform.png", 16.040),
        ("base-12-raw-scale.png", 12.040),
        ("base-13-normalized.png", 20.100),
        ("base-13-normalized.png", 11.420),
        ("base-14-compare.png", 18.680),
        ("base-16-workflow.png", 12.340),
        ("05-board.png", 7.560),
        ("base-16-workflow.png", 6.140),
        ("10-evidence.png", 10.480),
        ("base-17-definition.png", 20.780),
        ("05-board.png", 6.120),
        ("10-evidence.png", 7.640),
        ("base-18-end.png", 10.440),
    ]
    with (OUT / "timeline.tsv").open("w") as f:
        for name, duration in timeline:
            f.write(f"{name}\t{duration}\n")

    # Build a full, approximately timed caption file from the exact narration.
    script = (ROOT / "script.md").read_text()
    narration = script.split("## Final narration", 1)[1].strip()
    narration = re.sub(r"\*\*", "", narration)
    narration = re.sub(r"\n+", " ", narration).strip()
    (ROOT / "transcript.txt").write_text(narration + "\n")
    sentences = re.split(r"(?<=[.!?])\s+", narration)
    chunks = []
    for sentence in sentences:
        words = sentence.split()
        while len(words) > 14:
            cut = 14
            for j in range(min(14, len(words)-1), 7, -1):
                if words[j-1].endswith((",", ";", ":")):
                    cut = j
                    break
            chunks.append(" ".join(words[:cut]))
            words = words[cut:]
        if words:
            chunks.append(" ".join(words))
    weights = [max(4, len(re.findall(r"\w+", chunk))) for chunk in chunks]
    total_weight = sum(weights)
    cursor = 0.0
    captions = []
    for chunk, weight in zip(chunks, weights):
        duration = 341.7 * weight / total_weight
        captions.append((cursor, cursor + duration, chunk))
        cursor += duration
    def ts(v):
        h=int(v//3600); m=int((v%3600)//60); s=int(v%60); ms=int(round((v-int(v))*1000))
        return f"{h:02}:{m:02}:{s:02},{ms:03}"
    with (ROOT / "captions.srt").open("w") as f:
        for i,(start,end,text) in enumerate(captions,1):
            f.write(f"{i}\n{ts(start)} --> {ts(end)}\n{text}\n\n")


if __name__ == "__main__":
    build()
