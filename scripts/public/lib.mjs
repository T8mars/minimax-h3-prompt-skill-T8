import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function toPosix(value) {
  return value.split(path.sep).join("/");
}

export function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${toPosix(path.relative(repoRoot, filePath))}: ${error.message}`);
  }
}

export function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

export function resolveRepoPath(relativePath, label = "path") {
  if (typeof relativePath !== "string" || !relativePath.trim()) {
    throw new Error(`${label} must be a non-empty relative path`);
  }
  if (path.isAbsolute(relativePath) || /^[A-Za-z]:[\\/]/.test(relativePath)) {
    throw new Error(`${label} must not be absolute: ${relativePath}`);
  }
  const resolved = path.resolve(repoRoot, relativePath);
  if (!isInside(repoRoot, resolved)) {
    throw new Error(`${label} escapes repository root: ${relativePath}`);
  }
  return resolved;
}

export function listDirectories(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export function findFirstStringByKeys(value, keys) {
  if (!value || typeof value !== "object") return null;
  if (!Array.isArray(value)) {
    for (const key of keys) {
      if (typeof value[key] === "string" && value[key].trim()) return value[key].trim();
    }
  }
  for (const nested of Array.isArray(value) ? value : Object.values(value)) {
    const found = findFirstStringByKeys(nested, keys);
    if (found) return found;
  }
  return null;
}

export function failWith(prefix, failures) {
  if (!failures.length) return;
  console.error(`${prefix} failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
