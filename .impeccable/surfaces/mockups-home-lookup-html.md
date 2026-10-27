---
version: 1
slug: "mockups-home-lookup-html"
primary_target: "mockups/home-lookup.html"
related_targets: ["index.html","assets/css/home-lookup.css"]
---

Scope: Propeller Picks public homepage. Visitor mode: persuade a first-time, mobile-first visitor in plain English.

Audience and job: Casual or newer DFS and pick'em users who already have a player in mind. The visitor should be able to look that player up immediately, understand what the research shows, and choose iOS, Android, or web.

Proof and content: Working player search over every analyzer player page; equal App Store and Google Play actions; real phone screens and a cropped web chart with no odds or edge figures; the auto-refreshed graded-rows figure with its repeat-snapshot and retrospective-data disclosure; research-only statements; FAQ with the hidden live-record contract.

Showcase: a hidden-by-default section (`#showcase`, between What you get and Phone and web) mounts the daily NFL research conversation via `assets/js/home-showcase.js` and the shared research chat. It fetches only near the viewport and stays hidden on any failure, so the page is complete without it. Its stamp reads "Written by Claude using Propeller's research tools"; its CTAs (connect MCP, look up another player) live on the page, not inside the chat.

Constraints: Research only; no wagers, outcome promises, calibrated-probability claims, ROI claims, invented testimonials, or unsupported web/mobile parity. Preserve schema, analytics CTA attributes, the shared shell, live-record attributes, generator ownership (`scripts/build_homepage_from_mockup.py`), and app-store URLs. Pricing copy must match the live offer.

Direction and memorable moment: Player Lookup. The product is the homepage: the first screen is a large cream search field on the night ground, and typing a name returns real player research. Full color fields (night, navy, cream, orange) separate sections instead of lines or cards.

Unresolved decisions: None for the homepage build. Shipping and deployment remain separate user-authorized actions.
