# 发布与自动更新 / Release Policy

## 版本规则

当前版本是 `v1.2.9`。Git Tag 和 GitHub Release 带 `v`，`package.json` 使用不带 `v` 的 `1.2.9`。

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
- `prompt-library-previews-v<version>-part1.zip` 与 `prompt-library-previews-v<version>-part2.zip`；
- `prompt-library-skills-v<version>.zip`；
- `media-pack-manifest.json`；
- `SHA256SUMS.txt`。

## 为什么媒体包不在 Git 中

GitHub 页面需要快速浏览，因此提交优化后的 GIF/Poster。完整 MP4 会迅速放大 Git 历史，所以从本地 `.release-input/media/` 单独构建媒体包，上传为 Release 资产，并在正式 Electron 构建时作为 `extraResources` 加入安装包。

为保证 Windows 与 universal macOS 安装资产都低于 GitHub 的单文件大小上限，Release runner 会在 `.release-input/app-catalog/` 创建仅供 Electron 打包的紧凑目录副本：GIF 以单线程逐个压到最长边 288 px、4 fps、64 色，但仍保留动态预览；JSON、Markdown、Poster、案例数量和 manifest 不变。紧凑目录另有 350 MiB 硬门禁，超过即停止发布。完整 MP4 不会被这一过程重编码。

Git 仓库继续保留原始 GIF。由于原始动态预览合计已超过 GitHub 单资产 2 GiB 上限，独立公开目录按用途分为三个无损 ZIP：`prompt-library-catalog` 保存 JSON、Markdown 与 Poster，两个 `prompt-library-previews` 分卷保存原始 GIF 并保留 `catalog/...` 相对路径。需要完整离线原始目录时，将三个 ZIP 解压到同一父目录即可还原；分卷只解决平台文件上限，不降低 GIF 质量或减少条目。

媒体包只收录案例 manifest 中 `preview_status.mp4=available_in_electron_media_pack` 的 MP4。标记为 `private_local_only_not_exported` 的案例必须进入 manifest 的 `unavailable_cases`，安装包使用仓库内 GIF/Poster 和原帖链接；若媒体暂存目录中出现这类来源 MP4，打包脚本和验证器都会失败。`files` 与 `unavailable_cases` 必须无重叠、无遗漏地覆盖全部公开案例。

### 正式案例预览质量门（强制）

- 正式收录的案例不得使用纯文字、双帧换色或“请打开原帖”占位 GIF。缺少可分发来源视频不是降低封面质量的理由。
- `preview_status.mp4=private_local_only_not_exported` 时，只允许使用不含任何来源画面的原创机制动画：`gif=generated_mechanism_animation_no_source_media`、`poster=generated_mechanism_poster_no_source_media`、`source_visuals_used=false`，并在 `source.json` 明确 `preview_kind=original_mechanism_animation`。
- 原创机制动画必须真实表现案例的因果阶段、运动路径或状态变化，并满足原始 GIF 至少 640×360、24 帧、1.8 秒、120 KiB；安装包紧凑副本至少 280×150、8 帧、1.8 秒、20 KiB。仅修改元数据不能绕过门禁。
- 界面必须把这类资产显示为“原创机制动画”，不得标成“完整来源视频”或笼统的“GIF 预览”；详情页必须说明动画不含原帖画面，并保留作者原帖入口。
- 每批正式收录、目录合并与 Release 前都运行 `npm run validate`。校验器发现旧状态 `derived_placeholder_no_source_media`、帧数/时长/尺寸/体积不足、状态不一致或来源画面边界缺失时必须停止发布。

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
npm run media:pack -- -Version 1.2.9
```

本地需要可用的 `ffprobe`；不在 `PATH` 时可增加 `-FfprobePath <path>`。脚本实探测每个允许分发文件的时长、视频 codec 和音频 codec，输出 `.release-input/out/prompt-library-media-v1.2.9.zip`、`media-pack-manifest.json` 和对应 SHA-256。manifest 分开记录可分发案例 `files`、权利受限案例 `unavailable_cases` 与非官方 Skill `community_skill_files`；`.release-input/` 已被 Git 忽略。

## 手动发布流程

1. 确认分支 CI 全绿，工作树对应待发布 Commit。
2. 更新根目录与 Electron 应用的 `package.json` 版本和 `CHANGELOG.md`。
3. 运行 `npm run validate`、`npm run app:test` 和本地媒体打包。
4. 在 GitHub 创建目标 Tag 的 **Draft Release**，上传媒体 ZIP；不要先发布。
5. 记录媒体 ZIP 的 SHA-256。
6. 手动运行 `.github/workflows/release.yml`，输入不带 `v` 的版本与媒体 SHA-256。
7. 工作流定位或安装 `ffmpeg`/`ffprobe`，从 Draft Release 下载指定媒体资产、校验 ZIP 哈希并解压。
8. 每个 `files` 或 `community_skill_files` 中的 MP4 都重新探测时长与 codec，并以单解码线程完整遍历视频轨；`audio_mode=present` 的媒体还必须完整遍历音频轨，来源本身无音轨的媒体必须明确记录 `audio_mode=source_silent` 与 `audio_codec=null`。探针结果必须与 manifest 一致。允许解码器自行恢复的孤立损坏帧，但容器、声明存在的轨道、进程退出或完整遍历失败仍会阻断发布。`unavailable_cases` 必须与案例权利状态逐项一致且对应 MP4 不得存在。
9. Windows runner 与 macOS runner 分别用单线程 FFmpeg 生成安装包专用的紧凑动态 GIF 副本，并核对其 manifest 与仓库完全一致；随后 Windows 构建完整 NSIS，macOS 构建 unsigned universal DMG + ZIP。两端都逐 path、size 与 SHA-256 对账安装包内可分发媒体，并再次确认受限媒体未进入成品。
10. 两个平台都以打包后的应用运行 E2E，证明 239 个案例、9 个官方仓库条目、2 个非官方 Skills、219 个可分发案例视频、2 个社区 Skill 视频、20 个权利受限 GIF 回退，以及收藏/合集/历史、双语、复制、音频播放（对有音轨媒体）、提示词和对比界面可用。
11. 最终发布 Job 必须同时收到 Windows 与 macOS 已验证产物，核对精确资产集合后统一生成 `SHA256SUMS.txt`。
12. 只有以上门禁通过，才上传全部目录包、Skills 包、媒体包、Windows 安装包和 macOS 安装包；`publish=true` 时才把 Draft 设为正式 Release。

发布工作流不会从普通 CI 猜测或伪造 MP4。如果 Draft 中没有名称完全匹配的媒体包、SHA-256 不匹配、允许分发的案例媒体不完整，或权利受限媒体被误放入暂存目录，构建立即失败。

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

**English summary:** Releases use decimal carry versioning and a pre-staged, rights-aware media asset. Redistributable videos are fully traversed with one decoder thread; rights-limited cases must be listed as unavailable and fall back to catalog GIF/Poster assets, and their source MP4s are forbidden from release staging. Source-silent files must be explicit. Isolated recoverable frames are tolerated while incomplete streams or non-zero decoder exits still fail. Packaged E2E runs before a final job assembles checksummed assets. Windows updates require explicit restart confirmation; unsigned macOS previews update manually.
