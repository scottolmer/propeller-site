(function () {
  const RAW_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-summary";
  const LEDGER_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results?days=3650&min_confidence=0&limit=1&offset=0";
  const LIVE_REFRESH_TIMEOUT_MS = 2500;
  const formatNumber = new Intl.NumberFormat("en-US");

  const formatShort = (value) => {
    if (!Number.isFinite(value)) return "--";
    if (value >= 1000000) return `${(value / 1000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}K`;
    return formatNumber.format(value);
  };

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  };

  const fetchJson = async (url) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), LIVE_REFRESH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`Record API returned ${response.status}`);
      return response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  };

  async function hydrateRecord() {
    try {
      const [rawPayload, ledger] = await Promise.all([fetchJson(RAW_ENDPOINT), fetchJson(LEDGER_ENDPOINT)]);
      const raw = rawPayload.overall;
      if (!raw || !raw.published || !Number.isFinite(Number(ledger.total))) {
        throw new Error("Historical archive totals unavailable");
      }

      const rawTotal = Number(raw.total || 0);
      const ledgerTotal = Number(ledger.total || 0);
      setText("[data-record-total]", formatShort(ledgerTotal));
      setText("[data-record-total-secondary]", formatShort(ledgerTotal));
      setText("[data-record-total-detail]", `${formatNumber.format(ledgerTotal)} ledger entries`);
      setText("[data-record-raw-total]", formatShort(rawTotal));
      setText("[data-record-raw-total-secondary]", formatShort(rawTotal));
      setText("[data-record-updated]", "Live totals · historical archive");
    } catch (error) {
      console.warn("Static historical snapshot retained", error);
      setText("[data-record-updated]", "Static dated snapshot shown; live refresh unavailable");
    }
  }

  hydrateRecord();
})();
