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

test("loads pinned upstream H3 access and local Seedance companion without embedding upstream text", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-official-skills-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const catalogRoot = path.join(root, "catalog");
  const skillsRoot = path.join(root, "skills");
  const companion = "seedance-companion";
  fs.mkdirSync(path.join(catalogRoot, "official-skills"), { recursive: true });
  fs.mkdirSync(path.join(skillsRoot, companion, "references"), { recursive: true });
  fs.writeFileSync(path.join(catalogRoot, "manifest.json"), JSON.stringify({
    schema_version: "public-catalog/v1",
    catalog_version: "1.0.1",
    official_skills_manifest: "official-skills/manifest.json"
  }));
  fs.writeFileSync(path.join(catalogRoot, "official-skills", "manifest.json"), JSON.stringify({
    pinned_commit: "a".repeat(40),
    skill_count: 1,
    upstream_content_embedded: false,
    comfyui_import: false,
    skills: [{
      id: "h3-prompt-writing",
      title: "H3 Prompt Writing",
      title_zh: "H3 提示词编写",
      summary: "官方入口与独立适配",
      source_classification: "repository-owned",
      source_label: "MiniMax 官方仓库自有",
      upstream_skill_url: `https://github.com/MiniMax-AI/MiniMax-H3/tree/${"a".repeat(40)}/skills/h3-prompt-writing`,
      upstream_install_command: "npx skills add https://github.com/MiniMax-AI/MiniMax-H3 --skill h3-prompt-writing",
      upstream_skill_sha256: "b".repeat(64),
      companion_skill: companion,
      companion_summary_ref: `${companion}/references/summary.md`,
      companion_seedance_ref: `${companion}/references/template.md`,
      models: ["MiniMax H3", "Seedance 2.0"],
      tags: ["prompt-writing"]
    }]
  }));
  fs.writeFileSync(path.join(skillsRoot, companion, "references", "summary.md"), "# Summary\n\nSeedance companion use and scope.");
  fs.writeFileSync(path.join(skillsRoot, companion, "references", "template.md"), "# Seedance template\n\nA coherent event prompt.");

  const catalog = loadCatalog({ catalogRoot, skillsRoot });
  assert.equal(catalog.officialSkills.length, 1);
  const item = catalog.officialSkills[0];
  assert.equal(item.kind, "officialSkill");
  assert.equal(item.comfyuiImport, false);
  assert.match(item.prompts.minimaxH3, /安装官方 H3 Skill/u);
  assert.equal(item.prompts.seedance20, "# Seedance template\n\nA coherent event prompt.");
  assert.doesNotMatch(item.prompts.minimaxH3, /Global settings:/u);
});
