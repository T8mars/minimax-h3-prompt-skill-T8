import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { durationMatches, probeAndDecodeMedia, releaseRequiresAudio, versionContractErrors } from "../validate-media-pack.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, "catalog", "manifest.json"), "utf8"));
const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");

test("v1.0.0 gallery contains all seven catalog-relative GIF and summary links", () => {
  const version = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")).version;
  if (version === "1.0.0") assert.equal(catalog.cases.length, 7);
  for (const entry of catalog.cases) {
    assert.match(entry.preview_paths.gif, /^cases\//);
    assert.match(entry.summary_path, /^cases\//);
    assert.ok(readme.includes(`catalog/${entry.preview_paths.gif}`), `${entry.case_id} GIF link missing from README`);
    assert.ok(readme.includes(`catalog/${entry.summary_path}`), `${entry.case_id} summary link missing from README`);
  }
  const galleryRows = readme.split(/\r?\n/).filter((line) => line.startsWith("| [!["));
  assert.equal(galleryRows.length, catalog.cases.length);
});

test("public Skill installation may document CODEX_HOME without weakening the boundary", () => {
  assert.ok(readme.includes("CODEX_HOME"));
  execFileSync(process.execPath, ["scripts/public/validate-public-boundary.mjs"], {
    cwd: repoRoot,
    stdio: "pipe"
  });
});

test("media validation probes codecs and duration and fully decodes video plus audio", () => {
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
  assert.deepEqual(calls[1].args.slice(0, 9), ["-v", "error", "-xerror", "-i", "fixture.mp4", "-map", "0:v:0", "-c:v", "rawvideo"]);
  assert.ok(calls[2].args.includes("0:a:0"));
  assert.equal(durationMatches(15.12, 15.125), true);
  assert.equal(durationMatches(15.1, 15.125), false);
});

test("media manifest cannot bypass the stable-release audio gate by mutating its version", () => {
  const errors = versionContractErrors({
    manifest: { schema_version: "unexpected/v9", version: "9.9.9" },
    catalogVersion: "1.0.0",
    rootVersion: "1.0.0",
    appVersion: "1.0.0"
  });
  assert.ok(errors.some((error) => error.includes("schema_version")));
  assert.ok(errors.some((error) => error.includes("must equal package version")));
  assert.equal(releaseRequiresAudio("1.0.0"), true);
  assert.equal(releaseRequiresAudio("9.9.9"), true, "all stable releases retain the complete-video-with-sound contract");
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
