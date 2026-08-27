const assert = require("node:assert/strict");
const test = require("node:test");
const {
  MAX_DURATION_SECONDS,
  normalizeCreativePlan,
  normalizeDuration,
  validateCreativePlan
} = require("../lib/creative-plan.cjs");

test("custom duration is no longer capped at 15 or 30 seconds", () => {
  assert.equal(normalizeDuration(30), 30);
  assert.equal(normalizeDuration(45.5), 45.5);
  assert.equal(normalizeDuration(600), 600);
  assert.throws(() => normalizeDuration(0), /greater than 0/u);
  assert.throws(() => normalizeDuration(MAX_DURATION_SECONDS + 1), /no more than/u);
});

test("shot plans detect overlaps, gaps, bad boundaries and excessive density", () => {
  const result = validateCreativePlan({
    durationSeconds: 20,
    shots: [
      { shotId: "shot-a", startSeconds: 1, endSeconds: 8, action: "A" },
      { shotId: "shot-b", startSeconds: 7, endSeconds: 12, action: "B" },
      { shotId: "shot-c", startSeconds: 14, endSeconds: 18, action: "C" }
    ]
  });
  assert.equal(result.status, "fail");
  const codes = result.errors.map((item) => item.code);
  assert.ok(codes.includes("shot_plan_leading_gap"));
  assert.ok(codes.includes("shot_overlap"));
  assert.ok(codes.includes("shot_gap"));
  assert.ok(codes.includes("shot_plan_trailing_gap"));
});

test("media responsibilities and continuity locks stay bound to known IDs", () => {
  const plan = normalizeCreativePlan({
    durationSeconds: 42,
    intent: "A product proof film",
    media: [{ mediaId: "media-1", label: "<Picture 1>" }],
    shots: [
      { shotId: "opening", startSeconds: 0, endSeconds: 12, action: "Show the result" },
      { shotId: "proof", startSeconds: 12, endSeconds: 34, action: "Prove the mechanism" },
      { shotId: "finish", startSeconds: 34, endSeconds: 42, action: "Return to the product and hold the final frame" }
    ],
    continuityLocks: [{ entityId: "hero", type: "product", name: "SOLVERA", invariants: "Same silhouette and materials", mediaIds: ["media-1", "missing"] }],
    mediaAssignments: [{ mediaId: "media-1", role: "product", notes: "Identity only", shotIds: ["opening", "finish", "missing"], entityIds: ["hero", "missing"] }]
  });
  assert.equal(plan.durationSeconds, 42);
  assert.equal(plan.validation.status, "pass");
  assert.deepEqual(plan.continuityLocks[0].mediaIds, ["media-1"]);
  assert.deepEqual(plan.mediaAssignments[0].shotIds, ["opening", "finish"]);
  assert.deepEqual(plan.mediaAssignments[0].entityIds, ["hero"]);
});

test("legacy plans receive one explicit full-duration shot instead of failing old projects", () => {
  const plan = normalizeCreativePlan({ durationSeconds: 75, intent: "Keep the subject moving toward the final proof." });
  assert.equal(plan.shots.length, 1);
  assert.equal(plan.shots[0].endSeconds, 75);
  assert.equal(plan.shots[0].source, "legacy_intent");
});
