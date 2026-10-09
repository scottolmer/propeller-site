import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/research-handoff.js", import.meta.url), "utf8");

function load(search, lazy = false) {
  const events = [], navigations = [], timers = [];
  const links = ["", "?sport=nfl", "?sport=mlb", "?sport=nba", ""].map(query => {
    const attrs = new Map();
    return {
      href: "https://app.propellerpicks.com/research/my-pick" + query,
      setAttribute: (key, value) => attrs.set(key, value),
      getAttribute: key => attrs.get(key) ?? null,
      addEventListener: (name, handler) => attrs.set(name, handler),
      click: options => attrs.get("click")({button: 0, preventDefault() { this.prevented = true; }, ...options}),
      attrs,
    };
  });
  const window = {
    location: {search, origin: "https://propellerpicks.com", assign: value => navigations.push(value)},
    dataLayer: [],
    ppLoadAnalytics() {},
    setTimeout: fn => { timers.push(fn); return timers.length - 1; },
    clearTimeout() {},
  };
  if (!lazy) window.gtag = (...args) => events.push(args);
  vm.runInNewContext(source, {window, document: {querySelectorAll: () => links}, URL, URLSearchParams});
  return {links, events, navigations, timers, window};
}

test("both calculator sources survive every landing handoff without changing sport", () => {
  for (const source of ["prizepicks_calculator", "underdog_calculator"]) {
    const {links, events, navigations, timers} = load(`?research_source=${source}&player=private&line=9`);
    for (const link of links) assert.equal(new URL(link.href).searchParams.get("research_source"), source);
    assert.equal(new URL(links[1].href).searchParams.get("sport"), "nfl");
    links[1].click({});
    assert.equal(events.length, 1);
    assert.equal(events[0][1], "research_cta_click");
    assert.equal(events[0][2].research_source, source);
    assert.equal(events[0][2].sport, "nfl");
    assert.equal(events[0][2].page_location, "https://propellerpicks.com/tools/research-my-pick/");
    assert.doesNotMatch(JSON.stringify(events), /private|line|player/);
    events[0][2].event_callback(); timers[0]();
    assert.deepEqual(navigations, [links[1].href]);
  }
});

test("unknown sources and arbitrary acquisition data never get forwarded", () => {
  const {links, events} = load("?research_source=private-player&utm_source=private&guest_token=secret");
  assert.ok(links.every(link => !link.href.includes("research_source")));
  links[0].click({ctrlKey: true});
  assert.equal(events[0][2].research_source, "direct");
  assert.doesNotMatch(JSON.stringify(events), /private|secret|guest_token/);
});

test("lazy analytics queues the event while modified clicks preserve browser behavior", () => {
  const {links, timers, navigations, window} = load("?research_source=underdog_calculator", true);
  links[0].click({ctrlKey: true});
  assert.equal(window.dataLayer.length, 1);
  assert.equal(window.dataLayer[0][1], "research_cta_click");
  assert.equal(timers.length, 0);
  assert.equal(navigations.length, 0);
});
