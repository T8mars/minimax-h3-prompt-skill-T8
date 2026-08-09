# 公共发行边界 / Public Release Boundary

## 原则

本仓库只保存用户可以安装、浏览和复用的发布产物。搜索、采集、下载、审核和内部适配在独立私有工作区完成，然后通过字段白名单产生脱敏公共案例。禁止把私有目录直接复制到这里。

## 允许进入

- 状态为 `released` 的脱敏案例；
- 原创摘要、Creative DNA、双模型提示词与案例 Skill；
- MiniMax 官方仓库 Skill 的固定版本元数据/链接，以及独立编写的 Seedance 2.0 伴侣 Skills；
- 明确标注为非官方/用户贡献、带哈希证据和双模型模板的公开 Skill；
- GIF/Poster、来源 URL 与版本化媒体映射；
- Electron 公共应用代码和无媒体 fixture；
- 公共 Schema、公开边界校验器和用户文档；
- GitHub Actions 构建、测试和发布配置。

## 永不进入

- 任何内部路线图；
- 仓库根目录或工具项目级的 Skill 指令文件；
- Codex 搜索、采集、浏览器登录、下载、排序、审核、编译或每日自动化脚本；
- ComfyUI 节点、提示词增强器代码、内部融合脚本和 Agent 交接资料；
- 草稿、待审、拒绝或 release-blocked 案例；
- Cookie、Token、API Key、环境文件、私钥、浏览器状态或 HAR；
- 用户名、盘符、主目录、临时目录等本地绝对路径；
- 私有审核记录、内部指标快照和本地机器标识。
- MiniMax 上游 Skill 正文或其他受上游许可约束的代码副本。

公开案例 Skill 的 `skills/<name>/SKILL.md` 是安装产物，属于允许内容；除此位置之外的 `SKILL.md` 一律拒绝。

## 自动检查

`scripts/public/validate-public-boundary.mjs` 执行：

- 顶层路径白名单；
- 已知内部目录和文件名拒绝；
- Skill 文件位置限制；
- 草稿路径拒绝；
- 高置信密钥和私钥模式扫描；
- Windows、macOS、Linux 本地绝对路径扫描；
- 符号链接与危险本地状态文件检查。

`validate-catalog.mjs` 进一步要求公开案例状态为 `released`；`validate-official-skills.mjs` 固定检查 9 个上游入口、哈希、来源分类、Seedance 伴侣和 `comfyui_import=false`；`validate-community-skills.mjs` 检查非官方标签、输入哈希、解码门、GIF/Poster、双模型模板和未修改 ComfyUI 的边界；`validate-skills.mjs` 检查 Skill 名称、frontmatter、摘要、模板及 Agent 元数据。

这些检查是最后防线，不替代人工审核。公开导出应始终从字段白名单重新生成，不应通过删除少数字段来“清洗”整份私有记录。

## 完整视频边界

完整 MP4 位于本地忽略目录 `.release-input/media/`，由公开的打包脚本生成版本化 ZIP，再上传到 GitHub Draft Release。它不会进入 Git 历史。正式 Windows 安装包仅在校验媒体包哈希后才把 MP4 作为 `extraResources` 打入。

普通 CI 没有完整 MP4，只证明应用能够使用公开 fixture 构建；只有 Release 工作流的媒体校验与安装包烟雾测试才能证明“完整视频发行包”成立。

---

**English summary:** This repository is a public distribution layer. It accepts only released, allowlisted, sanitized cases and public app code. Private collection, browser, download, review, automation, ComfyUI, credentials, local paths, drafts, and internal instructions are forbidden and checked in CI.
