# 对话喜剧｜双轮停顿无声反应

双人同框先建立眼线，第一轮说话后留出清楚停顿，再完成第二轮说话并以第一人的无声反应收尾；具体对白和喜剧语义必须全新原创。

## 核心机制

Use a neutral two-shot to establish equal conversational footing, show one visible speaking turn, hold a clearly readable pause, show a second speaking turn, and end on the first speaker's silent reaction. The source supports only this visual turn-taking and reaction grammar; any question, answer meaning or comic mismatch is an explicitly original instantiation slot, never a source-derived fact.

## 推荐输入格式

`双人中景 + 第一轮简短说话 + 一次可读停顿 + 第二轮简短说话 + 第一人的无声反应`

## 简短示例

> 两名原创博物馆夜班保安在休息室对坐：A 问雕像是否眨眼，停顿后 B 冷静回答“只有你转开视线时”，最后 A 无声看向黑暗展厅门，不增加第二句笑点。

## 必须保留的结构锚点

- 开场双人中景建立稳定眼线
- 只保留一轮第一人说话
- 两轮之间有一次清楚停顿
- 第二人只说一轮且动作克制
- 结尾第一人无声反应且不再增加说话轮次

## 使用方法

1. 先保留用户主体和目标，再按推荐格式补齐场景、事件链、镜头和结果。
2. 阅读 [Creative DNA](./creative-dna.json)，重新实例化变量，不做来源表面换名词。
3. 分别查看 [MiniMax H3](./prompts/minimax-h3.md) 与 [Seedance 2.0](./prompts/seedance-2.0.md) 的已验证实例。
4. GitHub 使用 GIF 快速预览；Electron 媒体包播放完整有声 MP4。

## 来源与署名

- 平台：x
- 作者：@TechieBySA
- 原始视频：[打开来源](https://x.com/TechieBySA/status/2084600512180113820)
- 模型归因：MiniMax H3（creator_claimed）

来源视频用于机制研究与引用；公开模板只保留可迁移因果，不要求复刻来源人物、道具、场景、构图、对白或标志性效果。
