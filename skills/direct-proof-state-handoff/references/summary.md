# Proof-State Camera Handoff — 摘要

## 风格与机制

写实微剧情；双人物非重叠对白；证据状态清晰停留；一次由光线、视线或声音驱动的镜头交接。

An urgent intervention creates conflict, a controlled visual proof makes the hidden risk undeniable, and one motivated camera handoff transfers that proof to the recipient's compact reaction.

## 适用范围

- 安全提醒、专业知识演示和反应笑点
- 由道具或光学状态承担解释工作的 15 秒场景
- 两个人物、两句以内对白和一次镜头交接

## 不适用范围

- 证据无法直接看懂的纯口播
- 需要大量覆盖镜头或复杂对白的剧情

## 使用方法

1. 明确新视频的传播目标、受众、主体、场景、媒介、必须展示的动作和结尾。
2. 填写下面所有可变槽；至少同时改变四项，接近原类型时改变六项以上。
3. 保留因果不变量，但重新设计镜头实现、光影、材质、声音和最终状态。
4. 分别编写 MiniMax H3 与 Seedance 2.0 提示词，不在两种模型之间机械复制语法。
5. 最后检查动作先后、空间连续性、身份稳定和反复制距离。

## 可变槽位

| 槽位 | 约束 |
|---|---|
| `authority_role` | A visually decisive expert with a clear reason to instruct. |
| `recipient_role` | A contrasting novice or peer who can answer in one short line. |
| `proof_state` | A physical condition, instrument reading, light reveal, or object state that becomes visually unambiguous without copying source typography. |
| `setting` | A context-rich location readable behind a medium close subject. |
| `intervention` | One brief action or line that stops the unsafe or mistaken behavior before the proof appears. |
| `reaction` | One gesture and one line that resolve the conflict. |
| `camera_handoff` | One pan or cut motivated by the second speaker. |
| `sound` | Location ambience plus non-overlapping dialogue; no music required. |

## 反复制提醒

- protected television characters or actor likenesses
- source-series wardrobe, vehicle, desert setup, or color grade
- source-character voices and exact dialogue
- exact guide title, profanity, framing, or prop typography

不要只替换名词后保留相同分镜。来源人物、品牌、对白、标志性道具、精确构图、节奏和效果都不应出现在新作品中。

## 深入模板

完整不变量、消融原因、转移测试、失败修复和双模型骨架见 [template.md](./template.md)。
