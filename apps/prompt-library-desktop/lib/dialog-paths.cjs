const fs = require("node:fs");
const path = require("node:path");

const FILE_NAME = "dialog-paths-v1.json";
const ALLOWED_KEYS = new Set([
  "local-model",
  "local-runtime",
  "local-ffmpeg",
  "reference-media",
  "result-video",
  "handoff-export",
  "skill-export",
  "project-export"
]);

function validKey(value) {
  const key = String(value || "");
  if (!ALLOWED_KEYS.has(key)) throw new Error("Unknown dialog path key.");
  return key;
}

function existingDirectory(value) {
  const candidate = String(value || "").trim();
  if (!candidate || candidate.includes("\0") || !path.isAbsolute(candidate)) return "";
  try {
    const normalized = path.normalize(candidate);
    return fs.statSync(normalized).isDirectory() ? normalized : "";
  } catch {
    return "";
  }
}

class DialogPathStore {
  constructor({ userDataDir }) {
    this.userDataDir = path.resolve(userDataDir);
    this.filePath = path.join(this.userDataDir, FILE_NAME);
    this.paths = this.readDisk();
  }

  readDisk() {
    try {
      const payload = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      if (payload?.schemaVersion !== 1 || !payload.paths || typeof payload.paths !== "object") return {};
      return Object.fromEntries(Object.entries(payload.paths)
        .filter(([key]) => ALLOWED_KEYS.has(key))
        .map(([key, value]) => [key, existingDirectory(value)])
        .filter(([, value]) => value));
    } catch {
      return {};
    }
  }

  writeDisk() {
    fs.mkdirSync(this.userDataDir, { recursive: true });
    const temporary = `${this.filePath}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, `${JSON.stringify({ schemaVersion: 1, paths: this.paths }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, this.filePath);
  }

  get(key, fallback = "") {
    const normalizedKey = validKey(key);
    return existingDirectory(this.paths[normalizedKey]) || existingDirectory(fallback);
  }

  remember(key, selectedPath, { directory = false } = {}) {
    const normalizedKey = validKey(key);
    const candidate = directory ? selectedPath : path.dirname(String(selectedPath || ""));
    const normalized = existingDirectory(candidate);
    if (!normalized) return this.get(normalizedKey);
    this.paths[normalizedKey] = normalized;
    this.writeDisk();
    return normalized;
  }
}

module.exports = { ALLOWED_KEYS, DialogPathStore, FILE_NAME, existingDirectory };
