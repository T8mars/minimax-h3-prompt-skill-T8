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
  catalog: { cases: [], officialSkills: [], communitySkills: [], warnings: [] },
  activeView: "all",
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
  sound: "声音设计",
  applicable_scope: "适用范围",
  not_suitable_for: "不适用范围",
  usage_steps: "使用方法",
  quality_repairs: "质量修复",
  source_boundary: "来源边界",
  comfyui_boundary: "ComfyUI 边界"
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

function populateFilters() {
  const items = activeItems();
  resetSelect(elements.platform, state.activeView === "cases" ? "全部平台" : "全部来源");
  resetSelect(elements.model, "全部模型");
  resetSelect(elements.tag, "全部标签");
  const platforms = [...new Set(items.map((item) => item.kind?.endsWith("Skill") ? item.sourceLabel : platformLabel(item.platform)))].sort();
  const models = [...new Set(items.flatMap((item) => item.models))].sort();
  const tags = [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  platforms.forEach((value) => elements.platform.append(option(value)));
  models.forEach((value) => elements.model.append(option(value)));
  tags.forEach((value) => elements.tag.append(option(value)));
}

function searchDocument(item) {
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
    JSON.stringify(item.creativeDna)
  ].join(" "));
}

function filteredItems() {
  const query = normalize(elements.search.value.trim());
  const platform = elements.platform.value;
  const model = elements.model.value;
  const tag = elements.tag.value;
  return activeItems().filter((item) => {
    if (query && !searchDocument(item).includes(query)) return false;
    const itemSource = item.kind?.endsWith("Skill") ? item.sourceLabel : platformLabel(item.platform);
    if (platform && itemSource !== platform) return false;
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
  media.append(mediaBadge);
  if (state.activeView === "cases") media.append(compareToggle);
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

function renderOfficialSkillCard(item) {
  const card = el("article", "case-card official-skill");
  card.tabIndex = 0;
  card.setAttribute("aria-label", `查看官方仓库 Skill：${item.title}`);

  const media = el("div", "card-media");
  const imageUrl = item.media.gifUrl || item.media.posterUrl;
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = `${item.title} ${item.previewLabel || "官方示例 GIF"}`;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    const art = el("div", "official-skill-art");
    art.append(el("strong", "", "H3 ↔ S2"), el("span", "", "UPSTREAM + T8 COMPANION"));
    media.append(art);
  }
  media.append(el("span", "media-badge local", item.previewLabel || "官方示例 GIF"));
  card.append(media);

  const body = el("div", "card-body");
  const badges = el("div", "badges");
  const sourceClass = item.sourceClassification === "community" ? "community" : "official";
  badges.append(el("span", `badge primary ${sourceClass}`, item.sourceLabel));
  item.models.forEach((model) => badges.append(el("span", "badge", model)));
  body.append(
    badges,
    el("h2", "card-title", item.title),
    el("p", "card-summary", item.summary)
  );
  const tags = el("div", "card-tags");
  item.tags.slice(0, 4).forEach((tag) => tags.append(el("span", "tag", tag)));
  body.append(tags);
  const footer = el("div", "card-footer");
  footer.append(
    el("span", "", item.upstreamVersion ? `上游 v${item.upstreamVersion} · 不导入 ComfyUI` : "上游固定版本 · 不导入 ComfyUI"),
    el("strong", "", "查看 H3 / Seedance →")
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
  const card = el("article", "case-card community-skill");
  card.tabIndex = 0;
  card.setAttribute("aria-label", `查看非官方 Skill：${item.title}`);

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
  media.append(el("span", `media-badge${item.media.hasFullVideo ? " local" : ""}`, item.media.hasFullVideo ? "完整样片 · 有声" : "GIF 预览"));
  card.append(media);

  const body = el("div", "card-body");
  const badges = el("div", "badges");
  badges.append(el("span", "badge primary community", item.sourceLabel));
  item.models.forEach((model) => badges.append(el("span", "badge", model)));
  body.append(badges, el("h2", "card-title", item.title), el("p", "card-summary", item.summary));
  const tags = el("div", "card-tags");
  item.tags.slice(0, 4).forEach((tag) => tags.append(el("span", "tag", tag)));
  body.append(tags);
  const footer = el("div", "card-footer");
  footer.append(el("span", "", "用户样片拆解 · 可安装 Skill"), el("strong", "", "查看并播放 →"));
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
  elements.pageKicker.textContent = all ? "ALL CONTENT · OFFLINE PREVIEWS" : official ? "MINIMAX OFFICIAL REPOSITORY · PINNED INDEX" : community ? "NON-OFFICIAL · USER-CONTRIBUTED" : "LOCAL · READ-ONLY CASES";
  elements.pageTitle.textContent = all ? "全部提示词案例与 Skills" : official ? "MiniMax 官方仓库 Skills" : community ? "非官方高质量提示词 Skills" : "高质量视频提示词案例";
  elements.pageIntro.textContent = all
    ? `共 ${activeItems().length} 项：${state.catalog.cases.length} 个视频案例、${state.catalog.officialSkills.length} 个 MiniMax 官方仓库 Skills、${state.catalog.communitySkills.length} 个非官方 Skill；全部可离线预览。`
    : official
    ? "固定索引 MiniMax 官方仓库收录的 9 个 H3 Skills，并提供独立编写的 Seedance 2.0 伴侣 Skill；上游正文不复制，官方项不导入 ComfyUI。"
    : community
      ? "从用户提供的视频与提示词组中提炼可复用机制，修复时长与模型语法问题，并提供完整样片、H3 与 Seedance 2.0 模板。"
      : "从完整视频中提炼可迁移的 Creative DNA，同时提供 MiniMax H3 与 Seedance 2.0 模板。";
  elements.search.placeholder = all ? "搜索全部案例、Skills、机制、风格、标签或来源" : official ? "搜索用途、风格、标签、官方 Skill 或 Seedance 伴侣" : community ? "搜索非官方 Skill、机制、运镜、风格或标签" : "搜索机制、风格、运镜、标签、作者或案例 ID";
  elements.platformLabel.textContent = cases ? "平台" : "来源";
  elements.emptyTitle.textContent = all ? "没有匹配的内容" : cases ? "没有匹配的案例" : "没有匹配的 Skill";
  elements.statCasesLabel.textContent = all ? "全部内容" : official ? "官方仓库收录" : community ? "非官方 Skills" : "公开案例";
  elements.statVideosLabel.textContent = all ? "可预览内容" : official ? "本地示例 GIF" : community ? "完整样片" : "本地完整视频";
  elements.statPromptsLabel.textContent = official ? "Seedance 适配" : "模型模板";
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
  if (item.kind === "officialSkill") {
    if (item.media.gifUrl) {
      const image = document.createElement("img");
      image.src = item.media.gifUrl;
      image.alt = `${item.title} ${item.previewLabel || "官方示例 GIF"}`;
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
  if (item.kind === "officialSkill") {
    elements.detailKicker.textContent = `${item.sourceLabel} · ${item.id}`;
    elements.detailTitle.textContent = item.title;
    elements.detailSummary.textContent = item.summary;
    elements.detailMeta.replaceChildren();
    addMeta("英文名称", item.englishTitle);
    addMeta("上游版本", item.upstreamVersion ? `v${item.upstreamVersion}` : "仓库固定版本");
    addMeta("固定 Commit", item.pinnedCommit.slice(0, 12));
    addMeta("Seedance 伴侣", item.companionSkill);
    addMeta("适配模型", item.models.join(" / "));
    addMeta("ComfyUI", "不导入（节点已内置官方能力）");
    addMeta("标签", item.tags.join("、") || "—");
    elements.openSource.textContent = "打开官方仓库 Skill ↗";
    elements.openSource.classList.remove("hidden");
    elements.openPreview.classList.toggle("hidden", !item.upstreamPreviewUrl);
    elements.detailMechanismKicker.textContent = "USAGE · SCOPE · BOUNDARY";
    elements.detailMechanismTitle.textContent = "Skill 摘要与使用范围";
    elements.detailPromptKicker.textContent = "UPSTREAM H3 · T8 SEEDANCE COMPANION";
    elements.detailPromptTitle.textContent = "安装入口与 Seedance 模板";
    renderDetailMedia(item);
    renderCreativeDna({
      companion_summary: item.companionSummary,
      source_boundary: "H3 使用固定版本的官方上游 Skill；Seedance 2.0 使用本库独立编写的伴侣 Skill。上游正文不复制。",
      comfyui_boundary: "此组官方条目不进入 ComfyUI 导入流程。"
    });
    choosePrompt("minimaxH3");
    elements.dialog.showModal();
    elements.dialog.querySelector(".dialog-shell").scrollTop = 0;
    return;
  }
  if (item.kind === "communitySkill") {
    elements.detailKicker.textContent = `${item.sourceLabel} · ${item.id}`;
    elements.detailTitle.textContent = item.title;
    elements.detailSummary.textContent = item.summary;
    elements.detailMeta.replaceChildren();
    addMeta("英文名称", item.englishTitle);
    addMeta("来源说明", item.sourceAttribution);
    addMeta("样片时长", formatDuration(item.sourceDurationSeconds));
    addMeta("目标范围", `${item.targetDurationRangeSeconds[0]}–${item.targetDurationRangeSeconds[1]} 秒`);
    addMeta("适配模型", item.models.join(" / "));
    addMeta("视频状态", item.media.hasFullVideo ? "本地完整 MP4（含声音）" : "GIF/海报降级预览");
    addMeta("ComfyUI", item.comfyuiImport ? "已打包" : "未打包节点；Skill 可独立安装");
    addMeta("标签", item.tags.join("、") || "—");
    elements.openSource.classList.toggle("hidden", !item.sourceUrl);
    elements.openSource.textContent = "查看来源 ↗";
    elements.openPreview.classList.add("hidden");
    elements.detailMechanismKicker.textContent = "REUSABLE MECHANISM · QUALITY REPAIRS";
    elements.detailMechanismTitle.textContent = "Skill 核心机制";
    elements.detailPromptKicker.textContent = "NON-OFFICIAL · DUAL-MODEL TEMPLATES";
    elements.detailPromptTitle.textContent = "MiniMax H3 / Seedance 2.0 模板";
    renderDetailMedia(item);
    renderCreativeDna({ ...item.creativeDna, source_boundary: item.sourceAttribution, comfyui_boundary: item.comfyuiReason });
    choosePrompt("minimaxH3");
    elements.dialog.showModal();
    elements.dialog.querySelector(".dialog-shell").scrollTop = 0;
    return;
  }
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
  elements.openSource.textContent = "查看作者原帖 ↗";
  elements.openPreview.classList.add("hidden");
  elements.detailMechanismKicker.textContent = "REUSABLE MECHANISM";
  elements.detailMechanismTitle.textContent = "Creative DNA";
  elements.detailPromptKicker.textContent = "MODEL-READY PROMPTS";
  elements.detailPromptTitle.textContent = "提示词模板";
  renderDetailMedia(item);
  renderCreativeDna(item.creativeDna);
  choosePrompt(item.prompts.minimaxH3 ? "minimaxH3" : "seedance20");
  elements.dialog.showModal();
  elements.dialog.querySelector(".dialog-shell").scrollTop = 0;
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
    elements.warning.textContent = `案例目录读取失败：${error.message}`;
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
elements.openSource.addEventListener("click", async () => {
  if (!state.activeCase?.sourceUrl) return;
  try { await api.openExternal(state.activeCase.sourceUrl); }
  catch { showToast("无法打开该 HTTPS 来源链接"); }
});
elements.openPreview.addEventListener("click", async () => {
  if (!state.activeCase?.upstreamPreviewUrl) return;
  try { await api.openExternal(state.activeCase.upstreamPreviewUrl); }
  catch { showToast("无法打开官方示例链接"); }
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
