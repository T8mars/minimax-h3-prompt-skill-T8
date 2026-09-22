# 一人变群像｜合影后近景反应 Template

## Mechanism

A two-person setup leaves space for one figure to become a visible group. The separate observer frames the new group as a photo; a close face reaction acts as a punchline, with its exact cause deliberately open.

## Invariants

### inv-01

- Rule: Establish one lead and one distinct observer across a clear spatial gap.
- Purpose: Makes later count change legible.
- Failure if removed: Without a visible original and observer, the new figures may read as an ordinary crowd.

### inv-02

- Rule: Show repeated figures appearing into the gap before the observer captures or frames them.
- Purpose: Converts a simple meeting into a count surprise.
- Failure if removed: If duplicates are present from the beginning there is no reveal.

### inv-03

- Rule: End with a close facial reaction after the group pose while leaving the source's exact cause unclaimed.
- Purpose: Gives a human-scale comic payoff.
- Failure if removed: Without the close reaction, multiplication is only a visual effect.


## Variable Slots

| Slot | Constraint |
|---|---|
| lead | One persistent adult lead. |
| observer | Visually separate from lead. |
| space | Empty gap for controlled group arrival. |
| multiplication_medium | Original visual method, no source glow required. |
| capture_prop | One visible capture device. |
| reaction | Clear close facial change. |

## Required Human-Facing Anchors

- 人数从一清楚增加
- 摄影者保持独立
- 结尾反应不臆造原因

## Anti-Copy Boundary

- No source anime faces, costumes, armor, courtyard or character identities.
- No source-specific violet glow and exact peace-sign pose.
- No invented source reason for final surprise.

## Transfer Tests

1. At an original science museum, one adult guide stands before a blank exhibit wall while a separate adult technician lifts a digital camera. Three additional versions of the guide emerge as neutral light silhouettes, gain solid matching blue lab coats and cluster for a group image. After the photo, the front guide shifts from smile to wide-eyed surprise; the cause remains unspecified.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: lead, observer, space, multiplication_medium, capture_prop, reaction
2. At a mountain visitor center, one adult trail mapper faces an adult camera operator. Three paper-cut copies step out of a wall map, stand as physical visitors and pose; after the photo a close view of one copy changes from delighted to startled for an unspecified reason.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: lead, observer, space, multiplication_medium, capture_prop, reaction

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
