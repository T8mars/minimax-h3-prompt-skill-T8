# 隐私说明 / Privacy

## 默认行为

T8 Prompt Library 是本地只读案例查看器。应用默认：

- 不要求创建账号；
- 不收集遥测、广告标识或行为分析；
- 不读取浏览器 Cookie、登录状态或历史记录；
- 不扫描用户其他文件夹；
- 不上传用户复制、编辑或搜索的提示词；
- 不自动调用付费视频生成 API；提示词增强 API 只在用户完成渠道配置、查看确认单并对当次请求明确确认后调用。

## 网络请求

应用只在以下用户可理解的场景访问网络：

- Windows 安装版检查本仓库 GitHub Releases 的应用更新；Windows 便携版与 macOS 预览版点击更新按钮时打开 Releases 页面；
- 用户点击“查看原帖”后，由系统默认浏览器打开来源 URL；
- 用户在 API 工作台逐次确认后，主进程才向所选平价小屋、AI 工坊或 OpenAI 兼容 HTTPS 端点发送增强请求；只有用户显式选择的参考素材会随该次请求发送。

原平台可能按照自己的隐私政策处理访问。仅在点击外链后，用户才离开本地应用。

## 本地数据

v1.4.2 在本地 `localStorage` 保存显示语言、用户明确选择的目录排序，以及用户主动创建的收藏、合集与最近 100 条浏览历史。API Workbench 的默认渠道与非秘密设置保存在本机；用户选择长期保存的 Key 仅通过 Electron `safeStorage` 加密保存，不进入渲染进程、命令行、日志、项目导出或案例目录。桌面端还会在 Main 进程的本机用户数据目录保存文件选择器最近使用的文件夹路径，仅用于下次打开同类选择器，不保存所选文件内容，也不上传或同步。个人资料库只记录公开条目的稳定 ID、合集名称和时间戳；不复制提示词正文、来源页面内容、账号或媒体文件，不上传、不同步，也不进入 Git 仓库。搜索词和筛选条件仍不持久保存。删除合集不会删除公共内容；清空应用站点数据会恢复默认语言、默认排序并移除全部个人资料库数据。

安装版把上述数据写入操作系统应用数据目录。Windows 便携版把 `userData` 与 `sessionData` 都固定到便携 EXE 旁的 `T8-Prompt-Library-Data`，不会读取或覆盖安装版数据；复制到另一台电脑或另一 Windows 用户时，受 `safeStorage` 保护的旧 Key 可能无法解密，需要重新输入。Windows 安装版更新程序可能按照 Electron updater 的标准行为在系统应用数据区域暂存已下载的安装包；便携版与未签名 macOS 预览版不自动下载或安装更新。

完整案例视频不重复内置在安装包或便携 EXE 中，而是通过同一 Release 的两个可分发、哈希绑定媒体分卷还原到受支持的本地 `media` 目录。动态 GIF 与 Poster 随应用目录提供。

本地媒体包只包含已发布案例视频及映射，不包含平台 Cookie、Token 或内部采集记录。

## 日志与问题报告

应用日志应限制为版本、错误类型和非敏感组件状态。提交 Issue 前请检查并移除用户名、本地路径、提示词私有内容及任何凭据。安全敏感日志请通过 [安全政策](../SECURITY.md) 的私密渠道报告。

隐私行为发生变化时，本文件与 Release Notes 必须在发布前更新。

---

**English summary:** The desktop viewer is local-first, account-free, and telemetry-free. It never reads browser sessions or calls paid video-generation APIs. Prompt-enhancement requests occur only after the user configures a provider, reviews the plan, and explicitly confirms that run; only explicitly selected reference media is sent. Installed builds use the OS application-data directory; the Windows portable build keeps both user and session data in an adjacent `T8-Prompt-Library-Data` directory. Persisted API keys use Electron `safeStorage` and may need to be re-entered after moving the portable data to another Windows account or machine. None of this data is synced.
