const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { extractPrompt, loadCatalog, safeResolve } = require("../lib/catalog.cjs");

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-catalog-"));
  const catalogRoot = path.join(root, "catalog");
  const mediaRoot = path.join(root, "media");
  const caseDir = path.join(catalogRoot, "cases", "case-one");
  fs.mkdirSync(path.join(caseDir, "prompts"), { recursive: true });
  fs.mkdirSync(path.join(mediaRoot, "case-one"), { recursive: true });
  fs.writeFileSync(path.join(catalogRoot, "manifest.json"), JSON.stringify({ schema_version: "public-catalog/v1", catalog_version: "1.0.0" }));
  fs.writeFileSync(path.join(caseDir, "manifest.json"), JSON.stringify({
    case_id: "case-one",
    title: "Test Case",
    summary: "Reusable motion test",
    status: "released",
    source_duration_seconds: 10.154,
    target_duration_seconds: 15,
    source_ref: "source.json",
    creative_dna_ref: "creative-dna.json",
    prompt_refs: { minimax_h3: "prompts/minimax-h3.md", seedance_2_0: "prompts/seedance-2.0.md" },
    preview_refs: { gif: "preview.gif", poster: "poster.webp", mp4: "media/case-one/preview.mp4" },
    tags: ["motion", "camera"]
  }));
  fs.writeFileSync(path.join(caseDir, "source.json"), JSON.stringify({ platform: "x", author: "@tester", canonical_url: "https://x.com/tester/status/1" }));
  fs.writeFileSync(path.join(caseDir, "creative-dna.json"), JSON.stringify({ mechanism: "A causes B" }));
  fs.writeFileSync(path.join(caseDir, "prompts", "minimax-h3.md"), "---\nmodel: H3\n---\n\n## Prompt\n\n```text\nH3 prompt body\n```\n\n## Notes\nDo not copy");
  fs.writeFileSync(path.join(caseDir, "prompts", "seedance-2.0.md"), "## Prompt\n\n```text\nSeedance prompt body\n```");
  fs.writeFileSync(path.join(caseDir, "preview.gif"), "GIF89a");
  fs.writeFileSync(path.join(caseDir, "poster.webp"), "RIFF");
  fs.writeFileSync(path.join(mediaRoot, "case-one", "preview.mp4"), Buffer.from("0000ftypfixture"));
  return { root, catalogRoot, mediaRoot };
}

test("loads a released case and prefers the external media pack", (t) => {
  const data = fixture();
  t.after(() => fs.rmSync(data.root, { recursive: true, force: true }));
  const catalog = loadCatalog(data);
  assert.equal(catalog.cases.length, 1);
  const item = catalog.cases[0];
  assert.equal(item.sourceDurationSeconds, 10.154);
  assert.equal(item.targetDurationSeconds, 15);
  assert.equal(item.prompts.minimaxH3, "H3 prompt body");
  assert.equal(item.prompts.seedance20, "Seedance prompt body");
  assert.deepEqual(item.media.video, { scope: "media", relativePath: "case-one/preview.mp4" });
  assert.equal(item.sourceUrl, "https://x.com/tester/status/1");
});

test("omits drafts from the public viewer", (t) => {
  const data = fixture();
  t.after(() => fs.rmSync(data.root, { recursive: true, force: true }));
  const manifestPath = path.join(data.catalogRoot, "cases", "case-one", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.status = "draft";
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.equal(loadCatalog(data).cases.length, 0);
});

test("blocks absolute and traversal references", () => {
  const root = path.resolve("fixture-root");
  assert.equal(safeResolve(root, "../secret.txt"), null);
  assert.equal(safeResolve(root, path.resolve(root, "secret.txt")), null);
  assert.equal(safeResolve(root, "cases/demo.json"), path.join(root, "cases", "demo.json"));
});

test("extractPrompt returns the model-ready block only", () => {
  const markdown = "---\nmodel: H3\n---\n# Title\n## Prompt\n```text\nusable prompt\n```\n## Usage\nnotes";
  assert.equal(extractPrompt(markdown), "usable prompt");
});
