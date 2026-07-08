(function () {
  var paidKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "gad_source",
    "gbraid",
    "wbraid",
    "msclkid"
  ];
  var paidMediums = ["cpc", "ppc", "paid", "paid_search", "search_ads"];
  var params = new URLSearchParams(window.location.search);
  var pagePlatform = platformFromPath(window.location.pathname);
  var calculatorStarted = false;

  function platformFromPath(pathname) {
    if (pathname.indexOf("prizepicks") !== -1) return "prizepicks";
    if (pathname.indexOf("underdog") !== -1) return "underdog";
    if (pathname.indexOf("pick6") !== -1) return "pick6";
    return "unknown";
  }

  function attributionParams() {
    var payload = {};
    paidKeys.forEach(function (key) {
      var value = params.get(key);
      if (value) payload[key] = value;
    });
    return payload;
  }

  function hasPaidAttribution() {
    var medium = String(params.get("utm_medium") || "").toLowerCase();
    return paidKeys.some(function (key) { return params.has(key); }) || paidMediums.indexOf(medium) !== -1;
  }

  function track(eventName, eventParams) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, Object.assign({
      page_path: window.location.pathname,
      page_location: window.location.href,
      platform: pagePlatform
    }, attributionParams(), eventParams || {}));
  }

  function textFor(node) {
    return String(node && node.textContent ? node.textContent : "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function markCalculatorStarted(trigger) {
    if (calculatorStarted) return;
    calculatorStarted = true;
    track("calculator_started", { interaction_type: trigger || "unknown" });
  }

  function handleCtaClick(event) {
    var link = event.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var absoluteHref = link.href || href;
    var isSignup = /app\.propellerpicks\.com\/signup/.test(absoluteHref);
    var isApp = /app\.propellerpicks\.com/.test(absoluteHref);
    var isProductCta = link.classList.contains("cta-btn") || /^\/picks\//.test(href);

    if (!isSignup && !isApp && !isProductCta) return;

    var common = {
      link_url: absoluteHref,
      link_text: textFor(link),
      cta_location: link.closest("nav") ? "nav" : link.closest(".cta-box") ? "cta_box" : "page"
    };

    if (isSignup) {
      track("signup_click", common);
    }

    track("app_cta_clicked", Object.assign({
      cta_type: isSignup ? "signup" : isApp ? "app" : "product"
    }, common));
  }

  function initCalculatorInteractionTracking() {
    var calculator = document.querySelector(".calc-card");
    if (!calculator) return;

    calculator.addEventListener("focusin", function (event) {
      if (event.target.matches("input, select, button")) markCalculatorStarted("focus");
    });
    calculator.addEventListener("input", function (event) {
      if (event.target.matches("input, select")) markCalculatorStarted("input");
    });
    calculator.addEventListener("change", function (event) {
      if (event.target.matches("input, select")) markCalculatorStarted("change");
    });
    calculator.addEventListener("click", function (event) {
      if (event.target.closest("button, input, select")) markCalculatorStarted("click");
    });
  }

  window.ppPaidSearchEvents = {
    track: track,
    trackCalculatorResult: function (eventParams) {
      track("calculator_result_viewed", eventParams);
    },
    trackCopy: function (eventParams) {
      track("calculator_copy_clicked", eventParams);
    },
    markCalculatorStarted: markCalculatorStarted
  };

  function init() {
    if (hasPaidAttribution()) track("paid_landing_view");
    initCalculatorInteractionTracking();
    document.addEventListener("click", handleCtaClick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
