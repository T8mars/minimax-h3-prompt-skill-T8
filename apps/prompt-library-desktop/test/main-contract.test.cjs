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

test("Windows release includes a true portable target with isolated sibling data", () => {
  const winTargets = builder.win.target.map((entry) => entry.target).sort();
  assert.deepEqual(winTargets, ["nsis", "portable"]);
  assert.equal(builder.portable.artifactName, "T8-Prompt-Library-Portable-v${version}.${ext}");
  assert.match(main, /configurePortableMode/u);
  assert.match(main, /portableMode\.enabled/u);
  assert.match(main, /T8_PORTABLE_SMOKE/u);
  assert.match(main, /path\.join\(portableMode\.userDataDir, "portable-smoke\.json"\)/u);
  assert.ok(workflow.includes("T8-Prompt-Library-Portable-v$version.exe"));
  assert.ok(workflow.includes("Validate packaged Windows portable mode"));
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

test("release packages a compact app catalog and lossless split public preview archives", () => {
  assert.match(fs.readFileSync(path.resolve(__dirname, "..", "electron-builder.config.cjs"), "utf8"), /process\.env\.T8_CATALOG_DIR/u);
  assert.ok(workflow.includes("prepare-app-catalog.mjs"));
  assert.ok(workflow.includes("--max-dimension 288 --fps 4 --colors 64"), "the installer preview budget must use the validated compact GIF profile");
  assert.ok(workflow.includes("440401920"), "the compact app catalog must stay below its 420 MiB release budget");
  assert.ok(workflow.includes("T8_CATALOG_DIR"));
  assert.ok(workflow.includes("Packaged and repository catalog manifests differ"));
  assert.ok(workflow.includes("prompt-library-previews-v$version-part1.zip"));
  assert.ok(workflow.includes("prompt-library-previews-v$version-part2.zip"));
  assert.ok(workflow.includes('Where-Object { $_.Extension -eq ".gif" }'), "original GIF previews must be split without recompression");
  assert.ok(workflow.includes("New-Item -ItemType HardLink"), "release staging must not duplicate multi-gigabyte preview bytes");
  assert.ok(workflow.includes("2147483648"), "the workflow must fail before upload when any asset reaches GitHub's 2 GiB limit");
});

test("release publishes complete videos as a verified sidecar instead of duplicating them into oversized installers", () => {
  const builderSource = fs.readFileSync(path.resolve(__dirname, "..", "electron-builder.config.cjs"), "utf8");
  assert.match(builderSource, /process\.env\.T8_EMBED_MEDIA === "1"/u);
  assert.equal(builder.extraResources.some((entry) => entry.to === "media"), false, "default desktop packages must not duplicate the complete MP4 pack");
  assert.ok(workflow.includes("Packaged application unexpectedly contains a duplicated media pack"));
  assert.ok(workflow.includes('$env:T8_MEDIA_DIR = (Resolve-Path ".release-input/media").Path'), "packaged E2E must mount the verified sidecar media pack");
  assert.ok(workflow.includes("prompt-library-media-v$version-part1.zip"), "the first lossless media volume must remain a release asset");
  assert.ok(workflow.includes("prompt-library-media-v$version-part2.zip"), "the second lossless media volume must remain a release asset");
  assert.ok(workflow.includes('mismatch for ${asset}: expected'), "PowerShell must delimit the asset variable before a colon");
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

test("desktop releases explicitly exclude local model weights and runtime caches", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "electron-builder.config.cjs"), "utf8");
  for (const pattern of ["*.gguf", "*.safetensors", "*.ckpt", "*.onnx", "runtime/local_qwen"]) {
    assert.ok(source.includes(pattern), `missing local-model release exclusion ${pattern}`);
  }
  assert.ok(builder.files.some((entry) => entry.includes("*.gguf")));
});
