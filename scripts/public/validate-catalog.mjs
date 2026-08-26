import fs from "node:fs";
import path from "node:path";
import { failWith, findFirstStringByKeys, listDirectories, readJson, repoRoot, resolveRepoPath, toPosix } from "./lib.mjs";

const failures = [];
const catalogPath = path.join(repoRoot, "catalog", "manifest.json");
const casesRoot = path.join(repoRoot, "catalog", "cases");
const distributionPolicyPath = path.join(repoRoot, "catalog", "media-distribution-authorization.json");

if (!fs.existsSync(distributionPolicyPath)) {
  failures.push("catalog/media-distribution-authorization.json: missing");
} else {
  try {
    const policy = readJson(distributionPolicyPath);
    if (policy.schema_version !== "t8-media-distribution-authorization/v1") failures.push("media distribution policy schema is unsupported");
    if (policy.authorized_by !== "library_owner") failures.push("media distribution policy must be authorized by the library owner");
    if (policy.scope?.case_state !== "released" || policy.scope?.review_status !== "approved") failures.push("media distribution policy must cover released/approved cases");
    if (policy.permissions?.redistribute !== true) failures.push("media distribution policy must authorize redistribution");
    if (policy.permissions?.model_reference !== false || policy.permissions?.gif_connected_to_model !== false || policy.permissions?.source_video_connected_to_model !== false) failures.push("media distribution policy must keep all source media disconnected from model-reference inputs");
  } catch (error) {
    failures.push(error.message);
  }
}

if (!fs.existsSync(catalogPath)) {
  failWith("Catalog validation", ["catalog/manifest.json is missing"]);
  process.exit();
}

let catalog;
try {
  catalog = readJson(catalogPath);
} catch (error) {
  failWith("Catalog validation", [error.message]);
  process.exit();
}

if (!Array.isArray(catalog.cases)) failures.push("catalog/manifest.json: cases must be an array");
const entries = Array.isArray(catalog.cases) ? catalog.cases : [];
if (!Number.isInteger(catalog.case_count) || catalog.case_count !== entries.length) {
  failures.push(`catalog/manifest.json: case_count must equal cases.length (${entries.length})`);
}
if (catalog.official_skill_count !== 9) failures.push("catalog/manifest.json: official_skill_count must be 9");
if (catalog.official_skills_manifest !== "official-skills/manifest.json") {
  failures.push("catalog/manifest.json: official_skills_manifest must be 'official-skills/manifest.json'");
} else {
  const officialPath = path.join(repoRoot, "catalog", catalog.official_skills_manifest);
  if (!fs.existsSync(officialPath)) failures.push("catalog/official-skills/manifest.json: missing");
  else {
    try {
      const official = readJson(officialPath);
      if (official.catalog_version !== catalog.catalog_version) failures.push("official Skill index catalog_version must match catalog_version");
      if (official.skill_count !== catalog.official_skill_count) failures.push("official Skill index skill_count must match official_skill_count");
    } catch (error) {
      failures.push(error.message);
    }
  }
}
if (typeof catalog.schema_version !== "string" || !catalog.schema_version.trim()) failures.push("catalog/manifest.json: schema_version is required");
if (typeof catalog.catalog_version !== "string" || !catalog.catalog_version.trim()) failures.push("catalog/manifest.json: catalog_version is required");

const ids = new Set();
for (const entry of entries) {
  const id = entry?.case_id;
  if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    failures.push(`catalog/manifest.json: invalid case_id '${String(id)}'`);
    continue;
  }
  if (ids.has(id)) failures.push(`catalog/manifest.json: duplicate case_id '${id}'`);
  ids.add(id);
  if (entry.status !== "released") failures.push(`catalog/manifest.json: ${id} status must be 'released'`);

  const caseDir = path.join(casesRoot, id);
  const caseManifestPath = path.join(caseDir, "manifest.json");
  const requiredDefaults = [
    ["summary", path.join(caseDir, "SUMMARY.md")],
    ["Creative DNA", path.join(caseDir, "creative-dna.json")],
    ["source", path.join(caseDir, "source.json")],
    ["MiniMax H3 prompt", path.join(caseDir, "prompts", "minimax-h3.md")],
    ["Seedance 2.0 prompt", path.join(caseDir, "prompts", "seedance-2.0.md")],
    ["GIF preview", path.join(caseDir, "preview.gif")]
  ];
  if (!fs.existsSync(caseManifestPath)) {
    failures.push(`catalog/cases/${id}/manifest.json: missing`);
    continue;
  }

  let caseManifest;
  let source;
  try {
    caseManifest = readJson(caseManifestPath);
  } catch (error) {
    failures.push(error.message);
    continue;
  }
  const status = caseManifest.status ?? caseManifest.release_status;
  if (status !== "released") failures.push(`catalog/cases/${id}/manifest.json: status must be 'released', got '${String(status)}'`);
  if (caseManifest.case_id && caseManifest.case_id !== id) failures.push(`catalog/cases/${id}/manifest.json: case_id must match directory`);
  if (!Number.isFinite(Date.parse(String(caseManifest.created_at || "")))) failures.push(`catalog/cases/${id}/manifest.json: created_at must be a valid catalog-addition timestamp`);
  if (!Number.isFinite(Date.parse(String(caseManifest.updated_at || "")))) failures.push(`catalog/cases/${id}/manifest.json: updated_at must be a valid content-update timestamp`);
  if (!(Number(caseManifest.source_duration_seconds) > 0)) failures.push(`catalog/cases/${id}/manifest.json: source_duration_seconds must preserve the positive decoded source duration`);
  const targetDuration = Number(caseManifest.target_duration_seconds);
  if (!Number.isFinite(targetDuration) || targetDuration < 4 || targetDuration > 15) {
    failures.push(`catalog/cases/${id}/manifest.json: target_duration_seconds must be within 4..15`);
  }
  const logicalMp4 = caseManifest.preview_refs?.mp4 ?? caseManifest.preview_paths?.mp4;
  if (logicalMp4 !== `media/${id}/preview.mp4`) failures.push(`catalog/cases/${id}/manifest.json: MP4 release mapping must be 'media/${id}/preview.mp4'`);

  const previewStatus = caseManifest.preview_status && typeof caseManifest.preview_status === "object" ? caseManifest.preview_status : {};
  const indexedPreviewStatus = entry.preview_status && typeof entry.preview_status === "object" ? entry.preview_status : {};
  if (entry.preview_status !== undefined && JSON.stringify(indexedPreviewStatus) !== JSON.stringify(previewStatus)) failures.push(`catalog/manifest.json: ${id} preview_status must match the case manifest`);
  if (previewStatus.gif !== "available") failures.push(`catalog/cases/${id}: released cases must ship their real GIF preview`);
  if (previewStatus.poster !== "available") failures.push(`catalog/cases/${id}: released cases must ship a poster derived from the real preview`);
  if (previewStatus.mp4 !== "available_in_electron_media_pack") failures.push(`catalog/cases/${id}: released cases must ship their approved source video in the media pack`);

  for (const [label, filePath] of requiredDefaults) {
    if (!fs.existsSync(filePath)) failures.push(`catalog/cases/${id}: missing ${label} at ${toPosix(path.relative(repoRoot, filePath))}`);
    else if (fs.statSync(filePath).size === 0) failures.push(`catalog/cases/${id}: ${label} is empty`);
  }

  try {
    readJson(path.join(caseDir, "creative-dna.json"));
    source = readJson(path.join(caseDir, "source.json"));
  } catch (error) {
    failures.push(error.message);
  }

  if (source) {
    const sourceUrl = findFirstStringByKeys(source, ["canonical_source_url", "canonical_url", "source_post_url", "post_url", "source_url"]);
    if (!sourceUrl || !/^https:\/\//i.test(sourceUrl)) failures.push(`catalog/cases/${id}/source.json: canonical HTTPS source URL is required`);
    if (JSON.stringify(source.video_reference?.preview_status || {}) !== JSON.stringify(previewStatus)) failures.push(`catalog/cases/${id}/source.json: preview_status must match the case manifest`);
    if (source.video_reference?.preview_mp4 !== `media/${id}/preview.mp4`) failures.push(`catalog/cases/${id}/source.json: preview_mp4 must bind the approved media-pack video`);
  }

  const models = Array.isArray(entry.models) ? entry.models.map((value) => String(value).toLowerCase()) : [];
  if (!models.some((value) => value.includes("minimax") || value.includes("h3"))) failures.push(`catalog/manifest.json: ${id} must list MiniMax H3 support`);
  if (!models.some((value) => value.includes("seedance"))) failures.push(`catalog/manifest.json: ${id} must list Seedance 2.0 support`);

  const declaredPaths = [
    entry.manifest_path,
    entry.summary_path,
    entry.source_path,
    entry.creative_dna_path,
    ...(entry.prompt_paths && typeof entry.prompt_paths === "object" ? Object.values(entry.prompt_paths) : []),
    ...(entry.preview_paths && typeof entry.preview_paths === "object" ? Object.values(entry.preview_paths).filter((value) => typeof value === "string" && !value.startsWith("media/")) : [])
  ].filter(Boolean);
  for (const declared of declaredPaths) {
    try {
      const filePath = resolveRepoPath(`catalog/${declared}`, `catalog case ${id} path`);
      if (!fs.existsSync(filePath)) failures.push(`catalog/manifest.json: ${id} declares missing path '${declared}'`);
    } catch (error) {
      failures.push(error.message);
    }
  }
}

for (const directory of listDirectories(casesRoot)) {
  if (!ids.has(directory)) failures.push(`catalog/cases/${directory}: directory is not listed in catalog/manifest.json`);
}

failWith("Catalog validation", failures);
if (!process.exitCode) console.log(`Catalog validation passed (${entries.length} released cases).`);
