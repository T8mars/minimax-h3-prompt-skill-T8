# 贡献指南 / Contributing

感谢你帮助完善 MiniMax H3 与 Seedance 2.0 Creative DNA 案例库。本仓库只接受公共发行内容；请勿提交内部采集工程、未审核草稿或登录信息。

## 可贡献内容

- 具有明确可复用机制的创意短视频案例；
- 已发布案例的分析、提示词、来源或可访问性修正；
- GitHub GIF 预览或 Electron 视频播放问题修复；
- Electron 查看器、公共 Schema、安装文档和公开校验器改进；
- MiniMax H3 / Seedance 2.0 模型适配修正。

不接收技术教程、性能 Benchmark、模型对比、发布新闻、工作流帖子或纯 Prompt 工具演示作为案例。

## 提交案例

先阅读 [贡献案例](./docs/contributing-cases.md) 与 [来源引用](./docs/source-attribution.md)。最小案例目录为：

```text
catalog/cases/<case-id>/
├─ manifest.json
├─ SUMMARY.md
├─ creative-dna.json
├─ source.json
├─ preview.gif
└─ prompts/
   ├─ minimax-h3.md
   └─ seedance-2.0.md
```

案例必须是 `released`，并写入 `catalog/manifest.json`。Electron 使用的完整 MP4 由发行流程依据媒体清单打包；不要在 PR 描述里粘贴 Token、Cookie 或机器路径。

## 提交 Skill

每个 Skill 必须位于 `skills/<skill-name>/`，目录名只能使用小写字母、数字和连字符。`SKILL.md` frontmatter 只能包含：

```yaml
---
name: skill-name
description: 清楚说明用途以及何时触发该 Skill。
---
```

Skill 内不要添加单独的 README、CHANGELOG 或安装指南；面向用户的说明统一放在仓库 `docs/`。

## 本地验证

需要 Node.js 22 或更高版本：

```powershell
npm run validate
npm run gallery:write
npm run gallery:check
npm run app:test
```

如需构建 Windows 安装包：

```powershell
npm run app:install
npm run app:dist
```

## Pull Request 要求

- 一个 PR 只处理一个主题。
- 清楚列出新增/修改案例 ID、来源链接及模型适配范围。
- 不重写不相关案例，不提交生成目录。
- CI 必须全部通过。
- 对视觉或播放变化附截图；对 GIF 变化说明长度、尺寸和文件大小。
- 涉及安全问题时不要创建公开 Issue，请按 [安全政策](./SECURITY.md) 报告。

提交贡献即表示你有权按仓库适用许可提供所提交的原创代码与文本，并同意保留所引用作品的作者及来源信息。
