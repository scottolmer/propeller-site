#!/usr/bin/env node

import {spawn} from "node:child_process";
import {mkdir, mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionDir = path.dirname(scriptDir);
const projectDir = path.dirname(remotionDir);
const capturesDir = path.join(projectDir, "captures");
const repoRoot = path.resolve(projectDir, "../../..");
const calculatorUrl = "http://127.0.0.1:8765/tools/prizepicks-payout-calculator/";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profileDir = await mkdtemp(path.join(tmpdir(), "propeller-prizepicks-capture-"));
const server = spawn("/usr/bin/python3", ["-m", "http.server", "8765", "--bind", "127.0.0.1"], {
  cwd: repoRoot,
  stdio: "ignore",
});
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--remote-debugging-port=9333",
  `--user-data-dir=${profileDir}`,
  "about:blank",
], {stdio: "ignore"});

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The local processes may still be starting.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function connect(socketUrl) {
  const socket = new WebSocket(socketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, {once: true});
    socket.addEventListener("error", reject, {once: true});
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const {resolve, reject} = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  return {
    call(method, params = {}) {
      const id = ++nextId;
      socket.send(JSON.stringify({id, method, params}));
      return new Promise((resolve, reject) => pending.set(id, {resolve, reject}));
    },
    close() { socket.close(); },
  };
}

async function capture(type, viewport, output) {
  const created = await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(calculatorUrl)}`, {method: "PUT"});
  const target = await created.json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.call("Page.enable");
  await cdp.call("Runtime.enable");
  await cdp.call("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await cdp.call("Page.navigate", {url: calculatorUrl});
  await sleep(900);
  const expression = `(() => {
    document.getElementById('entryType').value = '${type}';
    updateUI();
    document.getElementById('numPicks').value = '4';
    setAmount(20, document.querySelectorAll('.pill')[2]);
    document.getElementById('hitRate').value = '55';
    calculate();
    const card = document.querySelector('.calc-card');
    const rect = card.getBoundingClientRect();
    return {x: rect.left + window.scrollX, y: rect.top + window.scrollY, width: rect.width, height: rect.height};
  })()`;
  const evaluated = await cdp.call("Runtime.evaluate", {expression, returnByValue: true, awaitPromise: true});
  await sleep(250);
  const box = evaluated.result.value;
  const screenshot = await cdp.call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: {x: box.x, y: box.y, width: box.width, height: box.height, scale: 1},
  });
  await writeFile(output, Buffer.from(screenshot.data, "base64"));
  cdp.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);
}

try {
  await mkdir(path.join(capturesDir, "desktop"), {recursive: true});
  await mkdir(path.join(capturesDir, "mobile"), {recursive: true});
  await waitFor(calculatorUrl);
  await waitFor("http://127.0.0.1:9333/json/version");
  const jobs = [
    ["power", {width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false}, "desktop/calculator-power-4-pick-20.png"],
    ["flex", {width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false}, "desktop/calculator-flex-4-pick-20.png"],
    ["power", {width: 390, height: 1100, deviceScaleFactor: 2, mobile: true}, "mobile/calculator-power-4-pick-20.png"],
    ["flex", {width: 390, height: 1100, deviceScaleFactor: 2, mobile: true}, "mobile/calculator-flex-4-pick-20.png"],
  ];
  for (const [type, viewport, relative] of jobs) {
    await capture(type, viewport, path.join(capturesDir, relative));
  }
} finally {
  chrome.kill("SIGTERM");
  server.kill("SIGTERM");
  await rm(profileDir, {recursive: true, force: true});
}
