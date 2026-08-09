const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

async function run() {
  const appDir = path.resolve(__dirname, "..");
  const screenshotStem = path.join(os.tmpdir(), `t8-prompt-library-${Date.now()}`);
  const screenshotPath = `${screenshotStem}-catalog.png`;
  const detailScreenshotPath = `${screenshotStem}-detail.png`;
  const compareScreenshotPath = `${screenshotStem}-compare.png`;
  const officialScreenshotPath = `${screenshotStem}-official-skills.png`;
  const officialDetailScreenshotPath = `${screenshotStem}-official-skill-detail.png`;
  const communityScreenshotPath = `${screenshotStem}-community-skills.png`;
  const communityDetailScreenshotPath = `${screenshotStem}-community-skill-detail.png`;
  const packagedExecutable = process.env.T8_E2E_EXECUTABLE ? path.resolve(process.env.T8_E2E_EXECUTABLE) : null;
  const electronApp = await electron.launch({
    executablePath: packagedExecutable || require("electron"),
    args: packagedExecutable ? [] : [appDir],
    cwd: appDir,
    env: {
      ...process.env,
      T8_DISABLE_AUTO_UPDATE: "1",
      ELECTRON_DISABLE_SECURITY_WARNINGS: "true"
    }
  });

  try {
    const page = await electronApp.firstWindow();
    await page.setViewportSize({ width: 1280, height: 720 });
    const rendererErrors = [];
    page.on("pageerror", (error) => rendererErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") rendererErrors.push(message.text());
    });
    await page.waitForSelector(".case-card", { timeout: 15000 });
    const allCount = await page.locator(".case-card").count();
    assert.equal(allCount, 20, "default all-content view must render 10 cases + 9 official Skills + 1 non-official Skill");
    assert.equal(await page.locator("#view-all").getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#stat-cases").textContent(), "20");
    assert.equal(await page.locator("#stat-videos").textContent(), "20", "every item in the aggregate view must have a local preview");
    assert.equal(await page.locator("#stat-prompts").textContent(), "40", "all 20 items must expose both model surfaces");
    assert.equal(await page.locator(".case-card.official-skill img").count(), 9, "official Skills must use local GIF previews in the aggregate view");
    assert.equal(await page.locator(".compare-toggle").count(), 0, "aggregate view must not expose case-only comparison controls");
    await page.screenshot({ path: screenshotPath, animations: "disabled" });

    await page.locator("#view-cases").click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card:not(.official-skill):not(.community-skill)").length === 10);
    const caseCount = await page.locator(".case-card").count();
    assert.equal(caseCount, 10, "viewer must render all ten public cases");
    assert.equal(await page.locator("#stat-videos").textContent(), "10", "development media pack must bind ten case MP4s");

    await page.locator(".case-card").first().click();
    await page.waitForSelector("#case-dialog[open]");
    const video = page.locator("#detail-media video");
    await video.waitFor({ state: "visible" });
    const videoState = await video.evaluate(async (node) => {
      if (node.readyState < 1) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("video metadata timeout")), 12000);
          node.addEventListener("loadedmetadata", () => { clearTimeout(timeout); resolve(); }, { once: true });
          node.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(node.error?.message || "video load error")); }, { once: true });
        });
      }
      await new Promise((resolve, reject) => {
        const startedAt = performance.now();
        const poll = () => {
          if (node.seekable.length > 0 && node.seekable.end(node.seekable.length - 1) > node.duration / 2) return resolve();
          if (node.error) return reject(new Error(node.error.message || `video error ${node.error.code}`));
          if (performance.now() - startedAt > 12000) return reject(new Error("video seekable range timeout"));
          setTimeout(poll, 50);
        };
        poll();
      });
      const seekableStart = node.seekable.start(0);
      const seekableEnd = node.seekable.end(node.seekable.length - 1);
      const seekTarget = node.duration * 0.55;
      const seeked = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("video seek timeout")), 12000);
        node.addEventListener("seeked", () => { clearTimeout(timeout); resolve(); }, { once: true });
        node.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(node.error?.message || "video seek error")); }, { once: true });
      });
      node.currentTime = seekTarget;
      await seeked;
      const soughtTime = node.currentTime;
      await node.play();
      await new Promise((resolve) => setTimeout(resolve, 650));
      const playedTime = node.currentTime;
      node.pause();
      return {
        src: node.getAttribute("src"),
        duration: node.duration,
        muted: node.muted,
        controls: node.controls,
        error: node.error?.code || null,
        seekableStart,
        seekableEnd,
        seekTarget,
        soughtTime,
        playedTime
      };
    });
    assert.match(videoState.src, /^t8media:\/\/media\//u);
    assert.ok(Number.isFinite(videoState.duration) && videoState.duration > 0, "full MP4 metadata must decode");
    assert.equal(videoState.muted, false, "detail player must retain audio");
    assert.equal(videoState.controls, true);
    assert.equal(videoState.error, null);
    assert.ok(videoState.seekableEnd >= videoState.seekTarget, "MP4 must expose a useful seekable range");
    assert.ok(Math.abs(videoState.soughtTime - videoState.seekTarget) < 0.75, "seeking to the middle must succeed");
    assert.ok(videoState.playedTime > videoState.soughtTime + 0.15, "video must continue playing after a range seek");
    assert.ok((await page.locator("#prompt-text").textContent()).length > 100, "model prompt must render");
    await page.screenshot({ path: detailScreenshotPath, animations: "disabled" });

    await page.keyboard.press("Escape");
    await page.locator("#case-dialog").waitFor({ state: "hidden" });
    assert.equal(await page.locator("#detail-media video").count(), 1, "player element remains reusable after cleanup");
    assert.equal(await page.locator("#detail-media video").getAttribute("src"), null, "closing details must clear video source");

    await page.locator(".compare-toggle").nth(0).click();
    await page.locator(".compare-toggle").nth(1).click();
    assert.equal(await page.locator("#open-compare").isEnabled(), true);
    await page.locator("#open-compare").click();
    await page.waitForSelector("#compare-dialog[open]");
    assert.equal(await page.locator(".compare-column").count(), 2);
    assert.ok((await page.locator(".compare-prompt").first().textContent()).length > 100);
    await page.screenshot({ path: compareScreenshotPath, animations: "disabled" });
    await page.keyboard.press("Escape");
    await page.locator("#compare-dialog").waitFor({ state: "hidden" });

    await page.locator("#view-official-skills").click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card.official-skill").length === 9);
    assert.equal(await page.locator(".case-card.official-skill").count(), 9, "viewer must render all nine official repository entries");
    assert.equal(await page.locator("#stat-cases").textContent(), "9");
    assert.equal(await page.locator("#stat-videos").textContent(), "9");
    assert.equal(await page.locator("#stat-prompts").textContent(), "9");
    assert.equal(await page.locator(".compare-toggle").count(), 0, "official Skills do not enter case comparison");
    assert.equal(await page.locator(".case-card.official-skill img").count(), 9, "all official entries must render local GIFs instead of placeholder art");
    const officialImages = page.locator(".case-card.official-skill img");
    for (let index = 0; index < 9; index += 1) {
      const image = officialImages.nth(index);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async (node) => {
        if (!node.complete) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error(`official GIF timed out: ${node.src}`)), 12000);
            node.addEventListener("load", () => { clearTimeout(timeout); resolve(); }, { once: true });
            node.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(`official GIF failed: ${node.src}`)); }, { once: true });
          });
        }
        if (node.naturalWidth <= 0 || node.naturalHeight <= 0) throw new Error(`official GIF did not decode: ${node.src}`);
      });
    }
    await officialImages.first().scrollIntoViewIfNeeded();
    assert.match(await officialImages.first().getAttribute("src"), /^t8media:\/\/catalog\/official-skills\/previews\//u);
    await page.screenshot({ path: officialScreenshotPath, animations: "disabled" });
    await page.locator(".case-card.official-skill").first().click();
    await page.waitForSelector("#case-dialog[open]");
    assert.equal(await page.locator("#detail-media video").count(), 0, "official Skill details do not pretend to have a case video");
    assert.equal(await page.locator("#detail-media img").count(), 1, "official Skill details must show the local GIF preview");
    assert.match(await page.locator("#detail-media img").getAttribute("src"), /^t8media:\/\/catalog\/official-skills\/previews\//u);
    assert.match(await page.locator("#prompt-text").textContent(), /npx skills add https:\/\/github\.com\/MiniMax-AI\/MiniMax-H3/u);
    assert.match(await page.locator("#detail-meta").textContent(), /不导入/u);
    await page.locator("#tab-seedance").click();
    assert.match(await page.locator("#prompt-text").textContent(), /Seedance/u);
    await page.waitForTimeout(150);
    await page.screenshot({ path: officialDetailScreenshotPath, animations: "disabled" });

    await page.keyboard.press("Escape");
    await page.locator("#case-dialog").waitFor({ state: "hidden" });
    await page.locator("#view-community-skills").click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card.community-skill").length === 1);
    assert.equal(await page.locator(".case-card.community-skill").count(), 1, "viewer must render the non-official user-contributed Skill");
    assert.equal(await page.locator("#stat-cases").textContent(), "1");
    assert.equal(await page.locator("#stat-videos").textContent(), "1");
    assert.equal(await page.locator("#stat-prompts").textContent(), "2");
    assert.equal(await page.locator(".compare-toggle").count(), 0, "community Skills do not enter case comparison");
    await page.screenshot({ path: communityScreenshotPath, animations: "disabled" });
    await page.locator(".case-card.community-skill").click();
    await page.waitForSelector("#case-dialog[open]");
    const communityVideo = page.locator("#detail-media video");
    await communityVideo.waitFor({ state: "visible" });
    const communityVideoState = await communityVideo.evaluate(async (node) => {
      if (node.readyState < 1) await new Promise((resolve) => node.addEventListener("loadedmetadata", resolve, { once: true }));
      return { duration: node.duration, muted: node.muted, controls: node.controls, src: node.getAttribute("src") };
    });
    assert.match(communityVideoState.src, /^t8media:\/\/media\/community-skills\//u);
    assert.ok(Math.abs(communityVideoState.duration - 10.125) < 0.05, "community Skill must expose the complete reference video");
    assert.equal(communityVideoState.muted, false);
    assert.equal(communityVideoState.controls, true);
    assert.match(await page.locator("#detail-meta").textContent(), /非官方|用户提供/u);
    assert.equal(await page.locator("#open-source").isHidden(), true, "missing source URL must not be fabricated");
    assert.match(await page.locator("#prompt-text").textContent(), /subject_definitions:/u);
    await page.locator("#tab-seedance").click();
    assert.match(await page.locator("#prompt-text").textContent(), /Seedance|街拍/u);
    await page.screenshot({ path: communityDetailScreenshotPath, animations: "disabled" });
    assert.deepEqual(rendererErrors, [], `renderer errors: ${rendererErrors.join(" | ")}`);

    console.log(`PASS Electron runtime; all=${allCount}; cases=${caseCount}; officialSkills=9; communitySkills=1; video=${videoState.duration.toFixed(3)}s; seekable=${videoState.seekableStart.toFixed(3)}-${videoState.seekableEnd.toFixed(3)}s; seek=${videoState.seekTarget.toFixed(3)}->${videoState.soughtTime.toFixed(3)}->${videoState.playedTime.toFixed(3)}s; screenshots=${screenshotPath};${detailScreenshotPath};${compareScreenshotPath};${officialScreenshotPath};${officialDetailScreenshotPath};${communityScreenshotPath};${communityDetailScreenshotPath}`);
  } finally {
    await electronApp.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
