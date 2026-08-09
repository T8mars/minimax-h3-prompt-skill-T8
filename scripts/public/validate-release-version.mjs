import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { readJson, repoRoot } from "./lib.mjs";

function parseVersion(raw) {
  const value = String(raw).replace(/^v/, "");
  const match = value.match(/^(0|[1-9][0-9]*)\.([0-9])\.([0-9])$/);
  if (!match) throw new Error(`'${raw}' violates decimal-carry format MAJOR.0-9.0-9`);
  return { text: value, parts: match.slice(1).map(Number) };
}

function compare(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left.parts[index] !== right.parts[index]) return left.parts[index] - right.parts[index];
  }
  return 0;
}

function next(version) {
  let [major, minor, patch] = version.parts;
  if (patch < 9) patch += 1;
  else if (minor < 9) {
    minor += 1;
    patch = 0;
  } else {
    major += 1;
    minor = 0;
    patch = 0;
  }
  return `${major}.${minor}.${patch}`;
}

const rootVersion = parseVersion(readJson(path.join(repoRoot, "package.json")).version);
const appPackagePath = path.join(repoRoot, "apps", "prompt-library-desktop", "package.json");
if (fs.existsSync(appPackagePath)) {
  const appVersion = parseVersion(readJson(appPackagePath).version);
  if (compare(rootVersion, appVersion) !== 0) throw new Error(`root version ${rootVersion.text} does not match Electron version ${appVersion.text}`);
}

if (process.argv.includes("--current")) {
  console.log(`Current decimal-carry version is valid: ${rootVersion.text}; next is ${next(rootVersion)}.`);
  process.exit();
}

const candidateIndex = process.argv.indexOf("--candidate");
if (candidateIndex < 0 || !process.argv[candidateIndex + 1]) {
  console.error("Usage: node scripts/public/validate-release-version.mjs --candidate <version>");
  process.exit(2);
}
const candidate = parseVersion(process.argv[candidateIndex + 1]);
if (compare(candidate, rootVersion) !== 0) throw new Error(`release candidate ${candidate.text} must match package version ${rootVersion.text}`);

let rawTags = "";
try {
  rawTags = execFileSync("git", ["tag", "--list", "v*"], { cwd: repoRoot, encoding: "utf8" });
} catch (error) {
  throw new Error(`unable to inspect git tags: ${error.message}`);
}
const versions = rawTags.split(/\r?\n/).filter(Boolean).map(parseVersion).filter((version) => compare(version, candidate) !== 0).sort(compare);
const previous = versions.at(-1) ?? null;
const expected = previous ? next(previous) : "1.0.0";
if (candidate.text !== expected) throw new Error(`expected next release ${expected}, got ${candidate.text}`);
console.log(`Release version validated: ${previous ? previous.text : "initial"} -> ${candidate.text}.`);
