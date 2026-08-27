const crypto = require("node:crypto");

const INDEX_SCHEMA = "t8-template-index/v1";
const MAX_PROFILE_TERMS = 80;

function text(value, limit = 4000) {
  return String(value ?? "").replace(/\r\n/gu, "\n").replace(/\s+/gu, " ").trim().slice(0, limit);
}

function strings(value, limit = 12, itemLimit = 300) {
  return (Array.isArray(value) ? value : [])
    .map((item) => text(typeof item === "string" ? item : item?.rule || item?.constraint || item?.name || "", itemLimit))
    .filter(Boolean)
    .slice(0, limit);
}

function localized(item, locale) {
  return item?.localizations?.[locale] || item?.localizations?.[locale === "zh-CN" ? "en" : "zh-CN"] || {};
}

function templateKey(item) {
  return text(item?.templateId || item?.skillRef || item?.id, 240);
}

function qualityScore(item) {
  return Number(item?.quality?.weighted_score || item?.qualityScore || 0) || 0;
}

function updatedTime(item) {
  const value = Date.parse(item?.updatedAt || item?.updated_at || item?.catalogAddedAt || "");
  return Number.isFinite(value) ? value : 0;
}

function representative(left, right) {
  const qualityDelta = qualityScore(right) - qualityScore(left);
  if (qualityDelta) return qualityDelta;
  const timeDelta = updatedTime(right) - updatedTime(left);
  if (timeDelta) return timeDelta;
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}

function compactCard(item, variants = []) {
  const zh = localized(item, "zh-CN");
  const en = localized(item, "en");
  const zhQuick = zh.quick_start || {};
  const enQuick = en.quick_start || {};
  const zhDna = zh.creative_dna || item?.creativeDna || {};
  const enDna = en.creative_dna || {};
  const targetRange = Array.isArray(item?.targetDurationRangeSeconds)
    ? item.targetDurationRangeSeconds.slice(0, 2).map(Number)
    : Number(item?.targetDurationSeconds) > 0 ? [Number(item.targetDurationSeconds), Number(item.targetDurationSeconds)] : [];
  return {
    titleZh: text(zh.title || item?.title, 160),
    titleEn: text(en.title || item?.englishTitle || item?.title, 160),
    summaryZh: text(zh.summary || item?.summary, 300),
    summaryEn: text(en.summary || item?.summary, 300),
    mechanismZh: text(zhDna.mechanism || zhDna.usage_scope || item?.creativeDna?.mechanism, 420),
    mechanismEn: text(enDna.mechanism || enDna.usage_scope, 420),
    requiredAnchorsZh: strings(zhQuick.required_anchors || zhDna.invariants || item?.requiredAnchors, 6, 180),
    applicableZh: strings(zhQuick.applicable_scope || zhDna.applicable_scope, 4, 180),
    notSuitableZh: strings(zhQuick.not_suitable_for || zhDna.not_suitable_for, 4, 180),
    tags: strings(item?.tags, 16, 80),
    models: strings(item?.models, 6, 80),
    targetDurationRangeSeconds: targetRange,
    variantTitlesZh: variants.map((variant) => text(localized(variant, "zh-CN").title || variant?.title, 140)).filter(Boolean).slice(0, 8)
  };
}

function catalogItem(item, kind, canonicalTemplateId) {
  return {
    id: text(item?.id, 240),
    kind,
    canonicalTemplateId,
    titleZh: text(localized(item, "zh-CN").title || item?.title, 240),
    titleEn: text(localized(item, "en").title || item?.englishTitle || item?.title, 240),
    status: text(item?.state || "released", 40),
    updatedAt: text(item?.updatedAt || item?.updated_at || item?.catalogAddedAt, 80),
    recommendable: kind !== "official-skill"
  };
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function stableStringify(value, spacing = 0) {
  return JSON.stringify(stableValue(value), null, spacing);
}

function sha256(value) {
  return crypto.createHash("sha256").update(typeof value === "string" ? value : stableStringify(value), "utf8").digest("hex");
}

function buildTemplateIndex(catalog) {
  const cases = Array.isArray(catalog?.cases) ? catalog.cases : [];
  const community = Array.isArray(catalog?.communitySkills) ? catalog.communitySkills : [];
  const official = Array.isArray(catalog?.officialSkills) ? catalog.officialSkills : [];
  const grouped = new Map();
  for (const item of cases) {
    const key = templateKey(item);
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  const recommendationEntities = [];
  for (const [key, variants] of grouped) {
    const ordered = [...variants].sort(representative);
    const primary = ordered[0];
    recommendationEntities.push({
      templateId: key,
      kind: "case-template",
      representativeId: primary.id,
      caseIds: ordered.map((item) => item.id),
      card: compactCard(primary, ordered)
    });
  }
  for (const item of community) {
    const key = templateKey(item);
    recommendationEntities.push({
      templateId: key,
      kind: "community-skill",
      representativeId: item.id,
      caseIds: [item.id],
      card: compactCard(item, [item])
    });
  }
  recommendationEntities.sort((left, right) => left.templateId.localeCompare(right.templateId));

  const catalogItems = [
    ...cases.map((item) => catalogItem(item, "case", templateKey(item))),
    ...community.map((item) => catalogItem(item, "community-skill", templateKey(item))),
    ...official.map((item) => catalogItem(item, "official-skill", `official:${item.id}`))
  ].sort((left, right) => left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id));

  const index = {
    schemaVersion: INDEX_SCHEMA,
    catalogVersion: text(catalog?.catalogVersion, 80),
    catalogGeneratedAt: text(catalog?.generatedAt, 80),
    counts: {
      catalogItems: catalogItems.length,
      caseRows: cases.length,
      officialSkillRows: official.length,
      communitySkillRows: community.length,
      canonicalCaseTemplates: grouped.size,
      caseVariantRows: cases.length - grouped.size,
      recommendationEntities: recommendationEntities.length
    },
    catalogItems,
    recommendationEntities
  };
  index.indexSha256 = sha256({ ...index, indexSha256: undefined });
  return index;
}

function normalizeSearch(value) {
  return text(value, 200000).normalize("NFKC").toLocaleLowerCase().replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/gu, " ").trim();
}

function profileTerms(profile, intent = "") {
  const values = [intent];
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (value && typeof value === "object") return Object.values(value).forEach(visit);
    if (typeof value === "string") values.push(value);
  };
  visit(profile);
  const terms = [];
  for (const value of values) {
    const normalized = normalizeSearch(value);
    const latin = normalized.match(/[a-z0-9][a-z0-9_-]{1,}/gu) || [];
    const han = normalized.match(/[\p{Script=Han}]{2,}/gu) || [];
    for (const token of [...latin, ...han, ...han.flatMap((part) => part.length > 4 ? [...Array(part.length - 1)].map((_unused, index) => part.slice(index, index + 2)) : [])]) {
      if (token.length > 1 && !terms.includes(token)) terms.push(token);
      if (terms.length >= MAX_PROFILE_TERMS) return terms;
    }
  }
  return terms;
}

function searchableCard(entity) {
  return normalizeSearch(Object.values(entity?.card || {}).flat(Infinity).join(" "));
}

function shortlistRecommendationEntities(index, profile, intent, limit = 24) {
  const terms = profileTerms(profile, intent);
  const rows = (index?.recommendationEntities || []).map((entity) => {
    const haystack = searchableCard(entity);
    let score = 0;
    const matched = [];
    for (const term of terms) {
      if (!haystack.includes(term)) continue;
      score += term.length >= 4 ? 5 : 2;
      matched.push(term);
    }
    return { entity, score, matched: [...new Set(matched)].slice(0, 12) };
  });
  return rows.filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || left.entity.templateId.localeCompare(right.entity.templateId))
    .slice(0, Math.max(1, Math.min(60, Number(limit) || 24)));
}

function compactRecommendationPayload(rows) {
  return rows.map(({ entity }) => ({
    templateId: entity.templateId,
    kind: entity.kind,
    representativeId: entity.representativeId,
    ...entity.card
  }));
}

function validateTemplateIndex(index, catalog) {
  const expected = buildTemplateIndex(catalog);
  const failures = [];
  if (index?.schemaVersion !== INDEX_SCHEMA) failures.push(`schemaVersion must be ${INDEX_SCHEMA}`);
  if (index?.catalogVersion !== expected.catalogVersion) failures.push("catalogVersion does not match catalog/manifest.json");
  if (stableStringify(index?.counts) !== stableStringify(expected.counts)) failures.push("index counts are stale");
  if (stableStringify(index?.catalogItems) !== stableStringify(expected.catalogItems)) failures.push("catalog item ledger is stale or incomplete");
  if (stableStringify(index?.recommendationEntities) !== stableStringify(expected.recommendationEntities)) failures.push("recommendation entities are stale or incomplete");
  if (index?.indexSha256 !== expected.indexSha256) failures.push("indexSha256 is stale");
  return { status: failures.length ? "fail" : "pass", failures, expected };
}

module.exports = {
  INDEX_SCHEMA,
  buildTemplateIndex,
  compactRecommendationPayload,
  profileTerms,
  shortlistRecommendationEntities,
  stableStringify,
  validateTemplateIndex
};
