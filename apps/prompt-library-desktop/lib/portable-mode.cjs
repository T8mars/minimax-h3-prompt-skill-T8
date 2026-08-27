const fs = require("node:fs");
const path = require("node:path");

const PORTABLE_DATA_DIRECTORY = "T8-Prompt-Library-Data";
const PORTABLE_SESSION_DIRECTORY = "Session";

function resolvePortableMode({
  env = process.env,
  platform = process.platform,
  isPackaged = false,
  executablePath = process.execPath
} = {}) {
  const launcherDirectory = typeof env.PORTABLE_EXECUTABLE_DIR === "string"
    ? env.PORTABLE_EXECUTABLE_DIR.trim()
    : "";
  if (!isPackaged || platform !== "win32" || !launcherDirectory) {
    return { enabled: false, executableDirectory: null, userDataDir: null, sessionDataDir: null };
  }

  const executableDirectory = path.resolve(path.dirname(executablePath), launcherDirectory);
  const userDataDir = path.join(executableDirectory, PORTABLE_DATA_DIRECTORY);
  return {
    enabled: true,
    executableDirectory,
    userDataDir,
    sessionDataDir: path.join(userDataDir, PORTABLE_SESSION_DIRECTORY)
  };
}

function configurePortableMode({ app, fsImpl = fs, ...options } = {}) {
  if (!app || typeof app.setPath !== "function") throw new TypeError("Electron app.setPath is required");
  const mode = resolvePortableMode(options);
  if (!mode.enabled) return mode;

  fsImpl.mkdirSync(mode.userDataDir, { recursive: true });
  fsImpl.mkdirSync(mode.sessionDataDir, { recursive: true });
  app.setPath("userData", mode.userDataDir);
  app.setPath("sessionData", mode.sessionDataDir);
  return mode;
}

module.exports = {
  PORTABLE_DATA_DIRECTORY,
  PORTABLE_SESSION_DIRECTORY,
  configurePortableMode,
  resolvePortableMode
};
