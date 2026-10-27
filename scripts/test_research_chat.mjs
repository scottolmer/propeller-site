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
    assert.equal(ou.locked.filter((b) => b.type === "chart").length, 0);
    return ou.free.filter((b) => b.type === "chart");
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

// ---- Task 2: renderer ----
const MCP_URL = "https://mcp.propellerpicks.com/mcp";
const lockedStrings = (convs) =>
  convs.flatMap((c) => c.locked.flatMap((b) => blockText(b).split(/\s{2,}|\n/))).filter((s) => s.length > 12);

test("render escapes text", () => {
  const lookup = full();
  lookup.player = { ...lookup.player, name: "<img onerror=alert(1)>" };
  const html = api.renderChat(api.buildConversations(lookup), { mode: "rules", compactTools: false });
  assert.ok(!html.includes("<img onerror"));
  assert.ok(html.includes("&lt;img onerror=alert(1)&gt;"));
});

test("locked blocks never reach the html in rules mode", () => {
  const convs = api.buildConversations(full());
  for (const chip of ["ou", "matchup", "more", "risk"]) {
    const html = api.renderChat(convs, { mode: "rules", compactTools: false, active: chip });
    const c = byChip(convs, chip);
    for (const b of c.locked) {
      for (const piece of Object.values(b).flat().map((v) => (typeof v === "string" ? v : ""))) {
        if (piece.length > 12) assert.ok(!html.includes(piece), `leaked: ${piece}`);
      }
      if (b.items) for (const it of b.items) assert.ok(!html.includes(it.text), `leaked: ${it.text}`);
    }
  }
  const html = api.renderChat(convs, { mode: "rules", compactTools: false, active: "ou" });
  assert.ok(html.includes("Get the full read in your own AI tool"));
  assert.ok(html.includes("Connect Propeller to ChatGPT, Claude or another tool that supports MCP. Included with full access, $15 a month."));
  assert.ok(html.includes("Copy the Propeller MCP address"));
  assert.ok(html.includes("Paste it into ChatGPT, Claude or another tool that supports MCP"));
  assert.ok(html.includes("Sign in to Propeller and approve access"));
  assert.ok(html.includes(MCP_URL));
  assert.ok(html.includes('data-cta-id="analyzer-research-mcp"'));
  assert.ok(html.includes('data-cta-id="analyzer-research-signup"'));
  assert.ok(html.includes("Built from Propeller&#39;s data") || html.includes("Built from Propeller's data"));
  assert.ok(html.includes("Research only, not a guarantee. Scores are model confidence on a 50 to 100 scale, not win probabilities."));
});

test("summary mode shows the free-account prompt", () => {
  const html = api.renderChat(api.buildConversations(summary()), { mode: "rules", compactTools: false });
  assert.ok(html.includes("See every signal for this player with a free account."));
});

test("showcase stamp verbatim and answers escaped", () => {
  const stamp = "Written by Claude using Propeller's MCP · Sun, Nov 1 · 11:02 AM ET";
  const convs = [{
    chip: "ou", label: "Over or under?", question: "Q <b>?",
    toolCalls: [{ name: "search_nfl_players" }], answer: "Leans under.\n\nSecond <i>para</i>."
  }];
  const html = api.renderChat(convs, { mode: "showcase", stamp, compactTools: false, surface: "home" });
  assert.ok(html.includes("Written by Claude using Propeller&#39;s MCP · Sun, Nov 1 · 11:02 AM ET") ||
    html.includes(stamp));
  assert.ok(!html.includes("<i>para"));
  assert.ok(html.includes("&lt;i&gt;para&lt;/i&gt;"));
  assert.ok(html.includes('data-cta-id="home-showcase-mcp"'));
});

test("compact tools", () => {
  const html = api.renderChat(api.buildConversations(full()), { mode: "rules", compactTools: true });
  assert.ok(html.includes("Checked 3 Propeller sources"));
  const wide = api.renderChat(api.buildConversations(full()), { mode: "rules", compactTools: false });
  assert.ok(!wide.includes("Checked 3 Propeller sources"));
  assert.ok(wide.includes("search_nfl_players"));
});

test("chips are buttons with aria-pressed", () => {
  const html = api.renderChat(api.buildConversations(full()), { mode: "rules", compactTools: false, active: "matchup" });
  const chips = html.match(/<button[^>]*data-chip="[a-z]+"[^>]*>/g) || [];
  assert.equal(chips.length, 4);
  assert.equal(chips.filter((c) => c.includes('aria-pressed="true"')).length, 1);
  assert.ok(chips.find((c) => c.includes('data-chip="matchup"')).includes('aria-pressed="true"'));
});

test("table markup marks last column for phone", () => {
  const html = api.renderChat(api.buildConversations(full()), { mode: "rules", compactTools: false, active: "more" });
  assert.ok(html.includes("<table"));
  assert.ok(html.includes("pp-rc-hide-ph"));
});

test("mountResearchChat renders, wires chips, destroys", () => {
  const listeners = {};
  const container = {
    innerHTML: "",
    addEventListener(t, fn) { listeners[t] = fn; },
    removeEventListener(t) { delete listeners[t]; },
    querySelectorAll() { return []; }
  };
  const handle = api.mountResearchChat(container, { lookup: full(), surface: "analyzer" });
  assert.ok(container.innerHTML.includes("data-chip=\"ou\""));
  listeners.click({ target: { closest: () => ({ getAttribute: () => "risk" }) } });
  assert.ok(/data-chip="risk"[^>]*aria-pressed="true"/.test(container.innerHTML));
  handle.destroy();
  assert.equal(listeners.click, undefined);
});

test("mount showcase drops questions failing the guard", () => {
  const container = { innerHTML: "", addEventListener() {}, removeEventListener() {}, querySelectorAll() { return []; } };
  const transcript = {
    generated_at: "2026-11-01T16:02:00Z",
    payload: { player: "A", prop: "B", questions: [
      { chip: "ou", question: "q1", tool_calls: [{ name: "t" }], answer: "This is a lock." },
      { chip: "risk", question: "q2", tool_calls: [{ name: "t" }], answer: "Fine answer." }
    ] }
  };
  api.mountResearchChat(container, { transcript, surface: "home" });
  assert.ok(!container.innerHTML.includes("This is a lock"));
  assert.ok(container.innerHTML.includes("Fine answer."));
  assert.ok(container.innerHTML.includes("Written by Claude using Propeller&#39;s MCP · Sun, Nov 1 · 11:02 AM ET") ||
    container.innerHTML.includes("Written by Claude using Propeller's MCP · Sun, Nov 1 · 11:02 AM ET"));
});

test("CTA hrefs match the plan", () => {
  const href = (html, id) => {
    const m = html.match(new RegExp('<a[^>]*href="([^"]*)"[^>]*data-cta-id="' + id + '"'));
    assert.ok(m, id);
    return m[1];
  };
  const rules = api.renderChat(api.buildConversations(full()), { mode: "rules", compactTools: false });
  assert.equal(href(rules, "analyzer-research-mcp"), "/pricing/#ai-connections");
  const convs = [{ chip: "ou", label: "x", question: "q", toolCalls: [], answer: "a" }];
  const show = api.renderChat(convs, { mode: "showcase", compactTools: false, surface: "home" });
  assert.equal(href(show, "home-showcase-mcp"), "/pricing/#ai-connections");
  assert.equal(href(show, "home-showcase-analyzer"), "/analyzer/?sport=nfl");
});
