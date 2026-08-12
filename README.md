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
| `catalog/official-skills/` | 固定索引 MiniMax 官方仓库收录的 9 个 Skills | 本地官方示例 GIF；H3 打开上游固定版本；Seedance 使用本库原创伴侣 Skill |
| `catalog/community-skills/` | 浏览非官方、用户贡献的高质量提示词 Skills | GitHub 有 GIF/海报；Electron 包含完整有声样片 |
| Electron 桌面版 | 中英文搜索与详情、筛选、播放、收藏、合集、浏览历史、对比、分区复制和整案复制 | Windows 与 universal macOS 安装包包含完整 MP4，支持声音和离线播放 |

GitHub 的 GIF 是快速预览，不替代原视频。每个案例都保留作者、平台及原始帖子引用地址；Electron 详情页同时提供“查看原帖”。

## MiniMax 官方仓库 Skills（9）

下表收录 [MiniMax-AI/MiniMax-H3 官方仓库的 `skills/` 目录](https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills)：1 个通用 H3 提示词 Skill 与 8 个风格制作 Skill。这里的“官方仓库收录”不等于 9 项都由 MiniMax 原创；上游 `meta.yaml` 的来源分类包括 `official`、`official-featured` 和 `community`，本库按原值展示。

本仓库不复制上游 Skill 正文，只保存固定 commit、目录 SHA、文件 SHA-256、安装命令和链接。为便于直观看效果，9 个条目均提供哈希绑定的本地 GIF：8 个来自对应官方演示 GIF，通用写作条目由官方 T2VA 示例转换。Seedance 2.0 支持由本库独立编写的 9 个伴侣 Skills 提供。

| 预览 | 官方仓库 Skill | 上游来源分类 | Seedance 2.0 伴侣 Skill |
| --- | --- | --- | --- |
| <img src="catalog/official-skills/previews/h3-prompt-writing.gif" width="180" alt="H3 prompt writing official T2VA preview"> | [`h3-prompt-writing`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/h3-prompt-writing) | 官方仓库自有 | [`write-seedance-video-prompts`](./skills/write-seedance-video-prompts/) |
| <img src="catalog/official-skills/previews/minimalist-product-ad-generator.gif" width="180" alt="Minimalist product ad official preview"> | [`minimalist-product-ad-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/minimalist-product-ad-generator) | community | [`direct-seedance-minimalist-product-ad`](./skills/direct-seedance-minimalist-product-ad/) |
| <img src="catalog/official-skills/previews/3d-animation-short-generator.gif" width="180" alt="3D animation official preview"> | [`3d-animation-short-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/3d-animation-short-generator) | community | [`direct-seedance-3d-animation`](./skills/direct-seedance-3d-animation/) |
| <img src="catalog/official-skills/previews/papercraft-stop-motion-explainer.gif" width="180" alt="Papercraft stop-motion official preview"> | [`papercraft-stop-motion-explainer`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/papercraft-stop-motion-explainer) | official | [`direct-seedance-papercraft-explainer`](./skills/direct-seedance-papercraft-explainer/) |
| <img src="catalog/official-skills/previews/brand-promo-video-generator.gif" width="180" alt="Brand promo official preview"> | [`brand-promo-video-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/brand-promo-video-generator) | official-featured | [`direct-seedance-brand-promo`](./skills/direct-seedance-brand-promo/) |
| <img src="catalog/official-skills/previews/music-video-subtitle-generator.gif" width="180" alt="Music video subtitle official preview"> | [`music-video-subtitle-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/music-video-subtitle-generator) | official-featured | [`direct-seedance-music-typography`](./skills/direct-seedance-music-typography/) |
| <img src="catalog/official-skills/previews/co-op-game-intro-generator.gif" width="180" alt="Co-op game intro official preview"> | [`co-op-game-intro-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/co-op-game-intro-generator) | official | [`direct-seedance-coop-game-intro`](./skills/direct-seedance-coop-game-intro/) |
| <img src="catalog/official-skills/previews/paper-collage-explainer-generator.gif" width="180" alt="Paper collage official preview"> | [`paper-collage-explainer-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/paper-collage-explainer-generator) | official-featured | [`direct-seedance-paper-collage`](./skills/direct-seedance-paper-collage/) |
| <img src="catalog/official-skills/previews/handdrawn-live-video-generator.gif" width="180" alt="Handdrawn live-action official preview"> | [`handdrawn-live-video-generator`](https://github.com/MiniMax-AI/MiniMax-H3/tree/b7227fa6a6206e9fb30562383d39e53cf3866a48/skills/handdrawn-live-video-generator) | official-featured | [`direct-seedance-handdrawn-live-fusion`](./skills/direct-seedance-handdrawn-live-fusion/) |

这 9 个官方仓库条目明确设置 `comfyui_import=false`：目标 ComfyUI 节点已经包含对应官方能力，本库不会重复导入或修改节点。

## 非官方 / 用户贡献 Skills

这一区域与 MiniMax 官方仓库索引完全分开。条目由用户提供的视频与提示词组启发，经完整媒体解码、时长核对、机制拆解、反复制重构和双模型编译后发布；卡片和详情始终显示“非官方 · 用户贡献”。

| 预览 | Skill | 模型与重点 |
| --- | --- | --- |
| [![自然街拍互动](catalog/community-skills/direct-street-interview-video/preview.gif)](catalog/community-skills/direct-street-interview-video/SUMMARY.md) | **[`direct-street-interview-video`](./skills/direct-street-interview-video/)**<br><sub>自然街拍互动 · 用户提供 AIGC 样片</sub> | MiniMax H3 · Seedance 2.0<br>连续路线、第一人称手持、短对白、自然光与环境视差 |
| [![突遇惊吓到手势和解](catalog/community-skills/stage-startle-to-truce-encounter/preview.gif)](catalog/community-skills/stage-startle-to-truce-encounter/SUMMARY.md) | **[`stage-startle-to-truce-encounter`](./skills/stage-startle-to-truce-encounter/)**<br><sub>突遇惊吓到手势和解 · 用户提供 AIGC 样片</sub> | MiniMax H3 · Seedance 2.0<br>双方视角、非致命升级、距离反转、透明边界与求和手势 |

两份非官方 Skill 都以成片而不是长提示词的承诺为准：街拍 Skill 修复 10.125 秒样片的对白与片尾分镜过载；突遇 Skill 则修复 13.373 秒横屏样片与“15 秒竖屏、完整导弹追逐”文本之间的失配，只保留被画面证明的距离反转、惊吓和手势降级机制。

## 案例画廊 / Case gallery

下面区域由 `catalog/manifest.json` 和每个案例的 `preview.gif` 生成。GIF 点击后打开原始帖子。

<!-- CASE_GALLERY:START -->

| 预览 / Preview | 案例 / Case | 模型 / Models |
| --- | --- | --- |
| [![产品广告｜功能证据递进](catalog/cases/x-abulu8-2085626141759709286-browser-2085626141759709286-video-1/preview.gif)](https://x.com/abulu8/status/2085626141759709286) | **[产品广告｜功能证据递进](catalog/cases/x-abulu8-2085626141759709286-browser-2085626141759709286-video-1/SUMMARY.md)**<br><sub>x-abulu8-2085626141759709286-browser-2085626141759709286-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![固定机位｜从线稿生成成品](catalog/cases/x-dheepanratnam-2086312209919963371-browser-2086312209919963371-video-1/preview.gif)](https://x.com/Dheepanratnam/status/2086312209919963371) | **[固定机位｜从线稿生成成品](catalog/cases/x-dheepanratnam-2086312209919963371-browser-2086312209919963371-video-1/SUMMARY.md)**<br><sub>x-dheepanratnam-2086312209919963371-browser-2086312209919963371-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![形态奇观｜平面升级到现实](catalog/cases/x-godofprompt-2086142925063516348-browser-2086142925063516348-video-1/preview.gif)](https://x.com/godofprompt/status/2086142925063516348) | **[形态奇观｜平面升级到现实](catalog/cases/x-godofprompt-2086142925063516348-browser-2086142925063516348-video-1/SUMMARY.md)**<br><sub>x-godofprompt-2086142925063516348-browser-2086142925063516348-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![人物旅程｜从困境走向目标](catalog/cases/x-iamahmedfaraz66-2086298926617903365-browser-2086298926617903365-video-1/preview.gif)](https://x.com/iamahmedfaraz66/status/2086298926617903365) | **[人物旅程｜从困境走向目标](catalog/cases/x-iamahmedfaraz66-2086298926617903365-browser-2086298926617903365-video-1/SUMMARY.md)**<br><sub>x-iamahmedfaraz66-2086298926617903365-browser-2086298926617903365-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![二维角色｜真人接触三级反应](catalog/cases/reddit-1vgynd7-chibi-pinch/preview.gif)](https://www.reddit.com/r/StableDiffusion/comments/1vgynd7/2d_chibi_girl_added_just_a_pinch_minimax_h3/) | **[二维角色｜真人接触三级反应](catalog/cases/reddit-1vgynd7-chibi-pinch/SUMMARY.md)**<br><sub>reddit-1vgynd7-chibi-pinch</sub> | MiniMax H3 · Seedance 2.0 |
| [![一对多反转｜单一证据胜出](catalog/cases/reddit-1vh8jy6-h3-high-card/preview.gif)](https://www.reddit.com/r/comfyui/comments/1vh8jy6/minimax_h3_15s_t2v_in_23_minutes_using_the/) | **[一对多反转｜单一证据胜出](catalog/cases/reddit-1vh8jy6-h3-high-card/SUMMARY.md)**<br><sub>reddit-1vh8jy6-h3-high-card</sub> | MiniMax H3 · Seedance 2.0 |
| [![风险揭晓｜证据交给人物反应](catalog/cases/reddit-1vhloyz-walter-prompt-guide/preview.gif)](https://www.reddit.com/r/StableDiffusion/comments/1vhloyz/walter_white_and_the_minimax_h3_official/) | **[风险揭晓｜证据交给人物反应](catalog/cases/reddit-1vhloyz-walter-prompt-guide/SUMMARY.md)**<br><sub>reddit-1vhloyz-walter-prompt-guide</sub> | MiniMax H3 · Seedance 2.0 |
| [![未来证据｜异常闯入现实](catalog/cases/x-mimu-ai1-2086474098859987150-browser-2086474098859987150-video-1/preview.gif)](https://x.com/mimu_ai1/status/2086474098859987150) | **[未来证据｜异常闯入现实](catalog/cases/x-mimu-ai1-2086474098859987150-browser-2086474098859987150-video-1/SUMMARY.md)**<br><sub>x-mimu-ai1-2086474098859987150-browser-2086474098859987150-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![第一视角探险｜穿越后巡检](catalog/cases/x-strength04-x-2086471165581902327-browser-2086471165581902327-video-1/preview.gif)](https://x.com/Strength04_X/status/2086471165581902327) | **[第一视角探险｜穿越后巡检](catalog/cases/x-strength04-x-2086471165581902327-browser-2086471165581902327-video-1/SUMMARY.md)**<br><sub>x-strength04-x-2086471165581902327-browser-2086471165581902327-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![复古手持｜日常送别回眸](catalog/cases/x-zephyraleigh-2086466812347297938-browser-2086466812347297938-video-1/preview.gif)](https://x.com/ZephyraLeigh/status/2086466812347297938) | **[复古手持｜日常送别回眸](catalog/cases/x-zephyraleigh-2086466812347297938-browser-2086466812347297938-video-1/SUMMARY.md)**<br><sub>x-zephyraleigh-2086466812347297938-browser-2086466812347297938-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![反差喜剧｜越从容越失控](catalog/cases/x-decat2025-2086476172783759520-browser-2086476172783759520-video-1/preview.gif)](https://x.com/DeCat2025/status/2086476172783759520) | **[反差喜剧｜越从容越失控](catalog/cases/x-decat2025-2086476172783759520-browser-2086476172783759520-video-1/SUMMARY.md)**<br><sub>x-decat2025-2086476172783759520-browser-2086476172783759520-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![人物档案｜能力逐层点亮](catalog/cases/x-adithatipalli-2086477914699170293-browser-2086477914699170293-video-1/preview.gif)](https://x.com/adithatipalli/status/2086477914699170293) | **[人物档案｜能力逐层点亮](catalog/cases/x-adithatipalli-2086477914699170293-browser-2086477914699170293-video-1/SUMMARY.md)**<br><sub>x-adithatipalli-2086477914699170293-browser-2086477914699170293-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![画中物成真｜小光点变奇观](catalog/cases/x-futurevibesai-2086443552649941148-browser-2086443552649941148-video-1/preview.gif)](https://x.com/FutureVibesAi/status/2086443552649941148) | **[画中物成真｜小光点变奇观](catalog/cases/x-futurevibesai-2086443552649941148-browser-2086443552649941148-video-1/SUMMARY.md)**<br><sub>x-futurevibesai-2086443552649941148-browser-2086443552649941148-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![工艺过程｜材料覆盖当进度](catalog/cases/x-derek-wall90176-2086464559439855938-browser-2086464559439855938-video-1/preview.gif)](https://x.com/derek_wall90176/status/2086464559439855938) | **[工艺过程｜材料覆盖当进度](catalog/cases/x-derek-wall90176-2086464559439855938-browser-2086464559439855938-video-1/SUMMARY.md)**<br><sub>x-derek-wall90176-2086464559439855938-browser-2086464559439855938-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![角色登场｜细节到全身揭晓](catalog/cases/x-aimikoda-2086412223061135392-browser-2086412223061135392-video-1/preview.gif)](https://x.com/aimikoda/status/2086412223061135392) | **[角色登场｜细节到全身揭晓](catalog/cases/x-aimikoda-2086412223061135392-browser-2086412223061135392-video-1/SUMMARY.md)**<br><sub>x-aimikoda-2086412223061135392-browser-2086412223061135392-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![机械同行｜启动后稳定伴行](catalog/cases/x-saniaspeaks-2085932310923251950-browser-2085932310923251950-video-1/preview.gif)](https://x.com/saniaspeaks_/status/2085932310923251950) | **[机械同行｜启动后稳定伴行](catalog/cases/x-saniaspeaks-2085932310923251950-browser-2085932310923251950-video-1/SUMMARY.md)**<br><sub>x-saniaspeaks-2085932310923251950-browser-2085932310923251950-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![平面重组｜几何节奏品牌片](catalog/cases/x-mayz1169-2086427292755247409-browser-2086427292755247409-video-1/preview.gif)](https://x.com/Mayz1169/status/2086427292755247409) | **[平面重组｜几何节奏品牌片](catalog/cases/x-mayz1169-2086427292755247409-browser-2086427292755247409-video-1/SUMMARY.md)**<br><sub>x-mayz1169-2086427292755247409-browser-2086427292755247409-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![景别收紧｜从世界到眼神](catalog/cases/x-soranlan-2086461295818084617-browser-2086461295818084617-video-1/preview.gif)](https://x.com/Soranlan/status/2086461295818084617) | **[景别收紧｜从世界到眼神](catalog/cases/x-soranlan-2086461295818084617-browser-2086461295818084617-video-1/SUMMARY.md)**<br><sub>x-soranlan-2086461295818084617-browser-2086461295818084617-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![角色卡验真｜四类证据锁定角色](catalog/cases/x-imastudio-ai-2086429537127297091-browser-2086429537127297091-video-1/preview.gif)](https://x.com/ImaStudio_ai/status/2086429537127297091) | **[角色卡验真｜四类证据锁定角色](catalog/cases/x-imastudio-ai-2086429537127297091-browser-2086429537127297091-video-1/SUMMARY.md)**<br><sub>x-imastudio-ai-2086429537127297091-browser-2086429537127297091-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![平面重组｜纸艺无障碍示例](catalog/cases/x-mayz1169-2086430481072218307-browser-2086430481072218307-video-1/preview.gif)](https://x.com/Mayz1169/status/2086430481072218307) | **[平面重组｜纸艺无障碍示例](catalog/cases/x-mayz1169-2086430481072218307-browser-2086430481072218307-video-1/SUMMARY.md)**<br><sub>x-mayz1169-2086430481072218307-browser-2086430481072218307-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![双系统碰撞｜同时证明两种规则](catalog/cases/x-airina-xyz-2086404681480233236-browser-2086404681480233236-video-1/preview.gif)](https://x.com/airina_xyz/status/2086404681480233236) | **[双系统碰撞｜同时证明两种规则](catalog/cases/x-airina-xyz-2086404681480233236-browser-2086404681480233236-video-1/SUMMARY.md)**<br><sub>x-airina-xyz-2086404681480233236-browser-2086404681480233236-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![单目标逃生｜前后灾害交替逼近](catalog/cases/x-decat2025-2086379637874078201-browser-2086379637874078201-video-1/preview.gif)](https://x.com/DeCat2025/status/2086379637874078201) | **[单目标逃生｜前后灾害交替逼近](catalog/cases/x-decat2025-2086379637874078201-browser-2086379637874078201-video-1/SUMMARY.md)**<br><sub>x-decat2025-2086379637874078201-browser-2086379637874078201-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![对决节奏｜静止密战一击定局](catalog/cases/x-charaspowerai-2086105326978281608-browser-2086105326978281608-video-1/preview.gif)](https://x.com/CharaspowerAI/status/2086105326978281608) | **[对决节奏｜静止密战一击定局](catalog/cases/x-charaspowerai-2086105326978281608-browser-2086105326978281608-video-1/SUMMARY.md)**<br><sub>x-charaspowerai-2086105326978281608-browser-2086105326978281608-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![路线坍塌｜安全空间逐段消失](catalog/cases/x-decat2025-2086287667948396933-browser-2086287667948396933-video-1/preview.gif)](https://x.com/DeCat2025/status/2086287667948396933) | **[路线坍塌｜安全空间逐段消失](catalog/cases/x-decat2025-2086287667948396933-browser-2086287667948396933-video-1/SUMMARY.md)**<br><sub>x-decat2025-2086287667948396933-browser-2086287667948396933-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![程序错位｜扫描到实物双确认](catalog/cases/x-decat2025-2086134168992236013-browser-2086134168992236013-video-1/preview.gif)](https://x.com/DeCat2025/status/2086134168992236013) | **[程序错位｜扫描到实物双确认](catalog/cases/x-decat2025-2086134168992236013-browser-2086134168992236013-video-1/SUMMARY.md)**<br><sub>x-decat2025-2086134168992236013-browser-2086134168992236013-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![技能展示｜基础动作串联升级](catalog/cases/x-techiebysa-2086089483682734427-browser-2086089483682734427-video-1/preview.gif)](https://x.com/TechieBySA/status/2086089483682734427) | **[技能展示｜基础动作串联升级](catalog/cases/x-techiebysa-2086089483682734427-browser-2086089483682734427-video-1/SUMMARY.md)**<br><sub>x-techiebysa-2086089483682734427-browser-2086089483682734427-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![微缩介入｜外部物只进入一次](catalog/cases/x-nicolasmariar-2086226500538273920-browser-2086226500538273920-video-1/preview.gif)](https://x.com/nicolasmariar/status/2086226500538273920) | **[微缩介入｜外部物只进入一次](catalog/cases/x-nicolasmariar-2086226500538273920-browser-2086226500538273920-video-1/SUMMARY.md)**<br><sub>x-nicolasmariar-2086226500538273920-browser-2086226500538273920-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![微缩闯关｜同一材质连续变形](catalog/cases/x-arzoo12sh-2086407184309792852-browser-2086407184309792852-video-1/preview.gif)](https://x.com/Arzoo12sh/status/2086407184309792852) | **[微缩闯关｜同一材质连续变形](catalog/cases/x-arzoo12sh-2086407184309792852-browser-2086407184309792852-video-1/SUMMARY.md)**<br><sub>x-arzoo12sh-2086407184309792852-browser-2086407184309792852-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![升级讽刺｜新物登场旧爱被移走](catalog/cases/x-dheepanratnam-2086493087707086919-browser-2086493087707086919-video-1/preview.gif)](https://x.com/Dheepanratnam/status/2086493087707086919) | **[升级讽刺｜新物登场旧爱被移走](catalog/cases/x-dheepanratnam-2086493087707086919-browser-2086493087707086919-video-1/SUMMARY.md)**<br><sub>x-dheepanratnam-2086493087707086919-browser-2086493087707086919-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![角色板节拍｜环境切换不丢身份](catalog/cases/x-aimikoda-2086553240448241802-browser-2086553240448241802-video-1/preview.gif)](https://x.com/aimikoda/status/2086553240448241802) | **[角色板节拍｜环境切换不丢身份](catalog/cases/x-aimikoda-2086553240448241802-browser-2086553240448241802-video-1/SUMMARY.md)**<br><sub>x-aimikoda-2086553240448241802-browser-2086553240448241802-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![相机记忆｜固定取景框串联日常](catalog/cases/x-aripratama293-2058715926451896397-browser-2058715926451896397-video-1/preview.gif)](https://x.com/aripratama293/status/2058715926451896397) | **[相机记忆｜固定取景框串联日常](catalog/cases/x-aripratama293-2058715926451896397-browser-2058715926451896397-video-1/SUMMARY.md)**<br><sub>x-aripratama293-2058715926451896397-browser-2058715926451896397-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![舞台表演｜远景起势到倒地复起](catalog/cases/x-aimikoda-2053053922332262547-browser-2053053922332262547-video-1/preview.gif)](https://x.com/aimikoda/status/2053053922332262547) | **[舞台表演｜远景起势到倒地复起](catalog/cases/x-aimikoda-2053053922332262547-browser-2053053922332262547-video-1/SUMMARY.md)**<br><sub>x-aimikoda-2053053922332262547-browser-2053053922332262547-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![UGC测评｜开箱到一口实证](catalog/cases/x-oggii-0-2083436822085165289-browser-2083436822085165289-video-1/preview.gif)](https://x.com/oggii_0/status/2083436822085165289) | **[UGC测评｜开箱到一口实证](catalog/cases/x-oggii-0-2083436822085165289-browser-2083436822085165289-video-1/SUMMARY.md)**<br><sub>x-oggii-0-2083436822085165289-browser-2083436822085165289-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![互动图鉴｜固定菜单切换生物](catalog/cases/x-aimikoda-2083949566009778473-browser-2083949566009778473-video-1/preview.gif)](https://x.com/aimikoda/status/2083949566009778473) | **[互动图鉴｜固定菜单切换生物](catalog/cases/x-aimikoda-2083949566009778473-browser-2083949566009778473-video-1/SUMMARY.md)**<br><sub>x-aimikoda-2083949566009778473-browser-2083949566009778473-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![动力短片｜文字障碍逐个击碎](catalog/cases/x-sebatheepan-2084311486277599712-browser-2084311486277599712-video-1/preview.gif)](https://x.com/sebatheepan/status/2084311486277599712) | **[动力短片｜文字障碍逐个击碎](catalog/cases/x-sebatheepan-2084311486277599712-browser-2084311486277599712-video-1/SUMMARY.md)**<br><sub>x-sebatheepan-2084311486277599712-browser-2084311486277599712-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![力量反差｜小体型用杠杆反制](catalog/cases/x-craftian-keskin-2082658222247137433-browser-2082658222247137433-video-1/preview.gif)](https://x.com/craftian_keskin/status/2082658222247137433) | **[力量反差｜小体型用杠杆反制](catalog/cases/x-craftian-keskin-2082658222247137433-browser-2082658222247137433-video-1/SUMMARY.md)**<br><sub>x-craftian-keskin-2082658222247137433-browser-2082658222247137433-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![材质字效｜霜花成字再归位](catalog/cases/x-charaspowerai-2085622021812039920-browser-2085622021812039920-video-1/preview.gif)](https://x.com/CharaspowerAI/status/2085622021812039920) | **[材质字效｜霜花成字再归位](catalog/cases/x-charaspowerai-2085622021812039920-browser-2085622021812039920-video-1/SUMMARY.md)**<br><sub>x-charaspowerai-2085622021812039920-browser-2085622021812039920-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![纪实跟拍｜行进中偶遇再离开](catalog/cases/x-techhalla-2081333381401334006-browser-2081333381401334006-video-1/preview.gif)](https://x.com/techhalla/status/2081333381401334006) | **[纪实跟拍｜行进中偶遇再离开](catalog/cases/x-techhalla-2081333381401334006-browser-2081333381401334006-video-1/SUMMARY.md)**<br><sub>x-techhalla-2081333381401334006-browser-2081333381401334006-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![对话喜剧｜双轮停顿无声反应](catalog/cases/x-techiebysa-2084600512180113820-browser-2084600512180113820-video-1/preview.gif)](https://x.com/TechieBySA/status/2084600512180113820) | **[对话喜剧｜双轮停顿无声反应](catalog/cases/x-techiebysa-2084600512180113820-browser-2084600512180113820-video-1/SUMMARY.md)**<br><sub>x-techiebysa-2084600512180113820-browser-2084600512180113820-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![第一视角查岗｜遮挡失效到摆烂收口](catalog/cases/x-john87445528-2086787356556685419-browser-2086787356556685419-video-1/preview.gif)](https://x.com/john87445528/status/2086787356556685419) | **[第一视角查岗｜遮挡失效到摆烂收口](catalog/cases/x-john87445528-2086787356556685419-browser-2086787356556685419-video-1/SUMMARY.md)**<br><sub>x-john87445528-2086787356556685419-browser-2086787356556685419-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![雨夜追逐｜街巷近战到机车脱身](catalog/cases/x-i-amshiti-2086828210457604364-browser-2086828210457604364-video-1/preview.gif)](https://x.com/I_amShiti/status/2086828210457604364) | **[雨夜追逐｜街巷近战到机车脱身](catalog/cases/x-i-amshiti-2086828210457604364-browser-2086828210457604364-video-1/SUMMARY.md)**<br><sub>x-i-amshiti-2086828210457604364-browser-2086828210457604364-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![对话反应｜冷静回答引爆大笑](catalog/cases/x-aimikoda-2086782084723405173-browser-2086782084723405173-video-1/preview.gif)](https://x.com/aimikoda/status/2086782084723405173) | **[对话反应｜冷静回答引爆大笑](catalog/cases/x-aimikoda-2086782084723405173-browser-2086782084723405173-video-1/SUMMARY.md)**<br><sub>x-aimikoda-2086782084723405173-browser-2086782084723405173-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![对话喜剧｜双轮停顿与无声回击](catalog/cases/x-techiebysa-2086773163870871656-browser-2086773163870871656-video-1/preview.gif)](https://x.com/TechieBySA/status/2086773163870871656) | **[对话喜剧｜双轮停顿与无声回击](catalog/cases/x-techiebysa-2086773163870871656-browser-2086773163870871656-video-1/SUMMARY.md)**<br><sub>x-techiebysa-2086773163870871656-browser-2086773163870871656-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![角色板验真｜跨栏全程身份锁定](catalog/cases/x-techiebysa-2086815556930281726-browser-2086815556930281726-video-1/preview.gif)](https://x.com/TechieBySA/status/2086815556930281726) | **[角色板验真｜跨栏全程身份锁定](catalog/cases/x-techiebysa-2086815556930281726-browser-2086815556930281726-video-1/SUMMARY.md)**<br><sub>x-techiebysa-2086815556930281726-browser-2086815556930281726-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![单人表演弧｜坐起前倾再释放](catalog/cases/x-gizakdag-2086774589426643034-browser-2086774589426643034-video-1/preview.gif)](https://x.com/gizakdag/status/2086774589426643034) | **[单人表演弧｜坐起前倾再释放](catalog/cases/x-gizakdag-2086774589426643034-browser-2086774589426643034-video-1/SUMMARY.md)**<br><sub>x-gizakdag-2086774589426643034-browser-2086774589426643034-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![材质字效｜云层成字再见光](catalog/cases/x-charaspowerai-2086754531698725200-browser-2086754531698725200-video-1/preview.gif)](https://x.com/CharaspowerAI/status/2086754531698725200) | **[材质字效｜云层成字再见光](catalog/cases/x-charaspowerai-2086754531698725200-browser-2086754531698725200-video-1/SUMMARY.md)**<br><sub>x-charaspowerai-2086754531698725200-browser-2086754531698725200-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![多功能救援线｜跨裂隙送补给再撤离](catalog/cases/x-nvtdanh-2086774974921200055-browser-2086774974921200055-video-1/preview.gif)](https://x.com/NVTDanh/status/2086774974921200055) | **[多功能救援线｜跨裂隙送补给再撤离](catalog/cases/x-nvtdanh-2086774974921200055-browser-2086774974921200055-video-1/SUMMARY.md)**<br><sub>x-nvtdanh-2086774974921200055-browser-2086774974921200055-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![微缩逃亡｜巨物追赶到资源补给](catalog/cases/x-futurevibesai-2086777152666796255-browser-2086777152666796255-video-1/preview.gif)](https://x.com/FutureVibesAi/status/2086777152666796255) | **[微缩逃亡｜巨物追赶到资源补给](catalog/cases/x-futurevibesai-2086777152666796255-browser-2086777152666796255-video-1/SUMMARY.md)**<br><sub>x-futurevibesai-2086777152666796255-browser-2086777152666796255-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![气闸异境｜物理异常后空间崩坏](catalog/cases/x-nicolasmariar-2086951328098513269-browser-2086951328098513269-video-1/preview.gif)](https://x.com/nicolasmariar/status/2086951328098513269) | **[气闸异境｜物理异常后空间崩坏](catalog/cases/x-nicolasmariar-2086951328098513269-browser-2086951328098513269-video-1/SUMMARY.md)**<br><sub>x-nicolasmariar-2086951328098513269-browser-2086951328098513269-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![异质航行｜维修出发到巨尺度揭示](catalog/cases/x-brittaninatali-2086846696101962006-browser-2086846696101962006-video-1/preview.gif)](https://x.com/BrittaniNatali/status/2086846696101962006) | **[异质航行｜维修出发到巨尺度揭示](catalog/cases/x-brittaninatali-2086846696101962006-browser-2086846696101962006-video-1/SUMMARY.md)**<br><sub>x-brittaninatali-2086846696101962006-browser-2086846696101962006-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![平面重组｜图标开启档案世界](catalog/cases/x-manuagi01-2086784467981697343-browser-2086784467981697343-video-1/preview.gif)](https://x.com/ManuAGI01/status/2086784467981697343) | **[平面重组｜图标开启档案世界](catalog/cases/x-manuagi01-2086784467981697343-browser-2086784467981697343-video-1/SUMMARY.md)**<br><sub>x-manuagi01-2086784467981697343-browser-2086784467981697343-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![角色登场｜失误后借身体特征破局](catalog/cases/x-guicastellanos1-2086895492437532803-browser-2086895492437532803-video-1/preview.gif)](https://x.com/guicastellanos1/status/2086895492437532803) | **[角色登场｜失误后借身体特征破局](catalog/cases/x-guicastellanos1-2086895492437532803-browser-2086895492437532803-video-1/SUMMARY.md)**<br><sub>x-guicastellanos1-2086895492437532803-browser-2086895492437532803-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![双角色职责｜独立建立后共同完成](catalog/cases/x-manuagi01-2086778003422671069-browser-2086778003422671069-video-1/preview.gif)](https://x.com/ManuAGI01/status/2086778003422671069) | **[双角色职责｜独立建立后共同完成](catalog/cases/x-manuagi01-2086778003422671069-browser-2086778003422671069-video-1/SUMMARY.md)**<br><sub>x-manuagi01-2086778003422671069-browser-2086778003422671069-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![冲击后揭示｜从私密困境到城市尺度真因](catalog/cases/x-yoni-attlan-2087162663922975137-browser-2087162663922975137-video-1/preview.gif)](https://x.com/Yoni_attlan/status/2087162663922975137) | **[冲击后揭示｜从私密困境到城市尺度真因](catalog/cases/x-yoni-attlan-2087162663922975137-browser-2087162663922975137-video-1/SUMMARY.md)**<br><sub>x-yoni-attlan-2087162663922975137-browser-2087162663922975137-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![分层接力｜小物体穿越多区域完成传递](catalog/cases/x-cso6709-2087327019579392231-browser-2087327019579392231-video-1/preview.gif)](https://x.com/cso6709/status/2087327019579392231) | **[分层接力｜小物体穿越多区域完成传递](catalog/cases/x-cso6709-2087327019579392231-browser-2087327019579392231-video-1/SUMMARY.md)**<br><sub>x-cso6709-2087327019579392231-browser-2087327019579392231-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![尺度奇观阶梯｜每镜重置参照再逼近](catalog/cases/x-sada-ai-2087294907786600770-browser-2087294907786600770-video-1/preview.gif)](https://x.com/sada_ai/status/2087294907786600770) | **[尺度奇观阶梯｜每镜重置参照再逼近](catalog/cases/x-sada-ai-2087294907786600770-browser-2087294907786600770-video-1/SUMMARY.md)**<br><sub>x-sada-ai-2087294907786600770-browser-2087294907786600770-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![背景异常｜先被观众发现再由记录设备证实](catalog/cases/x-nicolasmariar-2087313673312256276-browser-2087313673312256276-video-1/preview.gif)](https://x.com/nicolasmariar/status/2087313673312256276) | **[背景异常｜先被观众发现再由记录设备证实](catalog/cases/x-nicolasmariar-2087313673312256276-browser-2087313673312256276-video-1/SUMMARY.md)**<br><sub>x-nicolasmariar-2087313673312256276-browser-2087313673312256276-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![产品证据变体｜场景结果到机理再回人群](catalog/cases/x-doyamarke-2087150954340929655-browser-2087150954340929655-video-1/preview.gif)](https://x.com/doyamarke/status/2087150954340929655) | **[产品证据变体｜场景结果到机理再回人群](catalog/cases/x-doyamarke-2087150954340929655-browser-2087150954340929655-video-1/SUMMARY.md)**<br><sub>x-doyamarke-2087150954340929655-browser-2087150954340929655-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![非对称突破｜密集阻力到空间制度改变](catalog/cases/x-charaspowerai-2087192378880721150-browser-2087192378880721150-video-1/preview.gif)](https://x.com/CharaspowerAI/status/2087192378880721150) | **[非对称突破｜密集阻力到空间制度改变](catalog/cases/x-charaspowerai-2087192378880721150-browser-2087192378880721150-video-1/SUMMARY.md)**<br><sub>x-charaspowerai-2087192378880721150-browser-2087192378880721150-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![表面生长｜沿既有几何扩散并回收到手作载体](catalog/cases/x-vkuoo-2087148758954053985-browser-2087148758954053985-video-1/preview.gif)](https://x.com/vkuoo/status/2087148758954053985) | **[表面生长｜沿既有几何扩散并回收到手作载体](catalog/cases/x-vkuoo-2087148758954053985-browser-2087148758954053985-video-1/SUMMARY.md)**<br><sub>x-vkuoo-2087148758954053985-browser-2087148758954053985-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![步速到抵达｜目的地延迟出现并由环境庆祝](catalog/cases/x-primee32-2087285945213059079-browser-2087285945213059079-video-1/preview.gif)](https://x.com/Primee32/status/2087285945213059079) | **[步速到抵达｜目的地延迟出现并由环境庆祝](catalog/cases/x-primee32-2087285945213059079-browser-2087285945213059079-video-1/SUMMARY.md)**<br><sub>x-primee32-2087285945213059079-browser-2087285945213059079-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![动作成字｜方向笔画驱动角色切换与终态标记](catalog/cases/x-steftranquillin-2087233814665814190-browser-2087233814665814190-video-1/preview.gif)](https://x.com/steftranquillin/status/2087233814665814190) | **[动作成字｜方向笔画驱动角色切换与终态标记](catalog/cases/x-steftranquillin-2087233814665814190-browser-2087233814665814190-video-1/SUMMARY.md)**<br><sub>x-steftranquillin-2087233814665814190-browser-2087233814665814190-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![连续推进｜重复地标计时并抵达更深通道](catalog/cases/x-unrealrafael-2087161642702315868-browser-2087161642702315868-video-1/preview.gif)](https://x.com/UnrealRafael/status/2087161642702315868) | **[连续推进｜重复地标计时并抵达更深通道](catalog/cases/x-unrealrafael-2087161642702315868-browser-2087161642702315868-video-1/SUMMARY.md)**<br><sub>x-unrealrafael-2087161642702315868-browser-2087161642702315868-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![轮廓接力｜闪光换形后完成攻势闭环](catalog/cases/x-macbethai-2087310945009995972-browser-2087310945009995972-video-1/preview.gif)](https://x.com/macbethAI/status/2087310945009995972) | **[轮廓接力｜闪光换形后完成攻势闭环](catalog/cases/x-macbethai-2087310945009995972-browser-2087310945009995972-video-1/SUMMARY.md)**<br><sub>x-macbethai-2087310945009995972-browser-2087310945009995972-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![多人攻势接力｜独立入场后同步收束](catalog/cases/x-itsphotogptai-2087276933222695045-browser-2087276933222695045-video-1/preview.gif)](https://x.com/itsphotogptai/status/2087276933222695045) | **[多人攻势接力｜独立入场后同步收束](catalog/cases/x-itsphotogptai-2087276933222695045-browser-2087276933222695045-video-1/SUMMARY.md)**<br><sub>x-itsphotogptai-2087276933222695045-browser-2087276933222695045-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![微表情问候｜侧身发现到笑容回稳](catalog/cases/x-alone1moon-2087282913410764864-browser-2087282913410764864-video-1/preview.gif)](https://x.com/Alone1Moon/status/2087282913410764864) | **[微表情问候｜侧身发现到笑容回稳](catalog/cases/x-alone1moon-2087282913410764864-browser-2087282913410764864-video-1/SUMMARY.md)**<br><sub>x-alone1moon-2087282913410764864-browser-2087282913410764864-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![地貌变形揭示｜局部异常到巨体逼近](catalog/cases/x-100xmart-2087298018668077160-browser-2087298018668077160-video-1/preview.gif)](https://x.com/100xMart/status/2087298018668077160) | **[地貌变形揭示｜局部异常到巨体逼近](catalog/cases/x-100xmart-2087298018668077160-browser-2087298018668077160-video-1/SUMMARY.md)**<br><sub>x-100xmart-2087298018668077160-browser-2087298018668077160-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![表演让位于环境｜近脸到全景的连续退镜](catalog/cases/x-antonioleivag-2087290562781081994-browser-2087290562781081994-video-1/preview.gif)](https://x.com/antonioleivag/status/2087290562781081994) | **[表演让位于环境｜近脸到全景的连续退镜](catalog/cases/x-antonioleivag-2087290562781081994-browser-2087290562781081994-video-1/SUMMARY.md)**<br><sub>x-antonioleivag-2087290562781081994-browser-2087290562781081994-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![结果先行广告｜终态承诺倒推证据](catalog/cases/x-imagvio-trends-2087163509125878029-browser-2087163509125878029-video-1/preview.gif)](https://x.com/imagvio_trends/status/2087163509125878029) | **[结果先行广告｜终态承诺倒推证据](catalog/cases/x-imagvio-trends-2087163509125878029-browser-2087163509125878029-video-1/SUMMARY.md)**<br><sub>x-imagvio-trends-2087163509125878029-browser-2087163509125878029-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![连续跟随｜步态与弯曲地标共同计时](catalog/cases/x-unrealrafael-2087275532517884174-browser-2087275532517884174-video-1/preview.gif)](https://x.com/UnrealRafael/status/2087275532517884174) | **[连续跟随｜步态与弯曲地标共同计时](catalog/cases/x-unrealrafael-2087275532517884174-browser-2087275532517884174-video-1/SUMMARY.md)**<br><sub>x-unrealrafael-2087275532517884174-browser-2087275532517884174-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![分组对话覆盖｜两边接力后全桌合流](catalog/cases/x-donhyeon-choi-2087163007491268632-browser-2087163007491268632-video-1/preview.gif)](https://x.com/donhyeon_choi/status/2087163007491268632) | **[分组对话覆盖｜两边接力后全桌合流](catalog/cases/x-donhyeon-choi-2087163007491268632-browser-2087163007491268632-video-1/SUMMARY.md)**<br><sub>x-donhyeon-choi-2087163007491268632-browser-2087163007491268632-video-1</sub> | MiniMax H3 · Seedance 2.0 |
| [![群演聚焦接力｜全场到主位再回合奏](catalog/cases/x-ravfx777-2087152046114038024-browser-2087152046114038024-video-1/preview.gif)](https://x.com/ravfx777/status/2087152046114038024) | **[群演聚焦接力｜全场到主位再回合奏](catalog/cases/x-ravfx777-2087152046114038024-browser-2087152046114038024-video-1/SUMMARY.md)**<br><sub>x-ravfx777-2087152046114038024-browser-2087152046114038024-video-1</sub> | MiniMax H3 · Seedance 2.0 |

<!-- CASE_GALLERY:END -->

## 快速开始

### 使用桌面查看器

1. 打开 [Releases](https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases)。
2. Windows 下载 `T8-Prompt-Library-Setup-v1.1.2.exe`；macOS 下载 `T8-Prompt-Library-v1.1.2-mac-universal.dmg`。
3. 安装并打开应用；案例视频、分析与双模型提示词会一起出现。
4. 后续版本可在应用内检查并安装更新。

当前提供 Windows x64 与 universal macOS（Intel + Apple Silicon）安装包。macOS 预览包尚未 Apple 签名或公证，安装前请核对 SHA-256；更详细说明见 [安装指南](./docs/installation.md)。

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

当前目标版本是 **v1.1.2**。项目使用十进制进位：

```text
v1.0.0 -> ... -> v1.0.9 -> v1.1.0
v1.1.9 -> v1.2.0
v1.9.9 -> v2.0.0
```

应用版本、案例目录版本和 Schema 版本分别记录，避免为了增加案例而不必要地改变数据合同。参见 [发布政策](./docs/release-policy.md)。

## 文档

- [安装](./docs/installation.md)
- [使用](./docs/usage.md)
- [双语与复制合同](./docs/localization-and-copy.md)
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
