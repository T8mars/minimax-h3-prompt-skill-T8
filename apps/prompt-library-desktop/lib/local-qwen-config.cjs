const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const FILE_NAME = "local-qwen-provider-v1.json";
const LOCAL_PROVIDER_ID = "local_qwen";
const LOCAL_MODEL_ALIAS = "qwen3.8-27b";
const DEFAULT_MODEL_FILENAME = "Qwen3.8-27B-Q4_K_M.gguf";
const UNCENSORED_MODEL_FILENAME = "qwen3.8-27b-uncensored-fp8-q4_k_m.gguf";
const DEFAULT_MMPROJ_FILENAME = "mmproj-F16.gguf";
const COMPATIBILITY_SOURCE_COMMIT = "4aa4339bb58fd62610cea2f9eec640adada1c42e";

const SUPPORTED_MODELS = Object.freeze({
  [DEFAULT_MODEL_FILENAME]: Object.freeze({
    id: "official",
    label: "Qwen3.8-27B Q4_K_M（官方，推荐）",
    filename: DEFAULT_MODEL_FILENAME,
    size: 17_106_775_008,
    sha256: "7e78da5d7e3ae28d178121f58646953305f3e5bd3cb46f4a75584e8b6c6fe169"
  }),
  [UNCENSORED_MODEL_FILENAME]: Object.freeze({
    id: "uncensored",
    label: "Qwen3.8-27B Uncensored FP8 Q4_K_M",
    filename: UNCENSORED_MODEL_FILENAME,
    size: 16_810_714_976,
    sha256: "66bb238d41de38b11dd406d932d8fb97433d529022cef60f2f422b9221cae743"
  })
});

const VISION_PROJECTOR = Object.freeze({
  filename: DEFAULT_MMPROJ_FILENAME,
  size: 927_607_488,
  sha256: "cbb841a9ee0636b2ec172f5bb8df2ea8dfeb01e90fe7c6126581d662a0b4e43e"
});

const DEFAULTS = Object.freeze({
  schemaVersion: "t8-local-qwen-config/v1",
  modelDirectory: "",
  modelFilename: DEFAULT_MODEL_FILENAME,
  runtimeExecutable: "",
  ffmpegExecutable: "",
  contextSize: 32768,
  maxTokens: 4096,
  thinkMode: "off",
  reasoningEffort: "medium",
  videoSampleFps: 2,
  unloadPolicy: "after_run",
  cpuThreads: 0,
  runtimeVerification: {},
  verifiedFiles: {}
});

function boundedInteger(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) return fallback;
  return number;
}

function boundedNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) return fallback;
  return number;
}

function absolutePath(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.includes("\0") || !path.isAbsolute(text)) throw new Error("Local Qwen paths must be absolute local paths.");
  return path.normalize(text);
}

function normalizeConfig(input = {}) {
  const modelFilename = Object.hasOwn(SUPPORTED_MODELS, input.modelFilename)
    ? input.modelFilename
    : DEFAULT_MODEL_FILENAME;
  const contextSize = boundedInteger(input.contextSize, DEFAULTS.contextSize, 8192, 65536);
  const maxTokens = boundedInteger(input.maxTokens, DEFAULTS.maxTokens, 256, 8192);
  if (maxTokens + 1024 >= contextSize) throw new Error("Local output token limit leaves no usable input context.");
  return {
    schemaVersion: DEFAULTS.schemaVersion,
    modelDirectory: absolutePath(input.modelDirectory),
    modelFilename,
    runtimeExecutable: absolutePath(input.runtimeExecutable),
    ffmpegExecutable: absolutePath(input.ffmpegExecutable),
    contextSize,
    maxTokens,
    thinkMode: input.thinkMode === "on" ? "on" : "off",
    reasoningEffort: ["low", "medium", "xhigh"].includes(input.reasoningEffort) ? input.reasoningEffort : "medium",
    videoSampleFps: boundedNumber(input.videoSampleFps, DEFAULTS.videoSampleFps, 0.25, 8),
    unloadPolicy: ["after_run", "keep_warm", "idle_10m"].includes(input.unloadPolicy) ? input.unloadPolicy : "after_run",
    cpuThreads: boundedInteger(input.cpuThreads, 0, 0, 128),
    runtimeVerification: input.runtimeVerification && typeof input.runtimeVerification === "object" ? input.runtimeVerification : {},
    verifiedFiles: input.verifiedFiles && typeof input.verifiedFiles === "object" ? input.verifiedFiles : {}
  };
}

function resolvedChild(rootValue, filename) {
  const root = path.resolve(rootValue);
  const target = path.resolve(root, filename);
  const relative = path.relative(root, target);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("Local model files must remain directly inside the selected model directory.");
  }
  return target;
}

function fileIdentity(filePath, stat) {
  return `${path.resolve(filePath)}|${stat.size}|${Math.trunc(stat.mtimeMs)}`;
}

async function sha256File(filePath) {
  const digest = crypto.createHash("sha256");
  const stream = fs.createReadStream(filePath, { highWaterMark: 8 * 1024 * 1024 });
  for await (const chunk of stream) digest.update(chunk);
  return digest.digest("hex");
}

function companionFfprobePath(ffmpegExecutable) {
  if (!ffmpegExecutable) return "";
  const extension = path.extname(ffmpegExecutable);
  const filename = process.platform === "win32" ? `ffprobe${extension || ".exe"}` : "ffprobe";
  return path.join(path.dirname(ffmpegExecutable), filename);
}

function verifyRuntimeExecutable(executable) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ["--version"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      finish(reject, new Error("llama-server version check timed out."));
    }, 15_000);
    timer.unref?.();
    const append = (chunk) => { output = (output + chunk.toString("utf8")).slice(-16_384); };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    child.on("error", () => finish(reject, new Error("The selected llama-server executable could not start.")));
    child.on("close", (code) => {
      if (code !== 0) return finish(reject, new Error("The selected executable did not pass the llama-server version check."));
      if (!/build\s+10436\b/iu.test(output) || !/commit\s+6fed9f6ff\b/iu.test(output)) {
        return finish(reject, new Error("Use the node-compatible llama.cpp b10436 runtime (commit 6fed9f6ff)."));
      }
      finish(resolve, { versionOutput: output.trim().slice(0, 1024) });
    });
  });
}

function quickFileStatus(filePath, specification, verifiedFiles) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return { present: false, sizeMatch: false, verified: false };
    const identity = fileIdentity(filePath, stat);
    return {
      present: true,
      sizeMatch: stat.size === specification.size,
      verified: stat.size === specification.size && verifiedFiles[identity] === specification.sha256,
      sizeBytes: stat.size
    };
  } catch {
    return { present: false, sizeMatch: false, verified: false };
  }
}

function safeRuntimeConfigCandidate(modelDirectory) {
  if (!modelDirectory) return "";
  try {
    const comfyRoot = path.resolve(modelDirectory, "..", "..", "..");
    const runtimeRoot = path.join(
      comfyRoot,
      "custom_nodes",
      "comfyui-minimax-h3-prompt-enhancer-T8",
      "runtime",
      "local_qwen"
    );
    const configPath = path.join(runtimeRoot, "runtime_config.json");
    const payload = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (payload?.schema_version !== 1 || typeof payload.executable !== "string") return "";
    const candidate = path.resolve(runtimeRoot, payload.executable);
    const relative = path.relative(runtimeRoot, candidate);
    if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return "";
    return fs.statSync(candidate).isFile() ? candidate : "";
  } catch {
    return "";
  }
}

class LocalQwenConfigStore {
  constructor({ userDataDir, modelSpecifications = SUPPORTED_MODELS, visionProjector = VISION_PROJECTOR, sha256Impl = sha256File, runtimeVerifier = verifyRuntimeExecutable }) {
    this.userDataDir = path.resolve(userDataDir);
    this.modelSpecifications = modelSpecifications;
    this.visionProjector = visionProjector;
    this.sha256Impl = sha256Impl;
    this.runtimeVerifier = runtimeVerifier;
    this.filePath = path.join(this.userDataDir, FILE_NAME);
    this.config = this.readDisk();
  }

  readDisk() {
    try {
      const payload = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      if (payload?.schemaVersion !== DEFAULTS.schemaVersion) return { ...DEFAULTS, verifiedFiles: {} };
      return normalizeConfig(payload);
    } catch {
      return { ...DEFAULTS, verifiedFiles: {} };
    }
  }

  writeDisk(config) {
    fs.mkdirSync(this.userDataDir, { recursive: true });
    const temporary = `${this.filePath}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, `${JSON.stringify(config, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, this.filePath);
  }

  set(input = {}) {
    const next = normalizeConfig({
      ...this.config,
      ...input,
      runtimeVerification: this.config.runtimeVerification,
      verifiedFiles: this.config.verifiedFiles
    });
    if (!next.runtimeExecutable) next.runtimeExecutable = safeRuntimeConfigCandidate(next.modelDirectory);
    if (next.modelDirectory !== this.config.modelDirectory || next.modelFilename !== this.config.modelFilename) {
      next.verifiedFiles = {};
    }
    if (next.runtimeExecutable !== this.config.runtimeExecutable) next.runtimeVerification = {};
    this.config = next;
    this.writeDisk(next);
    return this.status();
  }

  modelPath(config = this.config) {
    return config.modelDirectory ? resolvedChild(config.modelDirectory, config.modelFilename) : "";
  }

  mmprojPath(config = this.config) {
    return config.modelDirectory ? resolvedChild(config.modelDirectory, this.visionProjector.filename) : "";
  }

  status() {
    const config = this.config;
    const modelSpec = this.modelSpecifications[config.modelFilename];
    const modelPath = config.modelDirectory ? this.modelPath(config) : "";
    const mmprojPath = config.modelDirectory ? this.mmprojPath(config) : "";
    const model = modelPath ? quickFileStatus(modelPath, modelSpec, config.verifiedFiles) : { present: false, sizeMatch: false, verified: false };
    const mmproj = mmprojPath ? quickFileStatus(mmprojPath, this.visionProjector, config.verifiedFiles) : { present: false, sizeMatch: false, verified: false };
    let runtimeStat = null;
    try { runtimeStat = config.runtimeExecutable ? fs.statSync(config.runtimeExecutable) : null; } catch {}
    const runtimePresent = Boolean(runtimeStat?.isFile());
    const runtimeIdentity = runtimePresent ? fileIdentity(config.runtimeExecutable, runtimeStat) : "";
    const runtimeVerified = Boolean(runtimeIdentity && config.runtimeVerification?.identity === runtimeIdentity);
    const ffmpegPresent = Boolean(config.ffmpegExecutable && (() => { try { return fs.statSync(config.ffmpegExecutable).isFile(); } catch { return false; } })());
    const ffprobePath = companionFfprobePath(config.ffmpegExecutable);
    const ffprobePresent = Boolean(ffprobePath && (() => { try { return fs.statSync(ffprobePath).isFile(); } catch { return false; } })());
    return {
      providerId: LOCAL_PROVIDER_ID,
      configured: Boolean(runtimeVerified && model.verified),
      source: runtimeVerified && model.verified ? "local" : null,
      readiness: model.verified && runtimeVerified ? (mmproj.verified ? "vision" : "text") : "missing",
      textReady: Boolean(model.verified && runtimeVerified),
      visionReady: Boolean(model.verified && mmproj.verified && runtimeVerified),
      videoReady: Boolean(model.verified && mmproj.verified && runtimeVerified && ffmpegPresent && ffprobePresent),
      modelDirectory: config.modelDirectory,
      modelFilename: config.modelFilename,
      runtimeExecutable: config.runtimeExecutable,
      ffmpegExecutable: config.ffmpegExecutable,
      contextSize: config.contextSize,
      maxTokens: config.maxTokens,
      thinkMode: config.thinkMode,
      reasoningEffort: config.reasoningEffort,
      videoSampleFps: config.videoSampleFps,
      unloadPolicy: config.unloadPolicy,
      cpuThreads: config.cpuThreads,
      runtime: {
        present: runtimePresent,
        sizeMatch: runtimePresent,
        verified: runtimeVerified,
        versionOutput: runtimeVerified ? config.runtimeVerification.versionOutput : ""
      },
      ffmpegPresent,
      ffprobePath,
      ffprobePresent,
      model,
      mmproj,
      supportedModels: Object.values(this.modelSpecifications).map(({ id, label, filename, size }) => ({ id, label, filename, sizeBytes: size })),
      projectorFilename: this.visionProjector.filename,
      compatibilitySourceCommit: COMPATIBILITY_SOURCE_COMMIT
    };
  }

  executionFingerprint() {
    const status = this.status();
    return crypto.createHash("sha256").update(JSON.stringify([
      status.modelDirectory,
      status.modelFilename,
      status.runtimeExecutable,
      status.ffmpegExecutable,
      status.contextSize,
      status.maxTokens,
      status.thinkMode,
      status.reasoningEffort,
      status.videoSampleFps,
      status.unloadPolicy,
      status.cpuThreads,
      status.model?.verified,
      status.mmproj?.verified,
      status.runtime?.verified,
      status.ffmpegPresent,
      status.ffprobePresent
    ]), "utf8").digest("hex");
  }

  async verify() {
    const config = this.config;
    if (!config.modelDirectory) throw new Error("Choose a local Qwen model directory first.");
    if (!config.runtimeExecutable || !fs.existsSync(config.runtimeExecutable)) throw new Error("Choose a valid llama-server executable first.");
    const runtimeStat = await fsp.stat(config.runtimeExecutable);
    if (!runtimeStat.isFile()) throw new Error("Choose a valid llama-server executable first.");
    const runtimeResult = await this.runtimeVerifier(config.runtimeExecutable);
    const targets = [
      { path: this.modelPath(config), spec: this.modelSpecifications[config.modelFilename], required: true },
      { path: this.mmprojPath(config), spec: this.visionProjector, required: false }
    ];
    const verifiedFiles = { ...config.verifiedFiles };
    for (const target of targets) {
      let stat;
      try { stat = await fsp.stat(target.path); }
      catch {
        if (target.required) throw new Error(`Missing supported local model: ${target.spec.filename}`);
        continue;
      }
      if (!stat.isFile() || stat.size !== target.spec.size) throw new Error(`${target.spec.filename} has an unexpected file size.`);
      const sha256 = await this.sha256Impl(target.path);
      if (sha256 !== target.spec.sha256) throw new Error(`${target.spec.filename} failed SHA-256 verification.`);
      verifiedFiles[fileIdentity(target.path, stat)] = sha256;
    }
    this.config = normalizeConfig({
      ...config,
      runtimeVerification: {
        identity: fileIdentity(config.runtimeExecutable, runtimeStat),
        versionOutput: String(runtimeResult?.versionOutput || "").slice(0, 1024)
      },
      verifiedFiles
    });
    this.writeDisk(this.config);
    return this.status();
  }

  requireReady({ vision = false, video = false } = {}) {
    const status = this.status();
    if (!status.textReady) throw new Error("Local Qwen is not ready. Verify a supported GGUF model and llama-server in API settings.");
    if (vision && !status.visionReady) throw new Error("Local visual prompting requires the verified mmproj-F16.gguf projector.");
    if (video && !status.videoReady) throw new Error("Local video prompting requires FFmpeg and FFprobe in the same selected directory.");
    return {
      ...this.config,
      modelPath: this.modelPath(),
      mmprojPath: vision ? this.mmprojPath() : ""
    };
  }
}

module.exports = {
  COMPATIBILITY_SOURCE_COMMIT,
  DEFAULT_MMPROJ_FILENAME,
  DEFAULT_MODEL_FILENAME,
  DEFAULTS,
  FILE_NAME,
  LOCAL_MODEL_ALIAS,
  LOCAL_PROVIDER_ID,
  LocalQwenConfigStore,
  SUPPORTED_MODELS,
  UNCENSORED_MODEL_FILENAME,
  VISION_PROJECTOR,
  absolutePath,
  companionFfprobePath,
  normalizeConfig,
  resolvedChild,
  sha256File,
  verifyRuntimeExecutable
};
