---
name: direct-seedance-3d-animation
description: Plan and prompt a stylized 3D animated short for Seedance 2.0 with stable character identities, environment continuity, causal story beats, shot-specific performance, camera, sound, and clip handoffs. Use when a story needs one 4–15 second generation or a longer multi-clip plan; not for photoreal live action, a single still, or generic prompt polishing.
---

# Direct Seedance 3D Animation

Turn a story idea into Seedance-native clip prompts. This is a T8-authored companion to the MiniMax repository-bundled `3d-animation-short-generator`; use the upstream Skill for its H3 workflow.

## Workflow

1. Lock aspect ratio, total duration, dialogue language, and whether the deliverable is one clip or a multi-clip short.
2. Write a one-sentence premise and a causal beat spine. The protagonist must cause or respond to each important change.
3. Define each recurring character with a stable label, two or three identity anchors, wardrobe, silhouette, and emotional baseline.
4. Define environment anchors and screen geography before camera moves.
5. Split a long film into clips of at most 15 seconds. Give every clip a visible opening state, change, payoff, and handoff frame/action.
6. Choose generation assets deliberately: character images for identity, scene images for environment, and videos only for a named action/camera/style role.
7. Compile each clip with `references/template.md`, then audit continuity across clips.

## Seedance rules

- Use one compact paragraph for one continuous event; use consecutive `镜头N` blocks for multi-event clips.
- Never put exact per-shot seconds inside a Seedance prompt. Keep assembly timing in the external shot plan.
- Bind every ambiguous subject to `@图片N` or a declared video role; never leave an unused reference.
- Specify performance through gaze, posture, breath, face tension, anticipation, follow-through, and recovery.
- Use one primary camera behavior per shot and preserve direction across handoffs.
- Put dialogue in `{...}`, sound in `<...>`, and music in `（...）` only when required.
- Do not emit H3 fields, H3 labels, `[Shot N]`, or timestamp alignment.

## Boundaries

Do not call a paid model or upload assets without a separate request. Do not import this official-companion entry into ComfyUI; the user's node already includes the upstream presets.

## Deliver

Return the locked story/identity/environment sheet, clip list, one Seedance prompt per clip, cross-clip handoff notes, and the final continuity audit.
