(function () {
  const RAW_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-summary";
  const LEDGER_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results?days=3650&min_confidence=0&limit=1&offset=0";
  const FORWARD_ROI_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/recommendations-summary";
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

  const setTone = (selector, value) => {
    const tone = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
    document.querySelectorAll(selector).forEach((node) => { node.dataset.roiTone = tone; });
  };

  const formatSigned = (value, suffix = "") => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return `—${suffix}`;
    const sign = numeric > 0 ? "+" : "";
    return `${sign}${numeric.toFixed(2)}${suffix}`;
  };

  const formatTrackingDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed);
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

  async function hydrateForwardRoi() {
    try {
      const payload = await fetchJson(FORWARD_ROI_ENDPOINT);
      const pricedSettled = Number(payload.priced_settled || 0);
      const netUnits = Number(payload.net_units || 0);
      const coverage = Number(payload.odds_coverage_pct || 0);
      const roi = Number(payload.roi_pct);
      const trackingDate = formatTrackingDate(payload.cohort_start);

      setText("[data-forward-priced-settled]", formatNumber.format(pricedSettled));
      setText("[data-forward-net-units]", formatSigned(netUnits, "u"));
      setTone("[data-forward-net-units]", netUnits);

      if (payload.roi_available === true && pricedSettled > 0 && Number.isFinite(roi)) {
        setText("[data-forward-roi]", `${roi > 0 ? "+" : ""}${roi.toFixed(1)}%`);
        setTone("[data-forward-roi]", roi);
        setText(
          "[data-forward-roi-detail]",
          `${formatNumber.format(pricedSettled)} priced settled ${pricedSettled === 1 ? "pick" : "picks"} · flat 1-unit stakes`,
        );
        const since = trackingDate ? ` · tracking since ${trackingDate}` : "";
        setText("[data-forward-roi-updated]", `${coverage.toFixed(1)}% settled-pick odds coverage${since}`);
        return;
      }

      setText("[data-forward-roi]", "—");
      setTone("[data-forward-roi]", 0);
      setText("[data-forward-roi-detail]", "Tracking begins after the first eligible priced pick settles.");
      const published = Number(payload.published_total || 0);
      const status = published > 0
        ? `${formatNumber.format(published)} public ${published === 1 ? "pick" : "picks"} logged · awaiting priced settlement`
        : "Forward ledger live · awaiting the first eligible public pick";
      setText("[data-forward-roi-updated]", status);
    } catch (error) {
      console.warn("Forward ROI ledger unavailable", error);
      setText("[data-forward-roi-updated]", "Forward ROI ledger pending API availability");
    }
  }

  // The page ships a dated static snapshot, so live enrichment must not
  // compete with the critical render. Hydrate after load, when the browser is
  // idle, while preserving the forward-ledger-first request order.
  function startHydration() {
    hydrateForwardRoi().finally(hydrateRecord);
  }

  function scheduleHydration() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(startHydration, { timeout: 2500 });
    } else {
      window.setTimeout(startHydration, 1000);
    }
  }

  if (document.readyState === 'complete') {
    scheduleHydration();
  } else {
    window.addEventListener('load', scheduleHydration, { once: true });
  }
})();
