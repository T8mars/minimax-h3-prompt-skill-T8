const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { PromptMediaStore } = require("../lib/prompt-media.cjs");
const { callProvider, normalizePlan } = require("../lib/prompt-providers.cjs");

function fixtureFiles() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-media-"));
  const image = path.join(root, "reference.png");
  const video = path.join(root, "reference.mp4");
  fs.writeFileSync(image, Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]));
  fs.writeFileSync(video, Buffer.from([0,0,0,24,0x66,0x74,0x79,0x70,0x69,0x73,0x6f,0x6d,0,0,0,0]));
  return { root, image, video };
}

function input(providerId, media, overrides = {}) {
  return {
    providerId,
    model: providerId === "seedance_nz" ? "" : providerId === "t8star_workshop" ? "gemini-3.5-flash" : "custom-model",
    baseUrl: providerId === "openai_compatible" ? "https://gateway.example/v1" : "",
    target: "minimaxH3",
    durationSeconds: 15,
    rewriteMode: "balanced",
    intent: "A fictional camera proves three visible functions.",
    constraints: "No subtitles.",
    media,
    template: { id: "one", templateId: "one", title: "Proof ladder", requiredAnchors: ["three visible functions"], creativeDna: {} },
    ...overrides
  };
}

test("media store validates magic bytes, labels media, and never exposes absolute paths", () => {
  const files = fixtureFiles();
  try {
    let id = 0;
    const store = new PromptMediaStore({ randomUUID: () => `media-${++id}` });
    const added = store.addPaths([files.image, files.video]);
    assert.deepEqual(added.map((item) => [item.kind, item.label]), [["image", "<Picture 1>"], ["video", "<Video 1>"]]);
    assert.equal(store.counts().image, 1);
    assert.equal(store.counts().video, 1);
    assert.equal("filePath" in added[0], false);
    assert.doesNotMatch(JSON.stringify(store.list()), /t8-media-/u);
    assert.equal(store.resolve(["media-1", "media-2"]).length, 2);
  } finally { fs.rmSync(files.root, { recursive: true, force: true }); }
});

test("multi-select import is atomic when a later file is invalid", () => {
  const files = fixtureFiles();
  const invalid = path.join(files.root, "invalid.txt");
  fs.writeFileSync(invalid, "not media");
  try {
    const store = new PromptMediaStore({ randomUUID: () => "media-atomic" });
    assert.throws(() => store.addPaths([files.image, invalid]), /Unsupported or invalid/u);
    assert.deepEqual(store.list(), []);
  } finally { fs.rmSync(files.root, { recursive: true, force: true }); }
});

test("AI Workshop sends local video as image_url exactly like the audited node", async () => {
  const files = fixtureFiles();
  try {
    const store = new PromptMediaStore({ randomUUID: () => "video-id" });
    store.addPaths([files.video]);
    const plan = normalizePlan(input("t8star_workshop", store.list()));
    let body;
    await callProvider(plan, "test-key", {
      mediaRecords: store.resolve(["video-id"]),
      fetchImpl: async (_url, options) => {
        body = JSON.parse(options.body);
        return new Response(JSON.stringify({ choices: [{ message: { content: "Subject: proof. 0-15s held final result." } }] }), { status: 200 });
      }
    });
    const content = body.messages.at(-1).content;
    assert.equal(content[1].type, "text");
    assert.match(content[1].text, /temporal video.*complete timeline/iu);
    assert.equal(content[2].type, "image_url");
    assert.match(content[2].image_url.url, /^data:video\/mp4;base64,/u);
  } finally { fs.rmSync(files.root, { recursive: true, force: true }); }
});

test("OpenAI compatible uses video_url while Seedance uploads once then uses the returned URL", async () => {
  const files = fixtureFiles();
  try {
    const openStore = new PromptMediaStore({ randomUUID: () => "open-video" });
    openStore.addPaths([files.video]);
    const openPlan = normalizePlan(input("openai_compatible", openStore.list()));
    let openBody;
    await callProvider(openPlan, "open-key", {
      mediaRecords: openStore.resolve(["open-video"]),
      fetchImpl: async (_url, options) => {
        openBody = JSON.parse(options.body);
        return new Response(JSON.stringify({ choices: [{ message: { content: "Subject: proof. 0-15s held final result." } }] }), { status: 200 });
      }
    });
    assert.equal(openBody.messages.at(-1).content[2].type, "video_url");

    const seedStore = new PromptMediaStore({ randomUUID: () => "seed-video" });
    seedStore.addPaths([files.video]);
    const seedPlan = normalizePlan(input("seedance_nz", seedStore.list()));
    const urls = [];
    let seedBody;
    const result = await callProvider(seedPlan, "seed-key", {
      mediaRecords: seedStore.resolve(["seed-video"]),
      fetchImpl: async (url, options) => {
        urls.push(url);
        if (url.endsWith("/files/upload")) {
          assert.ok(options.body instanceof FormData);
          return new Response(JSON.stringify({ url: "https://cdn.example/reference.mp4" }), { status: 200 });
        }
        seedBody = JSON.parse(options.body);
        return new Response(JSON.stringify({ choices: [{ message: { content: "Subject: proof. 0-15s held final result." } }] }), { status: 200 });
      }
    });
    assert.deepEqual(urls, ["https://api.seedance.nz/v1/files/upload", "https://api.seedance.nz/v1/chat/completions"]);
    assert.equal(seedBody.messages.at(-1).content[2].type, "video_url");
    assert.equal(seedBody.messages.at(-1).content[2].video_url.url, "https://cdn.example/reference.mp4");
    assert.equal(result.receipt.mediaUploadCount, 1);
    assert.equal(result.receipt.attempts, 1);
  } finally { fs.rmSync(files.root, { recursive: true, force: true }); }
});
