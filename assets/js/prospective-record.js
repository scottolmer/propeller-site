(function () {
  "use strict";
  var rows = document.getElementById("recordRows");
  var summary = document.getElementById("recordSummary");
  var updated = document.getElementById("recordUpdated");
  if (!rows || !summary || !updated) return;

  function safe(value) {
    return String(value == null ? "—" : value).replace(/[&<>\"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function card(label, value) {
    return '<article class="air-card"><span class="air-label">' + safe(label) + '</span><h3>' + safe(value) + '</h3></article>';
  }
  fetch("/data/prospective-picks.json", {cache: "no-store"}).then(function (response) {
    if (!response.ok) throw new Error("Ledger unavailable");
    return response.json();
  }).then(function (data) {
    var records = Array.isArray(data.records) ? data.records : [];
    var settled = records.filter(function (record) { return record.status !== "open"; });
    var wins = records.filter(function (record) { return record.status === "win"; }).length;
    updated.textContent = "Ledger updated " + new Date(data.generated_at).toLocaleString();
    summary.innerHTML = card("Published rows", records.length) + card("Settled rows", settled.length) + card("Recorded wins", wins);
    if (!records.length) {
      rows.innerHTML = '<tr><td colspan="7">No rows have been captured yet. The empty state is part of the record.</td></tr>';
      return;
    }
    rows.innerHTML = records.slice().reverse().map(function (record) {
      return "<tr><td>" + safe(new Date(record.captured_at).toLocaleString()) + "</td><td>" + safe(record.sport.toUpperCase()) + "</td><td>" + safe(record.player_name) + "</td><td>" + safe(record.stat_type + " " + record.line) + "</td><td>" + safe(record.direction) + "</td><td>" + safe(record.confidence) + "</td><td><span class=\"air-chip\">" + safe(record.status) + "</span></td></tr>";
    }).join("");
  }).catch(function () {
    updated.textContent = "Ledger temporarily unavailable";
    summary.innerHTML = card("Status", "Unavailable");
    rows.innerHTML = '<tr><td colspan="7">The ledger could not be loaded. No stale summary is being shown. <a href="/data/prospective-picks.json">Try the JSON record</a>.</td></tr>';
  });
})();
