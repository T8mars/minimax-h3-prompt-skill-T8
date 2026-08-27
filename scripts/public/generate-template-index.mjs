import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const { loadCatalog } = require(path.join(repoRoot, "apps/prompt-library-desktop/lib/catalog.cjs"));
const { buildTemplateIndex, stableStringify } = require(path.join(repoRoot, "apps/prompt-library-desktop/lib/template-index.cjs"));

const outputPath = path.join(repoRoot, "catalog/template-index.json");
const mode = process.argv.includes("--write") ? "write" : "check";
const catalog = loadCatalog({
  catalogRoot: path.join(repoRoot, "catalog"),
  skillsRoot: path.join(repoRoot, "skills"),
  mediaRoot: null
});
const expected = `${stableStringify(buildTemplateIndex(catalog), 2)}\n`;

if (mode === "write") {
  fs.writeFileSync(outputPath, expected, "utf8");
  console.log(`Wrote ${path.relative(repoRoot, outputPath)} (${catalog.cases.length} cases).`);
  process.exit(0);
}

if (!fs.existsSync(outputPath)) {
  console.error("Template index validation failed: catalog/template-index.json is missing. Run npm run template-index:write.");
  process.exit(1);
}
const actual = fs.readFileSync(outputPath, "utf8").replace(/\r\n/gu, "\n");
if (actual !== expected) {
  console.error("Template index validation failed: catalog/template-index.json is stale. Run npm run template-index:write.");
  process.exit(1);
}
console.log("Template index validation passed.");
