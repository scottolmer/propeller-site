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
  var calculatorCompletedInMemory = false;
  var completionStorageKey = "pp_calculator_completed_v1:" + window.location.pathname;

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
    if (typeof window.ppLoadAnalytics === "function") window.ppLoadAnalytics();
    window.dataLayer = window.dataLayer || [];
    var gtag = typeof window.gtag === "function"
      ? window.gtag
      : function () { window.dataLayer.push(arguments); };
    gtag("event", eventName, Object.assign({
      page_path: window.location.pathname,
      page_location: window.location.href,
      platform: pagePlatform,
      transport_type: "beacon"
    }, attributionParams(), eventParams || {}));
    return true;
  }

  function preservesBrowserNavigation(event, link) {
    var target = link.target || link.getAttribute("target") || "";
    return !event || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (typeof event.button === "number" && event.button !== 0) || (target && target !== "_self");
  }

  function navigateOnce(url) {
    var navigated = false;
    return function () {
      if (navigated) return;
      navigated = true;
      if (window.location && typeof window.location.assign === "function") {
        window.location.assign(url);
      } else {
        window.location.href = url;
      }
    };
  }

  function textFor(node) {
    return String(node && node.textContent ? node.textContent : "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function clean(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 120);
  }

  function markCalculatorStarted(trigger) {
    if (calculatorStarted) return;
    calculatorStarted = true;
    track("calculator_started", { interaction_type: trigger || "unknown" });
  }

  function hasCompletedCalculator() {
    if (calculatorCompletedInMemory) return true;
    try {
      return window.sessionStorage.getItem(completionStorageKey) === "1";
    } catch (_) {
      return false;
    }
  }

  function markCalculatorCompleted() {
    calculatorCompletedInMemory = true;
    try {
      window.sessionStorage.setItem(completionStorageKey, "1");
    } catch (_) {
      // The in-memory guard still prevents duplicate events in this page view.
    }
  }

  function trackCalculatorCompletion(eventParams) {
    if (hasCompletedCalculator()) return false;
    var safe = {};
    if (eventParams && /^[a-z_]{1,24}$/.test(String(eventParams.entry_type || ""))) {
      safe.entry_type = eventParams.entry_type;
    }
    if (eventParams && Number.isFinite(Number(eventParams.num_picks))) {
      safe.num_picks = Math.floor(Number(eventParams.num_picks));
    }
    track("calculator_completed", safe);
    markCalculatorCompleted();
    return true;
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
      cta_location: link.closest("nav") ? "nav" : link.closest(".cta-box") ? "cta_box" : "page",
      cta_id: clean(link.getAttribute("data-cta-id"), 80) || "unlabeled",
      cta_surface: clean(link.getAttribute("data-cta-surface"), 80) || "calculator"
    };

    if (isSignup && !preservesBrowserNavigation(event, link) && typeof event.preventDefault === "function") {
      event.preventDefault();
      var navigate = navigateOnce(absoluteHref);
      var timeout = window.setTimeout(navigate, 250);
      common.event_timeout = 250;
      common.event_callback = function () {
        window.clearTimeout(timeout);
        navigate();
      };
      track("signup_click", common);
      return;
    }

    track(isSignup ? "signup_click" : isApp ? "web_app_click" : "research_cta_click", common);
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
    trackCalculatorCompletion: trackCalculatorCompletion,
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
