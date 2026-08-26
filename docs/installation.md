# 安装指南 / Installation

## Electron 桌面版（推荐）

### 系统要求

- Windows 10/11 x64，或 Intel / Apple Silicon Mac（universal 包）；
- 安装时可访问 GitHub Releases；
- 预留足够空间保存完整 MP4 案例媒体。

### 安装步骤

1. 打开仓库的 [Releases](https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases)。
2. 选择最新稳定版本：Windows 下载 `T8-Prompt-Library-Setup-v<version>.exe`；macOS 下载 `T8-Prompt-Library-v<version>-mac-universal.dmg`。
3. 可选：使用同一 Release 的 `SHA256SUMS.txt` 核对文件哈希。
4. 运行安装程序并启动 **T8 Prompt Library**。
5. 如需在应用内播放完整 MP4，再下载同一 Release 的 `prompt-library-media-v<version>.zip`，按下文解压到媒体目录后重启应用；不安装媒体包时仍可离线查看全部真实 GIF/Poster。
6. 应用首次启动后检查目录版本；之后可通过“检查更新”获取稳定版更新。

Windows 校验示例：

```powershell
Get-FileHash .\T8-Prompt-Library-Setup-v1.3.1.exe -Algorithm SHA256
```

将结果与 `SHA256SUMS.txt` 中对应文件比较。

macOS 校验示例：

```bash
shasum -a 256 T8-Prompt-Library-v1.3.1-mac-universal.dmg
```

macOS 包同时提供 DMG 与 ZIP，均为 universal（Intel + Apple Silicon）。当前公开版没有 Apple Developer ID，因此**未签名、未公证**：请先核对 `SHA256SUMS.txt`，再打开 DMG 并把应用拖入 Applications。首次启动优先在 Finder 中右键应用并选择“打开”；若系统仍阻止且你已确认哈希，可自行执行：

```bash
xattr -dr com.apple.quarantine "/Applications/T8 Prompt Library.app"
```

这条命令会移除该应用的隔离标记，只应对本仓库 Release 中已校验的应用使用。获得 Apple 签名与公证凭据后，发行链会升级为签名包。

### 完整视频如何进入应用

Git 仓库只保存 GIF/Poster。全部正式案例 MP4 位于对应 GitHub Release 的 `prompt-library-media-v<version>.zip`。所有视频均已获库所有者授权分发；媒体包与桌面安装包分开，是为了避开 GitHub 单资产 2 GiB 的硬上限，不代表视频不可分发或不可下载。

把媒体 ZIP 的内容直接解压到下列 `media` 目录之一，确保 `media-pack-manifest.json` 位于该目录根部，然后重启应用：

- Windows 推荐：`%APPDATA%\T8 Prompt Library\media\`；也支持应用可执行文件同级的 `media\`；
- macOS 推荐：`~/Library/Application Support/T8 Prompt Library/media/`；也支持 `.app` 同级的 `media/`；
- 旧版曾内置的 `resources/media/` 继续兼容；开发与自动化可通过 `T8_MEDIA_DIR` 显式指定。

例如 Windows PowerShell：

```powershell
$mediaRoot = Join-Path $env:APPDATA "T8 Prompt Library\media"
New-Item -ItemType Directory -Force -Path $mediaRoot | Out-Null
Expand-Archive .\prompt-library-media-v1.3.1.zip -DestinationPath $mediaRoot -Force
```

因此：

- 全部正式收录案例在安装媒体包后都可直接播放完整视频和声音；GIF、Poster 与来源视频均可分发，但不会自动连接到模型参考输入；
- 不需要登录 X、Reddit 或 YouTube 才能查看本地视频；
- 有原始帖子地址的案例保留来源按钮；用户提供但未附外部地址的非官方 Skill 不会伪造链接；
- 普通源代码 CI 只验证无完整媒体构建，不会假装包含 MP4。

安装包里的卡片预览仍是动态 GIF，但为控制跨平台安装资产体积，会使用 Release 构建时生成的紧凑副本；独立目录 ZIP 与 GitHub 页面保留仓库原始预览，独立媒体包中的完整 MP4 画面、时长与声音不受影响。

### 自动更新

Windows 应用只从 `T8mars/minimax-h3-prompt-skill-T8` 的 GitHub Releases 检查稳定版。发现更新后会下载，下载完成时界面显示“重启安装”。只有用户点击该操作后，应用才退出并安装更新；普通关闭应用不会自动安装已经下载的版本。更新不会读取浏览器 Cookie 或第三方平台登录状态。

未签名 macOS 预览版不启用自动下载安装；点击“检查更新”会打开 Releases 页面，用户校验哈希后手动覆盖安装。收藏、合集和浏览历史位于系统应用数据目录，不会因正常覆盖安装而删除。

如自动更新失败，可关闭应用后下载最新安装包覆盖安装。

## 从源码运行

需要 Node.js 22 或更高版本：

```powershell
git clone https://github.com/T8mars/minimax-h3-prompt-skill-T8.git
Set-Location .\minimax-h3-prompt-skill-T8
npm run app:install
npm run app:test
npm run app:pack
```

源代码构建默认不含完整 MP4，播放器清楚降级到仓库内公开的 GIF/Poster。完整 Release 构建流程见 [发布政策](./release-policy.md)。

## 仅使用案例或 Skills

不需要 Electron 时，可以直接浏览 `catalog/` 或只安装 `skills/`。参见 [使用指南](./usage.md) 与 [Skill 安装](./skill-installation.md)。

---

**English summary:** Download either the Windows NSIS installer or the unsigned universal macOS DMG from GitHub Releases and verify it with `SHA256SUMS.txt`. All released-case MP4s remain distributable in the separate, hash-bound `prompt-library-media-v<version>.zip`; extract it into the app user-data `media` directory (or a supported sibling `media` directory) for full playback. The split only avoids GitHub's 2 GiB per-asset limit. Source media is never connected to model reference inputs automatically. Windows supports explicit-confirmation updates; the unsigned macOS preview updates manually from Releases.
