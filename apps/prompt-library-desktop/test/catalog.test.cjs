const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { extractPrompt, loadCatalog, safeResolve } = require("../lib/catalog.cjs");

function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

function writeCaseLocales(caseDir) {
  const manifest = path.join(caseDir, "manifest.json");
  const dna = path.join(caseDir, "creative-dna.json");
  fs.mkdirSync(path.join(caseDir, "locales"), { recursive: true });
  const bindings = { manifest_sha256: sha(manifest), creative_dna_sha256: sha(dna) };
  for (const locale of ["en", "zh-CN"]) fs.writeFileSync(path.join(caseDir, "locales", `${locale}.json`), JSON.stringify({
    schema_version: "public-display-locale/v1", resource_kind: "case", resource_id: "case-one", locale,
    source_bindings: bindings,
    content: {
      title: locale === "en" ? "Test Case" : "测试案例",
      summary: locale === "en" ? "Reusable motion test" : "可复用运动测试",
      quick_start: { input_format: "A + B", recommended_input: "Example", required_anchors: ["A", "B"], usage_steps: ["One", "Two"], applicable_scope: ["One", "Two"], not_suitable_for: ["One", "Two"] },
      creative_dna: { mechanism: locale === "en" ? "A causes B" : "A 导致 B" }
    },
    review: { status: "approved", method: "test" }
  }));
}

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
    created_at: "2026-08-10T09:00:00+08:00",
    updated_at: "2026-08-11T10:00:00+08:00",
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
  assert.equal(item.catalogAddedAt, "2026-08-10T09:00:00+08:00");
  assert.equal(item.updatedAt, "2026-08-11T10:00:00+08:00");
  assert.equal(item.catalogOrder, 0);
});

test("loads both display locales and rejects stale source bindings", (t) => {
  const data = fixture();
  t.after(() => fs.rmSync(data.root, { recursive: true, force: true }));
  const caseDir = path.join(data.catalogRoot, "cases", "case-one");
  writeCaseLocales(caseDir);
  let catalog = loadCatalog(data);
  assert.equal(catalog.cases[0].localizations.en.title, "Test Case");
  assert.equal(catalog.cases[0].localizations["zh-CN"].title, "测试案例");
  assert.equal(catalog.cases[0].prompts.minimaxH3, "H3 prompt body", "display locale must not alter canonical prompt bytes");
  const manifestFile = path.join(caseDir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  manifest.summary = "Changed after localization review";
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  catalog = loadCatalog(data);
  assert.equal(catalog.cases[0].localizations.en, undefined);
  assert.ok(catalog.warnings.some((warning) => warning.includes("stale display localization binding")));
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
  fs.mkdirSync(path.join(catalogRoot, "official-skills", "previews"), { recursive: true });
  fs.mkdirSync(path.join(skillsRoot, companion, "references"), { recursive: true });
  fs.writeFileSync(path.join(catalogRoot, "manifest.json"), JSON.stringify({
    schema_version: "public-catalog/v1",
    catalog_version: "1.0.1",
    official_skills_manifest: "official-skills/manifest.json"
  }));
  fs.writeFileSync(path.join(catalogRoot, "official-skills", "manifest.json"), JSON.stringify({
    catalog_added_at: "2026-08-09T21:10:00+08:00",
    preview_assets_updated_at: "2026-08-09T23:05:00+08:00",
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
      local_preview_ref: "official-skills/previews/h3-prompt-writing.gif",
      preview_kind: "official-mode-demo-converted",
      preview_label: "官方 T2VA 示例 · GIF",
      companion_skill: companion,
      companion_summary_ref: `${companion}/references/summary.md`,
      companion_seedance_ref: `${companion}/references/template.md`,
      models: ["MiniMax H3", "Seedance 2.0"],
      tags: ["prompt-writing"]
    }]
  }));
  fs.writeFileSync(path.join(skillsRoot, companion, "references", "summary.md"), "# Summary\n\nSeedance companion use and scope.");
  fs.writeFileSync(path.join(skillsRoot, companion, "references", "template.md"), "# Seedance template\n\nA coherent event prompt.");
  fs.writeFileSync(path.join(catalogRoot, "official-skills", "previews", "h3-prompt-writing.gif"), "GIF89a");

  const catalog = loadCatalog({ catalogRoot, skillsRoot });
  assert.equal(catalog.officialSkills.length, 1);
  const item = catalog.officialSkills[0];
  assert.equal(item.kind, "officialSkill");
  assert.equal(item.comfyuiImport, false);
  assert.deepEqual(item.media.gif, { scope: "catalog", relativePath: "official-skills/previews/h3-prompt-writing.gif" });
  assert.equal(item.previewLabel, "官方 T2VA 示例 · GIF");
  assert.equal(item.catalogAddedAt, "2026-08-09T21:10:00+08:00");
  assert.equal(item.updatedAt, "2026-08-09T23:05:00+08:00");
  assert.match(item.prompts.minimaxH3, /Install the official H3 Skill/u);
  assert.match(item.localizedPromptHelp.minimaxH3.en, /This entry points to the MiniMax-AI/u);
  assert.match(item.localizedPromptHelp.minimaxH3["zh-CN"], /安装官方 H3 Skill/u);
  assert.equal(item.prompts.seedance20, "# Seedance template\n\nA coherent event prompt.");
  assert.doesNotMatch(item.prompts.minimaxH3, /Global settings:/u);
});

test("loads a non-official user-contributed Skill with dual-model templates and media", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-community-skills-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const catalogRoot = path.join(root, "catalog");
  const mediaRoot = path.join(root, "media");
  const skillsRoot = path.join(root, "skills");
  const id = "direct-street-interview-video";
  fs.mkdirSync(path.join(catalogRoot, "community-skills", id), { recursive: true });
  fs.mkdirSync(path.join(mediaRoot, "community-skills", id), { recursive: true });
  fs.mkdirSync(path.join(skillsRoot, id, "references"), { recursive: true });
  fs.writeFileSync(path.join(catalogRoot, "manifest.json"), JSON.stringify({
    schema_version: "public-catalog/v1",
    catalog_version: "1.0.2",
    community_skills_manifest: "community-skills/manifest.json"
  }));
  fs.writeFileSync(path.join(catalogRoot, "community-skills", "manifest.json"), JSON.stringify({
    official: false,
    skill_count: 1,
    skills: [{ id, manifest_ref: `community-skills/${id}/manifest.json` }]
  }));
  fs.writeFileSync(path.join(catalogRoot, "community-skills", id, "manifest.json"), JSON.stringify({
    id,
    catalog_added_at: "2026-08-09T22:36:38+08:00",
    updated_at: "2026-08-10T00:00:00+08:00",
    title_zh: "自然街拍互动",
    summary: "连续路线上的自然交流",
    official: false,
    source_classification: "user-contributed",
    source_label: "非官方 · 用户贡献",
    source_attribution: "用户提供样片",
    source_duration_seconds: 10.125,
    target_duration_range_seconds: [4, 15],
    skill_ref: id,
    summary_ref: `${id}/references/summary.md`,
    prompt_refs: { minimax_h3: `${id}/references/h3-template.md`, seedance_2_0: `${id}/references/seedance-template.md` },
    preview_refs: { gif: `community-skills/${id}/preview.gif`, poster: `community-skills/${id}/poster.webp`, mp4: `community-skills/${id}/preview.mp4` },
    models: ["MiniMax H3", "Seedance 2.0"],
    tags: ["street-interview"],
    creative_dna: { mechanism: "distance change" },
    comfyui: { bundled: false, reason: "not bundled" }
  }));
  fs.writeFileSync(path.join(catalogRoot, "community-skills", id, "preview.gif"), "GIF89a");
  fs.writeFileSync(path.join(catalogRoot, "community-skills", id, "poster.webp"), "RIFF");
  fs.writeFileSync(path.join(mediaRoot, "community-skills", id, "preview.mp4"), "ftyp");
  fs.writeFileSync(path.join(skillsRoot, id, "SKILL.md"), "---\nname: direct-street-interview-video\ndescription: test\n---\n");
  fs.writeFileSync(path.join(skillsRoot, id, "references", "summary.md"), "# Summary\n\nUse scope.");
  fs.writeFileSync(path.join(skillsRoot, id, "references", "h3-template.md"), "# H3\n\nsubject_definitions:");
  fs.writeFileSync(path.join(skillsRoot, id, "references", "seedance-template.md"), "# Seedance\n\n自然街拍。");

  const catalog = loadCatalog({ catalogRoot, mediaRoot, skillsRoot });
  assert.equal(catalog.communitySkills.length, 1);
  const item = catalog.communitySkills[0];
  assert.equal(item.kind, "communitySkill");
  assert.equal(item.sourceClassification, "user-contributed");
  assert.equal(item.comfyuiImport, false);
  assert.equal(item.catalogAddedAt, "2026-08-09T22:36:38+08:00");
  assert.equal(item.updatedAt, "2026-08-10T00:00:00+08:00");
  assert.deepEqual(item.media.video, { scope: "media", relativePath: `community-skills/${id}/preview.mp4` });
  assert.match(item.prompts.minimaxH3, /subject_definitions/u);
  assert.match(item.prompts.seedance20, /自然街拍/u);
});
