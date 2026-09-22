# 双向接触｜动作回应与状态确认 Template

## Mechanism

A human approaches a responsive engineered counterpart; one tactile initiative is followed by a distinct reciprocal movement, then an independently visible state acknowledgement and a final separated pose that proves the relationship changed.

## Invariants

### inv-01

- Rule: Establish a stable two-sided gap and delay the engineered system's response until after a human initiative.
- Purpose: Creates a clear question of recognition rather than an already-active machine.
- Failure if removed: If the system begins fully responsive, the contact has no dramatic function.

### inv-02

- Rule: Human touch or insertion and system reciprocity are separate readable events across a continuous spatial anchor.
- Purpose: Makes acceptance visible rather than merely declared.
- Failure if removed: A status caption alone would claim an outcome without physical confirmation.

### inv-03

- Rule: Show the acknowledged state and a changed final spatial relation after the reciprocal action.
- Purpose: Completes the interaction with a functional new state.
- Failure if removed: If the scene ends at contact, the audience cannot tell what the interaction enabled.


## Variable Slots

| Slot | Constraint |
|---|---|
| human_role | Adult initiator with a concrete task, not source character identity. |
| counterpart | One engineered responsive object/system with a physical response. |
| contact_interface | One visible sensor, slot or tactile control. |
| reciprocal_motion | Physical acknowledgement distinct from the initial touch. |
| status_signal | Original short visible state change after response, not source dialogue. |
| final_function | Demonstrate newly enabled function in same geography. |
| setting | Can change lab to stage, dock or another controlled environment. |

## Required Human-Facing Anchors

- 主动与回应次序清楚
- 状态信号独立可见
- 结束时两主体仍可区分

## Anti-Copy Boundary

- No source woman's face, tattoos or wardrobe, no white humanoid robot, no intimate near-kiss framing, shoulder embrace, glowing robot chest or source status wording.
- Do not assert source dialogue, actual authentication details or unseen AI intentions.
- No status overlay before the physical response.

## Transfer Tests

1. On a dim empty stage, an adult lighting technician approaches an autonomous tracking spotlight fixed to its floor base. She slowly presents a gloved hand near its cold brass sensor ring; the lamp head first resists, then rotates a few degrees to mirror her hand, and a small mechanical iris opens. Only after a visible sensor contact and motor response does its own panel illuminate the original text 'OPERATOR READY'. She steps aside; the spotlight turns away from her and projects one clean circle on the empty stage.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: human_role, counterpart, contact_interface, reciprocal_motion, status_signal, final_function, setting
2. At a coastal research dock, a field scientist approaches a silent buoy-launch rail. She places one coded sample tag into a physical slot; a small robotic clamp mirrors her hand movement and closes around the tag. A green mechanical flag rises only after the tag is seated; she steps back while the now-enabled rail advances one buoy into its ready cradle.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: human_role, counterpart, contact_interface, reciprocal_motion, status_signal, final_function, setting

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
