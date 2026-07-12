(function () {
  if (window.ppSignupAttribution) return;

  var storageKey = "pp_signup_attribution_v1";
  var ttlMs = 90 * 24 * 60 * 60 * 1000;
  var fields = [
    "source", "medium", "campaign", "term", "content", "page",
    "referrer", "click_id", "click_id_type", "captured_at"
  ];
  var initialized = false;

  function paramValue(params, key) {
    var raw = params.get(key);
    return raw ? raw.trim().slice(0, 500) : "";
  }

  function urlWithoutQuery(rawUrl) {
    if (!rawUrl) return "";
    try {
      var url = new URL(rawUrl);
      return url.origin + url.pathname;
    } catch (error) {
      return "";
    }
  }

  function readStoredAttribution() {
    try {
      var stored = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (!stored || !stored.first_touch || !stored.last_touch) return null;
      var capturedAt = Date.parse(stored.last_touch.captured_at || "");
      if (!Number.isFinite(capturedAt) || Date.now() - capturedAt > ttlMs) {
        window.localStorage.removeItem(storageKey);
        return null;
      }
      return stored;
    } catch (error) {
      return null;
    }
  }

  function sourceMedium(params, referrer) {
    var utmSource = paramValue(params, "utm_source");
    var utmMedium = paramValue(params, "utm_medium");
    if (utmSource || utmMedium) {
      return { source: utmSource || "(not set)", medium: utmMedium || "(not set)" };
    }
    if (paramValue(params, "gclid") || paramValue(params, "gbraid") || paramValue(params, "wbraid")) {
      return { source: "google", medium: "cpc" };
    }
    if (paramValue(params, "msclkid")) return { source: "microsoft", medium: "cpc" };
    if (paramValue(params, "fbclid")) return { source: "meta", medium: "paid_social" };

    if (referrer) {
      try {
        var hostname = new URL(referrer).hostname.toLowerCase();
        if (/(^|\.)google\./.test(hostname)) return { source: "google", medium: "organic" };
        if (/(^|\.)bing\.com$/.test(hostname)) return { source: "bing", medium: "organic" };
        if (/(^|\.)search\.yahoo\.com$/.test(hostname)) return { source: "yahoo", medium: "organic" };
        if (/(^|\.)duckduckgo\.com$/.test(hostname)) return { source: "duckduckgo", medium: "organic" };
        if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(hostname)) return { source: "twitter", medium: "social" };
        if (/(^|\.)(facebook\.com|instagram\.com)$/.test(hostname)) return { source: "meta", medium: "social" };
        if (/(^|\.)linkedin\.com$/.test(hostname)) return { source: "linkedin", medium: "social" };
        if (/(^|\.)reddit\.com$/.test(hostname)) return { source: "reddit", medium: "social" };
        if (/(^|\.)(youtube\.com|youtu\.be)$/.test(hostname)) return { source: "youtube", medium: "social" };
        if (/(^|\.)(chatgpt\.com|openai\.com)$/.test(hostname)) return { source: "chatgpt", medium: "ai_referral" };
        if (/(^|\.)perplexity\.ai$/.test(hostname)) return { source: "perplexity", medium: "ai_referral" };
        if (/(^|\.)(claude\.ai|anthropic\.com)$/.test(hostname)) return { source: "claude", medium: "ai_referral" };
        if (/(^|\.)gemini\.google\.com$/.test(hostname)) return { source: "gemini", medium: "ai_referral" };
        if (/(^|\.)copilot\.microsoft\.com$/.test(hostname)) return { source: "copilot", medium: "ai_referral" };
        return { source: hostname, medium: "referral" };
      } catch (error) {
        // Fall through to direct when the browser supplies a malformed referrer.
      }
    }
    return { source: "(direct)", medium: "(none)" };
  }

  function currentTouch(stored) {
    var params = new URLSearchParams(window.location.search);
    var referrer = document.referrer || "";
    var attribution = sourceMedium(params, referrer);
    var sameSiteNavigation = false;
    try {
      sameSiteNavigation = Boolean(referrer) && new URL(referrer).origin === window.location.origin;
    } catch (error) {
      sameSiteNavigation = false;
    }
    if (sameSiteNavigation && stored && stored.last_touch) {
      attribution = {
        source: stored.last_touch.source,
        medium: stored.last_touch.medium
      };
    }

    var touch = {
      source: attribution.source,
      medium: attribution.medium,
      campaign: paramValue(params, "utm_campaign") || (sameSiteNavigation && stored ? stored.last_touch.campaign : ""),
      term: paramValue(params, "utm_term") || (sameSiteNavigation && stored ? stored.last_touch.term : ""),
      content: paramValue(params, "utm_content") || (sameSiteNavigation && stored ? stored.last_touch.content : ""),
      page: window.location.pathname || "/",
      referrer: urlWithoutQuery(referrer),
      captured_at: new Date().toISOString()
    };
    ["gclid", "gbraid", "wbraid", "msclkid", "fbclid"].some(function (key) {
      var id = paramValue(params, key);
      if (!id) return false;
      touch.click_id = id;
      touch.click_id_type = key;
      return true;
    });
    if (sameSiteNavigation && stored && stored.last_touch && !touch.click_id) {
      touch.click_id = stored.last_touch.click_id || "";
      touch.click_id_type = stored.last_touch.click_id_type || "";
    }
    return touch;
  }

  function captureAttribution() {
    var stored = readStoredAttribution();
    var touch = currentTouch(stored);
    var attribution = {
      first_touch: stored ? stored.first_touch : touch,
      last_touch: touch
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(attribution));
    } catch (error) {
      // Continue with in-memory attribution when storage is blocked.
    }
    return attribution;
  }

  function decoratedSignupUrl(rawHref, attribution) {
    try {
      var target = new URL(rawHref, window.location.href);
      if (target.hostname !== "app.propellerpicks.com" || target.pathname !== "/signup") return rawHref;
      [["pp_ft", attribution.first_touch], ["pp_lt", attribution.last_touch]].forEach(function (entry) {
        var prefix = entry[0];
        var touch = entry[1];
        fields.forEach(function (field) {
          if (touch && touch[field]) {
            target.searchParams.set(prefix + "_" + (field === "captured_at" ? "at" : field), touch[field]);
          }
        });
      });
      return target.toString();
    } catch (error) {
      return rawHref;
    }
  }

  function decorateSignupLinks(attribution) {
    Array.prototype.forEach.call(
      document.querySelectorAll('a[href*="app.propellerpicks.com/signup"]'),
      function (link) {
        link.href = decoratedSignupUrl(link.href, attribution);
      }
    );
  }

  function init() {
    if (initialized) {
      decorateSignupLinks(captureAttribution());
      return;
    }
    initialized = true;
    decorateSignupLinks(captureAttribution());
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest('a[href*="app.propellerpicks.com/signup"]');
      if (!link) return;
      link.href = decoratedSignupUrl(link.href, captureAttribution());
    }, true);
  }

  window.ppSignupAttribution = {
    capture: captureAttribution,
    decorateUrl: decoratedSignupUrl,
    init: init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
