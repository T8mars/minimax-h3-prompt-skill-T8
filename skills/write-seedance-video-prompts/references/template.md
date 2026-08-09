# Seedance 2.0 prompt template

## Task matrix

- `text_image_generation`: create a new video from text and optional still/keyframe references.
- `multimodal_reference`: transfer a declared subject, scene, action, camera, effect, style, voice, music, or continuity property.
- `video_editing`: modify a named `视频N`; leave unspecified content unchanged.
- `video_extension`: continue a named `视频N` while preserving audiovisual and narrative continuity.
- `track_fill`: connect two or three named videos in declared playback order.
- `combined`: reference one asset while editing or extending another.

## Planning card

```text
Target: [task family], [4–15 seconds], [aspect ratio]
Subjects: [stable label + 2–3 identity anchors]
Assets: [图片N/视频N/音频N -> one narrow role each]
Event chain: [setup -> trigger -> visible change -> payoff]
Primary camera: [one coherent behavior per shot]
Sound/text: [only requested or evidenced layers]
```

## Simple output

Use one compact paragraph:

```text
[Stable subject binding]. [Initial composition and spatial state]. [Visible trigger and continuous action with speed/force/contact]. [Primary camera behavior]. [Lighting, color, and medium]. [Synchronized sound/dialogue/music/visible copy when requested]. [Compact constraints].
```

## Multi-shot output

```text
镜头1：[composition + subject action + spatial change + camera + necessary sound]
镜头2：[causal handoff + new visible information + coherent camera + necessary sound]
镜头3：[payoff/final state + readable hold + necessary sound]
约束：[only identity, geometry, medium, contact, continuity, or copy protections]
```

Do not attach numeric time ranges to the shots. Let causal and spatial changes determine their length.

## Final audit

- Duration is 4–15 seconds and action density is feasible.
- Shot labels are consecutive when used.
- Every subject and asset label resolves in both directions.
- One shot does not contain contradictory simultaneous camera commands.
- Dialogue language, visible copy, sound, and music are not invented.
- No H3 field name, label, timestamp, or retention syntax remains.
