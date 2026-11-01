(function (window) {
  "use strict";

  var RESEARCH_API = "https://web-production-3c1c4.up.railway.app/api/social/research";
  var TIMEOUT_MS = 5000;
  var DELAY_MS = 600;

  function normName(n) {
    return String(n == null ? "" : n).toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Compares the lookup's line with the current pick for the same player and stat only.
  function lineMovedNotice(playerName, lookupProp, currentPicks) {
    var who = normName(playerName);
    if (!who || !lookupProp || !Array.isArray(currentPicks)) return null;
    var oldLine = Number(lookupProp.line);
    for (var i = 0; i < currentPicks.length; i++) {
      var p = currentPicks[i];
      if (p && normName(p.player_name) === who && p.stat_type === lookupProp.stat_type && p.line != null) {
        var now = Number(p.line);
        if (isFinite(now) && isFinite(oldLine) && now !== oldLine) {
          return "The public preview line is now " + now + " (was " + oldLine + ").";
        }
        return null;
      }
    }
    return null;
  }

  function slateText(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true
    }).formatToParts(d).forEach(function (p) { parts[p.type] = p.value; });
    return parts.weekday + ", " + parts.month + " " + parts.day + " · " +
      parts.hour + ":" + parts.minute + " " + String(parts.dayPeriod || "").toUpperCase() + " ET";
  }

  function noCurrentPropMessage(nextEventStart, sport) {
    var base = "No current line for this player.";
    var when = nextEventStart ? slateText(nextEventStart) : "";
    return when ? base + " The next " + (sport === "nba" ? "NBA" : "NFL") + " slate starts " + when + "." : base;
  }

  // Returns the name to send, or null. Gate: NFL, query >= 3 chars, at most one distinct matched player.
  function singlePlayer(sport, picks, query) {
    if (sport !== "nfl" && sport !== "nba") return null;
    var q = String(query == null ? "" : query).trim();
    if (q.length < 3) return null;
    var name = null;
    var list = Array.isArray(picks) ? picks : [];
    for (var i = 0; i < list.length; i++) {
      var n = list[i] && list[i].player_name;
      if (!n) continue;
      if (name === null) name = n;
      else if (name !== n) return null;
    }
    return name || q;
  }

  // Local-only preview hook: ?researchFixture=full|summary|down swaps the backend for a
  // checked-in fixture. Honored only on loopback hosts; never active in production.
  var LOCAL_HOSTS = { "localhost": 1, "127.0.0.1": 1, "[::1]": 1 };
  function localPreviewBase(loc) {
    return loc && Object.prototype.hasOwnProperty.call(LOCAL_HOSTS, loc.hostname) &&
      /[?&]researchPreview=1(?:&|$)/.test(String(loc.search || ''))
      ? '/__analyst-preview/research' : null;
  }
  RESEARCH_API = localPreviewBase(window.location) || RESEARCH_API;
  function fixtureMode(loc) {
    if (!loc || !Object.prototype.hasOwnProperty.call(LOCAL_HOSTS, loc.hostname)) return null;
    var m = /[?&]researchFixture=([a-z]+)(?:&|$)/.exec(String(loc.search || ""));
    return m && (m[1] === "full" || m[1] === "summary" || m[1] === "down") ? m[1] : null;
  }

  var SELECTION_FIELDS = ['stat_type', 'line', 'direction', 'source_analysis_id', 'event_id', 'platform', 'period', 'variant'];
  function numericLine(value) {
    return value != null && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  }
  function validSelection(s) {
    return s && !s.invalid && (s.sport === 'nfl' || s.sport === 'nba') &&
      typeof s.player === 'string' && s.player.trim().length >= 2 && s.player.length <= 60 &&
      typeof s.stat_type === 'string' && /^[a-z0-9_]{1,80}$/i.test(s.stat_type) &&
      numericLine(s.line) !== null && (s.direction === 'OVER' || s.direction === 'UNDER');
  }
  function resultHref(sport, prop) {
    var selection = {sport: sport, player: prop.player_name, stat_type: prop.stat_type,
      line: prop.line, direction: String(prop.final_direction || prop.direction || '').toUpperCase()};
    if (!validSelection(selection)) return null;
    var params = new URLSearchParams({sport: sport, q: selection.player});
    SELECTION_FIELDS.forEach(function (key) {
      var value = Object.prototype.hasOwnProperty.call(selection, key) ? selection[key] : prop[key];
      if (value != null && value !== '' && value !== 'unknown') params.set('prop_' + key, String(value));
    });
    return '/analyzer/?' + params.toString();
  }
  function readSelection(loc) {
    var params = new URLSearchParams(loc && loc.search || '');
    if (!SELECTION_FIELDS.some(function (key) { return params.has('prop_' + key); })) return null;
    var selected = {sport: params.get('sport'), player: (params.get('q') || '').trim()};
    SELECTION_FIELDS.forEach(function (key) {
      if (params.has('prop_' + key)) selected[key] = params.get('prop_' + key);
    });
    if (!validSelection(selected) || SELECTION_FIELDS.some(function (key) {
      return selected[key] != null && (String(selected[key]).length > 200 || /[\x00-\x1f]/.test(String(selected[key])));
    })) return {invalid: true};
    selected.line = numericLine(selected.line);
    return selected;
  }
  function selectedPropIndex(lookup, selection) {
    if (!validSelection(selection) || !lookup || lookup.status !== 'ok' ||
      normName((lookup.player || {}).player_name || (lookup.player || {}).name) !== normName(selection.player)) return -1;
    var matches = [];
    (lookup.props || []).forEach(function (prop, index) {
      if (!prop || prop.stat_type !== selection.stat_type || numericLine(prop.line) !== numericLine(selection.line) || prop.direction !== selection.direction) return;
      if (SELECTION_FIELDS.slice(3).some(function (key) {
        return selection[key] != null && String(prop[key]) !== String(selection[key]);
      })) return;
      matches.push(index);
    });
    return matches.length === 1 ? matches[0] : -1;
  }
  var SELECTION_UNAVAILABLE = 'This exact line is not available in the current research response. Choose another returned line or search the player again.';

  function createController(opts) {
    var doFetch = opts.fetch || (typeof window.fetch === "function" ? window.fetch.bind(window) : null);
    var ui = opts.ui;
    var delay = opts.delay == null ? DELAY_MS : opts.delay;
    var counter = 0;
    var timer = null;

    function stale(id) { return id !== counter; }

    async function run(id, player, sport, selection) {
      var ctl = typeof AbortController === "function" ? new AbortController() : null;
      var t = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_MS);
      try {
        var mode = fixtureMode(opts.location || window.location);
        var url = RESEARCH_API + "/" + sport + "?player=" + encodeURIComponent(player);
        if (mode === "down") throw new Error("fixture down");
        if (mode) url = "/scripts/fixtures/research-nfl-" + mode + ".json";
        var res = await doFetch(url, ctl ? { signal: ctl.signal } : {});
        if (!res || !res.ok) throw new Error("http");
        var data = await res.json();
        if (stale(id)) return;
        if (data && data.status === "ok") {
          var selectedIndex = selection ? selectedPropIndex(data, selection) : undefined;
          if (selection && selectedIndex < 0) ui.message(SELECTION_UNAVAILABLE);
          else {
            // Only opening an exact result consumes the complete-analysis allowance.
            // Typing a player name remains a public, unclaimed summary.
            if (selection && sport === 'nfl' && typeof opts.claim === 'function' && !mode && !localPreviewBase(opts.location || window.location)) {
              data = await opts.claim(data, selectedIndex, sport);
              if (stale(id)) return;
            }
            ui.mount(data, selectedIndex);
          }
        }
        else if (data && data.status === "no_current_prop") ui.message(noCurrentPropMessage(data.next_event_start, sport));
        else if (selection) ui.message(SELECTION_UNAVAILABLE);
        else ui.hide();
      } catch (e) {
        if (!stale(id)) { if (selection) ui.message("Research is temporarily unavailable. Your result cards remain available; try opening the analysis again."); else ui.hide(); }
      } finally {
        clearTimeout(t);
      }
    }

    function update(state) {
      counter += 1;
      var id = counter;
      if (timer) { clearTimeout(timer); timer = null; }
      var selection = state.selection || null;
      var player = selection && validSelection(selection) && selection.sport === state.sport
        ? selection.player : singlePlayer(state.sport, state.picks, state.query);
      ui.hide();
      if (selection && (!validSelection(selection) || selection.sport !== state.sport)) { ui.message(SELECTION_UNAVAILABLE); return; }
      if (!player) return;
      if (state.immediate || !delay) { run(id, player, state.sport, selection); return; }
      timer = setTimeout(function () { timer = null; run(id, player, state.sport, selection); }, delay);
    }

    return { update: update };
  }

  window.ppAnalyzerResearch = {
    RESEARCH_API: RESEARCH_API,
    lineMovedNotice: lineMovedNotice,
    noCurrentPropMessage: noCurrentPropMessage,
    singlePlayer: singlePlayer,
    fixtureMode: fixtureMode,
    localPreviewBase: localPreviewBase,
    resultHref: resultHref,
    readSelection: readSelection,
    selectedPropIndex: selectedPropIndex,
    createController: createController
  };
})(window);
