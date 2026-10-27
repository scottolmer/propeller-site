import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/analyzer-research.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../analyzer/index.html", import.meta.url), "utf8");

function load() {
  const window = {};
  vm.runInNewContext(source, { window, Number, String, Array, Math, Intl, Date, Promise, AbortController, setTimeout, clearTimeout });
  return window.ppAnalyzerResearch;
}

const brissett = (extra = {}) => ({ player_name: "Jacoby Brissett", stat_type: "pass_yds", line: 259.5, ...extra });

function harness(fetchImpl) {
  const api = load();
  const log = { hide: 0, mounted: [], messages: [] };
  const ctl = api.createController({
    fetch: fetchImpl,
    delay: 0,
    ui: {
      hide: () => { log.hide += 1; },
      mount: (lookup) => log.mounted.push(lookup),
      message: (text) => log.messages.push(text),
    },
  });
  return { api, ctl, log };
}

const tick = () => new Promise((r) => setTimeout(r, 10));

test("fetch gate: nfl, query >= 3 chars, at most one matched player", async () => {
  const urls = [];
  const { ctl } = harness(async (url) => { urls.push(url); return { ok: true, json: async () => ({ status: "ok", player: { name: "x" }, props: [] }) }; });
  ctl.update({ sport: "nba", picks: [brissett()], query: "brissett" });
  ctl.update({ sport: "nfl", picks: [brissett(), { player_name: "Josh Allen" }], query: "jo" + "sh" });
  ctl.update({ sport: "nfl", picks: [], query: "ja" });
  ctl.update({ sport: "nfl", picks: [], query: "" });
  await tick();
  assert.equal(urls.length, 0);
  ctl.update({ sport: "nfl", picks: [], query: " Jacoby Brissett " });
  await tick();
  assert.equal(urls.length, 1);
  assert.match(urls[0], /player=Jacoby%20Brissett$/);
  ctl.update({ sport: "nfl", picks: [brissett(), brissett({ stat_type: "pass_tds" })], query: "briss" });
  await tick();
  assert.match(urls[1], /player=Jacoby%20Brissett$/);
});

test("stale response is dropped", async () => {
  const resolvers = {};
  const { ctl, log } = harness((url) => new Promise((res) => {
    resolvers[decodeURIComponent(url.split("player=")[1])] = res;
  }));
  ctl.update({ sport: "nfl", picks: [brissett()], query: "Brissett" });
  await tick();
  ctl.update({ sport: "nfl", picks: [{ player_name: "Josh Allen", stat_type: "pass_yds", line: 250 }], query: "Allen" });
  await tick();
  const body = (name) => ({ ok: true, json: async () => ({ status: "ok", player: { name }, props: [] }) });
  resolvers["Josh Allen"](body("Josh Allen"));
  await tick();
  resolvers["Jacoby Brissett"](body("Jacoby Brissett"));
  await tick();
  assert.equal(log.mounted.length, 1);
  assert.equal(log.mounted[0].player.name, "Josh Allen");
});

test("backend failure keeps the card", async () => {
  for (const impl of [
    async () => { throw new Error("net"); },
    async () => ({ ok: true, json: async () => ({ status: "unavailable" }) }),
    async () => ({ ok: false, status: 503, json: async () => ({}) }),
    async () => ({ ok: true, json: async () => ({ status: "not_found" }) }),
    async () => ({ ok: true, json: async () => ({ status: "ambiguous" }) }),
  ]) {
    const { ctl, log } = harness(impl);
    ctl.update({ sport: "nfl", picks: [brissett()], query: "brissett" });
    await tick();
    assert.equal(log.mounted.length, 0);
    assert.equal(log.messages.length, 0);
    assert.ok(log.hide >= 1);
  }
});

test("line moved", () => {
  const api = load();
  const lookup = { stat_type: "pass_yds", line: 264.5 };
  assert.equal(api.lineMovedNotice("Jacoby Brissett", lookup, [brissett()]), "The public preview line is now 259.5 (was 264.5).");
  assert.equal(api.lineMovedNotice("Jacoby Brissett", lookup, [brissett({ line: 264.5 })]), null);
  assert.equal(api.lineMovedNotice("Jacoby Brissett", lookup, [brissett({ stat_type: "pass_tds" })]), null);
});

test("line moved notice matches the looked-up player, not another player's same stat", () => {
  const api = load();
  const lookup = { stat_type: "pass_yds", line: 264.5 };
  const other = { player_name: "Kyler Murray", stat_type: "pass_yds", line: 231.5 };
  assert.equal(api.lineMovedNotice("Jacoby Brissett", lookup, [other]), null);
  assert.equal(api.lineMovedNotice("Jacoby Brissett", lookup, [other, brissett({ line: 264.5 })]), null);
  assert.equal(api.lineMovedNotice("  jacoby  BRISSETT ", lookup, [other, brissett()]), "The public preview line is now 259.5 (was 264.5).");
  assert.equal(api.lineMovedNotice("", lookup, [brissett()]), null);
});

test("analyzer passes the lookup player name to the line moved check", () => {
  assert.match(html, /lineMovedNotice\(\s*lookup\.player && lookup\.player\.name,/);
});

test("no current prop shows next slate", async () => {
  const { ctl, log, api } = harness(async () => ({ ok: true, json: async () => ({ status: "no_current_prop", next_event_start: "2026-10-29T23:15:00Z" }) }));
  ctl.update({ sport: "nfl", picks: [brissett()], query: "brissett" });
  await tick();
  assert.equal(log.messages[0], "No current line for this player. The next NFL slate starts Thu, Oct 29 · 7:15 PM ET.");
  assert.equal(api.noCurrentPropMessage(null), "No current line for this player.");
});

test("analyzer page wires research assets and mount point", () => {
  assert.match(html, /analyzer-research\.js\?v=20261027/);
  assert.match(html, /research-chat\.js\?v=20261027/);
  assert.match(html, /research-chat\.css\?v=20261027/);
  assert.ok(html.indexOf('id="researchChat"') < html.indexOf('id="picksGrid"'));
  assert.match(html, /<section id="researchChat" hidden>/);
});

test("fixture hook is ignored on production hosts and honored on localhost", async () => {
  for (const [hostname, expectFixture] of [["propellerpicks.com", false], ["www.propellerpicks.com", false], ["localhost", true], ["127.0.0.1", true], ["[::1]", true]]) {
    const api = load();
    const urls = [];
    const ctl = api.createController({
      location: { hostname, search: "?researchFixture=full" },
      fetch: async (u) => { urls.push(u); return { ok: true, json: async () => ({ status: "ok", player: { name: "x" }, props: [] }) }; },
      delay: 0,
      ui: { hide() {}, mount() {}, message() {} },
    });
    ctl.update({ sport: "nfl", picks: [brissett()], query: "brissett", immediate: true });
    await tick();
    assert.equal(urls.length, 1);
    assert.equal(urls[0].includes("/scripts/fixtures/research-nfl-full.json"), expectFixture, hostname);
    if (!expectFixture) assert.ok(urls[0].startsWith(api.RESEARCH_API), hostname);
  }
});

test("fixture down simulates a backend failure on localhost only", async () => {
  const api = load();
  assert.equal(api.fixtureMode({ hostname: "localhost", search: "?researchFixture=down" }), "down");
  assert.equal(api.fixtureMode({ hostname: "propellerpicks.com", search: "?researchFixture=down" }), null);
  assert.equal(api.fixtureMode({ hostname: "localhost", search: "?researchFixture=bogus" }), null);
  let calls = 0;
  const log = { hide: 0, mounted: 0 };
  const ctl = api.createController({
    location: { hostname: "localhost", search: "?researchFixture=down" },
    fetch: async () => { calls += 1; return { ok: true, json: async () => ({}) }; },
    delay: 0,
    ui: { hide() { log.hide += 1; }, mount() { log.mounted += 1; }, message() {} },
  });
  ctl.update({ sport: "nfl", picks: [brissett()], query: "brissett", immediate: true });
  await tick();
  assert.equal(calls, 0);
  assert.equal(log.mounted, 0);
});
