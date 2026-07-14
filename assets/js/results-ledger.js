(function () {
  const SUMMARY_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-summary";
  const LEDGER_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results?days=3650&min_confidence=0&limit=20&offset=0";
  const BUCKETS_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-confidence-buckets?days=3650";
  const formatNumber = new Intl.NumberFormat("en-US");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const titleCase = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const formatShort = (value) => {
    value = Number(value);
    if (!Number.isFinite(value)) return "--";
    if (value >= 1000000) return `${(value / 1000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}K`;
    return formatNumber.format(value);
  };
  const formatPercent = (value) => Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : "--";
  const formatLine = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 1) : "--";
  const setText = (selector, value) => document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  };

  const createSportCard = (sport) => {
    const card = document.createElement("article");
    card.className = "sport-card";
    const label = sport.label || titleCase(sport.key);
    const rate = Number(sport.win_rate || 0);
    card.innerHTML = `<div class="sport-card-top"><div class="sport-badge">${escapeHtml(String(sport.key || label).slice(0, 3).toUpperCase())}</div><div class="win-rate">${formatPercent(rate)}</div></div><div><h3>${escapeHtml(label)}</h3><div class="sport-progress" aria-label="${escapeHtml(label)} raw historical outcome rate"><span style="--fill:${Math.max(0, Math.min(rate, 100))}%"></span></div></div><div class="sport-meta"><span>${formatNumber.format(Number(sport.total || 0))} raw rows</span><span>${formatNumber.format(Number(sport.wins || 0))}W / ${formatNumber.format(Number(sport.losses || 0))}L</span></div>`;
    return card;
  };

  async function hydrateSummary() {
    const payload = await fetchJson(SUMMARY_ENDPOINT);
    const sports = Array.isArray(payload.sports)
      ? payload.sports.filter((sport) => sport.published && String(sport.key || "").toLowerCase() !== "pga")
      : [];
    const grid = document.querySelector("[data-sport-grid]");
    if (grid && sports.length) {
      grid.textContent = "";
      sports.sort((a, b) => Number(b.total || 0) - Number(a.total || 0)).forEach((sport) => grid.appendChild(createSportCard(sport)));
    }
  }

  async function hydrateBuckets() {
    const payload = await fetchJson(BUCKETS_ENDPOINT);
    const buckets = Array.isArray(payload.buckets) ? payload.buckets.filter((bucket) => bucket.key !== "below_55") : [];
    const strip = document.querySelector("[data-confidence-strip]");
    if (strip && buckets.length) {
      strip.textContent = "";
      buckets.forEach((bucket) => {
        const card = document.createElement("article");
        card.className = "confidence-card";
        card.innerHTML = `<div><h3>${escapeHtml(bucket.label)}</h3><span>${escapeHtml(bucket.range)}</span></div><strong>${formatPercent(bucket.all?.win_rate)}</strong><p>${formatShort(bucket.all?.total)} raw rows · ${formatPercent(bucket.under?.win_rate)} UNDER · ${formatPercent(bucket.over?.win_rate)} OVER</p>`;
        strip.appendChild(card);
      });
      const total = buckets.reduce((sum, bucket) => sum + Number(bucket.all?.total || 0), 0);
      setText("[data-confidence-note]", `${formatNumber.format(total)} raw historical rows; descriptive outcome rates, not ROI.`);
    }
  }

  const resultClass = (result) => result === "WIN" ? "result-win" : result === "LOSS" ? "result-loss" : "result-push";
  const createRow = (item) => {
    const row = document.createElement("tr");
    const result = String(item.result || "push").toUpperCase();
    row.innerHTML = `<td class="num">${escapeHtml(item.game_date || "--")}</td><td><span class="sport-code">${escapeHtml(item.sport || "--")}</span></td><td class="player-cell">${escapeHtml(item.player_name || "--")}</td><td>${escapeHtml(`${titleCase(item.stat_type)} ${String(item.predicted_direction || "").toUpperCase()}`)}</td><td class="num">${formatLine(item.line)}</td><td class="num">${formatPercent(item.confidence_pct || item.predicted_score)}</td><td class="num">${formatLine(item.actual_value)}</td><td><span class="result-pill ${resultClass(result)}">${escapeHtml(result)}</span></td><td>${escapeHtml(titleCase(item.bookmaker))}</td>`;
    return row;
  };

  async function hydrateLedger() {
    const payload = await fetchJson(LEDGER_ENDPOINT);
    const total = Number(payload.total || 0);
    setText("[data-results-total]", formatShort(total));
    setText("[data-results-wins]", formatNumber.format(Number(payload.wins || 0)));
    setText("[data-results-outcome]", `${formatNumber.format(Number(payload.wins || 0))}-${formatNumber.format(Number(payload.losses || 0))}-${formatNumber.format(Number(payload.pushes || 0))}`);
    setText("[data-results-updated]", "Live totals · historical archive");
    setText("[data-ledger-summary]", `Sample from ${formatNumber.format(total)} entries under the current public-ledger collapse rules`);
    const rows = Array.isArray(payload.results)
      ? payload.results.filter((item) => String(item.sport || "").toLowerCase() !== "pga").slice(0, 10)
      : [];
    const body = document.querySelector("[data-ledger-body]");
    if (body && rows.length) {
      body.textContent = "";
      rows.forEach((item) => body.appendChild(createRow(item)));
    }
  }

  async function hydratePage() {
    const tasks = await Promise.allSettled([hydrateSummary(), hydrateBuckets(), hydrateLedger()]);
    if (tasks.some((task) => task.status === "rejected")) {
      console.warn("One or more live archive refreshes failed; static dated snapshot retained", tasks);
      setText("[data-results-updated]", "Static dated snapshot shown; live refresh partially unavailable");
    }
  }
  hydratePage();
})();
