const { contextBridge, ipcRenderer } = require("electron");

const api = Object.freeze({
  loadCatalog: () => ipcRenderer.invoke("catalog:load"),
  openExternal: (url) => ipcRenderer.invoke("external:open", url),
  copyText: (text) => ipcRenderer.invoke("clipboard:write", text),
  promptProviders: () => ipcRenderer.invoke("prompt:providers"),
  setPromptCredential: (input) => ipcRenderer.invoke("prompt:credential:set", input),
  clearPromptCredential: (providerId) => ipcRenderer.invoke("prompt:credential:clear", providerId),
  localQwenStatus: () => ipcRenderer.invoke("prompt:local:status"),
  configureLocalQwen: (input) => ipcRenderer.invoke("prompt:local:configure", input),
  verifyLocalQwen: () => ipcRenderer.invoke("prompt:local:verify"),
  releaseLocalQwen: () => ipcRenderer.invoke("prompt:local:release"),
  rescanLocalQwen: () => ipcRenderer.invoke("prompt:local:rescan"),
  pickLocalQwenModelDirectory: () => ipcRenderer.invoke("prompt:local:pick-model-directory"),
  pickLocalQwenRuntime: () => ipcRenderer.invoke("prompt:local:pick-runtime"),
  pickLocalQwenFfmpeg: () => ipcRenderer.invoke("prompt:local:pick-ffmpeg"),
  preflightPrompt: (input) => ipcRenderer.invoke("prompt:preflight", input),
  preflightMusic3: (input) => ipcRenderer.invoke("music3:preflight", input),
  startMusic3: (input) => ipcRenderer.invoke("music3:start", input),
  music3Status: (runId) => ipcRenderer.invoke("music3:status", runId),
  cancelMusic3: (runId) => ipcRenderer.invoke("music3:cancel", runId),
  pickPromptMedia: () => ipcRenderer.invoke("prompt:media:pick"),
  promptMediaList: () => ipcRenderer.invoke("prompt:media:list"),
  clearPromptMedia: () => ipcRenderer.invoke("prompt:media:clear"),
  promptProjects: () => ipcRenderer.invoke("prompt:project:list"),
  promptProject: (projectId) => ipcRenderer.invoke("prompt:project:get", projectId),
  savePromptProject: (input) => ipcRenderer.invoke("prompt:project:save", input),
  deletePromptProject: (projectId) => ipcRenderer.invoke("prompt:project:delete", projectId),
  exportPromptProject: (projectId) => ipcRenderer.invoke("prompt:project:export", projectId),
  startPrompt: (input) => ipcRenderer.invoke("prompt:start", input),
  promptStatus: (runId) => ipcRenderer.invoke("prompt:status", runId),
  cancelPrompt: (runId) => ipcRenderer.invoke("prompt:cancel", runId),
  checkForUpdates: () => ipcRenderer.invoke("updater:check"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),
  onUpdateStatus: (listener) => {
    if (typeof listener !== "function") return () => {};
    const handler = (_event, status) => listener(status);
    ipcRenderer.on("updater:status", handler);
    return () => ipcRenderer.removeListener("updater:status", handler);
  }
});

contextBridge.exposeInMainWorld("promptLibrary", api);
