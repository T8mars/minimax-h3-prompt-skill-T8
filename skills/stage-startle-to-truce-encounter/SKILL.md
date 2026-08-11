---
name: stage-startle-to-truce-encounter
description: "Design short cinematic encounters that move from calm observation to an impossible close appearance, a readable startle response, and a restrained truce gesture for MiniMax H3 or Seedance 2.0. Use when a user wants fantasy-versus-technology contrast, cockpit or window eyelines, pursuit compressed into 4–15 seconds, non-lethal escalation, identity-reference continuity, or a tense scene that resolves through performance instead of injury or dialogue exposition."
---

# Stage Startle-to-Truce Encounter

Build an original close encounter whose tension resolves through spatial reversal and performance. This is a non-official, user-contributed Skill; it is not a MiniMax or ByteDance preset.

## Required reading

1. Read [references/summary.md](references/summary.md) for style, fit, recommended short input, and source limitations.
2. Read [references/template.md](references/template.md) for invariants, slots, ablations, transfer tests, and repairs.
3. Read the target model guide before compiling:
   - MiniMax H3: [references/h3-template.md](references/h3-template.md)
   - Seedance 2.0: [references/seedance-template.md](references/seedance-template.md)
4. Use [references/h3-example.txt](references/h3-example.txt) and [references/seedance-example.txt](references/seedance-example.txt) as syntax examples, not as mandatory subjects.
5. Consult [references/source-analysis.md](references/source-analysis.md) only to explain evidence or a repair. Never reproduce its character, aircraft, prop, landscape, or exact staging.

## Intake

Collect or infer only what is needed:

- target model, task type, duration from 4 through 15 seconds, and aspect ratio;
- calm subject, technical observer, separating boundary, encounter space, and final relationship state;
- one bounded startle or defensive action and whether it is visibly non-lethal;
- every generation-time image or video and its narrow role;
- identity anchors, vehicle or enclosure continuity, eyeline geometry, primary camera role, sound, and text policy.

Treat the demonstration MP4 as research evidence, not as a generation input. Never invent a reference asset, source link, attack, injury, dialogue, or reciprocal gesture.

## Build the encounter

1. Establish a calm baseline and one readable distance between subject and observer.
2. Reveal the observer through a distinct point of view or enclosure so both sides of the encounter are legible.
3. Use one bounded escalation: alarm, defensive burst, evasive turn, shield, marker, or abrupt recoil. Do not stack unrelated weapons and effects.
4. Reverse the spatial relation by letting the formerly observed subject close an apparently impossible distance.
5. Confirm proximity with a shared axis, matched speed, correct eyelines, and one frame containing both sides of the boundary.
6. Externalize the observer's startle through shoulders, grip, head turn, breath, or gaze.
7. Reserve the ending for a small conciliatory offer and a readable held response. Reciprocity is optional unless the user asks for it.

## Feasibility gate

- Use four or five causal beats for a 12–15 second result; shorten the chain for briefer clips.
- Put the decisive close appearance before the final quarter so the reaction and truce have room to land.
- Keep threat non-lethal unless the user explicitly requests otherwise; never require injury to prove escalation.
- Do not call countermeasure flares, marker pods, alarms, or light trails guided missiles unless complete evidence proves that identity and direction.
- Use one primary camera purpose per beat: establish, observer POV, kinetic proof, proximity proof, or reaction payoff.
- For window or canopy interaction, bind screen direction, eye height, relative speed, reflection, and the physical barrier.
- When an image is supplied, use it only for declared identity or wardrobe unless the user explicitly assigns scene or first-frame control.

## Compile for MiniMax H3

- Choose Base or Ref2VA from the actual generation-time assets, not from the research sample.
- Use official-strict English fields. Keep the first shot untimestamped; later timestamps must increase and stay within the duration.
- Put appearance, action, camera, synchronized effects, and any dialogue inside the visual timeline.
- Keep ambience and action effects in `overall_soundscape`; do not repeat them elsewhere.
- Use a final shared-axis shot long enough to prove the gaze and truce offer.

## Compile for Seedance 2.0

- Use a complex multi-shot structure for the full calm-to-truce arc.
- Write consecutive `镜头N` beats in event order without exact per-shot timestamps.
- Bind every supplied asset as `角色A@图片1` or equivalent and assign one narrow role.
- Use `<...>` for physical effects, `{...}` for dialogue, and `（...）` for music.
- Keep constraints shorter than the action design and remove all H3 field syntax.

## Validation

Before returning the result, verify:

- the baseline, observer POV, escalation, proximity proof, startle, and truce form one causal chain;
- subject identity, observer, enclosure, screen direction, speed, light, and boundary remain continuous;
- the defensive action is named from visible mechanics rather than assumed intent;
- both eyelines converge across the barrier and the conciliatory gesture is physically readable;
- the execution changes subject type, setting, transport, threat device, camera implementation, palette, sound, and ending behavior instead of copying the demonstration surface;
- H3 and Seedance syntax remain separate;
- no paid generation, upload, ComfyUI import, or node modification occurs without a separate request.

## Deliver

Return:

1. one-sentence concept;
2. task and asset-role map;
3. one compact recommended input for a prompt-enhancer field;
4. MiniMax H3 prompt;
5. Seedance 2.0 prompt;
6. continuity, feasibility, and anti-copy audit.
