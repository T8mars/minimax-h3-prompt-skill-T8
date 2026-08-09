# 安装指南 / Installation

## Electron 桌面版（推荐）

### 系统要求

- Windows 10/11 x64；
- 安装时可访问 GitHub Releases；
- 预留足够空间保存完整 MP4 案例媒体。

### 安装步骤

1. 打开仓库的 [Releases](https://github.com/T8mars/minimax-h3-prompt-skill-T8/releases)。
2. 选择最新稳定版本，下载 `T8-Prompt-Library-Setup-v<version>.exe`。
3. 可选：使用同一 Release 的 `SHA256SUMS.txt` 核对文件哈希。
4. 运行安装程序并启动 **T8 Prompt Library**。
5. 应用首次启动后检查目录版本；之后可通过“检查更新”获取稳定版更新。

Windows 校验示例：

```powershell
Get-FileHash .\T8-Prompt-Library-Setup-v1.0.2.exe -Algorithm SHA256
```

将结果与 `SHA256SUMS.txt` 中对应文件比较。

### 完整视频如何进入应用

Git 仓库只保存轻量 GIF/Poster。完整 MP4 位于对应 GitHub Release 的 `prompt-library-media-v<version>.zip`，并在正式构建时作为 Electron `extraResources` 打入完整安装包。因此：

- 安装完成后可直接播放完整视频和声音；
- 不需要登录 X、Reddit 或 YouTube 才能查看本地视频；
- 有原始帖子地址的案例保留来源按钮；用户提供但未附外部地址的非官方 Skill 不会伪造链接；
- 普通源代码 CI 只验证无完整媒体构建，不会假装包含 MP4。

### 自动更新

应用只从 `T8mars/minimax-h3-prompt-skill-T8` 的 GitHub Releases 检查稳定版。发现更新后会下载，下载完成时界面显示“重启安装”。只有用户点击该操作后，应用才退出并安装更新；普通关闭应用不会自动安装已经下载的版本。更新不会读取浏览器 Cookie 或第三方平台登录状态。

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

**English summary:** Download the latest Windows installer from GitHub Releases and verify it with `SHA256SUMS.txt`. Full releases bundle the versioned MP4 media pack; source builds fall back to GIF/Poster. Updates download from this repository, but install only after the user chooses “Restart to install”; a normal quit does not auto-install.
