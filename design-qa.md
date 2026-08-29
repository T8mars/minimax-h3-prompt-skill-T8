# Design QA — Electron catalog viewport gutter

## Comparison target

- Source visual truth: `codex-clipboard-d1ed5331-a4e5-4951-9ede-2c54afc6df48.png` (user-provided screenshot; external QA artifact).
- Source pixels: 1598 × 963, including the Windows frame and surrounding desktop.
- Normalized source content: `t8-layout-source-normalized.png`, cropped to 1464 × 900 at `+30+54` (external QA artifact).
- Rendered implementation: `t8-catalog-layout-1788024458059-1464x900.png` (external QA artifact).
- Combined before/after comparison: `t8-layout-before-after.png` (external QA artifact).
- CSS viewport: 1464 × 900 at device scale factor 1; implementation pixels: 1464 × 900.
- State: Chinese catalog, search query `空气净化`, newest-added sorting, one result, dark theme.

## Full-view comparison evidence

The normalized source and rendered implementation were appended into one 2928 × 900 comparison image. In the source half, the renderer scrollbar stops near x=1280 while the Electron content bounds continue for roughly another 184 px, producing the reported blank black gutter. In the implementation half, the native scrollbar sits at the far-right content edge and the top bar, main catalog, statistics, filters, and result grid fill the complete document width.

## Focused region evidence

The right edge is the decisive focused region and is fully visible in the combined image. Automated geometry confirms that BrowserWindow content bounds equal `window.innerWidth/innerHeight`, while the body, `main`, and `.topbar` end at `document.documentElement.clientWidth`; the only width difference is the native 15 px vertical scrollbar.

## Required fidelity surfaces

- Fonts and typography: unchanged from the existing T8 Inter/system stack; hierarchy, weights, wrapping, and Chinese labels remain consistent.
- Spacing and layout rhythm: fixed. The missing right-side width is restored without changing the established paddings, grid gaps, card radii, or header rhythm.
- Colors and visual tokens: unchanged; black/acid-green tokens and semantic states match the existing application.
- Image quality and asset fidelity: the original local preview asset remains sharp and correctly cropped; no placeholder or replacement asset was introduced.
- Copy and content: unchanged except for live personal counts in the clean E2E profile, which are expected state differences rather than design drift.

## Findings and comparison history

1. `[P1] Electron renderer viewport narrower than the outer content area`
   - Before: Playwright `page.setViewportSize()` emulated a 1280 px renderer inside a wider Electron window, leaving a visible right gutter after interrupted validation.
   - Fix: all Electron E2E flows now resize `BrowserWindow.setContentSize()` and assert renderer/content-bound equality; SIGINT/SIGTERM cleanup closes test windows.
   - Post-fix evidence: `t8-catalog-layout-1788024458059-1464x900.png` and the combined before/after image show the scrollbar at the far-right edge with no gutter.

2. `[P2] Workbench GIF preview could remain on its poster after layout verification`
   - Before: an off-DOM GIF preloader could remain pending while the visible preview stayed in `poster` state.
   - Fix: the connected preview image now shows the poster first, then promotes itself to the GIF with a poster fallback on failure.
   - Post-fix evidence: the full workbench E2E reached `data-state="ready"` and passed.

## Primary interactions and runtime checks

- Catalog search, sorting, language state, and card rendering exercised.
- Desktop, 760 px, 720 px, and 520 px window sizes exercised without renderer-only viewport overrides.
- Workbench, API settings, Music 3, creator revision/reset, result-video playback, and ComfyUI export exercised.
- Console and renderer errors checked; final successful runs reported none.

## Remaining findings

No actionable P0/P1/P2 visual differences remain. The clean E2E profile intentionally has empty favorites, collections, and history counts, unlike the user's persisted profile.

final result: passed
