const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { normalizeCreativePlan } = require("./creative-plan.cjs");

const MAX_PROJECTS = 100;
const PROJECT_SCHEMA = "t8-prompt-project/v4";
const REVISION_STATUSES = new Set(["draft", "accepted", "accepted_with_override", "rejected"]);
const REVISION_SOURCES = new Set(["initial", "manual", "repair", "variant"]);
const PROJECT_STAGES = new Set(["idea", "ready", "generated", "review", "repair", "accepted", "archived"]);

function clean(value, limit = 200000) {
  return String(value || "").replace(/\r\n/gu, "\n").trim().slice(0, limit);
}

function safeFilename(value) {
  return clean(value, 80).replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "-").replace(/\s+/gu, " ").trim() || "T8-prompt-project";
}

function outputHash(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function safeObject(value, fallback = null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  return JSON.parse(JSON.stringify(value));
}

function sanitizeRevision(input, { now = new Date().toISOString(), fallbackSource = "manual", fallbackValidation = null } = {}) {
  const output = clean(input?.output, 200000);
  if (!output) return null;
  const sha256 = outputHash(output);
  return {
    revisionId: clean(input?.revisionId, 120) || `revision-${sha256.slice(0, 16)}`,
    parentRevisionId: clean(input?.parentRevisionId, 120) || null,
    rootRevisionId: clean(input?.rootRevisionId, 120) || clean(input?.revisionId, 120) || `revision-${sha256.slice(0, 16)}`,
    repairOfRevisionId: clean(input?.repairOfRevisionId, 120) || null,
    source: REVISION_SOURCES.has(input?.source) ? input.source : fallbackSource,
    createdAt: clean(input?.createdAt || now, 64),
    output,
    outputSha256: sha256,
    validation: input?.validation && typeof input.validation === "object" ? input.validation : fallbackValidation,
    status: REVISION_STATUSES.has(input?.status) ? input.status : "draft",
    note: clean(input?.note, 4000),
    variant: input?.variant && typeof input.variant === "object" ? {
      label: clean(input.variant.label, 120),
      axis: clean(input.variant.axis, 1000)
    } : null
  };
}

function sanitizeVideoProject(input, { id = crypto.randomUUID(), now = new Date().toISOString() } = {}) {
  const receipt = input?.receipt && typeof input.receipt === "object" ? input.receipt : {};
  const validation = input?.validation && typeof input.validation === "object" ? input.validation : null;
  const durationSeconds = Number(input?.durationSeconds || 15);
  const media = Array.isArray(input?.media) ? input.media.map((item) => ({
    name: clean(item?.name, 240),
    kind: item?.kind === "video" ? "video" : "image",
    mimeType: clean(item?.mimeType, 120),
    sizeBytes: Number(item?.sizeBytes || 0),
    sha256: clean(item?.sha256, 64),
    label: clean(item?.label, 80),
    mediaId: clean(item?.mediaId, 120)
  })) : [];
  const revisions = (Array.isArray(input?.revisions) ? input.revisions : []).map((item) => sanitizeRevision(item, { now, fallbackValidation: validation })).filter(Boolean);
  if (!revisions.length && clean(input?.output, 200000)) {
    revisions.push(sanitizeRevision({
      output: input.output,
      source: "initial",
      validation,
      createdAt: input.createdAt || now,
      status: REVISION_STATUSES.has(input?.acceptanceStatus) ? input.acceptanceStatus : "draft"
    }, { now, fallbackSource: "initial", fallbackValidation: validation }));
  }
  const requestedRevision = clean(input?.selectedRevisionId, 120);
  const selectedRevision = revisions.find((item) => item.revisionId === requestedRevision) || revisions[0] || null;
  for (const revision of revisions) {
    if (!revision.rootRevisionId) revision.rootRevisionId = revision.parentRevisionId || revision.revisionId;
  }
  let creativePlan;
  try {
    creativePlan = normalizeCreativePlan({
      durationSeconds,
      intent: input?.intent,
      media,
      shots: input?.creativePlan?.shots || input?.shots,
      mediaAssignments: input?.creativePlan?.mediaAssignments || input?.mediaAssignments,
      continuityLocks: input?.creativePlan?.continuityLocks || input?.continuityLocks
    });
  } catch {
    creativePlan = normalizeCreativePlan({ durationSeconds, intent: input?.intent, media });
  }
  return {
    schemaVersion: PROJECT_SCHEMA,
    capability: "video_prompt",
    projectId: String(id),
    createdAt: clean(input?.createdAt || now, 64),
    updatedAt: now,
    title: clean(input?.title || input?.templateTitle || "T8 Prompt Project", 240),
    topic: clean(input?.topic || "general", 120),
    intent: clean(input?.intent, 12000),
    constraints: clean(input?.constraints, 12000),
    template: {
      id: clean(input?.templateId ?? input?.template?.id, 240),
      title: clean(input?.templateTitle ?? input?.template?.title, 500),
      hash: clean(input?.templateHash ?? input?.template?.hash, 64)
    },
    templateSnapshot: safeObject(input?.templateSnapshot, null),
    target: clean(input?.target, 40),
    outputLanguage: input?.outputLanguage === "en" ? "en" : "zh-CN",
    durationSeconds,
    rewriteMode: clean(input?.rewriteMode, 40),
    creativePlan,
    provider: {
      id: clean(input?.providerId ?? input?.provider?.id, 80),
      label: clean(input?.providerLabel ?? input?.provider?.label, 160),
      endpointHost: clean(input?.endpointHost ?? input?.provider?.endpointHost, 240),
      model: clean(input?.model ?? input?.provider?.model, 160)
    },
    output: selectedRevision?.output || clean(input?.output, 200000),
    validation: selectedRevision?.validation || validation,
    revisions,
    selectedRevisionId: selectedRevision?.revisionId || null,
    acceptanceStatus: selectedRevision?.status || "draft",
    stage: PROJECT_STAGES.has(input?.stage) ? input.stage : selectedRevision?.status === "accepted" || selectedRevision?.status === "accepted_with_override" ? "accepted" : revisions.length ? "generated" : "idea",
    receipt: {
      requestId: clean(receipt.requestId, 240) || null,
      usage: receipt.usage && typeof receipt.usage === "object" ? receipt.usage : null,
      attempts: Number(receipt.attempts || 0),
      mediaCount: Number(receipt.mediaCount || 0),
      mediaUploadCount: Number(receipt.mediaUploadCount || 0),
      durationMs: Number(receipt.durationMs || 0),
      outputSha256: clean(receipt.outputSha256, 64) || null
    },
    media,
    resultMedia: Array.isArray(input?.resultMedia) ? input.resultMedia.slice(0, 20).map((item) => ({
      schemaVersion: "t8-project-media/v1",
      mediaId: clean(item?.mediaId, 120),
      role: item?.role === "generated_result" ? "generated_result" : "generated_result",
      originalName: clean(item?.originalName, 240),
      mimeType: clean(item?.mimeType, 120),
      extension: clean(item?.extension, 20),
      sizeBytes: Number(item?.sizeBytes || 0),
      sha256: clean(item?.sha256, 64),
      importedAt: clean(item?.importedAt, 64)
    })).filter((item) => item.mediaId && item.sha256) : [],
    resultReview: safeObject(input?.resultReview, null),
    bridges: Array.isArray(input?.bridges) ? input.bridges.slice(0, 100).map((item) => safeObject(item, {})) : [],
    composition: safeObject(input?.composition, null),
    ratings: safeObject(input?.ratings, {}),
    failureTags: Array.isArray(input?.failureTags) ? [...new Set(input.failureTags.map((item) => clean(item, 120)).filter(Boolean))].slice(0, 100) : [],
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
      id: clean(input?.providerId ?? input?.provider?.id, 80),
      label: clean(input?.providerLabel ?? input?.provider?.label, 160),
      endpointHost: clean(input?.endpointHost ?? input?.provider?.endpointHost, 240),
      model: clean(input?.model ?? input?.provider?.model, 160)
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
  const selectedRevision = project.revisions?.find((item) => item.revisionId === project.selectedRevisionId) || project.revisions?.[0] || null;
  return [
    `# ${project.title}`,
    "",
    `- Template: ${project.template.title} (${project.template.id})`,
    `- Target: ${project.target}`,
    `- Output language: ${project.outputLanguage}`,
    `- Provider: ${project.provider.label} / ${project.provider.model}`,
    `- Duration: ${project.durationSeconds}s`,
    `- Validation: ${validation}`,
    `- Revision: ${selectedRevision?.revisionId || "legacy"} / ${selectedRevision?.source || "initial"}`,
    `- Acceptance: ${selectedRevision?.status || project.acceptanceStatus || "draft"}`,
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
    selectedRevision?.output || project.output,
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
      return (Array.isArray(data?.projects) ? data.projects : []).map((project) => sanitizeProject(project, {
        id: clean(project?.projectId, 120) || this.randomUUID(),
        now: clean(project?.updatedAt || project?.createdAt, 64) || this.now()
      }));
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
      topic: project.topic || "general",
      updatedAt: project.updatedAt,
      templateTitle: project.template?.title,
      target: project.target,
      providerLabel: project.provider?.label,
      validationStatus: project.validation?.status || null,
      stage: project.stage || (project.capability === "music3" ? "generated" : "idea"),
      revisionCount: Array.isArray(project.revisions) ? project.revisions.length : 0,
      acceptanceStatus: project.acceptanceStatus || null
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

  addRevision(projectId, input = {}) {
    const current = this.get(projectId);
    if (!current || current.capability === "music3") throw new Error("Video prompt project not found.");
    const revision = sanitizeRevision(input, { now: this.now(), fallbackValidation: input.validation || null });
    if (!revision) throw new Error("Revision output is required.");
    if (current.revisions?.some((item) => item.revisionId === revision.revisionId)) {
      revision.revisionId = `${revision.revisionId}-${this.randomUUID().slice(0, 8)}`;
    }
    const parent = (current.revisions || []).find((item) => item.revisionId === revision.parentRevisionId) || null;
    revision.rootRevisionId = clean(input.rootRevisionId, 120) || parent?.rootRevisionId || parent?.revisionId || revision.revisionId;
    if (revision.source === "repair") {
      revision.repairOfRevisionId = clean(input.repairOfRevisionId, 120) || parent?.revisionId || null;
      if (!revision.repairOfRevisionId) throw new Error("Repair revisions require a source revision.");
      if (!this.canRepair(projectId, revision.rootRevisionId)) throw new Error("This initial revision already used its one allowed repair.");
    }
    return this.save({
      ...current,
      revisions: [revision, ...(current.revisions || [])],
      selectedRevisionId: revision.revisionId,
      output: revision.output,
      validation: revision.validation,
      acceptanceStatus: revision.status,
      stage: revision.source === "repair" ? "repair" : "review"
    });
  }

  setRevisionStatus(projectId, revisionId, status, note = "") {
    if (!REVISION_STATUSES.has(status)) throw new Error("Invalid revision status.");
    const current = this.get(projectId);
    if (!current || current.capability === "music3") throw new Error("Video prompt project not found.");
    let found = false;
    const revisions = (current.revisions || []).map((item) => {
      if (item.revisionId !== revisionId) return item;
      found = true;
      return { ...item, status, note: clean(note || item.note, 4000) };
    });
    if (!found) throw new Error("Revision not found.");
    return this.save({
      ...current,
      revisions,
      selectedRevisionId: revisionId,
      acceptanceStatus: status,
      stage: status === "accepted" || status === "accepted_with_override" ? "accepted" : status === "rejected" ? "repair" : "review"
    });
  }

  canRepair(projectId, rootRevisionId) {
    const current = this.get(projectId);
    if (!current || current.capability === "music3") return false;
    const root = clean(rootRevisionId, 120);
    if (!root) return false;
    return !(current.revisions || []).some((item) => item.source === "repair" && (item.rootRevisionId === root || item.repairOfRevisionId === root));
  }

  saveReview(projectId, { resultMedia, review }) {
    const current = this.get(projectId);
    if (!current || current.capability === "music3") throw new Error("Video prompt project not found.");
    const failureTags = Array.isArray(review?.failures) ? [...new Set(review.failures.map((item) => clean(item?.dimension, 120)).filter(Boolean))] : [];
    return this.save({ ...current, resultMedia: resultMedia || current.resultMedia, resultReview: review, failureTags, stage: review?.status === "needs_repair" ? "repair" : "review" });
  }

  saveBridge(projectId, bridge) {
    const current = this.get(projectId);
    if (!current) throw new Error("Prompt project not found.");
    const value = safeObject(bridge, null);
    if (!value?.bridgeHash) throw new Error("A hash-bound bridge is required.");
    const bridges = [value, ...(current.bridges || []).filter((item) => item.bridgeHash !== value.bridgeHash)].slice(0, 100);
    return this.save({ ...current, bridges });
  }

  saveRating(projectId, revisionId, rating = {}) {
    const current = this.get(projectId);
    if (!current || current.capability === "music3") throw new Error("Video prompt project not found.");
    if (!(current.revisions || []).some((item) => item.revisionId === revisionId)) throw new Error("Revision not found.");
    const normalized = {
      overall: Math.max(0, Math.min(5, Number(rating.overall || 0))),
      hook: Math.max(0, Math.min(5, Number(rating.hook || 0))),
      pacing: Math.max(0, Math.min(5, Number(rating.pacing || 0))),
      fidelity: Math.max(0, Math.min(5, Number(rating.fidelity || 0))),
      note: clean(rating.note, 2000),
      ratedAt: this.now()
    };
    return this.save({ ...current, ratings: { ...(current.ratings || {}), [revisionId]: normalized } });
  }

  setStage(projectId, stage) {
    if (!PROJECT_STAGES.has(stage)) throw new Error("Invalid project stage.");
    const current = this.get(projectId);
    if (!current) throw new Error("Prompt project not found.");
    return this.save({ ...current, stage });
  }

  board(filters = {}) {
    const stages = new Set(Array.isArray(filters.stages) ? filters.stages.filter((item) => PROJECT_STAGES.has(item)) : []);
    const target = clean(filters.target, 40);
    const templateId = clean(filters.templateId, 240);
    const failureTag = clean(filters.failureTag, 120);
    const sort = filters.sort === "oldest" ? "oldest" : "newest";
    return this.list().filter((item) => !stages.size || stages.has(item.stage)).filter((item) => !target || item.target === target).filter((item) => !templateId || this.get(item.projectId)?.template?.id === templateId).filter((item) => !failureTag || (this.get(item.projectId)?.failureTags || []).includes(failureTag)).sort((left, right) => sort === "oldest" ? String(left.updatedAt).localeCompare(String(right.updatedAt)) : String(right.updatedAt).localeCompare(String(left.updatedAt)));
  }

  effectStats(filters = {}) {
    const projects = this.readAll().filter((item) => item.capability !== "music3");
    const rows = new Map();
    for (const project of projects) {
      const revision = (project.revisions || []).find((item) => item.revisionId === project.selectedRevisionId) || project.revisions?.[0];
      if (!revision) continue;
      const keyParts = [project.template?.hash || "unknown", project.target || "unknown", String(project.durationSeconds || 0), project.provider?.id || "unknown", project.topic || "general"];
      const key = keyParts.join("|");
      const row = rows.get(key) || { key, templateHash: keyParts[0], target: keyParts[1], durationSeconds: Number(keyParts[2]), providerId: keyParts[3], topic: keyParts[4], denominator: 0, accepted: 0, rejected: 0, needsRepair: 0, ratingCount: 0, ratingTotal: 0, failureTags: {} };
      row.denominator += 1;
      if (["accepted", "accepted_with_override"].includes(revision.status)) row.accepted += 1;
      if (revision.status === "rejected") row.rejected += 1;
      if (project.resultReview?.status === "needs_repair") row.needsRepair += 1;
      const rating = project.ratings?.[revision.revisionId]?.overall;
      if (Number(rating) > 0) { row.ratingCount += 1; row.ratingTotal += Number(rating); }
      for (const tag of project.failureTags || []) row.failureTags[tag] = (row.failureTags[tag] || 0) + 1;
      rows.set(key, row);
    }
    return [...rows.values()].map((row) => ({ ...row, averageRating: row.ratingCount ? Math.round((row.ratingTotal / row.ratingCount) * 100) / 100 : null, successRate: row.denominator ? Math.round((row.accepted / row.denominator) * 1000) / 1000 : null })).sort((left, right) => right.denominator - left.denominator || left.key.localeCompare(right.key));
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

module.exports = {
  MAX_PROJECTS,
  PROJECT_SCHEMA,
  PROJECT_STAGES,
  PromptProjectStore,
  REVISION_SOURCES,
  REVISION_STATUSES,
  outputHash,
  projectMarkdown,
  safeFilename,
  sanitizeProject,
  sanitizeRevision
};
