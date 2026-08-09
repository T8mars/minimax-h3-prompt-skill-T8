const api = window.promptLibrary;

const elements = {
  catalogVersion: document.querySelector("#catalog-version"),
  caseGrid: document.querySelector("#case-grid"),
  warning: document.querySelector("#catalog-warning"),
  empty: document.querySelector("#empty-state"),
  search: document.querySelector("#search"),
  platform: document.querySelector("#platform-filter"),
  model: document.querySelector("#model-filter"),
  tag: document.querySelector("#tag-filter"),
  clear: document.querySelector("#clear-filters"),
  statCases: document.querySelector("#stat-cases"),
  statVideos: document.querySelector("#stat-videos"),
  statPrompts: document.querySelector("#stat-prompts"),
  statResults: document.querySelector("#stat-results"),
  compareBar: document.querySelector("#compare-bar"),
  compareCount: document.querySelector("#compare-count"),
  compareChips: document.querySelector("#compare-chips"),
  openCompare: document.querySelector("#open-compare"),
  dialog: document.querySelector("#case-dialog"),
  detailKicker: document.querySelector("#detail-kicker"),
  detailTitle: document.querySelector("#detail-title"),
  detailSummary: document.querySelector("#detail-summary"),
  detailMeta: document.querySelector("#detail-meta"),
  detailMedia: document.querySelector("#detail-media"),
  openSource: document.querySelector("#open-source"),
  closeDialog: document.querySelector("#close-dialog"),
  creativeDna: document.querySelector("#creative-dna"),
  tabH3: document.querySelector("#tab-h3"),
  tabSeedance: document.querySelector("#tab-seedance"),
  promptText: document.querySelector("#prompt-text"),
  promptMissing: document.querySelector("#prompt-missing"),
  copyPrompt: document.querySelector("#copy-prompt"),
  compareDialog: document.querySelector("#compare-dialog"),
  closeCompare: document.querySelector("#close-compare"),
  compareGrid: document.querySelector("#compare-grid"),
  compareTabH3: document.querySelector("#compare-tab-h3"),
  compareTabSeedance: document.querySelector("#compare-tab-seedance"),
  toast: document.querySelector("#toast"),
  checkUpdate: document.querySelector("#check-update"),
  installUpdate: document.querySelector("#install-update"),
  updateStatus: document.querySelector("#update-status")
};

const state = {
  catalog: { cases: [], warnings: [] },
  activeCase: null,
  promptModel: "minimaxH3",
  comparePromptModel: "minimaxH3",
  compareIds: [],
  toastTimer: null
};

const DNA_LABELS = {
  mechanism: "核心机制",
  invariants: "不可变条件",
  slots: "可替换插槽",
  anti_copy_exclusions: "反复制排除",
  instantiations: "实例化方式",
  failure_modes: "失败模式",
  transfer_tests: "迁移测试",
  style: "视觉风格",
  lighting: "光影",
  camera: "运镜",
  motion: "动态",
  timeline: "时间结构",
  sound: "声音设计"
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2300);
}

function normalize(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase();
}

function formatDuration(seconds) {
  if (!Number.isFinite(Number(seconds))) return "未知时长";
  const value = Number(seconds);
  return `${value.toFixed(value % 1 ? 1 : 0)} 秒`;
}

function platformLabel(platform) {
  const value = String(platform || "unknown");
  const lower = value.toLocaleLowerCase();
  if (lower === "x" || lower.includes("twitter")) return "X";
  if (lower.includes("reddit")) return "Reddit";
  if (lower.includes("youtube")) return "YouTube";
  return value === "unknown" ? "未知平台" : value;
}

function option(value) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = value;
  return node;
}

function populateFilters() {
  const cases = state.catalog.cases;
  const platforms = [...new Set(cases.map((item) => platformLabel(item.platform)))].sort();
  const models = [...new Set(cases.flatMap((item) => item.models))].sort();
  const tags = [...new Set(cases.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  platforms.forEach((value) => elements.platform.append(option(value)));
  models.forEach((value) => elements.model.append(option(value)));
  tags.forEach((value) => elements.tag.append(option(value)));
}

function searchDocument(item) {
  return normalize([
    item.id,
    item.title,
    item.summary,
    item.author,
    item.platform,
    ...item.tags,
    ...item.models,
    JSON.stringify(item.creativeDna)
  ].join(" "));
}

function filteredCases() {
  const query = normalize(elements.search.value.trim());
  const platform = elements.platform.value;
  const model = elements.model.value;
  const tag = elements.tag.value;
  return state.catalog.cases.filter((item) => {
    if (query && !searchDocument(item).includes(query)) return false;
    if (platform && platformLabel(item.platform) !== platform) return false;
    if (model && !item.models.includes(model)) return false;
    if (tag && !item.tags.includes(tag)) return false;
    return true;
  });
}

function renderCard(item) {
  const card = el("article", "case-card");
  card.classList.toggle("comparing", state.compareIds.includes(item.id));
  card.tabIndex = 0;
  card.setAttribute("aria-label", `查看案例：${item.title}`);

  const media = el("div", "card-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${item.title} 预览`;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    media.append(el("div", "card-placeholder", "VP"));
  }

  if (item.media.videoUrl) {
    const video = document.createElement("video");
    video.className = "card-hover-video";
    video.src = item.media.videoUrl;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    media.append(video);
    card.addEventListener("pointerenter", () => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      card.classList.add("previewing");
      void video.play().catch(() => card.classList.remove("previewing"));
    });
    card.addEventListener("pointerleave", () => {
      video.pause();
      video.currentTime = 0;
      card.classList.remove("previewing");
    });
  }

  const mediaBadge = el("span", `media-badge${item.media.hasFullVideo ? " local" : ""}`, item.media.hasFullVideo ? "完整视频 · 有声" : "GIF 预览");
  const compareToggle = el("button", `compare-toggle${state.compareIds.includes(item.id) ? " selected" : ""}`, state.compareIds.includes(item.id) ? "已加入对比 ✓" : "加入对比");
  compareToggle.type = "button";
  compareToggle.setAttribute("aria-pressed", String(state.compareIds.includes(item.id)));
  compareToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleCompare(item.id);
  });
  media.append(mediaBadge, compareToggle);
  card.append(media);

  const body = el("div", "card-body");
  const badges = el("div", "badges");
  badges.append(el("span", "badge primary", "PUBLISHED"));
  item.models.forEach((model) => badges.append(el("span", "badge", model)));
  body.append(badges, el("h2", "card-title", item.title), el("p", "card-summary", item.summary || "查看完整 Creative DNA 与双模型提示词模板。"));

  const tags = el("div", "card-tags");
  item.tags.slice(0, 4).forEach((tag) => tags.append(el("span", "tag", tag)));
  body.append(tags);

  const footer = el("div", "card-footer");
  footer.append(el("span", "", `${platformLabel(item.platform)} · ${item.author}`), el("strong", "", "查看并播放 →"));
  body.append(footer);
  card.append(body);

  const open = () => openCase(item);
  card.addEventListener("click", open);
  card.addEventListener("keydown", (event) => {
    if (event.target !== card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
  return card;
}

function render() {
  const cases = filteredCases();
  elements.caseGrid.replaceChildren(...cases.map(renderCard));
  elements.caseGrid.setAttribute("aria-busy", "false");
  elements.empty.classList.toggle("hidden", cases.length > 0);
  elements.statResults.textContent = String(cases.length);
  renderCompareBar();
}

function toggleCompare(id) {
  const index = state.compareIds.indexOf(id);
  if (index >= 0) state.compareIds.splice(index, 1);
  else if (state.compareIds.length < 3) state.compareIds.push(id);
  else {
    showToast("最多同时对比 3 个案例");
    return;
  }
  render();
}

function renderCompareBar() {
  const selected = state.compareIds
    .map((id) => state.catalog.cases.find((item) => item.id === id))
    .filter(Boolean);
  state.compareIds = selected.map((item) => item.id);
  elements.compareBar.classList.toggle("hidden", selected.length === 0);
  elements.compareCount.textContent = `已选 ${selected.length}/3${selected.length < 2 ? " · 至少选择 2 个" : ""}`;
  elements.openCompare.disabled = selected.length < 2;
  elements.compareChips.replaceChildren(...selected.map((item) => {
    const chip = el("span", "compare-chip");
    chip.append(el("span", "", item.title));
    const remove = el("button", "", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", `移除 ${item.title}`);
    remove.addEventListener("click", () => toggleCompare(item.id));
    chip.append(remove);
    return chip;
  }));
}

function addMeta(label, value) {
  elements.detailMeta.append(el("dt", "", label), el("dd", "", value || "—"));
}

function renderPrimitiveValue(value) {
  if (Array.isArray(value)) {
    const list = el("ul");
    value.forEach((item) => {
      const li = el("li");
      if (item && typeof item === "object") li.append(renderObjectValue(item));
      else li.textContent = String(item);
      list.append(li);
    });
    return list;
  }
  if (value && typeof value === "object") return renderObjectValue(value);
  return el("p", "", value === null || value === undefined ? "—" : String(value));
}

function renderObjectValue(object) {
  const wrapper = el("div", "dna-nested");
  Object.entries(object).forEach(([key, value]) => {
    const pair = el("div", "dna-pair");
    pair.append(el("strong", "", DNA_LABELS[key] || key.replaceAll("_", " ")), renderPrimitiveValue(value));
    wrapper.append(pair);
  });
  return wrapper;
}

function renderCreativeDna(data) {
  const entries = data && typeof data === "object" ? Object.entries(data) : [];
  if (!entries.length) {
    elements.creativeDna.replaceChildren(el("div", "dna-item", "此案例暂未提供 Creative DNA 数据。"));
    return;
  }
  elements.creativeDna.replaceChildren(...entries.map(([key, value]) => {
    const item = el("article", "dna-item");
    item.append(el("h4", "", DNA_LABELS[key] || key.replaceAll("_", " ")), renderPrimitiveValue(value));
    return item;
  }));
}

function renderDetailMedia(item) {
  elements.detailMedia.replaceChildren();
  if (item.media.videoUrl) {
    const video = document.createElement("video");
    video.src = item.media.videoUrl;
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    if (item.media.posterUrl) video.poster = item.media.posterUrl;
    video.setAttribute("aria-label", `${item.title} 完整有声视频`);
    elements.detailMedia.append(video);
    return;
  }

  const fallbackUrl = item.media.gifUrl || item.media.posterUrl;
  if (fallbackUrl) {
    const image = document.createElement("img");
    image.src = fallbackUrl;
    image.alt = `${item.title} GIF 预览`;
    elements.detailMedia.append(image);
  } else {
    elements.detailMedia.append(el("div", "card-placeholder", "VP"));
  }
  elements.detailMedia.append(el("p", "media-fallback", "此环境未包含完整 MP4；当前仅显示静音 GIF/海报。可通过作者原帖观看来源视频。"));
}

function choosePrompt(model) {
  state.promptModel = model;
  elements.tabH3.classList.toggle("active", model === "minimaxH3");
  elements.tabSeedance.classList.toggle("active", model === "seedance20");
  elements.tabH3.setAttribute("aria-selected", String(model === "minimaxH3"));
  elements.tabSeedance.setAttribute("aria-selected", String(model === "seedance20"));
  const prompt = state.activeCase?.prompts?.[model] || "";
  elements.promptText.textContent = prompt;
  elements.promptText.classList.toggle("hidden", !prompt);
  elements.promptMissing.classList.toggle("hidden", Boolean(prompt));
  elements.copyPrompt.disabled = !prompt;
}

function openCase(item) {
  state.activeCase = item;
  elements.detailKicker.textContent = `${platformLabel(item.platform)} · ${item.id}`;
  elements.detailTitle.textContent = item.title;
  elements.detailSummary.textContent = item.summary || "该案例聚焦可迁移的视频生成机制。";
  elements.detailMeta.replaceChildren();
  addMeta("来源作者", item.author);
  addMeta("平台", platformLabel(item.platform));
  addMeta("来源时长", formatDuration(item.sourceDurationSeconds));
  addMeta("模板目标", formatDuration(item.targetDurationSeconds));
  addMeta("适配模型", item.models.join(" / ") || "—");
  addMeta("视频状态", item.media.hasFullVideo ? "本地完整 MP4（含声音）" : "GIF/海报降级预览");
  addMeta("标签", item.tags.join("、") || "—");
  elements.openSource.classList.toggle("hidden", !item.sourceUrl);
  renderDetailMedia(item);
  renderCreativeDna(item.creativeDna);
  choosePrompt(item.prompts.minimaxH3 ? "minimaxH3" : "seedance20");
  elements.dialog.showModal();
}

function cleanupDetailMedia() {
  const video = elements.detailMedia.querySelector("video");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  state.activeCase = null;
}

function closeCase() {
  cleanupDetailMedia();
  if (elements.dialog.open) elements.dialog.close();
}

function summarizeMechanism(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(summarizeMechanism).filter(Boolean).join("；");
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, nested]) => `${DNA_LABELS[key] || key}: ${summarizeMechanism(nested)}`).join("；");
  }
  return "未记录机制摘要";
}

function createCompareColumn(item) {
  const column = el("article", "compare-column");
  const media = el("div", "compare-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${item.title} 预览`;
    media.append(image);
  } else {
    media.append(el("div", "card-placeholder", "VP"));
  }
  const content = el("div", "compare-content");
  content.append(el("h3", "", item.title));
  const facts = el("dl", "compare-facts");
  [
    ["平台 / 作者", `${platformLabel(item.platform)} · ${item.author}`],
    ["来源时长", formatDuration(item.sourceDurationSeconds)],
    ["模板目标", formatDuration(item.targetDurationSeconds)],
    ["标签", item.tags.join("、") || "—"]
  ].forEach(([label, value]) => facts.append(el("dt", "", label), el("dd", "", value)));
  content.append(facts);

  const mechanism = el("section", "compare-mechanism");
  mechanism.append(el("strong", "", "核心机制"), el("p", "", summarizeMechanism(item.creativeDna?.mechanism || item.summary)));
  content.append(mechanism);

  const prompt = item.prompts?.[state.comparePromptModel] || "此案例暂未提供该模型提示词。";
  content.append(el("pre", "compare-prompt", prompt));
  const copy = el("button", "button copy compare-copy", "复制本列提示词");
  copy.type = "button";
  copy.disabled = !item.prompts?.[state.comparePromptModel];
  copy.addEventListener("click", async () => {
    try {
      await api.copyText(item.prompts[state.comparePromptModel]);
      showToast(`已复制：${item.title}`);
    } catch {
      showToast("复制失败，请手动选择文本");
    }
  });
  content.append(copy);
  column.append(media, content);
  return column;
}

function renderComparison() {
  const selected = state.compareIds
    .map((id) => state.catalog.cases.find((item) => item.id === id))
    .filter(Boolean);
  elements.compareGrid.style.setProperty("--compare-columns", String(Math.max(2, selected.length)));
  elements.compareGrid.replaceChildren(...selected.map(createCompareColumn));
  const h3 = state.comparePromptModel === "minimaxH3";
  elements.compareTabH3.classList.toggle("active", h3);
  elements.compareTabSeedance.classList.toggle("active", !h3);
  elements.compareTabH3.setAttribute("aria-selected", String(h3));
  elements.compareTabSeedance.setAttribute("aria-selected", String(!h3));
}

function openComparison() {
  if (state.compareIds.length < 2) {
    showToast("至少选择 2 个案例才能对比");
    return;
  }
  renderComparison();
  elements.compareDialog.showModal();
}

function closeComparison() {
  if (elements.compareDialog.open) elements.compareDialog.close();
}

function applyUpdateStatus(status) {
  if (!status || typeof status !== "object") return;
  elements.updateStatus.textContent = status.message || "更新状态未知";
  const busy = status.state === "checking" || status.state === "downloading" || status.state === "available";
  elements.checkUpdate.disabled = busy;
  elements.installUpdate.classList.toggle("hidden", status.state !== "downloaded");
}

async function initialize() {
  try {
    state.catalog = await api.loadCatalog();
    elements.catalogVersion.textContent = `v${state.catalog.catalogVersion || "1.0.0"}`;
    elements.statCases.textContent = String(state.catalog.cases.length);
    elements.statVideos.textContent = String(state.catalog.cases.filter((item) => item.media.hasFullVideo).length);
    elements.statPrompts.textContent = String(state.catalog.cases.reduce((total, item) => total + Number(Boolean(item.prompts.minimaxH3)) + Number(Boolean(item.prompts.seedance20)), 0));
    if (state.catalog.warnings?.length) {
      elements.warning.textContent = state.catalog.warnings.join("；");
      elements.warning.classList.remove("hidden");
    }
    populateFilters();
    render();
  } catch (error) {
    elements.warning.textContent = `案例目录读取失败：${error.message}`;
    elements.warning.classList.remove("hidden");
    elements.caseGrid.setAttribute("aria-busy", "false");
    elements.empty.classList.remove("hidden");
  }
}

[elements.search, elements.platform, elements.model, elements.tag].forEach((control) => control.addEventListener("input", render));
elements.clear.addEventListener("click", () => {
  elements.search.value = "";
  elements.platform.value = "";
  elements.model.value = "";
  elements.tag.value = "";
  render();
});
elements.closeDialog.addEventListener("click", closeCase);
elements.dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeCase();
});
elements.dialog.addEventListener("close", cleanupDetailMedia);
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) closeCase();
});
elements.openCompare.addEventListener("click", openComparison);
elements.closeCompare.addEventListener("click", closeComparison);
elements.compareDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeComparison();
});
elements.compareDialog.addEventListener("click", (event) => {
  if (event.target === elements.compareDialog) closeComparison();
});
elements.compareTabH3.addEventListener("click", () => {
  state.comparePromptModel = "minimaxH3";
  renderComparison();
});
elements.compareTabSeedance.addEventListener("click", () => {
  state.comparePromptModel = "seedance20";
  renderComparison();
});
elements.openSource.addEventListener("click", async () => {
  if (!state.activeCase?.sourceUrl) return;
  try { await api.openExternal(state.activeCase.sourceUrl); }
  catch { showToast("无法打开该 HTTPS 来源链接"); }
});
elements.tabH3.addEventListener("click", () => choosePrompt("minimaxH3"));
elements.tabSeedance.addEventListener("click", () => choosePrompt("seedance20"));
elements.copyPrompt.addEventListener("click", async () => {
  const prompt = state.activeCase?.prompts?.[state.promptModel] || "";
  if (!prompt) return;
  try {
    await api.copyText(prompt);
    showToast("提示词已复制");
  } catch {
    showToast("复制失败，请手动选择文本");
  }
});
elements.checkUpdate.addEventListener("click", async () => {
  try { applyUpdateStatus(await api.checkForUpdates()); }
  catch (error) { applyUpdateStatus({ state: "error", message: `更新检查失败：${error.message}` }); }
});
elements.installUpdate.addEventListener("click", () => api.installUpdate());
api.onUpdateStatus(applyUpdateStatus);

void initialize();
