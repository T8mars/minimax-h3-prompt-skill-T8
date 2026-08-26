# API 增强工作台

T8 Prompt Library 的 API 工作台在同一窗口提供两项互不污染的能力：视频提示词实例化与增强，以及 MiniMax Music 3 歌词/结构化描述增强。它只生成文本，不生成视频或音频。

## 四个渠道

| 渠道 | Chat endpoint | 默认模型 | 注册入口 |
| --- | --- | --- | --- |
| 贞贞的平价小屋 | `https://api.seedance.nz/v1/chat/completions` | `bytedance/doubao-seed-evolving` | [注册平价小屋 API](https://api.seedance.nz/sign-up?aff=5f4w) |
| 贞贞的 AI 工坊 | `https://ai.t8star.org/v1/chat/completions` | `gemini-3.5-flash` | [注册 AI 工坊 API](https://ai.t8star.org/register?aff=dP7j) |
| OpenAI 兼容接口 | 用户确认的 HTTPS Base URL | 用户填写 | 由接口提供方提供 |
| 本地 GGUF | `local://qwen`（仅回环 llama-server） | 3 个已验收 Qwen3.8 型号，或用户自备的 llama.cpp 兼容 GGUF | 不提供下载；用户选择本机路径 |

两个贞贞渠道的注册按钮同时出现在工作台渠道区和当前渠道凭据区。OpenAI 兼容 Base URL 只允许干净的 HTTPS URL，拒绝账号密码、query、fragment 和回环地址。

### 本地 GGUF 渠道

本地渠道对齐 ComfyUI 节点提交 `a8164eafd6c89c7437e1a9255b8684fb569b226f`，同时支持视频提示词和 MiniMax Music 3。它不需要 API Key、不产生远端请求，也不会把模型、运行时或用户路径写入项目导出。工作台会递归扫描用户选择的 GGUF 根目录并读取轻量元数据，区分主模型与 mmproj。当前项目已完成固定文件大小、SHA-256 与真实兼容验收的模型为：

- `Qwen3.8-27B-Q4_K_M.gguf`；
- `qwen3.8-27b-uncensored-fp8-q4_k_m.gguf`；
- `Qwen3.8-9B-heretic-uncensored.i1-Q6_K.gguf`。

两个 27B 型号自动匹配 `mmproj-F16.gguf`。9B 纯文字增强与 Music 3 不需要投影器；图片/视频可自动匹配或手动选择用户另行放置的 `mmproj-Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-BF16.gguf`。视频另需同目录成对存在的 FFmpeg 与 FFprobe。运行时必须通过节点兼容版本 `llama.cpp b10436`（commit `6fed9f6ff`）检查。

其他被扫描到的文字 GGUF 可以选择并交给当前 llama-server 加载，但界面明确标记为“用户模型（未验收）”；完整校验只证明文件是未变化的 GGUF，并不冒充项目兼容验收。用户模型用于图片/视频时还必须存在匹配的 mmproj。AUTO 依据模型名称、参数规模、目录和文件名匹配，也可显式选择投影器。已验收文件继续严格核对固定大小与 SHA-256；文件或运行时发生变化后必须重新校验。

模型和 llama.cpp **不会打包进 Release、不会自动下载、不会复制进仓库**。用户只通过系统文件选择器指定绝对路径，路径仅保存在 Electron Main 的本机用户数据目录。运行时绑定随机 `127.0.0.1` 端口和随机临时令牌，关闭 Web UI，单路执行；默认任务结束即卸载，也可选择保持驻留或空闲 10 分钟后卸载。

## 两项能力

### 视频提示词

保留原有本地 Top-3 机制推荐、由当前 manifest 动态计算的 188 个去重模板选择、MiniMax H3 / Seedance 2.0 双目标、参考图片/视频、静态锚点验收和实验项目导出。视频链路的节点输入、provider 行为与 0 自动重试保持不变。

### MiniMax Music 3

右上能力切换可进入 Music 3。只要求音乐创意，歌词可为空，也可选择严格保留、定点润色或纯器乐；结构化描述默认中文。高级参数包括目标时长、创作幅度、结构、BPM、调式、拍号、描述词数、歌词编辑范围、语义画像、10 分钟内存续跑缓存和 seed。

Music 3 使用固定的官方 `music-caption-rewriter` 快照（core Skill SHA-256 `510f27d504bb06eb3859eb8a627773e655108e72df028d760be3ae98b3d4832c`，normalized tree SHA-256 `d836359b48a4bc3381f8d9eb370ff90dd82cb5ad9aa4e3ba0ed80da2c25b2553`）。完整模式先路由到最多 2 个流派索引，再选择最多 3 份模板；不会把全部 1,000 份模板塞进一次请求。

四项结果分别为：

1. `lyrics`：最终歌词或纯器乐标记；
2. `music_caption`：含 `Global Metadata`、`Vocal Details`、`Arrangement` 的 Music 3 结构化描述；
3. `music3_payload_json`：可直接使用的 `{ input, instructions }`；
4. `enhancement_report_json`：哈希、模板引用数量、阶段与验证状态，不含 Key、原始提示词或官方模板正文。

Music 3 v1 是纯文本能力，不显示或发送参考图片、视频、音频；也不调用 Music 3 生成歌曲。两项能力共用同一个“API 设置”，但运行计划、结果、项目列表和确认单分开。
## 使用流程

1. 点击主界面的“API 增强工作台”，在顶部选择“视频提示词”或“Music 3”。
2. 在右上角“API 设置”中选择默认渠道；远端渠道配置一次 Key，本地渠道选择模型目录与运行文件并完成一次完整校验。
3. 视频模式：写创作目标，运行本地 Top-3 推荐或手工选择模板，再选择 H3 / Seedance 2.0、输出语言、时长、改写强度及可选参考素材。
4. Music 3 模式：写音乐创意，选择歌词模式、语言、质量和描述语言；需要时展开高级参数。默认输出中文结构化描述。
5. 生成确认单，核对 endpoint host、model、逻辑请求范围、最坏物理尝试、阶段缓存，以及“远端付费”或“本地计算”的明确类型。
6. 勾选当次确认后才能提交。远端确认披露费用未知，本地确认披露会占用本机 CPU/GPU/RAM 且费用为 0；每个确认单只能消费一次，修改任意输入后确认立即失效。
7. 视频返回一份增强提示词；Music 3 返回四个独立标签页，并支持复制当前结果或复制全部。
8. 查看静态合同检查与人工复核提示；静态通过不等于已生成音频或已验证听感。
9. 完成结果可保存为对应能力的本机实验项目；Music 与视频项目列表分开。
10. 项目可导出 JSON + Markdown，不包含 Key、素材绝对路径、LLM 原始提示词或官方模板正文。

## 与 ComfyUI 节点一致的媒体协议

- 平价小屋：每个素材先上传到 `/v1/files/upload`，再把返回 URL 放入 Chat Completions；每个上传和一次对话都单独显示在确认单中。
- AI 工坊：图片内联为 `image_url`；完整视频也按已审计节点行为内联为 `image_url`，防止该网关忽略视频视觉事实。
- OpenAI 兼容：图片内联为 `image_url`，视频内联为 `video_url`。
- 每个请求都带节点合同使用的 `<Picture N>` / `<Video N>` 说明。素材发送前会重新计算 SHA-256；文件在选择后发生变化会中止请求。
- 本地 GGUF：图片在 Main 内解码，最长边收至 1024 后转 JPEG；视频以 FFprobe 读取时长，并由单线程 FFmpeg 逐帧抽取最多 16 个有序 JPEG 样本。允许少量损坏帧，只要至少取得一帧；界面和提示词不会冒充完整视频、音频或转写已被读取。

## 取消、超时和费用

- 只有请求尚未提交时才能确认安全取消。
- 一旦运行中请求取消或读取超时，界面会明确显示“远端完成与计费状态未知”；不会自动重发。
- usage、request ID 或费用未返回时保持未知，不猜测金额。
- 视频模式保持 0 自动 retry。
- Music 3 仅在平价小屋返回可确定的网关失败时执行有界重试：普通阶段最多 3 次物理尝试，官方模板选择阶段最多 6 次；AI 工坊和 OpenAI 兼容不继承该策略。网络中断、读取超时等结果不确定错误一律不重试。
- 人工重试必须重新预检、重新确认并创建新 run。
- 本地运行可真正中止且不会产生 API 账单；同一时间只允许一个本地会话。Music 3 的多阶段在同一会话中复用一次模型加载。

## 测试口径

普通自动化测试不会调用真实付费接口。它使用本地 mock 严格验证四渠道 endpoint、模型、消息结构、媒体字段、上传顺序、Music 3 渐进读取与四项输出、错误脱敏、一次性消费、阶段缓存，以及视频 0 retry / Music 3 有界确定失败 retry。

真实 AI 工坊 smoke 必须由操作者在本机安全设置环境变量，不能把 Key 放进命令行、脚本或 Git：

```powershell
$env:T8STAR_API_KEY = Read-Host "AI Workshop API Key"
npm run test:providers:live --prefix apps/prompt-library-desktop -- --provider=t8star_workshop --confirm-paid
Remove-Item Env:T8STAR_API_KEY
```

平价小屋使用 `SEEDANCE_API_KEY`，OpenAI 兼容使用 `OPENAI_API_KEY`，并需另行提供 Base URL 与模型。每次 live smoke 都会产生一次真实提示词增强请求，必须显式加入 `--confirm-paid`。

远端三渠道不调用 FFmpeg，也不解码或转码用户选择的参考媒体。本地 GGUF 只有在视频提示词明确带入视频时才启动用户指定的 FFmpeg，并固定为单文件、单帧、单解码线程顺序采样；不做全速遍历和转码。Music 3 纯文本模式完全不接收媒体。

输出语言是调用计划的一部分，会进入确认单、计划哈希、结果验证和实验项目；修改语言后必须重新生成确认单，避免旧计划继续按另一种语言执行。
