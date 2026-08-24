(() => {
  "use strict";

  const api = window.promptLibrary;
  const elements = Object.fromEntries([
    "open-prompt-workbench", "prompt-workbench-dialog", "close-prompt-workbench", "open-api-settings", "open-api-settings-label", "workbench-api-settings-status", "api-settings-dialog", "api-settings-title", "api-settings-subtitle", "close-api-settings", "done-api-settings", "api-settings-footer-note", "workbench-kicker", "workbench-title",
    "workbench-subtitle", "workbench-intent-title", "workbench-intent-label", "workbench-intent", "workbench-route",
    "workbench-router-results", "workbench-template-label", "workbench-template", "workbench-template-summary",
    "workbench-step-nav", "workbench-prev-step", "workbench-next-step", "workbench-step-progress",
    "workbench-preview-heading", "workbench-preview-badge", "workbench-preview-media", "workbench-preview-image",
    "workbench-preview-placeholder", "workbench-preview-kind", "workbench-preview-models", "workbench-preview-title",
    "workbench-preview-summary", "workbench-preview-anchors-label", "workbench-preview-anchors", "workbench-preview-template-id",
    "workbench-provider-title", "workbench-provider-readiness", "workbench-provider-cards", "provider-registration-row", "workbench-credential-panel",
    "workbench-credential-title", "workbench-credential-note", "workbench-api-key-label", "workbench-api-key",
    "workbench-remember-key", "workbench-remember-label", "workbench-save-key", "workbench-clear-key",
    "workbench-register-selected", "workbench-plan-title", "workbench-target-label", "workbench-target", "workbench-output-language-label", "workbench-output-language", "workbench-output-language-zh", "workbench-output-language-en",
    "workbench-duration-label", "workbench-duration", "workbench-mode-label", "workbench-mode", "workbench-model-field",
    "workbench-model-label", "workbench-model", "workbench-base-url-field", "workbench-base-url-label", "workbench-base-url",
    "workbench-constraints-label", "workbench-constraints", "workbench-preflight", "workbench-preflight-card",
    "workbench-preflight-facts", "workbench-confirm-paid", "workbench-confirm-label", "workbench-start",
    "workbench-cancel-run", "workbench-result-title", "workbench-copy-result", "workbench-run-status", "workbench-output",
    "workbench-validation", "workbench-media-title", "workbench-add-media", "workbench-clear-media", "workbench-media-note",
    "workbench-media-list", "workbench-project-title", "workbench-project-name-label", "workbench-project-name",
    "workbench-project-list-label", "workbench-project-list", "workbench-project-notes-label", "workbench-project-notes",
    "workbench-save-project", "workbench-export-project", "workbench-delete-project",
    "workbench-local-qwen-panel", "local-qwen-card-title", "local-qwen-card-subtitle", "local-qwen-title", "local-qwen-note", "local-qwen-readiness",
    "local-qwen-directory-label", "local-qwen-directory", "local-qwen-pick-directory", "local-qwen-model-label", "local-qwen-model",
    "local-qwen-runtime-label", "local-qwen-runtime", "local-qwen-pick-runtime", "local-qwen-ffmpeg-label", "local-qwen-ffmpeg", "local-qwen-pick-ffmpeg",
    "local-qwen-context-label", "local-qwen-context", "local-qwen-max-tokens-label", "local-qwen-max-tokens", "local-qwen-think-label", "local-qwen-think",
    "local-qwen-reasoning-label", "local-qwen-reasoning", "local-qwen-video-fps-label", "local-qwen-video-fps", "local-qwen-unload-label", "local-qwen-unload",
    "local-qwen-file-status", "local-qwen-save", "local-qwen-verify", "local-qwen-release"
  ].map((id) => [id.replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase()), document.getElementById(id)]));

  const COPY_RESET_MS = 1600;
  const POLL_MS = 650;
  const WORKBENCH_STEPS = Object.freeze(["goal", "target", "result"]);
  const PROVIDER_FALLBACKS = Object.freeze({
    seedance_nz: { label: "贞贞的平价小屋", registrationUrl: "https://api.seedance.nz/sign-up?aff=5f4w", defaultModel: "bytedance/doubao-seed-evolving", configurableEndpoint: false, configurableModel: false },
    t8star_workshop: { label: "贞贞的 AI 工坊", registrationUrl: "https://ai.t8star.org/register?aff=dP7j", defaultModel: "gemini-3.5-flash", configurableEndpoint: false, configurableModel: true },
    openai_compatible: { label: "OpenAI 兼容接口", registrationUrl: null, defaultModel: "", configurableEndpoint: true, configurableModel: true },
    local_qwen: { label: "本地 Qwen3.8-27B", registrationUrl: null, defaultModel: "Qwen3.8-27B-Q4_K_M.gguf", configurableEndpoint: false, configurableModel: true, local: true, requiresCredential: false }
  });

  const COPY = {
    "zh-CN": {
      launch: "✦ API 增强工作台", kicker: "T8 实例化工作台", title: "提示词实例化与 API 增强",
      subtitle: "先选机制，再补齐结构，最后由你确认一次付费调用。", goal: "你想做什么？", goalLabel: "创作目标与必须保留的事实",
      route: "推荐 3 个机制", template: "选定模板 / Skill", provider: "选择增强渠道", loading: "正在读取…", ready: "已配置",
      missing: "未配置", registerSeedance: "注册平价小屋 API ↗", registerWorkshop: "注册 AI 工坊 API ↗", credential: "配置 API Key",
      credentialNote: "Key 只进入 Electron 主进程；可仅本次会话使用，或由系统安全存储加密保存。", apiKey: "API Key",
      remember: "使用系统安全存储记住", saveKey: "保存 Key", clearKey: "清除 Key", registerSelected: "没有 Key？立即注册 ↗",
      targetSection: "目标与硬约束", target: "目标模型", outputLanguage: "输出语言", languageChinese: "中文（默认）", languageEnglish: "English", duration: "时长", mode: "改写强度", model: "模型 ID",
      baseUrl: "OpenAI 兼容 Base URL", constraints: "额外硬约束", preflight: "生成调用确认单", confirm: "我确认：提交1次对话请求；平价小屋还会按素材数上传。费用未知，全部不自动重试。",
      start: "确认并开始增强", cancel: "请求取消", result: "增强结果与机制验收", copy: "复制结果", copied: "✓ 已复制",
      idle: "尚未运行", routingEmpty: "请先写清楚创作目标。", noMatch: "未找到明显匹配；请选择一个模板继续。",
      why: "匹配依据", anchors: "必需锚点", mechanism: "核心机制", configuredCount: (count) => `${count}/3 个云端渠道已配置`, providerReadiness: (count, local) => `${count}/3 个云端渠道已配置 · 本地${local}`,
      keySaved: "Key 已安全保存；输入框已清空。", keyCleared: "Key 已清除。", keyMissing: "请先配置当前渠道的 API Key。",
      preflightReady: "确认单已生成；修改任意字段后需重新预检。", running: "正在增强，请勿重复提交…", completed: "增强完成",
      failed: "增强失败", cancelRequested: "已请求取消；远端完成与计费状态可能未知。", validationPass: "静态机制检查通过",
      validationWarning: "已生成，但存在需要人工检查的项目", validationFail: "输出未通过静态检查", noDeterministicAnchor: "锚点无法完全由文本规则确定，请人工核对。",
      endpoint: "请求域名", plannedCalls: "计划调用", cost: "费用", costUnknown: "未知", credentialSource: "Key 来源", callOnce: "1 次，无自动重试",
      planExpired: "确认单已失效，请重新预检。", selectTemplate: "请选择模板", routerSelect: "使用此机制", close: "关闭工作台",
      mediaTitle: "参考图片 / 视频", addMedia: "添加素材", clearMedia: "清空", mediaNote: "图片最多9张，视频最多3个，单个不超过50 MiB；路径不会发给渲染器或写入项目。", noMedia: "尚未添加参考素材", mediaFact: "参考素材", uploadsFact: "额外上传",
      projectTitle: "实验项目与复盘", projectName: "项目名称", projectList: "已保存项目", projectNotes: "人工复盘备注", saveProject: "保存实验项目", projectSaved: "实验项目已保存", exportProject: "导出 JSON + Markdown", projectExported: "项目已导出", deleteProject: "删除项目", projectDeleted: "项目已删除", noProjects: "暂无项目",
      stepsLabel: "工作台步骤", stepGoal: "选择机制", stepGoalHint: "目标与模板", stepTarget: "生成参数", stepTargetHint: "模型与约束", stepResult: "结果验收", stepResultHint: "复制与复盘", previous: "上一步", nextStep: (label) => "下一步：" + label, stepProgress: (current, total) => "第 " + current + " / " + total + " 步", previewTitle: "当前模板预览", previewGif: "GIF 动态预览", previewPoster: "静态预览", previewUnavailable: "该模板暂无可用预览", previewLoading: "正在加载预览…", previewAnchors: "关键锚点", previewCase: "案例模板", previewCommunity: "非官方 Skill", apiSettings: "API 设置", apiSettingsTitle: "API 设置", apiSettingsSubtitle: "选择云端 API 或本地 Qwen 渠道；设置一次后可持续使用。", apiSettingsDone: "完成", apiSettingsFooter: "默认渠道与本地路径保存在本机；Key 仍由系统安全存储管理。", providerCurrent: "当前渠道",
      localCard: "本地 Qwen3.8-27B", localCardNote: "离线 GGUF · 无需 API Key", localTitle: "配置本地 Qwen3.8-27B", localNote: "模型不会包含在安装包中，也不会自动下载。选择你自己的模型目录并完成一次完整校验。", localMissing: "未配置", localTextReady: "仅文字可用", localVisionReady: "图片可用", localVideoReady: "图片与视频可用", localDirectory: "模型目录", localPickDirectory: "选择目录", localModel: "本地模型", localRuntime: "llama-server 运行文件", localPickRuntime: "选择运行文件", localFfmpeg: "FFmpeg（仅本地视频需要）", localPickFfmpeg: "选择 FFmpeg", localContext: "上下文", localMaxTokens: "最大输出", localThink: "思考模式", localReasoning: "推理强度", localVideoFps: "视频采样率", localUnload: "显存策略", localSave: "保存设置", localVerify: "完整校验", localRelease: "释放模型", localSaved: "本地设置已保存。", localVerified: "本地模型完整校验通过。", localReleased: "本地模型已释放。", localVerifying: "正在逐个校验大文件，请勿关闭应用…", localComputeConfirm: "我确认：仅使用本机算力，不调用外部 API、不上传素材、不产生 API 费用。", localComputeStart: "开始本地增强", localComputeCalls: "1 次本地推理，无网络请求", localRuntimeSource: "本机运行时"
    },
    en: {
      launch: "✦ API Workbench", kicker: "T8 INSTANCE WORKBENCH", title: "Prompt instantiation and API enhancement",
      subtitle: "Choose a mechanism, complete its structure, then explicitly confirm one paid call.", goal: "What do you want to create?", goalLabel: "Creative goal and facts that must remain",
      route: "Recommend 3 mechanisms", template: "Selected template / Skill", provider: "Enhancement provider", loading: "Loading…", ready: "Configured",
      missing: "Not configured", registerSeedance: "Register Seedance API ↗", registerWorkshop: "Register AI Workshop API ↗", credential: "Configure API key",
      credentialNote: "The key enters Electron Main only. Keep it for this session or encrypt it with the operating system secure store.", apiKey: "API key",
      remember: "Remember with OS secure storage", saveKey: "Save key", clearKey: "Clear key", registerSelected: "Need a key? Register ↗",
      targetSection: "Target and hard constraints", target: "Target model", outputLanguage: "Output language", languageChinese: "Chinese (default)", languageEnglish: "English", duration: "Duration", mode: "Rewrite strength", model: "Model ID",
      baseUrl: "OpenAI-compatible Base URL", constraints: "Additional hard constraints", preflight: "Create call confirmation", confirm: "I confirm one chat request; Seedance adds one upload per media item. Cost is unknown and no request is automatically retried.",
      start: "Confirm and enhance", cancel: "Request cancellation", result: "Enhanced result and mechanism check", copy: "Copy result", copied: "✓ Copied",
      idle: "Not started", routingEmpty: "Describe the creative goal first.", noMatch: "No strong match found; choose a template manually.",
      why: "Why it matches", anchors: "Required anchors", mechanism: "Core mechanism", configuredCount: (count) => `${count}/3 cloud providers configured`, providerReadiness: (count, local) => `${count}/3 cloud providers configured · local ${local}`,
      keySaved: "Key saved securely; the input has been cleared.", keyCleared: "Key cleared.", keyMissing: "Configure the current provider key first.",
      preflightReady: "Confirmation created. Any field change requires a new preflight.", running: "Enhancing; duplicate submission is blocked…", completed: "Enhancement completed",
      failed: "Enhancement failed", cancelRequested: "Cancellation requested; remote completion and billing may be unknown.", validationPass: "Static mechanism checks passed",
      validationWarning: "Generated with items requiring human review", validationFail: "Output failed static checks", noDeterministicAnchor: "Some anchors require human review.",
      endpoint: "Endpoint host", plannedCalls: "Planned calls", cost: "Cost", costUnknown: "Unknown", credentialSource: "Key source", callOnce: "1 request, no automatic retry",
      planExpired: "Confirmation expired. Run preflight again.", selectTemplate: "Select a template", routerSelect: "Use this mechanism", close: "Close workbench",
      mediaTitle: "Reference images / videos", addMedia: "Add media", clearMedia: "Clear", mediaNote: "Up to 9 images and 3 videos, 50 MiB each. Paths never enter the renderer or saved projects.", noMedia: "No reference media selected", mediaFact: "Reference media", uploadsFact: "Extra uploads",
      projectTitle: "Experiment project and review", projectName: "Project name", projectList: "Saved projects", projectNotes: "Human review notes", saveProject: "Save experiment", projectSaved: "Experiment saved", exportProject: "Export JSON + Markdown", projectExported: "Project exported", deleteProject: "Delete project", projectDeleted: "Project deleted", noProjects: "No saved projects",
      stepsLabel: "Workbench steps", stepGoal: "Mechanism", stepGoalHint: "Goal and template", stepTarget: "Parameters", stepTargetHint: "Model and constraints", stepResult: "Review result", stepResultHint: "Copy and evaluate", previous: "Previous", nextStep: (label) => "Next: " + label, stepProgress: (current, total) => "Step " + current + " of " + total, previewTitle: "Current template preview", previewGif: "Animated GIF preview", previewPoster: "Static preview", previewUnavailable: "No preview is available for this template", previewLoading: "Loading preview…", previewAnchors: "Key anchors", previewCase: "Case template", previewCommunity: "Community Skill", apiSettings: "API settings", apiSettingsTitle: "API settings", apiSettingsSubtitle: "Choose a cloud API or local Qwen provider. Configure it once for future runs.", apiSettingsDone: "Done", apiSettingsFooter: "The default provider and local paths stay on this device. OS secure storage still manages API keys.", providerCurrent: "Current provider",
      localCard: "Local Qwen3.8-27B", localCardNote: "Offline GGUF · no API key", localTitle: "Configure local Qwen3.8-27B", localNote: "Models are never bundled or downloaded automatically. Choose your own model folder and complete one full verification.", localMissing: "Not configured", localTextReady: "Text ready", localVisionReady: "Images ready", localVideoReady: "Images and video ready", localDirectory: "Model folder", localPickDirectory: "Choose folder", localModel: "Local model", localRuntime: "llama-server executable", localPickRuntime: "Choose runtime", localFfmpeg: "FFmpeg (local video only)", localPickFfmpeg: "Choose FFmpeg", localContext: "Context", localMaxTokens: "Max output", localThink: "Thinking", localReasoning: "Reasoning effort", localVideoFps: "Video sample rate", localUnload: "Memory policy", localSave: "Save settings", localVerify: "Full verification", localRelease: "Unload model", localSaved: "Local settings saved.", localVerified: "Local model verification passed.", localReleased: "Local model unloaded.", localVerifying: "Verifying large files one at a time. Keep the app open…", localComputeConfirm: "I confirm this uses local compute only, calls no external API, uploads no media, and incurs no API fee.", localComputeStart: "Start local enhancement", localComputeCalls: "1 local inference, no network request", localRuntimeSource: "Local runtime"
    }
  };

  const state = {
    catalog: null,
    templates: [],
    providers: [],
    providerId: PROVIDER_FALLBACKS[localStorage.getItem("t8-workbench-provider")] ? localStorage.getItem("t8-workbench-provider") : "seedance_nz",
    plan: null,
    runId: null,
    polling: null,
    output: "",
    media: [],
    projects: [],
    selectedProjectId: null,
    activeStep: "goal",
    localQwen: null
  };

  function loadProviderPreferences(storageKey = "t8-workbench-provider-options") {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const clean = {};
      for (const id of Object.keys(PROVIDER_FALLBACKS)) {
        const entry = value?.[id];
        if (!entry || typeof entry !== "object") continue;
        clean[id] = { model: String(entry.model || "").slice(0, 160), baseUrl: String(entry.baseUrl || "").slice(0, 2048) };
      }
      return clean;
    } catch { return {}; }
  }

  state.providerPreferences = loadProviderPreferences();
  state.music3ProviderPreferences = loadProviderPreferences("t8-music3-provider-options");

  function music3CapabilityActive() {
    return elements.promptWorkbenchDialog.dataset.capability === "music3";
  }

  function activeProviderPreferences() {
    return music3CapabilityActive() ? state.music3ProviderPreferences : state.providerPreferences;
  }

  function saveProviderPreferences(preferences = activeProviderPreferences()) {
    if (music3CapabilityActive()) localStorage.setItem("t8-music3-provider-options", JSON.stringify(preferences));
    else localStorage.setItem("t8-workbench-provider-options", JSON.stringify(preferences));
  }

  function storeCurrentProviderOptions() {
    const preferences = activeProviderPreferences();
    preferences[state.providerId] = { model: elements.workbenchModel.value.slice(0, 160), baseUrl: elements.workbenchBaseUrl.value.slice(0, 2048) };
    saveProviderPreferences(preferences);
    invalidatePlan();
  }

  function locale() { return document.documentElement.lang === "en" ? "en" : "zh-CN"; }
  function t(key) { return COPY[locale()][key]; }
  function localized(item) { return item?.localizations?.[locale()] || item?.localizations?.["zh-CN"] || item?.localizations?.en || {}; }
  function normalize(value) { return String(value || "").normalize("NFKC").toLocaleLowerCase(); }
  function textContent(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(textContent).join(" ");
    if (typeof value === "object") return Object.values(value).map(textContent).join(" ");
    return String(value);
  }

  function tokens(value) {
    const text = normalize(value);
    const latin = text.match(/[a-z0-9][a-z0-9_-]{1,}/gu) || [];
    const han = text.match(/[\p{Script=Han}]{2,}/gu) || [];
    const pairs = han.flatMap((chunk) => chunk.length <= 4 ? [chunk] : [...Array(chunk.length - 1)].map((_unused, index) => chunk.slice(index, index + 2)));
    return [...new Set([...latin, ...pairs])];
  }

  function templateKey(item) { return item.templateId || item.skillRef || item.id; }
  function templateDisplay(item) {
    const display = localized(item);
    return {
      title: display.title || item.title || item.englishTitle || item.id,
      summary: display.summary || item.summary || "",
      quick: display.quick_start || {},
      dna: display.creative_dna || item.creativeDna || {}
    };
  }

  function buildTemplates(catalog) {
    const candidates = [...(catalog.cases || []), ...(catalog.communitySkills || [])];
    const deduped = new Map();
    for (const item of candidates) {
      const key = templateKey(item);
      const current = deduped.get(key);
      if (!current) {
        deduped.set(key, item);
        continue;
      }
      if (!current.templateId && item.templateId) deduped.set(key, item);
    }
    return [...deduped.values()].sort((left, right) => templateDisplay(left).title.localeCompare(templateDisplay(right).title, locale()));
  }

  function populateTemplates(selectedKey = "") {
    const current = selectedKey || elements.workbenchTemplate.value;
    elements.workbenchTemplate.replaceChildren();
    for (const item of state.templates) {
      const option = document.createElement("option");
      option.value = templateKey(item);
      option.textContent = templateDisplay(item).title;
      elements.workbenchTemplate.append(option);
    }
    if (state.templates.some((item) => templateKey(item) === current)) elements.workbenchTemplate.value = current;
    renderTemplateSummary();
  }

  function selectedTemplate() { return state.templates.find((item) => templateKey(item) === elements.workbenchTemplate.value) || state.templates[0] || null; }

  function stepCopy(step) {
    const suffix = step[0].toUpperCase() + step.slice(1);
    return { label: t("step" + suffix), hint: t("step" + suffix + "Hint") };
  }

  function renderWorkbenchSteps() {
    const activeIndex = Math.max(0, WORKBENCH_STEPS.indexOf(state.activeStep));
    elements.workbenchStepNav.setAttribute("aria-label", t("stepsLabel"));
    for (const button of elements.workbenchStepNav.querySelectorAll("[data-workbench-step]")) {
      const active = button.dataset.workbenchStep === state.activeStep;
      const copy = stepCopy(button.dataset.workbenchStep);
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      button.querySelector("strong").textContent = copy.label;
      button.querySelector("small").textContent = copy.hint;
    }
    for (const panel of document.querySelectorAll("[data-workbench-panel]")) panel.hidden = panel.dataset.workbenchPanel !== state.activeStep;
    elements.workbenchPrevStep.textContent = t("previous");
    elements.workbenchPrevStep.disabled = activeIndex === 0;
    elements.workbenchStepProgress.textContent = t("stepProgress")(activeIndex + 1, WORKBENCH_STEPS.length);
    const next = WORKBENCH_STEPS[activeIndex + 1];
    elements.workbenchNextStep.hidden = !next;
    if (next) elements.workbenchNextStep.textContent = t("nextStep")(stepCopy(next).label);
  }

  function setWorkbenchStep(step, focusTab = false) {
    if (!WORKBENCH_STEPS.includes(step)) return;
    state.activeStep = step;
    renderWorkbenchSteps();
    const panel = document.querySelector('[data-workbench-panel="' + step + '"]');
    if (panel) panel.scrollTop = 0;
    if (focusTab) elements.workbenchStepNav.querySelector('[data-workbench-step="' + step + '"]')?.focus();
  }

  function moveWorkbenchStep(delta) {
    const index = WORKBENCH_STEPS.indexOf(state.activeStep);
    setWorkbenchStep(WORKBENCH_STEPS[Math.max(0, Math.min(WORKBENCH_STEPS.length - 1, index + delta))], true);
  }

  function renderTemplatePreview() {
    const item = selectedTemplate();
    if (!item) return;
    const display = templateDisplay(item);
    const anchors = display.quick.required_anchors || item.requiredAnchors || [];
    const gifUrl = item.media?.gifUrl || "";
    const posterUrl = item.media?.posterUrl || "";
    const imageUrl = gifUrl || posterUrl;
    const isGif = Boolean(gifUrl);
    const image = elements.workbenchPreviewImage;
    const previewRequest = String(Number(image.dataset.previewRequest || 0) + 1);
    image.dataset.previewRequest = previewRequest;
    image._t8GifPreloader = null;
    image.onload = null;
    image.onerror = null;
    image.hidden = true;
    image.removeAttribute("src");
    elements.workbenchPreviewPlaceholder.classList.remove("hidden");
    elements.workbenchPreviewPlaceholder.querySelector("small").textContent = imageUrl ? t("previewLoading") : t("previewUnavailable");
    elements.workbenchPreviewMedia.dataset.state = imageUrl ? "loading" : "empty";
    elements.workbenchPreviewBadge.textContent = imageUrl ? (isGif ? t("previewGif") : t("previewPoster")) : "—";
    elements.workbenchPreviewKind.textContent = item.kind === "communitySkill" ? t("previewCommunity") : t("previewCase");
    elements.workbenchPreviewModels.textContent = (item.models || ["MiniMax H3", "Seedance 2.0"]).join(" · ");
    elements.workbenchPreviewTitle.textContent = display.title;
    elements.workbenchPreviewSummary.textContent = display.summary || display.dna.mechanism || "—";
    elements.workbenchPreviewAnchorsLabel.textContent = t("previewAnchors");
    elements.workbenchPreviewAnchors.replaceChildren();
    for (const anchor of anchors.slice(0, 5)) { const li = document.createElement("li"); li.textContent = anchor; elements.workbenchPreviewAnchors.append(li); }
    if (!anchors.length) { const li = document.createElement("li"); li.textContent = "—"; elements.workbenchPreviewAnchors.append(li); }
    elements.workbenchPreviewTemplateId.textContent = templateKey(item);
    if (!imageUrl) return;
    image.alt = display.title;
    const show = (url, readyState, keepPosterOnError = false) => {
      image.onload = () => {
        if (image.dataset.previewRequest !== previewRequest) return;
        image.hidden = false;
        elements.workbenchPreviewPlaceholder.classList.add("hidden");
        elements.workbenchPreviewMedia.dataset.state = readyState;
      };
      image.onerror = () => {
        if (image.dataset.previewRequest !== previewRequest || keepPosterOnError) return;
        image.hidden = true;
        elements.workbenchPreviewPlaceholder.classList.remove("hidden");
        elements.workbenchPreviewPlaceholder.querySelector("small").textContent = t("previewUnavailable");
        elements.workbenchPreviewMedia.dataset.state = "error";
      };
      image.src = url;
    };
    if (gifUrl && posterUrl) {
      show(posterUrl, "poster");
      const preloader = new Image();
      image._t8GifPreloader = preloader;
      preloader.onload = () => {
        if (image.dataset.previewRequest !== previewRequest) return;
        show(gifUrl, "ready", true);
      };
      preloader.src = gifUrl;
    } else {
      show(imageUrl, isGif ? "ready" : "poster");
    }
  }

  function renderTemplateSummary() {
    const item = selectedTemplate();
    if (!item) { elements.workbenchTemplateSummary.textContent = t("selectTemplate"); return; }
    const display = templateDisplay(item);
    const anchors = display.quick.required_anchors || item.requiredAnchors || [];
    elements.workbenchTemplateSummary.replaceChildren();
    const mechanism = document.createElement("p");
    mechanism.textContent = display.dna.mechanism || display.summary;
    const meta = document.createElement("small");
    meta.textContent = `${t("anchors")}: ${anchors.length} · ${templateKey(item)}`;
    elements.workbenchTemplateSummary.append(mechanism, meta);
    renderTemplatePreview();
    invalidatePlan();
  }

  const INTENT_ALIASES = Object.freeze({
    product: ["产品", "广告", "功能", "证明", "发布", "product", "advert", "proof", "launch"],
    dialogue: ["对话", "对白", "问答", "喜剧", "dialogue", "conversation", "comedy", "reply"],
    identity: ["角色", "身份", "一致", "人物", "identity", "character", "consistent"],
    material: ["材质", "材料", "变形", "工艺", "material", "transform", "craft"],
    journey: ["旅程", "穿越", "前进", "抵达", "journey", "traverse", "arrival", "route"],
    rescue: ["救援", "营救", "脱困", "绳", "rescue", "escape", "tether"],
    anomaly: ["异常", "诡异", "幽灵", "发现", "anomaly", "ghost", "reveal", "mystery"],
    scale: ["尺度", "微型", "巨大", "比例", "scale", "miniature", "giant"],
    typography: ["文字", "字体", "排版", "标题", "typography", "text", "title"],
    performance: ["表演", "舞蹈", "动作", "姿态", "performance", "dance", "pose"]
  });

  function routeTemplates(intent) {
    const queryTokens = tokens(intent);
    const query = normalize(intent);
    const scored = state.templates.map((item) => {
      const display = templateDisplay(item);
      const haystack = normalize([display.title, display.summary, textContent(display.quick), textContent(display.dna), item.tags?.join(" ")].join(" "));
      let score = 0;
      const reasons = [];
      for (const token of queryTokens) {
        if (token.length > 1 && haystack.includes(token)) score += token.length > 3 ? 5 : 2;
      }
      for (const [group, aliases] of Object.entries(INTENT_ALIASES)) {
        if (!aliases.some((alias) => query.includes(normalize(alias)))) continue;
        const matched = aliases.filter((alias) => haystack.includes(normalize(alias)));
        if (matched.length) {
          score += 8 + matched.length;
          reasons.push(`${group}: ${matched.slice(0, 3).join(" / ")}`);
        }
      }
      if (display.summary && queryTokens.some((token) => normalize(display.summary).includes(token))) reasons.push(display.summary.slice(0, 90));
      return { item, score, reasons: [...new Set(reasons)].slice(0, 2) };
    });
    return scored.sort((left, right) => right.score - left.score || templateDisplay(left.item).title.localeCompare(templateDisplay(right.item).title, locale())).slice(0, 3);
  }

  function renderRouterResults() {
    const intent = elements.workbenchIntent.value.trim();
    elements.workbenchRouterResults.replaceChildren();
    if (!intent) { elements.workbenchRouterResults.textContent = t("routingEmpty"); return; }
    const results = routeTemplates(intent);
    if (!results.length || results[0].score <= 0) { elements.workbenchRouterResults.textContent = t("noMatch"); return; }
    for (const result of results) {
      const display = templateDisplay(result.item);
      const card = document.createElement("article");
      card.className = "router-card";
      const title = document.createElement("strong");
      title.textContent = display.title;
      const summary = document.createElement("p");
      summary.textContent = display.summary;
      const reason = document.createElement("small");
      reason.textContent = `${t("why")}: ${result.reasons.join(" · ") || `${result.score} points`}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button copy-secondary";
      button.textContent = t("routerSelect");
      button.addEventListener("click", () => {
        elements.workbenchTemplate.value = templateKey(result.item);
        renderTemplateSummary();
      });
      card.append(title, summary, reason, button);
      elements.workbenchRouterResults.append(card);
    }
  }

  function providerConfig(id = state.providerId) { return state.providers.find((provider) => provider.id === id) || PROVIDER_FALLBACKS[id]; }

  function localReadinessLabel(status = state.localQwen) {
    if (!status?.textReady) return t("localMissing");
    if (status.videoReady) return t("localVideoReady");
    if (status.visionReady) return t("localVisionReady");
    return t("localTextReady");
  }

  function fileState(item) {
    if (item?.verified) return locale() === "en" ? "verified" : "已验证";
    if (item?.sizeMatch) return locale() === "en" ? "awaiting full verification" : "待完整校验";
    if (item?.present) return locale() === "en" ? "incompatible file" : "文件不兼容";
    return locale() === "en" ? "missing" : "缺失";
  }

  function renderLocalQwen(status = state.localQwen) {
    if (!status) return;
    elements.localQwenDirectory.value = status.modelDirectory || "";
    elements.localQwenRuntime.value = status.runtimeExecutable || "";
    elements.localQwenFfmpeg.value = status.ffmpegExecutable || "";
    elements.localQwenModel.value = status.modelFilename || "Qwen3.8-27B-Q4_K_M.gguf";
    elements.localQwenContext.value = String(status.contextSize || 32768);
    elements.localQwenMaxTokens.value = String(status.maxTokens || 4096);
    elements.localQwenThink.value = status.thinkMode || "off";
    elements.localQwenReasoning.value = status.reasoningEffort || "medium";
    elements.localQwenVideoFps.value = String(status.videoSampleFps || 2);
    elements.localQwenUnload.value = status.unloadPolicy || "after_run";
    const readiness = localReadinessLabel(status);
    elements.localQwenReadiness.textContent = readiness;
    elements.localQwenReadiness.classList.toggle("ready", Boolean(status.textReady));
    const rows = [
      [locale() === "en" ? "Selected model" : "当前模型", fileState(status.model)],
      ["mmproj-F16.gguf", fileState(status.mmproj)],
      ["llama-server b10436", fileState(status.runtime)],
      ["FFmpeg + FFprobe", status.ffmpegPresent && status.ffprobePresent
        ? (locale() === "en" ? "ready for local video" : "本地视频可用")
        : status.ffmpegExecutable
          ? (locale() === "en" ? "FFprobe is missing beside FFmpeg" : "FFmpeg 同目录缺少 FFprobe")
          : (locale() === "en" ? "optional; required for video" : "可选；视频必需")]
    ];
    elements.localQwenFileStatus.replaceChildren(...rows.map(([label, value]) => {
      const row = document.createElement("span");
      const strong = document.createElement("strong"); strong.textContent = label;
      const em = document.createElement("em"); em.textContent = value;
      row.append(strong, em);
      return row;
    }));
  }

  function renderProviders() {
    const configured = state.providers.filter((provider) => !provider.local && provider.credential?.configured).length;
    const localProvider = state.providers.find((provider) => provider.id === "local_qwen");
    state.localQwen = localProvider?.localStatus || localProvider?.credential || state.localQwen;
    const localLabel = localReadinessLabel();
    elements.workbenchProviderReadiness.textContent = t("providerReadiness")(configured, localLabel);
    elements.workbenchApiSettingsStatus.textContent = `${configured}/3 · ${localLabel}`;
    for (const button of elements.workbenchProviderCards.querySelectorAll("[data-provider-id]")) {
      const id = button.dataset.providerId;
      const active = id === state.providerId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      const provider = state.providers.find((item) => item.id === id);
      const status = provider?.credential;
      const label = button.querySelector(`[data-provider-state="${id}"]`);
      label.textContent = id === "local_qwen" ? localReadinessLabel(provider?.localStatus || status) : status?.configured ? `${t("ready")} · ${status.source}` : t("missing");
      label.classList.toggle("ready", Boolean(status?.configured));
    }
    const selected = providerConfig();
    const preferences = activeProviderPreferences()[state.providerId] || {};
    const local = state.providerId === "local_qwen";
    elements.workbenchCredentialTitle.textContent = `${t("credential")} · ${selected.label}`;
    elements.openApiSettingsLabel.textContent = `${t("apiSettings")} · ${selected.label}`;
    elements.workbenchModel.value = local ? (state.localQwen?.modelFilename || selected.defaultModel) : preferences.model || selected.defaultModel || "";
    elements.workbenchBaseUrl.value = preferences.baseUrl || "";
    elements.workbenchModel.disabled = !selected.configurableModel;
    elements.workbenchBaseUrlField.classList.toggle("hidden", !selected.configurableEndpoint);
    elements.workbenchRegisterSelected.classList.toggle("hidden", !selected.registrationUrl);
    elements.workbenchCredentialPanel.classList.toggle("hidden", local);
    elements.workbenchLocalQwenPanel.classList.toggle("hidden", !local);
    elements.providerRegistrationRow.classList.toggle("hidden", local);
    elements.workbenchConfirmLabel.textContent = local ? t("localComputeConfirm") : t("confirm");
    elements.workbenchStart.textContent = local ? t("localComputeStart") : t("start");
    if (!music3CapabilityActive()) elements.workbenchSubtitle.textContent = local
      ? (locale() === "en" ? "Choose a mechanism, complete its structure, then enhance it entirely on this device." : "先选机制，再补齐结构，最后完全使用本机模型增强。")
      : t("subtitle");
    if (state.localQwen) renderLocalQwen();
    invalidatePlan();
  }

  async function refreshProviders() {
    try { state.providers = await api.promptProviders(); }
    catch { state.providers = Object.entries(PROVIDER_FALLBACKS).map(([id, provider]) => ({ id, ...provider, credential: { configured: false, source: null } })); }
    renderProviders();
  }

  function selectProvider(id) {
    if (!PROVIDER_FALLBACKS[id]) return;
    state.providerId = id;
    localStorage.setItem("t8-workbench-provider", id);
    elements.workbenchModel.dataset.edited = "false";
    renderProviders();
  }

  async function openRegistration(providerId) {
    const provider = providerConfig(providerId);
    if (!provider?.registrationUrl) return;
    try { await api.openExternal(provider.registrationUrl); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function saveCredential() {
    const key = elements.workbenchApiKey.value;
    if (!key.trim()) { setRunStatus(t("keyMissing"), "error"); return; }
    try {
      await api.setPromptCredential({ providerId: state.providerId, apiKey: key, remember: elements.workbenchRememberKey.checked });
      elements.workbenchApiKey.value = "";
      await refreshProviders();
      setRunStatus(t("keySaved"), "success");
    } catch (error) {
      elements.workbenchApiKey.value = "";
      setRunStatus(error.message, "error");
    }
  }

  async function clearCredential() {
    try {
      await api.clearPromptCredential(state.providerId);
      elements.workbenchApiKey.value = "";
      await refreshProviders();
      setRunStatus(t("keyCleared"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function localConfigInput() {
    return {
      modelFilename: elements.localQwenModel.value,
      contextSize: Number(elements.localQwenContext.value),
      maxTokens: Number(elements.localQwenMaxTokens.value),
      thinkMode: elements.localQwenThink.value,
      reasoningEffort: elements.localQwenReasoning.value,
      videoSampleFps: Number(elements.localQwenVideoFps.value),
      unloadPolicy: elements.localQwenUnload.value
    };
  }

  async function applyLocalStatus(promise, successMessage = "") {
    try {
      state.localQwen = await promise;
      await refreshProviders();
      if (successMessage) setRunStatus(successMessage, "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function saveLocalQwen() {
    await applyLocalStatus(api.configureLocalQwen(localConfigInput()), t("localSaved"));
  }

  async function pickLocalModelDirectory() {
    await applyLocalStatus(api.pickLocalQwenModelDirectory());
  }

  async function pickLocalRuntime() {
    await applyLocalStatus(api.pickLocalQwenRuntime());
  }

  async function pickLocalFfmpeg() {
    await applyLocalStatus(api.pickLocalQwenFfmpeg());
  }

  async function verifyLocalQwen() {
    elements.localQwenVerify.disabled = true;
    setRunStatus(t("localVerifying"), "warning");
    try {
      await api.configureLocalQwen(localConfigInput());
      state.localQwen = await api.verifyLocalQwen();
      await refreshProviders();
      setRunStatus(t("localVerified"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
    finally { elements.localQwenVerify.disabled = false; }
  }

  async function releaseLocalQwen() {
    await applyLocalStatus(api.releaseLocalQwen(), t("localReleased"));
  }

  function templateContract(item) {
    const en = item.localizations?.en || {};
    const display = templateDisplay(item);
    const quick = en.quick_start || display.quick || {};
    return {
      id: item.id,
      templateId: templateKey(item),
      title: en.title || item.englishTitle || item.title || item.id,
      summary: en.summary || item.summary || "",
      inputFormat: quick.input_format || item.inputFormat || "",
      recommendedInput: quick.recommended_input || item.recommendedInput || "",
      requiredAnchors: quick.required_anchors || item.requiredAnchors || [],
      creativeDna: item.creativeDna || {},
      surfaceGuide: item.prompts?.[elements.workbenchTarget.value] || ""
    };
  }

  function currentPlanInput() {
    const item = selectedTemplate();
    const provider = providerConfig();
    return {
      providerId: state.providerId,
      baseUrl: elements.workbenchBaseUrl.value,
      model: elements.workbenchModel.value || provider.defaultModel,
      target: elements.workbenchTarget.value,
      outputLanguage: elements.workbenchOutputLanguage.value,
      durationSeconds: Number(elements.workbenchDuration.value),
      rewriteMode: elements.workbenchMode.value,
      intent: elements.workbenchIntent.value,
      constraints: elements.workbenchConstraints.value,
      mediaIds: state.media.map((item) => item.mediaId),
      template: templateContract(item)
    };
  }

  function formatBytes(value) {
    const bytes = Number(value || 0);
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MiB` : `${Math.max(1, Math.round(bytes / 1024))} KiB`;
  }

  function renderMedia() {
    elements.workbenchMediaList.replaceChildren();
    if (!state.media.length) {
      const empty = document.createElement("span"); empty.className = "media-chip"; empty.textContent = t("noMedia"); elements.workbenchMediaList.append(empty); return;
    }
    for (const item of state.media) {
      const chip = document.createElement("span"); chip.className = "media-chip";
      chip.textContent = `${item.label} · ${item.name} · ${formatBytes(item.sizeBytes)}`;
      chip.title = item.sha256;
      elements.workbenchMediaList.append(chip);
    }
  }

  async function pickMedia() {
    try { state.media = await api.pickPromptMedia(); renderMedia(); invalidatePlan(); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function clearMedia() {
    try { state.media = await api.clearPromptMedia(); renderMedia(); invalidatePlan(); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  function renderProjects(selectedId = state.selectedProjectId) {
    elements.workbenchProjectList.replaceChildren();
    const empty = document.createElement("option"); empty.value = ""; empty.textContent = t("noProjects"); elements.workbenchProjectList.append(empty);
    for (const project of state.projects) {
      const option = document.createElement("option"); option.value = project.projectId; option.textContent = `${project.title} · ${project.target}`; elements.workbenchProjectList.append(option);
    }
    if (selectedId && state.projects.some((item) => item.projectId === selectedId)) elements.workbenchProjectList.value = selectedId;
    elements.workbenchExportProject.disabled = !elements.workbenchProjectList.value;
    elements.workbenchDeleteProject.disabled = !elements.workbenchProjectList.value;
  }

  async function refreshProjects(selectedId = state.selectedProjectId) {
    state.projects = await api.promptProjects();
    renderProjects(selectedId);
  }

  async function loadProject() {
    const projectId = elements.workbenchProjectList.value;
    state.selectedProjectId = projectId || null;
    elements.workbenchExportProject.disabled = !projectId;
    elements.workbenchDeleteProject.disabled = !projectId;
    if (!projectId) return;
    const project = await api.promptProject(projectId);
    if (!project) return;
    elements.workbenchProjectName.value = project.title || "";
    elements.workbenchProjectNotes.value = project.notes || "";
    elements.workbenchIntent.value = project.intent || "";
    elements.workbenchConstraints.value = project.constraints || "";
    if (state.templates.some((item) => templateKey(item) === project.template?.id)) elements.workbenchTemplate.value = project.template.id;
    elements.workbenchTarget.value = project.target || "minimaxH3";
    elements.workbenchOutputLanguage.value = project.outputLanguage === "en" ? "en" : "zh-CN";
    elements.workbenchDuration.value = String(project.durationSeconds || 15);
    elements.workbenchMode.value = project.rewriteMode || "balanced";
    if (PROVIDER_FALLBACKS[project.provider?.id]) selectProvider(project.provider.id);
    elements.workbenchModel.value = project.provider?.model || "";
    elements.workbenchModel.dataset.edited = "true";
    state.output = project.output || "";
    state.runId = null;
    elements.workbenchOutput.textContent = state.output;
    elements.workbenchCopyResult.disabled = !state.output;
    elements.workbenchSaveProject.disabled = false;
    renderTemplateSummary();
    renderValidation(project.validation);
    invalidatePlan();
  }

  async function saveProject() {
    if (!state.runId && !state.selectedProjectId) return;
    try {
      const project = await api.savePromptProject({ runId: state.runId, projectId: state.selectedProjectId, title: elements.workbenchProjectName.value, notes: elements.workbenchProjectNotes.value });
      state.selectedProjectId = project.projectId;
      elements.workbenchProjectName.value = project.title;
      await refreshProjects(project.projectId);
      setRunStatus(t("projectSaved"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function exportProject() {
    if (!state.selectedProjectId) return;
    try { const result = await api.exportPromptProject(state.selectedProjectId); if (result.saved) setRunStatus(t("projectExported"), "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function deleteProject() {
    if (!state.selectedProjectId) return;
    try {
      state.projects = await api.deletePromptProject(state.selectedProjectId);
      state.selectedProjectId = null;
      renderProjects();
      elements.workbenchProjectName.value = "";
      elements.workbenchProjectNotes.value = "";
      elements.workbenchSaveProject.disabled = !state.runId;
      setRunStatus(t("projectDeleted"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function invalidatePlan() {
    state.plan = null;
    elements.workbenchPreflightCard.classList.add("hidden");
    elements.workbenchConfirmPaid.checked = false;
    elements.workbenchStart.disabled = true;
  }

  function renderPreflight(plan) {
    elements.workbenchPreflightFacts.replaceChildren();
    const local = plan.confirmationKind === "local_compute";
    const facts = [
      [t("endpoint"), local ? t("localRuntimeSource") : plan.endpointHost], [t("model"), plan.model], [t("target"), plan.target], [t("outputLanguage"), plan.outputLanguage === "en" ? t("languageEnglish") : t("languageChinese")],
      [t("anchors"), plan.requiredAnchorCount], [t("mediaFact"), plan.mediaCount], [t("plannedCalls"), local ? t("localComputeCalls") : `${plan.plannedChatCalls} chat + ${plan.plannedUploadCalls} upload`], [t("cost"), local ? "0" : t("costUnknown")],
      [t("credentialSource"), local ? t("localRuntimeSource") : plan.credentialSource]
    ];
    for (const [term, value] of facts) {
      const dt = document.createElement("dt"); dt.textContent = term;
      const dd = document.createElement("dd"); dd.textContent = String(value ?? "—");
      elements.workbenchPreflightFacts.append(dt, dd);
    }
    elements.workbenchPreflightCard.classList.remove("hidden");
    elements.workbenchConfirmLabel.textContent = local ? t("localComputeConfirm") : t("confirm");
    elements.workbenchStart.textContent = local ? t("localComputeStart") : t("start");
    elements.workbenchConfirmPaid.checked = false;
    elements.workbenchStart.disabled = true;
    setRunStatus(t("preflightReady"), "success");
  }

  async function preflight() {
    try {
      state.plan = await api.preflightPrompt(currentPlanInput());
      renderPreflight(state.plan);
    } catch (error) {
      state.plan = null;
      elements.workbenchPreflightCard.classList.add("hidden");
      setRunStatus(error.message || t("failed"), "error");
    }
  }

  function setRunStatus(message, status = "idle") {
    elements.workbenchRunStatus.textContent = message;
    elements.workbenchRunStatus.dataset.state = status;
  }

  function renderValidation(report) {
    elements.workbenchValidation.replaceChildren();
    if (!report) return;
    const heading = document.createElement("strong");
    heading.textContent = report.status === "pass" ? t("validationPass") : report.status === "warning" ? t("validationWarning") : t("validationFail");
    const coverage = document.createElement("p");
    coverage.textContent = report.anchorCoverage === null ? t("noDeterministicAnchor") : `${t("anchors")}: ${Math.round(report.anchorCoverage * 100)}%`;
    elements.workbenchValidation.append(heading, coverage);
    const issues = [...(report.errors || []), ...(report.warnings || [])];
    if (issues.length) {
      const list = document.createElement("ul");
      for (const issue of issues) { const li = document.createElement("li"); li.textContent = `${issue.code}: ${issue.message}`; list.append(li); }
      elements.workbenchValidation.append(list);
    }
    const trace = document.createElement("div"); trace.className = "anchor-trace";
    for (const item of report.realizedTrace || []) {
      const pill = document.createElement("span");
      pill.className = item.matched === true ? "pass" : item.matched === false ? "warning" : "unknown";
      pill.textContent = `${item.matched === true ? "✓" : item.matched === false ? "?" : "·"} ${item.anchor}`;
      trace.append(pill);
    }
    elements.workbenchValidation.append(trace);
  }

  async function startRun() {
    if (!state.plan || !elements.workbenchConfirmPaid.checked) return;
    elements.workbenchStart.disabled = true;
    try {
      const run = await api.startPrompt({ planHash: state.plan.planHash, confirmed: true });
      state.runId = run.runId;
      state.selectedProjectId = null;
      elements.workbenchProjectList.value = "";
      elements.workbenchProjectName.value = selectedTemplate() ? `${templateDisplay(selectedTemplate()).title} · ${new Date().toLocaleString()}` : "";
      elements.workbenchProjectNotes.value = "";
      elements.workbenchSaveProject.disabled = true;
      elements.workbenchExportProject.disabled = true;
      elements.workbenchDeleteProject.disabled = true;
      state.output = "";
      elements.workbenchOutput.textContent = "";
      renderValidation(null);
      elements.workbenchCancelRun.classList.remove("hidden");
      setRunStatus(t("running"), "running");
      setWorkbenchStep("result");
      pollRun();
    } catch (error) { setRunStatus(error.message || t("failed"), "error"); }
  }

  function stopPolling() {
    clearTimeout(state.polling);
    state.polling = null;
  }

  async function pollRun() {
    stopPolling();
    if (!state.runId) return;
    try {
      const run = await api.promptStatus(state.runId);
      if (run.state === "running") { state.polling = setTimeout(pollRun, POLL_MS); return; }
      elements.workbenchCancelRun.classList.add("hidden");
      if (run.state === "completed") {
        state.output = run.output || "";
        elements.workbenchOutput.textContent = state.output;
        elements.workbenchCopyResult.disabled = !state.output;
        elements.workbenchSaveProject.disabled = !state.output;
        renderValidation(run.validation);
        setRunStatus(`${t("completed")} · ${run.providerLabel} · ${run.receipt?.durationMs ?? "—"} ms`, "success");
      } else if (run.state === "cancel_requested") {
        setRunStatus(run.cancellationMessage || t("cancelRequested"), "warning");
      } else {
        setRunStatus(`${t("failed")}: ${run.error?.message || run.error?.code || "unknown"}`, "error");
      }
    } catch (error) { setRunStatus(error.message || t("failed"), "error"); }
  }

  async function cancelRun() {
    if (!state.runId) return;
    try {
      const run = await api.cancelPrompt(state.runId);
      setRunStatus(run.cancellationMessage || t("cancelRequested"), "warning");
      elements.workbenchCancelRun.disabled = true;
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function copyResult() {
    if (!state.output) return;
    try {
      await api.copyText(state.output);
      const original = t("copy");
      elements.workbenchCopyResult.textContent = t("copied");
      elements.workbenchCopyResult.classList.add("is-copied");
      setTimeout(() => { elements.workbenchCopyResult.textContent = original; elements.workbenchCopyResult.classList.remove("is-copied"); }, COPY_RESET_MS);
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function renderLocale() {
    elements.openPromptWorkbench.textContent = t("launch");
    elements.workbenchKicker.textContent = t("kicker"); elements.workbenchTitle.textContent = t("title"); elements.workbenchSubtitle.textContent = t("subtitle");
    elements.workbenchIntentTitle.textContent = t("goal"); elements.workbenchIntentLabel.textContent = t("goalLabel"); elements.workbenchRoute.textContent = t("route");
    elements.workbenchTemplateLabel.textContent = t("template"); elements.workbenchProviderTitle.textContent = t("provider");
    elements.openApiSettingsLabel.textContent = t("apiSettings"); elements.apiSettingsTitle.textContent = t("apiSettingsTitle"); elements.apiSettingsSubtitle.textContent = t("apiSettingsSubtitle"); elements.doneApiSettings.textContent = t("apiSettingsDone"); elements.apiSettingsFooterNote.textContent = t("apiSettingsFooter");
    const registrations = elements.workbenchProviderCards.parentElement.querySelectorAll("[data-provider-registration]");
    registrations[0].textContent = t("registerSeedance"); registrations[1].textContent = t("registerWorkshop");
    elements.workbenchCredentialNote.textContent = t("credentialNote"); elements.workbenchApiKeyLabel.textContent = t("apiKey"); elements.workbenchRememberLabel.textContent = t("remember");
    elements.workbenchSaveKey.textContent = t("saveKey"); elements.workbenchClearKey.textContent = t("clearKey"); elements.workbenchRegisterSelected.textContent = t("registerSelected");
    elements.localQwenCardTitle.textContent = t("localCard"); elements.localQwenCardSubtitle.textContent = t("localCardNote"); elements.localQwenTitle.textContent = t("localTitle"); elements.localQwenNote.textContent = t("localNote");
    elements.localQwenDirectoryLabel.textContent = t("localDirectory"); elements.localQwenPickDirectory.textContent = t("localPickDirectory"); elements.localQwenModelLabel.textContent = t("localModel");
    elements.localQwenRuntimeLabel.textContent = t("localRuntime"); elements.localQwenPickRuntime.textContent = t("localPickRuntime"); elements.localQwenFfmpegLabel.textContent = t("localFfmpeg"); elements.localQwenPickFfmpeg.textContent = t("localPickFfmpeg");
    elements.localQwenContextLabel.textContent = t("localContext"); elements.localQwenMaxTokensLabel.textContent = t("localMaxTokens"); elements.localQwenThinkLabel.textContent = t("localThink"); elements.localQwenReasoningLabel.textContent = t("localReasoning"); elements.localQwenVideoFpsLabel.textContent = t("localVideoFps"); elements.localQwenUnloadLabel.textContent = t("localUnload");
    elements.localQwenSave.textContent = t("localSave"); elements.localQwenVerify.textContent = t("localVerify"); elements.localQwenRelease.textContent = t("localRelease");
    elements.localQwenThink.querySelector('[value="off"]').textContent = locale() === "en" ? "Off (recommended)" : "关闭（推荐）";
    elements.localQwenThink.querySelector('[value="on"]').textContent = locale() === "en" ? "On" : "开启";
    elements.localQwenModel.querySelector('[value="Qwen3.8-27B-Q4_K_M.gguf"]').textContent = locale() === "en" ? "Qwen3.8-27B Q4_K_M (official, recommended)" : "Qwen3.8-27B Q4_K_M（官方，推荐）";
    elements.localQwenContext.querySelector('[value="32768"]').textContent = locale() === "en" ? "32K (recommended)" : "32K（推荐）";
    elements.localQwenMaxTokens.querySelector('[value="512"]').textContent = locale() === "en" ? "512 (short output)" : "512（短输出）";
    elements.localQwenMaxTokens.querySelector('[value="4096"]').textContent = locale() === "en" ? "4096 (node default)" : "4096（节点默认）";
    elements.localQwenUnload.querySelector('[value="after_run"]').textContent = locale() === "en" ? "Unload after run (recommended)" : "执行后卸载（推荐）";
    elements.localQwenUnload.querySelector('[value="keep_warm"]').textContent = locale() === "en" ? "Keep loaded" : "保持驻留";
    elements.localQwenUnload.querySelector('[value="idle_10m"]').textContent = locale() === "en" ? "Unload after 10 idle minutes" : "空闲10分钟后卸载";
    elements.workbenchPlanTitle.textContent = t("targetSection"); elements.workbenchTargetLabel.textContent = t("target"); elements.workbenchDurationLabel.textContent = t("duration");
    elements.workbenchOutputLanguageLabel.textContent = t("outputLanguage"); elements.workbenchOutputLanguageZh.textContent = t("languageChinese"); elements.workbenchOutputLanguageEn.textContent = t("languageEnglish");
    elements.workbenchModeLabel.textContent = t("mode"); elements.workbenchModelLabel.textContent = t("model"); elements.workbenchBaseUrlLabel.textContent = t("baseUrl");
    elements.workbenchConstraintsLabel.textContent = t("constraints"); elements.workbenchPreflight.textContent = t("preflight"); elements.workbenchConfirmLabel.textContent = t("confirm");
    elements.workbenchStart.textContent = t("start"); elements.workbenchCancelRun.textContent = t("cancel"); elements.workbenchResultTitle.textContent = t("result"); elements.workbenchCopyResult.textContent = t("copy");
    elements.workbenchMediaTitle.textContent = t("mediaTitle"); elements.workbenchAddMedia.textContent = t("addMedia"); elements.workbenchClearMedia.textContent = t("clearMedia"); elements.workbenchMediaNote.textContent = t("mediaNote");
    elements.workbenchProjectTitle.textContent = t("projectTitle"); elements.workbenchProjectNameLabel.textContent = t("projectName"); elements.workbenchProjectListLabel.textContent = t("projectList"); elements.workbenchProjectNotesLabel.textContent = t("projectNotes");
    elements.workbenchPreviewHeading.textContent = t("previewTitle");
    elements.workbenchSaveProject.textContent = t("saveProject"); elements.workbenchExportProject.textContent = t("exportProject"); elements.workbenchDeleteProject.textContent = t("deleteProject");
    elements.closePromptWorkbench.setAttribute("aria-label", t("close"));
    const selected = elements.workbenchTemplate.value;
    state.templates = buildTemplates(state.catalog || { cases: [], communitySkills: [] });
    populateTemplates(selected);
    renderProviders();
    renderMedia();
    renderProjects();
    renderTemplatePreview();
    renderWorkbenchSteps();
  }

  async function openApiSettings() {
    await refreshProviders();
    renderLocale();
    if (!elements.apiSettingsDialog.open) elements.apiSettingsDialog.showModal();
    elements.workbenchProviderCards.querySelector('[data-provider-id="' + state.providerId + '"]')?.focus();
  }

  function closeApiSettings() {
    elements.workbenchApiKey.value = "";
    if (elements.apiSettingsDialog.open) elements.apiSettingsDialog.close();
  }

  async function openWorkbench() {
    if (!state.catalog) {
      state.catalog = await api.loadCatalog();
      state.templates = buildTemplates(state.catalog);
      populateTemplates();
    }
    await refreshProviders();
    state.media = await api.promptMediaList();
    await refreshProjects();
    renderLocale();
    setWorkbenchStep("goal");
    elements.promptWorkbenchDialog.showModal();
    elements.workbenchIntent.focus();
  }

  function closeWorkbench() {
    stopPolling();
    elements.workbenchApiKey.value = "";
    closeApiSettings();
    if (elements.promptWorkbenchDialog.open) elements.promptWorkbenchDialog.close();
  }

  elements.openPromptWorkbench.addEventListener("click", () => void openWorkbench());
  elements.openApiSettings.addEventListener("click", () => void openApiSettings());
  elements.closeApiSettings.addEventListener("click", closeApiSettings);
  elements.doneApiSettings.addEventListener("click", closeApiSettings);
  elements.apiSettingsDialog.addEventListener("cancel", (event) => { event.preventDefault(); closeApiSettings(); });
  elements.apiSettingsDialog.addEventListener("click", (event) => { if (event.target === elements.apiSettingsDialog) closeApiSettings(); });
  elements.closePromptWorkbench.addEventListener("click", closeWorkbench);
  elements.promptWorkbenchDialog.addEventListener("cancel", (event) => { event.preventDefault(); closeWorkbench(); });
  elements.promptWorkbenchDialog.addEventListener("click", (event) => { if (event.target === elements.promptWorkbenchDialog) closeWorkbench(); });
  elements.workbenchRoute.addEventListener("click", renderRouterResults);
  elements.workbenchTemplate.addEventListener("change", renderTemplateSummary);
  elements.workbenchStepNav.addEventListener("click", (event) => { const button = event.target.closest("[data-workbench-step]"); if (button) setWorkbenchStep(button.dataset.workbenchStep); });
  elements.workbenchStepNav.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") setWorkbenchStep(WORKBENCH_STEPS[0], true);
    else if (event.key === "End") setWorkbenchStep(WORKBENCH_STEPS.at(-1), true);
    else moveWorkbenchStep(event.key === "ArrowRight" ? 1 : -1);
  });
  elements.workbenchPrevStep.addEventListener("click", () => moveWorkbenchStep(-1));
  elements.workbenchNextStep.addEventListener("click", () => moveWorkbenchStep(1));
  elements.workbenchProviderCards.addEventListener("click", (event) => { const button = event.target.closest("[data-provider-id]"); if (button) selectProvider(button.dataset.providerId); });
  for (const button of document.querySelectorAll("[data-provider-registration]")) button.addEventListener("click", () => void openRegistration(button.dataset.providerRegistration));
  elements.workbenchRegisterSelected.addEventListener("click", () => void openRegistration(state.providerId));
  elements.workbenchSaveKey.addEventListener("click", () => void saveCredential());
  elements.workbenchClearKey.addEventListener("click", () => void clearCredential());
  elements.localQwenPickDirectory.addEventListener("click", () => void pickLocalModelDirectory());
  elements.localQwenPickRuntime.addEventListener("click", () => void pickLocalRuntime());
  elements.localQwenPickFfmpeg.addEventListener("click", () => void pickLocalFfmpeg());
  elements.localQwenSave.addEventListener("click", () => void saveLocalQwen());
  elements.localQwenVerify.addEventListener("click", () => void verifyLocalQwen());
  elements.localQwenRelease.addEventListener("click", () => void releaseLocalQwen());
  elements.workbenchModel.addEventListener("input", storeCurrentProviderOptions);
  elements.workbenchBaseUrl.addEventListener("input", storeCurrentProviderOptions);
  window.addEventListener("t8:workbench-capability-change", renderProviders);
  for (const element of [elements.workbenchIntent, elements.workbenchTarget, elements.workbenchOutputLanguage, elements.workbenchDuration, elements.workbenchMode, elements.workbenchConstraints]) {
    element.addEventListener("input", invalidatePlan);
    element.addEventListener("change", invalidatePlan);
  }
  elements.workbenchAddMedia.addEventListener("click", () => void pickMedia());
  elements.workbenchClearMedia.addEventListener("click", () => void clearMedia());
  elements.workbenchProjectList.addEventListener("change", () => void loadProject());
  elements.workbenchSaveProject.addEventListener("click", () => void saveProject());
  elements.workbenchExportProject.addEventListener("click", () => void exportProject());
  elements.workbenchDeleteProject.addEventListener("click", () => void deleteProject());
  elements.workbenchPreflight.addEventListener("click", () => void preflight());
  elements.workbenchConfirmPaid.addEventListener("change", () => { elements.workbenchStart.disabled = !state.plan || !elements.workbenchConfirmPaid.checked; });
  elements.workbenchStart.addEventListener("click", () => void startRun());
  elements.workbenchCancelRun.addEventListener("click", () => void cancelRun());
  elements.workbenchCopyResult.addEventListener("click", () => void copyResult());

  new MutationObserver(() => renderLocale()).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  renderLocale();

  window.T8PromptWorkbench = Object.freeze({
    routeTemplates: (intent) => routeTemplates(intent).map((result) => ({ id: result.item.id, templateId: templateKey(result.item), score: result.score, reasons: result.reasons })),
    open: openWorkbench
  });
})();
