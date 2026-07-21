(function (global) {
  var states = {
    offseason: { title: "NFL off-season", detail: "There is no current NFL slate. Review the documented historical archive while the next season's board takes shape.", action: "Review historical results", href: "/results/", icon: "calendar", ctaTitle: "Build your NFL research routine", ctaDetail: "Use the offseason to learn a repeatable process and review what the public record does — and does not — show.", ctaAction: "Read the NFL research guide", ctaHref: "/guides/nfl-player-prop-research/" },
    preseason: { title: "NFL preseason ramp", detail: "NFL lines and roles are still forming. Current research will appear here only when a verified slate is available.", action: "Explore the analyzer", href: "/analyzer/?sport=nfl", icon: "calendar", ctaTitle: "Prepare before NFL lines are live", ctaDetail: "Start with role, practice participation, and market context; published research appears only after a verified slate is available.", ctaAction: "Read the NFL research guide", ctaHref: "/guides/nfl-player-prop-research/" },
    no_slate: { title: "No NFL slate right now", detail: "There are no NFL games available in the current slate. Check back when the next listed games are available.", action: "Review the method", href: "/how-it-works/", icon: "calendar-x", ctaTitle: "Keep the NFL process current", ctaDetail: "A game-week routine should finish by confirming the player, stat, line, timestamp, and inactive status.", ctaAction: "Read the NFL research guide", ctaHref: "/guides/nfl-player-prop-research/" },
    building: { title: "NFL research is updating", detail: "The current slate is being prepared from the latest available lines and injury context. Refresh shortly for published research.", action: "Open the NFL analyzer", href: "/analyzer/?sport=nfl", icon: "arrow-right", ctaTitle: "NFL research is updating", ctaDetail: "The board will publish only after current lines and available context have been verified.", ctaAction: "Open the NFL analyzer", ctaHref: "/analyzer/?sport=nfl" },
    degraded: { title: "Current NFL research is temporarily unavailable", detail: "We are not showing older NFL analysis as current. Please check back after the slate refresh completes.", action: "Read the NFL research guide", href: "/guides/nfl-player-prop-research/", icon: "wifi-off", ctaTitle: "Use verified NFL context", ctaDetail: "Current lines are unavailable, so the page does not substitute historical rows for a live slate.", ctaAction: "Read the NFL research guide", ctaHref: "/guides/nfl-player-prop-research/" }
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
