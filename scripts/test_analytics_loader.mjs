import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/analytics-loader.js", import.meta.url), "utf8");

test("configures the reporting stream once and exposes an idempotent loader", () => {
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

  const reportingConfigs = window.dataLayer.filter(([command, measurementId]) => (
    command === "config" && measurementId === "G-2Z7JMN1JTL"
  ));
  assert.equal(reportingConfigs.length, 1);
  assert.equal(reportingConfigs[0][2].cookie_domain, "auto");
  const linkerCommands = window.dataLayer.filter(([command, field]) => (
    command === "set" && field === "linker"
  ));
  assert.equal(linkerCommands.length, 1);
  assert.deepEqual(Array.from(linkerCommands[0][2].domains), [
    "propellerpicks.com",
    "app.propellerpicks.com",
  ]);

  // The inline legacy bootstrap and later custom events use the same queue,
  // so existing page tracking continues to reach both configured streams.
  window.gtag("config", "G-NLXM4C2G7D");
  window.gtag("event", "signup_click", { cta_surface: "hero" });
  assert.ok(window.dataLayer.some(([command, measurementId]) => (
    command === "config" && measurementId === "G-NLXM4C2G7D"
  )));
  assert.ok(window.dataLayer.some(([command, eventName]) => (
    command === "event" && eventName === "signup_click"
  )));

  assert.equal(typeof window.ppLoadAnalytics, "function");
  window.ppLoadAnalytics();
  window.ppLoadAnalytics();
  assert.equal(appended.length, 1);
  assert.equal(appended[0].async, true);
  assert.match(appended[0].src, /gtag\/js\?id=G-2Z7JMN1JTL/);
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
