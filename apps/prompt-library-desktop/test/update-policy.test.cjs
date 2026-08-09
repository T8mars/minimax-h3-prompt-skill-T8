const assert = require("node:assert/strict");
const test = require("node:test");
const { DEFAULT_DELAY_MS, automaticUpdateDelay } = require("../lib/update-policy.cjs");

test("automatic update checks run only in packaged builds", () => {
  assert.equal(automaticUpdateDelay({ isPackaged: false, env: {} }), null);
  assert.equal(automaticUpdateDelay({ isPackaged: true, env: {} }), DEFAULT_DELAY_MS);
});

test("automatic update checks have an injectable disable switch and bounded delay", () => {
  assert.equal(automaticUpdateDelay({ isPackaged: true, env: { T8_DISABLE_AUTO_UPDATE: "1" } }), null);
  assert.equal(automaticUpdateDelay({ isPackaged: true, env: { T8_UPDATE_CHECK_DELAY_MS: "20" } }), 1000);
  assert.equal(automaticUpdateDelay({ isPackaged: true, env: { T8_UPDATE_CHECK_DELAY_MS: "20000" } }), 20000);
});
