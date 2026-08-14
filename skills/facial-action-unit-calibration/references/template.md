# 表情校准｜固定身份下的动作单元序列 Template

## Mechanism

A facial calibration sequence becomes reusable when identity, lighting, background and camera axis stay fixed while distinct facial action units change one group at a time. Brief micro-resets preserve comparability, and a late controlled crop can test fine identity stability without turning the sequence into a narrative performance.

## Invariants

### inv-01

- Rule: Lock one face, background, lighting direction and camera axis before any expression change.
- Purpose: Creates a reliable comparison baseline.
- Failure if removed: Changing the portrait setup makes action units impossible to compare.

### inv-02

- Rule: Separate the expression into readable local units rather than morphing the whole face continuously.
- Purpose: Makes each change diagnosable and reusable.
- Failure if removed: A blended emotional performance hides which feature changed.

### inv-03

- Rule: Insert at least one partial reset toward the baseline between larger changes.
- Purpose: Prevents accumulated distortion and preserves identity.
- Failure if removed: Without a reset, changes can drift into a different face.

### inv-04

- Rule: Keep head motion subordinate to eye, brow, mouth and cheek evidence.
- Purpose: Maintains a stable portrait while allowing orientation tests.
- Failure if removed: Large head turns replace facial proof with pose variation.

### inv-05

- Rule: Use a late closer crop only after identity has been repeatedly proven.
- Purpose: Tests detail stability and provides a clear endpoint.
- Failure if removed: Opening in extreme close-up removes the identity baseline.


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

- Lock one face, background, lighting direction and camera axis before any expression change.
- Separate the expression into readable local units rather than morphing the whole face continuously.
- Keep head motion subordinate to eye, brow, mouth and cheek evidence.
- Use a late closer crop only after identity has been repeatedly proven.

## Anti-Copy Boundary

- older bald grey-bearded man
- black shirt
- dark paneled studio portrait
- source facial-expression order
- source final mouth close-up

## Transfer Tests

1. A young ceramic courier in a cool medical kiosk performs a nonverbal visor-fit calibration: neutral baseline, one-sided brow lift, isolated lower-eyelid tension, closed-lip jaw shift, then one nostril-and-cheek action. A brief neutral reset separates the tests, and the only late close crop verifies the unchanged eye-corner and temple visor seam.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family
2. A handcrafted wooden puppet in a sunlit rehearsal booth tests five mechanical face controls in a new order: left brow plate, paired eye shutters, closed jaw sliding sideways, one cheek lever, then a full neutral reset. The camera ends on the unchanged eye hinge and wood grain, never on the mouth.
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
