[English](CONTRIBUTING.md) | [简体中文](CONTRIBUTING.zh-CN.md)

# 为 gstack 做贡献

感谢你想让 gstack 变得更好。无论你是修复 skill prompt 中的一个拼写错误，还是构建一个全新的工作流，本指南都能帮你快速上手。

## 快速开始

gstack 的 skill 是 Claude Code 从 `skills/` 目录发现的 Markdown 文件。通常它们位于 `~/.claude/skills/gstack/`（你的全局安装位置）。但当你在开发 gstack 本身时，你希望 Claude Code 使用*工作目录中*的 skill——这样编辑后无需复制或部署即可立即生效。

这就是 dev mode 的作用。它将你的仓库 symlink 到本地 `.claude/skills/` 目录，这样 Claude Code 直接从你的 checkout 中读取 skill。

```bash
git clone <repo> && cd gstack
bun install                    # 安装依赖
bin/dev-setup                  # 激活 dev mode
```

现在编辑任何 `SKILL.md`，在 Claude Code 中调用它（例如 `/review`），即可看到你的更改生效。开发完成后：

```bash
bin/dev-teardown               # 停用——恢复到全局安装
```

## 运营自我改进

gstack 会自动从失败中学习。在每次 skill 会话结束时，agent 会反思哪些地方出了问题（CLI 错误、错误的方法、项目特殊之处），并将运营经验记录到 `~/.gstack/projects/{slug}/learnings.jsonl`。未来的会话会自动展示这些学习记录，这样 gstack 在你的代码库上会越来越聪明。

无需任何设置。学习记录会自动记录。使用 `/learn` 查看。

### 贡献者工作流

1. **正常使用 gstack** ——运行时学习记录会自动捕获
2. **检查你的学习记录：**`/learn` 或 `ls ~/.gstack/projects/*/learnings.jsonl`
3. **Fork 并 clone gstack**（如果你还没有的话）
4. **将你的 fork symlink 到你遇到 bug 的项目中：**
   ```bash
   # 在你的核心项目中（gstack 让你不爽的那个项目）
   ln -sfn /path/to/your/gstack-fork .claude/skills/gstack
   cd .claude/skills/gstack && bun install && bun run build && ./setup
   ```
   Setup 会在每个 skill 目录内创建带有 SKILL.md symlink 的目录（`qa/SKILL.md -> gstack/qa/SKILL.md`），并询问你的前缀偏好。传入 `--no-prefix` 可跳过提示并使用短名称。
5. **修复问题** ——你的更改会立即在此项目中生效
6. **通过实际使用 gstack 来测试** ——重现让你不爽的操作，验证问题已修复
7. **从你的 fork 提交 PR**

这是最好的贡献方式：在你实际工作的项目中，一边做真正的工作一边修复 gstack。

### 会话感知

当你同时打开 3 个以上的 gstack 会话时，每个问题都会告诉你这是哪个项目、哪个分支、正在做什么。再也不用盯着一个问题想"等等，这是哪个窗口？"所有 skill 的格式保持一致。

## 在 gstack 仓库中开发 gstack

当你编辑 gstack skill 并想通过在同一仓库中实际使用 gstack 来测试时，`bin/dev-setup` 会帮你搞定。它在 `.claude/skills/` 中创建 symlink（已 gitignore），指向你的工作目录，这样 Claude Code 使用你的本地编辑而不是全局安装。

```
gstack/                          <- 你的工作目录
├── .claude/skills/              <- 由 dev-setup 创建（已 gitignore）
│   ├── gstack -> ../../         <- 指回仓库根目录的 symlink
│   ├── review/                  <- 真实目录（短名称，默认）
│   │   └── SKILL.md -> gstack/review/SKILL.md
│   ├── ship/                    <- 或 gstack-review/、gstack-ship/（如果使用 --prefix）
│   │   └── SKILL.md -> gstack/ship/SKILL.md
│   └── ...                      <- 每个 skill 一个目录
├── review/
│   └── SKILL.md                 <- 编辑这个，用 /review 测试
├── ship/
│   └── SKILL.md
├── browse/
│   ├── src/                     <- TypeScript 源码
│   └── dist/                    <- 编译后的二进制文件（已 gitignore）
└── ...
```

Setup 在顶层创建真实目录（不是 symlink），目录内包含 SKILL.md symlink。这确保 Claude 将它们发现为顶层 skill，而不是嵌套在 `gstack/` 下。名称取决于你的前缀设置（`~/.gstack/config.yaml`）。短名称（`/review`、`/ship`）是默认值。运行 `./setup --prefix` 可使用命名空间名称（`/gstack-review`、`/gstack-ship`）。

## 日常工作流

```bash
# 1. 进入 dev mode
bin/dev-setup

# 2. 编辑 skill
vim review/SKILL.md

# 3. 在 Claude Code 中测试——更改立即生效
#    > /review

# 4. 编辑了 browse 源码？重新构建二进制文件
bun run build

# 5. 今天完成了？拆除环境
bin/dev-teardown
```

## 测试与评估

### 设置

```bash
# 1. 复制 .env.example 并添加你的 API key
cp .env.example .env
# 编辑 .env → 设置 ANTHROPIC_API_KEY=sk-ant-...

# 2. 安装依赖（如果你还没有的话）
bun install
```

Bun 会自动加载 `.env`——无需额外配置。Conductor workspace 会自动从主 worktree 继承 `.env`（参见下方"Conductor workspace"）。

### 测试层级

| 层级 | 命令 | 费用 | 测试内容 |
|------|------|------|----------|
| 1 — 静态 | `bun test` | 免费 | 命令验证、snapshot flag、SKILL.md 正确性、TODOS-format.md 引用、可观测性单元测试 |
| 2 — E2E | `bun run test:e2e` | ~$3.85 | 通过 `claude -p` 子进程进行完整 skill 执行 |
| 3 — LLM 评估 | `bun run test:evals` | 单独运行 ~$0.15 | LLM 作为评审对生成的 SKILL.md 文档进行评分 |
| 2+3 | `bun run test:evals` | 合计 ~$4 | E2E + LLM 评审（同时运行） |

```bash
bun test                     # 仅层级 1（每次提交运行，<5s）
bun run test:e2e             # 层级 2：仅 E2E（需要 EVALS=1，不能在 Claude Code 内运行）
bun run test:evals           # 层级 2 + 3 合并（~$4/次）
```

### 层级 1：静态验证（免费）

使用 `bun test` 自动运行。无需 API key。

- **Skill 解析器测试**（`test/skill-parser.test.ts`）——从 SKILL.md 的 bash 代码块中提取每个 `$B` 命令，并与 `browse/src/commands.ts` 中的命令注册表进行验证。捕获拼写错误、已删除命令和无效的 snapshot flag。
- **Skill 验证测试**（`test/skill-validation.test.ts`）——验证 SKILL.md 文件仅引用真实的命令和 flag，且命令描述满足质量阈值。
- **生成器测试**（`test/gen-skill-docs.test.ts`）——测试模板系统：验证占位符正确解析，输出包含 flag 的值提示（例如 `-d <N>` 而不仅是 `-d`），关键命令的丰富描述（例如 `is` 列出有效状态，`press` 列出按键示例）。

### 层级 2：通过 `claude -p` 的 E2E 测试（~$3.85/次）

以子进程方式启动 `claude -p`，使用 `--output-format stream-json --verbose`，通过 NDJSON 流式传输实时进度，并扫描 browse 错误。这是最接近"这个 skill 端到端是否真正工作"的测试方式。

```bash
# 必须从普通终端运行——不能嵌套在 Claude Code 或 Conductor 内
EVALS=1 bun test test/skill-e2e-*.test.ts
```

- 由 `EVALS=1` 环境变量控制（防止意外的昂贵运行）
- 在 Claude Code 内运行时自动跳过（`claude -p` 不能嵌套）
- API 连接预检查——在消耗预算之前，遇到 ConnectionRefused 快速失败
- 实时进度输出到 stderr：`[Ns] turn T tool #C: Name(...)`
- 保存完整的 NDJSON 转录和失败 JSON 用于调试
- 测试位于 `test/skill-e2e-*.test.ts`（按类别拆分），运行器逻辑在 `test/helpers/session-runner.ts`

### E2E 可观测性

E2E 测试运行时，会在 `~/.gstack-dev/` 中生成机器可读的产物：

| 产物 | 路径 | 用途 |
|------|------|------|
| 心跳 | `e2e-live.json` | 当前测试状态（每次工具调用更新） |
| 部分结果 | `evals/_partial-e2e.json` | 已完成的测试（进程被终止也能保留） |
| 进度日志 | `e2e-runs/{runId}/progress.log` | 追加写入的文本日志 |
| NDJSON 转录 | `e2e-runs/{runId}/{test}.ndjson` | 每个测试的原始 `claude -p` 输出 |
| 失败 JSON | `e2e-runs/{runId}/{test}-failure.json` | 失败时的诊断数据 |

**实时仪表盘：**在另一个终端运行 `bun run eval:watch`，可以看到实时仪表盘，显示已完成的测试、当前正在运行的测试和费用。使用 `--tail` 还可以显示 progress.log 的最后 10 行。

**评估历史工具：**

```bash
bun run eval:list            # 列出所有评估运行（每次运行的轮数、持续时间、费用）
bun run eval:compare         # 比较两次运行——显示每个测试的差异 + 总结评论
bun run eval:summary         # 跨运行的汇总统计 + 每个测试的效率平均值
```

**评估比较评论：**`eval:compare` 生成自然语言的总结部分，解释两次运行之间的变化——标记回归、记录改进、指出效率提升（更少的轮数、更快、更便宜），并生成总体摘要。这由 `eval-store.ts` 中的 `generateCommentary()` 驱动。

产物永远不会被清理——它们积累在 `~/.gstack-dev/` 中，用于事后调试和趋势分析。

### 层级 3：LLM 评审（~$0.15/次）

使用 Claude Sonnet 在三个维度上对生成的 SKILL.md 文档进行评分：

- **清晰度** ——AI agent 能否无歧义地理解指令？
- **完整性** ——所有命令、flag 和使用模式是否都有文档？
- **可操作性** ——agent 能否仅使用文档中的信息来执行任务？

每个维度评分 1-5。阈值：每个维度必须达到 **>= 4**。还有一个回归测试，将生成的文档与 `origin/main` 中手工维护的基线进行比较——生成的文档得分必须相同或更高。

```bash
# 需要 .env 中的 ANTHROPIC_API_KEY——包含在 bun run test:evals 中
```

- 使用 `claude-sonnet-4-6` 以保证评分稳定性
- 测试位于 `test/skill-llm-eval.test.ts`
- 直接调用 Anthropic API（不是 `claude -p`），所以可以在任何地方运行，包括在 Claude Code 内

### CI

GitHub Action（`.github/workflows/skill-docs.yml`）在每次 push 和 PR 时运行 `bun run gen:skill-docs --dry-run`。如果生成的 SKILL.md 文件与已提交的不同，CI 将失败。这会在合并前捕获过期的文档。

测试直接针对 browse 二进制文件运行——不需要 dev mode。

## 编辑 SKILL.md 文件

SKILL.md 文件是从 `.tmpl` 模板**生成**的。不要直接编辑 `.md`——你的更改会在下次构建时被覆盖。

```bash
# 1. 编辑模板
vim SKILL.md.tmpl              # 或 browse/SKILL.md.tmpl

# 2. 为所有 host 重新生成
bun run gen:skill-docs --host all

# 3. 检查健康状态（报告所有 host）
bun run skill:check

# 或使用 watch mode——保存时自动重新生成
bun run dev:skill
```

关于模板编写的最佳实践（使用自然语言而非 bash 风格、动态分支检测、`{{BASE_BRANCH_DETECT}}` 的使用），请参阅 CLAUDE.md 的"Writing SKILL templates"部分。

要添加 browse 命令，将其添加到 `browse/src/commands.ts`。要添加 snapshot flag，将其添加到 `browse/src/snapshot.ts` 中的 `SNAPSHOT_FLAGS`。然后重新构建。

## 多 host 开发

gstack 从一组 `.tmpl` 模板为 8 个 host 生成 SKILL.md 文件。每个 host 是 `hosts/*.ts` 中的一个类型化配置。生成器读取这些配置以生成适合各 host 的输出（不同的 frontmatter、路径、工具名称）。

**支持的 host：**Claude（主要）、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw。

### 为所有 host 生成

```bash
# 为特定 host 生成
bun run gen:skill-docs                    # Claude（默认）
bun run gen:skill-docs --host codex       # Codex
bun run gen:skill-docs --host opencode    # OpenCode
bun run gen:skill-docs --host all         # 全部 8 个 host

# 或使用 build，它会为所有 host 生成 + 编译二进制文件
bun run build
```

### 不同 host 之间的差异

每个 host 配置（`hosts/*.ts`）控制：

| 方面 | 示例（Claude vs Codex） |
|------|------------------------|
| 输出目录 | `{skill}/SKILL.md` vs `.agents/skills/gstack-{skill}/SKILL.md` |
| Frontmatter | 完整（name、description、hooks、version）vs 最小化（name + description） |
| 路径 | `~/.claude/skills/gstack` vs `$GSTACK_ROOT` |
| 工具名称 | "use the Bash tool" vs 相同（Factory 改写为 "run this command"） |
| Hook skill | `hooks:` frontmatter vs 内联安全提示文本 |
| 被抑制的部分 | 无 vs Codex 自调用部分被移除 |

完整的 `HostConfig` 接口参见 `scripts/host-config.ts`。

### 测试 host 输出

```bash
# 运行所有静态测试（包括所有 host 的参数化冒烟测试）
bun test

# 检查所有 host 的新鲜度
bun run gen:skill-docs --host all --dry-run

# 健康仪表盘覆盖所有 host
bun run skill:check
```

### 添加新 host

完整指南参见 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md)。简短版本：

1. 创建 `hosts/myhost.ts`（从 `hosts/opencode.ts` 复制）
2. 添加到 `hosts/index.ts`
3. 将 `.myhost/` 添加到 `.gitignore`
4. 运行 `bun run gen:skill-docs --host myhost`
5. 运行 `bun test`（参数化测试自动覆盖）

无需修改任何生成器、setup 或工具代码。

### 添加新 skill

当你添加新的 skill 模板时，所有 host 自动获得它：
1. 创建 `{skill}/SKILL.md.tmpl`
2. 运行 `bun run gen:skill-docs --host all`
3. 动态模板发现会自动识别它，无需更新静态列表
4. 提交 `{skill}/SKILL.md`，外部 host 输出在 setup 时生成且已 gitignore

## Conductor workspace

如果你使用 [Conductor](https://conductor.build) 来并行运行多个 Claude Code 会话，`conductor.json` 会自动管理 workspace 生命周期：

| Hook | 脚本 | 作用 |
|------|------|------|
| `setup` | `bin/dev-setup` | 从主 worktree 复制 `.env`，安装依赖，symlink skill |
| `archive` | `bin/dev-teardown` | 移除 skill symlink，清理 `.claude/` 目录 |

当 Conductor 创建新 workspace 时，`bin/dev-setup` 自动运行。它检测主 worktree（通过 `git worktree list`），复制你的 `.env` 使 API key 可用，并设置 dev mode——无需手动操作。

**首次设置：**将你的 `ANTHROPIC_API_KEY` 放在主仓库的 `.env` 中（参见 `.env.example`）。每个 Conductor workspace 都会自动继承。

## 注意事项

- **SKILL.md 文件是生成的。**编辑 `.tmpl` 模板，而不是 `.md`。运行 `bun run gen:skill-docs` 重新生成。
- **TODOS.md 是统一的待办列表。**按 skill/组件组织，具有 P0-P4 优先级。`/ship` 自动检测已完成的项目。所有规划/审查/回顾 skill 都会读取它获取上下文。
- **Browse 源码更改需要重新构建。**如果你修改了 `browse/src/*.ts`，运行 `bun run build`。
- **Dev mode 会覆盖你的全局安装。**项目本地 skill 优先于 `~/.claude/skills/gstack`。`bin/dev-teardown` 恢复全局安装。
- **Conductor workspace 是独立的。**每个 workspace 都是自己的 git worktree。`bin/dev-setup` 通过 `conductor.json` 自动运行。
- **`.env` 跨 worktree 传播。**在主仓库中设置一次，所有 Conductor workspace 都会获得。
- **`.claude/skills/` 已 gitignore。**symlink 永远不会被提交。

## 在真实项目中测试你的更改

**这是开发 gstack 的推荐方式。**将你的 gstack checkout symlink 到你实际使用它的项目中，这样你在做真正的工作时更改就是实时生效的。

### 步骤 1：Symlink 你的 checkout

```bash
# 在你的核心项目中（不是 gstack 仓库）
ln -sfn /path/to/your/gstack-checkout .claude/skills/gstack
```

### 步骤 2：运行 setup 创建每个 skill 的 symlink

仅有 `gstack` symlink 是不够的。Claude Code 通过独立的顶层目录发现 skill（`qa/SKILL.md`、`ship/SKILL.md` 等），而不是通过 `gstack/` 目录本身。运行 `./setup` 来创建它们：

```bash
cd .claude/skills/gstack && bun install && bun run build && ./setup
```

Setup 会询问你想要短名称（`/qa`）还是命名空间名称（`/gstack-qa`）。你的选择保存到 `~/.gstack/config.yaml`，在未来的运行中被记住。要跳过提示，传入 `--no-prefix`（短名称）或 `--prefix`（命名空间名称）。

### 步骤 3：开发

编辑模板，运行 `bun run gen:skill-docs`，下次 `/review` 或 `/qa` 调用会立即使用它。无需重启。

### 恢复到稳定的全局安装

移除项目本地 symlink。Claude Code 会回退到 `~/.claude/skills/gstack/`：

```bash
rm .claude/skills/gstack
```

每个 skill 目录（`qa/`、`ship/` 等）包含指向 `gstack/...` 的 SKILL.md symlink，所以它们会自动解析到全局安装。

### 切换前缀模式

如果你使用一种前缀设置 vendor 了 gstack，想要切换：

```bash
cd .claude/skills/gstack && ./setup --no-prefix   # 切换到 /qa、/ship
cd .claude/skills/gstack && ./setup --prefix       # 切换到 /gstack-qa、/gstack-ship
```

Setup 会自动清理旧的 symlink。无需手动清理。

### 替代方案：将全局安装指向某个分支

如果你不想使用每个项目的 symlink，可以切换全局安装：

```bash
cd ~/.claude/skills/gstack
git fetch origin
git checkout origin/<branch>
bun install && bun run build && ./setup
```

这会影响所有项目。要恢复：`git checkout main && git pull && bun run build && ./setup`。

## 社区 PR 分流（批次流程）

当社区 PR 积累时，将它们按主题分批处理：

1. **分类** ——按主题分组（安全、功能、基础设施、文档）
2. **去重** ——如果两个 PR 修复同一个问题，选择改动行数更少的那个。关闭另一个并附上指向获胜者的说明。
3. **收集分支** ——创建 `pr-wave-N`，合并干净的 PR，解决有冲突的 PR，使用 `bun test && bun run build` 验证
4. **带上下文关闭** ——每个被关闭的 PR 都会收到一条评论，解释为什么关闭以及什么（如果有的话）取代了它。贡献者付出了真正的工作；用清晰的沟通来尊重他们。
5. **作为一个 PR 发布** ——向 main 提交单个 PR，所有归属信息保留在 merge commit 中。包含一个汇总表，列出合并了什么和关闭了什么。

参见 [PR #205](../../pull/205)（v0.8.3）作为第一次批次的示例。

## 升级迁移

当一个版本以 `./setup` 无法单独修复的方式更改了磁盘状态（目录结构、配置格式、过期文件）时，添加一个迁移脚本，让现有用户获得干净的升级。

### 何时添加迁移

- 更改了 skill 目录的创建方式（symlink vs 真实目录）
- 重命名或移动了 `~/.gstack/config.yaml` 中的配置键
- 需要删除前一版本遗留的孤立文件
- 更改了 `~/.gstack/` 状态文件的格式

不需要添加迁移的情况：新功能（用户自动获得）、新 skill（setup 会自动发现）、或仅代码更改（无磁盘状态变化）。

### 如何添加迁移

1. 创建 `gstack-upgrade/migrations/v{VERSION}.sh`，其中 `{VERSION}` 与需要修复的版本的 VERSION 文件匹配。
2. 使其可执行：`chmod +x gstack-upgrade/migrations/v{VERSION}.sh`
3. 脚本必须是**幂等的**（可安全多次运行）且**不致命**（失败会被记录但不会阻止升级）。
4. 在文件顶部包含注释块，解释什么发生了变化、为什么需要迁移、以及哪些用户会受影响。

示例：

```bash
#!/usr/bin/env bash
# Migration: v0.15.2.0 — Fix skill directory structure
# Affected: users who installed with --no-prefix before v0.15.2.0
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
"$SCRIPT_DIR/bin/gstack-relink" 2>/dev/null || true
```

### 运行方式

在 `/gstack-upgrade` 期间，`./setup` 完成后（步骤 4.75），升级 skill 会扫描 `gstack-upgrade/migrations/` 并运行每个版本号比用户旧版本新的 `v*.sh` 脚本。脚本按版本顺序运行。失败会被记录但不会阻止升级。

### 测试迁移

迁移作为 `bun test`（层级 1，免费）的一部分进行测试。测试套件验证 `gstack-upgrade/migrations/` 中的所有迁移脚本都是可执行的且没有语法错误。

## 发布你的更改

当你对 skill 编辑满意后：

```bash
/ship
```

这会运行测试、审查 diff、分流 Greptile 评论（使用 2 级升级机制）、管理 TODOS.md、升级版本号，并打开 PR。完整工作流参见 `ship/SKILL.md`。
