const fs = require("node:fs");
const path = require("node:path");

const FILE_NAME = "prompt-provider-credentials-v1.json";
const PROVIDER_IDS = new Set(["seedance_nz", "t8star_workshop", "openai_compatible"]);

function validProviderId(value) {
  const id = String(value || "");
  if (!PROVIDER_IDS.has(id)) throw new Error("Unsupported credential provider");
  return id;
}

function validKey(value) {
  const key = String(value || "").trim();
  if (key.length < 8 || key.length > 4096 || /[\r\n\0]/u.test(key)) throw new Error("Invalid API key");
  return key;
}

class CredentialVault {
  constructor({ userDataDir, safeStorage, env = process.env }) {
    this.userDataDir = path.resolve(userDataDir);
    this.safeStorage = safeStorage;
    this.env = env;
    this.session = new Map();
    this.filePath = path.join(this.userDataDir, FILE_NAME);
  }

  readDisk() {
    try {
      const document = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      return document?.schemaVersion === "t8-prompt-credential-v1" && document.providers && typeof document.providers === "object"
        ? document
        : { schemaVersion: "t8-prompt-credential-v1", providers: {} };
    } catch {
      return { schemaVersion: "t8-prompt-credential-v1", providers: {} };
    }
  }

  writeDisk(document) {
    fs.mkdirSync(this.userDataDir, { recursive: true });
    const temporary = `${this.filePath}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, this.filePath);
  }

  persistentAvailable() {
    return Boolean(this.safeStorage?.isEncryptionAvailable?.());
  }

  set(providerId, apiKey, remember = false) {
    const id = validProviderId(providerId);
    const key = validKey(apiKey);
    if (remember) {
      if (!this.persistentAvailable()) throw new Error("Secure credential storage is unavailable on this system");
      const document = this.readDisk();
      const encrypted = this.safeStorage.encryptString(key).toString("base64");
      document.providers[id] = { encrypted, updatedAt: new Date().toISOString() };
      this.writeDisk(document);
    }
    this.session.set(id, key);
    return this.status(id);
  }

  clear(providerId) {
    const id = validProviderId(providerId);
    this.session.delete(id);
    const document = this.readDisk();
    if (Object.hasOwn(document.providers, id)) {
      delete document.providers[id];
      this.writeDisk(document);
    }
    return this.status(id);
  }

  environmentName(providerId) {
    return ({ seedance_nz: "SEEDANCE_API_KEY", t8star_workshop: "T8STAR_API_KEY", openai_compatible: "OPENAI_API_KEY" })[providerId];
  }

  resolve(providerId) {
    const id = validProviderId(providerId);
    if (this.session.has(id)) return { key: this.session.get(id), source: "session" };
    if (this.persistentAvailable()) {
      const entry = this.readDisk().providers[id];
      if (entry?.encrypted) {
        try {
          const key = this.safeStorage.decryptString(Buffer.from(entry.encrypted, "base64"));
          if (key) return { key, source: "remembered" };
        } catch {
          // Corrupt or machine-bound values fail closed and never fall through as plaintext.
        }
      }
    }
    const environmentName = this.environmentName(id);
    const environmentKey = String(this.env[environmentName] || "").trim();
    return environmentKey ? { key: environmentKey, source: "environment" } : { key: "", source: null };
  }

  status(providerId) {
    const id = validProviderId(providerId);
    const resolved = this.resolve(id);
    return {
      providerId: id,
      configured: Boolean(resolved.key),
      source: resolved.source,
      persistentAvailable: this.persistentAvailable()
    };
  }
}

module.exports = { CredentialVault, FILE_NAME, PROVIDER_IDS, validKey, validProviderId };
