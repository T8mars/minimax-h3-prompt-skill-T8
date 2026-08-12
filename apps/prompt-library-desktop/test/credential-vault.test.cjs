const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { CredentialVault } = require("../lib/credential-vault.cjs");

function withVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-vault-test-"));
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: (value) => Buffer.from(`encrypted:${Buffer.from(value).toString("base64")}`),
    decryptString: (buffer) => Buffer.from(buffer.toString().replace(/^encrypted:/u, ""), "base64").toString()
  };
  return { root, vault: new CredentialVault({ userDataDir: root, safeStorage, env: {} }) };
}

test("session credentials never appear in status", () => {
  const { root, vault } = withVault();
  try {
    const status = vault.set("t8star_workshop", "test-session-secret", false);
    assert.deepEqual(status, { providerId: "t8star_workshop", configured: true, source: "session", persistentAvailable: true });
    assert.equal(vault.resolve("t8star_workshop").key, "test-session-secret");
    assert.doesNotMatch(JSON.stringify(status), /test-session-secret/u);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("remembered credentials are encrypted and can be cleared", () => {
  const { root, vault } = withVault();
  try {
    vault.set("seedance_nz", "remembered-secret-value", true);
    const raw = fs.readFileSync(vault.filePath, "utf8");
    assert.doesNotMatch(raw, /remembered-secret-value/u);
    vault.session.clear();
    assert.deepEqual(vault.resolve("seedance_nz"), { key: "remembered-secret-value", source: "remembered" });
    assert.equal(vault.clear("seedance_nz").configured, false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
