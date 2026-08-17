import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/analytics-loader.js", import.meta.url), "utf8");

test("exposes a synchronous, idempotent analytics loader for first-interaction events", () => {
  const listeners = new Map();
  const appended = [];
  const window = {
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  const document = {
    createElement: () => ({}),
    head: { appendChild: (node) => appended.push(node) },
  };
  vm.runInNewContext(source, { window, document });
  assert.equal(typeof window.ppLoadAnalytics, "function");
  window.ppLoadAnalytics();
  window.ppLoadAnalytics();
  assert.equal(appended.length, 1);
  assert.equal(appended[0].async, true);
  assert.match(appended[0].src, /gtag\/js\?id=G-NLXM4C2G7D/);
  assert.equal(typeof window.gtag, "function");
  assert.ok(listeners.has("pointerdown"));
});
