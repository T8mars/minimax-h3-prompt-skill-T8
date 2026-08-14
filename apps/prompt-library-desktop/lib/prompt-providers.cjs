const crypto = require("node:crypto");
const fs = require("node:fs/promises");

const PROVIDERS = Object.freeze({
  seedance_nz: Object.freeze({
    id: "seedance_nz",
    label: "贞贞的平价小屋",
    registrationUrl: "https://api.seedance.nz/sign-up?aff=5f4w",
    chatUrl: "https://api.seedance.nz/v1/chat/completions",
    uploadUrl: "https://api.seedance.nz/v1/files/upload",
    defaultModel: "bytedance/doubao-seed-evolving",
    environmentKey: "SEEDANCE_API_KEY",
    configurableEndpoint: false,
    configurableModel: false,
    mediaMode: "upload"
  }),
  t8star_workshop: Object.freeze({
    id: "t8star_workshop",
    label: "贞贞的 AI 工坊",
    registrationUrl: "https://ai.t8star.org/register?aff=dP7j",
    chatUrl: "https://ai.t8star.org/v1/chat/completions",
    uploadUrl: null,
    defaultModel: "gemini-3.5-flash",
    environmentKey: "T8STAR_API_KEY",
    configurableEndpoint: false,
    configurableModel: true,
    mediaMode: "inline"
  }),
  openai_compatible: Object.freeze({
    id: "openai_compatible",
    label: "OpenAI 兼容接口",
    registrationUrl: null,
    chatUrl: null,
    uploadUrl: null,
    defaultModel: "",
    environmentKey: "OPENAI_API_KEY",
    configurableEndpoint: true,
    configurableModel: true,
    mediaMode: "inline"
  })
});

const TARGETS = new Set(["minimaxH3", "seedance20"]);
const OUTPUT_LANGUAGES = new Set(["zh-CN", "en"]);
const REWRITE_MODES = Object.freeze({ strict: 0.2, balanced: 0.7, creative: 1.2 });
const MAX_INTENT_CHARS = 12000;
const MAX_TEMPLATE_CHARS = 80000;
const MAX_RESPONSE_CHARS = 200000;

class PromptProviderError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "PromptProviderError";
    this.code = details.code || "provider_error";
    this.phase = details.phase || "provider";
    this.retryable = Boolean(details.retryable);
    this.outcomeCertainty = details.outcomeCertainty || "definite_failure";
    this.httpStatus = Number.isInteger(details.httpStatus) ? details.httpStatus : null;
    this.providerCode = details.providerCode || null;
    this.attempts = Number.isInteger(details.attempts) ? details.attempts : 1;
  }
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function sha256Canonical(value) {
  return crypto.createHash("sha256").update(stableStringify(value), "utf8").digest("hex");
}

function cleanText(value, maxLength, field) {
  const text = String(value || "").replace(/\r\n/gu, "\n").trim();
  if (!text) throw new PromptProviderError(`${field} is required.`, { code: "invalid_input", phase: "preflight" });
  if (text.length > maxLength) throw new PromptProviderError(`${field} is too long.`, { code: "input_too_large", phase: "preflight" });
  return text;
}

function normalizeOpenAiChatUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || "").trim());
  } catch {
    throw new PromptProviderError("OpenAI-compatible Base URL is invalid.", { code: "invalid_endpoint", phase: "preflight" });
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.hash || parsed.search) {
    throw new PromptProviderError("OpenAI-compatible Base URL must be a clean HTTPS URL without credentials, query, or fragment.", { code: "invalid_endpoint", phase: "preflight" });
  }
  const host = parsed.hostname.toLocaleLowerCase();
  if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(host)) {
    throw new PromptProviderError("Loopback endpoints are not enabled for the direct provider adapter.", { code: "invalid_endpoint", phase: "preflight" });
  }
  const pathname = parsed.pathname.replace(/\/+$/u, "");
  if (pathname.endsWith("/chat/completions")) parsed.pathname = pathname;
  else if (pathname.endsWith("/v1")) parsed.pathname = `${pathname}/chat/completions`;
  else parsed.pathname = `${pathname}/v1/chat/completions`.replace(/\/+/gu, "/");
  return parsed.toString();
}

function normalizeModel(value, provider) {
  const model = String(value || provider.defaultModel || "").trim();
  if (!model || /\s/u.test(model) || model.length > 160) {
    throw new PromptProviderError("A valid model ID is required.", { code: "invalid_model", phase: "preflight" });
  }
  return model;
}

function normalizeTemplate(input = {}) {
  const template = {
    id: String(input.id || "").slice(0, 240),
    templateId: String(input.templateId || input.id || "").slice(0, 240),
    title: String(input.title || "").slice(0, 500),
    summary: String(input.summary || "").slice(0, 6000),
    inputFormat: String(input.inputFormat || "").slice(0, 6000),
    recommendedInput: String(input.recommendedInput || "").slice(0, 12000),
    requiredAnchors: Array.isArray(input.requiredAnchors)
      ? input.requiredAnchors.map((item) => String(item).trim()).filter(Boolean).slice(0, 30)
      : [],
    creativeDna: input.creativeDna && typeof input.creativeDna === "object" ? input.creativeDna : {},
    surfaceGuide: String(input.surfaceGuide || "").slice(0, MAX_TEMPLATE_CHARS)
  };
  if (!template.id || !template.title) throw new PromptProviderError("A valid template is required.", { code: "invalid_template", phase: "preflight" });
  return template;
}

function targetContract(target, outputLanguage = "zh-CN") {
  const chinese = outputLanguage === "zh-CN";
  if (target === "minimaxH3") {
    return [
      chinese
        ? "Return one executable MiniMax H3 prompt with all descriptive prose in Simplified Chinese. Keep official field labels, timestamp syntax, dialogue/audio tags, and other machine-readable keys in their required English form."
        : "Return one executable MiniMax H3 prompt in English.",
      "Use consecutive shot timestamps within one overall duration, explicit subject and scene continuity, camera behavior, lighting/style, dialogue/audio when requested, and a final constraints field.",
      "Do not output analysis, Markdown fences, trace notes, or alternative versions."
    ].join(" ");
  }
  return [
    chinese ? "Return one executable Seedance 2.0 prompt in Simplified Chinese." : "Return one executable Seedance 2.0 prompt in English.",
    "Keep stable subject bindings and ordered shots or a coherent continuous take; use one primary camera behavior per shot and state the overall duration only once.",
    "Do not output analysis, Markdown fences, trace notes, or alternative versions."
  ].join(" ");
}

function buildMessages(plan) {
  const templateJson = stableStringify({
    title: plan.template.title,
    summary: plan.template.summary,
    input_format: plan.template.inputFormat,
    recommended_input: plan.template.recommendedInput,
    required_anchors: plan.template.requiredAnchors,
    creative_dna: plan.template.creativeDna
  });
  const system = [
    "You are the T8 Prompt Library instantiation engine.",
    "Preserve every explicit user fact. Instantiate the selected reusable mechanism with the user's subject, scene, event, payoff, sound, and constraints instead of merely polishing adjectives.",
    "Required anchors are structural obligations. Anti-copy exclusions and source-specific surfaces must not leak into the new prompt.",
    "The canonical surface guide is only a format reference; never copy its identities, props, setting, dialogue, wardrobe, signage, or shot surfaces.",
    targetContract(plan.target, plan.outputLanguage)
  ].join("\n");
  const user = [
    `USER INTENT:\n${plan.intent}`,
    `TARGET DURATION: ${plan.durationSeconds} seconds`,
    `OUTPUT LANGUAGE: ${plan.outputLanguage === "zh-CN" ? "Simplified Chinese" : "English"}`,
    `REWRITE MODE: ${plan.rewriteMode}`,
    plan.constraints ? `USER HARD CONSTRAINTS:\n${plan.constraints}` : "USER HARD CONSTRAINTS: none",
    plan.media.length ? `REFERENCE MEDIA:\n${plan.media.map((item) => `${item.label} ${item.kind} ${item.sha256}`).join("\n")}` : "",
    `SELECTED TEMPLATE CONTRACT:\n${templateJson}`,
    plan.template.surfaceGuide ? `CANONICAL FORMAT GUIDE (surface content is forbidden):\n${plan.template.surfaceGuide}` : ""
  ].filter(Boolean).join("\n\n");
  return [{ role: "system", content: system }, { role: "user", content: user }];
}

function normalizePlan(input = {}) {
  const provider = PROVIDERS[input.providerId];
  if (!provider) throw new PromptProviderError("Unsupported provider.", { code: "invalid_provider", phase: "preflight" });
  const target = String(input.target || "");
  if (!TARGETS.has(target)) throw new PromptProviderError("Unsupported target model.", { code: "invalid_target", phase: "preflight" });
  const rewriteMode = Object.hasOwn(REWRITE_MODES, input.rewriteMode) ? input.rewriteMode : "balanced";
  const outputLanguage = OUTPUT_LANGUAGES.has(String(input.outputLanguage || "")) ? String(input.outputLanguage) : "zh-CN";
  const durationSeconds = Number(input.durationSeconds || 15);
  if (!Number.isFinite(durationSeconds) || durationSeconds < 2 || durationSeconds > 15) {
    throw new PromptProviderError("Duration must be between 2 and 15 seconds.", { code: "invalid_duration", phase: "preflight" });
  }
  const endpoint = provider.configurableEndpoint ? normalizeOpenAiChatUrl(input.baseUrl) : provider.chatUrl;
  const model = normalizeModel(input.model, provider);
  const normalized = {
    schemaVersion: "t8-prompt-enhance-request/v1",
    providerId: provider.id,
    endpoint,
    endpointHost: new URL(endpoint).host,
    model,
    target,
    outputLanguage,
    rewriteMode,
    durationSeconds,
    intent: cleanText(input.intent, MAX_INTENT_CHARS, "Intent"),
    constraints: String(input.constraints || "").replace(/\r\n/gu, "\n").trim().slice(0, 12000),
    template: normalizeTemplate(input.template),
    media: Array.isArray(input.media) ? input.media.map((item) => ({
      mediaId: String(item.mediaId || "").slice(0, 120),
      name: String(item.name || "").slice(0, 240),
      kind: item.kind === "video" ? "video" : "image",
      mimeType: String(item.mimeType || "").slice(0, 120),
      sizeBytes: Number(item.sizeBytes || 0),
      sha256: String(item.sha256 || "").slice(0, 64),
      label: String(item.label || "").slice(0, 80)
    })).filter((item) => item.mediaId && item.sha256) : []
  };
  normalized.messages = buildMessages(normalized);
  normalized.planHash = sha256Canonical({ ...normalized, messages: normalized.messages });
  return normalized;
}

function safeProviderMessage(value, apiKey = "") {
  let text = String(value || "").replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 600);
  if (apiKey) text = text.replaceAll(apiKey, "***");
  return text.replace(/\bsk-[A-Za-z0-9_-]{4,}\b/gu, "***") || "No safe error message returned.";
}

function errorFromStatus(status, message, apiKey, phase = "chat") {
  const labels = {
    400: ["request_rejected", false],
    401: ["authentication_failed", false],
    402: ["insufficient_balance", false],
    413: ["payload_too_large", false],
    429: ["rate_limited", true],
    502: ["upstream_gateway_failure", true],
    503: ["upstream_unavailable", true],
    504: ["upstream_timeout", true]
  };
  const [code, retryable] = labels[status] || [status >= 500 ? "provider_server_error" : "provider_request_failed", status >= 500];
  return new PromptProviderError(safeProviderMessage(message, apiKey), { code, phase, retryable, httpStatus: status });
}

function extractResponse(data) {
  let content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) content = content.filter((part) => part && (part.type === "text" || !part.type)).map((part) => part.text || "").join("");
  if (typeof content !== "string" || !content.trim()) throw new PromptProviderError("Provider response is missing choices[0].message.content.", { code: "invalid_response", phase: "response" });
  const output = content.trim();
  if (output.length > MAX_RESPONSE_CHARS) throw new PromptProviderError("Provider response is too large.", { code: "response_too_large", phase: "response" });
  return output.replace(/^```(?:text|markdown)?\s*/iu, "").replace(/\s*```$/u, "").trim();
}

async function readMedia(record) {
  if (!record?.filePath) throw new PromptProviderError("Reference media is unavailable.", { code: "media_missing", phase: "media" });
  const data = await fs.readFile(record.filePath);
  if (!data.length || data.length > 50 * 1024 * 1024) throw new PromptProviderError("Reference media is empty or exceeds 50 MiB.", { code: "media_too_large", phase: "media" });
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  if (hash !== record.sha256) throw new PromptProviderError("Reference media changed after selection.", { code: "media_changed", phase: "media" });
  return data;
}

async function uploadSeedanceMedia(record, apiKey, fetchImpl, signal) {
  const data = await readMedia(record);
  const form = new FormData();
  form.set("file", new Blob([data], { type: record.mimeType }), record.name || ("reference." + (record.extension || "bin")));
  let response;
  try {
    response = await fetchImpl(PROVIDERS.seedance_nz.uploadUrl, {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey },
      body: form,
      signal,
      redirect: "error"
    });
  } catch (error) {
    throw new PromptProviderError("Seedance media upload network error: " + (error?.name || "Error") + ".", { code: "media_upload_network", phase: "media", retryable: false });
  }
  const raw = await response.text();
  if (!response.ok) throw errorFromStatus(response.status, raw, apiKey, "media");
  let payload;
  try { payload = JSON.parse(raw); }
  catch { throw new PromptProviderError("Seedance media upload returned invalid JSON.", { code: "media_upload_invalid_json", phase: "media" }); }
  const url = payload?.url;
  if (typeof url !== "string" || !/^https?:\/\//u.test(url)) throw new PromptProviderError("Seedance media upload did not return a valid HTTP(S) URL.", { code: "media_upload_url_missing", phase: "media" });
  return url;
}

async function buildMediaParts(plan, apiKey, options = {}) {
  const records = Array.isArray(options.mediaRecords) ? options.mediaRecords : [];
  if (!records.length) return { parts: [], uploadCount: 0 };
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const parts = [];
  let uploadCount = 0;
  for (const record of records) {
    const label = record.label;
    const lead = record.kind === "image"
      ? "The next attached image is " + label + "."
      : "The next attached temporal video is " + label + ". Analyze its complete timeline.";
    parts.push({ type: "text", text: lead });
    let url;
    if (plan.providerId === "seedance_nz") {
      url = await uploadSeedanceMedia(record, apiKey, fetchImpl, options.signal);
      uploadCount += 1;
    } else {
      const data = await readMedia(record);
      url = "data:" + record.mimeType + ";base64," + data.toString("base64");
    }
    if (record.kind === "image") parts.push({ type: "image_url", image_url: { url } });
    else if (plan.providerId === "t8star_workshop") parts.push({ type: "image_url", image_url: { url } });
    else parts.push({ type: "video_url", video_url: { url } });
  }
  return { parts, uploadCount };
}

function messagesWithMedia(messages, parts) {
  if (!parts.length) return messages;
  return messages.map((message, index) => index === messages.length - 1 && message.role === "user"
    ? { ...message, content: [{ type: "text", text: String(message.content) }, ...parts] }
    : message);
}

async function callProvider(plan, apiKey, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new PromptProviderError("Fetch is unavailable.", { code: "transport_unavailable", phase: "transport" });
  const key = cleanText(apiKey, 4096, "API key");
  const controller = new AbortController();
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 300000;
  const timeout = setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);
  const forwardAbort = () => controller.abort(options.signal?.reason || new Error("cancelled"));
  if (options.signal) {
    if (options.signal.aborted) forwardAbort();
    else options.signal.addEventListener("abort", forwardAbort, { once: true });
  }
  const startedAt = Date.now();
  try {
    const media = await buildMediaParts(plan, key, { fetchImpl, signal: controller.signal, mediaRecords: options.mediaRecords });
    const messages = messagesWithMedia(plan.messages, media.parts);
    let response;
    try {
      controller.signal.throwIfAborted();
      response = await fetchImpl(plan.endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: plan.model,
          messages,
          temperature: Number.isFinite(plan.temperature) ? plan.temperature : REWRITE_MODES[plan.rewriteMode],
          stream: false
        }),
        signal: controller.signal,
        redirect: "error"
      });
    } catch (error) {
      const cancelled = options.signal?.aborted;
      const timedOut = controller.signal.aborted && !cancelled;
      throw new PromptProviderError(cancelled ? "Cancellation requested after submission; remote billing state is unknown." : timedOut ? "Provider response timed out; remote billing state is unknown." : `Provider network error: ${error?.name || "Error"}.`, {
        code: cancelled ? "cancel_requested_outcome_unknown" : timedOut ? "read_timeout_outcome_unknown" : "network_outcome_unknown",
        phase: "chat",
        retryable: false,
        outcomeCertainty: "unknown"
      });
    }
    const raw = await response.text();
    if (!response.ok) throw errorFromStatus(response.status, raw, key);
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new PromptProviderError("Provider returned invalid JSON.", { code: "invalid_json", phase: "response" }); }
    const output = extractResponse(data);
    return {
      output,
      receipt: {
        schemaVersion: "t8-prompt-execution-receipt/v1",
        providerId: plan.providerId,
        endpointHost: plan.endpointHost,
        model: plan.model,
        requestId: response.headers?.get?.("x-request-id") || response.headers?.get?.("request-id") || data?.id || null,
        usage: data?.usage && typeof data.usage === "object" ? data.usage : null,
        attempts: 1,
        mediaCount: plan.media.length,
        mediaUploadCount: media.uploadCount,
        durationMs: Date.now() - startedAt,
        outputSha256: crypto.createHash("sha256").update(output, "utf8").digest("hex")
      }
    };
  } finally {
    clearTimeout(timeout);
    if (options.signal) options.signal.removeEventListener("abort", forwardAbort);
  }
}

module.exports = {
  MAX_INTENT_CHARS,
  OUTPUT_LANGUAGES,
  PROVIDERS,
  PromptProviderError,
  REWRITE_MODES,
  buildMediaParts,
  buildMessages,
  callProvider,
  normalizeOpenAiChatUrl,
  messagesWithMedia,
  normalizePlan,
  safeProviderMessage,
  sha256Canonical,
  stableStringify
};
