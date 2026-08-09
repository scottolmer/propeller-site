import { chromium } from "playwright-core";
import path from "node:path";

const root = path.resolve("..");
const executablePath = path.resolve(
  "node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell",
);
const url = "https://propellerpicks.com/fantasy/mlb/";

const browser = await chromium.launch({ executablePath, headless: true });

const capture = async ({ name, width, height, mobile = false }) => {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

  const heading = page.getByRole("heading", { name: /current mlb slate range board/i });
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const capturePath = (suffix) =>
    path.join(root, "captures", mobile ? "mobile" : "desktop", `${name}-${suffix}.png`);

  await page.screenshot({ path: capturePath("projected"), fullPage: false });

  const sort = page.locator("select").first();
  const options = await sort.locator("option").allTextContents();
  if (options.some((label) => /floor/i.test(label))) {
    await sort.selectOption({ label: options.find((label) => /floor/i.test(label)) });
    await page.waitForTimeout(250);
    await page.screenshot({ path: capturePath("floor"), fullPage: false });
  }
  if (options.some((label) => /ceiling/i.test(label))) {
    await sort.selectOption({ label: options.find((label) => /ceiling/i.test(label)) });
    await page.waitForTimeout(250);
    await page.screenshot({ path: capturePath("ceiling"), fullPage: false });
  }
  if (options.length > 0) {
    await sort.selectOption({ index: 0 });
    await page.waitForTimeout(250);
  }

  const checkboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await checkboxes.count();
  if (checkboxCount >= 2) {
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await page.waitForTimeout(500);
    const comparison = page.getByText(/sit|start/i).last();
    if (await comparison.isVisible().catch(() => false)) {
      await comparison.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
    await page.screenshot({ path: capturePath("comparison"), fullPage: false });
  }

  console.log(JSON.stringify({ name, options, checkboxCount }));
  await context.close();
};

await capture({ name: "live-board-desktop-2026-07-18", width: 1600, height: 1000 });
await capture({
  name: "live-board-mobile-2026-07-18",
  width: 430,
  height: 932,
  mobile: true,
});

await browser.close();
