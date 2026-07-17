(function () {
  "use strict";

  var ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/agent/v1/fantasy/mlb?limit=10";
  var MAX_AGE_MS = 60 * 60 * 1000;
  var board = document.querySelector("[data-fantasy-board]");
  var rows = [];

  function clean(value, limit) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, limit || 80);
  }

  function event(name, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, Object.assign({
      feature: "fantasy",
      feature_sport: "mlb",
      landing_page: window.location.pathname,
      transport_type: "beacon"
    }, params || {}));
  }

  function number(value) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalize(item) {
    var low = number(item.floor_points);
    var point = number(item.projected_points);
    var high = number(item.ceiling_points);
    if (!clean(item.player_name, 80) || low === null || point === null || high === null || low > point || point > high) return null;
    return {
      rank: number(item.rank) || 0,
      player: clean(item.player_name, 80),
      team: clean(item.team, 12),
      group: clean(item.position_group, 20) || "Hitter",
      low: low,
      point: point,
      high: high
    };
  }

  function rangePosition(row) {
    if (row.high <= row.low) return 50;
    return Math.max(5, Math.min(95, ((row.point - row.low) / (row.high - row.low)) * 100));
  }

  function render(list) {
    var body = board && board.querySelector("tbody");
    if (!body) return;
    body.textContent = "";
    list.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML = '<td><span class="fp-player"></span><span class="fp-team"></span></td>' +
        '<td><span class="fp-points fp-low"></span></td>' +
        '<td><span class="fp-points fp-point"></span></td>' +
        '<td><span class="fp-points fp-high"></span></td>' +
        '<td><div class="fp-range-mini"><small class="fp-low-mini"></small><span class="fp-range-mini__line"></span><small class="fp-high-mini"></small></div></td>' +
        '<td><label class="fp-compare"><input type="checkbox" data-compare> Compare</label></td>';
      tr.querySelector(".fp-player").textContent = row.player;
      tr.querySelector(".fp-team").textContent = [row.team, row.group].filter(Boolean).join(" · ");
      tr.querySelector(".fp-low").textContent = row.low.toFixed(1);
      tr.querySelector(".fp-point").textContent = row.point.toFixed(1);
      tr.querySelector(".fp-high").textContent = row.high.toFixed(1);
      tr.querySelector(".fp-low-mini").textContent = row.low.toFixed(1);
      tr.querySelector(".fp-high-mini").textContent = row.high.toFixed(1);
      tr.querySelector(".fp-range-mini__line").style.setProperty("--point", rangePosition(row).toFixed(1) + "%");
      body.appendChild(tr);
    });
  }

  function setStatus(message, state) {
    var status = document.querySelector("[data-fantasy-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function formatTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "time unavailable";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date);
  }

  function formatSlateDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return "slate date unavailable";
    var parts = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function load() {
    if (!board) return;
    fetch(ENDPOINT, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("preview unavailable");
        return response.json();
      })
      .then(function (payload) {
        var source = Array.isArray(payload.projections) ? payload.projections : Array.isArray(payload.rows) ? payload.rows : [];
        rows = source.map(normalize).filter(Boolean);
        if (!rows.length) throw new Error("no current projections");
        render(rows);
        var updated = payload.data_updated_at || payload.updated_at;
        var stale = payload.is_stale === true || !updated || Date.now() - new Date(updated).getTime() > MAX_AGE_MS;
        var relation = payload.slate_relation === "upcoming" ? "Upcoming slate" : payload.slate_relation === "past" ? "Latest available slate" : "Current slate";
        var freshness = stale ? "latest available data" : "live data";
        setStatus(relation + " · " + formatSlateDate(payload.slate_date) + " · " + freshness + " · " + rows.length + " MLB hitters · updated " + formatTime(updated) + ". Recheck before use.", stale ? "stale" : "live");
        event("fantasy_preview_loaded", { preview_status: stale ? "stale" : "live", preview_count: rows.length });
      })
      .catch(function () {
        setStatus("The live preview is temporarily unavailable. The labelled example rows below explain the output; no example is presented as current.", "error");
        event("fantasy_preview_loaded", { preview_status: "unavailable", preview_count: 0 });
      });
  }

  document.addEventListener("change", function (e) {
    if (e.target.matches("[data-fantasy-sort]")) {
      var mode = e.target.value;
      var sorted = rows.slice().sort(function (a, b) { return mode === "ceiling" ? b.high - a.high : mode === "floor" ? b.low - a.low : b.point - a.point; });
      render(sorted);
      event("fantasy_filter_changed", { filter_name: "sort", filter_value: clean(mode, 24) });
    }
    if (e.target.matches("[data-compare]")) {
      var checked = document.querySelectorAll("[data-compare]:checked");
      if (checked.length === 1) event("fantasy_compare_started", { compare_count: 1 });
      if (checked.length === 2) event("fantasy_compare_completed", { compare_count: 2 });
      if (checked.length > 2) e.target.checked = false;
    }
  });

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-fantasy-cta]");
    if (!link) return;
    var kind = clean(link.dataset.fantasyCta, 32);
    event(kind === "methodology" ? "fantasy_methodology_clicked" : "fantasy_app_cta_clicked", { cta_placement: clean(link.dataset.placement, 40) || "unknown" });
  }, true);

  event("fantasy_landing_viewed", { page_type: board ? "live_utility" : "feature_page" });
  load();
})();
