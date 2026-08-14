const crypto = require("node:crypto");
const {
  PROVIDERS,
  PromptProviderError,
  normalizeOpenAiChatUrl,
  sha256Canonical
} = require("./prompt-providers.cjs");
const {
  FAMILIES,
  OFFICIAL_NORMALIZED_TREE_SHA256,
  OFFICIAL_SOURCE_COMMIT,
  loadRouter,
  loadSkill,
  validateOfficialResources
} = require("./music3-resources.cjs");

const SCHEMA_VERSION = "t8-music3-enhance-request/v1";
const REPORT_SCHEMA = "t8-music3-enhancement-report/v1";
const LYRICS_MODES = new Set(["auto", "generate", "preserve", "edit", "instrumental"]);
const LYRICS_LANGUAGES = new Set(["auto", "zh", "en", "ja", "ko", "custom"]);
const REWRITE_MODES = new Set(["strict", "balanced", "creative"]);
const QUALITY_MODES = new Set(["fast", "full"]);
const STRUCTURES = new Set(["auto", "verse_chorus", "pop", "custom"]);
const METERS = new Set(["auto", "4/4", "3/4", "6/8", "custom"]);
const CAPTION_LANGUAGES = new Set(["zh-CN", "en"]);
const EDIT_SCOPES = new Set(["auto", "all", "section", "occurrence"]);
const EDIT_SECTIONS = new Set(["Intro", "Verse", "Pre-Chorus", "Chorus", "Post-Chorus", "Bridge", "Instrumental", "Solo", "Outro"]);
const SEMANTIC_PROFILES = new Set(["privacy", "manual", "llm"]);
const STAGE_CACHE_MODES = new Set(["on", "off"]);
const STRUCTURE_TAGS = Object.freeze({
  verse_chorus: ["[Verse]", "[Chorus]", "[Verse]", "[Chorus]", "[Outro]"],
  pop: ["[Intro]", "[Verse]", "[Pre-Chorus]", "[Chorus]", "[Verse]", "[Chorus]", "[Bridge]", "[Chorus]", "[Outro]"]
});
const TEMPERATURES = Object.freeze({
  lyrics: { strict: 0.35, balanced: 0.75, creative: 1.05 },
  router: 0.1,
  selector: 0.15,
  caption: { strict: 0.2, balanced: 0.45, creative: 0.7 },
  profile: 0.1,
  language_repair: 0.2
});
const FAMILY_CUES = Object.freeze([
  ["club-edm-house-trance", ["edm", "house", "trance", "hardstyle", "dubstep", "techno", "浩室", "电音节"]],
  ["dance-pop-disco-funk", ["dance-pop", "dance pop", "nu-disco", "disco", "funk", "迪斯科", "放克"]],
  ["metal-heavy-rock", ["metalcore", "metal", "hard rock", "post-hardcore", "重金属", "硬摇滚"]],
  ["hip-hop-rap", ["hip-hop", "hip hop", "rap", "trap", "drill", "说唱", "嘻哈"]],
  ["jazz-swing-big-band", ["jazz", "swing", "big band", "bossa nova", "爵士", "摇摆乐"]],
  ["country-americana", ["country", "americana", "bluegrass", "rockabilly", "乡村", "蓝草"]],
  ["modern-rnb-neo-soul", ["neo-soul", "alternative r&b", "trap soul", "r&b", "节奏布鲁斯", "新灵魂"]],
  ["soul-blues-gospel", ["gospel", "blues", "soul", "福音", "蓝调", "灵魂乐"]],
  ["cinematic-orchestral-epic", ["film score", "trailer", "orchestral score", "epic choral", "电影配乐", "预告片配乐", "史诗合唱"]],
  ["cinematic-pop-ballad", ["cinematic pop", "orchestral pop", "cinematic ballad", "电影感流行", "管弦流行"]],
  ["electronic-synth-ambient-pop", ["synth-pop", "dream pop", "ambient pop", "darkwave", "retrowave", "合成器流行", "梦幻流行"]],
  ["traditional-vocal-stage", ["musical theatre", "show tune", "cabaret", "doo-wop", "a cappella", "音乐剧", "阿卡贝拉"]],
  ["pop-alternative-rock", ["pop rock", "alternative rock", "indie rock", "arena rock", "punk", "j-rock", "流行摇滚", "另类摇滚"]],
  ["contemporary-folk-acoustic", ["indie folk", "folk pop", "singer-songwriter", "acoustic pop", "独立民谣", "唱作人"]],
  ["roots-traditional-global", ["celtic", "traditional folk", "reggae", "maritime", "world music", "凯尔特", "传统民乐", "雷鬼"]],
  ["east-asian-modern", ["mandopop", "c-pop", "cantopop", "华语流行", "国语流行", "粤语流行", "中文流行"]],
  ["east-asian-ballad-heritage", ["guofeng", "国风流行", "华语情歌", "粤语情歌", "东方抒情"]]
]);

function clean(value, limit, field, required = false) {
  const text = String(value || "").replace(/\r\n/gu, "\n").trim();
  if (required && !text) throw new PromptProviderError(`${field} is required.`, { code: "invalid_input", phase: "preflight" });
  if (text.length > limit) throw new PromptProviderError(`${field} is too long.`, { code: "input_too_large", phase: "preflight" });
  return text;
}

function option(value, allowed, fallback) {
  const normalized = String(value || "");
  return allowed.has(normalized) ? normalized : fallback;
}

function rejectSecrets(values) {
  const text = Object.values(values).map((value) => typeof value === "string" ? value : "").join("\n");
  if (/\bsk-[A-Za-z0-9_-]{8,}\b/gu.test(text) || /(?:api[_ -]?key|authorization)\s*[:=]\s*\S+/giu.test(text)) {
    throw new PromptProviderError("Music inputs must not contain API keys or authorization headers.", { code: "secret_in_content", phase: "preflight" });
  }
}

function normalizeModel(value, provider) {
  const model = String(value || provider.defaultModel || "").trim();
  if (!model || /\s/u.test(model) || model.length > 160) {
    throw new PromptProviderError("A valid model ID is required.", { code: "invalid_model", phase: "preflight" });
  }
  return model;
}

function ideaRequestsInstrumental(value) {
  const text = String(value || "").toLocaleLowerCase();
  return /(?:纯器乐|无人声|不要人声|instrumental|no vocals|without vocals)/u.test(text) && !/(?:不是纯器乐|not instrumental)/u.test(text);
}

function effectiveLyricsMode(mode, lyrics, idea) {
  if (mode !== "auto") return mode;
  if (lyrics.trim()) return "preserve";
  return ideaRequestsInstrumental(idea) ? "instrumental" : "generate";
}

function inferLanguage(value, custom, idea, lyrics) {
  if (value === "custom") return clean(custom, 120, "Custom lyrics language", true);
  if (value !== "auto") return value;
  const sample = `${lyrics}\n${idea}`;
  if (/[\u3040-\u30ff]/u.test(sample)) return "ja";
  if (/[\uac00-\ud7af]/u.test(sample)) return "ko";
  if (/[\u3400-\u9fff]/u.test(sample)) return "zh";
  return "en";
}

function requestedStructure(preset, custom) {
  if (preset === "custom") {
    const tags = clean(custom, 1000, "Custom structure", true).match(/\[(?:Intro|Verse|Pre-Chorus|Chorus|Post-Chorus|Bridge|Instrumental|Solo|Outro)\]/gu) || [];
    if (!tags.length) throw new PromptProviderError("Custom structure must contain official section tags.", { code: "invalid_structure", phase: "preflight" });
    return tags.slice(0, 30);
  }
  return STRUCTURE_TAGS[preset] || [];
}

function resolveEditScope(input, lyrics) {
  if (input.lyricsEditScope === "all") return { mode: "all", sections: [], occurrence: 0 };
  let mode = input.lyricsEditScope;
  let section = input.lyricsEditSection;
  let occurrence = input.lyricsEditOccurrence;
  if (mode === "auto") {
    const request = input.lyricsEditRequest;
    const found = [...EDIT_SECTIONS].find((name) => new RegExp(`\\[?${name.replace("-", "[- ]?")}\\]?`, "iu").test(request));
    if (!found) {
      if (/(?:全文|整首|all lyrics|whole song)/iu.test(request)) return { mode: "all", sections: [], occurrence: 0 };
      throw new PromptProviderError("AUTO lyric editing could not determine a safe scope. Choose all, section, or occurrence.", { code: "edit_scope_ambiguous", phase: "preflight" });
    }
    section = found;
    occurrence = Number(request.match(/(?:第|#)\s*(\d+)/u)?.[1] || 0);
    mode = occurrence ? "occurrence" : "section";
  }
  if (!lyrics.includes(`[${section}]`)) throw new PromptProviderError(`Lyrics do not contain [${section}].`, { code: "edit_section_missing", phase: "preflight" });
  if (mode === "occurrence" && occurrence < 1) throw new PromptProviderError("A positive section occurrence is required.", { code: "edit_occurrence_missing", phase: "preflight" });
  return { mode, sections: [section], occurrence: mode === "occurrence" ? occurrence : 0 };
}

function localFamilyCandidates(text) {
  const haystack = String(text || "").toLocaleLowerCase();
  const matches = FAMILY_CUES.filter(([, cues]) => cues.some((cue) => haystack.includes(cue))).map(([family]) => family);
  return [...new Set(matches)].slice(0, 2);
}

function requestBudget(input) {
  const generated = input.effectiveLyricsMode === "generate" || input.effectiveLyricsMode === "edit";
  const profile = input.effectiveLyricsMode === "preserve" && input.semanticProfileMode === "llm" ? 1 : 0;
  if (input.qualityMode === "fast") return { minimum: 1 + Number(generated) + profile, maximum: 1 + Number(generated) + profile + Number(generated), stages: [generated && "lyrics", profile && "profile", "caption"].filter(Boolean) };
  const route = input.localFamilies.length ? 0 : 1;
  return {
    minimum: 2 + route + Number(generated) + profile,
    maximum: 2 + route + Number(generated) + profile + Number(generated),
    stages: [generated && "lyrics", profile && "profile", route && "route", "select", "caption", generated && "language-repair-if-needed"].filter(Boolean)
  };
}

function validateConflicts(input) {
  if (input.effectiveLyricsMode === "instrumental" && input.lyrics) throw new PromptProviderError("Instrumental mode cannot include lyrics.", { code: "instrumental_has_lyrics", phase: "preflight" });
  if (["preserve", "edit"].includes(input.effectiveLyricsMode) && !input.lyrics) throw new PromptProviderError("This lyrics mode requires lyrics.", { code: "lyrics_missing", phase: "preflight" });
  if (input.effectiveLyricsMode === "edit" && !input.lyricsEditRequest) throw new PromptProviderError("Lyric editing requires an edit request.", { code: "edit_request_missing", phase: "preflight" });
  if (input.fixedBpm && (input.fixedBpm < 30 || input.fixedBpm > 300)) throw new PromptProviderError("Fixed BPM must be 0 or between 30 and 300.", { code: "invalid_bpm", phase: "preflight" });
  if (input.meter === "custom" && !input.customMeter) throw new PromptProviderError("A custom meter is required.", { code: "invalid_meter", phase: "preflight" });
  if (input.semanticProfileMode === "manual" && !input.manualLyricsProfile) throw new PromptProviderError("Manual semantic profile text is required.", { code: "manual_profile_missing", phase: "preflight" });
}

function normalizeMusicPlan(input = {}) {
  validateOfficialResources();
  const provider = PROVIDERS[input.providerId];
  if (!provider) throw new PromptProviderError("Unsupported provider.", { code: "invalid_provider", phase: "preflight" });
  const lyricsMode = option(input.lyricsMode, LYRICS_MODES, "auto");
  const musicIdea = clean(input.musicIdea, 12000, "Music idea", true);
  const lyrics = clean(input.lyrics, 60000, "Lyrics");
  const normalized = {
    schemaVersion: SCHEMA_VERSION,
    providerId: provider.id,
    endpoint: provider.configurableEndpoint ? normalizeOpenAiChatUrl(input.baseUrl) : provider.chatUrl,
    model: normalizeModel(input.model, provider),
    musicIdea,
    lyricsMode,
    lyrics,
    lyricsLanguage: option(input.lyricsLanguage, LYRICS_LANGUAGES, "auto"),
    customLyricsLanguage: clean(input.customLyricsLanguage, 120, "Custom lyrics language"),
    targetDurationSeconds: Number(input.targetDurationSeconds || 0),
    rewriteMode: option(input.rewriteMode, REWRITE_MODES, "balanced"),
    qualityMode: option(input.qualityMode, QUALITY_MODES, "full"),
    structurePreset: option(input.structurePreset, STRUCTURES, "auto"),
    customStructure: clean(input.customStructure, 1000, "Custom structure"),
    lyricsEditRequest: clean(input.lyricsEditRequest, 6000, "Lyrics edit request"),
    constraints: clean(input.constraints, 12000, "Constraints"),
    fixedBpm: Number(input.fixedBpm || 0),
    keyScale: clean(input.keyScale, 120, "Key and scale"),
    meter: option(input.meter, METERS, "auto"),
    customMeter: clean(input.customMeter, 80, "Custom meter"),
    captionLanguage: option(input.captionLanguage, CAPTION_LANGUAGES, "zh-CN"),
    captionTargetWords: Number(input.captionTargetWords || 0),
    lyricsEditScope: option(input.lyricsEditScope, EDIT_SCOPES, "auto"),
    lyricsEditSection: option(input.lyricsEditSection, EDIT_SECTIONS, "Verse"),
    lyricsEditOccurrence: Number(input.lyricsEditOccurrence || 0),
    semanticProfileMode: option(input.semanticProfileMode, SEMANTIC_PROFILES, "privacy"),
    manualLyricsProfile: clean(input.manualLyricsProfile, 4000, "Manual lyrics profile"),
    stageCache: option(input.stageCache, STAGE_CACHE_MODES, "on"),
    seed: Math.max(0, Math.floor(Number(input.seed || 0)))
  };
  normalized.endpointHost = new URL(normalized.endpoint).host;
  if (!Number.isFinite(normalized.targetDurationSeconds) || normalized.targetDurationSeconds < 0 || normalized.targetDurationSeconds > 300) throw new PromptProviderError("Target duration must be 0–300 seconds.", { code: "invalid_duration", phase: "preflight" });
  if (!Number.isFinite(normalized.captionTargetWords) || normalized.captionTargetWords < 0 || normalized.captionTargetWords > 1000) throw new PromptProviderError("Caption target words must be 0–1000.", { code: "invalid_caption_length", phase: "preflight" });
  normalized.effectiveLyricsMode = effectiveLyricsMode(lyricsMode, lyrics, musicIdea);
  normalized.effectiveLyricsLanguage = inferLanguage(normalized.lyricsLanguage, normalized.customLyricsLanguage, musicIdea, lyrics);
  normalized.requestedStructure = requestedStructure(normalized.structurePreset, normalized.customStructure);
  normalized.localFamilies = localFamilyCandidates(`${musicIdea}\n${normalized.constraints}`);
  if (normalized.effectiveLyricsMode === "edit") normalized.editScope = resolveEditScope(normalized, lyrics);
  else normalized.editScope = null;
  rejectSecrets(normalized);
  validateConflicts(normalized);
  normalized.requestBudget = requestBudget(normalized);
  normalized.planHash = sha256Canonical(normalized);
  return normalized;
}

function stagePlan(plan, stage, messages, temperature) {
  return {
    schemaVersion: "t8-music3-stage-request/v1",
    providerId: plan.providerId,
    endpoint: plan.endpoint,
    endpointHost: plan.endpointHost,
    model: plan.model,
    rewriteMode: plan.rewriteMode,
    temperature,
    media: [],
    messages,
    stage,
    planHash: sha256Canonical({ parent: plan.planHash, stage, messages, temperature })
  };
}

function jsonMessages(system, payload) {
  return [{ role: "system", content: `${system}\nReturn JSON only. Do not use Markdown fences.` }, { role: "user", content: JSON.stringify(payload, null, 2) }];
}

function lyricStage(plan) {
  const editing = plan.effectiveLyricsMode === "edit";
  const system = editing
    ? "You are the T8 original-lyrics editor. Modify only the explicitly authorized scope. Preserve protected sections byte-for-byte, keep official bracketed section tags, and never add a title or commentary."
    : "You are the T8 original-lyrics writer. Write completely original lyrics for the brief, keep only useful official bracketed section tags, and return lyrics only without title or commentary.";
  return stagePlan(plan, "lyrics", [{ role: "system", content: system }, { role: "user", content: JSON.stringify({
    music_idea: plan.musicIdea,
    target_language: plan.effectiveLyricsLanguage,
    target_duration_seconds: plan.targetDurationSeconds,
    structure: plan.requestedStructure,
    constraints: plan.constraints,
    edit_request: plan.lyricsEditRequest,
    edit_scope: plan.editScope,
    lyrics: editing ? plan.lyrics : undefined,
    seed: plan.seed
  }, null, 2) }], TEMPERATURES.lyrics[plan.rewriteMode]);
}

function profileStage(plan, lyrics) {
  return stagePlan(plan, "profile", jsonMessages("Extract only broad emotional state, narrative intensity, and energy arc. Never quote, paraphrase, summarize, or reproduce lyric lines.", { lyrics }), TEMPERATURES.profile);
}

function routeStage(plan, lyricsProfile) {
  return stagePlan(plan, "route", jsonMessages("Route the brief using only the supplied official genre router. Return {\"families\":[one or at most two valid route IDs]}. Do not invent IDs.", { router: loadRouter(), music_idea: plan.musicIdea, constraints: plan.constraints, lyrics_profile: lyricsProfile }), TEMPERATURES.router);
}

function selectorStage(plan, indexes) {
  return stagePlan(plan, "select", jsonMessages("Select one to three compatible reference cards from the supplied official family indexes. Return {\"template_ids\":[...]}. Use distinct roles only when useful; never invent an ID.", { music_idea: plan.musicIdea, constraints: plan.constraints, bpm: plan.fixedBpm || "AUTO", meter: plan.meter, indexes }), TEMPERATURES.selector);
}

function captionStage(plan, lyrics, lyricsProfile, references) {
  const language = plan.captionLanguage === "zh-CN" ? "Simplified Chinese" : "English";
  const system = [
    "You are the official MiniMax Music 3 structured-caption writer.",
    loadSkill(),
    `Write the final caption in ${language}. Return exactly the three top-level headings in order: ### Global Metadata, ### Vocal Details, ### Arrangement.`,
    "Lyrics are private structure evidence: use only bracketed tags and broad profile data. Never quote, paraphrase, summarize, or reproduce any lyric line.",
    "References are inspiration only. Do not copy a sentence, exact signature phrase, title, track ID, or complete template structure. Return only the caption."
  ].join("\n\n");
  return stagePlan(plan, "caption", [{ role: "system", content: system }, { role: "user", content: JSON.stringify({
    music_idea: plan.musicIdea,
    effective_lyrics_mode: plan.effectiveLyricsMode,
    target_duration_seconds: plan.targetDurationSeconds || "AUTO",
    rewrite_mode: plan.rewriteMode,
    requested_structure: plan.requestedStructure,
    lyric_section_tags: (lyrics.match(/\[[^\]\r\n]{1,80}\]/gu) || []).slice(0, 80),
    broad_lyrics_profile: lyricsProfile,
    constraints_and_exclusions: plan.constraints,
    fixed_bpm: plan.fixedBpm || "AUTO",
    key_scale: plan.keyScale || "AUTO",
    meter: plan.meter === "custom" ? plan.customMeter : plan.meter,
    caption_target_words: plan.captionTargetWords || "official 250–450 English-word equivalent",
    selected_reference_templates: references,
    seed: plan.seed
  }, null, 2) }], TEMPERATURES.caption[plan.rewriteMode]);
}

function languageRepairStage(plan, lyrics) {
  return stagePlan(plan, "language_repair", [{ role: "system", content: `Rewrite the lyrics entirely in ${plan.effectiveLyricsLanguage}. Preserve all bracketed section tags, meaning, structure, and protected edit scope. Return lyrics only.` }, { role: "user", content: lyrics }], TEMPERATURES.language_repair);
}

function stripFence(value) {
  return String(value || "").trim().replace(/^```(?:json|text|markdown)?\s*/iu, "").replace(/\s*```$/u, "").trim();
}

function extractJson(value) {
  const text = stripFence(value);
  try { return JSON.parse(text); } catch {}
  const start = text.indexOf("{"); const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) { try { return JSON.parse(text.slice(start, end + 1)); } catch {} }
  return null;
}

function captionHeadingsValid(caption) {
  const found = [...String(caption).matchAll(/^###\s+(Global Metadata|Vocal Details|Arrangement)\s*$/gmu)].map((match) => match[1]);
  return JSON.stringify(found) === JSON.stringify(["Global Metadata", "Vocal Details", "Arrangement"]);
}

function lyricLeakage(caption, lyrics) {
  const lyricLines = String(lyrics || "").split(/\r?\n/gu).map((line) => line.replace(/\[[^\]]+\]/gu, "").trim()).filter((line) => line.length >= 12);
  const haystack = String(caption || "").toLocaleLowerCase();
  return lyricLines.some((line) => haystack.includes(line.toLocaleLowerCase()));
}

function estimateMusic3Tokens(value) {
  const text = String(value || "");
  return Math.ceil((text.match(/[\u3400-\u9fff]/gu)?.length || 0) * 1.2 + text.replace(/[\u3400-\u9fff]/gu, " ").split(/\s+/u).filter(Boolean).length * 1.35);
}

function collectWarnings({ plan, lyrics, caption, referenceTexts = [] }) {
  const warnings = [];
  if (!captionHeadingsValid(caption)) warnings.push("caption_heading_contract");
  if (lyricLeakage(caption, lyrics)) warnings.push("lyric_text_leakage");
  if (plan.effectiveLyricsMode === "instrumental" && /\b(?:vocalist|singer|sung|singing|lead vocal)\b|(?:主唱|演唱|人声演唱)/iu.test(caption)) warnings.push("instrumental_contains_vocals");
  if (referenceTexts.some((text) => String(text).split(/(?<=[.!?])\s+/u).filter((line) => line.length >= 50).some((line) => caption.includes(line)))) warnings.push("reference_phrase_overlap");
  if (plan.targetDurationSeconds && new RegExp(`\\b(?:${plan.targetDurationSeconds + 10}|${plan.targetDurationSeconds + 20})\\s*(?:s|seconds|秒)`, "iu").test(caption)) warnings.push("timeline_inconsistent");
  if (plan.requestedStructure.some((tag) => !caption.toLocaleLowerCase().includes(tag.slice(1, -1).toLocaleLowerCase()))) warnings.push("requested_section_missing");
  if (estimateMusic3Tokens(caption) > 3000) warnings.push("music3_token_budget_high");
  return [...new Set(warnings)];
}

function normalizeCaption(value) {
  const text = stripFence(value);
  const headings = ["Global Metadata", "Vocal Details", "Arrangement"];
  if (captionHeadingsValid(text)) return text;
  const pieces = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = text.search(new RegExp(`^###\\s+${heading}\\s*$`, "imu"));
    if (start < 0) continue;
    const bodyStart = text.indexOf("\n", start) + 1;
    const nextStarts = headings.filter((other) => other !== heading).map((other) => text.search(new RegExp(`^###\\s+${other}\\s*$`, "imu"))).filter((value) => value > start);
    pieces.set(heading, text.slice(bodyStart, nextStarts.length ? Math.min(...nextStarts) : undefined).trim());
  }
  return pieces.size === 3 ? headings.map((heading) => `### ${heading}\n\n${pieces.get(heading)}`).join("\n\n") : text;
}

function buildReport({ plan, requestCount, cacheHits, stages, families, referenceCount, lyrics, caption, referenceTexts }) {
  return {
    schema_version: REPORT_SCHEMA,
    effective_lyrics_mode: plan.effectiveLyricsMode,
    semantic_profile_mode: plan.semanticProfileMode,
    request_count: requestCount,
    cache_hits: cacheHits,
    stages,
    family_index_count: families.length,
    reference_count: referenceCount,
    official_source_commit: OFFICIAL_SOURCE_COMMIT,
    official_tree_sha256: OFFICIAL_NORMALIZED_TREE_SHA256,
    tag_event_count: (lyrics.match(/\[[^\]\r\n]{1,80}\]/gu) || []).length,
    ignored_tag_count: 0,
    estimated_music3_tokens: estimateMusic3Tokens(caption),
    warnings: collectWarnings({ plan, lyrics, caption, referenceTexts })
  };
}

module.exports = {
  CAPTION_LANGUAGES,
  EDIT_SCOPES,
  EDIT_SECTIONS,
  FAMILIES,
  LYRICS_LANGUAGES,
  LYRICS_MODES,
  METERS,
  QUALITY_MODES,
  REPORT_SCHEMA,
  REWRITE_MODES,
  SCHEMA_VERSION,
  SEMANTIC_PROFILES,
  STAGE_CACHE_MODES,
  STRUCTURES,
  buildReport,
  captionHeadingsValid,
  captionStage,
  collectWarnings,
  extractJson,
  languageRepairStage,
  localFamilyCandidates,
  lyricStage,
  normalizeCaption,
  normalizeMusicPlan,
  profileStage,
  routeStage,
  selectorStage,
  stagePlan
};
