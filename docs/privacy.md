# 隐私说明 / Privacy

## 默认行为

T8 Prompt Library 是本地只读案例查看器。应用默认：

- 不要求创建账号；
- 不收集遥测、广告标识或行为分析；
- 不读取浏览器 Cookie、登录状态或历史记录；
- 不扫描用户其他文件夹；
- 不上传用户复制、编辑或搜索的提示词；
- 不调用付费视频生成或提示词增强 API。

## 网络请求

应用只在以下用户可理解的场景访问网络：

- Windows 检查本仓库 GitHub Releases 的应用更新；macOS 预览版点击更新按钮时打开 Releases 页面；
- 用户点击“查看原帖”后，由系统默认浏览器打开来源 URL。

原平台可能按照自己的隐私政策处理访问。仅在点击外链后，用户才离开本地应用。

## 本地数据

v1.1.1 在本地 `localStorage` 保存显示语言，以及用户主动创建的收藏、合集与最近 100 条浏览历史。个人资料库只记录公开条目的稳定 ID、合集名称和时间戳；不复制提示词正文、来源页面内容、账号或媒体文件，不上传、不同步，也不进入 Git 仓库。搜索词和筛选条件仍不持久保存。删除合集不会删除公共内容；清空应用站点数据会恢复默认语言并移除全部个人资料库数据。

完整案例视频随安装包写入应用资源目录。Windows 更新程序可能按照 Electron updater 的标准行为在系统应用数据区域暂存已下载的安装包；未签名 macOS 预览版不自动下载或安装更新。

本地媒体包只包含已发布案例视频及映射，不包含平台 Cookie、Token 或内部采集记录。

## 日志与问题报告

应用日志应限制为版本、错误类型和非敏感组件状态。提交 Issue 前请检查并移除用户名、本地路径、提示词私有内容及任何凭据。安全敏感日志请通过 [安全政策](../SECURITY.md) 的私密渠道报告。

隐私行为发生变化时，本文件与 Release Notes 必须在发布前更新。

---

**English summary:** The desktop viewer is local-first, account-free, and telemetry-free. It never reads browser sessions, uploads prompts, or calls paid generation APIs. Local storage holds the selected locale plus user-created favorites, collection names/memberships, and up to 100 recent item views; none of this is synced. Network access is limited to GitHub releases and user-initiated source links.
