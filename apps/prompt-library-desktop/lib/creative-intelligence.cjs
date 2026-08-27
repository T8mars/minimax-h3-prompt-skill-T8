const crypto = require("node:crypto");
const {
  PROVIDERS,
  PromptProviderError,
  callProvider,
  normalizeOpenAiChatUrl,
  safeProviderMessage
} = require("./prompt-providers.cjs");
const { compactRecommendationPayload, shortlistRecommendationEntities } = require("./template-index.cjs");

const OPERATIONS = new Set([
  "recommend_templates",
  "create_shot_plan",
  "compose_mechanisms",
  "video_to_music",
  "music_to_video",
  "template_proposal"
]);
const MAX_INPUT_CHARS = 180000;
const MAX_OUTPUT_CHARS = 200000;

function clean(value, limit = MAX_INPUT_CHARS) {
  return String(value ?? "").replace(/\r\n/gu, "\n").trim().slice(0, limit);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function parseJsonObject(value, label = "AI response") {
  let source = clean(value, MAX_OUTPUT_CHARS);
  source = source.replace(/^```(?:json)?\s*/iu, "").replace(/\s*```$/u, "").trim();
  const first = source.indexOf("{");
  const last = source.lastIndexOf("}");
  if (first >= 0 && last > first) source = source.slice(first, last + 1);
  let parsed;
  try { parsed = JSON.parse(source); }
  catch { throw new PromptProviderError(`${label} is not valid JSON.`, { code: "invalid_ai_json", phase: "response" }); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new PromptProviderError(`${label} must be a JSON object.`, { code: "invalid_ai_json", phase: "response" });
  }
  return parsed;
}

function normalizeConfig(input = {}) {
  const provider = PROVIDERS[input.providerId];
  if (!provider) throw new PromptProviderError("Unsupported provider.", { code: "invalid_provider", phase: "preflight" });
  const model = clean(input.model || provider.defaultModel, 160);
  if (!model || /\s/u.test(model)) throw new PromptProviderError("A valid model ID is required.", { code: "invalid_model", phase: "preflight" });
  const endpoint = provider.local ? "local://qwen" : provider.configurableEndpoint ? normalizeOpenAiChatUrl(input.baseUrl) : provider.chatUrl;
  return {
    provider,
    providerId: provider.id,
    model,
    endpoint,
    endpointHost: provider.local ? "local" : new URL(endpoint).host
  };
}

function jsonMessages(system, payload) {
  return [
    { role: "system", content: `${system}\nReturn exactly one JSON object. Do not use Markdown fences, prose outside JSON, hidden reasoning, or invented template IDs.` },
    { role: "user", content: stableStringify(payload) }
  ];
}

function intentMessages(intent, locale) {
  return jsonMessages(
    "You are the intent-understanding stage of T8 Prompt Library. Extract what the user actually wants without choosing a template. Expand genuine Chinese/English synonyms, but never add an unsupported subject, genre, camera move, story, product, emotion, or restriction.",
    {
      outputSchema: {
        subject: ["terms"], actions: ["terms including genuine synonyms"], goals: ["terms"], styles: ["terms"],
        camera: ["terms"], emotion: ["terms"], sound: ["terms"], constraints: ["positive constraints"],
        exclusions: ["negative constraints"], ambiguity: "one concise question or empty string"
      },
      locale,
      intent
    }
  );
}

function rankingMessages({ intent, locale, profile, candidates, total }) {
  return jsonMessages(
    "You are the final template recommender for T8 Prompt Library. Judge semantic and creative-mechanism fit, not word overlap. A result must directly support the user's subject/action/goal. Reject merely duration-matched or adjacent templates. Return zero to three recommendations; never pad the list. Every reason and risk must be supported by the supplied card.",
    {
      outputSchema: {
        recommendations: [{ templateId: "exact supplied ID", score: "integer 0..100", confidence: "high|medium|low", reasons: ["specific supported reason"], risks: ["specific mismatch"], missingInformation: ["optional fact"] }],
        clarification: "one concise question only when no result is reliable, otherwise empty string"
      },
      intent,
      locale,
      interpretedIntent: profile,
      catalogCoverage: { totalRecommendationEntities: total, candidateCards: candidates.length },
      candidateCards: candidates
    }
  );
}

function operationMessages(operation, input, locale) {
  const common = "Preserve every explicit user fact and hard constraint. Use only supplied project/template evidence. Do not invent source evidence, media contents, user preferences, or validation results.";
  const contracts = {
    create_shot_plan: {
      instruction: `${common} Create an executable shot plan and continuity locks. Timing must start at 0, stay consecutive without gaps or overlaps, and end at the exact duration.`,
      schema: { shots: [{ shotId: "shot-01", startSeconds: 0, endSeconds: 0, action: "", camera: "", sceneChange: "", sound: "", onScreenText: "", continuity: "" }], continuityLocks: [{ entityId: "entity-01", type: "character|product|scene|prop", name: "", invariants: "", mediaIds: [] }] }
    },
    compose_mechanisms: {
      instruction: `${common} Compose two mechanisms only when the secondary can enhance a declared scope without replacing, duplicating, or reordering the primary causal chain. Explicitly block unresolved conflicts.`,
      schema: { status: "ready|blocked", contract: { causalMechanism: "", secondaryScope: "", invariants: [], exclusions: [] }, conflicts: [{ code: "", reason: "" }] }
    },
    video_to_music: {
      instruction: `${common} Translate the accepted video revision into Music 3 timing and arrangement suggestions. Do not claim audio analysis unless audio evidence was supplied.`,
      schema: { status: "ready", suggestionsOnly: true, sourceRevisionId: "", timing: [{ startSeconds: 0, endSeconds: 0, energy: "", rhythm: "", soundRole: "" }], globalDirection: "", constraints: [] }
    },
    music_to_video: {
      instruction: `${common} Translate the supplied Music 3 project structure into video timing suggestions. Do not overwrite the shot canvas and do not claim the song was heard unless audio evidence was supplied.`,
      schema: { status: "ready", suggestionsOnly: true, timing: [{ section: "", startSeconds: 0, endSeconds: 0, visualEnergy: "", cutGuidance: "" }], globalDirection: "", constraints: [] }
    },
    template_proposal: {
      instruction: `${common} Propose evidence-backed improvements to the reusable template. Do not modify canonical files. Each suggestion must cite a supplied failure, review, or effect denominator.`,
      schema: { status: "draft", canonicalWrite: false, evidenceStrength: "high|medium|low|insufficient", denominator: 0, suggestedChanges: [{ area: "", evidenceCount: 0, suggestion: "", evidence: [""] }] }
    }
  };
  const contract = contracts[operation];
  if (!contract) throw new PromptProviderError("Unsupported creative operation.", { code: "invalid_operation", phase: "preflight" });
  return jsonMessages(contract.instruction, { outputSchema: contract.schema, locale, input });
}

function validateRecommendation(response, index, shortlist) {
  const allowed = new Map(shortlist.map(({ entity }) => [entity.templateId, entity]));
  const seen = new Set();
  const recommendations = [];
  for (const item of Array.isArray(response?.recommendations) ? response.recommendations : []) {
    const templateId = clean(item?.templateId, 240);
    const entity = allowed.get(templateId);
    const score = Math.round(Number(item?.score));
    if (!entity || seen.has(templateId) || !Number.isFinite(score) || score < 60 || score > 100) continue;
    seen.add(templateId);
    const reasons = (Array.isArray(item?.reasons) ? item.reasons : []).map((value) => clean(value, 300)).filter(Boolean).slice(0, 4);
    if (!reasons.length) continue;
    recommendations.push({
      templateId,
      representativeId: entity.representativeId,
      title: entity.card.titleZh || entity.card.titleEn,
      score,
      confidence: ["high", "medium", "low"].includes(item?.confidence) ? item.confidence : score >= 85 ? "high" : score >= 70 ? "medium" : "low",
      reasons,
      risks: (Array.isArray(item?.risks) ? item.risks : []).map((value) => clean(value, 300)).filter(Boolean).slice(0, 3),
      missingInformation: (Array.isArray(item?.missingInformation) ? item.missingInformation : []).map((value) => clean(value, 240)).filter(Boolean).slice(0, 3)
    });
    if (recommendations.length >= 3) break;
  }
  return { recommendations, clarification: clean(response?.clarification, 400) };
}

function validateOperationResult(operation, response) {
  if (operation === "create_shot_plan" && (!Array.isArray(response?.shots) || !response.shots.length || response.shots.length > 240)) {
    throw new PromptProviderError("AI shot plan must contain between 1 and 240 shots.", { code: "invalid_ai_contract", phase: "response" });
  }
  if (operation === "compose_mechanisms") {
    if (!["ready", "blocked"].includes(response?.status)) throw new PromptProviderError("AI composition returned an invalid status.", { code: "invalid_ai_contract", phase: "response" });
    if (response.status === "ready" && (!response.contract || !clean(response.contract.causalMechanism) || !clean(response.contract.secondaryScope))) {
      throw new PromptProviderError("AI composition is missing its ready contract.", { code: "invalid_ai_contract", phase: "response" });
    }
    if (response.status === "blocked" && !Array.isArray(response.conflicts)) throw new PromptProviderError("Blocked AI composition must list conflicts.", { code: "invalid_ai_contract", phase: "response" });
  }
  if (["video_to_music", "music_to_video"].includes(operation)) {
    if (response?.suggestionsOnly !== true || !Array.isArray(response?.timing)) throw new PromptProviderError("AI bridge must remain timing-based suggestions-only.", { code: "invalid_ai_contract", phase: "response" });
  }
  if (operation === "template_proposal" && (response?.canonicalWrite !== false || !Array.isArray(response?.suggestedChanges))) {
    throw new PromptProviderError("AI proposal must remain a non-writing evidence-backed draft.", { code: "invalid_ai_contract", phase: "response" });
  }
  return response;
}

class CreativeIntelligence {
  constructor({ credentialVault, localQwen = null, fetchImpl = null }) {
    this.credentialVault = credentialVault;
    this.localQwen = localQwen;
    this.fetchImpl = fetchImpl;
  }

  async execute(request = {}) {
    const operation = clean(request.operation, 80);
    if (!OPERATIONS.has(operation)) throw new PromptProviderError("Unsupported creative operation.", { code: "invalid_operation", phase: "preflight" });
    if (request.confirmed !== true) throw new PromptProviderError("The model call must be explicitly confirmed.", { code: "confirmation_required", phase: "preflight" });
    const config = normalizeConfig(request);
    const locale = request.locale === "en" ? "en" : "zh-CN";
    const inputJson = stableStringify(request.input || {});
    if (inputJson.length > MAX_INPUT_CHARS) throw new PromptProviderError("Creative operation input is too large.", { code: "input_too_large", phase: "preflight" });
    const controller = new AbortController();
    const receipts = [];
    let localSession = null;
    let apiKey = "";
    try {
      if (config.provider.local) {
        const status = this.localQwen?.status();
        if (!status?.configured || !(status.textReady ?? status.configured)) throw new PromptProviderError("Local GGUF is not ready. Verify it in API settings.", { code: "local_not_ready", phase: "preflight" });
        localSession = await this.localQwen.beginSession({ vision: false, video: false, signal: controller.signal });
      } else {
        const credential = this.credentialVault.resolve(config.providerId);
        apiKey = credential?.key || "";
        if (!apiKey) throw new PromptProviderError("This provider has no configured API key.", { code: "credential_missing", phase: "preflight" });
      }
      const complete = async (messages, temperature = 0.2) => {
        const plan = { ...config, messages, media: [], rewriteMode: "strict", temperature, seed: 0 };
        const result = localSession
          ? await localSession.complete(plan, { mediaRecords: [] })
          : await callProvider(plan, apiKey, { fetchImpl: this.fetchImpl || globalThis.fetch, signal: controller.signal, mediaRecords: [] });
        receipts.push(result.receipt);
        return result.output;
      };

      let result;
      if (operation === "recommend_templates") {
        const index = request.templateIndex;
        if (!index?.recommendationEntities?.length) throw new PromptProviderError("The unified template index is unavailable.", { code: "template_index_missing", phase: "preflight" });
        const intent = clean(request.input?.intent, 12000);
        if (!intent) throw new PromptProviderError("Describe the creative goal first.", { code: "intent_missing", phase: "preflight" });
        const profile = parseJsonObject(await complete(intentMessages(intent, locale), 0.1), "AI intent profile");
        const shortlist = shortlistRecommendationEntities(index, profile, intent, 24);
        if (!shortlist.length) {
          result = { recommendations: [], clarification: clean(profile.ambiguity, 400) || (locale === "en" ? "Add the main action, visual style, or intended use." : "请再补充主要动作、视觉风格或用途。"), interpretedIntent: profile };
        } else {
          const cards = compactRecommendationPayload(shortlist);
          const ranked = parseJsonObject(await complete(rankingMessages({ intent, locale, profile, candidates: cards, total: index.recommendationEntities.length }), 0.2), "AI template ranking");
          result = { ...validateRecommendation(ranked, index, shortlist), interpretedIntent: profile };
        }
        result.coverage = { catalogVersion: index.catalogVersion, indexSha256: index.indexSha256, indexed: index.recommendationEntities.length, examined: index.recommendationEntities.length, reranked: shortlist.length };
      } else {
        if (operation === "compose_mechanisms") {
          const primaryId = clean(request.input?.primary?.templateId || request.input?.primary?.id, 240);
          const secondaryId = clean(request.input?.secondary?.templateId || request.input?.secondary?.id, 240);
          if (!primaryId || !secondaryId || primaryId === secondaryId) throw new PromptProviderError("Choose two distinct mechanisms before calling AI composition.", { code: "invalid_composition", phase: "preflight" });
        }
        const response = parseJsonObject(await complete(operationMessages(operation, request.input || {}, locale), operation === "template_proposal" ? 0.3 : 0.2), `AI ${operation} response`);
        result = validateOperationResult(operation, response);
      }
      return {
        schemaVersion: "t8-creative-intelligence-result/v1",
        operation,
        providerId: config.providerId,
        providerLabel: config.provider.label,
        endpointHost: config.endpointHost,
        model: config.model,
        modelCallCount: receipts.length,
        receipts,
        result,
        resultSha256: crypto.createHash("sha256").update(stableStringify(result), "utf8").digest("hex")
      };
    } catch (error) {
      if (error instanceof PromptProviderError) throw error;
      throw new PromptProviderError(safeProviderMessage(error?.message, apiKey), { code: "creative_intelligence_failed", phase: "creative_intelligence" });
    } finally {
      apiKey = "";
      if (localSession) {
        try { await localSession.close({ force: false }); }
        catch { /* Completion result or original failure remains authoritative. */ }
      }
    }
  }
}

module.exports = {
  CreativeIntelligence,
  OPERATIONS,
  intentMessages,
  operationMessages,
  parseJsonObject,
  rankingMessages,
  validateRecommendation
};
