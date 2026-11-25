import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/analytics-loader.js", import.meta.url), "utf8");
const PIXEL_ID = "1778482833277254";
const META_SCRIPT = /connect\.facebook\.net\/en_US\/fbevents\.js/;

function createPage() {
  const appended = [];
  const listeners = new Map();
  const window = {
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  const document = {
    createElement: (tagName) => ({ tagName }),
    head: { appendChild: (node) => appended.push(node) },
  };
  return { window, document, appended, listeners };
}

function run(source, page) {
  vm.runInNewContext(source, { window: page.window, document: page.document });
}

function fbqCommands(window) {
  return Array.from(window.fbq.queue || [], (command) => Array.from(command));
}

function metaScripts(page) {
  return page.appended.filter((node) => node.src && META_SCRIPT.test(node.src));
}

function gtagScripts(page) {
  return page.appended.filter((node) => node.src && /googletagmanager\.com\/gtag\/js/.test(node.src));
}

test("queues one init and one PageView and appends fbevents.js once", () => {
  const page = createPage();
  run(source, page);

  assert.equal(typeof page.window.fbq, "function");
  assert.equal(page.window._fbq, page.window.fbq);
  assert.deepEqual(fbqCommands(page.window), [
    ["init", PIXEL_ID],
    ["track", "PageView"],
  ]);

  const scripts = metaScripts(page);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].src, "https://connect.facebook.net/en_US/fbevents.js");
});

test("running the loader twice still queues one init and one PageView", () => {
  const page = createPage();
  run(source, page);
  run(source, page);

  assert.deepEqual(fbqCommands(page.window), [
    ["init", PIXEL_ID],
    ["track", "PageView"],
  ]);
  assert.equal(metaScripts(page).length, 1);
});

test("leaves an existing fbq snippet alone instead of initializing again", () => {
  const existing = function () {
    existing.queue.push(arguments);
  };
  existing.queue = [];
  const page = createPage();
  page.window.fbq = existing;
  page.window._fbq = existing;

  run(source, page);

  assert.equal(page.window.fbq, existing);
  assert.equal(page.window._fbq, existing);
  assert.equal(existing.queue.length, 0);
  assert.equal(page.appended.length, 0);
});

test("never fires CompleteRegistration or another conversion event", () => {
  const page = createPage();
  run(source, page);

  const events = fbqCommands(page.window)
    .filter(([command]) => command === "track")
    .map(([, eventName]) => eventName);
  assert.deepEqual(events, ["PageView"]);
  assert.doesNotMatch(source, /CompleteRegistration/);
  assert.doesNotMatch(source, /\bLead\b/);
});

test("keeps the existing Google tag configuration and deferred loader", () => {
  const page = createPage();
  run(source, page);
  run(source, page);

  const configs = page.window.dataLayer.filter(([command, tagId]) => (
    command === "config" && tagId === "GT-57326MMH"
  ));
  assert.equal(configs.length, 1);

  page.window.ppLoadAnalytics();
  page.window.ppLoadAnalytics();
  assert.equal(gtagScripts(page).length, 1);
});
