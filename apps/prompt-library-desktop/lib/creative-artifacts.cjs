const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SECRET_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{12,}|Bearer\s+[A-Za-z0-9._-]{12,}|api[_-]?key\s*[:=]\s*\S+)/iu;
const WINDOWS_ABSOLUTE = /(?:^|[\s"'`(])(?:[A-Za-z]:[\\/]|\\\\)/u;
const POSIX_ABSOLUTE = /(?:^|[\s"'`(])\/(?:Users|home|root|var|tmp|opt|mnt|Volumes)\//u;

function clean(value, limit = 200000) {
  return String(value || "").replace(/\r\n/gu, "\n").trim().slice(0, limit);
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function safeName(value, fallback = "T8-artifact") {
  return clean(value, 100).replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "-").replace(/\s+/gu, " ").trim() || fallback;
}

function textList(value, limit = 1000) {
  const values = Array.isArray(value) ? value : value === null || value === undefined || value === "" ? [] : [value];
  return values.map((item) => clean(item, limit)).filter(Boolean);
}

function coverageText(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return value?.ratio ?? value?.coverage ?? "unknown";
}

function selectedRevision(project, revisionId) {
  return (project?.revisions || []).find((item) => item.revisionId === revisionId)
    || (project?.revisions || []).find((item) => item.revisionId === project?.selectedRevisionId)
    || project?.revisions?.[0]
    || null;
}

function assertAccepted(project, revisionId) {
  const revision = selectedRevision(project, revisionId);
  if (!revision) throw new Error("A project revision is required.");
  if (!["accepted", "accepted_with_override"].includes(revision.status)) throw new Error("Only an accepted revision can be exported as a formal artifact.");
  return revision;
}

function assertPortableText(value, label) {
  const text = String(value || "");
  if (SECRET_PATTERN.test(text)) throw new Error(`${label} contains a credential-like secret.`);
  if (WINDOWS_ABSOLUTE.test(text) || POSIX_ABSOLUTE.test(text)) throw new Error(`${label} contains an absolute local path.`);
  return text;
}

function writeFilesAtomically(parentDirectory, directoryName, files) {
  const root = path.resolve(parentDirectory);
  fs.mkdirSync(root, { recursive: true });
  const finalDirectory = path.join(root, safeName(directoryName));
  if (fs.existsSync(finalDirectory)) throw new Error("The destination artifact directory already exists.");
  const temporary = `${finalDirectory}.tmp-${crypto.randomUUID().slice(0, 8)}`;
  fs.mkdirSync(temporary, { recursive: false });
  try {
    for (const [relativePath, content] of Object.entries(files)) {
      if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/u).includes("..")) throw new Error("Artifact file path is unsafe.");
      assertPortableText(content, relativePath);
      const destination = path.join(temporary, relativePath);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, String(content), { encoding: "utf8", mode: 0o600 });
    }
    fs.renameSync(temporary, finalDirectory);
    return finalDirectory;
  } catch (error) {
    fs.rmSync(temporary, { recursive: true, force: true });
    throw error;
  }
}

function markdownValidation(project, revision) {
  const report = revision.validation || project.validation || {};
  const failures = project.resultReview?.failures || [];
  return [
    "# Validation report",
    "",
    `- Static status: ${report.status || "not recorded"}`,
    `- Acceptance: ${revision.status}`,
    `- Output SHA-256: ${revision.outputSha256 || hash(revision.output)}`,
    `- Shot coverage: ${coverageText(report.shotCoverage)}`,
    `- Continuity coverage: ${coverageText(report.continuityCoverage)}`,
    `- Human review failures: ${failures.length}`,
    "",
    failures.length ? "## Human-marked failures" : "## Human review",
    "",
    ...(failures.length ? failures.map((item) => `- ${item.dimension} @ ${item.timeSeconds}s: ${item.reason}`) : ["No unresolved human-marked failure was stored for this revision."]),
    revision.status === "accepted_with_override" ? "\n## Acceptance override\n\n" + (revision.note || "Accepted with an operator override.") : ""
  ].join("\n");
}

function handoffFiles(project, revision, { includeAdapter = true } = {}) {
  const plan = project.creativePlan || { shots: [], mediaAssignments: [], continuityLocks: [] };
  const manifest = {
    schemaVersion: "t8-comfyui-handoff/v1",
    projectId: project.projectId,
    title: project.title,
    target: project.target,
    durationSeconds: project.durationSeconds,
    template: project.template,
    revision: {
      revisionId: revision.revisionId,
      source: revision.source,
      status: revision.status,
      outputSha256: revision.outputSha256 || hash(revision.output)
    },
    directFinal: true,
    execute: false,
    queue: false,
    credentialsIncluded: false,
    absolutePathsIncluded: false,
    files: ["manifest.json", "prompt.md", "creative-plan.json", "media-roles.json", "validation-report.md", "README.md", ...(includeAdapter ? ["comfyui-adapter.json"] : [])]
  };
  const files = {
    "manifest.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "prompt.md": `# ${project.title}\n\n- Target: ${project.target}\n- Duration: ${project.durationSeconds}s\n- Revision: ${revision.revisionId}\n\n## Direct-final prompt\n\n\`\`\`text\n${revision.output}\n\`\`\`\n`,
    "creative-plan.json": `${JSON.stringify({ schemaVersion: "t8-creative-plan-handoff/v1", durationSeconds: project.durationSeconds, shots: plan.shots || [], continuityLocks: plan.continuityLocks || [] }, null, 2)}\n`,
    "media-roles.json": `${JSON.stringify({ schemaVersion: "t8-media-roles/v1", media: project.media || [], assignments: plan.mediaAssignments || [] }, null, 2)}\n`,
    "validation-report.md": `${markdownValidation(project, revision)}\n`,
    "README.md": [
      `# ${project.title} — ComfyUI handoff`, "",
      "This directory is one isolated handoff. It contains no API key, no absolute local path, no workflow queue instruction, and no automatic execution flag.",
      "Use `prompt.md` as the accepted direct-final prompt. `creative-plan.json` and `media-roles.json` preserve timing, continuity and reference responsibilities.",
      "`comfyui-adapter.json` is field naming guidance only; it is not a ComfyUI workflow and must not be queued automatically.", ""
    ].join("\n")
  };
  if (includeAdapter) {
    files["comfyui-adapter.json"] = `${JSON.stringify({
      schemaVersion: "t8-comfyui-node-adapter/v1",
      nodeContract: "comfyui-minimax-h3-prompt-enhancer-T8",
      fields: {
        prompt: "prompt.md#Direct-final prompt",
        target_model: project.target,
        duration_seconds: project.durationSeconds,
        direct_final: true,
        bypass_enhancer: true
      },
      isWorkflow: false,
      autoExecute: false
    }, null, 2)}\n`;
  }
  return files;
}

function exportHandoff({ project, revisionId, parentDirectory, now = new Date() }) {
  const revision = assertAccepted(project, revisionId);
  const timestamp = now.toISOString().replace(/[:.]/gu, "-");
  const directoryName = `${timestamp}-${safeName(project.title, "T8-handoff")}-${revision.revisionId.slice(0, 20)}`;
  const directory = writeFilesAtomically(parentDirectory, directoryName, handoffFiles(project, revision));
  return { saved: true, directory, directoryName, files: Object.keys(handoffFiles(project, revision)) };
}

function skillDraft(project, revision) {
  const plan = project.creativePlan || { shots: [], continuityLocks: [], mediaAssignments: [] };
  const mechanism = clean(project.templateSnapshot?.creativeDna?.mechanism || project.templateSnapshot?.summary || plan.shots.map((shot) => shot.stateChange || shot.action).filter(Boolean).join(" → "), 12000);
  const invariants = (plan.continuityLocks || []).flatMap((lock) => textList(lock.invariants).map((item) => `${lock.name || lock.entityId}: ${item}`));
  const variables = (plan.mediaAssignments || []).map((item) => `${item.role}: ${item.notes || "replace with a new source-bound creative value"}`);
  const antiCopy = textList(project.templateSnapshot?.creativeDna?.anti_copy_exclusions);
  if (!antiCopy.length) antiCopy.push("Do not reuse source identities, brands, wardrobe, dialogue, signage, or exact shot surfaces.");
  const failures = (project.resultReview?.failures || []).map((item) => item.reason);
  const slug = safeName(project.title, "personal-skill").toLocaleLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 60) || `t8-personal-${project.projectId.slice(0, 8)}`;
  const frontmatter = ["---", `name: ${slug}`, `description: Reuse the accepted ${safeName(project.title)} mechanism while preserving its causal anchors and anti-copy boundaries.`, "---"].join("\n");
  const skill = [
    frontmatter, "", `# ${project.title}`, "",
    "## When to use", "", "Use this Skill when a new idea benefits from the same causal mechanism, timing discipline and continuity contract, while all source-specific surfaces are replaced.", "",
    "## Reusable mechanism", "", mechanism || "Preserve the accepted shot order, state changes and final payoff from the frozen project plan.", "",
    "## Invariants", "", ...(invariants.length ? invariants.map((item) => `- ${item}`) : ["- Preserve the accepted causal order, duration and hard user facts."]), "",
    "## Variable slots", "", ...(variables.length ? variables.map((item) => `- ${item}`) : ["- subject", "- setting", "- appearance system", "- sound family"]), "",
    "## Anti-copy exclusions", "", ...(antiCopy.map((item) => `- ${clean(item, 1000)}`)), "",
    "## Known failure modes", "", ...(failures.length ? failures.map((item) => `- ${item}`) : ["- Identity drift", "- Broken causal order", "- Unsupported or unreadable on-screen text", "- Unmotivated camera motion"]), "",
    "## Workflow", "", "1. Replace every variable slot with a new, original value.", "2. Build a complete shot plan and continuity locks.", "3. Compile for MiniMax H3 or Seedance 2.0 without mixing their surface syntax.", "4. Validate timing, anchors and anti-copy distance before generation.", ""
  ].join("\n");
  const transferTests = [
    "# Transfer tests", "",
    "## Test A — subject and setting transfer", "", "Replace the subject, setting, palette and props while preserving the exact causal ladder, duration and payoff. Pass only when no source identity or surface detail remains.", "",
    "## Test B — genre and sound transfer", "", "Move the mechanism into a materially different genre and sound family. Preserve event order and continuity locks, but change transition carriers, performance style and audiovisual texture.", ""
  ].join("\n");
  const acceptedTarget = project.target === "seedance20" ? "seedance-2.0.md" : "minimax-h3.md";
  const companionTarget = project.target === "seedance20" ? "minimax-h3.md" : "seedance-2.0.md";
  const files = {
    "SKILL.md": `${skill}\n`,
    "references/creative-dna.json": `${JSON.stringify({ schemaVersion: "t8-personal-creative-dna/v1", mechanism, invariants, variableSlots: variables, antiCopyExclusions: antiCopy, failureModes: failures }, null, 2)}\n`,
    "references/transfer-tests.md": `${transferTests}\n`,
    [`prompts/${acceptedTarget}`]: `# Accepted ${project.target} template\n\n\`\`\`text\n${revision.output}\n\`\`\`\n`,
    [`prompts/${companionTarget}`]: `# Companion compiler contract\n\nCompile the mechanism in ../references/creative-dna.json for ${project.target === "seedance20" ? "MiniMax H3" : "Seedance 2.0"}. Preserve the frozen duration, shot timing, invariants and anti-copy exclusions. Use the target model's native surface syntax; do not translate the accepted prompt line-by-line.\n`,
    "manifest.json": `${JSON.stringify({ schemaVersion: "t8-personal-skill-draft/v1", id: slug, sourceProjectId: project.projectId, sourceRevisionId: revision.revisionId, sourceOutputSha256: revision.outputSha256, status: "draft", publicCatalog: false, canonicalOverwrite: false }, null, 2)}\n`
  };
  return { slug, files };
}

function validateSkillFiles(files) {
  const required = ["SKILL.md", "references/creative-dna.json", "references/transfer-tests.md", "prompts/minimax-h3.md", "prompts/seedance-2.0.md", "manifest.json"];
  const errors = required.filter((name) => !files[name]).map((name) => `Missing ${name}`);
  const skill = files["SKILL.md"] || "";
  if (!/^---\nname:\s*[a-z0-9-]+\ndescription:\s*.+\n---/u.test(skill)) errors.push("SKILL.md frontmatter is invalid.");
  for (const [name, content] of Object.entries(files)) {
    try { assertPortableText(content, name); }
    catch (error) { errors.push(error.message); }
  }
  try { JSON.parse(files["manifest.json"] || ""); }
  catch { errors.push("manifest.json is invalid JSON."); }
  try { JSON.parse(files["references/creative-dna.json"] || ""); }
  catch { errors.push("creative-dna.json is invalid JSON."); }
  return { status: errors.length ? "fail" : "pass", errors };
}

function exportPersonalSkill({ project, revisionId, parentDirectory }) {
  const revision = assertAccepted(project, revisionId);
  const draft = skillDraft(project, revision);
  const validation = validateSkillFiles(draft.files);
  if (validation.status !== "pass") throw new Error(validation.errors.join(" "));
  const directory = writeFilesAtomically(parentDirectory, draft.slug, draft.files);
  return { saved: true, directory, directoryName: draft.slug, files: Object.keys(draft.files), validation };
}

module.exports = {
  SECRET_PATTERN,
  assertAccepted,
  assertPortableText,
  exportHandoff,
  exportPersonalSkill,
  handoffFiles,
  safeName,
  selectedRevision,
  skillDraft,
  validateSkillFiles,
  writeFilesAtomically
};
