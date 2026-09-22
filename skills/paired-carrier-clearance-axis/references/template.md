# 双载具间距｜同轴移动与安全错位 Template

## Mechanism

Two moving carriers share a clear travel axis while their relative vertical gap narrows and then widens. Spatially legible near-miss tension depends on co-direction, persistent geography, visible clearance and non-contact resolution, not a specific failure cause.

## Invariants

### inv-01

- Rule: Establish exactly two distinct moving carriers on one stable co-directional route.
- Purpose: Makes relative distance meaningful across views.
- Failure if removed: Opposing travel axes or duplicate vehicles make the near-miss geometry incoherent.

### inv-02

- Rule: Show the gap changing while both carriers and a stable environmental reference remain legible; preserve non-contact clearance.
- Purpose: Provides a visible spatial cause for tension.
- Failure if removed: A close-up with no shared scale or apparent collision cannot prove a near miss.

### inv-03

- Rule: End in a wide enough view to prove increased separation on the same route.
- Purpose: Closes the spatial question without an invented impact.
- Failure if removed: Ending during the tight gap leaves the outcome unresolved.


## Variable Slots

| Slot | Constraint |
|---|---|
| lower_carrier | One original lower moving unit with stable silhouette and route. |
| upper_carrier | One original higher moving unit with stable altitude relation; must never contact lower one. |
| environment | Stable route, direction and side landmarks. |
| gap_event | One readable narrowing with a clear minimum safe distance. |
| separation | Visible restoration of vertical gap and shared forward direction. |
| camera | Establish shared axis, prove closest gap, then hold wide separation. |
| sound | Original sound may follow relative motion, not attributed to unheard source audio. |

## Required Human-Facing Anchors

- 共同运动轴明确
- 相对高度和间距可读
- 不发生穿模或碰撞

## Anti-Copy Boundary

- No red numbered race car, black helicopter, mountain track or exact vehicle livery and camera positions.
- Do not copy the source snapshot's unverified power-loss explanation or treat the excerpt as a complete original prompt.
- No crash, real passenger peril or false precise distance claim.

## Transfer Tests

1. A mountain cable car and small maintenance airship move toward the same upper station; the airship dips then restores a visible safe air gap.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: lower_carrier, upper_carrier, environment, gap_event, separation, camera, sound
2. A miniature stop-motion freight trolley and motorized overhead bridge crane travel together down one factory aisle; the crane hook descends close to the trolley roof, stops, then rises while both continue away.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: lower_carrier, upper_carrier, environment, gap_event, separation, camera, sound

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
