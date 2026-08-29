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
        const frame = window.getBounds();
        return {
          content: { width: content.width, height: content.height },
          frame: { width: frame.width, height: frame.height }
        };
      });
      viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
      if (viewport.width === geometry.content.width && viewport.height === geometry.content.height) break;
      await page.waitForTimeout(250);
    }
  } finally {
    await browserWindow.dispose();
  }
  assert.deepEqual(viewport, geometry.content, "Electron content bounds and renderer viewport must stay synchronized; otherwise a blank right/bottom gutter appears");
  const frameInsets = {
    width: Math.max(0, geometry.frame.width - geometry.content.width),
    height: Math.max(0, geometry.frame.height - geometry.content.height)
  };
  const minimumContent = {
    width: Math.max(1, originalMinimum.width - frameInsets.width),
    height: Math.max(1, originalMinimum.height - frameInsets.height)
  };
  assert.ok(
    viewport.width >= minimumContent.width && viewport.height >= minimumContent.height,
    `the operating system may clamp the requested content size, but not below the framed window minimum; viewport=${viewport.width}x${viewport.height}, minimumContent=${minimumContent.width}x${minimumContent.height}`
  );
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
