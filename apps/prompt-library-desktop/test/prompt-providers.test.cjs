const assert = require("node:assert/strict");
const test = require("node:test");
const {
  PROVIDERS,
  PromptProviderError,
  callProvider,
  normalizeOpenAiChatUrl,
  normalizePlan
} = require("../lib/prompt-providers.cjs");

function input(overrides = {}) {
  return {
    providerId: "t8star_workshop",
    model: "gemini-3.5-flash",
    target: "minimaxH3",
    durationSeconds: 15,
    rewriteMode: "balanced",
    intent: "A fictional folding camera proves three visible functions and ends on a held result.",
    constraints: "No subtitles.",
    template: {
      id: "case-one",
      templateId: "t8-case-one-v1",
      title: "Three-stage product proof",
      summary: "Each stage answers a new product question.",
      inputFormat: "product + audience + three proofs + result",
      recommendedInput: "A fictional product with visible evidence.",
      requiredAnchors: ["three visibly different proofs", "held final result"],
      creativeDna: { mechanism: "Evidence accumulates through three distinct visible states." },
      surfaceGuide: "Subject: source character"
    },
    ...overrides
  };
}

test("provider constants match the audited ComfyUI node contract and registration links", () => {
  assert.deepEqual({
    chat: PROVIDERS.seedance_nz.chatUrl,
    upload: PROVIDERS.seedance_nz.uploadUrl,
    model: PROVIDERS.seedance_nz.defaultModel,
    registration: PROVIDERS.seedance_nz.registrationUrl
  }, {
    chat: "https://api.seedance.nz/v1/chat/completions",
    upload: "https://api.seedance.nz/v1/files/upload",
    model: "bytedance/doubao-seed-evolving",
    registration: "https://api.seedance.nz/sign-up?aff=5f4w"
  });
  assert.deepEqual({
    chat: PROVIDERS.t8star_workshop.chatUrl,
    model: PROVIDERS.t8star_workshop.defaultModel,
    registration: PROVIDERS.t8star_workshop.registrationUrl
  }, {
    chat: "https://ai.t8star.org/v1/chat/completions",
    model: "gemini-3.5-flash",
    registration: "https://ai.t8star.org/register?aff=dP7j"
  });
});

test("OpenAI-compatible endpoint normalization is HTTPS-only and deterministic", () => {
  assert.equal(normalizeOpenAiChatUrl("https://gateway.example/v1"), "https://gateway.example/v1/chat/completions");
  assert.equal(normalizeOpenAiChatUrl("https://gateway.example/api"), "https://gateway.example/api/v1/chat/completions");
  assert.equal(normalizeOpenAiChatUrl("https://gateway.example/v1/chat/completions"), "https://gateway.example/v1/chat/completions");
  for (const unsafe of ["http://gateway.example", "https://user:pass@gateway.example", "https://gateway.example?key=x", "https://127.0.0.1/v1"]) {
    assert.throws(() => normalizeOpenAiChatUrl(unsafe), PromptProviderError);
  }
});

test("all three plans bind the exact endpoint and model without crossing target syntax", () => {
  const workshop = normalizePlan(input());
  assert.equal(workshop.endpoint, "https://ai.t8star.org/v1/chat/completions");
  assert.equal(workshop.model, "gemini-3.5-flash");
  assert.equal(workshop.outputLanguage, "zh-CN");
  assert.match(workshop.messages[0].content, /MiniMax H3 prompt with all descriptive prose in Simplified Chinese/u);
  assert.match(workshop.messages[1].content, /OUTPUT LANGUAGE: Simplified Chinese/u);

  const english = normalizePlan(input({ outputLanguage: "en" }));
  assert.match(english.messages[0].content, /MiniMax H3 prompt in English/u);

  const seedance = normalizePlan(input({ providerId: "seedance_nz", model: "" }));
  assert.equal(seedance.endpoint, "https://api.seedance.nz/v1/chat/completions");
  assert.equal(seedance.model, "bytedance/doubao-seed-evolving");

  const compatible = normalizePlan(input({ providerId: "openai_compatible", baseUrl: "https://llm.example/api", model: "custom-model", target: "seedance20" }));
  assert.equal(compatible.endpoint, "https://llm.example/api/v1/chat/completions");
  assert.equal(compatible.model, "custom-model");
  assert.match(compatible.messages[0].content, /Seedance 2\.0 prompt in Simplified Chinese/u);
});

test("provider call sends one audited Chat Completions request and returns the full output", async () => {
  const plan = normalizePlan(input());
  const longOutput = `Shot 1 0-3s camera locked. ${"visible mechanism ".repeat(90)} Shot 2 3-15s held final result.`;
  const calls = [];
  const result = await callProvider(plan, "test-secret-key", {
    fetchImpl: async (url, options) => {
      calls.push({ url, options, body: JSON.parse(options.body) });
      return new Response(JSON.stringify({
        id: "request-123",
        choices: [{ message: { content: longOutput } }],
        usage: { prompt_tokens: 101, completion_tokens: 202 }
      }), { status: 200, headers: { "x-request-id": "header-request-123", "content-type": "application/json" } });
    }
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://ai.t8star.org/v1/chat/completions");
  assert.equal(calls[0].options.headers.Authorization, "Bearer test-secret-key");
  assert.equal(calls[0].body.stream, false);
  assert.equal(calls[0].body.model, "gemini-3.5-flash");
  assert.equal(calls[0].body.messages.length, 2);
  assert.ok(result.output.length > 1024, "full output must not use a truncated preview field");
  assert.equal(result.output, longOutput);
  assert.equal(result.receipt.requestId, "header-request-123");
  assert.deepEqual(result.receipt.usage, { prompt_tokens: 101, completion_tokens: 202 });
  assert.equal(result.receipt.attempts, 1);
});

test("provider errors redact bearer-like secrets and do not retry automatically", async () => {
  const plan = normalizePlan(input());
  let calls = 0;
  await assert.rejects(
    callProvider(plan, "sk-sensitive-value", {
      fetchImpl: async () => {
        calls += 1;
        return new Response("bad key sk-sensitive-value", { status: 401 });
      }
    }),
    (error) => {
      assert.equal(error.code, "authentication_failed");
      assert.equal(error.retryable, false);
      assert.doesNotMatch(error.message, /sensitive/u);
      return true;
    }
  );
  assert.equal(calls, 1);
});
