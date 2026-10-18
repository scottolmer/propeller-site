import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/analytics-events.js", import.meta.url), "utf8");
const homepage = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const analyzer = readFileSync(new URL("../analyzer/index.html", import.meta.url), "utf8");
const prizePicks = readFileSync(new URL("../picks/prizepicks/index.html", import.meta.url), "utf8");

function anchor(attributes, text = "CTA", section = "main") {
  return {
    textContent: text,
    getAttribute(name) {
      return attributes[name] ?? null;
    },
    closest(selector) {
      if (selector === "a[href]") return this;
      return { tagName: section.toUpperCase() };
    },
  };
}

function load(attribution = null, href = "https://propellerpicks.com/") {
  const listeners = new Map();
  const events = [];
  const window = {
    location: { href },
    gtag: (...args) => events.push(args),
  };
  if (attribution) {
    window.ppSignupAttribution = { capture: () => attribution };
  }
  const document = {
    title: "Propeller Picks",
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
  };
  vm.runInNewContext(source, { window, document, URL, Object, String });
  return { events, click: listeners.get("click"), api: window.ppAnalyticsEvents };
}

test("emits exactly one explicitly classified homepage CTA event with stable metadata", () => {
  const { events, click } = load();
  const link = anchor({
    href: "https://app.propellerpicks.com/signup",
    "data-analytics-event": "signup_click",
    "data-cta-id": "home-hero-web-signup",
    "data-cta-surface": "homepage_hero",
    "data-cta-destination": "signup",
  }, "Use it on the web");

  click({ target: link });

  assert.deepEqual(JSON.parse(JSON.stringify(events)), [["event", "signup_click", {
    transport_type: "beacon",
    page_location: "https://propellerpicks.com/",
    page_title: "Propeller Picks",
    link_url: "https://app.propellerpicks.com/signup",
    link_text: "Use it on the web",
    link_location: "main",
    cta_id: "home-hero-web-signup",
    cta_surface: "homepage_hero",
    cta_destination: "signup",
  }]]);
});

test("adds sanitized acquisition fields to signup and store clicks", () => {
  const attribution = {
    first_touch: { source: "meta", medium: "paid_social", campaign: "campaign-a", content: "visual-a", click_id: "private-click" },
    last_touch: { source: "meta", medium: "paid_social", campaign: "campaign-b", content: "visual-b", click_id: "private-click" },
  };
  const { events, click } = load(
    attribution,
    "https://propellerpicks.com/?utm_source=meta&utm_campaign=campaign-b&fbclid=private-click",
  );
  const link = anchor({
    href: "https://app.propellerpicks.com/signup?pp_ft_source=meta&pp_lt_campaign=campaign-b&pp_lt_click_id=private-click",
    "data-analytics-event": "signup_click",
  });

  click({ target: link });
  const params = events[0][2];
  assert.equal(params.first_touch_source, "meta");
  assert.equal(params.first_touch_medium, "paid_social");
  assert.equal(params.first_touch_campaign, "campaign-a");
  assert.equal(params.first_touch_content, "visual-a");
  assert.equal(params.last_touch_campaign, "campaign-b");
  assert.equal(params.last_touch_content, "visual-b");
  assert.equal(params.page_location, "https://propellerpicks.com/?utm_source=meta&utm_campaign=campaign-b");
  assert.equal(params.link_url, "https://app.propellerpicks.com/signup");
  assert.doesNotMatch(JSON.stringify(params), /private-click|click_id|pp_ft|pp_lt|fbclid/);

  const storeLink = anchor({
    href: "https://apps.apple.com/app/id6760788202",
    "data-analytics-event": "app_store_click",
  });
  click({ target: storeLink });
  assert.equal(events[1][2].last_touch_campaign, "campaign-b");
  assert.equal(events[1][2].last_touch_content, "visual-b");
  assert.doesNotMatch(JSON.stringify(events[1][2]), /private-click|click_id|pp_ft|pp_lt|fbclid/);
});

test("preserves destination-based fallback classification for untagged legacy links", () => {
  const { api } = load();
  const classified = api.classifyLink(anchor({ href: "https://apps.apple.com/app/id6760788202" }));
  assert.equal(classified.name, "app_store_click");
  assert.equal(classified.params.cta_id, "unlabeled");
  assert.equal(classified.params.cta_destination, "app_store");
});

test("homepage and high-intent pages load the canonical CTA tracker with stable CTA IDs", () => {
  const homepageIds = homepage.match(/data-cta-id="home-/g) ?? [];
  assert.equal(homepageIds.length, 10);
  assert.match(homepage, /data-cta-id="site-nav-pricing"/);
  assert.match(homepage, /data-analytics-event="analyzer_cta_click"/);
  assert.match(homepage, /analytics-events\.js\?v=20260817/);
  assert.match(analyzer, /analytics-events\.js\?v=20260817/);
  assert.match(analyzer, /data-cta-id="analyzer-full-analysis-signup"/);
  assert.match(prizePicks, /analytics-events\.js\?v=20260817/);
  assert.match(prizePicks, /data-cta-id="prizepicks-cheatsheet-signup"/);
  assert.match(prizePicks, /data-cta-id="prizepicks-analyzer-link"/);
});
