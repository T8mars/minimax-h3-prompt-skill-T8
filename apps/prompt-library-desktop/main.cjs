const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { fileURLToPath } = require("node:url");
const {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  nativeImage,
  protocol,
  safeStorage,
  session,
  shell
} = require("electron");
const { autoUpdater } = require("electron-updater");
const { loadCatalog, safeResolve } = require("./lib/catalog.cjs");
const { allowedExternalUrl } = require("./lib/security.cjs");
const { automaticUpdateDelay } = require("./lib/update-policy.cjs");
const { createFileResponse } = require("./lib/media-response.cjs");
const { CredentialVault } = require("./lib/credential-vault.cjs");
const { PromptOrchestrator } = require("./lib/prompt-orchestrator.cjs");
const { Music3Orchestrator } = require("./lib/music3-orchestrator.cjs");
const { CreativeIntelligence } = require("./lib/creative-intelligence.cjs");
const { validateTemplateIndex } = require("./lib/template-index.cjs");
const { normalizeCreativePlan } = require("./lib/creative-plan.cjs");
const { PromptMediaStore } = require("./lib/prompt-media.cjs");
const { PromptProjectStore } = require("./lib/prompt-projects.cjs");
const { ProjectMediaStore } = require("./lib/project-media.cjs");
const {
  buildVariantRequest,
  compareRevisions,
  musicToVideoFacts,
  normalizeReview,
  videoToMusicFacts
} = require("./lib/creative-loop.cjs");
const { exportHandoff, exportPersonalSkill } = require("./lib/creative-artifacts.cjs");
const { LocalQwenConfigStore } = require("./lib/local-qwen-config.cjs");
const { LocalQwenManager } = require("./lib/local-qwen-runtime.cjs");
const { resolveMediaRoot } = require("./lib/media-roots.cjs");
const { configurePortableMode } = require("./lib/portable-mode.cjs");
const RELEASES_URL = "https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "t8media",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true
    }
  }
]);

const APP_DIR = __dirname;
const REPO_ROOT = path.resolve(APP_DIR, "../..");
const RENDERER_PATH = path.join(APP_DIR, "src", "index.html");
const portableMode = configurePortableMode({
  app,
  env: process.env,
  platform: process.platform,
  isPackaged: app.isPackaged,
  executablePath: process.execPath
});
let mainWindow = null;
let assetRoots = null;
let updateStatus = portableMode.enabled
  ? { state: "manual", message: "便携版通过 Releases 页面手动更新" }
  : { state: "idle" };
let updateInFlight = false;
let promptOrchestrator = null;
let music3Orchestrator = null;
let creativeIntelligence = null;
let promptProjectStore = null;
let projectMediaStore = null;
let localQwen = null;

function loadVerifiedTemplateIndex() {
  const catalog = loadCatalog(assetRoots);
  const indexPath = path.join(assetRoots.catalogRoot, "template-index.json");
  if (!fs.existsSync(indexPath)) throw new Error("统一模板总索引缺失，请重新安装或重建目录。");
  let index;
  try { index = JSON.parse(fs.readFileSync(indexPath, "utf8")); }
  catch { throw new Error("统一模板总索引无法读取，请重新安装或重建目录。"); }
  const validation = validateTemplateIndex(index, catalog);
  if (validation.status !== "pass") throw new Error(`统一模板总索引已过期：${validation.failures.join("；")}`);
  return { catalog, index };
}

function intelligenceConfig(input = {}) {
  return {
    providerId: input.providerId,
    model: input.model,
    baseUrl: input.baseUrl,
    locale: input.locale,
    confirmed: input.confirmed === true
  };
}

function e2eCreativeFetchFromEnvironment(env = process.env) {
  if (env.T8_E2E_CREATIVE_AI !== "1") return null;
  let queue;
  try {
    queue = JSON.parse(Buffer.from(String(env.T8_E2E_CREATIVE_RESPONSES || ""), "base64").toString("utf8"));
  } catch {
    throw new Error("Invalid E2E creative AI response fixture.");
  }
  if (!Array.isArray(queue) || !queue.length) throw new Error("E2E creative AI response fixture is empty.");
  return async () => {
    if (!queue.length) throw new Error("Unexpected extra E2E creative AI request.");
    const content = JSON.stringify(queue.shift());
    return new Response(JSON.stringify({ id: "e2e-ai", choices: [{ message: { content } }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
}

function hashBridge(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex");
}

function projectIntelligenceSnapshot(project, revisionId = "") {
  const revision = (project?.revisions || []).find((item) => item.revisionId === revisionId)
    || (project?.revisions || []).find((item) => item.revisionId === project?.selectedRevisionId)
    || project?.revisions?.[0]
    || null;
  return {
    projectId: project?.projectId,
    capability: project?.capability,
    intent: project?.intent || project?.musicIdea || "",
    constraints: project?.constraints || {},
    target: project?.target,
    outputLanguage: project?.outputLanguage,
    durationSeconds: project?.durationSeconds,
    template: project?.templateSnapshot || project?.template || null,
    creativePlan: project?.creativePlan || null,
    selectedRevision: revision ? { revisionId: revision.revisionId, output: String(revision.output || "").slice(0, 80000), validation: revision.validation || null } : null,
    resultReview: project?.resultReview || null,
    musicResult: project?.outputs || project?.result || project?.output || null
  };
}

async function convertLocalReferenceImage(filePath, { sourceBytes, signal } = {}) {
  if (signal?.aborted) throw signal.reason || new Error("cancelled");
  let image = Buffer.isBuffer(sourceBytes) ? nativeImage.createFromBuffer(sourceBytes) : nativeImage.createFromPath(filePath);
  if (image.isEmpty()) throw new Error("Reference image could not be decoded.");
  const size = image.getSize();
  const longest = Math.max(size.width, size.height);
  if (longest > 1024) {
    const scale = 1024 / longest;
    image = image.resize({
      width: Math.max(1, Math.round(size.width * scale)),
      height: Math.max(1, Math.round(size.height * scale)),
      quality: "good"
    });
  }
  return { bytes: image.toJPEG(86), mimeType: "image/jpeg" };
}

function resolveRoots() {
  const catalogRoot = app.isPackaged
    ? path.join(process.resourcesPath, "catalog")
    : path.join(REPO_ROOT, "catalog");
  const skillsRoot = app.isPackaged
    ? path.join(process.resourcesPath, "skills")
    : path.join(REPO_ROOT, "skills");

  const mediaRoot = resolveMediaRoot({
    env: process.env,
    executablePath: process.execPath,
    isPackaged: app.isPackaged,
    repoRoot: REPO_ROOT,
    resourcesPath: process.resourcesPath,
    userDataDir: app.getPath("userData")
  });
  return { catalogRoot, mediaRoot, skillsRoot };
}

function trustedSender(event) {
  try {
    const senderUrl = new URL(event.senderFrame.url);
    return senderUrl.protocol === "file:" && path.resolve(fileURLToPath(senderUrl)) === path.resolve(RENDERER_PATH);
  } catch {
    return false;
  }
}

function requireTrustedSender(event) {
  if (!trustedSender(event)) throw new Error("Untrusted renderer request");
}

function assetUrl(asset) {
  if (!asset || !["catalog", "media"].includes(asset.scope)) return null;
  const encoded = asset.relativePath.split("/").map(encodeURIComponent).join("/");
  return `t8media://${asset.scope}/${encoded}`;
}

function serializeCatalog(catalog) {
  const serializeMediaItem = (item) => ({
    ...item,
    media: {
      gifUrl: assetUrl(item.media.gif),
      posterUrl: assetUrl(item.media.poster),
      videoUrl: assetUrl(item.media.video),
      hasFullVideo: item.media.hasFullVideo,
      previewKind: item.media.previewKind || "source_preview",
      previewStatus: item.media.previewStatus || {}
    }
  });
  return {
    schemaVersion: catalog.schemaVersion,
    catalogVersion: catalog.catalogVersion,
    generatedAt: catalog.generatedAt,
    warnings: catalog.warnings,
    officialSkills: catalog.officialSkills.map(serializeMediaItem),
    communitySkills: catalog.communitySkills.map(serializeMediaItem),
    cases: catalog.cases.map(serializeMediaItem)
  };
}

function requireVideoProject(projectId) {
  const project = promptProjectStore.get(projectId);
  if (!project || project.capability === "music3") throw new Error("Video prompt project not found.");
  return project;
}

function requireProjectRevision(project, revisionId) {
  const revision = (project.revisions || []).find((item) => item.revisionId === String(revisionId || ""));
  if (!revision) throw new Error("Project revision not found.");
  return revision;
}

function operationPlanInput(project, request, operation) {
  const planInput = request?.planInput && typeof request.planInput === "object" ? request.planInput : {};
  const creativePlan = project.creativePlan || {};
  const frozenTemplate = project.templateSnapshot || planInput.template;
  const template = project.composition?.status === "ready" && project.composition?.contract
    ? { ...frozenTemplate, creativeDna: { ...(frozenTemplate?.creativeDna || {}), mechanismComposition: project.composition.contract } }
    : frozenTemplate;
  return {
    providerId: planInput.providerId,
    baseUrl: planInput.baseUrl,
    model: planInput.model,
    target: project.target,
    outputLanguage: project.outputLanguage,
    durationSeconds: project.durationSeconds,
    rewriteMode: planInput.rewriteMode || project.rewriteMode,
    intent: project.intent,
    constraints: project.constraints,
    template,
    shots: creativePlan.shots || [],
    mediaAssignments: creativePlan.mediaAssignments || [],
    continuityLocks: creativePlan.continuityLocks || [],
    operation
  };
}

function projectForRenderer(project) {
  if (!project) return null;
  return {
    ...project,
    resultMedia: (project.resultMedia || []).map((item) => ({
      ...item,
      playbackUrl: `t8media://project/${encodeURIComponent(project.projectId)}/${encodeURIComponent(item.mediaId)}`
    }))
  };
}

function sendUpdateStatus(next) {
  updateStatus = { ...updateStatus, ...next };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater:status", updateStatus);
  }
}

function configureUpdater() {
  if (process.platform === "darwin" || portableMode.enabled) return;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on("checking-for-update", () => sendUpdateStatus({ state: "checking", message: "正在检查更新…" }));
  autoUpdater.on("update-not-available", () => {
    updateInFlight = false;
    sendUpdateStatus({ state: "current", message: "当前已是最新版本" });
  });
  autoUpdater.on("update-available", async (info) => {
    sendUpdateStatus({ state: "available", message: `发现 v${info.version}，准备下载…`, version: info.version });
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      updateInFlight = false;
      sendUpdateStatus({ state: "error", error: error.message });
    }
  });
  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus({
      state: "downloading",
      message: `正在下载更新 ${Math.round(progress.percent)}%`,
      percent: Math.round(progress.percent)
    });
  });
  autoUpdater.on("update-downloaded", (info) => {
    updateInFlight = false;
    sendUpdateStatus({ state: "downloaded", message: `v${info.version} 已下载，可重启安装`, version: info.version });
  });
  autoUpdater.on("error", (error) => {
    updateInFlight = false;
    sendUpdateStatus({ state: "error", error: error.message });
  });
}

function scheduleAutomaticUpdateCheck() {
  if (portableMode.enabled) return;
  const delay = automaticUpdateDelay({ isPackaged: app.isPackaged, platform: process.platform, env: process.env });
  if (delay === null) return;
  setTimeout(async () => {
    if (updateInFlight) return;
    updateInFlight = true;
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      updateInFlight = false;
      sendUpdateStatus({ state: "error", error: error.message });
    }
  }, delay).unref();
}

function configureIpc() {
  ipcMain.handle("catalog:load", (event) => {
    requireTrustedSender(event);
    const catalog = loadCatalog(assetRoots);
    return serializeCatalog(catalog);
  });

  ipcMain.handle("external:open", async (event, value) => {
    requireTrustedSender(event);
    const url = allowedExternalUrl(value);
    if (!url) throw new Error("This HTTPS source host is not allowlisted");
    await shell.openExternal(url.toString(), { activate: true });
    return true;
  });

  ipcMain.handle("clipboard:write", (event, value) => {
    requireTrustedSender(event);
    if (typeof value !== "string" || !value.trim() || value.length > 100000) {
      throw new Error("Invalid clipboard content");
    }
    clipboard.writeText(value);
    return true;
  });

  ipcMain.handle("prompt:providers", (event) => {
    requireTrustedSender(event);
    return promptOrchestrator.providerStatuses();
  });

  ipcMain.handle("prompt:credential:set", (event, input) => {
    requireTrustedSender(event);
    return promptOrchestrator.setCredential(input || {});
  });

  ipcMain.handle("prompt:credential:clear", (event, providerId) => {
    requireTrustedSender(event);
    return promptOrchestrator.clearCredential(providerId);
  });

  ipcMain.handle("prompt:local:status", (event) => {
    requireTrustedSender(event);
    return localQwen.status();
  });

  ipcMain.handle("prompt:local:configure", (event, input) => {
    requireTrustedSender(event);
    const source = input && typeof input === "object" ? input : {};
    const allowed = {};
    for (const key of ["modelFilename", "projectorFilename", "contextSize", "maxTokens", "thinkMode", "reasoningEffort", "videoSampleFps", "unloadPolicy", "cpuThreads"]) {
      if (Object.hasOwn(source, key)) allowed[key] = source[key];
    }
    return localQwen.setConfig(allowed);
  });

  ipcMain.handle("prompt:local:verify", async (event) => {
    requireTrustedSender(event);
    return localQwen.verify();
  });

  ipcMain.handle("prompt:local:release", async (event) => {
    requireTrustedSender(event);
    await localQwen.stop();
    return localQwen.status();
  });

  ipcMain.handle("prompt:local:rescan", (event) => {
    requireTrustedSender(event);
    return localQwen.status();
  });

  ipcMain.handle("prompt:local:pick-model-directory", async (event) => {
    requireTrustedSender(event);
    const result = await dialog.showOpenDialog(mainWindow, { title: "Choose a GGUF model root (for example ComfyUI/models/LLM)", properties: ["openDirectory"] });
    if (result.canceled || !result.filePaths[0]) return localQwen.status();
    return localQwen.setConfig({ modelDirectory: result.filePaths[0] });
  });

  ipcMain.handle("prompt:local:pick-runtime", async (event) => {
    requireTrustedSender(event);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Choose llama-server executable",
      properties: ["openFile"],
      filters: process.platform === "win32" ? [{ name: "llama-server", extensions: ["exe"] }] : []
    });
    if (result.canceled || !result.filePaths[0]) return localQwen.status();
    return localQwen.setConfig({ runtimeExecutable: result.filePaths[0] });
  });

  ipcMain.handle("prompt:local:pick-ffmpeg", async (event) => {
    requireTrustedSender(event);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Choose FFmpeg executable for local video sampling",
      properties: ["openFile"],
      filters: process.platform === "win32" ? [{ name: "FFmpeg", extensions: ["exe"] }] : []
    });
    if (result.canceled || !result.filePaths[0]) return localQwen.status();
    return localQwen.setConfig({ ffmpegExecutable: result.filePaths[0] });
  });

  ipcMain.handle("prompt:preflight", (event, input) => {
    requireTrustedSender(event);
    return promptOrchestrator.preflight(input || {});
  });

  ipcMain.handle("prompt:validate", (event, input) => {
    requireTrustedSender(event);
    return promptOrchestrator.validateOutput(input || {});
  });
  ipcMain.handle("music3:preflight", (event, input) => {
    requireTrustedSender(event);
    return music3Orchestrator.preflight(input || {});
  });

  ipcMain.handle("music3:start", (event, input) => {
    requireTrustedSender(event);
    return music3Orchestrator.start(input || {});
  });

  ipcMain.handle("music3:status", (event, runId) => {
    requireTrustedSender(event);
    return music3Orchestrator.status(runId);
  });

  ipcMain.handle("music3:cancel", (event, runId) => {
    requireTrustedSender(event);
    return music3Orchestrator.cancel(runId);
  });

  ipcMain.handle("prompt:media:pick", async (event) => {
    requireTrustedSender(event);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Choose reference images or videos",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Reference media", extensions: ["png", "jpg", "jpeg", "webp", "mp4", "mov", "webm", "mkv", "avi"] }]
    });
    if (result.canceled) return promptOrchestrator.mediaList();
    promptOrchestrator.addMediaPaths(result.filePaths);
    return promptOrchestrator.mediaList();
  });

  ipcMain.handle("prompt:media:list", (event) => {
    requireTrustedSender(event);
    return promptOrchestrator.mediaList();
  });

  ipcMain.handle("prompt:media:clear", (event) => {
    requireTrustedSender(event);
    return promptOrchestrator.clearMedia();
  });

  ipcMain.handle("prompt:project:list", (event) => {
    requireTrustedSender(event);
    return promptProjectStore.list();
  });

  ipcMain.handle("prompt:project:get", (event, projectId) => {
    requireTrustedSender(event);
    return projectForRenderer(promptProjectStore.get(projectId));
  });

  ipcMain.handle("prompt:project:save", (event, input) => {
    requireTrustedSender(event);
    const request = input || {};
    const runner = request.capability === "music3" ? music3Orchestrator : promptOrchestrator;
    const base = request.runId ? runner.projectSnapshot(request.runId) : promptProjectStore.get(request.projectId);
    if (!base) throw new Error("Prompt project not found.");
    return projectForRenderer(promptProjectStore.save({ ...base, projectId: request.projectId || undefined, title: request.title || base.title, topic: request.topic || base.topic, notes: request.notes ?? base.notes }));
  });

  ipcMain.handle("prompt:project:revision:add", (event, input) => {
    requireTrustedSender(event);
    const request = input && typeof input === "object" ? input : {};
    return projectForRenderer(promptProjectStore.addRevision(request.projectId, {
      parentRevisionId: request.parentRevisionId,
      source: request.source,
      output: request.output,
      validation: request.validation,
      note: request.note,
      variant: request.variant
    }));
  });

  ipcMain.handle("prompt:project:revision:status", (event, input) => {
    requireTrustedSender(event);
    const request = input && typeof input === "object" ? input : {};
    return projectForRenderer(promptProjectStore.setRevisionStatus(request.projectId, request.revisionId, request.status, request.note));
  });

  ipcMain.handle("prompt:repair:preflight", (event, input) => {
    requireTrustedSender(event);
    const request = input && typeof input === "object" ? input : {};
    const project = requireVideoProject(request.projectId);
    const revision = requireProjectRevision(project, request.revisionId);
    const rootRevisionId = revision.rootRevisionId || revision.revisionId;
    if (!promptProjectStore.canRepair(project.projectId, rootRevisionId)) throw new Error("This initial revision already used its one allowed repair.");
    const operation = {
      kind: "repair",
      projectId: project.projectId,
      sourceRevisionId: revision.revisionId,
      rootRevisionId,
      sourceOutput: revision.output,
      sourceOutputSha256: revision.outputSha256,
      instructions: String(request.instructions || project.resultReview?.repairBrief || "").trim()
    };
    return promptOrchestrator.preflight(operationPlanInput(project, request, operation), { frozenMedia: project.media || [] });
  });

  ipcMain.handle("prompt:variant:preflight", (event, input) => {
    requireTrustedSender(event);
    const request = input && typeof input === "object" ? input : {};
    const project = requireVideoProject(request.projectId);
    const revision = requireProjectRevision(project, request.revisionId);
    const frozen = { ...project, selectedRevisionId: revision.revisionId };
    const variant = buildVariantRequest(frozen, request.style);
    const operation = { kind: "variant", projectId: project.projectId, rootRevisionId: revision.rootRevisionId || revision.revisionId, ...variant };
    return promptOrchestrator.preflight(operationPlanInput(project, request, operation), { frozenMedia: project.media || [] });
  });

  ipcMain.handle("prompt:operation:commit", (event, input) => {
    requireTrustedSender(event);
    const request = input && typeof input === "object" ? input : {};
    const project = requireVideoProject(request.projectId);
    const snapshot = promptOrchestrator.projectSnapshot(request.runId);
    const operation = snapshot.operation || {};
    if (!operation.projectId || operation.projectId !== project.projectId) throw new Error("Operation run does not belong to this project.");
    if (!["repair", "variant"].includes(operation.kind)) throw new Error("Only repair or variant runs can be committed as an operation revision.");
    const parent = requireProjectRevision(project, operation.sourceRevisionId);
    return projectForRenderer(promptProjectStore.addRevision(project.projectId, {
      parentRevisionId: parent.revisionId,
      rootRevisionId: operation.rootRevisionId || parent.rootRevisionId || parent.revisionId,
      repairOfRevisionId: operation.kind === "repair" ? parent.revisionId : null,
      source: operation.kind,
      output: snapshot.output,
      validation: snapshot.validation,
      note: operation.kind === "repair" ? operation.instructions : operation.instruction,
      variant: operation.kind === "variant" ? { label: operation.style, axis: (operation.axes || []).join(", ") } : null
    }));
  });

  ipcMain.handle("prompt:revision:compare", (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    return compareRevisions(project, input?.revisionIds || []);
  });

  ipcMain.handle("prompt:mechanism:compose", async (event, input) => {
    requireTrustedSender(event);
    const execution = await creativeIntelligence.execute({
      operation: "compose_mechanisms",
      ...intelligenceConfig(input),
      input: { primary: input?.primary, secondary: input?.secondary, resolution: input?.resolution || {} }
    });
    return {
      ...execution.result,
      schemaVersion: "t8-mechanism-composition/v2",
      primaryTemplateId: input?.primary?.templateId || input?.primary?.id || null,
      secondaryTemplateId: input?.secondary?.templateId || input?.secondary?.id || null,
      intelligence: { providerId: execution.providerId, providerLabel: execution.providerLabel, model: execution.model, modelCallCount: execution.modelCallCount, resultSha256: execution.resultSha256 }
    };
  });

  ipcMain.handle("prompt:shot-plan:generate", async (event, input) => {
    requireTrustedSender(event);
    const execution = await creativeIntelligence.execute({
      operation: "create_shot_plan",
      ...intelligenceConfig(input),
      input: input?.input || {}
    });
    const request = input?.input || {};
    const plan = normalizeCreativePlan({
      durationSeconds: request.durationSeconds,
      intent: request.intent,
      media: request.media || [],
      shots: execution.result.shots,
      continuityLocks: execution.result.continuityLocks || [],
      mediaAssignments: execution.result.mediaAssignments || [],
      allowLegacyFallback: false
    });
    if (plan.validation.status === "fail") throw new Error(plan.validation.errors.map((item) => item.message).join(" "));
    return { ...plan, intelligence: { providerId: execution.providerId, providerLabel: execution.providerLabel, model: execution.model, modelCallCount: execution.modelCallCount, resultSha256: execution.resultSha256 } };
  });

  ipcMain.handle("prompt:mechanism:save", (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    if (input?.composition?.status !== "ready" || !input?.composition?.contract) throw new Error("Only a conflict-resolved mechanism composition can be saved.");
    return projectForRenderer(promptProjectStore.save({ ...project, composition: input.composition }));
  });

  ipcMain.handle("prompt:review:import", async (event, projectId) => {
    requireTrustedSender(event);
    const project = requireVideoProject(projectId);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Import generated result video",
      properties: ["openFile"],
      filters: [{ name: "Generated video", extensions: ["mp4", "mov", "webm", "mkv", "avi"] }]
    });
    if (result.canceled || !result.filePaths[0]) return projectForRenderer(project);
    const descriptor = projectMediaStore.importResult(project.projectId, result.filePaths[0]);
    const saved = promptProjectStore.save({ ...project, resultMedia: [descriptor, ...(project.resultMedia || []).filter((item) => item.mediaId !== descriptor.mediaId)], stage: "review" });
    return projectForRenderer(saved);
  });

  ipcMain.handle("prompt:review:save", (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    const mediaId = String(input?.mediaId || project.resultMedia?.[0]?.mediaId || "");
    if (!(project.resultMedia || []).some((item) => item.mediaId === mediaId)) throw new Error("Imported result video not found.");
    const review = normalizeReview({ durationSeconds: project.durationSeconds, shots: project.creativePlan?.shots || [], mediaId, observations: input?.observations || [] });
    return projectForRenderer(promptProjectStore.saveReview(project.projectId, { resultMedia: project.resultMedia, review }));
  });

  ipcMain.handle("prompt:rating:save", (event, input) => {
    requireTrustedSender(event);
    return projectForRenderer(promptProjectStore.saveRating(input?.projectId, input?.revisionId, input?.rating || {}));
  });

  ipcMain.handle("prompt:project:stage", (event, input) => {
    requireTrustedSender(event);
    return projectForRenderer(promptProjectStore.setStage(input?.projectId, input?.stage));
  });

  ipcMain.handle("prompt:bridge:video-to-music", async (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    const exactFacts = videoToMusicFacts(project, input?.revisionId);
    const execution = await creativeIntelligence.execute({
      operation: "video_to_music",
      ...intelligenceConfig(input),
      input: { project: projectIntelligenceSnapshot(project, input?.revisionId), exactFacts }
    });
    const bridgePayload = { ...execution.result, ...exactFacts, schemaVersion: "t8-video-music-bridge/v1", sourceRevisionId: exactFacts.sourceRevisionId, suggestionsOnly: true, intelligence: { providerId: execution.providerId, providerLabel: execution.providerLabel, model: execution.model, modelCallCount: execution.modelCallCount, resultSha256: execution.resultSha256 } };
    const bridge = { ...bridgePayload, bridgeHash: hashBridge(bridgePayload) };
    promptProjectStore.saveBridge(project.projectId, bridge);
    return bridge;
  });

  ipcMain.handle("prompt:bridge:music-to-video", async (event, input) => {
    requireTrustedSender(event);
    const musicProject = promptProjectStore.get(input?.musicProjectId);
    if (!musicProject || musicProject.capability !== "music3") throw new Error("Music 3 project not found.");
    const videoProject = requireVideoProject(input?.videoProjectId);
    const exactFacts = musicToVideoFacts(musicProject);
    const execution = await creativeIntelligence.execute({
      operation: "music_to_video",
      ...intelligenceConfig(input),
      input: { exactFacts, musicProject: projectIntelligenceSnapshot(musicProject), videoProject: projectIntelligenceSnapshot(videoProject) }
    });
    const bridgePayload = { ...execution.result, ...exactFacts, schemaVersion: "t8-music-video-bridge/v1", sourceMusicProjectId: musicProject.projectId, suggestionsOnly: true, overwriteShots: false, intelligence: { providerId: execution.providerId, providerLabel: execution.providerLabel, model: execution.model, modelCallCount: execution.modelCallCount, resultSha256: execution.resultSha256 } };
    const bridge = { ...bridgePayload, bridgeHash: hashBridge(bridgePayload) };
    promptProjectStore.saveBridge(videoProject.projectId, bridge);
    return bridge;
  });

  ipcMain.handle("prompt:board", (event, filters) => {
    requireTrustedSender(event);
    return promptProjectStore.board(filters || {});
  });

  ipcMain.handle("prompt:effects", (event, filters) => {
    requireTrustedSender(event);
    return promptProjectStore.effectStats(filters || {});
  });

  ipcMain.handle("prompt:template:proposal", async (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    const record = promptProjectStore.effectStats().find((item) => item.templateHash === project.template.hash && item.target === project.target && item.durationSeconds === project.durationSeconds && item.providerId === project.provider.id) || null;
    const execution = await creativeIntelligence.execute({
      operation: "template_proposal",
      ...intelligenceConfig(input),
      input: { project: projectIntelligenceSnapshot(project), effectRecord: record }
    });
    return {
      ...execution.result,
      schemaVersion: "t8-template-improvement-proposal/v1",
      status: "draft",
      canonicalWrite: false,
      publicCatalogWrite: false,
      sourceTemplateId: project.template.id,
      sourceTemplateHash: project.template.hash,
      denominator: Number(record?.denominator || record?.total || execution.result.denominator || 0),
      intelligence: { providerId: execution.providerId, providerLabel: execution.providerLabel, model: execution.model, modelCallCount: execution.modelCallCount, resultSha256: execution.resultSha256 }
    };
  });

  ipcMain.handle("prompt:handoff:export", async (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    const result = await dialog.showOpenDialog(mainWindow, { title: "Choose parent directory for isolated ComfyUI handoff", properties: ["openDirectory", "createDirectory"] });
    if (result.canceled || !result.filePaths[0]) return { saved: false };
    const exported = exportHandoff({ project, revisionId: input?.revisionId, parentDirectory: result.filePaths[0] });
    return { saved: true, directoryName: exported.directoryName, files: exported.files };
  });

  ipcMain.handle("prompt:skill:export", async (event, input) => {
    requireTrustedSender(event);
    const project = requireVideoProject(input?.projectId);
    const result = await dialog.showOpenDialog(mainWindow, { title: "Choose parent directory for personal Skill draft", properties: ["openDirectory", "createDirectory"] });
    if (result.canceled || !result.filePaths[0]) return { saved: false };
    const exported = exportPersonalSkill({ project, revisionId: input?.revisionId, parentDirectory: result.filePaths[0] });
    return { saved: true, directoryName: exported.directoryName, files: exported.files, validation: exported.validation };
  });

  ipcMain.handle("prompt:router", async (event, input) => {
    requireTrustedSender(event);
    const { index } = loadVerifiedTemplateIndex();
    return creativeIntelligence.execute({
      operation: "recommend_templates",
      ...intelligenceConfig(input),
      input: { intent: input?.intent, durationSeconds: input?.durationSeconds },
      templateIndex: index
    });
  });

  ipcMain.handle("prompt:project:delete", (event, projectId) => {
    requireTrustedSender(event);
    const project = promptProjectStore.get(projectId);
    const result = promptProjectStore.remove(projectId);
    if (project) {
      try { projectMediaStore.removeProject(project.projectId); }
      catch { /* Project deletion remains successful if its optional copied result media was already absent. */ }
    }
    return result;
  });

  ipcMain.handle("prompt:project:export", async (event, projectId) => {
    requireTrustedSender(event);
    const project = promptProjectStore.get(projectId);
    const bundle = promptProjectStore.exportBundle(project);
    const result = await dialog.showOpenDialog(mainWindow, { title: "Export T8 prompt project", properties: ["openDirectory", "createDirectory"] });
    if (result.canceled || !result.filePaths[0]) return { saved: false };
    const directory = result.filePaths[0];
    fs.writeFileSync(path.join(directory, bundle.filename + ".json"), bundle.json, "utf8");
    fs.writeFileSync(path.join(directory, bundle.filename + ".md"), bundle.markdown, "utf8");
    return { saved: true, filenames: [bundle.filename + ".json", bundle.filename + ".md"] };
  });

  ipcMain.handle("prompt:start", (event, input) => {
    requireTrustedSender(event);
    return promptOrchestrator.start(input || {});
  });

  ipcMain.handle("prompt:status", (event, runId) => {
    requireTrustedSender(event);
    return promptOrchestrator.status(runId);
  });

  ipcMain.handle("prompt:cancel", (event, runId) => {
    requireTrustedSender(event);
    return promptOrchestrator.cancel(runId);
  });

  ipcMain.handle("updater:check", async (event) => {
    requireTrustedSender(event);
    if (portableMode.enabled && app.isPackaged) {
      const manual = { state: "manual", message: "便携版请从 Releases 页面手动下载新版" };
      sendUpdateStatus(manual);
      await shell.openExternal(RELEASES_URL, { activate: true });
      return manual;
    }
    if (process.platform === "darwin" && app.isPackaged) {
      const manual = { state: "manual", message: "Unsigned macOS builds update through the Releases page." };
      sendUpdateStatus(manual);
      await shell.openExternal(RELEASES_URL, { activate: true });
      return manual;
    }
    if (!app.isPackaged) {
      const development = { state: "development", message: "开发模式不触发自动更新" };
      sendUpdateStatus(development);
      return development;
    }
    if (updateInFlight) return updateStatus;
    updateInFlight = true;
    await autoUpdater.checkForUpdates();
    return updateStatus;
  });

  ipcMain.handle("updater:install", (event) => {
    requireTrustedSender(event);
    if (process.platform === "darwin" || portableMode.enabled) return false;
    if (!app.isPackaged || updateStatus.state !== "downloaded") return false;
    setImmediate(() => autoUpdater.quitAndInstall(false, true));
    return true;
  });
}

function writePortableSmokeReport() {
  if (process.env.T8_PORTABLE_SMOKE !== "1" || process.env.CI !== "true" || !portableMode.enabled) return false;
  const outputPath = path.join(portableMode.userDataDir, "portable-smoke.json");
  const report = {
    enabled: portableMode.enabled,
    executableDirectory: portableMode.executableDirectory,
    userDataDir: app.getPath("userData"),
    sessionDataDir: app.getPath("sessionData"),
    version: app.getVersion()
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return true;
}

function configureMediaProtocol() {
  protocol.handle("t8media", (request) => {
    try {
      const requestUrl = new URL(request.url);
      const scope = requestUrl.hostname;
      if (scope === "project") {
        const segments = requestUrl.pathname.replace(/^\/+/, "").split("/").map(decodeURIComponent);
        if (segments.length !== 2) return new Response("Not found", { status: 404 });
        const target = projectMediaStore?.resolve(segments[0], segments[1]);
        return target ? createFileResponse(target, request) : new Response("Not found", { status: 404 });
      }
      const root = scope === "catalog" ? assetRoots.catalogRoot : scope === "media" ? assetRoots.mediaRoot : null;
      if (!root) return new Response("Not found", { status: 404 });
      const relative = decodeURIComponent(requestUrl.pathname.replace(/^\/+/, ""));
      const target = safeResolve(root, relative);
      if (!target || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
        return new Response("Not found", { status: 404 });
      }
      const canonicalRoot = fs.realpathSync(root);
      const canonicalTarget = fs.realpathSync(target);
      const canonicalRelative = path.relative(canonicalRoot, canonicalTarget);
      if (!canonicalRelative || canonicalRelative === ".." || canonicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(canonicalRelative)) {
        return new Response("Not found", { status: 404 });
      }
      return createFileResponse(canonicalTarget, request);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 980,
    minHeight: 680,
    show: false,
    backgroundColor: "#090b0a",
    title: "T8 Prompt Library",
    webPreferences: {
      preload: path.join(APP_DIR, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const external = allowedExternalUrl(url);
    if (external) void shell.openExternal(external.toString(), { activate: true });
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  mainWindow.webContents.on("will-attach-webview", (event) => event.preventDefault());
  mainWindow.webContents.on("did-finish-load", () => sendUpdateStatus(updateStatus));
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => { mainWindow = null; });
  void mainWindow.loadFile(RENDERER_PATH);
}

app.whenReady().then(() => {
  if (writePortableSmokeReport()) {
    app.quit();
    return;
  }
  assetRoots = resolveRoots();
  const mediaStore = new PromptMediaStore();
  promptProjectStore = new PromptProjectStore({ userDataDir: app.getPath("userData") });
  projectMediaStore = new ProjectMediaStore({ userDataDir: app.getPath("userData") });
  const credentialVault = new CredentialVault({
    userDataDir: app.getPath("userData"),
    safeStorage,
    env: process.env
  });
  const localQwenConfigStore = new LocalQwenConfigStore({ userDataDir: app.getPath("userData") });
  localQwen = new LocalQwenManager({
    configStore: localQwenConfigStore,
    imageConverter: convertLocalReferenceImage
  });
  promptOrchestrator = new PromptOrchestrator({ mediaStore, credentialVault, localQwen });
  music3Orchestrator = new Music3Orchestrator({ credentialVault, localQwen });
  const e2eCreativeFetch = e2eCreativeFetchFromEnvironment();
  creativeIntelligence = new CreativeIntelligence({ credentialVault, localQwen, fetchImpl: e2eCreativeFetch });
  configureMediaProtocol();
  configureUpdater();
  configureIpc();
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createWindow();
  scheduleAutomaticUpdateCheck();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => { void localQwen?.stop(); });
