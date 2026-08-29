const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");
const { installElectronExitCleanup, setElectronContentSize } = require("./electron-window.cjs");

async function run() {
  const appDir = path.resolve(__dirname, "..");
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "t8-layout-e2e-userdata-"));
  const screenshotPath = path.join(os.tmpdir(), `t8-catalog-layout-${Date.now()}-1464x900.png`);
  const electronApp = await electron.launch({
    executablePath: require("electron"),
    args: [appDir, `--user-data-dir=${userDataDir}`],
    cwd: appDir,
    env: { ...process.env, T8_DISABLE_AUTO_UPDATE: "1", ELECTRON_DISABLE_SECURITY_WARNINGS: "true" }
  });
  const removeExitCleanup = installElectronExitCleanup(electronApp);
  try {
    const page = await electronApp.firstWindow();
    const requestedViewport = { width: 1464, height: 900 };
    const synchronizedViewport = await setElectronContentSize(electronApp, page, requestedViewport);
    await page.evaluate(() => {
      localStorage.setItem("t8-display-locale", "zh-CN");
      localStorage.setItem("t8-display-locale-default-zh-v1", "done");
      localStorage.removeItem("t8-personal-library-v1");
    });
    await page.reload();
    const rendererErrors = [];
    page.on("pageerror", (error) => rendererErrors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") rendererErrors.push(message.text()); });
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length > 0, undefined, { timeout: 30000 });
    await page.locator("#search").fill("空气净化");
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll(".case-card").length;
      const total = Number(document.querySelector("#stat-cases")?.textContent || 0);
      const results = Number(document.querySelector("#stat-results")?.textContent || -1);
      return document.querySelector("#search")?.value === "空气净化" && cards > 0 && cards === results && results < total;
    });

    const geometry = await page.evaluate(() => {
      const main = document.querySelector("main").getBoundingClientRect();
      const topbar = document.querySelector(".topbar").getBoundingClientRect();
      return {
        viewport: { width: innerWidth, height: innerHeight },
        document: { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
        body: document.body.getBoundingClientRect().toJSON(),
        main: main.toJSON(),
        topbar: topbar.toJSON()
      };
    });
    assert.deepEqual(geometry.viewport, synchronizedViewport, "renderer dimensions must remain stable after reloading the catalog");
    assert.ok(geometry.viewport.width > 0 && geometry.viewport.width <= requestedViewport.width, "the operating system may only clamp the requested content width downward");
    assert.ok(geometry.viewport.height > 0 && geometry.viewport.height <= requestedViewport.height, "the operating system may only clamp the requested content height downward");
    assert.ok(geometry.document.clientWidth >= geometry.viewport.width - 16 && geometry.document.clientWidth <= geometry.viewport.width, "document width may differ from innerWidth only by the native vertical scrollbar");
    assert.ok(geometry.document.scrollWidth <= geometry.document.clientWidth, "catalog must not create horizontal overflow");
    assert.ok(Math.abs(geometry.body.width - geometry.document.clientWidth) <= 1, "body must fill the available document width");
    assert.ok(Math.abs(geometry.main.left) <= 1 && Math.abs(geometry.main.right - geometry.document.clientWidth) <= 1, "main catalog area must fill the document width without a right gutter");
    assert.ok(Math.abs(geometry.topbar.left) <= 1 && Math.abs(geometry.topbar.right - geometry.document.clientWidth) <= 1, "top bar must fill the document width without a right gutter");
    assert.deepEqual(rendererErrors, [], `renderer errors: ${rendererErrors.join(" | ")}`);
    await page.screenshot({ path: screenshotPath, animations: "disabled" });
    console.log(`PASS catalog layout regression; viewport=${geometry.viewport.width}x${geometry.viewport.height}; screenshot=${screenshotPath}`);
  } finally {
    removeExitCleanup();
    await electronApp.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
