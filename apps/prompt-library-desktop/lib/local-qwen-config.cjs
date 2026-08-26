const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const {
  AUTO_PROJECTOR,
  resolvedCatalogPath,
  safeIdentifier,
  scanGgufCatalog,
  selectProjector
} = require("./local-gguf-catalog.cjs");

const FILE_NAME = "local-qwen-provider-v1.json";
const LOCAL_PROVIDER_ID = "local_qwen";
const LOCAL_MODEL_ALIAS = "qwen3.8-27b";
const DEFAULT_MODEL_FILENAME = "Qwen3.8-27B-Q4_K_M.gguf";
const UNCENSORED_MODEL_FILENAME = "qwen3.8-27b-uncensored-fp8-q4_k_m.gguf";
const HERETIC_9B_MODEL_FILENAME = "Qwen3.8-9B-heretic-uncensored.i1-Q6_K.gguf";
const DEFAULT_MMPROJ_FILENAME = "mmproj-F16.gguf";
const HERETIC_9B_MMPROJ_FILENAME = "mmproj-Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-BF16.gguf";
const COMPATIBILITY_SOURCE_COMMIT = "a8164eafd6c89c7437e1a9255b8684fb569b226f";

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
  }),
  [HERETIC_9B_MODEL_FILENAME]: Object.freeze({
    id: "heretic-9b",
    label: "Qwen3.8-9B Heretic Uncensored i1-Q6_K（轻量，已验收）",
    filename: HERETIC_9B_MODEL_FILENAME,
    size: 7_359_260_416,
    sha256: "dfedf8412ee4a7f1200916783d224ebedb87044784434b75f4068b4b5e25f780"
  })
});

const VISION_PROJECTOR = Object.freeze({
  filename: DEFAULT_MMPROJ_FILENAME,
  size: 927_607_488,
  sha256: "cbb841a9ee0636b2ec172f5bb8df2ea8dfeb01e90fe7c6126581d662a0b4e43e"
});

const HERETIC_9B_VISION_PROJECTOR = Object.freeze({
  filename: HERETIC_9B_MMPROJ_FILENAME,
  size: 921_704_448,
  sha256: "05f662501f8bd45607b079723a3e238a4e888fd085a10a53f4057a0e250f6934"
});

const SUPPORTED_PROJECTORS = Object.freeze({
  [DEFAULT_MMPROJ_FILENAME]: VISION_PROJECTOR,
  [HERETIC_9B_MMPROJ_FILENAME]: HERETIC_9B_VISION_PROJECTOR
});

const DEFAULTS = Object.freeze({
  schemaVersion: "t8-local-qwen-config/v1",
  modelDirectory: "",
  modelFilename: DEFAULT_MODEL_FILENAME,
  projectorFilename: AUTO_PROJECTOR,
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
  if (text.includes("\0") || !path.isAbsolute(text)) throw new Error("Local GGUF paths must be absolute local paths.");
  return path.normalize(text);
}

function normalizeConfig(input = {}) {
  const modelFilename = safeIdentifier(input.modelFilename || DEFAULT_MODEL_FILENAME, { label: "Local model" });
  const projectorFilename = input.projectorFilename && input.projectorFilename !== AUTO_PROJECTOR
    ? safeIdentifier(input.projectorFilename, { label: "Vision projector" })
    : AUTO_PROJECTOR;
  const contextSize = boundedInteger(input.contextSize, DEFAULTS.contextSize, 8192, 65536);
  const maxTokens = boundedInteger(input.maxTokens, DEFAULTS.maxTokens, 256, 8192);
  if (maxTokens + 1024 >= contextSize) throw new Error("Local output token limit leaves no usable input context.");
  return {
    schemaVersion: DEFAULTS.schemaVersion,
    modelDirectory: absolutePath(input.modelDirectory),
    modelFilename,
    projectorFilename,
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
  return resolvedCatalogPath(rootValue, filename, { label: "Local GGUF" });
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
    const storedDigest = verifiedFiles[identity];
    const projectValidated = Boolean(specification);
    return {
      present: true,
      sizeMatch: projectValidated ? stat.size === specification.size : true,
      verified: projectValidated
        ? stat.size === specification.size && storedDigest === specification.sha256
        : /^[a-f0-9]{64}$/u.test(String(storedDigest || "")),
      integrityVerified: /^[a-f0-9]{64}$/u.test(String(storedDigest || "")),
      projectValidated,
      sizeBytes: stat.size
    };
  } catch {
    return { present: false, sizeMatch: false, verified: false };
  }
}

function safeRuntimeConfigCandidate(modelDirectory) {
  if (!modelDirectory) return "";
  try {
    let cursor = path.resolve(modelDirectory);
    let llmRoot = "";
    while (true) {
      if (path.basename(cursor).toLowerCase() === "llm" && path.basename(path.dirname(cursor)).toLowerCase() === "models") {
        llmRoot = cursor;
        break;
      }
      const parent = path.dirname(cursor);
      if (parent === cursor) break;
      cursor = parent;
    }
    if (!llmRoot) return "";
    const comfyRoot = path.dirname(path.dirname(llmRoot));
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
  constructor({
    userDataDir,
    modelSpecifications = SUPPORTED_MODELS,
    projectorSpecifications = SUPPORTED_PROJECTORS,
    visionProjector,
    sha256Impl = sha256File,
    runtimeVerifier = verifyRuntimeExecutable
  }) {
    this.userDataDir = path.resolve(userDataDir);
    this.modelSpecifications = modelSpecifications;
    this.projectorSpecifications = visionProjector
      ? { ...projectorSpecifications, [visionProjector.filename]: visionProjector }
      : projectorSpecifications;
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
    if (next.modelDirectory !== this.config.modelDirectory) {
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

  catalog(config = this.config) {
    return scanGgufCatalog(config.modelDirectory);
  }

  selectedProjector(config = this.config, catalog = this.catalog(config)) {
    return selectProjector(catalog, config.modelFilename, config.projectorFilename);
  }

  mmprojPath(config = this.config) {
    if (!config.modelDirectory) return "";
    const projector = this.selectedProjector(config);
    return projector ? resolvedChild(config.modelDirectory, projector.identifier) : "";
  }

  status() {
    const config = this.config;
    const catalog = this.catalog(config);
    const selectedModel = catalog.models.find((entry) => entry.identifier === config.modelFilename) || null;
    const selectedProjector = this.selectedProjector(config, catalog);
    const modelSpec = this.modelSpecifications[path.basename(config.modelFilename)];
    const projectorSpec = selectedProjector ? this.projectorSpecifications[path.basename(selectedProjector.identifier)] : null;
    const modelPath = config.modelDirectory ? this.modelPath(config) : "";
    const mmprojPath = selectedProjector ? resolvedChild(config.modelDirectory, selectedProjector.identifier) : "";
    const model = modelPath ? quickFileStatus(modelPath, modelSpec, config.verifiedFiles) : { present: false, sizeMatch: false, verified: false };
    const mmproj = mmprojPath ? quickFileStatus(mmprojPath, projectorSpec, config.verifiedFiles) : { present: false, sizeMatch: false, verified: false };
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
      projectorFilename: config.projectorFilename,
      resolvedProjectorFilename: selectedProjector?.identifier || "",
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
      modelInfo: selectedModel,
      projectorInfo: selectedProjector,
      modelOptions: (catalog.models.length ? catalog.models : Object.values(this.modelSpecifications).map((specification) => ({
        identifier: specification.filename,
        filename: specification.filename,
        sizeBytes: specification.size,
        metadataReadable: false,
        textCapable: true
      }))).map((entry) => {
        const specification = this.modelSpecifications[path.basename(entry.identifier)];
        return {
          ...entry,
          id: specification?.id || "discovered",
          label: specification?.label || entry.name || entry.identifier,
          projectValidated: Boolean(specification)
        };
      }),
      projectorOptions: catalog.projectors.map((entry) => {
        const specification = this.projectorSpecifications[path.basename(entry.identifier)];
        return {
          ...entry,
          label: entry.name || entry.identifier,
          projectValidated: Boolean(specification)
        };
      }),
      supportedModels: Object.values(this.modelSpecifications).map(({ id, label, filename, size }) => ({ id, label, filename, sizeBytes: size })),
      catalogCounts: { models: catalog.models.length, projectors: catalog.projectors.length },
      compatibilitySourceCommit: COMPATIBILITY_SOURCE_COMMIT
    };
  }

  executionFingerprint() {
    const status = this.status();
    return crypto.createHash("sha256").update(JSON.stringify([
      status.modelDirectory,
      status.modelFilename,
      status.projectorFilename,
      status.resolvedProjectorFilename,
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
    if (!config.modelDirectory) throw new Error("Choose a local GGUF model directory first.");
    if (!config.runtimeExecutable || !fs.existsSync(config.runtimeExecutable)) throw new Error("Choose a valid llama-server executable first.");
    const catalog = this.catalog(config);
    if (!catalog.models.some((entry) => entry.identifier === config.modelFilename)) {
      throw new Error(`The selected local GGUF is missing or is not a main model: ${config.modelFilename}`);
    }
    if (config.projectorFilename !== AUTO_PROJECTOR && !catalog.projectors.some((entry) => entry.identifier === config.projectorFilename)) {
      throw new Error(`The selected vision projector is missing or is not an mmproj: ${config.projectorFilename}`);
    }
    const runtimeStat = await fsp.stat(config.runtimeExecutable);
    if (!runtimeStat.isFile()) throw new Error("Choose a valid llama-server executable first.");
    const runtimeResult = await this.runtimeVerifier(config.runtimeExecutable);
    const modelPath = this.modelPath(config);
    const projectorPath = this.mmprojPath(config);
    const targets = [
      { path: modelPath, spec: this.modelSpecifications[path.basename(config.modelFilename)], required: true, label: config.modelFilename },
      ...(projectorPath ? [{
        path: projectorPath,
        spec: this.projectorSpecifications[path.basename(projectorPath)],
        required: false,
        label: path.relative(config.modelDirectory, projectorPath).split(path.sep).join("/")
      }] : [])
    ];
    const verifiedFiles = { ...config.verifiedFiles };
    for (const target of targets) {
      let stat;
      try { stat = await fsp.stat(target.path); }
      catch {
        if (target.required) throw new Error(`Missing local GGUF model: ${target.label}`);
        continue;
      }
      if (!stat.isFile()) throw new Error(`${target.label} is not a regular file.`);
      if (target.spec && stat.size !== target.spec.size) throw new Error(`${target.label} has an unexpected file size.`);
      const handle = await fsp.open(target.path, "r");
      try {
        const magic = Buffer.alloc(4);
        const { bytesRead } = await handle.read(magic, 0, 4, 0);
        if (bytesRead !== 4 || !magic.equals(Buffer.from("GGUF"))) throw new Error(`${target.label} is not a valid GGUF file.`);
      } finally { await handle.close(); }
      const sha256 = await this.sha256Impl(target.path);
      if (target.spec && sha256 !== target.spec.sha256) throw new Error(`${target.label} failed SHA-256 verification.`);
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
    if (!status.textReady) throw new Error("Local GGUF is not ready. Verify the selected model and llama-server in API settings.");
    if (vision && !status.visionReady) throw new Error("Local visual prompting requires a verified projector matched to the selected model.");
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
  HERETIC_9B_MMPROJ_FILENAME,
  HERETIC_9B_MODEL_FILENAME,
  HERETIC_9B_VISION_PROJECTOR,
  LOCAL_MODEL_ALIAS,
  LOCAL_PROVIDER_ID,
  LocalQwenConfigStore,
  SUPPORTED_PROJECTORS,
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
