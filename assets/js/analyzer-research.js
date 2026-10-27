(function (window) {
  "use strict";

  var RESEARCH_API = "https://web-production-3c1c4.up.railway.app/api/social/research";
  var TIMEOUT_MS = 5000;
  var DELAY_MS = 600;

  function lineMovedNotice(lookupProp, currentPicks) {
    if (!lookupProp || !Array.isArray(currentPicks)) return null;
    var oldLine = Number(lookupProp.line);
    for (var i = 0; i < currentPicks.length; i++) {
      var p = currentPicks[i];
      if (p && p.stat_type === lookupProp.stat_type && p.line != null) {
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

  function noCurrentPropMessage(nextEventStart) {
    var base = "No current line for this player.";
    var when = nextEventStart ? slateText(nextEventStart) : "";
    return when ? base + " The next NFL slate starts " + when + "." : base;
  }

  // Returns the name to send, or null. Gate: NFL, query >= 3 chars, at most one distinct matched player.
  function singlePlayer(sport, picks, query) {
    if (sport !== "nfl") return null;
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
  function fixtureMode(loc) {
    if (!loc || !Object.prototype.hasOwnProperty.call(LOCAL_HOSTS, loc.hostname)) return null;
    var m = /[?&]researchFixture=([a-z]+)(?:&|$)/.exec(String(loc.search || ""));
    return m && (m[1] === "full" || m[1] === "summary" || m[1] === "down") ? m[1] : null;
  }

  function createController(opts) {
    var doFetch = opts.fetch || (typeof window.fetch === "function" ? window.fetch.bind(window) : null);
    var ui = opts.ui;
    var delay = opts.delay == null ? DELAY_MS : opts.delay;
    var counter = 0;
    var timer = null;

    function stale(id) { return id !== counter; }

    async function run(id, player) {
      var ctl = typeof AbortController === "function" ? new AbortController() : null;
      var t = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_MS);
      try {
        var mode = fixtureMode(opts.location || window.location);
        var url = RESEARCH_API + "/nfl?player=" + encodeURIComponent(player);
        if (mode === "down") throw new Error("fixture down");
        if (mode) url = "/scripts/fixtures/research-nfl-" + mode + ".json";
        var res = await doFetch(url, ctl ? { signal: ctl.signal } : {});
        if (!res || !res.ok) throw new Error("http");
        var data = await res.json();
        if (stale(id)) return;
        if (data && data.status === "ok") ui.mount(data);
        else if (data && data.status === "no_current_prop") ui.message(noCurrentPropMessage(data.next_event_start));
        else ui.hide();
      } catch (e) {
        if (!stale(id)) ui.hide();
      } finally {
        clearTimeout(t);
      }
    }

    function update(state) {
      counter += 1;
      var id = counter;
      if (timer) { clearTimeout(timer); timer = null; }
      var player = singlePlayer(state.sport, state.picks, state.query);
      ui.hide();
      if (!player) return;
      if (state.immediate || !delay) { run(id, player); return; }
      timer = setTimeout(function () { timer = null; run(id, player); }, delay);
    }

    return { update: update };
  }

  window.ppAnalyzerResearch = {
    RESEARCH_API: RESEARCH_API,
    lineMovedNotice: lineMovedNotice,
    noCurrentPropMessage: noCurrentPropMessage,
    singlePlayer: singlePlayer,
    fixtureMode: fixtureMode,
    createController: createController
  };
})(window);
