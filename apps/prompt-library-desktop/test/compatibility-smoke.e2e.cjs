const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");
const { installElectronExitCleanup, launchElectronApplication } = require("./electron-window.cjs");

async function run() {
  const appDir = path.resolve(__dirname, "..");
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "t8-compatibility-smoke-"));
  const emptyMediaDir = path.join(userDataDir, "empty-media");
  const electronApp = await launchElectronApplication(electron, { appDir, userDataDir, env: { T8_MEDIA_DIR: emptyMediaDir } });
  const removeExitCleanup = installElectronExitCleanup(electronApp);

  try {
    const page = await electronApp.firstWindow();
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length > 0, undefined, { timeout: 30_000 });
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN", "a fresh desktop profile must start in Chinese");

    await page.locator(".case-card").first().click();
    await page.waitForSelector("#case-dialog[open]");
    await page.locator("#detail-media .media-fallback button").click();
    await page.waitForSelector("#media-install-dialog[open]");
    assert.equal(await page.locator("#media-install-path").textContent(), emptyMediaDir, "the guide must show the actual Main-resolved media directory");
    assert.match(await page.locator("#media-install-steps").textContent(), /prompt-library-media-v[\d.]+-part1\.zip/u);
    assert.match(await page.locator("#media-install-steps").textContent(), /media-pack-manifest\.json/u);
    await page.locator("#done-media-install").click();
    await page.locator("#media-install-dialog").waitFor({ state: "hidden" });
    await electronApp.evaluate(async ({ clipboard }) => clipboard.writeText("t8-copy-sentinel"));
    await page.locator("#copy-overview").click();
    await page.waitForFunction(() => document.querySelector("#copy-overview")?.dataset.copyState === "success");
    const copied = await electronApp.evaluate(async ({ clipboard }) => clipboard.readText());
    assert.match(copied, /^# .+\n/u, "copy success feedback must follow a completed clipboard write");
    assert.equal(await page.locator("#copy-overview").isDisabled(), false, "copy feedback must not disable repeated use");

    console.log("PASS Electron compatibility smoke: launch, Chinese default, media guide, dialog and clipboard");
  } finally {
    removeExitCleanup();
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
