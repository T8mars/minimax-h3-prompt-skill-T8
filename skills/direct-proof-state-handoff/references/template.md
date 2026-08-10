# 风险揭晓｜证据交给人物反应 Template

## Mechanism

An urgent intervention creates conflict, a controlled visual proof makes the hidden risk undeniable, and one motivated camera handoff transfers that proof to the recipient's compact reaction.

## Invariants

### inv-01

- Rule: Establish an urgent conflict through action before revealing the proof state.
- Purpose: Creates an immediate question and gives the later evidence a causal reason to appear.
- Failure if removed: Opening on the explanation removes tension and turns the scene into a flat demonstration.

### inv-02

- Rule: Hold the proof state visually stable long enough to be understood before the camera hands off.
- Purpose: Makes the evidence itself readable while keeping it integrated with performance.
- Failure if removed: Moving away before the hidden condition resolves makes the intervention feel arbitrary.

### inv-03

- Rule: Use one motivated reframe to hand the last line to a contrasting second speaker.
- Purpose: Converts instruction into a two-person joke without wasting time on coverage.
- Failure if removed: Keeping the camera on the first speaker removes the reaction payoff.


## Variable Slots

| Slot | Constraint |
|---|---|
| authority_role | A visually decisive expert with a clear reason to instruct. |
| recipient_role | A contrasting novice or peer who can answer in one short line. |
| proof_state | A physical condition, instrument reading, light reveal, or object state that becomes visually unambiguous without copying source typography. |
| setting | A context-rich location readable behind a medium close subject. |
| intervention | One brief action or line that stops the unsafe or mistaken behavior before the proof appears. |
| reaction | One gesture and one line that resolve the conflict. |
| camera_handoff | One pan or cut motivated by the second speaker. |
| sound | Location ambience plus non-overlapping dialogue; no music required. |

## Required Human-Facing Anchors

- 先有干预冲突
- 风险通过可视证据证明
- 镜头交接有物理动机
- 反应简短且改变后续行为

## Anti-Copy Boundary

- protected television characters or actor likenesses
- source-series wardrobe, vehicle, desert setup, or color grade
- source-character voices and exact dialogue
- exact guide title, profanity, framing, or prop typography

## Transfer Tests

1. A museum conservator stops an assistant's brush, lowers an ultraviolet inspection hood, and reveals branching fluorescent repairs before the camera follows the glow to the assistant's embarrassed recoil.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: authority_role, recipient_role, proof_state, setting, intervention, reaction
2. An observatory technician blocks a trainee from opening a dome, slides one red safety filter over the sensor, and reveals a dangerous solar flare before the camera follows the red reflection to the trainee's silent step back.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: authority_role, recipient_role, proof_state, setting, sound

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
