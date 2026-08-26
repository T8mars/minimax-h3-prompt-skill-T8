const crypto = require("node:crypto");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { PromptProviderError } = require("./prompt-providers.cjs");
const { LOCAL_MODEL_ALIAS } = require("./local-qwen-config.cjs");
const { buildLocalMediaParts, messagesWithLocalMedia } = require("./local-qwen-media.cjs");

const LOCAL_IDLE_TTL_MS = 10 * 60 * 1000;
const START_TIMEOUT_MS = 4 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000;

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const finish = (callback, value) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      callback(value);
    };
    const timer = setTimeout(() => finish(resolve), ms);
    const abort = () => finish(reject, signal.reason || new Error("cancelled"));
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

function outputText(data) {
  let content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    content = content.filter((part) => part && (part.type === "text" || !part.type)).map((part) => part.text || "").join("");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw new PromptProviderError("Local GGUF returned no final answer. Disable thinking or increase the output token limit.", {
      code: "local_empty_response", phase: "response"
    });
  }
  return content.trim().replace(/^```(?:text|markdown)?\s*/iu, "").replace(/\s*```$/u, "").trim();
}

function estimatedTextTokens(messages) {
  let tokens = 0;
  const addText = (value) => {
    const text = String(value || "");
    const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/gu) || []).length;
    tokens += cjk + Math.ceil((text.length - cjk) / 4);
  };
  for (const message of Array.isArray(messages) ? messages : []) {
    tokens += 8;
    if (Array.isArray(message?.content)) {
      for (const part of message.content) if (part?.type === "text") addText(part.text);
    } else addText(message?.content);
  }
  return tokens;
}

class AsyncGate {
  constructor() {
    this.locked = false;
    this.waiters = [];
  }

  acquire(signal) {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject, signal, abort: null };
      waiter.abort = () => {
        const index = this.waiters.indexOf(waiter);
        if (index >= 0) this.waiters.splice(index, 1);
        reject(signal.reason || new Error("cancelled"));
      };
      if (signal?.aborted) return waiter.abort();
      signal?.addEventListener("abort", waiter.abort, { once: true });
      this.waiters.push(waiter);
    });
  }

  release() {
    const waiter = this.waiters.shift();
    if (!waiter) {
      this.locked = false;
      return;
    }
    waiter.signal?.removeEventListener("abort", waiter.abort);
    waiter.resolve();
  }
}

class LocalQwenSession {
  constructor(manager, settings, signal) {
    this.manager = manager;
    this.settings = settings;
    this.signal = signal;
    this.closed = false;
  }

  complete(plan, options = {}) {
    if (this.closed) throw new PromptProviderError("Local GGUF session is closed.", { code: "local_session_closed", phase: "local" });
    return this.manager.complete(this, plan, options);
  }

  async close({ force = false } = {}) {
    if (this.closed) return;
    this.closed = true;
    await this.manager.endSession(this.settings.unloadPolicy, { force });
  }
}

class LocalQwenManager {
  constructor({ configStore, fetchImpl = globalThis.fetch, spawnImpl = spawn, now = () => Date.now(), imageConverter = null }) {
    this.configStore = configStore;
    this.fetchImpl = fetchImpl;
    this.spawnImpl = spawnImpl;
    this.now = now;
    this.imageConverter = imageConverter;
    this.gate = new AsyncGate();
    this.server = null;
    this.serverKey = null;
    this.idleTimer = null;
  }

  status() { return this.configStore.status(); }
  executionFingerprint() { return this.configStore.executionFingerprint(); }
  async setConfig(input) {
    if (this.gate.locked) throw new Error("Wait for the active local GGUF run to finish or cancel it before changing settings.");
    const before = this.executionFingerprint();
    const status = this.configStore.set(input);
    if (this.server && this.executionFingerprint() !== before) await this.stop();
    return status;
  }
  async verify() {
    if (this.gate.locked) throw new Error("Wait for the active local GGUF run to finish or cancel it before verifying files.");
    if (this.server) await this.stop();
    return this.configStore.verify();
  }

  async beginSession({ vision = false, video = false, signal, expectedConfigFingerprint = "" } = {}) {
    let acquired = false;
    try {
      await this.gate.acquire(signal);
      acquired = true;
      if (expectedConfigFingerprint && this.executionFingerprint() !== expectedConfigFingerprint) {
        throw new Error("Local GGUF settings changed after confirmation. Generate a new confirmation plan.");
      }
      const settings = this.configStore.requireReady({ vision, video });
      await this.ensureServer(settings, { vision, signal });
      return new LocalQwenSession(this, settings, signal);
    } catch (error) {
      if (acquired) this.gate.release();
      if (error instanceof PromptProviderError) throw error;
      const cancelled = Boolean(signal?.aborted || error?.name === "AbortError");
      throw new PromptProviderError(cancelled ? "Local GGUF startup was cancelled." : error.message, {
        code: cancelled ? "local_cancelled" : "local_not_ready", phase: "local"
      });
    }
  }

  clearIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  serverSettingsKey(settings, vision) {
    return JSON.stringify([
      settings.runtimeExecutable,
      settings.modelPath,
      vision ? settings.mmprojPath : "",
      settings.contextSize,
      settings.cpuThreads
    ]);
  }

  async ensureServer(settings, { vision, signal }) {
    this.clearIdleTimer();
    const key = this.serverSettingsKey(settings, vision);
    if (this.server?.process && this.server.process.exitCode === null && this.serverKey === key) return;
    await this.stop();
    const port = await freePort();
    const token = crypto.randomBytes(32).toString("base64url");
    const cpuThreads = settings.cpuThreads || Math.max(1, Math.floor((os.availableParallelism?.() || os.cpus().length || 2) / 2));
    const args = [
      "--model", settings.modelPath,
      "--alias", LOCAL_MODEL_ALIAS,
      "--api-key", token,
      "--host", "127.0.0.1",
      "--port", String(port),
      "--ctx-size", String(settings.contextSize),
      "--parallel", "1",
      "--threads", String(cpuThreads),
      "--n-gpu-layers", "auto",
      "--flash-attn", "auto",
      "--cache-type-k", "q8_0",
      "--cache-type-v", "q8_0",
      "--jinja",
      "--no-webui",
      "--fit", "on",
      "--fit-target", "1536"
    ];
    if (vision) args.push("--mmproj", settings.mmprojPath, "--image-min-tokens", "1024", "--image-max-tokens", "1024");
    const runtimeDir = path.dirname(settings.runtimeExecutable);
    const environment = { ...process.env, PATH: `${runtimeDir}${path.delimiter}${process.env.PATH || ""}` };
    const child = this.spawnImpl(settings.runtimeExecutable, args, {
      cwd: runtimeDir,
      env: environment,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    const server = { process: child, port, token, baseUrl: `http://127.0.0.1:${port}`, logTail: "" };
    const appendLog = (chunk) => { server.logTail = (server.logTail + chunk.toString("utf8")).slice(-4000); };
    child.stdout?.on("data", appendLog);
    child.stderr?.on("data", appendLog);
    this.server = server;
    this.serverKey = key;
    const deadline = this.now() + START_TIMEOUT_MS;
    try {
      while (this.now() < deadline) {
        if (signal?.aborted) throw signal.reason || new Error("cancelled");
        if (child.exitCode !== null) throw new Error("llama-server exited while loading the model.");
        try {
          const response = await this.fetchImpl(`${server.baseUrl}/health`, {
            headers: { Authorization: `Bearer ${token}` },
            signal
          });
          if (response.status === 200) return;
        } catch (error) {
          if (signal?.aborted) throw error;
        }
        await delay(250, signal);
      }
      throw new Error("llama-server did not become ready within four minutes.");
    } catch (error) {
      await this.stop();
      throw error;
    }
  }

  async complete(session, plan, { mediaRecords = [] } = {}) {
    const server = this.server;
    if (!server?.process || server.process.exitCode !== null) throw new PromptProviderError("Local GGUF is not running.", { code: "local_runtime_stopped", phase: "local" });
    const startedAt = this.now();
    let messages = plan.messages;
    let visualPartCount = 0;
    if (mediaRecords.length) {
      try {
        const media = await buildLocalMediaParts(mediaRecords, session.settings, {
          signal: session.signal,
          imageConverter: this.imageConverter
        });
        visualPartCount = media.visualPartCount;
        messages = messagesWithLocalMedia(messages, media.parts);
      } catch (error) {
        if (session.signal?.aborted) throw new PromptProviderError("Local media processing was cancelled.", { code: "local_cancelled", phase: "media" });
        throw new PromptProviderError(error.message, { code: "local_media_failed", phase: "media" });
      }
    }
    const estimatedInputTokens = estimatedTextTokens(messages) + visualPartCount * 1024;
    if (estimatedInputTokens + session.settings.maxTokens + 1024 >= session.settings.contextSize) {
      throw new PromptProviderError("Local GGUF context is too small for this request. Reduce media/output length or raise the local context setting.", {
        code: "local_context_overflow",
        phase: "local"
      });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error("timeout")), REQUEST_TIMEOUT_MS);
    const abort = () => controller.abort(session.signal?.reason || new Error("cancelled"));
    if (session.signal?.aborted) abort();
    else session.signal?.addEventListener("abort", abort, { once: true });
    const seed = Number.isInteger(plan.seed) ? plan.seed >>> 0 : 0;
    const payload = {
      model: LOCAL_MODEL_ALIAS,
      messages,
      seed,
      max_tokens: session.settings.maxTokens,
      temperature: Number.isFinite(plan.temperature) ? plan.temperature : ({ strict: 0.2, balanced: 0.7, creative: 1.2 }[plan.rewriteMode] ?? 0.7),
      stream: false,
      chat_template_kwargs: {
        enable_thinking: session.settings.thinkMode === "on",
        preserve_thinking: false
      }
    };
    if (session.settings.thinkMode === "on") {
      Object.assign(payload, { temperature: 1, top_p: 0.95, top_k: 20, min_p: 0, presence_penalty: 0, repeat_penalty: 1, reasoning_effort: session.settings.reasoningEffort });
    } else {
      Object.assign(payload, { top_p: 0.8, top_k: 20, min_p: 0, presence_penalty: 1.5, repeat_penalty: 1 });
    }
    try {
      const response = await this.fetchImpl(`${server.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${server.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        redirect: "error"
      });
      if (!response.ok) throw new PromptProviderError(`Local llama-server HTTP ${response.status}. Response text was hidden for privacy.`, { code: "local_http_error", phase: "local", httpStatus: response.status });
      let data;
      try { data = await response.json(); }
      catch { throw new PromptProviderError("Local llama-server returned invalid JSON.", { code: "local_invalid_json", phase: "response" }); }
      const output = outputText(data);
      return {
        output,
        receipt: {
          schemaVersion: "t8-prompt-execution-receipt/v1",
          providerId: "local_qwen",
          endpointHost: "local",
          model: session.settings.modelFilename,
          requestId: null,
          usage: data?.usage && typeof data.usage === "object" ? data.usage : null,
          attempts: 1,
          mediaCount: mediaRecords.length,
          mediaUploadCount: 0,
          visualPartCount,
          estimatedInputTokens,
          durationMs: this.now() - startedAt,
          outputSha256: crypto.createHash("sha256").update(output, "utf8").digest("hex")
        }
      };
    } catch (error) {
      if (error instanceof PromptProviderError) throw error;
      const cancelled = session.signal?.aborted;
      throw new PromptProviderError(cancelled ? "Local GGUF generation was cancelled." : controller.signal.aborted ? "Local GGUF generation timed out." : "Local GGUF request failed locally.", {
        code: cancelled ? "local_cancelled" : controller.signal.aborted ? "local_timeout" : "local_request_failed",
        phase: "local",
        outcomeCertainty: "definite_failure"
      });
    } finally {
      clearTimeout(timeout);
      session.signal?.removeEventListener("abort", abort);
    }
  }

  async endSession(unloadPolicy, { force = false } = {}) {
    try {
      if (force || unloadPolicy === "after_run") await this.stop();
      else if (unloadPolicy === "idle_10m") {
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => { void this.stop(); }, LOCAL_IDLE_TTL_MS);
        this.idleTimer.unref?.();
      }
    } finally {
      this.gate.release();
    }
  }

  async stop() {
    this.clearIdleTimer();
    const server = this.server;
    this.server = null;
    this.serverKey = null;
    if (!server?.process || server.process.exitCode !== null) return;
    const child = server.process;
    await new Promise((resolve) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; clearTimeout(killTimer); resolve(); } };
      const killTimer = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} done(); }, 15000);
      killTimer.unref?.();
      child.once("close", done);
      try { child.kill(); } catch { done(); }
    });
  }
}

module.exports = {
  AsyncGate,
  LOCAL_IDLE_TTL_MS,
  LocalQwenManager,
  LocalQwenSession,
  estimatedTextTokens,
  outputText
};
