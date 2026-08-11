# MiniMax H3 template

Use Base T2VA when there are no generation-time references. Use Ref2VA only when the user actually supplies an image or video for identity, wardrobe, scene, motion, camera, or sound.

## Recommended T2VA structure

```text
integrated_multimodal_description: [Shot 1] [Original calm subject, baseline behavior, distant observer, readable separation, light and environment.] [Shot 2] At [timestamp], [observer POV inside a technical enclosure; attention shift and spatial cue.] [Shot 3] At [timestamp], [one bounded non-lethal escalation and coherent distance-closing trajectory.] [Shot 4] At [timestamp], [subject reaches the transparent boundary; matched speed, exact eyeline, observer startle.] [Shot 5] At [timestamp], [small conciliatory offer and held visible response in a shared-axis composition.]

overall_soundscape: [Continuous environment and machine ambience, synchronized movement, one escalation transient, barrier-level detail, and restrained settling sounds. Do not repeat dialogue.]

non_diegetic_music: [Optional concise audience-only score, or N/A.]
```

## Optional Ref2VA identity block

```text
subject_definitions:
<Subject 1> is the adult [ROLE] whose identity, facial structure, hairstyle, body proportions, and [WARDROBE ANCHORS] come from <Picture 1>.

summary:
[reference generation] Create an original [DURATION]-second [ASPECT] startle-to-truce encounter in which <Subject 1> closes an impossible distance to a technical observer and resolves the encounter through gaze and one restrained gesture.

retention_analysis:
<Subject 1>: fully_preserved — preserve identity, proportions, hairstyle, and wardrobe while allowing new performance and movement.

detailed_description:
[Write original style and five evidence-bearing shots. State that <Picture 1> supplies identity and wardrobe only; rebuild setting, composition, action, observer, boundary, and lighting.]

overall_soundscape:
[Continuous ambience and synchronized physical effects; no invented dialogue.]

non_diegetic_music:
[Optional score or N/A.]
```

Do not independently define `<Picture 1>` when it is only provenance for `<Subject 1>`. Add exactly one retention line per independently defined label.

## H3 audit

- First shot has no timestamp; later timestamps increase and remain within 4–15 seconds.
- Official-strict prose is English outside approved dialogue or visible text.
- The close appearance, startle, gesture, and held response all fit before the endpoint.
- No Seedance braces, `镜头N`, or `@图片N` syntax appears.
- No research video or reference image is fabricated as a generation input.
- The output does not reproduce the demonstration's character, fruit, sword, aircraft, landscape, flare pattern, or exact canopy arrangement.

See [h3-example.txt](./h3-example.txt) for one validated original T2VA realization.
