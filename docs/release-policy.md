# 发布与自动更新 / Release Policy

## 版本规则

当前版本是 `v1.2.0`。Git Tag 和 GitHub Release 带 `v`，`package.json` 使用不带 `v` 的 `1.2.0`。

版本采用十进制进位：

```text
1.0.0 -> 1.0.1 -> ... -> 1.0.9 -> 1.1.0
1.1.9 -> 1.2.0
1.9.9 -> 2.0.0
```

每次稳定发布必须恰好递增一次，不能发布 `1.0.10`。Schema 版本独立管理，不因新增案例自动改变。

## Release 资产

稳定版至少包含：

- `T8-Prompt-Library-Setup-v<version>.exe`；
- `latest.yml` 与 Electron updater 所需 blockmap；
- `T8-Prompt-Library-v<version>-mac-universal.dmg`；
- `T8-Prompt-Library-v<version>-mac-universal.zip`、`latest-mac.yml` 与 ZIP blockmap；
- `prompt-library-media-v<version>.zip`；
- `prompt-library-catalog-v<version>.zip`；
- `prompt-library-skills-v<version>.zip`；
- `media-pack-manifest.json`；
- `SHA256SUMS.txt`。

## 为什么媒体包不在 Git 中

GitHub 页面需要快速浏览，因此提交优化后的 GIF/Poster。完整 MP4 会迅速放大 Git 历史，所以从本地 `.release-input/media/` 单独构建媒体包，上传为 Release 资产，并在正式 Electron 构建时作为 `extraResources` 加入安装包。

为保证 Windows 与 universal macOS 安装资产都低于 GitHub 的单文件大小上限，Release runner 会在 `.release-input/app-catalog/` 创建仅供 Electron 打包的紧凑目录副本：GIF 以单线程逐个缩放和降帧，但仍保留动态预览；JSON、Markdown、Poster、案例数量和 manifest 不变。Git 仓库与独立的 `prompt-library-catalog-v<version>.zip` 始终使用原始公开目录，完整 MP4 也不会被这一过程重编码。

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
npm run media:pack -- -Version 1.2.0
```

本地需要可用的 `ffprobe`；不在 `PATH` 时可增加 `-FfprobePath <path>`。脚本实探测每个文件的时长、视频 codec 和音频 codec，输出 `.release-input/out/prompt-library-media-v1.2.0.zip`、`media-pack-manifest.json` 和对应 SHA-256。manifest 分开记录案例 `files` 与非官方 Skill `community_skill_files`；`.release-input/` 已被 Git 忽略。

## 手动发布流程

1. 确认分支 CI 全绿，工作树对应待发布 Commit。
2. 更新根目录与 Electron 应用的 `package.json` 版本和 `CHANGELOG.md`。
3. 运行 `npm run validate`、`npm run app:test` 和本地媒体打包。
4. 在 GitHub 创建目标 Tag 的 **Draft Release**，上传媒体 ZIP；不要先发布。
5. 记录媒体 ZIP 的 SHA-256。
6. 手动运行 `.github/workflows/release.yml`，输入不带 `v` 的版本与媒体 SHA-256。
7. 工作流定位或安装 `ffmpeg`/`ffprobe`，从 Draft Release 下载指定媒体资产、校验 ZIP 哈希并解压。
8. 每个 MP4 都重新探测时长与 codec，并以单解码线程完整遍历视频轨；`audio_mode=present` 的媒体还必须完整遍历音频轨，来源本身无音轨的媒体必须明确记录 `audio_mode=source_silent` 与 `audio_codec=null`。探针结果必须与 manifest 一致。允许解码器自行恢复的孤立损坏帧，但容器、声明存在的轨道、进程退出或完整遍历失败仍会阻断发布。
9. Windows runner 与 macOS runner 分别用单线程 FFmpeg 生成安装包专用的紧凑动态 GIF 副本，并核对其 manifest 与仓库完全一致；随后 Windows 构建完整 NSIS，macOS 构建 unsigned universal DMG + ZIP。两端都逐 path、size 与 SHA-256 对账安装包内媒体，并按上述容错标准完整遍历视频及实际存在的音频轨。
10. 两个平台都以打包后的应用运行 E2E，证明 215 个案例、9 个官方仓库条目、2 个非官方 Skills、217 份完整来源视频、收藏/合集/历史、双语、复制、音频播放（对有音轨媒体）、提示词和对比界面可用。
11. 最终发布 Job 必须同时收到 Windows 与 macOS 已验证产物，核对精确资产集合后统一生成 `SHA256SUMS.txt`。
12. 只有以上门禁通过，才上传全部目录包、Skills 包、媒体包、Windows 安装包和 macOS 安装包；`publish=true` 时才把 Draft 设为正式 Release。

发布工作流不会从普通 CI 猜测或伪造 MP4。如果 Draft 中没有名称完全匹配的媒体包、SHA-256 不匹配或案例媒体不完整，构建立即失败。

## 自动更新

Windows Electron updater 只查询本仓库的稳定 GitHub Releases。`latest.yml` 与安装包必须来自同一次构建。更新可以自动检查并下载，但 `autoInstallOnAppQuit` 关闭；只有用户点击界面的“重启安装”后才调用安装。

macOS 同步生成 ZIP、ZIP blockmap 和 `latest-mac.yml`，为未来签名更新保留完整产物合同；但当前公开构建没有 Apple Developer ID，自动更新在 macOS 上禁用，界面只打开 Releases 页面。获得 Apple 签名与公证密钥前，不得把 macOS 包宣称为已签名、已公证或可自动更新。

建议启用仓库的 Immutable Releases、分支保护和 Actions 审批。正式签名证书可用后，Windows 与 macOS 安装包都应加入代码签名，macOS 还需 notarization；未签名版本必须在 Release Notes 中明确说明。

## 回滚

- 不覆盖或重新上传已发布版本的同名文件；
- 严重问题发布下一个十进制版本修复；
- 暂停自动更新时将有问题版本标记为非最新，并发布说明；
- 案例数据问题需同时修正 catalog、Skill 和下一版媒体包映射。

---

**English summary:** Releases use decimal carry versioning and a pre-staged media asset. Windows and macOS jobs each traverse every staged and packaged video stream with one decoder thread and every declared audio stream likewise; source-silent files must be explicitly marked. Isolated recoverable frames are tolerated while incomplete streams or non-zero decoder exits still fail. Packaged E2E runs before a final job assembles checksummed assets. Windows updates require explicit restart confirmation; unsigned macOS previews update manually.
