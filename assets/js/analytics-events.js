(function () {
  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 120);
  }

  function linkLocation(anchor) {
    var section = anchor.closest("nav, header, main, footer, section, article");
    if (!section) return "unknown";
    if (section.tagName) return section.tagName.toLowerCase();
    return "unknown";
  }

  function sendEvent(name, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, Object.assign({
      transport_type: "beacon",
      page_location: window.location.href,
      page_title: document.title
    }, params || {}));
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

    var host = url.hostname.replace(/^www\./, "");
    var path = url.pathname.toLowerCase();
    var text = cleanText(anchor.getAttribute("aria-label") || anchor.textContent);
    var params = {
      link_url: url.href,
      link_text: text,
      link_location: linkLocation(anchor)
    };

    if (host === "app.propellerpicks.com" && path.indexOf("/signup") === 0) {
      return { name: "signup_click", params: params };
    }

    if (host === "app.propellerpicks.com") {
      return { name: "web_app_click", params: params };
    }

    if (host === "apps.apple.com" || url.href.indexOf("itunes.apple.com") !== -1) {
      return { name: "app_store_click", params: params };
    }

    return null;
  }

  document.addEventListener("click", function (event) {
    var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!anchor) return;

    var classified = classifyLink(anchor);
    if (!classified) return;

    sendEvent(classified.name, classified.params);
  }, true);
})();
