const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { loadCatalog } = require("../lib/catalog.cjs");
const { CreativeIntelligence } = require("../lib/creative-intelligence.cjs");
const { buildTemplateIndex } = require("../lib/template-index.cjs");

const repoRoot = path.resolve(__dirname, "../../..");

function templateIndex() {
  return buildTemplateIndex(loadCatalog({
    catalogRoot: path.join(repoRoot, "catalog"),
    skillsRoot: path.join(repoRoot, "skills"),
    mediaRoot: null
  }));
}

function response(content, id = "fake-request") {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => JSON.stringify({ id, choices: [{ message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 10, completion_tokens: 10 } })
  };
}

test("template recommendation makes two confirmed model calls and reports full-index coverage without padding", async () => {
  const index = templateIndex();
  const calls = [];
  const target = "t8-case-motion-contact-paint-trail-accumulation-v1";
  const outputs = [
    { subject: ["成年女人"], actions: ["跳舞", "舞蹈", "dance", "dancer", "choreography", "performer"], goals: ["表演"], styles: [], camera: [], emotion: [], sound: [], constraints: [], exclusions: [], ambiguity: "" },
    { recommendations: [{ templateId: target, score: 96, confidence: "high", reasons: ["该机制明确包含三人群舞、中心领舞与同步动作收束。"], risks: ["原模板是群舞，单人版本需保留动作递进但移除队形。"], missingInformation: [] }], clarification: "" }
  ];
  const intelligence = new CreativeIntelligence({
    credentialVault: { resolve: () => ({ key: "test-key" }) },
    fetchImpl: async (_url, request) => {
      calls.push(JSON.parse(request.body));
      return response(outputs.shift(), `fake-${calls.length}`);
    }
  });
  const execution = await intelligence.execute({
    operation: "recommend_templates",
    providerId: "t8star_workshop",
    model: "test-model",
    locale: "zh-CN",
    confirmed: true,
    input: { intent: "一个女人在跳舞", durationSeconds: 15 },
    templateIndex: index
  });
  assert.equal(calls.length, 2);
  assert.equal(execution.modelCallCount, 2);
  assert.equal(execution.result.coverage.indexed, index.recommendationEntities.length);
  assert.equal(execution.result.coverage.examined, index.recommendationEntities.length);
  assert.equal(execution.result.recommendations.length, 1, "recommendations must not be padded to three");
  assert.equal(execution.result.recommendations[0].templateId, target);
  assert.match(calls[0].messages[0].content, /intent-understanding/u);
  assert.match(calls[1].messages[0].content, /semantic and creative-mechanism fit/u);
});

test("creative intelligence never calls a provider without explicit confirmation", async () => {
  let calls = 0;
  const intelligence = new CreativeIntelligence({
    credentialVault: { resolve: () => ({ key: "test-key" }) },
    fetchImpl: async () => { calls += 1; return response({}); }
  });
  await assert.rejects(() => intelligence.execute({
    operation: "template_proposal",
    providerId: "t8star_workshop",
    model: "test-model",
    input: {}
  }), /explicitly confirmed/u);
  assert.equal(calls, 0);
});

test("local Qwen can generate a creative shot plan without any cloud transport", async () => {
  let localCalls = 0;
  let closed = 0;
  const localQwen = {
    status: () => ({ configured: true, textReady: true }),
    beginSession: async () => ({
      complete: async () => {
        localCalls += 1;
        return {
          output: JSON.stringify({
            shots: [
              { shotId: "shot-01", startSeconds: 0, endSeconds: 7.5, action: "建立舞者动作", camera: "全身跟拍", sceneChange: "", sound: "节拍进入", onScreenText: "", continuity: "身份不变" },
              { shotId: "shot-02", startSeconds: 7.5, endSeconds: 15, action: "动作升级后定格", camera: "环绕后停稳", sceneChange: "灯光增强", sound: "重拍收束", onScreenText: "", continuity: "身份不变" }
            ],
            continuityLocks: [{ entityId: "entity-01", type: "character", name: "成年舞者", invariants: "面容、发型与服装主色不变", mediaIds: [] }]
          }),
          receipt: { providerId: "local_qwen", attempts: 1 }
        };
      },
      close: async () => { closed += 1; }
    })
  };
  const intelligence = new CreativeIntelligence({
    credentialVault: { resolve: () => { throw new Error("cloud credential must not be read"); } },
    localQwen,
    fetchImpl: async () => { throw new Error("cloud transport must not run"); }
  });
  const execution = await intelligence.execute({
    operation: "create_shot_plan",
    providerId: "local_qwen",
    model: "qwen3.8-27b",
    locale: "zh-CN",
    confirmed: true,
    input: { intent: "一个女人在跳舞", durationSeconds: 15 }
  });
  assert.equal(localCalls, 1);
  assert.equal(closed, 1);
  assert.equal(execution.modelCallCount, 1);
  assert.equal(execution.result.shots.length, 2);
});
