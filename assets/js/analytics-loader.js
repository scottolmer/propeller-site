/* Queue analytics immediately, then load gtag after the critical render. */
(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  let started = false;
  function loadAnalytics() {
    if (started) return;
    started = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-NLXM4C2G7D';
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
