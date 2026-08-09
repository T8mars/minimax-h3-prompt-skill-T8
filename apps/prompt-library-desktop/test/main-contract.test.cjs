const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const main = fs.readFileSync(path.resolve(__dirname, "..", "main.cjs"), "utf8");

test("downloaded updates install only after explicit restart confirmation", () => {
  assert.match(main, /autoUpdater\.autoInstallOnAppQuit = false/u);
  assert.match(main, /updateStatus\.state !== "downloaded"/u);
  assert.match(main, /autoUpdater\.quitAndInstall\(false, true\)/u);
});

test("media protocol resolves canonical paths and delegates range responses", () => {
  assert.match(main, /fs\.realpathSync\(root\)/u);
  assert.match(main, /fs\.realpathSync\(target\)/u);
  assert.match(main, /createFileResponse\(canonicalTarget, request\)/u);
});

test("packaged and development roots include the installable Skill library", () => {
  assert.match(main, /path\.join\(process\.resourcesPath, "skills"\)/u);
  assert.match(main, /path\.join\(REPO_ROOT, "skills"\)/u);
  assert.match(main, /officialSkills: catalog\.officialSkills/u);
});
