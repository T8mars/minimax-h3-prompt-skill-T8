const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createFileResponse, mediaContentType, parseSingleByteRange } = require("../lib/media-response.cjs");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t8-media-response-"));
  const filePath = path.join(root, "preview.mp4");
  fs.writeFileSync(filePath, Buffer.from("0123456789abcdefghijklmnopqrstuvwxyz", "ascii"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return filePath;
}

test("parses bounded, open-ended and suffix byte ranges", () => {
  assert.deepEqual(parseSingleByteRange("bytes=3-8", 20), { start: 3, end: 8 });
  assert.deepEqual(parseSingleByteRange("bytes=15-", 20), { start: 15, end: 19 });
  assert.deepEqual(parseSingleByteRange("bytes=-5", 20), { start: 15, end: 19 });
  assert.deepEqual(parseSingleByteRange("bytes=18-99", 20), { start: 18, end: 19 });
  assert.equal(parseSingleByteRange("", 20), null);
  assert.deepEqual(parseSingleByteRange("bytes=1-2,4-5", 20), { invalid: true });
  assert.deepEqual(parseSingleByteRange("bytes=20-", 20), { invalid: true });
});

test("returns a streamable 206 response with exact range headers and bytes", async (t) => {
  const filePath = fixture(t);
  const response = createFileResponse(filePath, new Request("https://local.invalid/preview.mp4", { headers: { Range: "bytes=10-15" } }));
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(response.headers.get("content-range"), "bytes 10-15/36");
  assert.equal(response.headers.get("content-length"), "6");
  assert.equal(response.headers.get("content-type"), "video/mp4");
  assert.equal(Buffer.from(await response.arrayBuffer()).toString("ascii"), "abcdef");
});

test("supports suffix ranges and HEAD without allocating a response body", async (t) => {
  const filePath = fixture(t);
  const suffix = createFileResponse(filePath, new Request("https://local.invalid/preview.mp4", { headers: { Range: "bytes=-4" } }));
  assert.equal(suffix.status, 206);
  assert.equal(suffix.headers.get("content-range"), "bytes 32-35/36");
  assert.equal(Buffer.from(await suffix.arrayBuffer()).toString("ascii"), "wxyz");

  const head = createFileResponse(filePath, new Request("https://local.invalid/preview.mp4", { method: "HEAD", headers: { Range: "bytes=4-9" } }));
  assert.equal(head.status, 206);
  assert.equal(head.headers.get("content-range"), "bytes 4-9/36");
  assert.equal(head.headers.get("content-length"), "6");
  assert.equal(head.body, null);
});

test("returns 416 for malformed, multiple and unsatisfiable ranges", (t) => {
  const filePath = fixture(t);
  for (const value of ["bytes=99-", "bytes=8-4", "bytes=1-2,4-5", "items=0-1"]) {
    const response = createFileResponse(filePath, new Request("https://local.invalid/preview.mp4", { headers: { Range: value } }));
    assert.equal(response.status, 416, value);
    assert.equal(response.headers.get("content-range"), "bytes */36");
    assert.equal(response.headers.get("accept-ranges"), "bytes");
  }
});

test("sets strict MIME types and rejects unsupported methods", (t) => {
  const filePath = fixture(t);
  assert.equal(mediaContentType("preview.gif"), "image/gif");
  assert.equal(mediaContentType("poster.webp"), "image/webp");
  assert.equal(mediaContentType("unknown.bin"), "application/octet-stream");
  const response = createFileResponse(filePath, new Request("https://local.invalid/preview.mp4", { method: "POST" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});
