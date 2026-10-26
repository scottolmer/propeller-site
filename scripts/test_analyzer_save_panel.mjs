import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(
  new URL("../assets/js/analyzer-save-panel.js", import.meta.url),
  "utf8",
);
const pages = ["analyzer/index.html", "analyzer/nfl/index.html", "analyzer/nba/index.html"].map((rel) => ({
  rel,
  html: readFileSync(new URL(`../${rel}`, import.meta.url), "utf8"),
}));

function load(options = {}) {
  const events = [];
  const stored = new Map();
  const window = {
    location: { pathname: options.pathname || "/analyzer/" },
    dataLayer: [],
    sessionStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
    gtag: (...args) => events.push(args),
  };
  vm.runInNewContext(source, { window, Number, String, Array, Math });
  return { api: window.ppAnalyzerSavePanel, events };
}

test("names the single searched player and counts the locked lines", () => {
  const { api } = load();
  const html = api.html({
    sport: "nfl", sportLabel: "NFL", query: "dak", players: ["Dak Prescott"],
    shownCount: 5, lockedCount: 18, topScore: 61.4, surface: "analyzer",
  });
  assert.match(html, /18 more Dak Prescott lines are waiting in Propeller\./);
  assert.match(html, /<dd>23<\/dd>/);
  assert.match(html, /61<small>\/100<\/small>/);
  assert.match(html, /not a win probability/);
  assert.match(html, /data-analytics-event="signup_click"/);
  assert.match(html, /data-cta-surface="analyzer_save_panel"/);
  assert.match(html, /Public tools stay free\./);
});

test("falls back to the visitor's query and escapes it", () => {
  const { api } = load();
  const html = api.html({
    sport: "nba", query: "<b>j", players: ["A", "B"], shownCount: 5, lockedCount: 1, topScore: 58,
  });
  assert.match(html, /1 more matching line is waiting/);
  assert.match(html, /&ldquo;&lt;b&gt;j&rdquo;/);
  assert.doesNotMatch(html, /<b>j/);
});

test("drops the locked framing and score when nothing is locked or scored", () => {
  const { api } = load();
  const html = api.html({ sport: "nhl", players: ["Connor McDavid"], shownCount: 3, lockedCount: 0 });
  assert.match(html, /Keep Connor McDavid research in one place\./);
  assert.doesNotMatch(html, /Top confidence/);
});

test("reports one panel view per session", () => {
  const { api, events } = load({ pathname: "/analyzer/nfl/" });
  assert.equal(api.trackView({ sport: "NFL", lockedCount: 4, surface: "analyzer_nfl" }), true);
  assert.equal(api.trackView({ sport: "NFL", lockedCount: 2, surface: "analyzer_nfl" }), false);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [["event", "analyzer_save_panel_view", {
    transport_type: "beacon",
    sport: "nfl",
    locked_count: 4,
    cta_surface: "analyzer_nfl_save_panel",
    page_path: "/analyzer/nfl/",
  }]]);
});

test("every analyzer page loads the panel script and stylesheet", () => {
  for (const { rel, html } of pages) {
    assert.match(html, /\/assets\/js\/analyzer-save-panel\.js/, rel);
    assert.match(html, /\/assets\/css\/analyzer-save-panel\.css/, rel);
  }
});
