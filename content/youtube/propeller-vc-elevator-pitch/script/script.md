# Final script and production notes

## Narration

Sports research is fragmented. Fans jump between lines, depth charts, injury news, matchup notes, and social feeds—then decide without inspecting the reasoning.

Propeller Picks is building the research layer for player props and fantasy—an AI-assisted workspace answering, “Why this player, at this line, right now?”

The free Prop Analyzer shows a sport, player, market, line, direction, and freshness before a conclusion.

Technically, it is an explainable weighted ensemble, not one opaque prediction. Only available sport-specific signals contribute, then sport-specific calibration combines them. Recent form is recency-weighted; trend and consistency measures account for momentum and volatility. Market context uses no-vig probability normalization, while injury-cascade logic catches role changes.

That is the wedge: not a black-box pick, but a transparent workflow—current line context, sport-specific signals, and reasoning users can inspect on every screen. The free Analyzer earns discovery; the broader workspace makes that research repeatable.

That evidence becomes a 50-to-100 directional confidence score: signal strength, not a win probability or guarantee.

The product expands beyond player props. For MLB hitters, Propeller Fantasy delivers DraftKings-scoring floor, point projection, and ceiling views for fantasy research.

The product is built on documented methodology and an honest view of uncertainty.

Growth is steady and climbing through organic search, as more people discover Propeller around the research questions it was built to answer.

Propeller Picks is building trusted research infrastructure for the moments when context matters most.

## Claim sources

- `data/product-facts.json` — product definition, no-wager position, public
  Analyzer, sport-specific signal policy, and directional confidence semantics.
- `data/fantasy-product-facts.json` — MLB hitter fantasy scope, DraftKings
  scoring, floor/point/ceiling, and exclusions.
- `docs/seo/research-and-media-brief.md` — archive limitation and
  responsible-use language.
- `/Users/scottolmer/Projects/nfl-betting-system/docs/MLB_SPEC.md` and
  `api/services/analysis_service.py` — weighted ensemble and calibration,
  no-vig normalization, recency weighting, trend slope, consistency /
  coefficient-of-variation, and injury-cascade implementation references.
