# 互动图鉴｜固定菜单切换生物 Template

## Mechanism

Keep one information interface and spatial grid fixed while a visible selector chooses one item at a time. Each selection must update the title, concise attributes and one large live viewport together; the selected subject then performs one short behavior that proves the new state before the next choice.

## Invariants

### inv-01

- Rule: Keep one selector grid, one data zone and one live viewport fixed.
- Purpose: Creates an inspectable state machine.
- Failure if removed: Moving interface regions make updates difficult to compare.

### inv-02

- Rule: Show one visible selector action before every content change.
- Purpose: Makes each update causal.
- Failure if removed: Unmotivated swaps become a montage.

### inv-03

- Rule: Update title, attributes and live subject as one synchronized state.
- Purpose: Prevents contradictory interface evidence.
- Failure if removed: Partial updates make the catalog feel broken.

### inv-04

- Rule: Give each selected subject one short defining behavior.
- Purpose: Proves more than a static thumbnail.
- Failure if removed: Idle subjects do not justify a live viewport.

### inv-05

- Rule: End on a held complete state with selector and selected subject both visible.
- Purpose: Lets the viewer verify the final choice.
- Failure if removed: Cutting away immediately removes the proof relation.


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

- 菜单、数据区和主视窗位置固定
- 每次内容变化前必须有可见选择
- 名称参数和主体同步更新
- 每个被选主体完成一个定义动作
- 结尾保持完整最终选择状态

## Anti-Copy Boundary

- CREATURE ENCYCLOPEDIA title
- source creature designs
- source names and statistics
- the exact source grid and cursor path

## Transfer Tests

1. A fixed weather-drone field guide selects five original drones; tile, call sign, wind rating and large live weather test update together for each choice.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family
2. A seed-vault interface selects five invented plants; fixed specimen grid, growth attributes and large time-lapse diorama update in one synchronized state.
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
