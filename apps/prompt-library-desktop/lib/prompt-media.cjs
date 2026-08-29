const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_IMAGES = 9;
const MAX_VIDEOS = 3;
const MAX_MEDIA = MAX_IMAGES + MAX_VIDEOS;

function sniffMedia(buffer, extension) {
  const ext = String(extension || "").toLocaleLowerCase();
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { kind: "image", mimeType: "image/png", extension: "png" };
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { kind: "image", mimeType: "image/jpeg", extension: ext === ".jpeg" ? "jpeg" : "jpg" };
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return { kind: "image", mimeType: "image/webp", extension: "webp" };
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "AVI ") return { kind: "video", mimeType: "video/x-msvideo", extension: "avi" };
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLocaleLowerCase();
    const quicktime = brand === "qt  ";
    return { kind: "video", mimeType: quicktime ? "video/quicktime" : "video/mp4", extension: quicktime ? "mov" : "mp4" };
  }
  if (buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return ext === ".mkv" ? { kind: "video", mimeType: "video/x-matroska", extension: "mkv" } : { kind: "video", mimeType: "video/webm", extension: "webm" };
  return null;
}

function publicDescriptor(record) {
  return {
    mediaId: record.mediaId,
    name: record.name,
    kind: record.kind,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    sha256: record.sha256,
    label: record.label
  };
}

class PromptMediaStore {
  constructor({ randomUUID = crypto.randomUUID } = {}) {
    this.randomUUID = randomUUID;
    this.records = new Map();
  }

  addPaths(paths) {
    const candidates = Array.isArray(paths) ? paths.slice(0, MAX_MEDIA) : [];
    if (!candidates.length) return [];
    const pending = [];
    const projectedCounts = this.counts();
    const pendingIds = new Set();
    for (const value of candidates) {
      const filePath = path.resolve(String(value || ""));
      const stat = fs.statSync(filePath);
      if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_FILE_BYTES) throw new Error("Reference media must be a non-empty file no larger than 50 MiB.");
      const head = Buffer.alloc(Math.min(stat.size, 32));
      const descriptor = fs.openSync(filePath, "r");
      try { fs.readSync(descriptor, head, 0, head.length, 0); }
      finally { fs.closeSync(descriptor); }
      const type = sniffMedia(head, path.extname(filePath));
      if (!type) throw new Error("Unsupported or invalid reference media. Use PNG, JPEG, WebP, MP4, MOV, WebM, MKV, or AVI.");
      const limit = type.kind === "image" ? MAX_IMAGES : MAX_VIDEOS;
      if (projectedCounts[type.kind] >= limit) throw new Error(`Reference media supports at most ${limit} ${type.kind} file(s).`);
      const data = fs.readFileSync(filePath);
      const mediaId = this.randomUUID();
      if (this.records.has(mediaId) || pendingIds.has(mediaId)) throw new Error("Reference media ID collision; choose the files again.");
      pendingIds.add(mediaId);
      projectedCounts[type.kind] += 1;
      const record = {
        mediaId,
        filePath,
        name: path.basename(filePath),
        kind: type.kind,
        mimeType: type.mimeType,
        extension: type.extension,
        sizeBytes: stat.size,
        sha256: crypto.createHash("sha256").update(data).digest("hex"),
        label: type.kind === "image" ? `<Picture ${projectedCounts.image}>` : `<Video ${projectedCounts.video}>`
      };
      pending.push(record);
    }
    for (const record of pending) this.records.set(record.mediaId, record);
    return pending.map(publicDescriptor);
  }

  counts() {
    const counts = { image: 0, video: 0 };
    for (const record of this.records.values()) counts[record.kind] += 1;
    return counts;
  }

  list() { return [...this.records.values()].map(publicDescriptor); }

  resolve(mediaIds) {
    const ids = Array.isArray(mediaIds) ? [...new Set(mediaIds.map(String))] : [];
    const records = ids.map((id) => this.records.get(id));
    if (records.some((record) => !record)) throw new Error("Reference media selection is stale; choose the files again.");
    return records;
  }

  clear() {
    this.records.clear();
    return [];
  }
}

module.exports = { MAX_FILE_BYTES, MAX_IMAGES, MAX_MEDIA, MAX_VIDEOS, PromptMediaStore, publicDescriptor, sniffMedia };
