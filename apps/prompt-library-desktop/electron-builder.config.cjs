const fs = require("node:fs");
const path = require("node:path");

const appDir = __dirname;
const repoRoot = path.resolve(appDir, "../..");
const catalogDir = path.join(repoRoot, "catalog");
const skillsDir = path.join(repoRoot, "skills");
const configuredMediaDir = process.env.T8_MEDIA_DIR
  ? path.resolve(repoRoot, process.env.T8_MEDIA_DIR)
  : null;

const extraResources = [];

if (fs.existsSync(catalogDir)) {
  extraResources.push({
    from: catalogDir,
    to: "catalog",
    filter: ["**/*"]
  });
}

if (fs.existsSync(skillsDir)) {
  extraResources.push({
    from: skillsDir,
    to: "skills",
    filter: ["**/*"]
  });
}

if (configuredMediaDir && fs.existsSync(configuredMediaDir)) {
  extraResources.push({
    from: configuredMediaDir,
    to: "media",
    filter: ["**/*.mp4", "media-pack-manifest.json"]
  });
}

module.exports = {
  appId: "com.t8mars.promptlibrary",
  productName: "T8 Prompt Library",
  asar: true,
  directories: {
    output: "dist"
  },
  files: [
    "main.cjs",
    "preload.cjs",
    "lib/**/*",
    "src/**/*",
    "package.json"
  ],
  extraResources,
  win: {
    icon: "build/icon.ico",
    target: ["nsis"],
    artifactName: "T8-Prompt-Library-Setup-v${version}.${ext}"
  },
  mac: {
    icon: "build/icon.png",
    category: "public.app-category.graphics-design",
    target: [
      { target: "dmg", arch: ["universal"] },
      { target: "zip", arch: ["universal"] }
    ],
    artifactName: "T8-Prompt-Library-v${version}-mac-${arch}.${ext}",
    hardenedRuntime: false,
    gatekeeperAssess: false,
    notarize: false
  },
  dmg: {
    title: "T8 Prompt Library ${version}"
  },
  nsis: {
    installerIcon: "build/icon.ico",
    uninstallerIcon: "build/icon.ico",
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "T8 Prompt Library",
    deleteAppDataOnUninstall: false
  },
  publish: [
    {
      provider: "github",
      owner: "T8mars",
      repo: "minimax-h3-prompt-skill-T8",
      releaseType: "release"
    }
  ]
};
