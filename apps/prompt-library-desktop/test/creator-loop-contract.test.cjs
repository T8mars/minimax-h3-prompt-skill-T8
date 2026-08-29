const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(root, "src", "workbench.js"), "utf8");
const preload = fs.readFileSync(path.join(root, "preload.cjs"), "utf8");
const main = fs.readFileSync(path.join(root, "main.cjs"), "utf8");

test("P0 creator UI enforces the 30-second video contract and exposes shot, continuity, revision and repair tools", () => {
  for (const id of ["workbench-custom-duration", "workbench-shot-list", "workbench-add-shot", "workbench-auto-time-shots", "workbench-media-list", "workbench-continuity-list", "workbench-revision-list", "workbench-validate-edit", "workbench-preflight-repair", "workbench-repair-quota"]) assert.match(html, new RegExp(`id=["']${id}["']`));
  assert.match(html, /id="workbench-custom-duration"[^>]+max="30"/u);
  assert.doesNotMatch(html, /<option value="60">/u);
  for (const token of ["effectiveDuration", "autoTimeShots", "mediaAssignments", "continuityLocks", "preflightPromptRepair", "commitPromptOperation"]) assert.ok(renderer.includes(token), `missing ${token}`);
});

test("P1 UI exposes human result review, variants, mechanism composition, Music bridge and accepted-only handoff", () => {
  for (const id of ["workbench-result-video", "workbench-add-observation", "workbench-save-review", "workbench-comparison-picker", "workbench-compose", "workbench-video-music-bridge", "workbench-music-video-bridge", "workbench-export-handoff"]) assert.match(html, new RegExp(`id=["']${id}["']`));
  assert.equal((html.match(/data-variant-style=/gu) || []).length, 3);
  for (const channel of ["prompt:variant:preflight", "prompt:review:import", "prompt:review:save", "prompt:mechanism:compose", "prompt:bridge:video-to-music", "prompt:bridge:music-to-video", "prompt:handoff:export"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload ${channel}`);
  }
});

test("P2 UI exposes AI/Qwen routing, AI shot planning, personal Skill export, stage board, effect denominators and proposals", () => {
  for (const id of ["workbench-export-skill", "workbench-board-stage", "workbench-current-stage", "workbench-rating", "workbench-effects-output", "workbench-template-proposal"]) assert.match(html, new RegExp(`id=["']${id}["']`));
  for (const channel of ["prompt:router", "prompt:shot-plan:generate", "prompt:skill:export", "prompt:board", "prompt:effects", "prompt:template:proposal", "prompt:project:stage"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload ${channel}`);
  }
  assert.match(html, /id="workbench-ai-shot-plan"/u);
  assert.doesNotMatch(main, /require\("\.\/lib\/creative-router\.cjs"\)/u);
  assert.doesNotMatch(renderer, /\bfetch\s*\(/u);
});
