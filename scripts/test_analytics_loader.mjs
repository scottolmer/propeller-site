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
  const gtagScripts = appended.filter((node) => /googletagmanager\.com\/gtag\/js/.test(node.src));
  assert.equal(gtagScripts.length, 1);
  assert.equal(gtagScripts[0].async, true);
  assert.match(gtagScripts[0].src, /gtag\/js\?id=GT-57326MMH/);
  // The Meta pixel loads on page load; the Google tag stays idle-deferred.
  const metaScripts = appended.filter((node) => /connect\.facebook\.net\/en_US\/fbevents\.js/.test(node.src));
  assert.equal(metaScripts.length, 1);
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
  const gtagScripts = appended.filter((node) => /googletagmanager\.com\/gtag\/js/.test(node.src));
  assert.equal(gtagScripts.length, 0);
  assert.equal(window.ppAnalyticsLoadStarted, true);
});

test("never loads the remote tag in an automated browser", () => {
  const appended = [];
  const listeners = new Map();
  const window = {
    navigator: { webdriver: true },
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  const document = {
    createElement: () => ({}),
    head: { appendChild: (node) => appended.push(node) },
  };
  vm.runInNewContext(source, { window, document });
  window.ppLoadAnalytics();
  listeners.get("pointerdown")();
  const gtagScripts = appended.filter((node) => /googletagmanager\.com\/gtag\/js/.test(node.src));
  assert.equal(gtagScripts.length, 0);
  // The Meta pixel is intentionally not suppressed for automated browsers.
  const metaScripts = appended.filter((node) => /connect\.facebook\.net\/en_US\/fbevents\.js/.test(node.src));
  assert.equal(metaScripts.length, 1);
  assert.equal(typeof window.gtag, "function");
  // Legacy pages load gtag.js themselves; the opt-out flags cover them.
  for (const id of ["GT-57326MMH", "G-NLXM4C2G7D", "G-2Z7JMN1JTL"]) {
    assert.equal(window[`ga-disable-${id}`], true, id);
  }
});

test("real browsers are not opted out", () => {
  const window = { navigator: { webdriver: false }, addEventListener: () => {} };
  const document = { createElement: () => ({}), head: { appendChild: () => {} } };
  vm.runInNewContext(source, { window, document });
  assert.equal(window["ga-disable-GT-57326MMH"], undefined);
  assert.equal(window["ga-disable-G-NLXM4C2G7D"], undefined);
});
