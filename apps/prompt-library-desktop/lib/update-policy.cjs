const DEFAULT_DELAY_MS = 15000;
const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 300000;

function automaticUpdateDelay({ isPackaged, env = process.env }) {
  if (!isPackaged || env.T8_DISABLE_AUTO_UPDATE === "1") return null;
  const requested = Number(env.T8_UPDATE_CHECK_DELAY_MS);
  if (!Number.isFinite(requested)) return DEFAULT_DELAY_MS;
  return Math.min(MAX_DELAY_MS, Math.max(MIN_DELAY_MS, Math.round(requested)));
}

module.exports = {
  DEFAULT_DELAY_MS,
  automaticUpdateDelay
};
