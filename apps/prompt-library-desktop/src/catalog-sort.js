(function exposeCatalogSort(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.T8CatalogSort = api;
}(typeof globalThis === "object" ? globalThis : this, () => {
  "use strict";

  const DEFAULT_MODE = "newest-added";
  const SORT_MODES = Object.freeze([
    DEFAULT_MODE,
    "recently-updated",
    "oldest-added",
    "title-asc",
    "title-desc"
  ]);
  const VALID_MODES = new Set(SORT_MODES);

  function normalizeMode(value) {
    return VALID_MODES.has(value) ? value : DEFAULT_MODE;
  }

  function itemKey(item) {
    return `${item?.kind || "case"}:${item?.id || ""}`;
  }

  function timestamp(value) {
    const parsed = Date.parse(String(value || ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function localizedTitle(item, locale = "zh-CN") {
    return String(
      item?.localizations?.[locale]?.title
      || item?.localizations?.en?.title
      || item?.title
      || item?.id
      || ""
    );
  }

  function compareDates(left, right, direction) {
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    if (left === right) return 0;
    return direction === "asc" ? left - right : right - left;
  }

  function stableFallback(left, right) {
    const leftOrder = Number.isFinite(Number(left.item?.catalogOrder)) ? Number(left.item.catalogOrder) : left.index;
    const rightOrder = Number.isFinite(Number(right.item?.catalogOrder)) ? Number(right.item.catalogOrder) : right.index;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    const keyOrder = itemKey(left.item).localeCompare(itemKey(right.item), "en", { numeric: true, sensitivity: "base" });
    return keyOrder || left.index - right.index;
  }

  function sortItems(items, { mode = DEFAULT_MODE, locale = "zh-CN" } = {}) {
    const selectedMode = normalizeMode(mode);
    const collator = new Intl.Collator(locale === "zh-CN" ? "zh-CN" : "en", { numeric: true, sensitivity: "base" });
    return (Array.isArray(items) ? items : [])
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        let result = 0;
        if (selectedMode === "newest-added" || selectedMode === "oldest-added") {
          result = compareDates(
            timestamp(left.item?.catalogAddedAt),
            timestamp(right.item?.catalogAddedAt),
            selectedMode === "oldest-added" ? "asc" : "desc"
          );
        } else if (selectedMode === "recently-updated") {
          result = compareDates(timestamp(left.item?.updatedAt), timestamp(right.item?.updatedAt), "desc");
        } else if (selectedMode === "title-asc" || selectedMode === "title-desc") {
          result = collator.compare(localizedTitle(left.item, locale), localizedTitle(right.item, locale));
          if (selectedMode === "title-desc") result *= -1;
        }
        return result || stableFallback(left, right);
      })
      .map(({ item }) => item);
  }

  return {
    DEFAULT_MODE,
    SORT_MODES,
    normalizeMode,
    itemKey,
    localizedTitle,
    sortItems,
    timestamp
  };
}));
