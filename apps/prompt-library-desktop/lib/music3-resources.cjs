const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const OFFICIAL_SOURCE_COMMIT = "91410fb657c007ae57c60df8240f5ece5be089c7";
const OFFICIAL_NORMALIZED_TREE_SHA256 = "d836359b48a4bc3381f8d9eb370ff90dd82cb5ad9aa4e3ba0ed80da2c25b2553";
const OFFICIAL_CORE_SKILL_SHA256 = "510f27d504bb06eb3859eb8a627773e655108e72df028d760be3ae98b3d4832c";
const EXPECTED_FAMILY_INDEX_COUNT = 18;
const EXPECTED_TEMPLATE_COUNT = 1000;
const RESOURCE_ROOT = path.resolve(__dirname, "..", "music3-official");
const REFERENCES_ROOT = path.join(RESOURCE_ROOT, "references");
const TEMPLATES_ROOT = path.join(RESOURCE_ROOT, "templates");

const FAMILIES = Object.freeze([
  "east-asian-modern", "east-asian-ballad-heritage", "modern-rnb-neo-soul", "soul-blues-gospel",
  "cinematic-pop-ballad", "cinematic-orchestral-epic", "electronic-synth-ambient-pop", "jazz-swing-big-band",
  "traditional-vocal-stage", "hip-hop-rap", "metal-heavy-rock", "pop-alternative-rock",
  "contemporary-folk-acoustic", "roots-traditional-global", "general-pop-ballad", "dance-pop-disco-funk",
  "club-edm-house-trance", "country-americana"
]);

let validationCache = null;

function readText(filePath) {
  try { return fs.readFileSync(filePath, "utf8"); }
  catch { throw new Error(`Official Music 3 Skill resource is unreadable: ${path.basename(filePath)}`); }
}

function normalizedBuffer(filePath) {
  return fs.readFileSync(filePath).toString("utf8").replace(/\r\n/gu, "\n");
}

function normalizedSha256(filePath) {
  return crypto.createHash("sha256").update(normalizedBuffer(filePath), "utf8").digest("hex");
}

function walkFiles(root) {
  const values = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) values.push(absolute);
    }
  };
  walk(root);
  return values.sort((left, right) => {
    const leftRelative = virtualRelative(left);
    const rightRelative = virtualRelative(right);
    return leftRelative < rightRelative ? -1 : leftRelative > rightRelative ? 1 : 0;
  });
}

function virtualRelative(filePath) {
  const relative = path.relative(RESOURCE_ROOT, filePath).replace(/\\/gu, "/");
  return relative === "skill.txt" ? "SKILL.md" : relative;
}

function normalizedTreeSha256() {
  const records = walkFiles(RESOURCE_ROOT).map((filePath) => {
    const hash = crypto.createHash("sha256").update(normalizedBuffer(filePath), "utf8").digest("hex");
    return `${virtualRelative(filePath)}\0${hash}`;
  });
  return crypto.createHash("sha256").update(records.join("\n"), "utf8").digest("hex");
}

function validateOfficialResources({ full = true } = {}) {
  const skillPath = path.join(RESOURCE_ROOT, "skill.txt");
  if (!fs.existsSync(skillPath) || normalizedSha256(skillPath) !== OFFICIAL_CORE_SKILL_SHA256) {
    throw new Error("The bundled official Music 3 core Skill hash does not match the frozen snapshot.");
  }
  if (!full) return { skillPath, normalizedSha256: OFFICIAL_CORE_SKILL_SHA256 };
  if (validationCache) return validationCache;
  const routerPath = path.join(REFERENCES_ROOT, "genre-router.md");
  const indexes = fs.readdirSync(REFERENCES_ROOT).filter((name) => /^index-[a-z0-9-]+\.md$/u.test(name)).sort();
  const templates = fs.readdirSync(TEMPLATES_ROOT).filter((name) => name.endsWith(".txt")).sort();
  const expectedIndexes = FAMILIES.map((family) => `index-${family}.md`).sort();
  if (!fs.existsSync(routerPath) || indexes.length !== EXPECTED_FAMILY_INDEX_COUNT || templates.length !== EXPECTED_TEMPLATE_COUNT || JSON.stringify(indexes) !== JSON.stringify(expectedIndexes)) {
    throw new Error(`The bundled official Music 3 Skill is incomplete: expected ${EXPECTED_FAMILY_INDEX_COUNT} indexes and ${EXPECTED_TEMPLATE_COUNT} templates.`);
  }
  const treeHash = normalizedTreeSha256();
  if (treeHash !== OFFICIAL_NORMALIZED_TREE_SHA256) {
    throw new Error("The bundled official Music 3 Skill content hash does not match the frozen official snapshot.");
  }
  validationCache = { skillPath, routerPath, indexes, templates, normalizedTreeSha256: treeHash };
  return validationCache;
}

function loadSkill() {
  validateOfficialResources({ full: false });
  return readText(path.join(RESOURCE_ROOT, "skill.txt"));
}

function loadRouter() {
  return readText(path.join(REFERENCES_ROOT, "genre-router.md"));
}

function cardsForFamilies(families) {
  const chunks = [];
  const cards = new Map();
  for (const family of [...new Set(families)].slice(0, 2)) {
    if (!FAMILIES.includes(family)) continue;
    const indexPath = path.join(REFERENCES_ROOT, `index-${family}.md`);
    const index = readText(indexPath);
    chunks.push(`\n\n--- OFFICIAL FAMILY INDEX: ${family} ---\n${index}`);
    for (const line of index.split(/\r?\n/gu)) {
      if (!line.trimStart().startsWith("|")) continue;
      const id = line.match(/\|\s*`([^`]+)`\s*\|/u)?.[1];
      const relative = line.match(/`(templates\/[^`]+\.txt)`/u)?.[1];
      if (!id || !relative) continue;
      const resolved = path.resolve(RESOURCE_ROOT, ...relative.split("/"));
      const safeRelative = path.relative(TEMPLATES_ROOT, resolved);
      if (!safeRelative || safeRelative === ".." || safeRelative.startsWith(`..${path.sep}`) || path.isAbsolute(safeRelative)) {
        throw new Error("Official Music 3 template index contains an unsafe path.");
      }
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) cards.set(id, resolved);
    }
  }
  return { indexes: chunks.join(""), cards };
}

function readSelectedTemplate(filePath) {
  const resolved = path.resolve(filePath);
  const relative = path.relative(TEMPLATES_ROOT, resolved);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("Official Music 3 template path is outside the frozen resource root.");
  }
  return readText(resolved);
}

module.exports = {
  EXPECTED_FAMILY_INDEX_COUNT,
  EXPECTED_TEMPLATE_COUNT,
  FAMILIES,
  OFFICIAL_CORE_SKILL_SHA256,
  OFFICIAL_NORMALIZED_TREE_SHA256,
  OFFICIAL_SOURCE_COMMIT,
  RESOURCE_ROOT,
  cardsForFamilies,
  loadRouter,
  loadSkill,
  normalizedTreeSha256,
  readSelectedTemplate,
  validateOfficialResources
};
