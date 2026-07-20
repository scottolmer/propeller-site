#!/usr/bin/env python3
"""Build polished, interface-led frames for the v6 confidence walkthrough."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import math
import random


ROOT = Path(__file__).resolve().parent
CAP = ROOT / "captures"
OUT = ROOT / "walkthrough-visuals"
OUT.mkdir(exist_ok=True)

DESKTOP_DETAIL = CAP / "app-real-prop-detail-clean.png"
DESKTOP_BOARD = CAP / "app-props-board-viewport.png"
DESKTOP_WHY = CAP / "app-why-this-lean-clean.png"
DESKTOP_AGENTS = CAP / "app-model-breakdown-clean.png"
MOBILE_DETAIL = CAP / "mobile-detail.png"
MOBILE_MODEL = CAP / "mobile-model-read.png"
MOBILE_PICKS = CAP / "mobile-picks.png"
IPAD_MODEL = Path(
    "/Users/scottolmer/Projects/nfl-betting-system/mobile/app-store-screenshots/"
    "raw/ipad-13/07-model-read.png"
)

W, H = 1920, 1080
BG = "#06080d"
PAPER = "#f7f6f1"
WHITE = "#f4f7fb"
MUTED = "#a8b5c4"
ORANGE = "#f97316"
GREEN = "#10b981"
INK = "#111827"

DISPLAY = "/System/Library/Fonts/Supplemental/Avenir Next.ttc"
MONO = "/System/Library/Fonts/SFNSMono.ttf"


def font(size: int, bold: bool = False, mono: bool = False):
    path = MONO if mono else DISPLAY
    index = 1 if bold and not mono else 0
    return ImageFont.truetype(path, size=size, index=index)


def background() -> Image.Image:
    im = Image.new("RGB", (W, H), BG)
    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((1040, -460, 2320, 820), fill=95)
    glow = glow.filter(ImageFilter.GaussianBlur(190))
    color = Image.new("RGB", (W, H), "#3a160c")
    im = Image.composite(color, im, glow)
    d = ImageDraw.Draw(im, "RGBA")
    for x in range(-H, W, 160):
        d.line((x, H, x + H, 0), fill=(255, 255, 255, 7), width=1)
    random.seed(9)
    for _ in range(850):
        x, y = random.randrange(W), random.randrange(H)
        a = random.randrange(5, 17)
        d.point((x, y), fill=(255, 255, 255, a))
    return im


def header(im: Image.Image, eyebrow: str, title: str, platform: str = ""):
    d = ImageDraw.Draw(im)
    d.ellipse((58, 48, 76, 66), fill=ORANGE)
    d.line((67, 57, 67, 31), fill=ORANGE, width=7)
    d.line((67, 57, 45, 71), fill=ORANGE, width=7)
    d.line((67, 57, 89, 71), fill=ORANGE, width=7)
    d.text((108, 35), "PROPELLER", font=font(25, True), fill=WHITE)
    d.text((109, 66), "P I C K S", font=font(12, True, True), fill=ORANGE)
    d.text((70, 132), eyebrow.upper(), font=font(17, True, True), fill=ORANGE)
    d.text((70, 171), title, font=font(54, True), fill=WHITE)
    if platform:
        box = d.textbbox((0, 0), platform.upper(), font=font(15, True, True))
        width = box[2] - box[0] + 42
        d.rounded_rectangle((W - width - 70, 55, W - 70, 101), radius=23,
                            fill="#151a22", outline="#35404d", width=2)
        d.text((W - width - 49, 69), platform.upper(), font=font(15, True, True), fill=MUTED)


def rounded_image(source: Image.Image, size: tuple[int, int], radius: int = 24) -> Image.Image:
    source = source.resize(size, Image.Resampling.LANCZOS)
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.paste(source.convert("RGBA"), (0, 0), mask)
    return out


def shadow_panel(im: Image.Image, box: tuple[int, int, int, int], radius: int = 30,
                 fill: str = PAPER, outline: str = "#313a46"):
    x1, y1, x2, y2 = box
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x1 + 18, y1 + 24, x2 + 18, y2 + 24), radius=radius,
                         fill=(0, 0, 0, 165))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    im.paste(shadow, (0, 0), shadow)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def browser(im: Image.Image, source_path: Path, box: tuple[int, int, int, int],
            crop: tuple[int, int, int, int] | None = None, focus=None):
    x1, y1, x2, y2 = box
    shadow_panel(im, box, radius=24, fill="#e9edf2")
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((x1, y1, x2, y1 + 48), radius=24, fill="#151a22")
    d.rectangle((x1, y1 + 25, x2, y1 + 48), fill="#151a22")
    for i, color in enumerate(("#ff6b5f", "#f8c34f", "#42c77a")):
        d.ellipse((x1 + 22 + i * 26, y1 + 17, x1 + 34 + i * 26, y1 + 29), fill=color)
    d.rounded_rectangle((x1 + 140, y1 + 12, x2 - 34, y1 + 36), radius=12, fill="#222a35")
    d.text((x1 + 164, y1 + 15), "app.propellerpicks.com", font=font(13, mono=True), fill="#98a5b4")
    src = Image.open(source_path).convert("RGB")
    if crop:
        src = src.crop(crop)
    target = (x2 - x1 - 20, y2 - y1 - 66)
    src.thumbnail(target, Image.Resampling.LANCZOS)
    sx = x1 + 10 + (target[0] - src.width) // 2
    sy = y1 + 56 + (target[1] - src.height) // 2
    plate = Image.new("RGB", target, "#eef1f5")
    plate.paste(src, ((target[0] - src.width) // 2, (target[1] - src.height) // 2))
    im.paste(plate, (x1 + 10, y1 + 56))
    if focus:
        fx1, fy1, fx2, fy2 = focus
        d.rounded_rectangle((x1 + fx1, y1 + 56 + fy1, x1 + fx2, y1 + 56 + fy2),
                            radius=16, outline=ORANGE, width=7)


def phone(im: Image.Image, source_path: Path, box: tuple[int, int, int, int],
          crop: tuple[int, int, int, int] | None = None):
    x1, y1, x2, y2 = box
    shadow_panel(im, (x1, y1, x2, y2), radius=55, fill="#050608", outline="#49515c")
    src = Image.open(source_path).convert("RGB")
    if crop:
        src = src.crop(crop)
    target_w, target_h = x2 - x1 - 30, y2 - y1 - 30
    src.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
    framed = rounded_image(src, (src.width, src.height), 34)
    px = x1 + (x2 - x1 - src.width) // 2
    py = y1 + (y2 - y1 - src.height) // 2
    im.paste(framed, (px, py), framed)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((x1, y1, x2, y2), radius=55, outline="#626b78", width=4)


def callout(im: Image.Image, x: int, y: int, number: str, title: str, body: str,
            color: str = ORANGE, width: int = 520):
    d = ImageDraw.Draw(im)
    d.line((x + 22, y + 55, x + 22, y + 160), fill=color, width=3)
    d.ellipse((x, y, x + 44, y + 44), fill=color)
    nb = d.textbbox((0, 0), number, font=font(18, True, True))
    d.text((x + 22 - (nb[2] - nb[0]) / 2, y + 11), number, font=font(18, True, True), fill=BG)
    d.text((x + 68, y - 3), title, font=font(29, True), fill=WHITE)
    words = body.split()
    lines, line = [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if d.textlength(trial, font=font(21)) > width - 70 and line:
            lines.append(line)
            line = word
        else:
            line = trial
    if line:
        lines.append(line)
    d.multiline_text((x + 68, y + 48), "\n".join(lines), font=font(21), fill=MUTED, spacing=8)


def tag(im: Image.Image, x: int, y: int, text: str, color: str = ORANGE):
    d = ImageDraw.Draw(im)
    tw = d.textlength(text.upper(), font=font(15, True, True))
    d.rounded_rectangle((x, y, x + tw + 36, y + 42), radius=21, fill=color)
    d.text((x + 18, y + 11), text.upper(), font=font(15, True, True), fill=BG)


def save(name: str, im: Image.Image):
    im.save(OUT / name, quality=95)


def desktop_scene(name, eyebrow, title, source, crop, note_title, note_body):
    im = background(); header(im, eyebrow, title, "Desktop")
    browser(im, source, (585, 270, 1845, 1000), crop)
    callout(im, 80, 390, "01", note_title, note_body, width=470)
    save(name, im)


def mobile_scene(name, eyebrow, title, source, crop, note_title, note_body):
    im = background(); header(im, eyebrow, title, "Mobile companion")
    phone(im, source, (1150, 235, 1795, 1035), crop)
    callout(im, 90, 390, "01", note_title, note_body, GREEN, width=840)
    save(name, im)


def build():
    # Hero: real platforms establish the visual language immediately.
    im = background(); header(im, "Confidence score walkthrough", "What does 72 confidence mean?", "Desktop + mobile")
    browser(im, DESKTOP_DETAIL, (70, 300, 1380, 970), (380, 110, 1715, 770))
    phone(im, MOBILE_DETAIL, (1395, 220, 1825, 1015), (0, 160, 1320, 1790))
    tag(im, 1230, 330, "not win probability")
    save("01-hero.png", im)

    im = background(); header(im, "One historical example", "The same prop on both platforms", "79 confidence · LESS 0.5 RBIs")
    browser(im, DESKTOP_DETAIL, (70, 300, 1280, 980), (390, 125, 1710, 720))
    phone(im, MOBILE_DETAIL, (1320, 230, 1810, 1025), (0, 190, 1320, 1470))
    tag(im, 1120, 325, "same structure")
    save("02-same-prop.png", im)

    desktop_scene("03-board.png", "Step 1 · Scan", "Start on the Props Board", DESKTOP_BOARD,
                  (205, 70, 1735, 960), "Everything stays attached",
                  "Player, stat, line, direction, source, and confidence remain in one research row.")

    desktop_scene("04-detail.png", "Step 2 · Open", "Move from the board to Prop Detail", DESKTOP_DETAIL,
                  (390, 100, 1710, 910), "Open the full analysis",
                  "The detail page organizes the recommendation, recent results, market context, and evidence.")

    im = background(); header(im, "Direction + line", "On desktop, the line appears in three places", "Desktop")
    browser(im, DESKTOP_DETAIL, (520, 280, 1830, 980), (410, 125, 1715, 760))
    callout(im, 75, 360, "01", "Top recommendation", "LESS and 0.5 must be read together.", ORANGE, 405)
    callout(im, 75, 575, "02", "Summary card", "The recommendation card repeats the exact line.", GREEN, 405)
    callout(im, 75, 790, "03", "Market panel", "Verify the number again before using the analysis.", ORANGE, 405)
    save("05-desktop-line.png", im)

    mobile_scene("06-mobile-line.png", "Direction + line", "Mobile repeats the exact line in Line Check", MOBILE_DETAIL,
                 (0, 210, 1320, 1500), "LESS 0.5",
                 "The line sits beside the stat and appears again in Line Check with the market average.")

    im = background(); header(im, "Confidence", "Desktop: confidence has its own summary card", "Desktop")
    browser(im, DESKTOP_DETAIL, (880, 300, 1795, 975), (780, 300, 1185, 640))
    callout(im, 90, 415, "79", "Model conviction", "This historical prop shows 79 confidence. A score of 72 is interpreted the same way.", GREEN, 470)
    save("07-desktop-confidence.png", im)

    im = background(); header(im, "Confidence", "Mobile: the same score stays easy to find", "Mobile companion")
    phone(im, MOBILE_DETAIL, (1165, 220, 1805, 1030), (0, 185, 1320, 1900))
    callout(im, 80, 365, "01", "Confidence ring", "The primary score appears at the upper right of Pick Detail.", ORANGE, 850)
    callout(im, 80, 610, "02", "Model Read", "The score appears again beside the model explanation.", GREEN, 850)
    save("08-mobile-confidence.png", im)

    mobile_scene("09-mobile-distinction.png", "Two measurements", "Confidence is not chance to hit", MOBILE_DETAIL,
                 (0, 1580, 1320, 2780), "Read them separately",
                 "79% confidence summarizes conviction. 59% chance to hit is shown as a different estimate.")

    desktop_scene("10-why.png", "Evidence", "Read Why This Lean before deciding", DESKTOP_WHY,
                  (390, 165, 1710, 940), "Readable reasons",
                  "Recent usage, matchup context, role, and performance against the line become inspectable evidence.")

    desktop_scene("11-desktop-agents.png", "Agent breakdown", "See which analysis agents support the direction", DESKTOP_AGENTS,
                  (390, 500, 1320, 1010), "Independent contributors",
                  "Market, hit rate, injury, matchup, ballpark, usage, and lineup agents are listed separately.")

    im = background(); header(im, "Mobile model read", "Drivers, agreement, signal mix, then agents", "iOS companion")
    phone(im, IPAD_MODEL, (690, 245, 1830, 1015), (20, 1320, 2040, 2700))
    callout(im, 80, 350, "01", "Top driver", "See the factor carrying the most weight.", ORANGE, 520)
    callout(im, 80, 555, "02", "Signal mix", "See how the evidence is distributed.", GREEN, 520)
    callout(im, 80, 760, "03", "Agent breakdown", "Continue down to inspect each contributing agent.", ORANGE, 520)
    save("12-mobile-agents.png", im)

    im = background(); header(im, "Confidence in context", "Stronger evidence still leaves uncertainty", "Research workflow")
    browser(im, DESKTOP_DETAIL, (570, 285, 1835, 985), (390, 120, 1710, 940))
    callout(im, 70, 345, "01", "Lineups change", "Expected roles can change after analysis runs.", ORANGE, 450)
    callout(im, 70, 545, "02", "Markets move", "A new line creates a different question.", GREEN, 450)
    callout(im, 70, 745, "03", "Variance remains", "Even well-supported reads can miss.", ORANGE, 450)
    save("13-uncertainty.png", im)

    # Reusable workflow frames keep the interface on screen instead of reverting to slides.
    desktop_scene("14-flow-board.png", "New-user workflow · 1", "Scan the board and open a prop", DESKTOP_BOARD,
                  (205, 70, 1735, 960), "Start broad", "Use confidence to prioritize what deserves a closer look.")
    mobile_scene("15-flow-line.png", "New-user workflow · 2", "Confirm direction and exact line", MOBILE_DETAIL,
                 (0, 210, 1320, 1450), "LESS 0.5 RBIs", "Direction and line define the question being analyzed.")
    im = background(); header(im, "New-user workflow · 3", "Find confidence on desktop and mobile", "Both platforms")
    browser(im, DESKTOP_DETAIL, (70, 340, 1180, 930), (640, 320, 1190, 610))
    phone(im, MOBILE_DETAIL, (1250, 245, 1800, 1015), (650, 190, 1320, 920))
    tag(im, 925, 365, "same score")
    save("16-flow-confidence.png", im)
    im = background(); header(im, "New-user workflow · 4", "Inspect the reasons and contributing agents", "Desktop + mobile")
    browser(im, DESKTOP_AGENTS, (70, 310, 1165, 965), (390, 470, 1320, 1015))
    phone(im, IPAD_MODEL, (1240, 250, 1810, 1020), (20, 1320, 2040, 2700))
    tag(im, 1010, 340, "inspect evidence")
    save("17-flow-agents.png", im)
    mobile_scene("18-flow-verify.png", "New-user workflow · 5", "Verify the current line and context", MOBILE_DETAIL,
                 (0, 500, 1320, 1550), "Line Check", "If the platform line moved, the original analysis may answer a different question.")

    im = background(); header(im, "The practical decision", "Research further—or skip", "No forced picks")
    browser(im, DESKTOP_BOARD, (70, 300, 1320, 980), (205, 70, 1735, 960))
    phone(im, MOBILE_PICKS, (1370, 225, 1810, 1020), (0, 700, 1320, 2500))
    callout(im, 760, 745, "✓", "Skipping is valid", "Confidence organizes research. It does not require action.", GREEN, 520)
    save("19-skip.png", im)

    im = background(); header(im, "The definition", "72 = a comparatively strong directional signal", "Not a probability")
    browser(im, DESKTOP_DETAIL, (70, 315, 1250, 965), (390, 120, 1710, 820))
    phone(im, MOBILE_DETAIL, (1320, 230, 1810, 1020), (0, 185, 1320, 1750))
    tag(im, 1010, 355, "not 72% chance")
    tag(im, 1010, 415, "not a guarantee", GREEN)
    save("20-definition.png", im)

    im = background(); header(im, "One analysis system", "Deep research on desktop. Quick access on mobile.", "Propeller Picks")
    browser(im, DESKTOP_BOARD, (70, 315, 1280, 975), (205, 70, 1735, 960))
    phone(im, MOBILE_DETAIL, (1320, 225, 1810, 1020), (0, 180, 1320, 1880))
    tag(im, 1110, 350, "propellerpicks.com")
    save("21-close.png", im)

    im = background(); header(im, "Responsible use", "Research and analysis—not a sportsbook", "Informational only")
    d = ImageDraw.Draw(im)
    d.text((110, 370), "21+ where applicable", font=font(67, True), fill=WHITE)
    d.text((110, 485), "If gambling is a problem, call", font=font(34), fill=MUTED)
    d.text((110, 550), "1-800-GAMBLER", font=font(82, True, True), fill=ORANGE)
    d.line((110, 735, 1780, 735), fill="#2b3440", width=2)
    d.multiline_text((110, 790),
                     "Propeller is a research and analysis tool. We do not accept wagers or operate as a sportsbook.\n"
                     "All analysis is for informational purposes only.",
                     font=font(25), fill=MUTED, spacing=13)
    save("22-disclaimer.png", im)


if __name__ == "__main__":
    build()
