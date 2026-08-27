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

test("repair is a separately confirmed single request bound to its immutable source revision", async () => {
  let posts = 0;
  let body = null;
  const orchestrator = new PromptOrchestrator({
    credentialVault: vault(true),
    randomUUID: () => "run-repair",
    fetchImpl: async (_url, options) => {
      posts += 1;
      body = JSON.parse(options.body);
      return new Response(JSON.stringify({ choices: [{ message: { content: "Shot 1 0-3s camera locked. visible mechanism. Shot 2 3-15s held final result." } }] }), { status: 200 });
    }
  });
  const plan = orchestrator.preflight({ ...input(), operation: { kind: "repair", projectId: "project-1", sourceRevisionId: "revision-1", rootRevisionId: "revision-1", sourceOutput: "Original immutable output", instructions: "Only repair the final hold." } }, { frozenMedia: [] });
  assert.equal(plan.operation, "repair");
  assert.equal(plan.plannedChatCalls, 1);
  assert.throws(() => orchestrator.start({ planHash: plan.planHash, confirmed: false }), /confirmation/u);
  orchestrator.start({ planHash: plan.planHash, confirmed: true });
  await waitFor(() => orchestrator.status("run-repair").state === "completed");
  assert.equal(posts, 1);
  assert.match(JSON.stringify(body.messages), /Original immutable output/u);
  assert.match(JSON.stringify(body.messages), /Only repair the final hold/u);
  const snapshot = orchestrator.projectSnapshot("run-repair");
  assert.equal(snapshot.operation.kind, "repair");
  assert.equal(snapshot.operation.sourceRevisionId, "revision-1");
});

test("variant is a separately confirmed single request that preserves its hard-anchor hash", async () => {
  let posts = 0;
  let body = null;
  const orchestrator = new PromptOrchestrator({
    credentialVault: vault(true),
    randomUUID: () => "run-variant",
    fetchImpl: async (_url, options) => {
      posts += 1;
      body = JSON.parse(options.body);
      return new Response(JSON.stringify({ choices: [{ message: { content: "Shot 1 0-3s director hook. visible mechanism. Shot 2 3-15s held final result." } }] }), { status: 200 });
    }
  });
  const operation = {
    kind: "variant",
    projectId: "project-1",
    sourceRevisionId: "revision-1",
    rootRevisionId: "revision-1",
    sourceOutput: "Original immutable output",
    sourceOutputSha256: require("node:crypto").createHash("sha256").update("Original immutable output", "utf8").digest("hex"),
    style: "director",
    axes: ["camera", "rhythm", "blocking"],
    instruction: "Change only the directing treatment.",
    hardAnchorHash: "b".repeat(64)
  };
  const plan = orchestrator.preflight({ ...input(), operation }, { frozenMedia: [] });
  assert.equal(plan.operation, "variant");
  assert.equal(plan.plannedChatCalls, 1);
  assert.throws(() => orchestrator.start({ planHash: plan.planHash, confirmed: false }), /confirmation/u);
  orchestrator.start({ planHash: plan.planHash, confirmed: true });
  await waitFor(() => orchestrator.status("run-variant").state === "completed");
  assert.equal(posts, 1);
  assert.match(JSON.stringify(body.messages), /director/u);
  assert.match(JSON.stringify(body.messages), new RegExp("b{64}", "u"));
  const snapshot = orchestrator.projectSnapshot("run-variant");
  assert.equal(snapshot.operation.kind, "variant");
  assert.equal(snapshot.operation.hardAnchorHash, "b".repeat(64));
});
