const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { DialogPathStore } = require("../lib/dialog-paths.cjs");

test("dialog paths persist only existing directories and remember file parents", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-dialog-paths-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const userDataDir = path.join(root, "user-data");
  const mediaDir = path.join(root, "media");
  const exportDir = path.join(root, "exports");
  fs.mkdirSync(mediaDir);
  fs.mkdirSync(exportDir);
  const mediaPath = path.join(mediaDir, "reference.png");
  fs.writeFileSync(mediaPath, "test");

  const store = new DialogPathStore({ userDataDir });
  assert.equal(store.remember("reference-media", mediaPath), mediaDir);
  assert.equal(store.remember("handoff-export", exportDir, { directory: true }), exportDir);

  const restored = new DialogPathStore({ userDataDir });
  assert.equal(restored.get("reference-media"), mediaDir);
  assert.equal(restored.get("handoff-export"), exportDir);
  assert.equal(restored.get("project-export", path.join(root, "missing")), "");
  assert.throws(() => restored.get("untrusted-key"), /Unknown dialog path key/u);
});
