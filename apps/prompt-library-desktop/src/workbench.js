(() => {
  "use strict";

  const api = window.promptLibrary;
  const elements = Object.fromEntries([
    "open-prompt-workbench", "prompt-workbench-dialog", "close-prompt-workbench", "open-api-settings", "open-api-settings-label", "workbench-api-settings-status", "api-settings-dialog", "api-settings-title", "api-settings-subtitle", "close-api-settings", "done-api-settings", "api-settings-footer-note", "workbench-kicker", "workbench-title",
    "workbench-subtitle", "workbench-intent-title", "workbench-intent-label", "workbench-intent", "workbench-route",
    "workbench-router-results", "workbench-template-label", "workbench-template", "workbench-template-summary",
    "workbench-step-nav", "workbench-prev-step", "workbench-next-step", "workbench-step-progress", "workbench-setup-status", "workbench-setup-status-message", "workbench-setup-status-action",
    "workbench-preview-heading", "workbench-preview-badge", "workbench-preview-media", "workbench-preview-image",
    "workbench-preview-placeholder", "workbench-preview-kind", "workbench-preview-models", "workbench-preview-title",
    "workbench-preview-summary", "workbench-preview-anchors-label", "workbench-preview-anchors", "workbench-preview-template-id",
    "workbench-provider-title", "workbench-provider-readiness", "workbench-provider-cards", "provider-registration-row", "workbench-credential-panel",
    "workbench-credential-title", "workbench-credential-note", "workbench-api-key-label", "workbench-api-key",
    "workbench-remember-key", "workbench-remember-label", "workbench-save-key", "workbench-clear-key",
    "workbench-register-selected", "workbench-plan-title", "workbench-current-provider-label", "workbench-current-provider", "workbench-current-provider-state", "workbench-change-provider", "workbench-target-label", "workbench-target", "workbench-output-language-label", "workbench-output-language", "workbench-output-language-zh", "workbench-output-language-en",
    "workbench-duration-label", "workbench-duration", "workbench-custom-duration-field", "workbench-custom-duration-label", "workbench-custom-duration", "workbench-mode-label", "workbench-mode", "workbench-model-field",
    "workbench-model-label", "workbench-model", "workbench-base-url-field", "workbench-base-url-label", "workbench-base-url",
    "workbench-constraints-label", "workbench-constraints", "workbench-preflight", "workbench-preflight-card",
    "workbench-preflight-facts", "workbench-confirm-paid", "workbench-confirm-label", "workbench-start",
    "workbench-cancel-run", "workbench-result-title", "workbench-copy-result", "workbench-run-status", "workbench-run-status-message", "workbench-run-status-action", "workbench-output", "workbench-generate-again", "workbench-edit-result",
    "workbench-validation", "workbench-media-title", "workbench-add-media", "workbench-clear-media", "workbench-media-note",
    "workbench-media-list", "workbench-advanced-settings", "workbench-advanced-title", "workbench-advanced-note", "workbench-creative-preferences-title", "workbench-manual-shots", "workbench-manual-shots-title", "workbench-manual-shots-note", "workbench-shot-plan-panel", "workbench-shot-plan-title", "workbench-shot-plan-note", "workbench-ai-shot-plan", "workbench-add-shot", "workbench-auto-time-shots", "workbench-shot-list", "workbench-shot-validation",
    "workbench-manual-continuity", "workbench-manual-continuity-title", "workbench-manual-continuity-note", "workbench-continuity-panel", "workbench-continuity-title", "workbench-continuity-note", "workbench-add-continuity", "workbench-continuity-list", "workbench-professional-tools", "workbench-professional-title", "workbench-professional-note", "workbench-professional-status", "workbench-project-title", "workbench-project-name-label", "workbench-project-name",
    "workbench-project-topic-label", "workbench-project-topic", "workbench-project-list-label", "workbench-project-list", "workbench-project-notes-label", "workbench-project-notes",
    "workbench-revision-label", "workbench-revision-list", "workbench-validate-edit", "workbench-save-revision", "workbench-accept-revision", "workbench-override-revision", "workbench-reject-revision",
    "workbench-save-project", "workbench-export-project", "workbench-delete-project",
    "workbench-iteration-title", "workbench-repair-quota", "workbench-repair-label", "workbench-repair-instructions", "workbench-preflight-repair", "workbench-comparison-picker", "workbench-compare-revisions", "workbench-comparison-output", "workbench-acceptance-actions",
    "workbench-review-title", "workbench-review-status", "workbench-import-result", "workbench-save-review", "workbench-result-video", "workbench-review-dimension", "workbench-review-observation-status", "workbench-review-time", "workbench-review-shot", "workbench-review-note", "workbench-add-observation", "workbench-observation-list", "workbench-repair-brief",
    "workbench-composition-title", "workbench-composition-status", "workbench-secondary-template", "workbench-secondary-role", "workbench-composition-resolution", "workbench-compose", "workbench-composition-output",
    "workbench-delivery-title", "workbench-delivery-status", "workbench-video-music-bridge", "workbench-apply-music-bridge", "workbench-music-project", "workbench-music-video-bridge", "workbench-export-handoff", "workbench-export-skill", "workbench-bridge-output",
    "workbench-board-title", "workbench-board-status", "workbench-board-stage", "workbench-board-sort", "workbench-board-target", "workbench-board-template", "workbench-board-failure", "workbench-current-stage", "workbench-save-stage", "workbench-rating", "workbench-save-rating", "workbench-refresh-board", "workbench-template-proposal", "workbench-board-output", "workbench-effects-output",
    "workbench-local-qwen-panel", "local-qwen-card-title", "local-qwen-card-subtitle", "local-qwen-title", "local-qwen-note", "local-qwen-readiness",
    "local-qwen-directory-label", "local-qwen-directory", "local-qwen-pick-directory", "local-qwen-model-label", "local-qwen-model", "local-qwen-projector-label", "local-qwen-projector",
    "local-qwen-runtime-label", "local-qwen-runtime", "local-qwen-pick-runtime", "local-qwen-ffmpeg-label", "local-qwen-ffmpeg", "local-qwen-pick-ffmpeg",
    "local-qwen-context-label", "local-qwen-context", "local-qwen-max-tokens-label", "local-qwen-max-tokens", "local-qwen-think-label", "local-qwen-think",
    "local-qwen-reasoning-label", "local-qwen-reasoning", "local-qwen-video-fps-label", "local-qwen-video-fps", "local-qwen-unload-label", "local-qwen-unload",
    "local-qwen-file-status", "local-qwen-save", "local-qwen-rescan", "local-qwen-verify", "local-qwen-release"
  ].map((id) => [id.replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase()), document.getElementById(id)]));

  const COPY_RESET_MS = 1600;
  const POLL_MS = 650;
  const WORKBENCH_STEPS = Object.freeze(["goal", "target", "result"]);
  const PROVIDER_FALLBACKS = Object.freeze({
    seedance_nz: { label: "贞贞的平价小屋", registrationUrl: "https://api.seedance.nz/sign-up?aff=5f4w", defaultModel: "bytedance/doubao-seed-evolving", configurableEndpoint: false, configurableModel: false },
    t8star_workshop: { label: "贞贞的 AI 工坊", registrationUrl: "https://ai.t8star.org/register?aff=dP7j", defaultModel: "gemini-3.5-flash", configurableEndpoint: false, configurableModel: true },
    openai_compatible: { label: "OpenAI 兼容接口", registrationUrl: null, defaultModel: "", configurableEndpoint: true, configurableModel: true },
    local_qwen: { label: "本地 GGUF", registrationUrl: null, defaultModel: "Qwen3.8-27B-Q4_K_M.gguf", configurableEndpoint: false, configurableModel: true, local: true, requiresCredential: false }
  });

  const COPY = {
    "zh-CN": {
      launch: "✦ API 增强工作台", kicker: "T8 实例化工作台", title: "提示词实例化与 API 增强",
      subtitle: "先选机制，再补齐结构，最后由你确认一次付费调用。", goal: "你想做什么？", goalLabel: "创作目标与必须保留的事实",
      route: "AI 推荐模板（最多 2 次调用）", template: "选定模板 / Skill", provider: "选择增强渠道", loading: "正在读取…", ready: "已配置",
      missing: "未配置", registerSeedance: "注册平价小屋 API ↗", registerWorkshop: "注册 AI 工坊 API ↗", credential: "配置 API Key",
      credentialNote: "Key 只进入 Electron 主进程；可仅本次会话使用，或由系统安全存储加密保存。", apiKey: "API Key",
      remember: "使用系统安全存储记住", saveKey: "保存并使用", clearKey: "清除 Key", registerSelected: "没有 Key？立即注册 ↗",
      targetSection: "目标与硬约束", target: "目标模型", outputLanguage: "输出语言", languageChinese: "中文（默认）", languageEnglish: "English", duration: "时长", mode: "改写强度", model: "模型 ID",
      baseUrl: "OpenAI 兼容 Base URL", constraints: "补充要求（可选）", preflight: "生成提示词", confirm: "我确认：提交1次对话请求；平价小屋还会按素材数上传。费用未知，全部不自动重试。",
      start: "确认并开始增强", cancel: "请求取消", result: "生成结果", copy: "复制结果", copied: "✓ 已复制",
      idle: "尚未运行", routingEmpty: "请先写清楚创作目标。", noMatch: "AI 没有找到可靠匹配，不会用无关模板凑数。",
      routingNeedsProvider: "请先在右上角 API 设置中配置云端 API 或本地 Qwen。", routingBusy: "正在用当前渠道理解需求并复排全部模板…", routingCoverage: (examined, indexed, reranked) => `已检查 ${examined}/${indexed} 个模板，AI 精排 ${reranked} 个候选`,
      why: "匹配依据", anchors: "必需锚点", mechanism: "核心机制", configuredCount: (count) => `${count}/3 个云端渠道已配置`, providerReadiness: (count, local) => `${count}/3 个云端渠道已配置 · 本地${local}`,
      keySaved: "Key 已安全保存；输入框已清空。", keyCleared: "Key 已清除。", keyMissing: "请先配置当前渠道的 API Key。",
      preflightReady: "确认单已生成；修改任意字段后需重新预检。", running: "正在增强，请勿重复提交…", completed: "增强完成",
      failed: "增强失败", cancelRequested: "已请求取消；远端完成与计费状态可能未知。", validationPass: "静态机制检查通过",
      validationWarning: "已生成，但存在需要人工检查的项目", validationFail: "输出未通过静态检查", noDeterministicAnchor: "锚点无法完全由文本规则确定，请人工核对。",
      endpoint: "请求域名", plannedCalls: "计划调用", cost: "费用", costUnknown: "未知", credentialSource: "Key 来源", callOnce: "1 次，无自动重试",
      planExpired: "确认单已失效，请重新预检。", selectTemplate: "请选择模板", routerSelect: "使用这个模板", close: "关闭工作台",
      mediaTitle: "参考图片 / 视频（可选）", addMedia: "添加素材", clearMedia: "清空", mediaNote: "有参考素材就添加，没有也可以直接生成。图片最多9张、视频最多3个。", noMedia: "没有参考素材也可以直接生成", mediaFact: "参考素材", uploadsFact: "额外上传",
      projectTitle: "实验项目与复盘", projectName: "项目名称", projectList: "已保存项目", projectNotes: "人工复盘备注", saveProject: "保存实验项目", projectSaved: "实验项目已保存", exportProject: "导出 JSON + Markdown", projectExported: "项目已导出", deleteProject: "删除项目", projectDeleted: "项目已删除", noProjects: "暂无项目",
      stepsLabel: "工作台步骤", stepGoal: "告诉我想做什么", stepGoalHint: "描述目标", stepTarget: "确认生成方式", stepTargetHint: "模型、时长和素材", stepResult: "拿到提示词", stepResultHint: "复制或修改", previous: "上一步", nextStep: (label) => "下一步：" + label, stepProgress: (current, total) => "第 " + current + " / " + total + " 步", previewTitle: "当前模板预览", previewGif: "GIF 动态预览", previewPoster: "静态预览", previewUnavailable: "该模板暂无可用预览", previewLoading: "正在加载预览…", previewAnchors: "关键锚点", previewCase: "案例模板", previewCommunity: "非官方 Skill", apiSettings: "API 设置", apiSettingsTitle: "API 设置", apiSettingsSubtitle: "选择要实际使用的云端 API 或本地 GGUF 渠道。", apiSettingsDone: "使用此渠道并完成", apiSettingsFooter: "只有明确完成后才会更改默认渠道；Key 由系统安全存储管理。", providerCurrent: "当前渠道",
      localCard: "本地 GGUF", localCardNote: "llama.cpp / Qwen · 无需 API Key", localTitle: "配置本地 GGUF", localNote: "递归扫描模型目录；已实测型号会标为已验收，其他 llama.cpp 兼容 GGUF 会标为用户模型。", localMissing: "未配置", localTextReady: "仅文字可用", localVisionReady: "图片可用", localVideoReady: "图片与视频可用", localDirectory: "GGUF 根目录", localPickDirectory: "选择目录", localModel: "本地模型", localProjector: "视觉投影器", localProjectorAuto: "AUTO（自动匹配）", localRuntime: "llama-server 运行文件", localPickRuntime: "选择运行文件", localFfmpeg: "FFmpeg（仅本地视频需要）", localPickFfmpeg: "选择 FFmpeg", localContext: "上下文", localMaxTokens: "最大输出", localThink: "思考模式", localReasoning: "推理强度", localVideoFps: "视频采样率", localUnload: "显存策略", localSave: "保存设置", localRescan: "扫描 GGUF", localVerify: "完整校验", localRelease: "释放模型", localSaved: "本地设置已保存。", localScanned: "GGUF 目录已重新扫描。", localVerified: "本地模型完整校验通过。", localReleased: "本地模型已释放。", localVerifying: "正在逐个校验大文件，请勿关闭应用…", localComputeConfirm: "我确认：仅使用本机算力，不调用外部 API、不上传素材、不产生 API 费用。", localComputeStart: "开始本地增强", localComputeCalls: "1 次本地推理，无网络请求", localRuntimeSource: "本机运行时"
    },
    en: {
      launch: "✦ API Workbench", kicker: "T8 INSTANCE WORKBENCH", title: "Prompt instantiation and API enhancement",
      subtitle: "Choose a mechanism, complete its structure, then explicitly confirm one paid call.", goal: "What do you want to create?", goalLabel: "Creative goal and facts that must remain",
      route: "AI recommendations (up to 2 calls)", template: "Selected template / Skill", provider: "Enhancement provider", loading: "Loading…", ready: "Configured",
      missing: "Not configured", registerSeedance: "Register Seedance API ↗", registerWorkshop: "Register AI Workshop API ↗", credential: "Configure API key",
      credentialNote: "The key enters Electron Main only. Keep it for this session or encrypt it with the operating system secure store.", apiKey: "API key",
      remember: "Remember with OS secure storage", saveKey: "Save and use", clearKey: "Clear key", registerSelected: "Need a key? Register ↗",
      targetSection: "Target and hard constraints", target: "Target model", outputLanguage: "Output language", languageChinese: "Chinese (default)", languageEnglish: "English", duration: "Duration", mode: "Rewrite strength", model: "Model ID",
      baseUrl: "OpenAI-compatible Base URL", constraints: "Additional requirements (optional)", preflight: "Generate prompt", confirm: "I confirm one chat request; Seedance adds one upload per media item. Cost is unknown and no request is automatically retried.",
      start: "Confirm and enhance", cancel: "Request cancellation", result: "Generated result", copy: "Copy result", copied: "✓ Copied",
      idle: "Not started", routingEmpty: "Describe the creative goal first.", noMatch: "AI found no reliable match and will not pad the list with unrelated templates.",
      routingNeedsProvider: "Configure a cloud API or local Qwen in API settings first.", routingBusy: "The current provider is interpreting the brief and reranking the complete template index…", routingCoverage: (examined, indexed, reranked) => `Checked ${examined}/${indexed} templates; AI reranked ${reranked} candidates`,
      why: "Why it matches", anchors: "Required anchors", mechanism: "Core mechanism", configuredCount: (count) => `${count}/3 cloud providers configured`, providerReadiness: (count, local) => `${count}/3 cloud providers configured · local ${local}`,
      keySaved: "Key saved securely; the input has been cleared.", keyCleared: "Key cleared.", keyMissing: "Configure the current provider key first.",
      preflightReady: "Confirmation created. Any field change requires a new preflight.", running: "Enhancing; duplicate submission is blocked…", completed: "Enhancement completed",
      failed: "Enhancement failed", cancelRequested: "Cancellation requested; remote completion and billing may be unknown.", validationPass: "Static mechanism checks passed",
      validationWarning: "Generated with items requiring human review", validationFail: "Output failed static checks", noDeterministicAnchor: "Some anchors require human review.",
      endpoint: "Endpoint host", plannedCalls: "Planned calls", cost: "Cost", costUnknown: "Unknown", credentialSource: "Key source", callOnce: "1 request, no automatic retry",
      planExpired: "Confirmation expired. Run preflight again.", selectTemplate: "Select a template", routerSelect: "Use this template", close: "Close workbench",
      mediaTitle: "Reference images / videos (optional)", addMedia: "Add media", clearMedia: "Clear", mediaNote: "Add references if you have them, or generate without any. Up to 9 images and 3 videos.", noMedia: "You can generate without reference media", mediaFact: "Reference media", uploadsFact: "Extra uploads",
      projectTitle: "Experiment project and review", projectName: "Project name", projectList: "Saved projects", projectNotes: "Human review notes", saveProject: "Save experiment", projectSaved: "Experiment saved", exportProject: "Export JSON + Markdown", projectExported: "Project exported", deleteProject: "Delete project", projectDeleted: "Project deleted", noProjects: "No saved projects",
      stepsLabel: "Workbench steps", stepGoal: "Describe your goal", stepGoalHint: "What you want", stepTarget: "Choose how to generate", stepTargetHint: "Model, duration and media", stepResult: "Get your prompt", stepResultHint: "Copy or refine", previous: "Previous", nextStep: (label) => "Next: " + label, stepProgress: (current, total) => "Step " + current + " of " + total, previewTitle: "Current template preview", previewGif: "Animated GIF preview", previewPoster: "Static preview", previewUnavailable: "No preview is available for this template", previewLoading: "Loading preview…", previewAnchors: "Key anchors", previewCase: "Case template", previewCommunity: "Community Skill", apiSettings: "API settings", apiSettingsTitle: "API settings", apiSettingsSubtitle: "Choose the cloud API or local GGUF provider that will actually be used.", apiSettingsDone: "Use provider and finish", apiSettingsFooter: "The default only changes after explicit confirmation. OS secure storage manages API keys.", providerCurrent: "Current provider",
      localCard: "Local GGUF", localCardNote: "llama.cpp / Qwen · no API key", localTitle: "Configure local GGUF", localNote: "The model root is scanned recursively. Tested models are marked validated; other llama.cpp-compatible GGUFs are marked user models.", localMissing: "Not configured", localTextReady: "Text ready", localVisionReady: "Images ready", localVideoReady: "Images and video ready", localDirectory: "GGUF root", localPickDirectory: "Choose folder", localModel: "Local model", localProjector: "Vision projector", localProjectorAuto: "AUTO (match automatically)", localRuntime: "llama-server executable", localPickRuntime: "Choose runtime", localFfmpeg: "FFmpeg (local video only)", localPickFfmpeg: "Choose FFmpeg", localContext: "Context", localMaxTokens: "Max output", localThink: "Thinking", localReasoning: "Reasoning effort", localVideoFps: "Video sample rate", localUnload: "Memory policy", localSave: "Save settings", localRescan: "Scan GGUF", localVerify: "Full verification", localRelease: "Unload model", localSaved: "Local settings saved.", localScanned: "The GGUF folder was rescanned.", localVerified: "Local model verification passed.", localReleased: "Local model unloaded.", localVerifying: "Verifying large files one at a time. Keep the app open…", localComputeConfirm: "I confirm this uses local compute only, calls no external API, uploads no media, and incurs no API fee.", localComputeStart: "Start local enhancement", localComputeCalls: "1 local inference, no network request", localRuntimeSource: "Local runtime"
    }
  };

  const savedDefaultProviderId = PROVIDER_FALLBACKS[localStorage.getItem("t8-workbench-provider")] ? localStorage.getItem("t8-workbench-provider") : "seedance_nz";
  const state = {
    catalog: null,
    templates: [],
    providers: [],
    providerId: savedDefaultProviderId,
    defaultProviderId: savedDefaultProviderId,
    apiSettingsInitialProviderId: null,
    plan: null,
    runId: null,
    polling: null,
    output: "",
    validation: null,
    media: [],
    mediaAssignments: [],
    shots: [],
    continuityLocks: [],
    manualShots: false,
    manualContinuity: false,
    expandedMediaIds: new Set(),
    projects: [],
    selectedProjectId: null,
    currentProject: null,
    pendingOperation: null,
    reviewObservations: [],
    bridge: null,
    composition: null,
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
    if (next) elements.workbenchNextStep.textContent = state.activeStep === "target" ? t("preflight") : t("nextStep")(stepCopy(next).label);
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
      image.onload = () => {
        if (image.dataset.previewRequest !== previewRequest) return;
        image.hidden = false;
        elements.workbenchPreviewPlaceholder.classList.add("hidden");
        elements.workbenchPreviewMedia.dataset.state = "poster";
        image.onload = () => {
          if (image.dataset.previewRequest !== previewRequest) return;
          image.hidden = false;
          elements.workbenchPreviewPlaceholder.classList.add("hidden");
          elements.workbenchPreviewMedia.dataset.state = "ready";
        };
        image.onerror = () => {
          if (image.dataset.previewRequest !== previewRequest) return;
          show(posterUrl, "poster");
        };
        image.src = gifUrl;
      };
      image.onerror = () => {
        if (image.dataset.previewRequest !== previewRequest) return;
        show(gifUrl, "ready");
      };
      image.src = posterUrl;
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

  function currentIntelligenceConfig() {
    const provider = providerConfig();
    const preferences = activeProviderPreferences()[state.providerId] || {};
    return {
      providerId: state.providerId,
      model: (elements.workbenchModel.value || preferences.model || provider?.defaultModel || "").slice(0, 160),
      baseUrl: (elements.workbenchBaseUrl.value || preferences.baseUrl || "").slice(0, 2048),
      locale: locale(),
      confirmed: true
    };
  }

  async function renderRouterResults() {
    const intent = elements.workbenchIntent.value.trim();
    elements.workbenchRouterResults.replaceChildren();
    if (!intent) { elements.workbenchRouterResults.textContent = t("routingEmpty"); return; }
    if (!providerReady()) {
      elements.workbenchRouterResults.textContent = t("routingNeedsProvider");
      openApiSettings();
      return;
    }
    elements.workbenchRoute.disabled = true;
    elements.workbenchRouterResults.textContent = t("routingBusy");
    try {
      const execution = await api.routePromptTemplates({ intent, durationSeconds: effectiveDuration(), ...currentIntelligenceConfig() });
      const resultSet = execution?.result || {};
      const results = Array.isArray(resultSet.recommendations) ? resultSet.recommendations : [];
      elements.workbenchRouterResults.replaceChildren();
      const coverage = resultSet.coverage;
      if (coverage) {
        const note = document.createElement("p");
        note.className = "router-coverage";
        note.textContent = `${execution.providerLabel} · ${execution.model} · ${t("routingCoverage")(coverage.examined, coverage.indexed, coverage.reranked)}`;
        elements.workbenchRouterResults.append(note);
      }
      if (!results.length) {
        const empty = document.createElement("p");
        empty.textContent = resultSet.clarification || t("noMatch");
        elements.workbenchRouterResults.append(empty);
        return;
      }
      for (const result of results.slice(0, 3)) {
        const item = state.templates.find((candidate) => templateKey(candidate) === result.templateId);
        if (!item) continue;
        const display = templateDisplay(item);
        const card = document.createElement("article");
        card.className = "router-card";
        const title = document.createElement("strong");
        title.textContent = `${result.score} · ${display.title}`;
        const summary = document.createElement("p");
        summary.textContent = display.summary;
        const reason = document.createElement("small");
        const why = (result.reasons || []).join(" · ");
        const risks = (result.risks || []).join(" · ");
        reason.textContent = `${t("why")}: ${why}${risks ? ` · ${locale() === "en" ? "Risks" : "风险"}: ${risks}` : ""}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "button copy-secondary";
        button.textContent = t("routerSelect");
        button.addEventListener("click", () => {
          elements.workbenchTemplate.value = templateKey(item);
          renderTemplateSummary();
        });
        card.append(title, summary, reason, button);
        elements.workbenchRouterResults.append(card);
      }
    } catch (error) {
      elements.workbenchRouterResults.textContent = error.message;
    } finally {
      elements.workbenchRoute.disabled = false;
    }
  }

  function providerConfig(id = state.providerId) { return state.providers.find((provider) => provider.id === id) || PROVIDER_FALLBACKS[id]; }

  function providerReady(id = state.providerId) {
    const provider = state.providers.find((item) => item.id === id);
    if (!provider) return false;
    if (id === "local_qwen") return Boolean(provider.localStatus?.textReady || provider.credential?.textReady || provider.credential?.configured);
    return Boolean(provider.credential?.configured);
  }

  function persistDefaultProvider(id = state.providerId) {
    if (!PROVIDER_FALLBACKS[id]) return;
    state.defaultProviderId = id;
    localStorage.setItem("t8-workbench-provider", id);
  }

  function firstReadyProvider() {
    return ["seedance_nz", "t8star_workshop", "openai_compatible", "local_qwen"].find((id) => providerReady(id)) || null;
  }

  function reconcileProvider() {
    if (providerReady(state.defaultProviderId)) state.providerId = state.defaultProviderId;
    else {
      const fallback = firstReadyProvider();
      if (fallback) {
        state.providerId = fallback;
        persistDefaultProvider(fallback);
      } else if (!PROVIDER_FALLBACKS[state.providerId]) state.providerId = "seedance_nz";
    }
  }

  function clearStaleProviderError() {
    if (elements.workbenchRunStatus.dataset.state === "error" || elements.workbenchSetupStatus.dataset.state === "error") setRunStatus("", "idle");
  }

  function localReadinessLabel(status = state.localQwen) {
    if (!status?.textReady) return t("localMissing");
    if (status.videoReady) return t("localVideoReady");
    if (status.visionReady) return t("localVisionReady");
    return t("localTextReady");
  }

  function fileState(item) {
    if (item?.verified && item?.projectValidated) return locale() === "en" ? "verified · project validated" : "已验证 · 项目已验收";
    if (item?.verified) return locale() === "en" ? "integrity verified · compatibility unreviewed" : "完整性已验证 · 兼容性未验收";
    if (item?.sizeMatch) return locale() === "en" ? "awaiting full verification" : "待完整校验";
    if (item?.present) return item?.projectValidated
      ? (locale() === "en" ? "pinned file mismatch" : "已验收文件不匹配")
      : (locale() === "en" ? "awaiting integrity verification" : "待完整性校验");
    return locale() === "en" ? "missing" : "缺失";
  }

  function localModelOptionLabel(item) {
    const label = item.label || item.name || item.identifier;
    if (item.projectValidated) return `${label} · ${locale() === "en" ? "validated" : "已验收"}`;
    return `${label} · ${locale() === "en" ? "user model (unreviewed)" : "用户模型（未验收）"}`;
  }

  function populateLocalGgufOptions(status) {
    const modelOptions = [...(status.modelOptions || [])];
    if (status.modelFilename && !modelOptions.some((item) => item.identifier === status.modelFilename)) {
      modelOptions.unshift({ identifier: status.modelFilename, label: status.modelFilename, projectValidated: false });
    }
    elements.localQwenModel.replaceChildren(...modelOptions.map((item) => {
      const option = document.createElement("option");
      option.value = item.identifier;
      option.textContent = localModelOptionLabel(item);
      return option;
    }));
    elements.localQwenModel.value = status.modelFilename || "Qwen3.8-27B-Q4_K_M.gguf";

    const auto = document.createElement("option");
    auto.value = "AUTO";
    auto.textContent = t("localProjectorAuto");
    const projectorOptions = (status.projectorOptions || []).map((item) => {
      const option = document.createElement("option");
      option.value = item.identifier;
      option.textContent = `${item.label || item.identifier} · ${item.projectValidated
        ? (locale() === "en" ? "validated" : "已验收")
        : (locale() === "en" ? "user projector" : "用户投影器")}`;
      return option;
    });
    elements.localQwenProjector.replaceChildren(auto, ...projectorOptions);
    elements.localQwenProjector.value = status.projectorFilename || "AUTO";
  }

  function renderLocalQwen(status = state.localQwen) {
    if (!status) return;
    elements.localQwenDirectory.value = status.modelDirectory || "";
    elements.localQwenRuntime.value = status.runtimeExecutable || "";
    elements.localQwenFfmpeg.value = status.ffmpegExecutable || "";
    populateLocalGgufOptions(status);
    elements.localQwenContext.value = String(status.contextSize || 32768);
    elements.localQwenMaxTokens.value = String(status.maxTokens || 4096);
    elements.localQwenThink.value = status.thinkMode || "off";
    elements.localQwenReasoning.value = status.reasoningEffort || "medium";
    elements.localQwenVideoFps.value = String(status.videoSampleFps || 2);
    elements.localQwenUnload.value = status.unloadPolicy || "after_run";
    const readiness = localReadinessLabel(status);
    elements.localQwenReadiness.textContent = readiness;
    elements.localQwenReadiness.classList.toggle("ready", Boolean(status.textReady));
    const counts = status.catalogCounts || { models: 0, projectors: 0 };
    elements.localQwenNote.textContent = locale() === "en"
      ? `Recursive scan: ${counts.models} model(s), ${counts.projectors} projector(s). Tested files are labelled validated; other GGUFs remain unreviewed.`
      : `递归扫描到 ${counts.models} 个模型、${counts.projectors} 个投影器；实测文件标为已验收，其他 GGUF 保持未验收标签。`;
    const rows = [
      [locale() === "en" ? "Selected model" : "当前模型", fileState(status.model)],
      [status.resolvedProjectorFilename || (locale() === "en" ? "Vision projector" : "视觉投影器"), status.resolvedProjectorFilename ? fileState(status.mmproj) : (locale() === "en" ? "no automatic match" : "未自动匹配")],
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
    const activeProvider = providerConfig();
    const activeReady = providerReady();
    elements.workbenchApiSettingsStatus.textContent = `${activeProvider.label}${activeReady ? " ✓" : " !"}`;
    elements.workbenchCurrentProvider.textContent = activeProvider.label;
    elements.workbenchCurrentProviderState.textContent = activeReady
      ? (locale() === "en" ? "Ready · this provider will be used for the next generation" : "已就绪 · 下一次生成会使用此渠道")
      : (locale() === "en" ? "Not ready · configure this provider before generating" : "尚未就绪 · 生成前需要完成配置");
    elements.workbenchCurrentProviderState.dataset.state = activeReady ? "ready" : "missing";
    for (const button of elements.workbenchProviderCards.querySelectorAll("[data-provider-id]")) {
      const id = button.dataset.providerId;
      const active = id === state.providerId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      const provider = state.providers.find((item) => item.id === id);
      const status = provider?.credential;
      const label = button.querySelector(`[data-provider-state="${id}"]`);
      const ready = providerReady(id);
      const readiness = id === "local_qwen" ? localReadinessLabel(provider?.localStatus || status) : ready ? `${t("ready")} · ${status.source}` : t("missing");
      label.textContent = `${readiness}${active ? ` · ${locale() === "en" ? "CURRENT" : "当前使用"}` : ""}`;
      label.classList.toggle("ready", ready);
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
    elements.doneApiSettings.disabled = !activeReady;
    if (!music3CapabilityActive()) elements.workbenchSubtitle.textContent = local
      ? (locale() === "en" ? "Choose a mechanism, complete its structure, then enhance it entirely on this device." : "先选机制，再补齐结构，最后完全使用本机模型增强。")
      : t("subtitle");
    if (state.localQwen) renderLocalQwen();
    invalidatePlan();
  }

  async function refreshProviders({ reconcile = false } = {}) {
    try { state.providers = await api.promptProviders(); }
    catch { state.providers = Object.entries(PROVIDER_FALLBACKS).map(([id, provider]) => ({ id, ...provider, credential: { configured: false, source: null } })); }
    if (reconcile) reconcileProvider();
    renderProviders();
  }

  function selectProvider(id, { persist = false, clearError = true } = {}) {
    if (!PROVIDER_FALLBACKS[id]) return;
    state.providerId = id;
    if (persist) persistDefaultProvider(id);
    elements.workbenchModel.dataset.edited = "false";
    renderProviders();
    if (clearError) clearStaleProviderError();
  }

  function commitSelectedProvider() {
    if (!providerReady(state.providerId)) {
      setRunStatus(state.providerId === "local_qwen"
        ? (locale() === "en" ? "Verify the local model before using it." : "请先完整校验本地模型，再使用这个渠道。")
        : (locale() === "en" ? "Save an API key before using this provider." : "请先保存该渠道的 API Key。"), "error");
      return false;
    }
    persistDefaultProvider(state.providerId);
    state.apiSettingsInitialProviderId = state.providerId;
    clearStaleProviderError();
    renderProviders();
    return true;
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
      persistDefaultProvider(state.providerId);
      state.apiSettingsInitialProviderId = state.providerId;
      renderProviders();
      setRunStatus(`${t("keySaved")} ${locale() === "en" ? "This provider is now active." : "已设为当前使用渠道。"}`, "success");
    } catch (error) {
      try { await refreshProviders(); } catch {}
      setRunStatus(error.message, "error");
    }
  }

  async function clearCredential() {
    try {
      await api.clearPromptCredential(state.providerId);
      elements.workbenchApiKey.value = "";
      await refreshProviders({ reconcile: true });
      setRunStatus(t("keyCleared"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function localConfigInput() {
    return {
      modelFilename: elements.localQwenModel.value,
      projectorFilename: elements.localQwenProjector.value,
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

  async function rescanLocalQwen() {
    await applyLocalStatus(api.rescanLocalQwen(), t("localScanned"));
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
      if (providerReady("local_qwen")) {
        state.providerId = "local_qwen";
        persistDefaultProvider("local_qwen");
        state.apiSettingsInitialProviderId = "local_qwen";
        renderProviders();
      }
      setRunStatus(t("localVerified"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
    finally { elements.localQwenVerify.disabled = false; }
  }

  async function releaseLocalQwen() {
    await applyLocalStatus(api.releaseLocalQwen(), t("localReleased"));
  }

  function creatorId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function effectiveDuration() {
    const value = elements.workbenchDuration.value === "custom" ? Number(elements.workbenchCustomDuration.value) : Number(elements.workbenchDuration.value);
    return Number.isFinite(value) && value > 0 ? Number(Math.min(30, value).toFixed(3)) : 15;
  }

  function resetDraftState() {
    state.currentProject = null;
    state.reviewObservations = [];
    state.bridge = null;
    state.composition = null;
    state.plan = null;
    state.pendingOperation = null;
    state.runId = null;
    state.output = "";
    state.validation = null;
    state.shots = [];
    state.mediaAssignments = [];
    state.continuityLocks = [];
    state.manualShots = false;
    state.manualContinuity = false;
    state.expandedMediaIds = new Set();
    elements.workbenchProjectName.value = "";
    elements.workbenchProjectTopic.value = "";
    elements.workbenchProjectNotes.value = "";
    elements.workbenchIntent.value = "";
    elements.workbenchConstraints.value = "";
    elements.workbenchDuration.value = "15";
    elements.workbenchCustomDuration.value = "30";
    elements.workbenchCustomDurationField.classList.add("hidden");
    elements.workbenchMode.value = "balanced";
    elements.workbenchManualShots.checked = false;
    elements.workbenchManualContinuity.checked = false;
    elements.workbenchManualShots.setAttribute("aria-expanded", "false");
    elements.workbenchManualContinuity.setAttribute("aria-expanded", "false");
    elements.workbenchShotPlanPanel.classList.add("hidden");
    elements.workbenchContinuityPanel.classList.add("hidden");
    elements.workbenchAdvancedSettings.open = false;
    elements.workbenchOutput.value = "";
    elements.workbenchCopyResult.disabled = true;
    elements.workbenchSaveProject.disabled = true;
    renderShots();
    renderContinuityLocks();
    renderMedia();
    renderValidation(null);
    renderRevisions(null);
    renderCreatorTools(null);
    invalidatePlan();
  }

  function blankShot(startSeconds = 0, endSeconds = effectiveDuration()) {
    return { shotId: creatorId("shot"), startSeconds, endSeconds, action: "", camera: "", sceneChange: "", sound: "", onScreenText: "", continuity: "" };
  }

  function ensureShots() {
    if (state.shots.length) return;
    const duration = effectiveDuration();
    state.shots = [blankShot(0, duration)];
  }

  function syncAdvancedControls() {
    state.manualShots = elements.workbenchManualShots.checked;
    state.manualContinuity = elements.workbenchManualContinuity.checked;
    elements.workbenchShotPlanPanel.classList.toggle("hidden", !state.manualShots);
    elements.workbenchContinuityPanel.classList.toggle("hidden", !state.manualContinuity);
    elements.workbenchManualShots.setAttribute("aria-expanded", String(state.manualShots));
    elements.workbenchManualContinuity.setAttribute("aria-expanded", String(state.manualContinuity));
    if (state.manualShots) ensureShots();
    renderShots();
    renderContinuityLocks();
    invalidatePlan();
  }

  function creatorField(label, value, onInput, { type = "text", rows = 0, min = null, step = null } = {}) {
    const wrapper = document.createElement("label");
    const span = document.createElement("span"); span.textContent = label;
    const control = rows ? document.createElement("textarea") : document.createElement("input");
    if (!rows) control.type = type;
    if (rows) control.rows = rows;
    if (min !== null) control.min = String(min);
    if (step !== null) control.step = String(step);
    control.value = value ?? "";
    control.addEventListener("input", () => onInput(control.value));
    wrapper.append(span, control);
    return wrapper;
  }

  function validateShotsClient() {
    if (!state.manualShots) {
      elements.workbenchShotValidation.dataset.state = "auto";
      elements.workbenchShotValidation.textContent = locale() === "en" ? "Automatic shot planning is active." : "已启用自动分镜，无需填写镜头表。";
      return true;
    }
    const duration = effectiveDuration();
    const sorted = [...state.shots].sort((a, b) => a.startSeconds - b.startSeconds || a.endSeconds - b.endSeconds);
    const issues = [];
    const warnings = [];
    if (!sorted.length) issues.push(locale() === "en" ? "Add at least one shot." : "至少添加一个镜头。");
    sorted.forEach((shot, index) => {
      if (shot.startSeconds < 0 || shot.endSeconds <= shot.startSeconds) issues.push(`${shot.shotId}: ${locale() === "en" ? "invalid time range" : "时间范围无效"}`);
      if (shot.endSeconds > duration + 0.001) issues.push(`${shot.shotId}: ${locale() === "en" ? "ends after total duration" : "超过总时长"}`);
      if (index === 0 && Math.abs(shot.startSeconds) > 0.001) issues.push(locale() === "en" ? "The first shot must start at 0." : "第一个镜头必须从 0 秒开始。");
      if (index > 0 && Math.abs(shot.startSeconds - sorted[index - 1].endSeconds) > 0.001) issues.push(locale() === "en" ? "Shots must be consecutive without gaps or overlaps." : "镜头时间必须连续，不能留空或重叠。");
    });
    if (sorted.length && Math.abs(sorted.at(-1).endSeconds - duration) > 0.001) issues.push(locale() === "en" ? "The final shot must end at the total duration." : "最后一个镜头必须结束于总时长。");
    if (duration && sorted.length / duration > 0.75) warnings.push(locale() === "en" ? "High event density: more than three shots per four seconds." : "事件密度较高：平均每 4 秒超过 3 个镜头。");
    if (sorted.length && !/(?:hold|freeze|still|settle|定格|停留|静止|收束|保持)/iu.test([sorted.at(-1).action, sorted.at(-1).camera, sorted.at(-1).sceneChange, sorted.at(-1).continuity].join(" "))) warnings.push(locale() === "en" ? "The ending has no explicit readable hold; verify the last frame." : "结尾未明确写出停留/定格，请检查最后一帧可读性。");
    elements.workbenchShotValidation.dataset.state = issues.length ? "fail" : warnings.length ? "warning" : "pass";
    elements.workbenchShotValidation.replaceChildren();
    const summary = document.createElement("strong");
    summary.textContent = issues.length ? (locale() === "en" ? `${issues.length} timing issue(s)` : `${issues.length} 个时间问题`) : (locale() === "en" ? `${state.shots.length} consecutive shot(s) · ${duration}s${warnings.length ? ` · ${warnings.length} warning(s)` : ""}` : `${state.shots.length} 个连续镜头 · ${duration} 秒${warnings.length ? ` · ${warnings.length} 个提醒` : ""}`);
    elements.workbenchShotValidation.append(summary);
    for (const issue of issues.slice(0, 6)) { const item = document.createElement("span"); item.textContent = issue; elements.workbenchShotValidation.append(item); }
    for (const warning of warnings.slice(0, 4)) { const item = document.createElement("span"); item.textContent = `⚠ ${warning}`; elements.workbenchShotValidation.append(item); }
    return issues.length === 0;
  }

  function renderShots() {
    if (!state.manualShots) {
      elements.workbenchShotList.replaceChildren();
      validateShotsClient();
      return;
    }
    ensureShots();
    elements.workbenchShotList.replaceChildren();
    state.shots.forEach((shot, index) => {
      const card = document.createElement("article"); card.className = "shot-card"; card.dataset.shotId = shot.shotId;
      const header = document.createElement("div"); header.className = "shot-card-header";
      const title = document.createElement("strong"); title.textContent = `${locale() === "en" ? "Shot" : "镜头"} ${index + 1} · ${shot.shotId}`;
      const actions = document.createElement("div"); actions.className = "shot-actions";
      for (const [label, action, disabled] of [
        ["↑", () => moveShot(index, -1), index === 0], ["↓", () => moveShot(index, 1), index === state.shots.length - 1],
        [locale() === "en" ? "Delete" : "删除", () => removeShot(index), state.shots.length === 1]
      ]) { const button = document.createElement("button"); button.type = "button"; button.className = "button ghost"; button.textContent = label; button.disabled = disabled; button.addEventListener("click", action); actions.append(button); }
      header.append(title, actions);
      const times = document.createElement("div"); times.className = "shot-time-grid";
      times.append(
        creatorField(locale() === "en" ? "Start (s)" : "开始（秒）", shot.startSeconds, (value) => { shot.startSeconds = Number(value); validateShotsClient(); invalidatePlan(); }, { type: "number", min: 0, step: 0.1 }),
        creatorField(locale() === "en" ? "End (s)" : "结束（秒）", shot.endSeconds, (value) => { shot.endSeconds = Number(value); validateShotsClient(); invalidatePlan(); }, { type: "number", min: 0.1, step: 0.1 }),
        creatorField(locale() === "en" ? "Subject action" : "主体动作", shot.action, (value) => { shot.action = value; invalidatePlan(); })
      );
      const details = document.createElement("div"); details.className = "shot-detail-grid";
      details.append(
        creatorField(locale() === "en" ? "Camera" : "运镜", shot.camera, (value) => { shot.camera = value; invalidatePlan(); }),
        creatorField(locale() === "en" ? "Scene / state change" : "场景 / 状态变化", shot.sceneChange, (value) => { shot.sceneChange = value; invalidatePlan(); }),
        creatorField(locale() === "en" ? "Sound" : "声音", shot.sound, (value) => { shot.sound = value; invalidatePlan(); }),
        creatorField(locale() === "en" ? "On-screen text" : "画面文字", shot.onScreenText, (value) => { shot.onScreenText = value; invalidatePlan(); }),
        creatorField(locale() === "en" ? "Continuity" : "连续性要求", shot.continuity, (value) => { shot.continuity = value; invalidatePlan(); }, { rows: 2 })
      );
      card.append(header, times, details);
      elements.workbenchShotList.append(card);
    });
    validateShotsClient();
    renderMedia();
  }

  function moveShot(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= state.shots.length) return;
    [state.shots[index], state.shots[target]] = [state.shots[target], state.shots[index]];
    renderShots(); invalidatePlan();
  }

  function removeShot(index) {
    if (state.shots.length <= 1) return;
    state.shots.splice(index, 1); renderShots(); invalidatePlan();
  }

  function addShot() {
    const last = state.shots.at(-1);
    const end = effectiveDuration();
    const start = Math.min(end, Number(last?.endSeconds || 0));
    state.shots.push(blankShot(start, end)); renderShots(); invalidatePlan();
  }

  function autoTimeShots() {
    ensureShots();
    const duration = effectiveDuration();
    const step = duration / state.shots.length;
    state.shots.forEach((shot, index) => { shot.startSeconds = Number((step * index).toFixed(3)); shot.endSeconds = index === state.shots.length - 1 ? duration : Number((step * (index + 1)).toFixed(3)); });
    renderShots(); invalidatePlan();
  }

  async function generateAiShotPlan() {
    if (!providerReady()) {
      setRunStatus(t("routingNeedsProvider"), "error");
      await openApiSettings();
      return;
    }
    const intent = elements.workbenchIntent.value.trim();
    if (!intent) {
      setRunStatus(locale() === "en" ? "Describe the creative goal before generating a shot plan." : "请先写清楚创作目标，再让 AI 生成分镜。", "error");
      return;
    }
    const originalLabel = elements.workbenchAiShotPlan.textContent;
    elements.workbenchAiShotPlan.disabled = true;
    elements.workbenchAiShotPlan.textContent = locale() === "en" ? "Generating with AI…" : "AI 正在生成分镜…";
    try {
      const plan = await api.generatePromptShotPlan({
        ...currentIntelligenceConfig(),
        input: {
          intent,
          constraints: elements.workbenchConstraints.value,
          durationSeconds: effectiveDuration(),
          target: elements.workbenchTarget.value,
          outputLanguage: elements.workbenchOutputLanguage.value,
          template: compositionTemplate(selectedTemplate()),
          media: state.media.map((item) => ({ mediaId: item.mediaId, type: item.type, label: item.label || item.name || "" }))
        }
      });
      state.shots = plan.shots.map((shot) => ({ ...shot }));
      state.continuityLocks = (plan.continuityLocks || []).map((item) => ({ ...item, mediaIds: [...(item.mediaIds || [])] }));
      state.manualShots = true;
      elements.workbenchManualShots.checked = true;
      if (state.continuityLocks.length) {
        state.manualContinuity = true;
        elements.workbenchManualContinuity.checked = true;
      }
      syncAdvancedControls();
      setRunStatus(`${locale() === "en" ? "AI shot plan generated" : "AI 分镜已生成"} · ${plan.intelligence?.providerLabel || providerConfig()?.label || state.providerId} · ${plan.shots.length} ${locale() === "en" ? "shots" : "个镜头"}`, "success");
    } catch (error) {
      setRunStatus(error.message, "error");
    } finally {
      elements.workbenchAiShotPlan.disabled = false;
      elements.workbenchAiShotPlan.textContent = originalLabel;
    }
  }

  function renderContinuityLocks() {
    elements.workbenchContinuityList.replaceChildren();
    if (!state.manualContinuity) return;
    if (!state.continuityLocks.length) {
      const empty = document.createElement("p"); empty.textContent = locale() === "en" ? "No continuity locks. Add one for recurring characters, products, scenes or props." : "尚未设置连续性锁；跨镜头人物、产品、场景或道具建议至少锁定一项。"; elements.workbenchContinuityList.append(empty); return;
    }
    state.continuityLocks.forEach((lock, index) => {
      const card = document.createElement("article"); card.className = "continuity-card";
      const header = document.createElement("div"); header.className = "continuity-card-header";
      const title = document.createElement("strong"); title.textContent = `${locale() === "en" ? "Continuity" : "连续性"} ${index + 1} · ${lock.entityId}`;
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "button ghost"; remove.textContent = locale() === "en" ? "Delete" : "删除"; remove.addEventListener("click", () => { state.continuityLocks.splice(index, 1); renderContinuityLocks(); renderMedia(); invalidatePlan(); });
      header.append(title, remove);
      const grid = document.createElement("div"); grid.className = "shot-detail-grid";
      const typeLabel = document.createElement("label"); const typeSpan = document.createElement("span"); typeSpan.textContent = locale() === "en" ? "Type" : "类型"; const select = document.createElement("select");
      for (const [value, zh, en] of [["character","人物","Character"],["product","产品","Product"],["scene","场景","Scene"],["prop","道具","Prop"]]) { const option = document.createElement("option"); option.value = value; option.textContent = locale() === "en" ? en : zh; option.selected = lock.type === value; select.append(option); }
      select.addEventListener("change", () => { lock.type = select.value; invalidatePlan(); }); typeLabel.append(typeSpan, select);
      grid.append(typeLabel,
        creatorField(locale() === "en" ? "Name" : "名称", lock.name, (value) => { lock.name = value; invalidatePlan(); }),
        creatorField(locale() === "en" ? "Invariants" : "不可变化事实", lock.invariants, (value) => { lock.invariants = value; invalidatePlan(); }, { rows: 2 })
      );
      card.append(header, grid); elements.workbenchContinuityList.append(card);
    });
  }

  function addContinuityLock() {
    state.continuityLocks.push({ entityId: creatorId("entity"), type: "character", name: "", invariants: "", mediaIds: [] });
    renderContinuityLocks(); renderMedia(); invalidatePlan();
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
    const template = templateContract(item);
    if (state.composition?.status === "ready" && state.composition.contract) template.creativeDna = { ...(template.creativeDna || {}), mechanismComposition: state.composition.contract };
    return {
      providerId: state.providerId,
      baseUrl: elements.workbenchBaseUrl.value,
      model: elements.workbenchModel.value || provider.defaultModel,
      target: elements.workbenchTarget.value,
      outputLanguage: elements.workbenchOutputLanguage.value,
      durationSeconds: effectiveDuration(),
      rewriteMode: elements.workbenchMode.value,
      intent: elements.workbenchIntent.value,
      constraints: elements.workbenchConstraints.value,
      mediaIds: state.media.map((item) => item.mediaId),
      shots: state.manualShots ? state.shots.map((item) => ({ ...item })) : [],
      mediaAssignments: state.mediaAssignments.map((item) => ({ ...item, shotIds: [...item.shotIds], entityIds: [...item.entityIds] })),
      continuityLocks: state.manualContinuity ? state.continuityLocks.map((item) => ({ ...item, mediaIds: [...(item.mediaIds || [])] })) : [],
      template
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
      let assignment = state.mediaAssignments.find((entry) => entry.mediaId === item.mediaId);
      if (!assignment) {
        assignment = { mediaId: item.mediaId, role: "inspiration", notes: "", shotIds: [], entityIds: [] };
        state.mediaAssignments.push(assignment);
      }
      const card = document.createElement("article"); card.className = "media-role-card"; card.title = item.sha256;
      const header = document.createElement("div"); header.className = "media-role-header";
      const title = document.createElement("strong"); title.textContent = `${item.label} · ${item.name}`;
      const headerActions = document.createElement("div"); headerActions.className = "media-role-actions";
      const size = document.createElement("small"); size.textContent = formatBytes(item.sizeBytes);
      const customize = document.createElement("button"); customize.type = "button"; customize.className = "button ghost";
      const expanded = state.expandedMediaIds.has(item.mediaId);
      customize.textContent = expanded ? (locale() === "en" ? "Hide use details" : "收起用途") : (locale() === "en" ? "Specify use" : "指定用途");
      customize.setAttribute("aria-expanded", String(expanded));
      customize.addEventListener("click", () => { if (expanded) state.expandedMediaIds.delete(item.mediaId); else state.expandedMediaIds.add(item.mediaId); renderMedia(); });
      headerActions.append(size, customize); header.append(title, headerActions);
      const grid = document.createElement("div"); grid.className = "shot-detail-grid media-role-details"; grid.hidden = !expanded;
      const roleLabel = document.createElement("label"); const roleSpan = document.createElement("span"); roleSpan.textContent = locale() === "en" ? "Creative responsibility" : "创作职责"; const role = document.createElement("select");
      const roles = [["identity","身份","Identity"],["wardrobe","服装","Wardrobe"],["product","产品","Product"],["scene","场景","Scene"],["action","动作","Action"],["style","风格","Style"],["first_frame","首帧","First frame"],["last_frame","尾帧","Last frame"],["inspiration","仅灵感","Inspiration only"]];
      for (const [value, zh, en] of roles) { const option = document.createElement("option"); option.value = value; option.textContent = locale() === "en" ? en : zh; option.selected = assignment.role === value; role.append(option); }
      role.addEventListener("change", () => { assignment.role = role.value; invalidatePlan(); }); roleLabel.append(roleSpan, role);
      grid.append(roleLabel,
        creatorField(locale() === "en" ? "Applicable shot IDs (comma-separated)" : "适用镜头 ID（逗号分隔）", assignment.shotIds.join(", "), (value) => { assignment.shotIds = value.split(/[,，\s]+/u).map((part) => part.trim()).filter(Boolean); invalidatePlan(); }),
        creatorField(locale() === "en" ? "Bound entity IDs" : "绑定人物/产品 ID", assignment.entityIds.join(", "), (value) => { assignment.entityIds = value.split(/[,，\s]+/u).map((part) => part.trim()).filter(Boolean); invalidatePlan(); }),
        creatorField(locale() === "en" ? "Use / do-not-use notes" : "参考与禁止参考说明", assignment.notes, (value) => { assignment.notes = value; invalidatePlan(); })
      );
      card.append(header, grid); elements.workbenchMediaList.append(card);
    }
  }

  async function pickMedia() {
    try {
      state.media = await api.pickPromptMedia();
      const ids = new Set(state.media.map((item) => item.mediaId));
      state.mediaAssignments = state.mediaAssignments.filter((item) => ids.has(item.mediaId));
      renderMedia(); invalidatePlan();
    }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function clearMedia() {
    try { state.media = await api.clearPromptMedia(); state.mediaAssignments = []; state.expandedMediaIds.clear(); renderMedia(); invalidatePlan(); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  function renderProjects(selectedId = state.selectedProjectId) {
    elements.workbenchProjectList.replaceChildren();
    const empty = document.createElement("option"); empty.value = ""; empty.textContent = t("noProjects"); elements.workbenchProjectList.append(empty);
    for (const project of state.projects.filter((item) => item.capability !== "music3")) {
      const option = document.createElement("option"); option.value = project.projectId; option.textContent = `${project.title} · ${project.target}`; elements.workbenchProjectList.append(option);
    }
    if (selectedId && state.projects.some((item) => item.projectId === selectedId)) elements.workbenchProjectList.value = selectedId;
    elements.workbenchExportProject.disabled = !elements.workbenchProjectList.value;
    elements.workbenchDeleteProject.disabled = !elements.workbenchProjectList.value;
    const currentMusic = elements.workbenchMusicProject.value;
    elements.workbenchMusicProject.replaceChildren();
    const noMusic = document.createElement("option"); noMusic.value = ""; noMusic.textContent = locale() === "en" ? "Choose Music 3 project" : "选择 Music 3 项目"; elements.workbenchMusicProject.append(noMusic);
    for (const project of state.projects.filter((item) => item.capability === "music3")) { const option = document.createElement("option"); option.value = project.projectId; option.textContent = project.title; elements.workbenchMusicProject.append(option); }
    if ([...elements.workbenchMusicProject.options].some((option) => option.value === currentMusic)) elements.workbenchMusicProject.value = currentMusic;
    elements.workbenchMusicVideoBridge.disabled = !elements.workbenchMusicProject.value;
  }

  async function refreshProjects(selectedId = state.selectedProjectId) {
    state.projects = await api.promptProjects();
    renderProjects(selectedId);
  }

  function renderRevisions(project = state.currentProject) {
    elements.workbenchRevisionList.replaceChildren();
    const revisions = project?.revisions || [];
    if (!revisions.length) {
      const option = document.createElement("option"); option.value = ""; option.textContent = "—"; elements.workbenchRevisionList.append(option);
    } else {
      for (const revision of revisions) {
        const option = document.createElement("option"); option.value = revision.revisionId;
        option.textContent = `${revision.source} · ${revision.status} · ${new Date(revision.createdAt).toLocaleString()}`;
        elements.workbenchRevisionList.append(option);
      }
      elements.workbenchRevisionList.value = project.selectedRevisionId || revisions[0].revisionId;
    }
    const enabled = Boolean(project && revisions.length);
    elements.workbenchValidateEdit.disabled = !enabled;
    elements.workbenchSaveRevision.disabled = !enabled;
    elements.workbenchAcceptRevision.disabled = !enabled;
    elements.workbenchOverrideRevision.disabled = !enabled;
    elements.workbenchRejectRevision.disabled = !enabled;
    renderCreatorTools(project);
  }

  function revisionRoot(revision) { return revision?.rootRevisionId || revision?.revisionId || null; }

  function renderCreatorTools(project = state.currentProject) {
    const revision = project?.revisions?.find((item) => item.revisionId === elements.workbenchRevisionList.value) || project?.revisions?.[0] || null;
    const enabled = Boolean(project && revision);
    const hasResult = Boolean(state.output || project?.output || project?.revisions?.length);
    elements.workbenchEditResult.disabled = !hasResult;
    elements.workbenchProfessionalStatus.textContent = enabled
      ? (locale() === "en" ? "Ready" : "可使用")
      : (locale() === "en" ? "Available after generation" : "生成后可用");
    elements.workbenchProfessionalStatus.classList.toggle("ready", enabled);
    const repairUsed = enabled && project.revisions.some((item) => item.source === "repair" && item.rootRevisionId === revisionRoot(revision));
    elements.workbenchRepairQuota.textContent = !enabled ? (locale() === "en" ? "Save a project first" : "先保存项目") : repairUsed ? (locale() === "en" ? "Repair used" : "本初版修稿已用") : (locale() === "en" ? "1 repair available" : "可修稿 1 次");
    elements.workbenchRepairQuota.classList.toggle("ready", enabled && !repairUsed);
    elements.workbenchPreflightRepair.disabled = !enabled || repairUsed;
    for (const button of document.querySelectorAll("[data-variant-style]")) button.disabled = !enabled;
    elements.workbenchCompareRevisions.disabled = !project || (project.revisions || []).length < 2;
    elements.workbenchImportResult.disabled = !project;
    elements.workbenchAddObservation.disabled = !project?.resultMedia?.length;
    elements.workbenchSaveReview.disabled = !project?.resultMedia?.length || !state.reviewObservations.length;
    elements.workbenchCompose.disabled = state.templates.length < 2;
    elements.workbenchVideoMusicBridge.disabled = !enabled;
    elements.workbenchApplyMusicBridge.disabled = !state.bridge;
    const accepted = ["accepted", "accepted_with_override"].includes(revision?.status);
    elements.workbenchExportHandoff.disabled = !accepted;
    elements.workbenchExportSkill.disabled = !accepted;
    elements.workbenchSaveRating.disabled = !enabled;
    elements.workbenchSaveStage.disabled = !project;
    elements.workbenchTemplateProposal.disabled = !project;
    elements.workbenchCurrentStage.value = project?.stage || "idea";

    elements.workbenchComparisonPicker.replaceChildren();
    for (const item of project?.revisions || []) {
      const label = document.createElement("label");
      const input = document.createElement("input"); input.type = "checkbox"; input.value = item.revisionId; input.checked = [revision?.revisionId, item.revisionId].includes(item.revisionId) && elements.workbenchComparisonPicker.childElementCount < 2;
      const span = document.createElement("span"); span.textContent = `${item.source} · ${item.status}`;
      label.append(input, span); elements.workbenchComparisonPicker.append(label);
    }

    elements.workbenchReviewShot.replaceChildren();
    const noShot = document.createElement("option"); noShot.value = ""; noShot.textContent = locale() === "en" ? "No specific shot" : "不指定"; elements.workbenchReviewShot.append(noShot);
    for (const shot of project?.creativePlan?.shots || []) { const option = document.createElement("option"); option.value = shot.shotId; option.textContent = `${shot.shotId} · ${shot.startSeconds}-${shot.endSeconds}s`; elements.workbenchReviewShot.append(option); }
    elements.workbenchReviewTime.max = String(project?.durationSeconds || 0);
    const resultMedia = project?.resultMedia?.[0];
    elements.workbenchResultVideo.hidden = !resultMedia;
    if (resultMedia) elements.workbenchResultVideo.src = resultMedia.playbackUrl;
    else { elements.workbenchResultVideo.pause(); elements.workbenchResultVideo.removeAttribute("src"); }
    elements.workbenchReviewStatus.textContent = project?.resultReview?.status || (resultMedia ? (locale() === "en" ? "Imported" : "已导入") : (locale() === "en" ? "Not imported" : "未导入"));
    renderObservations();

    const currentKey = project?.template?.id;
    const selectedSecondary = elements.workbenchSecondaryTemplate.value;
    elements.workbenchSecondaryTemplate.replaceChildren();
    for (const item of state.templates.filter((candidate) => templateKey(candidate) !== currentKey)) { const option = document.createElement("option"); option.value = templateKey(item); option.textContent = templateDisplay(item).title; elements.workbenchSecondaryTemplate.append(option); }
    if ([...elements.workbenchSecondaryTemplate.options].some((option) => option.value === selectedSecondary)) elements.workbenchSecondaryTemplate.value = selectedSecondary;
    elements.workbenchCompositionStatus.textContent = project?.composition?.status || (locale() === "en" ? "Not composed" : "未组合");
    const rating = project?.ratings?.[revision?.revisionId]?.overall || 0; elements.workbenchRating.value = String(rating);
    const boardTemplate = elements.workbenchBoardTemplate.value;
    elements.workbenchBoardTemplate.replaceChildren();
    const allTemplates = document.createElement("option"); allTemplates.value = ""; allTemplates.textContent = locale() === "en" ? "All templates" : "全部模板"; elements.workbenchBoardTemplate.append(allTemplates);
    for (const item of state.templates) { const option = document.createElement("option"); option.value = templateKey(item); option.textContent = templateDisplay(item).title; elements.workbenchBoardTemplate.append(option); }
    if ([...elements.workbenchBoardTemplate.options].some((option) => option.value === boardTemplate)) elements.workbenchBoardTemplate.value = boardTemplate;
  }

  function renderObservations() {
    elements.workbenchObservationList.replaceChildren();
    for (const [index, item] of state.reviewObservations.entries()) {
      const row = document.createElement("div"); row.className = "observation-row";
      for (const value of [item.dimension, item.status, `${item.timeSeconds}s`, item.note || item.shotId || "—"]) { const span = document.createElement("span"); span.textContent = value; row.append(span); }
      const actions = document.createElement("div"); actions.className = "shot-actions";
      const seek = document.createElement("button"); seek.type = "button"; seek.className = "button ghost"; seek.textContent = locale() === "en" ? "Play" : "定位"; seek.addEventListener("click", () => { elements.workbenchResultVideo.currentTime = item.timeSeconds; void elements.workbenchResultVideo.play(); });
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "button danger"; remove.textContent = "×"; remove.addEventListener("click", () => { state.reviewObservations.splice(index, 1); renderCreatorTools(); });
      actions.append(seek, remove); row.append(actions); elements.workbenchObservationList.append(row);
    }
    const brief = state.currentProject?.resultReview?.repairBrief || "";
    elements.workbenchRepairBrief.textContent = brief ? `${locale() === "en" ? "Minimal repair brief" : "最小局部修复要求"}:\n${brief}` : "";
  }

  async function preflightRepair() {
    const revision = selectedRevision();
    const instructions = elements.workbenchRepairInstructions.value.trim() || state.currentProject?.resultReview?.repairBrief || "";
    if (!state.currentProject || !revision || !instructions) { setRunStatus(locale() === "en" ? "Describe the exact local repair first." : "请先写明需要局部修复的具体问题。", "warning"); return; }
    try {
      state.plan = await api.preflightPromptRepair({ projectId: state.currentProject.projectId, revisionId: revision.revisionId, instructions, planInput: currentPlanInput() });
      state.pendingOperation = { kind: "repair", projectId: state.currentProject.projectId };
      renderPreflight(state.plan); setWorkbenchStep("target");
    } catch (error) { state.plan = null; setRunStatus(error.message, "error"); }
  }

  async function preflightVariant(style) {
    const revision = selectedRevision();
    if (!state.currentProject || !revision) return;
    try {
      state.plan = await api.preflightPromptVariant({ projectId: state.currentProject.projectId, revisionId: revision.revisionId, style, planInput: currentPlanInput() });
      state.pendingOperation = { kind: "variant", style, projectId: state.currentProject.projectId };
      renderPreflight(state.plan); setWorkbenchStep("target");
    } catch (error) { state.plan = null; setRunStatus(error.message, "error"); }
  }

  async function compareSelectedRevisions() {
    const revisionIds = [...elements.workbenchComparisonPicker.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
    try {
      const comparison = await api.comparePromptRevisions({ projectId: state.currentProject?.projectId, revisionIds });
      elements.workbenchComparisonOutput.replaceChildren(...comparison.rows.map((item) => {
        const row = document.createElement("div"); row.className = "comparison-row";
        for (const [label, value] of [["Revision", item.revisionId], ["Source", item.source], ["Hook", item.hook ? "✓" : "—"], ["Rhythm", item.rhythm ? "✓" : "—"], ["Sound", item.sound ? "✓" : "—"], ["Ending", item.ending ? "✓" : "—"], ["Rating", item.userRating || "—"]]) { const span = document.createElement("span"); span.textContent = `${label}: ${value}`; row.append(span); }
        return row;
      }));
    } catch (error) { setRunStatus(error.message, "warning"); }
  }

  async function importResultVideo() {
    if (!state.currentProject) return;
    try { state.currentProject = await api.importPromptResultVideo(state.currentProject.projectId); state.reviewObservations = state.currentProject.resultReview?.observations || []; renderCreatorTools(); setRunStatus(locale() === "en" ? "Result video imported into project-owned storage." : "成片已复制到项目专属存储。", "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  function addReviewObservation() {
    if (!state.currentProject?.resultMedia?.length) return;
    state.reviewObservations.push({
      dimension: elements.workbenchReviewDimension.value,
      status: elements.workbenchReviewObservationStatus.value,
      timeSeconds: Number(elements.workbenchReviewTime.value),
      shotId: elements.workbenchReviewShot.value || null,
      note: elements.workbenchReviewNote.value.trim()
    });
    elements.workbenchReviewNote.value = ""; renderCreatorTools();
  }

  async function saveResultReview() {
    try {
      state.currentProject = await api.savePromptResultReview({ projectId: state.currentProject.projectId, mediaId: state.currentProject.resultMedia[0].mediaId, observations: state.reviewObservations });
      state.reviewObservations = state.currentProject.resultReview?.observations || [];
      if (state.currentProject.resultReview?.repairBrief && !elements.workbenchRepairInstructions.value) elements.workbenchRepairInstructions.value = state.currentProject.resultReview.repairBrief;
      renderCreatorTools(); await refreshProjects(state.currentProject.projectId); setRunStatus(locale() === "en" ? "Human timeline review saved." : "人工时间线复盘已保存。", "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function compositionTemplate(item) {
    if (!item) return null;
    const display = templateDisplay(item);
    return { id: item.id, templateId: templateKey(item), title: display.title, summary: display.summary, requiredAnchors: display.quick.required_anchors || item.requiredAnchors || [], creativeDna: display.dna || item.creativeDna || {}, tags: item.tags || [], density: Number(display.dna?.complexity_score || 0) };
  }

  async function composeSelectedMechanisms() {
    const primaryItem = state.templates.find((item) => templateKey(item) === state.currentProject?.template?.id) || selectedTemplate();
    const secondaryItem = state.templates.find((item) => templateKey(item) === elements.workbenchSecondaryTemplate.value);
    try {
      if (!providerReady()) { setRunStatus(t("routingNeedsProvider"), "error"); await openApiSettings(); return; }
      const composition = await api.composePromptMechanisms({
        ...currentIntelligenceConfig(),
        primary: compositionTemplate(primaryItem),
        secondary: compositionTemplate(secondaryItem),
        resolution: { secondaryRole: elements.workbenchSecondaryRole.value, userResolution: elements.workbenchCompositionResolution.value.trim() }
      });
      state.composition = composition;
      elements.workbenchCompositionStatus.textContent = composition.status;
      elements.workbenchCompositionOutput.textContent = composition.status === "ready" ? `${locale() === "en" ? "Primary causal mechanism" : "主因果机制"}: ${composition.contract.causalMechanism}\n${locale() === "en" ? "Secondary scope" : "辅助范围"}: ${composition.contract.secondaryScope}` : `${locale() === "en" ? "Blocked conflicts" : "阻断冲突"}:\n${(composition.conflicts || []).map((item) => `- ${item.code}: ${item.reason}`).join("\n")}`;
      if (composition.status === "ready" && state.currentProject) state.currentProject = await api.savePromptComposition({ projectId: state.currentProject.projectId, composition });
      if (composition.status === "ready") invalidatePlan();
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function createVideoMusicBridge() {
    const revision = selectedRevision(); if (!revision) return;
    if (!providerReady()) { setRunStatus(t("routingNeedsProvider"), "error"); await openApiSettings(); return; }
    try { state.bridge = await api.bridgeVideoToMusic3({ ...currentIntelligenceConfig(), projectId: state.currentProject.projectId, revisionId: revision.revisionId }); elements.workbenchBridgeOutput.textContent = JSON.stringify(state.bridge, null, 2); elements.workbenchApplyMusicBridge.disabled = false; setRunStatus(locale() === "en" ? "AI created a hash-bound Music 3 bridge; it has not overwritten any Music project." : "AI 已生成带哈希的 Music 3 桥接；尚未覆盖任何音乐项目。", "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  function applyMusicBridge() {
    if (!state.bridge) return;
    window.dispatchEvent(new CustomEvent("t8:music3-bridge", { detail: state.bridge }));
    setRunStatus(locale() === "en" ? "Bridge copied into the Music 3 creative idea. Review it before any call." : "桥接已写入 Music 3 创意输入；调用前请先人工确认。", "success");
  }

  async function createMusicVideoSuggestions() {
    if (!elements.workbenchMusicProject.value || !state.currentProject) return;
    if (!providerReady()) { setRunStatus(t("routingNeedsProvider"), "error"); await openApiSettings(); return; }
    try {
      const bridge = await api.bridgeMusic3ToVideo({ ...currentIntelligenceConfig(), musicProjectId: elements.workbenchMusicProject.value, videoProjectId: state.currentProject.projectId });
      state.bridge = bridge;
      elements.workbenchBridgeOutput.textContent = JSON.stringify(bridge, null, 2);
      setRunStatus(locale() === "en" ? "Hash-bound Music timing suggestions were saved to this project. The shot canvas was not changed." : "带哈希的音乐节拍建议已保存到本项目；镜头画布未被自动修改。", "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function exportFormalHandoff() {
    const revision = selectedRevision(); if (!revision) return;
    try { const result = await api.exportPromptHandoff({ projectId: state.currentProject.projectId, revisionId: revision.revisionId }); if (result.saved) setRunStatus(`${locale() === "en" ? "Isolated ComfyUI handoff exported" : "独立 ComfyUI 交接包已导出"}: ${result.directoryName}`, "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function exportSkillDraft() {
    const revision = selectedRevision(); if (!revision) return;
    try { const result = await api.exportPersonalSkill({ projectId: state.currentProject.projectId, revisionId: revision.revisionId }); if (result.saved) setRunStatus(`${locale() === "en" ? "Validated personal Skill draft exported" : "已导出并校验个人 Skill 草稿"}: ${result.directoryName}`, "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function saveCurrentRating() {
    const revision = selectedRevision(); if (!revision) return;
    try { state.currentProject = await api.savePromptRating({ projectId: state.currentProject.projectId, revisionId: revision.revisionId, rating: { overall: Number(elements.workbenchRating.value), note: elements.workbenchProjectNotes.value } }); await refreshBoard(); setRunStatus(locale() === "en" ? "Revision rating saved." : "当前版本评分已保存。", "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function saveCurrentStage() {
    if (!state.currentProject) return;
    try { state.currentProject = await api.setPromptProjectStage({ projectId: state.currentProject.projectId, stage: elements.workbenchCurrentStage.value }); await refreshProjects(state.currentProject.projectId); await refreshBoard(); setRunStatus(locale() === "en" ? "Project stage saved." : "项目阶段已保存。", "success"); }
    catch (error) { setRunStatus(error.message, "error"); }
  }

  async function refreshBoard() {
    try {
      const stage = elements.workbenchBoardStage.value;
      const [board, effects] = await Promise.all([api.promptBoard({ stages: stage ? [stage] : [], sort: elements.workbenchBoardSort.value, target: elements.workbenchBoardTarget.value, templateId: elements.workbenchBoardTemplate.value, failureTag: elements.workbenchBoardFailure.value.trim() }), api.promptEffects({})]);
      elements.workbenchBoardOutput.replaceChildren(...board.slice(0, 30).map((item) => { const row = document.createElement("div"); row.className = "board-row"; for (const value of [item.title, item.stage, item.target || "—", item.acceptanceStatus || "draft", new Date(item.updatedAt).toLocaleString()]) { const span = document.createElement("span"); span.textContent = value; row.append(span); } return row; }));
      elements.workbenchEffectsOutput.replaceChildren(...effects.slice(0, 20).map((item) => { const row = document.createElement("div"); row.className = "effect-row"; for (const value of [`${item.target} · ${item.durationSeconds}s`, `N=${item.denominator}`, `${locale() === "en" ? "Accepted" : "接受"} ${item.accepted}`, `${locale() === "en" ? "Success" : "成功率"} ${item.successRate === null ? "—" : Math.round(item.successRate * 100) + "%"}`, `${locale() === "en" ? "Rating" : "评分"} ${item.averageRating ?? "—"}`]) { const span = document.createElement("span"); span.textContent = value; row.append(span); } return row; }));
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function createTemplateImprovementProposal() {
    if (!state.currentProject) return;
    if (!providerReady()) { setRunStatus(t("routingNeedsProvider"), "error"); await openApiSettings(); return; }
    try {
      const proposal = await api.createTemplateProposal({ ...currentIntelligenceConfig(), projectId: state.currentProject.projectId });
      const row = document.createElement("div"); row.className = "effect-row";
      row.textContent = `${locale() === "en" ? "Draft proposal" : "草稿提案"} · N=${proposal.denominator} · ${proposal.evidenceStrength}\n${proposal.suggestedChanges.map((item) => `- ${item.area}: ${item.suggestion}`).join("\n")}\ncanonicalWrite=false`;
      elements.workbenchEffectsOutput.prepend(row);
      setRunStatus(locale() === "en" ? "AI template proposal created; the canonical template was not changed." : "AI 已生成模板改进提案；canonical 模板未被修改。", "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function selectedRevision() {
    return state.currentProject?.revisions?.find((item) => item.revisionId === elements.workbenchRevisionList.value) || null;
  }

  function loadRevision() {
    const revision = selectedRevision();
    if (!revision) return;
    state.output = revision.output;
    elements.workbenchOutput.value = revision.output;
    renderValidation(revision.validation);
    elements.workbenchCopyResult.disabled = false;
    renderCreatorTools();
    setRunStatus(`${locale() === "en" ? "Revision" : "版本"}: ${revision.source} · ${revision.status}`, revision.status.startsWith("accepted") ? "success" : revision.status === "rejected" ? "error" : "idle");
  }

  async function validateEditedOutput() {
    const output = elements.workbenchOutput.value.trim();
    if (!output) return;
    try {
      const report = await api.validatePromptOutput({ ...currentPlanInput(), output });
      state.output = output;
      renderValidation(report);
      setRunStatus(locale() === "en" ? "Local revalidation completed; no API call was made." : "本地复验完成；未调用 API。", report.status === "fail" ? "error" : report.status === "warning" ? "warning" : "success");
      return report;
    } catch (error) { setRunStatus(error.message, "error"); return null; }
  }

  async function saveEditedRevision() {
    if (!state.selectedProjectId) return;
    const report = await validateEditedOutput();
    if (!report) return;
    try {
      const parent = selectedRevision();
      state.currentProject = await api.addPromptRevision({
        projectId: state.selectedProjectId,
        parentRevisionId: parent?.revisionId || null,
        source: "manual",
        output: elements.workbenchOutput.value,
        validation: report,
        note: elements.workbenchProjectNotes.value
      });
      state.output = state.currentProject.output;
      renderRevisions();
      await refreshProjects(state.selectedProjectId);
      setRunStatus(locale() === "en" ? "Saved as a new immutable revision." : "已保存为新的不可覆盖版本。", "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function setRevisionStatus(status) {
    const revision = selectedRevision();
    if (!state.selectedProjectId || !revision) return;
    const note = elements.workbenchProjectNotes.value.trim();
    if ((status === "accepted_with_override" || status === "rejected") && !note) {
      setRunStatus(locale() === "en" ? "Add a review note before using this status." : "使用该状态前请先填写人工复盘备注。", "warning"); return;
    }
    try {
      state.currentProject = await api.setPromptRevisionStatus({ projectId: state.selectedProjectId, revisionId: revision.revisionId, status, note });
      renderRevisions(); loadRevision(); await refreshProjects(state.selectedProjectId);
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  async function loadProject() {
    const projectId = elements.workbenchProjectList.value;
    state.selectedProjectId = projectId || null;
    elements.workbenchExportProject.disabled = !projectId;
    elements.workbenchDeleteProject.disabled = !projectId;
    if (!projectId) { resetDraftState(); return; }
    const project = await api.promptProject(projectId);
    if (!project) return;
    state.currentProject = project;
    state.reviewObservations = (project.resultReview?.observations || []).map((item) => ({ ...item }));
    state.bridge = project.bridges?.[0] || null;
    state.composition = project.composition || null;
    elements.workbenchProjectName.value = project.title || "";
    elements.workbenchProjectTopic.value = project.topic === "general" ? "" : project.topic || "";
    elements.workbenchProjectNotes.value = project.notes || "";
    elements.workbenchIntent.value = project.intent || "";
    elements.workbenchConstraints.value = project.constraints || "";
    if (state.templates.some((item) => templateKey(item) === project.template?.id)) elements.workbenchTemplate.value = project.template.id;
    elements.workbenchTarget.value = project.target || "minimaxH3";
    elements.workbenchOutputLanguage.value = project.outputLanguage === "en" ? "en" : "zh-CN";
    const duration = Math.min(30, Math.max(0.1, Number(project.durationSeconds || 15)));
    if ([5, 10, 15, 30].includes(duration)) elements.workbenchDuration.value = String(duration);
    else { elements.workbenchDuration.value = "custom"; elements.workbenchCustomDuration.value = String(duration); }
    elements.workbenchCustomDurationField.classList.toggle("hidden", elements.workbenchDuration.value !== "custom");
    elements.workbenchMode.value = project.rewriteMode || "balanced";
    state.shots = (project.creativePlan?.shots || []).map((item) => ({ ...item }));
    state.mediaAssignments = (project.creativePlan?.mediaAssignments || []).map((item) => ({ ...item, shotIds: [...(item.shotIds || [])], entityIds: [...(item.entityIds || [])] }));
    state.continuityLocks = (project.creativePlan?.continuityLocks || []).map((item) => ({ ...item, mediaIds: [...(item.mediaIds || [])] }));
    state.manualShots = state.shots.some((item) => item.source !== "legacy_intent") || state.shots.length > 1;
    state.manualContinuity = state.continuityLocks.length > 0;
    elements.workbenchManualShots.checked = state.manualShots;
    elements.workbenchManualContinuity.checked = state.manualContinuity;
    elements.workbenchShotPlanPanel.classList.toggle("hidden", !state.manualShots);
    elements.workbenchContinuityPanel.classList.toggle("hidden", !state.manualContinuity);
    elements.workbenchManualShots.setAttribute("aria-expanded", String(state.manualShots));
    elements.workbenchManualContinuity.setAttribute("aria-expanded", String(state.manualContinuity));
    if (state.manualShots || state.manualContinuity) elements.workbenchAdvancedNote.textContent = locale() === "en" ? "This saved project contains custom advanced controls." : "该历史项目包含自定义高级设置；新项目仍默认使用简单模式。";
    state.output = project.output || "";
    state.runId = null;
    elements.workbenchOutput.value = state.output;
    elements.workbenchCopyResult.disabled = !state.output;
    elements.workbenchSaveProject.disabled = false;
    renderTemplateSummary();
    renderShots();
    renderContinuityLocks();
    renderValidation(project.validation);
    renderRevisions(project);
    elements.workbenchBridgeOutput.textContent = state.bridge ? JSON.stringify(state.bridge, null, 2) : "";
    void refreshBoard();
    invalidatePlan();
  }

  async function saveProject() {
    if (!state.runId && !state.selectedProjectId) return;
    try {
      const project = await api.savePromptProject({ runId: state.runId, projectId: state.selectedProjectId, title: elements.workbenchProjectName.value, topic: elements.workbenchProjectTopic.value, notes: elements.workbenchProjectNotes.value });
      state.selectedProjectId = project.projectId;
      state.currentProject = project;
      elements.workbenchProjectName.value = project.title;
      await refreshProjects(project.projectId);
      renderRevisions(project);
      void refreshBoard();
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
      state.currentProject = null;
      state.reviewObservations = [];
      state.bridge = null;
      state.composition = null;
      renderRevisions(null);
      renderProjects();
      elements.workbenchProjectName.value = "";
      elements.workbenchProjectTopic.value = "";
      elements.workbenchProjectNotes.value = "";
      elements.workbenchSaveProject.disabled = !state.runId;
      setRunStatus(t("projectDeleted"), "success");
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function invalidatePlan() {
    state.plan = null;
    state.pendingOperation = null;
    elements.workbenchPreflightCard.classList.add("hidden");
    elements.workbenchConfirmPaid.checked = false;
    elements.workbenchStart.disabled = true;
  }

  function renderPreflight(plan) {
    elements.workbenchPreflightFacts.replaceChildren();
    const local = plan.confirmationKind === "local_compute";
    const facts = [
      [t("endpoint"), local ? t("localRuntimeSource") : plan.endpointHost], [t("model"), plan.model], [t("target"), plan.target], [t("outputLanguage"), plan.outputLanguage === "en" ? t("languageEnglish") : t("languageChinese")],
      [locale() === "en" ? "Operation" : "操作", plan.operation || "initial"], [t("duration"), `${plan.durationSeconds}s`], [locale() === "en" ? "Planned shots" : "计划镜头", plan.shotCount], [t("anchors"), plan.requiredAnchorCount], [t("mediaFact"), `${plan.mediaCount} / ${plan.mediaAssignmentCount}`], [locale() === "en" ? "Continuity locks" : "连续性锁", plan.continuityLockCount], [t("plannedCalls"), local ? t("localComputeCalls") : `${plan.plannedChatCalls} chat + ${plan.plannedUploadCalls} upload`], [t("cost"), local ? "0" : t("costUnknown")],
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
    requestAnimationFrame(() => elements.workbenchPreflightCard.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  async function preflight() {
    if (!providerReady()) {
      setWorkbenchStep("target");
      setRunStatus(state.providerId === "local_qwen" ? "Local GGUF is not ready. Verify it in API settings." : "This provider has no configured API key.", "error");
      return;
    }
    if (state.manualShots && !validateShotsClient()) {
      setWorkbenchStep("target");
      setRunStatus("invalid creative plan", "error");
      return;
    }
    try {
      state.plan = await api.preflightPrompt(currentPlanInput());
      state.pendingOperation = null;
      renderPreflight(state.plan);
    } catch (error) {
      state.plan = null;
      elements.workbenchPreflightCard.classList.add("hidden");
      setWorkbenchStep("target");
      setRunStatus(error.message || t("failed"), "error");
    }
  }

  function friendlyRunStatus(message, status) {
    const raw = String(message || "").replace(/^Error invoking remote method '[^']+':\s*/u, "").replace(/^PromptProviderError:\s*/u, "").trim();
    if (status !== "error") return { message: raw, action: null };
    if (/Local GGUF is not ready|local_not_ready/iu.test(raw)) return {
      message: locale() === "en" ? "The selected local model is not ready. Verify it in API settings, or switch to a configured cloud provider." : "当前选中了本地模型，但它尚未就绪。请完成本地模型校验，或切换到已配置的云端渠道。",
      action: "provider"
    };
    if (/no configured API key|credential_missing/iu.test(raw)) return {
      message: locale() === "en" ? "The selected provider has no API key. Save a key or choose another ready provider." : "当前渠道还没有可用的 API Key。请保存 Key，或切换到其他已就绪渠道。",
      action: "provider"
    };
    if (/selected local model changed|local_model_changed/iu.test(raw)) return {
      message: locale() === "en" ? "The local model selection changed. Reopen API settings and verify the selected model." : "本地模型选择已经变化，请重新打开 API 设置并校验当前模型。",
      action: "provider"
    };
    if (/invalid creative plan|shot_plan|shot_|creative plan/iu.test(raw)) return {
      message: locale() === "en" ? "The manual shot plan is incomplete. Fix its timing and required actions, or turn off manual shot design." : "手动分镜还不完整。请修正时间与主体动作，或者关闭“手动设计镜头”改用自动分镜。",
      action: "advanced"
    };
    return { message: raw || t("failed"), action: null };
  }

  function setRunStatus(message, status = "idle") {
    const normalized = friendlyRunStatus(message, status);
    const hidden = !normalized.message || status === "idle";
    for (const [container, text, action] of [
      [elements.workbenchSetupStatus, elements.workbenchSetupStatusMessage, elements.workbenchSetupStatusAction],
      [elements.workbenchRunStatus, elements.workbenchRunStatusMessage, elements.workbenchRunStatusAction]
    ]) {
      text.textContent = normalized.message;
      container.dataset.state = status;
      container.classList.toggle("hidden", hidden);
      action.classList.toggle("hidden", !normalized.action);
      action.dataset.action = normalized.action || "";
      action.textContent = normalized.action === "advanced"
        ? (locale() === "en" ? "Open advanced settings" : "打开高级设置")
        : (locale() === "en" ? "Open API settings" : "打开 API 设置");
    }
    if (status === "error") elements.workbenchSetupStatus.focus();
  }

  function renderValidation(report) {
    state.validation = report || null;
    elements.workbenchValidation.replaceChildren();
    if (!report) return;
    const heading = document.createElement("strong");
    heading.textContent = report.status === "pass" ? t("validationPass") : report.status === "warning" ? t("validationWarning") : t("validationFail");
    const coverage = document.createElement("p");
    const coverageParts = [report.anchorCoverage === null ? t("noDeterministicAnchor") : `${t("anchors")}: ${Math.round(report.anchorCoverage * 100)}%`];
    if (report.shotCoverage !== null && report.shotCoverage !== undefined) coverageParts.push(`${locale() === "en" ? "shots" : "镜头"}: ${Math.round(report.shotCoverage * 100)}%`);
    if (report.continuityCoverage !== null && report.continuityCoverage !== undefined) coverageParts.push(`${locale() === "en" ? "continuity" : "连续性"}: ${Math.round(report.continuityCoverage * 100)}%`);
    coverage.textContent = coverageParts.join(" · ");
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
    for (const item of report.shotTrace || []) {
      const pill = document.createElement("span"); pill.className = item.matched ? "pass" : "warning"; pill.textContent = `${item.matched ? "✓" : "?"} ${item.shotId}`; trace.append(pill);
    }
    for (const item of report.continuityTrace || []) {
      const pill = document.createElement("span"); pill.className = item.matched ? "pass" : "warning"; pill.textContent = `${item.matched ? "✓" : "?"} ${item.name || item.entityId}`; trace.append(pill);
    }
    elements.workbenchValidation.append(trace);
  }

  async function startRun() {
    if (!state.plan || !elements.workbenchConfirmPaid.checked) return;
    elements.workbenchStart.disabled = true;
    try {
      const run = await api.startPrompt({ planHash: state.plan.planHash, confirmed: true });
      state.runId = run.runId;
      if (!state.pendingOperation) {
        state.selectedProjectId = null;
        state.currentProject = null;
        elements.workbenchProjectList.value = "";
        elements.workbenchProjectName.value = selectedTemplate() ? `${templateDisplay(selectedTemplate()).title} · ${new Date().toLocaleString()}` : "";
        elements.workbenchProjectTopic.value = "";
        elements.workbenchProjectNotes.value = "";
        elements.workbenchSaveProject.disabled = true;
        elements.workbenchExportProject.disabled = true;
        elements.workbenchDeleteProject.disabled = true;
      }
      state.output = "";
      elements.workbenchOutput.value = "";
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
        elements.workbenchOutput.value = state.output;
        elements.workbenchCopyResult.disabled = !state.output;
        elements.workbenchSaveProject.disabled = !state.output;
        renderValidation(run.validation);
        if (run.operation?.kind === "repair" || run.operation?.kind === "variant") {
          state.currentProject = await api.commitPromptOperation({ projectId: state.pendingOperation?.projectId || run.operation.projectId, runId: run.runId });
          state.selectedProjectId = state.currentProject.projectId;
          state.reviewObservations = state.currentProject.resultReview?.observations || [];
          renderRevisions(state.currentProject);
          await refreshProjects(state.currentProject.projectId);
          elements.workbenchSaveProject.disabled = false;
          state.pendingOperation = null;
        }
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
    state.output = elements.workbenchOutput.value;
    if (!state.output) return;
    try {
      await api.copyText(state.output);
      const original = t("copy");
      elements.workbenchCopyResult.textContent = t("copied");
      elements.workbenchCopyResult.classList.add("is-copied");
      setTimeout(() => { elements.workbenchCopyResult.textContent = original; elements.workbenchCopyResult.classList.remove("is-copied"); }, COPY_RESET_MS);
    } catch (error) { setRunStatus(error.message, "error"); }
  }

  function setFieldLabel(control, zh, en) {
    const label = control?.closest("label");
    const span = label ? [...label.children].find((child) => child.tagName === "SPAN") : null;
    if (span) span.textContent = locale() === "en" ? en : zh;
  }

  function setOptionLabels(select, labels) {
    for (const option of select?.options || []) {
      const pair = labels[option.value];
      if (pair) option.textContent = pair[locale() === "en" ? 1 : 0];
    }
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
    elements.localQwenDirectoryLabel.textContent = t("localDirectory"); elements.localQwenPickDirectory.textContent = t("localPickDirectory"); elements.localQwenModelLabel.textContent = t("localModel"); elements.localQwenProjectorLabel.textContent = t("localProjector");
    elements.localQwenRuntimeLabel.textContent = t("localRuntime"); elements.localQwenPickRuntime.textContent = t("localPickRuntime"); elements.localQwenFfmpegLabel.textContent = t("localFfmpeg"); elements.localQwenPickFfmpeg.textContent = t("localPickFfmpeg");
    elements.localQwenContextLabel.textContent = t("localContext"); elements.localQwenMaxTokensLabel.textContent = t("localMaxTokens"); elements.localQwenThinkLabel.textContent = t("localThink"); elements.localQwenReasoningLabel.textContent = t("localReasoning"); elements.localQwenVideoFpsLabel.textContent = t("localVideoFps"); elements.localQwenUnloadLabel.textContent = t("localUnload");
    elements.localQwenSave.textContent = t("localSave"); elements.localQwenRescan.textContent = t("localRescan"); elements.localQwenVerify.textContent = t("localVerify"); elements.localQwenRelease.textContent = t("localRelease");
    elements.localQwenThink.querySelector('[value="off"]').textContent = locale() === "en" ? "Off (recommended)" : "关闭（推荐）";
    elements.localQwenThink.querySelector('[value="on"]').textContent = locale() === "en" ? "On" : "开启";
    elements.localQwenContext.querySelector('[value="32768"]').textContent = locale() === "en" ? "32K (recommended)" : "32K（推荐）";
    elements.localQwenMaxTokens.querySelector('[value="512"]').textContent = locale() === "en" ? "512 (short output)" : "512（短输出）";
    elements.localQwenMaxTokens.querySelector('[value="4096"]').textContent = locale() === "en" ? "4096 (node default)" : "4096（节点默认）";
    elements.localQwenUnload.querySelector('[value="after_run"]').textContent = locale() === "en" ? "Unload after run (recommended)" : "执行后卸载（推荐）";
    elements.localQwenUnload.querySelector('[value="keep_warm"]').textContent = locale() === "en" ? "Keep loaded" : "保持驻留";
    elements.localQwenUnload.querySelector('[value="idle_10m"]').textContent = locale() === "en" ? "Unload after 10 idle minutes" : "空闲10分钟后卸载";
    elements.workbenchPlanTitle.textContent = locale() === "en" ? "Choose how to generate" : "确认怎么生成"; elements.workbenchCurrentProviderLabel.textContent = locale() === "en" ? "Provider used for this generation" : "当前使用的增强渠道"; elements.workbenchChangeProvider.textContent = locale() === "en" ? "Change provider" : "更换渠道"; elements.workbenchTargetLabel.textContent = t("target"); elements.workbenchDurationLabel.textContent = t("duration");
    elements.workbenchCustomDurationLabel.textContent = locale() === "en" ? "Custom duration (seconds, max 30)" : "自定义时长（秒，最多 30）";
    const durationLabels = locale() === "en" ? ["5 seconds", "10 seconds", "15 seconds", "30 seconds", "Custom (max 30 seconds)"] : ["5 秒", "10 秒", "15 秒", "30 秒", "自定义（最多 30 秒）"];
    [...elements.workbenchDuration.options].forEach((option, index) => { option.textContent = durationLabels[index]; });
    elements.workbenchOutputLanguageLabel.textContent = t("outputLanguage"); elements.workbenchOutputLanguageZh.textContent = t("languageChinese"); elements.workbenchOutputLanguageEn.textContent = t("languageEnglish");
    elements.workbenchModeLabel.textContent = t("mode"); elements.workbenchModelLabel.textContent = t("model"); elements.workbenchBaseUrlLabel.textContent = t("baseUrl");
    elements.workbenchConstraintsLabel.textContent = t("constraints"); elements.workbenchPreflight.textContent = t("preflight"); elements.workbenchConfirmLabel.textContent = t("confirm");
    elements.workbenchStart.textContent = t("start"); elements.workbenchCancelRun.textContent = t("cancel"); elements.workbenchResultTitle.textContent = t("result"); elements.workbenchCopyResult.textContent = t("copy");
    elements.workbenchGenerateAgain.textContent = locale() === "en" ? "Generate again" : "再生成一次"; elements.workbenchEditResult.textContent = locale() === "en" ? "I want to edit the result" : "我想修改结果";
    elements.workbenchMediaTitle.textContent = t("mediaTitle"); elements.workbenchAddMedia.textContent = t("addMedia"); elements.workbenchClearMedia.textContent = t("clearMedia"); elements.workbenchMediaNote.textContent = t("mediaNote");
    elements.workbenchAdvancedTitle.textContent = locale() === "en" ? "Advanced creative settings (optional)" : "高级创作设置（可选）";
    elements.workbenchAdvancedNote.textContent = locale() === "en" ? "Open only when you need precise control. Beginners can skip this." : "需要精确控制时再打开，新手可以直接跳过";
    elements.workbenchCreativePreferencesTitle.textContent = locale() === "en" ? "Creative preferences" : "创作偏好";
    elements.workbenchManualShotsTitle.textContent = locale() === "en" ? "Design shots manually" : "手动设计镜头";
    elements.workbenchManualShotsNote.textContent = locale() === "en" ? "When off, the selected template plans shots from your goal and duration." : "关闭时由模板根据目标和时长自动规划";
    elements.workbenchManualContinuityTitle.textContent = locale() === "en" ? "Lock character or product appearance" : "锁定人物或产品外观";
    elements.workbenchManualContinuityNote.textContent = locale() === "en" ? "Turn on only when a recurring subject must stay identical." : "多镜头需要保持同一人物、产品或场景时再开启";
    elements.workbenchShotPlanTitle.textContent = locale() === "en" ? "Shot canvas" : "镜头创作画布";
    elements.workbenchShotPlanNote.textContent = locale() === "en" ? "Bind timing, action, camera, sound, text and continuity. Shots must cover the full duration without gaps." : "每个镜头绑定时间、动作、运镜、声音、文字和连续性；总时长必须连续覆盖。";
    elements.workbenchAddShot.textContent = locale() === "en" ? "Add shot" : "新增镜头"; elements.workbenchAutoTimeShots.textContent = locale() === "en" ? "Distribute time" : "平均分配时间";
    elements.workbenchContinuityTitle.textContent = locale() === "en" ? "Character / product continuity locks" : "人物 / 产品连续性锁";
    elements.workbenchContinuityNote.textContent = locale() === "en" ? "Lock identity, appearance, material and spatial facts that cannot change between shots." : "锁定跨镜头不可变化的身份、外观、材质和空间事实。";
    elements.workbenchAddContinuity.textContent = locale() === "en" ? "Add continuity lock" : "新增连续性锁";
    elements.workbenchProfessionalTitle.textContent = locale() === "en" ? "Professional review and delivery (optional)" : "专业复盘与交付（可选）";
    elements.workbenchProfessionalNote.textContent = locale() === "en" ? "Open when saving revisions, reviewing a result video or exporting to ComfyUI." : "保存版本、复盘成片或导出 ComfyUI 时再打开";
    elements.workbenchProjectTitle.textContent = t("projectTitle"); elements.workbenchProjectNameLabel.textContent = t("projectName"); elements.workbenchProjectListLabel.textContent = t("projectList"); elements.workbenchProjectNotesLabel.textContent = t("projectNotes");
    elements.workbenchProjectTopicLabel.textContent = locale() === "en" ? "Topic / use" : "题材 / 用途";
    elements.workbenchPreviewHeading.textContent = t("previewTitle");
    elements.workbenchSaveProject.textContent = t("saveProject"); elements.workbenchExportProject.textContent = t("exportProject"); elements.workbenchDeleteProject.textContent = t("deleteProject");
    elements.workbenchRevisionLabel.textContent = locale() === "en" ? "Revision" : "版本";
    elements.workbenchValidateEdit.textContent = locale() === "en" ? "Revalidate locally" : "本地复验"; elements.workbenchSaveRevision.textContent = locale() === "en" ? "Save as new revision" : "保存为新版本";
    elements.workbenchAcceptRevision.textContent = locale() === "en" ? "Accept" : "接受"; elements.workbenchOverrideRevision.textContent = locale() === "en" ? "Accept with note" : "说明后接受"; elements.workbenchRejectRevision.textContent = locale() === "en" ? "Reject" : "拒绝";
    elements.workbenchIterationTitle.textContent = locale() === "en" ? "Repair, variants and revision comparison" : "修稿、变体与版本对比";
    elements.workbenchRepairLabel.textContent = locale() === "en" ? "Local repair targets" : "局部修复目标";
    elements.workbenchPreflightRepair.textContent = locale() === "en" ? "Create one-repair confirmation" : "生成一次修稿确认单";
    const variantCopy = { conservative: ["保守变体", "Conservative variant"], director: ["导演变体", "Director variant"], surprise: ["惊喜变体", "Surprise variant"] };
    for (const button of document.querySelectorAll("[data-variant-style]")) button.textContent = variantCopy[button.dataset.variantStyle][locale() === "en" ? 1 : 0];
    elements.workbenchCompareRevisions.textContent = locale() === "en" ? "Compare selected revisions" : "并排比较所选版本";
    elements.workbenchReviewTitle.textContent = locale() === "en" ? "Result video and human timeline review" : "成片回传与人工时间线复盘";
    elements.workbenchImportResult.textContent = locale() === "en" ? "Import local result" : "导入本机成片"; elements.workbenchSaveReview.textContent = locale() === "en" ? "Save human review" : "保存人工复盘"; elements.workbenchAddObservation.textContent = locale() === "en" ? "Add human marker" : "添加人工标记";
    setFieldLabel(elements.workbenchReviewDimension, "复盘维度", "Review dimension");
    setFieldLabel(elements.workbenchReviewObservationStatus, "人工判断", "Human observation");
    setFieldLabel(elements.workbenchReviewTime, "时间点（秒）", "Time (seconds)");
    setFieldLabel(elements.workbenchReviewShot, "镜头 ID", "Shot ID");
    setFieldLabel(elements.workbenchReviewNote, "观察证据 / 问题说明", "Observed evidence / issue");
    setOptionLabels(elements.workbenchReviewDimension, {
      identity_continuity: ["身份连续", "Identity continuity"], causal_order: ["因果顺序", "Causal order"], action_physics: ["动作物理", "Action physics"], camera: ["运镜", "Camera"], onscreen_text: ["字幕 / 画面文字", "On-screen text"], sound: ["声音", "Sound"], dialogue: ["对白", "Dialogue"], audio_sync: ["音画同步", "Audio sync"]
    });
    setOptionLabels(elements.workbenchReviewObservationStatus, { visible: ["可见", "Visible"], audible: ["可听", "Audible"], missing: ["缺失", "Missing"], wrong_order: ["顺序错误", "Wrong order"], indeterminate: ["无法判断", "Indeterminate"] });
    elements.workbenchCompositionTitle.textContent = locale() === "en" ? "Dual-mechanism composer" : "双机制组合器"; elements.workbenchCompose.textContent = locale() === "en" ? "AI check and compose (1 call)" : "AI 检查并组合（1 次调用）";
    setFieldLabel(elements.workbenchSecondaryTemplate, "辅助机制", "Secondary mechanism");
    setFieldLabel(elements.workbenchSecondaryRole, "辅助范围", "Secondary scope");
    setFieldLabel(elements.workbenchCompositionResolution, "冲突解决说明（检测到冲突时必填）", "Conflict resolution (required when blocked)");
    setOptionLabels(elements.workbenchSecondaryRole, { hook: ["钩子", "Hook"], transition: ["转场", "Transition"], performance: ["表现", "Performance"], ending: ["结尾", "Ending"] });
    elements.workbenchDeliveryTitle.textContent = locale() === "en" ? "Bridge, handoff and personal Skill" : "桥接、交接与个人 Skill";
    elements.workbenchDeliveryStatus.textContent = locale() === "en" ? "AI bridge · local export" : "AI 桥接 · 本地导出";
    elements.workbenchVideoMusicBridge.textContent = locale() === "en" ? "AI create Music 3 bridge (1 call)" : "AI 生成 Music 3 桥接（1 次调用）"; elements.workbenchApplyMusicBridge.textContent = locale() === "en" ? "Apply to Music 3 idea" : "写入 Music 3 创意"; elements.workbenchExportHandoff.textContent = locale() === "en" ? "Export isolated ComfyUI handoff" : "导出独立 ComfyUI 交接包"; elements.workbenchExportSkill.textContent = locale() === "en" ? "Export personal Skill draft" : "导出个人 Skill 草稿";
    elements.workbenchMusicVideoBridge.textContent = locale() === "en" ? "AI read beat suggestions (1 call)" : "AI 读取节拍建议（1 次调用）";
    elements.workbenchMusicProject.setAttribute("aria-label", locale() === "en" ? "Select Music 3 project" : "选择 Music 3 项目");
    if (elements.workbenchMusicProject.options[0]) elements.workbenchMusicProject.options[0].textContent = locale() === "en" ? "Select Music 3 project" : "选择 Music 3 项目";
    elements.workbenchBoardTitle.textContent = locale() === "en" ? "Project board and template effect record" : "项目看板与模板效果档案"; elements.workbenchBoardStatus.textContent = locale() === "en" ? "Local statistics" : "本地统计"; elements.workbenchSaveRating.textContent = locale() === "en" ? "Save revision rating" : "保存当前版本评分"; elements.workbenchRefreshBoard.textContent = locale() === "en" ? "Refresh board" : "刷新看板";
    setFieldLabel(elements.workbenchBoardStage, "阶段筛选", "Stage filter"); setFieldLabel(elements.workbenchBoardSort, "更新时间", "Updated time"); setFieldLabel(elements.workbenchBoardTarget, "目标模型", "Target model"); setFieldLabel(elements.workbenchBoardTemplate, "模板", "Template"); setFieldLabel(elements.workbenchBoardFailure, "失败标签", "Failure tag"); setFieldLabel(elements.workbenchCurrentStage, "当前项目阶段", "Current project stage"); setFieldLabel(elements.workbenchRating, "总体评分", "Overall rating");
    const stageLabels = { idea: ["想法", "Idea"], ready: ["就绪", "Ready"], generated: ["已生成", "Generated"], review: ["复盘", "Review"], repair: ["待修复", "Needs repair"], accepted: ["已接受", "Accepted"], archived: ["已归档", "Archived"] };
    setOptionLabels(elements.workbenchBoardStage, { "": ["全部", "All"], ...stageLabels }); setOptionLabels(elements.workbenchCurrentStage, stageLabels);
    setOptionLabels(elements.workbenchBoardSort, { newest: ["最近更新", "Newest updated"], oldest: ["最早更新", "Oldest updated"] });
    setOptionLabels(elements.workbenchBoardTarget, { "": ["全部模型", "All models"], minimaxH3: ["MiniMax H3", "MiniMax H3"], seedance20: ["Seedance 2.0", "Seedance 2.0"] });
    setOptionLabels(elements.workbenchRating, { "0": ["未评分", "Not rated"] });
    elements.workbenchRepairInstructions.placeholder = locale() === "en" ? "Repair only the explicit failed shot or mechanism; preserve every accepted part." : "只修复明确失败的镜头或机制；其他已接受内容保持不变。";
    elements.workbenchBoardFailure.placeholder = locale() === "en" ? "Example: camera" : "例如：camera";
    elements.workbenchAcceptanceActions.setAttribute("aria-label", locale() === "en" ? "Revision acceptance status" : "版本验收状态");
    elements.workbenchComparisonPicker.setAttribute("aria-label", locale() === "en" ? "Select revisions to compare" : "选择要比较的版本");
    elements.workbenchSaveStage.textContent = locale() === "en" ? "Save project stage" : "保存项目阶段";
    elements.workbenchTemplateProposal.textContent = locale() === "en" ? "AI template improvement proposal (1 call)" : "AI 生成模板改进提案（1 次调用）";
    elements.workbenchAiShotPlan.textContent = locale() === "en" ? "AI generate shot plan (1 call)" : "AI 生成分镜（1 次调用）";
    elements.closePromptWorkbench.setAttribute("aria-label", t("close"));
    const selected = elements.workbenchTemplate.value;
    state.templates = buildTemplates(state.catalog || { cases: [], communitySkills: [] });
    populateTemplates(selected);
    renderProviders();
    renderMedia();
    renderShots();
    renderContinuityLocks();
    renderRevisions();
    void refreshBoard();
    renderProjects();
    renderTemplatePreview();
    renderWorkbenchSteps();
  }

  async function openApiSettings() {
    state.apiSettingsInitialProviderId = state.providerId;
    await refreshProviders();
    renderLocale();
    if (!elements.apiSettingsDialog.open) elements.apiSettingsDialog.showModal();
    elements.workbenchProviderCards.querySelector('[data-provider-id="' + state.providerId + '"]')?.focus();
  }

  function closeApiSettings({ commit = false } = {}) {
    if (commit && !commitSelectedProvider()) return false;
    if (!commit && state.apiSettingsInitialProviderId && state.apiSettingsInitialProviderId !== state.providerId) selectProvider(state.apiSettingsInitialProviderId, { persist: false, clearError: false });
    elements.workbenchApiKey.value = "";
    if (elements.apiSettingsDialog.open) elements.apiSettingsDialog.close();
    state.apiSettingsInitialProviderId = null;
    return true;
  }

  async function openWorkbench() {
    if (!state.catalog) {
      state.catalog = await api.loadCatalog();
      state.templates = buildTemplates(state.catalog);
      populateTemplates();
    }
    await refreshProviders({ reconcile: true });
    state.media = await api.promptMediaList();
    const activeMedia = new Set(state.media.map((item) => item.mediaId));
    state.mediaAssignments = state.mediaAssignments.filter((item) => activeMedia.has(item.mediaId));
    await refreshProjects();
    elements.workbenchAdvancedSettings.open = false;
    elements.workbenchProfessionalTools.open = false;
    renderLocale();
    setWorkbenchStep("goal");
    elements.promptWorkbenchDialog.showModal();
    elements.workbenchIntent.focus();
  }

  function closeWorkbench() {
    stopPolling();
    elements.workbenchApiKey.value = "";
    closeApiSettings({ commit: false });
    if (elements.promptWorkbenchDialog.open) elements.promptWorkbenchDialog.close();
  }

  elements.openPromptWorkbench.addEventListener("click", () => void openWorkbench());
  elements.openApiSettings.addEventListener("click", () => void openApiSettings());
  elements.workbenchChangeProvider.addEventListener("click", () => void openApiSettings());
  elements.closeApiSettings.addEventListener("click", () => closeApiSettings({ commit: false }));
  elements.doneApiSettings.addEventListener("click", () => closeApiSettings({ commit: true }));
  elements.apiSettingsDialog.addEventListener("cancel", (event) => { event.preventDefault(); closeApiSettings({ commit: false }); });
  elements.apiSettingsDialog.addEventListener("click", (event) => { if (event.target === elements.apiSettingsDialog) closeApiSettings({ commit: false }); });
  elements.closePromptWorkbench.addEventListener("click", closeWorkbench);
  elements.promptWorkbenchDialog.addEventListener("cancel", (event) => { event.preventDefault(); closeWorkbench(); });
  elements.promptWorkbenchDialog.addEventListener("click", (event) => { if (event.target === elements.promptWorkbenchDialog) closeWorkbench(); });
  elements.workbenchRoute.addEventListener("click", () => void renderRouterResults());
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
  elements.workbenchNextStep.addEventListener("click", () => {
    if (state.activeStep === "target") elements.workbenchPreflight.click();
    else moveWorkbenchStep(1);
  });
  elements.workbenchProviderCards.addEventListener("click", (event) => { const button = event.target.closest("[data-provider-id]"); if (button) selectProvider(button.dataset.providerId); });
  for (const button of document.querySelectorAll("[data-provider-registration]")) button.addEventListener("click", () => void openRegistration(button.dataset.providerRegistration));
  elements.workbenchRegisterSelected.addEventListener("click", () => void openRegistration(state.providerId));
  elements.workbenchSaveKey.addEventListener("click", () => void saveCredential());
  elements.workbenchClearKey.addEventListener("click", () => void clearCredential());
  elements.localQwenPickDirectory.addEventListener("click", () => void pickLocalModelDirectory());
  elements.localQwenPickRuntime.addEventListener("click", () => void pickLocalRuntime());
  elements.localQwenPickFfmpeg.addEventListener("click", () => void pickLocalFfmpeg());
  elements.localQwenSave.addEventListener("click", () => void saveLocalQwen());
  elements.localQwenRescan.addEventListener("click", () => void rescanLocalQwen());
  elements.localQwenVerify.addEventListener("click", () => void verifyLocalQwen());
  elements.localQwenRelease.addEventListener("click", () => void releaseLocalQwen());
  elements.workbenchModel.addEventListener("input", storeCurrentProviderOptions);
  elements.workbenchBaseUrl.addEventListener("input", storeCurrentProviderOptions);
  window.addEventListener("t8:workbench-capability-change", renderProviders);
  for (const element of [elements.workbenchIntent, elements.workbenchTarget, elements.workbenchOutputLanguage, elements.workbenchDuration, elements.workbenchCustomDuration, elements.workbenchMode, elements.workbenchConstraints]) {
    element.addEventListener("input", invalidatePlan);
    element.addEventListener("change", invalidatePlan);
  }
  elements.workbenchDuration.addEventListener("change", () => { elements.workbenchCustomDurationField.classList.toggle("hidden", elements.workbenchDuration.value !== "custom"); validateShotsClient(); });
  elements.workbenchCustomDuration.addEventListener("input", validateShotsClient);
  elements.workbenchManualShots.addEventListener("change", syncAdvancedControls);
  elements.workbenchManualContinuity.addEventListener("change", syncAdvancedControls);
  elements.workbenchAddShot.addEventListener("click", addShot);
  elements.workbenchAiShotPlan.addEventListener("click", () => void generateAiShotPlan());
  elements.workbenchAutoTimeShots.addEventListener("click", autoTimeShots);
  elements.workbenchAddContinuity.addEventListener("click", addContinuityLock);
  elements.workbenchAddMedia.addEventListener("click", () => void pickMedia());
  elements.workbenchClearMedia.addEventListener("click", () => void clearMedia());
  elements.workbenchProjectList.addEventListener("change", () => void loadProject());
  elements.workbenchRevisionList.addEventListener("change", loadRevision);
  elements.workbenchValidateEdit.addEventListener("click", () => void validateEditedOutput());
  elements.workbenchSaveRevision.addEventListener("click", () => void saveEditedRevision());
  elements.workbenchAcceptRevision.addEventListener("click", () => void setRevisionStatus("accepted"));
  elements.workbenchOverrideRevision.addEventListener("click", () => void setRevisionStatus("accepted_with_override"));
  elements.workbenchRejectRevision.addEventListener("click", () => void setRevisionStatus("rejected"));
  elements.workbenchPreflightRepair.addEventListener("click", () => void preflightRepair());
  for (const button of document.querySelectorAll("[data-variant-style]")) button.addEventListener("click", () => void preflightVariant(button.dataset.variantStyle));
  elements.workbenchCompareRevisions.addEventListener("click", () => void compareSelectedRevisions());
  elements.workbenchImportResult.addEventListener("click", () => void importResultVideo());
  elements.workbenchAddObservation.addEventListener("click", addReviewObservation);
  elements.workbenchSaveReview.addEventListener("click", () => void saveResultReview());
  elements.workbenchResultVideo.addEventListener("timeupdate", () => { if (!elements.workbenchResultVideo.seeking) elements.workbenchReviewTime.value = elements.workbenchResultVideo.currentTime.toFixed(3); });
  elements.workbenchCompose.addEventListener("click", () => void composeSelectedMechanisms());
  elements.workbenchVideoMusicBridge.addEventListener("click", () => void createVideoMusicBridge());
  elements.workbenchApplyMusicBridge.addEventListener("click", applyMusicBridge);
  elements.workbenchMusicProject.addEventListener("change", () => { elements.workbenchMusicVideoBridge.disabled = !elements.workbenchMusicProject.value; });
  elements.workbenchMusicVideoBridge.addEventListener("click", () => void createMusicVideoSuggestions());
  elements.workbenchExportHandoff.addEventListener("click", () => void exportFormalHandoff());
  elements.workbenchExportSkill.addEventListener("click", () => void exportSkillDraft());
  elements.workbenchSaveRating.addEventListener("click", () => void saveCurrentRating());
  elements.workbenchSaveStage.addEventListener("click", () => void saveCurrentStage());
  elements.workbenchRefreshBoard.addEventListener("click", () => void refreshBoard());
  elements.workbenchTemplateProposal.addEventListener("click", () => void createTemplateImprovementProposal());
  elements.workbenchBoardStage.addEventListener("change", () => void refreshBoard());
  for (const control of [elements.workbenchBoardSort, elements.workbenchBoardTarget, elements.workbenchBoardTemplate, elements.workbenchBoardFailure]) { control.addEventListener("change", () => void refreshBoard()); }
  elements.workbenchSaveProject.addEventListener("click", () => void saveProject());
  elements.workbenchExportProject.addEventListener("click", () => void exportProject());
  elements.workbenchDeleteProject.addEventListener("click", () => void deleteProject());
  elements.workbenchPreflight.addEventListener("click", () => void preflight());
  elements.workbenchConfirmPaid.addEventListener("change", () => { elements.workbenchStart.disabled = !state.plan || !elements.workbenchConfirmPaid.checked; });
  elements.workbenchStart.addEventListener("click", () => void startRun());
  elements.workbenchCancelRun.addEventListener("click", () => void cancelRun());
  elements.workbenchCopyResult.addEventListener("click", () => void copyResult());
  elements.workbenchGenerateAgain.addEventListener("click", () => { invalidatePlan(); setRunStatus("", "idle"); setWorkbenchStep("target", true); });
  elements.workbenchEditResult.addEventListener("click", () => { elements.workbenchOutput.focus(); setRunStatus(locale() === "en" ? "Edit the prompt directly. Save a project if you want immutable revision history." : "可以直接修改提示词；需要保留版本记录时再打开“专业复盘与交付”。", "success"); });
  for (const action of [elements.workbenchSetupStatusAction, elements.workbenchRunStatusAction]) action.addEventListener("click", () => {
    if (action.dataset.action === "advanced") { elements.workbenchAdvancedSettings.open = true; setWorkbenchStep("target", true); elements.workbenchManualShots.focus(); }
    else void openApiSettings();
  });
  elements.workbenchOutput.addEventListener("input", () => { state.output = elements.workbenchOutput.value; elements.workbenchCopyResult.disabled = !state.output; });

  new MutationObserver(() => renderLocale()).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  renderLocale();

  window.T8PromptWorkbench = Object.freeze({
    routeTemplates: (intent) => routeTemplates(intent).map((result) => ({ id: result.item.id, templateId: templateKey(result.item), score: result.score, reasons: result.reasons })),
    open: openWorkbench
  });
})();
