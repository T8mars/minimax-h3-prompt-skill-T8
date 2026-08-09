---
name: write-seedance-video-prompts
description: Write model-native Seedance 2.0 video prompts from text, images, video, or audio references. Use for text/image generation, multimodal reference, video editing, extension, track fill, or combined tasks that need stable subjects, explicit asset roles, coherent event order, camera, sound, visible text, and a 4–15 second feasibility check.
---

# Write Seedance Video Prompts

Create a filmable Seedance 2.0 prompt without leaking MiniMax H3 field names or timing grammar. This is a T8-authored companion to the MiniMax repository-bundled `h3-prompt-writing` Skill; use the upstream Skill itself when the target is H3.

## Intake

Confirm only missing information:

- overall duration from 4 through 15 seconds and aspect ratio;
- generation intent: new generation, reference, edit, extension, track fill, or a combination;
- every supplied asset and its narrow role;
- recurring subject bindings, visible action, scene state, camera priority, sound, dialogue, and requested visible copy;
- whether the idea is one simple event or a multi-event sequence.

Do not treat a research video as a generation input. Do not fabricate references, text, dialogue, brands, or sound.

## Build the prompt

1. Assign consecutive `图片N`, `视频N`, and `音频N` labels by modality.
2. State one purpose for every declared asset. Bind ambiguous subjects as `角色A@图片1` or equivalent.
3. Write a cause-and-effect action chain. Include body/object part, direction, speed, force, inertia, contact, and visible consequence where relevant.
4. Prefer one primary camera behavior per shot. Separate genuinely conflicting moves with a cut.
5. Use one natural paragraph for a simple event. Use consecutive `镜头1`, `镜头2`, and so on for complex content.
6. Put dialogue in `{...}`, physical/designed sound in `<...>`, music in `（...）`, and requested visible copy in `【...】`.
7. End with only the constraints that protect identity, geometry, medium, contact, copy, or continuity.

Read `references/template.md` for the task matrix, output skeleton, and final audit.

## Hard rules

- Never add exact per-shot timestamps such as `0–3秒` or “at 3 seconds.” Overall duration is allowed.
- Never emit H3 fields, `<Picture N>/<Video N>`, `[Shot N]`, `(S1)`, timestamp alignment, or H3 retention syntax.
- For edit/extension tasks, name the target as `视频N`, not merely “reference video.”
- For track fill, name two or three videos in playback order.
- Keep every explicit asset reference resolvable and every declared asset purposeful.
- Do not call a paid model, upload media, or import anything into ComfyUI unless the user separately requests that action.

## Deliver

Return the task choice, asset-role map when assets exist, the final Seedance prompt, and short feasibility warnings. Keep the prompt itself clean enough to paste directly into Seedance 2.0.
