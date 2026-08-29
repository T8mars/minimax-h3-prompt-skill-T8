const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const testRoot = __dirname;

test("Electron E2E resizes the BrowserWindow content instead of emulating a narrower renderer viewport", () => {
  for (const fileName of ["electron.e2e.cjs", "workbench.e2e.cjs", "creator-loop.e2e.cjs", "layout-regression.e2e.cjs"]) {
    const source = fs.readFileSync(path.join(testRoot, fileName), "utf8");
    assert.doesNotMatch(source, /\.setViewportSize\s*\(/u, `${fileName} must not leave a blank gutter by overriding only the renderer viewport`);
    assert.match(source, /setElectronContentSize/u, `${fileName} must synchronize Electron window and renderer dimensions`);
    assert.match(source, /--user-data-dir=/u, `${fileName} must isolate its browser profile from user and sibling test state`);
  }
  const helper = fs.readFileSync(path.join(testRoot, "electron-window.cjs"), "utf8");
  assert.match(helper, /setContentSize/u);
  assert.match(helper, /content bounds and renderer viewport must stay synchronized/u);
  assert.match(helper, /SIGINT/u, "interrupted E2E runs must close their Electron window");
});
