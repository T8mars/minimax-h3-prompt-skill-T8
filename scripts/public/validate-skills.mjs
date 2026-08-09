import fs from "node:fs";
import path from "node:path";
import { failWith, listDirectories, repoRoot, toPosix } from "./lib.mjs";

const skillsRoot = path.join(repoRoot, "skills");
const failures = [];
const directories = listDirectories(skillsRoot);

if (!directories.length) failures.push("skills/: at least one installable public Skill is required");

function parseFrontmatter(content, relative) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0] !== "---") throw new Error(`${relative}: YAML frontmatter must start on the first line`);
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Error(`${relative}: YAML frontmatter closing delimiter is missing`);
  const frontmatterLines = lines.slice(1, end);
  const keys = [];
  const values = new Map();
  let activeKey = null;
  for (const line of frontmatterLines) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (match) {
      activeKey = match[1];
      keys.push(activeKey);
      values.set(activeKey, match[2] ?? "");
    } else if (/^\s+/.test(line) && activeKey) {
      values.set(activeKey, `${values.get(activeKey)} ${line.trim()}`.trim());
    } else {
      throw new Error(`${relative}: unsupported or malformed frontmatter line '${line}'`);
    }
  }
  const body = lines.slice(end + 1).join("\n").trim();
  return { keys, values, body };
}

for (const directory of directories) {
  const relativeBase = `skills/${directory}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(directory) || directory.length > 64) {
    failures.push(`${relativeBase}: directory name must be kebab-case and at most 64 characters`);
  }
  const skillPath = path.join(skillsRoot, directory, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    failures.push(`${relativeBase}/SKILL.md: missing`);
    continue;
  }

  for (const relative of ["references/summary.md", "references/template.md", "agents/openai.yaml"]) {
    const required = path.join(skillsRoot, directory, relative);
    if (!fs.existsSync(required) || fs.statSync(required).size === 0) failures.push(`${relativeBase}/${relative}: required non-empty file is missing`);
  }
  const agentPath = path.join(skillsRoot, directory, "agents", "openai.yaml");
  if (fs.existsSync(agentPath)) {
    const agent = fs.readFileSync(agentPath, "utf8");
    if (!agent.includes(`$${directory}`)) failures.push(`${relativeBase}/agents/openai.yaml: default_prompt must invoke $${directory}`);
  }
  try {
    const parsed = parseFrontmatter(fs.readFileSync(skillPath, "utf8"), `${relativeBase}/SKILL.md`);
    const uniqueKeys = [...new Set(parsed.keys)];
    if (uniqueKeys.length !== parsed.keys.length) failures.push(`${relativeBase}/SKILL.md: duplicate frontmatter key`);
    if (uniqueKeys.length !== 2 || !uniqueKeys.includes("name") || !uniqueKeys.includes("description")) {
      failures.push(`${relativeBase}/SKILL.md: frontmatter must contain only name and description`);
    }
    const name = String(parsed.values.get("name") ?? "").replace(/^['"]|['"]$/g, "").trim();
    const description = String(parsed.values.get("description") ?? "").replace(/^(?:>-?|\|-?)\s*/, "").replace(/^['"]|['"]$/g, "").trim();
    if (name !== directory) failures.push(`${relativeBase}/SKILL.md: name '${name}' must match directory '${directory}'`);
    if (!description || description.length < 20) failures.push(`${relativeBase}/SKILL.md: description must clearly explain purpose and trigger context`);
    if (!parsed.body) failures.push(`${relativeBase}/SKILL.md: instruction body is empty`);
  } catch (error) {
    failures.push(error.message);
  }

  const extras = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/^(?:README|CHANGELOG|INSTALLATION_GUIDE|QUICK_REFERENCE)\.md$/i.test(entry.name)) extras.push(toPosix(path.relative(repoRoot, absolute)));
    }
  }
  walk(path.join(skillsRoot, directory));
  for (const extra of extras) failures.push(`${extra}: auxiliary user documentation does not belong inside a Skill`);
}

failWith("Skill validation", failures);
if (!process.exitCode) console.log(`Skill validation passed (${directories.length} Skills).`);
