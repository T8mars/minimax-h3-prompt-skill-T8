const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { sniffMedia } = require("./prompt-media.cjs");

const MAX_RESULT_VIDEO_BYTES = 4 * 1024 * 1024 * 1024;

function safeId(value, field) {
  const id = String(value || "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/u.test(id)) throw new Error(`${field} is invalid.`);
  return id;
}

function fileSha256(filePath) {
  const hash = crypto.createHash("sha256");
  const descriptor = fs.openSync(filePath, "r");
  const buffer = Buffer.alloc(1024 * 1024);
  try {
    let bytesRead;
    do {
      bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead);
  } finally {
    fs.closeSync(descriptor);
  }
  return hash.digest("hex");
}

function inspectVideo(filePath) {
  const resolved = path.resolve(String(filePath || ""));
  const stat = fs.statSync(resolved);
  if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_RESULT_VIDEO_BYTES) throw new Error("Result video must be a non-empty file no larger than 4 GiB.");
  const head = Buffer.alloc(Math.min(stat.size, 32));
  const descriptor = fs.openSync(resolved, "r");
  try { fs.readSync(descriptor, head, 0, head.length, 0); }
  finally { fs.closeSync(descriptor); }
  const type = sniffMedia(head, path.extname(resolved));
  if (!type || type.kind !== "video" || !new Set(["mp4", "webm"]).has(type.extension)) {
    throw new Error("Result review accepts MP4 or WebM video only so the built-in Chromium player can preview it reliably.");
  }
  return { filePath: resolved, stat, type };
}

class ProjectMediaStore {
  constructor({ userDataDir, now = () => new Date().toISOString() }) {
    this.root = path.join(path.resolve(userDataDir), "project-media");
    this.now = now;
  }

  importResult(projectId, filePath) {
    const safeProjectId = safeId(projectId, "Project ID");
    const inspected = inspectVideo(filePath);
    const sha256 = fileSha256(inspected.filePath);
    const mediaId = `result-${sha256.slice(0, 24)}`;
    const directory = path.join(this.root, safeProjectId);
    fs.mkdirSync(directory, { recursive: true });
    const destination = path.join(directory, `${mediaId}.${inspected.type.extension}`);
    if (!fs.existsSync(destination)) fs.copyFileSync(inspected.filePath, destination, fs.constants.COPYFILE_EXCL);
    return {
      schemaVersion: "t8-project-media/v1",
      mediaId,
      role: "generated_result",
      originalName: path.basename(inspected.filePath).slice(0, 240),
      mimeType: inspected.type.mimeType,
      extension: inspected.type.extension,
      sizeBytes: inspected.stat.size,
      sha256,
      importedAt: this.now()
    };
  }

  resolve(projectId, mediaId) {
    const safeProjectId = safeId(projectId, "Project ID");
    const safeMediaId = safeId(mediaId, "Media ID");
    const directory = path.join(this.root, safeProjectId);
    if (!fs.existsSync(directory)) return null;
    const entries = fs.readdirSync(directory).filter((name) => name.startsWith(`${safeMediaId}.`));
    if (entries.length !== 1) return null;
    const candidate = path.resolve(directory, entries[0]);
    const relative = path.relative(path.resolve(directory), candidate);
    if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;
    return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
  }

  removeProject(projectId) {
    const safeProjectId = safeId(projectId, "Project ID");
    const directory = path.join(this.root, safeProjectId);
    if (!fs.existsSync(directory)) return false;
    fs.rmSync(directory, { recursive: true, force: false });
    return true;
  }
}

module.exports = { MAX_RESULT_VIDEO_BYTES, ProjectMediaStore, fileSha256, inspectVideo };
