const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { allowedExternalUrl } = require("../lib/security.cjs");

const appDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(appDir, "src", "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(appDir, "src", "workbench.js"), "utf8");
const preload = fs.readFileSync(path.join(appDir, "preload.cjs"), "utf8");
const main = fs.readFileSync(path.join(appDir, "main.cjs"), "utf8");

test("workbench exposes a three-step creator flow plus persistent provider settings and explicit run confirmation", () => {
  for (const id of [
    "open-prompt-workbench", "prompt-workbench-dialog", "workbench-intent", "workbench-route", "workbench-router-results",
    "workbench-template", "open-api-settings", "api-settings-dialog", "workbench-provider-cards", "workbench-api-key", "workbench-remember-key", "workbench-output-language", "workbench-preflight",
    "workbench-confirm-paid", "workbench-start", "workbench-run-status", "workbench-output", "workbench-validation",
    "workbench-step-nav", "workbench-template-preview", "workbench-preview-image", "workbench-prev-step", "workbench-next-step"
  ]) assert.match(html, new RegExp(`id=["']${id}["']`), `missing workbench control ${id}`);
  for (const token of ["routeTemplates", "requiredAnchors", "creativeDna", "preflightPrompt", "startPrompt", "promptStatus", "anchorCoverage", "renderTemplatePreview", "setWorkbenchStep", "openApiSettings", "t8-workbench-provider"]) {
    assert.ok(renderer.includes(token), `missing workbench behavior ${token}`);
  }
});

test("API settings add a fourth local Qwen channel without exposing model paths through generic IPC", () => {
  assert.equal((html.match(/<button class="provider-card\b/g) || []).length, 4);
  for (const id of ["workbench-local-qwen-panel", "local-qwen-directory", "local-qwen-model", "local-qwen-runtime", "local-qwen-ffmpeg", "local-qwen-verify", "local-qwen-release"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing local Qwen control ${id}`);
  }
  for (const channel of ["prompt:local:status", "prompt:local:configure", "prompt:local:verify", "prompt:local:release", "prompt:local:pick-model-directory", "prompt:local:pick-runtime", "prompt:local:pick-ffmpeg"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main IPC ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload IPC ${channel}`);
  }
  assert.match(main, /for \(const key of \["modelFilename", "contextSize"/u, "renderer settings IPC must whitelist non-path fields");
  assert.doesNotMatch(renderer, /localStorage\.setItem\([^\n]+(?:modelDirectory|runtimeExecutable|ffmpegExecutable)/u);
});

test("generation parameters expose Chinese and English output with Chinese as the default", () => {
  assert.match(html, /id="workbench-output-language"/u);
  assert.match(html, /value="zh-CN" selected/u);
  assert.match(html, /value="en"/u);
  assert.ok(renderer.includes("outputLanguage: elements.workbenchOutputLanguage.value"));
});

test("both affiliate registration links are prominent, exact and HTTPS allowlisted", () => {
  const seedance = "https://api.seedance.nz/sign-up?aff=5f4w";
  const workshop = "https://ai.t8star.org/register?aff=dP7j";
  assert.ok(renderer.includes(seedance));
  assert.ok(renderer.includes(workshop));
  assert.equal(allowedExternalUrl(seedance)?.hostname, "api.seedance.nz");
  assert.equal(allowedExternalUrl(workshop)?.hostname, "ai.t8star.org");
  assert.equal(allowedExternalUrl("https://ai.t8star.org.example.com/register?aff=dP7j"), null);
});

test("renderer remains offline and exposes no generic network or secret-storage primitive", () => {
  assert.match(html, /connect-src 'none'/u);
  assert.doesNotMatch(renderer, /\bfetch\s*\(/u);
  assert.doesNotMatch(renderer, /XMLHttpRequest|WebSocket/u);
  assert.doesNotMatch(preload, /generic|proxy|fetchUrl|httpRequest/u);
  assert.doesNotMatch(renderer, /localStorage\.setItem\([^\n]+(?:key|credential|secret)/iu);
});

test("Main owns credentials, provider calls and a narrow trusted IPC contract", () => {
  assert.match(main, /safeStorage/u);
  assert.match(main, /new CredentialVault/u);
  assert.match(main, /new PromptOrchestrator/u);
  for (const channel of ["prompt:providers", "prompt:credential:set", "prompt:credential:clear", "prompt:preflight", "prompt:start", "prompt:status", "prompt:cancel"]) {
    assert.ok(main.includes(`ipcMain.handle("${channel}"`), `missing Main IPC ${channel}`);
    assert.ok(preload.includes(`ipcRenderer.invoke("${channel}"`), `missing preload IPC ${channel}`);
  }
  const promptHandlers = main.match(/ipcMain\.handle\("prompt:[\s\S]*?\n  \}\);/gu) || [];
  assert.ok(promptHandlers.length >= 7);
  for (const handler of promptHandlers) assert.match(handler, /requireTrustedSender\(event\)/u);
});



test("API provider configuration is a separate persistent settings dialog, not a creation step", () => {
  assert.match(html, /id="open-api-settings"[^>]+aria-controls="api-settings-dialog"/u);
  assert.match(html, /id="api-settings-dialog" class="api-settings-dialog"/u);
  assert.doesNotMatch(html, /data-workbench-step="provider"/u);
  assert.deepEqual([...html.matchAll(/data-workbench-step="([^"]+)"/gu)].map((match) => match[1]), ["goal", "target", "result"]);
  assert.ok(renderer.includes('localStorage.setItem("t8-workbench-provider"'));
  assert.ok(renderer.includes('localStorage.setItem("t8-workbench-provider-options"'));
  assert.ok(renderer.includes('workbenchRememberKey') && html.includes('id="workbench-remember-key" type="checkbox" checked'));
});
