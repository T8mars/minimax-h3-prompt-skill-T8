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
