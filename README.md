# T8 Creative DNA Prompt Library

[![CI](https://github.com/T8mars/minimax-h3-prompt-skill-T8/actions/workflows/ci.yml/badge.svg)](https://github.com/T8mars/minimax-h3-prompt-skill-T8/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/T8mars/minimax-h3-prompt-skill-T8?include_prereleases&label=release)](https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY%204.0-blue)](./LICENSE)

面向 **MiniMax H3** 与 **Seedance 2.0** 的高质量短视频 Creative DNA 案例库、可安装 Skills 与带完整视频的 Electron 桌面查看器。

A curated Creative DNA library, installable Skills, and a video-first Electron desktop viewer for **MiniMax H3** and **Seedance 2.0**.

> 这里收录可复用的创意机制，而不是技术教程、性能 Benchmark、模型对比、工作流帖子或僵硬的关键词堆叠。

## 五种内容，互相对应

| 内容 | 用途 | 视频呈现 |
| --- | --- | --- |
| `catalog/` | 浏览案例、Creative DNA、来源和双模型提示词 | GitHub 使用轻量循环 GIF；点击可回到原帖 |
| `skills/` | 安装到支持 Skills 的 Agent，直接复用案例机制 | Skill 引用同一案例与来源 |
| `catalog/official-skills/` | 固定索引 MiniMax 官方仓库收录的 9 个 Skills | H3 打开上游固定版本；Seedance 使用本库原创伴侣 Skill |
| `catalog/community-skills/` | 浏览非官方、用户贡献的高质量提示词 Skills | GitHub 有 GIF/海报；Electron 包含完整有声样片 |
| Electron 桌面版 | 搜索、筛选、播放、对比和复制提示词 | 安装包包含完整 MP4，支持声音和离线播放 |

GitHub 的 GIF 是快速预览，不替代原视频。每个案例都保留作者、平台及原始帖子引用地址；Electron 详情页同时提供“查看原帖”。

## MiniMax 官方仓库 Skills（9）

下表收录 [MiniMax-AI/MiniMax-H3 官方仓库的 `skills/` 目录](https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills)：1 个通用 H3 提示词 Skill 与 8 个风格制作 Skill。这里的“官方仓库收录”不等于 9 项都由 MiniMax 原创；上游 `meta.yaml` 的来源分类包括 `official`、`official-featured` 和 `community`，本库按原值展示。

为避免错误再分发，本仓库不复制上游 Skill 正文，只保存固定 commit、目录 SHA、文件 SHA-256、安装命令和链接。Seedance 2.0 支持由本库独立编写的 9 个伴侣 Skills 提供。

| 官方仓库 Skill | 上游来源分类 | Seedance 2.0 伴侣 Skill |
| --- | --- | --- |
| [`h3-prompt-writing`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/h3-prompt-writing) | 官方仓库自有 | [`write-seedance-video-prompts`](./skills/write-seedance-video-prompts/) |
| [`minimalist-product-ad-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/minimalist-product-ad-generator) | community | [`direct-seedance-minimalist-product-ad`](./skills/direct-seedance-minimalist-product-ad/) |
| [`3d-animation-short-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/3d-animation-short-generator) | community | [`direct-seedance-3d-animation`](./skills/direct-seedance-3d-animation/) |
| [`papercraft-stop-motion-explainer`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/papercraft-stop-motion-explainer) | official | [`direct-seedance-papercraft-explainer`](./skills/direct-seedance-papercraft-explainer/) |
| [`brand-promo-video-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/brand-promo-video-generator) | official-featured | [`direct-seedance-brand-promo`](./skills/direct-seedance-brand-promo/) |
| [`music-video-subtitle-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/music-video-subtitle-generator) | official-featured | [`direct-seedance-music-typography`](./skills/direct-seedance-music-typography/) |
| [`co-op-game-intro-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/co-op-game-intro-generator) | official | [`direct-seedance-coop-game-intro`](./skills/direct-seedance-coop-game-intro/) |
| [`paper-collage-explainer-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/paper-collage-explainer-generator) | official-featured | [`direct-seedance-paper-collage`](./skills/direct-seedance-paper-collage/) |
| [`handdrawn-live-video-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/handdrawn-live-video-generator) | official-featured | [`direct-seedance-handdrawn-live-fusion`](./skills/direct-seedance-handdrawn-live-fusion/) |

这 9 个官方仓库条目明确设置 `comfyui_import=false`：目标 ComfyUI 节点已经包含对应官方能力，本库不会重复导入或修改节点。

## 非官方 / 用户贡献 Skills

这一区域与 MiniMax 官方仓库索引完全分开。条目由用户提供的视频与提示词组启发，经完整媒体解码、时长核对、机制拆解、反复制重构和双模型编译后发布；卡片和详情始终显示“非官方 · 用户贡献”。

| 预览 | Skill | 模型与重点 |
| --- | --- | --- |
| [![自然街拍互动](catalog/community-skills/direct-street-interview-video/preview.gif)](catalog/community-skills/direct-street-interview-video/SUMMARY.md) | **[`direct-street-interview-video`](./skills/direct-street-interview-video/)**<br><sub>自然街拍互动 · 用户提供 AIGC 样片</sub> | MiniMax H3 · Seedance 2.0<br>连续路线、第一人称手持、短对白、自然光与环境视差 |

首个 Skill 修复了原组中两个关键问题：生成样片实际只有 10.125 秒，但文本把第二镜头从 10 秒才开始；同时对白轮次超过自然语速可承载范围。新模板按实际目标时长分配事件，10 秒优先 2–3 句短对白，不从片尾才开启新设置，也不虚构 4K 输出规格。

## 案例画廊 / Case gallery

下面区域由 `catalog/manifest.json` 和每个案例的 `preview.gif` 生成。GIF 点击后打开原始帖子。

<!-- CASE_GALLERY:START -->

| 预览 / Preview | 案例 / Case | 模型 / Models |
| --- | --- | --- |
| [![Cross-Medium Contact Reaction Ladder](catalog/cases/reddit-1vgynd7-chibi-pinch/preview.gif)](https://www.reddit.com/r/StableDiffusion/comments/1vgynd7/2d_chibi_girl_added_just_a_pinch_minimax_h3/) | **[Cross-Medium Contact Reaction Ladder](catalog/cases/reddit-1vgynd7-chibi-pinch/SUMMARY.md)**<br><sub>reddit-1vgynd7-chibi-pinch</sub> | MiniMax H3 · Seedance 2.0 |
| [![One Signal Beats Many](catalog/cases/reddit-1vh8jy6-h3-high-card/preview.gif)](https://www.reddit.com/r/comfyui/comments/1vh8jy6/minimax_h3_15s_t2v_in_23_minutes_using_the/) | **[One Signal Beats Many](catalog/cases/reddit-1vh8jy6-h3-high-card/SUMMARY.md)**<br><sub>reddit-1vh8jy6-h3-high-card</sub> | MiniMax H3 · Seedance 2.0 |
| [![Proof-State Camera Handoff](catalog/cases/reddit-1vhloyz-walter-prompt-guide/preview.gif)](https://www.reddit.com/r/StableDiffusion/comments/1vhloyz/walter_white_and_the_minimax_h3_official/) | **[Proof-State Camera Handoff](catalog/cases/reddit-1vhloyz-walter-prompt-guide/SUMMARY.md)**<br><sub>reddit-1vhloyz-walter-prompt-guide</sub> | MiniMax H3 · Seedance 2.0 |
| [![Flexible Proof-State Product Launch Film](catalog/cases/x-abulu8-2085626141759709286-browser-2085626141759709286-video-1/preview.gif)](https://x.com/abulu8/status/2085626141759709286) | **[Flexible Proof-State Product Launch Film](catalog/cases/x-abulu8-2085626141759709286-browser-2085626141759709286-video-1/SUMMARY.md)**<br><sub>x-abulu8-2085626141759709286-browser-2085626141759709286-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![Layered Field-Guide Illustration Comes Alive](catalog/cases/x-dheepanratnam-2086312209919963371-browser-2086312209919963371-video-1/preview.gif)](https://x.com/Dheepanratnam/status/2086312209919963371) | **[Layered Field-Guide Illustration Comes Alive](catalog/cases/x-dheepanratnam-2086312209919963371-browser-2086312209919963371-video-1/SUMMARY.md)**<br><sub>x-dheepanratnam-2086312209919963371-browser-2086312209919963371-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![Luminous Anomaly Materialization Loop](catalog/cases/x-godofprompt-2086142925063516348-browser-2086142925063516348-video-1/preview.gif)](https://x.com/godofprompt/status/2086142925063516348) | **[Luminous Anomaly Materialization Loop](catalog/cases/x-godofprompt-2086142925063516348-browser-2086142925063516348-video-1/SUMMARY.md)**<br><sub>x-godofprompt-2086142925063516348-browser-2086142925063516348-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![Backstage-to-Stage Continuous Journey](catalog/cases/x-iamahmedfaraz66-2086298926617903365-browser-2086298926617903365-video-1/preview.gif)](https://x.com/iamahmedfaraz66/status/2086298926617903365) | **[Backstage-to-Stage Continuous Journey](catalog/cases/x-iamahmedfaraz66-2086298926617903365-browser-2086298926617903365-video-1/SUMMARY.md)**<br><sub>x-iamahmedfaraz66-2086298926617903365-browser-2086298926617903365-video-1</sub> | MiniMax H3 · Seedance 2.0 |

<!-- CASE_GALLERY:END -->

## 快速开始

### 使用桌面查看器

1. 打开 [Releases](https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases)。
2. 下载 `T8-Prompt-Library-Setup-v1.0.2.exe`。
3. 安装并打开应用；案例视频、分析与双模型提示词会一起出现。
4. 后续版本可在应用内检查并安装更新。

Windows x64 是当前发行目标。更详细的安装说明见 [安装指南](./docs/installation.md)。

### 安装单个 Skill

```powershell
Copy-Item -Recurse .\skills\<skill-name> "$env:CODEX_HOME\skills\<skill-name>"
```

如果没有设置 `CODEX_HOME`，请将 Skill 复制到当前 Agent 产品指定的 Skills 目录。安装后重新加载 Agent。完整说明见 [Skill 安装](./docs/skill-installation.md)。

### 直接使用提示词

进入 `catalog/cases/<case-id>/prompts/`：

- `minimax-h3.md`：MiniMax H3 版本；
- `seedance-2.0.md`：Seedance 2.0 版本。

先阅读同目录的 `SUMMARY.md` 与 `creative-dna.json`，再替换主体、场景和产品变量；不要只复制画面名词。参见 [使用指南](./docs/usage.md)。

## 内容质量原则

只有状态为 `released` 的脱敏案例可以进入本仓库。公开案例必须包含：

- 可追溯的原始帖子地址与作者信息；
- 对时间、动作、运镜、光影、构图、声音或叙事机制的可复用分析；
- MiniMax H3 与 Seedance 2.0 两份经过校验的提示词；
- Creative DNA、适用范围、变量及 anti-copy 说明；
- GitHub GIF 预览与 Electron MP4 媒体映射；
- 不含本地绝对路径、账号凭据或内部采集信息。

技术教程、安装指南、性能/加速 Benchmark、模型 A/B 对比、新闻讨论和工作流演示不会进入案例目录。案例提交流程见 [贡献案例](./docs/contributing-cases.md)。

## 公开边界

本仓库是公共发行层，不是内部采集与审核工程。以下内容永远不随发布包公开：

- 内部路线图和项目级 Skill 指令；
- Codex 搜索、采集、审核、下载或自动化脚本；
- ComfyUI 节点、增强器及内部接入脚本；
- 草稿、被拒案例、浏览器状态、Cookie、Token、密钥和本地绝对路径。

CI 会执行公开边界、秘密、路径、目录结构、案例状态和 Skill frontmatter 检查。详情见 [公共发行边界](./docs/public-boundary.md)。

## 版本与更新

当前目标版本是 **v1.0.2**。项目使用十进制进位：

```text
v1.0.0 -> ... -> v1.0.9 -> v1.1.0
v1.1.9 -> v1.2.0
v1.9.9 -> v2.0.0
```

应用版本、案例目录版本和 Schema 版本分别记录，避免为了增加案例而不必要地改变数据合同。参见 [发布政策](./docs/release-policy.md)。

## 文档

- [安装](./docs/installation.md)
- [使用](./docs/usage.md)
- [安装 Skills](./docs/skill-installation.md)
- [贡献案例](./docs/contributing-cases.md)
- [来源与引用](./docs/source-attribution.md)
- [公共发行边界](./docs/public-boundary.md)
- [发布与自动更新](./docs/release-policy.md)
- [隐私](./docs/privacy.md)
- [安全政策](./SECURITY.md)

## 许可与署名

- 应用和公共校验代码：[`MIT`](./LICENSE)
- 本项目原创的摘要、Creative DNA 与提示词模板：[`CC BY 4.0`](./LICENSE-CONTENT)
- 引用视频、GIF 中呈现的原始作品、平台标志和作者素材仍归各自权利人所有，并在案例中链接原帖。

本项目是社区策展项目，与 MiniMax、ByteDance、X、Reddit 或 YouTube 无官方隶属关系。上表只是对 MiniMax 官方仓库内容的固定版本索引；上游 Skill 的使用受其自身许可约束。
