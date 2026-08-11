# 发布与自动更新 / Release Policy

## 版本规则

当前版本是 `v1.1.0`。Git Tag 和 GitHub Release 带 `v`，`package.json` 使用不带 `v` 的 `1.1.0`。

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
- `prompt-library-media-v<version>.zip`；
- `prompt-library-catalog-v<version>.zip`；
- `prompt-library-skills-v<version>.zip`；
- `media-pack-manifest.json`；
- `SHA256SUMS.txt`。

## 为什么媒体包不在 Git 中

GitHub 页面需要快速浏览，因此提交优化后的 GIF/Poster。完整 MP4 会迅速放大 Git 历史，所以从本地 `.release-input/media/` 单独构建媒体包，上传为 Release 资产，并在正式 Electron 构建时作为 `extraResources` 加入安装包。

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
npm run media:pack -- -Version 1.1.0
```

本地需要可用的 `ffprobe`；不在 `PATH` 时可增加 `-FfprobePath <path>`。脚本实探测每个文件的时长、视频 codec 和音频 codec，输出 `.release-input/out/prompt-library-media-v1.1.0.zip`、`media-pack-manifest.json` 和对应 SHA-256。manifest 分开记录案例 `files` 与非官方 Skill `community_skill_files`；`.release-input/` 已被 Git 忽略。

## 手动发布流程

1. 确认分支 CI 全绿，工作树对应待发布 Commit。
2. 更新根目录与 Electron 应用的 `package.json` 版本和 `CHANGELOG.md`。
3. 运行 `npm run validate`、`npm run app:test` 和本地媒体打包。
4. 在 GitHub 创建目标 Tag 的 **Draft Release**，上传媒体 ZIP；不要先发布。
5. 记录媒体 ZIP 的 SHA-256。
6. 手动运行 `.github/workflows/release.yml`，输入不带 `v` 的版本与媒体 SHA-256。
7. 工作流定位或安装 `ffmpeg`/`ffprobe`，从 Draft Release 下载指定媒体资产、校验 ZIP 哈希并解压。
8. 每个 MP4 都重新探测时长与 codec，并用 `ffmpeg -xerror` 完整解码视频和音频；探针结果必须与 manifest 一致。
9. 工作流构建完整 NSIS 安装包，再逐 path、size 与 SHA-256 检查 `win-unpacked/resources/media` 和打包 manifest。
10. 工作流以打包后的 Electron EXE 运行 E2E，证明 49 个案例、9 个官方仓库条目、2 个非官方 Skills、51 份完整视频、声音、提示词和对比界面可用。
11. 只有以上门禁通过，才生成目录包、Skills 包及 `SHA256SUMS.txt` 并上传回 Draft。
12. `publish=false` 时人工检查 Draft；确认后重新运行并设置 `publish=true`，工作流才发布 Release。

发布工作流不会从普通 CI 猜测或伪造 MP4。如果 Draft 中没有名称完全匹配的媒体包、SHA-256 不匹配或案例媒体不完整，构建立即失败。

## 自动更新

Electron updater 只查询本仓库的稳定 GitHub Releases。`latest.yml` 与安装包必须来自同一次构建。应用在 renderer 隔离环境中运行，更新逻辑只存在于 main process。更新可以自动检查并下载，但 `autoInstallOnAppQuit` 关闭；只有用户点击界面的“重启安装”后才调用安装，普通退出不会自动应用已下载更新。

建议启用仓库的 Immutable Releases、分支保护和 Actions 审批。正式签名证书可用后，Windows 安装包应加入代码签名；未签名版本必须在 Release Notes 中明确说明。

## 回滚

- 不覆盖或重新上传已发布版本的同名文件；
- 严重问题发布下一个十进制版本修复；
- 暂停自动更新时将有问题版本标记为非最新，并发布说明；
- 案例数据问题需同时修正 catalog、Skill 和下一版媒体包映射。

---

**English summary:** Releases use decimal carry versioning and a pre-staged draft media asset. The workflow probes and fully decodes every MP4, verifies the packaged resources against the manifest, runs E2E against the packaged EXE, and only then assembles checksummed assets. Downloaded updates install only after the user explicitly chooses “Restart to install.”
