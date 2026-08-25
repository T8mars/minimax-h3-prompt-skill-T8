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
    "-threads", "1",
    "-i", filePath,
    "-map", "0:v:0",
    "-c:v", "rawvideo",
    "-f", "null",
    nullTarget
  ], `${path.basename(filePath)} full video decode`, runTool);
  if (audio?.codec_name) {
    runChecked(ffmpegPath, [
      "-v", "error",
      "-threads", "1",
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
  if (manifest.schema_version !== "1.2.0") errors.push(`unsupported media manifest schema_version '${manifest.schema_version}'`);
  if (manifest.version !== rootVersion) errors.push(`media manifest version '${manifest.version}' must equal package version '${rootVersion}'`);
  if (typeof catalogVersion !== "string" || !catalogVersion.trim()) errors.push("catalog version is required");
  if (appVersion !== rootVersion) errors.push(`Electron version '${appVersion}' must equal package version '${rootVersion}'`);
  return errors;
}

export function caseMediaDisposition(caseManifest) {
  const status = caseManifest?.preview_status?.mp4;
  if (status === "available_in_electron_media_pack") return { status, requiresMedia: true };
  if (status === "private_local_only_not_exported") return { status, requiresMedia: false };
  return { status: typeof status === "string" ? status : "", requiresMedia: null };
}

export function mediaEntryAudioContractErrors(entry, { allowSourceSilent = true } = {}) {
  const errors = [];
  const mode = entry?.audio_mode;
  if (mode !== "present" && mode !== "source_silent") {
    return ["audio_mode must be 'present' or 'source_silent'"];
  }
  if (!allowSourceSilent && mode !== "present") errors.push("audio_mode must be 'present'");
  if (mode === "present" && !entry?.audio_codec) errors.push("audio_codec is required when audio_mode is 'present'");
  if (mode === "source_silent" && entry?.audio_codec !== null) errors.push("audio_codec must be null when audio_mode is 'source_silent'");
  return errors;
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
  const caseExpectations = (catalog.cases ?? []).map((entry) => {
    const manifestRef = String(entry.manifest_path || "");
    const caseManifest = manifestRef ? readJson(path.join(repoRoot, "catalog", ...manifestRef.split("/"))) : {};
    return { id: entry.case_id, manifestRef, disposition: caseMediaDisposition(caseManifest) };
  }).sort((left, right) => left.id.localeCompare(right.id));
  const expectedIds = caseExpectations.filter((entry) => entry.disposition.requiresMedia === true).map((entry) => entry.id);
  const expectedUnavailable = caseExpectations.filter((entry) => entry.disposition.requiresMedia === false);
  const unavailableEntries = Array.isArray(manifest.unavailable_cases) ? manifest.unavailable_cases : [];
  const unavailableById = new Map(unavailableEntries.map((entry) => [entry.case_id, entry]));
  const expectedCommunity = (communityIndex.skills ?? []).map((entry) => ({
    id: entry.id,
    manifestRef: entry.manifest_ref
  })).sort((left, right) => left.id.localeCompare(right.id));
  const catalogById = new Map((catalog.cases ?? []).map((entry) => [entry.case_id, entry]));
  failures.push(...versionContractErrors({ manifest, catalogVersion: catalog.catalog_version, rootVersion, appVersion }));
  for (const expectation of caseExpectations) {
    if (!expectation.manifestRef) failures.push(`${expectation.id}: catalog manifest_path is required`);
    if (expectation.disposition.requiresMedia === null) failures.push(`${expectation.id}: unsupported preview_status.mp4 '${expectation.disposition.status}'`);
  }
  if (manifest.catalog_case_count !== caseExpectations.length) failures.push(`media manifest catalog_case_count must equal catalog cases (${caseExpectations.length})`);
  if (manifest.case_count !== entries.length) failures.push(`media manifest case_count must equal files.length (${entries.length})`);
  if (manifest.unavailable_case_count !== unavailableEntries.length) failures.push(`media manifest unavailable_case_count must equal unavailable_cases.length (${unavailableEntries.length})`);
  if (manifest.community_skill_count !== communityEntries.length) failures.push(`media manifest community_skill_count must equal community_skill_files.length (${communityEntries.length})`);
  if (entries.length !== expectedIds.length) failures.push(`media manifest has ${entries.length} distributable case files; catalog requires ${expectedIds.length}`);
  if (unavailableEntries.length !== expectedUnavailable.length) failures.push(`media manifest has ${unavailableEntries.length} unavailable cases; catalog requires ${expectedUnavailable.length}`);
  if (entries.length + unavailableEntries.length !== caseExpectations.length) failures.push("media manifest distributable and unavailable cases must partition the full catalog");
  if (communityEntries.length !== expectedCommunity.length) failures.push(`media manifest has ${communityEntries.length} community Skill files; catalog requires ${expectedCommunity.length}`);
  if (new Set(entries.map((entry) => entry.case_id)).size !== entries.length) failures.push("media manifest contains duplicate case_id values");
  if (new Set(unavailableEntries.map((entry) => entry.case_id)).size !== unavailableEntries.length) failures.push("media manifest contains duplicate unavailable case_id values");
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

    for (const error of mediaEntryAudioContractErrors(entry)) failures.push(`${expectedRelative}: ${error}`);
    try {
      const observed = probeAndDecodeMedia(filePath, { ffprobePath, ffmpegPath, requireAudio: entry.audio_mode !== "source_silent" });
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

  for (const expected of expectedUnavailable) {
    const entry = unavailableById.get(expected.id);
    if (!entry) {
      failures.push(`${expected.id}: missing from unavailable_cases`);
      continue;
    }
    if (entry.status !== "private_local_only_not_exported") failures.push(`${expected.id}: unavailable status must preserve private_local_only_not_exported`);
    if (entry.reason !== "source_media_not_redistributable") failures.push(`${expected.id}: unavailable reason must be source_media_not_redistributable`);
    if (entry.fallback !== "catalog_placeholder_and_source_post") failures.push(`${expected.id}: unavailable fallback must be catalog_placeholder_and_source_post`);
    if (byId.has(expected.id)) failures.push(`${expected.id}: rights-restricted case must not also appear in files`);
    const forbiddenPath = path.join(mediaDir, expected.id, "preview.mp4");
    if (fs.existsSync(forbiddenPath)) failures.push(`${expected.id}: rights-restricted MP4 must not exist in release media`);
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
    for (const error of mediaEntryAudioContractErrors(entry, { allowSourceSilent: false })) failures.push(`${expectedRelative}: ${error}`);
    try {
      const observed = probeAndDecodeMedia(filePath, { ffprobePath, ffmpegPath, requireAudio: true });
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
    if (!expectedIds.includes(id)) failures.push(`${id}: media manifest includes a case whose rights status forbids release media`);
  }
  for (const id of unavailableById.keys()) {
    if (!catalogById.has(id)) failures.push(`${id}: unavailable media case is not released in catalog`);
    if (!expectedUnavailable.some((item) => item.id === id)) failures.push(`${id}: unavailable media case is not rights-limited in catalog`);
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
  const sourceSilentCount = entries.filter((entry) => entry.audio_mode === "source_silent").length;
  console.log(`Media-pack validation passed (${entries.length} distributable cases + ${expectedUnavailable.length} rights-limited catalog fallbacks + ${communityEntries.length} community Skills; hash-bound complete video traversal and complete audio traversal where present; source-silent=${sourceSilentCount}; recoverable-frame tolerance enabled).`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) main();
