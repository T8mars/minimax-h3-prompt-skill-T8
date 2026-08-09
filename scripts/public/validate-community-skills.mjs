import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { failWith, listDirectories, readJson, repoRoot, toPosix } from "./lib.mjs";

const failures = [];
const catalog = readJson(path.join(repoRoot, "catalog", "manifest.json"));
const expectedIndexRef = "community-skills/manifest.json";
if (catalog.community_skills_manifest !== expectedIndexRef) failures.push(`catalog/manifest.json: community_skills_manifest must be '${expectedIndexRef}'`);

const indexPath = path.join(repoRoot, "catalog", expectedIndexRef);
if (!fs.existsSync(indexPath)) {
  failWith("Community Skill validation", ["catalog/community-skills/manifest.json: missing"]);
  process.exit();
}

const index = readJson(indexPath);
const entries = Array.isArray(index.skills) ? index.skills : [];
if (index.schema_version !== "public-community-skill-index/v1") failures.push("community Skill index schema_version must be public-community-skill-index/v1");
if (index.official !== false) failures.push("community Skill index must declare official=false");
if (index.catalog_version !== catalog.catalog_version) failures.push("community Skill index catalog_version must match catalog_version");
if (index.skill_count !== entries.length) failures.push(`community Skill index skill_count must equal skills.length (${entries.length})`);
if (catalog.community_skill_count !== entries.length) failures.push(`catalog community_skill_count must equal community index length (${entries.length})`);

const ids = new Set();
for (const entry of entries) {
  const id = entry?.id;
  if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    failures.push(`community Skill index contains invalid id '${String(id)}'`);
    continue;
  }
  if (ids.has(id)) failures.push(`community Skill index contains duplicate id '${id}'`);
  ids.add(id);
  const expectedManifestRef = `community-skills/${id}/manifest.json`;
  if (entry.manifest_ref !== expectedManifestRef) failures.push(`${id}: manifest_ref must be '${expectedManifestRef}'`);
  const manifestPath = path.join(repoRoot, "catalog", ...expectedManifestRef.split("/"));
  if (!fs.existsSync(manifestPath)) {
    failures.push(`${toPosix(path.relative(repoRoot, manifestPath))}: missing`);
    continue;
  }
  const manifest = readJson(manifestPath);
  if (manifest.schema_version !== "public-community-skill/v1") failures.push(`${id}: unsupported manifest schema_version`);
  if (manifest.id !== id) failures.push(`${id}: manifest id must match directory`);
  if (manifest.official !== false) failures.push(`${id}: manifest must declare official=false`);
  if (manifest.source_classification !== "user-contributed") failures.push(`${id}: source_classification must be user-contributed`);
  if (!String(manifest.source_label || "").includes("非官方")) failures.push(`${id}: source_label must visibly identify the Skill as non-official`);
  if (!String(manifest.source_attribution || "").trim()) failures.push(`${id}: source_attribution is required`);
  if (manifest.source_url !== null && !/^https:\/\//u.test(String(manifest.source_url))) failures.push(`${id}: source_url must be null or HTTPS`);
  if (!(Number(manifest.source_duration_seconds) > 0)) failures.push(`${id}: source_duration_seconds must be positive`);
  if (JSON.stringify(manifest.target_duration_range_seconds) !== JSON.stringify([4, 15])) failures.push(`${id}: target_duration_range_seconds must be [4,15]`);

  const media = manifest.source_media || {};
  if (!/^[a-f0-9]{64}$/u.test(String(media.sha256 || ""))) failures.push(`${id}: source_media.sha256 must be lowercase SHA-256`);
  if (!(Number(media.size_bytes) > 0)) failures.push(`${id}: source_media.size_bytes must be positive`);
  if (!media.video_codec || !media.audio_codec) failures.push(`${id}: source media must record video and audio codecs`);
  if (media.full_video_decode !== "passed" || media.full_audio_decode !== "passed") failures.push(`${id}: source media full decode gates must pass`);
  const releaseMedia = manifest.release_media || {};
  if (!/^[a-f0-9]{64}$/u.test(String(releaseMedia.sha256 || ""))) failures.push(`${id}: release_media.sha256 must be lowercase SHA-256`);
  if (!(Number(releaseMedia.size_bytes) > 0) || !(Number(releaseMedia.duration_seconds) > 0)) failures.push(`${id}: release_media size and duration must be positive`);
  if (!releaseMedia.video_codec || !releaseMedia.audio_codec) failures.push(`${id}: release media must record video and audio codecs`);
  if (releaseMedia.streams_copied_without_reencode !== true || releaseMedia.metadata_sanitized !== true) failures.push(`${id}: release media must record stream-copy and metadata sanitization`);
  if (releaseMedia.full_video_decode !== "passed" || releaseMedia.full_audio_decode !== "passed") failures.push(`${id}: release media full decode gates must pass`);
  if (!/^[a-f0-9]{64}$/u.test(String(manifest.source_prompt?.sha256 || ""))) failures.push(`${id}: source_prompt.sha256 must be lowercase SHA-256`);

  if (manifest.skill_ref !== id) failures.push(`${id}: skill_ref must match id`);
  const expectedSkillFiles = [
    `skills/${id}/SKILL.md`,
    `skills/${manifest.summary_ref}`,
    `skills/${manifest.prompt_refs?.minimax_h3}`,
    `skills/${manifest.prompt_refs?.seedance_2_0}`,
    `skills/${manifest.source_prompt?.analysis_ref}`
  ];
  for (const relative of expectedSkillFiles) {
    const filePath = path.join(repoRoot, ...relative.split("/"));
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile() || fs.statSync(filePath).size === 0) failures.push(`${relative}: required community Skill file is missing or empty`);
  }

  const previewBase = `community-skills/${id}`;
  if (manifest.preview_refs?.gif !== `${previewBase}/preview.gif`) failures.push(`${id}: invalid GIF mapping`);
  if (manifest.preview_refs?.poster !== `${previewBase}/poster.webp`) failures.push(`${id}: invalid poster mapping`);
  if (manifest.preview_refs?.mp4 !== `${previewBase}/preview.mp4`) failures.push(`${id}: invalid MP4 mapping`);
  for (const relative of [manifest.preview_refs?.gif, manifest.preview_refs?.poster]) {
    const filePath = path.join(repoRoot, "catalog", ...String(relative || "").split("/"));
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile() || fs.statSync(filePath).size === 0) failures.push(`catalog/${relative}: required preview is missing or empty`);
  }
  const gifPath = path.join(repoRoot, "catalog", ...String(manifest.preview_refs?.gif || "").split("/"));
  const posterPath = path.join(repoRoot, "catalog", ...String(manifest.preview_refs?.poster || "").split("/"));
  if (fs.existsSync(gifPath)) {
    const gif = fs.readFileSync(gifPath);
    if (!/^GIF8[79]a$/u.test(gif.subarray(0, 6).toString("ascii"))) failures.push(`${id}: preview.gif has an invalid GIF signature`);
    if (gif.length > 10 * 1024 * 1024) failures.push(`${id}: preview.gif exceeds the 10 MiB public preview budget`);
    if (manifest.preview_assets?.gif?.size_bytes !== gif.length) failures.push(`${id}: preview GIF size binding mismatch`);
    if (manifest.preview_assets?.gif?.sha256 !== crypto.createHash("sha256").update(gif).digest("hex")) failures.push(`${id}: preview GIF SHA-256 binding mismatch`);
  }
  if (fs.existsSync(posterPath)) {
    const poster = fs.readFileSync(posterPath);
    if (poster.subarray(0, 4).toString("ascii") !== "RIFF" || poster.subarray(8, 12).toString("ascii") !== "WEBP") failures.push(`${id}: poster.webp has an invalid WebP signature`);
    if (manifest.preview_assets?.poster?.size_bytes !== poster.length) failures.push(`${id}: poster size binding mismatch`);
    if (manifest.preview_assets?.poster?.sha256 !== crypto.createHash("sha256").update(poster).digest("hex")) failures.push(`${id}: poster SHA-256 binding mismatch`);
  }

  const models = Array.isArray(manifest.models) ? manifest.models : [];
  if (!models.includes("MiniMax H3") || !models.includes("Seedance 2.0")) failures.push(`${id}: both MiniMax H3 and Seedance 2.0 are required`);
  if (manifest.comfyui?.bundled !== false) failures.push(`${id}: this release must not claim the ComfyUI node was bundled or modified`);
}

const contentRoot = path.join(repoRoot, "catalog", "community-skills");
for (const directory of listDirectories(contentRoot)) {
  if (!ids.has(directory)) failures.push(`catalog/community-skills/${directory}: directory is not listed in the community Skill index`);
}

failWith("Community Skill validation", failures);
if (!process.exitCode) console.log(`Community Skill validation passed (${entries.length} non-official Skills).`);
