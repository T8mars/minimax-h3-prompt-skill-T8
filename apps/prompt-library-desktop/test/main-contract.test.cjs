const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const main = fs.readFileSync(path.resolve(__dirname, "..", "main.cjs"), "utf8");
const builder = require("../electron-builder.config.cjs");
const workflow = fs.readFileSync(path.resolve(__dirname, "..", "..", "..", ".github", "workflows", "release.yml"), "utf8");

test("downloaded updates install only after explicit restart confirmation", () => {
  assert.match(main, /autoUpdater\.autoInstallOnAppQuit = false/u);
  assert.match(main, /updateStatus\.state !== "downloaded"/u);
  assert.match(main, /autoUpdater\.quitAndInstall\(false, true\)/u);
});

test("unsigned macOS preview uses a manual release-update boundary", () => {
  assert.match(main, /process\.platform === "darwin"/u);
  assert.match(main, /Unsigned macOS builds update through the Releases page/u);
  assert.match(main, /https:\/\/github\.com\/T8mars\/minimax-h3-prompt-skill-T8\/releases/u);
});

test("builder and release workflow require universal macOS DMG and ZIP artifacts", () => {
  const macTargets = builder.mac.target.map((entry) => entry.target).sort();
  assert.deepEqual(macTargets, ["dmg", "zip"]);
  assert.ok(builder.mac.target.every((entry) => entry.arch.includes("universal")));
  assert.equal(builder.mac.notarize, false);
  for (const token of ["macos-latest", "dist:mac", "latest-mac.yml", "mac-universal.dmg", "mac-universal.zip", "Run packaged macOS end-to-end test"]) {
    assert.ok(workflow.includes(token), `missing macOS release gate: ${token}`);
  }
  assert.match(workflow, /GH_REPO: \$\{\{ github\.repository \}\}/u, "the checkout-free publish job must bind gh to this repository");
});

test("media protocol resolves canonical paths and delegates range responses", () => {
  assert.match(main, /fs\.realpathSync\(root\)/u);
  assert.match(main, /fs\.realpathSync\(target\)/u);
  assert.match(main, /createFileResponse\(canonicalTarget, request\)/u);
});

test("packaged and development roots include the installable Skill library", () => {
  assert.match(main, /path\.join\(process\.resourcesPath, "skills"\)/u);
  assert.match(main, /path\.join\(REPO_ROOT, "skills"\)/u);
  assert.match(main, /officialSkills: catalog\.officialSkills\.map\(serializeMediaItem\)/u);
  assert.match(main, /communitySkills: catalog\.communitySkills\.map\(serializeMediaItem\)/u);
});
