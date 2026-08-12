# API 增强工作台

T8 Prompt Library 的 API 工作台把“找模板、实例化、调用提示词增强、静态验收、保存复盘”放在一个本地流程中。它只增强提示词，不生成视频。

## 三个渠道

| 渠道 | Chat endpoint | 默认模型 | 注册入口 |
| --- | --- | --- | --- |
| 贞贞的平价小屋 | `https://api.seedance.nz/v1/chat/completions` | `bytedance/doubao-seed-evolving` | [注册平价小屋 API](https://api.seedance.nz/sign-up?aff=5f4w) |
| 贞贞的 AI 工坊 | `https://ai.t8star.org/v1/chat/completions` | `gemini-3.5-flash` | [注册 AI 工坊 API](https://ai.t8star.org/register?aff=dP7j) |
| OpenAI 兼容接口 | 用户确认的 HTTPS Base URL | 用户填写 | 由接口提供方提供 |

两个贞贞渠道的注册按钮同时出现在工作台渠道区和当前渠道凭据区。OpenAI 兼容 Base URL 只允许干净的 HTTPS URL，拒绝账号密码、query、fragment 和回环地址。

## 使用流程

1. 点击主界面的“API 增强工作台”。
2. 写下创作目标，运行本地 Top-3 机制推荐，或手工选择模板。
3. 在右上角“API 设置”中选择默认渠道并配置一次 Key；之后会长期复用该设置。
4. 在“生成参数”中选择 H3 / Seedance 2.0、输出语言、目标时长和改写强度。输出语言默认中文，也可切换为 English；中文 H3 保留官方英文结构标签和机器可读语法，描述正文使用中文。
5. 可显式添加本地参考图片或视频。图片最多 9 张、视频最多 3 个，单个不超过 50 MiB。
6. 生成确认单，核对 endpoint host、model、模板、锚点、素材数和额外上传数。
7. 勾选当次付费确认后才能提交。每个确认单只能消费一次；应用不自动重试，也不在渠道之间静默切换。
8. 查看完整返回、静态机制检查和锚点覆盖；结果可以复制或保存为实验项目。
9. 实验项目可导出相对路径安全的 JSON + Markdown，不包含 Key 或素材绝对路径。

## 与 ComfyUI 节点一致的媒体协议

- 平价小屋：每个素材先上传到 `/v1/files/upload`，再把返回 URL 放入 Chat Completions；每个上传和一次对话都单独显示在确认单中。
- AI 工坊：图片内联为 `image_url`；完整视频也按已审计节点行为内联为 `image_url`，防止该网关忽略视频视觉事实。
- OpenAI 兼容：图片内联为 `image_url`，视频内联为 `video_url`。
- 每个请求都带节点合同使用的 `<Picture N>` / `<Video N>` 说明。素材发送前会重新计算 SHA-256；文件在选择后发生变化会中止请求。

## 取消、超时和费用

- 只有请求尚未提交时才能确认安全取消。
- 一旦运行中请求取消或读取超时，界面会明确显示“远端完成与计费状态未知”；不会自动重发。
- usage、request ID 或费用未返回时保持未知，不猜测金额。
- 当前没有第二层自动 retry；人工重试必须重新预检、重新确认并创建新 run。

## 测试口径

普通自动化测试不会调用真实付费接口。它使用本地 mock 严格验证三渠道 endpoint、模型、消息结构、媒体字段、上传顺序、完整响应、错误脱敏、一次性消费和 0 自动重试。

真实 AI 工坊 smoke 必须由操作者在本机安全设置环境变量，不能把 Key 放进命令行、脚本或 Git：

```powershell
$env:T8STAR_API_KEY = Read-Host "AI Workshop API Key"
npm run test:providers:live --prefix apps/prompt-library-desktop -- --provider=t8star_workshop --confirm-paid
Remove-Item Env:T8STAR_API_KEY
```

平价小屋使用 `SEEDANCE_API_KEY`，OpenAI 兼容使用 `OPENAI_API_KEY`，并需另行提供 Base URL 与模型。每次 live smoke 都会产生一次真实提示词增强请求，必须显式加入 `--confirm-paid`。

当前实现不调用 FFmpeg，也不解码或转码用户选择的参考媒体；只做文件 magic、大小和 SHA-256 校验，因此不会启动高负载视频任务。

输出语言是调用计划的一部分，会进入确认单、计划哈希、结果验证和实验项目；修改语言后必须重新生成确认单，避免旧计划继续按另一种语言执行。
