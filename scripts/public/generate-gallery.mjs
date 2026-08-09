import fs from "node:fs";
import path from "node:path";
import { findFirstStringByKeys, readJson, repoRoot, toPosix } from "./lib.mjs";

const startMarker = "<!-- CASE_GALLERY:START -->";
const endMarker = "<!-- CASE_GALLERY:END -->";
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : null;

if (!mode) {
  console.error("Usage: node scripts/public/generate-gallery.mjs --write|--check");
  process.exit(2);
}

const readmePath = path.join(repoRoot, "README.md");
const catalog = readJson(path.join(repoRoot, "catalog", "manifest.json"));
const rows = [];

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

for (const entry of catalog.cases ?? []) {
  const id = entry.case_id;
  const caseDir = path.join(repoRoot, "catalog", "cases", id);
  const source = readJson(path.join(caseDir, "source.json"));
  const sourceUrl = findFirstStringByKeys(source, ["canonical_source_url", "canonical_url", "source_post_url", "post_url", "source_url"]);
  const title = escapeCell(entry.title || id);
  const summaryPath = entry.summary_path || `cases/${id}/SUMMARY.md`;
  const declaredGif = entry.preview_paths?.gif || entry.preview_paths?.preview_gif || null;
  const gifPath = declaredGif || `cases/${id}/preview.gif`;
  const summaryHref = summaryPath.startsWith("catalog/") ? summaryPath : `catalog/${summaryPath}`;
  const gifHref = gifPath.startsWith("catalog/") ? gifPath : `catalog/${gifPath}`;
  const absoluteGif = path.resolve(repoRoot, gifHref);
  const models = Array.isArray(entry.models) ? entry.models.join(" · ") : "MiniMax H3 · Seedance 2.0";
  const preview = fs.existsSync(absoluteGif)
    ? `[![${title}](${toPosix(gifHref)})](${sourceUrl})`
    : `[查看原视频 / View source](${sourceUrl})`;
  rows.push(`| ${preview} | **[${title}](${toPosix(summaryHref)})**<br><sub>${escapeCell(id)}</sub> | ${escapeCell(models)} |`);
}

const generated = rows.length
  ? ["| 预览 / Preview | 案例 / Case | 模型 / Models |", "| --- | --- | --- |", ...rows].join("\n")
  : "> 暂无已发布案例 / No released cases yet.";

const readme = fs.readFileSync(readmePath, "utf8");
const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker);
if (start < 0 || end < 0 || end <= start) {
  console.error("README.md gallery markers are missing or malformed.");
  process.exit(1);
}
const expected = `${readme.slice(0, start + startMarker.length)}\n\n${generated}\n\n${readme.slice(end)}`;

if (mode === "write") {
  fs.writeFileSync(readmePath, expected, "utf8");
  console.log(`README gallery updated (${rows.length} cases).`);
} else if (readme !== expected) {
  console.error("README gallery is stale. Run: npm run gallery:write");
  process.exit(1);
} else {
  console.log(`README gallery is current (${rows.length} cases).`);
}
