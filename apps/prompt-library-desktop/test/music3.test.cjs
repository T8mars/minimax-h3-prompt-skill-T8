const assert = require("node:assert/strict");
const test = require("node:test");
const {
  OFFICIAL_NORMALIZED_TREE_SHA256,
  normalizedTreeSha256,
  validateOfficialResources
} = require("../lib/music3-resources.cjs");
const { normalizeMusicPlan } = require("../lib/music3-contract.cjs");
const { Music3Orchestrator } = require("../lib/music3-orchestrator.cjs");

function vault(providerId = "t8star_workshop") {
  return {
    status(id) { return { providerId: id, configured: id === providerId, source: "session" }; },
    resolve(id) { return { key: id === providerId ? "test-key-not-a-real-secret" : "", source: "session" }; }
  };
}

function response(content, status = 200, extra = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get(name) { return name === "x-request-id" ? extra.requestId || "req-test" : null; } },
    async text() { return status >= 200 && status < 300 ? JSON.stringify({ id: extra.requestId || "req-test", choices: [{ message: { content } }], usage: { total_tokens: 12 } }) : String(content); }
  };
}

async function finish(orchestrator, runId) {
  for (let index = 0; index < 100; index += 1) {
    const run = orchestrator.status(runId);
    if (run.state !== "running") return run;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("Music 3 run did not finish");
}

function fastPreserve(providerId, overrides = {}) {
  return {
    providerId,
    baseUrl: providerId === "openai_compatible" ? "https://example.test" : "",
    model: providerId === "openai_compatible" ? "test-model" : "",
    musicIdea: "一首温暖的中文民谣，木吉他与克制弦乐，副歌逐步打开",
    lyricsMode: "preserve",
    lyricsLanguage: "zh",
    lyrics: "[Verse]\n走过安静的街\n\n[Chorus]\n让微光慢慢升起",
    qualityMode: "fast",
    captionLanguage: "zh-CN",
    ...overrides
  };
}

const validCaption = [
  "### Global Metadata",
  "中文民谣，温暖而克制，中速推进，木吉他承担核心节奏。",
  "### Vocal Details",
  "单人主唱保持自然近距离质感，副歌增加轻柔和声。",
  "### Arrangement",
  "Verse 由木吉他和极轻环境层开始；Chorus 加入弦乐并扩大声场，尾段收回。"
].join("\n\n");

test("bundled official Music 3 snapshot matches the node contract", () => {
  const value = validateOfficialResources();
  assert.equal(value.indexes.length, 18);
  assert.equal(value.templates.length, 1000);
  assert.equal(normalizedTreeSha256(), OFFICIAL_NORMALIZED_TREE_SHA256);
});

test("Music 3 normalization defaults caption output to Chinese and resolves AUTO safely", () => {
  const generated = normalizeMusicPlan({ providerId: "t8star_workshop", musicIdea: "中文流行抒情歌，钢琴", lyricsMode: "auto" });
  assert.equal(generated.captionLanguage, "zh-CN");
  assert.equal(generated.effectiveLyricsMode, "generate");
  assert.equal(generated.effectiveLyricsLanguage, "zh");
  assert.deepEqual(generated.localFamilies, ["east-asian-modern"]);
  assert.deepEqual(generated.requestBudget, { minimum: 3, maximum: 4, stages: ["lyrics", "select", "caption", "language-repair-if-needed"] });

  const instrumental = normalizeMusicPlan({ providerId: "t8star_workshop", musicIdea: "pure instrumental ambient score, no vocals", lyricsMode: "auto", qualityMode: "fast" });
  assert.equal(instrumental.effectiveLyricsMode, "instrumental");
  assert.equal(instrumental.requestBudget.minimum, 1);
});

test("ambiguous lyric edits fail before any paid request", () => {
  assert.throws(() => normalizeMusicPlan({
    providerId: "t8star_workshop",
    musicIdea: "润色一首流行歌",
    lyricsMode: "edit",
    lyrics: "[Verse]\n原歌词\n[Chorus]\n原副歌",
    lyricsEditRequest: "请改得更好",
    lyricsEditScope: "auto"
  }), (error) => error.code === "edit_scope_ambiguous");
});

for (const providerId of ["seedance_nz", "t8star_workshop", "openai_compatible"]) {
  test(`text-only Music 3 request works through ${providerId} without changing provider semantics`, async () => {
    const requests = [];
    const orchestrator = new Music3Orchestrator({
      credentialVault: vault(providerId),
      fetchImpl: async (url, init) => {
        requests.push({ url: String(url), body: JSON.parse(init.body) });
        return response(validCaption);
      }
    });
    const preflight = orchestrator.preflight(fastPreserve(providerId));
    assert.equal(preflight.logicalCallsMinimum, 1);
    assert.equal(preflight.captionLanguage, "zh-CN");
    const started = orchestrator.start({ planHash: preflight.planHash, confirmed: true });
    assert.throws(() => orchestrator.start({ planHash: preflight.planHash, confirmed: true }), (error) => error.code === "plan_already_consumed");
    const finished = await finish(orchestrator, started.runId);
    assert.equal(finished.state, "completed");
    assert.equal(finished.validation.status, "pass");
    assert.equal(finished.outputs.musicCaption, validCaption);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].body.stream, false);
    assert.equal(typeof requests[0].body.temperature, "number");
    assert.match(requests[0].url, /\/v1\/chat\/completions$/u);
  });
}

test("full-quality generated lyrics use progressive disclosure and return all four outputs", async () => {
  const replies = [
    "[Verse]\n潮声落在空杯边\n\n[Chorus]\n我们把微光唱远",
    JSON.stringify({ template_ids: ["c-pop-dance-pop-electronic_0001"] }),
    validCaption
  ];
  const orchestrator = new Music3Orchestrator({
    credentialVault: vault(),
    fetchImpl: async () => response(replies.shift())
  });
  const preflight = orchestrator.preflight({
    providerId: "t8star_workshop",
    musicIdea: "华语流行情歌，女声，钢琴与弦乐，从脆弱走向坚定",
    lyricsMode: "generate",
    lyricsLanguage: "zh",
    qualityMode: "full",
    captionLanguage: "zh-CN",
    structurePreset: "verse_chorus"
  });
  assert.deepEqual(preflight.plannedStages, ["lyrics", "select", "caption", "language-repair-if-needed"]);
  const finished = await finish(orchestrator, orchestrator.start({ planHash: preflight.planHash, confirmed: true }).runId);
  assert.equal(finished.state, "completed");
  assert.match(finished.outputs.lyrics, /^\[Verse\]/u);
  assert.deepEqual(JSON.parse(finished.outputs.music3PayloadJson), { input: finished.outputs.lyrics, instructions: validCaption });
  const report = JSON.parse(finished.outputs.enhancementReportJson);
  assert.equal(report.schema_version, "t8-music3-enhancement-report/v1");
  assert.equal(report.family_index_count, 1);
  assert.equal(report.reference_count, 1);
  assert.equal(report.request_count, 3);
});

test("successful stages are cached for ten-minute continuation without another POST", async () => {
  let requests = 0;
  const orchestrator = new Music3Orchestrator({ credentialVault: vault(), fetchImpl: async () => { requests += 1; return response(validCaption); } });
  const runOnce = async () => {
    const preflight = orchestrator.preflight(fastPreserve("t8star_workshop"));
    return finish(orchestrator, orchestrator.start({ planHash: preflight.planHash, confirmed: true }).runId);
  };
  assert.equal((await runOnce()).receipt.cacheHits, 0);
  assert.equal((await runOnce()).receipt.cacheHits, 1);
  assert.equal(requests, 1);
});

test("unknown network outcome is never retried by the Music 3 outer orchestrator", async () => {
  let attempts = 0;
  const orchestrator = new Music3Orchestrator({
    credentialVault: vault("seedance_nz"),
    fetchImpl: async () => { attempts += 1; throw new Error("socket closed"); }
  });
  const preflight = orchestrator.preflight(fastPreserve("seedance_nz"));
  const finished = await finish(orchestrator, orchestrator.start({ planHash: preflight.planHash, confirmed: true }).runId);
  assert.equal(finished.state, "failed");
  assert.equal(finished.error.outcomeCertainty, "unknown");
  assert.equal(attempts, 1);
});
