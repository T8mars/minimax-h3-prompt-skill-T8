# 渲染扫描｜局部带逐段改写整体 Template

## Mechanism

Move one sharply bounded rendering carrier across a stable subject; convert only the area inside it, preserve alignment across both edges, accumulate coverage through distinct passes, then remove the carrier and hold the fully converted result.

## Invariants

### inv-01

- Rule: Establish a stable subject and composition before the first conversion pass.
- Purpose: Supplies a trustworthy source-state reference.
- Failure if removed: Starting mid-conversion hides what changed.

### inv-02

- Rule: Keep one readable moving boundary with old and new states visible at the same time.
- Purpose: Makes the carrier's local responsibility directly observable.
- Failure if removed: A full-frame dissolve removes the bounded comparison.

### inv-03

- Rule: Preserve identity, pose and spatial alignment across every boundary crossing.
- Purpose: Proves medium conversion instead of subject replacement.
- Failure if removed: Misregistered features look like morphing or a new subject.

### inv-04

- Rule: Accumulate converted coverage in an ordered progression rather than resetting each pass.
- Purpose: Gives each pass measurable completion value.
- Failure if removed: Resetting the prior area destroys the build toward a whole result.

### inv-05

- Rule: Remove or deactivate the carrier only after the whole target region is converted and hold the stable result.
- Purpose: Shows that the converted state survives independently.
- Failure if removed: Ending with the carrier active leaves completion ambiguous.


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

- Establish a stable subject and composition before the first conversion pass.
- Keep one readable moving boundary with old and new states visible at the same time.
- Accumulate converted coverage in an ordered progression rather than resetting each pass.
- Remove or deactivate the carrier only after the whole target region is converted and hold the stable result.

## Anti-Copy Boundary

- the source young woman
- the exact bedroom or studio interior
- the anime portrait style
- the horizontal hand-carried render strip
- the exact face-to-body conversion order

## Transfer Tests

1. A translucent embroidery hoop moves over a clay museum bird; only the enclosed zone becomes stitched textile, then the hoop exits and the complete textile bird remains.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family
2. A vertical frost-light scanner crosses a greenhouse facade; panes inside the strip become paper-cut layers while untouched panes remain glass, ending on one complete paper conservatory.
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
