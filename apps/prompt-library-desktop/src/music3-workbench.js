(() => {
  "use strict";

  const api = window.promptLibrary;
  const byId = (id) => document.getElementById(id);
  const elements = {
    dialog: byId("prompt-workbench-dialog"), title: byId("workbench-title"), subtitle: byId("workbench-subtitle"), capabilitySwitch: byId("workbench-capability-switch"),
    videoButton: byId("workbench-capability-video"), musicButton: byId("workbench-capability-music"),
    intentTitle: byId("workbench-intent-title"), intentLabel: byId("workbench-intent-label"), intent: byId("workbench-intent"),
    route: byId("workbench-route"), routerResults: byId("workbench-router-results"), template: byId("workbench-template"),
    templateSummary: byId("workbench-template-summary"), videoParameters: byId("workbench-video-parameters"), musicParameters: byId("music3-parameters"),
    planTitle: byId("workbench-plan-title"), preflight: byId("workbench-preflight"), preflightCard: byId("workbench-preflight-card"),
    preflightFacts: byId("workbench-preflight-facts"), confirm: byId("workbench-confirm-paid"), confirmLabel: byId("workbench-confirm-label"),
    start: byId("workbench-start"), cancel: byId("workbench-cancel-run"), resultTitle: byId("workbench-result-title"),
    runStatus: byId("workbench-run-status"), runStatusMessage: byId("workbench-run-status-message"), runStatusAction: byId("workbench-run-status-action"), output: byId("workbench-output"), validation: byId("workbench-validation"),
    copyCurrent: byId("workbench-copy-result"), copyAll: byId("music3-copy-all"), resultTabs: byId("music3-result-tabs"),
    projectName: byId("workbench-project-name"), projectList: byId("workbench-project-list"), projectNotes: byId("workbench-project-notes"),
    saveProject: byId("workbench-save-project"), exportProject: byId("workbench-export-project"), deleteProject: byId("workbench-delete-project"),
    previewImage: byId("workbench-preview-image"), previewPlaceholder: byId("workbench-preview-placeholder"),
    previewBadge: byId("workbench-preview-badge"), previewKind: byId("workbench-preview-kind"), previewModels: byId("workbench-preview-models"),
    previewTitle: byId("workbench-preview-title"), previewSummary: byId("workbench-preview-summary"),
    previewAnchorsLabel: byId("workbench-preview-anchors-label"), previewAnchors: byId("workbench-preview-anchors"), previewTemplateId: byId("workbench-preview-template-id"),
    providerCards: byId("workbench-provider-cards"), model: byId("workbench-model"), baseUrl: byId("workbench-base-url"),
    toggleAdvanced: byId("music3-toggle-advanced"), advanced: byId("music3-advanced-fields"),
    lyricsMode: byId("music3-lyrics-mode"), lyricsField: byId("music3-lyrics-field"), lyrics: byId("music3-lyrics"), lyricsLanguage: byId("music3-lyrics-language"),
    customLanguageField: byId("music3-custom-language-field"), customLanguage: byId("music3-custom-language"),
    qualityMode: byId("music3-quality-mode"), captionLanguage: byId("music3-caption-language"), editRequestField: byId("music3-edit-request-field"),
    editRequest: byId("music3-edit-request"), constraints: byId("music3-constraints"), duration: byId("music3-duration"),
    rewriteMode: byId("music3-rewrite-mode"), structure: byId("music3-structure"), customStructureField: byId("music3-custom-structure-field"),
    customStructure: byId("music3-custom-structure"), bpm: byId("music3-bpm"), keyScale: byId("music3-key-scale"),
    meter: byId("music3-meter"), customMeterField: byId("music3-custom-meter-field"), customMeter: byId("music3-custom-meter"),
    captionWords: byId("music3-caption-words"), editScope: byId("music3-edit-scope"), editSection: byId("music3-edit-section"),
    editOccurrence: byId("music3-edit-occurrence"), semanticProfile: byId("music3-semantic-profile"),
    manualProfileField: byId("music3-manual-profile-field"), manualProfile: byId("music3-manual-profile"),
    stageCache: byId("music3-stage-cache"), seed: byId("music3-seed")
  };

  if (!api || !elements.dialog || !elements.musicParameters) return;

  const COPY = {
    "zh-CN": {
      video: "视频提示词", music: "Music 3", title: "MiniMax Music 3 歌词与结构化描述", subtitle: "写音乐创意，按需生成或保护歌词，再由你确认分阶段付费调用。",
      goal: "你想做什么音乐？", goalLabel: "音乐创意（流派、主题、情绪、用途、乐器与编曲意图）", plan: "歌词、结构与生成约束", result: "Music 3 四项结果与验收",
      placeholder: "例如：一首中文电影感流行情歌，女声从克制走向坚定，钢琴开场，副歌加入弦乐，不要说唱。",
      preflight: "生成 Music 3 调用确认单", start: "确认并开始 Music 3 增强", copy: "复制当前结果", copyAll: "复制全部", copied: "✓ 已复制",
      idle: "尚未运行 Music 3", running: "Music 3 正在分阶段增强；重复提交已阻止…", completed: "Music 3 增强完成", failed: "Music 3 增强失败",
      previewKind: "官方 Music 3 Skill", previewModels: "文本增强 · 四项输出", previewTitle: "Music 3 Prompt & Lyrics Enhancer",
      previewSummary: "按官方 music-caption-rewriter 渐进读取流派索引和最多三份模板，生成原创歌词、三段式结构化描述、可直接调用的 Payload JSON 与安全报告。",
      previewAnchors: ["仅音乐创意为必填", "默认中文结构化描述", "歌词严格保留与定点润色", "最多两个索引、三份模板", "阶段缓存 10 分钟，不落盘"],
      provider: "渠道", calls: "逻辑请求", attempts: "最坏物理尝试", stages: "阶段", cache: "阶段缓存", cost: "费用", unknown: "未知",
      confirm: (min, max, attempts) => `我确认：本次计划 ${min}–${max} 次逻辑请求，网关最坏最多 ${attempts} 次物理尝试；费用未知。读取超时不自动重试。`,
      validationPass: "Music 3 静态合同通过", validationFail: "Music 3 输出需要修复", warnings: "人工复核项", noProjects: "暂无 Music 3 项目",
      projectSaved: "Music 3 项目已保存", projectDeleted: "Music 3 项目已删除", projectExported: "Music 3 项目已导出", expand: "展开高级参数", collapse: "收起高级参数",
      localStart: "开始本地 Music 3 增强", localSubtitle: "写音乐创意，按需生成或保护歌词，再使用本机 GGUF 模型完成分阶段增强。", localConfirm: (min, max) => `我确认：本次使用本机 GGUF 模型完成 ${min}–${max} 个阶段，不调用外部 API、不上传内容、不产生 API 费用。`, localEndpoint: "本机 llama-server", localCost: "0"
    },
    en: {
      video: "Video prompts", music: "Music 3", title: "MiniMax Music 3 lyrics and structured caption", subtitle: "Describe the music, generate or protect lyrics, then explicitly confirm the staged paid calls.",
      goal: "What music do you want to create?", goalLabel: "Music idea (genre, theme, mood, use, instruments, and arrangement)", plan: "Lyrics, structure, and generation constraints", result: "Music 3 outputs and validation",
      placeholder: "Example: a cinematic Mandarin pop ballad, female vocal growing from restraint to resolve, piano intro, strings in the chorus, no rap.",
      preflight: "Create Music 3 confirmation", start: "Confirm and enhance Music 3", copy: "Copy current", copyAll: "Copy all", copied: "✓ Copied",
      idle: "Music 3 has not run", running: "Music 3 is running in stages; duplicate submission is blocked…", completed: "Music 3 enhancement completed", failed: "Music 3 enhancement failed",
      previewKind: "Official Music 3 Skill", previewModels: "Text enhancement · four outputs", previewTitle: "Music 3 Prompt & Lyrics Enhancer",
      previewSummary: "Uses the official music-caption-rewriter through progressive disclosure of at most two indexes and three templates, returning original lyrics, a three-heading caption, payload JSON, and a safe report.",
      previewAnchors: ["Only the music idea is required", "Chinese caption by default", "Strict preservation and scoped lyric editing", "At most two indexes and three templates", "Ten-minute memory-only stage cache"],
      provider: "Provider", calls: "Logical calls", attempts: "Worst-case physical attempts", stages: "Stages", cache: "Stage cache", cost: "Cost", unknown: "Unknown",
      confirm: (min, max, attempts) => `I confirm ${min}–${max} logical calls and up to ${attempts} physical attempts in the gateway worst case. Cost is unknown; read timeouts are not retried.`,
      validationPass: "Music 3 static contract passed", validationFail: "Music 3 output needs repair", warnings: "Human review", noProjects: "No Music 3 projects",
      projectSaved: "Music 3 project saved", projectDeleted: "Music 3 project deleted", projectExported: "Music 3 project exported", expand: "Show advanced parameters", collapse: "Hide advanced parameters",
      localStart: "Start local Music 3 enhancement", localSubtitle: "Describe the music, generate or protect lyrics, then run the staged enhancement with a local GGUF model.", localConfirm: (min, max) => `I confirm ${min}–${max} stages will use a local GGUF model only, call no external API, upload no content, and incur no API fee.`, localEndpoint: "Local llama-server", localCost: "0"
    }
  };
  const FORM_COPY = {
    "zh-CN": {
      labels: {
        lyricsMode: "歌词模式", lyricsLanguage: "歌词语言", qualityMode: "质量模式", captionLanguage: "Music 3 描述语言",
        lyrics: "歌词（可选）", editRequest: "歌词润色要求", constraints: "硬性要求 / 排除项", duration: "目标时长（0=AUTO）",
        rewriteMode: "创作幅度", structure: "歌曲结构", customStructure: "自定义结构标签", customLanguage: "自定义歌词语言",
        bpm: "固定 BPM（0=AUTO）", keyScale: "调式（空=AUTO）", meter: "拍号", customMeter: "自定义拍号",
        captionWords: "描述词数（0=官方 250–450）", editScope: "歌词润色范围", editSection: "目标歌词段落", editOccurrence: "段落序号（0=全部）",
        semanticProfile: "歌词语义画像", manualProfile: "手动宽泛歌词画像", stageCache: "阶段续跑缓存", seed: "随机种子"
      },
      placeholders: {
        lyrics: "可粘贴带 [Verse] [Chorus] 等标签的歌词；严格保留模式不会让 LLM 重写歌词。",
        editRequest: "例如：只润色 [Verse]，保留 Chorus 原文。", constraints: "例如：不要说唱；副歌必须扩大声场；不使用过度自动调音。",
        manualProfile: "只写宽泛情绪、强度与能量弧，不要粘贴歌词原句。"
      },
      options: {
        lyricsMode: ["AUTO（有词保留，无词按意图）", "生成新歌词（T8 非官方）", "严格保留歌词", "按要求润色（T8 非官方）", "纯器乐"],
        lyricsLanguage: ["AUTO（按用户输入）", "中文", "English", "日本語", "한국어", "Custom（自定义）"],
        qualityMode: ["官方完整（渐进读取参考，推荐）", "快速核心（不运行模板选择）"], captionLanguage: ["中文（默认）", "English（官方默认）"],
        rewriteMode: ["严格", "平衡", "创意"], structure: ["AUTO（按风格与时长）", "Verse → Chorus", "Verse → Pre-Chorus → Chorus → Bridge", "Custom（自定义）"],
        meter: ["AUTO", "4/4", "3/4", "6/8", "Custom（自定义）"], editScope: ["AUTO（从要求识别）", "全文", "指定段落（全部同名段）", "指定段落（第 N 次）"],
        semanticProfile: ["隐私隔离（不发送歌词给 Caption 阶段）", "手动宽泛画像（不增加请求）", "LLM 宽泛分析（会发送歌词并可能增加请求）"],
        stageCache: ["开启（内存 10 分钟，推荐）", "关闭（每次重新请求）"]
      }
    },
    en: {
      labels: {
        lyricsMode: "Lyrics mode", lyricsLanguage: "Lyrics language", qualityMode: "Quality mode", captionLanguage: "Music 3 caption language",
        lyrics: "Lyrics (optional)", editRequest: "Lyric edit request", constraints: "Hard requirements / exclusions", duration: "Target duration (0=AUTO)",
        rewriteMode: "Creative latitude", structure: "Song structure", customStructure: "Custom section tags", customLanguage: "Custom lyrics language",
        bpm: "Fixed BPM (0=AUTO)", keyScale: "Key / scale (blank=AUTO)", meter: "Meter", customMeter: "Custom meter",
        captionWords: "Caption words (0=official 250–450)", editScope: "Lyric edit scope", editSection: "Target lyric section", editOccurrence: "Section occurrence (0=all)",
        semanticProfile: "Lyrics semantic profile", manualProfile: "Manual broad lyrics profile", stageCache: "Stage continuation cache", seed: "Seed"
      },
      placeholders: {
        lyrics: "Paste lyrics with tags such as [Verse] and [Chorus]. Preserve mode never asks the LLM to rewrite them.",
        editRequest: "Example: edit only [Verse] and preserve the Chorus verbatim.", constraints: "Example: no rap; widen the chorus; avoid heavy Auto-Tune.",
        manualProfile: "Describe broad mood, intensity, and energy arc without quoting the lyrics."
      },
      options: {
        lyricsMode: ["AUTO (preserve supplied lyrics; otherwise follow the idea)", "Generate new lyrics (T8 unofficial)", "Preserve lyrics strictly", "Edit a specified scope (T8 unofficial)", "Instrumental"],
        lyricsLanguage: ["AUTO (infer from user input)", "Chinese", "English", "Japanese", "Korean", "Custom"],
        qualityMode: ["Official full (progressive references, recommended)", "Fast core (no template selector)"], captionLanguage: ["Chinese (default)", "English (official default)"],
        rewriteMode: ["Strict", "Balanced", "Creative"], structure: ["AUTO (from style and duration)", "Verse → Chorus", "Verse → Pre-Chorus → Chorus → Bridge", "Custom"],
        meter: ["AUTO", "4/4", "3/4", "6/8", "Custom"], editScope: ["AUTO (infer from the request)", "Entire lyrics", "Named section (all occurrences)", "Named section (occurrence N)"],
        semanticProfile: ["Private (do not send lyrics to caption stage)", "Manual broad profile (no extra request)", "LLM broad analysis (sends lyrics and may add a request)"],
        stageCache: ["On (memory only, 10 minutes, recommended)", "Off (request every stage again)"]
      }
    }
  };
  const state = {
    capability: localStorage.getItem("t8-workbench-capability") === "music3" ? "music3" : "video_prompt",
    plan: null, runId: null, poll: null, outputs: null, activeOutput: "lyrics", selectedProjectId: null,
    videoIntent: "", musicIdea: localStorage.getItem("t8-music3-draft-idea") || "", videoSnapshot: null, musicStatusSnapshot: null
  };
  const locale = () => document.documentElement.lang === "en" ? "en" : "zh-CN";
  const t = (key) => COPY[locale()][key];
  const isMusic = () => state.capability === "music3";
  const hide = (element, hidden) => element?.classList.toggle("hidden", hidden);

  function currentStatusSnapshot() {
    return {
      message: elements.runStatusMessage?.textContent || "",
      state: elements.runStatus.dataset.state || "idle",
      hidden: elements.runStatus.classList.contains("hidden"),
      action: elements.runStatusAction?.dataset.action || ""
    };
  }

  function applyStatusSnapshot(snapshot, { musicTouched = false } = {}) {
    const value = snapshot || { message: "", state: "idle", hidden: true, action: "" };
    if (elements.runStatusMessage) elements.runStatusMessage.textContent = value.message || "";
    elements.runStatus.dataset.state = value.state || "idle";
    elements.runStatus.classList.toggle("hidden", Boolean(value.hidden));
    if (elements.runStatusAction) {
      elements.runStatusAction.dataset.action = value.action || "";
      elements.runStatusAction.classList.toggle("hidden", !value.action);
      if (value.action) elements.runStatusAction.textContent = value.action === "advanced"
        ? (locale() === "en" ? "Open advanced settings" : "打开高级设置")
        : (locale() === "en" ? "Open API settings" : "打开 API 设置");
    }
    elements.runStatus.dataset.musicTouched = musicTouched ? "true" : "";
  }

  function providerId() { return elements.providerCards.querySelector(".provider-card.active")?.dataset.providerId || "seedance_nz"; }
  function invalidate() {
    state.plan = null;
    elements.preflightCard.classList.add("hidden");
    elements.confirm.checked = false;
    elements.start.disabled = true;
    if (isMusic()) queueMicrotask(renderMusicPreview);
  }

  function dynamicFields() {
    const editing = elements.lyricsMode.value === "edit";
    const instrumental = elements.lyricsMode.value === "instrumental";
    hide(elements.lyricsField, instrumental);
    hide(elements.editRequestField, !editing);
    hide(elements.customLanguageField, elements.lyricsLanguage.value !== "custom");
    hide(elements.customStructureField, elements.structure.value !== "custom");
    hide(elements.customMeterField, elements.meter.value !== "custom");
    hide(elements.manualProfileField, elements.semanticProfile.value !== "manual");
  }

  function renderMusicFormLocale() {
    const copy = FORM_COPY[locale()];
    for (const [key, value] of Object.entries(copy.labels)) {
      const label = elements[key]?.closest("label");
      const span = label?.querySelector(":scope > span");
      if (span) span.textContent = value;
    }
    for (const [key, value] of Object.entries(copy.placeholders)) if (elements[key]) elements[key].placeholder = value;
    for (const [key, labels] of Object.entries(copy.options)) {
      const options = [...(elements[key]?.options || [])];
      labels.forEach((value, index) => { if (options[index]) options[index].textContent = value; });
    }
    const expanded = elements.toggleAdvanced.getAttribute("aria-expanded") === "true";
    elements.toggleAdvanced.textContent = expanded ? t("collapse") : t("expand");
  }
  function selectedText(element) { return element?.selectedOptions?.[0]?.textContent?.trim() || element?.value || "—"; }

  function renderMusicPreview() {
    const english = locale() === "en";
    const idea = elements.intent.value.trim();
    const planCalls = state.plan ? `${state.plan.logicalCallsMinimum}–${state.plan.logicalCallsMaximum}` : (english ? "shown after preflight" : "预检后显示");
    const anchors = english ? [
      `Lyrics: ${selectedText(elements.lyricsMode)}`,
      `Structure: ${selectedText(elements.structure)}`,
      `Duration: ${Number(elements.duration.value || 0) || "AUTO"}`,
      `Caption: ${selectedText(elements.captionLanguage)}`,
      `Privacy: ${selectedText(elements.semanticProfile)}`,
      `Logical calls: ${planCalls}`
    ] : [
      `歌词：${selectedText(elements.lyricsMode)}`,
      `结构：${selectedText(elements.structure)}`,
      `时长：${Number(elements.duration.value || 0) ? `${Number(elements.duration.value)} 秒` : "AUTO"}`,
      `描述：${selectedText(elements.captionLanguage)}`,
      `隐私：${selectedText(elements.semanticProfile)}`,
      `逻辑请求：${planCalls}`
    ];
    elements.previewImage.hidden = true;
    elements.previewPlaceholder.hidden = false;
    elements.previewPlaceholder.classList.remove("hidden");
    byId("workbench-preview-media").dataset.state = "music";
    elements.previewPlaceholder.querySelector("span").textContent = "M3";
    elements.previewPlaceholder.querySelector("small").textContent = "OFFICIAL SKILL";
    elements.previewBadge.textContent = "Music 3";
    elements.previewKind.textContent = t("previewKind");
    elements.previewModels.textContent = `${selectedText(elements.lyricsMode)} · ${selectedText(elements.qualityMode)}`;
    elements.previewTitle.textContent = english ? "Current music plan" : "当前音乐方案";
    elements.previewSummary.textContent = idea || (english ? "Write a music idea to see its live plan summary." : "输入音乐创意后，这里会实时汇总歌词、结构、语言、隐私与调用计划。");
    elements.previewAnchorsLabel.textContent = english ? "Live plan" : "实时方案";
    elements.previewAnchors.replaceChildren(...anchors.map((value) => { const li = document.createElement("li"); li.textContent = value; return li; }));
    elements.previewTemplateId.textContent = "MiniMaxMusic3PromptEnhancerT8 · official snapshot d836359b…";
  }
  function renderCapability() {
    const music = isMusic();
    const english = locale() === "en";
    elements.dialog.dataset.capability = state.capability;
    elements.videoButton.classList.toggle("active", !music); elements.videoButton.setAttribute("aria-pressed", String(!music));
    elements.musicButton.classList.toggle("active", music); elements.musicButton.setAttribute("aria-pressed", String(music));
    elements.videoButton.textContent = t("video"); elements.musicButton.textContent = t("music");
    hide(elements.videoParameters, music); hide(elements.musicParameters, !music); hide(elements.resultTabs, !music); hide(elements.copyAll, !music);
    hide(elements.route, music); hide(elements.routerResults, music); hide(elements.template.closest("label"), music); hide(elements.templateSummary, music);
    const steps = [...document.querySelectorAll("[data-workbench-step]")];
    if (music) {
      const local = providerId() === "local_qwen";
      elements.title.textContent = t("title"); elements.subtitle.textContent = local ? t("localSubtitle") : t("subtitle");
      elements.intentTitle.textContent = t("goal"); elements.intentLabel.textContent = t("goalLabel"); elements.intent.placeholder = t("placeholder");
      elements.planTitle.textContent = t("plan"); elements.resultTitle.textContent = t("result"); elements.preflight.textContent = t("preflight"); elements.start.textContent = local ? t("localStart") : t("start");
      elements.copyCurrent.textContent = t("copy"); elements.copyAll.textContent = t("copyAll");
      const musicSteps = english ? [["Music idea", "Brief"], ["Lyrics & parameters", "Structure"], ["Results", "Copy & review"]] : [["音乐创意", "创作简报"], ["歌词与参数", "结构约束"], ["结果验收", "复制与复盘"]];
      steps.forEach((button, index) => { button.querySelector("strong").textContent = musicSteps[index][0]; button.querySelector("small").textContent = musicSteps[index][1]; });
      applyStatusSnapshot(state.musicStatusSnapshot || { message: t("idle"), state: "idle", hidden: false, action: "" }, { musicTouched: true });
      renderMusicFormLocale(); renderMusicPreview(); dynamicFields(); renderOutput();
    } else {
      elements.title.textContent = english ? "Prompt instantiation and API enhancement" : "提示词实例化与 API 增强";
      elements.subtitle.textContent = english ? "Choose a mechanism, complete its structure, then explicitly confirm one paid call." : "先选机制，再补齐结构，最后由你确认一次付费调用。";
      elements.intentTitle.textContent = english ? "What do you want to create?" : "你想做什么？";
      elements.intentLabel.textContent = english ? "Creative goal and facts that must remain" : "创作目标与必须保留的事实";
      elements.intent.placeholder = english ? "Example: prove three capabilities of a folding camera in 15 seconds and hold a clear result." : "例如：一位产品设计师在15秒内证明一台折叠相机的三项能力，结尾要有明确结果，不要旁白。";
      elements.planTitle.textContent = english ? "Choose how to generate" : "确认怎么生成";
      elements.resultTitle.textContent = english ? "Generated result" : "生成结果";
      elements.preflight.textContent = english ? "Generate prompt" : "生成提示词";
      elements.start.textContent = english ? "Confirm and enhance" : "确认并开始增强";
      elements.copyCurrent.textContent = english ? "Copy result" : "复制结果";
      elements.confirmLabel.textContent = english ? "I confirm one chat request; Seedance also uploads each selected media item. Cost is unknown and no retry is automatic." : "我确认：提交1次对话请求；平价小屋还会按素材数上传。费用未知，全部不自动重试。";
      const videoSteps = english ? [["Describe your goal", "What you want"], ["Choose how to generate", "Model, duration and media"], ["Get your prompt", "Copy or refine"]] : [["告诉我想做什么", "描述目标"], ["确认生成方式", "模型、时长和素材"], ["拿到提示词", "复制或修改"]];
      steps.forEach((button, index) => { button.querySelector("strong").textContent = videoSteps[index][0]; button.querySelector("small").textContent = videoSteps[index][1]; });
      if (state.videoSnapshot) {
        elements.output.value = state.videoSnapshot.output;
        elements.validation.innerHTML = state.videoSnapshot.validation;
        applyStatusSnapshot(state.videoSnapshot.status);
        elements.copyCurrent.disabled = !state.videoSnapshot.output;
      }
    }
  }
  function switchCapability(next) {
    if (next === state.capability) return;
    if (isMusic()) {
      state.musicIdea = elements.intent.value;
      state.musicStatusSnapshot = currentStatusSnapshot();
      localStorage.setItem("t8-music3-draft-idea", state.musicIdea);
    }
    else {
      state.videoIntent = elements.intent.value;
      state.videoSnapshot = {
        output: elements.output.value,
        validation: elements.validation.innerHTML,
        status: currentStatusSnapshot()
      };
      byId("workbench-constraints")?.dispatchEvent(new Event("input", { bubbles: true }));
    }
    state.capability = next;
    localStorage.setItem("t8-workbench-capability", next);
    elements.intent.value = isMusic() ? state.musicIdea : state.videoIntent;
    stopPolling(); invalidate();
    state.runId = null; state.outputs = null; state.selectedProjectId = null;
    renderCapability();
    window.dispatchEvent(new CustomEvent("t8:workbench-capability-change", { detail: { capability: state.capability } }));
    if (isMusic()) void renderProjects();
    else { elements.template.dispatchEvent(new Event("change")); void renderVideoProjects(); }
  }

  function currentInput() {
    return {
      providerId: providerId(), baseUrl: elements.baseUrl.value, model: elements.model.value,
      musicIdea: elements.intent.value, lyricsMode: elements.lyricsMode.value, lyrics: elements.lyrics.value,
      lyricsLanguage: elements.lyricsLanguage.value, customLyricsLanguage: elements.customLanguage.value,
      targetDurationSeconds: Number(elements.duration.value || 0), rewriteMode: elements.rewriteMode.value,
      qualityMode: elements.qualityMode.value, structurePreset: elements.structure.value, customStructure: elements.customStructure.value,
      lyricsEditRequest: elements.editRequest.value, constraints: elements.constraints.value, fixedBpm: Number(elements.bpm.value || 0),
      keyScale: elements.keyScale.value, meter: elements.meter.value, customMeter: elements.customMeter.value,
      captionLanguage: elements.captionLanguage.value, captionTargetWords: Number(elements.captionWords.value || 0),
      lyricsEditScope: elements.editScope.value, lyricsEditSection: elements.editSection.value,
      lyricsEditOccurrence: Number(elements.editOccurrence.value || 0), semanticProfileMode: elements.semanticProfile.value,
      manualLyricsProfile: elements.manualProfile.value, stageCache: elements.stageCache.value, seed: Number(elements.seed.value || 0)
    };
  }

  function status(message, kind = "idle") {
    state.musicStatusSnapshot = { message, state: kind, hidden: false, action: "" };
    applyStatusSnapshot(state.musicStatusSnapshot, { musicTouched: true });
  }

  function renderPreflight(plan) {
    elements.preflightFacts.replaceChildren();
    const local = plan.confirmationKind === "local_compute";
    const facts = [
      [t("provider"), plan.providerLabel], ["Model", plan.model], ["Endpoint", local ? t("localEndpoint") : plan.endpointHost],
      [t("calls"), `${plan.logicalCallsMinimum}–${plan.logicalCallsMaximum}`], [t("attempts"), plan.physicalAttemptsMaximum],
      [t("stages"), plan.plannedStages.join(" → ")], [t("cache"), plan.stageCache], [t("cost"), local ? t("localCost") : t("unknown")]
    ];
    for (const [term, value] of facts) { const dt = document.createElement("dt"); dt.textContent = term; const dd = document.createElement("dd"); dd.textContent = String(value); elements.preflightFacts.append(dt, dd); }
    elements.confirmLabel.textContent = local ? t("localConfirm")(plan.logicalCallsMinimum, plan.logicalCallsMaximum) : t("confirm")(plan.logicalCallsMinimum, plan.logicalCallsMaximum, plan.physicalAttemptsMaximum);
    elements.start.textContent = local ? t("localStart") : t("start");
    elements.preflightCard.classList.remove("hidden"); elements.confirm.checked = false; elements.start.disabled = true;
    status(locale() === "en" ? "Music 3 confirmation is ready. Any edit invalidates it." : "Music 3 确认单已生成；修改任意字段后需重新预检。", "success");
    renderMusicPreview();
  }

  async function preflight(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    try { state.plan = await api.preflightMusic3(currentInput()); renderPreflight(state.plan); }
    catch (error) { state.plan = null; elements.preflightCard.classList.add("hidden"); status(error.message || t("failed"), "error"); }
  }

  function renderOutput() {
    if (!isMusic()) return;
    const text = state.outputs?.[state.activeOutput] || "";
    elements.output.textContent = text;
    elements.copyCurrent.disabled = !text;
    elements.copyAll.disabled = !state.outputs;
    for (const button of elements.resultTabs.querySelectorAll("[data-music3-output]")) {
      const active = button.dataset.music3Output === state.activeOutput;
      button.classList.toggle("active", active); button.setAttribute("aria-selected", String(active));
    }
  }

  function renderValidation(report) {
    elements.validation.replaceChildren();
    if (!report) return;
    const heading = document.createElement("strong"); heading.textContent = report.status === "pass" ? t("validationPass") : t("validationFail");
    elements.validation.append(heading);
    const issues = [...(report.errors || []), ...(report.warnings || [])];
    if (issues.length) { const label = document.createElement("p"); label.textContent = t("warnings"); const list = document.createElement("ul"); for (const issue of issues) { const li = document.createElement("li"); li.textContent = String(issue); list.append(li); } elements.validation.append(label, list); }
  }

  async function start(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!state.plan || !elements.confirm.checked) return;
    elements.start.disabled = true;
    try {
      const run = await api.startMusic3({ planHash: state.plan.planHash, confirmed: true });
      state.runId = run.runId; state.outputs = null; state.selectedProjectId = null;
      elements.projectName.value = `Music 3 · ${new Date().toLocaleString()}`; elements.projectNotes.value = "";
      elements.saveProject.disabled = true; elements.copyCurrent.disabled = true; elements.copyAll.disabled = true;
      elements.cancel.classList.remove("hidden"); status(t("running"), "running");
      document.querySelector('[data-workbench-step="result"]')?.click();
      pollRun();
    } catch (error) { status(error.message || t("failed"), "error"); }
  }

  function stopPolling() { clearTimeout(state.poll); state.poll = null; }
  async function pollRun() {
    stopPolling(); if (!state.runId) return;
    try {
      const run = await api.music3Status(state.runId);
      if (run.state === "running") { state.poll = setTimeout(pollRun, 650); return; }
      elements.cancel.classList.add("hidden");
      if (run.state === "completed") {
        state.outputs = run.outputs; state.activeOutput = "lyrics"; renderOutput(); renderValidation(run.validation);
        elements.saveProject.disabled = false;
        status(`${t("completed")} · ${run.providerLabel} · ${run.receipt?.logicalRequestCount ?? "—"} calls`, "success");
      } else if (run.state === "cancel_requested") status(run.cancellationMessage || t("failed"), "warning");
      else status(`${t("failed")}: ${run.error?.message || run.error?.code || "unknown"}`, "error");
    } catch (error) { status(error.message || t("failed"), "error"); }
  }

  async function cancel(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!state.runId) return;
    try { const run = await api.cancelMusic3(state.runId); status(run.cancellationMessage || t("failed"), "warning"); elements.cancel.disabled = true; }
    catch (error) { status(error.message, "error"); }
  }

  async function copy(text, button, original) {
    if (!text) return;
    try { await api.copyText(text); button.textContent = t("copied"); button.classList.add("is-copied"); setTimeout(() => { button.textContent = original; button.classList.remove("is-copied"); }, 1600); }
    catch (error) { status(error.message, "error"); }
  }

  function allOutputsText() {
    if (!state.outputs) return "";
    return ["# Lyrics", state.outputs.lyrics, "# Music 3 Structured Caption", state.outputs.musicCaption, "# Music 3 Payload JSON", state.outputs.music3PayloadJson, "# Enhancement Report JSON", state.outputs.enhancementReportJson].join("\n\n");
  }

  async function renderProjects(selectedId = state.selectedProjectId) {
    if (!isMusic()) return;
    const projects = (await api.promptProjects()).filter((project) => project.capability === "music3");
    elements.projectList.replaceChildren();
    const empty = document.createElement("option"); empty.value = ""; empty.textContent = t("noProjects"); elements.projectList.append(empty);
    for (const project of projects) { const option = document.createElement("option"); option.value = project.projectId; option.textContent = `${project.title} · Music 3`; elements.projectList.append(option); }
    if (selectedId && projects.some((project) => project.projectId === selectedId)) elements.projectList.value = selectedId;
    elements.exportProject.disabled = !elements.projectList.value; elements.deleteProject.disabled = !elements.projectList.value;
  }

  async function renderVideoProjects(selectedId = null) {
    if (isMusic()) return;
    const projects = (await api.promptProjects()).filter((project) => project.capability !== "music3");
    elements.projectList.replaceChildren();
    const empty = document.createElement("option"); empty.value = ""; empty.textContent = locale() === "en" ? "No saved projects" : "暂无已保存项目"; elements.projectList.append(empty);
    for (const project of projects) {
      const option = document.createElement("option"); option.value = project.projectId; option.textContent = `${project.title} · ${project.target || "video"}`; elements.projectList.append(option);
    }
    if (selectedId && projects.some((project) => project.projectId === selectedId)) elements.projectList.value = selectedId;
    elements.exportProject.disabled = !elements.projectList.value; elements.deleteProject.disabled = !elements.projectList.value;
  }

  function setField(element, value) { if (element && value !== undefined && value !== null) element.value = String(value); }
  async function loadProject(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const id = elements.projectList.value; state.selectedProjectId = id || null;
    elements.exportProject.disabled = !id; elements.deleteProject.disabled = !id;
    if (!id) return;
    const project = await api.promptProject(id); if (!project || project.capability !== "music3") return;
    elements.intent.value = project.musicIdea || ""; elements.lyrics.value = project.inputLyrics || project.outputs?.lyrics || ""; setField(elements.lyricsMode, project.lyricsMode); setField(elements.lyricsLanguage, project.lyricsLanguage); setField(elements.customLanguage, project.customLyricsLanguage);
    setField(elements.duration, project.targetDurationSeconds); setField(elements.rewriteMode, project.rewriteMode); setField(elements.qualityMode, project.qualityMode);
    setField(elements.structure, project.structurePreset); setField(elements.customStructure, project.customStructure); setField(elements.editRequest, project.lyricsEditRequest);
    setField(elements.constraints, project.constraints); setField(elements.bpm, project.fixedBpm); setField(elements.keyScale, project.keyScale); setField(elements.meter, project.meter);
    setField(elements.customMeter, project.customMeter); setField(elements.captionLanguage, project.captionLanguage); setField(elements.captionWords, project.captionTargetWords);
    setField(elements.editScope, project.lyricsEditScope); setField(elements.editSection, project.lyricsEditSection); setField(elements.editOccurrence, project.lyricsEditOccurrence);
    setField(elements.semanticProfile, project.semanticProfileMode); setField(elements.manualProfile, project.manualLyricsProfile); setField(elements.stageCache, project.stageCache); setField(elements.seed, project.seed);
    elements.projectName.value = project.title || ""; elements.projectNotes.value = project.notes || ""; state.outputs = project.outputs || null; state.activeOutput = "lyrics"; state.runId = null;
    renderOutput(); renderValidation(project.validation); elements.saveProject.disabled = false; dynamicFields(); invalidate();
  }

  async function saveProject(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!state.runId && !state.selectedProjectId) return;
    try {
      const project = await api.savePromptProject({ capability: "music3", runId: state.runId, projectId: state.selectedProjectId, title: elements.projectName.value, notes: elements.projectNotes.value });
      state.selectedProjectId = project.projectId; elements.projectName.value = project.title; await renderProjects(project.projectId); status(t("projectSaved"), "success");
    } catch (error) { status(error.message, "error"); }
  }

  async function exportProject(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!state.selectedProjectId) return;
    try { const result = await api.exportPromptProject(state.selectedProjectId); if (result.saved) status(t("projectExported"), "success"); }
    catch (error) { status(error.message, "error"); }
  }

  async function deleteProject(event) {
    if (!isMusic()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!state.selectedProjectId) return;
    try { await api.deletePromptProject(state.selectedProjectId); state.selectedProjectId = null; await renderProjects(); status(t("projectDeleted"), "success"); }
    catch (error) { status(error.message, "error"); }
  }

  elements.capabilitySwitch.addEventListener("click", (event) => { const button = event.target.closest("[data-workbench-capability]"); if (button) switchCapability(button.dataset.workbenchCapability); });
  elements.providerCards.addEventListener("click", () => { if (isMusic()) queueMicrotask(renderCapability); });
  elements.preflight.addEventListener("click", (event) => void preflight(event), true);
  elements.start.addEventListener("click", (event) => void start(event), true);
  elements.cancel.addEventListener("click", (event) => void cancel(event), true);
  elements.copyCurrent.addEventListener("click", (event) => { if (!isMusic()) return; event.preventDefault(); event.stopImmediatePropagation(); void copy(state.outputs?.[state.activeOutput], elements.copyCurrent, t("copy")); }, true);
  elements.copyAll.addEventListener("click", () => void copy(allOutputsText(), elements.copyAll, t("copyAll")));
  elements.resultTabs.addEventListener("click", (event) => { const button = event.target.closest("[data-music3-output]"); if (!button) return; state.activeOutput = button.dataset.music3Output; renderOutput(); });
  elements.projectList.addEventListener("change", (event) => void loadProject(event), true);
  elements.saveProject.addEventListener("click", (event) => void saveProject(event), true);
  elements.exportProject.addEventListener("click", (event) => void exportProject(event), true);
  elements.deleteProject.addEventListener("click", (event) => void deleteProject(event), true);
  elements.confirm.addEventListener("change", (event) => { if (!isMusic()) return; event.stopImmediatePropagation(); elements.start.disabled = !state.plan || !elements.confirm.checked; }, true);
  elements.toggleAdvanced.addEventListener("click", () => { const expanded = elements.toggleAdvanced.getAttribute("aria-expanded") !== "true"; elements.toggleAdvanced.setAttribute("aria-expanded", String(expanded)); elements.advanced.classList.toggle("hidden", !expanded); elements.toggleAdvanced.textContent = expanded ? t("collapse") : t("expand"); });
  for (const element of elements.musicParameters.querySelectorAll("input, textarea, select")) {
    element.addEventListener("input", () => { if (isMusic()) invalidate(); });
    element.addEventListener("change", () => { dynamicFields(); if (isMusic()) invalidate(); });
  }
  elements.intent.addEventListener("input", () => { if (isMusic()) { state.musicIdea = elements.intent.value; localStorage.setItem("t8-music3-draft-idea", state.musicIdea); invalidate(); renderMusicPreview(); } }, true);
  elements.providerCards.addEventListener("click", () => { if (isMusic()) invalidate(); });
  window.addEventListener("t8:music3-bridge", (event) => {
    const bridge = event.detail;
    if (!bridge || bridge.schemaVersion !== "t8-video-music-bridge/v1") return;
    if (!isMusic()) switchCapability("music3");
    const beats = (bridge.beatPoints || []).join(", ");
    const sounds = (bridge.soundEvents || []).map((item) => `${item.at}s ${item.requirement}`).join("；");
    state.musicIdea = `${locale() === "en" ? "Video-bound Music 3 brief" : "视频绑定的 Music 3 创意简报"}\n${locale() === "en" ? "Duration" : "时长"}: ${bridge.durationSeconds}s\n${locale() === "en" ? "Beat points" : "节拍点"}: ${beats}\n${locale() === "en" ? "Sound events" : "声音事件"}: ${sounds || "—"}\nSource revision: ${bridge.sourceRevisionId} / ${bridge.sourceRevisionSha256}`;
    elements.intent.value = state.musicIdea;
    elements.duration.value = String(bridge.durationSeconds || 0);
    localStorage.setItem("t8-music3-draft-idea", state.musicIdea);
    invalidate(); renderCapability();
  });
  for (const control of [byId("workbench-step-nav"), byId("workbench-prev-step"), byId("workbench-next-step")]) {
    control?.addEventListener("click", () => { if (isMusic()) queueMicrotask(renderCapability); });
  }
  new MutationObserver(() => renderCapability()).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  new MutationObserver(() => {
    if (!elements.dialog.open) return;
    renderCapability();
    if (isMusic()) { elements.intent.value = state.musicIdea; void renderProjects(); }
    else void renderVideoProjects();
  }).observe(elements.dialog, { attributes: true, attributeFilter: ["open"] });
  renderCapability();
})();
