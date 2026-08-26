const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  COMPATIBILITY_SOURCE_COMMIT,
  DEFAULT_MMPROJ_FILENAME,
  DEFAULT_MODEL_FILENAME,
  HERETIC_9B_MMPROJ_FILENAME,
  HERETIC_9B_MODEL_FILENAME,
  LocalQwenConfigStore,
  SUPPORTED_PROJECTORS,
  SUPPORTED_MODELS,
  UNCENSORED_MODEL_FILENAME
} = require("../lib/local-qwen-config.cjs");
const { buildLocalMediaParts, messagesWithLocalMedia } = require("../lib/local-qwen-media.cjs");
const { LocalQwenManager } = require("../lib/local-qwen-runtime.cjs");
const { normalizePlan } = require("../lib/prompt-providers.cjs");
const { PromptOrchestrator } = require("../lib/prompt-orchestrator.cjs");
const { Music3Orchestrator } = require("../lib/music3-orchestrator.cjs");

function digest(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function temporaryRoot() { return fs.mkdtempSync(path.join(os.tmpdir(), "t8-local-qwen-")); }
function response(output) {
  return { output, receipt: { requestId: null, usage: null, durationMs: 4, outputSha256: digest(Buffer.from(output)) } };
}
async function finished(orchestrator, runId) {
  for (let index = 0; index < 40; index += 1) {
    const run = orchestrator.status(runId);
    if (run.state !== "running") return run;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("local run did not finish");
}

test("local provider preserves both verified 27B models and adds the verified lightweight 9B model", () => {
  assert.deepEqual(Object.keys(SUPPORTED_MODELS), [DEFAULT_MODEL_FILENAME, UNCENSORED_MODEL_FILENAME, HERETIC_9B_MODEL_FILENAME]);
  assert.equal(SUPPORTED_MODELS[DEFAULT_MODEL_FILENAME].size, 17_106_775_008);
  assert.equal(SUPPORTED_MODELS[UNCENSORED_MODEL_FILENAME].size, 16_810_714_976);
  assert.equal(SUPPORTED_MODELS[HERETIC_9B_MODEL_FILENAME].size, 7_359_260_416);
  assert.equal(DEFAULT_MMPROJ_FILENAME, "mmproj-F16.gguf");
  assert.equal(SUPPORTED_PROJECTORS[HERETIC_9B_MMPROJ_FILENAME].size, 921_704_448);
  assert.equal(COMPATIBILITY_SOURCE_COMMIT, "a8164eafd6c89c7437e1a9255b8684fb569b226f");
});

test("existing v1 local Qwen settings migrate to automatic projector matching without losing the selected 27B model", () => {
  const root = temporaryRoot();
  try {
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, "local-qwen-provider-v1.json"), JSON.stringify({
      schemaVersion: "t8-local-qwen-config/v1",
      modelFilename: UNCENSORED_MODEL_FILENAME,
      contextSize: 32768,
      maxTokens: 4096,
      verifiedFiles: {},
      runtimeVerification: {}
    }));
    const status = new LocalQwenConfigStore({ userDataDir: root }).status();
    assert.equal(status.modelFilename, UNCENSORED_MODEL_FILENAME);
    assert.equal(status.projectorFilename, "AUTO");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("local model paths stay in Main-owned user data and become ready only after full verification", async () => {
  const root = temporaryRoot();
  try {
    const userDataDir = path.join(root, "user-data");
    const modelDirectory = path.join(root, "models");
    fs.mkdirSync(modelDirectory);
    const modelBytes = Buffer.from("GGUFsmall deterministic model fixture");
    const projectorBytes = Buffer.from("GGUFsmall deterministic projector fixture");
    fs.writeFileSync(path.join(modelDirectory, DEFAULT_MODEL_FILENAME), modelBytes);
    fs.writeFileSync(path.join(modelDirectory, DEFAULT_MMPROJ_FILENAME), projectorBytes);
    const runtimeExecutable = path.join(root, process.platform === "win32" ? "llama-server.exe" : "llama-server");
    const ffmpegExecutable = path.join(root, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
    const ffprobeExecutable = path.join(root, process.platform === "win32" ? "ffprobe.exe" : "ffprobe");
    fs.writeFileSync(runtimeExecutable, "runtime");
    fs.writeFileSync(ffmpegExecutable, "ffmpeg");
    fs.writeFileSync(ffprobeExecutable, "ffprobe");
    const store = new LocalQwenConfigStore({
      userDataDir,
      modelSpecifications: {
        [DEFAULT_MODEL_FILENAME]: { id: "official", label: "fixture", filename: DEFAULT_MODEL_FILENAME, size: modelBytes.length, sha256: digest(modelBytes) },
        [UNCENSORED_MODEL_FILENAME]: SUPPORTED_MODELS[UNCENSORED_MODEL_FILENAME]
      },
      visionProjector: { filename: DEFAULT_MMPROJ_FILENAME, size: projectorBytes.length, sha256: digest(projectorBytes) },
      runtimeVerifier: async () => ({ versionOutput: "version: 0.1.0-dev (build 10436, commit 6fed9f6ff)" })
    });
    let status = store.set({ modelDirectory, runtimeExecutable, ffmpegExecutable, modelFilename: DEFAULT_MODEL_FILENAME });
    assert.equal(status.configured, false);
    assert.equal(status.model.sizeMatch, true);
    assert.equal(status.model.verified, false);
    status = await store.verify();
    assert.equal(status.textReady, true);
    assert.equal(status.visionReady, true);
    assert.equal(status.videoReady, true);
    assert.equal(status.runtime.verified, true);
    assert.equal(JSON.parse(fs.readFileSync(path.join(userDataDir, "local-qwen-provider-v1.json"), "utf8")).modelDirectory, modelDirectory);
    assert.equal(store.set({ modelFilename: "unreviewed-model.gguf" }).modelFilename, "unreviewed-model.gguf");
    assert.throws(() => store.set({ modelFilename: "../escape.gguf" }), /relative \.gguf path/u);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("local provider recursively discovers and integrity-verifies user GGUF models with an automatic projector", async () => {
  const root = temporaryRoot();
  try {
    const userDataDir = path.join(root, "user-data");
    const modelDirectory = path.join(root, "models");
    const nested = path.join(modelDirectory, "Custom", "Qwen3-4B");
    fs.mkdirSync(nested, { recursive: true });
    const modelIdentifier = "Custom/Qwen3-4B/Qwen3-4B-Q4_K_M.gguf";
    const projectorIdentifier = "Custom/Qwen3-4B/mmproj-Qwen3-4B-F16.gguf";
    fs.writeFileSync(path.join(modelDirectory, ...modelIdentifier.split("/")), Buffer.from("GGUF-user-model"));
    fs.writeFileSync(path.join(modelDirectory, ...projectorIdentifier.split("/")), Buffer.from("GGUF-user-projector"));
    const runtimeExecutable = path.join(root, process.platform === "win32" ? "llama-server.exe" : "llama-server");
    fs.writeFileSync(runtimeExecutable, "runtime");
    const store = new LocalQwenConfigStore({
      userDataDir,
      runtimeVerifier: async () => ({ versionOutput: "version: 0.1.0-dev (build 10436, commit 6fed9f6ff)" })
    });
    let status = store.set({ modelDirectory, modelFilename: modelIdentifier, projectorFilename: "AUTO", runtimeExecutable });
    assert.equal(status.catalogCounts.models, 1);
    assert.equal(status.catalogCounts.projectors, 1);
    assert.equal(status.resolvedProjectorFilename, projectorIdentifier);
    assert.equal(status.modelOptions[0].projectValidated, false);
    status = await store.verify();
    assert.equal(status.textReady, true);
    assert.equal(status.visionReady, true);
    assert.equal(status.model.integrityVerified, true);
    assert.equal(status.model.projectValidated, false);
    assert.equal(store.requireReady({ vision: true }).mmprojPath, path.join(modelDirectory, ...projectorIdentifier.split("/")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("local image evidence stays hash-bound and enters the final user message", async () => {
  const root = temporaryRoot();
  try {
    const filePath = path.join(root, "reference.png");
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
    fs.writeFileSync(filePath, bytes);
    const record = { filePath, kind: "image", mimeType: "image/png", sha256: digest(bytes), label: "<Picture 1>" };
    const media = await buildLocalMediaParts([record], { videoSampleFps: 2, ffmpegExecutable: "" });
    assert.equal(media.visualPartCount, 1);
    assert.match(media.parts[1].image_url.url, /^data:image\/png;base64,/u);
    const messages = messagesWithLocalMedia([{ role: "system", content: "system" }, { role: "user", content: "intent" }], media.parts);
    assert.equal(Array.isArray(messages[1].content), true);
    fs.writeFileSync(filePath, Buffer.from("changed"));
    await assert.rejects(() => buildLocalMediaParts([record], { videoSampleFps: 2, ffmpegExecutable: "" }), /changed after selection/u);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("local runtime binds a random loopback server, performs one request, and unloads", async () => {
  class FakeChild extends EventEmitter {
    constructor() { super(); this.stdout = new EventEmitter(); this.stderr = new EventEmitter(); this.exitCode = null; }
    kill() { this.exitCode = 0; queueMicrotask(() => this.emit("close", 0)); return true; }
  }
  const spawned = [];
  const child = new FakeChild();
  const settings = {
    runtimeExecutable: path.join(os.tmpdir(), process.platform === "win32" ? "llama-server.exe" : "llama-server"),
    modelPath: path.join(os.tmpdir(), DEFAULT_MODEL_FILENAME), mmprojPath: "", modelFilename: DEFAULT_MODEL_FILENAME,
    contextSize: 32768, maxTokens: 4096, thinkMode: "off", reasoningEffort: "medium", videoSampleFps: 2,
    unloadPolicy: "after_run", cpuThreads: 2, ffmpegExecutable: ""
  };
  const manager = new LocalQwenManager({
    configStore: { status: () => ({ configured: true }), requireReady: () => settings },
    spawnImpl: (executable, args, options) => { spawned.push({ executable, args, options }); return child; },
    fetchImpl: async (url, options = {}) => url.endsWith("/health")
      ? { status: 200 }
      : { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "本地增强结果" } }], usage: { total_tokens: 10 } }) }
  });
  const session = await manager.beginSession();
  const result = await session.complete({ messages: [{ role: "user", content: "test" }], rewriteMode: "balanced", media: [] });
  assert.equal(result.output, "本地增强结果");
  assert.equal(result.receipt.providerId, "local_qwen");
  assert.equal(spawned.length, 1);
  assert.ok(spawned[0].args.includes("127.0.0.1"));
  assert.ok(spawned[0].args.includes("--no-webui"));
  assert.ok(spawned[0].args.includes("--parallel"));
  await session.close();
  assert.equal(manager.server, null);
});

function localStatus() {
  return {
    providerId: "local_qwen", configured: true, source: "local", readiness: "vision", textReady: true, visionReady: true, videoReady: true,
    modelFilename: DEFAULT_MODEL_FILENAME, contextSize: 32768, maxTokens: 4096, thinkMode: "off", reasoningEffort: "medium"
  };
}

function vault() {
  return {
    status: (id) => ({ providerId: id, configured: false, source: null }),
    resolve: () => { throw new Error("credential vault must not resolve a local run"); }
  };
}

test("video prompt orchestration treats local Qwen as compute, not a paid credential", async () => {
  let beginCount = 0;
  const localQwen = {
    status: localStatus,
    async beginSession() {
      beginCount += 1;
      return { complete: async () => response("镜头1 0:00-0:05，主体完成清晰动作。镜头2 0:05-0:15，镜头稳定收束。"), close: async () => {} };
    }
  };
  const orchestrator = new PromptOrchestrator({ credentialVault: vault(), localQwen, randomUUID: () => "local-video-run" });
  const plan = orchestrator.preflight({
    providerId: "local_qwen", model: DEFAULT_MODEL_FILENAME, target: "seedance20", outputLanguage: "zh-CN", durationSeconds: 15, rewriteMode: "balanced",
    intent: "保留主体身份并完成清晰动作", template: { id: "fixture", title: "Fixture", requiredAnchors: [] }
  });
  assert.equal(plan.confirmationKind, "local_compute");
  assert.equal(plan.cost, "0");
  assert.equal(plan.credentialSource, "local");
  const started = orchestrator.start({ planHash: plan.planHash, confirmed: true });
  const run = await finished(orchestrator, started.runId);
  assert.equal(run.state, "completed");
  assert.equal(beginCount, 1);
});

test("Music 3 reuses one local model session across its staged run", async () => {
  let beginCount = 0;
  let completeCount = 0;
  let closeCount = 0;
  const caption = "### Global Metadata\n\nWarm acoustic pop, 92 BPM.\n\n### Vocal Details\n\nFemale lead vocal.\n\n### Arrangement\n\nPiano and acoustic guitar build into a restrained chorus.";
  const localQwen = {
    status: localStatus,
    async beginSession() {
      beginCount += 1;
      return { complete: async () => { completeCount += 1; return response(caption); }, close: async () => { closeCount += 1; } };
    }
  };
  const orchestrator = new Music3Orchestrator({ credentialVault: vault(), localQwen, randomUUID: () => "local-music-run" });
  const plan = orchestrator.preflight({
    providerId: "local_qwen", model: DEFAULT_MODEL_FILENAME, musicIdea: "温暖原声流行歌曲，钢琴与木吉他", lyricsMode: "preserve",
    lyrics: "[Verse]\n走过安静的街\n\n[Chorus]\n让微光慢慢升起", lyricsLanguage: "zh", qualityMode: "fast", captionLanguage: "en"
  });
  assert.equal(plan.confirmationKind, "local_compute");
  assert.equal(plan.cost, "0");
  const started = orchestrator.start({ planHash: plan.planHash, confirmed: true });
  const run = await finished(orchestrator, started.runId);
  assert.equal(run.state, "completed");
  assert.equal(beginCount, 1);
  assert.equal(completeCount, 1);
  assert.equal(closeCount, 1);
});

test("local plans use a non-network endpoint and never enter the remote adapter", () => {
  const plan = normalizePlan({
    providerId: "local_qwen", model: DEFAULT_MODEL_FILENAME, target: "minimaxH3", outputLanguage: "zh-CN", durationSeconds: 15,
    intent: "A local prompt test", template: { id: "fixture", title: "Fixture" }
  });
  assert.equal(plan.endpoint, "local://qwen");
  assert.equal(plan.endpointHost, "local");
});

test("changing local execution settings invalidates both video and Music confirmation plans", () => {
  let maxTokens = 4096;
  const localQwen = { status: () => ({ ...localStatus(), maxTokens }) };
  const video = new PromptOrchestrator({ credentialVault: vault(), localQwen });
  const videoPlan = video.preflight({
    providerId: "local_qwen", model: DEFAULT_MODEL_FILENAME, target: "minimaxH3", outputLanguage: "zh-CN", durationSeconds: 15,
    rewriteMode: "balanced", intent: "保留主体身份并完成清晰动作", template: { id: "fixture", title: "Fixture", requiredAnchors: [] }
  });
  const music = new Music3Orchestrator({ credentialVault: vault(), localQwen });
  const musicPlan = music.preflight({
    providerId: "local_qwen", model: DEFAULT_MODEL_FILENAME, musicIdea: "温暖原声流行，钢琴与木吉他", lyricsMode: "preserve",
    lyrics: "[Verse]\n安静的街", lyricsLanguage: "zh", qualityMode: "fast", captionLanguage: "zh-CN"
  });
  maxTokens = 2048;
  assert.throws(() => video.start({ planHash: videoPlan.planHash, confirmed: true }), /settings changed/u);
  assert.throws(() => music.start({ planHash: musicPlan.planHash, confirmed: true }), /settings changed/u);
});
