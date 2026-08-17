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

function load() {
  const listeners = new Map();
  const events = [];
  const window = {
    location: { href: "https://propellerpicks.com/" },
    gtag: (...args) => events.push(args),
  };
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

test("preserves destination-based fallback classification for untagged legacy links", () => {
  const { api } = load();
  const classified = api.classifyLink(anchor({ href: "https://apps.apple.com/app/id6760788202" }));
  assert.equal(classified.name, "app_store_click");
  assert.equal(classified.params.cta_id, "unlabeled");
  assert.equal(classified.params.cta_destination, "app_store");
});

test("homepage and high-intent pages load the canonical CTA tracker with stable CTA IDs", () => {
  const homepageIds = homepage.match(/data-cta-id="home-/g) ?? [];
  assert.equal(homepageIds.length, 11);
  assert.match(homepage, /data-analytics-event="analyzer_cta_click"/);
  assert.match(homepage, /analytics-events\.js\?v=20260817/);
  assert.match(analyzer, /analytics-events\.js\?v=20260817/);
  assert.match(analyzer, /data-cta-id="analyzer-full-analysis-signup"/);
  assert.match(prizePicks, /analytics-events\.js\?v=20260817/);
  assert.match(prizePicks, /data-cta-id="prizepicks-cheatsheet-signup"/);
  assert.match(prizePicks, /data-cta-id="prizepicks-analyzer-link"/);
});
