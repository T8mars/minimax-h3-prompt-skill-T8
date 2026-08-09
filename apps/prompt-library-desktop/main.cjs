const path = require("node:path");
const fs = require("node:fs");
const { fileURLToPath } = require("node:url");
const {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  protocol,
  session,
  shell
} = require("electron");
const { autoUpdater } = require("electron-updater");
const { loadCatalog, safeResolve } = require("./lib/catalog.cjs");
const { allowedExternalUrl } = require("./lib/security.cjs");
const { automaticUpdateDelay } = require("./lib/update-policy.cjs");
const { createFileResponse } = require("./lib/media-response.cjs");

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
let updateStatus = { state: "idle", message: "尚未检查更新" };
let updateInFlight = false;

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
      sendUpdateStatus({ state: "error", message: `更新下载失败：${error.message}` });
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
    sendUpdateStatus({ state: "error", message: `更新检查失败：${error.message}` });
  });
}

function scheduleAutomaticUpdateCheck() {
  const delay = automaticUpdateDelay({ isPackaged: app.isPackaged, env: process.env });
  if (delay === null) return;
  setTimeout(async () => {
    if (updateInFlight) return;
    updateInFlight = true;
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      updateInFlight = false;
      sendUpdateStatus({ state: "error", message: `自动更新检查失败：${error.message}` });
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

  ipcMain.handle("updater:check", async (event) => {
    requireTrustedSender(event);
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
