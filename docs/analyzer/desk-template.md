# Analyzer Desk template

The Desk is the selected `/analyzer/` research-result template. It uses the site's Familjen Grotesk, IBM Plex Sans and IBM Plex Mono fonts and the approved navy/cream/orange palette. The homepage, five-sport public cards, signup/save panel and query handoff retain their existing owners. Private comparisons and Version B remain preserved outside this source worktree.

## Evidence and brief

`assets/js/analyzer-desk.js` mounts at `researchChatMount`; the previous shared chat renderer remains the fallback and owns the homepage showcase. `analyzer-research.js` supports stored NFL and NBA lookups. Other sports retain their existing cards. A successful Desk lookup suppresses the small board's contradictory empty-results message without hiding available cards.

Full preview records may include the MCP's shared recorded-agent `analysis` projection. The renderer requires matching source analysis ID and timestamp. A full canonical preview shows all returned signals, including opposing and neutral components. Reasons require an exact name, score and direction match to the same recorded source. Summary-only records suppress injected scores, reasons, history and generation. Missing reasons, weights, player status and prices remain unknown.

The initial live brief is a labeled deterministic data summary. The loopback saved-example preview immediately displays the original reviewed OpenAI brief, with matching source/timestamp provenance; it does not call a model. **Generate analyst brief** sends only player and exact source ID to `POST /api/social/research/{sport}/brief`. The server rereads public admission, constructs evidence, reserves budget and generates narrative. Keys, model instructions, evidence and quotas stay on the server. Typing, page loads, prop selection and history filters never trigger generation. There is no automatic retry. Late responses after a selection change or destruction cannot replace the current record.

Generated text is labeled AI, escaped, and accepted only with matching provenance. The response includes model, generation time and evidence hash. Failures preserve saved research; exhausted anonymous allowance offers registration. Proposed membership quotas are not hardcoded policy. The marketing page sends anonymous requests; account bearer-token admission is available on the API for the account workspace.

## History and market identity

Exact dates and teams remain visible. Invalid/null values and observations on/after the earlier of read date and today are excluded. Season and venue filters do not manufacture observations; above/below/equal counts are distinct. Available workload follows the market. History includes the bounded available cross-season sample for full previews. Game buttons inspect individual appearances; all/recent-two/current-season and venue filters update the chart, totals and source table, and an empty filtered sample offers a reset. NBA's adapter returns no history rather than inferring it from another source.

The market table compares returned offers only for the same event and stat family, identifying different lines, periods, variants and market identifiers. Known platform, period, variant and quote timestamps come from each exact source record. A different recorded line is not called movement of a verified equivalent offer. Missing odds or payout prevent value, fair-price and staking conclusions.

## Local review and validation

Loopback-only `researchFixture=full|summary|down` uses labeled layout examples. `researchPreview=1` selects a loopback review API; it is ignored on public hosts. The private server replays the approved saved MCP example: five signals, four dated 2025 Green Bay appearances, three distinct recorded offers, and the original reviewed OpenAI brief. This replaces the incomplete public-lookup demo without relabeling older history as current. It provides source links to the exact saved model input, MCP capture and reviewed output. It has no credentials or paid generation capability.

```sh
node --test scripts/test_analyzer_desk.mjs scripts/test_analyzer_research.mjs scripts/test_research_chat.mjs scripts/test_analyzer_events.mjs scripts/test_analyzer_save_panel.mjs scripts/test_analyzer_sport_query.mjs scripts/test_analyzer_availability.mjs scripts/test_analyzer_webmcp.mjs scripts/test_research_handoff.mjs
```

100 targeted website checks passed. Desktop and 390px phone review passed; page width and scroll width both measured 390px. Backend activation is documented in its task worktree's `docs/analyzer-evidence-bridge.md`. No public deployment or production activation occurred.

## Concise default view

The initial view now prioritizes the takeaway, all recorded signals, historical chart and compact offer comparison. The complete original analyst prose and checklist remain inside **Read the analysis**; quote fields and source timestamps remain inside **Quote details & timestamps**. No generated answer or captured source data was rewritten.

The hero introduction is one sentence, redundant timestamps and instructional copy are consolidated, and the existing page guides/FAQs remain accessible through **How the analyzer works & FAQs**. The player-help fragment opens that disclosure before navigating. Site fonts and the existing research interactions are retained. The fuller prior presentation is saved outside the repository in the private artifact directory's `desk-before-distill` snapshot.

## Offer comparison removed

The user requested removal of Compare offers. The Desk no longer renders the offer table or quote-detail disclosure; the historical chart spans the available width. The prop selector and analyst narrative retain their existing behavior.

## Open research from a result card

Unlocked NFL/NBA search results have a keyboard-accessible card link and View analysis action, separate from the prompt builder. The destination carries the exact player, stat, line, direction and available offer/source identity. The research controller resolves exactly one matching returned prop and passes its index to the Desk; missing or ambiguous matches show a message instead of selecting another prop. Summary records retain their existing restrictions, locked cards retain signup, and unsupported sports keep their current behavior. Opening a result performs saved-data reads only; generation remains an explicit separate action. New input, clearing and sport changes invalidate pending selection, including during the initial feed load.
