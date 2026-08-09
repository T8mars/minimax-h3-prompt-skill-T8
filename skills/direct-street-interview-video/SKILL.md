---
name: direct-street-interview-video
description: "Design natural vertical street-interview and walk-and-talk video prompts for MiniMax H3 or Seedance 2.0. Use when a user wants spontaneous documentary energy, a referenced recurring person, first-person handheld follow, concise dialogue, moving daylight, believable street parallax, or a consent-led interaction that must fit 4–15 seconds without unreachable beats."
---

# Direct Street Interview Video

Create an original street interaction from a reusable documentary mechanism. This is a non-official, user-contributed Skill; it is not a MiniMax or ByteDance preset.

## Required reading

1. Read [references/summary.md](references/summary.md) for style, fit, usage, and source limitations.
2. Read [references/template.md](references/template.md) for invariants, variable slots, ablations, transfer tests, and repairs.
3. Read the target model template before compiling:
   - MiniMax H3: [references/h3-template.md](references/h3-template.md)
   - Seedance 2.0: [references/seedance-template.md](references/seedance-template.md)
4. Consult [references/source-analysis.md](references/source-analysis.md) only when explaining why a repair exists. Do not reproduce its people, wardrobe, location, or dialogue.

## Intake

Collect or infer only what is needed:

- target model, task type, duration from 4 through 15 seconds, and aspect ratio;
- the interaction goal, location, subject role, interviewer role, relationship, and ending;
- every generation-time image or video and its narrow role;
- exact approved dialogue, speaker order, and language;
- whether physical contact is explicitly wanted and appropriate;
- the one primary camera behavior, ambient sound, and any requested music or visible text.

Treat the analyzed demonstration video as research evidence, not as an automatic generation reference. Never fabricate a reference asset or dialogue.

## Build the scene

1. Start with one readable social premise: approach, recognition, question, demonstration, compliment, request, or compact reveal.
2. Give the on-camera subject one stable visual identity. With reference media, bind two or three distinctive anchors and preserve wardrobe continuity.
3. Use one continuous route unless a new shot is causally necessary. The default camera is first-person handheld backpedaling or side-walking at conversational distance.
4. Make the relationship change visible through distance, gaze, pace, hand gesture, body angle, or a shared object. Do not substitute random camera motion for performance.
5. Let the street move around the subject: foreground occlusion, background parallax, passing light and shadow, and small exposure adaptation.
6. Keep dialogue subordinate to visible action. Allow each line to finish before the next speaker begins.
7. End on a visible resolved state: permission granted, pose found, object shown, route chosen, reaction landed, or conversation naturally released.

## Feasibility gate

- Every timestamp or later beat must occur before the actual target duration.
- For about 10 seconds, prefer two or three short spoken turns and one continuous event chain.
- For about 15 seconds, prefer no more than four or five short turns unless speech is intentionally rapid and the user supplied it.
- Remove a shot before compressing dialogue into unnatural speed.
- Do not place a new setup exactly at the video endpoint.
- Do not claim 4K, HDR, film stock, lens metadata, or platform provenance unless the user requested or supplied it.
- Default to verbal or gestural positioning. Add touch only when the user explicitly wants it and the staging is consensual, motivated, and physically clear.

## Compile for MiniMax H3

- Select T2VA, I2VA, FL2VA, L2VA, or Ref2VA from the actual generation-time inputs.
- Use the three-field Base structure when no reference relationship is needed.
- Use the six-field Ref2VA structure when a supplied person, wardrobe, voice, scene, or movement reference must be tracked.
- Write official-strict rewrite prose in English. Preserve approved dialogue only in `<d>[Language]...</d>` and identify speakers with `(S1)`, `(S2)`.
- Start with `[Shot 1]` and no timestamp. Later shots use consecutive labels and increasing timestamps below the target duration.
- Keep dialogue only in the detailed visual timeline; do not repeat it in the soundscape.

## Compile for Seedance 2.0

- Write in Chinese by default and choose a task from the actual inputs.
- Use one compact paragraph for a continuous walk-and-talk; use consecutive `镜头N` only when there is a real cut or event boundary.
- Bind references as `角色A@图片1` or equivalent and give every asset one explicit role.
- Put dialogue in `{...}`, physical sound in `<...>`, music in `（...）`, and requested visible text in `【...】`.
- Do not use H3 fields, H3 labels, speaker IDs, or exact per-shot timestamps.

## Validation

Before returning the result, verify:

- duration, speech, and action are jointly feasible;
- every asset reference resolves and every declared asset has a purpose;
- the subject, wardrobe, environment, route, light direction, and hand/object state remain continuous;
- camera motion follows the interaction and does not conflict with itself;
- dialogue order, lip movement, ambience, and optional music do not duplicate or contradict each other;
- the execution changes subject, place, wardrobe, dialogue, route, framing, and ending instead of copying the demonstration surface;
- no paid generation, upload, ComfyUI import, or node modification is performed without a separate request.

## Deliver

Return:

1. one-sentence concept;
2. task and asset-role map;
3. a compact feasibility note;
4. the MiniMax H3 prompt;
5. the Seedance 2.0 prompt;
6. a short continuity and anti-copy audit.
