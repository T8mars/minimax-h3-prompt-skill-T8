const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const html = fs.readFileSync(path.join(appRoot, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(appRoot, "src", "app.js"), "utf8");
const main = fs.readFileSync(path.join(appRoot, "main.cjs"), "utf8");
const preload = fs.readFileSync(path.join(appRoot, "preload.cjs"), "utf8");
const readmeZh = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
const readmeEn = fs.readFileSync(path.join(repoRoot, "README_EN.md"), "utf8");
const version = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")).version;

test("fallback preview exposes an actionable bilingual media installation guide", () => {
  for (const id of ["media-install-dialog", "media-install-path", "open-media-release", "open-media-folder", "done-media-install"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing media guide control ${id}`);
  }
  assert.match(renderer, /mediaInstallHelp: "这些文件放哪里？"/u);
  assert.match(renderer, /mediaInstallHelp: "Where do the files go\?"/u);
  assert.match(renderer, /不要分别解压成 part1、part2、part3 文件夹/u);
  assert.match(renderer, /media-pack-manifest\.json/u);
});

test("media folder discovery and opening stay in trusted Electron Main", () => {
  for (const channel of ["media:install-info", "media:open-folder"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main IPC ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload IPC ${channel}`);
  }
  assert.match(main, /fs\.mkdirSync\(assetRoots\.mediaRoot, \{ recursive: true \}\)/u);
  assert.match(main, /await shell\.openPath\(assetRoots\.mediaRoot\)/u);
  assert.match(main, /media:install-info[\s\S]*?requireTrustedSender\(event\)/u);
  assert.match(main, /media:open-folder[\s\S]*?requireTrustedSender\(event\)/u);
  assert.match(preload, /openMediaFolder: \(\) =>/u, "the renderer must not submit an arbitrary filesystem path");
});

test("both READMEs state the exact three-part extraction contract and default locations", () => {
  for (const source of [readmeZh, readmeEn]) {
    for (const part of [1, 2, 3]) assert.ok(source.includes(`prompt-library-media-v${version}-part${part}.zip`));
    assert.ok(source.includes("media-pack-manifest.json"));
    assert.ok(source.includes("T8-Prompt-Library-Data\\media"));
    assert.ok(source.includes("~/Library/Application Support/T8 Prompt Library/media/"));
  }
  assert.match(readmeZh, /不需要[^\n]+prompt-library-catalog/u);
  assert.match(readmeEn, /do \*\*not\*\* need[^\n]+prompt-library-catalog/u);
});
