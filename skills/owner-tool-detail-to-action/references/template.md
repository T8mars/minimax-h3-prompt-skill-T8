# 人物装备归属｜局部切片到全身动作 Template

## Mechanism

Introduce a stable person and their tool together, briefly isolate several owner-tool details, then connect those clues through one coherent body-tool action and a broad resulting stance. The source shows the face and tool early; the ending confirms action ownership rather than revealing a never-seen identity.

## Invariants

### inv-01

- Rule: Establish one stable tool owner before using close inserts.
- Purpose: Gives every later grip or equipment crop a clear subject anchor.
- Failure if removed: Without an established owner, close inserts could belong to several people and the action connection fails.

### inv-02

- Rule: Keep tool geometry and attachment to the same person consistent through detail views and the main action.
- Purpose: Makes the action legible as one carried object, not a sequence of swapped props.
- Failure if removed: If the tool or its hand changes between crops, the final action cannot be causally traced.

### inv-03

- Rule: After the action, show a broad enough pose to confirm where the tool ended relative to the owner.
- Purpose: Supplies a spatial outcome for the detail-and-action montage.
- Failure if removed: If the edit ends on another isolated detail, the viewer cannot verify the final tool-owner relation.


## Variable Slots

| Slot | Constraint |
|---|---|
| subject_role | One original stable tool owner; when human, visibly adult. Preserve body, costume and handedness across all views. |
| tool | One role-appropriate non-branded tool with stable shape and grip location. |
| environment | An original environment with persistent geography and a legible surface or target for the tool action. |
| main_action | One physically readable owner-tool action, not copied sword choreography. |
| camera_grammar | A broad owner-tool anchor, selective inserts, one action view, and a confirming pose; exact source cuts are not copied. |
| sound_family | Original action-linked ambience and contact sound, not a claim about unheard source audio. |
| medium | Visual medium may be live action, stop motion or another original form while owner-tool continuity remains legible. |

## Required Human-Facing Anchors

- 人物与工具先建立关系
- 细节保持同一设计
- 动作和全身姿态回证归属

## Anti-Copy Boundary

- No source anime face, hair, pale glowing coat, butterfly ornaments, blade pattern or exact color scheme.
- No source sword choreography, exact cut cadence, character identity, creator text or prompt wording.
- No franchise marks, source username, logo or weapon violence in the transferable preset.

## Transfer Tests

1. An adult avalanche-rescue trainee plants one search probe into a marked snow-training patch after boot, radio and tool details.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: subject_role, tool, environment, main_action, camera_grammar, sound_family, medium
2. A stop-motion clockwork repair puppet tightens one loose carousel wheel with a small wrench, then the carousel turns while puppet and wrench remain in a wide tabletop view.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: subject_role, tool, environment, main_action, camera_grammar, sound_family, medium

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
