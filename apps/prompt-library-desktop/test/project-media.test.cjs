const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { ProjectMediaStore, inspectVideo } = require("../lib/project-media.cjs");

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

test("result review admits only formats covered by the built-in Chromium playback contract", () => withTemp((root) => {
  const mov = path.join(root, "result.mov");
  fs.writeFileSync(mov, Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypqt  0000", "ascii"), Buffer.alloc(64)]));
  const avi = path.join(root, "result.avi");
  fs.writeFileSync(avi, Buffer.concat([Buffer.from("RIFF0000AVI ", "ascii"), Buffer.alloc(64)]));
  const webm = path.join(root, "result.webm");
  fs.writeFileSync(webm, Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(64)]));
  assert.throws(() => inspectVideo(mov), /MP4 or WebM/u);
  assert.throws(() => inspectVideo(avi), /MP4 or WebM/u);
  assert.equal(inspectVideo(webm).type.extension, "webm");
}));
