const path = require("node:path");
const fs = require("node:fs");
const { fileURLToPath } = require("node:url");
const {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
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
const { PromptMediaStore } = require("./lib/prompt-media.cjs");
const { PromptProjectStore } = require("./lib/prompt-projects.cjs");
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
let mainWindow = null;
let assetRoots = null;
let updateStatus = { state: "idle" };
let updateInFlight = false;
let promptOrchestrator = null;
let music3Orchestrator = null;
let promptProjectStore = null;

function resolveRoots() {
  const catalogRoot = app.isPackaged
    ? path.join(process.resourcesPath, "catalog")
    : path.join(REPO_ROOT, "catalog");
  const skillsRoot = app.isPackaged
    ? path.join(process.resourcesPath, "skills")
    : path.join(REPO_ROOT, "skills");

  let mediaRoot;
  if (process.env.T8_MEDIA_DIR) {
    mediaRoot = path.resolve(REPO_ROOT, process.env.T8_MEDIA_DIR);
  } else if (app.isPackaged) {
    mediaRoot = path.join(process.resourcesPath, "media");
  } else {
    mediaRoot = path.join(REPO_ROOT, ".release-input", "media");
  }
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
      hasFullVideo: item.media.hasFullVideo
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

function sendUpdateStatus(next) {
  updateStatus = { ...updateStatus, ...next };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater:status", updateStatus);
  }
}

function configureUpdater() {
  if (process.platform === "darwin") return;
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

  ipcMain.handle("prompt:preflight", (event, input) => {
    requireTrustedSender(event);
    return promptOrchestrator.preflight(input || {});
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
      filters: [{ name: "Reference media", extensions: ["png", "jpg", "jpeg", "webp", "mp4", "mov", "webm"] }]
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
    return promptProjectStore.get(projectId);
  });

  ipcMain.handle("prompt:project:save", (event, input) => {
    requireTrustedSender(event);
    const request = input || {};
    const runner = request.capability === "music3" ? music3Orchestrator : promptOrchestrator;
    const base = request.runId ? runner.projectSnapshot(request.runId) : promptProjectStore.get(request.projectId);
    if (!base) throw new Error("Prompt project not found.");
    return promptProjectStore.save({ ...base, projectId: request.projectId || undefined, title: request.title || base.title, notes: request.notes ?? base.notes });
  });

  ipcMain.handle("prompt:project:delete", (event, projectId) => {
    requireTrustedSender(event);
    return promptProjectStore.remove(projectId);
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
    if (process.platform === "darwin") return false;
    if (!app.isPackaged || updateStatus.state !== "downloaded") return false;
    setImmediate(() => autoUpdater.quitAndInstall(false, true));
    return true;
  });
}

function configureMediaProtocol() {
  protocol.handle("t8media", (request) => {
    try {
      const requestUrl = new URL(request.url);
      const scope = requestUrl.hostname;
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
  assetRoots = resolveRoots();
  const mediaStore = new PromptMediaStore();
  promptProjectStore = new PromptProjectStore({ userDataDir: app.getPath("userData") });
  const credentialVault = new CredentialVault({
    userDataDir: app.getPath("userData"),
    safeStorage,
    env: process.env
  });
  promptOrchestrator = new PromptOrchestrator({ mediaStore, credentialVault });
  music3Orchestrator = new Music3Orchestrator({ credentialVault });
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
