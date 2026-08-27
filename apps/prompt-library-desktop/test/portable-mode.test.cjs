const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const {
  PORTABLE_DATA_DIRECTORY,
  PORTABLE_SESSION_DIRECTORY,
  configurePortableMode,
  resolvePortableMode
} = require("../lib/portable-mode.cjs");

test("installed and development builds retain the system user-data contract", () => {
  for (const options of [
    { platform: "win32", isPackaged: false, env: { PORTABLE_EXECUTABLE_DIR: "portable-root" } },
    { platform: "win32", isPackaged: true, env: {} },
    { platform: "darwin", isPackaged: true, env: { PORTABLE_EXECUTABLE_DIR: "portable-root" } }
  ]) {
    assert.deepEqual(resolvePortableMode(options), {
      enabled: false,
      executableDirectory: null,
      userDataDir: null,
      sessionDataDir: null
    });
  }
});

test("electron-builder portable launcher binds all persistent data beside the launcher", () => {
  const mode = resolvePortableMode({
    platform: "win32",
    isPackaged: true,
    env: { PORTABLE_EXECUTABLE_DIR: "portable-launcher" },
    executablePath: path.join("temporary-extraction", "T8 Prompt Library.exe")
  });
  const executableDirectory = path.resolve("temporary-extraction", "portable-launcher");
  assert.deepEqual(mode, {
    enabled: true,
    executableDirectory,
    userDataDir: path.join(executableDirectory, PORTABLE_DATA_DIRECTORY),
    sessionDataDir: path.join(executableDirectory, PORTABLE_DATA_DIRECTORY, PORTABLE_SESSION_DIRECTORY)
  });
});

test("portable configuration creates and registers user and session paths", () => {
  const mkdirCalls = [];
  const setPathCalls = [];
  const mode = configurePortableMode({
    app: { setPath: (...args) => setPathCalls.push(args) },
    fsImpl: { mkdirSync: (...args) => mkdirCalls.push(args) },
    platform: "win32",
    isPackaged: true,
    env: { PORTABLE_EXECUTABLE_DIR: "portable-launcher" },
    executablePath: path.join("temporary-extraction", "T8 Prompt Library.exe")
  });
  assert.equal(mode.enabled, true);
  assert.deepEqual(mkdirCalls, [
    [mode.userDataDir, { recursive: true }],
    [mode.sessionDataDir, { recursive: true }]
  ]);
  assert.deepEqual(setPathCalls, [
    ["userData", mode.userDataDir],
    ["sessionData", mode.sessionDataDir]
  ]);
});
