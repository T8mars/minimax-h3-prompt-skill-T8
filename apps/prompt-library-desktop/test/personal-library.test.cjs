const assert = require("node:assert/strict");
const test = require("node:test");
const library = require("../src/personal-library.js");

const keys = ["case:a", "officialSkill:b", "communitySkill:c"];

test("personal library sanitizes unknown items, duplicates and malformed collections", () => {
  const data = library.sanitizeLibrary({
    favorites: [keys[0], keys[0], "case:missing"],
    collections: [
      { id: "collection-valid", name: "  My   set  ", itemKeys: [keys[1], "case:missing", keys[1]] },
      { id: "bad", name: "ignored", itemKeys: [] }
    ],
    history: [
      { itemKey: keys[2], viewedAt: "2026-08-12T00:00:00.000Z" },
      { itemKey: keys[2], viewedAt: "older" },
      { itemKey: "case:missing", viewedAt: "unknown" }
    ]
  }, keys);
  assert.deepEqual(data.favorites, [keys[0]]);
  assert.deepEqual(data.collections.map(({ id, name, itemKeys }) => ({ id, name, itemKeys })), [{ id: "collection-valid", name: "My set", itemKeys: [keys[1]] }]);
  assert.deepEqual(data.history, [{ itemKey: keys[2], viewedAt: "2026-08-12T00:00:00.000Z" }]);
});

test("favorites and history are deduplicated and history is most-recent-first", () => {
  const data = library.emptyLibrary();
  assert.equal(library.toggleFavorite(data, keys[0]), true);
  assert.equal(library.toggleFavorite(data, keys[0]), false);
  library.recordHistory(data, keys[0], "first");
  library.recordHistory(data, keys[1], "second");
  library.recordHistory(data, keys[0], "third");
  assert.deepEqual(data.history, [{ itemKey: keys[0], viewedAt: "third" }, { itemKey: keys[1], viewedAt: "second" }]);
});

test("collections support create, rename, membership and delete without changing catalog items", () => {
  const data = library.emptyLibrary();
  const created = library.createCollection(data, { id: "collection-demo", name: " Demo ", now: "one" });
  assert.equal(created.name, "Demo");
  assert.equal(library.setCollectionMembership(data, created.id, keys[0], true, "two"), true);
  assert.equal(library.setCollectionMembership(data, created.id, keys[0], true, "three"), true);
  assert.deepEqual(created.itemKeys, [keys[0]]);
  assert.equal(library.renameCollection(data, created.id, "Renamed", "four"), true);
  assert.equal(created.name, "Renamed");
  assert.equal(library.setCollectionMembership(data, created.id, keys[0], false, "five"), true);
  assert.deepEqual(created.itemKeys, []);
  assert.equal(library.deleteCollection(data, created.id), true);
  assert.deepEqual(data.collections, []);
});

test("corrupt local storage recovers to a safe empty library", () => {
  const storage = { getItem: () => "{not-json" };
  const result = library.loadLibrary(storage, keys);
  assert.equal(result.recovered, true);
  assert.deepEqual(result.data, library.emptyLibrary());
});
