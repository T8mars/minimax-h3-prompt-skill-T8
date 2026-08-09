---
name: direct-seedance-music-typography
description: Plan Seedance 2.0 music-video clips where performance, camera, scene changes, spatial lyric typography, and transitions respond to a locked music window. Use for 4–15 second hooks or longer multi-clip MVs with explicit audio/lyric ownership, subject and scene references, beat-led events, and assembly handoffs; not for ordinary caption cleanup or unlicensed lyric copying.
---

# Direct Seedance Music Typography

Treat music, performance, camera, and visible words as one synchronized design system. This is a T8-authored companion to the MiniMax repository-bundled `music-video-subtitle-generator`; use the upstream Skill for H3.

## Workflow

1. Lock aspect ratio, total duration, exact music window, lyric ownership, language, performer, and intended typography role.
2. If the work exceeds 15 seconds, split it into independently generated clips while preserving one master audio timeline for later assembly.
3. Give character, scene, typography-style, video, and audio references separate roles. Never let a typography card supply a person or location.
4. Map vocal phrases and beat accents to visible performance, scene changes, camera impulses, typography entrances, and transition exits.
5. Keep one main typography event per shot and protect eyes, mouth, and lip-sync.
6. Compile each clip with `references/template.md`; maintain cross-clip identity, palette, grain, light, motion direction, and audio continuity.

## Seedance rules

- Bind a supplied track as `音频1` and state that it provides music/voice timing. Do not declare audio that will not be supplied at generation time.
- Use `{exact lyric}` for performed words and `【exact visible lyric】` for on-screen typography.
- Use `镜头N` in event order, not exact per-shot timestamps. Beat words such as “on the snare” or “after the bass hit” are allowed.
- Keep one coherent camera behavior per shot; use cuts or match motion for scene changes.
- Do not emit H3 fields, `[Shot N]`, H3 labels, or alignment syntax.

## Boundaries

Do not invent or rewrite user-owned lyrics without permission. Do not call generation, upload music, or import into ComfyUI without a separate request.

## Deliver

Return the music/lyric lock, reference-role map, beat-event plan, Seedance prompt per clip, assembly handoffs, and lyric/typography/audio audit.
