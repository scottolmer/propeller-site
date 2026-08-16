---
name: Propeller Picks Replay Room
description: Plain-English player-prop research presented as a midnight broadcast replay room.
colors:
  night: "#031a2c"
  night-2: "#06243a"
  cream: "#f7f1e7"
  orange: "#ff5b23"
  blue: "#54c8ff"
  blue-soft: "#9bddff"
  line: "rgba(84,200,255,.72)"
  muted: "#b8d3df"
typography:
  display:
    fontFamily: "Familjen, 'Arial Narrow', sans-serif"
    fontSize: "clamp(64px, 9vw, 122px)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Plex, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "PlexMono, monospace"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.04em"
rounded:
  cta: "10px"
  control: "12px"
  panel: "14px"
  phone: "28px"
  round: "50%"
spacing:
  compact: "10px"
  control: "14px"
  panel: "24px"
  section: "72px"
  feature-section: "98px"
components:
  store-link:
    backgroundColor: "#021522"
    textColor: "{colors.cream}"
    rounded: "{rounded.control}"
    height: "58px"
    width: "190px"
  primary-cta:
    backgroundColor: "{colors.orange}"
    textColor: "#fff"
    rounded: "{rounded.cta}"
    padding: "0 30px"
    height: "58px"
  replay-panel:
    backgroundColor: "rgba(2,21,34,.6)"
    textColor: "{colors.cream}"
    rounded: "{rounded.panel}"
    padding: "34px 24px 26px"
  score-panel:
    backgroundColor: "transparent"
    textColor: "{colors.orange}"
    rounded: "{rounded.panel}"
    padding: "16px"
---

# Design System: Propeller Picks Replay Room

## Overview

**Creative North Star: "The Replay Room"**

This homepage treats player-prop research like a clear broadcast replay, not a generic SaaS dashboard or a sportsbook. Midnight panels create the analytical room; compressed cream headlines make the plain-English promise feel decisive; orange marks the point of action; electric blue supplies the technical field-line notation. Real product screens are the proof, not decoration.

The composition moves from the big promise to an inspectable three-step sequence—line, Confidence Score, next research action—then into the real desktop and mobile experience. A four-row difference section makes the product's plain-language, single-score, explainable, DFS/pick'em research stance legible before the FAQ. Detailed record context belongs in the fourth FAQ disclosure rather than a standalone performance panel. The page stays firm about what the product is and is not: a research tool, never a wager flow or performance guarantee.

**Key Characteristics:**

- Broadcast-dark, evidence-led, and deliberately non-generic.
- Mobile acquisition and web access receive equal visual legitimacy.
- Large editorial display type is paired with compact mono labels for inspectable detail.
- Thin blue field lines and outlined panels carry structure; orange appears where a decision or emphasis is earned.
- The differentiators are stated as four readable benefit rows, not as unqualified performance proof.

## Colors

The palette is a dark broadcast set with a warm paper-white voice, one orange decision accent, and a blue technical annotation system.

### Primary

- **Propeller Orange** (`#ff5b23`): the decision color for headline emphasis, score numerals, primary web access, and the circular closing mark. Do not use it to imply outcomes.

### Secondary

- **Telestrator Blue** (`#54c8ff`): field lines, panel borders, labels, links, and technical annotations.
- **Soft Signal Blue** (`#9bddff`): a lighter supporting blue token retained for situations needing a softer signal treatment.

### Neutral

- **Replay Night** (`#031a2c`): the default page ground and hero start.
- **Studio Navy** (`#06243a`): the alternate section ground and mobile-navigation surface.
- **Cream Mic** (`#f7f1e7`): primary readable text and display headlines on dark surfaces.
- **Muted Analysis** (`#b8d3df`): disclosures, explanatory body copy, and secondary metadata.
- **Field Line** (`rgba(84,200,255,.72)`): the active technical stroke; use reduced-opacity variants for dividers and grids.

**The Earned Orange Rule.** Orange marks a conclusion, a high-value number, or a direct action. Blue is the default structural accent; do not turn every outline, label, and callout orange.

## Typography

**Display Font:** Familjen with `'Arial Narrow', sans-serif` fallback.
**Body Font:** Plex with `sans-serif` fallback.
**Label/Mono Font:** PlexMono with `monospace` fallback.

**Character:** Familjen is compressed, oversized, and editorial—built for a broadcast headline. Plex is straightforward and readable; PlexMono creates a compact analyst annotation voice without adding betting jargon.

### Hierarchy

- **Display** (700, `clamp(64px, 9vw, 122px)`, `0.84`, `-0.04em`): hero promise; orange span is a separate line.
- **Section headline** (700, `clamp(42px, 7vw, 86px)`, `0.9–0.92`): proof, product, FAQ, and closing headlines.
- **Score number** (700, `70px`, `0.78`): the Confidence Score; set in orange and always paired with its directional limitation.
- **Body** (400, `16–26px`, `1.45–1.7`): plain-English explanation, kept to observed `520–760px` measures where text needs reading room.
- **Label** (600, `11–15px`, compact line-height, often uppercase): eyebrow, score label, signal list, and callouts.

**The Broadcast Pairing Rule.** Use display type for the human takeaway and mono only for a short label, signal, or annotation. Do not set explanatory paragraphs in mono.

## Layout

The desktop container is `min(1180px, calc(100vw - 40px))`, centered. The hero uses generous 56px/72px vertical space and a low-opacity blue horizontal field grid that fades in from the right. Most sections use 72–98px vertical padding and blue divider lines to read as successive broadcast panels.

The hero story is a three-column line → score → next-action sequence with 18px gaps. The product proof pairs copy in a `1.1fr .9fr` grid, then overlays the real phone screen over the desktop screen. The following Difference section is a `.85fr 1.15fr` headline/list grid with a 78px gap: its list is a single blue-top-lined column of four 76px minimum-height rows, each with a blue 30px icon and a display-type benefit. At `760px` and below, the container becomes `min(100% - 28px, 680px)`, stories and Difference content stack, its gap becomes 36px, benefit rows move to 40px/1fr columns with a 68px minimum height, and store actions become two equal columns with the primary web CTA spanning both. At `380px`, the layout tightens only as needed to prevent overflow.

## Elevation & Depth

Depth comes mainly from tonal layering, translucent dark panels, blue strokes, and staged real-device imagery—not a general card-shadow system. Shadows are reserved for interactive store links, the primary CTA, and the product imagery, where they establish the physical screen stack.

### Shadow Vocabulary

- **Store lift** (`0 10px 24px rgba(0,0,0,.22)`): app-store controls; lifts 3px on hover.
- **Primary lift** (`0 12px 30px rgba(255,91,35,.2)`): the orange web-access CTA.
- **Desktop screen** (`0 34px 70px rgba(0,0,0,.4)`): gives the real web interface weight in the product-proof stage.
- **Phone overlay** (`-18px 24px 46px rgba(0,0,0,.48)`): separates the mobile screen from the desktop image beneath it.

**The Evidence-Has-Depth Rule.** Give depth to the real product and to actions, not to every informational panel.

## Shapes

The base form is an outlined broadcast panel: `14px` corners, one-pixel blue border, transparent-to-midnight fill. Controls are softer at `10–12px`; device imagery is more tactile, with a `28px` phone frame. Circles mark steps, icons, and player identity. The closing ring is intentionally imperfect—`52% 48% 46% 54%`, rotated -2 degrees—to suggest a hand-drawn telestrator mark rather than a sterile UI primitive.

## Components

### Store Actions

- **Character:** equal, credible paths to the actual iOS and Android apps.
- **Shape:** `58px` high, minimum `190px` wide, `12px` radius, thin blue border.
- **Default:** near-black-blue fill (`#021522`), cream text, app badge or inline Google Play mark.
- **Hover / Focus:** move up 3px and shift to `#092c44`; keyboard focus uses a 3px orange outline with 4px offset.
- **Mobile:** the two store links occupy equal columns instead of becoming a secondary afterthought.

### Primary Web CTA

- **Character:** direct orange entry point for the web workspace.
- **Shape:** `58px` minimum height, `10px` radius, `0 30px` horizontal padding.
- **Default / Hover:** orange with white Familjen text; lifts 3px on hover. It does not claim an outcome or conversion guarantee.

### Replay Panels

- **Character:** low-gloss broadcast boards for the three-step research story.
- **Shape:** `14px` radius, one-pixel blue outline, `34px 24px 26px` padding, translucent `rgba(2,21,34,.6)` fill.
- **Structure:** a blue circular step marker overlaps the top edge; mono uppercase title anchors each board.

### Confidence Score

- **Character:** a clear directional signal, never a probability gauge.
- **Shape:** orange 2px outlined panel with `14px` radius and `16px` padding.
- **Content rule:** the large orange score is paired with a mono `Confidence Score` label and the qualifying line that it is directional model strength, not a win probability or guarantee.

### Product Proof Stage

- **Character:** real screens, spatially composed as a web workspace with a mobile quick-check overlay.
- **Desktop screen:** blue-bordered 14px frame with a slight `rotateY(2deg)` perspective.
- **Phone screen:** cream-bordered `28px` frame, slightly rotated, placed over the lower-right of the desktop image.
- **Motion:** only when reduced-motion is not requested; reveal elements rise 22px into place and the phone enters once with a short blur-to-clear animation.

### Difference Section

- **Character:** a concise proof-of-fit panel titled “Why Propeller feels different,” placed after product imagery rather than a standalone record summary.
- **Structure:** Studio Navy section with 86px vertical padding, blue top divider, two columns, and four blue-hairlined benefit rows.
- **Rows:** 48px icon lane + 18px gap + cream `clamp(20px, 2.4vw, 29px)` Familjen benefit: no confusing betting jargon; one clear Confidence Score; reasons behind every score; DFS/pick’em research rather than wager placement.
- **Actions:** an outlined 54px-minimum free-analyzer CTA, followed by quieter contextual links to the Confidence Score explainer and AI transparency benchmark. The app-store actions remain the page's primary conversion routes.

### Navigation and FAQ

- **Navigation:** translucent Replay Night with a blue bottom border and `blur(16px)` backdrop. The orange nav CTA is the lone filled nav element. At 1080px and below, the opened menu uses Studio Navy and blue dividers.
- **FAQ:** details rows use blue hairlines, Familjen questions, orange plus signs, and muted Plex answers. The fourth disclosure carries the detailed public-record/methodology context and its hidden live-record data contract; it is not a visible record-strip component. The expansion behavior should stay native and accessible.

## Do's and Don'ts

### Do:

- **Do** lead the hero with a plain-English promise before showing model mechanics.
- **Do** use real desktop and mobile product screens as the main proof asset.
- **Do** keep App Store, Google Play, and web access visible as distinct, real routes.
- **Do** pair the 2.5M+ proof with its scope disclosure and a link to what the number means.
- **Do** retain the explicit research-only boundary: directional signals are not probabilities or guarantees, and Propeller does not accept wagers.
- **Do** use the four Difference rows to explain product fit before routing visitors to the free analyzer, Confidence Score explainer, and AI transparency benchmark.

### Don't:

- **Don't** replace Replay Room with a pale SaaS hero, generic feature-card grid, sportsbook chrome, or invented social proof.
- **Don't** use orange decoratively across the whole interface; reserve it for earned emphasis and action.
- **Don't** turn the Confidence Score or historical rows into ROI, accuracy, or future-outcome claims.
- **Don't** reintroduce a standalone homepage record strip; keep the detailed record evidence in the fourth FAQ disclosure.
- **Don't** bury mobile acquisition behind a web-only primary path.
