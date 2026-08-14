const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright-core");

async function waitForClipboard(electronApp, predicate, message, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  let value = "";
  do {
    value = await electronApp.evaluate(({ clipboard }) => clipboard.readText());
    if (predicate(value)) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  } while (Date.now() < deadline);
  assert.fail(`${message}; clipboard contained ${JSON.stringify(value.slice(0, 120))}`);
}

async function run() {
  const appDir = path.resolve(__dirname, "..");
  const screenshotStem = path.join(os.tmpdir(), `t8-prompt-library-${Date.now()}`);
  const screenshotPath = `${screenshotStem}-catalog.png`;
  const detailScreenshotPath = `${screenshotStem}-detail.png`;
  const detailZhScreenshotPath = `${screenshotStem}-detail-zh.png`;
  const compareScreenshotPath = `${screenshotStem}-compare.png`;
  const officialScreenshotPath = `${screenshotStem}-official-skills.png`;
  const officialDetailScreenshotPath = `${screenshotStem}-official-skill-detail.png`;
  const communityScreenshotPath = `${screenshotStem}-community-skills.png`;
  const communityDetailScreenshotPath = `${screenshotStem}-community-skill-detail.png`;
  const communitySecondDetailScreenshotPath = `${screenshotStem}-community-skill-detail-2.png`;
  const responsiveDetailScreenshotPath = `${screenshotStem}-responsive-detail.png`;
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
    await page.evaluate(() => {
      localStorage.setItem("t8-display-locale", "en");
      localStorage.removeItem("t8-display-locale-default-zh-v1");
      localStorage.removeItem("t8-personal-library-v1");
    });
    await page.reload();
    const rendererErrors = [];
    page.on("pageerror", (error) => rendererErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") rendererErrors.push(message.text());
    });
    await page.waitForSelector(".case-card", { timeout: 15000 });
    const allCount = await page.locator(".case-card").count();
    assert.equal(allCount, 117, "default all-content view must render 106 cases + 9 official Skills + 2 non-official Skills");
    assert.equal(await page.locator("#view-all").getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#global-locale-zh").getAttribute("aria-pressed"), "true", "Chinese must be the first-run default");
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN", "the document language must match the first-run Chinese default");
    assert.equal(await page.evaluate(() => localStorage.getItem("t8-display-locale")), "zh-CN", "the default-Chinese migration must replace a stale English value once");
    assert.equal(await page.evaluate(() => localStorage.getItem("t8-display-locale-default-zh-v1")), "done", "the default-Chinese migration must be recorded");
    await page.locator("#global-locale-en").click();
    await page.reload();
    await page.waitForSelector(".case-card", { timeout: 15000 });
    assert.equal(await page.locator("#global-locale-en").getAttribute("aria-pressed"), "true", "an explicit English choice must persist after the migration");
    await page.locator("#global-locale-zh").click();
    assert.equal(await page.locator("#stat-cases").textContent(), "117");
    assert.equal(await page.locator("#stat-videos").textContent(), "117", "every item in the aggregate view must have a local preview");
    assert.equal(await page.locator("#stat-prompts").textContent(), "234", "all 117 items must expose their declared model surfaces");
    assert.equal(await page.locator(".case-card.official-skill img").count(), 9, "official Skills must use local GIF previews in the aggregate view");
    assert.equal(await page.locator(".compare-toggle").count(), 0, "aggregate view must not expose case-only comparison controls");
    assert.equal(await page.locator("#view-favorite-count").textContent(), "0");
    assert.equal(await page.locator("#view-collection-count").textContent(), "0");
    assert.equal(await page.locator("#view-history-count").textContent(), "0");
    await page.locator(".case-card .card-personal-button.favorite").first().click();
    assert.equal(await page.locator("#case-dialog").getAttribute("open"), null, "favorite button must not open the card");
    assert.equal(await page.locator("#view-favorite-count").textContent(), "1");
    await page.locator("#view-favorites").click();
    assert.equal(await page.locator(".case-card").count(), 1, "favorites view must contain the saved item");
    await page.locator(".case-card .card-personal-button.collections").click();
    await page.waitForSelector("#collection-membership-dialog[open]");
    await page.locator("#membership-new-collection").click();
    await page.waitForSelector("#collection-editor-dialog[open]");
    await page.locator("#collection-name").fill("Review later");
    await page.locator("#save-collection").click();
    await page.waitForSelector("#collection-membership-dialog[open]");
    await page.locator(".collection-membership-row input").check();
    await page.locator("#close-collection-membership").click();
    assert.equal(await page.locator("#view-collection-count").textContent(), "1");
    await page.locator(".case-card").click();
    await page.waitForSelector("#case-dialog[open]");
    assert.equal(await page.locator("#view-history-count").textContent(), "1");
    await page.keyboard.press("Escape");
    await page.locator("#view-history").click();
    assert.equal(await page.locator(".case-card").count(), 1, "history view must contain the opened item");
    await page.locator("#view-collections").click();
    assert.equal(await page.locator("#collection-select").inputValue(), await page.locator("#collection-select option").getAttribute("value"));
    assert.equal(await page.locator(".case-card").count(), 1, "selected collection must contain the assigned item");
    await page.reload();
    await page.waitForSelector(".case-card", { timeout: 15000 });
    assert.equal(await page.locator("#view-favorite-count").textContent(), "1", "favorites must persist across reload");
    assert.equal(await page.locator("#view-collection-count").textContent(), "1", "collections must persist across reload");
    assert.equal(await page.locator("#view-history-count").textContent(), "1", "history must persist across reload");
    await page.locator("#global-locale-zh").click();
    await page.reload();
    await page.waitForSelector(".case-card", { timeout: 15000 });
    assert.equal(await page.locator("#global-locale-zh").getAttribute("aria-pressed"), "true", "selected locale must persist across reload");
    await page.locator("#search").fill("First-Person Passage");
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length > 0);
    assert.ok(await page.locator(".case-card").count() >= 1, "Chinese display mode must still search English sidecars");
    await page.locator("#search").fill("空气净化");
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length > 0);
    assert.ok(await page.locator(".case-card").count() >= 1, "Chinese search must find Chinese sidecar content");
    await page.locator("#search").fill("");
    await page.locator("#global-locale-en").click();
    await page.screenshot({ path: screenshotPath, animations: "disabled" });

    await page.locator("#view-cases").click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card:not(.official-skill):not(.community-skill)").length === 106);
    const caseCount = await page.locator(".case-card").count();
    assert.equal(caseCount, 106, "viewer must render all 106 public cases");
    assert.equal(await page.locator("#stat-videos").textContent(), "106", "development media pack must bind 106 case MP4s");
    await page.locator("#platform-filter").selectOption("platform:x");
    assert.ok(await page.locator(".case-card").count() > 10, "stable platform filter must retain the X case set");

    await page.locator(".case-card").first().dispatchEvent("click");
    await page.waitForSelector("#case-dialog[open]");
    assert.equal(await page.locator("#detail-favorite").getAttribute("aria-pressed"), "true", "detail favorite state must match the persisted card state");
    await page.locator("#detail-collections").dispatchEvent("click");
    await page.waitForSelector("#collection-membership-dialog[open]");
    assert.equal(await page.locator(".collection-membership-row").count(), 1, "detail view must manage collection membership without closing the case");
    await page.locator("#close-collection-membership").click();
    assert.equal(await page.locator("#case-dialog").getAttribute("open"), "", "closing collection membership must return to the open detail dialog");
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
    assert.equal(await page.locator("#detail-locale-en").getAttribute("aria-pressed"), "true");
    const englishTitle = await page.locator("#detail-title").textContent();
    assert.doesNotMatch(englishTitle, /[\u4E00-\u9FFF]/u, "English detail title must not fall back to Chinese");
    assert.equal(await page.locator("#quick-start .quick-card").count(), 6, "quick start must expose six reviewed fields");
    assert.equal(await page.locator("#tab-h3").getAttribute("aria-controls"), "prompt-panel");
    assert.equal(await page.locator("#prompt-panel").getAttribute("role"), "tabpanel");
    await page.locator("#tab-h3").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#tab-seedance").getAttribute("aria-selected"), "true", "ArrowRight must activate the next model tab");
    assert.equal(await page.evaluate(() => document.activeElement?.id), "tab-seedance", "keyboard activation must move focus with the active tab");
    assert.equal(await page.locator("#prompt-panel").getAttribute("aria-labelledby"), "tab-seedance");
    await page.keyboard.press("ArrowLeft");
    assert.equal(await page.locator("#tab-h3").getAttribute("aria-selected"), "true", "ArrowLeft must return to the previous model tab");
    assert.equal(await page.locator("#creative-dna .dna-item .copy-secondary").count(), await page.locator("#creative-dna .dna-item").count(), "every Creative DNA section needs its own copy button");
    await page.locator("#copy-overview").click();
    await waitForClipboard(electronApp, (value) => /^# .+\n/u.test(value), "overview copy must be structured Markdown");
    assert.equal(await page.locator("#copy-overview").textContent(), "✓ Copied", "copy buttons must show an immediate visible success state");
    assert.equal(await page.locator("#copy-overview").getAttribute("data-copy-state"), "success");
    assert.equal(await page.locator("#copy-overview").isDisabled(), false, "copy feedback must not disable repeated copying");
    await electronApp.evaluate(({ clipboard }) => clipboard.writeText("repeat-copy-sentinel"));
    await page.locator("#copy-overview").click();
    await waitForClipboard(electronApp, (value) => /^# .+\n/u.test(value), "copy button must remain reusable while success feedback is visible");
    await page.waitForTimeout(1700);
    assert.equal(await page.locator("#copy-overview").textContent(), "Copy overview", "copy button must restore its idle label after feedback");
    assert.equal(await page.locator("#copy-overview").getAttribute("data-copy-state"), null);
    await page.locator("#copy-source-link").click();
    await waitForClipboard(electronApp, (value) => /^https:\/\/(?:x\.com|www\.reddit\.com)\//u.test(value), "source copy must preserve the exact HTTPS post URL");
    await page.locator("#copy-quick-start").click();
    await waitForClipboard(electronApp, (value) => /## Quick start[\s\S]+## Recommended input format/u.test(value), "quick-start copy must include its reviewed fields");
    await page.locator("#copy-dna").click();
    await waitForClipboard(electronApp, (value) => /## Creative DNA[\s\S]+## Core mechanism/u.test(value), "Creative DNA copy must include all top-level sections");
    await page.locator("#creative-dna .dna-item .copy-secondary").first().click();
    await waitForClipboard(electronApp, (value) => /^## /u.test(value), "individual DNA cards must copy a labeled Markdown section");
    await page.locator("#copy-validation").click();
    await waitForClipboard(electronApp, (value) => /## Validation[\s\S]+Template ID/u.test(value), "validation copy must include delivery identity");
    const promptBeforeCopy = await page.locator("#prompt-text").textContent();
    await page.locator("#copy-prompt").click();
    await waitForClipboard(electronApp, (value) => value === promptBeforeCopy, "prompt copy must preserve canonical prompt bytes");
    const timeBeforeLocale = await video.evaluate((node) => node.currentTime);
    await page.locator("#detail-locale-zh").click();
    assert.equal(await page.locator("#detail-locale-zh").getAttribute("aria-pressed"), "true");
    assert.match(await page.locator("#detail-title").textContent(), /[\u4E00-\u9FFF]/u, "Chinese detail title must be reviewed Chinese content");
    assert.equal(await page.locator("#prompt-text").textContent(), promptBeforeCopy, "display locale must never translate or alter canonical prompt bytes");
    assert.match(await page.locator("#prompt-language-title").textContent(), /MiniMax H3 英文可执行原文/u, "Chinese UI must identify H3 as an English executable original");
    assert.match(await page.locator("#prompt-language-note").textContent(), /strict_english.*复制.*英文原文/u, "H3 boundary notice must explain why the executable prompt remains English");
    assert.equal(await page.locator("#prompt-structure-guide").isVisible(), true, "Chinese UI must provide a non-executable H3 structure guide");
    assert.ok(await page.locator("#prompt-structure-list li").count() >= 3, "H3 structure guide must explain execution, anchors, and sound fields");
    await page.locator("#tab-seedance").click();
    assert.match(await page.locator("#prompt-language-title").textContent(), /Seedance 2\.0 中文可执行原文/u);
    assert.equal(await page.locator("#prompt-structure-guide").isHidden(), true, "Chinese structure guide is only needed for strict-English H3 prompts");
    await page.locator("#tab-h3").click();
    assert.ok(Math.abs((await video.evaluate((node) => node.currentTime)) - timeBeforeLocale) < 0.05, "locale switch must preserve media time");
    assert.equal(await page.locator("#tab-h3").getAttribute("aria-selected"), "true", "locale switch must preserve the active model tab");
    assert.equal(await page.locator("#platform-filter").inputValue(), "platform:x", "locale switch must preserve stable filter values");
    await page.locator("#detail-validation").scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    const stickyGeometry = await page.evaluate(() => {
      const header = document.querySelector("#case-dialog .dialog-header").getBoundingClientRect();
      const nav = document.querySelector("#detail-nav").getBoundingClientRect();
      return { headerBottom: header.bottom, navTop: nav.top };
    });
    assert.ok(stickyGeometry.navTop >= stickyGeometry.headerBottom - 2, `detail navigation must stay below the localized sticky header (${stickyGeometry.navTop} >= ${stickyGeometry.headerBottom})`);
    await page.screenshot({ path: detailZhScreenshotPath, animations: "disabled" });
    await page.locator("#copy-full-item").click();
    const fullCopy = await waitForClipboard(electronApp, (value) => /MiniMax H3 \(英文; 规范可执行提示词原文\)/u.test(value), "full-item copy must contain both localized metadata and canonical prompts");
    assert.match(fullCopy, /MiniMax H3 \(英文; 规范可执行提示词原文\)/u);
    assert.match(fullCopy, /Seedance 2\.0 \(中文; 规范可执行提示词原文\)/u);
    assert.match(fullCopy, /## Creative DNA/u);
    assert.ok(fullCopy.length < 100000, "full-item copy must fit the bounded clipboard contract without truncation");
    await page.locator("#detail-locale-en").click();
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
    await page.locator("#compare-tab-h3").focus();
    await page.keyboard.press("End");
    assert.equal(await page.locator("#compare-tab-seedance").getAttribute("aria-selected"), "true", "End must activate the final comparison model tab");
    assert.equal(await page.locator("#compare-grid").getAttribute("aria-labelledby"), "compare-tab-seedance");
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
    assert.match(await page.locator("#prompt-text").textContent(), /This entry points to the MiniMax-AI/u, "official access metadata must follow the currently selected English display mode");
    await page.locator("#detail-locale-zh").click();
    assert.match(await page.locator("#prompt-text").textContent(), /此条目来自 MiniMax-AI/u, "official access metadata must switch to reviewed Chinese");
    await page.locator("#detail-locale-en").click();
    assert.match(await page.locator("#detail-meta").textContent(), /not imported/i);
    await page.locator("#copy-full-item").click();
    const officialFullCopy = await waitForClipboard(electronApp, (value) => /npx skills add https:\/\/github\.com\/MiniMax-AI\/MiniMax-H3/u.test(value), "official full copy must include pinned installation metadata");
    assert.match(officialFullCopy, /npx skills add https:\/\/github\.com\/MiniMax-AI\/MiniMax-H3/u, "official full copy must include pinned installation metadata");
    assert.match(officialFullCopy, /Seedance 2\.0/u, "official full copy must include the local Seedance companion");
    await page.locator("#tab-seedance").click();
    assert.match(await page.locator("#prompt-text").textContent(), /Seedance/u);
    await page.waitForTimeout(150);
    await page.screenshot({ path: officialDetailScreenshotPath, animations: "disabled" });

    await page.keyboard.press("Escape");
    await page.locator("#case-dialog").waitFor({ state: "hidden" });
    await page.locator("#view-community-skills").click();
    await page.waitForFunction(() => document.querySelectorAll(".case-card.community-skill").length === 2);
    assert.equal(await page.locator(".case-card.community-skill").count(), 2, "viewer must render both non-official user-contributed Skills");
    assert.equal(await page.locator("#stat-cases").textContent(), "2");
    assert.equal(await page.locator("#stat-videos").textContent(), "2");
    assert.equal(await page.locator("#stat-prompts").textContent(), "4");
    assert.equal(await page.locator(".compare-toggle").count(), 0, "community Skills do not enter case comparison");
    await page.screenshot({ path: communityScreenshotPath, animations: "disabled" });
    await page.locator(".case-card.community-skill").first().click();
    await page.waitForSelector("#case-dialog[open]");
    const communityVideo = page.locator("#detail-media video");
    await communityVideo.waitFor({ state: "visible" });
    const communityVideoState = await communityVideo.evaluate(async (node) => {
      if (node.readyState < 1) await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("community video metadata timeout")), 12000);
        node.addEventListener("loadedmetadata", () => { clearTimeout(timeout); resolve(); }, { once: true });
        node.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(node.error?.message || "community video load error")); }, { once: true });
      });
      return { duration: node.duration, muted: node.muted, controls: node.controls, src: node.getAttribute("src") };
    });
    assert.match(communityVideoState.src, /^t8media:\/\/media\/community-skills\//u);
    assert.ok(Math.abs(communityVideoState.duration - 10.125) < 0.05, "community Skill must expose the complete reference video");
    assert.equal(communityVideoState.muted, false);
    assert.equal(communityVideoState.controls, true);
    assert.match(await page.locator("#detail-meta").textContent(), /Community|User-supplied/i);
    assert.equal(await page.locator("#open-source").isHidden(), true, "missing source URL must not be fabricated");
    assert.match(await page.locator("#prompt-text").textContent(), /subject_definitions:/u);
    await page.locator("#tab-seedance").click();
    assert.match(await page.locator("#prompt-text").textContent(), /Seedance|街拍/u);
    await page.screenshot({ path: communityDetailScreenshotPath, animations: "disabled" });

    await page.keyboard.press("Escape");
    await page.locator("#case-dialog").waitFor({ state: "hidden" });
    await page.locator(".case-card.community-skill").nth(1).click();
    await page.waitForSelector("#case-dialog[open]");
    const secondCommunityVideo = page.locator("#detail-media video");
    await secondCommunityVideo.waitFor({ state: "visible" });
    const secondCommunityState = await secondCommunityVideo.evaluate(async (node) => {
      if (node.readyState < 1) await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("second community video metadata timeout")), 12000);
        node.addEventListener("loadedmetadata", () => { clearTimeout(timeout); resolve(); }, { once: true });
        node.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(node.error?.message || "second community video load error")); }, { once: true });
      });
      return { duration: node.duration, muted: node.muted, controls: node.controls, src: node.getAttribute("src") };
    });
    assert.match(secondCommunityState.src, /stage-startle-to-truce-encounter\/preview\.mp4$/u);
    assert.ok(Math.abs(secondCommunityState.duration - 13.396) < 0.05, "second community Skill must expose the complete compatible reference video");
    assert.equal(secondCommunityState.muted, false);
    assert.equal(secondCommunityState.controls, true);
    assert.match(await page.locator("#detail-meta").textContent(), /Community|User-supplied/i);
    assert.equal(await page.locator("#open-source").isHidden(), true, "second community Skill must not fabricate a source URL");
    assert.match(await page.locator("#prompt-text").textContent(), /integrated_multimodal_description:/u);
    await page.locator("#tab-seedance").click();
    assert.match(await page.locator("#prompt-text").textContent(), /镜头1|深海/u);
    await page.screenshot({ path: communitySecondDetailScreenshotPath, animations: "disabled" });
    await page.setViewportSize({ width: 760, height: 720 });
    assert.equal(await page.locator("#copy-full-item").isVisible(), true, "full-copy action must remain visible at narrow width");
    assert.equal(await page.locator("#detail-locale-zh").isVisible(), true, "locale switch must remain visible at narrow width");
    assert.equal(await page.locator("#quick-start").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length), 1, "quick-start cards must collapse to one column");
    const narrowOverflow = await page.evaluate(() => ({ document: [document.documentElement.scrollWidth, document.documentElement.clientWidth], dialog: [document.querySelector("#case-dialog .dialog-shell").scrollWidth, document.querySelector("#case-dialog .dialog-shell").clientWidth] }));
    assert.ok(narrowOverflow.document[0] <= narrowOverflow.document[1], `document must not overflow horizontally at 760px (${narrowOverflow.document.join(" > ")})`);
    assert.ok(narrowOverflow.dialog[0] <= narrowOverflow.dialog[1], `detail dialog must not overflow horizontally at 760px (${narrowOverflow.dialog.join(" > ")})`);
    await page.screenshot({ path: responsiveDetailScreenshotPath, animations: "disabled" });
    assert.deepEqual(rendererErrors, [], `renderer errors: ${rendererErrors.join(" | ")}`);

    console.log(`PASS Electron runtime; all=${allCount}; cases=${caseCount}; officialSkills=9; communitySkills=2; video=${videoState.duration.toFixed(3)}s; seekable=${videoState.seekableStart.toFixed(3)}-${videoState.seekableEnd.toFixed(3)}s; seek=${videoState.seekTarget.toFixed(3)}->${videoState.soughtTime.toFixed(3)}->${videoState.playedTime.toFixed(3)}s; screenshots=${screenshotPath};${detailScreenshotPath};${detailZhScreenshotPath};${compareScreenshotPath};${officialScreenshotPath};${officialDetailScreenshotPath};${communityScreenshotPath};${communityDetailScreenshotPath};${communitySecondDetailScreenshotPath};${responsiveDetailScreenshotPath}`);
  } finally {
    await electronApp.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
