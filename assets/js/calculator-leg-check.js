(function (window, document) {
  "use strict";

  // Sports with their own analyzer page; the rest use the hub's sport tab.
  var sportPages = { nfl: "/analyzer/nfl/", nba: "/analyzer/nba/" };
  var sports = ["nfl", "nba", "nhl", "mlb", "soccer"];

  function destination(sport, player) {
    var params = new URLSearchParams();
    if (!sportPages[sport]) params.set("sport", sport);
    if (player) params.set("q", player);
    var query = params.toString();
    return (sportPages[sport] || "/analyzer/") + (query ? "?" + query : "");
  }

  function sendEvent(params) {
    if (typeof window.ppLoadAnalytics === "function") window.ppLoadAnalytics();
    window.dataLayer = window.dataLayer || [];
    var gtag = typeof window.gtag === "function" ? window.gtag : function () { window.dataLayer.push(arguments); };
    gtag("event", "analyzer_cta_click", params);
  }

  function headingFor(count) {
    var n = Math.floor(Number(count));
    return n >= 2 ? "Check the " + n + " players in this entry." : "Check the players in this entry.";
  }

  function init(form) {
    var source = form.getAttribute("data-calculator") || "calculator";
    var heading = form.querySelector("[data-leg-check-heading]");
    var picks = document.getElementById("numPicks");
    var sportSelect = form.querySelector("select[name=sport]");
    var playerInput = form.querySelector("input[name=q]");

    function syncHeading() {
      if (heading && picks) heading.textContent = headingFor(picks.value);
    }
    syncHeading();
    if (picks) picks.addEventListener("change", syncHeading);

    form.addEventListener("submit", function (event) {
      var sport = sports.indexOf(sportSelect.value) !== -1 ? sportSelect.value : "nfl";
      var player = String(playerInput.value || "").trim().slice(0, 60);
      var url = destination(sport, player);
      event.preventDefault();
      var navigated = false;
      var navigate = function () {
        if (navigated) return;
        navigated = true;
        window.location.assign(url);
      };
      var timeout = window.setTimeout(navigate, 250);
      // Player names stay out of analytics: only the sport and whether one was typed.
      sendEvent({
        transport_type: "beacon",
        cta_id: "calculator-" + source + "-leg-check",
        cta_surface: "calculator_result_leg_check",
        cta_destination: "analyzer",
        sport: sport,
        has_player: player ? "yes" : "no",
        pick_count: picks ? Math.floor(Number(picks.value)) || 0 : 0,
        event_timeout: 250,
        event_callback: function () { window.clearTimeout(timeout); navigate(); }
      });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("form.pp-leg-check"), init);
  window.ppCalculatorLegCheck = { destination: destination, headingFor: headingFor };
})(window, document);
