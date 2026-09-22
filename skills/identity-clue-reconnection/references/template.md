# 身份线索回连｜局部累积到主体确认 Template

## Mechanism

Build one stable identity through partial but mutually consistent visual clues; after they accumulate, return to a recognizable head/face marker already glimpsed earlier. The source never supplies a final full-body proof, and the face is not fully concealed at the start. An original transfer may strengthen the closing proof without claiming the source did so.

## Invariants

### inv-01

- Rule: Recurring visual design markers across different close crops must remain attributable to one stable character.
- Purpose: A later identity echo can only resolve the clue sequence if the earlier clues have one common owner.
- Failure if removed: If details come from different unmarked subjects, the ending cannot support an identity connection and becomes an arbitrary montage.

### inv-02

- Rule: The sequence must alternate several body regions while repeating at least one design marker; not every crop has to introduce new information.
- Purpose: The middle sustains familiarity and variation before the final identity echo.
- Failure if removed: If the montage stays on only one undifferentiated crop, the later eye/head echo no longer gathers dispersed details into one recognizable design.

### inv-03

- Rule: The ending returns to a previously glimpsed identity marker and preserves recurring design cues, without requiring a source full-body view.
- Purpose: Provides a recognizable identity echo after the detail ladder rather than an unrelated final insert.
- Failure if removed: If the ending drops the earlier identity marker and recurring cues, the fragment sequence no longer resolves to a recognizable stable character.


## Variable Slots

| Slot | Constraint |
|---|---|
| subject_identity | One original figure with a stable design; a human version must be clearly adult, but the mechanism also works with a non-human figure. |
| clue_objects | Three or more original details attributable to one subject; a transfer may reconnect them more explicitly than the source. |
| setting | One new environment with a stable direction or landmark; avoid the source's blank-field anime design. |
| camera_grammar | Close detail views and a final recognizable identity echo; an optional wider whole-subject proof is an original strengthening, not a source claim. |
| decisive_action | An optional original role-confirming action can strengthen the new instance without being attributed to the source. |
| sound_family | Original, action-linked sound design; no claim that the source music or effects were heard. |

## Required Human-Facing Anchors

- 同一主体
- 局部线索相互一致
- 结尾回连已见标记

## Anti-Copy Boundary

- Do not reproduce the source anime character's face, red eyes, black strappy costume, gold hair ornaments or body proportions.
- Do not copy the original exact crop order, cut timings, palette or bare-white visual field.
- Do not use creator names, franchise identifiers, source caption wording or creator prompt text.

## Transfer Tests

1. An adult offshore lighthouse maintainer is identified through salt-stained gloves, a wrist compass and safety line before activating a beacon.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: subject_identity, clue_objects, setting, camera_grammar, decisive_action, sound_family
2. A stop-motion brass courier automaton is introduced through a stamped wheel, folded paper wing and blue-glass eye before its head returns in a miniature post-office set.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: subject_identity, clue_objects, setting, camera_grammar, decisive_action, sound_family

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
