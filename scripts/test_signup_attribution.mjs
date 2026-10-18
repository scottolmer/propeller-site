import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/signup-attribution.js", import.meta.url), "utf8");
const storageKey = "pp_signup_attribution_v1";
const day = 24 * 60 * 60 * 1000;

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    value(key) { return values.get(key); },
  };
}

function visit({ store, now, href, referrer = "" }) {
  const url = new URL(href);
  class TestDate extends Date {
    constructor(value) { super(value === undefined ? now : value); }
    static now() { return now; }
    static parse(value) { return Date.parse(value); }
  }
  const links = [];
  const document = {
    readyState: "complete",
    referrer,
    querySelectorAll() { return links; },
    addEventListener() {},
  };
  const window = {
    location: { href: url.href, origin: url.origin, pathname: url.pathname, search: url.search },
    localStorage: store,
  };
  vm.runInNewContext(source, { window, document, URL, URLSearchParams, Date: TestDate, Number, JSON });
  return {
    attribution: JSON.parse(JSON.stringify(window.ppSignupAttribution.capture())),
    decorate: window.ppSignupAttribution.decorateUrl,
  };
}

test("keeps Meta as last touch through same-site navigation and a direct return", () => {
  const store = storage();
  const landed = visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=research_tx_il_20261015&utm_content=visual_a_actual_app&fbclid=meta-click",
  }).attribution;
  const internal = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/pricing/",
    referrer: "https://propellerpicks.com/",
  }).attribution;
  const returned = visit({
    store,
    now: Date.UTC(2026, 9, 17),
    href: "https://propellerpicks.com/",
  }).attribution;

  assert.equal(internal.last_touch.source, "meta");
  assert.equal(returned.last_touch.campaign, "research_tx_il_20261015");
  assert.equal(returned.last_touch.content, "visual_a_actual_app");
  assert.equal(returned.last_touch.captured_at, landed.last_touch.captured_at);
  assert.equal(returned.first_touch.captured_at, landed.first_touch.captured_at);
});

test("a new explicit campaign overrides last touch even with a same-origin referrer", () => {
  const store = storage();
  const first = visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=campaign-a&utm_content=visual-a",
  }).attribution;
  const second = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=campaign-b&utm_content=visual-b&fbclid=new-click",
    referrer: "https://propellerpicks.com/pricing/",
  }).attribution;

  assert.equal(second.first_touch.campaign, first.first_touch.campaign);
  assert.equal(second.last_touch.campaign, "campaign-b");
  assert.equal(second.last_touch.content, "visual-b");
  assert.equal(second.last_touch.click_id, "new-click");
});

test("a Google click ID replaces stored Meta source on an internal referrer", () => {
  const store = storage();
  visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-a",
  });
  const clicked = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/pricing/?gclid=google-click",
    referrer: "https://propellerpicks.com/",
  }).attribution;

  assert.equal(clicked.last_touch.source, "google");
  assert.equal(clicked.last_touch.medium, "cpc");
  assert.equal(clicked.last_touch.click_id, "google-click");
});

test("a Meta click ID replaces stored Google source on an internal referrer", () => {
  const store = storage();
  visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=google&utm_medium=cpc&utm_campaign=google-a",
  });
  const clicked = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/pricing/?fbclid=meta-click",
    referrer: "https://propellerpicks.com/",
  }).attribution;

  assert.equal(clicked.last_touch.source, "meta");
  assert.equal(clicked.last_touch.medium, "paid_social");
  assert.equal(clicked.last_touch.click_id, "meta-click");
});

test("a return from the first-party app does not become a self-referral", () => {
  const store = storage();
  const landed = visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=campaign-a",
  }).attribution;
  const returned = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/pricing/",
    referrer: "https://app.propellerpicks.com/signup/complete",
  }).attribution;

  assert.equal(returned.last_touch.source, "meta");
  assert.equal(returned.last_touch.campaign, "campaign-a");
  assert.equal(returned.last_touch.captured_at, landed.last_touch.captured_at);
});

test("a www first-party referral does not replace the stored campaign", () => {
  const store = storage();
  const landed = visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=campaign-a",
  }).attribution;
  const returned = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/pricing/",
    referrer: "https://www.propellerpicks.com/guides/",
  }).attribution;

  assert.equal(returned.last_touch.source, "meta");
  assert.equal(returned.last_touch.campaign, "campaign-a");
  assert.equal(returned.last_touch.captured_at, landed.last_touch.captured_at);
});

test("an external referral replaces last touch while first touch stays immutable", () => {
  const store = storage();
  const first = visit({ store, now: 1_700_000_000_000, href: "https://propellerpicks.com/" }).attribution;
  const referred = visit({
    store,
    now: 1_700_000_000_000 + day,
    href: "https://propellerpicks.com/pricing/",
    referrer: "https://www.reddit.com/r/sportsbook/",
  }).attribution;

  assert.equal(first.first_touch.source, "(direct)");
  assert.equal(referred.first_touch.source, "(direct)");
  assert.equal(referred.last_touch.source, "reddit");
  assert.equal(referred.last_touch.medium, "social");
});

test("a malformed referrer falls back to direct and preserves stored acquisition", () => {
  const store = storage();
  const landed = visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=campaign-a",
  }).attribution;
  const returned = visit({
    store,
    now: Date.UTC(2026, 9, 16),
    href: "https://propellerpicks.com/",
    referrer: "not a valid URL",
  }).attribution;

  assert.equal(returned.last_touch.source, "meta");
  assert.equal(returned.last_touch.captured_at, landed.last_touch.captured_at);
});

test("90-day expiry is anchored to the last real acquisition", () => {
  const started = Date.UTC(2026, 0, 1);
  const store = storage();
  visit({
    store,
    now: started,
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=winter",
  });
  visit({
    store,
    now: started + 89 * day,
    href: "https://propellerpicks.com/pricing/",
    referrer: "https://propellerpicks.com/",
  });
  const expired = visit({
    store,
    now: started + 91 * day,
    href: "https://propellerpicks.com/",
  }).attribution;

  assert.equal(expired.first_touch.source, "(direct)");
  assert.equal(expired.last_touch.source, "(direct)");
  assert.equal(Date.parse(expired.last_touch.captured_at), started + 91 * day);
});

test("decorated signup URLs preserve the server contract and strip stale attribution fields", () => {
  const store = storage();
  const result = visit({
    store,
    now: Date.UTC(2026, 9, 15),
    href: "https://propellerpicks.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=campaign-a&utm_content=visual-a&fbclid=click-a",
  });
  const decorated = new URL(result.decorate(
    "https://app.propellerpicks.com/signup?offer=free&pp_lt_campaign=stale&pp_lt_click_id=stale-click",
    result.attribution,
  ));

  assert.equal(decorated.searchParams.get("offer"), "free");
  assert.equal(decorated.searchParams.get("pp_ft_source"), "meta");
  assert.equal(decorated.searchParams.get("pp_lt_campaign"), "campaign-a");
  assert.equal(decorated.searchParams.get("pp_lt_click_id"), "click-a");
  assert.equal(decorated.searchParams.get("pp_lt_at"), result.attribution.last_touch.captured_at);
  assert.equal(decorated.searchParams.get("pp_lt_captured_at"), null);
  assert.ok(store.value(storageKey));
});
