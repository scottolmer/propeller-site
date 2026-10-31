# Analyzer Desk template

The Desk is the selected `/analyzer/` research-result template. It uses the site’s Familjen Grotesk, IBM Plex Sans and IBM Plex Mono fonts and the approved navy/cream/orange palette. The homepage, five-sport public cards, signup/save panel and query handoff remain owned by their existing code.

## Data and rendering

`assets/js/analyzer-desk.js` consumes the existing NFL public-research response at the established `researchChatMount` seam. The old shared chat renderer remains available as a fallback and continues to own the homepage showcase. No new endpoint, model call, paid tool, or access policy is introduced.

The Desk renders the selected returned prop, a deterministic data summary, the signal scores allowed by the existing conversation’s public/free blocks, filtered dated history, and an explicit quote-verification gap. Selecting another prop binds the direction, confidence, stat history and signals to that record. Summary-only props never expose injected signals or logs. Signal rationales, weights, injuries, quote terms and prices are not invented.

The current API does not return the approved prototype’s OpenAI brief, detailed signal reasons, or verified cross-platform offers. Those need a separate backend integration. The UI labels its current brief as a data summary and does not promise the prototype’s proposed daily allowances.

Historical views deliberately include older returned rows for **full-preview records**, as requested in the selected design. They show exact dates and teams, maintain an explicit season filter and never describe them as recent/current-season games by default. Invalid dates, null/blank values, and observations on/after the earlier of the read date and today are excluded. Older public rows were previously hidden by the old chart’s freshness guard; summary-only visibility remains unchanged. Filters do not rewrite the full-sample summary. Results above, below and equal to the selected line are distinct; workload uses pass attempts, rush attempts or targets according to the market.

The public-board notice describes a different recorded line without asserting that a verified equivalent quote moved. Platform and period identity are unavailable in this contract.

## Local review

Run a static server from the worktree and open:

`http://127.0.0.1:8816/analyzer/?sport=nfl&q=Jacoby%20Brissett&researchFixture=full`

The existing `researchFixture=full|summary|down` hook works only on loopback hosts; full and summary render a visible layout-test-data notice. These are examples for layout testing, not current research. Normal requests use the existing stored public API. No LLM call is made by the renderer.

Targeted checks:

```
node --test scripts/test_analyzer_desk.mjs scripts/test_analyzer_research.mjs scripts/test_research_chat.mjs scripts/test_analyzer_events.mjs scripts/test_analyzer_save_panel.mjs scripts/test_analyzer_sport_query.mjs scripts/test_analyzer_availability.mjs scripts/test_analyzer_webmcp.mjs scripts/test_research_handoff.mjs
```

Deployment is separate from preparing this replacement. The private design comparisons and original Version B remain preserved outside this production source worktree.
