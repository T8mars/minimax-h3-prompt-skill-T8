import fs from "node:fs";
import path from "node:path";
import { failWith, repoRoot, toPosix } from "./lib.mjs";

const allowedTopDirectories = new Set([".github", "apps", "catalog", "docs", "packages", "scripts", "skills"]);
const allowedRootFiles = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "LICENSE-CONTENT",
  "README.md",
  "SECURITY.md",
  "package-lock.json",
  "package.json"
]);
const ignoredDirectories = new Set([".git", ".release-input", "node_modules", "dist", "out", "release", "coverage", ".cache", ".tmp", "tmp"]);
const forbiddenSegments = new Set([
  ".agents",
  ".codex",
  "backfills",
  "browse-video-prompt-library",
  "comfyui-handoffs",
  "curate-trending-video-prompts",
  "draft",
  "drafts",
  "internal",
  "media-staging",
  "private",
  "staging"
]);
const forbiddenBasenames = new Set([
  ".env",
  "AGENTS.md",
  "cookies.txt",
  "roadmap.md"
].map((value) => value.toLowerCase()));
const textExtensions = new Set([".cjs", ".css", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".ps1", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);
const failures = [];
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = toPosix(path.relative(repoRoot, absolute));
    if (entry.isSymbolicLink()) {
      failures.push(`${relative}: symbolic links are not allowed in public release sources`);
      continue;
    }
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile()) files.push({ absolute, relative });
  }
}

walk(repoRoot);

for (const { absolute, relative } of files) {
  const segments = relative.split("/");
  if (segments.length === 1) {
    if (!allowedRootFiles.has(relative)) failures.push(`${relative}: root file is outside the public allowlist`);
  } else if (!allowedTopDirectories.has(segments[0])) {
    failures.push(`${relative}: top-level directory is outside the public allowlist`);
  }

  for (const segment of segments.slice(0, -1)) {
    if (forbiddenSegments.has(segment.toLowerCase())) failures.push(`${relative}: forbidden private/internal path segment '${segment}'`);
  }

  const basename = path.basename(relative);
  const lowerBasename = basename.toLowerCase();
  if (forbiddenBasenames.has(lowerBasename)) failures.push(`${relative}: forbidden private or local-state filename`);
  if (lowerBasename.startsWith(".env.") && lowerBasename !== ".env.example") failures.push(`${relative}: environment files must not be published`);
  if (/\.(?:har|p12|pem|pfx)$/i.test(lowerBasename)) failures.push(`${relative}: credentials/browser-state file type is forbidden`);
  if (/\.mp4$/i.test(lowerBasename)) failures.push(`${relative}: full MP4 files belong in versioned Release media packs, not Git history`);

  if (basename === "SKILL.md" && !/^skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/SKILL\.md$/.test(relative)) {
    failures.push(`${relative}: public SKILL.md is only allowed directly under skills/<skill-name>/`);
  }

  if (!textExtensions.has(path.extname(lowerBasename))) continue;
  const content = fs.readFileSync(absolute, "utf8");
  const checks = [
    [/(?:^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9]{30,}/, "GitHub token"],
    [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token"],
    [/AKIA[0-9A-Z]{16}/, "AWS access key"],
    [/xox[baprs]-[A-Za-z0-9-]{20,}/, "Slack token"],
    [/(?:^|[^A-Za-z0-9_])sk-[A-Za-z0-9_-]{20,}/, "API key"],
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
    [/\b[A-Za-z]:[\\/](?![<>])[^\r\n"']+/, "Windows absolute path"],
    [/(?:^|[\s"'=(])\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/[^\s"']*)?/, "user-home absolute path"],
    [/(?:^|[\s"'=(])\/root(?:\/[^\s"']*)?/, "root-home absolute path"],
    [/\\\\[A-Za-z0-9._-]+\\[A-Za-z0-9$._-]+/, "UNC absolute path"],
    [/file:\/\//i, "local file URL"]
  ];
  for (const [pattern, label] of checks) {
    if (pattern.test(content)) failures.push(`${relative}: possible ${label} found`);
  }

  const privateMarkers = [
    ["scheduler", "_api_authorized"].join(""),
    ["x", "-discover --authorize-api"].join(""),
    ["x", "-snapshot --authorize-api"].join("")
  ];
  for (const marker of privateMarkers) {
    if (content.includes(marker)) failures.push(`${relative}: private collection/automation marker '${marker}' found`);
  }
}

failWith("Public-boundary validation", [...new Set(failures)]);
if (!process.exitCode) console.log(`Public-boundary validation passed (${files.length} source files checked).`);
