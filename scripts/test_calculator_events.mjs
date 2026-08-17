import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/paid-search-events.js", import.meta.url), "utf8");
const calculators = [
  "tools/prizepicks-payout-calculator/index.html",
  "tools/underdog-payout-calculator/index.html",
  "tools/pick6-payout-calculator/index.html",
].map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));

function load({ lazyGtag = false } = {}) {
  const listeners = new Map();
  const values = new Map();
  const events = [];
  let analyticsLoads = 0;
  const timers = [];
  const navigations = [];
  const location = {
    pathname: "/tools/prizepicks-payout-calculator/",
    href: "https://propellerpicks.com/tools/prizepicks-payout-calculator/",
    search: "",
    assign: (url) => { navigations.push(url); location.href = url; },
  };
  const window = {
    location,
    sessionStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    ppLoadAnalytics: () => { analyticsLoads += 1; },
    setTimeout: (fn, ms) => {
      timers.push({ fn, ms, cancelled: false });
      return timers.length - 1;
    },
    clearTimeout: (id) => { timers[id].cancelled = true; },
  };
  if (lazyGtag) {
    window.dataLayer = [];
  } else {
    window.gtag = (...args) => events.push(args);
  }
  const document = {
    readyState: "complete",
    querySelector: () => null,
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
  };
  vm.runInNewContext(source, { window, document, URLSearchParams, Number, String, Object, Array, RegExp });
  return {
    events, api: window.ppPaidSearchEvents, click: listeners.get("click"),
    window, analyticsLoads: () => analyticsLoads, timers, navigations,
  };
}

test("records one privacy-safe calculator completion for a valid browser session", () => {
  const { events, api, analyticsLoads } = load();
  assert.equal(api.trackCalculatorCompletion({ entry_type: "power", num_picks: 4, amount: 20 }), true);
  assert.equal(api.trackCalculatorCompletion({ entry_type: "power", num_picks: 4, amount: 50 }), false);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [["event", "calculator_completed", {
    page_path: "/tools/prizepicks-payout-calculator/",
    page_location: "https://propellerpicks.com/tools/prizepicks-payout-calculator/",
    platform: "prizepicks",
    transport_type: "beacon",
    entry_type: "power",
    num_picks: 4,
  }]]);
  assert.equal(JSON.stringify(events).includes("amount"), false);
  assert.equal(analyticsLoads(), 1);
});

test("records one CTA event instead of a duplicate app CTA event", () => {
  const { events, click } = load();
  const signupLink = {
    href: "https://app.propellerpicks.com/signup",
    textContent: "Continue your research free",
    getAttribute: (name) => ({
      href: "https://app.propellerpicks.com/signup",
      "data-cta-id": "calculator-prizepicks-result-signup",
      "data-cta-surface": "calculator_result",
    })[name] ?? null,
    closest: (selector) => selector === "nav" || selector === ".cta-box" ? null : null,
    classList: { contains: () => false },
  };
  click({ target: { closest: () => signupLink } });
  assert.equal(events.length, 1);
  assert.equal(events[0][1], "signup_click");
  assert.equal(events[0][2].cta_id, "calculator-prizepicks-result-signup");
  assert.equal(JSON.stringify(events).includes("app_cta_clicked"), false);
  assert.equal(events[0][2].transport_type, "beacon");
});

test("queues the first CTA event synchronously while the analytics loader is still lazy", () => {
  const { click, window, analyticsLoads } = load({ lazyGtag: true });
  const signupLink = {
    href: "https://app.propellerpicks.com/signup",
    textContent: "Continue your research free",
    getAttribute: (name) => ({ "data-cta-id": "calculator-first-signup", "data-cta-surface": "calculator_result" })[name] ?? null,
    closest: () => null,
    classList: { contains: () => false },
  };
  click({ target: { closest: () => signupLink } });
  assert.equal(analyticsLoads(), 1);
  assert.equal(window.dataLayer.length, 1);
  assert.equal(window.dataLayer[0][1], "signup_click");
  assert.equal(window.dataLayer[0][2].transport_type, "beacon");
});

test("hands an ordinary same-tab signup click to GA for at most 250ms, then navigates exactly once", () => {
  const { events, click, timers, navigations } = load();
  let prevented = false;
  const signupLink = {
    href: "https://app.propellerpicks.com/signup",
    target: "",
    textContent: "Continue your research free",
    getAttribute: (name) => ({ "data-cta-id": "calculator-result-signup", "data-cta-surface": "calculator_result" })[name] ?? null,
    closest: () => null,
    classList: { contains: () => false },
  };
  click({ target: { closest: () => signupLink }, button: 0, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 250);
  assert.equal(events[0][2].transport_type, "beacon");
  assert.equal(events[0][2].event_timeout, 250);
  events[0][2].event_callback();
  timers[0].fn();
  assert.deepEqual(navigations, ["https://app.propellerpicks.com/signup"]);
});

test("preserves modifier and new-tab signup behavior while still queuing the beacon", () => {
  const { events, click, timers, navigations } = load();
  let prevented = false;
  const signupLink = {
    href: "https://app.propellerpicks.com/signup",
    target: "_blank",
    textContent: "Continue your research free",
    getAttribute: (name) => ({ "data-cta-id": "calculator-result-signup", "data-cta-surface": "calculator_result", target: "_blank" })[name] ?? null,
    closest: () => null,
    classList: { contains: () => false },
  };
  click({ target: { closest: () => signupLink }, button: 0, ctrlKey: true, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, false);
  assert.equal(timers.length, 0);
  assert.equal(navigations.length, 0);
  assert.equal(events[0][1], "signup_click");
  assert.equal(events[0][2].event_callback, undefined);
  assert.equal(events[0][2].transport_type, "beacon");
});

test("all calculator pages use the single completion contract and result signup CTA", () => {
  for (const page of calculators) {
    assert.match(page, /trackCalculatorCompletion\(/);
    assert.doesNotMatch(page, /calculator_used/);
    assert.doesNotMatch(page, /trackCalculatorResult/);
    assert.match(page, /Continue your research free/);
    assert.match(page, /data-cta-surface="calculator_result"/);
    assert.match(page, /analytics-loader\.js\?v=20260817/);
    assert.match(page, /paid-search-events\.js\?v=20260817/);
  }
});
