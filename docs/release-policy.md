# 发布与自动更新 / Release Policy

## 版本规则

当前版本是 `v1.3.6`。Git Tag 和 GitHub Release 带 `v`，`package.json` 使用不带 `v` 的 `1.3.6`。

版本采用十进制进位：

```text
1.0.0 -> 1.0.1 -> ... -> 1.0.9 -> 1.1.0
1.1.9 -> 1.2.0
1.2.0 -> 1.2.1
1.2.1 -> 1.2.2
1.2.2 -> 1.2.3
1.2.3 -> 1.2.4
1.2.4 -> 1.2.5
1.2.5 -> 1.2.6
1.2.6 -> 1.2.7
1.2.7 -> 1.2.8
1.2.8 -> 1.2.9
1.2.9 -> 1.3.0
1.3.0 -> 1.3.1
1.3.1 -> 1.3.2
1.3.2 -> 1.3.3
1.3.3 -> 1.3.4
1.3.5 -> 1.3.6
1.9.9 -> 2.0.0
```

每次稳定发布必须恰好递增一次，不能发布 `1.0.10`。Schema 版本独立管理，不因新增案例自动改变。

## Release 资产

稳定版至少包含：

- `T8-Prompt-Library-Setup-v<version>.exe`；
- `T8-Prompt-Library-Portable-v<version>.exe`；
- `latest.yml` 与 Electron updater 所需 blockmap；
- `T8-Prompt-Library-v<version>-mac-universal.dmg`；
- `T8-Prompt-Library-v<version>-mac-universal.zip`、`latest-mac.yml` 与 ZIP blockmap；
- `prompt-library-media-v<version>-part1.zip` 与 `prompt-library-media-v<version>-part2.zip`；
- `prompt-library-catalog-v<version>.zip`；
- `prompt-library-previews-v<version>-part1.zip` 与 `prompt-library-previews-v<version>-part2.zip`；
- `prompt-library-skills-v<version>.zip`；
- `media-pack-manifest.json`；
- `SHA256SUMS.txt`。

## 为什么媒体包不在 Git 中

GitHub 页面需要快速浏览，因此提交优化后的 GIF/Poster。完整 MP4 会迅速放大 Git 历史，所以从本地 `.release-input/media/` 构建两个按体积均衡的无损媒体 ZIP 分卷并上传为 Release 资产。分卷与桌面安装包分离，仅用于避开 GitHub 单资产 2 GiB 的硬上限；这不是分发限制，也不会重编码视频。正式案例视频全部允许分发，把两个分卷解压到同一媒体目录后，应用会从用户数据目录、应用同级目录或显式 `T8_MEDIA_DIR` 自动挂载。旧版 `resources/media/` 继续兼容。

为保证 Windows 与 universal macOS 安装资产都低于 GitHub 的单文件大小上限，Release runner 会在 `.release-input/app-catalog/` 创建仅供 Electron 打包的紧凑目录副本：GIF 以单线程逐个压到最长边 288 px、4 fps、64 色，但仍保留全部动态预览；JSON、Markdown、Poster、案例数量和 manifest 不变。紧凑目录另有 420 MiB 硬门禁，超过即停止发布。该门槛覆盖当前 286 项目录的实测 418,936,173 字节；完整 MP4 不会被这一过程重编码。

Git 仓库继续保留原始 GIF。由于原始动态预览合计已超过 GitHub 单资产 2 GiB 上限，独立公开目录按用途分为三个无损 ZIP：`prompt-library-catalog` 保存 JSON、Markdown 与 Poster，两个 `prompt-library-previews` 分卷保存原始 GIF 并保留 `catalog/...` 相对路径。需要完整离线原始目录时，将三个 ZIP 解压到同一父目录即可还原；分卷只解决平台文件上限，不降低 GIF 质量或减少条目。

库所有者已明确授权正式收录视频随本地包、独立媒体包与 ComfyUI 交接分发。每个 `released/approved` 案例都必须满足 `preview_status.mp4=available_in_electron_media_pack`，媒体包 `files` 必须无遗漏覆盖全部公开案例，`unavailable_cases` 必须为空。分发授权与模型参考授权严格分离：GIF、海报和来源视频均不得自动连接到模型 reference 输入。

### 正式案例预览质量门（强制）

- 正式收录案例必须使用与已审核来源视频对应的真实动态 GIF 和海报，不得使用纯文字、双帧换色、机制示意图或“请打开原帖”占位封面。
- 正式收录案例必须同时具有可校验的真实 GIF、海报和媒体包 MP4；任一缺失都阻断目录、安装包和 Release。
- `catalog/media-distribution-authorization.json` 是公开分发授权的唯一当前策略记录；模型参考仍恒为 false，不得因分发授权而连接来源媒体。
- 每批正式收录、目录合并与 Release 前都运行 `npm run validate`，并核对 GIF/MP4 数量与公开案例数量完全一致。

### 本地准备媒体包

媒体目录结构：

```text
.release-input/media/
├─ <case-id>/
│  └─ preview.mp4
└─ community-skills/
   └─ <skill-id>/
      └─ preview.mp4
```

运行：

```powershell
npm run media:pack -- -Version 1.3.6
```

本地需要可用的 `ffprobe`；不在 `PATH` 时可增加 `-FfprobePath <path>`。脚本实探测每个正式案例和社区 Skill 媒体的时长、视频 codec 和音频 codec，按原文件体积均衡输出 `.release-input/out/prompt-library-media-v1.3.6-part1.zip`、`prompt-library-media-v1.3.6-part2.zip`、`media-pack-manifest.json` 和两个对应 SHA-256。两个 ZIP 都带相同 manifest，解压到同一目录即可无损还原完整媒体。manifest 的 `files` 必须覆盖全部正式案例，`unavailable_cases` 必须为空，`community_skill_files` 单独记录非官方 Skill 样片；`.release-input/` 已被 Git 忽略。

## 手动发布流程

1. 确认分支 CI 全绿，工作树对应待发布 Commit。
2. 更新根目录与 Electron 应用的 `package.json` 版本和 `CHANGELOG.md`。
3. 运行 `npm run validate`、`npm run app:test` 和本地媒体打包。
4. 在 GitHub 创建目标 Tag 的 **Draft Release**，上传两个媒体 ZIP 分卷；不要先发布。
5. 按 part1、part2 顺序记录两个 ZIP 的 SHA-256。
6. 手动运行 `.github/workflows/release.yml`，输入不带 `v` 的版本与用英文逗号连接的两个媒体 SHA-256。
7. 工作流定位或安装 `ffmpeg`/`ffprobe`，从 Draft Release 下载两个媒体分卷、逐个校验 ZIP 哈希并解压到同一目录。
8. 每个 `files` 或 `community_skill_files` 中的 MP4 都重新探测时长与 codec，并以单解码线程完整遍历视频轨；`audio_mode=present` 的媒体还必须完整遍历音频轨，来源本身无音轨的媒体必须明确记录 `audio_mode=source_silent` 与 `audio_codec=null`。探针结果必须与 manifest 一致。允许解码器自行恢复的孤立损坏帧，但容器、声明存在的轨道、进程退出或完整遍历失败仍会阻断发布。`unavailable_cases` 必须为空。
9. Windows runner 与 macOS runner 分别用单线程 FFmpeg 生成安装包专用的紧凑动态 GIF 副本，并核对其 manifest 与仓库完全一致；随后 Windows 同时构建不重复内嵌 MP4 的 NSIS 与 portable 单文件，macOS 构建不重复内嵌 MP4 的 unsigned universal DMG + ZIP。门禁会阻止 `resources/media` 意外进入任何桌面包。
10. 两个平台都以打包后的应用挂载同一份已还原并校验的外置媒体目录运行 E2E，证明 275 个案例、9 个官方仓库条目、2 个非官方 Skills、275 个可分发案例视频、2 个社区 Skill 视频、0 个不可用案例，以及收藏/合集/历史、双语、复制、音频播放（对有音轨媒体）、提示词和对比界面可用；Windows 还会实际启动 portable EXE，确认 `userData` 与 `sessionData` 都落在启动器旁的 `T8-Prompt-Library-Data`。
11. 最终发布 Job 必须同时收到 Windows 与 macOS 已验证产物，核对精确资产集合后统一生成 `SHA256SUMS.txt`。
12. 只有以上门禁通过，才上传全部目录包、Skills 包、媒体包、Windows 安装包和 macOS 安装包；`publish=true` 时才把 Draft 设为正式 Release。

发布工作流不会从普通 CI 猜测或伪造 MP4。如果 Draft 中缺少任一名称完全匹配的媒体分卷、任一 SHA-256 不匹配，或还原后任一正式案例媒体不完整，构建立即失败。

## 自动更新

Windows 安装版 Electron updater 只查询本仓库的稳定 GitHub Releases。`latest.yml` 与安装包必须来自同一次构建。更新可以自动检查并下载，但 `autoInstallOnAppQuit` 关闭；只有用户点击界面的“重启安装”后才调用安装。Windows 便携版不调用安装器式 updater，检查更新时只打开官方 Releases 页面，由用户核对哈希并替换 EXE；旁边的 `T8-Prompt-Library-Data` 保持不变。

macOS 同步生成 ZIP、ZIP blockmap 和 `latest-mac.yml`，为未来签名更新保留完整产物合同；但当前公开构建没有 Apple Developer ID，自动更新在 macOS 上禁用，界面只打开 Releases 页面。获得 Apple 签名与公证密钥前，不得把 macOS 包宣称为已签名、已公证或可自动更新。

建议启用仓库的 Immutable Releases、分支保护和 Actions 审批。正式签名证书可用后，Windows 与 macOS 安装包都应加入代码签名，macOS 还需 notarization；未签名版本必须在 Release Notes 中明确说明。

## 回滚

- 不覆盖或重新上传已发布版本的同名文件；
- 严重问题发布下一个十进制版本修复；
- 暂停自动更新时将有问题版本标记为非最新，并发布说明；
- 案例数据问题需同时修正 catalog、Skill 和下一版媒体包映射。

---

**English summary:** Releases use decimal-carry versioning and two pre-staged, lossless media ZIP volumes. All released case videos are distributable and must be restored from both sidecar parts into one media directory; `unavailable_cases` must stay empty. The split avoids GitHub's 2 GiB per-asset limit and is not a distribution restriction. Videos are fully traversed with one decoder thread. Source-silent files must be explicit. Isolated recoverable frames are tolerated while incomplete streams or non-zero decoder exits still fail. Packaged E2E mounts the verified restored sidecar before a final job assembles checksummed assets. Windows updates require explicit restart confirmation; unsigned macOS previews update manually.
