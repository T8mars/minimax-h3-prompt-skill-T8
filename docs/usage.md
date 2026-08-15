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

- 默认“全部”入口统一显示 120 项：109 个创意案例、9 个 MiniMax 官方仓库条目与 2 个非官方用户贡献 Skills，并保留三个独立分类入口；
- 搜索机制、风格、运镜、标签、作者与案例 ID；
- 卡片 GIF/Poster 快速浏览；
- 详情页完整 MP4 与声音播放；
- 案例摘要、来源、标签与双模型提示词；
- MiniMax H3 / Seedance 2.0 标签页及一键复制；
- 平台、模型和标签筛选，以及 2–3 个案例的并排对比；
- 原始帖子跳转；
- 首次启动默认中文显示；详情页和全局工具栏均可切换到英文内容；每份双语侧车都绑定来源哈希并记录逐资源编辑审校，用户主动选择的语言会本地保存；
- 双语搜索：无论当前显示语言，都能用英文或中文搜索标题、摘要、快速开始与 Creative DNA；
- “快速开始”区：推荐输入格式、示例写法、必需锚点、使用方法、适用范围与不适用范围；
- 概览、快速开始、Creative DNA 整体、每个 DNA 分区、验证信息、来源链接和当前提示词均可单独复制；成功后按钮会短暂显示 `✓ 已复制` / `✓ Copied`，恢复后或反馈期间都可再次点击复制；
- “复制完整案例”输出当前界面的说明语言，并附带两份原生、已验证且未被界面翻译的模型提示词；
- 发布质量、提示词验证、双语来源绑定与审校记录、Template ID 和 ComfyUI 边界集中显示。
- 可在任意卡片或详情页收藏内容，并从“收藏”入口统一查看；
- 可新建、重命名和删除本机合集，并让同一条目加入多个合集；删除合集不会删除公共案例或 Skill；
- 打开详情时自动记录浏览历史，按最近浏览排序、同一条目去重，最多保留 100 条，并支持用户主动清空；
- 收藏、合集与历史覆盖案例、官方 Skill、非官方 Skill 三类条目，均只保存在本机，不上传或同步。

语言开关只影响讲解内容，不改写可执行提示词。MiniMax H3 的严格英文提示词始终保持英文；Seedance 模板保持该案例已验证的原生语言。复制当前提示词时，剪贴板内容直接来自 canonical prompt 字节，不从界面重组。

官方 Skill 视图的 H3 标签页显示上游固定版本、校验哈希和安装命令，不复制上游正文；这段安装入口会随界面切换中英文，但命令、URL、Commit 和 SHA-256 不变。Seedance 2.0 标签页显示本库原创伴侣模板。9 个条目都带本地官方示例 GIF：8 个风格 Skill 使用对应上游 GIF，通用写作 Skill 使用由上游 T2VA 示例 MP4 转换的 GIF。官方项没有完整案例视频，也不会进入案例对比或 ComfyUI 导入。

“非官方 Skills”视图始终显示来源分类。用户提供完整样片时，Electron 播放媒体包内的有声 MP4，GitHub 则显示轻量 GIF；详情同时呈现证据修复、适用范围、H3 和 Seedance 模板。未提供外部原帖时，界面隐藏来源按钮，不伪造作者或链接。

## 官方 H3 与 Seedance 伴侣如何配合

1. 目标是 MiniMax H3：从官方 Skill 视图打开或安装对应上游 Skill。
2. 目标是 Seedance 2.0：安装同卡片对应的 T8 Seedance 伴侣 Skill。
3. 两者共享任务目标和风格意图，但遵守各自模型原生合同；不要把 H3 六段字段或精确镜头时间复制到 Seedance。
4. ComfyUI 节点已经包含官方能力，因此不从此目录再次导入官方项。

外部来源页面只通过系统浏览器打开，不在具有 Node.js 权限的窗口内运行。

## API 增强工作台

工作台在同一窗口提供相互隔离的视频提示词和 MiniMax Music 3 两项能力。它只生成文本，不生成视频或音频。视频保留本地机制推荐、模板、双模型与参考素材；Music 3 提供歌词模式、结构参数、官方 Skill 渐进读取和四项结果。

关键边界：

- 默认中文，随应用语言切换完整中英文 UI；Music 3 结构化描述也默认中文；
- 顶部能力切换会隔离视频与 Music 3 的参数、确认单、结果和项目列表；
- 平价小屋与 AI 工坊注册入口在渠道区和当前凭据区都可见；
- Key 成功保存后立即清空输入框，不进入 renderer localStorage、实验项目或导出；
- 参考素材只由 Electron Main 读取，项目仅记录文件名、类型、大小和 SHA-256，不记录绝对路径；
- 视频预检会分别列出一次 Chat 和平价小屋素材上传数；Music 3 预检会列出逻辑请求范围、最坏物理尝试与阶段；
- 确认单只能使用一次，重复点击不会产生第二次请求；
- 运行中取消、读取超时或响应丢失时，不宣称远端已停止或不会计费；
- 视频输出保留完整提示词；Music 3 分别保留歌词、结构化描述、Payload JSON 和脱敏报告；两者都把可确定检查与人工判断分开；
- 完成结果可以保存为本机实验项目，并导出 JSON + Markdown。

完整操作、媒体字段和真实 smoke 测试方法见 [API 增强工作台](./api-workbench.md)。

## 目录文件

```text
catalog/cases/<case-id>/
├─ manifest.json          # 公开状态、版本和文件映射
├─ SUMMARY.md             # 给人的摘要与使用说明
├─ creative-dna.json      # 结构化机制、时间线、变量和排除项
├─ source.json            # 作者、平台、原帖和媒体引用
├─ preview.gif            # GitHub 静音循环预览
├─ locales/
│  ├─ en.json             # 源文件哈希绑定的英文展示内容
│  └─ zh-CN.json          # 源文件哈希绑定的中文展示内容
└─ prompts/
   ├─ minimax-h3.md
   └─ seedance-2.0.md
```

`source.json` 中的完整 MP4 映射指向 Release 媒体包，不表示 MP4 会进入 Git 历史。

双语文件不包含提示词正文；案例 manifest 或 Creative DNA 变化后，旧双语文件的哈希绑定会失效，`npm run validate:localizations` 会阻止发布。新增案例、官方条目或非官方 Skill 时，必须同时提交 EN / zh-CN 两份内容，不能依赖运行时翻译或单语回退。

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
