import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { loadCatalog } = require("../lib/catalog.cjs");
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appDir, "../..");
const catalogRoot = path.join(repoRoot, "catalog");
const skillsRoot = path.join(repoRoot, "skills");

if (!process.env.T8_MEDIA_DIR) {
  console.error("ERROR T8_MEDIA_DIR is required for a Full installer release");
  process.exit(1);
}

const mediaRoot = path.resolve(repoRoot, process.env.T8_MEDIA_DIR);
const catalog = loadCatalog({ catalogRoot, mediaRoot, skillsRoot });
const errors = [];
let totalBytes = 0;
const mediaManifestPath = path.join(mediaRoot, "media-pack-manifest.json");
let mediaManifest = null;
if (!fs.existsSync(mediaManifestPath)) {
  errors.push("media-pack-manifest.json is missing from T8_MEDIA_DIR");
} else {
  try {
    mediaManifest = JSON.parse(fs.readFileSync(mediaManifestPath, "utf8"));
  } catch (error) {
    errors.push(`invalid media-pack-manifest.json: ${error.message}`);
  }
}
const manifestFiles = new Map(
  Array.isArray(mediaManifest?.files)
    ? mediaManifest.files.map((entry) => [entry.case_id, entry])
    : []
);
const communityManifestFiles = new Map(
  Array.isArray(mediaManifest?.community_skill_files)
    ? mediaManifest.community_skill_files.map((entry) => [entry.skill_id, entry])
    : []
);
if (mediaManifest && mediaManifest.schema_version !== "1.1.0") errors.push(`unsupported media manifest schema_version=${mediaManifest.schema_version}`);

if (!catalog.cases.length) errors.push("public catalog has no released cases");
if (mediaManifest && mediaManifest.case_count !== catalog.cases.length) {
  errors.push(`media manifest case_count=${mediaManifest.case_count}, catalog cases=${catalog.cases.length}`);
}
if (mediaManifest && mediaManifest.community_skill_count !== catalog.communitySkills.length) {
  errors.push(`media manifest community_skill_count=${mediaManifest.community_skill_count}, catalog community Skills=${catalog.communitySkills.length}`);
}
for (const item of catalog.cases) {
  const videoPath = path.join(mediaRoot, item.id, "preview.mp4");
  if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) {
    errors.push(`${item.id}: missing media/<case_id>/preview.mp4`);
    continue;
  }
  const stats = fs.statSync(videoPath);
  totalBytes += stats.size;
  const bytes = fs.readFileSync(videoPath);
  const binary = bytes.toString("latin1");
  const manifestEntry = manifestFiles.get(item.id);
  const requiredAtoms = manifestEntry?.audio_mode === "present" ? ["ftyp", "moov", "mdat", "vide", "soun"] : ["ftyp", "moov", "mdat", "vide"];
  const missingAtoms = requiredAtoms.filter((atom) => !binary.includes(atom));
  if (stats.size < 1024 || missingAtoms.length) {
    errors.push(`${item.id}: incomplete MP4 container/tracks; missing=${missingAtoms.join(",") || "payload"}`);
  }
  if (!manifestEntry) {
    errors.push(`${item.id}: missing from media-pack-manifest.json`);
  } else {
    const expectedPath = `${item.id}/preview.mp4`;
    const actualPath = String(manifestEntry.path || "").replace(/\\/gu, "/");
    if (actualPath !== expectedPath) errors.push(`${item.id}: manifest path must be ${expectedPath}`);
    if (manifestEntry.size_bytes !== stats.size) errors.push(`${item.id}: manifest size mismatch`);
    const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
    if (String(manifestEntry.sha256 || "").toLocaleLowerCase() !== sha256) errors.push(`${item.id}: manifest SHA-256 mismatch`);
    if (!manifestEntry.video_codec) errors.push(`${item.id}: manifest must record a video codec`);
    if (!["present", "source_silent"].includes(manifestEntry.audio_mode)) errors.push(`${item.id}: manifest audio_mode must be present or source_silent`);
    if (manifestEntry.audio_mode === "present" && !manifestEntry.audio_codec) errors.push(`${item.id}: present audio_mode must record an audio codec`);
    if (manifestEntry.audio_mode === "source_silent" && manifestEntry.audio_codec !== null) errors.push(`${item.id}: source_silent audio_mode must record audio_codec=null`);
  }
  if (item.media.video?.scope !== "media") errors.push(`${item.id}: viewer did not bind the release media pack MP4`);
}
for (const item of catalog.communitySkills) {
  const relativePath = `community-skills/${item.id}/preview.mp4`;
  const videoPath = path.join(mediaRoot, ...relativePath.split("/"));
  if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) {
    errors.push(`${item.id}: missing media/${relativePath}`);
    continue;
  }
  const stats = fs.statSync(videoPath);
  totalBytes += stats.size;
  const bytes = fs.readFileSync(videoPath);
  const binary = bytes.toString("latin1");
  const missingAtoms = ["ftyp", "moov", "mdat", "vide", "soun"].filter((atom) => !binary.includes(atom));
  if (stats.size < 1024 || missingAtoms.length) errors.push(`${item.id}: incomplete community Skill MP4; missing=${missingAtoms.join(",") || "payload"}`);
  const manifestEntry = communityManifestFiles.get(item.id);
  if (!manifestEntry) {
    errors.push(`${item.id}: missing from media-pack-manifest.json community_skill_files`);
  } else {
    if (String(manifestEntry.path || "").replace(/\\/gu, "/") !== relativePath) errors.push(`${item.id}: manifest path must be ${relativePath}`);
    if (manifestEntry.size_bytes !== stats.size) errors.push(`${item.id}: manifest size mismatch`);
    const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
    if (String(manifestEntry.sha256 || "").toLocaleLowerCase() !== sha256) errors.push(`${item.id}: manifest SHA-256 mismatch`);
    if (!manifestEntry.video_codec || !manifestEntry.audio_codec || manifestEntry.audio_mode !== "present") errors.push(`${item.id}: community Skill manifest must record present video and audio codecs`);
  }
  if (item.media.video?.scope !== "media") errors.push(`${item.id}: viewer did not bind the community Skill MP4`);
}
for (const caseId of manifestFiles.keys()) {
  if (!catalog.cases.some((item) => item.id === caseId)) errors.push(`${caseId}: media manifest contains an unknown case`);
}
for (const skillId of communityManifestFiles.keys()) {
  if (!catalog.communitySkills.some((item) => item.id === skillId)) errors.push(`${skillId}: media manifest contains an unknown community Skill`);
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR ${error}`).join("\n"));
  process.exit(1);
}

console.log(`PASS Full media pack; cases=${catalog.cases.length}; communitySkills=${catalog.communitySkills.length}; bytes=${totalBytes}; root=${mediaRoot}`);
