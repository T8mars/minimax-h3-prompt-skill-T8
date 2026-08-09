const fs = require("node:fs");
const path = require("node:path");

const PUBLISHED_STATES = new Set(["published", "released", "release", "public"]);

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readText(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

function safeResolve(root, reference) {
  if (!root || typeof reference !== "string" || !reference.trim()) return null;
  if (path.isAbsolute(reference)) return null;
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, reference);
  const relative = path.relative(resolvedRoot, resolved);
  if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
    return resolved;
  }
  return null;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function uniqueStrings(values) {
  const seen = new Set();
  return values
    .flatMap(asArray)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => {
      if (!value) return false;
      const key = value.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstReference(container, keys) {
  if (typeof container === "string") return container;
  if (!container || typeof container !== "object") return "";
  for (const key of keys) {
    if (typeof container[key] === "string" && container[key].trim()) return container[key].trim();
  }
  return "";
}

function markdownSummary(markdown) {
  const text = String(markdown || "")
    .replace(/^---\s*[\s\S]*?\s*---\s*/u, "")
    .replace(/```[\s\S]*?```/gu, "")
    .split(/\r?\n\s*\r?\n/u)
    .map((paragraph) => paragraph.replace(/^#{1,6}\s+/gmu, "").replace(/[*_`>]/gu, "").trim())
    .find((paragraph) => paragraph && !/^[-|:\s]+$/u.test(paragraph));
  return text || "";
}

function extractPrompt(markdown) {
  let text = String(markdown || "").replace(/^\uFEFF/u, "").replace(/\r\n/gu, "\n").trim();
  text = text.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/u, "").trim();

  const heading = /^##\s+(?:Prompt|提示词|完整提示词)\s*$/imu.exec(text);
  let section = null;
  if (heading) {
    const remainder = text.slice(heading.index + heading[0].length).replace(/^\s*\n/u, "");
    const nextHeading = /^##\s+/mu.exec(remainder);
    section = nextHeading ? remainder.slice(0, nextHeading.index).trim() : remainder.trim();
  }
  const candidate = section ?? text;
  const fenced = [...candidate.matchAll(/```[^\n]*\n([\s\S]*?)```/gu)].map((match) => match[1].trim());
  if (fenced.length) return fenced.sort((a, b) => b.length - a.length)[0];

  if (section === null) {
    const allFenced = [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/gu)].map((match) => match[1].trim());
    if (allFenced.length) return allFenced.sort((a, b) => b.length - a.length)[0];
  }

  return candidate.replace(/^#{1,6}\s+.*$/gmu, "").trim();
}

function assetDescriptor(root, filePath, scope) {
  if (!root || !filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  const relative = path.relative(path.resolve(root), path.resolve(filePath));
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;
  return {
    scope,
    relativePath: relative.split(path.sep).join("/")
  };
}

function resolveExisting(root, references) {
  for (const reference of references) {
    const resolved = safeResolve(root, reference);
    if (resolved && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return resolved;
  }
  return null;
}

function normalizeModels(manifest, prompts) {
  const models = uniqueStrings([
    manifest.models,
    manifest.model,
    prompts.minimaxH3 ? "MiniMax H3" : "",
    prompts.seedance20 ? "Seedance 2.0" : ""
  ]);
  return models.map((model) => {
    const lower = model.toLocaleLowerCase();
    if (lower.includes("seedance")) return "Seedance 2.0";
    if (lower.includes("minimax") || /\bh3\b/u.test(lower)) return "MiniMax H3";
    return model;
  }).filter((model, index, values) => values.indexOf(model) === index);
}

function promptReference(promptRefs, model) {
  if (Array.isArray(promptRefs)) {
    const found = promptRefs.find((item) => {
      const name = String(item?.model || item?.name || "").toLocaleLowerCase();
      return model === "h3" ? name.includes("h3") || name.includes("minimax") : name.includes("seedance");
    });
    return firstString(found?.ref, found?.path, found?.file);
  }
  const keys = model === "h3"
    ? ["minimax_h3", "minimax-h3", "h3", "minimaxH3"]
    : ["seedance_2_0", "seedance-2.0", "seedance20", "seedance2", "seedance"];
  return firstReference(promptRefs, keys);
}

function collectCaseManifestPaths(catalogRoot, rootManifest) {
  const ordered = [];
  const seen = new Set();
  const add = (candidate) => {
    if (!candidate || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return;
    const key = path.resolve(candidate).toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(candidate);
  };

  const entries = [rootManifest?.cases, rootManifest?.case_refs, rootManifest?.entries].flatMap(asArray);
  for (const entry of entries) {
    if (typeof entry === "string") {
      const direct = safeResolve(catalogRoot, entry);
      if (direct && path.extname(direct).toLocaleLowerCase() === ".json") add(direct);
      else add(safeResolve(catalogRoot, path.join("cases", entry, "manifest.json")));
      continue;
    }
    const reference = firstString(entry?.manifest_ref, entry?.manifest, entry?.path, entry?.ref);
    if (reference) add(safeResolve(catalogRoot, reference));
    const id = firstString(entry?.case_id, entry?.id, entry?.slug);
    if (id) add(safeResolve(catalogRoot, path.join("cases", id, "manifest.json")));
  }

  const casesRoot = path.join(catalogRoot, "cases");
  if (fs.existsSync(casesRoot)) {
    for (const entry of fs.readdirSync(casesRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory()) add(path.join(casesRoot, entry.name, "manifest.json"));
    }
  }
  return ordered;
}

function normalizeCase(manifestPath, catalogRoot, mediaRoot) {
  const manifest = readJson(manifestPath, {});
  const caseDir = path.dirname(manifestPath);
  const id = firstString(manifest.case_id, manifest.id, manifest.slug, path.basename(caseDir));
  if (!id || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(id)) return null;

  const state = firstString(manifest.state, manifest.status, "published").toLocaleLowerCase();
  if (!PUBLISHED_STATES.has(state)) return null;

  const sourcePath = resolveExisting(caseDir, [firstString(manifest.source_ref, "source.json")]);
  const source = sourcePath ? readJson(sourcePath, {}) : {};
  const creativePath = resolveExisting(caseDir, [firstString(manifest.creative_dna_ref, "creative-dna.json")]);
  const creativeDna = creativePath ? readJson(creativePath, {}) : {};
  const summaryPath = resolveExisting(caseDir, [firstString(manifest.summary_ref, "SUMMARY.md")]);

  const promptRefs = manifest.prompt_refs || manifest.prompts || {};
  const h3Path = resolveExisting(caseDir, [promptReference(promptRefs, "h3"), "prompts/minimax-h3.md"]);
  const seedancePath = resolveExisting(caseDir, [promptReference(promptRefs, "seedance"), "prompts/seedance-2.0.md"]);
  const prompts = {
    minimaxH3: h3Path ? extractPrompt(readText(h3Path)) : "",
    seedance20: seedancePath ? extractPrompt(readText(seedancePath)) : ""
  };

  const previewRefs = manifest.preview_refs || manifest.preview_paths || {};
  const gifPath = resolveExisting(caseDir, [firstReference(previewRefs, ["gif", "preview_gif"]), "preview.gif"]);
  const posterPath = resolveExisting(caseDir, [firstReference(previewRefs, ["poster", "image", "thumbnail"]), "poster.webp", "poster.png", "poster.jpg"]);
  const releaseVideoPath = mediaRoot
    ? resolveExisting(mediaRoot, [path.join(id, "preview.mp4")])
    : null;
  const catalogVideoRef = firstReference(previewRefs, ["video", "mp4", "preview_mp4"]);
  const catalogVideoPath = catalogVideoRef && !catalogVideoRef.replace(/\\/gu, "/").startsWith("media/")
    ? resolveExisting(caseDir, [catalogVideoRef])
    : resolveExisting(caseDir, ["preview.mp4"]);
  const videoPath = releaseVideoPath || catalogVideoPath;
  const videoScope = releaseVideoPath ? "media" : "catalog";

  const sourceUrl = firstString(
    source?.video_reference?.post_url,
    source?.canonical_url,
    source?.post_url,
    manifest.source_url
  );
  const safeSourceUrl = (() => {
    try {
      const parsed = new URL(sourceUrl);
      return parsed.protocol === "https:" ? parsed.toString() : "";
    } catch {
      return "";
    }
  })();

  const summary = firstString(manifest.summary, summaryPath ? markdownSummary(readText(summaryPath)) : "");
  const quality = manifest.quality && typeof manifest.quality === "object" ? manifest.quality : {};

  return {
    id,
    title: firstString(manifest.title, manifest.name, id),
    summary,
    state,
    platform: firstString(source.platform, manifest.platform, "unknown"),
    author: firstString(source.author, source.creator, manifest.author, "未知作者"),
    sourceUrl: safeSourceUrl,
    sourceDurationSeconds: Number.isFinite(Number(manifest.source_duration_seconds ?? manifest.duration_seconds))
      ? Number(manifest.source_duration_seconds ?? manifest.duration_seconds)
      : null,
    targetDurationSeconds: Number.isFinite(Number(manifest.target_duration_seconds))
      ? Number(manifest.target_duration_seconds)
      : 15,
    tags: uniqueStrings([manifest.tags, creativeDna.tags]),
    models: normalizeModels(manifest, prompts),
    quality,
    creativeDna,
    prompts,
    media: {
      gif: assetDescriptor(catalogRoot, gifPath, "catalog"),
      poster: assetDescriptor(catalogRoot, posterPath, "catalog"),
      video: assetDescriptor(videoScope === "media" ? mediaRoot : catalogRoot, videoPath, videoScope),
      hasFullVideo: Boolean(videoPath)
    },
    updatedAt: firstString(manifest.updated_at, rootUpdatedAt(manifest), manifest.created_at)
  };
}

function rootUpdatedAt(manifest) {
  return typeof manifest.provenance === "object" ? firstString(manifest.provenance.updated_at) : "";
}

function normalizeOfficialSkill(entry, index, catalogRoot, skillsRoot) {
  if (!entry || typeof entry !== "object") return null;
  const id = firstString(entry.id);
  const companionSkill = firstString(entry.companion_skill);
  if (!id || !companionSkill || !skillsRoot) return null;
  const summaryPath = safeResolve(skillsRoot, firstString(entry.companion_summary_ref));
  const templatePath = safeResolve(skillsRoot, firstString(entry.companion_seedance_ref));
  const previewPath = safeResolve(catalogRoot, firstString(entry.local_preview_ref));
  if (!summaryPath || !templatePath || !previewPath || !fs.existsSync(summaryPath) || !fs.existsSync(templatePath) || !fs.existsSync(previewPath)) return null;
  const pinnedCommit = firstString(index.pinned_commit);
  const installCommand = firstString(entry.upstream_install_command);
  const upstreamSkillUrl = firstString(entry.upstream_skill_url);
  const h3Access = [
    "此条目来自 MiniMax-AI/MiniMax-H3 官方仓库。为遵守上游许可，本仓库不复制官方 Skill 正文。",
    "",
    "安装官方 H3 Skill：",
    installCommand,
    "",
    `固定版本：${upstreamSkillUrl}`,
    `Commit：${pinnedCommit}`,
    `SKILL.md SHA-256：${firstString(entry.upstream_skill_sha256)}`
  ].join("\n");
  return {
    kind: "officialSkill",
    id,
    title: firstString(entry.title_zh, entry.title, id),
    englishTitle: firstString(entry.title),
    summary: firstString(entry.summary, markdownSummary(readText(summaryPath))),
    sourceClassification: firstString(entry.source_classification),
    sourceLabel: firstString(entry.source_label, "MiniMax 官方仓库收录"),
    upstreamVersion: entry.upstream_version === null ? null : firstString(entry.upstream_version),
    upstreamSkillUrl,
    sourceUrl: upstreamSkillUrl,
    upstreamPreviewUrl: firstString(entry.upstream_preview_url),
    previewKind: firstString(entry.preview_kind),
    previewLabel: firstString(entry.preview_label, "官方示例 GIF"),
    upstreamInstallCommand: installCommand,
    pinnedCommit,
    upstreamSkillSha256: firstString(entry.upstream_skill_sha256),
    companionSkill,
    companionSummary: readText(summaryPath).trim(),
    models: uniqueStrings(entry.models),
    tags: uniqueStrings(entry.tags),
    comfyuiImport: false,
    media: {
      gif: assetDescriptor(catalogRoot, previewPath, "catalog"),
      poster: null,
      video: null,
      hasFullVideo: false
    },
    prompts: {
      minimaxH3: h3Access,
      seedance20: readText(templatePath).trim()
    }
  };
}

function loadOfficialSkills(catalogRoot, rootManifest, skillsRoot, warnings) {
  const reference = firstString(rootManifest.official_skills_manifest);
  if (!reference) return [];
  const indexPath = safeResolve(catalogRoot, reference);
  if (!indexPath || !fs.existsSync(indexPath)) {
    warnings.push("未找到 MiniMax 官方仓库 Skill 索引");
    return [];
  }
  const index = readJson(indexPath, null);
  if (!index || index.comfyui_import !== false || index.upstream_content_embedded !== false) {
    warnings.push("MiniMax 官方仓库 Skill 索引未通过公开边界检查");
    return [];
  }
  const normalized = asArray(index.skills)
    .map((entry) => normalizeOfficialSkill(entry, index, catalogRoot, skillsRoot))
    .filter(Boolean);
  if (Number(index.skill_count) !== normalized.length) warnings.push("部分官方仓库 Skill 或 Seedance 伴侣文件不可用");
  return normalized;
}

function normalizeCommunitySkill(entry, index, catalogRoot, mediaRoot, skillsRoot) {
  if (!entry || typeof entry !== "object" || !skillsRoot) return null;
  const id = firstString(entry.id);
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id) || entry.official !== false) return null;
  const skillRef = firstString(entry.skill_ref, id);
  const skillPath = safeResolve(skillsRoot, path.join(skillRef, "SKILL.md"));
  const summaryPath = safeResolve(skillsRoot, firstString(entry.summary_ref, `${skillRef}/references/summary.md`));
  const h3Path = safeResolve(skillsRoot, firstString(entry.prompt_refs?.minimax_h3));
  const seedancePath = safeResolve(skillsRoot, firstString(entry.prompt_refs?.seedance_2_0));
  if (![skillPath, summaryPath, h3Path, seedancePath].every((candidate) => candidate && fs.existsSync(candidate))) return null;

  const previewRefs = entry.preview_refs || {};
  const gifPath = safeResolve(catalogRoot, firstString(previewRefs.gif));
  const posterPath = safeResolve(catalogRoot, firstString(previewRefs.poster));
  const videoPath = mediaRoot ? safeResolve(mediaRoot, firstString(previewRefs.mp4)) : null;
  const sourceUrl = (() => {
    try {
      const parsed = new URL(firstString(entry.source_url));
      return parsed.protocol === "https:" ? parsed.toString() : "";
    } catch {
      return "";
    }
  })();

  return {
    kind: "communitySkill",
    id,
    title: firstString(entry.title_zh, entry.title, id),
    englishTitle: firstString(entry.title),
    summary: firstString(entry.summary, markdownSummary(readText(summaryPath))),
    sourceClassification: firstString(entry.source_classification, "user-contributed"),
    sourceLabel: firstString(entry.source_label, "非官方 · 用户贡献"),
    sourceAttribution: firstString(entry.source_attribution),
    sourceUrl,
    sourceDurationSeconds: Number.isFinite(Number(entry.source_duration_seconds)) ? Number(entry.source_duration_seconds) : null,
    targetDurationRangeSeconds: Array.isArray(entry.target_duration_range_seconds) ? entry.target_duration_range_seconds.map(Number) : [4, 15],
    skillRef,
    companionSummary: readText(summaryPath).trim(),
    models: uniqueStrings(entry.models),
    tags: uniqueStrings(entry.tags),
    creativeDna: entry.creative_dna && typeof entry.creative_dna === "object" ? entry.creative_dna : {},
    comfyuiImport: Boolean(entry.comfyui?.bundled),
    comfyuiReason: firstString(entry.comfyui?.reason),
    prompts: {
      minimaxH3: readText(h3Path).trim(),
      seedance20: readText(seedancePath).trim()
    },
    media: {
      gif: assetDescriptor(catalogRoot, gifPath, "catalog"),
      poster: assetDescriptor(catalogRoot, posterPath, "catalog"),
      video: assetDescriptor(mediaRoot, videoPath, "media"),
      hasFullVideo: Boolean(videoPath && fs.existsSync(videoPath))
    },
    updatedAt: firstString(entry.updated_at, index.updated_at)
  };
}

function loadCommunitySkills(catalogRoot, rootManifest, mediaRoot, skillsRoot, warnings) {
  const reference = firstString(rootManifest.community_skills_manifest);
  if (!reference) return [];
  const indexPath = safeResolve(catalogRoot, reference);
  if (!indexPath || !fs.existsSync(indexPath)) {
    warnings.push("未找到非官方 Skill 索引");
    return [];
  }
  const index = readJson(indexPath, null);
  if (!index || index.official !== false) {
    warnings.push("非官方 Skill 索引边界无效");
    return [];
  }
  const normalized = asArray(index.skills).map((item) => {
    const manifestRef = firstString(item?.manifest_ref);
    const manifestPath = safeResolve(catalogRoot, manifestRef);
    if (!manifestPath || !fs.existsSync(manifestPath)) return null;
    return normalizeCommunitySkill(readJson(manifestPath, null), index, catalogRoot, mediaRoot, skillsRoot);
  }).filter(Boolean);
  if (Number(index.skill_count) !== normalized.length) warnings.push("部分非官方 Skill、模板或预览文件不可用");
  return normalized;
}

function loadCatalog({ catalogRoot, mediaRoot = null, skillsRoot = null }) {
  const resolvedCatalogRoot = path.resolve(catalogRoot);
  const rootPath = path.join(resolvedCatalogRoot, "manifest.json");
  const rootManifest = readJson(rootPath, {});
  const warnings = [];
  if (!fs.existsSync(rootPath)) warnings.push("未找到 catalog/manifest.json");

  const cases = collectCaseManifestPaths(resolvedCatalogRoot, rootManifest)
    .map((manifestPath) => normalizeCase(manifestPath, resolvedCatalogRoot, mediaRoot ? path.resolve(mediaRoot) : null))
    .filter(Boolean);

  if (!cases.length) warnings.push("公开目录中没有可显示的 published 案例");
  const officialSkills = loadOfficialSkills(
    resolvedCatalogRoot,
    rootManifest,
    skillsRoot ? path.resolve(skillsRoot) : null,
    warnings
  );
  const communitySkills = loadCommunitySkills(
    resolvedCatalogRoot,
    rootManifest,
    mediaRoot ? path.resolve(mediaRoot) : null,
    skillsRoot ? path.resolve(skillsRoot) : null,
    warnings
  );

  return {
    schemaVersion: firstString(rootManifest.schema_version, "1.0.0"),
    catalogVersion: firstString(rootManifest.catalog_version, rootManifest.version, "1.0.0"),
    generatedAt: firstString(rootManifest.generated_at, rootManifest.updated_at),
    cases,
    officialSkills,
    communitySkills,
    warnings
  };
}

module.exports = {
  extractPrompt,
  loadCatalog,
  markdownSummary,
  safeResolve
};
