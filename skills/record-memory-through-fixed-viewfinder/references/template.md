# 相机记忆｜固定取景框串联日常 Template

## Mechanism

Lock one recorder-style viewing interface over the entire film, then let one subject move through a compact route of clearly different everyday places. Each place contributes one small human action and one spatial clue; finish with a direct gesture into the lens so the fixed interface feels like a remembered recording rather than decorative graphics.

## Invariants

### inv-01

- Rule: Keep one original recorder interface visually stable for the whole sequence.
- Purpose: Binds separate places into one recording session.
- Failure if removed: If the interface changes every shot, it becomes decorative motion graphics.

### inv-02

- Rule: Keep one subject and one observer relationship continuous across at least three places.
- Purpose: Turns location changes into a route.
- Failure if removed: Unrelated people and places become a travel montage.

### inv-03

- Rule: Give each place one small readable action rather than a posed beauty shot.
- Purpose: Creates memory detail and human continuity.
- Failure if removed: Pure posing makes the interface feel like a filter.

### inv-04

- Rule: Use one physical threshold or travel action between interior and exterior scale.
- Purpose: Makes spatial progression legible.
- Failure if removed: Abrupt location swaps lose the feeling of an outing.

### inv-05

- Rule: End with a direct lens interaction that physically closes the recording.
- Purpose: Provides an intimate and causal endpoint.
- Failure if removed: A fade without interaction does not complete the observer relationship.


## Variable Slots

| Slot | Constraint |
|---|---|
| lead_subject | An original stable subject or pair with a readable role. |
| setting | A new setting with fixed spatial anchors and no source-specific surface. |
| escalation_variable | One causal variable that changes through visible stages. |
| performance_rule | A restrained acting or motion rule that keeps the mechanism legible. |
| camera_grammar | An information order that proves each state without copying source shot boundaries. |
| payoff | A clean final physical, informational or social consequence. |
| sound_family | An original hierarchy of diegetic cues; no unsupported source-audio claim. |

## Required Human-Facing Anchors

- 同一原创相机界面全程不变
- 同一人物穿过至少三处连续空间
- 每处空间有一个小动作
- 至少一次阈值或楼梯过渡
- 结尾触镜物理结束记录

## Anti-Copy Boundary

- source young woman
- source library and mall route
- source drink prop
- the exact source camera HUD

## Transfer Tests

1. An elderly museum restorer records a pocket-camera diary through archive room, stairwell, sculpture court and rooftop, ending by placing a gloved palm over the lens.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family
2. A night-market volunteer moves from prep tent to lantern alley, river steps and closing stall while the same camcorder frame persists, ending by clipping the lens cap on.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family

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
