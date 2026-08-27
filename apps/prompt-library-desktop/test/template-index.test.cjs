const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { loadCatalog } = require("../lib/catalog.cjs");
const {
  buildTemplateIndex,
  shortlistRecommendationEntities,
  validateTemplateIndex
} = require("../lib/template-index.cjs");

const repoRoot = path.resolve(__dirname, "../../..");

function catalog() {
  return loadCatalog({
    catalogRoot: path.join(repoRoot, "catalog"),
    skillsRoot: path.join(repoRoot, "skills"),
    mediaRoot: null
  });
}

test("unified template index records every catalog row and every canonical recommendation entity", () => {
  const source = catalog();
  const index = buildTemplateIndex(source);
  assert.equal(index.counts.catalogItems, source.cases.length + source.communitySkills.length + source.officialSkills.length);
  assert.equal(index.catalogItems.length, index.counts.catalogItems);
  assert.equal(new Set(index.catalogItems.map((item) => `${item.kind}:${item.id}`)).size, index.catalogItems.length);
  assert.equal(index.counts.caseRows, source.cases.length);
  assert.equal(index.counts.caseVariantRows, source.cases.length - index.counts.canonicalCaseTemplates);
  assert.equal(index.counts.recommendationEntities, index.counts.canonicalCaseTemplates + source.communitySkills.length);
  assert.equal(index.recommendationEntities.length, index.counts.recommendationEntities);
  assert.equal(validateTemplateIndex(index, source).status, "pass");
});

test("any newly admitted case makes an old index fail until the ledger is regenerated", () => {
  const source = catalog();
  const index = buildTemplateIndex(source);
  const changed = {
    ...source,
    cases: [...source.cases, { ...source.cases[0], id: "new-intake-must-be-indexed", templateId: "t8-case-new-intake-must-be-indexed-v1" }]
  };
  const validation = validateTemplateIndex(index, changed);
  assert.equal(validation.status, "fail");
  assert.ok(validation.failures.includes("catalog item ledger is stale or incomplete"));
  assert.ok(validation.failures.includes("recommendation entities are stale or incomplete"));
});

test("AI-expanded dance intent recalls performance mechanisms instead of duration-only templates", () => {
  const index = buildTemplateIndex(catalog());
  const rows = shortlistRecommendationEntities(index, {
    subject: ["成年女人", "adult woman"],
    actions: ["跳舞", "舞蹈", "dance", "dancer", "choreography", "performer"],
    goals: ["表演", "performance"]
  }, "一个女人在跳舞", 24);
  const ids = rows.map((row) => row.entity.templateId);
  assert.ok(ids.some((id) => /performance|performer|motion-contact/iu.test(id)), "dance recall must include a real performance mechanism");
  assert.equal(ids.includes("t8-case-ensemble-dyad-position-realignment-v1"), false, "relationship rearrangement must not win on duration alone");
  assert.equal(ids.includes("t8-case-background-recording-anomaly-v1"), false, "background anomaly must not win on duration alone");
});
