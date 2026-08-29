const assert = require("node:assert/strict");

const originalMinimumSizes = new WeakMap();

async function setElectronContentSize(electronApp, page, { width, height }) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(250);
  const browserWindow = await electronApp.browserWindow(page);
  if (!originalMinimumSizes.has(electronApp)) {
    const originalMinimum = await browserWindow.evaluate((window) => {
      const [minimumWidth, minimumHeight] = window.getMinimumSize();
      return { width: minimumWidth, height: minimumHeight };
    });
    originalMinimumSizes.set(electronApp, originalMinimum);
  }
  const originalMinimum = originalMinimumSizes.get(electronApp);
  await browserWindow.evaluate((window, requested) => {
    if (window.isDestroyed()) throw new Error("Electron E2E window is unavailable");
    window.setMinimumSize(
      Math.min(requested.originalMinimum.width, requested.width),
      Math.min(requested.originalMinimum.height, requested.height)
    );
    window.setContentSize(requested.width, requested.height);
    if (requested.width >= requested.originalMinimum.width && requested.height >= requested.originalMinimum.height) {
      window.setMinimumSize(requested.originalMinimum.width, requested.originalMinimum.height);
    }
  }, { width, height, originalMinimum });

  let geometry;
  let viewport;
  try {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      geometry = await browserWindow.evaluate((window) => {
        if (window.isDestroyed()) throw new Error("Electron E2E window is unavailable");
        const content = window.getContentBounds();
        return { width: content.width, height: content.height };
      });
      viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
      if (viewport.width === geometry.width && viewport.height === geometry.height) break;
      await page.waitForTimeout(250);
    }
  } finally {
    await browserWindow.dispose();
  }
  assert.deepEqual(viewport, geometry, "Electron content bounds and renderer viewport must stay synchronized; otherwise a blank right/bottom gutter appears");
  return viewport;
}

function installElectronExitCleanup(electronApp) {
  let closing = false;
  const closeForSignal = async (exitCode) => {
    if (closing) return;
    closing = true;
    try {
      await electronApp.close();
    } finally {
      process.exit(exitCode);
    }
  };
  const onSigint = () => { void closeForSignal(130); };
  const onSigterm = () => { void closeForSignal(143); };
  process.once("SIGINT", onSigint);
  process.once("SIGTERM", onSigterm);
  return () => {
    process.removeListener("SIGINT", onSigint);
    process.removeListener("SIGTERM", onSigterm);
  };
}

module.exports = { installElectronExitCleanup, setElectronContentSize };
