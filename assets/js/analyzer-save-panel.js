(function (window) {
  "use strict";

  var viewKey = "pp_analyzer_save_panel_view_v1";
  var viewedInMemory = false;
  var appStoreUrl = "https://apps.apple.com/app/id6760788202";
  var playStoreUrl = "https://play.google.com/store/apps/details?id=com.propellerpicks.propeller";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cleanSurface(value) {
    return String(value || "analyzer").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
  }

  // One player in the results reads better by name; a broader search falls
  // back to the visitor's own query so the copy never guesses who they meant.
  function subjectFor(options) {
    var players = Array.isArray(options.players) ? options.players.filter(Boolean) : [];
    if (players.length === 1) return { name: players[0], single: true };
    return { name: options.query || "", single: false };
  }

  function headline(options, subject) {
    var locked = Math.max(0, Math.floor(Number(options.lockedCount) || 0));
    if (locked > 0 && subject.single) {
      return locked + " more " + esc(subject.name) + (locked === 1 ? " line is" : " lines are") + " waiting in Propeller.";
    }
    if (locked > 0) {
      return locked + " more matching " + (locked === 1 ? "line is" : "lines are") + " waiting in Propeller.";
    }
    if (subject.single) return "Keep " + esc(subject.name) + " research in one place.";
    return "Keep this research in one place.";
  }

  function html(options) {
    options = options || {};
    var subject = subjectFor(options);
    var shown = Math.max(0, Math.floor(Number(options.shownCount) || 0));
    var locked = Math.max(0, Math.floor(Number(options.lockedCount) || 0));
    var top = Math.round(Number(options.topScore) || 0);
    var surface = cleanSurface(options.surface);
    var sportLabel = esc(options.sportLabel || "");
    var ticketTitle = subject.single
      ? esc(subject.name)
      : "&ldquo;" + esc(subject.name) + "&rdquo;";

    return '' +
      '<aside class="pp-save-panel" id="analyzerNextStep" aria-labelledby="ppSavePanelHeading" data-sport="' + esc(options.sport || "") + '">' +
        '<div class="pp-save-panel__copy">' +
          '<h3 class="pp-save-panel__heading" id="ppSavePanelHeading">' + headline(options, subject) + '</h3>' +
          '<p class="pp-save-panel__body">See every line scored for this search and the reasons behind each lean, on the web or in the iPhone and Android apps.</p>' +
          '<div class="pp-save-panel__actions">' +
            '<a class="pp-save-panel__primary" href="https://app.propellerpicks.com/signup" data-analytics-event="signup_click" data-cta-id="analyzer-save-panel-signup" data-cta-surface="' + surface + '_save_panel" data-cta-destination="signup">Save this research</a>' +
            '<a class="pp-save-panel__store" href="' + appStoreUrl + '" rel="noopener" data-cta-id="analyzer-save-panel-ios" data-cta-surface="' + surface + '_save_panel">iPhone app</a>' +
            '<a class="pp-save-panel__store" href="' + playStoreUrl + '" rel="noopener" data-cta-id="analyzer-save-panel-android" data-cta-surface="' + surface + '_save_panel">Android app</a>' +
          '</div>' +
          '<p class="pp-save-panel__terms">Public tools stay free. Account access terms are shown in the app.</p>' +
        '</div>' +
        '<div class="pp-save-panel__ticket" aria-label="Summary of this search">' +
          '<p class="pp-save-panel__ticket-title">' + ticketTitle + (sportLabel ? ' <span>' + sportLabel + '</span>' : '') + '</p>' +
          '<dl class="pp-save-panel__rows">' +
            '<div><dt>Open on this page</dt><dd>' + shown + '</dd></div>' +
            '<div><dt>In the workspace</dt><dd>' + (shown + locked) + '</dd></div>' +
            (top >= 50 ? '<div class="pp-save-panel__score"><dt>Top confidence</dt><dd>' + top + '<small>/100</small></dd></div>' : '') +
          '</dl>' +
          (top >= 50 ? '<p class="pp-save-panel__ticket-note">Directional score, not a win probability.</p>' : '') +
        '</div>' +
      '</aside>';
  }

  function hasViewed() {
    if (viewedInMemory) return true;
    try {
      return window.sessionStorage.getItem(viewKey) === "1";
    } catch (_) {
      return false;
    }
  }

  function markViewed() {
    viewedInMemory = true;
    try {
      window.sessionStorage.setItem(viewKey, "1");
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

  // Counts how many completed searches actually saw the save prompt, so
  // signup_click on this surface has a denominator. Once per session.
  function trackView(options) {
    if (hasViewed()) return false;
    var sport = String(options && options.sport || "").toLowerCase().slice(0, 20);
    if (!sport) return false;
    var sent = sendEvent("analyzer_save_panel_view", {
      transport_type: "beacon",
      sport: sport,
      locked_count: Math.max(0, Math.floor(Number(options.lockedCount) || 0)),
      cta_surface: cleanSurface(options.surface) + "_save_panel",
      page_path: window.location && window.location.pathname || "/analyzer/"
    });
    if (sent) markViewed();
    return sent;
  }

  window.ppAnalyzerSavePanel = { html: html, trackView: trackView };
})(window);
