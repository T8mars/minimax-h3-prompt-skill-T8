const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");
const { loadCatalog } = require("../lib/catalog.cjs");
const { PromptProjectStore } = require("../lib/prompt-projects.cjs");
const { installElectronExitCleanup, launchElectronApplication, setElectronContentSize } = require("./electron-window.cjs");

function smallestPlayableVideo(catalog, mediaRoot) {
  const candidates = catalog.cases.map((item) => item.media?.video?.relativePath).filter(Boolean).map((relativePath) => path.join(mediaRoot, ...relativePath.split("/"))).filter((filePath) => fs.existsSync(filePath)).map((filePath) => ({ filePath, size: fs.statSync(filePath).size })).sort((left, right) => left.size - right.size);
  assert.ok(candidates.length, "creator E2E requires one real packaged source video");
  return candidates[0].filePath;
}

async function setDialogResult(electronApp, filePath) {
  await electronApp.evaluate(({ dialog }, selectedPath) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [selectedPath] });
  }, filePath);
}

const CREATIVE_AI_RESPONSES = [
    { status: "ready", contract: { causalMechanism: "保留主模板的三段证据递进。", secondaryScope: "辅助机制只用于转场。", invariants: ["主因果链不变"], exclusions: ["不得替换主证据"] }, conflicts: [] },
    { status: "ready", suggestionsOnly: true, sourceRevisionId: "", timing: [{ startSeconds: 0, endSeconds: 30, energy: "递进后收束", rhythm: "三段式", soundRole: "证据重音与结尾静默" }], globalDirection: "用三段音乐能量对应三段视频证据。", constraints: ["不覆盖音乐项目"] },
    { status: "ready", suggestionsOnly: true, timing: [{ section: "Intro-Chorus-Outro", startSeconds: 0, endSeconds: 30, visualEnergy: "由低到高后收束", cutGuidance: "只作为剪辑建议" }], globalDirection: "让视觉证据跟随段落升级。", constraints: ["不覆盖镜头画布"] },
    { status: "draft", canonicalWrite: false, evidenceStrength: "low", denominator: 1, suggestedChanges: [{ area: "camera", evidenceCount: 1, suggestion: "根据当前人工复盘，补充一条只修复第二镜头运镜节奏的检查点。", evidence: ["当前项目人工复盘"] }] }
];

async function run() {
  const appDir = path.resolve(__dirname, "..");
  const repoRoot = path.resolve(appDir, "../..");
  const mediaRoot = path.join(repoRoot, ".release-input", "media");
  const catalog = loadCatalog({ catalogRoot: path.join(repoRoot, "catalog"), mediaRoot, skillsRoot: path.join(repoRoot, "skills") });
  const template = catalog.cases.find((item) => item.templateId === "t8-case-earnest-upgrade-displacement-v1") || catalog.cases[0];
  const resultVideoPath = smallestPlayableVideo(catalog, mediaRoot);
  const exportRoot = fs.mkdtempSync(path.join(os.tmpdir(), "t8-creator-e2e-export-"));
  const browserDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), "t8-creator-e2e-browser-"));
  const electronApp = await launchElectronApplication(electron, {
    appDir,
    userDataDir: browserDataRoot,
    env: { T8_E2E_CREATIVE_AI: "1", T8_E2E_CREATIVE_RESPONSES: Buffer.from(JSON.stringify(CREATIVE_AI_RESPONSES), "utf8").toString("base64"), T8STAR_API_KEY: "", SEEDANCE_API_KEY: "", OPENAI_API_KEY: "" }
  });
  const removeExitCleanup = installElectronExitCleanup(electronApp);
  try {
    const page = await electronApp.firstWindow();
    const userDataDir = browserDataRoot;
    let tick = 0;
    const store = new PromptProjectStore({ userDataDir, randomUUID: () => `creator-e2e-${++tick}`, now: () => `2026-08-27T12:00:${String(tick++).padStart(2, "0")}.000Z` });
    const initial = store.save({
      title: "30 秒创作闭环验收",
      topic: "产品广告",
      intent: "同一成年创作者用三段递进证据证明一台虚构相机的便携、稳定和夜拍能力，结尾清楚停留。",
      constraints: "身份、产品外观和因果顺序不变；不要复用来源品牌。",
      templateId: template.templateId || template.skillRef || template.id,
      templateTitle: template.title,
      templateHash: "a".repeat(64),
      templateSnapshot: {
        id: template.id,
        title: template.title,
        summary: template.summary,
        requiredAnchors: template.requiredAnchors || ["结果", "证据", "行动"],
        creativeDna: { ...(template.creativeDna || {}), mechanism: template.creativeDna?.mechanism || "三段证据递进并回收到明确结果", anti_copy_exclusions: ["不得复用来源身份、品牌、服装、台词和逐镜构图"] }
      },
      target: "minimaxH3",
      outputLanguage: "zh-CN",
      durationSeconds: 30,
      rewriteMode: "balanced",
      shots: [
        { shotId: "shot-01", startSeconds: 0, endSeconds: 8, action: "先展示便携结果", camera: "近景跟拍", sceneChange: "普通街道到移动测试", sound: "轻快节拍", stateChange: "建立结果" },
        { shotId: "shot-02", startSeconds: 8, endSeconds: 20, action: "稳定器和夜拍证据依次出现", camera: "环绕后推近", sceneChange: "进入夜景", sound: "两次证据重音", stateChange: "补齐证据" },
        { shotId: "shot-03", startSeconds: 20, endSeconds: 30, action: "回到创作者与成片，最终定格停留", camera: "缓慢拉远并静止", sceneChange: "结果墙完成", sound: "收束后静默", stateChange: "完成行动回收" }
      ],
      continuityLocks: [{ entityId: "creator", type: "character", name: "成年创作者", invariants: "同一面容、年龄、发型和服装主色" }, { entityId: "camera", type: "product", name: "虚构相机", invariants: "机身比例、材质和镜头结构不变" }],
      providerId: "t8star_workshop",
      providerLabel: "AI Workshop",
      endpointHost: "ai.t8star.org",
      model: "e2e-model",
      output: "0–8秒先展示便携结果并跟拍；8–20秒以环绕和推近依次证明稳定与夜拍；20–30秒回到同一创作者与成片墙，音乐收束后静默，最终画面定格停留。",
      validation: { status: "pass", anchorCoverage: 1, shotCoverage: 1, continuityCoverage: 1 },
      media: []
    });
    const revised = store.addRevision(initial.projectId, {
      parentRevisionId: initial.revisions[0].revisionId,
      source: "manual",
      output: "0–8秒以近景钩子展示便携结果；8–20秒用节奏递进的环绕和推近证明稳定与夜拍并加入声音重音；20–30秒回到同一成年创作者与成片墙，音乐停顿后最终定格停留。",
      validation: { status: "pass", anchorCoverage: 1, shotCoverage: 1, continuityCoverage: 1 }
    });
    const accepted = store.setRevisionStatus(revised.projectId, revised.selectedRevisionId, "accepted", "E2E accepted");
    const music = store.save({
      capability: "music3",
      title: "Creator E2E Music",
      musicIdea: "150 BPM，三段递进，结尾静默。",
      fixedBpm: 150,
      providerId: "t8star_workshop",
      providerLabel: "AI Workshop",
      endpointHost: "ai.t8star.org",
      model: "e2e-model",
      outputs: { lyrics: "", musicCaption: "BPM: 150\n[Intro]\n[Chorus]\n[Outro]", music3PayloadJson: "{}", enhancementReportJson: "{}" },
      validation: { status: "pass" }
    });

    await setElectronContentSize(electronApp, page, { width: 1440, height: 900 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length > 0, undefined, { timeout: 30000 });
    await page.locator("#open-prompt-workbench").click();
    await page.waitForSelector("#prompt-workbench-dialog[open]");
    await page.locator('[data-workbench-step="result"]').click();
    await page.locator("#workbench-professional-tools").evaluate((node) => { node.open = true; });
    await page.locator("#workbench-project-list").selectOption(accepted.projectId);
    await page.waitForFunction((projectId) => document.querySelector("#workbench-project-list")?.value === projectId && !document.querySelector("#workbench-import-result")?.disabled, accepted.projectId);

    assert.equal(await page.locator("#workbench-duration").inputValue(), "30");
    assert.equal(await page.locator("#workbench-shot-list .shot-card").count(), 3);
    assert.equal(await page.locator("#workbench-revision-list option").count(), 2);
    assert.equal(await page.locator("#workbench-export-handoff").isEnabled(), true, "accepted revision must enable formal handoff");
    assert.equal(await page.locator("#workbench-export-skill").isEnabled(), true, "accepted revision must enable Skill export");

    await page.locator("#workbench-project-list").selectOption("");
    assert.equal(await page.locator("#workbench-manual-shots").isChecked(), false, "a blank project must disable inherited manual shots");
    assert.equal(await page.locator("#workbench-manual-continuity").isChecked(), false, "a blank project must disable inherited continuity locks");
    assert.equal(await page.locator("#workbench-shot-list .shot-card").count(), 0, "a blank project must discard inherited shot rows");
    assert.equal(await page.locator("#workbench-advanced-settings").evaluate((node) => node.open), false, "a blank project must collapse advanced settings");
    await page.locator("#workbench-project-list").selectOption(accepted.projectId);
    await page.waitForFunction((projectId) => document.querySelector("#workbench-project-list")?.value === projectId && document.querySelectorAll("#workbench-shot-list .shot-card").length === 3, accepted.projectId);

    await page.locator("details.creator-tool").evaluateAll((nodes) => nodes.forEach((node) => { node.open = true; }));
    await page.locator("#workbench-compare-revisions").click();
    await page.waitForFunction(() => document.querySelectorAll("#workbench-comparison-output .comparison-row").length === 2);

    await page.locator("#open-api-settings").click();
    await page.waitForSelector("#api-settings-dialog[open]");
    await page.locator('[data-provider-id="t8star_workshop"]').click();
    await page.locator("#workbench-api-key").fill("e2e-session-key-not-real");
    await page.locator("#workbench-remember-key").uncheck();
    await page.locator("#workbench-save-key").click();
    await page.waitForFunction(() => document.querySelector('[data-provider-state="t8star_workshop"]')?.textContent.includes("session"));
    await page.locator("#done-api-settings").click();
    await page.locator("#api-settings-dialog").waitFor({ state: "hidden" });
    await page.locator('[data-variant-style="director"]').click();
    await page.waitForFunction(() => !document.querySelector("#workbench-preflight-card")?.classList.contains("hidden") || document.querySelector("#workbench-run-status")?.dataset.state === "error");
    assert.equal(await page.locator("#workbench-preflight-card").evaluate((node) => !node.classList.contains("hidden")), true, await page.locator("#workbench-run-status").textContent());
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /variant|导演/iu);
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /1 chat/iu);
    await page.locator('[data-workbench-step="result"]').click();
    await page.locator("#workbench-repair-instructions").fill("只修复第二镜头的运镜节奏，其他内容保持不变。");
    await page.locator("#workbench-preflight-repair").click();
    await page.waitForSelector("#workbench-preflight-card:not(.hidden)");
    assert.match(await page.locator("#workbench-preflight-facts").textContent(), /repair|修复/iu);
    await page.locator('[data-workbench-step="result"]').click();
    await page.locator("details.creator-tool").evaluateAll((nodes) => nodes.forEach((node) => { node.open = true; }));

    await setDialogResult(electronApp, resultVideoPath);
    await page.locator("#workbench-import-result").click();
    await page.waitForFunction(() => {
      const video = document.querySelector("#workbench-result-video");
      return video && !video.hidden && /^t8media:\/\/project\//u.test(video.getAttribute("src") || "");
    });
    const videoState = await page.locator("#workbench-result-video").evaluate(async (video) => {
      if (video.readyState < 1) await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("result video metadata timeout")), 12000);
        video.addEventListener("loadedmetadata", () => { clearTimeout(timeout); resolve(); }, { once: true });
        video.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(video.error?.message || "result video error")); }, { once: true });
      });
      return { duration: video.duration, src: video.getAttribute("src") };
    });
    assert.ok(videoState.duration > 0);
    assert.match(videoState.src, /^t8media:\/\/project\//u);
    await page.locator("#workbench-review-observation-status").selectOption("missing");
    await page.locator("#workbench-review-time").fill("1.5");
    await page.locator("#workbench-review-shot").selectOption("shot-01");
    await page.locator("#workbench-review-note").fill("主体动作在该时间点缺失");
    await page.locator("#workbench-add-observation").click();
    await page.locator("#workbench-save-review").click();
    await page.waitForFunction(() => document.querySelector("#workbench-repair-brief")?.textContent.includes("Only repair"));

    const creatorTools = page.locator("details.creator-tool");
    await creatorTools.evaluateAll((nodes) => nodes.forEach((node) => { node.open = true; }));
    await page.locator("#workbench-compose").click();
    await page.waitForFunction(() => ["ready", "blocked"].includes(document.querySelector("#workbench-composition-status")?.textContent));
    if ((await page.locator("#workbench-composition-status").textContent()) === "blocked") {
      await page.locator("#workbench-composition-resolution").fill("辅助机制只用于一次转场，不改变主因果链和反复制边界。");
      await page.locator("#workbench-compose").click();
      await page.waitForFunction(() => document.querySelector("#workbench-composition-status")?.textContent === "ready");
    }

    await page.locator("#workbench-video-music-bridge").click();
    await page.waitForFunction(() => document.querySelector("#workbench-bridge-output")?.textContent.includes("t8-video-music-bridge/v1"));
    await page.locator("#workbench-apply-music-bridge").click();
    await page.waitForFunction(() => document.querySelector("#prompt-workbench-dialog")?.dataset.capability === "music3" && document.querySelector("#workbench-intent")?.value.includes("Source revision"));
    assert.equal(await page.locator("#workbench-preflight-card").isVisible(), false, "bridge application must not trigger a provider preflight or call");
    await page.locator("#workbench-capability-video").click();
    await page.locator('[data-workbench-step="result"]').click();
    await page.waitForFunction((projectId) => [...document.querySelector("#workbench-project-list")?.options || []].some((option) => option.value === projectId), accepted.projectId);
    await page.locator("#workbench-project-list").selectOption(accepted.projectId);
    await page.waitForFunction(({ projectId, title }) => document.querySelector("#workbench-project-list")?.value === projectId
      && document.querySelector("#workbench-project-name")?.value === title
      && document.querySelectorAll("#workbench-revision-list option").length >= 2
      && !document.querySelector("#workbench-export-handoff")?.disabled, { projectId: accepted.projectId, title: accepted.title });
    await page.locator("#workbench-professional-tools").evaluate((node) => { node.open = true; });
    await page.locator("details.creator-tool").evaluateAll((nodes) => nodes.forEach((node) => { node.open = true; }));
    await page.locator("#workbench-music-project").selectOption(music.projectId);
    await page.locator("#workbench-music-video-bridge").click();
    await page.waitForFunction(() => document.querySelector("#workbench-bridge-output")?.textContent.includes("t8-music-video-bridge/v1"));
    const persistedBridges = await page.evaluate((projectId) => window.promptLibrary.promptProject(projectId).then((project) => project.bridges), accepted.projectId);
    assert.equal(persistedBridges.length, 2);
    assert.equal(persistedBridges.some((item) => item.schemaVersion === "t8-music-video-bridge/v1" && item.overwriteShots === false), true);

    await setDialogResult(electronApp, exportRoot);
    await page.locator("#workbench-export-handoff").click();
    await page.waitForFunction(() => document.querySelector("#workbench-run-status-message")?.textContent.includes("ComfyUI"));
    await setDialogResult(electronApp, exportRoot);
    await page.locator("#workbench-export-skill").click();
    await page.waitForFunction(() => document.querySelector("#workbench-run-status-message")?.textContent.includes("Skill"));
    const exportDirectories = fs.readdirSync(exportRoot, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => path.join(exportRoot, item.name));
    assert.equal(exportDirectories.length, 2, "handoff and personal Skill must use separate directories");
    const exportedNames = exportDirectories.flatMap((directory) => fs.readdirSync(directory, { recursive: true }).map(String));
    for (const required of ["prompt.md", "creative-plan.json", "media-roles.json", "comfyui-adapter.json", "SKILL.md", "transfer-tests.md", "minimax-h3.md", "seedance-2.0.md"]) assert.equal(exportedNames.some((name) => name.endsWith(required)), true, `missing exported ${required}`);

    await page.locator("#workbench-rating").selectOption("5");
    await page.locator("#workbench-save-rating").click();
    await page.locator("#workbench-template-proposal").click();
    await page.waitForFunction(() => document.querySelector("#workbench-effects-output")?.textContent.includes("canonicalWrite=false"));
    assert.deepEqual(errors, [], `creator-loop renderer errors: ${errors.join(" | ")}`);
    console.log(`PASS creator-loop E2E; duration=30; revisions=2; blank-reset=verified; result-video=range-streamed; bridges=2; isolated-exports=2; output=${exportRoot}`);
  } finally {
    removeExitCleanup();
    await electronApp.close();
    fs.rmSync(browserDataRoot, { recursive: true, force: true });
    fs.rmSync(exportRoot, { recursive: true, force: true });
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
