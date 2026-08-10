# 互动图鉴｜固定菜单切换生物

菜单、数据区和主视窗固定不动，选择器逐项切换，每次让名称、参数与主视窗主体同步更新并完成一个定义动作。

## 核心机制

Keep one information interface and spatial grid fixed while a visible selector chooses one item at a time. Each selection must update the title, concise attributes and one large live viewport together; the selected subject then performs one short behavior that proves the new state before the next choice.

## 推荐输入格式

`固定选择菜单 + 固定数据区 + 固定主视窗 + 至少4个原创对象 + 每次可见选择 + 同步字段更新 + 一个定义动作`

## 简短示例

> 固定气象无人机图鉴依次选择五台原创无人机，每次先移动选择器，再同步更新呼号、风力参数和主视窗，并让新无人机在对应天气舱完成一个定义动作。

## 必须保留的结构锚点

- 菜单、数据区和主视窗位置固定
- 每次内容变化前必须有可见选择
- 名称参数和主体同步更新
- 每个被选主体完成一个定义动作
- 结尾保持完整最终选择状态

## 使用方法

1. 先保留用户主体和目标，再按推荐格式补齐场景、事件链、镜头和结果。
2. 阅读 [Creative DNA](./creative-dna.json)，重新实例化变量，不做来源表面换名词。
3. 分别查看 [MiniMax H3](./prompts/minimax-h3.md) 与 [Seedance 2.0](./prompts/seedance-2.0.md) 的已验证实例。
4. GitHub 使用 GIF 快速预览；Electron 媒体包播放完整有声 MP4。

## 来源与署名

- 平台：x
- 作者：@aimikoda
- 原始视频：[打开来源](https://x.com/aimikoda/status/2083949566009778473)
- 模型归因：MiniMax H3（creator_claimed）

来源视频用于机制研究与引用；公开模板只保留可迁移因果，不要求复刻来源人物、道具、场景、构图、对白或标志性效果。
