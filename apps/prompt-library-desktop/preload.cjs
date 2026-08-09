const { contextBridge, ipcRenderer } = require("electron");

const api = Object.freeze({
  loadCatalog: () => ipcRenderer.invoke("catalog:load"),
  openExternal: (url) => ipcRenderer.invoke("external:open", url),
  copyText: (text) => ipcRenderer.invoke("clipboard:write", text),
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
