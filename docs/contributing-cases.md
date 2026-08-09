# 贡献案例 / Contributing Cases

## 准入范围

案例必须是一个具体、可观看的创意短视频，并具有可迁移的视觉、动作、运镜、时间、声音、表演或叙事机制。约 15 秒是主要目标，但机制价值高时可以接受相邻时长。

以下内容直接拒绝，不计为案例：

- 技术教程、安装或设置指南；
- ComfyUI 或其他工作流帖子；
- 性能、加速、模型 A/B Benchmark；
- 发布新闻、讨论帖和纯模型宣传；
- Prompt 工具或提示词增强器演示；
- 无法指向具体创意视频的链接集合。

## 必需证据

- 原始或可信的公开帖子 URL；
- 作者/账号与平台；
- 视频与提示词是否来自同一作者、同一帖子或同一线程的说明；
- 模型归属状态，不确定时必须明确标为不确定；
- 可复用机制说明，而不只是“画面很好看”；
- 去重信息，避免同一 URL、同一视频或同一机制重复发布。

公开案例不能根据残缺视频编造完整时间线。

## 公开案例最小合同

```text
catalog/cases/<case-id>/
├─ manifest.json
├─ SUMMARY.md
├─ creative-dna.json
├─ source.json
├─ preview.gif
└─ prompts/
   ├─ minimax-h3.md
   └─ seedance-2.0.md
```

`manifest.json` 必须包含 `status: "released"`。草稿和待审核状态只能留在私有工作区，不能提交到本仓库。

## GIF 规范

- 选择最能表现核心机制的 4–6 秒；
- 推荐宽度 640px、10–12 FPS、循环播放；
- 保持主体、关键动作和画面比例；
- 推荐控制在 8MB 内；
- GIF 静音，点击后必须能打开 `source.json` 中的原帖；
- 不伪造、遮挡或移除原有作者标识。

完整 MP4 不进入 Git 历史，由维护者通过私有 `.release-input/media/` 生成版本化媒体包并打入 Electron Release。

## 分析质量

`creative-dna.json` 至少应描述：

- 钩子与观众预期；
- 时间线节拍和因果链；
- 主体动作、物体状态变化和连续性；
- 构图、景别、镜头路径和转场；
- 光影、色彩、材质、空间与风格；
- 声音、对白或节奏线索（有证据时）；
- 可替换变量、不可缺少机制及失败模式；
- anti-copy 排除项；
- 至少两个明显不同的迁移方向。

每个维度都应由视频或来源证据支持；没有证据的维度应省略或标记未知。

## 提交流程

1. 在提交前搜索 URL、作者、案例 ID 和机制标签。
2. 使用 kebab-case 创建稳定案例 ID。
3. 完成全部案例文件与双模型提示词。
4. 生成并优化 GIF，写入原帖引用。
5. 增加对应的可安装 Skill。
6. 更新 `catalog/manifest.json` 和 README 画廊。
7. 运行 `npm run validate` 与 `npm run app:test`。
8. 创建 PR，并列出来源、改动和已执行验证。

---

**English summary:** Submit only a specific creative video with reusable evidence-backed mechanisms. Tutorials, benchmarks, model comparisons, workflow posts, and news are out of scope. Public cases must be released, deduplicated, sanitized, attributed, model-specific, and accompanied by a clickable GIF preview.
