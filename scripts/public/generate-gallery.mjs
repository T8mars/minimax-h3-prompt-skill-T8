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

const catalog = readJson(path.join(repoRoot, "catalog", "manifest.json"));
const readmeTargets = [
  {
    path: path.join(repoRoot, "README.md"),
    label: "README.md",
    locale: "zh-CN",
    header: "| 预览 | 案例 | 模型 |",
    empty: "> 暂无已发布案例。"
  },
  {
    path: path.join(repoRoot, "README_EN.md"),
    label: "README_EN.md",
    locale: "en",
    header: "| Preview | Case | Models |",
    empty: "> No released cases yet."
  }
];

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function titleForLocale(caseDir, entry, locale) {
  const localePath = path.join(caseDir, "locales", `${locale}.json`);
  if (!fs.existsSync(localePath)) return entry.title || entry.case_id;
  const localized = readJson(localePath);
  return localized?.content?.title || entry.title || entry.case_id;
}

function buildGallery(target) {
  const rows = [];
  for (const entry of catalog.cases ?? []) {
    const id = entry.case_id;
    const caseDir = path.join(repoRoot, "catalog", "cases", id);
    const source = readJson(path.join(caseDir, "source.json"));
    const sourceUrl = findFirstStringByKeys(source, ["canonical_source_url", "canonical_url", "source_post_url", "post_url", "source_url"]);
    const title = escapeCell(titleForLocale(caseDir, entry, target.locale));
    const summaryPath = entry.summary_path || `cases/${id}/SUMMARY.md`;
    const declaredGif = entry.preview_paths?.gif || entry.preview_paths?.preview_gif || null;
    const gifPath = declaredGif || `cases/${id}/preview.gif`;
    const summaryHref = summaryPath.startsWith("catalog/") ? summaryPath : `catalog/${summaryPath}`;
    const gifHref = gifPath.startsWith("catalog/") ? gifPath : `catalog/${gifPath}`;
    const absoluteGif = path.resolve(repoRoot, gifHref);
    const models = Array.isArray(entry.models) ? entry.models.join(" · ") : "MiniMax H3 · Seedance 2.0";
    const sourceLabel = target.locale === "en" ? "View source" : "查看原视频";
    const preview = fs.existsSync(absoluteGif)
      ? `[![${title}](${toPosix(gifHref)})](${sourceUrl})`
      : `[${sourceLabel}](${sourceUrl})`;
    rows.push(`| ${preview} | **[${title}](${toPosix(summaryHref)})**<br><sub>${escapeCell(id)}</sub> | ${escapeCell(models)} |`);
  }
  return rows.length
    ? [target.header, "| --- | --- | --- |", ...rows].join("\n")
    : target.empty;
}

let stale = false;
for (const target of readmeTargets) {
  if (!fs.existsSync(target.path)) {
    console.error(`${target.label} is missing.`);
    process.exit(1);
  }
  const readme = fs.readFileSync(target.path, "utf8");
  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) {
    console.error(`${target.label} gallery markers are missing or malformed.`);
    process.exit(1);
  }
  const generated = buildGallery(target);
  const expected = `${readme.slice(0, start + startMarker.length)}\n\n${generated}\n\n${readme.slice(end)}`;

  if (mode === "write") {
    fs.writeFileSync(target.path, expected, "utf8");
  } else if (readme !== expected) {
    console.error(`${target.label} gallery is stale. Run: npm run gallery:write`);
    stale = true;
  }
}

if (stale) process.exit(1);
const verb = mode === "write" ? "updated" : "current";
console.log(`Chinese and English README galleries are ${verb} (${catalog.cases?.length ?? 0} cases each).`);
