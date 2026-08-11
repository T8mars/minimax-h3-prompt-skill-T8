import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { readJson, repoRoot, toPosix } from "./lib.mjs";

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function runChecked(tool, args, label, runTool = spawnSync) {
  const result = runTool(tool, args, {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.error) throw new Error(`${label}: unable to run '${tool}': ${result.error.message}`);
  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || `exit ${result.status}`).trim();
    throw new Error(`${label}: ${detail}`);
  }
  return String(result.stdout || "");
}

export function probeAndDecodeMedia(filePath, {
  ffprobePath = process.env.T8_FFPROBE_PATH || "ffprobe",
  ffmpegPath = process.env.T8_FFMPEG_PATH || "ffmpeg",
  requireAudio = false,
  runTool = spawnSync
} = {}) {
  const probeOutput = runChecked(ffprobePath, [
    "-v", "error",
    "-show_entries", "format=duration:format_tags:stream=codec_type,codec_name",
    "-of", "json",
    filePath
  ], `${path.basename(filePath)} ffprobe`, runTool);

  let probe;
  try {
    probe = JSON.parse(probeOutput);
  } catch (error) {
    throw new Error(`${path.basename(filePath)} ffprobe returned invalid JSON: ${error.message}`);
  }
  const streams = Array.isArray(probe.streams) ? probe.streams : [];
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  const durationSeconds = Number(probe.format?.duration);
  if (!video?.codec_name) throw new Error(`${path.basename(filePath)}: ffprobe found no video stream`);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error(`${path.basename(filePath)}: ffprobe found no positive duration`);
  if (requireAudio && !audio?.codec_name) throw new Error(`${path.basename(filePath)}: this release requires an audio stream`);
  const metadataText = JSON.stringify(probe.format?.tags ?? {});
  const metadataRisks = [
    [/[A-Za-z]:[\\/]/u, "Windows absolute path"],
    [/(?:^|[\s"'])\/(?:Users|home|root)\//u, "user-home absolute path"],
    [/(?:sk-|gh[pousr]_|github_pat_|AKIA[0-9A-Z]{16}|xox[baprs]-|AIza)/u, "credential-like token"],
    [/(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|Cookie\s*:)/iu, "authorization material"],
    [/(?:MiniMaxH3ReferenceToVideo|ComfyUI|"workflow"\s*:|"prompt"\s*:)/iu, "embedded generation workflow"]
  ];
  for (const [pattern, label] of metadataRisks) {
    if (pattern.test(metadataText)) throw new Error(`${path.basename(filePath)}: public release metadata contains ${label}`);
  }

  const nullTarget = process.platform === "win32" ? "NUL" : "/dev/null";
  runChecked(ffmpegPath, [
    "-v", "error",
    "-xerror",
    "-i", filePath,
    "-map", "0:v:0",
    "-c:v", "rawvideo",
    "-f", "null",
    nullTarget
  ], `${path.basename(filePath)} full video decode`, runTool);
  if (audio?.codec_name) {
    runChecked(ffmpegPath, [
      "-v", "error",
      "-xerror",
      "-i", filePath,
      "-map", "0:a:0",
      "-c:a", "pcm_s16le",
      "-f", "null",
      nullTarget
    ], `${path.basename(filePath)} full audio decode`, runTool);
  }

  return {
    durationSeconds,
    videoCodec: String(video.codec_name),
    audioCodec: audio?.codec_name ? String(audio.codec_name) : null
  };
}

function listMp4Files(directory) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".mp4")) files.push(toPosix(path.relative(directory, absolute)));
    }
  }
  walk(directory);
  return files.sort();
}

export function durationMatches(left, right, toleranceSeconds = 0.01) {
  return Number.isFinite(Number(left)) && Number.isFinite(Number(right)) && Math.abs(Number(left) - Number(right)) <= toleranceSeconds;
}

export function versionContractErrors({ manifest, catalogVersion, rootVersion, appVersion }) {
  const errors = [];
  if (manifest.schema_version !== "1.0.0") errors.push(`unsupported media manifest schema_version '${manifest.schema_version}'`);
  if (manifest.version !== rootVersion) errors.push(`media manifest version '${manifest.version}' must equal package version '${rootVersion}'`);
  if (catalogVersion !== rootVersion) errors.push(`catalog version '${catalogVersion}' must equal package version '${rootVersion}'`);
  if (appVersion !== rootVersion) errors.push(`Electron version '${appVersion}' must equal package version '${rootVersion}'`);
  return errors;
}

export function releaseRequiresAudio(_releaseVersion) {
  // The public product contract promises complete video with sound for every
  // stable release. A future silent-media mode requires an explicit schema and
  // UI contract rather than a version-string escape hatch.
  return true;
}

function main() {
  const mediaDir = path.resolve(repoRoot, argument("--media-dir", ".release-input/media"));
  const manifestPath = path.resolve(repoRoot, argument("--manifest", path.join(mediaDir, "media-pack-manifest.json")));
  const ffprobePath = argument("--ffprobe", process.env.T8_FFPROBE_PATH || "ffprobe");
  const ffmpegPath = argument("--ffmpeg", process.env.T8_FFMPEG_PATH || "ffmpeg");
  const catalog = readJson(path.join(repoRoot, "catalog", "manifest.json"));
  const communityIndex = readJson(path.join(repoRoot, "catalog", "community-skills", "manifest.json"));
  const rootVersion = readJson(path.join(repoRoot, "package.json")).version;
  const appVersion = readJson(path.join(repoRoot, "apps", "prompt-library-desktop", "package.json")).version;
  const failures = [];

  if (!fs.existsSync(mediaDir) || !fs.statSync(mediaDir).isDirectory()) {
    console.error(`${toPosix(path.relative(repoRoot, mediaDir))}: media directory is missing`);
    process.exit(1);
  }
  if (!fs.existsSync(manifestPath)) {
    console.error(`${toPosix(path.relative(repoRoot, manifestPath))}: media-pack-manifest.json is missing`);
    process.exit(1);
  }
  const manifest = readJson(manifestPath);
  const entries = Array.isArray(manifest.files) ? manifest.files : [];
  const communityEntries = Array.isArray(manifest.community_skill_files) ? manifest.community_skill_files : [];
  const byId = new Map(entries.map((entry) => [entry.case_id, entry]));
  const communityById = new Map(communityEntries.map((entry) => [entry.skill_id, entry]));
  const expectedIds = (catalog.cases ?? []).map((entry) => entry.case_id).sort();
  const expectedCommunity = (communityIndex.skills ?? []).map((entry) => ({
    id: entry.id,
    manifestRef: entry.manifest_ref
  })).sort((left, right) => left.id.localeCompare(right.id));
  const catalogById = new Map((catalog.cases ?? []).map((entry) => [entry.case_id, entry]));
  failures.push(...versionContractErrors({ manifest, catalogVersion: catalog.catalog_version, rootVersion, appVersion }));
  const requireAudio = releaseRequiresAudio(rootVersion);

  if (manifest.case_count !== entries.length) failures.push(`media manifest case_count must equal files.length (${entries.length})`);
  if (manifest.community_skill_count !== communityEntries.length) failures.push(`media manifest community_skill_count must equal community_skill_files.length (${communityEntries.length})`);
  if (entries.length !== expectedIds.length) failures.push(`media manifest has ${entries.length} files; catalog requires ${expectedIds.length}`);
  if (communityEntries.length !== expectedCommunity.length) failures.push(`media manifest has ${communityEntries.length} community Skill files; catalog requires ${expectedCommunity.length}`);
  if (new Set(entries.map((entry) => entry.case_id)).size !== entries.length) failures.push("media manifest contains duplicate case_id values");
  if (new Set(communityEntries.map((entry) => entry.skill_id)).size !== communityEntries.length) failures.push("media manifest contains duplicate community skill_id values");

  for (const id of expectedIds) {
    const entry = byId.get(id);
    if (!entry) {
      failures.push(`${id}: missing from media-pack-manifest.json`);
      continue;
    }
    const expectedRelative = `${id}/preview.mp4`;
    if (entry.path !== expectedRelative) failures.push(`${id}: path must be '${expectedRelative}'`);
    const filePath = path.join(mediaDir, ...expectedRelative.split("/"));
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      failures.push(`${expectedRelative}: missing MP4`);
      continue;
    }
    const bytes = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(bytes).digest("hex");
    if (entry.sha256 !== hash) failures.push(`${expectedRelative}: SHA-256 mismatch`);
    if (entry.size_bytes !== bytes.length) failures.push(`${expectedRelative}: size_bytes mismatch`);

    try {
      const observed = probeAndDecodeMedia(filePath, { ffprobePath, ffmpegPath, requireAudio });
      if (!durationMatches(entry.duration_seconds, observed.durationSeconds)) {
        failures.push(`${expectedRelative}: manifest duration ${entry.duration_seconds} differs from ffprobe ${observed.durationSeconds}`);
      }
      if (entry.video_codec !== observed.videoCodec) {
        failures.push(`${expectedRelative}: manifest video_codec '${entry.video_codec}' differs from ffprobe '${observed.videoCodec}'`);
      }
      if ((entry.audio_codec ?? null) !== observed.audioCodec) {
        failures.push(`${expectedRelative}: manifest audio_codec '${entry.audio_codec}' differs from ffprobe '${observed.audioCodec}'`);
      }
      const caseManifestPath = path.join(repoRoot, "catalog", "cases", id, "manifest.json");
      const sourceDuration = readJson(caseManifestPath).source_duration_seconds;
      if (!durationMatches(sourceDuration, observed.durationSeconds, 0.02)) {
        failures.push(`${expectedRelative}: catalog source_duration_seconds ${sourceDuration} differs from ffprobe ${observed.durationSeconds}`);
      }
    } catch (error) {
      failures.push(`${expectedRelative}: ${error.message}`);
    }
  }

  for (const expected of expectedCommunity) {
    const entry = communityById.get(expected.id);
    if (!entry) {
      failures.push(`${expected.id}: missing community Skill media from media-pack-manifest.json`);
      continue;
    }
    const expectedRelative = `community-skills/${expected.id}/preview.mp4`;
    if (entry.path !== expectedRelative) failures.push(`${expected.id}: path must be '${expectedRelative}'`);
    const filePath = path.join(mediaDir, ...expectedRelative.split("/"));
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      failures.push(`${expectedRelative}: missing MP4`);
      continue;
    }
    const bytes = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(bytes).digest("hex");
    if (entry.sha256 !== hash) failures.push(`${expectedRelative}: SHA-256 mismatch`);
    if (entry.size_bytes !== bytes.length) failures.push(`${expectedRelative}: size_bytes mismatch`);
    try {
      const observed = probeAndDecodeMedia(filePath, { ffprobePath, ffmpegPath, requireAudio });
      if (!durationMatches(entry.duration_seconds, observed.durationSeconds)) {
        failures.push(`${expectedRelative}: manifest duration ${entry.duration_seconds} differs from ffprobe ${observed.durationSeconds}`);
      }
      if (entry.video_codec !== observed.videoCodec) failures.push(`${expectedRelative}: manifest video_codec '${entry.video_codec}' differs from ffprobe '${observed.videoCodec}'`);
      if ((entry.audio_codec ?? null) !== observed.audioCodec) failures.push(`${expectedRelative}: manifest audio_codec '${entry.audio_codec}' differs from ffprobe '${observed.audioCodec}'`);
      const skillManifest = readJson(path.join(repoRoot, "catalog", ...expected.manifestRef.split("/")));
      const expectedReleaseDuration = skillManifest.release_media?.duration_seconds ?? skillManifest.source_duration_seconds;
      if (!durationMatches(expectedReleaseDuration, observed.durationSeconds, 0.02)) {
        failures.push(`${expectedRelative}: catalog release duration ${expectedReleaseDuration} differs from ffprobe ${observed.durationSeconds}`);
      }
      if (skillManifest.release_media?.sha256 !== hash) failures.push(`${expectedRelative}: community Skill release_media SHA-256 differs from sanitized MP4`);
      if (skillManifest.release_media?.metadata_sanitized !== true) failures.push(`${expectedRelative}: community Skill release media is not marked metadata-sanitized`);
    } catch (error) {
      failures.push(`${expectedRelative}: ${error.message}`);
    }
  }

  const actualMp4Paths = listMp4Files(mediaDir);
  const expectedMp4Paths = [...entries, ...communityEntries].map((entry) => entry.path).sort();
  if (JSON.stringify(actualMp4Paths) !== JSON.stringify(expectedMp4Paths)) {
    failures.push(`media directory MP4 set differs from manifest; expected=${expectedMp4Paths.join(",")}; actual=${actualMp4Paths.join(",")}`);
  }
  for (const id of byId.keys()) {
    if (!catalogById.has(id)) failures.push(`${id}: media manifest case is not released in catalog`);
  }
  for (const id of communityById.keys()) {
    if (!expectedCommunity.some((item) => item.id === id)) failures.push(`${id}: media manifest community Skill is not in the public index`);
  }

  if (rootVersion === "1.0.0" && (entries.length !== 7 || communityEntries.length !== 0)) failures.push("v1.0.0 media pack must contain exactly 7 released case MP4 files and no community Skill media");
  if (failures.length) {
    console.error(`Media-pack validation failed with ${failures.length} issue(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Media-pack validation passed (${entries.length} cases + ${communityEntries.length} community Skills; hash-bound, fully decoded MP4 files; audio required=${requireAudio}).`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) main();
