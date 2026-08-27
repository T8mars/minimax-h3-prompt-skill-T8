const crypto = require("node:crypto");

const REVIEW_DIMENSIONS = Object.freeze([
  "identity_continuity",
  "causal_order",
  "action_physics",
  "camera",
  "onscreen_text",
  "sound",
  "dialogue",
  "audio_sync"
]);
const OBSERVATION_STATUSES = Object.freeze(["visible", "audible", "missing", "wrong_order", "indeterminate"]);
const VARIANT_STYLES = Object.freeze({
  conservative: Object.freeze({
    label: "保守变体",
    axes: ["措辞清晰度", "镜头可执行性", "连续性冗余"],
    instruction: "Keep the existing causal structure and every hard fact. Make only conservative changes that improve executability, timing clarity, and continuity."
  }),
  director: Object.freeze({
    label: "导演变体",
    axes: ["运镜设计", "节奏对比", "表演调度"],
    instruction: "Keep every hard fact and causal anchor, but redesign camera choreography, rhythm contrast, and performance blocking as a distinct director treatment."
  }),
  surprise: Object.freeze({
    label: "惊喜变体",
    axes: ["钩子", "转场载体", "结尾回收"],
    instruction: "Keep every hard fact and causal anchor, but introduce one surprising yet causally justified hook, transition carrier, and ending callback. Do not add unrelated spectacle."
  })
});

function clean(value, limit = 12000) {
  return String(value || "").replace(/\r\n/gu, "\n").trim().slice(0, limit);
}

function hash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

function clampTime(value, durationSeconds) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > durationSeconds) return null;
  return Math.round(number * 1000) / 1000;
}

function normalizeReview(input = {}) {
  const durationSeconds = Number(input.durationSeconds || 0);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error("A positive project duration is required for result review.");
  const shotIds = new Set((Array.isArray(input.shots) ? input.shots : []).map((shot) => clean(shot?.shotId, 120)).filter(Boolean));
  const observations = (Array.isArray(input.observations) ? input.observations : []).slice(0, 1000).map((item, index) => {
    const dimension = REVIEW_DIMENSIONS.includes(item?.dimension) ? item.dimension : null;
    const status = OBSERVATION_STATUSES.includes(item?.status) ? item.status : null;
    const timeSeconds = clampTime(item?.timeSeconds, durationSeconds);
    const shotId = clean(item?.shotId, 120) || null;
    if (!dimension || !status || timeSeconds === null) throw new Error(`Review observation ${index + 1} is invalid.`);
    if (shotId && shotIds.size && !shotIds.has(shotId)) throw new Error(`Review observation ${index + 1} references an unknown shot.`);
    if (status === "audible" && !["sound", "dialogue", "audio_sync"].includes(dimension)) {
      throw new Error(`Review observation ${index + 1} uses audible on a non-audio dimension.`);
    }
    return {
      observationId: clean(item?.observationId, 120) || `obs-${String(index + 1).padStart(3, "0")}`,
      dimension,
      status,
      timeSeconds,
      shotId,
      note: clean(item?.note, 2000)
    };
  });
  const failures = observations.filter((item) => item.status === "missing" || item.status === "wrong_order").map((item) => ({
    failureId: `failure-${item.observationId}`,
    observationId: item.observationId,
    dimension: item.dimension,
    timeSeconds: item.timeSeconds,
    shotId: item.shotId,
    severity: item.status === "wrong_order" ? "high" : "medium",
    reason: item.note || (item.status === "wrong_order" ? "The expected event appears in the wrong order." : "The expected event is missing."),
    minimalRepair: `Only repair ${item.dimension}${item.shotId ? ` in ${item.shotId}` : ""} near ${item.timeSeconds}s; preserve all accepted shots, identities, facts and timing outside this local range.`
  }));
  const dimensions = Object.fromEntries(REVIEW_DIMENSIONS.map((dimension) => {
    const rows = observations.filter((item) => item.dimension === dimension);
    return [dimension, {
      total: rows.length,
      passed: rows.filter((item) => item.status === "visible" || item.status === "audible").length,
      failed: rows.filter((item) => item.status === "missing" || item.status === "wrong_order").length,
      indeterminate: rows.filter((item) => item.status === "indeterminate").length
    }];
  }));
  return {
    schemaVersion: "t8-result-review/v1",
    reviewedAt: clean(input.reviewedAt, 64) || new Date().toISOString(),
    reviewerKind: "human",
    mediaId: clean(input.mediaId, 120) || null,
    durationSeconds,
    observations,
    dimensions,
    failures,
    repairBrief: failures.map((item) => item.minimalRepair).join("\n"),
    status: failures.length ? "needs_repair" : observations.length ? "reviewed" : "empty"
  };
}

function hardAnchorSnapshot(project) {
  return {
    intent: clean(project?.intent, 12000),
    constraints: clean(project?.constraints, 12000),
    durationSeconds: Number(project?.durationSeconds || 0),
    templateHash: clean(project?.template?.hash, 64),
    requiredAnchors: Array.isArray(project?.templateSnapshot?.requiredAnchors) ? project.templateSnapshot.requiredAnchors.map((item) => clean(item, 1000)) : [],
    shots: Array.isArray(project?.creativePlan?.shots) ? project.creativePlan.shots.map((shot) => ({
      shotId: clean(shot.shotId, 120),
      startSeconds: Number(shot.startSeconds),
      endSeconds: Number(shot.endSeconds),
      action: clean(shot.action, 4000),
      stateChange: clean(shot.stateChange, 4000)
    })) : [],
    continuityLocks: Array.isArray(project?.creativePlan?.continuityLocks) ? project.creativePlan.continuityLocks : []
  };
}

function buildVariantRequest(project, style) {
  const definition = VARIANT_STYLES[style];
  if (!definition) throw new Error("Unknown variant style.");
  const selected = (project?.revisions || []).find((item) => item.revisionId === project.selectedRevisionId) || project?.revisions?.[0];
  if (!selected?.output) throw new Error("A source revision is required for a variant.");
  const anchors = hardAnchorSnapshot(project);
  return {
    schemaVersion: "t8-variant-request/v1",
    style,
    label: definition.label,
    axes: [...definition.axes],
    instruction: definition.instruction,
    sourceRevisionId: selected.revisionId,
    sourceOutputSha256: selected.outputSha256,
    sourceOutput: selected.output,
    hardAnchors: anchors,
    hardAnchorHash: hash(anchors),
    plannedLogicalRequests: 1,
    automaticRetries: 0
  };
}

function scoreRevision(revision, project) {
  const output = clean(revision?.output, 200000);
  const validation = revision?.validation || {};
  const coverageValue = (value) => Number(typeof value === "number" ? value : value?.ratio ?? value?.coverage ?? 0);
  return {
    revisionId: revision?.revisionId || null,
    source: revision?.source || "unknown",
    hook: /(?:hook|钩子|开场|0(?:\.0+)?\s*(?:s|秒))/iu.test(output),
    rhythm: /(?:节奏|rhythm|tempo|快切|停顿|pause)/iu.test(output),
    sound: /(?:声音|音效|音乐|对白|sound|audio|dialogue|music)/iu.test(output),
    ending: /(?:结尾|收束|定格|ending|final|hold)/iu.test(output),
    anchorCoverage: coverageValue(validation.anchorCoverage),
    shotCoverage: coverageValue(validation.shotCoverage),
    userRating: Number(project?.ratings?.[revision?.revisionId]?.overall || 0)
  };
}

function compareRevisions(project, revisionIds = []) {
  const ids = new Set(revisionIds.map(String));
  const revisions = (project?.revisions || []).filter((item) => !ids.size || ids.has(item.revisionId)).slice(0, 4);
  if (revisions.length < 2) throw new Error("Select at least two revisions to compare.");
  return {
    schemaVersion: "t8-revision-comparison/v1",
    hardAnchorHash: hash(hardAnchorSnapshot(project)),
    rows: revisions.map((revision) => scoreRevision(revision, project))
  };
}

function videoToMusicFacts(project, revisionId) {
  const revision = (project?.revisions || []).find((item) => item.revisionId === revisionId) || (project?.revisions || []).find((item) => item.revisionId === project?.selectedRevisionId);
  if (!revision) throw new Error("A source revision is required for the Music 3 bridge.");
  const shots = project?.creativePlan?.shots || [];
  const beatPoints = shots.flatMap((shot) => [Number(shot.startSeconds), Number(shot.endSeconds)]).filter(Number.isFinite);
  const uniqueBeats = [...new Set(beatPoints)].sort((a, b) => a - b);
  const payload = {
    sourceCapability: "video_prompt",
    sourceProjectId: project.projectId,
    sourceRevisionId: revision.revisionId,
    sourceRevisionSha256: revision.outputSha256,
    durationSeconds: project.durationSeconds,
    beatPoints: uniqueBeats,
    emotionalArc: shots.map((shot) => ({ shotId: shot.shotId, interval: [shot.startSeconds, shot.endSeconds], stateChange: clean(shot.stateChange, 1000) })),
    soundEvents: shots.filter((shot) => clean(shot.sound, 2000)).map((shot) => ({ shotId: shot.shotId, at: shot.startSeconds, requirement: clean(shot.sound, 2000) })),
    silenceWindows: shots.filter((shot) => /(?:silence|silent|静默|无声|停顿)/iu.test(clean(shot.sound, 2000))).map((shot) => [shot.startSeconds, shot.endSeconds])
  };
  return payload;
}

function musicToVideoFacts(musicProject) {
  const caption = clean(musicProject?.outputs?.musicCaption, 200000);
  const bpmMatch = caption.match(/\bBPM\s*[:=]?\s*(\d{2,3})\b/iu) || caption.match(/\b(\d{2,3})\s*BPM\b/iu);
  const bpm = bpmMatch ? Number(bpmMatch[1]) : Number(musicProject?.fixedBpm || 0) || null;
  const structure = [...caption.matchAll(/\[(Intro|Verse|Pre-Chorus|Chorus|Post-Chorus|Bridge|Instrumental|Solo|Outro)[^\]]*\]/giu)].map((match) => match[1]);
  const payload = {
    sourceCapability: "music3",
    sourceProjectId: musicProject?.projectId || null,
    sourceOutputHash: hash({ caption, payload: clean(musicProject?.outputs?.music3PayloadJson, 400000) }),
    bpm,
    beatIntervalSeconds: bpm ? Math.round((60 / bpm) * 1000) / 1000 : null,
    structure,
    suggestionsOnly: true,
    overwriteShots: false
  };
  return payload;
}

module.exports = {
  OBSERVATION_STATUSES,
  REVIEW_DIMENSIONS,
  VARIANT_STYLES,
  buildVariantRequest,
  compareRevisions,
  hardAnchorSnapshot,
  musicToVideoFacts,
  normalizeReview,
  videoToMusicFacts
};
