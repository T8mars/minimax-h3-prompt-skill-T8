const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildVariantRequest,
  compareRevisions,
  musicToVideoFacts,
  normalizeReview,
  videoToMusicFacts
} = require("../lib/creative-loop.cjs");

function project() {
  return {
    projectId: "project-1",
    intent: "一名成年跑者穿越雨夜城市后抵达终点",
    constraints: "身份不变",
    durationSeconds: 45,
    target: "minimaxH3",
    template: { hash: "a".repeat(64) },
    templateSnapshot: { requiredAnchors: ["抵达终点"] },
    creativePlan: {
      shots: [
        { shotId: "shot-1", startSeconds: 0, endSeconds: 20, action: "奔跑", stateChange: "离开起点", sound: "雨声" },
        { shotId: "shot-2", startSeconds: 20, endSeconds: 45, action: "抵达", stateChange: "完成目标", sound: "音乐高潮后静默" }
      ],
      continuityLocks: [{ entityId: "hero", type: "character", invariants: ["同一成年人物"] }]
    },
    revisions: [
      { revisionId: "r1", rootRevisionId: "r1", source: "initial", output: "0秒开场钩子，雨声。20秒跟拍，45秒结尾定格。", outputSha256: "b".repeat(64), validation: { anchorCoverage: { ratio: 1 }, shotCoverage: { ratio: 1 } } },
      { revisionId: "r2", rootRevisionId: "r1", source: "variant", output: "0秒开场，节奏快切。20秒环绕，45秒音乐停顿后最终收束。", outputSha256: "c".repeat(64), validation: { anchorCoverage: { ratio: 1 }, shotCoverage: { ratio: 1 } } }
    ],
    selectedRevisionId: "r1",
    ratings: { r2: { overall: 5 } }
  };
}

test("human result review creates time-bound failures without claiming automatic analysis", () => {
  const review = normalizeReview({
    durationSeconds: 45,
    shots: project().creativePlan.shots,
    mediaId: "result-1",
    observations: [
      { dimension: "identity_continuity", status: "visible", timeSeconds: 3, shotId: "shot-1" },
      { dimension: "causal_order", status: "wrong_order", timeSeconds: 23, shotId: "shot-2", note: "终点先于跨越出现" },
      { dimension: "sound", status: "audible", timeSeconds: 40, shotId: "shot-2" }
    ]
  });
  assert.equal(review.reviewerKind, "human");
  assert.equal(review.status, "needs_repair");
  assert.equal(review.failures.length, 1);
  assert.match(review.repairBrief, /Only repair causal_order/u);
  assert.throws(() => normalizeReview({ durationSeconds: 45, shots: project().creativePlan.shots, observations: [{ dimension: "camera", status: "audible", timeSeconds: 2 }] }), /non-audio/u);
});

test("three variants retain one hard-anchor hash while exposing materially different axes", () => {
  const variants = ["conservative", "director", "surprise"].map((style) => buildVariantRequest(project(), style));
  assert.equal(new Set(variants.map((item) => item.hardAnchorHash)).size, 1);
  assert.equal(new Set(variants.map((item) => item.instruction)).size, 3);
  assert.deepEqual(variants.map((item) => item.plannedLogicalRequests), [1, 1, 1]);
  const comparison = compareRevisions(project(), ["r1", "r2"]);
  assert.equal(comparison.rows.length, 2);
  assert.equal(comparison.rows[1].userRating, 5);
  const numericCoverage = compareRevisions({ ...project(), revisions: project().revisions.map((item) => ({ ...item, validation: { anchorCoverage: 0.75, shotCoverage: 0.5 } })) }, ["r1", "r2"]);
  assert.equal(numericCoverage.rows[0].anchorCoverage, 0.75);
  assert.equal(numericCoverage.rows[0].shotCoverage, 0.5);
});

test("Video and Music 3 exact facts stay deterministic while creative suggestions are delegated to AI", () => {
  const bridge = videoToMusicFacts(project(), "r1");
  assert.deepEqual(bridge.beatPoints, [0, 20, 45]);
  assert.equal(bridge.sourceRevisionSha256, "b".repeat(64));
  const reverse = musicToVideoFacts({ projectId: "music-1", fixedBpm: 0, outputs: { musicCaption: "BPM: 150\n[Intro]\n[Chorus]", music3PayloadJson: "{}" } });
  assert.equal(reverse.bpm, 150);
  assert.equal(reverse.overwriteShots, false);
  assert.equal(reverse.suggestionsOnly, true);
});
