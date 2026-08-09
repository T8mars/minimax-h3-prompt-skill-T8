# Skill 安装与使用 / Installing Skills

## Skill 是什么

`skills/` 中的每个目录都是一个可安装的案例 Skill。它向 Agent 提供经过审核的 Creative DNA、适用范围、迁移步骤以及 MiniMax H3 / Seedance 2.0 提示词合同。

公开案例 Skill 与本项目内部的采集/审核 Skill 完全分离；安装公开 Skill 不会获得搜索、登录、下载或内部自动化能力。

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

Skill 只帮助组织提示词与创意机制，不会自动调用付费生成接口、上传素材或修改 ComfyUI 节点。

---

**English summary:** Copy a complete folder from `skills/` into your agent's configured Skills directory and reload the agent. Install the whole folder, not only `SKILL.md`. Public case Skills contain reusable Creative DNA and prompt guidance, not private collection or download automation.
