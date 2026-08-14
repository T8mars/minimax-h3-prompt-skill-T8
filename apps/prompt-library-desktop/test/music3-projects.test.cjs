const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { PromptProjectStore, projectMarkdown, sanitizeProject } = require("../lib/prompt-projects.cjs");

function sampleMusicProject() {
  return {
    capability: "music3",
    title: "Cinematic Mandarin ballad",
    musicIdea: "一首由克制走向坚定的中文电影感流行情歌",
    inputLyrics: "[Verse]\n原始歌词不得静默丢失",
    lyricsMode: "preserve",
    effectiveLyricsMode: "preserve",
    lyricsLanguage: "custom",
    customLyricsLanguage: "Cantonese",
    targetDurationSeconds: 180,
    rewriteMode: "strict",
    qualityMode: "full",
    structurePreset: "verse_chorus",
    captionLanguage: "zh-CN",
    semanticProfileMode: "privacy",
    stageCache: "on",
    providerId: "t8star_workshop",
    providerLabel: "AI Workshop",
    endpointHost: "ai.t8star.org",
    model: "test-model",
    apiKey: "must-never-be-stored",
    outputs: {
      lyrics: "[Verse]\n原始歌词不得静默丢失",
      musicCaption: "### Global Metadata\n电影感中文流行。",
      music3PayloadJson: "{\"input\":\"lyrics\",\"instructions\":\"caption\"}",
      enhancementReportJson: "{\"schema_version\":\"t8-music3-enhancement-report/v1\"}"
    },
    validation: { status: "pass" },
    receipt: { logicalRequestCount: 3, cacheHits: 1, stages: [{ stage: "caption", attempts: 1 }], outputHashes: { lyrics: "a".repeat(64) } }
  };
}

test("Music 3 projects round-trip all four outputs and editable inputs without credentials", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-music3-project-"));
  try {
    const store = new PromptProjectStore({ userDataDir: root, randomUUID: () => "music-three", now: () => "2026-08-15T00:00:00.000Z" });
    const saved = store.save(sampleMusicProject());
    assert.equal(saved.schemaVersion, "t8-prompt-project/v2");
    assert.equal(saved.capability, "music3");
    assert.equal(saved.inputLyrics, "[Verse]\n原始歌词不得静默丢失");
    assert.equal(saved.customLyricsLanguage, "Cantonese");
    assert.deepEqual(Object.keys(saved.outputs), ["lyrics", "musicCaption", "music3PayloadJson", "enhancementReportJson"]);
    assert.equal(store.list()[0].capability, "music3");
    assert.doesNotMatch(JSON.stringify(saved), /must-never-be-stored|apiKey|credential/iu);
    assert.match(projectMarkdown(saved), /## Lyrics[\s\S]*## Structured caption[\s\S]*## Music 3 payload[\s\S]*## Enhancement report/u);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("legacy and current video projects retain the video capability boundary", () => {
  const value = sanitizeProject({ title: "Legacy video", output: "prompt", providerId: "seedance_nz" }, { id: "legacy", now: "2026-08-15T00:00:00.000Z" });
  assert.equal(value.capability, "video_prompt");
  assert.equal(value.schemaVersion, "t8-prompt-project/v2");
  assert.equal(value.output, "prompt");
  assert.equal(value.outputs, undefined);
});

