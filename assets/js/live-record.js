    const RECORD_ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/public/results-summary";

    const formatNumber = new Intl.NumberFormat("en-US");
    const formatShort = (value) => {
      if (!Number.isFinite(value)) return "1M+";
      if (value >= 1000000) {
        const rounded = Math.floor(value / 100000) / 10;
        return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)}M+`;
      }
      if (value >= 1000) return `${Math.floor(value / 1000)}K+`;
      return formatNumber.format(value);
    };

    const setText = (selector, value) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = value;
    };

    async function hydrateRecord() {
      try {
        const response = await fetch(RECORD_ENDPOINT, { cache: "no-store" });
        if (!response.ok) throw new Error(`Record API returned ${response.status}`);
        const payload = await response.json();
        const overall = payload.overall;
        if (!overall || !overall.published) throw new Error("No published record available");

        const total = Number(overall.total || 0);
        const wins = Number(overall.wins || 0);
        const losses = Number(overall.losses || 0);
        const pushes = Number(overall.pushes || 0);
        const winRate = Number(overall.win_rate || 0);

        setText("[data-record-total]", formatShort(total));
        setText("[data-record-total-secondary]", formatShort(total));
        setText("[data-record-total-detail]", `${formatNumber.format(total)} total props`);
        setText("[data-record-win-rate]", `${winRate.toFixed(1)}%`);
        setText("[data-record-win-rate-secondary]", `${winRate.toFixed(1)}%`);
        setText("[data-record-outcome]", `${formatNumber.format(wins)}W - ${formatNumber.format(losses)}L - ${formatNumber.format(pushes)}P`);
        setText("[data-record-updated]", "Live from graded results API");
      } catch (error) {
        console.warn("Using fallback marketing record", error);
        setText("[data-record-updated]", "Fallback shown. API unavailable.");
      }
    }

    hydrateRecord();
