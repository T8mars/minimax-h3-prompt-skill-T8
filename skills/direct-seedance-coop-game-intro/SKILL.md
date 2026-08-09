---
name: direct-seedance-coop-game-intro
description: Design a Seedance 2.0 two-player co-op game menu or opening animation with stable character bindings, approved visual direction, readable UI copy, coordinated palette, explicit interaction events, and a clean final menu state. Use for game concepts and character-led social intros; not for playable game development or copying commercial game branding.
---

# Direct Seedance Co-op Game Intro

Create a two-character menu animation without identity swaps or illegible UI. This is a T8-authored companion to the MiniMax repository-bundled `co-op-game-intro-generator`; use the upstream Skill for H3.

## Workflow

1. Collect player names, game title, ratio, duration, visual style, and optional character references.
2. Lock each character with a unique label, image binding, screen side, palette accent, silhouette, hairstyle, outfit, and pose.
3. Draft one approval frame externally when the user needs visual confirmation. Treat it as layout/style guidance, not an undeclared exact frame guarantee.
4. Verify every requested UI string before prompt writing. Reduce copy if it cannot remain readable.
5. Plan a short interaction chain: idle state → focus change → selection/confirmation → resolved co-op state.
6. Compile with `references/template.md`; keep character, UI, palette, and screen geography stable.

## Seedance rules

- Bind `玩家A@图片1` and `玩家B@图片2` when character images are supplied. Give an approved menu image a separate layout/style role.
- Use `【...】` for exact menu strings and `{...}` only for spoken dialogue.
- Use one primary camera behavior; menu readability normally favors a locked or restrained camera.
- Use `镜头N` only for real event changes. Never add exact per-shot seconds.
- Do not emit H3 fields, `<Picture N>`, `[Shot N]`, or retention syntax.

## Boundaries

Do not imitate a commercial logo, invent a franchise, or call paid generation without approval. Do not import this upstream entry into ComfyUI.

## Deliver

Return the identity map, UI-copy lock, event chain, final Seedance prompt, and an identity/readability audit.
