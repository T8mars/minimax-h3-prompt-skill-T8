import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { failWith, readJson, repoRoot } from "./lib.mjs";

const failures = [];
const requiredLocales = ["en", "zh-CN"];
const sha = (file) => crypto.createHash("sha256")
  .update(fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n"))
  .digest("hex");
const isProtected = (value) => /^(?:pass|fail|moderate|simple|complex|low|medium|high|released|published)$/u.test(value)
  || /^(?:inv|beat|obs)-\d+$/u.test(value)
  || /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/u.test(value);
const bannedMachineChinese = [
  /所有州|七个州/u,
  /借用的表面|源代码风格/u,
  /相机载体|广度设备/u,
  /空缺(?:都|是)?有效/u,
  /可读反应|放映时间/u,
  /不可能效果|关闭锁定/u,
  /界面的原始人/u,
  /未高级|清洁保持|流程切割/u,
  /原始的关闭系统|绩效规则/u,
  /清晰(?:\s|\u200B)*清晰可辨/u,
  /非卡宽度变形|源的九状态序列/u,
  /适用适用|短暂的短暂/u,
  /低承诺|承诺的结构|承诺结构/u,
  /单调地删除|现场证据字段|实时图像/u,
  /录音机式的观看界面/u,
  /来来源特有/u,
  /清洁空气发射|能源发射|运动员清除一个楼梯/u,
  /限制复制|宏观证明|宏观处理|宏观优先剪辑/u
];
const bannedMachineEnglish = [
  /two-wheel (?:dialogue|pause)/iu,
  /mouth was broken/iu,
  /real-life area/iu,
  /one blow determines the outcome/iu,
  /drive to an impossible foreign land/iu,
  /the more out of control you become/iu,
  /prompt word entrance|official warehouse/iu,
  /large oral broadcasts|physically enforceable/iu,
  /same object entity|familiar with the program/iu,
  /post-reincarnation inspection|impossible foreign land/iu
];

const stableTokenPattern = /\b(?:(?:inv|beat|obs)-\d+|T8-[A-Z0-9-]+|MiniMax H3|Seedance 2\.0|Ref2VA|I2VA|T2VA|FL2VA|L2VA)\b/giu;
const displayLiteralPattern = /\b(?=[A-Z0-9 .-]*[A-Z])(?:[A-Z0-9]{2,})(?:[ .-][A-Z0-9]{2,})*\b/gu;
const numericTokenPattern = /\d+(?:\.\d+)?/gu;
const tokens = (value, pattern) => [...String(value).matchAll(pattern)].map((match) => match[0].toLocaleLowerCase());

function semanticLeafErrors(source, localized, pointer, locale) {
  if (typeof source !== "string" || typeof localized !== "string" || source === localized) return;
  const sourceStable = tokens(source, stableTokenPattern);
  const localizedStable = tokens(localized, stableTokenPattern);
  if (JSON.stringify(sourceStable) !== JSON.stringify(localizedStable)) failures.push(`${pointer}: stable identifiers/model tokens differ from canonical source`);
  const sourceLiterals = tokens(source, displayLiteralPattern);
  const localizedLiterals = tokens(localized, displayLiteralPattern);
  if (JSON.stringify(sourceLiterals) !== JSON.stringify(localizedLiterals)) failures.push(`${pointer}: uppercase on-screen text or literal tokens differ from canonical source`);
  const sourceNumbers = tokens(source, numericTokenPattern);
  const localizedNumbers = tokens(localized, numericTokenPattern);
  if (sourceNumbers.length && sourceNumbers.length === localizedNumbers.length && JSON.stringify(sourceNumbers) !== JSON.stringify(localizedNumbers)) {
    failures.push(`${pointer}: numeric values differ from canonical source`);
  }
  if (locale === "zh-CN" && (source.match(/rather than/giu) || []).length === 1 && (localized.match(/而不是/gu) || []).length > 1) {
    failures.push(`${pointer}: duplicated 'rather than' relation may reverse the canonical subject/object constraint`);
  }
}

function shapeErrors(source, localized, pointer, options = {}) {
  if (Array.isArray(source)) {
    if (!Array.isArray(localized) || source.length !== localized.length) {
      failures.push(`${pointer}: array shape differs from canonical source`);
      return;
    }
    source.forEach((value, index) => shapeErrors(value, localized[index], `${pointer}[${index}]`, options));
    return;
  }
  if (source && typeof source === "object") {
    if (!localized || typeof localized !== "object" || Array.isArray(localized)) {
      failures.push(`${pointer}: object shape differs from canonical source`);
      return;
    }
    const sourceKeys = Object.keys(source);
    if (JSON.stringify(sourceKeys) !== JSON.stringify(Object.keys(localized))) failures.push(`${pointer}: keys/order differ from canonical source`);
    sourceKeys.forEach((key) => shapeErrors(source[key], localized[key], `${pointer}.${key}`, options));
    return;
  }
  if (typeof source !== "string") {
    if (source !== localized) failures.push(`${pointer}: non-text scalar changed`);
    return;
  }
  semanticLeafErrors(source, localized, pointer, options.locale);
  if (isProtected(source) && source !== localized) failures.push(`${pointer}: protected token '${source}' changed to '${localized}'`);
  if (/\.(?:changed_slots|preserved_invariant_ids|evidence_ids)\[\d+\]$/u.test(pointer) && source !== localized) failures.push(`${pointer}: reference-list token '${source}' must remain exact`);
  if (options.exact && source !== localized) failures.push(`${pointer}: canonical locale content was changed`);
}

function validateDocument(file, { kind, id, locale, bindings, canonicalDna, exactDna = false }) {
  if (!fs.existsSync(file)) {
    failures.push(`${path.relative(repoRoot, file)}: missing`);
    return;
  }
  let document;
  try { document = readJson(file); } catch (error) { failures.push(error.message); return; }
  const prefix = path.relative(repoRoot, file).replaceAll("\\", "/");
  if (document.schema_version !== "public-display-locale/v1") failures.push(`${prefix}: schema_version must be public-display-locale/v1`);
  if (document.resource_kind !== kind || document.resource_id !== id || document.locale !== locale) failures.push(`${prefix}: resource identity mismatch`);
  if (document.review?.status !== "approved" || typeof document.review?.method !== "string") failures.push(`${prefix}: approved review metadata is required`);
  else if (!/editorial/iu.test(document.review.method)) failures.push(`${prefix}: review method must record an editorial pass`);
  if ("prompts" in (document.content || {}) || "prompt" in (document.content || {})) failures.push(`${prefix}: executable prompts must never be embedded in display localization`);
  for (const [key, value] of Object.entries(bindings)) if (document.source_bindings?.[key] !== value) failures.push(`${prefix}: stale or missing ${key}`);
  const content = document.content;
  if (!content || typeof content.title !== "string" || !content.title.trim() || typeof content.summary !== "string" || !content.summary.trim()) failures.push(`${prefix}: title and summary are required`);
  const quick = content?.quick_start;
  for (const key of ["input_format", "recommended_input"]) if (typeof quick?.[key] !== "string" || !quick[key].trim()) failures.push(`${prefix}: quick_start.${key} is required`);
  for (const key of ["required_anchors", "usage_steps", "applicable_scope", "not_suitable_for"]) if (!Array.isArray(quick?.[key]) || quick[key].length < 2 || quick[key].some((value) => typeof value !== "string" || !value.trim())) failures.push(`${prefix}: quick_start.${key} needs at least two non-empty entries`);
  if (!content?.creative_dna || typeof content.creative_dna !== "object") failures.push(`${prefix}: creative_dna is required`);
  else if (canonicalDna) shapeErrors(canonicalDna, content.creative_dna, `${prefix}.creative_dna`, { exact: exactDna, locale });
  if (locale === "en" && /[\u4E00-\u9FFF]/u.test(`${content?.title || ""} ${content?.summary || ""} ${quick?.input_format || ""}`)) failures.push(`${prefix}: primary English display fields contain Chinese fallback text`);
  if (locale === "zh-CN" && !/[\u4E00-\u9FFF]/u.test(`${content?.title || ""} ${content?.summary || ""} ${quick?.input_format || ""}`)) failures.push(`${prefix}: primary Chinese display fields contain no Chinese content`);
  const serialized = JSON.stringify(content || {});
  const banned = locale === "zh-CN" ? bannedMachineChinese : bannedMachineEnglish;
  for (const pattern of banned) if (pattern.test(serialized)) failures.push(`${prefix}: machine-translation residue matches ${pattern}`);
}

const catalog = readJson(path.join(repoRoot, "catalog", "manifest.json"));
for (const entry of catalog.cases || []) {
  const id = entry.case_id;
  const dir = path.join(repoRoot, "catalog", "cases", id);
  const manifestFile = path.join(dir, "manifest.json");
  const dnaFile = path.join(dir, "creative-dna.json");
  const dna = readJson(dnaFile);
  const bindings = { manifest_sha256: sha(manifestFile), creative_dna_sha256: sha(dnaFile) };
  for (const locale of requiredLocales) validateDocument(path.join(dir, "locales", `${locale}.json`), { kind: "case", id, locale, bindings, canonicalDna: dna, exactDna: locale === "en" });
}

const officialFile = path.join(repoRoot, "catalog", "official-skills", "manifest.json");
const official = readJson(officialFile);
for (const entry of official.skills || []) {
  const summaryFile = path.join(repoRoot, "skills", ...entry.companion_summary_ref.split("/"));
  const bindings = { official_index_sha256: sha(officialFile), companion_summary_sha256: sha(summaryFile) };
  for (const locale of requiredLocales) validateDocument(path.join(repoRoot, "catalog", "official-skills", "locales", entry.id, `${locale}.json`), { kind: "official-skill", id: entry.id, locale, bindings });
}

const communityIndex = readJson(path.join(repoRoot, "catalog", "community-skills", "manifest.json"));
for (const entry of communityIndex.skills || []) {
  const manifestFile = path.join(repoRoot, "catalog", ...entry.manifest_ref.split("/"));
  const manifest = readJson(manifestFile);
  const summaryFile = path.join(repoRoot, "skills", ...manifest.summary_ref.split("/"));
  const bindings = { manifest_sha256: sha(manifestFile), summary_sha256: sha(summaryFile) };
  for (const locale of requiredLocales) validateDocument(path.join(path.dirname(manifestFile), "locales", `${locale}.json`), { kind: "community-skill", id: manifest.id, locale, bindings, canonicalDna: manifest.creative_dna, exactDna: locale === "zh-CN" });
}

failWith("Display localization validation", failures);
if (!process.exitCode) console.log(`Display localization validation passed (${catalog.cases.length + official.skills.length + communityIndex.skills.length} items × 2 locales).`);
