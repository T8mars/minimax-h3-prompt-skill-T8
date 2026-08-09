# Seedance 2.0 template

## Single continuous interaction

```text
[TARGET_DURATION]秒，[ASPECT_RATIO]。角色A@[图片1，如有]是一位[人物身份与两三个稳定外观锚点]，始终保持同一发型、身材比例和[服装锚点]。在原创的[街道与时段]，第一人称手持镜头以[倒退跟拍/侧向并行]保持[景别]，角色A从[起始距离]沿[路线几何]自然接近；脚步带来轻微而克制的纵向起伏，[前景物/背景线条]持续产生真实视差，[树影/橱窗反射/建筑阴影]同时掠过人物和环境，曝光只做轻微自然适应。画外采访者问{短句1}，角色A看向镜头，以[目光、呼吸、步态或手势]回应{短句2}；随后通过[距离、速度、身体角度或共享物体的变化]推进关系，并在结尾落到[许可、姿势、展示、路线选择、反应或自然离场]，停留到状态可读。<连续街道环境声、同步脚步、衣料和可见动作声>。约束：身份与服装稳定，路线和光向连续，手脚接触可信，无多余人物复制，无字幕Logo水印，不出现未经要求的音乐，不从片尾才开始新镜头。
```

没有图片时删除 `@图片1`，不要保留空引用。若使用图片，在资产职责中写明：`图片1只提供角色A的身份与服装，不提供原场景、构图或动作。`

## Multi-shot variant

只在确有切镜时使用连续 `镜头N`，不要写逐镜头秒数：

```text
总时长约[TARGET_DURATION]秒，[ASPECT_RATIO]。角色A@图片1保持[身份锚点和服装]；图片1只提供身份与服装。
镜头1：[原创街道、起始距离、社会前提、第一句短对白、主要跟拍方式、环境视差与光线]
镜头2：[由视线、停步、转身或共享物体驱动的必要重构图；第二组短对白与可见关系变化]
镜头3：[可读的最终状态与短暂停留，不开启新的故事线]
<统一地点环境声、同步脚步与动作声>。约束：[身份、服装、空间、接触、文字和反复制边界]
```

## Seedance audit

- Overall duration is 4–15 seconds; there are no exact per-shot timestamps.
- Every `图片N/视频N/音频N` reference resolves and has one narrow role.
- Dialogue uses `{...}`; physical sound uses `<...>`; music uses `（...）`; visible copy uses `【...】` only when requested.
- No H3 field names, `<Subject N>`, `[Shot N]`, speaker IDs, or `<d>` blocks appear.
- The prompt changes the sample's person, outfit, city surface, dialogue, route, framing, and ending.
