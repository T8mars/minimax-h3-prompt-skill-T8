# Proof-State Camera Handoff Template

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
| `authority_role` | A visually decisive expert with a clear reason to instruct. |
| `recipient_role` | A contrasting novice or peer who can answer in one short line. |
| `proof_state` | A physical condition, instrument reading, light reveal, or object state that becomes visually unambiguous without copying source typography. |
| `setting` | A context-rich location readable behind a medium close subject. |
| `intervention` | One brief action or line that stops the unsafe or mistaken behavior before the proof appears. |
| `reaction` | One gesture and one line that resolve the conflict. |
| `camera_handoff` | One pan or cut motivated by the second speaker. |
| `sound` | Location ambience plus non-overlapping dialogue; no music required. |

## Anti-Copy Boundary

- protected television characters or actor likenesses
- source-series wardrobe, vehicle, desert setup, or color grade
- source-character voices and exact dialogue
- exact guide title, profanity, framing, or prop typography

Treat these exclusions as a floor, not a checklist. Also change the setting, subject category, prop system, palette, camera implementation, sound design, and final visual state whenever they are source-adjacent.

## Transfer Test

Before drafting prompts:

1. Choose a new purpose and audience.
2. Fill every slot with an internally coherent choice.
3. Change at least four slots together; for close genres, change six or more.
4. Prove every invariant using the new scene's own actions and physics.
5. Reject the concept if it keeps the same beat-for-beat spectacle after the nouns change.

## Model Templates

### MiniMax H3

```text
integrated_multimodal_description: [opening state and hook] [causal action] [readable escalation or proof] [final state and hold]
overall_soundscape: [location ambience, action-synchronized foley, final accent]
non_diegetic_music: [optional arc; omit or state silence when inappropriate]
```

### Seedance 2.0

```text
任务：[文本生成新视频或用户指定任务]
总时长约15秒。
主体定义：[稳定主体名称与不变特征]
镜头/事件1：[开场状态、构图、光线、声音]
镜头/事件2：[因果动作与空间关系]
镜头/事件3：[递进、证明或转折]
镜头/事件4：[最终状态与停留]
整体风格与画质：[媒介、材质、光影、连续性]
约束：[数量、身份、文字、禁止项和反复制边界]
```

Adapt the event count to the new concept. Do not force four events.

## Quality Repairs

- **The proof state changes too quickly to understand.** Repair by: Hold the revealed condition for at least two seconds with stable light, focus, and spatial context before the handoff.
- **Dialogue overlaps or sounds rushed.** Repair by: Keep two short lines, place the speaker handoff after the first line fully ends, and remove extra actions.
- **The scene feels copied despite changed names.** Repair by: Change profession, location, wardrobe, prop category, dialogue, and camera surface while preserving only the causal timing.

## Non-Binding Transfer Examples

These examples demonstrate distance from the source. Do not reproduce them verbatim.

- A museum conservator stops an assistant's brush, lowers an ultraviolet inspection hood, and reveals branching fluorescent repairs before the camera follows the glow to the assistant's embarrassed recoil.
- An observatory technician blocks a trainee from opening a dome, slides one red safety filter over the sensor, and reveals a dangerous solar flare before the camera follows the red reflection to the trainee's silent step back.
- A pastry chef catches a trainee's piping bag, turns a sugar thermometer toward the light, and reveals crystallization in macro before the lens rack-focuses to the trainee lowering the tray.
