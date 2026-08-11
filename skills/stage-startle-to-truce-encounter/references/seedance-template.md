# Seedance 2.0 template

Use a multi-shot structure for the complete calm-to-truce arc. Do not copy H3 timestamps or field labels.

## Recommended structure

```text
总时长约[4–15]秒，[画幅]，[原创媒介与风格]。
镜头1：[平静主体、基线动作、远处观察者、可读距离与环境光影]
镜头2：[观察者独立视角、透明边界、注意力变化与空间线索]
镜头3：[一次非致命惊慌或防御动作；主体以连贯轨迹缩短距离]
镜头4：[主体抵达透明边界；匹配速度或稳定位置，双方视线准确，观察者出现可见受惊表演]
镜头5：[观察者做一个迟疑求和手势；主体以停留、表情或最小回应证明手势被看见]
<连续环境声、系统声、同步移动声、一次防御瞬态与结尾安静细节>。
约束：[身份、观察者、载具、边界、屏幕方向、光向和相对速度连续；非致命；无字幕Logo水印；不复制样片表面]
```

如使用图片，先写：`角色A@图片1保持[两三个身份锚点与服装]；图片1只提供身份与服装，不提供原场景、构图、动作或首帧。`

## Seedance audit

- Overall duration is 4–15 seconds; no exact per-shot ranges appear.
- Use consecutive `镜头N` labels and one primary camera purpose per shot.
- Every `图片N/视频N/音频N` reference resolves and has one narrow role.
- Physical sound uses `<...>`; dialogue uses `{...}`; music uses `（...）`.
- No H3 fields, `[Shot N]`, speaker IDs, or `<d>` blocks appear.
- The selected instance changes subject, observer, setting, boundary, motion physics, escalation, camera, palette, sound, and ending behavior.

See [seedance-example.txt](./seedance-example.txt) for one validated original text-to-video realization.
