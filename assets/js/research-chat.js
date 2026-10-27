(function (window) {
  "use strict";

  var SUMMARY_PROMPT = "See every signal for this player with a free account.";
  var STAMP_LABEL = "Written by Claude using Propeller's research tools";
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
      player: (player.player_name || player.name),
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

  // Null when there are no signals, so "0 of 0" never renders.
  function countSentence(prop) {
    var s = summaryOf(prop);
    if (!num(s.total)) return null;
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
        name: (player.player_name || player.name), team: player.team, pos: player.position
      }),
      output: { player: player }
    }];
    var rows = (extras.topRows || [prop]).map(function (p) { return full ? p : withoutSignals(p); });
    calls.push({
      name: "get_top_nfl_props",
      summary: say("Read {n} stored ranked {noun}.", {
        n: rows.length, noun: rows.length === 1 ? "prop" : "props"
      }),
      output: { player: (player.player_name || player.name), props: rows }
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
    var count = countSentence(prop);
    c.free = [leanBlock(player, prop)];
    if (count) c.free.push(textBlock(count));
    c.free.push(textBlock(SUMMARY_PROMPT));
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
    var name = (player.player_name || player.name);
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
    var count = countSentence(prop);
    ou.free = [leanBlock(player, prop)];
    if (count) ou.free.push(textBlock(count));
    if (parts.agree.length) ou.free.push(signalList(parts.agree.slice(0, 2)));
    if (chart) ou.free.push(chart);
    if (parts.agree.length > 2) ou.locked.push(signalList(parts.agree.slice(2)));
    if (parts.against.length) {
      ou.locked.push(textBlock(say("Pointing the other way ({other}):", { other: otherSide })));
      ou.locked.push(signalList(parts.against));
    }
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


  // ---- Renderer ----

  var MCP_ADDRESS = "https://mcp.propellerpicks.com/mcp";
  var RULE_LABEL = "Built from Propeller's data";
  var FOOTER = "Research only, not a guarantee. Scores are model confidence on a 50 to 100 scale, not win probabilities.";
  var PAYWALL_HEADING = "Get the full read in your own AI tool";
  var PAYWALL_LINE = "Connect Propeller to ChatGPT, Claude or another tool that supports MCP. Included with full access, $15 a month.";
  var PAYWALL_STEPS = [
    "Copy the Propeller MCP address",
    "Paste it into ChatGPT, Claude or another tool that supports MCP",
    "Sign in to Propeller and approve access"
  ];
  var FILLER_WIDTHS = [92, 78, 86, 64, 80];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cta(id, surface, destination, event, href, label, cls) {
    return '<a class="' + cls + '" href="' + esc(href) + '"' +
      ' data-analytics-event="' + esc(event) + '"' +
      ' data-cta-id="' + esc(id) + '"' +
      ' data-cta-surface="' + esc(surface) + '"' +
      ' data-cta-destination="' + esc(destination) + '">' + esc(label) + "</a>";
  }

  // The label always shows; the time is added only when generated_at parses.
  function stampText(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return STAMP_LABEL;
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true
    }).formatToParts(d).forEach(function (p) { parts[p.type] = p.value; });
    return STAMP_LABEL + " · " + parts.weekday + ", " + parts.month + " " +
      parts.day + " · " + parts.hour + ":" + parts.minute + " " + String(parts.dayPeriod || "").toUpperCase() + " ET";
  }

  function step(inner, cls) {
    return '<div class="pp-rc-step' + (cls ? " " + cls : "") + '">' + inner + "</div>";
  }

  function renderLean(b) {
    var matchup = b.awayTeam && b.homeTeam ? esc(b.awayTeam) + " at " + esc(b.homeTeam) : "";
    return '<div class="pp-rc-lean">' +
      '<span class="pp-rc-dir">' + esc(b.direction) + "</span>" +
      '<span class="pp-rc-what">' + esc(b.player) + " · " + esc(b.line) + " " + esc(b.statLabel) +
      (matchup ? '<small>' + matchup + "</small>" : "") + "</span>" +
      '<span class="pp-rc-score"><b>' + esc(b.confidence) + "</b>score</span></div>";
  }

  function renderList(b) {
    return '<ul class="pp-rc-list">' + b.items.map(function (it) {
      return "<li>" + esc(it.text) + "</li>";
    }).join("") + "</ul>";
  }

  function renderChart(b) {
    var max = b.line || 1;
    b.points.forEach(function (p) { if (p.value > max) max = p.value; });
    max = max * 1.1;
    var bars = b.points.map(function (p) {
      var over = p.value > b.line;
      return '<span class="' + (over ? "pp-rc-over" : "pp-rc-under") + '" style="height:' +
        Math.max(4, Math.round(p.value / max * 100)) + '%"><i>' + esc(p.value) + "</i></span>";
    }).join("");
    var linePos = Math.round(b.line / max * 100);
    var aria = b.title + ": " + b.points.map(function (p) { return p.label + " " + p.value; }).join(", ");
    return '<figure class="pp-rc-chart"><div class="pp-rc-bars" role="img" aria-label="' + esc(aria) + '">' + bars +
      '<div class="pp-rc-ln" style="bottom:' + linePos + '%"><b>' + esc(b.line) + "</b></div></div>" +
      "<figcaption>" + esc(b.title) + "</figcaption></figure>";
  }

  function renderTable(b) {
    var last = b.columns.length - 1;
    var head = b.columns.map(function (c, i) {
      return "<th" + (i === last ? ' class="pp-rc-hide-ph"' : "") + ">" + esc(c) + "</th>";
    }).join("");
    var body = b.rows.map(function (r) {
      var cells = [r.player, r.prop, r.direction, r.confidence];
      return '<tr' + (r.current ? ' class="pp-rc-current"' : "") + ">" + cells.map(function (c, i) {
        return "<td" + (i === last ? ' class="pp-rc-hide-ph pp-rc-n"' : "") + ">" + esc(c) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    return '<table class="pp-rc-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table>";
  }

  function renderBlock(b) {
    switch (b.type) {
      case "lean": return step(renderLean(b));
      case "text": return step("<p>" + esc(b.text) + "</p>");
      case "list": return step(renderList(b));
      case "table": return step(renderTable(b));
      case "chart": return step(renderChart(b));
      default: return "";
    }
  }

  function renderTools(calls, opts, showcase) {
    var rows = calls.map(function (t) {
      if (t.isError) {
        return '<div class="pp-rc-tool pp-rc-tool-failed"><span class="pp-rc-st pp-rc-st-fail" aria-hidden="true"></span><code>' +
          esc(t.name) + "</code> — failed</div>";
      }
      return '<div class="pp-rc-tool"><span class="pp-rc-st" aria-hidden="true"></span><code>' + esc(t.name) + "</code>" +
        (!showcase && t.summary ? "<em>" + esc(t.summary) + "</em>" : "") + "</div>";
    }).join("");
    if (opts.compactTools) {
      return step('<details class="pp-rc-tools pp-rc-tools-compact"><summary>Checked ' + calls.length +
        " Propeller sources</summary>" + rows + "</details>");
    }
    return step('<div class="pp-rc-tools">' + rows + "</div>");
  }

  function renderPaywall(surface, external) {
    var home = surface === "home";
    var id = home ? "home-showcase-mcp" : "analyzer-research-mcp";
    var steps = PAYWALL_STEPS.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var secondary = home
      ? cta("home-showcase-analyzer", "home", "analyzer", "research_cta_click", "/analyzer/?sport=nfl", "Look up a player", "pp-rc-link")
      : cta("analyzer-research-signup", "analyzer", "signup", "signup_click", "https://app.propellerpicks.com/signup", "Create a free account", "pp-rc-link");
    var actions = external ? "" : '<div class="pp-rc-actions">' +
      cta(id, home ? "home" : "analyzer", "mcp", "research_cta_click", "/pricing/#ai-connections", "Get full access", "pp-rc-btn") +
      secondary + "</div>";
    return '<div class="pp-rc-gate"><strong>' + esc(PAYWALL_HEADING) + "</strong><small>" + esc(PAYWALL_LINE) + "</small>" +
      "<ol>" + steps + "</ol>" +
      '<div class="pp-rc-url"><code>' + esc(MCP_ADDRESS) + '</code><button type="button" data-copy="' + esc(MCP_ADDRESS) + '">Copy</button></div>' +
      actions + "</div>";
  }

  // Placeholder only: the locked text itself never enters the page.
  function renderLockedFiller() {
    return '<div class="pp-rc-filler" aria-hidden="true">' + FILLER_WIDTHS.map(function (w) {
      return '<span style="width:' + w + '%"></span>';
    }).join("") + "</div>";
  }

  function renderChips(convs, active) {
    return '<div class="pp-rc-chips" role="group" aria-label="Ask about this player">' + convs.map(function (c) {
      return '<button type="button" class="pp-rc-chip" data-chip="' + esc(c.chip) + '" aria-pressed="' +
        (c.chip === active ? "true" : "false") + '">' + esc(c.label) + "</button>";
    }).join("") + "</div>";
  }

  function renderChat(conversations, opts) {
    opts = opts || {};
    var convs = Array.isArray(conversations) ? conversations : [];
    if (!convs.length) return "";
    var showcase = opts.mode === "showcase";
    var surface = opts.surface || (showcase ? "home" : "analyzer");
    var cur = convs[0];
    convs.forEach(function (c) { if (c.chip === opts.active) cur = c; });

    var barLeft = showcase ? esc(opts.stamp || STAMP_LABEL) : esc(RULE_LABEL);
    var answer;
    if (showcase) {
      answer = String(cur.answer || "").split(/\n\s*\n/).filter(function (p) { return p.trim(); })
        .map(function (p) { return step("<p>" + esc(p.trim()) + "</p>"); }).join("") +
        step(renderPaywall(surface, opts.externalCtas));
    } else {
      answer = (cur.free || []).map(renderBlock).join("");
      if (cur.locked && cur.locked.length) {
        answer += step('<div class="pp-rc-lock">' + renderLockedFiller() + renderPaywall(surface, opts.externalCtas) + "</div>");
      }
    }

    return '<div class="pp-rc' + (opts.stage ? " pp-rc-staged" : "") + '" data-mode="' + esc(opts.mode || "rules") + '">' +
      renderChips(convs, cur.chip) +
      '<div class="pp-rc-chat">' +
      '<div class="pp-rc-bar"><span>' + barLeft + "</span></div>" +
      step('<div class="pp-rc-you">' + esc(cur.question) + "</div>") +
      renderTools(cur.toolCalls || [], opts, showcase) +
      '<div class="pp-rc-ai">' + answer + "</div>" +
      '<p class="pp-rc-foot">' + esc(FOOTER) + "</p></div></div>";
  }

  function showcaseConversations(transcript) {
    var payload = transcript && transcript.payload;
    var qs = payload && Array.isArray(payload.questions) ? payload.questions : [];
    var labels = { ou: "Over or under?", matchup: "How's the matchup?", more: "Find more like this", risk: "What could go wrong?" };
    var out = [];
    qs.forEach(function (q) {
      try {
        guardCopy(q.answer);
        guardCopy(q.question);
      } catch (e) {
        return;
      }
      out.push({
        chip: q.chip,
        label: labels[q.chip] || String(q.chip),
        question: q.question,
        toolCalls: (Array.isArray(q.tool_calls) ? q.tool_calls : []).map(function (t) { return { name: t.name, isError: t.is_error === true }; }),
        answer: q.answer
      });
    });
    return out;
  }

  function mountResearchChat(container, opts) {
    opts = opts || {};
    var surface = opts.surface === "home" ? "home" : "analyzer";
    var showcase = !!opts.transcript && !opts.lookup;
    // The showcase only ever presents a transcript Claude wrote.
    var claudeWrote = showcase && /^claude/i.test(String(opts.transcript.model || ""));
    var convs = showcase
      ? (claudeWrote ? showcaseConversations(opts.transcript) : [])
      : buildConversations(opts.lookup, opts.propIndex || 0);
    var stamp = showcase ? stampText(opts.transcript.generated_at) : "";
    var active = convs.length ? convs[0].chip : null;
    var timers = [];
    var mq = null;
    var onMq = null;
    var reduced = false;
    try {
      reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      if (window.matchMedia) mq = window.matchMedia("(max-width: 480px)");
    } catch (e) { /* matchMedia unavailable */ }

    function clearTimers() {
      timers.forEach(function (t) { window.clearTimeout(t); });
      timers = [];
    }

    function reveal() {
      if (reduced || typeof window.setTimeout !== "function" || !container.querySelectorAll) return;
      var steps = container.querySelectorAll(".pp-rc-step");
      for (var i = 0; i < steps.length; i++) {
        (function (el, n) {
          timers.push(window.setTimeout(function () {
            if (el.classList) el.classList.add("pp-in");
          }, 120 + n * 260));
        })(steps[i], i);
      }
    }

    function render(animate) {
      clearTimers();
      var stage = !!animate && !reduced && typeof window.setTimeout === "function";
      container.innerHTML = renderChat(convs, {
        mode: showcase ? "showcase" : "rules",
        stamp: stamp,
        compactTools: !!(mq && mq.matches),
        surface: surface,
        externalCtas: !!opts.externalCtas,
        active: active,
        stage: stage
      });
      if (stage) reveal();
    }

    // innerHTML replaces the clicked chip, so hand focus to its re-rendered twin.
    function focusActiveChip() {
      if (!container.querySelectorAll) return;
      var chips = container.querySelectorAll("[data-chip]");
      for (var i = 0; i < chips.length; i++) {
        if (chips[i].getAttribute("data-chip") === active && typeof chips[i].focus === "function") {
          chips[i].focus();
          return;
        }
      }
    }

    function onClick(ev) {
      var t = ev && ev.target;
      if (!t || !t.closest) return;
      var chipEl = t.closest("[data-chip]");
      if (chipEl) {
        active = chipEl.getAttribute("data-chip");
        render(true);
        focusActiveChip();
        return;
      }
      var copyEl = t.closest("[data-copy]");
      if (copyEl && window.navigator && window.navigator.clipboard) {
        window.navigator.clipboard.writeText(copyEl.getAttribute("data-copy")).then(function () {
          copyEl.textContent = "Copied";
        }, function () {});
      }
    }

    container.addEventListener("click", onClick);
    if (mq) {
      onMq = function () { render(false); };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
    }
    render(true);

    return {
      destroy: function () {
        clearTimers();
        container.removeEventListener("click", onClick);
        if (mq && onMq && mq.removeEventListener) mq.removeEventListener("change", onMq);
        container.innerHTML = "";
      }
    };
  }

  window.ppResearchChat = {
    SUMMARY_PROMPT: SUMMARY_PROMPT,
    signalLabel: signalLabel,
    buildConversations: buildConversations,
    guardCopy: guardCopy,
    renderChat: renderChat,
    mountResearchChat: mountResearchChat
  };
})(window);
