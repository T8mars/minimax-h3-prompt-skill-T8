# 指尖控制｜四向同拍全身响应 Template

## Mechanism

A visible foreground controller establishes a fixed four-direction screen-space language; a co-visible responder begins one matching full-body movement within the same beat for every cue, and repeated axis alternation lets the audience learn and verify the causal rule inside one continuous frame.

## Invariants

### inv-01

- Rule: The visible controller and full responder must be co-visible before the first command and remain jointly readable throughout.
- Purpose: 
- Failure if removed: If either party leaves frame or the hand covers the responder, the audience cannot verify causality and the hook becomes an ordinary dance or mime.

### inv-02

- Rule: Use one fixed screen-coordinate mapping: up means rise, down means lower, left means shift left and right means shift right.
- Purpose: 
- Failure if removed: If axes invert, rotate or change meaning, the learned visual rule collapses and repeated commands feel random.

### inv-03

- Rule: Each deliberate cue receives one immediate beat-level response; the responder does not freestyle between commands.
- Purpose: 
- Failure if removed: Delay, anticipation or unrelated choreography breaks the controller illusion even when individual poses look attractive.

### inv-04

- Rule: Horizontal commands produce whole-body displacement and vertical commands change center of gravity, keeping response amplitude unmistakable.
- Purpose: 
- Failure if removed: Tiny wrist, shoulder or hip twitches are too ambiguous to read as directional control.

### inv-05

- Rule: Alternate and repeat both axes in one continuous take, then end with a brief release only after the rule has been proven.
- Purpose: 
- Failure if removed: A single demonstration cannot teach and verify the mapping; cuts or an early freestyle ending remove the proof.


## Variable Slots

| Slot | Constraint |
|---|---|
| responder |  |
| controller |  |
| setting |  |
| command_sequence |  |
| response_vocabulary |  |
| camera |  |
| sound_family |  |
| release |  |

## Required Human-Facing Anchors

- 第一条指令前，控制器和完整响应者已经同框且都可读。
- 屏幕方向固定：上=升、下=降、左=整体左移、右=整体右移。
- 每个指令只对应一个同拍响应；无提前、延迟、轴向翻转或独立即兴。
- 横向是可见全身位移，纵向改变重心；纵横轴都至少重复一次再收尾。

## Anti-Copy Boundary

- Do not reproduce the source woman's face, hairstyle, body proportions or recognizable likeness.
- Do not reproduce the black cutout bodysuit or its exact silhouette.
- Do not reproduce the source blue-gray room, wall-mounted television, door placement, ceiling-light layout or floor arrangement.
- Do not reproduce the source foreground hand's exact appearance, scale path or framing errors.
- Do not reuse the exact observed dance surface, exact source command timing or source audio; preserve only the abstract causal grammar.

## Transfer Tests

1. Luminous stylus controls a studio robot
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: responder, controller, setting, response_vocabulary, sound_family, release
2. Conductor baton controls an adult mime
   - Preserved: inv-01, inv-02, inv-03, inv-04, inv-05
   - Changed: responder, controller, setting, camera, sound_family, release

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
