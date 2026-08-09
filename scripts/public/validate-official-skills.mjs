import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { failWith, readJson, repoRoot, resolveRepoPath, toPosix } from "./lib.mjs";

const manifestPath = path.join(repoRoot, "catalog", "official-skills", "manifest.json");
const failures = [];
const expectedIds = new Set([
  "h3-prompt-writing",
  "minimalist-product-ad-generator",
  "3d-animation-short-generator",
  "papercraft-stop-motion-explainer",
  "brand-promo-video-generator",
  "music-video-subtitle-generator",
  "co-op-game-intro-generator",
  "paper-collage-explainer-generator",
  "handdrawn-live-video-generator"
]);
const classifications = new Set(["official", "official-featured", "community", "repository-owned"]);

if (!fs.existsSync(manifestPath)) {
  failures.push("catalog/official-skills/manifest.json: missing");
} else {
  const index = readJson(manifestPath);
  const entries = Array.isArray(index.skills) ? index.skills : [];
  if (index.schema_version !== "public-official-skill-index/v1") failures.push("official Skill index schema_version is invalid");
  if (!/^\d+\.\d+\.\d+$/u.test(index.catalog_version || "")) failures.push("official Skill index catalog_version must be semver");
  if (index.repository !== "MiniMax-AI/MiniMax-H3") failures.push("official Skill index repository must be MiniMax-AI/MiniMax-H3");
  if (!/^[0-9a-f]{40}$/u.test(index.pinned_commit || "")) failures.push("official Skill index pinned_commit must be a full Git commit");
  if (index.skill_count !== 9 || entries.length !== 9) failures.push("official Skill index must contain exactly 9 entries");
  if (index.upstream_content_embedded !== false) failures.push("upstream Skill bodies must not be embedded in this public repository");
  if (index.comfyui_import !== false) failures.push("official repository Skills must remain excluded from ComfyUI import");

  const ids = new Set();
  const companions = new Set();
  for (const entry of entries) {
    const prefix = `official Skill '${String(entry?.id)}'`;
    if (!expectedIds.has(entry?.id)) failures.push(`${prefix}: unexpected id`);
    if (ids.has(entry?.id)) failures.push(`${prefix}: duplicate id`);
    ids.add(entry?.id);
    if (!classifications.has(entry?.source_classification)) failures.push(`${prefix}: invalid source_classification`);
    if (!entry?.source_label || !entry?.summary || !entry?.title_zh) failures.push(`${prefix}: title, label, and summary are required`);
    if (entry?.comfyui_import !== undefined && entry.comfyui_import !== false) failures.push(`${prefix}: comfyui_import must be false when present`);
    if (!entry?.models?.includes("MiniMax H3") || !entry?.models?.includes("Seedance 2.0")) failures.push(`${prefix}: both model labels are required`);
    if (!entry?.upstream_skill_url?.startsWith(`https://github.com/MiniMax-AI/MiniMax-H3/tree/${index.pinned_commit}/skills/${entry.id}`)) failures.push(`${prefix}: upstream_skill_url must bind the pinned commit`);
    if (entry?.upstream_install_command !== `npx skills add https://github.com/MiniMax-AI/MiniMax-H3 --skill ${entry.id}`) failures.push(`${prefix}: install command is invalid`);
    for (const [field, size] of [["upstream_tree_sha", 40], ["upstream_skill_sha256", 64]]) {
      if (!new RegExp(`^[0-9a-f]{${size}}$`, "u").test(entry?.[field] || "")) failures.push(`${prefix}: ${field} is invalid`);
    }
    if (entry?.upstream_meta_sha256 !== null && !/^[0-9a-f]{64}$/u.test(entry?.upstream_meta_sha256 || "")) failures.push(`${prefix}: upstream_meta_sha256 is invalid`);
    const upstreamPreviewPattern = new RegExp(`^https://github\\.com/MiniMax-AI/MiniMax-H3/blob/${index.pinned_commit}/assets/.+\\.(?:gif|mp4)$`, "u");
    if (!upstreamPreviewPattern.test(entry?.upstream_preview_url || "")) failures.push(`${prefix}: upstream_preview_url must bind a GIF or MP4 at the pinned repository commit`);
    if (!/^[0-9a-f]{64}$/u.test(entry?.upstream_preview_sha256 || "")) failures.push(`${prefix}: upstream_preview_sha256 is invalid`);
    const expectedPreviewRef = `official-skills/previews/${entry.id}.gif`;
    if (entry?.local_preview_ref !== expectedPreviewRef) failures.push(`${prefix}: local_preview_ref must be ${expectedPreviewRef}`);
    if (!/^[0-9a-f]{64}$/u.test(entry?.local_preview_sha256 || "")) failures.push(`${prefix}: local_preview_sha256 is invalid`);
    if (!new Set(["official-skill-demo", "official-mode-demo-converted"]).has(entry?.preview_kind)) failures.push(`${prefix}: preview_kind is invalid`);
    if (!entry?.preview_label?.includes("GIF")) failures.push(`${prefix}: preview_label must visibly identify GIF media`);
    try {
      const previewPath = resolveRepoPath(`catalog/${expectedPreviewRef}`, `${prefix} local preview`);
      if (!fs.existsSync(previewPath) || !fs.statSync(previewPath).isFile()) {
        failures.push(`${prefix}: local preview GIF is missing`);
      } else {
        const bytes = fs.readFileSync(previewPath);
        if (bytes.length === 0 || bytes.length > 10 * 1024 * 1024) failures.push(`${prefix}: local preview GIF must be non-empty and at most 10 MiB`);
        if (!bytes.subarray(0, 6).equals(Buffer.from("GIF89a")) && !bytes.subarray(0, 6).equals(Buffer.from("GIF87a"))) failures.push(`${prefix}: local preview is not a GIF`);
        const digest = createHash("sha256").update(bytes).digest("hex");
        if (digest !== entry.local_preview_sha256) failures.push(`${prefix}: local preview SHA-256 mismatch`);
      }
    } catch (error) {
      failures.push(error.message);
    }

    const companion = entry?.companion_skill;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(companion || "")) failures.push(`${prefix}: companion_skill is invalid`);
    if (companions.has(companion)) failures.push(`${prefix}: companion_skill must be unique`);
    companions.add(companion);
    const expectedSummary = `${companion}/references/summary.md`;
    const expectedTemplate = `${companion}/references/template.md`;
    if (entry?.companion_summary_ref !== expectedSummary) failures.push(`${prefix}: companion_summary_ref must be ${expectedSummary}`);
    if (entry?.companion_seedance_ref !== expectedTemplate) failures.push(`${prefix}: companion_seedance_ref must be ${expectedTemplate}`);

    for (const relative of [entry?.companion_summary_ref, entry?.companion_seedance_ref]) {
      try {
        const filePath = resolveRepoPath(`skills/${relative}`, `${prefix} companion reference`);
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) failures.push(`${prefix}: missing ${toPosix(path.relative(repoRoot, filePath))}`);
      } catch (error) {
        failures.push(error.message);
      }
    }
    const skillPath = path.join(repoRoot, "skills", companion || "", "SKILL.md");
    if (!fs.existsSync(skillPath)) failures.push(`${prefix}: companion SKILL.md is missing`);
    const templatePath = path.join(repoRoot, "skills", companion || "", "references", "template.md");
    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, "utf8");
      for (const forbidden of ["Global settings:", "Shot list:", "Subject definitions:", "Retention:", "Detailed description:"]) {
        if (template.includes(forbidden)) failures.push(`${prefix}: Seedance template leaks H3 field '${forbidden}'`);
      }
      if (/\b(?:from|between)\s+\d+(?:\.\d+)?s\b|\b\d+(?:\.\d+)?s\s*[-–]\s*\d+(?:\.\d+)?s\b/iu.test(template)) failures.push(`${prefix}: Seedance template must not prescribe exact shot timestamps`);
    }
  }
  for (const expected of expectedIds) if (!ids.has(expected)) failures.push(`official Skill index is missing '${expected}'`);
}

failWith("Official Skill validation", failures);
if (!process.exitCode) console.log("Official Skill validation passed (9 pinned upstream entries + 9 independent Seedance companions; ComfyUI import disabled).");
