# 静态人像转义｜微表情改写前段含义 Template

## Mechanism

Hold one stable subject and place almost motionless under a coherent slow camera approach; in the latter portion of the same view, a small coherent sequence of gaze, expression and visible-state changes becomes readable and reframes the preceding stillness. A transfer may deliberately simplify this to one clear cue. Source-specific bilateral tears and styling are excluded.

## Invariants

### inv-01

- Rule: Keep one subject and one spatial setting stable through a long near-still hold.
- Purpose: Lets the viewer notice a small late difference rather than track changing geography.
- Failure if removed: Rapid location or identity changes consume attention and erase the subtle payoff.

### inv-02

- Rule: Use one slow, legible camera approach or progressive reframing while the subject's motion stays smaller than the camera movement.
- Purpose: Builds attention without substituting montage spectacle for performance.
- Failure if removed: Abrupt cuts or fast camera motion make a micro-change hard to perceive.

### inv-03

- Rule: Reserve a small, coherent visible-state development for the later close view and hold long enough to read it; a transfer may simplify this to one cue.
- Purpose: The delayed cue changes how the earlier restraint is interpreted.
- Failure if removed: If the cue occurs early, is invisible, or is replaced by explanatory text, the delayed reinterpretation disappears.


## Variable Slots

| Slot | Constraint |
|---|---|
| subject | One original stable adult person or clearly designed nonhuman subject; preserve identity. |
| setting | One persistent original space, not the source's ornate room. |
| camera | One slow approach or tightening frame; no rapid montage. |
| late_state_change | One original small visible cue, not the source's exact smile-and-tear pairing. |
| palette_medium | Original visual medium and color design. |
| sound | Optional original restrained sound timed to the cue; not inferred source audio. |

## Required Human-Facing Anchors

- 主体与机位稳定
- 后段变化清楚但克制
- 变化重释前段静止

## Anti-Copy Boundary

- Do not copy the source person's face, hair ornaments, costume, luxury setting, pose, lighting palette or bilateral-tears-plus-smile combination.
- Do not import creator caption wording, brand/tool credits or the original framing trajectory frame by frame.
- Do not treat the source emotion or backstory as known.

## Transfer Tests

1. An adult marathon runner stands nearly still at an empty finish line; a slow approach ends with one hand unclenching to release a crumpled race bib.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: subject, setting, late_state_change, palette_medium, sound
2. A stop-motion maintenance robot holds position in a silent observatory; a slow approach ends when its single chest light changes from amber to green.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: subject, setting, late_state_change, palette_medium, sound

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
