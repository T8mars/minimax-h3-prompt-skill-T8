const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { resolveMediaRoot } = require("../lib/media-roots.cjs");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-media-roots-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test("explicit media directory remains the highest-priority release and test override", (t) => {
  const root = fixture(t);
  const resolved = resolveMediaRoot({
    env: { T8_MEDIA_DIR: "sidecar" },
    executablePath: path.join(root, "app", "T8 Prompt Library.exe"),
    isPackaged: true,
    repoRoot: root,
    resourcesPath: path.join(root, "resources"),
    userDataDir: path.join(root, "user-data")
  });
  assert.equal(resolved, path.join(root, "sidecar"));
});

test("packaged application preserves legacy bundled media compatibility", (t) => {
  const root = fixture(t);
  const bundled = path.join(root, "resources", "media");
  fs.mkdirSync(bundled, { recursive: true });
  fs.writeFileSync(path.join(bundled, "media-pack-manifest.json"), "{}\n");
  const resolved = resolveMediaRoot({
    env: {},
    executablePath: path.join(root, "app", "T8 Prompt Library.exe"),
    isPackaged: true,
    repoRoot: root,
    resourcesPath: path.join(root, "resources"),
    userDataDir: path.join(root, "user-data")
  });
  assert.equal(resolved, bundled);
});

test("packaged application auto-mounts an extracted user-data media pack", (t) => {
  const root = fixture(t);
  const userMedia = path.join(root, "user-data", "media");
  fs.mkdirSync(userMedia, { recursive: true });
  fs.writeFileSync(path.join(userMedia, "media-pack-manifest.json"), "{}\n");
  const resolved = resolveMediaRoot({
    env: {},
    executablePath: path.join(root, "app", "T8 Prompt Library.exe"),
    isPackaged: true,
    repoRoot: root,
    resourcesPath: path.join(root, "resources"),
    userDataDir: path.join(root, "user-data")
  });
  assert.equal(resolved, userMedia);
});

test("missing sidecar falls back to the stable user-data extraction target", (t) => {
  const root = fixture(t);
  const userDataDir = path.join(root, "user-data");
  const resolved = resolveMediaRoot({
    env: {},
    executablePath: path.join(root, "app", "T8 Prompt Library.exe"),
    isPackaged: true,
    repoRoot: root,
    resourcesPath: path.join(root, "resources"),
    userDataDir
  });
  assert.equal(resolved, path.join(userDataDir, "media"));
});
