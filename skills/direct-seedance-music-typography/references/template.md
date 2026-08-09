# Seedance music-typography template

## Master lock

```text
Master audio: 音频1 -> exact music/voice window
Lyrics: [user-supplied / original approved / no lyrics]
Performer@图片1: [identity and wardrobe]
Scene@图片2: [space, light, palette]
Typography style@图片3: [font texture/layout/motion only]
Global look: [grain, color, lighting, lens]
```

## Beat-event plan

Keep external editorial timing in a separate plan. Each event records:

- lyric or musical cue;
- performer action and mouth/breath/gaze behavior;
- one spatial typography event;
- one camera impulse or cut;
- transition handoff.

## Prompt skeleton

```text
音频1提供全片音乐、节奏和人声时序。表演者@图片1保持身份、服装和面部比例，场景@图片2保持空间、光线与色调，图片3只提供文字包装风格。
镜头1：表演者随[opening cue]完成[visible performance]，演唱/说出{exact lyric}；空间文字【exact lyric】在不遮挡眼睛和嘴部的位置以[one motion]出现，镜头[one coherent behavior]。
镜头2：在[snare/bass/vocal accent]发生[hard cut or match move]，动作延续到新构图；表演者完成[next phrase]，只出现一个新的【exact visible lyric】事件。
镜头3：[payoff performance and final text state]，动势与音乐尾部连续收束。
约束：歌词、口型和可见文字逐字一致；每镜头最多一个主文字事件；人物、服装、颗粒、色调、光向稳定；无普通字幕条、无多余文案Logo水印。
```

## Audit

- Every performed and visible word comes from the locked lyric source.
- Audio, character, scene, and typography references do not cross-contaminate roles.
- Cuts land on meaningful musical or vocal events without breaking an active phrase arbitrarily.
- Multi-clip handoffs preserve master-audio position externally; prompts contain no exact shot times.
- No H3 grammar remains.
