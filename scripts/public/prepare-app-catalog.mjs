import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MECHANISM_GIF_STATUS, mechanismPreviewFailures } from "./gif-inspection.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function argumentValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function resolveFromRepo(value) {
  return path.isAbsolute(value) ? path.resolve(value) : path.resolve(repoRoot, value);
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function collectGifPaths(root) {
  const results = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".gif")) results.push(absolute);
    }
  };
  visit(root);
  return results.sort((left, right) => left.localeCompare(right));
}

function directoryBytes(root) {
  let total = 0;
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) total += fs.statSync(absolute).size;
    }
  };
  visit(root);
  return total;
}

function ensureGif(filePath) {
  const handle = fs.openSync(filePath, "r");
  try {
    const signature = Buffer.alloc(6);
    if (fs.readSync(handle, signature, 0, signature.length, 0) !== signature.length || !/^GIF8[79]a$/u.test(signature.toString("ascii"))) {
      throw new Error(`FFmpeg did not create a valid GIF: ${filePath}`);
    }
  } finally {
    fs.closeSync(handle);
  }
}

export function prepareAppCatalog({ source, output, ffmpeg, maxDimension = 288, fps = 4, colors = 64 }) {
  const sourceRoot = resolveFromRepo(source);
  const outputRoot = resolveFromRepo(output);
  const releaseInputRoot = path.join(repoRoot, ".release-input");

  if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
    throw new Error(`Catalog source directory is missing: ${sourceRoot}`);
  }
  if (!isInside(releaseInputRoot, outputRoot)) {
    throw new Error(`Output must be a dedicated child directory of ${releaseInputRoot}`);
  }
  if (!ffmpeg) throw new Error("--ffmpeg is required");
  if (!Number.isInteger(maxDimension) || maxDimension < 160) throw new Error("--max-dimension must be an integer of at least 160");
  if (!Number.isInteger(fps) || fps < 1) throw new Error("--fps must be a positive integer");
  if (!Number.isInteger(colors) || colors < 32 || colors > 256) throw new Error("--colors must be an integer from 32 to 256");

  const sourceGifs = collectGifPaths(sourceRoot);
  if (sourceGifs.length === 0) throw new Error("Catalog contains no GIF previews");

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(outputRoot), { recursive: true });
  fs.cpSync(sourceRoot, outputRoot, { recursive: true });

  let compacted = 0;
  for (const [index, sourceGif] of sourceGifs.entries()) {
    const relative = path.relative(sourceRoot, sourceGif);
    const destinationGif = path.join(outputRoot, relative);
    const temporaryGif = `${destinationGif}.t8-compact.tmp.gif`;
    const filter = [
      `fps=${fps},scale=${maxDimension}:${maxDimension}:force_original_aspect_ratio=decrease:flags=lanczos,split[s0][s1]`,
      `[s0]palettegen=max_colors=${colors}:stats_mode=diff[p]`,
      "[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle"
    ].join(";");
    const result = spawnSync(ffmpeg, [
      "-hide_banner", "-loglevel", "error", "-y",
      "-threads", "1", "-filter_threads", "1", "-filter_complex_threads", "1",
      "-i", sourceGif,
      "-filter_complex", filter,
      "-loop", "0",
      temporaryGif
    ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });

    if (result.status !== 0) {
      fs.rmSync(temporaryGif, { force: true });
      throw new Error(`FFmpeg failed for ${relative}: ${(result.stderr || result.stdout || "unknown error").trim()}`);
    }
    ensureGif(temporaryGif);
    if (fs.statSync(temporaryGif).size < fs.statSync(destinationGif).size) {
      fs.rmSync(destinationGif, { force: true });
      fs.renameSync(temporaryGif, destinationGif);
      compacted += 1;
    } else {
      fs.rmSync(temporaryGif, { force: true });
    }
    if ((index + 1) % 10 === 0 || index + 1 === sourceGifs.length) {
      console.log(`Prepared ${index + 1}/${sourceGifs.length} GIF previews`);
    }
  }

  const outputGifs = collectGifPaths(outputRoot);
  if (outputGifs.length !== sourceGifs.length) {
    throw new Error(`Compact catalog GIF count mismatch: source=${sourceGifs.length}, output=${outputGifs.length}`);
  }
  for (const outputGif of outputGifs) ensureGif(outputGif);

  const compactManifest = JSON.parse(fs.readFileSync(path.join(outputRoot, "manifest.json"), "utf8"));
  for (const entry of Array.isArray(compactManifest.cases) ? compactManifest.cases : []) {
    const caseManifestPath = path.join(outputRoot, String(entry.manifest_path || ""));
    if (!fs.existsSync(caseManifestPath)) continue;
    const caseManifest = JSON.parse(fs.readFileSync(caseManifestPath, "utf8"));
    if (caseManifest.preview_status?.gif !== MECHANISM_GIF_STATUS) continue;
    const previewPath = path.join(path.dirname(caseManifestPath), String(caseManifest.preview_refs?.gif || "preview.gif"));
    const failures = mechanismPreviewFailures(previewPath, { compact: true });
    if (failures.length) throw new Error(`Compacted mechanism preview failed: ${failures.join("; ")}`);
  }

  const sourceManifest = path.join(sourceRoot, "manifest.json");
  const outputManifest = path.join(outputRoot, "manifest.json");
  if (!fs.existsSync(outputManifest) || fs.readFileSync(sourceManifest).compare(fs.readFileSync(outputManifest)) !== 0) {
    throw new Error("Compact catalog must preserve manifest.json byte-for-byte");
  }

  const sourceBytes = directoryBytes(sourceRoot);
  const outputBytes = directoryBytes(outputRoot);
  console.log(JSON.stringify({ gifCount: sourceGifs.length, compacted, sourceBytes, outputBytes, ratio: Number((outputBytes / sourceBytes).toFixed(4)) }));
  return { gifCount: sourceGifs.length, compacted, sourceBytes, outputBytes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    prepareAppCatalog({
      source: argumentValue("--source", "catalog"),
      output: argumentValue("--output", ".release-input/app-catalog"),
      ffmpeg: argumentValue("--ffmpeg"),
      maxDimension: Number(argumentValue("--max-dimension", "288")),
      fps: Number(argumentValue("--fps", "4")),
      colors: Number(argumentValue("--colors", "64"))
    });
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
