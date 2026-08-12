const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");
const { loadCatalog } = require("../lib/catalog.cjs");

async function run() {
  const appDir = path.resolve(__dirname, "..");
  const sourceCatalog = loadCatalog({
    catalogRoot: path.resolve(appDir, "../..", "catalog"),
    mediaRoot: path.resolve(appDir, "../..", ".release-input", "media"),
    skillsRoot: path.resolve(appDir, "../..", "skills")
  });
  const expectedTemplateCount = new Set([
    ...sourceCatalog.cases.map((item) => item.templateId || item.skillRef || item.id),
    ...sourceCatalog.communitySkills.map((item) => item.templateId || item.skillRef || item.id)
  ]).size;
  const screenshotPath = path.join(os.tmpdir(), `t8-prompt-workbench-${Date.now()}.png`);
  const e2eUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "t8-workbench-e2e-userdata-"));
  const packagedExecutable = process.env.T8_E2E_EXECUTABLE ? path.resolve(process.env.T8_E2E_EXECUTABLE) : null;
  const electronApp = await electron.launch({
    executablePath: packagedExecutable || require("electron"),
    args: packagedExecutable ? [`--user-data-dir=${e2eUserDataDir}`] : [appDir, `--user-data-dir=${e2eUserDataDir}`],
    cwd: appDir,
    env: { ...process.env, T8_DISABLE_AUTO_UPDATE: "1", T8STAR_API_KEY: "", SEEDANCE_API_KEY: "", OPENAI_API_KEY: "", ELECTRON_DISABLE_SECURITY_WARNINGS: "true" }
  });
  try {
    const page = await electronApp.firstWindow();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => localStorage.removeItem("t8-display-locale"));
    await page.reload();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.waitForSelector(".case-card", { timeout: 15000 });
    await page.locator("#open-prompt-workbench").click();
    await page.waitForSelector("#prompt-workbench-dialog[open]");
    assert.equal(await page.locator('[data-workbench-step]').count(), 3, "creation flow must stay focused on mechanism, parameters, and result");
    assert.equal(await page.locator('[data-workbench-step="provider"]').count(), 0, "API configuration must not consume a creation step");
    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    assert.equal(await page.locator("#workbench-provider-cards .provider-card").count(), 3);
    assert.equal(await page.locator("[data-provider-registration]").count(), 2);
    assert.equal(await page.locator("#workbench-template option").count(), expectedTemplateCount, "workbench selector count must be derived from the current manifest and evidence-variant lineage");
    await page.waitForSelector("#workbench-preview-media[data-state='ready']");
    assert.match(await page.locator("#workbench-preview-image").getAttribute("src"), /^t8media:\/\/catalog\//u, "selected template must load its packaged GIF through the media protocol");
    const wideLayout = await page.evaluate(() => {
      const dialog = document.querySelector("#prompt-workbench-dialog").getBoundingClientRect();
      const stage = document.querySelector(".workbench-stage").getBoundingClientRect();
      const preview = document.querySelector("#workbench-template-preview").getBoundingClientRect();
      return { dialog: { width: dialog.width, height: dialog.height }, stageRight: stage.right, previewLeft: preview.left, viewport: { width: innerWidth, height: innerHeight } };
    });
    assert.ok(wideLayout.dialog.width >= wideLayout.viewport.width * 0.94, "workbench must use the available viewport width");
    assert.ok(wideLayout.dialog.height >= wideLayout.viewport.height * 0.94, "workbench must use the available viewport height");
    assert.ok(wideLayout.previewLeft > wideLayout.stageRight, "template preview must remain to the right of the active step on desktop");

    await page.locator('[data-provider-id="t8star_workshop"]').click();
    await page.locator("#workbench-model").fill("e2e-model-choice");
    await page.locator("#workbench-api-key").fill("e2e-session-key-not-real");
    await page.locator("#workbench-save-key").click();
    await page.waitForFunction(() => document.querySelector('[data-provider-state="t8star_workshop"]').textContent.includes("session"));
    assert.equal(await page.locator("#workbench-api-key").inputValue(), "", "key input must clear immediately after save");
    assert.equal(await page.locator("#workbench-remember-key").isChecked(), true, "persistent secure storage must be the default setting");
    await page.locator("#done-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    assert.match(await page.locator("#workbench-api-settings-status").textContent(), /1\/3/u);

    await page.locator('[data-workbench-step="goal"]').click();
    await page.locator("#workbench-intent").fill("一个便携产品在15秒内证明三项功能，最后停留在清楚结果，不要字幕。");
    await page.locator("#workbench-route").click();
    assert.equal(await page.locator(".router-card").count(), 3, "goal router must return at most three visible recommendations");
    await page.locator(".router-card .button").first().click();
    assert.ok((await page.locator("#workbench-template-summary").textContent()).length > 20);
    assert.ok((await page.locator("#workbench-preview-title").textContent()).length > 4);

    await page.locator('[data-workbench-step="target"]').click();
    assert.equal(await page.locator("#workbench-output-language").inputValue(), "zh-CN", "new runs must default to Chinese output");
    assert.equal(await page.locator("#workbench-output-language option").count(), 2, "generation parameters must offer Chinese and English");
    await page.locator("#workbench-target").selectOption("seedance20");
    await page.locator("#workbench-preflight").click();
    await page.waitForSelector("#workbench-preflight-card:not(.hidden)");
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /ai\.t8star\.org/u);
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /中文/u, "preflight must bind the requested output language");
    assert.equal(await page.locator("#workbench-start").isDisabled(), true);
    await page.locator("#workbench-confirm-paid").check();
    assert.equal(await page.locator("#workbench-start").isEnabled(), true);
    assert.match(await page.locator("#workbench-confirm-label").textContent(), /1次对话请求.*素材数上传/u);
    await page.locator("#workbench-add-media").waitFor({ state: "visible" });
    await page.locator('[data-workbench-step="result"]').click();
    await page.locator("#workbench-save-project").waitFor({ state: "visible" });

    await page.setViewportSize({ width: 760, height: 760 });
    const overflow = await page.evaluate(() => {
      const shell = document.querySelector("#prompt-workbench-dialog .dialog-shell");
      return { document: [document.documentElement.scrollWidth, document.documentElement.clientWidth], dialog: [shell.scrollWidth, shell.clientWidth] };
    });
    assert.ok(overflow.document[0] <= overflow.document[1], `document overflow at 760px: ${overflow.document.join(" > ")}`);
    assert.ok(overflow.dialog[0] <= overflow.dialog[1], `workbench overflow at 760px: ${overflow.dialog.join(" > ")}`);
    assert.equal(await page.locator("#workbench-template-preview").isVisible(), true, "responsive workbench must keep the selected-template preview visible");
    await page.screenshot({ path: screenshotPath, animations: "disabled" });

    await page.reload();
    await page.waitForSelector(".case-card", { timeout: 15000 });
    await page.locator("#open-prompt-workbench").click();
    await page.waitForSelector("#prompt-workbench-dialog[open]");
    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    assert.equal(await page.locator('[data-provider-id="t8star_workshop"]').getAttribute("aria-pressed"), "true", "saved provider must restore after renderer reload");
    assert.equal(await page.locator("#workbench-model").inputValue(), "e2e-model-choice", "saved model must restore after renderer reload");
    assert.equal(await page.evaluate(() => localStorage.getItem("t8-workbench-provider")), "t8star_workshop", "default provider must persist locally");
    assert.match(await page.evaluate(() => localStorage.getItem("t8-workbench-provider-options")), /e2e-model-choice/u, "provider model preferences must persist without storing the key");
    await page.locator("#workbench-clear-key").click();
    await page.waitForFunction(() => !document.querySelector('[data-provider-state="t8star_workshop"]').textContent.includes("session"));
    assert.deepEqual(errors, [], `workbench renderer errors: ${errors.join(" | ")}`);
    console.log(`PASS workbench E2E; templates=${expectedTemplateCount}; providers=3; confirmation=explicit; screenshot=${screenshotPath}`);
  } finally {
    await electronApp.close();
    fs.rmSync(e2eUserDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
