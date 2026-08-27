const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { exportHandoff, exportPersonalSkill, handoffFiles, skillDraft, validateSkillFiles } = require("../lib/creative-artifacts.cjs");

function sampleProject(status = "accepted") {
  return {
    projectId: "project-1",
    title: "证据递进广告",
    target: "minimaxH3",
    durationSeconds: 75,
    template: { id: "t8-template", title: "证据递进", hash: "a".repeat(64) },
    templateSnapshot: { summary: "通过结果到证据的递进完成产品证明", requiredAnchors: ["结果", "证据", "行动"], creativeDna: { mechanism: "先展示结果，再逐层给出证据，最后回收到行动。", anti_copy_exclusions: ["不得复用原品牌"] } },
    creativePlan: {
      shots: [{ shotId: "shot-1", startSeconds: 0, endSeconds: 75, action: "展示", stateChange: "完成证明" }],
      continuityLocks: [{ entityId: "product", name: "产品", invariants: ["材质不变"] }],
      mediaAssignments: [{ mediaId: "m1", role: "product", notes: "仅参考产品几何" }]
    },
    media: [{ mediaId: "m1", name: "product.png", kind: "image", sha256: "d".repeat(64) }],
    revisions: [{ revisionId: "r1", source: "initial", status, output: "0–75秒，完整产品广告提示词。", outputSha256: "b".repeat(64), validation: { status: "pass", shotCoverage: { ratio: 1 } } }],
    selectedRevisionId: "r1",
    resultReview: { failures: [] }
  };
}

test("formal ComfyUI handoff is accepted-only, direct-final and isolated", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-handoff-"));
  try {
    assert.throws(() => exportHandoff({ project: sampleProject("draft"), revisionId: "r1", parentDirectory: root }), /Only an accepted/u);
    const first = exportHandoff({ project: sampleProject(), revisionId: "r1", parentDirectory: root, now: new Date("2026-08-27T01:00:00.000Z") });
    const second = exportHandoff({ project: sampleProject(), revisionId: "r1", parentDirectory: root, now: new Date("2026-08-27T01:00:01.000Z") });
    assert.notEqual(first.directoryName, second.directoryName);
    for (const required of ["manifest.json", "prompt.md", "creative-plan.json", "media-roles.json", "validation-report.md", "README.md", "comfyui-adapter.json"]) assert.equal(fs.existsSync(path.join(first.directory, required)), true);
    const manifest = JSON.parse(fs.readFileSync(path.join(first.directory, "manifest.json"), "utf8"));
    assert.equal(manifest.directFinal, true);
    assert.equal(manifest.execute, false);
    assert.equal(manifest.credentialsIncluded, false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("personal Skill draft has frontmatter, dual-model prompts and two transfer tests", () => {
  const project = sampleProject();
  const draft = skillDraft(project, project.revisions[0]);
  const validation = validateSkillFiles(draft.files);
  assert.equal(validation.status, "pass");
  assert.match(draft.files["SKILL.md"], /^---\nname:/u);
  assert.match(draft.files["references/transfer-tests.md"], /Test A[\s\S]*Test B/u);
  assert.ok(draft.files["prompts/minimax-h3.md"]);
  assert.ok(draft.files["prompts/seedance-2.0.md"]);
});

test("personal Skill export accepts normalized string continuity invariants and numeric coverage", () => {
  const normalized = sampleProject();
  normalized.creativePlan.continuityLocks[0].invariants = "材质不变；标志位置不变";
  normalized.revisions[0].validation = { status: "pass", shotCoverage: 1, continuityCoverage: 0.5 };
  const draft = skillDraft(normalized, normalized.revisions[0]);
  assert.match(draft.files["SKILL.md"], /材质不变/u);
  const handoff = handoffFiles(normalized, normalized.revisions[0]);
  assert.match(handoff["validation-report.md"], /Shot coverage: 1/u);
  assert.match(handoff["validation-report.md"], /Continuity coverage: 0.5/u);
});

test("artifact validation rejects secret-like strings and absolute local paths", () => {
  const secret = sampleProject();
  secret.revisions[0].output = "Bearer " + "x".repeat(32);
  assert.throws(() => handoffFiles(secret, secret.revisions[0]) && exportHandoff({ project: secret, revisionId: "r1", parentDirectory: os.tmpdir() }), /secret/u);
  const absolute = sampleProject();
  absolute.revisions[0].output = ["Load ", "C", ":", "\\", "Users", "\\", "Alice", "\\", "secret.png"].join("");
  assert.throws(() => exportHandoff({ project: absolute, revisionId: "r1", parentDirectory: os.tmpdir() }), /absolute local path/u);
});
