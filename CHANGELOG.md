# Changelog

本项目的公开变更记录在此维护。版本采用三段十进制进位规则，而不是无限增长的 patch 位。

## [Unreleased]

### Planned

- 首批持续扩充的 MiniMax H3 与 Seedance 2.0 Creative DNA 案例。
- macOS 与 Linux 桌面发行评估。

## [1.0.3] - 2026-08-09

### Added

- Electron 默认“全部”入口，统一显示 7 个视频案例、9 个 MiniMax 官方仓库 Skills 与 1 个非官方 Skill，总数 17。
- 9 个官方仓库条目的本地 GIF 预览；8 个使用对应官方演示 GIF，通用写作 Skill 将官方 T2VA 示例转换为 8 秒 GIF。
- 官方预览的固定来源 URL、源文件 SHA-256、本地 GIF SHA-256、类型与可见标签。

### Changed

- 只有“创意案例”分类显示案例对比控制，混合“全部”页专注浏览与检索。
- 官方 Skill 卡片和详情页改为离线 GIF，不再使用统一的 `H3 ↔ S2` 占位图。
- 首页聚合统计现在显示全部内容、可预览内容、双模型模板总数与筛选结果。

## [1.0.2] - 2026-08-09

### Added

- 首个明确分区的非官方、用户贡献 Skill：`direct-street-interview-video`。
- MiniMax H3 Ref2VA/Base 与 Seedance 2.0 两套自然街拍互动模板、摘要、证据修复与反复制边界。
- GitHub 6 秒 GIF/Poster 预览，以及 Electron 内 10.125 秒完整有声样片。
- Electron “非官方 Skills”独立入口、来源标签、搜索筛选、详情播放和双模型复制。
- 媒体包 `community_skill_files` 合同与完整视频/音频解码校验。

### Fixed

- 防止提示词在目标时长终点才开启下一镜头。
- 为 10 秒与 15 秒街头对话增加可执行的对白密度门，并移除无证据的 4K 声明。
- 肢体定位改为合意优先；默认使用语言、视线和手势，避免不必要的陌生人接触。

## [1.0.1] - 2026-08-09

### Added

- 独立的 MiniMax 官方仓库 Skills 索引，共 1 个提示词 Skill 与 8 个风格 Skill。
- 9 个 T8 原创 Seedance 2.0 伴侣 Skills，不复制或改写上游 H3 Skill 正文。
- Electron 官方 Skill 浏览、来源分类、H3 上游安装入口与 Seedance 模板查看。
- 上游 Commit、目录 SHA、文件 SHA-256、版本和来源分类固定记录。

### Changed

- 官方仓库 Skill 明确排除在 ComfyUI 导入之外，避免和节点内置预设重复。

## [1.0.0] - 2026-08-09

### Added

- 公共案例目录、双模型提示词和可安装案例 Skills。
- GitHub GIF 预览、原帖引用与 Electron 完整 MP4 播放合同。
- Windows Electron 桌面查看器与 GitHub Releases 自动更新链。
- 公共边界、秘密、绝对路径、目录结构、案例状态和 Skill frontmatter 校验。
- 中英文友好的安装、使用、贡献、来源、发布、隐私和安全文档。
