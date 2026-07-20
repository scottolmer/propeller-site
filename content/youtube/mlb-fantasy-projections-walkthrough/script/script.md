# How to Use Propeller’s MLB Fantasy Projections

## Production brief

- Primary question: How do I use Propeller’s MLB Fantasy projections to compare hitters using floor, projected points, ceiling, and Sit/Start?
- Audience: New and prospective Propeller users, especially fantasy baseball players who want a transparent daily player comparison.
- Search intent: Product tutorial and MLB fantasy projection explainer.
- Learning outcome: The viewer can confirm the slate and scoring basis, interpret all three projection values, sort the board, compare two hitters on desktop and mobile, and understand the product’s limitations.
- Call to action: Open Propeller Picks on web or mobile and run a current MLB Sit/Start comparison.
- Target length: Approximately 5 minutes 15 seconds at the approved Kokoro voice pace; final timing will be conformed to the generated narration.
- Freshness rule: Capture the live product after script approval. Show the current slate date and update status, but do not narrate player names or exact values that can go stale.

## Verified product facts

- The current public fantasy release is MLB hitters only.
- The board displays DraftKings MLB scoring as its scoring basis.
- Every listed hitter has floor, projected points, and ceiling values.
- Current component markets inform the central projection; recent performance fills uncovered scoring components.
- Floor and ceiling use recent scoring variation centered on the current projection and are not guaranteed boundaries.
- The authenticated web and mobile experiences can sort by Floor, Projected, or Ceiling.
- Selecting two hitters creates a Sit/Start comparison based on projected points.
- The comparison preserves each hitter’s floor, projection, ceiling, market-input count, and recent-game count.
- Web refreshes periodically and supports manual refresh; mobile supports pull-to-refresh.
- The public page supports discovery; the complete comparison workflow is in the web and mobile products.

## Source register

- Live public overview: https://propellerpicks.com/fantasy/
- Live MLB board: https://propellerpicks.com/fantasy/mlb/
- Live market-board API: https://web-production-3c1c4.up.railway.app/api/fantasy/market-board?sport=mlb&platform=draftkings_pick6
- Shipped web UI: `origin/main:web/components/fantasy/fantasy-board.tsx`
- Shipped web data layer: `origin/main:web/hooks/use-fantasy.ts` and `origin/main:web/lib/fantasy.ts`
- Shipped mobile UI: `origin/main:mobile/src/screens/fantasy/FantasyHomeScreen.tsx`
- Shipped API and methodology: `origin/main:api/routers/fantasy.py` and `origin/main:api/services/fantasy_service.py`

## Final narration

The approved narration-only copy is maintained in `final.txt`.

## Visual direction

This is a product walkthrough, not a slide presentation. Use real, current Propeller interfaces as the dominant visual layer. Add restrained branded annotations only when they clarify a control, number, or state.

- Open with a rapid desktop-and-mobile montage of a real player row and the Sit/Start card.
- Keep narration and UI action semantically synchronized; never show a generic board while describing an off-screen feature.
- When each metric is defined, zoom tightly into that exact number on a real player card.
- Demonstrate all three sort states with the visible list reordering.
- Select two real current hitters and show the resulting recommendation and point gap.
- During the range explanation, frame both players’ floor/projection/ceiling values together.
- Recreate the full comparison on mobile with visible taps, chip state changes, and pull-to-refresh.
- Show slate date, scoring label, update badge, and manual refresh control when freshness is discussed.
- Use a short checklist overlay over the live interface for the recap; do not replace the interface with a full-screen slide.
- Use current slate examples at capture time and label the capture date in small text.

## Claim and safety notes

- Do not imply that DraftKings endorses or is affiliated with Propeller.
- Do not describe floor or ceiling as a guaranteed boundary.
- Do not call Sit/Start personalized advice or a lineup optimizer.
- Do not narrate live player names, exact values, or inventory counts that could become stale.
- Do not claim empirical coverage or calibration performance unless it is separately reproduced and approved for publication.
