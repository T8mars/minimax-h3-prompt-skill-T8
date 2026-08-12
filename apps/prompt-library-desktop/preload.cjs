const { contextBridge, ipcRenderer } = require("electron");

const api = Object.freeze({
  loadCatalog: () => ipcRenderer.invoke("catalog:load"),
  openExternal: (url) => ipcRenderer.invoke("external:open", url),
  copyText: (text) => ipcRenderer.invoke("clipboard:write", text),
  promptProviders: () => ipcRenderer.invoke("prompt:providers"),
  setPromptCredential: (input) => ipcRenderer.invoke("prompt:credential:set", input),
  clearPromptCredential: (providerId) => ipcRenderer.invoke("prompt:credential:clear", providerId),
  preflightPrompt: (input) => ipcRenderer.invoke("prompt:preflight", input),
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
