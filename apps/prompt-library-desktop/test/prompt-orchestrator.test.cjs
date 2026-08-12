const assert = require("node:assert/strict");
const test = require("node:test");
const { PromptOrchestrator } = require("../lib/prompt-orchestrator.cjs");

function input() {
  return {
    providerId: "t8star_workshop",
    model: "gemini-3.5-flash",
    target: "minimaxH3",
    outputLanguage: "en",
    durationSeconds: 15,
    rewriteMode: "balanced",
    intent: "A fictional camera proves three visible mechanisms and holds the final result.",
    constraints: "No subtitles.",
    template: {
      id: "case-one", templateId: "template-one", title: "Product proof", summary: "Accumulate proof.",
      requiredAnchors: ["visible mechanism", "held final result"], creativeDna: { mechanism: "proof ladder" }
    }
  };
}

function vault(configured = true) {
  return {
    status: (providerId) => ({ providerId, configured, source: configured ? "session" : null, persistentAvailable: true }),
    resolve: () => ({ key: configured ? "test-key" : "", source: configured ? "session" : null }),
    set: () => ({}), clear: () => ({})
  };
}

function waitFor(predicate, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      const value = predicate();
      if (value) return resolve(value);
      if (Date.now() - started > timeoutMs) return reject(new Error("wait timeout"));
      setTimeout(tick, 10);
    };
    tick();
  });
}

test("preflight requires a configured provider and explicit confirmation", () => {
  const missing = new PromptOrchestrator({ credentialVault: vault(false), randomUUID: () => "run-1" });
  assert.throws(() => missing.preflight(input()), /no configured API key/u);
  const orchestrator = new PromptOrchestrator({ credentialVault: vault(true), randomUUID: () => "run-1" });
  const plan = orchestrator.preflight(input());
  assert.equal(plan.outputLanguage, "en");
  assert.throws(() => orchestrator.start({ planHash: plan.planHash, confirmed: false }), /confirmation/u);
});

test("one consumed preflight produces exactly one POST and preserves output over 1024 characters", async () => {
  let posts = 0;
  const output = `Shot 1 0-3s camera locked. ${"visible mechanism ".repeat(90)} Shot 2 3-15s held final result.`;
  const orchestrator = new PromptOrchestrator({
    credentialVault: vault(true),
    randomUUID: () => "run-single-flight",
    fetchImpl: async () => {
      posts += 1;
      return new Response(JSON.stringify({ choices: [{ message: { content: output } }] }), { status: 200 });
    }
  });
  const plan = orchestrator.preflight(input());
  const started = orchestrator.start({ planHash: plan.planHash, confirmed: true });
  assert.equal(started.runId, "run-single-flight");
  assert.throws(() => orchestrator.start({ planHash: plan.planHash, confirmed: true }), /already been consumed/u);
  const done = await waitFor(() => {
    const status = orchestrator.status(started.runId);
    return status.state === "completed" ? status : null;
  });
  assert.equal(posts, 1);
  assert.equal(done.output, output);
  assert.ok(done.output.length > 1024);
  assert.equal(done.validation.status, "pass");
  assert.equal(orchestrator.auditRecord(done.runId).outputSha256, done.receipt.outputSha256);
});

test("running cancellation never promises remote cancellation or no billing", async () => {
  const orchestrator = new PromptOrchestrator({
    credentialVault: vault(true),
    randomUUID: () => "run-cancel",
    fetchImpl: (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }))
  });
  const plan = orchestrator.preflight(input());
  orchestrator.start({ planHash: plan.planHash, confirmed: true });
  const cancelling = orchestrator.cancel("run-cancel");
  assert.match(cancelling.cancellationMessage, /remote completion or billing state is unknown/u);
  const done = await waitFor(() => {
    const status = orchestrator.status("run-cancel");
    return status.state === "cancel_requested" ? status : null;
  });
  assert.equal(done.error.outcomeCertainty, "unknown");
});
