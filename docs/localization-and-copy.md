# 双语与复制合同 / Localization and Copy Contract

Electron 查看器的解释性内容支持 `en` 与 `zh-CN`，首次启动默认显示中文；用户主动选择的语言会保存在本机，后续启动继续沿用。两种语言都是构建期静态内容，不调用网络翻译，不在运行时改写。

## 双语内容边界

- 可翻译：标题、摘要、推荐输入、使用步骤、适用范围、Creative DNA 的自然语言规则、作用、删减后果、实例与修复建议。
- 必须保持：案例 ID、Template ID、Skill ID、`inv-*` / `beat-*` / `obs-*`、snake_case 插槽名、标签、URL、哈希、命令、模型名、枚举和时间数值。
- MiniMax H3 / Seedance 2.0 的可执行提示词不进入本地化文件。语言切换不改变提示词内容或哈希。
- 官方仓库条目只本地化公开元数据与独立伴侣说明；不嵌入 MiniMax 上游 Skill 正文。
- 官方 H3 页签展示的是安装入口而非可执行提示词，因此提供中英文安装说明；固定安装命令、上游 URL、Commit 和 SHA-256 在两种语言中保持完全一致。

每个本地化文件记录 canonical manifest / Creative DNA / companion summary 的 SHA-256。源内容修改但本地化内容未重新审核时，加载器报告 stale binding，发布验证直接失败。案例的英文 Creative DNA 保持 canonical 原文；若源文本本身需要修订，应先修 canonical，再重新绑定中英文侧车。标题、摘要和快速开始等展示元数据可以做母语级编辑。

结构、哈希、稳定 token 与术语检查只能证明文件没有漂移，不能证明翻译语义正确。每个资源必须完成可追溯的逐字段人工编辑审校；`review` 元数据只是审校记录，不能自我证明质量，也不能替代独立抽查。

## 复制合同

- “复制当前提示词”必须复制 loader 提取的 canonical prompt 字符串，不能从 DOM、Markdown 展示或本地化内容重建。
- 每个复制按钮在成功后必须显示明显的 `✓ 已复制` / `✓ Copied` 状态，短暂反馈后恢复原文；反馈期间按钮仍可再次点击，每次成功都重新计时。失败时按钮与全局状态提示都必须给出可见反馈。
- 分区复制以当前显示语言输出结构化 Markdown。
- “复制完整案例”包含：当前语言的概览、快速开始、Creative DNA、验证与交接信息、来源链接，以及两份以 native language 标注的 canonical prompts；官方 H3 条目则明确标成 localized access metadata。
- 完整复制不包含绝对路径、媒体二进制、隐藏语言、调试字段、rights 内部记录或上游官方 Skill 正文。
- 剪贴板 IPC 上限为 100,000 字符；验证器和 E2E 必须证明完整案例不会被静默截断。

## 发布门禁

运行：

```powershell
npm run validate:localizations
npm run app:test
npm run app:validate
```

验证覆盖所有实时目录项，而不是固定案例数量：双语齐全、结构对齐、稳定 token 与事实数值不变、源哈希未过期、提示词不出现在本地化文件中，并拦截已知的中英文机器翻译残留。机器校验通过后仍必须完成人工语义审校。Electron E2E 还需证明切换语言不重建视频、不改变播放时间、筛选条件或模型标签页，并验证分区复制与整案复制。
