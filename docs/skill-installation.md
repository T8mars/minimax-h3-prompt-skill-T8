# Skill 安装与使用 / Installing Skills

## Skill 是什么

`skills/` 中共有三类可安装产物：43 个独立案例机制 Skill（49 个案例中有 6 个证据变体复用既有稳定模板）、为 MiniMax 官方仓库 9 个 H3 Skills 独立编写的 9 个 Seedance 2.0 伴侣 Skills，以及 2 个明确标注“非官方 · 用户贡献”的高质量双模型 Skills。v1.1.1 共 54 个可安装目录。每个目录都有 `SKILL.md`、`references/summary.md`、`references/template.md` 和 Agent 元数据。

公开案例 Skill 与本项目内部的采集/审核 Skill 完全分离；安装公开 Skill 不会获得搜索、登录、下载或内部自动化能力。

## 安装 MiniMax 官方 H3 Skill

官方 H3 Skill 正文不复制到本仓库。按 `catalog/official-skills/manifest.json` 中对应条目的固定链接核对后，从上游安装，例如：

```powershell
npx skills add https://github.com/MiniMax-AI/MiniMax-H3 --skill h3-prompt-writing
```

其余 8 个条目只需替换 `--skill` 后的名称。Electron 的“MiniMax 官方仓库 Skills”视图可直接复制每项安装命令。

## 安装 Seedance 2.0 伴侣 Skill

Seedance 伴侣位于本仓库 `skills/`，例如：

```powershell
Copy-Item -Recurse .\skills\direct-seedance-brand-promo "$env:CODEX_HOME\skills\direct-seedance-brand-promo"
```

这些伴侣是 T8 独立编写的 Seedance 原生工作流，不是对上游 H3 Skill 正文的复制或改写。

## 安装非官方用户贡献 Skill

非官方条目位于同一个 `skills/` 目录，但在 Electron 和 catalog 中单独分区。例如：

```powershell
Copy-Item -Recurse .\skills\direct-street-interview-video "$env:CODEX_HOME\skills\direct-street-interview-video"
```

该 Skill 同时输出 MiniMax H3 与 Seedance 2.0 模板。它不会冒充官方预设，也不会自动修改 ComfyUI 节点。

## 安装单个 Skill

1. 克隆或下载本仓库。
2. 找到 `skills/<skill-name>/`。
3. 将整个目录复制到你的 Agent 的 Skills 目录。
4. 重新加载 Agent，并用自然语言请求使用该机制。

Codex 的常见安装方式：

```powershell
Copy-Item -Recurse .\skills\<skill-name> "$env:CODEX_HOME\skills\<skill-name>"
```

如果 `CODEX_HOME` 未设置，请使用产品设置中显示的 Skills 目录。不要只复制 `SKILL.md`；Skill 的 `references/` 或 `assets/` 也可能是必要内容。

## 从 Release 安装 Skills 包

每个稳定 Release 都提供 `prompt-library-skills-v<version>.zip`：

1. 下载并解压；
2. 选择需要的 Skill 目录；
3. 复制到 Agent 的 Skills 目录；
4. 重新加载 Agent。

## 调用示例

```text
使用 <skill-name> 的 Creative DNA，把主体改成我的产品，输出一份 MiniMax H3 提示词。
```

```text
用同一个案例机制为 Seedance 2.0 做一个完全不同场景的 15 秒版本，保留节拍和运镜逻辑。
```

## 更新和卸载

- 更新：用新版本的同名目录整体替换旧目录，再重新加载 Agent。
- 卸载：删除对应 Skill 目录并重新加载 Agent。
- 冲突：不要同时安装两个不同版本的同名 Skill。

Skill 只帮助组织提示词与创意机制，不会自动调用付费生成接口、上传素材或修改 ComfyUI 节点。官方仓库 9 项及其 Seedance 伴侣都不进入 ComfyUI 导入流程；目标节点已经包含官方能力。

---

**English summary:** Copy a complete folder from `skills/` into your agent's configured Skills directory and reload the agent. Install the whole folder, not only `SKILL.md`. Public case Skills contain reusable Creative DNA and prompt guidance, not private collection or download automation.
