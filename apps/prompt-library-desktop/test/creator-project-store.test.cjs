const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { PromptProjectStore, PROJECT_SCHEMA } = require("../lib/prompt-projects.cjs");

function base(output = "0秒开场，15秒结束") {
  return {
    title: "Creator project",
    intent: "产品广告",
    constraints: "品牌不变",
    templateId: "template-1",
    templateTitle: "证据递进",
    templateHash: "a".repeat(64),
    templateSnapshot: { id: "template-1", title: "证据递进", requiredAnchors: ["结果"] },
    target: "minimaxH3",
    outputLanguage: "zh-CN",
    durationSeconds: 15,
    rewriteMode: "balanced",
    providerId: "seedance_nz",
    providerLabel: "Seedance",
    endpointHost: "api.seedance.nz",
    model: "model",
    output,
    validation: { status: "pass" },
    media: []
  };
}

function withStore(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-creator-store-"));
  let counter = 0;
  const store = new PromptProjectStore({ userDataDir: root, randomUUID: () => `id-${++counter}`, now: () => `2026-08-27T00:00:0${counter}.000Z` });
  try { return run(store); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test("v4 project retains frozen template, result review and a one-repair-per-root invariant", () => withStore((store) => {
  const project = store.save(base());
  assert.equal(project.schemaVersion, PROJECT_SCHEMA);
  assert.equal(project.templateSnapshot.id, "template-1");
  const root = project.revisions[0];
  assert.equal(store.canRepair(project.projectId, root.revisionId), true);
  const repaired = store.addRevision(project.projectId, { parentRevisionId: root.revisionId, rootRevisionId: root.revisionId, repairOfRevisionId: root.revisionId, source: "repair", output: "0秒修复开场，15秒结束", validation: { status: "pass" } });
  assert.equal(repaired.revisions[0].source, "repair");
  assert.equal(store.canRepair(project.projectId, root.revisionId), false);
  assert.throws(() => store.addRevision(project.projectId, { parentRevisionId: root.revisionId, rootRevisionId: root.revisionId, source: "repair", output: "第二次修复" }), /one allowed repair/u);
}));

test("project board filters stages and effect stats keep a real denominator", () => withStore((store) => {
  const first = store.save(base("first"));
  store.setRevisionStatus(first.projectId, first.revisions[0].revisionId, "accepted");
  store.saveRating(first.projectId, first.revisions[0].revisionId, { overall: 5 });
  const second = store.save({ ...base("second"), templateHash: "a".repeat(64) });
  const review = { status: "needs_repair", failures: [{ dimension: "camera" }] };
  store.saveReview(second.projectId, { resultMedia: [], review });
  const board = store.board({ stages: ["accepted"] });
  assert.equal(board.length, 1);
  const stats = store.effectStats();
  assert.equal(stats[0].denominator, 2);
  assert.equal(stats[0].accepted, 1);
  assert.equal(stats[0].successRate, 0.5);
  assert.equal(stats[0].failureTags.camera, 1);
}));

test("hash-bound Music timing suggestions persist on the target video project without changing shots", () => withStore((store) => {
  const project = store.save(base());
  const shotsBefore = structuredClone(project.creativePlan.shots);
  const bridge = {
    schemaVersion: "t8-music-video-bridge/v1",
    sourceCapability: "music3",
    sourceProjectId: "music-project-1",
    sourceOutputHash: "b".repeat(64),
    beatIntervalSeconds: 0.5,
    suggestionsOnly: true,
    overwriteShots: false,
    bridgeHash: "c".repeat(64)
  };
  const saved = store.saveBridge(project.projectId, bridge);
  assert.deepEqual(saved.bridges, [bridge]);
  assert.deepEqual(saved.creativePlan.shots, shotsBefore);
  assert.deepEqual(store.get(project.projectId).bridges, [bridge]);
}));
