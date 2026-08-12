const { callProvider, normalizePlan } = require("../lib/prompt-providers.cjs");
const { validateEnhancedPrompt } = require("../lib/prompt-validation.cjs");

const args = new Set(process.argv.slice(2));
const providerId = process.argv.find((value) => value.startsWith("--provider="))?.split("=")[1] || "";
if (!args.has("--confirm-paid")) throw new Error("Live provider smoke requires --confirm-paid.");
const environmentName = ({ seedance_nz: "SEEDANCE_API_KEY", t8star_workshop: "T8STAR_API_KEY", openai_compatible: "OPENAI_API_KEY" })[providerId];
if (!environmentName) throw new Error("Use --provider=seedance_nz, t8star_workshop, or openai_compatible.");
const apiKey = String(process.env[environmentName] || "").trim();
if (!apiKey) throw new Error(`${environmentName} is not configured in this process.`);

const plan = normalizePlan({
  providerId,
  baseUrl: process.env.OPENAI_BASE_URL,
  model: providerId === "openai_compatible" ? process.env.OPENAI_MODEL : "",
  target: "minimaxH3",
  durationSeconds: 5,
  rewriteMode: "strict",
  intent: "Create a five-second product proof: a fictional desk lamp visibly folds once, relights, and holds the final stable state.",
  constraints: "No source brands, no subtitles, no dialogue.",
  template: {
    id: "live-smoke-product-proof",
    templateId: "live-smoke-product-proof-v1",
    title: "Visible product proof",
    summary: "A compact causal proof with a held result.",
    requiredAnchors: ["folds once", "relights", "held final stable state"],
    creativeDna: { mechanism: "One visible operation causes one visible state change and ends on a held result." }
  }
});

(async () => {
  const result = await callProvider(plan, apiKey);
  const validation = validateEnhancedPrompt({ target: plan.target, outputLanguage: plan.outputLanguage, intent: plan.intent, output: result.output, requiredAnchors: plan.template.requiredAnchors });
  process.stdout.write(`${JSON.stringify({ providerId, endpointHost: plan.endpointHost, model: plan.model, receipt: result.receipt, validation }, null, 2)}\n`);
  process.stdout.write("--- FULL OUTPUT ---\n");
  process.stdout.write(`${result.output}\n`);
  if (validation.status === "fail") process.exitCode = 1;
})().catch((error) => {
  process.stderr.write(`${JSON.stringify({ code: error.code || "error", phase: error.phase || "unknown", message: error.message, outcomeCertainty: error.outcomeCertainty || "unknown" })}\n`);
  process.exitCode = 1;
});
