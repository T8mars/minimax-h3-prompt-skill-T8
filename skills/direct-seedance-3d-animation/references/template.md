# Seedance 3D animation template

## Production lock

```text
Format: [ratio], [total duration], [single clip / multi-clip]
Character A: [identity anchors, silhouette, wardrobe, emotional baseline]
Environment: [layout anchors, light direction, palette, fixed objects]
Story chain: [want -> obstacle -> action -> consequence -> payoff]
```

## Per-clip card

```text
Clip purpose: [new story information]
Opening state: [subject pose, screen position, environment state]
Action chain: [anticipation -> committed action -> contact/consequence -> recovery]
Handoff: [last pose, gaze, object motion, camera direction, sound tail]
References: [图片N/视频N -> one role each]
```

## Prompt skeleton

```text
镜头1：[stable subject binding and composition]. [visible performance and object action]. [primary camera behavior]. [light/material/style]. [sound].
镜头2：[continue the causal action without resetting identity or geography]. [new consequence and reaction]. [coherent camera]. [sound/dialogue].
镜头3：[resolve the clip goal and hold a handoff-ready final state].
约束：角色身份、服装、比例、场景锚点和光线方向稳定；无多余角色、无肢体融合、无风格漂移。
```

Use fewer shots when fewer causal changes exist. For a continuous performance, replace the blocks with one paragraph.

## Cross-clip audit

- Identity, wardrobe, scale, handedness, prop ownership, and environment landmarks match.
- Camera direction and moving objects enter the next clip consistently.
- Dialogue and sound tails are not duplicated.
- No clip exceeds 15 seconds and no Seedance prompt contains shot timestamps or H3 syntax.
