/* Queue analytics immediately, then load gtag after the critical render. */
(function () {
  'use strict';
  // Meta pixel: queue the PageView immediately and load fbevents.js on the
  // normal page load, not on first interaction, so bounce visits are counted.
  // This site never fires a signup or conversion event from the pixel;
  // signup happens on app.propellerpicks.com and owns that event.
  const metaPixelId = '1778482833277254';
  if (!window.fbq && !window.ppMetaPixelStarted) {
    window.ppMetaPixelStarted = true;
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = window._fbq || fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    (document.head || document.documentElement).appendChild(script);

    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
  }

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
  // Automated browsers (headless Chrome, Puppeteer, Playwright) report
  // navigator.webdriver. Data-center crawlers of this kind showed up as
  // one-session, zero-engagement "Direct" visits from Singapore and China in
  // Nov 2026 and skewed every rate, so the remote tag never loads for them.
  const automated = Boolean(window.navigator && window.navigator.webdriver);
  if (automated) {
    // About 4,300 older pages (blog posts, player pages) also hardcode the
    // legacy gtag.js source after this synchronous loader. Google's documented
    // opt-out flags stop every tag on the page from sending hits, so those
    // pages stay quiet for automated browsers too.
    ['GT-57326MMH', 'G-NLXM4C2G7D', 'G-2Z7JMN1JTL'].forEach((id) => {
      window['ga-disable-' + id] = true;
    });
  }

  function loadAnalytics() {
    if (started || automated) return;
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
