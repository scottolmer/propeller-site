import {chromium} from "playwright-core";
import {mkdir} from "node:fs/promises";
import path from "node:path";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:8765/tools/underdog-payout-calculator/";
const projectRoot = path.resolve(process.cwd(), "..");
const executablePath = "/Users/scottolmer/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const targets = [
  {name: "desktop", width: 1440, height: 1000, output: path.join(projectRoot, "captures/desktop")},
  {name: "mobile", width: 390, height: 844, output: path.join(projectRoot, "captures/mobile")},
];

const browser = await chromium.launch({headless: true, executablePath});

for (const target of targets) {
  console.log(`Capturing ${target.name}`);
  await mkdir(target.output, {recursive: true});
  const page = await browser.newPage({viewport: {width: target.width, height: target.height}, deviceScaleFactor: 1});
  await page.goto(baseUrl, {waitUntil: "networkidle"});
  await page.addStyleTag({content: "nav{position:relative!important}.pp-site-nav{position:relative!important}*{animation:none!important;transition:none!important}.calc-card{margin-bottom:12px!important}"});
  await page.selectOption("#entryType", "standard");
  await page.selectOption("#numPicks", "5");
  await page.getByRole("button", {name: "$10", exact: true}).click();
  await page.locator(".calc-card").scrollIntoViewIfNeeded();
  await page.screenshot({path: path.join(target.output, "calculator-default.png"), fullPage: false});
  console.log(`Saved ${target.name} default`);

  await page.selectOption("#entryType", "standard");
  await page.selectOption("#numPicks", "5");
  await page.getByRole("button", {name: "$10", exact: true}).click();
  await page.fill("#hitRate", "55");
  await page.locator(".calc-btn").click();
  await page.locator("#results").scrollIntoViewIfNeeded();
  await page.screenshot({path: path.join(target.output, "standard-5pick-10.png"), fullPage: false});
  console.log(`Saved ${target.name} standard`);

  await page.selectOption("#entryType", "flex");
  await page.selectOption("#numPicks", "6");
  await page.getByRole("button", {name: "$10", exact: true}).click();
  await page.fill("#hitRate", "55");
  await page.locator(".calc-btn").click();
  await page.locator("#results").scrollIntoViewIfNeeded();
  await page.screenshot({path: path.join(target.output, "flex-6pick-10.png"), fullPage: false});
  console.log(`Saved ${target.name} flex`);
  await page.close();
}

await browser.close();
