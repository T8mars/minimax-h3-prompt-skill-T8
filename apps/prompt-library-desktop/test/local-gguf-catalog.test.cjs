const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  recommendedProjector,
  resolvedCatalogPath,
  safeIdentifier,
  scanGgufCatalog
} = require("../lib/local-gguf-catalog.cjs");

function u64(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value));
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function ggufString(value) {
  const bytes = Buffer.from(String(value), "utf8");
  return Buffer.concat([u64(bytes.length), bytes]);
}

function metadataEntry(key, value) {
  if (typeof value === "boolean") return Buffer.concat([ggufString(key), u32(7), Buffer.from([value ? 1 : 0])]);
  if (typeof value === "number") return Buffer.concat([ggufString(key), u32(10), u64(value)]);
  return Buffer.concat([ggufString(key), u32(8), ggufString(value)]);
}

function writeGguf(filePath, metadata) {
  const entries = Object.entries(metadata).map(([key, value]) => metadataEntry(key, value));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.concat([Buffer.from("GGUF"), u32(3), u64(0), u64(entries.length), ...entries]));
}

test("recursive GGUF catalog reads lightweight metadata and rejects traversal", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-gguf-catalog-"));
  try {
    writeGguf(path.join(root, "Qwen", "Qwen3.8-9B-Q6_K.gguf"), {
      "general.architecture": "qwen35",
      "general.type": "model",
      "general.name": "Qwen3.8 9B",
      "qwen35.context_length": 32768
    });
    writeGguf(path.join(root, "Qwen", "mmproj-Qwen3.8-27B-F16.gguf"), {
      "general.architecture": "clip",
      "general.type": "mmproj",
      "general.name": "Qwen3.8 27B",
      "clip.projector_type": "qwen3vl_merger",
      "clip.has_vision_encoder": true
    });
    writeGguf(path.join(root, "Qwen", "mmproj-Qwen3.8-9B-F16.gguf"), {
      "general.architecture": "clip",
      "general.type": "mmproj",
      "general.name": "Qwen3.8 9B",
      "clip.projector_type": "qwen3vl_merger",
      "clip.has_vision_encoder": true
    });
    const catalog = scanGgufCatalog(root);
    assert.equal(catalog.models.length, 1);
    assert.equal(catalog.projectors.length, 2);
    assert.equal(catalog.models[0].architecture, "qwen35");
    assert.equal(catalog.models[0].contextLength, 32768);
    assert.equal(recommendedProjector(catalog.models[0], catalog.projectors).identifier, "Qwen/mmproj-Qwen3.8-9B-F16.gguf");
    assert.equal(resolvedCatalogPath(root, catalog.models[0].identifier), path.join(root, "Qwen", "Qwen3.8-9B-Q6_K.gguf"));
    assert.throws(() => safeIdentifier("../outside.gguf"), /relative \.gguf path/u);
    assert.throws(() => safeIdentifier("model.bin"), /relative \.gguf path/u);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
