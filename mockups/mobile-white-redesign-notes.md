# Propeller White Redesign Notes

These mockups use `/Users/scottolmer/Projects/nfl-betting-system/mockups/mobile` as the iOS visual reference.

## Shared Design Tokens

- Page background: `#edf2f7` to `#f7f9fc`, not pure white.
- Card surface: `#ffffff` with `rgba(15, 23, 42, 0.10)` borders.
- Primary text: `#111827`.
- Secondary text: `#475467`.
- Muted labels: `#667085` and `#98a2b3`.
- Primary action and active states: `#ff6b4a`.
- Positive/confidence: `#16a34a`.
- Warning/movement: `#d97706`.
- Informational: `#2563eb`.
- Typography direction: Avenir Next / SF Pro style, heavy display weights for headers, monospaced numerals for counts, scores, confidence, and lines.

## Web App Mirroring Direction

1. Replace the current heavy dark surface system with the same white/off-white surfaces used in the iOS mockups.
2. Keep desktop information density, but wrap tables and drawers in calmer rounded cards with lower shadows.
3. Use orange for active navigation, selected sports, primary actions, and focused filters.
4. Use green only for confidence/positive model signals, not as the general brand color.
5. Make the top of each web-app page mirror mobile structure: sport rail, date/slate rail, search, then primary content.
6. Keep the left navigation on desktop, but make it quieter: white rail, orange active state, fewer visual borders.
7. Make prop detail drawers look like expanded iOS prop detail cards: summary first, then books/model/history with clearly visible tabs.
8. Make combos/parlays use the same iOS card grammar: leg count badge, confidence score, leg list, and quick build actions.
9. Preserve desktop-only strengths: sortable tables, multi-column filters, and wider comparison views.
10. Avoid marketing-only styling inside the app. The app should feel like an operating surface, not a landing page.

## Homepage Concept Read

- Concept A, Native App Companion: best if the homepage should loudly say web + mobile are one product.
- Concept B, Editorial Proof System: best if trust and the public record should lead the brand.
- Concept C, Operator Dashboard: best if the website should preview the redesigned web app and make the product feel immediately useful.

My recommendation is Concept C for the production homepage direction, with Concept A's stronger phone/web pairing reused lower on the page.
