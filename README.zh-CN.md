[English](README.md) | 简体中文

# gstack

这个仓库是 [garrytan/gstack](https://github.com/garrytan/gstack) 的独立维护 fork，继续按相同的 MIT License 分发；它不是上游官方发布版本。

gstack 是一个面向 Claude Code 和 Codex 的结构化 AI 工程工作流技能包。它把规划、评审、QA、发布、文档和会话记忆拆成可重复执行的角色。

**适合谁用**
- 想要稳定工作流，而不是空白提示词的人
- 想在合并前获得独立 review 的工程师
- 想要本地优先记忆和可预测默认行为的人

## 快速开始

1. 安装 gstack
2. 对你想做的事情运行 `/office-hours`
3. 对方案运行 `/plan-ceo-review`
4. 对分支运行 `/review`
5. 对 staging 运行 `/qa`
6. 准备好后运行 `/ship`

## 安装 — 30 秒

**Requirements:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Git](https://git-scm.com/)、[Bun](https://bun.sh/) v1.0+、[Node.js](https://nodejs.org/)（仅 Windows）

### 第 1 步：安装到你的机器上

打开 Claude Code，粘贴下面这段：

> Install gstack: run **`git clone --single-branch --depth 1 <your-fork-url> ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`**

这一步就足够完成整机安装。gstack 在 setup 阶段不会改写项目文件。

### 第 2 步：加入你的仓库，让队友也能拿到（可选）

> Add gstack to this project: run **`cp -Rf ~/.claude/skills/gstack .claude/skills/gstack && rm -rf .claude/skills/gstack/.git && cd .claude/skills/gstack && ./setup`**

真正提交进仓库的是实际文件，不是 submodule，所以 `git clone` 下来就能直接工作。所有内容都放在 `.claude/` 里。
如果你需要项目级 routing，可以自己把规则写进 `CLAUDE.md`。这个 fork 不再自动写入或提交这个文件。

### 主要 host

Claude Code 是主用 host。Codex 是主要的次级 host，用于独立 review 和咨询。

```bash
git clone --single-branch --depth 1 <your-fork-url> ~/gstack
cd ~/gstack && ./setup --host codex
```

### OpenClaw

如果你在用 OpenClaw，先把 gstack 安装到 Claude Code，再让 OpenClaw 派生出来的 coding session 使用这些 skills。提示词模板、路由示例，以及 `gstack-lite` / `gstack-full` 的 OpenClaw prompts 见 [docs/OPENCLAW.md](docs/OPENCLAW.md)。

### 其他 AI agent

其他 host 也支持，但在这个 fork 里只作为次要能力保留。需要时显式用 `./setup --host <name>` 即可：

| Agent | Flag | Skills 安装位置 |
|-------|------|----------------|
| OpenAI Codex CLI | `--host codex` | `~/.codex/skills/gstack-*/` |
| OpenCode | `--host opencode` | `~/.config/opencode/skills/gstack-*/` |
| Cursor | `--host cursor` | `~/.cursor/skills/gstack-*/` |
| Factory Droid | `--host factory` | `~/.factory/skills/gstack-*/` |
| OpenClaw | `--host openclaw` | `~/.openclaw/skills/gstack/` |
| Slate | `--host slate` | `~/.slate/skills/gstack-*/` |
| Kiro | `--host kiro` | `~/.kiro/skills/gstack-*/` |

如果你要扩展 host 支持，可参考 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md)。

## 看它如何工作

```
You:    我想做一个给我的日历用的 daily briefing app。
You:    /office-hours
Claude: [先问清楚真实痛点]

You:    多个日历、事件过时、地点错误。

Claude: [重构问题、挑战 scope、写 design doc]

You:    /plan-ceo-review
You:    /plan-eng-review
You:    /review
You:    /qa https://staging.myapp.com
You:    /ship
```

## 一个 sprint 的流程

gstack 的流程很简单：

**Think → Plan → Review → Test → Ship → Learn**

| Skill | 专家角色 | 做什么 |
|-------|----------|--------|
| `/office-hours` | 产品 framing | 在写代码前先重构问题。 |
| `/plan-ceo-review` | 策略 review | 追问 scope、野心和产品形态。 |
| `/plan-eng-review` | 工程 review | 锁定架构、数据流、边界情况和测试。 |
| `/plan-design-review` | 设计 review | 检查层级、清晰度和视觉决策。 |
| `/review` | 代码 review | 找出能过 CI、但会在生产里出问题的内容。 |
| `/investigate` | 调试器 | 先做根因分析，再谈修复。 |
| `/qa` | QA 负责人 | 用真实浏览器测试并验证修复。 |
| `/ship` | 发布工程师 | 准备、验证并发布分支。 |
| `/codex` | 第二意见 | 来自 Codex 的独立 review 或咨询。 |
| `/document-release` | 技术文档 | 在发布后更新文档。 |
| `/learn` | 记忆 | 保存项目 learnings，供后续会话使用。 |

### 我该用哪种 review？

| 你在做什么 | 计划阶段 | 线上审计 |
|-----------|----------|----------|
| UI / 产品 / 设计 | `/plan-design-review` | `/review` 或 `/qa` |
| API / CLI / 架构 | `/plan-eng-review` | `/review` |
| 策略 / scope | `/plan-ceo-review` | `/codex` 作为第二意见 |

### 次要工具

这些工具都可用，但在这个 fork 里不作为默认重点：`/browse`、`/open-gstack-browser`、`/setup-browser-cookies`、`/setup-deploy`、`/land-and-deploy`、`/benchmark`、`/canary`、`/qa-only`、`/cso`、`/autoplan`、`/design-consultation`、`/design-shotgun`、`/design-html`、`/gstack-upgrade`。

## 并行 sprints

当一个 sprint 的角色边界清晰时，gstack 更容易并行运行多个分支，而不会把工作区变成噪音。

## 文档

| Doc | 内容 |
|-----|------|
| [Skill Deep Dives（中文）](docs/skills.zh-CN.md) / [English](docs/skills.md) | 每个 skill 的工作流和示例 |
| [Builder Ethos](ETHOS.md) | 设计原则和操作风格 |
| [Architecture](ARCHITECTURE.md) | 系统内部实现 |
| [Browser Reference](BROWSER.md) | `/browse` 命令参考 |
| [Contributing](CONTRIBUTING.md) | 开发和安装说明 |
| [Changelog](CHANGELOG.md) | 版本历史 |

## 隐私与遥测

gstack 保留本地 analytics，并支持 opt-in telemetry。不会发送代码、文件路径、仓库名或提示词。

- telemetry 默认关闭，除非在配置里显式开启。
- 本地 analytics 保留在机器上。
- 可以用 `gstack-config set telemetry ...` 修改行为。

## 故障排查

**Skill 没显示出来？** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` 失败？** `cd ~/.claude/skills/gstack && bun install && bun run build`

**安装过旧？** 运行 `/gstack-upgrade`，或者在 `~/.gstack/config.yaml` 里设置 `auto_upgrade: true`

**想要更短的命令？** `cd ~/.claude/skills/gstack && ./setup --no-prefix`

**想要带命名空间的命令？** `cd ~/.claude/skills/gstack && ./setup --prefix`

**Codex 提示 “Skipped loading skill(s) due to invalid SKILL.md”？** `cd ~/.codex/skills/gstack && git pull && ./setup --host codex`

**Windows 用户：** gstack 可以在 Windows 11 上通过 Git Bash 或 WSL 工作。除了 Bun 之外，还需要 Node.js。

**Claude 说它看不到这些 skills？** 重新运行 `./setup`，并确认安装目录存在于 `~/.claude/skills/gstack` 或 `.claude/skills/gstack`。

## 许可证

MIT。
