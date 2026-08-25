import fs from "node:fs";

export const MECHANISM_GIF_STATUS = "generated_mechanism_animation_no_source_media";
export const MECHANISM_POSTER_STATUS = "generated_mechanism_poster_no_source_media";

function skipSubBlocks(buffer, start) {
  let offset = start;
  while (offset < buffer.length) {
    const length = buffer[offset];
    offset += 1;
    if (length === 0) return offset;
    offset += length;
  }
  throw new Error("truncated GIF sub-block stream");
}

export function inspectGifBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 14) throw new Error("GIF is too small");
  const signature = buffer.subarray(0, 6).toString("ascii");
  if (!/^GIF8[79]a$/u.test(signature)) throw new Error("invalid GIF signature");
  const width = buffer.readUInt16LE(6);
  const height = buffer.readUInt16LE(8);
  const packed = buffer[10];
  let offset = 13;
  if (packed & 0x80) offset += 3 * (2 ** ((packed & 0x07) + 1));

  let frameCount = 0;
  let durationMs = 0;
  let pendingDelayMs = 0;
  let trailerFound = false;
  while (offset < buffer.length) {
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0x3b) {
      trailerFound = true;
      break;
    }
    if (marker === 0x21) {
      if (offset >= buffer.length) throw new Error("truncated GIF extension");
      const label = buffer[offset];
      offset += 1;
      if (label === 0xf9) {
        if (offset >= buffer.length) throw new Error("truncated GIF graphic control extension");
        const blockSize = buffer[offset];
        offset += 1;
        if (blockSize < 4 || offset + blockSize >= buffer.length) throw new Error("invalid GIF graphic control extension");
        pendingDelayMs = buffer.readUInt16LE(offset + 1) * 10;
        offset += blockSize;
        if (buffer[offset] !== 0) throw new Error("missing GIF graphic control terminator");
        offset += 1;
      } else {
        offset = skipSubBlocks(buffer, offset);
      }
      continue;
    }
    if (marker === 0x2c) {
      if (offset + 9 > buffer.length) throw new Error("truncated GIF image descriptor");
      const imagePacked = buffer[offset + 8];
      offset += 9;
      if (imagePacked & 0x80) offset += 3 * (2 ** ((imagePacked & 0x07) + 1));
      if (offset >= buffer.length) throw new Error("missing GIF LZW code size");
      offset += 1;
      offset = skipSubBlocks(buffer, offset);
      frameCount += 1;
      durationMs += pendingDelayMs;
      pendingDelayMs = 0;
      continue;
    }
    throw new Error(`unexpected GIF block marker 0x${marker.toString(16).padStart(2, "0")}`);
  }
  if (!trailerFound) throw new Error("GIF trailer is missing");
  return { signature, width, height, frameCount, durationMs, bytes: buffer.length };
}

export function inspectGifFile(filePath) {
  return inspectGifBuffer(fs.readFileSync(filePath));
}

export function mechanismPreviewFailures(filePath, { compact = false } = {}) {
  let report;
  try {
    report = inspectGifFile(filePath);
  } catch (error) {
    return [`${filePath}: ${error.message}`];
  }
  const limits = compact
    ? { minWidth: 280, minHeight: 150, minFrames: 8, minDurationMs: 1800, minBytes: 20000 }
    : { minWidth: 640, minHeight: 360, minFrames: 24, minDurationMs: 1800, minBytes: 120000 };
  const failures = [];
  if (report.width < limits.minWidth || report.height < limits.minHeight) failures.push(`dimensions ${report.width}x${report.height} are below ${limits.minWidth}x${limits.minHeight}`);
  if (report.frameCount < limits.minFrames) failures.push(`frame count ${report.frameCount} is below ${limits.minFrames}`);
  if (report.durationMs < limits.minDurationMs) failures.push(`duration ${report.durationMs}ms is below ${limits.minDurationMs}ms`);
  if (report.bytes < limits.minBytes) failures.push(`file size ${report.bytes} bytes is below ${limits.minBytes} bytes`);
  return failures.map((failure) => `${filePath}: ${failure}`);
}
