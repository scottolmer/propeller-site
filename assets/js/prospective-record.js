(function () {
  "use strict";
  var rows = document.getElementById("recordRows");
  var summary = document.getElementById("recordSummary");
  var updated = document.getElementById("recordUpdated");
  if (!rows || !summary || !updated) return;
  var apiBase = "https://web-production-3c1c4.up.railway.app/api/public";

  function safe(value) {
    return String(value == null ? "—" : value).replace(/[&<>\"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function card(label, value) {
    return '<article class="air-card"><span class="air-label">' + safe(label) + '</span><h3>' + safe(value) + '</h3></article>';
  }
  function formatSigned(value, digits, suffix) {
    var number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return (number > 0 ? "+" : "") + number.toFixed(digits) + (suffix || "");
  }
  function getJson(path) {
    return fetch(apiBase + path, {cache: "no-store"}).then(function (response) {
      if (!response.ok) throw new Error("Ledger unavailable");
      return response.json();
    });
  }
  function getAllRecommendations(offset, collected) {
    var start = offset || 0;
    var records = collected || [];
    return getJson("/recommendations?limit=500&offset=" + start).then(function (payload) {
      var page = Array.isArray(payload.recommendations) ? payload.recommendations : [];
      var combined = records.concat(page);
      var total = Number(payload.total || combined.length);
      if (page.length && combined.length < total) {
        return getAllRecommendations(start + page.length, combined);
      }
      return {recommendations: combined, total: total};
    });
  }
  Promise.all([
    getJson("/recommendations-summary"),
    getAllRecommendations()
  ]).then(function (payloads) {
    var totals = payloads[0] || {};
    var records = Array.isArray(payloads[1].recommendations) ? payloads[1].recommendations : [];
    var generatedAt = totals.generated_at ? new Date(totals.generated_at) : null;
    updated.textContent = generatedAt && !Number.isNaN(generatedAt.getTime())
      ? "Live ledger checked " + generatedAt.toLocaleString()
      : "Live ledger loaded";
    summary.innerHTML = card("Flat-stake ROI", totals.roi_available ? formatSigned(totals.roi_pct, 2, "%") : "Awaiting priced settlement")
      + card("Priced settled picks", totals.priced_settled || 0)
      + card("Odds coverage", Number(totals.odds_coverage_pct || 0).toFixed(1) + "%");
    if (!records.length) {
      rows.innerHTML = '<tr><td colspan="7">No eligible featured picks have been published yet. The empty state is part of the record.</td></tr>';
      return;
    }
    rows.innerHTML = records.map(function (record) {
      var published = new Date(record.published_at);
      var price = record.bookmaker && record.selected_price != null
        ? record.bookmaker + " " + (record.selected_price > 0 ? "+" : "") + record.selected_price
        : "Unpriced";
      var market = record.stat_type + (record.line == null ? "" : " " + record.line);
      var status = record.result || "pending";
      return "<tr><td>" + safe(Number.isNaN(published.getTime()) ? record.published_at : published.toLocaleString()) + "</td><td>" + safe(record.sport.toUpperCase()) + "</td><td>" + safe(record.player_name) + "</td><td>" + safe(market) + "</td><td>" + safe(record.predicted_direction) + "</td><td>" + safe(price) + "</td><td><span class=\"air-chip\">" + safe(status) + "</span></td></tr>";
    }).join("");
  }).catch(function () {
    updated.textContent = "Ledger temporarily unavailable";
    summary.innerHTML = card("Status", "Unavailable");
    rows.innerHTML = '<tr><td colspan="7">The ledger could not be loaded. No stale ROI is being shown. <a href="' + apiBase + '/recommendations">Try the JSON record</a>.</td></tr>';
  });
})();
