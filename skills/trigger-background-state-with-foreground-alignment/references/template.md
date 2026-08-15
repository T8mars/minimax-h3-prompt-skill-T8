# 手势对齐｜前景动作触发后景状态 Template

## Mechanism

In a fixed layered composition, establish one readable background state, move one foreground effector along a clean path until it visually aligns with the target, change exactly one target state during that alignment, hold the new state long enough to read, then clear the effector and finish by recalling or acknowledging the persistent result.

## Invariants

### inv-01

- Rule: Establish one stable subject-target geography and one readable baseline state before the effector enters.
- Purpose: Gives the viewer a before-state and a precise interaction destination.
- Failure if removed: If the target is already covered or changing, the later gesture has no measurable effect.

### inv-02

- Rule: Use one unambiguous effector path that ends in a clean foreground-to-background alignment with the target.
- Purpose: Turns depth mismatch into a legible apparent interaction.
- Failure if removed: A wandering gesture or several candidate targets makes causality unreadable.

### inv-03

- Rule: Change exactly one target state during or immediately after the alignment, without asserting literal contact that is not shown.
- Purpose: Provides a single causal payoff while preserving the visual nature of the trick.
- Failure if removed: Multiple changes feel like a generic interface demo; no change makes the gesture decorative.

### inv-04

- Rule: Hold the aligned effector and changed state together, then clear the effector while the result persists.
- Purpose: First binds action to result, then proves the result independently.
- Failure if removed: Cutting immediately after the change hides whether the new state is stable.

### inv-05

- Rule: End on the persistent changed state with one brief acknowledgment or recall gesture, not a second state change.
- Purpose: Closes the interaction and can create a changed-state loop endpoint.
- Failure if removed: Resetting to baseline erases the proof; adding another state dilutes the single-action mechanism.


## Variable Slots

| Slot | Constraint |
|---|---|
| foreground_subject | One original subject with a clearly readable effector and stable identity. |
| background_target | One original target whose baseline and changed states are visually distinct. |
| effector_path | One clean trajectory ending at a precise apparent alignment. |
| state_pair | One before state and one after state; no additional state family. |
| depth_grammar | A composition that keeps foreground effector, subject and rear target simultaneously legible. |
| confirmation_hold | Enough time to read both aligned action and changed result. |
| release_or_recall | Clear the target once, then optionally acknowledge the unchanged result. |
| sound_family | Original physical cues for approach, state change, hold and release. |

## Required Human-Facing Anchors

- Establish one stable subject-target geography and one readable baseline state before the effector enters.
- Use one unambiguous effector path that ends in a clean foreground-to-background alignment with the target.
- Change exactly one target state during or immediately after the alignment, without asserting literal contact that is not shown.
- End on the persistent changed state with one brief acknowledgment or recall gesture, not a second state change.

## Anti-Copy Boundary

- T8star-Aix
- +关注
- 已关注
- source profile counts and platform labels
- source face, hairstyle and brown shirt
- source pink-white profile interface and exact pointing placement

## Transfer Tests

1. A stop-motion brass planetarium docent stands before a deep mechanical star panel. Its slender pointer aligns with a moon dial as the panel flips from 'PARKED' to 'TRACKING'; the puppet lowers the pointer, then returns it beside the unchanged confirmation lamp.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: foreground_subject, background_target, effector_path, state_pair, depth_grammar, confirmation_hold, release_or_recall, sound_family
2. An underwater inspection drone hovers in front of a pressure-window iris. One manipulator aligns with a recessed latch, the iris changes from a narrow red slit to an open green ring, the drone backs away to reveal the stable aperture and finally sweeps one spotlight across it.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: foreground_subject, background_target, effector_path, state_pair, depth_grammar, confirmation_hold, release_or_recall, sound_family

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
