const ALLOWED_EXTERNAL_HOSTS = Object.freeze([
  "x.com",
  "twitter.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "huggingface.co",
  "github.com",
  "minimax.io",
  "minimaxi.com",
  "hailuoai.video",
  "bytedance.com",
  "capcut.com"
]);

function isAllowedHost(hostname) {
  const host = String(hostname || "").toLocaleLowerCase().replace(/\.$/u, "");
  return ALLOWED_EXTERNAL_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function allowedExternalUrl(value) {
  try {
    const parsed = new URL(String(value));
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || !isAllowedHost(parsed.hostname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

module.exports = {
  ALLOWED_EXTERNAL_HOSTS,
  allowedExternalUrl,
  isAllowedHost
};
