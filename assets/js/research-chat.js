(function (window) {
  "use strict";

  var SUMMARY_PROMPT = "See every signal for this player with a free account.";
  var CURRENT_SEASON = 2026;

  var SIGNAL_LABELS = {
    Matchup: "matchup",
    DVOA: "defense-adjusted efficiency",
    AdvancedStats: "advanced stats",
    Volume: "expected volume",
    EnhancedTrends: "recent trends",
    Injury: "injury context"
  };

  var STAT_LABELS = {
    pass_yds: "passing yards",
    pass_tds: "passing touchdowns",
    pass_att: "pass attempts",
    pass_comp: "pass completions",
    rush_yds: "rushing yards",
    rush_attempts: "rush attempts",
    rec_yds: "receiving yards",
    receptions: "receptions",
    targets: "targets"
  };

  // Prop stat_type -> game_logs column (catalog.nfl_player_context rows).
  var LOG_FIELDS = {
    pass_yds: "passing_yards",
    pass_tds: "passing_tds",
    pass_att: "passing_attempts",
    pass_comp: "passing_completions",
    rush_yds: "rushing_yards",
    rush_attempts: "rushing_attempts",
    rec_yds: "receiving_yards",
    receptions: "receptions",
    targets: "targets"
  };

  var BANNED = /\b(lock|guarantee|guaranteed|easy over|easy under|can't lose|free money|sure thing|win probability|because)\b/i;

  var MATCHUP_SIGNALS = { Matchup: 1, DVOA: 1 };

  function guardCopy(text) {
    var hit = BANNED.exec(String(text));
    if (hit) throw new Error("banned phrase: " + hit[1].toLowerCase());
    return text;
  }

  // Guards the template, then fills it. Player names and other data are not
  // guarded: a surname such as "Lock" is a name, not betting language.
  function say(template, vars) {
    guardCopy(template);
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return vars && vars[key] != null ? String(vars[key]) : "";
    });
  }

  function signalLabel(name) {
    var raw = String(name == null ? "" : name).trim();
    if (!raw) return "signal";
    if (Object.prototype.hasOwnProperty.call(SIGNAL_LABELS, raw)) return SIGNAL_LABELS[raw];
    return raw
      .replace(/_+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function statLabel(stat) {
    var key = String(stat || "");
    if (Object.prototype.hasOwnProperty.call(STAT_LABELS, key)) return STAT_LABELS[key];
    return key.replace(/_+/g, " ").trim().toLowerCase() || "stat";
  }

  function cap(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function dir(value) {
    return String(value || "").toLowerCase();
  }

  function num(value) {
    var n = Number(value);
    return value != null && isFinite(n) ? n : null;
  }

  function byStrength(a, b) {
    return Math.abs(b.score - 50) - Math.abs(a.score - 50);
  }

  function splitSignals(prop) {
    var signals = Array.isArray(prop.signals) ? prop.signals : [];
    var agree = [];
    var against = [];
    signals.forEach(function (s) {
      var item = { name: s.name, score: s.score, direction: s.direction };
      if (s.direction === prop.direction) agree.push(item);
      else if (s.direction === "OVER" || s.direction === "UNDER") against.push(item);
    });
    return { all: signals, agree: agree.sort(byStrength), against: against.sort(byStrength) };
  }

  function withoutSignals(prop) {
    var copy = {};
    Object.keys(prop).forEach(function (k) {
      if (k !== "signals") copy[k] = prop[k];
    });
    return copy;
  }

  function summaryOf(prop) {
    var s = prop.signal_summary;
    if (s && num(s.total) != null) return s;
    var parts = splitSignals(prop);
    return {
      agree: parts.agree.length,
      against: parts.against.length,
      neutral: parts.all.length - parts.agree.length - parts.against.length,
      total: parts.all.length
    };
  }

  function signalLine(s) {
    return say("{label} scores {score} and points {side}.", {
      label: cap(signalLabel(s.name)), score: s.score, side: dir(s.direction)
    });
  }

  function signalList(signals) {
    return {
      type: "list",
      items: signals.map(function (s) {
        return {
          name: s.name,
          label: signalLabel(s.name),
          score: s.score,
          direction: s.direction,
          text: signalLine(s)
        };
      })
    };
  }

  function textBlock(value) {
    return { type: "text", text: value };
  }

  function leanBlock(player, prop) {
    return {
      type: "lean",
      player: player.name,
      team: player.team,
      stat: prop.stat_type,
      statLabel: statLabel(prop.stat_type),
      direction: prop.direction,
      line: prop.line,
      confidence: prop.confidence,
      homeTeam: prop.home_team,
      awayTeam: prop.away_team,
      eventStart: prop.event_start,
      analyzedAt: prop.analyzed_at
    };
  }

  function countSentence(prop) {
    var s = summaryOf(prop);
    return say("{agree} of {total} signals point {side}.", {
      agree: s.agree, total: s.total, side: dir(prop.direction)
    });
  }

  function propLabel(prop) {
    return statLabel(prop.stat_type) + " " + prop.line;
  }

  function newestLog(logs) {
    var best = null;
    logs.forEach(function (g) {
      if (!best || String(g.game_date) > String(best.game_date)) best = g;
    });
    return best;
  }

  // Only drawn from current-season rows; stale rows never become a chart.
  function chartBlock(prop, logs) {
    var field = LOG_FIELDS[prop.stat_type];
    if (!field || !logs.length) return null;
    var newest = newestLog(logs);
    if (!newest || !(num(newest.season) >= CURRENT_SEASON)) return null;
    var rows = logs
      .filter(function (g) { return num(g[field]) != null && num(g.season) >= CURRENT_SEASON; })
      .sort(function (a, b) { return String(a.game_date) < String(b.game_date) ? -1 : 1; });
    if (!rows.length) return null;
    return {
      type: "chart",
      stat: prop.stat_type,
      statLabel: statLabel(prop.stat_type),
      line: prop.line,
      title: say("Last {n} games, {stat} against the {line} line", {
        n: rows.length, stat: statLabel(prop.stat_type), line: prop.line
      }),
      points: rows.map(function (g) {
        return {
          label: say("Wk {week} {opp}", { week: g.week, opp: g.opponent }),
          gameDate: g.game_date,
          value: num(g[field])
        };
      })
    };
  }

  function buildToolCalls(player, prop, full, extras) {
    var calls = [{
      name: "search_nfl_players",
      summary: say("Matched {name} ({team}, {pos}).", {
        name: player.name, team: player.team, pos: player.position
      }),
      output: { player: player }
    }];
    var rows = (extras.topRows || [prop]).map(function (p) { return full ? p : withoutSignals(p); });
    calls.push({
      name: "get_top_nfl_props",
      summary: say("Read {n} stored ranked {noun}.", {
        n: rows.length, noun: rows.length === 1 ? "prop" : "props"
      }),
      output: { player: player.name, props: rows }
    });
    if (extras.logs && extras.logs.length) {
      calls.push({
        name: "get_nfl_player_context",
        summary: say("Read {n} current-season game logs.", { n: extras.logs.length }),
        output: { game_logs: extras.logs }
      });
    }
    return calls;
  }

  function summaryConversation(c, player, prop) {
    c.free = [leanBlock(player, prop), textBlock(countSentence(prop)), textBlock(SUMMARY_PROMPT)];
    c.locked = [textBlock(say("The full read adds each signal, the matchup and the risks, and it comes with full access.", {}))];
    return c;
  }

  function buildConversations(lookup, propIndex) {
    if (!lookup || lookup.status !== "ok" || !lookup.player) return [];
    var props = Array.isArray(lookup.props) ? lookup.props : [];
    if (!props.length) return [];
    var asked = Number(propIndex);
    var prop = props[asked >= 0 && asked < props.length ? Math.floor(asked) : 0];
    var player = lookup.player;
    var full = prop.detail === "full" && Array.isArray(prop.signals);
    var parts = splitSignals(prop);
    var logs = Array.isArray(lookup.game_logs) ? lookup.game_logs : [];
    var chart = full ? chartBlock(prop, logs) : null;
    var side = dir(prop.direction);
    var otherSide = side === "under" ? "over" : "under";
    var name = player.name;
    var likeRows = full && Array.isArray(lookup.more_like_this) ? lookup.more_like_this : [];

    function conv(chip, label, question, extras) {
      return {
        chip: chip,
        label: label,
        question: question,
        toolCalls: buildToolCalls(player, prop, full, extras || {}),
        free: [],
        locked: []
      };
    }

    var ou = conv("ou", "Over or under?",
      say("Over or under for {name}'s {prop}?", { name: name, prop: propLabel(prop) }),
      { logs: chart ? logs : [] });
    var matchup = conv("matchup", "How's the matchup?",
      say("How's the matchup for {name}?", { name: name }));
    var more = conv("more", "Find more like this",
      say("Find more props like {name}'s {side} on {stat}.", {
        name: name, side: side, stat: statLabel(prop.stat_type)
      }),
      {
        topRows: [prop].concat(likeRows.map(function (r) {
          return {
            player_name: r.player_name,
            stat_type: r.stat_type,
            line: r.line,
            direction: r.direction,
            confidence: r.confidence
          };
        }))
      });
    var risk = conv("risk", "What could go wrong?",
      say("What could go wrong with {name}'s {side}?", { name: name, side: side }));
    var convs = [ou, matchup, more, risk];

    if (!full) {
      convs.forEach(function (c) { summaryConversation(c, player, prop); });
      return convs;
    }

    // Over or under: lean card + first two agreeing signals free; the rest locked.
    ou.free = [leanBlock(player, prop), textBlock(countSentence(prop))];
    if (parts.agree.length) ou.free.push(signalList(parts.agree.slice(0, 2)));
    if (parts.agree.length > 2) ou.locked.push(signalList(parts.agree.slice(2)));
    if (parts.against.length) {
      ou.locked.push(textBlock(say("Pointing the other way ({other}):", { other: otherSide })));
      ou.locked.push(signalList(parts.against));
    }
    if (chart) ou.locked.push(chart);
    ou.locked.push(textBlock(say("These are supporting signals, not a causal explanation.", {})));

    // Matchup: the Matchup and DVOA signals in plain words.
    var mu = parts.all.filter(function (s) { return MATCHUP_SIGNALS[s.name]; });
    var rest = parts.all.filter(function (s) { return !MATCHUP_SIGNALS[s.name]; });
    if (mu.length) {
      matchup.free = [
        textBlock(say("{count} of the signals describe the matchup for {name}.", {
          count: mu.length === 1 ? "One" : "Two", name: name
        })),
        signalList(mu)
      ];
    } else {
      matchup.free = [textBlock(say("No matchup signal is stored for this prop.", {}))];
    }
    if (rest.length) {
      matchup.locked = [textBlock(say("The other signals in this read:", {})), signalList(rest.slice().sort(byStrength))];
    }

    // More like this: table first, explanation locked.
    if (likeRows.length) {
      var rows = [{
        player: name, prop: propLabel(prop), direction: prop.direction,
        confidence: prop.confidence, current: true
      }].concat(likeRows.map(function (r) {
        return {
          player: r.player_name,
          prop: propLabel(r),
          direction: r.direction,
          confidence: r.confidence,
          current: false
        };
      }));
      more.free = [{ type: "table", columns: ["Player", "Prop", "Lean", "Score"], rows: rows }];
      more.locked = [textBlock(say("These props share the stat and lean, with a score of 60 or higher.", {}))];
    } else {
      more.free = [textBlock(say("No other ranked props match this stat and lean at a score of 60 or higher.", {}))];
    }

    // Risk: opposing signals only.
    if (parts.against.length) {
      risk.free = [
        textBlock(say("{n} of {total} signals point {other}, against the {side} lean.", {
          n: parts.against.length, total: parts.all.length, other: otherSide, side: side
        })),
        signalList(parts.against.slice(0, 2))
      ];
      if (parts.against.length > 2) risk.locked.push(signalList(parts.against.slice(2)));
    } else {
      risk.free = [textBlock(say("No signal points against the {side} lean.", { side: side }))];
    }
    risk.locked.push(textBlock(say("Scores are model confidence on a 50 to 100 scale, and the line can move before the game.", {})));

    return convs;
  }

  window.ppResearchChat = {
    SUMMARY_PROMPT: SUMMARY_PROMPT,
    signalLabel: signalLabel,
    buildConversations: buildConversations,
    guardCopy: guardCopy
  };
})(window);
