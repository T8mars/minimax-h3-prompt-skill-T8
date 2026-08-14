const assert = require("node:assert/strict");
const test = require("node:test");
const { Music3Orchestrator } = require("../lib/music3-orchestrator.cjs");

const validCaption = [
  "### Global Metadata",
  "中文民谣，中速，温暖但克制。",
  "### Vocal Details",
  "单人自然主唱，副歌加入轻柔和声。",
  "### Arrangement",
  "Verse 由木吉他开始；Chorus 加入弦乐并扩大声场。"
].join("\n\n");

function response(content, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get() { return null; } },
    async text() { return status >= 200 && status < 300 ? JSON.stringify({ choices: [{ message: { content } }] }) : String(content); }
  };
}

function vault(key, providerId) {
  return {
    status(id) { return { providerId: id, configured: id === providerId, source: "session" }; },
    resolve(id) { return { key: id === providerId ? key : "", source: "session" }; }
  };
}

function input(providerId) {
  return {
    providerId,
    baseUrl: providerId === "openai_compatible" ? "https://example.test" : "",
    model: providerId === "openai_compatible" ? "test-model" : "",
    musicIdea: "温暖中文民谣，木吉他和轻柔弦乐",
    lyricsMode: "preserve",
    lyricsLanguage: "zh",
    lyrics: "[Verse]\n这句歌词属于用户，不应进入报告",
    qualityMode: "fast",
    captionLanguage: "zh-CN",
    stageCache: "off"
  };
}

async function finish(orchestrator, runId) {
  for (let index = 0; index < 200; index += 1) {
    const run = orchestrator.status(runId);
    if (run.state !== "running") return run;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Music 3 run did not finish");
}

test("Seedance gateway retries only definitive 503 failures and records physical attempts", async () => {
  let attempts = 0;
  const orchestrator = new Music3Orchestrator({
    credentialVault: vault("retry-secret", "seedance_nz"),
    fetchImpl: async () => { attempts += 1; return attempts < 3 ? response("gateway unavailable", 503) : response(validCaption); }
  });
  const plan = orchestrator.preflight(input("seedance_nz"));
  const run = await finish(orchestrator, orchestrator.start({ planHash: plan.planHash, confirmed: true }).runId);
  assert.equal(run.state, "completed");
  assert.equal(attempts, 3);
  assert.equal(run.receipt.logicalRequestCount, 3);
  assert.equal(run.receipt.stages[0].attempts, 3);
});

test("non-Seedance providers do not inherit gateway retries", async () => {
  let attempts = 0;
  const orchestrator = new Music3Orchestrator({
    credentialVault: vault("no-retry-secret", "t8star_workshop"),
    fetchImpl: async () => { attempts += 1; return response("gateway unavailable", 503); }
  });
  const plan = orchestrator.preflight(input("t8star_workshop"));
  const run = await finish(orchestrator, orchestrator.start({ planHash: plan.planHash, confirmed: true }).runId);
  assert.equal(run.state, "failed");
  assert.equal(attempts, 1);
});

test("Music 3 report and public receipt exclude credentials, raw lyrics, prompts and template bodies", async () => {
  const secret = "unique-key-never-export";
  const orchestrator = new Music3Orchestrator({ credentialVault: vault(secret, "t8star_workshop"), fetchImpl: async () => response(validCaption) });
  const plan = orchestrator.preflight(input("t8star_workshop"));
  const run = await finish(orchestrator, orchestrator.start({ planHash: plan.planHash, confirmed: true }).runId);
  const publicArtifacts = `${run.outputs.enhancementReportJson}\n${JSON.stringify(run.receipt)}\n${JSON.stringify(run.validation)}`;
  assert.doesNotMatch(publicArtifacts, new RegExp(secret, "u"));
  assert.doesNotMatch(publicArtifacts, /这句歌词属于用户|system prompt|user prompt|template body/iu);
  assert.match(publicArtifacts, /lyrics_sha256|outputHashes/u);
});

