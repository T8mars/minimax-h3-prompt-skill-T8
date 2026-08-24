const assert = require("node:assert/strict");
const test = require("node:test");
const { DEFAULT_MODE, normalizeMode, sortItems } = require("../src/catalog-sort.js");

function item(id, catalogAddedAt, updatedAt, title, catalogOrder) {
  return {
    id,
    catalogAddedAt,
    updatedAt,
    catalogOrder,
    title,
    localizations: {
      en: { title },
      "zh-CN": { title: ({ alpha: "阿尔法", beta: "贝塔", gamma: "伽马", missing: "未知" })[id] || title }
    }
  };
}

const items = [
  item("alpha", "2026-08-10T09:00:00+08:00", "2026-08-11T09:00:00+08:00", "Alpha", 0),
  item("beta", "2026-08-12T09:00:00+08:00", "2026-08-10T09:00:00+08:00", "Beta", 1),
  item("gamma", "2026-08-12T09:00:00+08:00", "2026-08-13T09:00:00+08:00", "Gamma", 2),
  item("missing", "", "not-a-date", "Unknown", 3)
];

test("sort mode defaults safely to newest-added", () => {
  assert.equal(DEFAULT_MODE, "newest-added");
  assert.equal(normalizeMode(null), "newest-added");
  assert.equal(normalizeMode("unsupported"), "newest-added");
  assert.equal(normalizeMode("title-desc"), "title-desc");
});

test("date sorting is deterministic and always keeps missing dates last", () => {
  assert.deepEqual(sortItems(items).map((entry) => entry.id), ["beta", "gamma", "alpha", "missing"]);
  assert.deepEqual(sortItems(items, { mode: "oldest-added" }).map((entry) => entry.id), ["alpha", "beta", "gamma", "missing"]);
  assert.deepEqual(sortItems(items, { mode: "recently-updated" }).map((entry) => entry.id), ["gamma", "alpha", "beta", "missing"]);
});

test("title sorting follows the displayed locale and remains stable on ties", () => {
  assert.deepEqual(sortItems(items, { mode: "title-asc", locale: "en" }).map((entry) => entry.id), ["alpha", "beta", "gamma", "missing"]);
  assert.deepEqual(sortItems(items, { mode: "title-desc", locale: "en" }).map((entry) => entry.id), ["missing", "gamma", "beta", "alpha"]);
  const tied = [item("beta", "2026-08-12T09:00:00+08:00", "", "Same", 4), item("alpha", "2026-08-12T09:00:00+08:00", "", "Same", 2)];
  assert.deepEqual(sortItems(tied, { mode: "newest-added" }).map((entry) => entry.id), ["alpha", "beta"]);
});
