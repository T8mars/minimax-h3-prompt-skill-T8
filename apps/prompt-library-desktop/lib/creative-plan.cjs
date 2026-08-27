const crypto = require("node:crypto");

const MAX_DURATION_SECONDS = 86_400;
const MAX_SHOTS = 240;
const MEDIA_ROLES = new Set(["identity", "wardrobe", "product", "scene", "action", "style", "first_frame", "last_frame", "inspiration"]);
const ENTITY_TYPES = new Set(["character", "product", "scene", "prop"]);

function clean(value, limit = 12_000) {
  return String(value ?? "").replace(/\r\n/gu, "\n").trim().slice(0, limit);
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(3)) : fallback;
}

function normalizeDuration(value, fallback = 15) {
  const duration = number(value, fallback);
  if (!(duration > 0) || duration > MAX_DURATION_SECONDS) {
    throw new Error(`Duration must be greater than 0 and no more than ${MAX_DURATION_SECONDS} seconds.`);
  }
  return duration;
}

function stableId(prefix, input, index) {
  const requested = clean(input, 120).replace(/[^A-Za-z0-9_-]/gu, "-").replace(/-+/gu, "-").replace(/^-|-$/gu, "");
  return requested || `${prefix}-${String(index + 1).padStart(2, "0")}`;
}

function defaultShots(durationSeconds, intent = "") {
  return [{
    shotId: "shot-01",
    startSeconds: 0,
    endSeconds: durationSeconds,
    action: clean(intent),
    camera: "",
    sceneChange: "",
    sound: "",
    onScreenText: "",
    continuity: "",
    source: "legacy_intent"
  }];
}

function normalizeShots(input, { durationSeconds, intent = "", allowLegacyFallback = true } = {}) {
  const duration = normalizeDuration(durationSeconds);
  const source = Array.isArray(input) ? input.slice(0, MAX_SHOTS) : [];
  if (!source.length) return allowLegacyFallback ? defaultShots(duration, intent) : [];
  const ids = new Set();
  return source.map((item, index) => {
    const shotId = stableId("shot", item?.shotId, index);
    if (ids.has(shotId)) throw new Error(`Duplicate shot ID: ${shotId}`);
    ids.add(shotId);
    return {
      shotId,
      startSeconds: number(item?.startSeconds),
      endSeconds: number(item?.endSeconds),
      action: clean(item?.action),
      camera: clean(item?.camera, 4_000),
      sceneChange: clean(item?.sceneChange, 4_000),
      sound: clean(item?.sound, 4_000),
      onScreenText: clean(item?.onScreenText, 4_000),
      continuity: clean(item?.continuity, 4_000),
      source: item?.source === "legacy_intent" ? "legacy_intent" : "user"
    };
  });
}

function normalizeContinuityLocks(input, { mediaIds = [] } = {}) {
  const allowedMedia = new Set(mediaIds.map(String));
  const ids = new Set();
  return (Array.isArray(input) ? input : []).slice(0, 80).map((item, index) => {
    const entityId = stableId("entity", item?.entityId, index);
    if (ids.has(entityId)) throw new Error(`Duplicate continuity entity ID: ${entityId}`);
    ids.add(entityId);
    return {
      entityId,
      type: ENTITY_TYPES.has(item?.type) ? item.type : "character",
      name: clean(item?.name, 240),
      invariants: clean(item?.invariants, 8_000),
      mediaIds: [...new Set((Array.isArray(item?.mediaIds) ? item.mediaIds : []).map(String).filter((id) => allowedMedia.has(id)))]
    };
  });
}

function normalizeMediaAssignments(input, { media = [], shotIds = [], entityIds = [] } = {}) {
  const allowedMedia = new Set(media.map((item) => String(item.mediaId)));
  const allowedShots = new Set(shotIds.map(String));
  const allowedEntities = new Set(entityIds.map(String));
  const seen = new Set();
  return (Array.isArray(input) ? input : []).filter((item) => allowedMedia.has(String(item?.mediaId))).map((item) => {
    const mediaId = String(item.mediaId);
    if (seen.has(mediaId)) throw new Error(`Duplicate media assignment: ${mediaId}`);
    seen.add(mediaId);
    return {
      mediaId,
      role: MEDIA_ROLES.has(item?.role) ? item.role : "inspiration",
      notes: clean(item?.notes, 4_000),
      shotIds: [...new Set((Array.isArray(item?.shotIds) ? item.shotIds : []).map(String).filter((id) => allowedShots.has(id)))],
      entityIds: [...new Set((Array.isArray(item?.entityIds) ? item.entityIds : []).map(String).filter((id) => allowedEntities.has(id)))]
    };
  });
}

function validateCreativePlan({ durationSeconds, shots = [], media = [], mediaAssignments = [], continuityLocks = [] } = {}) {
  const duration = normalizeDuration(durationSeconds);
  const errors = [];
  const warnings = [];
  const sorted = [...shots].sort((left, right) => left.startSeconds - right.startSeconds || left.endSeconds - right.endSeconds);
  if (!sorted.length) errors.push({ code: "shot_plan_empty", message: "Add at least one shot to the creative plan." });
  sorted.forEach((shot, index) => {
    if (shot.startSeconds < 0 || shot.endSeconds <= shot.startSeconds) errors.push({ code: "shot_time_invalid", shotId: shot.shotId, message: `${shot.shotId} has an invalid time range.` });
    if (shot.endSeconds > duration + 0.001) errors.push({ code: "shot_beyond_duration", shotId: shot.shotId, message: `${shot.shotId} ends after the project duration.` });
    if (!shot.action) warnings.push({ code: "shot_action_empty", shotId: shot.shotId, message: `${shot.shotId} has no subject action.` });
    if (index === 0 && Math.abs(shot.startSeconds) > 0.001) errors.push({ code: "shot_plan_leading_gap", shotId: shot.shotId, message: "The shot plan must begin at 0 seconds." });
    if (index > 0) {
      const previous = sorted[index - 1];
      if (shot.startSeconds < previous.endSeconds - 0.001) errors.push({ code: "shot_overlap", shotId: shot.shotId, message: `${previous.shotId} overlaps ${shot.shotId}.` });
      if (shot.startSeconds > previous.endSeconds + 0.001) errors.push({ code: "shot_gap", shotId: shot.shotId, message: `${previous.shotId} leaves a gap before ${shot.shotId}.` });
    }
  });
  if (sorted.length && Math.abs(sorted.at(-1).endSeconds - duration) > 0.001) errors.push({ code: "shot_plan_trailing_gap", shotId: sorted.at(-1).shotId, message: "The shot plan must end at the project duration." });
  if (sorted.length) {
    const finalShot = sorted.at(-1);
    const finalText = [finalShot.action, finalShot.camera, finalShot.sceneChange, finalShot.continuity].join(" ");
    if (!/(?:hold|freeze|still|settle|定格|停留|静止|收束|保持)/iu.test(finalText)) warnings.push({ code: "final_hold_unconfirmed", shotId: finalShot.shotId, message: "The final shot does not explicitly state a readable hold or settled ending; verify the last frame." });
  }
  const assigned = new Set(mediaAssignments.map((item) => item.mediaId));
  for (const item of media) if (!assigned.has(String(item.mediaId))) warnings.push({ code: "media_role_missing", mediaId: item.mediaId, message: `${item.label || item.name} has no creative responsibility.` });
  for (const lock of continuityLocks) {
    if (!lock.name || !lock.invariants) warnings.push({ code: "continuity_lock_incomplete", entityId: lock.entityId, message: `${lock.entityId} needs both a name and invariants.` });
  }
  const shotDensity = duration ? Number((sorted.length / duration).toFixed(3)) : 0;
  if (shotDensity > 0.75) warnings.push({ code: "shot_density_high", message: "The plan averages more than three shots per four seconds; verify readability and continuity." });
  return {
    schemaVersion: "t8-creative-plan-validation/v1",
    status: errors.length ? "fail" : warnings.length ? "warning" : "pass",
    durationSeconds: duration,
    shotCount: sorted.length,
    shotDensity,
    errors,
    warnings
  };
}

function normalizeCreativePlan(input = {}) {
  const durationSeconds = normalizeDuration(input.durationSeconds);
  const media = Array.isArray(input.media) ? input.media : [];
  const shots = normalizeShots(input.shots, { durationSeconds, intent: input.intent, allowLegacyFallback: input.allowLegacyFallback !== false });
  const continuityLocks = normalizeContinuityLocks(input.continuityLocks, { mediaIds: media.map((item) => item.mediaId) });
  const mediaAssignments = normalizeMediaAssignments(input.mediaAssignments, {
    media,
    shotIds: shots.map((item) => item.shotId),
    entityIds: continuityLocks.map((item) => item.entityId)
  });
  const validation = validateCreativePlan({ durationSeconds, shots, media, mediaAssignments, continuityLocks });
  return { schemaVersion: "t8-creative-plan/v1", durationSeconds, shots, mediaAssignments, continuityLocks, validation };
}

function creativePlanHash(plan) {
  return crypto.createHash("sha256").update(JSON.stringify(plan), "utf8").digest("hex");
}

module.exports = {
  ENTITY_TYPES,
  MAX_DURATION_SECONDS,
  MAX_SHOTS,
  MEDIA_ROLES,
  creativePlanHash,
  defaultShots,
  normalizeContinuityLocks,
  normalizeCreativePlan,
  normalizeDuration,
  normalizeMediaAssignments,
  normalizeShots,
  validateCreativePlan
};
