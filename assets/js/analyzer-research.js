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

  // Returns the single player name when sport is NFL and picks hold exactly one distinct player.
  function singlePlayer(sport, picks) {
    if (sport !== "nfl" || !Array.isArray(picks) || !picks.length) return null;
    var name = null;
    for (var i = 0; i < picks.length; i++) {
      var n = picks[i] && picks[i].player_name;
      if (!n) return null;
      if (name === null) name = n;
      else if (name !== n) return null;
    }
    return name;
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
        var res = await doFetch(RESEARCH_API + "/nfl?player=" + encodeURIComponent(player), ctl ? { signal: ctl.signal } : {});
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
      var player = singlePlayer(state.sport, state.picks);
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
    createController: createController
  };
})(window);
