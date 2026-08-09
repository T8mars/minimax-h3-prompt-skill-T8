# 来源与引用 / Sources and Attribution

## 每个案例必须保存什么

`source.json` 应保存：

- 平台；
- 原作者或发布账号；
- 原始帖子 canonical URL；
- 帖子/视频标识；
- 模型归属及证据状态；
- GIF、Poster 和 Release MP4 的映射；
- 最后验证来源可访问的时间。

不要把同作者其他帖子中的提示词错误绑定到当前视频。原帖、同一线程和外部编译的提示词要分开记录。

## 用户直接提供的非官方 Skill

用户直接提供视频或提示词、但没有提供外部原帖时，非官方 Skill 必须保存输入媒体/文本 SHA-256、解码状态、时长、来源说明和 `source_url: null`。界面必须显示“非官方 · 用户贡献”并隐藏来源按钮；不得为了卡片完整而猜测作者、平台或 URL。若后续获得可核验原帖，可在下一版本补充，不回写虚构历史。

## GitHub 展示方式

案例页使用可点击 GIF：

```markdown
[![案例预览](./preview.gif)](https://x.com/creator/status/1234567890)

来源：[作者 @creator 的原始帖子](https://x.com/creator/status/1234567890)
```

首页画廊通过 `npm run gallery:write` 从 catalog 生成同样的引用关系。不要把 GIF 链接到无关首页、搜索页或二次搬运页面。

## Electron 展示方式

Electron 优先播放安装包内的完整 MP4，并在标题附近显示平台、作者和“查看原帖”。本地播放与来源引用是并列信息：本地视频提供稳定、统一的观看体验，原帖提供作者、上下文和互动数据。

来源被删除、转为私密或暂时不可用时：

- 保留已发布的分析和提示词；
- 将来源状态标为不可用及最后检查时间；
- 不把其他相似视频冒充为原来源；
- Electron 显示明确状态，而不是空白播放器。

## 引用不是模型归属证明

帖子含有“MiniMax H3”或“Seedance 2.0”文字，不一定能证明视频由该模型生成。模型归属应单独保存为明确声明、强证据、推断或未知；未知值不得为了展示完整而补写。

## 内容许可

本仓库原创摘要、Creative DNA 与提示词模板采用 [CC BY 4.0](../LICENSE-CONTENT)。引用视频和其中的第三方元素保留原作者与原帖标注。本仓库不会把第三方作品重新声明为 T8 原创。

## MiniMax 官方仓库 Skill 索引

`catalog/official-skills/manifest.json` 保存 MiniMax 官方仓库 9 个 Skill 的固定 commit、目录 SHA、`SKILL.md` SHA-256、上游版本和 `meta.yaml` 来源分类。它不包含上游 Skill 正文；为支持离线直观浏览，本仓库同时保存 9 个固定来源的轻量预览 GIF，并记录上游地址、源文件 SHA-256 与本地 GIF SHA-256。8 个风格条目使用上游同名 GIF，通用写作条目由上游 `t2va.mp4` 转换为 GIF。

“官方仓库收录”与“官方原创”不是同一概念：本库分别显示 `official`、`official-featured`、`community` 和无 `meta.yaml` 时的 `repository-owned`。上游内容的许可见索引中的 `license_reference`；本库 9 个 Seedance 2.0 伴侣为独立编写并按本仓库内容许可发布。

---

**English summary:** Every case keeps a canonical source-post URL, creator, platform, model-attribution status, and media mapping. GitHub GIFs are clickable source references; Electron pairs local full-video playback with a visible “View original post” action.
