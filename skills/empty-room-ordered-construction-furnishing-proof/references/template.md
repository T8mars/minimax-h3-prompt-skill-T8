# 毛坯房顺序完工｜表面施工、木作、家具与照明验收 Template

## Mechanism

锁定同一房间几何与机位，装修按墙面、地板、固定木作、家具和灯光的依赖顺序逐层出现；前一阶段必须保持为后一阶段的基础，最终用完整可用空间收束。 The reusable mechanism preserves causal order, spatial anchors and the final proof while replacing every source-specific person, location, object, wording, choreography and design.

## Invariants

### inv-01

- Rule: One camera and room geometry remain fixed.
- Purpose: Establishes the baseline identity, object or geography that every later state must preserve.
- Failure if removed: Without this exact baseline rule, later changes cannot be attributed to the same subject, object or place, so the sequence loses its reference state. Removed rule: "One camera and room geometry remain fixed."

### inv-02

- Rule: Construction follows shell-to-finish dependency order.
- Purpose: Makes the visible trigger precede and explain the first mechanism response.
- Failure if removed: Without this exact trigger rule, the response appears spontaneously and the central cause-and-effect claim is no longer demonstrated. Removed rule: "Construction follows shell-to-finish dependency order."

### inv-03

- Rule: Openings are never lost or relocated.
- Purpose: Keeps the middle progression registered instead of allowing an unexplained reset.
- Failure if removed: Without this exact progression rule, the middle can jump to a replacement state and the accumulated result is no longer traceable. Removed rule: "Openings are never lost or relocated."

### inv-04

- Rule: Movable furniture arrives after fixed work.
- Purpose: Reconnects the changed or partial state to the established subject and spatial anchor.
- Failure if removed: Without this exact reconnection rule, detail or transformed shots can belong to a different subject or geography and continuity cannot be verified. Removed rule: "Movable furniture arrives after fixed work."

### inv-05

- Rule: The final hold shows a complete usable room with every prior layer retained.
- Purpose: Turns the terminal hold into observable proof that the mechanism completed.
- Failure if removed: Without this exact terminal-proof rule, the sequence stops on motion alone and never confirms the promised outcome or preserved aftermath. Removed rule: "The final hold shows a complete usable room with every prior layer retained."


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

- 机位和门窗几何固定
- 先完成固定施工再进家具
- 终局保留所有前置层级

## Anti-Copy Boundary

- all source faces, bodies, wardrobe, identities and creator-specific character designs
- the source location, set dressing, props, products and exact environmental geometry
- all source words, logos, watermarks, typefaces and brand identifiers
- the source choreography, exact camera path, shot durations and transition timing
- the source palette, signature effects, prompt wording, creator handle and narrative particulars

## Transfer Tests

1. An empty reading room becomes complete through ordered construction and furnishing.
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: lead_subject, setting, escalation_variable, performance_rule, camera_grammar, payoff, sound_family
2. A bare studio kitchen gains surfaces, cabinetry, appliances and tableware in dependency order.
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
