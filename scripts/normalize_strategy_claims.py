#!/usr/bin/env python3
"""Remove audited certainty, profitability, and stale-platform claims from guides."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GUIDES = tuple((ROOT / "guides" / name / "index.html") for name in (
    "prizepicks-strategy", "pick6-strategy", "underdog-strategy",
    "nba-prop-betting", "how-to-analyze-player-props",
))

REPLACEMENTS = {
    "Flex Play is the better long-term strategy for most players.": "Flex Play can reduce all-or-nothing variance, but whether it is suitable depends on the current rules, displayed payout, and the user's risk tolerance.",
    "The expected value of a Flex Play is more favorable over a large sample because it reduces the all-or-nothing variance that kills bankrolls on Power Play entries.": "A partial-hit payout changes the distribution of outcomes; it does not by itself establish positive expected value.",
    "Injury cascades are one of the most underpriced edges in PrizePicks.": "Late injury news can materially change teammate roles and is important context to review.",
    "yet the lines for those backup players are often set before the market fully reprices for the cascading effect.": "Compare any resulting role change with the current displayed line rather than assuming it is mispriced.",
    "Flex Play is where the real edge lives for disciplined players.": "Flex Play may reduce all-or-nothing variance under the displayed rules.",
    "Use Injury Cascades as Your Primary Edge": "Review Injury-Driven Role Changes",
    "the true impact of a star's absence": "the possible impact of a star's absence",
    "The more independent your picks are, the more true probability diversification you get from the Flex Play structure.": "Less-correlated selections can reduce shared-outcome exposure, although correlation is difficult to measure and does not guarantee a better result.",
    "The most significant source of edge available to PrizePicks players in 2026 is systematic, data-driven analysis": "One useful PrizePicks research approach is systematic analysis",
    "surfaces the actual edges without the cognitive load": "organizes signals without requiring the same manual collection work",
    "Fewer, higher-confidence entries built on solid research outperform high-volume shotgun approaches.": "Fewer entries can make the reasoning and exposure easier to review than high-volume entry creation.",
    "Bankroll management is the discipline that keeps you in the game long enough for your edge to express itself.": "Budget limits can reduce exposure and discourage loss-chasing.",
    "That survival window is what allows a positive expected-value approach to actually realize its edge over time.": "This example illustrates why smaller entry sizes reduce the rate at which losses can deplete a fixed budget; it does not promise positive returns.",
    "Double down on your actual edges and reduce exposure in categories where your historical accuracy does not support confidence.": "Use the log to identify where your process needs review, and do not treat a small historical sample as proof of a repeatable advantage.",
    "High-variance stat types can offer more edge because they are harder to price precisely.": "High-variance stat types require wider uncertainty ranges because outcomes can be less stable.",
    "What stat types are most profitable on Underdog?": "What stat types require extra caution on Underdog?",
    "where AI prop analysis creates the biggest edge": "where player-prop research can organize relevant context",
    "Not every prop on Underdog represents an edge.": "A displayed prop should not be assumed to represent an advantage.",
    "Selective volume beats high volume every time.": "Selective volume can make exposure and reasoning easier to audit.",
    "with higher allocation to 2-3 pick entries where your mathematical edge is strongest": "using a fixed entertainment budget rather than assumed mathematical advantage",
    "your edge compounds better at lower pick counts": "fewer legs reduce the number of outcomes that must align",
    "even with a real edge": "even after careful research",
    "turn a potentially profitable strategy into a losing one": "increase exposure and losses",
    "one of the most actionable edges on Underdog": "important context for Underdog research",
    "the best risk-adjusted expected value": "a simpler, lower-leg construction",
    "where your mathematical edge is strongest": "that are easier to evaluate",
    "positive expected-value approach": "research approach",
    "strategy that survives long enough to express its edge": "budget that limits cumulative exposure",
    "no strategy with a true edge will produce that kind of losing streak": "losing streaks remain possible and no entry process guarantees recovery",
    "relative to their actual edge per leg": "without reliable evidence for each leg",
    "The cascade beneficiaries are where the edge lives — and that edge disappears once the books adjust lines.": "Affected teammates may warrant renewed review, but a role change is not proof that a line is favorable.",
    "the most actionable daily edge on the table": "important late-breaking context",
    "Our data reveals which stat types consistently produce the highest win rates:": "Historical results can help compare how stat types behaved in the archived sample, with no guarantee that the pattern will repeat:",
    "Find Your <span>Pick6 Edge</span> Before Slate Lock": "Review Your <span>Pick6 Entry</span> Before Slate Lock",
    "NBA blocks and steals are often mispriced because books set low lines (0.5 or 1.5) where a single event changes the outcome. NHL goals can also create strong signals when shot volume, line role, and opponent context all agree.": "NBA blocks and steals use low counting-stat lines where one event can decide the result, making the outcome volatile. NHL goal outcomes are also volatile; shot volume, line role, and opponent context can inform research without proving a favorable line.",
    "The survival buffer is what allows a research approach to actually produce returns over time.": "A smaller fixed entry size limits the effect of any single loss, but it cannot ensure recovery or returns.",
    "Six-pick entries offer 40x multipliers, but they require hitting all six legs simultaneously. At 58% per-leg accuracy, a six-pick entry wins roughly 3.7% of the time. Your bankroll must survive 27 losses between wins. Most players overweight high-leg entries without reliable evidence for each leg.": "Higher-leg entries require more outcomes to align. Review the Base Multiplier and contest rules currently displayed rather than relying on a static payout example or assumed per-leg accuracy.",
    "The agents are weighted by backtested accuracy for each sport. The Injury Agent carries the highest weight in NBA (4.0x) because injury cascades are the most underpriced signal. The No-Vig Agent is highest in NHL (4.0x) because hockey odds disagree across books more frequently than other sports.": "The analysis combines sport-specific signals. Propeller does not publish a claim here that any one signal has a stable predictive advantage; use the displayed context and methodology limitations when evaluating a result.",
    "Ready to Find Your Edge": "Ready to Review Today's Board",
    "finding extra edges": "adding more selections",
    'href="https://pick6.draftkings.com/how-to-play"': 'href="https://pick6.draftkings.com/how-to-play-pick6"',
    "The strongest NBA prop bets are usually the ones where tonight's role or game context is different from the baseline season average used to set the line.": "A documented NBA prop research process compares the posted line with expected minutes, usage, pace, matchup, and current injury context, while recognizing that none of those inputs guarantees the outcome.",
    "These are not necessarily the most profitable props — they are also often the most efficiently priced. High-variance categories that books find harder to price precisely can create better value when role, matchup, or market disagreement supports the pick.": "No stat category is inherently profitable. High-variance categories require wider uncertainty ranges, while higher-volume categories may have more stable inputs; evaluate the current line and evidence rather than assuming either group offers value.",
    "Injuries are the single most impactful variable in NBA prop betting. A star player's absence directly affects their own props and creates cascade effects for teammates who absorb the missing usage. A first-option scorer going out can add 4-8 points per game in expected output to the second and third options, as documented in real-time NBA injury reports . Books often lag on repricing these cascades, creating time-sensitive edges in the 30-90 minutes after an injury is confirmed.": "Injuries can change teammate minutes, usage, and role. Check current official injury reports, rotations, and the posted line after a status change; do not assume a specific output increase or that the market has failed to update.",
    "Injuries are the single most impactful variable in NBA prop betting. A star player's absence directly affects their own props and creates cascade effects for teammates who absorb the missing usage. A first-option scorer going out can add 4-8 points per game in expected output to the second and third options, as documented in <a href=\"https://www.espn.com/nba/injuries\" target=\"_blank\" rel=\"noopener\">real-time NBA injury reports</a>. Books often lag on repricing these cascades, creating time-sensitive edges in the 30-90 minutes after an injury is confirmed.": "Injuries can change teammate minutes, usage, and role. Check current <a href=\"https://www.espn.com/nba/injuries\" target=\"_blank\" rel=\"noopener\">NBA injury reports</a>, rotations, and the posted line after a status change; do not assume a specific output increase or that the market has failed to update.",
    "The best NBA player prop betting strategies usually start by targeting stat types and game contexts books price less efficiently.": "A careful NBA player-prop research process starts with observable minutes, role, pace, matchup, injury, and market context.",
    "Lower-variance stats like points and PRA combos are more efficiently priced but still beatable with the right analysis framework.": "Lower-variance stats like points and PRA combos may have more stable inputs, but their outcomes and prices remain uncertain.",
    "Books misprice props most often when multiple factors shift simultaneously — for example, a key teammate injury in a fast-paced matchup.": "When multiple factors shift simultaneously—for example, a teammate injury in a fast-paced matchup—recalculate the player's role and compare it with the current posted line.",
    "Understanding which inputs matter most — and which ones books price poorly — is the foundation of a profitable analysis process. The takeaway: high-variance stat types that books struggle to price can create more opportunity than the highest-volume, best-understood markets when the context supports the direction.": "Understanding which inputs matter and where uncertainty remains is the foundation of a documented research process. High-variance stat types require more caution, not an assumption that they offer more opportunity than higher-volume markets.",
    "The most underpriced variable in NBA props. When a star exits, their usage redistributes — and books often reprice the star's prop before adjusting teammate lines.": "An important role input. When a star exits, teammate usage can redistribute; verify the current line and rotation rather than assuming an adjustment is missing.",
    "Books don't always fully discount for fatigue.": "The size and consistency of fatigue effects vary, and the current line may already reflect schedule context.",
    "analyzing the specific game environment is where the edge is found": "analyzing the specific game environment adds context beyond a season average",
    "Injuries and Cascade Effects: The Most Underpriced Variable": "Injuries and Cascade Effects: Recheck Roles and Lines",
    "Injuries are the single largest driver of statistical movement in NBA props — not because the injured player's own lines need repricing (those are obviously removed), but because of the cascade effects on teammates.": "Injuries can materially change teammate roles, minutes, and usage, so related player projections should be recalculated after a status update.",
    "These redistributions are often dramatic and can easily add 4-8 points, 3-5 assists, or 2-4 rebounds per game to specific role players.": "The size of any redistribution is player- and lineup-specific and should not be assumed from a generic range.",
    "<strong>The edge window is real.</strong> A star's absence is announced. The books reprice the star's props and the obvious next-option. But the second and third tier of cascade beneficiaries — the role player who suddenly runs the second unit, the backup center who picks up transition minutes, the wing who absorbs the scoring burden — these lines often remain unchanged for 30-90 minutes after the injury news drops.": "<strong>Recheck the current information.</strong> After an absence is announced, review the full rotation, current projections, and posted lines. Markets may update quickly or unevenly, but timing alone does not prove that a line is stale or favorable.",
    "Books account for rest situations in their lines, but they do not always fully price the compounding effect of multiple consecutive compressed schedule periods.": "Rest is one input among many, and the effect of compressed schedules varies by player, role, and team; compare it with the current line without assuming the market omitted it.",
    "High-variance stat categories that sportsbooks struggle to price precisely — blocks, threes, steals — can create useful edges when role and matchup context support the direction. Heavily traded markets like points and PRA are usually more efficiently priced, which means the line needs stronger injury, usage, or market-disagreement support before it becomes attractive.": "High-variance categories such as blocks, threes, and steals require wider uncertainty ranges. Higher-volume markets such as points and PRA can have more stable inputs. Neither group should be assumed favorable; compare the current line with role, matchup, injury, and market context.",
    "These mistakes compound over time and are the primary reason players who understand the concepts still lose money.": "These mistakes can compound uncertainty and exposure even when the underlying concepts are understood.",
    "Volatile stat types such as blocks, steals, threes, saves, shots, or secondary assists can still be mispriced when role, matchup, and volume context support the direction.": "Volatile stat types such as blocks, steals, threes, saves, shots, or secondary assists require wider uncertainty ranges even when role, matchup, and volume context support a direction.",
    "But they're also the most efficiently priced. The edge is in the stat types that feel less intuitive.": "Familiarity does not make them easier, and less-intuitive stat types are not automatically advantageous; document the evidence and uncertainty for either group.",
    "dramatically higher, Compare": "dramatically higher. Compare",
    "When a key player is ruled out, their teammates' lines take 30-90 minutes to fully reprice. During this window, cascade beneficiaries — the role players who absorb the missing usage — are often available at pre-injury lines on Underdog. Monitor <a href=\"https://www.espn.com/nba/injuries\" target=\"_blank\" rel=\"noopener\">real-time injury reports</a> and act fast.": "When a key player is ruled out, teammate roles and usage can change. Review <a href=\"https://www.espn.com/nba/injuries\" target=\"_blank\" rel=\"noopener\">current injury reports</a>, rotations, and the current Underdog line; do not assume a fixed repricing window or that an earlier line remains available.",
    "The 30-90 minute repricing window after injury announcements is important context for Underdog research.": "Injury announcements are important context for Underdog research, but market update timing varies.",
    "Last updated: April 3, 2026 — reviewed for launch copy and public-results alignment.": "Last updated: July 16, 2026 — reviewed for current rules, sourcing, product claims, and limitations.",
    '<a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>': '<a href="/how-it-works/">Propeller methodology</a> (<a href="/data/methodology-version.json">version 2026.07</a>, effective July 14, 2026)',
}

PICK6_INTRO = """<h2 id="entry-types">How Should You Review Current Pick6 Formats and Payouts?</h2>
        <p>Pick6 is a peer-to-peer contest. DraftKings publishes a Base Multiplier before entry, while final winnings can also depend on contest standings and Extra Winnings. The number shown in the product at entry time—not a static guide table—is the source of truth.</p>
        <p>Adding selections increases the number of outcomes that must align. Review the current Base Multiplier, contest rules, and maximum possible loss before entering. A multiplier alone does not establish a favorable expected return.</p>

        <div class="highlight-box">
          <div class="highlight-box-label">Current-rule check</div>
          <p>Open DraftKings' official <a href="https://pick6.draftkings.com/how-to-play-pick6" target="_blank" rel="noopener">How to Play</a> page and the in-product contest details. Rules, availability, and payout mechanics can change by date and jurisdiction.</p>
        </div>

        """

SOURCE_NOTES = {
    "how-to-analyze-player-props": '<p data-editorial-sources="true"><strong>Sources and method:</strong> <a href="https://www.basketball-reference.com/about/glossary.html#usg" target="_blank" rel="noopener">Basketball Reference usage glossary</a>, <a href="https://www.espn.com/nba/injuries" target="_blank" rel="noopener">ESPN injury reports</a>, <a href="https://www.fantasypros.com/nba/defense-vs-position.php" target="_blank" rel="noopener">FantasyPros DvP</a>, the <a href="/results/">public results ledger</a>, and <a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>.</p>',
    "nba-prop-betting": '<p data-editorial-sources="true"><strong>Sources and method:</strong> <a href="https://www.nba.com/stats/teams/advanced" target="_blank" rel="noopener">NBA advanced stats</a>, <a href="https://www.basketball-reference.com/about/glossary.html#usg" target="_blank" rel="noopener">Basketball Reference usage glossary</a>, <a href="https://www.espn.com/nba/injuries" target="_blank" rel="noopener">ESPN injury reports</a>, the <a href="/results/">public results ledger</a>, and <a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>.</p>',
    "prizepicks-strategy": '<p data-editorial-sources="true"><strong>Sources and method:</strong> <a href="https://www.prizepicks.com/help-center" target="_blank" rel="noopener">PrizePicks Help Center</a>, the <a href="/results/">public results ledger</a>, and <a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>.</p>',
    "pick6-strategy": '<p data-editorial-sources="true"><strong>Sources and method:</strong> <a href="https://pick6.draftkings.com/how-to-play-pick6" target="_blank" rel="noopener">DraftKings Pick6 How to Play</a>, the <a href="/results/">public results ledger</a>, and <a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>.</p>',
    "underdog-strategy": '<p data-editorial-sources="true"><strong>Sources and method:</strong> <a href="https://underdogfantasy.com/" target="_blank" rel="noopener">Underdog Fantasy product information</a>, <a href="https://www.espn.com/nba/injuries" target="_blank" rel="noopener">ESPN injury reports</a>, the <a href="/results/">public results ledger</a>, and <a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>.</p>',
}
SOURCE_NOTES = {
    key: value.replace(
        '<a href="/how-it-works/">Propeller methodology, version reviewed July 16, 2026</a>',
        '<a href="/how-it-works/">Propeller methodology</a> (<a href="/data/methodology-version.json">version 2026.07</a>, effective July 14, 2026)',
    )
    for key, value in SOURCE_NOTES.items()
}


def normalize(source: str, path: Path) -> str:
    for old, new in REPLACEMENTS.items():
        source = source.replace(old, new)
    source = re.sub(r"\s*<!-- GUIDE-TWEET-EMBED -->.*?<!-- /GUIDE-TWEET-EMBED -->\s*", "\n", source, flags=re.S)
    if path.parent.name == "pick6-strategy":
        source = source.replace(
            "The quick answer: DraftKings Pick6 entries include 2 to 6 picks and every pick must hit. Payouts run from 3x for 2 picks up to 40x for 6. Below: entry sizing, correlation, injury timing, and a full strategy framework.",
            "The quick answer: DraftKings Pick6 is a peer-to-peer More-or-Less contest. Review the current Base Multiplier, contest standings, Extra Winnings terms, and jurisdiction-specific rules before entering.",
        )
        source = source.replace(
            '<div class="payout-strip fade-in delay-2" aria-label="DraftKings Pick6 payout multipliers">\n        <span class="ps-label">Pick6 Payouts</span>\n        <span class="ps-items">2 picks &rarr; 3x &middot; 3 &rarr; 5x &middot; 4 &rarr; 10x &middot; 5 &rarr; 20x &middot; 6 &rarr; 40x &middot; every pick must hit</span>\n      </div>',
            '<div class="payout-strip fade-in delay-2" aria-label="DraftKings Pick6 current-rule reminder">\n        <span class="ps-label">Pick6 format</span>\n        <span class="ps-items">Peer-to-peer · Base Multiplier shown before entry · final winnings can vary</span>\n      </div>',
        )
        source = source.replace("Get your picks right and you earn a fixed multiplier on your entry.", "Potential winnings follow the Base Multiplier and contest terms displayed before entry; final winnings can vary.")
        source = re.sub(
            r'<h2 id="entry-types">.*?(?=<h2 id="five-strategies">)',
            PICK6_INTRO,
            source,
            flags=re.S,
        )
        source = source.replace(
            "DraftKings Pick6 is a daily fantasy sports game where you select between 2 and 6 player prop picks — choosing whether each player will go over or under their posted statistical line. It operates differently from traditional DFS contests: there are no salary caps, no lineups to build, and no head-to-head competition against other players. You are simply picking over/under on player stats and earning a fixed multiplier based on how many picks you get correct.",
            "DraftKings Pick6 is a peer-to-peer daily fantasy contest built around More-or-Less player-stat selections. DraftKings displays a Base Multiplier before entry, while final winnings can also depend on contest standings and Extra Winnings. Verify the current official rules and product details because formats and availability can change.",
        )
    note = SOURCE_NOTES[path.parent.name]
    if 'data-editorial-sources="true"' not in source:
        source = re.sub(
            r'(<div class="highlight-box"[^>]*>\s*<div class="highlight-box-label">(?:About This Guide|Editorial Review)</div>\s*<p>Reviewed by.*?</p>)(\s*</div>)',
            rf"\1\n          {note}\2",
            source,
            count=1,
            flags=re.S,
        )
    return source


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed = []
    for path in GUIDES:
        source = path.read_text(encoding="utf-8")
        updated = normalize(source, path)
        if source != updated:
            changed.append(path)
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"strategy_guides={len(GUIDES)} changed={len(changed)}")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
