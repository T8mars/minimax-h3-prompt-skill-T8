# 使用指南 / Usage

## 从视频机制开始

本库的核心不是照抄人物、IP、地点或美术资产，而是迁移可复用机制。建议按以下顺序使用案例：

1. 观看完整视频，确认节奏、动作和镜头变化。
2. 阅读 `SUMMARY.md`，了解风格、适用范围和使用方法。
3. 阅读 `creative-dna.json`，找出不可缺少的机制、时间线与 anti-copy 排除项。
4. 选择 MiniMax H3 或 Seedance 2.0 提示词。
5. 替换变量，同时保留因果链、节拍和镜头逻辑。
6. 生成前检查角色、空间、物体状态和时间连续性。

## Electron 查看器

桌面版提供：

- 默认“全部”入口统一显示 39 项：29 个创意案例、9 个 MiniMax 官方仓库条目与 1 个非官方用户贡献 Skill，并保留三个独立分类入口；
- 搜索机制、风格、运镜、标签、作者与案例 ID；
- 卡片 GIF/Poster 快速浏览；
- 详情页完整 MP4 与声音播放；
- 案例摘要、来源、标签与双模型提示词；
- MiniMax H3 / Seedance 2.0 标签页及一键复制；
- 平台、模型和标签筛选，以及两个案例的并排对比；
- 原始帖子跳转。

官方 Skill 视图的 H3 标签页显示上游固定版本、校验哈希和安装命令，不复制上游正文；Seedance 2.0 标签页显示本库原创伴侣模板。9 个条目都带本地官方示例 GIF：8 个风格 Skill 使用对应上游 GIF，通用写作 Skill 使用由上游 T2VA 示例 MP4 转换的 GIF。官方项没有完整案例视频，也不会进入案例对比或 ComfyUI 导入。

“非官方 Skills”视图始终显示来源分类。用户提供完整样片时，Electron 播放媒体包内的有声 MP4，GitHub 则显示轻量 GIF；详情同时呈现证据修复、适用范围、H3 和 Seedance 模板。未提供外部原帖时，界面隐藏来源按钮，不伪造作者或链接。

## 官方 H3 与 Seedance 伴侣如何配合

1. 目标是 MiniMax H3：从官方 Skill 视图打开或安装对应上游 Skill。
2. 目标是 Seedance 2.0：安装同卡片对应的 T8 Seedance 伴侣 Skill。
3. 两者共享任务目标和风格意图，但遵守各自模型原生合同；不要把 H3 六段字段或精确镜头时间复制到 Seedance。
4. ComfyUI 节点已经包含官方能力，因此不从此目录再次导入官方项。

外部来源页面只通过系统浏览器打开，不在具有 Node.js 权限的窗口内运行。

## 目录文件

```text
catalog/cases/<case-id>/
├─ manifest.json          # 公开状态、版本和文件映射
├─ SUMMARY.md             # 给人的摘要与使用说明
├─ creative-dna.json      # 结构化机制、时间线、变量和排除项
├─ source.json            # 作者、平台、原帖和媒体引用
├─ preview.gif            # GitHub 静音循环预览
└─ prompts/
   ├─ minimax-h3.md
   └─ seedance-2.0.md
```

`source.json` 中的完整 MP4 映射指向 Release 媒体包，不表示 MP4 会进入 Git 历史。

非官方 Skill 的公开索引位于：

```text
catalog/community-skills/
├─ manifest.json
└─ <skill-id>/
   ├─ manifest.json
   ├─ SUMMARY.md
   ├─ preview.gif
   └─ poster.webp
```

## 提示词迁移检查

- 主体变化后，动作是否仍然可执行？
- 镜头能否在约 15 秒内完成？
- 物体状态变化是否有清楚触发原因？
- 光线方向和时间是否连续？
- 角色身份、服装、比例和空间位置是否稳定？
- 是否意外复制原视频的受保护角色、品牌或逐帧构图？
- H3 与 Seedance 版本是否保留同一 Creative DNA，而非逐字相同？

提示词结果具有随机性；模型版本、参考素材和生成参数变化都可能影响输出。本库提供可复用设计，不保证逐像素复现。

---

**English summary:** Watch the full video, read the case summary and Creative DNA, then adapt the model-specific prompt by changing subjects and assets while preserving causal motion, timing, camera logic, continuity, and anti-copy exclusions.
