(function (global) {
  var states = {
    offseason: { title: "NFL off-season", detail: "There is no current NFL slate. Review the documented historical archive while the next season's board takes shape.", action: "Review historical results", href: "/results/", icon: "calendar" },
    preseason: { title: "NFL preseason ramp", detail: "NFL lines and roles are still forming. Current research will appear here only when a verified slate is available.", action: "Explore the analyzer", href: "/analyzer/", icon: "calendar" },
    no_slate: { title: "No NFL slate right now", detail: "There are no NFL games available in the current slate. Check back when the next listed games are available.", action: "Review the method", href: "/how-it-works/", icon: "calendar-x" },
    building: { title: "NFL research is updating", detail: "The current slate is being prepared from the latest available lines and injury context. Refresh shortly for published research.", action: "Open the full workspace", href: "https://app.propellerpicks.com/signup", icon: "arrow-right" },
    degraded: { title: "Current NFL research is temporarily unavailable", detail: "We are not showing older NFL analysis as current. Please check back after the slate refresh completes.", action: "Open the research workspace", href: "https://app.propellerpicks.com/signup", icon: "wifi-off" }
  };

  function slateState(payload) {
    var state = payload && (payload.state || (payload.slate && payload.slate.state));
    return state === "ready" || Object.prototype.hasOwnProperty.call(states, state) ? state : "degraded";
  }

  function presentation(payload) {
    var state = slateState(payload);
    return state === "ready" ? null : Object.assign({ state: state }, states[state]);
  }

  global.ppNflSlate = { state: slateState, presentation: presentation };
})(window);
