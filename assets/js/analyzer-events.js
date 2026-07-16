(function (window) {
  var storageKey = "pp_analyzer_completed_v1";
  var trackedInMemory = false;

  function hasTracked() {
    if (trackedInMemory) return true;
    try {
      return window.sessionStorage.getItem(storageKey) === "1";
    } catch (_) {
      return false;
    }
  }

  function markTracked() {
    trackedInMemory = true;
    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch (_) {
      // The in-memory guard still prevents duplicate events in this page view.
    }
  }

  function sendEvent(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
      return true;
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(["event", name, params]);
      return true;
    }
    return false;
  }

  function trackCompletion(options) {
    var sport = String(options && options.sport || "").toLowerCase();
    var resultCount = Number(options && options.resultCount);
    var queryLength = Number(options && options.queryLength);
    if (!sport || !Number.isFinite(resultCount) || resultCount < 1 ||
        !Number.isFinite(queryLength) || queryLength < 1 || hasTracked()) {
      return false;
    }

    var sent = sendEvent("analyzer_completed", {
      transport_type: "beacon",
      sport: sport.slice(0, 20),
      result_count: Math.floor(resultCount),
      query_length: Math.floor(queryLength),
      page_path: window.location && window.location.pathname || "/analyzer/"
    });
    if (sent) markTracked();
    return sent;
  }

  window.ppAnalyzerEvents = { trackCompletion: trackCompletion };
})(window);
