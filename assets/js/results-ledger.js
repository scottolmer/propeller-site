(function () {
  const SUMMARY_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-summary";
  const LEDGER_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results?days=30&limit=80&offset=0";
  const BUCKETS_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-confidence-buckets?days=3650";

  const formatNumber = new Intl.NumberFormat("en-US");

  const formatShort = (value) => {
    if (!Number.isFinite(value)) return "--";
    if (value >= 1000000) {
      const rounded = Math.floor(value / 100000) / 10;
      return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)}M+`;
    }
    if (value >= 1000) return `${Math.floor(value / 1000)}K+`;
    return formatNumber.format(value);
  };

  const formatPercent = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toFixed(1)}%` : "--";
  };

  const formatLine = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(number % 1 === 0 ? 0 : 1) : "--";
  };

  const titleCase = (value) => {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  const createSportCard = (sport) => {
    const card = document.createElement("article");
    card.className = "sport-card";
    const winRate = Number(sport.win_rate || 0);
    const fill = Math.max(0, Math.min(winRate, 100));
    card.innerHTML = `
      <div class="sport-card-top">
        <div>
          <div class="sport-badge">${String(sport.key || sport.label || "").slice(0, 3).toUpperCase()}</div>
        </div>
        <div class="win-rate">${formatPercent(winRate)}</div>
      </div>
      <div>
        <h3>${sport.label || titleCase(sport.key)}</h3>
        <div class="sport-progress" aria-label="${sport.label || sport.key} graded outcome rate">
          <span style="--fill: ${fill}%"></span>
        </div>
      </div>
      <div class="sport-meta">
        <span>${formatNumber.format(Number(sport.total || 0))} graded</span>
        <span>${formatNumber.format(Number(sport.wins || 0))}W / ${formatNumber.format(Number(sport.losses || 0))}L</span>
      </div>
    `;
    return card;
  };

  async function hydrateSummary() {
    const response = await fetch(SUMMARY_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Summary API returned ${response.status}`);
    const payload = await response.json();
    const overall = payload.overall;
    const sports = Array.isArray(payload.sports) ? payload.sports.filter((sport) => sport.published) : [];
    if (!overall || !overall.published) throw new Error("No published summary available");

    const total = Number(overall.total || 0);
    const wins = Number(overall.wins || 0);
    const losses = Number(overall.losses || 0);
    const pushes = Number(overall.pushes || 0);

    setText("[data-results-total]", formatShort(total));
    setText("[data-results-wins]", formatNumber.format(wins));
    setText("[data-results-outcome]", `${formatNumber.format(wins)}-${formatNumber.format(losses)}-${formatNumber.format(pushes)}`);
    setText("[data-results-sports]", String(sports.length || "--"));
    setText("[data-results-updated]", "Live from graded results API");

    const sportGrid = document.querySelector("[data-sport-grid]");
    if (sportGrid) {
      sportGrid.textContent = "";
      sports
        .slice()
        .sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
        .forEach((sport) => sportGrid.appendChild(createSportCard(sport)));
    }
  }

  const createConfidenceCard = (bucket) => {
    const card = document.createElement("article");
    card.className = "confidence-card";
    card.innerHTML = `
      <div>
        <h3>${escapeHtml(bucket.label)}</h3>
        <span>${escapeHtml(bucket.range)}</span>
      </div>
      <strong>${formatPercent(bucket.all?.win_rate)}</strong>
      <p>${formatShort(Number(bucket.all?.total || 0))} graded · ${formatPercent(bucket.under?.win_rate)} UNDER · ${formatPercent(bucket.over?.win_rate)} OVER</p>
    `;
    return card;
  };

  async function hydrateConfidenceBuckets() {
    const strip = document.querySelector("[data-confidence-strip]");
    if (!strip) return;

    const response = await fetch(BUCKETS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Confidence bucket API returned ${response.status}`);
    const payload = await response.json();
    const buckets = Array.isArray(payload.buckets) ? payload.buckets.filter((bucket) => bucket.key !== "below_55") : [];
    const total = Number(payload.summary?.total || 0);

    strip.textContent = "";
    buckets.forEach((bucket) => strip.appendChild(createConfidenceCard(bucket)));
    setText("[data-confidence-note]", `${formatNumber.format(total)} lifetime graded props across all public confidence ranges.`);
  }

  const ledgerKey = (item) => {
    return [
      item.game_date,
      item.sport,
      item.player_name,
      item.stat_type,
      item.line,
      item.predicted_direction,
      item.actual_value,
      item.bookmaker
    ].join("|");
  };

  const dedupeResults = (results) => {
    const seen = new Set();
    const unique = [];
    results.forEach((item) => {
      const key = ledgerKey(item);
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(item);
    });
    return unique;
  };

  const resultClass = (result) => {
    const normalized = String(result || "").toLowerCase();
    if (normalized === "win") return "result-win";
    if (normalized === "loss") return "result-loss";
    return "result-push";
  };

  const createLedgerRow = (item) => {
    const direction = String(item.predicted_direction || "").toUpperCase();
    const market = `${titleCase(item.stat_type)} ${direction}`;
    const result = String(item.result || "push").toUpperCase();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="num">${item.game_date || "--"}</td>
      <td><span class="sport-code">${item.sport || "--"}</span></td>
      <td class="player-cell">${item.player_name || "--"}</td>
      <td>${market}</td>
      <td class="num">${formatLine(item.line)}</td>
      <td class="num">${formatPercent(item.confidence_pct || item.predicted_score)}</td>
      <td class="num">${formatLine(item.actual_value)}</td>
      <td><span class="result-pill ${resultClass(result)}">${result}</span></td>
      <td>${titleCase(item.bookmaker)}</td>
    `;
    return row;
  };

  async function hydrateLedger() {
    const response = await fetch(LEDGER_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Ledger API returned ${response.status}`);
    const payload = await response.json();
    const results = Array.isArray(payload.results) ? dedupeResults(payload.results).slice(0, 10) : [];
    const body = document.querySelector("[data-ledger-body]");
    if (!body) return;

    body.textContent = "";
    if (!results.length) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="9">No recent graded results are available.</td>`;
      body.appendChild(row);
      return;
    }

    results.forEach((item) => body.appendChild(createLedgerRow(item)));
    setText(
      "[data-ledger-summary]",
      `${formatNumber.format(Number(payload.total || results.length))} graded results in the last ${payload.filters?.days || 30} days`
    );
  }

  async function hydratePage() {
    try {
      await Promise.all([hydrateSummary(), hydrateLedger(), hydrateConfidenceBuckets()]);
    } catch (error) {
      console.warn("Results page fallback shown", error);
      setText("[data-results-updated]", "Live record unavailable. Showing fallback labels.");
      setText("[data-ledger-summary]", "Recent ledger unavailable.");
      setText("[data-confidence-note]", "Confidence ranges unavailable.");
    }
  }

  hydratePage();
})();
