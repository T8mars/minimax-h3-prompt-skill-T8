import fs from "node:fs";
import path from "node:path";
import { failWith, findFirstStringByKeys, listDirectories, readJson, repoRoot, resolveRepoPath, toPosix } from "./lib.mjs";

const failures = [];
const catalogPath = path.join(repoRoot, "catalog", "manifest.json");
const casesRoot = path.join(repoRoot, "catalog", "cases");

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
  if (!(Number(caseManifest.source_duration_seconds) > 0)) failures.push(`catalog/cases/${id}/manifest.json: source_duration_seconds must preserve the positive decoded source duration`);
  if (Number(caseManifest.target_duration_seconds) !== 15) failures.push(`catalog/cases/${id}/manifest.json: target_duration_seconds must be 15`);
  const logicalMp4 = caseManifest.preview_refs?.mp4 ?? caseManifest.preview_paths?.mp4;
  if (logicalMp4 !== `media/${id}/preview.mp4`) failures.push(`catalog/cases/${id}/manifest.json: MP4 release mapping must be 'media/${id}/preview.mp4'`);

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
