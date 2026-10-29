import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/calculator-leg-check.js", import.meta.url), "utf8");
const calculators = ["prizepicks", "underdog", "pick6"].map((name) => ({
  name,
  html: readFileSync(new URL(`../tools/${name}-payout-calculator/index.html`, import.meta.url), "utf8"),
}));

function harness() {
  const listeners = {};
  const events = [];
  const assigned = [];
  const values = { sport: "nfl", q: "" };
  const heading = { textContent: "" };
  const picks = { value: "4", addEventListener: () => {} };
  const form = {
    getAttribute: (name) => (name === "data-calculator" ? "prizepicks" : null),
    querySelector: (selector) => {
      if (selector === "[data-leg-check-heading]") return heading;
      if (selector === "select[name=sport]") return { get value() { return values.sport; } };
      if (selector === "input[name=q]") return { get value() { return values.q; } };
      return null;
    },
    addEventListener: (type, fn) => { listeners[type] = fn; },
  };
  const window = {
    dataLayer: [],
    gtag: (...args) => events.push(args),
    setTimeout: () => 1,
    clearTimeout: () => {},
    location: { assign: (url) => assigned.push(url) },
  };
  const document = {
    getElementById: (id) => (id === "numPicks" ? picks : null),
    querySelectorAll: () => [form],
  };
  vm.runInNewContext(source, { window, document, URLSearchParams, Array, Math, Number, String });
  function submit(sport, q) {
    values.sport = sport;
    values.q = q;
    listeners.submit({ preventDefault() {} });
    const params = events.at(-1)[2];
    params.event_callback();
  }
  return { api: window.ppCalculatorLegCheck, heading, events, assigned, submit };
}

test("heading names the entry size from the pick selector", () => {
  const { heading, api } = harness();
  assert.equal(heading.textContent, "Check the 4 players in this entry.");
  assert.equal(api.headingFor("1"), "Check the players in this entry.");
});

test("NFL and NBA go to their sport pages; other sports use the hub tab", () => {
  const { api } = harness();
  assert.equal(api.destination("nfl", "Saquon Barkley"), "/analyzer/nfl/?q=Saquon+Barkley");
  assert.equal(api.destination("nba", ""), "/analyzer/nba/");
  assert.equal(api.destination("nhl", "McDavid"), "/analyzer/?sport=nhl&q=McDavid");
});

test("submit reports the handoff without the player name, then navigates", () => {
  const { events, assigned, submit } = harness();
  submit("nba", "Jayson Tatum");
  const [kind, name, params] = events[0];
  assert.equal(kind, "event");
  assert.equal(name, "analyzer_cta_click");
  assert.equal(params.cta_id, "calculator-prizepicks-leg-check");
  assert.equal(params.has_player, "yes");
  assert.equal(params.pick_count, 4);
  assert.doesNotMatch(JSON.stringify(params), /Tatum/);
  assert.deepEqual(assigned, ["/analyzer/nba/?q=Jayson+Tatum"]);
});

test("every payout calculator renders the leg check inside its result", () => {
  for (const { name, html } of calculators) {
    assert.match(html, new RegExp(`<form class="pp-leg-check" data-calculator="${name}" action="/analyzer/" method="get"`), name);
    assert.match(html, /\/assets\/js\/calculator-leg-check\.js/, name);
    assert.match(html, /\/assets\/css\/calculator-leg-check\.css/, name);
    assert.ok(html.indexOf('class="pp-leg-check"') < html.indexOf('<aside class="trial-invite"'), name);
  }
});

test("the analyzer search is the first next step after each calculator result", () => {
  for (const { name, html } of calculators) {
    const results = html.slice(html.indexOf('id="results"'), html.indexOf('class="pp-leg-check"'));
    assert.doesNotMatch(results, /class="result-actions"/, name);
    assert.doesNotMatch(results, /class="result-link primary"/, name);
    assert.doesNotMatch(html, /Choose NFL, MLB, or NBA, then select a player/, name);
    assert.match(html, /class="pp-leg-check__alt"/, name);
  }
});

test("calculator readers who skip Calculate still get a tracked analyzer route", () => {
  for (const { name, html } of calculators) {
    const staticInvite = html.match(/<aside class="trial-invite trial-invite--static"[\s\S]*?<\/aside>/)[0];
    assert.match(staticInvite, new RegExp(`href="/analyzer/" data-cta-id="calculator-${name}-static-analyzer" data-cta-surface="calculator_static" data-cta-destination="analyzer"`), name);
    const chart = html.slice(html.indexOf('id="payout-chart"'));
    assert.match(chart, new RegExp(`class="pp-chart-next-step"[^\\n]*href="/analyzer/" data-cta-id="calculator-${name}-chart-analyzer"[^\\n]*>free player prop analyzer</a>`), name);
  }
});
