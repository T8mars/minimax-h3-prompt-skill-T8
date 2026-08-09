import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { loadCatalog } = require("../lib/catalog.cjs");
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appDir, "../..");
const requiredFiles = [
  "package.json",
  "main.cjs",
  "preload.cjs",
  "electron-builder.config.cjs",
  "lib/catalog.cjs",
  "lib/security.cjs",
  "lib/update-policy.cjs",
  "lib/media-response.cjs",
  "src/index.html",
  "src/styles.css",
  "src/app.js"
];

const errors = [];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(appDir, relative))) errors.push(`missing app file: ${relative}`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(appDir, "package.json"), "utf8"));
if (packageJson.version !== "1.0.0") errors.push(`expected app version 1.0.0, got ${packageJson.version}`);

const main = fs.readFileSync(path.join(appDir, "main.cjs"), "utf8");
for (const expected of ["contextIsolation: true", "sandbox: true", "nodeIntegration: false", "setPermissionRequestHandler"]) {
  if (!main.includes(expected)) errors.push(`security setting not found: ${expected}`);
}
const html = fs.readFileSync(path.join(appDir, "src", "index.html"), "utf8");
for (const expected of ["connect-src 'none'", "frame-src 'none'", "object-src 'none'"]) {
  if (!html.includes(expected)) errors.push(`CSP directive not found: ${expected}`);
}

const catalogRoot = path.join(repoRoot, "catalog");
const devMediaRoot = path.join(repoRoot, ".release-input", "media");
let caseCount = 0;
let videoCount = 0;
if (fs.existsSync(path.join(catalogRoot, "manifest.json"))) {
  const catalog = loadCatalog({ catalogRoot, mediaRoot: devMediaRoot });
  caseCount = catalog.cases.length;
  videoCount = catalog.cases.filter((item) => item.media.hasFullVideo).length;
  const rootManifest = JSON.parse(fs.readFileSync(path.join(catalogRoot, "manifest.json"), "utf8"));
  if (Number.isInteger(rootManifest.case_count) && rootManifest.case_count !== caseCount) {
    errors.push(`catalog case_count=${rootManifest.case_count}, viewer loaded ${caseCount}`);
  }
  for (const item of catalog.cases) {
    if (!item.media.gif || !item.media.poster) errors.push(`${item.id}: missing GIF or poster`);
    if (!item.prompts.minimaxH3 || !item.prompts.seedance20) errors.push(`${item.id}: missing H3 or Seedance prompt`);
    if (!item.sourceUrl) errors.push(`${item.id}: missing HTTPS source URL`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR ${error}`).join("\n"));
  process.exit(1);
}

console.log(`PASS app static validation; catalog cases=${caseCount}; local full videos=${videoCount}`);
