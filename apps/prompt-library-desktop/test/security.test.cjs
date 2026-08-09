const assert = require("node:assert/strict");
const test = require("node:test");
const { allowedExternalUrl, isAllowedHost } = require("../lib/security.cjs");

test("allows supported source platforms over HTTPS", () => {
  assert.equal(allowedExternalUrl("https://x.com/creator/status/123")?.hostname, "x.com");
  assert.equal(allowedExternalUrl("https://www.reddit.com/r/test/comments/123")?.hostname, "www.reddit.com");
  assert.equal(allowedExternalUrl("https://www.youtube.com/watch?v=123")?.hostname, "www.youtube.com");
  assert.equal(isAllowedHost("platform.minimaxi.com"), true);
});

test("rejects unlisted, non-HTTPS, credentialed and lookalike links", () => {
  assert.equal(allowedExternalUrl("https://example.com/video"), null);
  assert.equal(allowedExternalUrl("http://x.com/creator/status/123"), null);
  assert.equal(allowedExternalUrl("https://user:pass@x.com/creator/status/123"), null);
  assert.equal(allowedExternalUrl("https://x.com.example.com/status/123"), null);
});
