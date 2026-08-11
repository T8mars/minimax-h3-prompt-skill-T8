const api = window.promptLibrary;

const elements = {
  viewAll: document.querySelector("#view-all"),
  viewCases: document.querySelector("#view-cases"),
  viewOfficialSkills: document.querySelector("#view-official-skills"),
  viewCommunitySkills: document.querySelector("#view-community-skills"),
  viewAllCount: document.querySelector("#view-all-count"),
  viewCaseCount: document.querySelector("#view-case-count"),
  viewOfficialCount: document.querySelector("#view-official-count"),
  viewCommunityCount: document.querySelector("#view-community-count"),
  pageKicker: document.querySelector("#page-kicker"),
  pageTitle: document.querySelector("#page-title"),
  pageIntro: document.querySelector("#page-intro"),
  catalogVersion: document.querySelector("#catalog-version"),
  caseGrid: document.querySelector("#case-grid"),
  warning: document.querySelector("#catalog-warning"),
  empty: document.querySelector("#empty-state"),
  search: document.querySelector("#search"),
  platform: document.querySelector("#platform-filter"),
  platformLabel: document.querySelector("#platform-filter-label"),
  model: document.querySelector("#model-filter"),
  tag: document.querySelector("#tag-filter"),
  clear: document.querySelector("#clear-filters"),
  statCases: document.querySelector("#stat-cases"),
  statCasesLabel: document.querySelector("#stat-cases-label"),
  statVideos: document.querySelector("#stat-videos"),
  statVideosLabel: document.querySelector("#stat-videos-label"),
  statPrompts: document.querySelector("#stat-prompts"),
  statPromptsLabel: document.querySelector("#stat-prompts-label"),
  statResults: document.querySelector("#stat-results"),
  emptyTitle: document.querySelector("#empty-title"),
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
  detailMechanismKicker: document.querySelector("#detail-mechanism-kicker"),
  detailMechanismTitle: document.querySelector("#detail-mechanism-title"),
  detailPromptKicker: document.querySelector("#detail-prompt-kicker"),
  detailPromptTitle: document.querySelector("#detail-prompt-title"),
  openSource: document.querySelector("#open-source"),
  openPreview: document.querySelector("#open-preview"),
  closeDialog: document.querySelector("#close-dialog"),
  creativeDna: document.querySelector("#creative-dna"),
  tabH3: document.querySelector("#tab-h3"),
  tabSeedance: document.querySelector("#tab-seedance"),
  promptPanel: document.querySelector("#prompt-panel"),
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
  updateStatus: document.querySelector("#update-status"),
  globalLocaleEn: document.querySelector("#global-locale-en"),
  globalLocaleZh: document.querySelector("#global-locale-zh"),
  detailLocaleEn: document.querySelector("#detail-locale-en"),
  detailLocaleZh: document.querySelector("#detail-locale-zh"),
  copyFullItem: document.querySelector("#copy-full-item"),
  copyOverview: document.querySelector("#copy-overview"),
  copySourceLink: document.querySelector("#copy-source-link"),
  copyQuickStart: document.querySelector("#copy-quick-start"),
  copyDna: document.querySelector("#copy-dna"),
  copyValidation: document.querySelector("#copy-validation"),
  quickStart: document.querySelector("#quick-start"),
  validationGrid: document.querySelector("#validation-grid"),
  promptLanguageNote: document.querySelector("#prompt-language-note"),
  dialogShell: document.querySelector("#case-dialog .dialog-shell"),
  detailHeader: document.querySelector("#case-dialog .dialog-header"),
  detailNav: document.querySelector("#detail-nav"),
  statResultsLabel: document.querySelector("#stat-results-label"),
  modelFilterLabel: document.querySelector("#model-filter-label"),
  tagFilterLabel: document.querySelector("#tag-filter-label"),
  emptyCopy: document.querySelector("#empty-copy"),
  compareBarTitle: document.querySelector("#compare-bar-title"),
  compareModelLabel: document.querySelector("#compare-model-label")
};

const state = {
  catalog: { cases: [], officialSkills: [], communitySkills: [], warnings: [] },
  activeView: "all",
  activeCase: null,
  promptModel: "minimaxH3",
  comparePromptModel: "minimaxH3",
  compareIds: [],
  locale: localStorage.getItem("t8-display-locale") === "zh-CN" ? "zh-CN" : "en",
  updateStatus: { state: "idle" },
  toastTimer: null
};

const UI = {
  en: {
    all: "All", cases: "Creative Cases", official: "MiniMax Official Skills", community: "Community Skills",
    platform: "Platform", source: "Source", model: "Model", tag: "Tag", clear: "Clear", results: "Current results",
    allPlatforms: "All platforms", allSources: "All sources", allModels: "All models", allTags: "All tags",
    unknownDuration: "Unknown duration", seconds: "seconds", unknownPlatform: "Unknown platform",
    completeVideo: "Complete video · audio", gifPreview: "GIF preview", addCompare: "Add to compare", compared: "Added ✓",
    published: "PUBLISHED", openPlay: "View and play →", openModels: "View H3 / Seedance →",
    copy: "Copy", copied: "Copied", copyFailed: "Copy failed; select the text manually",
    copyOverview: "Copy overview", copySource: "Copy source link", copySection: "Copy section", copyDna: "Copy Creative DNA", copyFull: "Copy full item", copyPrompt: "Copy current prompt",
    overview: "Overview", quickStart: "Quick start", creativeDna: "Creative DNA", prompts: "Prompts", validation: "Validation",
    inputFormat: "Recommended input format", recommendedInput: "Example input", requiredAnchors: "Required anchors", usageSteps: "How to use", applicableScope: "Best for", notSuitableFor: "Not suitable for",
    sourceAuthor: "Source author", sourceDuration: "Source duration", targetDuration: "Template target", models: "Models", videoStatus: "Video", tags: "Tags", templateId: "Template ID", comfyui: "ComfyUI",
    releaseQuality: "Release quality", promptChecks: "Prompt validation", localization: "Localization", promptLanguage: "Prompt language", canonicalPrompt: "Canonical executable prompt", localizedAccessMetadata: "Localized access metadata",
    passed: "Passed", approved: "Approved", notImported: "Not imported; the official capability is already built into the node", packaged: "Packaged", notPackaged: "Installable Skill; not bundled into the node",
    languageLocked: "The executable prompt keeps its validated native language and is not translated by the display switch.",
    noPrompt: "No template is available for this model.", maxCompare: "You can compare up to 3 cases.", needCompare: "Select at least 2 cases to compare.",
    sourceLink: "Open source ↗", officialPreview: "Open official preview ↗", localFull: "Complete local MP4 with audio", fallbackMedia: "GIF/poster fallback only",
    mechanism: "Core mechanism", invariants: "Invariants", slots: "Variable slots", anti_copy_exclusions: "Anti-copy exclusions", instantiations: "Instantiations", failure_modes: "Failure modes", transfer_tests: "Transfer tests",
    complexity: "Complexity", rule: "Rule", purpose: "Purpose", ablation_failure: "Ablation failure", evidence_ids: "Evidence IDs", name: "Name", constraint: "Constraint", concept: "Concept", prompt_seed: "Prompt seed", failure: "Failure", repair: "Repair", result: "Result", preserved_invariant_ids: "Preserved invariant IDs", changed_slots: "Changed slots",
    usage_scope: "Usage scope", source_boundary: "Source boundary", comfyui_boundary: "ComfyUI boundary", applicable_scope: "Applicable scope", not_suitable_for: "Not suitable for", usage_steps: "Usage steps", quality_repairs: "Quality repairs",
    noDna: "No Creative DNA data is available for this item.", noMechanism: "No mechanism summary has been recorded.", updateNotChecked: "Updates not checked", checkUpdate: "Check for updates", installUpdate: "Restart to install"
  },
  "zh-CN": {
    all: "全部", cases: "创意案例", official: "MiniMax 官方仓库 Skills", community: "非官方 Skills",
    platform: "平台", source: "来源", model: "模型", tag: "标签", clear: "清空", results: "当前结果",
    allPlatforms: "全部平台", allSources: "全部来源", allModels: "全部模型", allTags: "全部标签",
    unknownDuration: "未知时长", seconds: "秒", unknownPlatform: "未知平台",
    completeVideo: "完整视频 · 有声", gifPreview: "GIF 预览", addCompare: "加入对比", compared: "已加入对比 ✓",
    published: "已发布", openPlay: "查看并播放 →", openModels: "查看 H3 / Seedance →",
    copy: "复制", copied: "已复制", copyFailed: "复制失败，请手动选择文本",
    copyOverview: "复制概览", copySource: "复制来源链接", copySection: "复制本节", copyDna: "复制 Creative DNA", copyFull: "复制完整案例", copyPrompt: "复制当前提示词",
    overview: "概览", quickStart: "快速开始", creativeDna: "Creative DNA", prompts: "提示词", validation: "验证与交接",
    inputFormat: "推荐输入格式", recommendedInput: "推荐写法", requiredAnchors: "必需锚点", usageSteps: "使用方法", applicableScope: "适用范围", notSuitableFor: "不适用范围",
    sourceAuthor: "来源作者", sourceDuration: "来源时长", targetDuration: "模板目标", models: "适配模型", videoStatus: "视频状态", tags: "标签", templateId: "模板 ID", comfyui: "ComfyUI",
    releaseQuality: "发布质量", promptChecks: "提示词验证", localization: "双语内容", promptLanguage: "提示词语言", canonicalPrompt: "规范可执行提示词原文", localizedAccessMetadata: "本地化安装入口元数据",
    passed: "通过", approved: "已审核", notImported: "不导入；节点已内置官方能力", packaged: "已打包", notPackaged: "Skill 可独立安装；未打包进节点",
    languageLocked: "可执行提示词保持已验证的原生语言，界面切换不会翻译或改写提示词。",
    noPrompt: "此案例暂未提供该模型的模板。", maxCompare: "最多同时对比 3 个案例。", needCompare: "至少选择 2 个案例才能对比。",
    sourceLink: "查看来源 ↗", officialPreview: "打开官方示例 ↗", localFull: "本地完整 MP4（含声音）", fallbackMedia: "仅 GIF/海报降级预览",
    mechanism: "核心机制", invariants: "不可变条件", slots: "可替换插槽", anti_copy_exclusions: "反复制排除", instantiations: "实例化方式", failure_modes: "失败模式", transfer_tests: "迁移测试",
    complexity: "复杂度", rule: "规则", purpose: "作用", ablation_failure: "删减后果", evidence_ids: "证据 ID", name: "名称", constraint: "约束", concept: "概念", prompt_seed: "提示词种子", failure: "失败表现", repair: "修复方法", result: "结果", preserved_invariant_ids: "保留的不可变条件", changed_slots: "已替换插槽",
    usage_scope: "使用范围", source_boundary: "来源边界", comfyui_boundary: "ComfyUI 边界", applicable_scope: "适用范围", not_suitable_for: "不适用范围", usage_steps: "使用方法", quality_repairs: "质量修复",
    noDna: "此条目暂未提供 Creative DNA 数据。", noMechanism: "暂未记录机制摘要。", updateNotChecked: "尚未检查更新", checkUpdate: "检查更新", installUpdate: "重启安装"
  }
};

function t(key) { return UI[state.locale]?.[key] || UI.en[key] || key; }
function promptLanguageLabel(value) {
  if (state.locale !== "zh-CN") return value || "Original";
  return ({ English: "英文", Chinese: "中文", "Installation metadata": "安装入口元数据", Original: "原始语言" })[value] || value || "原始语言";
}
function localized(item, locale = state.locale) {
  return item?.localizations?.[locale] || item?.localizations?.en || {
    title: item?.title || item?.id || "",
    summary: item?.summary || "",
    quick_start: { input_format: item?.inputFormat || "", recommended_input: item?.recommendedInput || "", required_anchors: item?.requiredAnchors || [], usage_steps: [], applicable_scope: [], not_suitable_for: [] },
    creative_dna: item?.creativeDna || {}
  };
}

function dnaLabel(key) { return t(key) || String(key).replaceAll("_", " "); }

function sourceBadge(item) {
  if (state.locale === "zh-CN") return item.sourceLabel;
  if (item.kind === "communitySkill") return "COMMUNITY · USER-CONTRIBUTED";
  if (item.sourceClassification === "repository-owned" || item.sourceClassification === "official") return "MINIMAX OFFICIAL";
  if (item.sourceClassification === "official-featured") return "MINIMAX FEATURED";
  return "MINIMAX REPOSITORY · COMMUNITY";
}

function updateGlobalChrome() {
  const zh = state.locale === "zh-CN";
  const labels = [t("all"), t("cases"), t("official"), t("community")];
  [elements.viewAll, elements.viewCases, elements.viewOfficialSkills, elements.viewCommunitySkills].forEach((button, index) => {
    button.querySelector(".view-label").textContent = labels[index];
  });
  elements.checkUpdate.textContent = t("checkUpdate");
  elements.installUpdate.textContent = t("installUpdate");
  document.querySelector("#compare-title").textContent = zh ? "案例机制与提示词对比" : "Compare mechanisms and prompts";
  elements.compareModelLabel.textContent = zh ? "提示词模型" : "Prompt model";
  document.querySelector(".topbar .locale-toggle").setAttribute("aria-label", zh ? "显示语言" : "Display language");
  document.querySelector(".view-tabs").setAttribute("aria-label", zh ? "内容类型" : "Content type");
  document.querySelector(".stats").setAttribute("aria-label", zh ? "资料库统计" : "Library statistics");
  document.querySelector(".filters").setAttribute("aria-label", zh ? "筛选内容" : "Filter content");
  elements.compareBar.setAttribute("aria-label", zh ? "案例对比" : "Case comparison");
  elements.closeCompare.setAttribute("aria-label", zh ? "关闭对比" : "Close comparison");
  document.querySelector("#compare-dialog .prompt-tabs").setAttribute("aria-label", zh ? "对比提示词模型" : "Comparison prompt model");
  renderUpdateStatus();
  updateDetailChrome();
}

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
  if (!Number.isFinite(Number(seconds))) return t("unknownDuration");
  const value = Number(seconds);
  return `${value.toFixed(value % 1 ? 1 : 0)} ${t("seconds")}`;
}

function platformLabel(platform) {
  const value = String(platform || "unknown");
  const lower = value.toLocaleLowerCase();
  if (lower === "x" || lower.includes("twitter")) return "X";
  if (lower.includes("reddit")) return "Reddit";
  if (lower.includes("youtube")) return "YouTube";
  return value === "unknown" ? t("unknownPlatform") : value;
}

function option(value, label = value) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  return node;
}

function resetSelect(select, label) {
  const first = option("");
  first.textContent = label;
  select.replaceChildren(first);
}

function activeItems() {
  if (state.activeView === "officialSkills") return state.catalog.officialSkills;
  if (state.activeView === "communitySkills") return state.catalog.communitySkills;
  if (state.activeView === "cases") return state.catalog.cases;
  return [
    ...state.catalog.cases,
    ...state.catalog.communitySkills,
    ...state.catalog.officialSkills
  ];
}

function sourceFilterKey(item) {
  return item.kind?.endsWith("Skill") ? `source:${item.sourceClassification || item.kind}` : `platform:${item.platform || "unknown"}`;
}

function sourceFilterLabel(item) {
  return item.kind?.endsWith("Skill") ? sourceBadge(item) : platformLabel(item.platform);
}

function populateFilters() {
  const items = activeItems();
  resetSelect(elements.platform, state.activeView === "cases" ? t("allPlatforms") : t("allSources"));
  resetSelect(elements.model, t("allModels"));
  resetSelect(elements.tag, t("allTags"));
  const platforms = new Map(items.map((item) => [sourceFilterKey(item), sourceFilterLabel(item)]));
  const models = [...new Set(items.flatMap((item) => item.models))].sort();
  const tags = [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  [...platforms.entries()].sort((a, b) => a[1].localeCompare(b[1], state.locale)).forEach(([value, label]) => elements.platform.append(option(value, label)));
  models.forEach((value) => elements.model.append(option(value)));
  tags.forEach((value) => elements.tag.append(option(value)));
}

function searchDocument(item) {
  const en = localized(item, "en");
  const zh = localized(item, "zh-CN");
  return normalize([
    item.id,
    item.title,
    item.englishTitle,
    item.summary,
    item.author,
    item.platform,
    item.sourceLabel,
    item.sourceClassification,
    item.sourceAttribution,
    item.companionSkill,
    ...item.tags,
    ...item.models,
    JSON.stringify(item.creativeDna),
    JSON.stringify(en),
    JSON.stringify(zh)
  ].join(" "));
}

function filteredItems() {
  const query = normalize(elements.search.value.trim());
  const platform = elements.platform.value;
  const model = elements.model.value;
  const tag = elements.tag.value;
  return activeItems().filter((item) => {
    if (query && !searchDocument(item).includes(query)) return false;
    const itemSource = sourceFilterKey(item);
    if (platform && itemSource !== platform) return false;
    if (model && !item.models.includes(model)) return false;
    if (tag && !item.tags.includes(tag)) return false;
    return true;
  });
}

function renderCard(item) {
  const display = localized(item);
  const card = el("article", "case-card");
  card.classList.toggle("comparing", state.compareIds.includes(item.id));
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${t("openPlay")} ${display.title}`);

  const media = el("div", "card-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${display.title} ${t("gifPreview")}`;
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

  const mediaBadge = el("span", `media-badge${item.media.hasFullVideo ? " local" : ""}`, item.media.hasFullVideo ? t("completeVideo") : t("gifPreview"));
  const compareToggle = el("button", `compare-toggle${state.compareIds.includes(item.id) ? " selected" : ""}`, state.compareIds.includes(item.id) ? t("compared") : t("addCompare"));
  compareToggle.type = "button";
  compareToggle.setAttribute("aria-pressed", String(state.compareIds.includes(item.id)));
  compareToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleCompare(item.id);
  });
  media.append(mediaBadge);
  if (state.activeView === "cases") media.append(compareToggle);
  card.append(media);

  const body = el("div", "card-body");
  const badges = el("div", "badges");
  badges.append(el("span", "badge primary", t("published")));
  item.models.forEach((model) => badges.append(el("span", "badge", model)));
  body.append(badges, el("h2", "card-title", display.title), el("p", "card-summary", display.summary));

  const tags = el("div", "card-tags");
  item.tags.slice(0, 4).forEach((tag) => tags.append(el("span", "tag", tag)));
  body.append(tags);

  const footer = el("div", "card-footer");
  footer.append(el("span", "", `${platformLabel(item.platform)} · ${item.author}`), el("strong", "", t("openPlay")));
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

function renderOfficialSkillCard(item) {
  const display = localized(item);
  const previewLabel = state.locale === "zh-CN" ? (item.previewLabel || t("gifPreview")) : t("gifPreview");
  const card = el("article", "case-card official-skill");
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${t("openModels")} ${display.title}`);

  const media = el("div", "card-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${display.title} ${previewLabel}`;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    const art = el("div", "official-skill-art");
    art.append(el("strong", "", "H3 ↔ S2"), el("span", "", "UPSTREAM + T8 COMPANION"));
    media.append(art);
  }
  media.append(el("span", "media-badge local", previewLabel));
  card.append(media);

  const body = el("div", "card-body");
  const badges = el("div", "badges");
  const sourceClass = item.sourceClassification === "community" ? "community" : "official";
  badges.append(el("span", `badge primary ${sourceClass}`, sourceBadge(item)));
  item.models.forEach((model) => badges.append(el("span", "badge", model)));
  body.append(
    badges,
    el("h2", "card-title", display.title),
    el("p", "card-summary", display.summary)
  );
  const tags = el("div", "card-tags");
  item.tags.slice(0, 4).forEach((tag) => tags.append(el("span", "tag", tag)));
  body.append(tags);
  const footer = el("div", "card-footer");
  footer.append(
    el("span", "", state.locale === "zh-CN" ? (item.upstreamVersion ? `上游 v${item.upstreamVersion} · 不导入 ComfyUI` : "上游固定版本 · 不导入 ComfyUI") : (item.upstreamVersion ? `Upstream v${item.upstreamVersion} · not imported into ComfyUI` : "Pinned upstream · not imported into ComfyUI")),
    el("strong", "", t("openModels"))
  );
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

function renderCommunitySkillCard(item) {
  const display = localized(item);
  const card = el("article", "case-card community-skill");
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${t("openPlay")} ${display.title}`);

  const media = el("div", "card-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${display.title} ${t("gifPreview")}`;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    media.append(el("div", "card-placeholder", "US"));
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
  media.append(el("span", `media-badge${item.media.hasFullVideo ? " local" : ""}`, item.media.hasFullVideo ? t("completeVideo") : t("gifPreview")));
  card.append(media);

  const body = el("div", "card-body");
  const badges = el("div", "badges");
  badges.append(el("span", "badge primary community", sourceBadge(item)));
  item.models.forEach((model) => badges.append(el("span", "badge", model)));
  body.append(badges, el("h2", "card-title", display.title), el("p", "card-summary", display.summary));
  const tags = el("div", "card-tags");
  item.tags.slice(0, 4).forEach((tag) => tags.append(el("span", "tag", tag)));
  body.append(tags);
  const footer = el("div", "card-footer");
  footer.append(el("span", "", state.locale === "en" ? "User sample analysis · Installable Skill" : "用户样片拆解 · 可安装 Skill"), el("strong", "", t("openPlay")));
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

function updateViewChrome(resultCount) {
  const all = state.activeView === "all";
  const official = state.activeView === "officialSkills";
  const community = state.activeView === "communitySkills";
  const cases = state.activeView === "cases";
  elements.viewAll.classList.toggle("active", all);
  elements.viewCases.classList.toggle("active", cases);
  elements.viewOfficialSkills.classList.toggle("active", official);
  elements.viewCommunitySkills.classList.toggle("active", community);
  elements.viewAll.setAttribute("aria-pressed", String(all));
  elements.viewCases.setAttribute("aria-pressed", String(cases));
  elements.viewOfficialSkills.setAttribute("aria-pressed", String(official));
  elements.viewCommunitySkills.setAttribute("aria-pressed", String(community));
  const zh = state.locale === "zh-CN";
  elements.pageKicker.textContent = all ? "ALL CONTENT · OFFLINE PREVIEWS" : official ? "MINIMAX OFFICIAL REPOSITORY · PINNED INDEX" : community ? "NON-OFFICIAL · USER-CONTRIBUTED" : "LOCAL · READ-ONLY CASES";
  elements.pageTitle.textContent = all ? (zh ? "全部提示词案例与 Skills" : "All prompt cases and Skills") : official ? (zh ? "MiniMax 官方仓库 Skills" : "MiniMax Official Repository Skills") : community ? (zh ? "非官方高质量提示词 Skills" : "High-quality Community Skills") : (zh ? "高质量视频提示词案例" : "High-quality video prompt cases");
  elements.pageIntro.textContent = all
    ? (zh ? `共 ${activeItems().length} 项：${state.catalog.cases.length} 个视频案例、${state.catalog.officialSkills.length} 个 MiniMax 官方仓库 Skills、${state.catalog.communitySkills.length} 个非官方 Skill；全部可离线预览。` : `${activeItems().length} items: ${state.catalog.cases.length} video cases, ${state.catalog.officialSkills.length} MiniMax official-repository Skills, and ${state.catalog.communitySkills.length} community Skills, all with offline previews.`)
    : official
    ? (zh ? "固定索引 MiniMax 官方仓库收录的 9 个 H3 Skills，并提供独立编写的 Seedance 2.0 伴侣 Skill；上游正文不复制，官方项不导入 ComfyUI。" : "A pinned index of nine H3 Skills in the MiniMax repository, each paired with an independently authored Seedance 2.0 companion. Upstream bodies are not copied or imported into ComfyUI.")
    : community
      ? (zh ? "从用户提供的视频与提示词组中提炼可复用机制，并提供完整样片、H3 与 Seedance 2.0 模板。" : "Reusable mechanisms extracted from user-supplied videos and prompts, with complete samples plus H3 and Seedance 2.0 templates.")
      : (zh ? "从完整视频中提炼可迁移的 Creative DNA，同时提供 MiniMax H3 与 Seedance 2.0 模板。" : "Reusable Creative DNA extracted from complete videos, with MiniMax H3 and Seedance 2.0 templates.");
  elements.search.placeholder = zh ? "搜索机制、风格、运镜、标签、作者或案例 ID" : "Search mechanism, style, camera, tags, author or ID";
  elements.platformLabel.textContent = cases ? t("platform") : t("source");
  elements.modelFilterLabel.textContent = t("model");
  elements.tagFilterLabel.textContent = t("tag");
  elements.clear.textContent = t("clear");
  elements.emptyTitle.textContent = zh ? (all ? "没有匹配的内容" : cases ? "没有匹配的案例" : "没有匹配的 Skill") : (all ? "No matching content" : cases ? "No matching cases" : "No matching Skills");
  elements.emptyCopy.textContent = zh ? "调整搜索词或清空筛选条件后再试。" : "Adjust the search or clear the filters.";
  elements.statCasesLabel.textContent = all ? (zh ? "全部内容" : "All content") : official ? (zh ? "官方仓库收录" : "Official entries") : community ? (zh ? "非官方 Skills" : "Community Skills") : (zh ? "公开案例" : "Published cases");
  elements.statVideosLabel.textContent = all ? (zh ? "可预览内容" : "Previewable items") : official ? (zh ? "本地示例 GIF" : "Local demo GIFs") : community ? (zh ? "完整样片" : "Complete samples") : (zh ? "本地完整视频" : "Complete local videos");
  elements.statPromptsLabel.textContent = official ? (zh ? "Seedance 适配" : "Seedance companions") : (zh ? "模型模板" : "Model templates");
  elements.statResultsLabel.textContent = t("results");
  elements.compareBarTitle.textContent = zh ? "案例对比" : "Case comparison";
  elements.openCompare.textContent = zh ? "开始对比" : "Compare";
  if (all) {
    const items = activeItems();
    elements.statCases.textContent = String(items.length);
    elements.statVideos.textContent = String(items.filter((item) => item.media?.gifUrl || item.media?.posterUrl || item.media?.videoUrl).length);
    elements.statPrompts.textContent = String(items.reduce((total, item) => total + Number(Boolean(item.prompts.minimaxH3)) + Number(Boolean(item.prompts.seedance20)), 0));
  } else if (official) {
    elements.statCases.textContent = String(state.catalog.officialSkills.length);
    elements.statVideos.textContent = String(state.catalog.officialSkills.filter((item) => item.media.gifUrl).length);
    elements.statPrompts.textContent = String(state.catalog.officialSkills.filter((item) => item.prompts.seedance20).length);
  } else if (community) {
    elements.statCases.textContent = String(state.catalog.communitySkills.length);
    elements.statVideos.textContent = String(state.catalog.communitySkills.filter((item) => item.media.hasFullVideo).length);
    elements.statPrompts.textContent = String(state.catalog.communitySkills.reduce((total, item) => total + Number(Boolean(item.prompts.minimaxH3)) + Number(Boolean(item.prompts.seedance20)), 0));
  } else {
    elements.statCases.textContent = String(state.catalog.cases.length);
    elements.statVideos.textContent = String(state.catalog.cases.filter((item) => item.media.hasFullVideo).length);
    elements.statPrompts.textContent = String(state.catalog.cases.reduce((total, item) => total + Number(Boolean(item.prompts.minimaxH3)) + Number(Boolean(item.prompts.seedance20)), 0));
  }
  elements.statResults.textContent = String(resultCount);
  elements.compareBar.classList.toggle("hidden", !cases || state.compareIds.length === 0);
}

function render() {
  const items = filteredItems();
  const renderer = (item) => item.kind === "officialSkill" ? renderOfficialSkillCard(item) : item.kind === "communitySkill" ? renderCommunitySkillCard(item) : renderCard(item);
  elements.caseGrid.replaceChildren(...items.map(renderer));
  elements.caseGrid.setAttribute("aria-busy", "false");
  elements.empty.classList.toggle("hidden", items.length > 0);
  updateViewChrome(items.length);
  if (state.activeView === "cases") renderCompareBar();
}

function switchView(view) {
  state.activeView = view;
  state.compareIds = [];
  elements.search.value = "";
  populateFilters();
  render();
}

function toggleCompare(id) {
  const index = state.compareIds.indexOf(id);
  if (index >= 0) state.compareIds.splice(index, 1);
  else if (state.compareIds.length < 3) state.compareIds.push(id);
  else {
    showToast(t("maxCompare"));
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
  elements.compareCount.textContent = state.locale === "zh-CN" ? `已选 ${selected.length}/3${selected.length < 2 ? " · 至少选择 2 个" : ""}` : `Selected ${selected.length}/3${selected.length < 2 ? " · choose at least 2" : ""}`;
  elements.openCompare.disabled = selected.length < 2;
  elements.compareChips.replaceChildren(...selected.map((item) => {
    const chip = el("span", "compare-chip");
    chip.append(el("span", "", localized(item).title));
    const remove = el("button", "", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", `${state.locale === "zh-CN" ? "移除" : "Remove"} ${localized(item).title}`);
    remove.addEventListener("click", () => toggleCompare(item.id));
    chip.append(remove);
    return chip;
  }));
}

function addMeta(label, value) {
  elements.detailMeta.append(el("dt", "", label), el("dd", "", value || "—"));
}

function valueToText(value, level = 0) {
  if (Array.isArray(value)) return value.map((item) => `${"  ".repeat(level)}- ${item && typeof item === "object" ? `\n${valueToText(item, level + 1)}` : String(item)}`).join("\n");
  if (value && typeof value === "object") return Object.entries(value).map(([key, nested]) => `${"  ".repeat(level)}${dnaLabel(key)}: ${nested && typeof nested === "object" ? `\n${valueToText(nested, level + 1)}` : String(nested)}`).join("\n");
  return String(value ?? "—");
}

function sectionMarkdown(title, value) {
  return `## ${title}\n\n${valueToText(value)}\n`;
}

async function copyContent(text, label = "") {
  try {
    await api.copyText(String(text));
    showToast(label ? `${t("copied")}: ${label}` : t("copied"));
  } catch {
    showToast(t("copyFailed"));
  }
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
    pair.append(el("strong", "", dnaLabel(key)), renderPrimitiveValue(value));
    wrapper.append(pair);
  });
  return wrapper;
}

function renderCreativeDna(data) {
  const entries = data && typeof data === "object" ? Object.entries(data) : [];
  if (!entries.length) {
    elements.creativeDna.replaceChildren(el("div", "dna-item", t("noDna")));
    return;
  }
  elements.creativeDna.replaceChildren(...entries.map(([key, value]) => {
    const item = el("article", "dna-item");
    const header = el("div", "dna-item-header");
    header.append(el("h4", "", dnaLabel(key)));
    const copy = el("button", "button copy-secondary", t("copy"));
    copy.type = "button";
    copy.setAttribute("aria-label", `${t("copy")} ${dnaLabel(key)}`);
    copy.addEventListener("click", () => copyContent(sectionMarkdown(dnaLabel(key), value), dnaLabel(key)));
    header.append(copy);
    item.append(header, renderPrimitiveValue(value));
    return item;
  }));
}

function renderQuickStart(quick = {}) {
  const fields = [
    ["input_format", t("inputFormat")],
    ["recommended_input", t("recommendedInput")],
    ["required_anchors", t("requiredAnchors")],
    ["usage_steps", t("usageSteps")],
    ["applicable_scope", t("applicableScope")],
    ["not_suitable_for", t("notSuitableFor")]
  ];
  elements.quickStart.replaceChildren(...fields.map(([key, label]) => {
    const card = el("article", "quick-card");
    card.append(el("h4", "", label), renderPrimitiveValue(quick[key]));
    return card;
  }));
}

function validationData(item) {
  const release = item.kind === "officialSkill" ? (state.locale === "zh-CN" ? "上游固定版本 · 元数据边界通过" : "Pinned upstream version · metadata boundary passed") : item.quality?.release_passed === false ? "—" : t("passed");
  const checks = item.kind === "officialSkill" ? (state.locale === "zh-CN" ? "H3 上游入口 + Seedance 伴侣模板" : "H3 upstream entry + Seedance companion") : `MiniMax H3: ${item.quality?.prompt_validation?.minimax_h3 === false ? "—" : t("passed")} · Seedance 2.0: ${item.quality?.prompt_validation?.seedance_2_0 === false ? "—" : t("passed")}`;
  const comfy = item.kind === "officialSkill" ? t("notImported") : item.comfyuiImport ? t("packaged") : t("notPackaged");
  const localeReviews = item.localizationReviews || {};
  const localization = localeReviews.en?.status === "approved" && localeReviews["zh-CN"]?.status === "approved"
    ? (state.locale === "zh-CN" ? "EN / 中文：源哈希绑定，逐资源编辑审校有记录" : "EN / 中文: source hashes bound; per-resource editorial review recorded")
    : (state.locale === "zh-CN" ? "双语内容尚未完成逐资源审校" : "Bilingual editorial review is incomplete");
  return {
    [t("releaseQuality")]: item.quality?.weighted_score ? `${release} · ${Number(item.quality.weighted_score).toFixed(3)}/5` : release,
    [t("promptChecks")]: checks,
    [t("localization")]: localization,
    [t("templateId")]: item.templateId || item.skillRef || item.companionSkill || item.id,
    [t("comfyui")]: comfy,
    [t("promptLanguage")]: t("languageLocked")
  };
}

function renderValidation(item) {
  const data = validationData(item);
  elements.validationGrid.replaceChildren(...Object.entries(data).map(([label, value]) => {
    const card = el("article", "validation-card");
    card.append(el("h4", "", label), el("p", "", value));
    return card;
  }));
}

function renderDetailMedia(item) {
  const display = localized(item);
  elements.detailMedia.replaceChildren();
  if (item.kind === "officialSkill") {
    if (item.media.gifUrl) {
      const image = document.createElement("img");
      image.src = item.media.gifUrl;
      image.alt = `${display.title} ${t("gifPreview")}`;
      elements.detailMedia.append(image);
    } else {
      const art = el("div", "official-skill-art");
      art.append(el("strong", "", "H3 ↔ S2"), el("span", "", "PINNED UPSTREAM + ORIGINAL COMPANION"));
      elements.detailMedia.append(art);
    }
    return;
  }
  if (item.media.videoUrl) {
    const video = document.createElement("video");
    video.src = item.media.videoUrl;
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    if (item.media.posterUrl) video.poster = item.media.posterUrl;
    video.setAttribute("aria-label", `${display.title} ${t("completeVideo")}`);
    elements.detailMedia.append(video);
    return;
  }

  const fallbackUrl = item.media.gifUrl || item.media.posterUrl;
  if (fallbackUrl) {
    const image = document.createElement("img");
    image.src = fallbackUrl;
    image.alt = `${display.title} ${t("gifPreview")}`;
    elements.detailMedia.append(image);
  } else {
    elements.detailMedia.append(el("div", "card-placeholder", "VP"));
  }
  elements.detailMedia.append(el("p", "media-fallback", state.locale === "zh-CN" ? "此环境未包含完整 MP4；当前仅显示静音 GIF/海报。可通过来源链接观看原视频。" : "This environment does not include the complete MP4. A silent GIF/poster is shown; use the source link for the original video."));
}

function activePrompt(item, model, locale = state.locale) {
  return item?.localizedPromptHelp?.[model]?.[locale] || item?.prompts?.[model] || "";
}

function choosePrompt(model) {
  state.promptModel = model;
  const h3 = model === "minimaxH3";
  elements.tabH3.classList.toggle("active", h3);
  elements.tabSeedance.classList.toggle("active", !h3);
  elements.tabH3.setAttribute("aria-selected", String(h3));
  elements.tabSeedance.setAttribute("aria-selected", String(!h3));
  elements.tabH3.tabIndex = h3 ? 0 : -1;
  elements.tabSeedance.tabIndex = h3 ? -1 : 0;
  elements.promptPanel.setAttribute("aria-labelledby", h3 ? "tab-h3" : "tab-seedance");
  const prompt = activePrompt(state.activeCase, model);
  elements.promptText.textContent = prompt;
  elements.promptText.classList.toggle("hidden", !prompt);
  elements.promptMissing.classList.toggle("hidden", Boolean(prompt));
  elements.copyPrompt.disabled = !prompt;
  const language = promptLanguageLabel(state.activeCase?.promptLanguages?.[model]);
  elements.promptLanguageNote.textContent = `${t("promptLanguage")}: ${language}. ${t("languageLocked")}`;
  elements.copyPrompt.textContent = t("copyPrompt");
  elements.promptMissing.textContent = t("noPrompt");
}

function updateDetailChrome() {
  const zh = state.locale === "zh-CN";
  const labels = [t("overview"), t("quickStart"), t("creativeDna"), t("prompts"), t("validation")];
  [...elements.detailNav.querySelectorAll("button")].forEach((button, index) => { button.textContent = labels[index]; });
  elements.copyFullItem.textContent = t("copyFull");
  elements.copyOverview.textContent = t("copyOverview");
  elements.copySourceLink.textContent = t("copySource");
  elements.copyQuickStart.textContent = t("copySection");
  elements.copyDna.textContent = t("copyDna");
  elements.copyValidation.textContent = t("copySection");
  document.querySelector(".detail-locale-toggle").setAttribute("aria-label", zh ? "详情语言" : "Detail language");
  elements.closeDialog.setAttribute("aria-label", zh ? "关闭详情" : "Close details");
  elements.detailNav.setAttribute("aria-label", zh ? "详情章节" : "Detail sections");
  elements.detailMedia.setAttribute("aria-label", zh ? "案例媒体" : "Case media");
  document.querySelector("#detail-prompts .prompt-tabs").setAttribute("aria-label", zh ? "模型提示词" : "Model prompt");
  document.documentElement.lang = state.locale;
  for (const [button, active] of [[elements.globalLocaleEn, state.locale === "en"], [elements.globalLocaleZh, state.locale === "zh-CN"], [elements.detailLocaleEn, state.locale === "en"], [elements.detailLocaleZh, state.locale === "zh-CN"]]) {
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function updateDetailStickyOffset() {
  const height = Math.ceil(elements.detailHeader.getBoundingClientRect().height);
  if (height > 0) elements.dialogShell.style.setProperty("--detail-header-height", `${height}px`);
}

function renderActiveCase({ preserveMedia = false } = {}) {
  const item = state.activeCase;
  if (!item) return;
  const display = localized(item);
  const zh = state.locale === "zh-CN";
  updateDetailChrome();
  elements.detailTitle.textContent = display.title;
  elements.detailSummary.textContent = display.summary;
  elements.detailMeta.replaceChildren();
  elements.openSource.classList.toggle("hidden", !item.sourceUrl);
  elements.copySourceLink.classList.toggle("hidden", !item.sourceUrl);
  elements.openPreview.classList.toggle("hidden", !item.upstreamPreviewUrl);
  elements.openSource.textContent = t("sourceLink");
  elements.openPreview.textContent = t("officialPreview");
  elements.detailMechanismTitle.textContent = t("creativeDna");
  elements.detailPromptTitle.textContent = t("prompts");
  document.querySelector("#detail-quick-title").textContent = t("quickStart");
  document.querySelector("#detail-validation-title").textContent = t("validation");

  if (item.kind === "officialSkill") {
    elements.detailKicker.textContent = `${zh ? "MiniMax 官方仓库" : "MiniMax official repository"} · ${item.id}`;
    addMeta(zh ? "英文名称" : "English name", item.englishTitle);
    addMeta(zh ? "上游版本" : "Upstream version", item.upstreamVersion ? `v${item.upstreamVersion}` : (zh ? "仓库固定版本" : "Pinned repository version"));
    addMeta(zh ? "固定 Commit" : "Pinned commit", item.pinnedCommit.slice(0, 12));
    addMeta(zh ? "Seedance 伴侣" : "Seedance companion", item.companionSkill);
    addMeta(t("models"), item.models.join(" / "));
    addMeta(t("comfyui"), t("notImported"));
    addMeta(t("tags"), item.tags.join(" · ") || "—");
    elements.detailMechanismKicker.textContent = "USAGE · SCOPE · BOUNDARY";
    elements.detailPromptKicker.textContent = "UPSTREAM H3 · T8 SEEDANCE COMPANION";
  } else if (item.kind === "communitySkill") {
    elements.detailKicker.textContent = `${zh ? "非官方 · 用户贡献" : "COMMUNITY · USER-CONTRIBUTED"} · ${item.id}`;
    addMeta(zh ? "英文名称" : "English name", item.englishTitle);
    addMeta(t("source"), zh ? item.sourceAttribution : "User-supplied AIGC sample and prompt; no external post or creator attribution was provided.");
    addMeta(t("sourceDuration"), formatDuration(item.sourceDurationSeconds));
    addMeta(zh ? "目标范围" : "Target range", `${item.targetDurationRangeSeconds[0]}–${item.targetDurationRangeSeconds[1]} ${t("seconds")}`);
    addMeta(t("models"), item.models.join(" / "));
    addMeta(t("videoStatus"), item.media.hasFullVideo ? t("localFull") : t("fallbackMedia"));
    addMeta(t("comfyui"), item.comfyuiImport ? t("packaged") : t("notPackaged"));
    addMeta(t("tags"), item.tags.join(" · ") || "—");
    elements.detailMechanismKicker.textContent = "REUSABLE MECHANISM · QUALITY REPAIRS";
    elements.detailPromptKicker.textContent = "COMMUNITY · DUAL-MODEL TEMPLATES";
  } else {
    elements.detailKicker.textContent = `${platformLabel(item.platform)} · ${item.id}`;
    addMeta(t("sourceAuthor"), item.author);
    addMeta(t("platform"), platformLabel(item.platform));
    addMeta(t("sourceDuration"), formatDuration(item.sourceDurationSeconds));
    addMeta(t("targetDuration"), formatDuration(item.targetDurationSeconds));
    addMeta(t("models"), item.models.join(" / ") || "—");
    addMeta(t("videoStatus"), item.media.hasFullVideo ? t("localFull") : t("fallbackMedia"));
    addMeta(t("templateId"), item.templateId || "—");
    addMeta(t("tags"), item.tags.join(" · ") || "—");
    elements.detailMechanismKicker.textContent = "REUSABLE MECHANISM";
    elements.detailPromptKicker.textContent = "MODEL-READY PROMPTS";
  }
  renderQuickStart(display.quick_start);
  renderCreativeDna(display.creative_dna);
  renderValidation(item);
  if (!preserveMedia) renderDetailMedia(item);
  choosePrompt(state.promptModel && item.prompts?.[state.promptModel] ? state.promptModel : (item.prompts.minimaxH3 ? "minimaxH3" : "seedance20"));
  requestAnimationFrame(updateDetailStickyOffset);
}

function openCase(item) {
  state.activeCase = item;
  state.promptModel = item.prompts.minimaxH3 ? "minimaxH3" : "seedance20";
  renderActiveCase();
  elements.dialog.showModal();
  elements.dialogShell.scrollTop = 0;
}

function overviewMarkdown(item) {
  const display = localized(item);
  const facts = [];
  if (item.author) facts.push(`- ${t("sourceAuthor")}: ${item.author}`);
  if (item.platform) facts.push(`- ${t("platform")}: ${platformLabel(item.platform)}`);
  if (item.sourceDurationSeconds) facts.push(`- ${t("sourceDuration")}: ${formatDuration(item.sourceDurationSeconds)}`);
  if (item.models?.length) facts.push(`- ${t("models")}: ${item.models.join(" / ")}`);
  facts.push(`- ${t("templateId")}: ${item.templateId || item.skillRef || item.companionSkill || item.id}`);
  if (item.sourceUrl) facts.push(`- ${t("source")}: ${item.sourceUrl}`);
  return `# ${display.title}\n\n${display.summary}\n\n${facts.join("\n")}\n`;
}

function quickStartMarkdown(item) {
  const quick = localized(item).quick_start || {};
  return [
    `## ${t("quickStart")}`,
    sectionMarkdown(t("inputFormat"), quick.input_format),
    sectionMarkdown(t("recommendedInput"), quick.recommended_input),
    sectionMarkdown(t("requiredAnchors"), quick.required_anchors),
    sectionMarkdown(t("usageSteps"), quick.usage_steps),
    sectionMarkdown(t("applicableScope"), quick.applicable_scope),
    sectionMarkdown(t("notSuitableFor"), quick.not_suitable_for)
  ].join("\n");
}

function dnaMarkdown(item) {
  const dna = localized(item).creative_dna || {};
  return [`## ${t("creativeDna")}`, ...Object.entries(dna).map(([key, value]) => sectionMarkdown(dnaLabel(key), value))].join("\n");
}

function validationMarkdown(item) {
  return [`## ${t("validation")}`, ...Object.entries(validationData(item)).map(([key, value]) => `- ${key}: ${value}`), ""].join("\n");
}

function fullItemMarkdown(item) {
  const parts = [overviewMarkdown(item), quickStartMarkdown(item), dnaMarkdown(item), validationMarkdown(item)];
  for (const [model, label] of [["minimaxH3", "MiniMax H3"], ["seedance20", "Seedance 2.0"]]) {
    const prompt = activePrompt(item, model);
    if (!prompt) continue;
    const language = promptLanguageLabel(item.promptLanguages?.[model]);
    const guarantee = item.localizedPromptHelp?.[model] ? t("localizedAccessMetadata") : t("canonicalPrompt");
    parts.push(`## ${label} (${language}; ${guarantee})\n\n\`\`\`text\n${prompt}\n\`\`\`\n`);
  }
  return parts.join("\n");
}

function setLocale(locale) {
  if (!UI[locale] || locale === state.locale) return;
  const scrollTop = elements.dialog.open ? elements.dialogShell.scrollTop : 0;
  const filters = { platform: elements.platform.value, model: elements.model.value, tag: elements.tag.value };
  state.locale = locale;
  localStorage.setItem("t8-display-locale", locale);
  updateGlobalChrome();
  populateFilters();
  elements.platform.value = filters.platform;
  elements.model.value = filters.model;
  elements.tag.value = filters.tag;
  render();
  if (state.activeCase && elements.dialog.open) {
    renderActiveCase({ preserveMedia: true });
    elements.dialogShell.scrollTop = scrollTop;
  }
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
    return Object.entries(value).map(([key, nested]) => `${dnaLabel(key)}: ${summarizeMechanism(nested)}`).join("; ");
  }
  return t("noMechanism");
}

function createCompareColumn(item) {
  const display = localized(item);
  const column = el("article", "compare-column");
  const media = el("div", "compare-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${display.title} ${t("gifPreview")}`;
    media.append(image);
  } else {
    media.append(el("div", "card-placeholder", "VP"));
  }
  const content = el("div", "compare-content");
  content.append(el("h3", "", display.title));
  const facts = el("dl", "compare-facts");
  [
    [`${t("platform")} / ${t("sourceAuthor")}`, `${platformLabel(item.platform)} · ${item.author}`],
    [t("sourceDuration"), formatDuration(item.sourceDurationSeconds)],
    [t("targetDuration"), formatDuration(item.targetDurationSeconds)],
    [t("tags"), item.tags.join(" · ") || "—"]
  ].forEach(([label, value]) => facts.append(el("dt", "", label), el("dd", "", value)));
  content.append(facts);

  const mechanism = el("section", "compare-mechanism");
  mechanism.append(el("strong", "", t("mechanism")), el("p", "", summarizeMechanism(display.creative_dna?.mechanism || display.summary)));
  content.append(mechanism);

  const prompt = activePrompt(item, state.comparePromptModel) || t("noPrompt");
  content.append(el("pre", "compare-prompt", prompt));
  const copy = el("button", "button copy compare-copy", state.locale === "zh-CN" ? "复制本列提示词" : "Copy this prompt");
  copy.type = "button";
  copy.disabled = !item.prompts?.[state.comparePromptModel];
  copy.addEventListener("click", async () => {
    try {
      await api.copyText(item.prompts[state.comparePromptModel]);
      showToast(`${t("copied")}: ${display.title}`);
    } catch {
      showToast(t("copyFailed"));
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
  elements.compareTabH3.tabIndex = h3 ? 0 : -1;
  elements.compareTabSeedance.tabIndex = h3 ? -1 : 0;
  elements.compareGrid.setAttribute("aria-labelledby", h3 ? "compare-tab-h3" : "compare-tab-seedance");
}

function handleTablistKeys(event, tabs, select) {
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  let next = current;
  if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
  else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = tabs.length - 1;
  else return;
  event.preventDefault();
  select(next);
  tabs[next].focus();
}

function openComparison() {
  if (state.compareIds.length < 2) {
    showToast(t("needCompare"));
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
  state.updateStatus = { ...state.updateStatus, ...status };
  renderUpdateStatus();
}

function updateStatusText(status) {
  const zh = state.locale === "zh-CN";
  const version = status.version ? `v${status.version}` : "";
  const percent = Number.isFinite(status.percent) ? `${Math.round(status.percent)}%` : "";
  const known = {
    idle: zh ? "尚未检查更新" : "Updates not checked",
    checking: zh ? "正在检查更新…" : "Checking for updates…",
    current: zh ? "当前已是最新版本" : "You are up to date",
    available: zh ? `发现 ${version || "新版本"}，准备下载…` : `${version || "An update"} is available; preparing download…`,
    downloading: zh ? `正在下载更新${percent ? ` ${percent}` : ""}` : `Downloading update${percent ? ` ${percent}` : ""}`,
    downloaded: zh ? `${version || "更新"} 已下载，可重启安装` : `${version || "The update"} is ready; restart to install`,
    error: zh ? `更新失败${status.error ? `：${status.error}` : ""}` : `Update failed${status.error ? `: ${status.error}` : ""}`
  };
  return known[status.state] || (zh ? "更新状态未知" : "Update status unknown");
}

function renderUpdateStatus() {
  const status = state.updateStatus || { state: "idle" };
  elements.updateStatus.textContent = updateStatusText(status);
  elements.updateStatus.dataset.dynamic = "true";
  const busy = status.state === "checking" || status.state === "downloading" || status.state === "available";
  elements.checkUpdate.disabled = busy;
  elements.installUpdate.classList.toggle("hidden", status.state !== "downloaded");
}

async function initialize() {
  try {
    updateGlobalChrome();
    state.catalog = await api.loadCatalog();
    elements.catalogVersion.textContent = `v${state.catalog.catalogVersion || "1.0.0"}`;
    elements.viewAllCount.textContent = String(state.catalog.cases.length + state.catalog.officialSkills.length + state.catalog.communitySkills.length);
    elements.viewCaseCount.textContent = String(state.catalog.cases.length);
    elements.viewOfficialCount.textContent = String(state.catalog.officialSkills.length);
    elements.viewCommunityCount.textContent = String(state.catalog.communitySkills.length);
    if (state.catalog.warnings?.length) {
      elements.warning.textContent = state.catalog.warnings.join("；");
      elements.warning.classList.remove("hidden");
    }
    populateFilters();
    render();
  } catch (error) {
    elements.warning.textContent = `${state.locale === "zh-CN" ? "案例目录读取失败" : "Catalog failed to load"}: ${error.message}`;
    elements.warning.classList.remove("hidden");
    elements.caseGrid.setAttribute("aria-busy", "false");
    elements.empty.classList.remove("hidden");
  }
}

elements.viewAll.addEventListener("click", () => switchView("all"));
elements.viewCases.addEventListener("click", () => switchView("cases"));
elements.viewOfficialSkills.addEventListener("click", () => switchView("officialSkills"));
elements.viewCommunitySkills.addEventListener("click", () => switchView("communitySkills"));
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
[elements.compareTabH3, elements.compareTabSeedance].forEach((tab) => tab.addEventListener("keydown", (event) => {
  handleTablistKeys(event, [elements.compareTabH3, elements.compareTabSeedance], (index) => {
    state.comparePromptModel = index === 0 ? "minimaxH3" : "seedance20";
    renderComparison();
  });
}));
elements.openSource.addEventListener("click", async () => {
  if (!state.activeCase?.sourceUrl) return;
  try { await api.openExternal(state.activeCase.sourceUrl); }
  catch { showToast(state.locale === "zh-CN" ? "无法打开该 HTTPS 来源链接" : "Could not open the HTTPS source link"); }
});
elements.openPreview.addEventListener("click", async () => {
  if (!state.activeCase?.upstreamPreviewUrl) return;
  try { await api.openExternal(state.activeCase.upstreamPreviewUrl); }
  catch { showToast(state.locale === "zh-CN" ? "无法打开官方示例链接" : "Could not open the official preview link"); }
});
elements.tabH3.addEventListener("click", () => choosePrompt("minimaxH3"));
elements.tabSeedance.addEventListener("click", () => choosePrompt("seedance20"));
[elements.tabH3, elements.tabSeedance].forEach((tab) => tab.addEventListener("keydown", (event) => {
  handleTablistKeys(event, [elements.tabH3, elements.tabSeedance], (index) => choosePrompt(index === 0 ? "minimaxH3" : "seedance20"));
}));
elements.globalLocaleEn.addEventListener("click", () => setLocale("en"));
elements.globalLocaleZh.addEventListener("click", () => setLocale("zh-CN"));
elements.detailLocaleEn.addEventListener("click", () => setLocale("en"));
elements.detailLocaleZh.addEventListener("click", () => setLocale("zh-CN"));
elements.detailNav.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-scroll-target]");
  if (!button) return;
  document.querySelector(`#${button.dataset.scrollTarget}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
});
elements.copyOverview.addEventListener("click", () => state.activeCase && copyContent(overviewMarkdown(state.activeCase), t("overview")));
elements.copySourceLink.addEventListener("click", () => state.activeCase?.sourceUrl && copyContent(state.activeCase.sourceUrl, t("source")));
elements.copyQuickStart.addEventListener("click", () => state.activeCase && copyContent(quickStartMarkdown(state.activeCase), t("quickStart")));
elements.copyDna.addEventListener("click", () => state.activeCase && copyContent(dnaMarkdown(state.activeCase), t("creativeDna")));
elements.copyValidation.addEventListener("click", () => state.activeCase && copyContent(validationMarkdown(state.activeCase), t("validation")));
elements.copyFullItem.addEventListener("click", () => state.activeCase && copyContent(fullItemMarkdown(state.activeCase), localized(state.activeCase).title));
elements.copyPrompt.addEventListener("click", async () => {
  const prompt = activePrompt(state.activeCase, state.promptModel);
  if (!prompt) return;
  try {
    await api.copyText(prompt);
    showToast(`${t("copied")}: ${state.promptModel === "minimaxH3" ? "MiniMax H3" : "Seedance 2.0"}`);
  } catch {
    showToast(t("copyFailed"));
  }
});
elements.checkUpdate.addEventListener("click", async () => {
  try { applyUpdateStatus(await api.checkForUpdates()); }
  catch (error) { applyUpdateStatus({ state: "error", error: error.message }); }
});
elements.installUpdate.addEventListener("click", () => api.installUpdate());
api.onUpdateStatus(applyUpdateStatus);

if (typeof ResizeObserver === "function") {
  new ResizeObserver(updateDetailStickyOffset).observe(elements.detailHeader);
} else {
  window.addEventListener("resize", updateDetailStickyOffset);
}

void initialize();
