/* Queue analytics immediately, then load gtag after the critical render. */
(function () {
  'use strict';
  // This reporting stream is a destination of the shared Google tag.
  const googleTagId = 'GT-57326MMH';
  const crossDomainLinker = { domains: ['propellerpicks.com', 'app.propellerpicks.com'] };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // This is the page's only Google-tag configuration. The provider links both
  // GA destinations to this tag, so a second destination config would create
  // another automatic page view.
  if (!window.ppAnalyticsConfigured) {
    window.ppAnalyticsConfigured = true;
    window.gtag('js', new Date());
    window.gtag('set', 'linker', crossDomainLinker);
    const config = { cookie_domain: 'auto' };
    // Research query values belong to the worksheet, not the automatic page view.
    if (window.location && window.location.pathname === '/tools/ai-betting-prompt-builder/') {
      config.page_location = window.location.origin + window.location.pathname;
    }
    window.gtag('config', googleTagId, config);
  }

  let started = Boolean(window.ppAnalyticsLoadStarted);
  function loadAnalytics() {
    if (started) return;
    // Older generated pages retain their legacy gtag source. Reuse it instead
    // of inserting a second remote script when this shared loader runs there.
    if (document.querySelector && document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      started = true;
      window.ppAnalyticsLoadStarted = true;
      return;
    }
    started = true;
    window.ppAnalyticsLoadStarted = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + googleTagId;
    document.head.appendChild(script);
  }

  // Other deferred event handlers can start loading before their first event is
  // queued. This function is synchronous and never delays a navigation.
  window.ppLoadAnalytics = loadAnalytics;

  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, loadAnalytics, { once: true, passive: true });
  });
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 1500 });
    } else {
      window.setTimeout(loadAnalytics, 750);
    }
  }, { once: true });
}());
