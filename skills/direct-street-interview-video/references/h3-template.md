# MiniMax H3 template

Use the Base form when there are no generation-time references. Use Ref2VA only when the user actually supplies an image or video that must control identity, wardrobe, scene, motion, or sound.

## Ref2VA skeleton

```text
subject_definitions:
<Subject 1> is the on-camera [role] whose identity, facial structure, hairstyle, body proportions, and [wardrobe anchor] come from <Picture 1>. Preserve natural skin texture and the same outfit throughout.
<Picture 1> is the identity and wardrobe reference for <Subject 1>; it is not a mandatory first frame.

summary:
[reference generation] Create a [TARGET_DURATION]-second [ASPECT_RATIO] documentary street interaction in which <Subject 1> [one-sentence social premise and resolved state].

retention_analysis:
<Subject 1>: fully_preserved — preserve identity, proportions, hairstyle, and wardrobe while allowing natural walking, speaking, gaze, and gestures.
<Picture 1>: attribute_transfer — transfer identity and wardrobe only; rebuild the street, route, framing, lighting, and action as an original scene.

detailed_description:
Natural vertical street-documentary image quality, realistic skin and fabric response, coherent background parallax, and restrained handheld motion. No unsupported resolution claim.

[Shot 1] A first-person camera [backpedals / side-walks] at [framing] on an original [street setting]. <Subject 1> begins [opening action] at [opening distance]. [Moving daylight behavior] crosses both the subject and the street; [foreground/background anchors] shift with continuous parallax. The off-screen interviewer (S1) says <d>[Chinese][SHORT LINE 1]</d>. <Subject 1> (S2) looks toward the lens, [micro-performance], and replies <d>[Chinese][SHORT LINE 2]</d>. Their steps remain synchronized with the route, with realistic foot contact and small step-linked camera sway.

[Optional Shot 2] At [MM:SS.mmm below the target duration], [only if a genuine event boundary is needed]. <Subject 1> [visible relationship-changing action] while the camera [one motivated reframe]. (S1) says <d>[Chinese][OPTIONAL SHORT LINE 3]</d>. (S2) [gesture or gaze response] and replies <d>[Chinese][OPTIONAL SHORT LINE 4]</d>. The action resolves as [permission / pose / reveal / route choice / natural release], held long enough to read before the video ends. Do not begin a new setup at the endpoint.

overall_soundscape:
Continuous location ambience from [street sound family], soft synchronized footsteps, fabric movement, and only the physical sounds caused by visible actions. Dialogue is not repeated here. No abrupt ambience reset across the optional cut.

non_diegetic_music:
N/A
```

Delete the optional shot when the scene is a single continuous event. Define only labels that correspond to real generation-time inputs, and include exactly one retention line per independent label.

## T2VA skeleton

```text
integrated_multimodal_description: [Shot 1] A [TARGET_DURATION]-second [ASPECT_RATIO] original street-documentary scene. [Stable subject appearance], [social premise], [one route], [one primary camera follow], [performance progression], [moving daylight and parallax], [approved dialogue with speaker IDs and <d> blocks], and [readable resolved state].

overall_soundscape: [Continuous location ambience, synchronized footsteps and action foley, no repeated dialogue.]

non_diegetic_music: N/A
```

## H3 audit

- First shot has no timestamp; later timestamps increase and remain below the target duration.
- All prose is English except approved dialogue inside language-tagged `<d>` blocks.
- Dialogue appears only in the visual timeline.
- No Seedance `镜头N`, braces, or `@图片N` syntax appears.
- No research video is declared as an input unless the user separately supplies it for generation.
