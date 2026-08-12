const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const appRoot = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(appRoot, "src", "index.html"), "utf8");
const app = fs.readFileSync(path.join(appRoot, "src", "app.js"), "utf8");
const security = require(path.join(appRoot, "lib", "security.cjs"));

const repositories = [
  "https://github.com/T8mars/minimax-h3-prompt-skill-T8",
  "https://github.com/T8mars/comfyui-minimax-h3-prompt-enhancer-T8"
];

test("shows two repository entries in the top bar and Workbench", () => {
  assert.equal((html.match(/data-github-repository=/g) || []).length, 4);
  assert.equal((html.match(/class=\"github-mark\"/g) || []).length, 4);
  assert.match(html, /id=\"open-library-github\"/);
  assert.match(html, /id=\"open-node-github\"/);
  assert.match(html, /id=\"workbench-library-github\"/);
  assert.match(html, /id=\"workbench-node-github\"/);
});

test("opens the exact repositories through the approved external-link bridge", () => {
  for (const url of repositories) {
    assert.ok(app.includes(url));
    assert.equal(security.allowedExternalUrl(url).toString().replace(/\/$/, ""), url);
  }
  assert.match(app, /querySelectorAll\(\"\[data-github-repository\]\"\)/);
  assert.match(app, /api\.openExternal\(url\)/);
  assert.doesNotMatch(app, /comfyui-minimax-h3-prompt-enhancer-T8，/);
});

test("repository controls expose bilingual accessible labels", () => {
  assert.match(app, /githubGroup: \"Related GitHub repositories\"/);
  assert.match(app, /githubGroup: \"相关 GitHub 仓库\"/);
  assert.match(app, /githubNode: \"ComfyUI node GitHub\"/);
  assert.match(app, /githubNode: \"ComfyUI 节点 GitHub\"/);
  assert.match(app, /setAttribute\(\"aria-label\", label\)/);
  assert.match(app, /setAttribute\(\"title\", label\)/);
});
