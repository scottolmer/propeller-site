(function () {
  const LEDGER_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results?days=3650&min_confidence=0&limit=1&offset=0";
  const BUCKETS_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-confidence-buckets?days=3650";
  const formatNumber = new Intl.NumberFormat("en-US");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const formatShort = (value) => Number(value) >= 1000000 ? `${(Number(value) / 1000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M` : Number(value) >= 1000 ? `${Math.round(Number(value) / 1000)}K` : formatNumber.format(Number(value));
  const formatPercent = (value) => Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : "--";
  const setText = (selector, value) => document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  };

  async function hydrateLedger() {
    const payload = await fetchJson(LEDGER_ENDPOINT);
    setText("[data-track-total]", formatShort(payload.total));
    setText("[data-track-wins]", formatNumber.format(Number(payload.wins || 0)));
    setText("[data-track-outcome]", `${formatNumber.format(Number(payload.wins || 0))}-${formatNumber.format(Number(payload.losses || 0))}-${formatNumber.format(Number(payload.pushes || 0))}`);
    setText("[data-track-updated]", "Live totals · historical archive");
  }

  const split = (label, record) => `<div><span>${label}</span><strong>${formatPercent(record?.win_rate)}</strong><small>${formatNumber.format(Number(record?.total || 0))}</small></div>`;
  async function hydrateBuckets() {
    const payload = await fetchJson(BUCKETS_ENDPOINT);
    const buckets = Array.isArray(payload.buckets) ? payload.buckets : [];
    const grid = document.querySelector("[data-bucket-grid]");
    if (grid && buckets.length) {
      grid.innerHTML = buckets.map((bucket) => `<article class="bucket-card${bucket.key === "below_55" ? " bucket-card-muted" : ""}"><div class="bucket-topline"><div><h3>${escapeHtml(bucket.label)}</h3><small>${escapeHtml(bucket.range)}</small></div><strong>${formatPercent(bucket.all?.win_rate)}</strong></div><div class="bucket-record"><span>${formatShort(bucket.all?.total)} raw rows</span><span>${formatNumber.format(Number(bucket.all?.wins || 0))}-${formatNumber.format(Number(bucket.all?.losses || 0))}-${formatNumber.format(Number(bucket.all?.pushes || 0))}</span></div><div class="bucket-splits" aria-label="${escapeHtml(bucket.label)} raw over and under split">${split("OVER", bucket.over)}${split("UNDER", bucket.under)}</div></article>`).join("");
      const total = buckets.reduce((sum, bucket) => sum + Number(bucket.all?.total || 0), 0);
      setText("[data-bucket-note]", `${formatNumber.format(total)} raw historical rows. Buckets describe the archive and are not a forward-test or ROI claim.`);
    }
  }

  async function hydratePage() {
    const tasks = await Promise.allSettled([hydrateLedger(), hydrateBuckets()]);
    if (tasks.some((task) => task.status === "rejected")) {
      console.warn("One or more live archive refreshes failed; static dated snapshot retained", tasks);
      setText("[data-track-updated]", "Static dated snapshot shown; live refresh partially unavailable");
    }
  }
  hydratePage();
})();
