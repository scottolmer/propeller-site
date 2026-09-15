import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/analytics-loader.js", import.meta.url), "utf8");

test("configures the shared Google tag once and exposes an idempotent loader", () => {
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
  vm.runInNewContext(source, { window, document });

  const tagConfigs = window.dataLayer.filter(([command, tagId]) => (
    command === "config" && tagId === "GT-57326MMH"
  ));
  assert.equal(tagConfigs.length, 1);
  assert.equal(tagConfigs[0][2].cookie_domain, "auto");
  assert.equal(window.dataLayer.filter(([command]) => command === "config").length, 1);
  const linkerCommands = window.dataLayer.filter(([command, field]) => (
    command === "set" && field === "linker"
  ));
  assert.equal(linkerCommands.length, 1);
  assert.deepEqual(Array.from(linkerCommands[0][2].domains), [
    "propellerpicks.com",
    "app.propellerpicks.com",
  ]);

  // Custom events share the same queue and reach the tag's linked destinations.
  window.gtag("event", "signup_click", { cta_surface: "hero" });
  assert.ok(window.dataLayer.some(([command, eventName]) => (
    command === "event" && eventName === "signup_click"
  )));

  assert.equal(typeof window.ppLoadAnalytics, "function");
  window.ppLoadAnalytics();
  window.ppLoadAnalytics();
  assert.equal(appended.length, 1);
  assert.equal(appended[0].async, true);
  assert.match(appended[0].src, /gtag\/js\?id=GT-57326MMH/);
  assert.equal(typeof window.gtag, "function");
  assert.ok(listeners.has("pointerdown"));
});

test("does not insert a second remote script when a preserved legacy source exists", () => {
  const appended = [];
  const window = { addEventListener: () => {} };
  const document = {
    createElement: () => ({}),
    head: { appendChild: (node) => appended.push(node) },
    querySelector: () => ({ src: "https://www.googletagmanager.com/gtag/js?id=G-NLXM4C2G7D" }),
  };
  vm.runInNewContext(source, { window, document });
  window.ppLoadAnalytics();
  assert.equal(appended.length, 0);
  assert.equal(window.ppAnalyticsLoadStarted, true);
});
