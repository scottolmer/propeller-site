(function () {
  "use strict";

  var API = "https://web-production-3c1c4.up.railway.app";
  var TIMEOUT_MS = 3500;
  var STAT_LABELS = {
    points: "Points",
    rebounds: "Rebounds",
    assists: "Assists",
    threes: "Threes made",
    three_pointers_made: "Threes made",
    steals: "Steals",
    blocks: "Blocks",
    turnovers: "Turnovers",
    pra: "Pts + Reb + Ast",
    pts_reb_ast: "Pts + Reb + Ast",
    pts_rebs_asts: "Pts + Reb + Ast",
    pts_reb: "Pts + Reb",
    pts_rebs: "Pts + Reb",
    pts_ast: "Pts + Ast",
    pts_asts: "Pts + Ast",
    reb_ast: "Reb + Ast",
    rebs_asts: "Reb + Ast",
    strikeouts: "Strikeouts",
    pitcher_strikeouts: "Pitcher strikeouts",
    strikeouts_pitcher: "Pitcher strikeouts",
    hits: "Hits",
    total_bases: "Total bases",
    runs: "Runs",
    rbi: "RBI",
    home_runs: "Home runs",
    shots: "Shots on goal",
    shots_on_goal: "Shots on goal",
    goals: "Goals",
    saves: "Saves",
    pass_yds: "Passing yards",
    player_pass_yds: "Passing yards",
    passing_yards: "Passing yards",
    rush_yds: "Rushing yards",
    player_rush_yds: "Rushing yards",
    rushing_yards: "Rushing yards",
    rec_yds: "Receiving yards",
    player_reception_yds: "Receiving yards",
    receiving_yards: "Receiving yards",
    rush_rec_yds: "Rush + Rec yards",
    player_rush_reception_yds: "Rush + Rec yards",
    receptions: "Receptions",
    player_receptions: "Receptions",
    pass_tds: "Passing TDs",
    passing_touchdowns: "Passing TDs",
    completions: "Completions",
    carries: "Carries",
    rush_attempts: "Rush attempts"
  };

  var SPORT_LABELS = {
    nfl: "NFL",
    nba: "NBA",
    nhl: "NHL",
    mlb: "MLB",
    epl: "EPL",
    mls: "MLS",
    soccer: "Soccer"
  };

  var NFL_SIGNALS = {
    Matchup: "matchup",
    DVOA: "opposing defense",
    Injury: "injury context",
    EnhancedTrends: "recent form",
    AdvancedStats: "player metrics",
    Volume: "expected workload"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function playerKey(name) {
    return String(name || "")
      .replace(/[.'’]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\s+(?:jr|sr|ii|iii|iv|v)$/, "");
  }

  function statLabel(raw) {
    var key = String(raw || "").toLowerCase();
    return STAT_LABELS[key] || String(raw || "").replace(/^player_/, "").replace(/_/g, " ").replace(/\b\w/g, function (m) {
      return m.toUpperCase();
    });
  }

  function directionWord(dir) {
    return String(dir || "").toUpperCase() === "UNDER" ? "Less" : "More";
  }

  function formatNum(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return "--";
    return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
  }

  function confidenceScore(row) {
    var c = Number(row.confidence);
    if (Number.isFinite(c) && c >= 50 && c <= 100) return Math.round(c);
    var s = Number(row.final_score);
    if (Number.isFinite(s) && s >= 0 && s <= 100) return Math.round(Math.abs(s - 50) + 50);
    return null;
  }

  function fetchJson(url) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;
    return window.fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).finally(function () {
      if (timer) window.clearTimeout(timer);
    });
  }

  function todayET() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      return map.year + "-" + map.month + "-" + map.day;
    } catch (_) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function buildBoardNote(row, sport) {
    var parts = [];
    if (row.matchup) parts.push(row.matchup);
    else if (row.opponent) parts.push("vs " + row.opponent);
    if (sport === "nfl" && row.agent_breakdown && typeof row.agent_breakdown === "object") {
      var wanted = String(row.final_direction || "").toUpperCase();
      var signals = [];
      Object.keys(NFL_SIGNALS).forEach(function (k) {
        var sig = row.agent_breakdown[k];
        if (!sig || typeof sig !== "object") return;
        var score = Number(sig.score);
        if (!Number.isFinite(score)) return;
        var agrees = (wanted === "OVER" && score > 52) || (wanted === "UNDER" && score < 48);
        if (agrees) signals.push({ label: NFL_SIGNALS[k], strength: Math.abs(score - 50) });
      });
      signals.sort(function (a, b) { return b.strength - a.strength; });
      if (signals.length) {
        var names = signals.slice(0, 2).map(function (s) { return s.label; });
        parts.push("Supported by " + names.join(" and "));
      }
    }
    if (!parts.length) {
      parts.push((SPORT_LABELS[sport] || sport.toUpperCase()) + " · Current slate line");
    }
    return parts.join(" · ");
  }

  function hydrateBoard() {
    var container = document.querySelector("[data-lp-board-body]");
    if (!container) return;
    var date = todayET();
    var requests = [
      fetchJson(API + "/api/nfl/props/public-slate").then(function (d) {
        if (!d || d.state !== "ready" || !Array.isArray(d.props)) return [];
        return d.props.map(function (r) { return Object.assign({ _sport: "nfl" }, r); });
      }).catch(function () { return []; })
    ];
    ["nba", "nhl", "mlb"].forEach(function (sport) {
      requests.push(
        fetchJson(API + "/api/social/picks/" + sport + "?game_date=" + encodeURIComponent(date) + "&limit=25").then(function (d) {
          if (!d || d.game_date !== date || !Array.isArray(d.props)) return [];
          return d.props.map(function (r) { return Object.assign({ _sport: sport }, r); });
        }).catch(function () { return []; })
      );
    });

    Promise.all(requests).then(function (groups) {
      var all = [];
      groups.forEach(function (list) {
        list.forEach(function (row) {
          if (!row || !row.player_name || !row.stat_type) return;
          if (row.final_direction !== "OVER" && row.final_direction !== "UNDER") return;
          var score = confidenceScore(row);
          if (score == null || !Number.isFinite(Number(row.line))) return;
          all.push({ row: row, score: score, sport: row._sport });
        });
      });
      if (all.length < 3) return;
      all.sort(function (a, b) { return b.score - a.score; });
      var seen = {};
      var picked = [];
      for (var i = 0; i < all.length && picked.length < 5; i++) {
        var key = playerKey(all[i].row.player_name);
        if (!key || seen[key]) continue;
        seen[key] = true;
        picked.push(all[i]);
      }
      if (picked.length < 3) return;

      container.innerHTML = picked.map(function (item, idx) {
        var r = item.row;
        var sportLabel = SPORT_LABELS[item.sport] || item.sport.toUpperCase();
        var title = esc(r.player_name) + " · " + esc(statLabel(r.stat_type)) + ", " + directionWord(r.final_direction) + " " + formatNum(r.line);
        var note = esc(sportLabel + " · " + buildBoardNote(r, item.sport));
        return '<div class="lp-brow' + (idx === 0 ? ' is-top' : '') + '">'
          + '<span class="lp-brow__rank">' + (idx + 1) + '</span>'
          + '<div><div class="lp-brow__prop">' + title + '</div><div class="lp-brow__note">' + note + '</div></div>'
          + '<span class="lp-brow__score">' + item.score + '</span>'
          + '</div>';
      }).join("");

      var tag = document.querySelector("[data-lp-board-tag]");
      if (tag) tag.textContent = "Live slate preview";
      var topTag = document.querySelector("[data-lp-board-top-tag]");
      if (topTag) topTag.textContent = "Top " + picked.length + " props, scanned";
      var meta = document.querySelector("[data-lp-board-meta]");
      if (meta) meta.textContent = date;
      var caption = document.querySelector("[data-lp-board-caption]");
      if (caption) caption.textContent = "Live sample from the current public slate. The Confidence Score is a 50 to 100 research score, not a win chance or guarantee.";
    });
  }

  function selectDiverseLedgerRows(rows, limit) {
    var seen = {};
    var unique = [];
    for (var i = 0; i < rows.length; i++) {
      var item = rows[i];
      if (!item || String(item.sport || "").toLowerCase() === "pga") continue;
      var result = String(item.result || "").toLowerCase();
      if (result !== "win" && result !== "loss") continue;
      var key = playerKey(item.player_name) + "|" + String(item.game_date || "");
      if (seen[key]) continue;
      seen[key] = true;
      unique.push(item);
    }
    if (unique.length <= limit) return unique;
    var wins = unique.filter(function (r) { return String(r.result || "").toLowerCase() === "win"; });
    var losses = unique.filter(function (r) { return String(r.result || "").toLowerCase() === "loss"; });
    var top = unique.slice(0, limit);
    var hasWin = top.some(function (r) { return String(r.result || "").toLowerCase() === "win"; });
    var hasLoss = top.some(function (r) { return String(r.result || "").toLowerCase() === "loss"; });
    if ((!hasWin && wins.length) || (!hasLoss && losses.length)) {
      var blended = [];
      var wi = 0;
      var li = 0;
      while (blended.length < limit && (wi < wins.length || li < losses.length)) {
        if (wi < wins.length) blended.push(wins[wi++]);
        if (blended.length < limit && li < losses.length) blended.push(losses[li++]);
      }
      return blended;
    }
    return top;
  }

  function hydrateLedgerPreview() {
    var container = document.querySelector("[data-lp-ledger-body]");
    if (!container) return;
    fetchJson(API + "/api/public/results?days=3650&min_confidence=0&limit=100&offset=0")
      .then(function (payload) {
        var rows = selectDiverseLedgerRows(Array.isArray(payload.results) ? payload.results : [], 8);
        if (rows.length < 4) return;
        container.innerHTML = rows.map(function (row) {
          var isWin = String(row.result || "").toLowerCase() === "win";
          var chipClass = isWin ? "lp-chip--hit" : "lp-chip--miss";
          var chipLabel = isWin ? "Hit" : "Miss";
          var sport = SPORT_LABELS[String(row.sport || "").toLowerCase()] || String(row.sport || "").toUpperCase();
          var propText = esc(row.player_name) + " · " + esc(statLabel(row.stat_type)) + ", " + directionWord(row.predicted_direction) + " " + formatNum(row.line);
          return '<div class="lp-rrow">'
            + '<div class="lp-rrow__lean"><b>' + propText + '</b><i>' + esc(sport + " · " + (row.game_date || "")) + '</i></div>'
            + '<div class="lp-rrow__result"><span class="lp-rrow__final">final<strong>' + esc(formatNum(row.actual_value)) + '</strong></span><span class="lp-chip ' + chipClass + '">' + chipLabel + '</span></div>'
            + '</div>';
        }).join("");
      })
      .catch(function () {
        // Retain static snapshot rows when live fetch fails.
      });
  }

  function run() {
    hydrateBoard();
    hydrateLedgerPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
