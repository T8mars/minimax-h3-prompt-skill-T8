const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const appDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(appDir, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(appDir, "src", "app.js"), "utf8");

test("header uses the T8 brand mark", () => {
  assert.match(html, /<span class="brand-mark">T8<\/span>/u);
  assert.doesNotMatch(html, /<span class="brand-mark">VP<\/span>/u);
});

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

test("renderer exposes persistent on-device favorites, collections and browsing history", () => {
  for (const id of ["view-favorites", "view-collections", "view-history", "personal-toolbar", "collection-select", "new-collection", "clear-history", "detail-favorite", "detail-collections", "collection-editor-dialog", "collection-membership-dialog"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing personal-library control: ${id}`);
  }
  for (const token of ["T8PersonalLibrary", "loadLibrary", "toggleFavorite", "recordHistory", "createCollection", "setCollectionMembership", "t8-personal-library-v1"]) {
    assert.ok(renderer.includes(token) || fs.readFileSync(path.join(appDir, "src", "personal-library.js"), "utf8").includes(token), `missing personal-library behavior: ${token}`);
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

test("detail view exposes bilingual, section copy and full-item copy controls", () => {
  for (const id of ["global-locale-en", "global-locale-zh", "detail-locale-en", "detail-locale-zh", "copy-full-item", "copy-overview", "copy-quick-start", "copy-dna", "copy-validation", "quick-start", "validation-grid"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing bilingual/copy control: ${id}`);
  }
  for (const token of ["setLocale", "fullItemMarkdown", "promptLanguages", "preserveMedia: true", "localStorage.setItem", "copyContent", "renderQuickStart", "renderValidation", "showCopyButtonFeedback", "is-copied"]) {
    assert.ok(renderer.includes(token), `missing bilingual/copy behavior: ${token}`);
  }
  assert.match(html, /<html lang="zh-CN">/u, "static first paint must declare the Chinese default");
  assert.match(html, /id="global-locale-zh" class="locale-button active"[^>]+aria-pressed="true"/u, "Chinese locale control must be active by default");
  assert.ok(renderer.includes('localStorage.getItem("t8-display-locale") === "en" ? "en" : "zh-CN"'), "first run must default to Chinese while preserving an explicit English preference");
  assert.ok(renderer.includes("function activePrompt") && renderer.includes("item?.prompts?.[model]"), "prompt copy must read canonical prompt bytes with only the explicit official access-metadata exception");
});

test("prompt selectors implement the WAI-ARIA tabs contract", () => {
  assert.match(html, /id="tab-h3"[^>]+aria-controls="prompt-panel"[^>]+tabindex="0"/u);
  assert.match(html, /id="tab-seedance"[^>]+aria-controls="prompt-panel"[^>]+tabindex="-1"/u);
  assert.match(html, /id="prompt-panel" role="tabpanel" aria-labelledby="tab-h3"/u);
  assert.match(html, /id="compare-grid" class="compare-grid" role="tabpanel" aria-labelledby="compare-tab-h3"/u);
  for (const token of ["handleTablistKeys", "ArrowRight", "ArrowLeft", "Home", "End", "aria-labelledby"]) {
    assert.ok(renderer.includes(token), `missing accessible tab behavior: ${token}`);
  }
});

test("renderer does not embed remote platform pages", () => {
  assert.doesNotMatch(html, /<iframe|<webview/iu);
  assert.doesNotMatch(renderer, /createElement\(["'](?:iframe|webview)["']\)/iu);
});
