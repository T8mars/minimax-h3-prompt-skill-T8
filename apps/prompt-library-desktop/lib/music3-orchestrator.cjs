const crypto = require("node:crypto");
const { PROVIDERS, PromptProviderError, callProvider, sha256Canonical } = require("./prompt-providers.cjs");
const { FAMILIES, cardsForFamilies, readSelectedTemplate } = require("./music3-resources.cjs");
const {
  buildReport,
  captionStage,
  extractJson,
  languageRepairStage,
  lyricStage,
  normalizeCaption,
  normalizeMusicPlan,
  profileStage,
  routeStage,
  selectorStage
} = require("./music3-contract.cjs");
const { publicError } = require("./prompt-orchestrator.cjs");

const PLAN_TTL_MS = 10 * 60 * 1000;
const STAGE_CACHE_TTL_MS = 10 * 60 * 1000;
const STAGE_CACHE_MAX = 32;
const MAX_RUNS = 100;
const STAGE_CACHE_SALT = crypto.randomBytes(32);
const GATEWAY_RETRY_CODES = new Set(["upstream_gateway_failure", "upstream_unavailable", "upstream_timeout", "provider_server_error"]);

function hash(value) { return crypto.createHash("sha256").update(String(value), "utf8").digest("hex"); }
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    const abort = () => { clearTimeout(timer); reject(signal.reason || new Error("cancelled")); };
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
}

function languageMismatch(lyrics, language) {
  const text = String(lyrics || "").replace(/\[[^\]]+\]/gu, "");
  if (!text.trim() || !["zh", "ja", "ko", "en"].includes(language)) return false;
  if (language === "zh") return !/[\u3400-\u9fff]/u.test(text);
  if (language === "ja") return !/[\u3040-\u30ff]/u.test(text);
  if (language === "ko") return !/[\uac00-\ud7af]/u.test(text);
  return !/[A-Za-z]/u.test(text);
}

function mergeEditedLyrics(original, candidate, scope) {
  if (!scope || scope.mode === "all") return candidate;
  const pattern = /(^\[(?:Intro|Verse|Pre-Chorus|Chorus|Post-Chorus|Bridge|Instrumental|Solo|Outro)\][\s\S]*?)(?=^\[(?:Intro|Verse|Pre-Chorus|Chorus|Post-Chorus|Bridge|Instrumental|Solo|Outro)\]|\s*$)/gmu;
  const originalParts = [...String(original).matchAll(pattern)].map((match) => match[1]);
  const candidateParts = [...String(candidate).matchAll(pattern)].map((match) => match[1]);
  if (!originalParts.length || !candidateParts.length) throw new PromptProviderError("Edited lyrics lost the protected section structure.", { code: "edit_structure_changed", phase: "validation" });
  let targetSeen = 0;
  return originalParts.map((part) => {
    const section = part.match(/^\[([^\]]+)\]/u)?.[1];
    const isTarget = scope.sections.includes(section);
    if (isTarget) targetSeen += 1;
    const authorized = isTarget && (scope.mode === "section" || targetSeen === scope.occurrence);
    if (!authorized) return part;
    const replacement = candidateParts.find((item, index) => item.startsWith(`[${section}]`) && (scope.mode !== "occurrence" || candidateParts.slice(0, index + 1).filter((value) => value.startsWith(`[${section}]`)).length === scope.occurrence));
    return replacement || part;
  }).join("\n\n").trim();
}

function validationFor(outputs, report) {
  const critical = new Set(["caption_heading_contract", "lyric_text_leakage", "instrumental_contains_vocals", "reference_phrase_overlap"]);
  const errors = report.warnings.filter((warning) => critical.has(warning));
  return {
    schemaVersion: "t8-music3-validation/v1",
    status: errors.length ? "fail" : "pass",
    errors,
    warnings: report.warnings.filter((warning) => !critical.has(warning)),
    outputHashes: Object.fromEntries(Object.entries(outputs).map(([key, value]) => [key, hash(value)]))
  };
}

function runSummary(run, includeOutputs = false) {
  const value = {
    runId: run.runId,
    capability: "music3",
    state: run.state,
    providerId: run.plan.providerId,
    providerLabel: PROVIDERS[run.plan.providerId].label,
    endpointHost: run.plan.endpointHost,
    model: run.plan.model,
    planHash: run.plan.planHash,
    createdAt: run.createdAt,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    cancellationRequestedAt: run.cancellationRequestedAt,
    cancellationMessage: run.cancellationMessage,
    error: run.error,
    receipt: run.receipt,
    validation: run.validation,
    effectiveLyricsMode: run.plan.effectiveLyricsMode,
    captionLanguage: run.plan.captionLanguage
  };
  if (includeOutputs && run.state === "completed") value.outputs = run.outputs;
  return value;
}

class StageRunner {
  constructor(orchestrator, run, apiKey, controller) {
    this.orchestrator = orchestrator;
    this.run = run;
    this.apiKey = apiKey;
    this.controller = controller;
    this.requestCount = 0;
    this.cacheHits = 0;
    this.stages = [];
  }

  cacheKey(stage) {
    const credentialHash = crypto.createHmac("sha256", STAGE_CACHE_SALT).update(this.apiKey, "utf8").digest("hex");
    return sha256Canonical({ providerId: stage.providerId, endpoint: stage.endpoint, model: stage.model, stage: stage.stage, messages: stage.messages, credentialHash });
  }

  async complete(stage, { selector = false } = {}) {
    const cacheKey = this.cacheKey(stage);
    const cached = this.run.plan.stageCache === "on" ? this.orchestrator.stageCacheGet(cacheKey) : null;
    if (cached) {
      this.cacheHits += 1;
      this.stages.push({ stage: stage.stage, cache_hit: true, attempts: 0, request_id: null, usage: null });
      return cached;
    }
    const delays = this.run.plan.providerId === "seedance_nz" ? (selector ? [500, 1000, 2000, 4000, 8000] : [500, 1000]) : [];
    let attempt = 0;
    while (true) {
      attempt += 1;
      this.requestCount += 1;
      try {
        const result = await callProvider(stage, this.apiKey, { fetchImpl: this.orchestrator.fetchImpl, signal: this.controller.signal });
        const receipt = { stage: stage.stage, cache_hit: false, attempts: attempt, request_id: result.receipt.requestId, usage: result.receipt.usage, duration_ms: result.receipt.durationMs };
        this.stages.push(receipt);
        if (this.run.plan.stageCache === "on") this.orchestrator.stageCachePut(cacheKey, result.output);
        return result.output;
      } catch (error) {
        const canRetry = attempt <= delays.length && error instanceof PromptProviderError && error.retryable && error.outcomeCertainty === "definite_failure" && GATEWAY_RETRY_CODES.has(error.code);
        if (!canRetry) {
          if (error instanceof PromptProviderError) error.attempts = attempt;
          throw error;
        }
        await sleep(delays[attempt - 1], this.controller.signal);
      }
    }
  }
}

class Music3Orchestrator {
  constructor({ credentialVault, fetchImpl = globalThis.fetch, now = () => Date.now(), randomUUID = crypto.randomUUID }) {
    this.credentialVault = credentialVault;
    this.fetchImpl = fetchImpl;
    this.now = now;
    this.randomUUID = randomUUID;
    this.plans = new Map();
    this.runs = new Map();
    this.controllers = new Map();
    this.stageCache = new Map();
  }

  cleanup() {
    const now = this.now();
    for (const [key, record] of this.plans) if (record.expiresAt <= now) this.plans.delete(key);
    for (const [key, record] of this.stageCache) if (record.expiresAt <= now) this.stageCache.delete(key);
    if (this.runs.size > MAX_RUNS) {
      for (const run of [...this.runs.values()].filter((item) => item.state !== "running").sort((a, b) => String(a.finishedAt).localeCompare(String(b.finishedAt)))) {
        if (this.runs.size <= MAX_RUNS) break;
        this.runs.delete(run.runId);
      }
    }
  }

  stageCacheGet(key) {
    this.cleanup();
    const record = this.stageCache.get(key);
    if (!record) return null;
    this.stageCache.delete(key);
    this.stageCache.set(key, record);
    return record.output;
  }

  stageCachePut(key, output) {
    this.cleanup();
    this.stageCache.set(key, { output, expiresAt: this.now() + STAGE_CACHE_TTL_MS });
    while (this.stageCache.size > STAGE_CACHE_MAX) this.stageCache.delete(this.stageCache.keys().next().value);
  }

  preflight(input) {
    this.cleanup();
    const plan = normalizeMusicPlan(input);
    const credential = this.credentialVault.status(plan.providerId);
    if (!credential.configured) throw new PromptProviderError("This provider has no configured API key.", { code: "credential_missing", phase: "preflight" });
    const issuedAtMs = this.now();
    this.plans.set(plan.planHash, { plan, issuedAt: issuedAtMs, expiresAt: issuedAtMs + PLAN_TTL_MS, consumedAt: null });
    const logical = plan.requestBudget;
    const physicalMaximum = plan.providerId === "seedance_nz"
      ? logical.stages.reduce((sum, stage) => sum + (stage === "select" ? 6 : stage === "language-repair-if-needed" ? 3 : 3), 0)
      : logical.maximum;
    return {
      schemaVersion: "t8-music3-preflight/v1",
      capability: "music3",
      planHash: plan.planHash,
      issuedAt: new Date(issuedAtMs).toISOString(),
      expiresAt: new Date(issuedAtMs + PLAN_TTL_MS).toISOString(),
      providerId: plan.providerId,
      providerLabel: PROVIDERS[plan.providerId].label,
      endpointHost: plan.endpointHost,
      model: plan.model,
      credentialSource: credential.source,
      effectiveLyricsMode: plan.effectiveLyricsMode,
      captionLanguage: plan.captionLanguage,
      qualityMode: plan.qualityMode,
      plannedStages: logical.stages,
      logicalCallsMinimum: logical.minimum,
      logicalCallsMaximum: logical.maximum,
      physicalAttemptsMaximum: physicalMaximum,
      stageCache: plan.stageCache,
      cost: "unknown",
      confirmationRequired: true
    };
  }

  start({ planHash, confirmed }) {
    this.cleanup();
    if (confirmed !== true) throw new PromptProviderError("Explicit paid-call confirmation is required.", { code: "confirmation_required", phase: "preflight" });
    const record = this.plans.get(String(planHash || ""));
    if (!record || record.expiresAt <= this.now()) throw new PromptProviderError("The Music 3 preflight plan is missing or expired.", { code: "plan_expired", phase: "preflight" });
    if (record.consumedAt) throw new PromptProviderError("This Music 3 preflight plan has already been consumed.", { code: "plan_already_consumed", phase: "preflight" });
    const credential = this.credentialVault.resolve(record.plan.providerId);
    if (!credential.key) throw new PromptProviderError("The provider credential is no longer available.", { code: "credential_missing", phase: "preflight" });
    record.consumedAt = new Date(this.now()).toISOString();
    const runId = this.randomUUID();
    const controller = new AbortController();
    const run = {
      runId, state: "running", plan: record.plan, createdAt: record.consumedAt, startedAt: record.consumedAt,
      finishedAt: null, cancellationRequestedAt: null, cancellationMessage: null, outputs: null,
      receipt: null, validation: null, error: null
    };
    this.runs.set(runId, run);
    this.controllers.set(runId, controller);
    void this.execute(run, credential.key, controller);
    return runSummary(run);
  }

  async execute(run, apiKey, controller) {
    const stageRunner = new StageRunner(this, run, apiKey, controller);
    try {
      let lyrics = run.plan.effectiveLyricsMode === "instrumental" ? "" : run.plan.lyrics;
      if (["generate", "edit"].includes(run.plan.effectiveLyricsMode)) {
        const candidate = (await stageRunner.complete(lyricStage(run.plan))).trim();
        lyrics = run.plan.effectiveLyricsMode === "edit" ? mergeEditedLyrics(run.plan.lyrics, candidate, run.plan.editScope) : candidate;
        if (languageMismatch(lyrics, run.plan.effectiveLyricsLanguage)) lyrics = (await stageRunner.complete(languageRepairStage(run.plan, lyrics))).trim();
      }
      let profile = run.plan.semanticProfileMode === "manual" ? run.plan.manualLyricsProfile : "not supplied; infer no lyric narrative content";
      if (run.plan.semanticProfileMode === "llm" && lyrics) {
        const response = await stageRunner.complete(profileStage(run.plan, lyrics));
        profile = extractJson(response) || { broad_profile: response.slice(0, 2000) };
      }
      let families = run.plan.localFamilies;
      if (run.plan.qualityMode === "full" && !families.length) {
        const routed = extractJson(await stageRunner.complete(routeStage(run.plan, profile)));
        families = Array.isArray(routed?.families) ? [...new Set(routed.families.filter((family) => typeof family === "string" && FAMILIES.includes(family)))].slice(0, 2) : [];
      }
      if (!families.length) families = ["general-pop-ballad"];
      const references = [];
      const referenceTexts = [];
      if (run.plan.qualityMode === "full") {
        const indexed = cardsForFamilies(families);
        const selected = extractJson(await stageRunner.complete(selectorStage(run.plan, indexed.indexes), { selector: true }));
        const ids = Array.isArray(selected?.template_ids) ? selected.template_ids.filter((id) => indexed.cards.has(id)).slice(0, 3) : [];
        if (!ids.length) throw new PromptProviderError("The official-reference selector did not return a valid bundled template ID.", { code: "official_reference_selection_failed", phase: "selection" });
        for (const id of ids) {
          const text = readSelectedTemplate(indexed.cards.get(id));
          references.push({ role: references.length === 0 ? "Foundation" : references.length === 1 ? "Modifier" : "Arrangement", template: text });
          referenceTexts.push(text);
        }
      }
      const caption = normalizeCaption(await stageRunner.complete(captionStage(run.plan, lyrics, profile, references)));
      const payload = JSON.stringify({ input: lyrics, instructions: caption }, null, 2);
      const reportObject = buildReport({
        plan: run.plan,
        requestCount: stageRunner.requestCount,
        cacheHits: stageRunner.cacheHits,
        stages: stageRunner.stages,
        families,
        referenceCount: references.length,
        lyrics,
        caption,
        referenceTexts
      });
      const outputs = { lyrics, musicCaption: caption, music3PayloadJson: payload, enhancementReportJson: JSON.stringify(reportObject, null, 2) };
      run.outputs = outputs;
      run.validation = validationFor(outputs, reportObject);
      run.receipt = {
        schemaVersion: "t8-music3-execution-receipt/v1",
        providerId: run.plan.providerId,
        endpointHost: run.plan.endpointHost,
        model: run.plan.model,
        logicalRequestCount: stageRunner.requestCount,
        cacheHits: stageRunner.cacheHits,
        stages: stageRunner.stages,
        outputHashes: run.validation.outputHashes
      };
      run.state = "completed";
    } catch (error) {
      run.error = publicError(error);
      run.state = controller.signal.aborted ? "cancel_requested" : "failed";
      if (controller.signal.aborted) run.cancellationMessage = "Cancellation was requested after submission; remote completion and billing status may be unknown.";
    } finally {
      run.finishedAt = new Date(this.now()).toISOString();
      this.controllers.delete(run.runId);
      apiKey = "";
      this.cleanup();
    }
  }

  status(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run) throw new PromptProviderError("Music 3 run not found.", { code: "run_not_found", phase: "status" });
    return runSummary(run, true);
  }

  cancel(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run) throw new PromptProviderError("Music 3 run not found.", { code: "run_not_found", phase: "cancel" });
    if (run.state !== "running") return runSummary(run, run.state === "completed");
    run.cancellationRequestedAt = new Date(this.now()).toISOString();
    run.cancellationMessage = "Cancellation requested. The remote completion or billing state is unknown until the local request reaches a terminal state.";
    this.controllers.get(run.runId)?.abort(new Error("user_cancelled"));
    return runSummary(run);
  }

  projectSnapshot(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run || run.state !== "completed") throw new PromptProviderError("Only a completed Music 3 run can be saved.", { code: "run_not_completed", phase: "project" });
    return {
      capability: "music3",
      createdAt: run.createdAt,
      title: `Music 3 · ${run.plan.musicIdea.slice(0, 60)}`,
      musicIdea: run.plan.musicIdea,
      inputLyrics: run.plan.lyrics,
      lyricsMode: run.plan.lyricsMode,
      effectiveLyricsMode: run.plan.effectiveLyricsMode,
      lyricsLanguage: run.plan.lyricsLanguage,
      customLyricsLanguage: run.plan.customLyricsLanguage,
      targetDurationSeconds: run.plan.targetDurationSeconds,
      rewriteMode: run.plan.rewriteMode,
      qualityMode: run.plan.qualityMode,
      structurePreset: run.plan.structurePreset,
      customStructure: run.plan.customStructure,
      lyricsEditRequest: run.plan.lyricsEditRequest,
      constraints: run.plan.constraints,
      fixedBpm: run.plan.fixedBpm,
      keyScale: run.plan.keyScale,
      meter: run.plan.meter,
      customMeter: run.plan.customMeter,
      captionLanguage: run.plan.captionLanguage,
      captionTargetWords: run.plan.captionTargetWords,
      lyricsEditScope: run.plan.lyricsEditScope,
      lyricsEditSection: run.plan.lyricsEditSection,
      lyricsEditOccurrence: run.plan.lyricsEditOccurrence,
      semanticProfileMode: run.plan.semanticProfileMode,
      manualLyricsProfile: run.plan.manualLyricsProfile,
      stageCache: run.plan.stageCache,
      seed: run.plan.seed,
      providerId: run.plan.providerId,
      providerLabel: PROVIDERS[run.plan.providerId].label,
      endpointHost: run.plan.endpointHost,
      model: run.plan.model,
      outputs: run.outputs,
      validation: run.validation,
      receipt: run.receipt
    };
  }
}

module.exports = { MAX_RUNS, Music3Orchestrator, PLAN_TTL_MS, STAGE_CACHE_MAX, STAGE_CACHE_TTL_MS, runSummary };
