(function () {
  const SUMMARY_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-summary";
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

  async function hydrateSummary() {
    const response = await fetch(SUMMARY_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Summary API returned ${response.status}`);
    const payload = await response.json();
    const overall = payload.overall;
    if (!overall || !overall.published) throw new Error("No published summary available");

    const total = Number(overall.total || 0);
    const wins = Number(overall.wins || 0);
    const losses = Number(overall.losses || 0);
    const pushes = Number(overall.pushes || 0);

    setText("[data-track-total]", formatShort(total));
    setText("[data-track-win-rate]", formatPercent(overall.win_rate));
    setText("[data-track-outcome]", `${formatNumber.format(wins)}-${formatNumber.format(losses)}-${formatNumber.format(pushes)}`);
    setText("[data-track-updated]", "Live from graded results API");
  }

  const renderSplit = (label, record) => `
    <div>
      <span>${label}</span>
      <strong>${formatPercent(record?.win_rate)}</strong>
      <small>${formatNumber.format(Number(record?.total || 0))}</small>
    </div>
  `;

  const renderBucketCard = (bucket) => {
    const total = Number(bucket?.all?.total || 0);
    const isMuted = bucket.key === "below_55";
    return `
      <article class="bucket-card${isMuted ? " bucket-card-muted" : ""}">
        <div class="bucket-topline">
          <div>
            <h3>${escapeHtml(bucket.label)}</h3>
            <small>${escapeHtml(bucket.range)}</small>
          </div>
          <strong>${formatPercent(bucket?.all?.win_rate)}</strong>
        </div>
        <div class="bucket-record">
          <span>${formatShort(total)} graded</span>
          <span>${formatNumber.format(Number(bucket?.all?.wins || 0))}-${formatNumber.format(Number(bucket?.all?.losses || 0))}-${formatNumber.format(Number(bucket?.all?.pushes || 0))}</span>
        </div>
        <div class="bucket-splits" aria-label="${escapeHtml(bucket.label)} over and under split">
          ${renderSplit("OVER", bucket.over)}
          ${renderSplit("UNDER", bucket.under)}
        </div>
      </article>
    `;
  };

  async function hydrateBuckets() {
    const grid = document.querySelector("[data-bucket-grid]");
    if (!grid) return;

    const response = await fetch(BUCKETS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Confidence bucket API returned ${response.status}`);
    const payload = await response.json();
    const buckets = Array.isArray(payload.buckets) ? payload.buckets : [];
    const total = buckets.reduce((sum, bucket) => sum + Number(bucket?.all?.total || 0), 0);

    grid.innerHTML = buckets.map(renderBucketCard).join("");
    setText(
      "[data-bucket-note]",
      `${formatNumber.format(total)} lifetime graded props across all ranges. Bucket totals reconcile to the public overall record.`
    );
  }

  async function hydratePage() {
    try {
      await hydrateSummary();
    } catch (error) {
      console.warn("Track record fallback shown", error);
      setText("[data-track-updated]", "Live record unavailable. Showing fallback labels.");
    }

    try {
      await hydrateBuckets();
    } catch (error) {
      console.warn("Confidence bucket fallback shown", error);
      setText("[data-bucket-note]", "Confidence ranges are temporarily unavailable.");
    }
  }

  hydratePage();
})();
