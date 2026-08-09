const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const appDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(appDir, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(appDir, "src", "app.js"), "utf8");

test("renderer exposes comparison controls and side-by-side content", () => {
  for (const id of ["compare-bar", "compare-dialog", "compare-grid", "compare-tab-h3", "compare-tab-seedance"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const token of ["sourceDurationSeconds", "creativeDna", "prompts", "toggleCompare", "renderComparison"]) {
    assert.ok(renderer.includes(token), `missing comparison token: ${token}`);
  }
  assert.ok(renderer.includes("if (event.target !== card) return;"), "nested compare button keys must not open case details");
});

test("renderer exposes a separate official Skill view with H3 and Seedance companions", () => {
  for (const id of ["view-cases", "view-official-skills", "view-official-count"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const token of ["officialSkills", "renderOfficialSkillCard", "switchView", "不导入 ComfyUI", "previewLabel", "media.gifUrl"]) {
    assert.ok(renderer.includes(token), `missing official Skill token: ${token}`);
  }
});

test("renderer defaults to an aggregate all-content view", () => {
  for (const id of ["view-all", "view-all-count"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const token of ["activeView: \"all\"", "全部提示词案例与 Skills", "全部内容", "可预览内容"]) {
    assert.ok(renderer.includes(token), `missing all-content token: ${token}`);
  }
});

test("renderer exposes a separate non-official Skill view with local preview media", () => {
  for (const id of ["view-community-skills", "view-community-count"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const token of ["communitySkills", "renderCommunitySkillCard", "非官方", "完整样片"] ) {
    assert.ok(renderer.includes(token), `missing community Skill token: ${token}`);
  }
});

test("detail dialog cancel and close paths clean up video playback", () => {
  assert.match(renderer, /dialog\.addEventListener\("cancel"/u);
  assert.match(renderer, /dialog\.addEventListener\("close", cleanupDetailMedia\)/u);
  assert.match(renderer, /video\.pause\(\)/u);
  assert.match(renderer, /video\.removeAttribute\("src"\)/u);
});

test("renderer does not embed remote platform pages", () => {
  assert.doesNotMatch(html, /<iframe|<webview/iu);
  assert.doesNotMatch(renderer, /createElement\(["'](?:iframe|webview)["']\)/iu);
});
