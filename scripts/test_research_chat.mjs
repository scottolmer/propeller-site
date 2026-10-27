import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/research-chat.js", import.meta.url), "utf8");
const fixture = (name) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const full = () => fixture("research-nfl-full.json");
const summary = () => fixture("research-nfl-summary.json");

function load() {
  const window = {};
  vm.runInNewContext(source, { window, Number, String, Array, Math, Object, JSON, RegExp, Error });
  return window.ppResearchChat;
}

const api = load();
const byChip = (convs, chip) => convs.find((c) => c.chip === chip);
const blockText = (block) => {
  const out = [];
  (function walk(v) {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  })(block);
  return out.join(" ");
};
const allText = (blocks) => blocks.map(blockText).join(" ");
const hasKey = (v, key) =>
  !!v && typeof v === "object" &&
  (Object.prototype.hasOwnProperty.call(v, key) || Object.values(v).some((x) => hasKey(x, key)));

test("ou answer names agreeing and opposing signals", () => {
  const ou = byChip(api.buildConversations(full()), "ou");
  const lean = ou.free.find((b) => b.type === "lean");
  assert.equal(lean.direction, "UNDER");
  assert.equal(lean.line, 264.5);
  assert.equal(lean.confidence, 63);
  assert.match(allText(ou.free), /3 of 6 signals point under/);
  assert.match(allText(ou.locked), /advanced stats/i);
  assert.match(allText(ou.locked), /over/);
});

test("summary fixture exposes counts only", () => {
  const convs = api.buildConversations(summary());
  assert.equal(convs.length, 4);
  for (const c of convs) {
    for (const call of c.toolCalls) assert.equal(hasKey(call.output, "signals"), false);
    assert.match(allText(c.free), /3 of 6 signals point under/);
    assert.ok(blockText(c.free).includes("See every signal for this player with a free account."));
  }
});

test("tool calls use real MCP names", () => {
  const ou = byChip(api.buildConversations(full()), "ou");
  assert.equal(ou.toolCalls.map((t) => t.name).join(","),
    "search_nfl_players,get_top_nfl_props,get_nfl_player_context");
});

test("more answer is a table", () => {
  const more = byChip(api.buildConversations(full()), "more");
  assert.equal(more.free[0].type, "table");
  assert.equal(more.free[0].rows.length, 2);
  assert.match(blockText(more.free[0].rows[0]), /Jacoby Brissett/);
  assert.match(blockText(more.free[0].rows[1]), /Tua Tagovailoa/);
});

test("risk answer uses opposing signals only", () => {
  const risk = byChip(api.buildConversations(full()), "risk");
  const text = allText([...risk.free, ...risk.locked]);
  for (const name of ["advanced stats", "expected volume", "recent trends"]) assert.match(text, new RegExp(name));
  for (const name of ["defense-adjusted efficiency", "matchup", "injury context"]) assert.doesNotMatch(text, new RegExp(name, "i"));
});

test("chart only with current-season logs", () => {
  const chartIn = (lookup) => {
    const ou = byChip(api.buildConversations(lookup), "ou");
    return [...ou.free, ...ou.locked].filter((b) => b.type === "chart");
  };
  const charts = chartIn(full());
  assert.equal(charts.length, 1);
  assert.equal(charts[0].points.length, 5);
  const stale = full();
  stale.game_logs.forEach((g) => { g.season = 2025; });
  assert.equal(chartIn(stale).length, 0);
  const none = full();
  none.game_logs = [];
  assert.equal(chartIn(none).length, 0);
});

test("unknown signal label is readable", () => {
  assert.equal(api.signalLabel("RedZoneShare"), "red zone share");
  assert.equal(api.signalLabel("DVOA"), "defense-adjusted efficiency");
  assert.equal(api.signalLabel("EnhancedTrends"), "recent trends");
  assert.equal(api.signalLabel(""), "signal");
});

test("second prop switches answers", () => {
  const convs = api.buildConversations(full(), 1);
  const lean = byChip(convs, "ou").free.find((b) => b.type === "lean");
  assert.equal(lean.direction, "OVER");
  assert.equal(lean.line, 1.5);
  assert.match(allText(byChip(convs, "ou").free), /4 of 6 signals point over/);
});

test("non-ok lookups produce no conversations", () => {
  const lookup = full();
  lookup.status = "no_current_prop";
  assert.equal(api.buildConversations(lookup).length, 0);
});

test("guard rejects banned phrases", () => {
  assert.throws(() => api.guardCopy("an easy over"), /banned phrase: easy over/);
  for (const bad of ["a lock", "guaranteed", "Free Money", "it's a sure thing", "win probability", "because of"]) {
    assert.throws(() => api.guardCopy(bad), /banned phrase/);
  }
  assert.equal(api.guardCopy("three signals point under"), "three signals point under");
  assert.equal(api.guardCopy("locked and blocked"), "locked and blocked");
});

test("every template passes the guard", () => {
  for (const lookup of [full(), summary()]) {
    for (const idx of [0, 1]) {
      for (const c of api.buildConversations(lookup, idx)) {
        const texts = [c.label, c.question, ...c.toolCalls.map((t) => t.summary),
          blockText(c.free), blockText(c.locked)];
        for (const t of texts) assert.equal(api.guardCopy(t), t);
      }
    }
  }
});
