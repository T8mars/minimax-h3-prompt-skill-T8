const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(root, "src", "workbench.js"), "utf8");
const preload = fs.readFileSync(path.join(root, "preload.cjs"), "utf8");
const main = fs.readFileSync(path.join(root, "main.cjs"), "utf8");

test("workbench exposes reference media and experiment project controls", () => {
  for (const id of ["workbench-add-media", "workbench-clear-media", "workbench-media-list", "workbench-save-project", "workbench-project-list", "workbench-export-project", "workbench-delete-project"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing ${id}`);
  }
  for (const token of ["pickPromptMedia", "clearPromptMedia", "savePromptProject", "exportPromptProject", "mediaIds"]) assert.ok(renderer.includes(token), `missing ${token}`);
});

test("media paths and project files stay in Electron Main behind narrow IPC", () => {
  for (const channel of ["prompt:media:pick", "prompt:media:list", "prompt:media:clear", "prompt:project:list", "prompt:project:get", "prompt:project:save", "prompt:project:delete", "prompt:project:export"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload ${channel}`);
  }
  assert.doesNotMatch(renderer, /showOpenDialog|readFileSync|writeFileSync|filePath/gu);
  assert.match(main, /new PromptMediaStore/u);
  assert.match(main, /new PromptProjectStore/u);
});
