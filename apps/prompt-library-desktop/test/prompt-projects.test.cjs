const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { PromptProjectStore, projectMarkdown, sanitizeProject } = require("../lib/prompt-projects.cjs");

function sample() {
  return {
    title: "Folding camera proof",
    intent: "A fictional camera proves three functions.", constraints: "No subtitles.",
    templateId: "proof-ladder", templateTitle: "Proof ladder", templateHash: "a".repeat(64),
    target: "minimaxH3", durationSeconds: 15, rewriteMode: "balanced",
    outputLanguage: "zh-CN",
    providerId: "t8star_workshop", providerLabel: "AI Workshop", endpointHost: "ai.t8star.org", model: "gemini-3.5-flash",
    output: "Subject: fictional camera. Shot 1 0-15s held result.", validation: { status: "pass" },
    receipt: { attempts: 1, mediaCount: 1, mediaUploadCount: 0, outputSha256: "b".repeat(64) },
    media: [{ name: "reference.mp4", kind: "video", mimeType: "video/mp4", sizeBytes: 100, sha256: "c".repeat(64), label: "<Video 1>", filePath: ["C:", "secret", "reference.mp4"].join("\\") }]
  };
}

test("saved experiment projects round-trip without credentials or absolute media paths", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-project-"));
  try {
    const store = new PromptProjectStore({ userDataDir: root, randomUUID: () => "project-one", now: () => "2026-08-12T12:00:00.000Z" });
    const saved = store.save(sample());
    assert.equal(saved.projectId, "project-one");
    assert.equal(store.list().length, 1);
    assert.equal(saved.outputLanguage, "zh-CN");
    assert.deepEqual(store.get("project-one"), saved);
    const json = JSON.stringify(saved);
    assert.doesNotMatch(json, /secret[\\/]reference|apiKey|credential/iu);
    assert.match(projectMarkdown(saved), /## Enhanced prompt/u);
    assert.equal(store.exportBundle(saved).filename, "Folding camera proof");
    assert.deepEqual(store.remove("project-one"), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("project sanitizer keeps only hash-bound media descriptors", () => {
  const project = sanitizeProject(sample(), { id: "one", now: "2026-08-12T00:00:00Z" });
  assert.deepEqual(Object.keys(project.media[0]), ["name", "kind", "mimeType", "sizeBytes", "sha256", "label", "mediaId"]);
  assert.equal(project.receipt.attempts, 1);
});
