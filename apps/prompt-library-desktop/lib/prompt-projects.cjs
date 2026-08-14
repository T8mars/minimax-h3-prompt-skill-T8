const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const MAX_PROJECTS = 100;
const PROJECT_SCHEMA = "t8-prompt-project/v2";

function clean(value, limit = 200000) {
  return String(value || "").replace(/\r\n/gu, "\n").trim().slice(0, limit);
}

function safeFilename(value) {
  return clean(value, 80).replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "-").replace(/\s+/gu, " ").trim() || "T8-prompt-project";
}

function sanitizeVideoProject(input, { id = crypto.randomUUID(), now = new Date().toISOString() } = {}) {
  const receipt = input?.receipt && typeof input.receipt === "object" ? input.receipt : {};
  const validation = input?.validation && typeof input.validation === "object" ? input.validation : null;
  return {
    schemaVersion: PROJECT_SCHEMA,
    capability: "video_prompt",
    projectId: String(id),
    createdAt: clean(input?.createdAt || now, 64),
    updatedAt: now,
    title: clean(input?.title || input?.templateTitle || "T8 Prompt Project", 240),
    intent: clean(input?.intent, 12000),
    constraints: clean(input?.constraints, 12000),
    template: {
      id: clean(input?.templateId, 240),
      title: clean(input?.templateTitle, 500),
      hash: clean(input?.templateHash, 64)
    },
    target: clean(input?.target, 40),
    outputLanguage: input?.outputLanguage === "en" ? "en" : "zh-CN",
    durationSeconds: Number(input?.durationSeconds || 15),
    rewriteMode: clean(input?.rewriteMode, 40),
    provider: {
      id: clean(input?.providerId, 80),
      label: clean(input?.providerLabel, 160),
      endpointHost: clean(input?.endpointHost, 240),
      model: clean(input?.model, 160)
    },
    output: clean(input?.output, 200000),
    validation,
    receipt: {
      requestId: clean(receipt.requestId, 240) || null,
      usage: receipt.usage && typeof receipt.usage === "object" ? receipt.usage : null,
      attempts: Number(receipt.attempts || 0),
      mediaCount: Number(receipt.mediaCount || 0),
      mediaUploadCount: Number(receipt.mediaUploadCount || 0),
      durationMs: Number(receipt.durationMs || 0),
      outputSha256: clean(receipt.outputSha256, 64) || null
    },
    media: Array.isArray(input?.media) ? input.media.map((item) => ({
      name: clean(item?.name, 240),
      kind: item?.kind === "video" ? "video" : "image",
      mimeType: clean(item?.mimeType, 120),
      sizeBytes: Number(item?.sizeBytes || 0),
      sha256: clean(item?.sha256, 64),
      label: clean(item?.label, 80)
    })) : [],
    notes: clean(input?.notes, 12000)
  };
}

function sanitizeMusicProject(input, { id = crypto.randomUUID(), now = new Date().toISOString() } = {}) {
  const outputs = input?.outputs && typeof input.outputs === "object" ? input.outputs : {};
  const receipt = input?.receipt && typeof input.receipt === "object" ? input.receipt : {};
  return {
    schemaVersion: PROJECT_SCHEMA,
    capability: "music3",
    projectId: String(id),
    createdAt: clean(input?.createdAt || now, 64),
    updatedAt: now,
    title: clean(input?.title || input?.musicIdea || "T8 Music 3 Project", 240),
    musicIdea: clean(input?.musicIdea, 12000),
    inputLyrics: clean(input?.inputLyrics ?? input?.lyrics, 200000),
    lyricsMode: clean(input?.lyricsMode, 40),
    effectiveLyricsMode: clean(input?.effectiveLyricsMode, 40),
    lyricsLanguage: clean(input?.lyricsLanguage, 40),
    customLyricsLanguage: clean(input?.customLyricsLanguage, 120),
    targetDurationSeconds: Number(input?.targetDurationSeconds || 0),
    rewriteMode: clean(input?.rewriteMode, 40),
    qualityMode: clean(input?.qualityMode, 40),
    structurePreset: clean(input?.structurePreset, 40),
    customStructure: clean(input?.customStructure, 1000),
    lyricsEditRequest: clean(input?.lyricsEditRequest, 6000),
    constraints: clean(input?.constraints, 12000),
    fixedBpm: Number(input?.fixedBpm || 0),
    keyScale: clean(input?.keyScale, 120),
    meter: clean(input?.meter, 40),
    customMeter: clean(input?.customMeter, 80),
    captionLanguage: input?.captionLanguage === "en" ? "en" : "zh-CN",
    captionTargetWords: Number(input?.captionTargetWords || 0),
    lyricsEditScope: clean(input?.lyricsEditScope, 40),
    lyricsEditSection: clean(input?.lyricsEditSection, 40),
    lyricsEditOccurrence: Number(input?.lyricsEditOccurrence || 0),
    semanticProfileMode: clean(input?.semanticProfileMode, 40),
    manualLyricsProfile: clean(input?.manualLyricsProfile, 4000),
    stageCache: clean(input?.stageCache, 20),
    seed: Number(input?.seed || 0),
    provider: {
      id: clean(input?.providerId, 80),
      label: clean(input?.providerLabel, 160),
      endpointHost: clean(input?.endpointHost, 240),
      model: clean(input?.model, 160)
    },
    outputs: {
      lyrics: clean(outputs.lyrics, 200000),
      musicCaption: clean(outputs.musicCaption, 200000),
      music3PayloadJson: clean(outputs.music3PayloadJson, 400000),
      enhancementReportJson: clean(outputs.enhancementReportJson, 400000)
    },
    validation: input?.validation && typeof input.validation === "object" ? input.validation : null,
    receipt: {
      logicalRequestCount: Number(receipt.logicalRequestCount || 0),
      cacheHits: Number(receipt.cacheHits || 0),
      stages: Array.isArray(receipt.stages) ? receipt.stages.slice(0, 20) : [],
      outputHashes: receipt.outputHashes && typeof receipt.outputHashes === "object" ? receipt.outputHashes : {}
    },
    notes: clean(input?.notes, 12000)
  };
}

function sanitizeProject(input, options = {}) {
  return input?.capability === "music3" ? sanitizeMusicProject(input, options) : sanitizeVideoProject({ ...input, capability: "video_prompt" }, options);
}
function projectMarkdown(project) {
  if (project.capability === "music3") {
    return [
      `# ${project.title}`, "", "- Capability: MiniMax Music 3",
      `- Provider: ${project.provider.label} / ${project.provider.model}`,
      `- Lyrics mode: ${project.effectiveLyricsMode}`,
      `- Caption language: ${project.captionLanguage}`,
      `- Validation: ${project.validation?.status || "not recorded"}`, "",
      "## Music idea", "", project.musicIdea, "",
      "## Lyrics", "", "```text", project.outputs.lyrics, "```", "",
      "## Structured caption", "", "```text", project.outputs.musicCaption, "```", "",
      "## Music 3 payload", "", "```json", project.outputs.music3PayloadJson, "```", "",
      "## Enhancement report", "", "```json", project.outputs.enhancementReportJson, "```", "",
      "## Notes", "", project.notes || "None", ""
    ].join("\n");
  }
  const validation = project.validation?.status || "not recorded";
  return [
    `# ${project.title}`,
    "",
    `- Template: ${project.template.title} (${project.template.id})`,
    `- Target: ${project.target}`,
    `- Output language: ${project.outputLanguage}`,
    `- Provider: ${project.provider.label} / ${project.provider.model}`,
    `- Duration: ${project.durationSeconds}s`,
    `- Validation: ${validation}`,
    `- Output SHA-256: ${project.receipt.outputSha256 || "unknown"}`,
    "",
    "## Intent",
    "",
    project.intent,
    "",
    "## Constraints",
    "",
    project.constraints || "None",
    "",
    "## Enhanced prompt",
    "",
    "```text",
    project.output,
    "```",
    "",
    "## Notes",
    "",
    project.notes || "None",
    ""
  ].join("\n");
}

class PromptProjectStore {
  constructor({ userDataDir, randomUUID = crypto.randomUUID, now = () => new Date().toISOString() }) {
    this.filePath = path.join(userDataDir, "prompt-projects.json");
    this.randomUUID = randomUUID;
    this.now = now;
  }

  readAll() {
    try {
      const data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      return Array.isArray(data?.projects) ? data.projects : [];
    } catch {
      return [];
    }
  }

  writeAll(projects) {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temp = `${this.filePath}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify({ schemaVersion: "t8-prompt-project-store/v1", projects }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temp, this.filePath);
  }

  list() {
    return this.readAll().map((project) => ({
      projectId: project.projectId,
      capability: project.capability || "video_prompt",
      title: project.title,
      updatedAt: project.updatedAt,
      templateTitle: project.template?.title,
      target: project.target,
      providerLabel: project.provider?.label,
      validationStatus: project.validation?.status || null
    }));
  }

  get(projectId) {
    return this.readAll().find((project) => project.projectId === String(projectId || "")) || null;
  }

  save(input) {
    const projects = this.readAll();
    const current = input?.projectId ? projects.find((project) => project.projectId === input.projectId) : null;
    const project = sanitizeProject({ ...current, ...input }, {
      id: current?.projectId || this.randomUUID(),
      now: this.now()
    });
    const remaining = projects.filter((item) => item.projectId !== project.projectId);
    this.writeAll([project, ...remaining].slice(0, MAX_PROJECTS));
    return project;
  }

  remove(projectId) {
    const projects = this.readAll();
    const next = projects.filter((project) => project.projectId !== String(projectId || ""));
    if (next.length !== projects.length) this.writeAll(next);
    return this.list();
  }

  exportBundle(project) {
    if (!project) throw new Error("Prompt project not found.");
    return {
      filename: safeFilename(project.title),
      json: `${JSON.stringify(project, null, 2)}\n`,
      markdown: projectMarkdown(project)
    };
  }
}

module.exports = { MAX_PROJECTS, PROJECT_SCHEMA, PromptProjectStore, projectMarkdown, safeFilename, sanitizeProject };
