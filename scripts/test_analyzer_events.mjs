import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(
  new URL("../assets/js/analyzer-events.js", import.meta.url),
  "utf8",
);
const analyzerHtml = readFileSync(
  new URL("../analyzer/index.html", import.meta.url),
  "utf8",
);

function load(options = {}) {
  const events = [];
  const stored = new Map(options.stored ? [["pp_analyzer_completed_v1", "1"]] : []);
  const window = {
    location: { pathname: "/analyzer/" },
    dataLayer: [],
    sessionStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
    gtag: options.withoutGtag
      ? undefined
      : (...args) => events.push(args),
  };
  vm.runInNewContext(source, { window, Number, String, Array, Math });
  return { api: window.ppAnalyzerEvents, dataLayer: window.dataLayer, events };
}

test("emits one analyzer_completed event for the first successful search", () => {
  const { api, events } = load();
  assert.equal(api.trackCompletion({ sport: "MLB", resultCount: 4, queryLength: 5 }), true);
  assert.equal(api.trackCompletion({ sport: "MLB", resultCount: 2, queryLength: 6 }), false);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [["event", "analyzer_completed", {
    transport_type: "beacon",
    sport: "mlb",
    result_count: 4,
    query_length: 5,
    page_path: "/analyzer/",
  }]]);
  assert.equal(JSON.stringify(events).includes("player"), false);
});

test("does not emit for empty queries or empty results", () => {
  const { api, events } = load();
  assert.equal(api.trackCompletion({ sport: "mlb", resultCount: 0, queryLength: 5 }), false);
  assert.equal(api.trackCompletion({ sport: "mlb", resultCount: 2, queryLength: 0 }), false);
  assert.equal(events.length, 0);
});

test("honors the browser-session guard", () => {
  const { api, events } = load({ stored: true });
  assert.equal(api.trackCompletion({ sport: "mlb", resultCount: 2, queryLength: 5 }), false);
  assert.equal(events.length, 0);
});

test("queues safely when gtag has not initialized", () => {
  const { api, dataLayer } = load({ withoutGtag: true });
  assert.equal(api.trackCompletion({ sport: "nba", resultCount: 3, queryLength: 4 }), true);
  assert.deepEqual(JSON.parse(JSON.stringify(dataLayer)), [["event", "analyzer_completed", {
    transport_type: "beacon",
    sport: "nba",
    result_count: 3,
    query_length: 4,
    page_path: "/analyzer/",
  }]]);
});

test("analyzer page wires completion tracking and cross-domain linking", () => {
  assert.match(analyzerHtml, /analyzer-events\.js\?v=20260715/);
  assert.match(analyzerHtml, /ppAnalyzerEvents\?\.trackCompletion/);
  assert.match(analyzerHtml, /domains:\s*\['propellerpicks\.com', 'app\.propellerpicks\.com'\]/);
});
