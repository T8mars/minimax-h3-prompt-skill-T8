const crypto = require("node:crypto");
const {
  PROVIDERS,
  PromptProviderError,
  callProvider,
  normalizePlan,
  sha256Canonical
} = require("./prompt-providers.cjs");
const { validateEnhancedPrompt } = require("./prompt-validation.cjs");

const PLAN_TTL_MS = 10 * 60 * 1000;
const MAX_RUNS = 100;

function localExecutionFingerprint(localQwen, status) {
  if (typeof localQwen?.executionFingerprint === "function") return localQwen.executionFingerprint();
  return sha256Canonical({
    modelFilename: status?.modelFilename,
    projectorFilename: status?.projectorFilename,
    resolvedProjectorFilename: status?.resolvedProjectorFilename,
    contextSize: status?.contextSize,
    maxTokens: status?.maxTokens,
    thinkMode: status?.thinkMode,
    reasoningEffort: status?.reasoningEffort,
    videoSampleFps: status?.videoSampleFps,
    unloadPolicy: status?.unloadPolicy
  });
}

function publicError(error) {
  if (error instanceof PromptProviderError) {
    return {
      code: error.code,
      phase: error.phase,
      message: error.message,
      retryable: error.retryable,
      outcomeCertainty: error.outcomeCertainty,
      httpStatus: error.httpStatus,
      providerCode: error.providerCode,
      attempts: error.attempts
    };
  }
  return {
    code: "internal_error",
    phase: "internal",
    message: "The prompt request failed locally.",
    retryable: false,
    outcomeCertainty: "definite_failure",
    httpStatus: null,
    providerCode: null,
    attempts: 0
  };
}

function providerPublicConfig(provider, credentialStatus) {
  return {
    id: provider.id,
    label: provider.label,
    registrationUrl: provider.registrationUrl,
    endpointHost: provider.chatUrl ? new URL(provider.chatUrl).host : null,
    defaultModel: provider.defaultModel,
    configurableEndpoint: provider.configurableEndpoint,
    configurableModel: provider.configurableModel,
    mediaMode: provider.mediaMode,
    local: Boolean(provider.local),
    requiresCredential: provider.requiresCredential !== false,
    credential: credentialStatus,
    localStatus: provider.local ? credentialStatus : null
  };
}

function runSummary(run, includeOutput = false) {
  const value = {
    runId: run.runId,
    state: run.state,
    providerId: run.plan.providerId,
    providerLabel: PROVIDERS[run.plan.providerId].label,
    endpointHost: run.plan.endpointHost,
    model: run.plan.model,
    target: run.plan.target,
    outputLanguage: run.plan.outputLanguage,
    templateId: run.plan.template.templateId,
    templateTitle: run.plan.template.title,
    planHash: run.plan.planHash,
    createdAt: run.createdAt,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    cancellationRequestedAt: run.cancellationRequestedAt,
    cancellationMessage: run.cancellationMessage,
    error: run.error,
    receipt: run.receipt,
    validation: run.validation
  };
  if (includeOutput && run.state === "completed") value.output = run.output;
  return value;
}

class PromptOrchestrator {
  constructor({ credentialVault, localQwen = null, mediaStore = null, fetchImpl = globalThis.fetch, now = () => Date.now(), randomUUID = crypto.randomUUID }) {
    this.credentialVault = credentialVault;
    this.localQwen = localQwen;
    this.mediaStore = mediaStore;
    this.fetchImpl = fetchImpl;
    this.now = now;
    this.randomUUID = randomUUID;
    this.plans = new Map();
    this.runs = new Map();
    this.controllers = new Map();
  }

  cleanup() {
    const now = this.now();
    for (const [planHash, record] of this.plans) {
      if (record.expiresAt <= now) this.plans.delete(planHash);
    }
    if (this.runs.size <= MAX_RUNS) return;
    const removable = [...this.runs.values()]
      .filter((run) => ["completed", "failed", "cancel_requested"].includes(run.state))
      .sort((left, right) => String(left.finishedAt || left.createdAt).localeCompare(String(right.finishedAt || right.createdAt)));
    while (this.runs.size > MAX_RUNS && removable.length) {
      const run = removable.shift();
      this.runs.delete(run.runId);
    }
  }

  providerStatuses() {
    return Object.values(PROVIDERS).map((provider) => providerPublicConfig(
      provider,
      provider.local
        ? (this.localQwen?.status() || { providerId: provider.id, configured: false, source: null, readiness: "missing" })
        : this.credentialVault.status(provider.id)
    ));
  }

  setCredential({ providerId, apiKey, remember = false }) {
    return this.credentialVault.set(providerId, apiKey, Boolean(remember));
  }

  clearCredential(providerId) {
    return this.credentialVault.clear(providerId);
  }

  mediaList() { return this.mediaStore?.list() || []; }

  addMediaPaths(paths) {
    if (!this.mediaStore) throw new PromptProviderError("Reference media is unavailable.", { code: "media_unavailable", phase: "media" });
    return this.mediaStore.addPaths(paths);
  }

  clearMedia() { return this.mediaStore?.clear() || []; }

  preflight(input) {
    this.cleanup();
    const mediaRecords = this.mediaStore ? this.mediaStore.resolve(input.mediaIds) : [];
    const media = mediaRecords.map(({ filePath: _filePath, extension: _extension, ...item }) => item);
    const plan = normalizePlan({ ...input, media });
    const local = plan.providerId === "local_qwen";
    const credential = local ? this.localQwen?.status() : this.credentialVault.status(plan.providerId);
    if (!credential?.configured) {
      throw new PromptProviderError(local ? "Local GGUF is not ready. Verify it in API settings." : "This provider has no configured API key.", {
        code: local ? "local_not_ready" : "credential_missing",
        phase: "preflight"
      });
    }
    if (local) {
      if (plan.model !== credential.modelFilename) throw new PromptProviderError("The selected local model changed; reopen API settings and generate a new plan.", { code: "local_model_changed", phase: "preflight" });
      if (mediaRecords.length && !credential.visionReady) throw new PromptProviderError("Local visual prompting requires a verified projector matched to the selected model.", { code: "local_vision_not_ready", phase: "preflight" });
      if (mediaRecords.some((item) => item.kind === "video") && !credential.videoReady) throw new PromptProviderError("Local video prompting requires a configured FFmpeg executable.", { code: "local_video_not_ready", phase: "preflight" });
    }
    const issuedAt = new Date(this.now()).toISOString();
    const expiresAt = this.now() + PLAN_TTL_MS;
    const localConfigFingerprint = local ? localExecutionFingerprint(this.localQwen, credential) : null;
    this.plans.set(plan.planHash, { plan, mediaRecords, issuedAt, expiresAt, consumedAt: null, localConfigFingerprint });
    return {
      schemaVersion: "t8-prompt-preflight/v1",
      planHash: plan.planHash,
      issuedAt,
      expiresAt: new Date(expiresAt).toISOString(),
      providerId: plan.providerId,
      providerLabel: PROVIDERS[plan.providerId].label,
      endpointHost: plan.endpointHost,
      model: plan.model,
      target: plan.target,
      outputLanguage: plan.outputLanguage,
      rewriteMode: plan.rewriteMode,
      durationSeconds: plan.durationSeconds,
      templateId: plan.template.templateId,
      templateTitle: plan.template.title,
      requiredAnchorCount: plan.template.requiredAnchors.length,
      credentialSource: credential.source,
      plannedProviderCalls: local ? 0 : 1,
      plannedLocalCalls: local ? 1 : 0,
      plannedChatCalls: 1,
      plannedUploadCalls: plan.providerId === "seedance_nz" ? mediaRecords.length : 0,
      mediaCount: mediaRecords.length,
      automaticRetries: 0,
      cost: local ? "0" : "unknown",
      confirmationRequired: true,
      confirmationKind: local ? "local_compute" : "paid_remote"
    };
  }

  start({ planHash, confirmed }) {
    this.cleanup();
    if (confirmed !== true) {
      throw new PromptProviderError("Explicit run confirmation is required.", {
        code: "confirmation_required",
        phase: "preflight"
      });
    }
    const record = this.plans.get(String(planHash || ""));
    if (!record || record.expiresAt <= this.now()) {
      throw new PromptProviderError("The preflight plan is missing or expired.", {
        code: "plan_expired",
        phase: "preflight"
      });
    }
    if (record.consumedAt) {
      throw new PromptProviderError("This preflight plan has already been consumed.", {
        code: "plan_already_consumed",
        phase: "preflight"
      });
    }
    const local = record.plan.providerId === "local_qwen";
    if (local) {
      const current = this.localQwen?.status();
      if (!current?.configured || localExecutionFingerprint(this.localQwen, current) !== record.localConfigFingerprint) {
        throw new PromptProviderError("Local GGUF settings changed after confirmation. Generate a new confirmation plan.", {
          code: "local_config_changed",
          phase: "preflight"
        });
      }
    }
    const credential = local ? { key: "", source: "local" } : this.credentialVault.resolve(record.plan.providerId);
    if (!local && !credential.key) {
      throw new PromptProviderError("The provider credential is no longer available.", {
        code: "credential_missing",
        phase: "preflight"
      });
    }

    // Consume before the network call. A second renderer IPC cannot produce a second POST.
    record.consumedAt = new Date(this.now()).toISOString();
    const runId = this.randomUUID();
    const controller = new AbortController();
    const run = {
      runId,
      state: "running",
      plan: record.plan,
      createdAt: record.consumedAt,
      startedAt: record.consumedAt,
      finishedAt: null,
      cancellationRequestedAt: null,
      cancellationMessage: null,
      output: null,
      receipt: null,
      validation: null,
      error: null,
      localConfigFingerprint: record.localConfigFingerprint,
      mediaRecords: record.mediaRecords || []
    };
    this.runs.set(runId, run);
    this.controllers.set(runId, controller);
    void this.execute(run, credential.key, controller);
    return runSummary(run, false);
  }

  async execute(run, apiKey, controller) {
    let localSession = null;
    try {
      let result;
      if (run.plan.providerId === "local_qwen") {
        localSession = await this.localQwen.beginSession({
          vision: run.mediaRecords.length > 0,
          video: run.mediaRecords.some((item) => item.kind === "video"),
          signal: controller.signal,
          expectedConfigFingerprint: run.localConfigFingerprint
        });
        result = await localSession.complete(run.plan, { mediaRecords: run.mediaRecords });
      } else {
        result = await callProvider(run.plan, apiKey, {
          fetchImpl: this.fetchImpl,
          signal: controller.signal,
          mediaRecords: run.mediaRecords
        });
      }
      run.output = result.output;
      run.receipt = result.receipt;
      run.validation = validateEnhancedPrompt({
        target: run.plan.target,
        outputLanguage: run.plan.outputLanguage,
        intent: run.plan.intent,
        output: result.output,
        requiredAnchors: run.plan.template.requiredAnchors
      });
      run.state = "completed";
    } catch (error) {
      run.error = publicError(error);
      run.state = controller.signal.aborted ? "cancel_requested" : "failed";
      if (controller.signal.aborted) {
        run.cancellationMessage = run.plan.providerId === "local_qwen"
          ? "Local inference was cancelled and has no remote billing effect."
          : "Cancellation was requested after submission; provider completion and billing status may be unknown.";
      }
    } finally {
      run.finishedAt = new Date(this.now()).toISOString();
      this.controllers.delete(run.runId);
      if (localSession) {
        try { await localSession.close({ force: run.state !== "completed" }); }
        catch { /* Cleanup must not replace a completed result or the original failure. */ }
      }
      apiKey = "";
      this.cleanup();
    }
  }

  status(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run) throw new PromptProviderError("Prompt run not found.", { code: "run_not_found", phase: "status" });
    return runSummary(run, true);
  }

  cancel(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run) throw new PromptProviderError("Prompt run not found.", { code: "run_not_found", phase: "cancel" });
    if (run.state !== "running") return runSummary(run, run.state === "completed");
    run.cancellationRequestedAt = new Date(this.now()).toISOString();
    run.cancellationMessage = run.plan.providerId === "local_qwen"
      ? "Cancellation requested. Local inference will stop and has no remote billing effect."
      : "Cancellation requested. The remote completion or billing state is unknown until the local request reaches a terminal state.";
    this.controllers.get(run.runId)?.abort(new Error("user_cancelled"));
    return runSummary(run, false);
  }

  projectSnapshot(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run || run.state !== "completed") throw new PromptProviderError("Only a completed prompt run can be saved.", { code: "run_not_completed", phase: "project" });
    return {
      createdAt: run.createdAt,
      intent: run.plan.intent,
      constraints: run.plan.constraints,
      templateId: run.plan.template.templateId,
      templateTitle: run.plan.template.title,
      templateHash: sha256Canonical(run.plan.template),
      target: run.plan.target,
      outputLanguage: run.plan.outputLanguage,
      durationSeconds: run.plan.durationSeconds,
      rewriteMode: run.plan.rewriteMode,
      providerId: run.plan.providerId,
      providerLabel: PROVIDERS[run.plan.providerId].label,
      endpointHost: run.plan.endpointHost,
      model: run.plan.model,
      output: run.output,
      validation: run.validation,
      receipt: run.receipt,
      media: run.plan.media
    };
  }

  auditRecord(runId) {
    const run = this.runs.get(String(runId || ""));
    if (!run) return null;
    return {
      schemaVersion: "t8-prompt-run-audit/v1",
      runId: run.runId,
      createdAt: run.createdAt,
      finishedAt: run.finishedAt,
      state: run.state,
      planHash: run.plan.planHash,
      providerId: run.plan.providerId,
      endpointHost: run.plan.endpointHost,
      model: run.plan.model,
      target: run.plan.target,
      outputLanguage: run.plan.outputLanguage,
      templateId: run.plan.template.templateId,
      templateHash: sha256Canonical(run.plan.template),
      outputSha256: run.receipt?.outputSha256 || null,
      validationStatus: run.validation?.status || null,
      errorCode: run.error?.code || null
    };
  }
}

module.exports = { MAX_RUNS, PLAN_TTL_MS, PromptOrchestrator, providerPublicConfig, publicError, runSummary };
