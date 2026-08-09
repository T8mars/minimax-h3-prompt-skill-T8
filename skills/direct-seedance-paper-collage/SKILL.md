---
name: direct-seedance-paper-collage
description: Turn a narration line, knowledge point, opinion, story beat, or abstract concept into a Seedance 2.0 editorial paper-collage clip with a clear visual metaphor, approved final composition, tactile stop-motion assembly, controlled paper texture, purposeful depth, and synchronized collage sound effects. Use for 4–15 second explainer or B-roll clips; not for realistic presenter ads or editable-layer delivery.
---

# Direct Seedance Paper Collage

Make the idea understandable through paper objects rather than written explanation. This is a T8-authored companion to the MiniMax repository-bundled `paper-collage-explainer-generator`; use the upstream Skill for H3.

## Workflow

1. Extract the intended meaning, emotion, action verb, and one concrete visual metaphor.
2. Choose three to six readable paper groups and a controlled palette. Separate foreground, midground, and background.
3. Default to tactile collage SFX only. Add music, narration, or subtitles only when explicitly requested.
4. Describe or create an approval still that represents the final composition. Bind it only as a visual/final-composition role.
5. Plan assembly as readable physical steps: enter, slide/pop, rebound, press flat, pause, lock.
6. Compile one stable Seedance event with `references/template.md`; use multiple shots only when the meaning genuinely changes.

## Seedance rules

- Bind the approved still as `图片1` when supplied and state its role explicitly.
- Preserve halftone cut-outs, cardstock accents, cream keylines, fibers, torn edges, seams, thickness, and soft paper shadows.
- Keep the camera locked unless one restrained miniature move improves comprehension.
- Use `<...>` for paper slide/pop/press/rustle sounds. Do not add speech, music, visible words, or UI by default.
- Use an overall 4–15 second duration; never add exact per-shot timestamps.
- No H3 fields, H3 labels, or alignment syntax.

## Boundaries

Do not call generation before concept approval. Do not import this upstream entry into ComfyUI.

## Deliver

Return the meaning/metaphor card, object and palette plan, final Seedance prompt, optional audio additions, and a metaphor/material/motion audit.
