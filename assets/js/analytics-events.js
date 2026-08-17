(function (window, document) {
  "use strict";

  if (!window || !document || window.ppAnalyticsEventsInitialized) return;
  window.ppAnalyticsEventsInitialized = true;

  var supportedEvents = {
    signup_click: true,
    web_app_click: true,
    app_store_click: true,
    play_store_click: true,
    analyzer_cta_click: true,
    research_cta_click: true
  };

  function cleanText(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 120);
  }

  function linkLocation(anchor) {
    var section = anchor.closest("nav, header, main, footer, section, article");
    if (!section || !section.tagName) return "unknown";
    return section.tagName.toLowerCase();
  }

  function sendEvent(name, params) {
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", name, Object.assign({
      transport_type: "beacon",
      page_location: window.location.href,
      page_title: document.title
    }, params || {}));
    return true;
  }

  function fallbackClassification(url) {
    var host = url.hostname.replace(/^www\./, "");
    var path = url.pathname.toLowerCase();
    if (host === "app.propellerpicks.com" && path.indexOf("/signup") === 0) {
      return { name: "signup_click", destination: "signup" };
    }
    if (host === "app.propellerpicks.com") {
      return { name: "web_app_click", destination: "web_app" };
    }
    if (host === "apps.apple.com" || url.href.indexOf("itunes.apple.com") !== -1) {
      return { name: "app_store_click", destination: "app_store" };
    }
    if (host === "play.google.com" && path.indexOf("/store/apps/details") === 0) {
      return { name: "play_store_click", destination: "play_store" };
    }
    return null;
  }

  function classifyLink(anchor) {
    var href = anchor.getAttribute("href");
    if (!href) return null;
    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (_) {
      return null;
    }

    var explicitName = cleanText(anchor.getAttribute("data-analytics-event"), 64);
    var fallback = fallbackClassification(url);
    var name = supportedEvents[explicitName] ? explicitName : fallback && fallback.name;
    if (!name) return null;

    return {
      name: name,
      params: {
        link_url: url.href,
        link_text: cleanText(anchor.getAttribute("aria-label") || anchor.textContent),
        link_location: linkLocation(anchor),
        cta_id: cleanText(anchor.getAttribute("data-cta-id"), 80) || "unlabeled",
        cta_surface: cleanText(anchor.getAttribute("data-cta-surface"), 80) || "unlabeled",
        cta_destination: cleanText(anchor.getAttribute("data-cta-destination"), 48) || (fallback && fallback.destination) || "internal"
      }
    };
  }

  document.addEventListener("click", function (event) {
    var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!anchor) return;
    var classified = classifyLink(anchor);
    if (classified) sendEvent(classified.name, classified.params);
  }, true);

  window.ppAnalyticsEvents = { classifyLink: classifyLink, sendEvent: sendEvent };
})(window, document);
