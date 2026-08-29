const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { PromptProjectStore, sanitizeProject } = require("../lib/prompt-projects.cjs");

function base() {
  return {
    capability: "video_prompt",
    title: "Revision demo",
    intent: "A 30-second product proof.",
    durationSeconds: 30,
    output: "Shot 1 0-30 seconds: a wide camera follows the same product through a complete visible proof and holds the result.",
    validation: { status: "pass" },
    creativePlan: {
      shots: [{ shotId: "shot-01", startSeconds: 0, endSeconds: 30, action: "Complete visible proof", camera: "wide follow" }],
      mediaAssignments: [],
      continuityLocks: []
    }
  };
}

test("legacy single-output projects migrate to v4 with an immutable initial revision", () => {
  const project = sanitizeProject(base(), { id: "project-1", now: "2026-08-27T00:00:00.000Z" });
  assert.equal(project.schemaVersion, "t8-prompt-project/v4");
  assert.equal(project.revisions.length, 1);
  assert.equal(project.revisions[0].source, "initial");
  assert.equal(project.durationSeconds, 30);
  assert.equal(project.creativePlan.shots[0].endSeconds, 30);
});

test("manual revisions retain the original output and acceptance state", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t8-revisions-"));
  try {
    let sequence = 0;
    const store = new PromptProjectStore({ userDataDir: dir, randomUUID: () => `uuid-${++sequence}`, now: () => `2026-08-27T00:00:0${sequence}.000Z` });
    const initial = store.save(base());
    const manual = store.addRevision(initial.projectId, {
      parentRevisionId: initial.selectedRevisionId,
      source: "manual",
      output: `${initial.output}\nManual continuity lock.`,
      validation: { status: "warning" },
      note: "Tightened continuity"
    });
    assert.equal(manual.revisions.length, 2);
    assert.equal(manual.revisions[1].output, initial.output);
    const accepted = store.setRevisionStatus(manual.projectId, manual.selectedRevisionId, "accepted_with_override", "Human reviewed");
    assert.equal(accepted.acceptanceStatus, "accepted_with_override");
    assert.equal(accepted.stage, "accepted");
    assert.equal(accepted.revisions[0].note, "Human reviewed");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
