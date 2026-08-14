const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const appDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(appDir, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(appDir, "src", "music3-workbench.js"), "utf8");
const preload = fs.readFileSync(path.join(appDir, "preload.cjs"), "utf8");
const main = fs.readFileSync(path.join(appDir, "main.cjs"), "utf8");
const builder = require("../electron-builder.config.cjs");

test("Music 3 is an additive workbench capability with Chinese defaults and no media inputs", () => {
  for (const id of [
    "workbench-capability-video", "workbench-capability-music", "music3-parameters", "music3-lyrics-mode",
    "music3-lyrics", "music3-lyrics-language", "music3-quality-mode", "music3-caption-language",
    "music3-toggle-advanced", "music3-result-tabs", "music3-copy-all"
  ]) assert.match(html, new RegExp(`id=["']${id}["']`), `missing Music 3 control ${id}`);
  assert.match(html, /id="music3-caption-language"[\s\S]*?value="zh-CN" selected/u);
  assert.match(html, /id="music3-parameters"[\s\S]*?value="auto" selected/u);
  assert.ok(renderer.includes('state.capability === "music3"'));
  assert.ok(renderer.includes("renderVideoProjects"), "video projects need an explicit restoration path");
  assert.doesNotMatch(html.match(/<section id="music3-parameters"[\s\S]*?<\/section>/u)?.[0] || "", /type="file"|参考图片|参考视频|media/iu);
});

test("Music 3 uses four output tabs, per-result copy feedback, and narrow IPC", () => {
  for (const output of ["lyrics", "musicCaption", "music3PayloadJson", "enhancementReportJson"]) {
    assert.ok(html.includes(`data-music3-output="${output}"`), `missing Music 3 output tab ${output}`);
    assert.ok(renderer.includes(output), `renderer does not handle ${output}`);
  }
  assert.ok(renderer.includes("✓ 已复制"));
  assert.ok(renderer.includes("setTimeout"));
  for (const channel of ["music3:preflight", "music3:start", "music3:status", "music3:cancel"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main IPC ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload IPC ${channel}`);
  }
  assert.doesNotMatch(renderer, /\bfetch\s*\(|XMLHttpRequest|WebSocket/u);
  assert.doesNotMatch(preload, /music3[^\n]+(?:fetch|proxy|httpRequest)/iu);
});

test("the frozen official Music 3 tree is packaged without changing existing video resources", () => {
  assert.ok(builder.files.includes("music3-official/**/*"));
  assert.ok(builder.extraResources.some((entry) => String(entry.from).includes("skills")), "existing Skill packaging must remain present");
});

