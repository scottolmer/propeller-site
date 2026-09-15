/* Queue analytics immediately, then load gtag after the critical render. */
(function () {
  'use strict';
  const reportingMeasurementId = 'G-2Z7JMN1JTL';
  const crossDomainLinker = { domains: ['propellerpicks.com', 'app.propellerpicks.com'] };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Generated pages still configure the legacy stream inline. Configure the
  // reporting stream here so every page that uses this shared loader sends one
  // page view and its existing custom events to both configured destinations.
  if (!window.ppReportingAnalyticsConfigured) {
    window.ppReportingAnalyticsConfigured = true;
    window.gtag('js', new Date());
    window.gtag('set', 'linker', crossDomainLinker);
    window.gtag('config', reportingMeasurementId, {
      cookie_domain: 'auto'
    });
  }

  let started = Boolean(window.ppAnalyticsLoadStarted);
  function loadAnalytics() {
    if (started) return;
    started = true;
    window.ppAnalyticsLoadStarted = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + reportingMeasurementId;
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
