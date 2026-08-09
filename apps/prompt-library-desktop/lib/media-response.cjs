const fs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");

const MIME_TYPES = Object.freeze({
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webp": "image/webp"
});

function mediaContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLocaleLowerCase()] || "application/octet-stream";
}

function parseSingleByteRange(header, size) {
  if (typeof header !== "string" || !header.trim()) return null;
  if (!Number.isSafeInteger(size) || size <= 0) return { invalid: true };
  const match = /^bytes=(\d*)-(\d*)$/u.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return { invalid: true };

  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return { invalid: true };
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    if (!Number.isSafeInteger(start) || start < 0 || start >= size) return { invalid: true };
    if (match[2]) {
      end = Number(match[2]);
      if (!Number.isSafeInteger(end) || end < start) return { invalid: true };
      end = Math.min(end, size - 1);
    } else {
      end = size - 1;
    }
  }
  return { start, end };
}

function responseHeaders(filePath, length) {
  return {
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    "Content-Length": String(length),
    "Content-Type": mediaContentType(filePath),
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function createFileResponse(filePath, request) {
  const method = String(request.method || "GET").toLocaleUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const stats = fs.statSync(filePath);
  const size = stats.size;
  const rangeHeader = request.headers?.get?.("range") || "";
  const range = parseSingleByteRange(rangeHeader, size);
  if (range?.invalid) {
    return new Response(null, {
      status: 416,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes */${size}`,
        "Content-Type": mediaContentType(filePath),
        "Content-Length": "0"
      }
    });
  }

  const start = range ? range.start : 0;
  const end = range ? range.end : Math.max(0, size - 1);
  const length = size === 0 ? 0 : end - start + 1;
  const headers = responseHeaders(filePath, length);
  if (range) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  const status = range ? 206 : 200;
  if (method === "HEAD" || size === 0) return new Response(null, { status, headers });

  const stream = fs.createReadStream(filePath, { start, end });
  return new Response(Readable.toWeb(stream), { status, headers });
}

module.exports = {
  createFileResponse,
  mediaContentType,
  parseSingleByteRange
};
