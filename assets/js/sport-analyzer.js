(function (window, document) {
  "use strict";

  var API_BASE = "https://web-production-3c1c4.up.railway.app/api/social/picks";
  var OPEN_CARDS = 5;
  var STAT_LABELS = {
    points: "Points", rebounds: "Rebounds", assists: "Assists", threes: "3-Pointers Made",
    three_pointers_made: "3-Pointers Made", steals: "Steals", blocks: "Blocks", turnovers: "Turnovers",
    pra: "Pts+Reb+Ast", pts_reb_ast: "Pts+Reb+Ast", pts_rebs_asts: "Pts+Reb+Ast", pts_reb: "Pts+Reb",
    pts_rebs: "Pts+Reb", pts_ast: "Pts+Ast", pts_asts: "Pts+Ast", reb_ast: "Reb+Ast", rebs_asts: "Reb+Ast",
    passing_yards: "Passing Yards", pass_yds: "Passing Yards", rushing_yards: "Rushing Yards",
    rush_yds: "Rushing Yards", receiving_yards: "Receiving Yards", rec_yds: "Receiving Yards",
    receptions: "Receptions", passing_tds: "Passing TDs", pass_tds: "Passing TDs",
    pass_completions: "Pass Completions", pass_attempts: "Pass Attempts",
    rushing_attempts: "Rushing Attempts", rush_attempts: "Rushing Attempts",
    rush_rec_yds: "Rush+Rec Yards", reception_yds: "Receiving Yards", tackles: "Tackles", sacks: "Sacks", interceptions: "Interceptions"
  };

  var root = document.querySelector(".sa-page[data-sport]");
  if (!root) return;
  var sport = root.getAttribute("data-sport");
  var sportLabel = root.getAttribute("data-sport-label") || sport.toUpperCase();
  var form = document.getElementById("saForm");
  var input = document.getElementById("saInput");
  var status = document.getElementById("saStatus");
  var suggest = document.getElementById("saSuggest");
  var meta = document.getElementById("saMeta");
  var grid = document.getElementById("saGrid");
  var props = [];
  var generatedAt = "";
  var feedReady = false;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function statLabel(raw) {
    raw = String(raw || "").replace(/^player_/, "");
    if (STAT_LABELS[raw]) return STAT_LABELS[raw];
    return String(raw || "").replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function confidence(prop) {
    if (prop.confidence != null) return Math.round(prop.confidence);
    return Math.round(Math.abs((prop.final_score || 50) - 50) + 50);
  }

  function tier(prop) {
    if (prop.confidence_tier) return prop.confidence_tier;
    var c = confidence(prop);
    return c >= 65 ? "strong" : c >= 58 ? "moderate" : "lean";
  }

  function etDate() {
    var et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    return et.getFullYear() + "-" + String(et.getMonth() + 1).padStart(2, "0") + "-" + String(et.getDate()).padStart(2, "0");
  }

  function isValid(prop) {
    var line = prop && prop.line;
    return prop && typeof prop.player_name === "string" && prop.player_name.trim() &&
      typeof prop.stat_type === "string" && prop.stat_type.trim() &&
      line != null && String(line).trim() && Number.isFinite(Number(line)) &&
      ["OVER", "UNDER"].indexOf(String(prop.final_direction || "").toUpperCase()) !== -1;
  }

  function openCard(prop) {
    var over = String(prop.final_direction).toUpperCase() === "OVER";
    var score = confidence(prop);
    var prompt = new URLSearchParams({
      sport: sport,
      market: statLabel(prop.stat_type),
      subject: prop.player_name,
      line: String(prop.line),
      source: "Propeller public analyzer snapshot",
      snapshot: generatedAt
    });
    return '<article class="sa-card">' +
      '<div class="sa-card__top"><p class="sa-card__player">' + esc(prop.player_name) +
        (prop.team ? '<span>' + esc(prop.team) + '</span>' : '') + '</p>' +
        '<span class="sa-card__dir sa-card__dir--' + (over ? 'over' : 'under') + '">' + (over ? 'Over' : 'Under') + '</span></div>' +
      '<p class="sa-card__line"><span>' + esc(statLabel(prop.stat_type)) + '</span><strong>' + esc(prop.line) + '</strong></p>' +
      '<p class="sa-card__score"><strong>' + score + '</strong>/100 <span>' + esc(tier(prop)) + '</span></p>' +
      '<p class="sa-card__note">' + (over ? 'Over' : 'Under') + ' directional score, not a win probability.</p>' +
      '<a class="sa-card__prompt" href="/tools/ai-betting-prompt-builder/?' + prompt.toString() + '">Build AI research prompt</a>' +
    '</article>';
  }

  function lockedCard(prop) {
    return '<article class="sa-card sa-card--locked">' +
      '<div class="sa-card__top"><p class="sa-card__player">' + esc(prop.player_name) +
        (prop.team ? '<span>' + esc(prop.team) + '</span>' : '') + '</p></div>' +
      '<p class="sa-card__line"><span>' + esc(statLabel(prop.stat_type)) + '</span><strong>' + esc(prop.line) + '</strong></p>' +
      '<a class="sa-card__unlock" href="https://app.propellerpicks.com/signup" data-analytics-event="signup_click" data-cta-id="analyzer-' + sport + '-locked-pick-signup" data-cta-surface="analyzer_' + sport + '_result" data-cta-destination="signup">See this lean in Propeller</a>' +
    '</article>';
  }

  function renderEmpty(message) {
    meta.textContent = "";
    grid.innerHTML = '<div class="sa-empty"><p>' + message + '</p></div>';
  }

  function render(query) {
    var q = query.toLowerCase().trim();
    if (!q) {
      meta.textContent = "";
      grid.innerHTML = "";
      return;
    }
    var matches = props.filter(function (p) { return p.player_name.toLowerCase().indexOf(q) !== -1; })
      .sort(function (a, b) { return confidence(b) - confidence(a); });
    if (!matches.length) {
      renderEmpty('No current ' + esc(sportLabel) + ' lines match &ldquo;' + esc(query) + '&rdquo;. Check the spelling, or try one of the players above.');
      return;
    }
    var open = Math.min(OPEN_CARDS, matches.length);
    var cards = matches.map(function (p, i) { return i < open ? openCard(p) : lockedCard(p); });
    var panelOptions = {
      sport: sport,
      sportLabel: sportLabel,
      query: query.trim(),
      players: matches.map(function (p) { return p.player_name; }).filter(function (n, i, all) { return all.indexOf(n) === i; }),
      shownCount: open,
      lockedCount: matches.length - open,
      topScore: confidence(matches[0]),
      surface: "analyzer_" + sport
    };
    if (window.ppAnalyzerSavePanel) {
      cards.splice(open, 0, window.ppAnalyzerSavePanel.html(panelOptions));
      window.ppAnalyzerSavePanel.trackView(panelOptions);
    }
    meta.textContent = matches.length + " " + sportLabel + " " + (matches.length === 1 ? "line matches" : "lines match") + " “" + query.trim() + "”. The top " + open + " by confidence are open here.";
    grid.innerHTML = cards.join("");
    if (window.ppAnalyzerEvents) {
      window.ppAnalyzerEvents.trackCompletion({ sport: sport, resultCount: matches.length, queryLength: q.length });
    }
  }

  function renderSuggestions() {
    var seen = [];
    props.slice().sort(function (a, b) { return confidence(b) - confidence(a); }).forEach(function (p) {
      if (seen.length < 6 && seen.indexOf(p.player_name) === -1) seen.push(p.player_name);
    });
    if (!seen.length) return;
    suggest.innerHTML = '<span>Try</span>' + seen.map(function (name) {
      return '<button type="button" data-player="' + esc(name) + '">' + esc(name) + '</button>';
    }).join("");
    suggest.hidden = false;
  }

  function search(value) {
    input.value = value;
    var url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim()); else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
    if (feedReady) render(value);
  }

  var debounce;
  input.addEventListener("input", function () {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(function () { if (feedReady) render(input.value); }, 200);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    search(input.value);
    var results = document.getElementById("saMeta");
    if (results && results.scrollIntoView) results.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  suggest.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("button[data-player]");
    if (button) search(button.getAttribute("data-player"));
  });

  var initial = (new URLSearchParams(window.location.search).get("q") || "").trim().slice(0, 60);
  if (initial) input.value = initial;

  fetch(API_BASE + "/" + sport + "?game_date=" + etDate() + "&limit=100", { signal: AbortSignal.timeout(10000) })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      props = Array.isArray(data.props) ? data.props.filter(isValid) : [];
      generatedAt = typeof data.generated_at === "string" ? data.generated_at : "";
      feedReady = true;
      if (!props.length) {
        status.textContent = "No current " + sportLabel + " lines are in the public feed right now. This does not tell us whether games are scheduled, and older analysis is not shown as current.";
        return;
      }
      // The feed request is capped at 100, so a full page means "at least".
      status.textContent = (props.length >= 100 ? "100+" : props.length) + " current " + sportLabel + " lines are in today's public feed. Search a player to see the lean.";
      renderSuggestions();
      if (input.value.trim()) render(input.value);
    })
    .catch(function () {
      feedReady = true;
      status.textContent = "The " + sportLabel + " feed could not be reached. Try again in a moment, or use the multi-sport analyzer.";
    });
})(window, document);
