import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { caseMediaDisposition, durationMatches, mediaEntryAudioContractErrors, probeAndDecodeMedia, versionContractErrors } from "../validate-media-pack.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, "catalog", "manifest.json"), "utf8"));
const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
const englishReadme = fs.readFileSync(path.join(repoRoot, "README_EN.md"), "utf8");

test("Chinese default and English README galleries contain every case", () => {
  const version = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")).version;
  if (version === "1.0.0") assert.equal(catalog.cases.length, 7);
  for (const entry of catalog.cases) {
    assert.match(entry.preview_paths.gif, /^cases\//);
    assert.match(entry.summary_path, /^cases\//);
    assert.ok(readme.includes(`catalog/${entry.preview_paths.gif}`), `${entry.case_id} GIF link missing from README`);
    assert.ok(readme.includes(`catalog/${entry.summary_path}`), `${entry.case_id} summary link missing from README`);
    assert.ok(englishReadme.includes(`catalog/${entry.preview_paths.gif}`), `${entry.case_id} GIF link missing from English README`);
    assert.ok(englishReadme.includes(`catalog/${entry.summary_path}`), `${entry.case_id} summary link missing from English README`);
    const englishLocale = JSON.parse(fs.readFileSync(path.join(repoRoot, "catalog", "cases", entry.case_id, "locales", "en.json"), "utf8"));
    assert.ok(englishReadme.includes(englishLocale.content.title.replace(/\|/g, "\\|")), `${entry.case_id} localized English title missing from English README`);
  }
  const galleryBlock = readme.split("<!-- CASE_GALLERY:START -->")[1]?.split("<!-- CASE_GALLERY:END -->")[0] || "";
  const englishGalleryBlock = englishReadme.split("<!-- CASE_GALLERY:START -->")[1]?.split("<!-- CASE_GALLERY:END -->")[0] || "";
  const galleryRows = galleryBlock.split(/\r?\n/).filter((line) => line.startsWith("| [!["));
  const englishGalleryRows = englishGalleryBlock.split(/\r?\n/).filter((line) => line.startsWith("| [!["));
  assert.equal(galleryRows.length, catalog.cases.length);
  assert.equal(englishGalleryRows.length, catalog.cases.length);
});

test("README language switch keeps Simplified Chinese as the GitHub default", () => {
  assert.ok(readme.startsWith("# T8 Creative DNA Prompt Library"));
  assert.ok(readme.includes("**简体中文** | [English](./README_EN.md)"));
  assert.ok(readme.includes("## 五种内容，互相对应"));
  assert.ok(englishReadme.includes("[简体中文](./README.md) | **English**"));
  assert.ok(englishReadme.includes("## Five connected content layers"));
});

test("indexes nine upstream MiniMax Skills, nine independent Seedance companions, and two non-official Skills", () => {
  const official = JSON.parse(fs.readFileSync(path.join(repoRoot, "catalog", "official-skills", "manifest.json"), "utf8"));
  assert.equal(catalog.official_skill_count, 9);
  assert.equal(official.skill_count, 9);
  assert.equal(official.skills.length, 9);
  assert.equal(official.comfyui_import, false);
  assert.equal(official.upstream_content_embedded, false);
  assert.equal(official.upstream_skill_bodies_embedded, false);
  assert.equal(official.upstream_preview_assets_embedded, true);
  const companions = new Set(official.skills.map((entry) => entry.companion_skill));
  assert.equal(companions.size, 9);
  for (const entry of official.skills) {
    assert.match(entry.upstream_skill_url, new RegExp(`/tree/${official.pinned_commit}/skills/${entry.id}$`));
    assert.ok(fs.existsSync(path.join(repoRoot, "skills", entry.companion_skill, "SKILL.md")));
    assert.ok(fs.existsSync(path.join(repoRoot, "skills", entry.companion_summary_ref)));
    assert.ok(fs.existsSync(path.join(repoRoot, "skills", entry.companion_seedance_ref)));
    assert.ok(fs.existsSync(path.join(repoRoot, "catalog", entry.local_preview_ref)));
    assert.ok(readme.includes(`catalog/${entry.local_preview_ref}`), `${entry.id} official GIF missing from README`);
    assert.ok(englishReadme.includes(`catalog/${entry.local_preview_ref}`), `${entry.id} official GIF missing from English README`);
  }
  const skillDirectories = fs.readdirSync(path.join(repoRoot, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const caseSkillCount = new Set(catalog.cases.map((entry) => entry.slug)).size;
  const community = JSON.parse(fs.readFileSync(path.join(repoRoot, "catalog", "community-skills", "manifest.json"), "utf8"));
  const evidenceVariantCount = catalog.cases.filter((entry) => entry.template_action === "evidence_variant").length;
  assert.equal(
    caseSkillCount,
    catalog.cases.length - evidenceVariantCount,
    `${catalog.cases.length} cases must collapse ${evidenceVariantCount} evidence variants into their existing stable selectors`
  );
  assert.equal(skillDirectories.length, caseSkillCount + companions.size + community.skill_count);
  assert.equal(catalog.community_skill_count, 2);
  assert.equal(community.skill_count, 2);
  assert.equal(community.official, false);
  assert.ok(fs.existsSync(path.join(repoRoot, "skills", "direct-street-interview-video", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(repoRoot, "skills", "stage-startle-to-truce-encounter", "SKILL.md")));
});

test("public Skill installation may document CODEX_HOME without weakening the boundary", () => {
  assert.ok(readme.includes("CODEX_HOME"));
  execFileSync(process.execPath, ["scripts/public/validate-public-boundary.mjs"], {
    cwd: repoRoot,
    stdio: "pipe"
  });
});

test("media validation probes codecs and duration and traverses video plus audio with one decoder thread", () => {
  const calls = [];
  const runTool = (tool, args) => {
    calls.push({ tool, args });
    if (tool === "probe-tool") {
      return {
        status: 0,
        stdout: JSON.stringify({
          format: { duration: "15.125" },
          streams: [
            { codec_type: "video", codec_name: "h264" },
            { codec_type: "audio", codec_name: "aac" }
          ]
        }),
        stderr: ""
      };
    }
    return { status: 0, stdout: "", stderr: "" };
  };
  const observed = probeAndDecodeMedia("fixture.mp4", {
    ffprobePath: "probe-tool",
    ffmpegPath: "decode-tool",
    requireAudio: true,
    runTool
  });
  assert.deepEqual(observed, { durationSeconds: 15.125, videoCodec: "h264", audioCodec: "aac" });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[1].args.slice(0, 10), ["-v", "error", "-threads", "1", "-i", "fixture.mp4", "-map", "0:v:0", "-c:v", "rawvideo"]);
  assert.equal(calls[1].args.includes("-xerror"), false);
  assert.equal(calls[2].args.includes("-xerror"), false);
  assert.ok(calls[2].args.includes("0:a:0"));
  assert.equal(durationMatches(15.12, 15.125), true);
  assert.equal(durationMatches(15.1, 15.125), false);
});

test("media manifest binds its schema/version and requires an explicit per-file audio mode", () => {
  const errors = versionContractErrors({
    manifest: { schema_version: "unexpected/v9", version: "9.9.9" },
    catalogVersion: "1.0.0",
    rootVersion: "1.0.0",
    appVersion: "1.0.0"
  });
  assert.ok(errors.some((error) => error.includes("schema_version")));
  assert.ok(errors.some((error) => error.includes("must equal package version")));
  assert.deepEqual(mediaEntryAudioContractErrors({ audio_mode: "present", audio_codec: "aac" }), []);
  assert.deepEqual(mediaEntryAudioContractErrors({ audio_mode: "source_silent", audio_codec: null }), []);
  assert.ok(mediaEntryAudioContractErrors({ audio_codec: null })[0].includes("audio_mode"));
  assert.ok(mediaEntryAudioContractErrors({ audio_mode: "source_silent", audio_codec: null }, { allowSourceSilent: false })[0].includes("must be 'present'"));
});

test("every released case requires distribution media", () => {
  assert.deepEqual(caseMediaDisposition({ preview_status: { mp4: "available_in_electron_media_pack" } }), {
    status: "available_in_electron_media_pack",
    requiresMedia: true
  });
  assert.equal(caseMediaDisposition({ preview_status: { mp4: "unsupported" } }).requiresMedia, null);
  assert.equal(caseMediaDisposition({}).requiresMedia, null);
});

test("media validation fails closed on a full-decode error", () => {
  const runTool = (tool) => tool === "probe-tool"
    ? {
        status: 0,
        stdout: JSON.stringify({
          format: { duration: "15" },
          streams: [
            { codec_type: "video", codec_name: "h264" },
            { codec_type: "audio", codec_name: "aac" }
          ]
        }),
        stderr: ""
      }
    : { status: 1, stdout: "", stderr: "corrupt frame" };
  assert.throws(() => probeAndDecodeMedia("broken.mp4", {
    ffprobePath: "probe-tool",
    ffmpegPath: "decode-tool",
    requireAudio: true,
    runTool
  }), /full video decode: corrupt frame/);
});

test("media validation rejects embedded workflow metadata and absolute local paths", () => {
  const runTool = (tool) => tool === "probe-tool"
    ? {
        status: 0,
        stdout: JSON.stringify({
          format: { duration: "10.125", tags: { workflow: `load ${["C:", "private", "input.png"].join("\\")}` } },
          streams: [
            { codec_type: "video", codec_name: "h264" },
            { codec_type: "audio", codec_name: "aac" }
          ]
        }),
        stderr: ""
      }
    : { status: 0, stdout: "", stderr: "" };
  assert.throws(() => probeAndDecodeMedia("leaky.mp4", {
    ffprobePath: "probe-tool",
    ffmpegPath: "decode-tool",
    requireAudio: true,
    runTool
  }), /public release metadata contains (?:Windows absolute path|embedded generation workflow)/u);
});
