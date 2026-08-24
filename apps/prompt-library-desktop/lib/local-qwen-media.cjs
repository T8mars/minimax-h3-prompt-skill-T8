const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");
const { companionFfprobePath } = require("./local-qwen-config.cjs");

const MAX_VISUAL_PARTS = 16;
const MAX_CAPTURE_BYTES = 12 * 1024 * 1024;

function abortError() {
  const error = new Error("Local media processing was cancelled.");
  error.name = "AbortError";
  return error;
}

function runCapture(executable, args, { signal, maxBytes = MAX_CAPTURE_BYTES } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const child = spawn(executable, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    let stdoutBytes = 0;
    let stderr = "";
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      callback(value);
    };
    const onAbort = () => {
      child.kill();
      finish(reject, abortError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    child.stdout.on("data", (chunk) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > maxBytes) {
        child.kill();
        finish(reject, new Error("Local media tool returned too much data."));
        return;
      }
      stdout.push(chunk);
    });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk.toString("utf8")).slice(-1200); });
    child.on("error", () => finish(reject, new Error("The configured local media tool could not start.")));
    child.on("close", (code) => {
      if (settled) return;
      if (code !== 0) return finish(reject, new Error(`Local media decoding failed with exit code ${code}.`));
      finish(resolve, { stdout: Buffer.concat(stdout), stderr });
    });
  });
}

async function videoDuration(record, ffmpegExecutable, signal) {
  const probe = companionFfprobePath(ffmpegExecutable);
  const result = await runCapture(probe, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    record.filePath
  ], { signal, maxBytes: 64 * 1024 });
  const duration = Number(result.stdout.toString("utf8").trim());
  if (!Number.isFinite(duration) || duration <= 0 || duration > 3600) throw new Error("Local video duration could not be determined safely.");
  return duration;
}

async function captureFrame(record, timestamp, ffmpegExecutable, signal) {
  const result = await runCapture(ffmpegExecutable, [
    "-hide_banner", "-loglevel", "error",
    "-ss", timestamp.toFixed(3),
    "-i", record.filePath,
    "-frames:v", "1",
    "-an", "-sn", "-dn",
    "-vf", "scale='min(1024,iw)':-2:force_original_aspect_ratio=decrease",
    "-threads", "1",
    "-filter_threads", "1",
    "-f", "image2pipe",
    "-vcodec", "mjpeg",
    "-q:v", "4",
    "pipe:1"
  ], { signal });
  if (result.stdout.length < 256) throw new Error("Decoded video sample was empty.");
  return result.stdout;
}

async function verifiedBytes(record) {
  const data = await fs.readFile(record.filePath);
  const sha256 = crypto.createHash("sha256").update(data).digest("hex");
  if (sha256 !== record.sha256) throw new Error("Reference media changed after selection.");
  return data;
}

function dataUrl(mimeType, bytes) {
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

function allocation(total, count) {
  if (!count) return [];
  const base = Math.floor(total / count);
  let remainder = total % count;
  return Array.from({ length: count }, () => base + (remainder-- > 0 ? 1 : 0));
}

async function buildLocalMediaParts(records, settings, { signal, imageConverter } = {}) {
  const media = Array.isArray(records) ? records : [];
  const images = media.filter((item) => item.kind === "image");
  const videos = media.filter((item) => item.kind === "video");
  if (images.length + videos.length > MAX_VISUAL_PARTS) throw new Error("Too many local visual references.");
  const parts = [];
  for (const record of images) {
    const bytes = await verifiedBytes(record);
    const converted = imageConverter
      ? await imageConverter(record.filePath, { sourceBytes: bytes, signal })
      : { bytes, mimeType: record.mimeType };
    if (!Buffer.isBuffer(converted?.bytes) || !converted.bytes.length) throw new Error("Reference image could not be decoded.");
    parts.push({ type: "text", text: `${record.label} is the next attached reference image.` });
    parts.push({ type: "image_url", image_url: { url: dataUrl(converted.mimeType || "image/jpeg", converted.bytes) } });
  }

  const budgets = allocation(MAX_VISUAL_PARTS - images.length, videos.length);
  for (let index = 0; index < videos.length; index += 1) {
    const record = videos[index];
    await verifiedBytes(record);
    const duration = await videoDuration(record, settings.ffmpegExecutable, signal);
    const desired = Math.max(1, Math.ceil(duration * settings.videoSampleFps));
    const count = Math.max(1, Math.min(desired, budgets[index] || 1));
    const last = Math.max(0, duration - 0.05);
    const timestamps = count === 1
      ? [Math.min(last, duration / 2)]
      : Array.from({ length: count }, (_unused, frameIndex) => last * frameIndex / (count - 1));
    let accepted = 0;
    parts.push({
      type: "text",
      text: `${record.label} is represented only by ordered visual samples. Do not claim complete-video access, audio, speech transcription, or soundtrack analysis.`
    });
    for (const timestamp of timestamps) {
      try {
        const jpeg = await captureFrame(record, timestamp, settings.ffmpegExecutable, signal);
        parts.push({ type: "text", text: `${record.label} visual sample at ${timestamp.toFixed(3)} seconds.` });
        parts.push({ type: "image_url", image_url: { url: dataUrl("image/jpeg", jpeg) } });
        accepted += 1;
      } catch (error) {
        if (error?.name === "AbortError") throw error;
        // A small number of damaged frames is acceptable; only the complete lack of samples blocks inference.
      }
    }
    if (!accepted) throw new Error(`${record.label} did not yield any decodable visual samples.`);
    await verifiedBytes(record);
  }
  return { parts, visualPartCount: parts.filter((item) => item.type === "image_url").length };
}

function messagesWithLocalMedia(messages, parts) {
  if (!parts.length) return messages;
  return messages.map((message, index) => index === messages.length - 1 && message.role === "user"
    ? { ...message, content: [{ type: "text", text: String(message.content) }, ...parts] }
    : message);
}

module.exports = {
  MAX_VISUAL_PARTS,
  buildLocalMediaParts,
  captureFrame,
  ffprobeExecutable: companionFfprobePath,
  messagesWithLocalMedia,
  runCapture,
  videoDuration
};
