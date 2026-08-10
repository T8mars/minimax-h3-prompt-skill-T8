# 路线坍塌｜安全空间逐段消失

主体只朝固定终点前进，走过的路线单调消失，完全跨过阈值后最后连接才断开。

## 核心机制

Lock one subject to a single screen-direction destination, then remove traversed route segments monotonically from behind while introducing one instability under the current segment. Alternate local control proof with wide remaining-route proof, and end with the subject fully crossing a safety threshold one beat before the final connection fails.

## 推荐输入格式

`载体 + 固定方向和终点 + 已走路线逐段消失 + 当前段一次失稳 + 完全过阈值后最后断开`

## 简短示例

> 透明温室管道中的采样车始终朝安全舱行驶，驶过的管段依次塌陷；当前管段只发生一次摇摆，车辆完全进入安全舱后最后接口才断开。

## 必须保留的结构锚点

- 方向与终点固定
- 后方路线只减不增
- 当前段最多一次可恢复失稳
- 主体完全过阈值后才断开最后连接

## 使用方法

1. 先保留用户主体和目标，再按推荐格式补齐场景、事件链、镜头和结果。
2. 阅读 [Creative DNA](./creative-dna.json)，重新实例化变量，不做来源表面换名词。
3. 分别查看 [MiniMax H3](./prompts/minimax-h3.md) 与 [Seedance 2.0](./prompts/seedance-2.0.md) 的已验证实例。
4. GitHub 使用 GIF 快速预览；Electron 媒体包播放完整有声 MP4。

## 来源与署名

- 平台：x
- 作者：@DeCat2025
- 原始视频：[打开来源](https://x.com/DeCat2025/status/2086287667948396933)
- 模型归因：Seedance 2.0（creator_claimed）

来源视频用于机制研究与引用；公开模板只保留可迁移因果，不要求复刻来源人物、道具、场景、构图、对白或标志性效果。
