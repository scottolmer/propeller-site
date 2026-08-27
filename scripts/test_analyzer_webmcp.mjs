import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(
  new URL("../assets/js/analyzer-webmcp.js", import.meta.url),
  "utf8",
);
const analyzerHtml = readFileSync(
  new URL("../analyzer/index.html", import.meta.url),
  "utf8",
);

async function load({ supported = true, payload, failRegistrationAt = -1, fetchError = false } = {}) {
  const registrations = [];
  const calls = [];
  const listeners = new Map();
  const window = {
    document: supported
      ? {
        modelContext: {
          registerTool: async (tool, options) => {
            const index = registrations.length;
            registrations.push({ tool, options });
            if (index === failRegistrationAt) throw new Error("registration failed");
          },
        },
      }
      : {},
    URLSearchParams,
    Intl,
    Date,
    Object,
    Number,
    String,
    Array,
    Math,
    RegExp,
    Error,
    TypeError,
    AbortSignal,
    AbortController,
    setTimeout,
    clearTimeout,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name, handler) => {
      if (listeners.get(name) === handler) listeners.delete(name);
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (fetchError) throw new Error(`sensitive upstream detail for ${url}`);
      return { ok: true, json: async () => payload ?? {
        total: 1,
        generated_at: "2026-08-27T17:04:55Z",
        props: [{
          player_name: "Example Player",
          team: "EX",
          stat_type: "points",
          line: 20.5,
          final_direction: "OVER",
          confidence: 63.4,
          confidence_tier: "moderate",
          private_field: "must not escape",
        }],
      } };
    },
  };
  vm.runInNewContext(source, { window, globalThis: window, ...window });
  await window.ppAnalyzerWebMcpReady;
  return { window, registered: registrations.map(entry => entry.tool), registrations, calls, listeners };
}

test("registers only the three read-only public analyzer tools when supported", async () => {
  const { window, registered, registrations, listeners } = await load();
  assert.equal(window.ppAnalyzerWebMcp.status, "registered");
  assert.deepEqual(registered.map(tool => tool.name), [
    "search-public-props",
    "get-public-prop-context",
    "get-methodology-and-limits",
  ]);
  assert.ok(registered.every(tool => /research only|research context|public confidence/i.test(tool.description)));
  assert.ok(registered.every(tool => !Object.hasOwn(tool, "exposedTo")));
  assert.deepEqual(JSON.parse(JSON.stringify(registered.map(tool => tool.annotations))), [
    { readOnlyHint: true, untrustedContentHint: true },
    { readOnlyHint: true, untrustedContentHint: true },
    { readOnlyHint: true, untrustedContentHint: false },
  ]);
  assert.ok(registered.every((_, index) => registrations[index].options.signal));
  assert.equal(registered[0].inputSchema.properties.player.maxLength, 80);
  listeners.get("pagehide")();
  assert.equal(registrations[0].options.signal.aborted, true);
});

test("does not register anything when the browser lacks WebMCP", async () => {
  const { window, registered } = await load({ supported: false });
  assert.equal(window.ppAnalyzerWebMcp.status, "unsupported");
  assert.deepEqual(registered, []);
});

test("search returns only the public allowlisted fields and filters safely", async () => {
  const { registered, calls } = await load();
  const result = await registered[0].execute({ sport: "nba", player: "example", direction: "OVER" });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /^https:\/\/web-production-3c1c4\.up\.railway\.app\/api\/social\/picks\/nba\?/);
  assert.deepEqual(JSON.parse(JSON.stringify(result.props)), [{
    player: "Example Player",
    team: "EX",
    statType: "points",
    line: 20.5,
    direction: "OVER",
    confidence: 63,
    confidenceTier: "moderate",
  }]);
  assert.equal("private_field" in result.props[0], false);
  assert.equal(result.researchOnly, true);
});

test("exact context uses the public feed and methodology exposes evidence links", async () => {
  const { registered } = await load();
  const context = await registered[1].execute({ sport: "nba", player: "Example Player", statType: "points", line: 20.5 });
  assert.equal(context.found, true);
  assert.equal(context.matches[0].confidence, 63);
  assert.equal(context.freshness.known, false);
  assert.equal(context.freshness.responseGeneratedAt, "2026-08-27T17:04:55Z");
  const methodology = registered[2].execute({});
  assert.equal(methodology.confidence.meaning, "Directional model confidence from available signals.");
  assert.match(methodology.evidenceLinks.methodology, /how-ai-sports-betting-works/);
  assert.match(methodology.boundary, /does not accept wagers/);
});

test("labels response timestamps separately from unknown line freshness", async () => {
  const { registered } = await load();
  const result = await registered[0].execute({ sport: "nba", date: "2026-08-26" });
  assert.equal(result.freshness.known, false);
  assert.equal(result.freshness.status, "unknown-for-requested-date");
  assert.equal(result.freshness.responseGeneratedAt, "2026-08-27T17:04:55Z");
  assert.match(result.freshness.note, /must not be treated as line freshness/);
});

test("rejects invalid input before making a public request", async () => {
  const { registered, calls } = await load();
  await assert.rejects(
    registered[0].execute({ sport: "nba", player: "x".repeat(81) }),
    /80 characters or fewer/,
  );
  await assert.rejects(
    registered[0].execute({ sport: "tennis" }),
    /sport must be one of/,
  );
  assert.equal(calls.length, 0);
});

test("returns a generic public-feed error without leaking upstream details", async () => {
  const { registered } = await load({ fetchError: true });
  await assert.rejects(
    registered[0].execute({ sport: "nba" }),
    error => error.message === "Propeller public preview is unavailable right now.",
  );
});

test("propagates cancellation and rolls back partial registration", async () => {
  const partial = await load({ failRegistrationAt: 1 });
  assert.equal(partial.window.ppAnalyzerWebMcp.status, "registration-failed");
  assert.equal(partial.registrations.length, 2);
  assert.equal(partial.registrations[0].options.signal.aborted, true);

  const cancelled = await load();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    cancelled.registered[0].execute({ sport: "nba" }, { signal: controller.signal }),
    /unavailable right now/,
  );
  assert.equal(cancelled.calls.length, 0);
});

test("analyzer page loads WebMCP as a deferred, cache-busted script", () => {
  assert.match(analyzerHtml, /analyzer-webmcp\.js\?v=20260827/);
  assert.match(analyzerHtml, /<script src="\/assets\/js\/analyzer-webmcp\.js\?v=20260827" defer><\/script>/);
});
