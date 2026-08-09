# T8 Creative DNA Prompt Library

[![CI](https://github.com/T8mars/minimax-h3-prompt-skill-T8/actions/workflows/ci.yml/badge.svg)](https://github.com/T8mars/minimax-h3-prompt-skill-T8/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/T8mars/minimax-h3-prompt-skill-T8?include_prereleases&label=release)](https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY%204.0-blue)](./LICENSE)

面向 **MiniMax H3** 与 **Seedance 2.0** 的高质量短视频 Creative DNA 案例库、可安装 Skills 与带完整视频的 Electron 桌面查看器。

A curated Creative DNA library, installable Skills, and a video-first Electron desktop viewer for **MiniMax H3** and **Seedance 2.0**.

> 这里收录可复用的创意机制，而不是技术教程、性能 Benchmark、模型对比、工作流帖子或僵硬的关键词堆叠。

## 三种内容，互相对应

| 内容 | 用途 | 视频呈现 |
| --- | --- | --- |
| `catalog/` | 浏览案例、Creative DNA、来源和双模型提示词 | GitHub 使用轻量循环 GIF；点击可回到原帖 |
| `skills/` | 安装到支持 Skills 的 Agent，直接复用案例机制 | Skill 引用同一案例与来源 |
| Electron 桌面版 | 搜索、筛选、播放、对比和复制提示词 | 安装包包含完整 MP4，支持声音和离线播放 |

GitHub 的 GIF 是快速预览，不替代原视频。每个案例都保留作者、平台及原始帖子引用地址；Electron 详情页同时提供“查看原帖”。

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
2. 下载 `T8-Prompt-Library-Setup-v1.0.0.exe`。
3. 安装并打开应用；案例视频、分析与双模型提示词会一起出现。
4. 后续版本可在应用内检查并安装更新。

Windows x64 是 v1.0.0 的首发目标。更详细的安装说明见 [安装指南](./docs/installation.md)。

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

当前目标版本是 **v1.0.0**。项目使用十进制进位：

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

本项目是社区策展项目，与 MiniMax、ByteDance、X、Reddit 或 YouTube 无官方隶属关系。
