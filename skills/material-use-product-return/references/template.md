# 材质到使用｜产品关联与实证回归 Template

## Mechanism

The source maintains one product identity while associating it with water, cream-like textures and a brief skin-touch use image, returns the product, then ends on an isolated droplet. This is an associative material-to-use-to-product sequence, not observed proof of efficacy. A reusable transfer can strengthen the structure by replacing implication with a practical visible test and bounded outcome.

## Invariants

### inv-01

- Rule: Establish one stable product shape before close material inserts.
- Purpose: Lets each texture and usage shot refer to the same object.
- Failure if removed: If shape or owner changes, the montage cannot be attributed to one product.

### inv-02

- Rule: Keep material associations and a brief use context attributable to the same established product; do not mistake source spectacle for observed efficacy.
- Purpose: Links attractive material cues to the product without inventing a measured skin result.
- Failure if removed: If material and use imagery lose their product anchor, the montage becomes generic decoration.

### inv-03

- Rule: Return to a readable product view after material and use imagery; an abstract coda may follow.
- Purpose: Closes the product-identity chain before any final decorative image.
- Failure if removed: Ending on abstraction alone without a prior product return weakens the identity payoff.


## Variable Slots

| Slot | Constraint |
|---|---|
| product | One original unbranded, stable object with consistent geometry. |
| material_test | Source-level material association or, in an original transfer, one visible practical property test; never claim invisible health efficacy. |
| environment | A coherent setting that materially participates in the test. |
| user | Optional clearly adult user, same identity if present. |
| camera | Product establishing view, material/contact view, use/result view, end product proof. |
| medium_palette | Original medium and colors; avoid source's blue-white water/flower/cream package. |
| sound | Original synchronized contact sounds, not source audio attribution. |

## Required Human-Facing Anchors

- 产品身份连续
- 材质与使用有可见关系
- 不把暗示写成未经验证的功效

## Anti-Copy Boundary

- No AQUA LUXE brand, exact label, jar, flower arrangement, splash composition or skin model.
- Do not infer measured hydration, medical results or before/after proof from the original clip.
- Do not copy the creator's source prompt wording or the exact shot order/cut timing.

## Transfer Tests

1. An unbranded reusable cold-drink bottle demonstrates its cap seal, condensation and leak-free short carry before a legible product return.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: product, material_test, environment, user, camera, medium_palette, sound
2. An original insulated lunch box shows a safe carry, then releases visible steam only after its lid opens to reveal the warm meal.
   - Preserved: inv-01, inv-02, inv-03
   - Changed: product, material_test, environment, user, camera, medium_palette, sound

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
