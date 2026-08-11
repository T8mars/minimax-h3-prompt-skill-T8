# UGC测评｜开箱到一口实证 Template

## Mechanism

Structure a first-person product testimonial as a proof ladder: introduce the unopened object and speaker together, expose contents, isolate one tactile or functional macro proof, let the speaker perform one genuine use action, then hold the product and changed reaction together. The product claim must be earned by visible use rather than spoken hype.

## Invariants

### inv-01

- Rule: Open with presenter and unopened product in the same frame.
- Purpose: Binds person, object and expectation.
- Failure if removed: A product-only beauty shot lacks testimonial ownership.

### inv-02

- Rule: Reveal the complete contents before isolating details.
- Purpose: Gives macro proof a known context.
- Failure if removed: Macro-first editing can hide what is actually being evaluated.

### inv-03

- Rule: Choose one product-specific tactile or functional proof.
- Purpose: Makes the claim inspectable.
- Failure if removed: Generic close-ups create polish without evidence.

### inv-04

- Rule: Perform one complete use action with the outcome still visible.
- Purpose: Converts product state into demonstrated experience.
- Failure if removed: A cut before the result turns use into implication.

### inv-05

- Rule: End with product and changed human reaction readable together.
- Purpose: Links proof to evaluation.
- Failure if removed: A reaction without the object can feel unrelated or staged.


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

- 开场测评者与未开封产品同框
- 先完整展示内容再进入细节
- 只有一个产品专属功能证据
- 必须完成一次真实使用并保留结果
- 结尾产品与变化后的反应同框

## Anti-Copy Boundary

- source woman
- source burger and fries
- source packaging
- source caption and kitchen-like setting

## Transfer Tests

1. A ceramic artist unboxes a compact pour-over kit, reveals all pieces, uses a macro close-up on the locking filter seam, brews one cup, tastes it and holds the assembled kit with a calm approval reaction.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family
2. A cyclist tests a pocket rain-shell pouch, reveals the folded garment, uses a macro close-up on the sealed zipper, pulls it on under a spray test and ends holding the dry inner cuff beside a relieved expression.
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
