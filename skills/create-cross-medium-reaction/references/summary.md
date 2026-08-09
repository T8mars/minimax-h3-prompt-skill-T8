# Cross-Medium Contact Reaction Ladder — 摘要

## 风格与机制

写实实拍与单一二维纸贴角色混合；固定机位；接触阴影稳定；反应表演和材质特效承担节奏。

A single flat 2D character shares a locked photoreal environment with a real hand; one small cross-medium contact causes a three-stage readable reaction that ends in a medium-specific impossible effect.

## 适用范围

- 混合媒体短片、轻喜剧和产品演示
- 单一构图中的接触—反应—结果链
- 需要用动作和效果而不是对白维持注意力的 15 秒概念

## 不适用范围

- 多角色群戏或高速蒙太奇
- 无法维持平面厚度、遮挡和接触阴影稳定的场景

## 使用方法

1. 明确新视频的传播目标、受众、主体、场景、媒介、必须展示的动作和结尾。
2. 填写下面所有可变槽；至少同时改变四项，接近原类型时改变六项以上。
3. 保留因果不变量，但重新设计镜头实现、光影、材质、声音和最终状态。
4. 分别编写 MiniMax H3 与 Seedance 2.0 提示词，不在两种模型之间机械复制语法。
5. 最后检查动作先后、空间连续性、身份稳定和反复制距离。

## 可变槽位

| 槽位 | 约束 |
|---|---|
| `photoreal_arena` | A stable real location with clear depth and one interaction surface. |
| `flat_character` | One original 2D paper- or sticker-like adult mascot, visually distinct from the source. |
| `real_agent` | One live-action hand or tool entering from a consistent edge. |
| `contact_object` | A small real object whose motion can visibly cross the medium boundary. |
| `sensation` | A simple cause such as cold, static, scent, or weight, not source heat/chili. |
| `reaction_states` | Three visually distinct but causally continuous poses. |
| `payoff_effect` | An original safe effect appropriate to the new sensation. |
| `sound` | Real location ambience plus contact-synced foley and one effect accent. |

## 反复制提醒

- source girl character, hairstyle, clothes, face, outline, or childlike proportions
- source kitchen, wok, food, seasoning jar, spoon interaction, and camera composition
- chili or heat tasting, lateral tear jets, red forehead, and fire breathing
- exact reaction timing and source visual effects

不要只替换名词后保留相同分镜。来源人物、品牌、对白、标志性道具、精确构图、节奏和效果都不应出现在新作品中。

## 深入模板

完整不变量、消融原因、转移测试、失败修复和双模型骨架见 [template.md](./template.md)。
