const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");
const { loadCatalog } = require("../lib/catalog.cjs");
const { PromptProjectStore } = require("../lib/prompt-projects.cjs");
const { installElectronExitCleanup, setElectronContentSize } = require("./electron-window.cjs");

const CREATIVE_AI_RESPONSES = [
    { subject: ["便携产品", "portable product"], actions: ["证明", "demonstrate", "proof"], goals: ["产品广告", "product ad", "功能证明", "capability proof", "发布"], styles: [], camera: [], emotion: [], sound: [], constraints: ["三项功能", "清楚结果"], exclusions: ["字幕"], ambiguity: "" },
    { recommendations: [{ templateId: "t8c001-product-proof-state-machine", score: 96, confidence: "high", reasons: ["直接以多个可见证据递进证明产品能力并回收到清楚结果。"], risks: ["需要将示例美容产品替换为用户的便携产品。"], missingInformation: [] }], clarification: "" }
];

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
  const simpleModeScreenshotPath = path.join(os.tmpdir(), `t8-prompt-workbench-simple-${Date.now()}.png`);
  const musicScreenshotPath = path.join(os.tmpdir(), `t8-music3-workbench-${Date.now()}.png`);
  const localSettingsScreenshotPath = path.join(os.tmpdir(), `t8-local-qwen-settings-${Date.now()}.png`);
  const e2eUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "t8-workbench-e2e-userdata-"));
  const legacyTemplate = sourceCatalog.cases[0];
  const legacyLocalProject = new PromptProjectStore({ userDataDir: e2eUserDataDir }).save({
    title: "旧版地模型项目",
    topic: "provider-regression",
    intent: "验证历史项目不会覆盖当前 API 渠道。",
    constraints: "",
    templateId: legacyTemplate.templateId || legacyTemplate.skillRef || legacyTemplate.id,
    templateTitle: legacyTemplate.title,
    templateHash: "b".repeat(64),
    templateSnapshot: {
      id: legacyTemplate.id,
      title: legacyTemplate.title,
      summary: legacyTemplate.summary,
      requiredAnchors: legacyTemplate.requiredAnchors || ["结果"],
      creativeDna: legacyTemplate.creativeDna || { mechanism: "先目标后证据" }
    },
    target: "minimaxH3",
    outputLanguage: "zh-CN",
    durationSeconds: 15,
    rewriteMode: "balanced",
    shots: [{ shotId: "shot-01", startSeconds: 0, endSeconds: 15, action: "历史项目内容", source: "legacy_intent" }],
    continuityLocks: [],
    providerId: "local_qwen",
    providerLabel: "本地 GGUF",
    endpointHost: "127.0.0.1",
    model: "Qwen3.8-27B-Q4_K_M.gguf",
    output: "历史项目结果",
    validation: { status: "pass" },
    media: []
  });
  const packagedExecutable = process.env.T8_E2E_EXECUTABLE ? path.resolve(process.env.T8_E2E_EXECUTABLE) : null;
  const electronApp = await electron.launch({
    executablePath: packagedExecutable || require("electron"),
    args: packagedExecutable ? [`--user-data-dir=${e2eUserDataDir}`] : [appDir, `--user-data-dir=${e2eUserDataDir}`],
    cwd: appDir,
    env: { ...process.env, T8_DISABLE_AUTO_UPDATE: "1", T8_E2E_CREATIVE_AI: "1", T8_E2E_CREATIVE_RESPONSES: Buffer.from(JSON.stringify(CREATIVE_AI_RESPONSES), "utf8").toString("base64"), T8STAR_API_KEY: "", SEEDANCE_API_KEY: "", OPENAI_API_KEY: "", ELECTRON_DISABLE_SECURITY_WARNINGS: "true" }
  });
  const removeExitCleanup = installElectronExitCleanup(electronApp);
  try {
    const page = await electronApp.firstWindow();
    const requestedWorkbenchViewport = { width: 1280, height: 800 };
    const actualWorkbenchViewport = await setElectronContentSize(electronApp, page, requestedWorkbenchViewport);
    await page.evaluate(() => localStorage.removeItem("t8-display-locale"));
    await page.reload();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.waitForFunction(
      () => document.querySelectorAll(".case-card").length > 0,
      undefined,
      { timeout: 30000 }
    );
    await page.locator("#open-prompt-workbench").click();
    await page.waitForSelector("#prompt-workbench-dialog[open]");
    assert.equal(await page.locator('[data-workbench-step]').count(), 3, "creation flow must stay focused on mechanism, parameters, and result");
    assert.equal(await page.locator('[data-workbench-step="provider"]').count(), 0, "API configuration must not consume a creation step");
    assert.equal(await page.locator("#workbench-advanced-settings").getAttribute("open"), null, "advanced controls must start collapsed");
    assert.equal(await page.locator("#workbench-professional-tools").getAttribute("open"), null, "professional review tools must start collapsed");
    assert.equal(await page.locator("#workbench-manual-shots").isChecked(), false, "manual shot design must be opt-in");
    assert.equal(await page.locator("#workbench-manual-continuity").isChecked(), false, "manual continuity locks must be opt-in");
    assert.equal(await page.locator("#workbench-shot-list .shot-card").count(), 0, "simple mode must not manufacture an empty shot form");
    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    assert.equal(await page.locator("#workbench-provider-cards .provider-card").count(), 4);
    assert.equal(await page.locator("[data-provider-registration]").count(), 2);
    await page.locator('[data-provider-id="local_qwen"]').click();
    assert.equal(await page.locator("#workbench-local-qwen-panel").isVisible(), true, "local Qwen must use its own settings panel");
    assert.equal(await page.locator("#workbench-credential-panel").isVisible(), false, "local Qwen must not ask for an API key");
    assert.equal(await page.locator("#local-qwen-model option").count(), 3, "all three node-validated models must be advertised before a folder is selected");
    assert.equal(await page.locator("#local-qwen-projector option").count(), 1, "projector selection must start in safe automatic matching mode");
    const readLocalSettingsLayout = () => page.locator(".api-settings-content").evaluate((node) => {
      const footer = document.querySelector(".api-settings-footer").getBoundingClientRect();
      return {
        scrollHeight: node.scrollHeight,
        clientHeight: node.clientHeight,
        overflowY: getComputedStyle(node).overflowY,
        footerTop: footer.top,
        footerBottom: footer.bottom,
        viewportHeight: innerHeight
      };
    });
    const assertClampedSettingsRemainUsable = (layout) => {
      assert.match(layout.overflowY, /auto|scroll/u, "OS-clamped workbench settings must remain vertically scrollable");
      assert.ok(layout.footerTop >= 0 && layout.footerBottom <= layout.viewportHeight + 1, "OS-clamped workbench settings must keep the Done footer visible");
    };
    const localSettingsOverflow = await readLocalSettingsLayout();
    if (actualWorkbenchViewport.height >= requestedWorkbenchViewport.height) {
      assert.ok(localSettingsOverflow.scrollHeight <= localSettingsOverflow.clientHeight + 1, `local Qwen settings must fit one actual 1280x800 content viewport (${localSettingsOverflow.scrollHeight} > ${localSettingsOverflow.clientHeight})`);
      await setElectronContentSize(electronApp, page, { width: 1280, height: 648 });
      assertClampedSettingsRemainUsable(await readLocalSettingsLayout());
      await setElectronContentSize(electronApp, page, requestedWorkbenchViewport);
    } else {
      assertClampedSettingsRemainUsable(localSettingsOverflow);
    }
    await page.screenshot({ path: localSettingsScreenshotPath, animations: "disabled" });
    await page.locator("#close-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    await page.locator('[data-workbench-step="target"]').click();
    await page.locator("#workbench-next-step").click();
    assert.equal(await page.locator('[data-workbench-panel="target"]').isVisible(), true, "configuration errors must keep beginners on the generation step");
    assert.match(await page.locator("#workbench-setup-status-message").textContent(), /API Key/u);
    assert.doesNotMatch(await page.locator("#workbench-setup-status-message").textContent(), /Error invoking remote method|PromptProviderError/u);
    assert.equal(await page.locator("#workbench-setup-status-action").isVisible(), true, "the error must offer a direct route to API settings");
    await page.locator("#workbench-setup-status-action").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    await page.locator("#close-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    await page.locator('[data-workbench-step="goal"]').click();
    assert.equal(await page.locator("#workbench-template option").count(), expectedTemplateCount, "workbench selector count must be derived from the current manifest and evidence-variant lineage");
    await page.locator("#workbench-template").selectOption("t8-case-earnest-upgrade-displacement-v1");
    try {
      await page.waitForSelector("#workbench-preview-media[data-state='ready']");
    } catch (error) {
      const previewState = await page.evaluate(() => ({
        capability: document.querySelector("#prompt-workbench-dialog")?.dataset.capability,
        state: document.querySelector("#workbench-preview-media")?.dataset.state,
        src: document.querySelector("#workbench-preview-image")?.getAttribute("src"),
        placeholder: document.querySelector("#workbench-preview-placeholder")?.textContent
      }));
      throw new Error(`template preview did not become ready: ${JSON.stringify(previewState)}; ${error.message}`);
    }
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

    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    await page.locator('[data-provider-id="t8star_workshop"]').click();
    await page.locator("#workbench-model").fill("e2e-model-choice");
    await page.locator("#workbench-api-key").fill("e2e-session-key-not-real");
    await page.locator("#workbench-save-key").click();
    await page.waitForFunction(() => document.querySelector('[data-provider-state="t8star_workshop"]').textContent.includes("session"));
    assert.equal(await page.locator("#workbench-api-key").inputValue(), "", "key input must clear immediately after save");
    assert.equal(await page.locator("#workbench-remember-key").isChecked(), true, "persistent secure storage must be the default setting");
    await page.locator("#done-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    assert.match(await page.locator("#workbench-api-settings-status").textContent(), /AI 工坊.*✓/u);
    assert.match(await page.locator("#workbench-current-provider-state").textContent(), /已就绪/u);

    await page.locator("#workbench-capability-music").click();
    const musicCapabilityState = await page.locator("#prompt-workbench-dialog").getAttribute("data-capability");
    assert.equal(musicCapabilityState, "music3", `Music 3 switch did not activate; renderer errors: ${errors.join(" | ")}`);
    assert.match(await page.locator("#workbench-title").textContent(), /Music 3/u);
    assert.equal(await page.locator("#music3-caption-language").inputValue(), "zh-CN", "Music 3 structured caption must default to Chinese");
    assert.match(await page.locator("#workbench-preview-template-id").textContent(), /MiniMaxMusic3PromptEnhancerT8/u);
    assert.equal(await page.locator("#workbench-model").inputValue(), "gemini-3.5-flash", "Music 3 must start from its own provider model preference");
    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    await page.locator("#workbench-model").fill("e2e-music-model-choice");
    await page.locator("#done-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    await page.locator("#workbench-intent").fill("一首中文电影感流行情歌，女声从克制走向坚定，钢琴开场，副歌加入弦乐。");
    await page.locator('[data-workbench-step="target"]').click();
    assert.equal(await page.locator("#music3-parameters").isVisible(), true, "Music 3 parameters must replace, not mix with, video controls");
    assert.equal(await page.locator("#workbench-video-parameters").isVisible(), false);
    assert.equal(await page.locator("#workbench-add-media").isVisible(), false, "Music 3 v1 is text-only");
    assert.match(await page.locator('[data-workbench-step="target"] strong').textContent(), /歌词与参数/u, "Music step labels must survive the original step renderer");
    await page.locator("#workbench-locale-en").click();
    await page.waitForFunction(() => document.documentElement.lang === "en");
    assert.equal(await page.locator('label:has(#music3-lyrics-mode) > span').textContent(), "Lyrics mode", "Music parameter labels must fully switch to English");
    assert.match(await page.locator('[data-workbench-step="target"] strong').textContent(), /Lyrics & parameters/u);
    await page.locator("#workbench-locale-zh").click();
    await page.waitForFunction(() => document.documentElement.lang === "zh-CN");
    assert.equal(await page.locator('label:has(#music3-lyrics-mode) > span').textContent(), "歌词模式", "Music parameters must return to Chinese");
    await page.locator("#music3-toggle-advanced").click();
    assert.equal(await page.locator("#music3-advanced-fields").isVisible(), true);
    await page.locator("#workbench-preflight").click();
    await page.waitForSelector("#workbench-preflight-card:not(.hidden)");
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /Music 3|lyrics|caption|AI Workshop/iu);
    assert.match(await page.locator("#workbench-confirm-label").textContent(), /逻辑请求.*物理尝试/u);
    assert.equal(await page.locator("#workbench-start").isDisabled(), true);
    await page.screenshot({ path: musicScreenshotPath, animations: "disabled" });
    await page.locator("#workbench-capability-video").click();
    assert.equal(await page.locator("#workbench-video-parameters").isVisible(), true, "switching back must restore video controls");
    assert.equal(await page.locator("#music3-parameters").isVisible(), false);
    assert.equal(await page.locator("#workbench-model").inputValue(), "e2e-model-choice", "switching back must restore the video provider model preference");
    assert.match(await page.evaluate(() => localStorage.getItem("t8-music3-provider-options")), /e2e-music-model-choice/u, "Music 3 model preferences must use a separate local record");
    assert.doesNotMatch(await page.locator("#workbench-title").textContent(), /Music 3/u);

    await page.locator('[data-workbench-step="goal"]').click();
    await page.locator("#workbench-intent").fill("一个便携产品在15秒内证明三项功能，最后停留在清楚结果，不要字幕。");
    await page.locator("#workbench-route").click();
    await page.waitForFunction(() => document.querySelectorAll(".router-card").length > 0 || document.querySelector("#workbench-router-results")?.textContent.includes("请再补充"));
    const recommendationCount = await page.locator(".router-card").count();
    assert.ok(recommendationCount >= 1 && recommendationCount <= 3, "AI router must return one to three relevant recommendations without padding");
    assert.ok((await page.locator("#workbench-router-results").textContent()).includes(`${expectedTemplateCount}/${expectedTemplateCount}`), "router must disclose full unified-index coverage");
    await page.locator(".router-card .button").first().click();
    assert.ok((await page.locator("#workbench-template-summary").textContent()).length > 20);
    assert.ok((await page.locator("#workbench-preview-title").textContent()).length > 4);

    await page.locator('[data-workbench-step="target"]').click();
    assert.equal(await page.locator("#workbench-output-language").inputValue(), "zh-CN", "new runs must default to Chinese output");
    assert.equal(await page.locator("#workbench-output-language option").count(), 2, "generation parameters must offer Chinese and English");
    assert.equal(await page.locator("#workbench-advanced-settings").getAttribute("open"), null);
    assert.equal(await page.locator("#workbench-shot-plan-panel").isVisible(), false);
    assert.equal(await page.locator("#workbench-continuity-panel").isVisible(), false);
    assert.equal(await page.locator("#workbench-next-step").textContent(), "生成提示词", "the prominent footer action must generate instead of navigating to an empty result");
    await page.screenshot({ path: simpleModeScreenshotPath, animations: "disabled" });
    await page.locator("#workbench-target").selectOption("seedance20");
    await page.locator("#workbench-next-step").click();
    await page.waitForSelector("#workbench-preflight-card:not(.hidden)");
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /ai\.t8star\.org/u);
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /中文/u, "preflight must bind the requested output language");
    assert.equal(await page.locator("#workbench-start").isDisabled(), true);
    await page.locator("#workbench-confirm-paid").check();
    assert.equal(await page.locator("#workbench-start").isEnabled(), true);
    assert.match(await page.locator("#workbench-confirm-label").textContent(), /1次对话请求.*素材数上传/u);
    const plannedShotCount = await page.locator("#workbench-preflight-facts").evaluate((node) => {
      const rows = [...node.children];
      const index = rows.findIndex((item) => item.textContent.includes("计划镜头"));
      return index >= 0 ? rows[index + 1]?.textContent : null;
    });
    assert.equal(plannedShotCount, "1", "simple mode must let the backend derive one complete fallback shot without showing an empty shot canvas");
    await page.locator("#workbench-add-media").waitFor({ state: "visible" });
    await page.locator('[data-workbench-step="result"]').click();
    await page.locator("#workbench-output").waitFor({ state: "visible" });
    assert.equal(await page.locator("#workbench-professional-tools").getAttribute("open"), null, "result review and delivery tools must remain optional on the first result view");

    await setElectronContentSize(electronApp, page, { width: 760, height: 760 });
    const overflow = await page.evaluate(() => {
      const shell = document.querySelector("#prompt-workbench-dialog .dialog-shell");
      return { document: [document.documentElement.scrollWidth, document.documentElement.clientWidth], dialog: [shell.scrollWidth, shell.clientWidth] };
    });
    assert.ok(overflow.document[0] <= overflow.document[1], `document overflow at 760px: ${overflow.document.join(" > ")}`);
    assert.ok(overflow.dialog[0] <= overflow.dialog[1], `workbench overflow at 760px: ${overflow.dialog.join(" > ")}`);
    assert.equal(await page.locator("#workbench-template-preview").isVisible(), true, "responsive workbench must keep the selected-template preview visible");
    const narrowHeader = await page.evaluate(() => {
      const header = document.querySelector("#prompt-workbench-dialog .dialog-header").getBoundingClientRect();
      const controls = [...document.querySelectorAll("#prompt-workbench-dialog .workbench-header-actions button")].map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, writingMode: style.writingMode, whiteSpace: style.whiteSpace };
      });
      return { header: { left: header.left, right: header.right }, controls };
    });
    assert.ok(narrowHeader.controls.every((control) => control.left >= narrowHeader.header.left && control.right <= narrowHeader.header.right), "all narrow-header controls must stay inside the dialog");
    assert.ok(narrowHeader.controls.every((control) => control.writingMode === "horizontal-tb"), "narrow-header labels must remain horizontal");
    assert.ok(narrowHeader.controls.every((control) => control.whiteSpace === "nowrap"), "narrow-header labels must not wrap into vertical stacks");
    await page.screenshot({ path: screenshotPath, animations: "disabled" });

    await page.reload();
    await page.waitForFunction(
      () => document.querySelectorAll(".case-card").length > 0,
      undefined,
      { timeout: 30000 }
    );
    await page.locator("#open-prompt-workbench").click();
    await page.waitForSelector("#prompt-workbench-dialog[open]");
    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    assert.equal(await page.locator('[data-provider-id="t8star_workshop"]').getAttribute("aria-pressed"), "true", "saved provider must restore after renderer reload");
    assert.equal(await page.locator("#workbench-model").inputValue(), "e2e-model-choice", "saved model must restore after renderer reload");
    assert.equal(await page.evaluate(() => localStorage.getItem("t8-workbench-provider")), "t8star_workshop", "default provider must persist locally");
    assert.match(await page.evaluate(() => localStorage.getItem("t8-workbench-provider-options")), /e2e-model-choice/u, "provider model preferences must persist without storing the key");
    await page.locator("#close-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    await page.locator('[data-workbench-step="result"]').click();
    await page.locator("#workbench-professional-tools").evaluate((node) => { node.open = true; });
    await page.locator("#workbench-project-list").selectOption(legacyLocalProject.projectId);
    await page.waitForFunction((projectId) => document.querySelector("#workbench-project-list")?.value === projectId, legacyLocalProject.projectId);
    assert.equal(await page.evaluate(() => localStorage.getItem("t8-workbench-provider")), "t8star_workshop", "loading a historical local project must never overwrite the configured cloud default");
    assert.match(await page.locator("#workbench-current-provider").textContent(), /AI 工坊/u, "the next generation must continue using the explicit cloud default after a historical project is loaded");
    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    await page.locator("#workbench-clear-key").click();
    await page.waitForFunction(() => !document.querySelector('[data-provider-state="t8star_workshop"]').textContent.includes("session"));
    assert.deepEqual(errors, [], `workbench renderer errors: ${errors.join(" | ")}`);
    console.log(`PASS workbench E2E; templates=${expectedTemplateCount}; providers=4; confirmation=explicit; screenshot=${screenshotPath}; simpleModeScreenshot=${simpleModeScreenshotPath}; musicScreenshot=${musicScreenshotPath}; localSettingsScreenshot=${localSettingsScreenshotPath}`);
  } finally {
    removeExitCleanup();
    await electronApp.close();
    fs.rmSync(e2eUserDataDir, { recursive: true, force: true, maxRetries: 8, retryDelay: 125 });
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
