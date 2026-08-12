# 微表情问候｜侧身发现到笑容回稳 Template

## Mechanism

Use one nearly locked portrait to make a greeting readable through five small state changes: begin in side orientation, establish direct gaze, lower the gaze into a brief self-contained pause, peak with one closed-eye smile, and recover to an open relaxed expression without changing setting or adding a large gesture.

## Invariants

### inv-01

- Rule: Begin from a readable side orientation rather than immediate frontal address.
- Purpose: Creates a visible discovery step.
- Failure if removed: Starting frontal removes the orientation change.

### inv-02

- Rule: Reach and hold direct gaze before the emotional peak.
- Purpose: Makes the viewer relationship explicit.
- Failure if removed: A passing glance gives no stable connection.

### inv-03

- Rule: Insert one brief downward-gaze pause with the body still anchored.
- Purpose: Creates contrast before the smile.
- Failure if removed: Continuous smiling flattens the arc.

### inv-04

- Rule: Use one countable peak expression without a large body gesture.
- Purpose: Keeps the change legible at portrait scale.
- Failure if removed: A broad wave or jump overwhelms the facial proof.

### inv-05

- Rule: Recover to an open relaxed state and hold.
- Purpose: Closes the greeting without looping abruptly.
- Failure if removed: Ending at the closed-eye peak feels cut off.


## Variable Slots

| Slot | Constraint |
|---|---|
| lead_subject | An original stable subject or pair whose role is clear without source identity. |
| setting | A materially new setting with fixed spatial anchors and no source-specific location. |
| causal_carrier | One object, route, mark or device that visibly carries the causal chain. |
| state_change | Five ordered states with observable handoffs, not a decorative montage. |
| camera_grammar | A new proof-oriented information order that does not copy source shot boundaries. |
| payoff | A held final consequence that resolves or recontextualizes the setup. |
| sound_family | An original hierarchy of story-world cues supporting each visible change. |

## Required Human-Facing Anchors

- Begin from a readable side orientation rather than immediate frontal address.
- Reach and hold direct gaze before the emotional peak.
- Use one countable peak expression without a large body gesture.
- Recover to an open relaxed state and hold.

## Anti-Copy Boundary

- source anime schoolgirl
- source stairwell and shopping bag
- source sailor-style shirt and denim skirt
- the exact shy-girl facial design

## Transfer Tests

1. An original elderly paper conservator turns from a worktable, meets camera through round lenses, lowers the gaze to a repaired map, gives one closed-eye relieved smile, then reopens the eyes and holds the restored sheet.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, causal_carrier, state_change, camera_grammar, payoff, sound_family
2. A small stop-motion clay lighthouse keeper rotates from the lamp housing, focuses two painted eyes toward camera, dips toward a tiny logbook, lifts one crescent smile, then settles into a relaxed open-eyed pose.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, causal_carrier, state_change, camera_grammar, payoff, sound_family

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
