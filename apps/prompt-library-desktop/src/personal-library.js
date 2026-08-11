(function exposePersonalLibrary(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.T8PersonalLibrary = api;
}(typeof globalThis === "object" ? globalThis : this, () => {
  "use strict";

  const STORAGE_KEY = "t8-personal-library-v1";
  const SCHEMA_VERSION = 1;
  const MAX_HISTORY = 100;
  const MAX_COLLECTIONS = 50;
  const MAX_COLLECTION_NAME = 48;

  function emptyLibrary() {
    return { schemaVersion: SCHEMA_VERSION, favorites: [], collections: [], history: [] };
  }

  function uniqueStrings(values, allowedKeys) {
    const allowed = allowedKeys ? new Set(allowedKeys) : null;
    return [...new Set((Array.isArray(values) ? values : [])
      .filter((value) => typeof value === "string" && value.length <= 300)
      .filter((value) => !allowed || allowed.has(value)))];
  }

  function cleanName(value) {
    return String(value || "").replace(/\s+/gu, " ").trim().slice(0, MAX_COLLECTION_NAME);
  }

  function sanitizeLibrary(value, allowedKeys = []) {
    const source = value && typeof value === "object" ? value : {};
    const seenCollectionIds = new Set();
    const collections = (Array.isArray(source.collections) ? source.collections : [])
      .slice(0, MAX_COLLECTIONS)
      .map((collection) => {
        const id = typeof collection?.id === "string" && /^[a-z0-9-]{6,80}$/u.test(collection.id) ? collection.id : "";
        const name = cleanName(collection?.name);
        if (!id || !name || seenCollectionIds.has(id)) return null;
        seenCollectionIds.add(id);
        return {
          id,
          name,
          itemKeys: uniqueStrings(collection.itemKeys, allowedKeys),
          createdAt: typeof collection.createdAt === "string" ? collection.createdAt : "",
          updatedAt: typeof collection.updatedAt === "string" ? collection.updatedAt : ""
        };
      })
      .filter(Boolean);

    const seenHistory = new Set();
    const allowed = new Set(allowedKeys);
    const history = (Array.isArray(source.history) ? source.history : [])
      .filter((entry) => entry && typeof entry.itemKey === "string" && allowed.has(entry.itemKey))
      .filter((entry) => {
        if (seenHistory.has(entry.itemKey)) return false;
        seenHistory.add(entry.itemKey);
        return true;
      })
      .slice(0, MAX_HISTORY)
      .map((entry) => ({ itemKey: entry.itemKey, viewedAt: typeof entry.viewedAt === "string" ? entry.viewedAt : "" }));

    return {
      schemaVersion: SCHEMA_VERSION,
      favorites: uniqueStrings(source.favorites, allowedKeys),
      collections,
      history
    };
  }

  function loadLibrary(storage, allowedKeys) {
    try {
      const raw = storage?.getItem?.(STORAGE_KEY);
      return { data: sanitizeLibrary(raw ? JSON.parse(raw) : emptyLibrary(), allowedKeys), recovered: false };
    } catch {
      return { data: emptyLibrary(), recovered: true };
    }
  }

  function saveLibrary(storage, data) {
    storage?.setItem?.(STORAGE_KEY, JSON.stringify(data));
  }

  function toggleFavorite(data, itemKey) {
    const exists = data.favorites.includes(itemKey);
    data.favorites = exists ? data.favorites.filter((key) => key !== itemKey) : [itemKey, ...data.favorites];
    return !exists;
  }

  function recordHistory(data, itemKey, viewedAt = new Date().toISOString()) {
    data.history = [{ itemKey, viewedAt }, ...data.history.filter((entry) => entry.itemKey !== itemKey)].slice(0, MAX_HISTORY);
  }

  function createCollection(data, { id, name, now = new Date().toISOString() }) {
    const normalizedName = cleanName(name);
    if (!normalizedName || !/^[a-z0-9-]{6,80}$/u.test(id) || data.collections.some((entry) => entry.id === id) || data.collections.length >= MAX_COLLECTIONS) return null;
    const collection = { id, name: normalizedName, itemKeys: [], createdAt: now, updatedAt: now };
    data.collections.push(collection);
    return collection;
  }

  function renameCollection(data, id, name, now = new Date().toISOString()) {
    const collection = data.collections.find((entry) => entry.id === id);
    const normalizedName = cleanName(name);
    if (!collection || !normalizedName) return false;
    collection.name = normalizedName;
    collection.updatedAt = now;
    return true;
  }

  function deleteCollection(data, id) {
    const before = data.collections.length;
    data.collections = data.collections.filter((entry) => entry.id !== id);
    return data.collections.length !== before;
  }

  function setCollectionMembership(data, id, itemKey, included, now = new Date().toISOString()) {
    const collection = data.collections.find((entry) => entry.id === id);
    if (!collection) return false;
    collection.itemKeys = included
      ? uniqueStrings([...collection.itemKeys, itemKey])
      : collection.itemKeys.filter((key) => key !== itemKey);
    collection.updatedAt = now;
    return true;
  }

  return {
    STORAGE_KEY,
    MAX_HISTORY,
    emptyLibrary,
    sanitizeLibrary,
    loadLibrary,
    saveLibrary,
    toggleFavorite,
    recordHistory,
    createCollection,
    renameCollection,
    deleteCollection,
    setCollectionMembership
  };
}));
