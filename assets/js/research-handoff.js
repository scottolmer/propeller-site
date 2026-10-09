(function (window, document) {
  "use strict";

  var sources = ["prizepicks_calculator", "underdog_calculator"];
  var sports = ["nfl", "mlb", "nba"];
  var rawSource = new URLSearchParams(window.location.search).get("research_source");
  var source = sources.indexOf(rawSource) !== -1 ? rawSource : "direct";

  document.querySelectorAll('a[href^="https://app.propellerpicks.com/research/my-pick"]').forEach(function (link, index) {
    var url = new URL(link.href);
    if (url.pathname !== "/research/my-pick") return;
    if (source !== "direct") url.searchParams.set("research_source", source);
    link.href = url.href;
    link.setAttribute("data-analytics-event", "research_cta_click");
    link.setAttribute("data-cta-id", "research-my-pick-" + (url.searchParams.get("sport") || (index === 0 ? "hero" : "footer")));
    link.addEventListener("click", function (event) {
      if (typeof window.ppLoadAnalytics === "function") window.ppLoadAnalytics();
      window.dataLayer = window.dataLayer || [];
      var gtag = typeof window.gtag === "function" ? window.gtag : function () { window.dataLayer.push(arguments); };
      var params = {
        page_path: "/tools/research-my-pick/",
        page_location: window.location.origin + "/tools/research-my-pick/",
        cta_id: link.getAttribute("data-cta-id"),
        cta_surface: "research_landing",
        research_source: source,
        transport_type: "beacon"
      };
      var sport = url.searchParams.get("sport");
      if (sports.indexOf(sport) !== -1) params.sport = sport;
      var target = link.getAttribute("target");
      if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
          (typeof event.button !== "number" || event.button === 0) && (!target || target === "_self")) {
        event.preventDefault();
        var navigated = false;
        var navigate = function () {
          if (navigated) return;
          navigated = true;
          window.location.assign(url.href);
        };
        var timeout = window.setTimeout(navigate, 250);
        params.event_timeout = 250;
        params.event_callback = function () { window.clearTimeout(timeout); navigate(); };
      }
      gtag("event", "research_cta_click", params);
    });
  });
})(window, document);
