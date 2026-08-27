const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { ProjectMediaStore } = require("../lib/project-media.cjs");

function withTemp(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-project-media-"));
  try { return run(root); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test("generated result video is copied into project-owned storage and exposes no source path", () => withTemp((root) => {
  const source = path.join(root, "my-result.mp4");
  fs.writeFileSync(source, Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypisom0000", "ascii"), Buffer.alloc(64)]));
  const store = new ProjectMediaStore({ userDataDir: path.join(root, "data"), now: () => "2026-08-27T00:00:00.000Z" });
  const descriptor = store.importResult("project-1", source);
  assert.equal(descriptor.role, "generated_result");
  assert.equal(Object.hasOwn(descriptor, "filePath"), false);
  const resolved = store.resolve("project-1", descriptor.mediaId);
  assert.ok(resolved);
  assert.notEqual(path.resolve(resolved), path.resolve(source));
  assert.equal(fs.readFileSync(resolved).equals(fs.readFileSync(source)), true);
}));

test("project media resolver rejects traversal and non-video imports", () => withTemp((root) => {
  const source = path.join(root, "fake.mp4");
  fs.writeFileSync(source, "not a video");
  const store = new ProjectMediaStore({ userDataDir: path.join(root, "data") });
  assert.throws(() => store.importResult("project-1", source), /accepts MP4/u);
  assert.throws(() => store.resolve("..", "result-any"), /Project ID is invalid/u);
}));
