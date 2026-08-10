# 二维角色｜真人接触三级反应 Template

## Mechanism

A single flat 2D character shares a locked photoreal environment with a real hand; one small cross-medium contact causes a three-stage readable reaction that ends in a medium-specific impossible effect.

## Invariants

### inv-01

- Rule: Keep exactly one flat animated character inside an otherwise photoreal, stable environment.
- Purpose: Makes the mixed-medium anomaly instantly legible.
- Failure if removed: Multiple animated elements blur the boundary and weaken the hook.

### inv-02

- Rule: Show real-to-animated contact before the reaction begins.
- Purpose: Provides a causal bridge between media layers.
- Failure if removed: A reaction without contact feels like an unrelated animation loop.

### inv-03

- Rule: Escalate in three readable states: neutral, discomfort, impossible payoff.
- Purpose: Lets the audience track cause and intensity without cuts.
- Failure if removed: Jumping directly to the final effect removes anticipation and acting.

### inv-04

- Rule: Keep the camera locked and let contact, expression, and effects move attention.
- Purpose: Protects spatial continuity between real and animated layers.
- Failure if removed: Camera movement makes contact alignment harder to read.


## Variable Slots

| Slot | Constraint |
|---|---|
| photoreal_arena | A stable real location with clear depth and one interaction surface. |
| flat_character | One original 2D paper- or sticker-like adult mascot, visually distinct from the source. |
| real_agent | One live-action hand or tool entering from a consistent edge. |
| contact_object | A small real object whose motion can visibly cross the medium boundary. |
| sensation | A simple cause such as cold, static, scent, or weight, not source heat/chili. |
| reaction_states | Three visually distinct but causally continuous poses. |
| payoff_effect | An original safe effect appropriate to the new sensation. |
| sound | Real location ambience plus contact-synced foley and one effect accent. |

## Required Human-Facing Anchors

- 平面与真实媒介同框
- 只有一次关键接触
- 反应至少三级升级
- 结尾由平面媒介自身完成

## Anti-Copy Boundary

- source girl character, hairstyle, clothes, face, outline, or childlike proportions
- source kitchen, wok, food, seasoning jar, spoon interaction, and camera composition
- chili or heat tasting, lateral tear jets, red forehead, and fire breathing
- exact reaction timing and source visual effects

## Transfer Tests

1. A flat 2D alpine-fox sticker at a real tea counter receives one drop of mint extract, sips, shivers, and exhales a small frost cloud that freezes a spoon.
   - Preserved: inv-01, inv-02, inv-03, inv-04
   - Changed: photoreal_arena, flat_character, contact_object, sensation, reaction_states, payoff_effect
2. A flat 2D robot sticker at a real workbench receives one drop of lubricant, tests a hinge, spins with the over-loose joint, and stops with a dizzy status-light pattern.
   - Preserved: inv-01, inv-02, inv-03, inv-04
   - Changed: photoreal_arena, flat_character, real_agent, contact_object, sensation, payoff_effect

## Model Skeletons

### MiniMax H3

    integrated_multimodal_description: [new subject, environment, ordered actions, camera, light and final state preserving every anchor]
    overall_soundscape: [diegetic ambience, action cues and causal payoff]
    non_diegetic_music: [original music arc or N/A]

### Seedance 2.0

    任务：[原创实例意图]
    总时长约[4–15]秒。
    主体定义：[稳定人物、物体与空间关系]
    事件或镜头：[按因果顺序实现全部锚点]
    整体风格与画质：[原创媒介、光影、色彩与声音]
    约束：[连续性、物理逻辑、反复制与结尾状态]

Adapt shot count to the user's concept. Preserve the causal mechanism, not a fixed storyboard.
