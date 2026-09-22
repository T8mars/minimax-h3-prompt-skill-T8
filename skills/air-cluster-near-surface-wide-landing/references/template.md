# 空中群集｜近表面转向到稳定落地 Template

## Mechanism

Track one lead through a crowded airborne opening, one direction change visibly close to a fixed surface, a brief wide geography reset and a final weighted landing that resolves accumulated motion. The source touches a roof in the middle phase; the drone transfer stays airborne above a deck until the final pad landing.

## Invariants

### inv-01

- Rule: Keep one tracked lead through an opening airborne cluster and a direction change visibly close to a fixed surface; source contact and transferred near-surface flight need not have identical physics.
- Purpose: Audience can follow a protagonist despite high motion density.
- Failure if removed: Without stable lead and terrain, the action reads as unrelated clips.

### inv-02

- Rule: Reopen geography after the near-surface direction-change phase before the final descent.
- Purpose: Restores travel direction and depth.
- Failure if removed: Without the wider reset the final landing has no readable origin.

### inv-03

- Rule: Close on a physical braced landing with visible residual motion.
- Purpose: Provides a measurable payoff and end state.
- Failure if removed: An airborne freeze or weightless disappearance leaves motion unresolved.


## Variable Slots

| Slot | Constraint |
|---|---|
| lead | One visually persistent adult performer or machine. |
| airspace | Clear elevation and near/far lanes. |
| ground_plane | A physical surface for the mid-beat and final landing. |
| secondary_movers | Distinct from lead, no duplicate identity. |
| camera_reset | One wider view before final descent. |
| landing_residue | Small material movement that settles after contact. |

## Required Human-Facing Anchors

- 领衔主体始终可追踪
- 宽景重建方向和深度
- 最后接触面与余动可见

## Anti-Copy Boundary

- No source faces, dark martial costume, traditional rooftops, skyline combination, sparks or blows.
- No unverified injury or lethal force.
- No hovering final pose: land with contact and residual motion.

## Transfer Tests

1. At a coastal wind-energy test range, one orange inspection drone is the tracked lead among several dark service drones. In one ten-second run it crosses above turbine support platforms, drops to skim over a marked deck, banks around a stationary safety mast, then the camera opens to show the full array and the lead descends onto its dedicated landing pad. Rotor wash moves only lightweight dust at the pad; all drones stay separate and no collisions occur.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: lead, airspace, ground_plane, secondary_movers, camera_reset, landing_residue
2. At a bright indoor aerial-acrobatics arena, one adult performer in a teal safety harness passes through two suspended rings, lands briefly on a sprung mat to change direction, takes a second assisted swing as the camera widens to show rigging, then returns to a stable mat landing. All aerial movement has visible rig and safe mat contact.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: lead, airspace, ground_plane, secondary_movers, camera_reset, landing_residue

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
