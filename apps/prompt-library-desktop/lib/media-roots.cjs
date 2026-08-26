const fs = require("node:fs");
const path = require("node:path");

function hasMediaManifest(root) {
  return Boolean(root) && fs.existsSync(path.join(root, "media-pack-manifest.json"));
}

function resolveMediaRoot({ env = process.env, executablePath = process.execPath, isPackaged, repoRoot, resourcesPath, userDataDir }) {
  const configured = typeof env.T8_MEDIA_DIR === "string" ? env.T8_MEDIA_DIR.trim() : "";
  if (configured) return path.resolve(repoRoot, configured);

  if (!isPackaged) return path.join(repoRoot, ".release-input", "media");

  const legacyBundledRoot = path.join(resourcesPath, "media");
  const userDataRoot = path.join(userDataDir, "media");
  const executableDirectory = path.dirname(executablePath);
  const executableSiblingRoot = path.join(executableDirectory, "media");
  const macApplicationSiblingRoot = process.platform === "darwin"
    ? path.resolve(executableDirectory, "../../../media")
    : null;

  const mounted = [legacyBundledRoot, userDataRoot, executableSiblingRoot, macApplicationSiblingRoot]
    .find(hasMediaManifest);
  return mounted || userDataRoot;
}

module.exports = { hasMediaManifest, resolveMediaRoot };
