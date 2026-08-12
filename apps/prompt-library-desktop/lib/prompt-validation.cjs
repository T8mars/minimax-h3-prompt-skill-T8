const crypto = require("node:crypto");

const STOP_WORDS = new Set([
  "the", "and", "with", "from", "into", "then", "that", "this", "one", "two", "three", "must", "should", "after", "before",
  "一个", "一种", "需要", "必须", "然后", "同时", "镜头", "画面", "主体", "最终", "保持", "使用"
]);

function normalized(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/\s+/gu, " ").trim();
}

function keywords(value) {
  const text = normalized(value);
  const latin = text.match(/[a-z0-9][a-z0-9_-]{2,}/gu) || [];
  const han = text.match(/[\p{Script=Han}]{2,}/gu) || [];
  const hanChunks = han.flatMap((chunk) => {
    if (chunk.length <= 4) return [chunk];
    const pieces = [];
    for (let index = 0; index < chunk.length - 1; index += 2) pieces.push(chunk.slice(index, index + 2));
    return pieces;
  });
  return [...new Set([...latin, ...hanChunks].filter((token) => !STOP_WORDS.has(token)))];
}

function userFacts(value) {
  const text = String(value || "");
  const quoted = [...text.matchAll(/[“”"']([^“”"']{2,80})[“”"']/gu)].map((match) => match[1]);
  const numbers = text.match(/(?<![A-Za-z0-9_-])\d+(?:\.\d+)?(?![A-Za-z0-9_-])/gu) || [];
  const labels = text.match(/\b(?:[A-Z]{2,}[A-Z0-9_-]*|[A-Z][a-z]+(?:[A-Z][A-Za-z0-9]*)+|[A-Z][A-Za-z0-9]*_[A-Za-z0-9_-]+|[A-Z][A-Za-z0-9]*-[A-Za-z0-9_-]*\d[A-Za-z0-9_-]*)\b/gu) || [];
  return [...new Set([...quoted, ...numbers, ...labels])].slice(0, 30);
}

function anchorMatch(anchor, output) {
  const haystack = normalized(output);
  const exact = normalized(anchor);
  if (exact && haystack.includes(exact)) return { matched: true, confidence: 1, tokens: [exact] };
  const tokens = keywords(anchor);
  if (!tokens.length) return { matched: null, confidence: 0, tokens: [] };
  const found = tokens.filter((token) => haystack.includes(token));
  const ratio = found.length / tokens.length;
  return { matched: ratio >= Math.min(0.6, tokens.length === 1 ? 1 : 0.5), confidence: Number(ratio.toFixed(3)), tokens: found };
}

function validateTarget(target, output, outputLanguage = "zh-CN") {
  const text = String(output || "").trim();
  const errors = [];
  const warnings = [];
  const hasChinese = /[\p{Script=Han}]/u.test(text);
  const hanCount = (text.match(/[\p{Script=Han}]/gu) || []).length;
  const latinWordCount = (text.match(/\b[A-Za-z]{3,}\b/gu) || []).length;
  if (text.length < 120) errors.push({ code: "output_too_short", message: "The enhanced prompt is too short to carry the selected mechanism." });
  if (/^(analysis|here(?:'s| is)|当然|以下是|分析)\b/iu.test(text)) warnings.push({ code: "wrapper_text", message: "The provider added explanatory wrapper text." });
  if (outputLanguage === "zh-CN" && (!hasChinese || hanCount < 12)) errors.push({ code: "output_language_missing", message: "The requested Simplified Chinese prompt contains insufficient Chinese prose." });
  if (outputLanguage === "en" && latinWordCount < 20) errors.push({ code: "output_language_missing", message: "The requested English prompt contains insufficient English prose." });
  if (target === "minimaxH3") {
    const hasTiming = /(?:\b\d+(?:\.\d+)?\s*(?:s|sec|seconds|秒)\b|\bshot\s*\d+\b|镜头\s*\d+|\d{1,2}:\d{2})/iu.test(text);
    const hasCamera = /(?:\b(camera|shot|lens|close-up|wide|tracking|dolly|pan|tilt|locked)\b|镜头|特写|近景|中景|全景|广角|跟拍|推轨|横摇|俯仰|固定机位)/iu.test(text);
    if (!hasTiming) errors.push({ code: "h3_timing_missing", message: "MiniMax H3 output has no readable timing or shot structure." });
    if (!hasCamera) warnings.push({ code: "h3_camera_missing", message: "MiniMax H3 output has no explicit camera language." });
  } else {
    if (/^\s*(?:Subject|Scene|Camera|Style|Audio)\s*:/imu.test(text)) warnings.push({ code: "h3_surface_leak", message: "Seedance output appears to contain H3 field grammar." });
  }
  return { errors, warnings };
}

function validateEnhancedPrompt({ target, outputLanguage = "zh-CN", intent, output, requiredAnchors = [] }) {
  const targetResult = validateTarget(target, output, outputLanguage);
  const facts = userFacts(intent).map((fact) => ({ fact, matched: normalized(output).includes(normalized(fact)) }));
  const missingFacts = facts.filter((item) => !item.matched);
  if (missingFacts.length) targetResult.errors.push({ code: "user_fact_missing", message: `Explicit user facts missing: ${missingFacts.map((item) => item.fact).join(", ")}` });
  const anchorTrace = requiredAnchors.map((anchor, index) => ({
    anchorId: `anchor-${String(index + 1).padStart(2, "0")}`,
    anchor,
    ...anchorMatch(anchor, output)
  }));
  const determinate = anchorTrace.filter((item) => item.matched !== null);
  const matched = determinate.filter((item) => item.matched).length;
  const anchorCoverage = determinate.length ? matched / determinate.length : null;
  const missingAnchors = anchorTrace.filter((item) => item.matched === false);
  if (missingAnchors.length) targetResult.warnings.push({ code: "anchor_unverified", message: `${missingAnchors.length} required anchor(s) were not located deterministically.` });
  const status = targetResult.errors.length ? "fail" : targetResult.warnings.length ? "warning" : "pass";
  return {
    schemaVersion: "t8-prompt-validation-report/v1",
    status,
    target,
    outputLanguage,
    outputSha256: crypto.createHash("sha256").update(String(output || ""), "utf8").digest("hex"),
    errors: targetResult.errors,
    warnings: targetResult.warnings,
    userFacts: facts,
    anchorCoverage: anchorCoverage === null ? null : Number(anchorCoverage.toFixed(3)),
    realizedTrace: anchorTrace
  };
}

module.exports = { anchorMatch, keywords, normalized, userFacts, validateEnhancedPrompt };
