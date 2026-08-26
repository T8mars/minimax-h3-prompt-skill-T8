const fs = require("node:fs");
const path = require("node:path");

const AUTO_PROJECTOR = "AUTO";
const GGUF_SUFFIX = ".gguf";
const MAX_METADATA_STRING_BYTES = 16 * 1024 * 1024;
const MAX_ARRAY_ITEMS = 4_000_000;
const MAX_CATALOG_FILES = 4096;
const INFO_CACHE = new Map();

class GgufCatalogError extends Error {}

function safeIdentifier(value, { label = "GGUF file" } = {}) {
  const text = String(value || "").trim().replaceAll("\\", "/");
  if (!text || text.includes("\0") || path.posix.isAbsolute(text) || /^[a-z]:\//iu.test(text)) {
    throw new GgufCatalogError(`${label} must be a relative .gguf path inside the selected model directory.`);
  }
  const normalized = path.posix.normalize(text);
  if (normalized === ".." || normalized.startsWith("../") || path.posix.extname(normalized).toLowerCase() !== GGUF_SUFFIX) {
    throw new GgufCatalogError(`${label} must be a relative .gguf path inside the selected model directory.`);
  }
  return normalized;
}

function resolvedCatalogPath(rootValue, identifier, { label = "GGUF file" } = {}) {
  const root = path.resolve(rootValue);
  const safe = safeIdentifier(identifier, { label });
  const target = path.resolve(root, ...safe.split("/"));
  const relative = path.relative(root, target);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new GgufCatalogError(`${label} must stay inside the selected model directory.`);
  }
  return target;
}

function reader(handle) {
  let position = 0;
  const readExact = (size) => {
    const buffer = Buffer.allocUnsafe(size);
    const bytesRead = fs.readSync(handle, buffer, 0, size, position);
    if (bytesRead !== size) throw new GgufCatalogError("Unexpected end of GGUF metadata.");
    position += size;
    return buffer;
  };
  const skip = (size) => {
    if (!Number.isSafeInteger(size) || size < 0) throw new GgufCatalogError("Invalid GGUF metadata length.");
    position += size;
  };
  return { readExact, skip };
}

const SCALAR_SIZES = Object.freeze({ 0: 1, 1: 1, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4, 7: 1, 10: 8, 11: 8, 12: 8 });

function readUint64(io) {
  const value = io.readExact(8).readBigUInt64LE(0);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new GgufCatalogError("GGUF metadata integer is too large.");
  return Number(value);
}

function readString(io, keep) {
  const length = readUint64(io);
  if (length > MAX_METADATA_STRING_BYTES) throw new GgufCatalogError("GGUF metadata string is unreasonably large.");
  if (!keep) {
    io.skip(length);
    return "";
  }
  return io.readExact(length).toString("utf8");
}

function readScalar(io, type, keep) {
  const size = SCALAR_SIZES[type];
  if (!keep) {
    io.skip(size);
    return null;
  }
  const value = io.readExact(size);
  switch (type) {
    case 0: return value.readUInt8(0);
    case 1: return value.readInt8(0);
    case 2: return value.readUInt16LE(0);
    case 3: return value.readInt16LE(0);
    case 4: return value.readUInt32LE(0);
    case 5: return value.readInt32LE(0);
    case 6: return value.readFloatLE(0);
    case 7: return value.readUInt8(0) !== 0;
    case 10: return Number(value.readBigUInt64LE(0));
    case 11: return Number(value.readBigInt64LE(0));
    case 12: return value.readDoubleLE(0);
    default: return null;
  }
}

function readValue(io, type, keep) {
  if (Object.hasOwn(SCALAR_SIZES, type)) return readScalar(io, type, keep);
  if (type === 8) return readString(io, keep);
  if (type === 9) {
    const elementType = io.readExact(4).readUInt32LE(0);
    const length = readUint64(io);
    if (length > MAX_ARRAY_ITEMS) throw new GgufCatalogError("GGUF metadata array is unreasonably large.");
    if (!keep && Object.hasOwn(SCALAR_SIZES, elementType)) {
      io.skip(SCALAR_SIZES[elementType] * length);
      return null;
    }
    const values = keep ? [] : null;
    for (let index = 0; index < length; index += 1) {
      const value = readValue(io, elementType, keep);
      if (keep) values.push(value);
    }
    return values;
  }
  throw new GgufCatalogError(`Unsupported GGUF metadata value type: ${type}.`);
}

function metadataValues(filePath) {
  const wanted = new Set([
    "general.architecture",
    "general.type",
    "general.name",
    "clip.projector_type",
    "clip.has_vision_encoder"
  ]);
  const handle = fs.openSync(filePath, "r");
  try {
    const io = reader(handle);
    if (!io.readExact(4).equals(Buffer.from("GGUF"))) throw new GgufCatalogError("File does not start with the GGUF magic header.");
    const version = io.readExact(4).readUInt32LE(0);
    if (![2, 3].includes(version)) throw new GgufCatalogError(`Unsupported GGUF version: ${version}.`);
    readUint64(io);
    const keyValueCount = readUint64(io);
    if (keyValueCount > 1_000_000) throw new GgufCatalogError("GGUF metadata entry count is invalid.");
    const values = {};
    for (let index = 0; index < keyValueCount; index += 1) {
      const key = readString(io, true);
      const type = io.readExact(4).readUInt32LE(0);
      // Tokenizer vocab arrays can contain hundreds of thousands of strings.
      // The desktop catalog needs only architecture/model/projector metadata,
      // which GGUF writers place before tokenizer metadata. Stop before those
      // arrays so opening API settings never blocks on a full vocabulary walk.
      if (key.startsWith("tokenizer.") && values["general.architecture"]) break;
      const keep = wanted.has(key) || key.endsWith(".context_length");
      const value = readValue(io, type, keep);
      if (keep) values[key] = value;
    }
    return values;
  } finally {
    fs.closeSync(handle);
  }
}

function isProjectorInfo(info) {
  const filename = info.filename.toLowerCase();
  return String(info.modelType || "").toLowerCase() === "mmproj"
    || String(info.architecture || "").toLowerCase() === "clip"
    || filename.startsWith("mmproj")
    || filename.includes("mmproj");
}

function modelInfo(filePath, identifier, stat) {
  const cacheKey = `${path.resolve(filePath)}|${stat.size}|${Math.trunc(stat.mtimeMs)}`;
  if (INFO_CACHE.has(cacheKey)) return INFO_CACHE.get(cacheKey);
  let values = {};
  let metadataError = "";
  try { values = metadataValues(filePath); }
  catch (error) { metadataError = String(error?.message || error); }
  const architecture = String(values["general.architecture"] || "");
  const contextKey = Object.keys(values).find((key) => key.endsWith(".context_length"));
  const info = {
    identifier,
    filename: path.basename(filePath),
    sizeBytes: stat.size,
    architecture,
    modelType: String(values["general.type"] || ""),
    name: String(values["general.name"] || ""),
    contextLength: Number(values[`${architecture}.context_length`] || values[contextKey] || 0),
    projectorType: String(values["clip.projector_type"] || ""),
    hasVisionEncoder: Boolean(values["clip.has_vision_encoder"]),
    hasChatTemplate: false,
    metadataReadable: !metadataError,
    metadataError
  };
  info.isProjector = isProjectorInfo(info);
  info.textCapable = !info.isProjector;
  INFO_CACHE.set(cacheKey, info);
  while (INFO_CACHE.size > 512) INFO_CACHE.delete(INFO_CACHE.keys().next().value);
  return info;
}

function scanGgufCatalog(rootValue) {
  if (!rootValue) return { models: [], projectors: [] };
  const root = path.resolve(rootValue);
  let rootStat;
  try { rootStat = fs.statSync(root); } catch { return { models: [], projectors: [] }; }
  if (!rootStat.isDirectory()) return { models: [], projectors: [] };
  const entries = [];
  const pending = [root];
  while (pending.length && entries.length < MAX_CATALOG_FILES) {
    const directory = pending.pop();
    let children;
    try { children = fs.readdirSync(directory, { withFileTypes: true }); } catch { continue; }
    for (const child of children) {
      const target = path.join(directory, child.name);
      if (child.isDirectory()) {
        pending.push(target);
        continue;
      }
      if (!child.isFile() || path.extname(child.name).toLowerCase() !== GGUF_SUFFIX) continue;
      let stat;
      try { stat = fs.statSync(target); } catch { continue; }
      const identifier = path.relative(root, target).split(path.sep).join("/");
      entries.push(modelInfo(target, identifier, stat));
      if (entries.length >= MAX_CATALOG_FILES) break;
    }
  }
  entries.sort((left, right) => left.identifier.localeCompare(right.identifier, "en", { sensitivity: "base" }));
  return {
    models: entries.filter((entry) => !entry.isProjector),
    projectors: entries.filter((entry) => entry.isProjector)
  };
}

function normalizedName(value) {
  return String(value || "").toLowerCase().replaceAll(/[^\p{L}\p{N}]/gu, "");
}

function filenameTokens(value) {
  const ignored = new Set(["mmproj", "f16", "f32", "bf16", "q8", "q8_0", "q4", "q4_k_m", "q6", "q6_k", "q3", "q3_k_s", "gguf", "fp8"]);
  return new Set(String(value || "").toLowerCase().replace(/\.gguf$/u, "").split(/[-_.\s]+/u).filter((token) => token && !ignored.has(token)));
}

function parameterScale(...values) {
  for (const value of values) {
    const match = String(value || "").toLowerCase().match(/(?:^|[^a-z0-9])(\d+(?:\.\d+)?)\s*b(?:$|[^a-z0-9])/u);
    if (match) return `${String(Number(match[1]))}b`;
  }
  return "";
}

function recommendedProjector(model, projectors) {
  if (!model || model.isProjector || !projectors.length) return null;
  const modelName = normalizedName(model.name);
  const modelParent = path.posix.dirname(model.identifier);
  const modelScale = parameterScale(model.name, model.filename);
  const score = (projector) => {
    let value = 0;
    const projectorName = normalizedName(projector.name);
    if (modelName && projectorName && modelName === projectorName) value += 100;
    if (path.posix.dirname(projector.identifier) === modelParent) value += 40;
    const projectorScale = parameterScale(projector.name, projector.filename);
    if (modelScale && projectorScale) value += modelScale === projectorScale ? 60 : -120;
    if (String(model.architecture).toLowerCase() === "qwen35" && String(projector.projectorType).toLowerCase().includes("qwen3vl")) value += 25;
    if (projector.hasVisionEncoder) value += 5;
    const modelParts = filenameTokens(model.filename);
    const projectorParts = filenameTokens(projector.filename);
    if (modelParts.size && projectorParts.size) {
      const overlap = [...modelParts].filter((token) => projectorParts.has(token)).length;
      const union = new Set([...modelParts, ...projectorParts]).size;
      value += Math.round((overlap / union) * 30);
    }
    return value;
  };
  const ranked = [...projectors].sort((left, right) => score(right) - score(left) || left.identifier.localeCompare(right.identifier));
  const best = ranked[0];
  return score(best) >= 40 || projectors.length === 1 ? best : null;
}

function selectProjector(catalog, modelIdentifier, projectorIdentifier = AUTO_PROJECTOR) {
  const model = catalog.models.find((entry) => entry.identifier === modelIdentifier) || null;
  if (!projectorIdentifier || projectorIdentifier === AUTO_PROJECTOR) return recommendedProjector(model, catalog.projectors);
  return catalog.projectors.find((entry) => entry.identifier === projectorIdentifier) || null;
}

module.exports = {
  AUTO_PROJECTOR,
  GgufCatalogError,
  metadataValues,
  recommendedProjector,
  resolvedCatalogPath,
  safeIdentifier,
  scanGgufCatalog,
  selectProjector
};
