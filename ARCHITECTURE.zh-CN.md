[English](ARCHITECTURE.md) | [简体中文](ARCHITECTURE.zh-CN.md)

# 架构

本文档解释了 gstack **为什么**要这样构建。安装和命令请参见 CLAUDE.md。贡献指南请参见 CONTRIBUTING.md。

## 核心理念

gstack 为 Claude Code 提供了一个持久化浏览器和一套有主见的工作流技能。浏览器是难点——其他一切都是 Markdown。

关键洞察：AI agent 与浏览器交互需要**亚秒级延迟**和**持久化状态**。如果每个命令都冷启动浏览器，每次工具调用都要等 3-5 秒。如果浏览器在命令间崩溃，你会丢失 cookies、标签页和登录会话。因此 gstack 运行一个长驻的 Chromium 守护进程，CLI 通过 localhost HTTP 与之通信。

```
Claude Code                     gstack
─────────                      ──────
                               ┌──────────────────────┐
  Tool call: $B snapshot -i    │  CLI (compiled binary)│
  ─────────────────────────→   │  • reads state file   │
                               │  • POST /command      │
                               │    to localhost:PORT   │
                               └──────────┬───────────┘
                                          │ HTTP
                               ┌──────────▼───────────┐
                               │  Server (Bun.serve)   │
                               │  • dispatches command  │
                               │  • talks to Chromium   │
                               │  • returns plain text  │
                               └──────────┬───────────┘
                                          │ CDP
                               ┌──────────▼───────────┐
                               │  Chromium (headless)   │
                               │  • persistent tabs     │
                               │  • cookies carry over  │
                               │  • 30min idle timeout  │
                               └───────────────────────┘
```

首次调用启动全部组件（约 3 秒）。之后每次调用：约 100-200ms。

## 为什么选择 Bun

Node.js 也能用。但 Bun 在这里更好，原因有三：

1. **编译为二进制文件。** `bun build --compile` 生成一个约 58MB 的独立可执行文件。运行时无需 `node_modules`，无需 `npx`，无需 PATH 配置。二进制文件直接运行。这很重要，因为 gstack 安装到 `~/.claude/skills/`，用户不会期望在那里管理一个 Node.js 项目。

2. **原生 SQLite。** Cookie 解密直接读取 Chromium 的 SQLite cookie 数据库。Bun 内置了 `new Database()`——无需 `better-sqlite3`，无需原生插件编译，无需 gyp。少一个在不同机器上可能出问题的依赖。

3. **原生 TypeScript。** 开发时服务器直接以 `bun run server.ts` 运行。无需编译步骤，无需 `ts-node`，无需调试 source maps。编译后的二进制用于部署；源文件用于开发。

4. **内置 HTTP 服务器。** `Bun.serve()` 快速、简洁，不需要 Express 或 Fastify。服务器总共只处理约 10 个路由。引入框架反而是负担。

瓶颈始终在 Chromium，而不是 CLI 或服务器。Bun 的启动速度（编译后二进制约 1ms vs Node 的约 100ms）虽然不错，但不是我们选择它的原因。编译二进制和原生 SQLite 才是。

## 守护进程模型（Daemon Model）

### 为什么不是每个命令启动一个浏览器？

Playwright 启动 Chromium 大约需要 2-3 秒。对于单次截图，这没问题。但对于包含 20 多个命令的 QA 会话，浏览器启动开销就超过 40 秒。更糟糕的是：命令间所有状态都会丢失。Cookies、localStorage、登录会话、打开的标签页——全部消失。

守护进程模型意味着：

- **持久化状态。** 登录一次，保持登录。打开一个标签页，它保持打开。localStorage 在命令间持久保存。
- **亚秒级命令。** 首次调用后，每个命令只是一个 HTTP POST。包含 Chromium 处理在内约 100-200ms 往返。
- **自动生命周期。** 服务器在首次使用时自动启动，空闲 30 分钟后自动关闭。无需进程管理。

### 状态文件（State File）

服务器写入 `.gstack/browse.json`（通过 tmp + rename 原子写入，权限 0o600）：

```json
{ "pid": 12345, "port": 34567, "token": "uuid-v4", "startedAt": "...", "binaryVersion": "abc123" }
```

CLI 读取此文件来找到服务器。如果文件缺失或服务器健康检查失败，CLI 会启动一个新服务器。在 Windows 上，基于 PID 的进程检测在 Bun 二进制中不可靠，因此健康检查（GET /health）是所有平台上的主要存活信号。

### 端口选择

在 10000-60000 之间随机选择端口（冲突时最多重试 5 次）。这意味着 10 个 Conductor 工作区可以各自运行自己的 browse 守护进程，零配置、零端口冲突。旧方案（扫描 9400-9409）在多工作区场景中经常出问题。

### 版本自动重启

构建时将 `git rev-parse HEAD` 写入 `browse/dist/.version`。每次 CLI 调用时，如果二进制版本与运行中服务器的 `binaryVersion` 不匹配，CLI 会杀掉旧服务器并启动新的。这完全消除了"过期二进制"这类 bug——重新构建二进制，下一个命令自动使用新版本。

## 安全模型

### 仅限 localhost

HTTP 服务器绑定到 `localhost`，而非 `0.0.0.0`。无法从网络访问。

### Bearer token 认证

每个服务器会话生成一个随机 UUID token，以 0o600 权限（仅所有者可读）写入状态文件。每个 HTTP 请求必须包含 `Authorization: Bearer <token>`。如果 token 不匹配，服务器返回 401。

这可以防止同一机器上的其他进程与你的 browse 服务器通信。Cookie 选择器 UI（`/cookie-picker`）和健康检查（`/health`）是例外——它们仅限 localhost 且不执行命令。

### Cookie 安全

Cookies 是 gstack 处理的最敏感数据。设计如下：

1. **Keychain 访问需要用户批准。** 每个浏览器首次导入 cookie 时会触发 macOS Keychain 对话框。用户必须点击"Allow"或"Always Allow"。gstack 绝不会静默访问凭据。

2. **解密在进程内进行。** Cookie 值在内存中解密（PBKDF2 + AES-128-CBC），加载到 Playwright 上下文中，且从不以明文写入磁盘。Cookie 选择器 UI 从不显示 cookie 值——只显示域名和数量。

3. **数据库只读。** gstack 将 Chromium cookie 数据库复制到临时文件（以避免与运行中浏览器的 SQLite 锁冲突），并以只读方式打开。它从不修改你真实浏览器的 cookie 数据库。

4. **密钥缓存限于会话。** Keychain 密码和派生的 AES 密钥在服务器生命周期内缓存于内存中。当服务器关闭（空闲超时或显式停止），缓存即消失。

5. **日志中不含 cookie 值。** 控制台、网络和对话框日志从不包含 cookie 值。`cookies` 命令输出 cookie 元数据（域名、名称、过期时间），但值会被截断。

### Shell 注入防护

浏览器注册表（Comet、Chrome、Arc、Brave、Edge）是硬编码的。数据库路径由已知常量构建，从不来自用户输入。Keychain 访问使用 `Bun.spawn()` 配合显式参数数组，而非 shell 字符串拼接。

## Ref 系统

Refs（`@e1`、`@e2`、`@c1`）是 agent 寻址页面元素的方式，无需编写 CSS 选择器或 XPath。

### 工作原理

```
1. Agent runs: $B snapshot -i
2. Server calls Playwright's page.accessibility.snapshot()
3. Parser walks the ARIA tree, assigns sequential refs: @e1, @e2, @e3...
4. For each ref, builds a Playwright Locator: getByRole(role, { name }).nth(index)
5. Stores Map<string, RefEntry> on the BrowserManager instance (role + name + Locator)
6. Returns the annotated tree as plain text

Later:
7. Agent runs: $B click @e3
8. Server resolves @e3 → Locator → locator.click()
```

### 为什么用 Locator 而非 DOM 修改

显而易见的方案是向 DOM 注入 `data-ref="@e1"` 属性。但这在以下情况会失效：

- **CSP（Content Security Policy）。** 许多生产站点阻止脚本修改 DOM。
- **React/Vue/Svelte hydration。** 框架的协调机制可能会剥离注入的属性。
- **Shadow DOM。** 无法从外部访问 shadow roots 内部。

Playwright Locator 独立于 DOM 之外。它使用accessibility tree（Chromium 内部维护）和 `getByRole()` 查询。无 DOM 修改，无 CSP 问题，无框架冲突。

### Ref 生命周期

Refs 在导航时被清除（主框架上的 `framenavigated` 事件）。这是正确的——导航后，所有 locator 都已过期。Agent 必须重新运行 `snapshot` 获取新的 refs。这是有意为之的设计：过期的 refs 应该大声失败，而不是点击错误的元素。

### Ref 过期检测

SPA 可以在不触发 `framenavigated` 的情况下修改 DOM（例如 React 路由跳转、标签页切换、弹窗打开）。这使得即使页面 URL 没有改变，refs 也会过期。为了捕捉这种情况，`resolveRef()` 在使用任何 ref 之前执行异步 `count()` 检查：

```
resolveRef(@e3) → entry = refMap.get("e3")
                → count = await entry.locator.count()
                → if count === 0: throw "Ref @e3 is stale — element no longer exists. Run 'snapshot' to get fresh refs."
                → if count > 0: return { locator }
```

这能快速失败（约 5ms 开销），而不是让 Playwright 的 30 秒操作超时在缺失元素上耗尽。`RefEntry` 在 Locator 旁存储了 `role` 和 `name` 元数据，使错误信息能够告知 agent 该元素原本是什么。

### Cursor-interactive ref（@c）

`-C` 标志查找那些可点击但不在 ARIA 树中的元素——使用 `cursor: pointer` 样式的元素、具有 `onclick` 属性的元素，或自定义 `tabindex` 的元素。这些元素获得 `@c1`、`@c2` ref，位于单独的命名空间中。这能捕获那些框架渲染为 `<div>` 但实际上是按钮的自定义组件。

## 日志架构

三个 ring buffer（每个 50,000 条记录，O(1) 写入）：

```
Browser events → CircularBuffer (in-memory) → Async flush to .gstack/*.log
```

控制台消息、网络请求和对话框事件各有独立的缓冲区。每 1 秒刷写一次——服务器仅追加自上次刷写以来的新条目。这意味着：

- HTTP 请求处理永远不会被磁盘 I/O 阻塞
- 日志在服务器崩溃后仍然存在（最多丢失 1 秒数据）
- 内存是有界的（50K 条目 × 3 个缓冲区）
- 磁盘文件仅追加写入，外部工具可读

`console`、`network` 和 `dialog` 命令从内存缓冲区读取，而非磁盘。磁盘文件用于事后调试。

## SKILL.md 模板系统

### 问题

SKILL.md 文件告诉 Claude 如何使用 browse 命令。如果文档列出了不存在的标志，或遗漏了新增的命令，agent 就会遇到错误。手动维护的文档总是与代码产生偏差。

### 解决方案

```
SKILL.md.tmpl          (human-written prose + placeholders)
       ↓
gen-skill-docs.ts      (reads source code metadata)
       ↓
SKILL.md               (committed, auto-generated sections)
```

模板包含需要人工判断的工作流、技巧和示例。占位符在构建时从源代码填充：

| 占位符 | 来源 | 生成内容 |
|--------|------|----------|
| `{{COMMAND_REFERENCE}}` | `commands.ts` | 分类命令表 |
| `{{SNAPSHOT_FLAGS}}` | `snapshot.ts` | 标志参考及示例 |
| `{{PREAMBLE}}` | `gen-skill-docs.ts` | 启动块：更新检查、会话追踪、贡献者模式、AskUserQuestion 格式 |
| `{{BROWSE_SETUP}}` | `gen-skill-docs.ts` | 二进制发现 + 安装指引 |
| `{{BASE_BRANCH_DETECT}}` | `gen-skill-docs.ts` | 面向 PR 技能的动态基础分支检测（ship、review、qa、plan-ceo-review） |
| `{{QA_METHODOLOGY}}` | `gen-skill-docs.ts` | /qa 和 /qa-only 共享的 QA 方法论块 |
| `{{DESIGN_METHODOLOGY}}` | `gen-skill-docs.ts` | /plan-design-review 和 /design-review 共享的设计审计方法论 |
| `{{REVIEW_DASHBOARD}}` | `gen-skill-docs.ts` | /ship 预检的 Review Readiness Dashboard |
| `{{TEST_BOOTSTRAP}}` | `gen-skill-docs.ts` | 测试框架检测、引导、CI/CD 设置（/qa、/ship、/design-review） |
| `{{CODEX_PLAN_REVIEW}}` | `gen-skill-docs.ts` | 可选的跨模型计划评审（Codex 或 Claude subagent 回退），用于 /plan-ceo-review 和 /plan-eng-review |
| `{{DESIGN_SETUP}}` | `resolvers/design.ts` | `$D` 设计二进制的发现模式，镜像 `{{BROWSE_SETUP}}` |
| `{{DESIGN_SHOTGUN_LOOP}}` | `resolvers/design.ts` | /design-shotgun、/plan-design-review、/design-consultation 共享的对比板反馈循环 |

这在结构上是健全的——如果代码中存在某个命令，它就会出现在文档中。如果不存在，它就不可能出现。

### Preamble（前置块）

每个技能以一个 `{{PREAMBLE}}` 块开始，在技能自身逻辑之前运行。它在一个 bash 命令中处理五件事：

1. **更新检查** — 调用 `gstack-update-check`，报告是否有可用升级。
2. **会话追踪** — 触摸 `~/.gstack/sessions/$PPID` 并统计活跃会话数（过去 2 小时内修改的文件）。当 3 个以上会话运行时，所有技能进入"ELI16 模式"——每个问题都重新为用户建立上下文，因为他们正在多窗口间切换。
3. **运营自我改进** — 在每次技能会话结束时，agent 反思失败（CLI 错误、错误方法、项目特性）并将运营经验记录到项目的 JSONL 文件中，供未来会话使用。
4. **AskUserQuestion 格式** — 统一格式：上下文、问题、`RECOMMENDATION: Choose X because ___`、字母选项。所有技能保持一致。
5. **先搜索再构建（Search Before Building）** — 在构建基础设施或不熟悉的模式之前，先搜索。三层知识：久经考验的（Layer 1）、新兴流行的（Layer 2）、第一性原理的（Layer 3）。当第一性原理推理揭示传统智慧是错误的，agent 会命名这个"eureka moment"并记录。详见 `ETHOS.md` 中的完整构建者哲学。

### 为什么提交生成的文件而非运行时生成？

三个原因：

1. **Claude 在技能加载时读取 SKILL.md。** 用户调用 `/browse` 时没有构建步骤。文件必须已经存在且正确。
2. **CI 可以验证新鲜度。** `gen:skill-docs --dry-run` + `git diff --exit-code` 在合并前捕获过期文档。
3. **Git blame 有效。** 你可以看到某个命令是何时、在哪个提交中添加的。

### 模板测试层级

| 层级 | 内容 | 成本 | 速度 |
|------|------|------|------|
| 1 — 静态验证 | 解析 SKILL.md 中每个 `$B` 命令，对照注册表验证 | 免费 | <2s |
| 2 — E2E（通过 `claude -p`） | 启动真实 Claude 会话，运行每个技能，检查错误 | ~$3.85 | ~20min |
| 3 — LLM-as-judge | Sonnet 从清晰度/完整性/可操作性对文档评分 | ~$0.15 | ~30s |

层级 1 在每次 `bun test` 时运行。层级 2+3 受 `EVALS=1` 门控。理念是：免费捕获 95% 的问题，仅在需要判断时使用 LLM。

## 命令分发（Command Dispatch）

命令按副作用分类：

- **READ**（text、html、links、console、cookies 等）：无修改。可安全重试。返回页面状态。
- **WRITE**（goto、click、fill、press 等）：修改页面状态。非幂等。
- **META**（snapshot、screenshot、tabs、chain 等）：不严格属于读/写的服务器级操作。

这不仅仅是组织方式。服务器用它来分发：

```typescript
if (READ_COMMANDS.has(cmd))  → handleReadCommand(cmd, args, bm)
if (WRITE_COMMANDS.has(cmd)) → handleWriteCommand(cmd, args, bm)
if (META_COMMANDS.has(cmd))  → handleMetaCommand(cmd, args, bm, shutdown)
```

`help` 命令返回所有三个集合，以便 agent 能够自我发现可用命令。

## 错误哲学

错误信息是给 AI agent 看的，不是给人看的。每条错误信息都必须可操作：

- "Element not found" → "Element not found or not interactable. Run `snapshot -i` to see available elements."
- "Selector matched multiple elements" → "Selector matched multiple elements. Use @refs from `snapshot` instead."
- Timeout → "Navigation timed out after 30s. The page may be slow or the URL may be wrong."

Playwright 的原生错误通过 `wrapError()` 重写，去除内部堆栈跟踪并添加引导。Agent 应能阅读错误信息并知道下一步该做什么，无需人工干预。

### 崩溃恢复

服务器不尝试自我修复。如果 Chromium 崩溃（`browser.on('disconnected')`），服务器立即退出。CLI 在下一个命令时检测到死掉的服务器并自动重启。这比尝试重新连接一个半死的浏览器进程更简单、更可靠。

## E2E 测试基础设施

### Session Runner（`test/helpers/session-runner.ts`）

E2E 测试将 `claude -p` 作为完全独立的子进程启动——不通过 Agent SDK，因为它无法在 Claude Code 会话内嵌套。Runner 的工作流程：

1. 将 prompt 写入临时文件（避免 shell 转义问题）
2. 执行 `sh -c 'cat prompt | claude -p --output-format stream-json --verbose'`
3. 从 stdout 流式读取 NDJSON 以获取实时进度
4. 与可配置的超时竞争
5. 将完整的 NDJSON 记录解析为结构化结果

`parseNDJSON()` 函数是纯函数——无 I/O，无副作用——使其可以独立测试。

### 可观测性数据流

```
  skill-e2e-*.test.ts
        │
        │ generates runId, passes testName + runId to each call
        │
  ┌─────┼──────────────────────────────┐
  │     │                              │
  │  runSkillTest()              evalCollector
  │  (session-runner.ts)         (eval-store.ts)
  │     │                              │
  │  per tool call:              per addTest():
  │  ┌──┼──────────┐              savePartial()
  │  │  │          │                   │
  │  ▼  ▼          ▼                   ▼
  │ [HB] [PL]    [NJ]          _partial-e2e.json
  │  │    │        │             (atomic overwrite)
  │  │    │        │
  │  ▼    ▼        ▼
  │ e2e-  prog-  {name}
  │ live  ress   .ndjson
  │ .json .log
  │
  │  on failure:
  │  {name}-failure.json
  │
  │  ALL files in ~/.gstack-dev/
  │  Run dir: e2e-runs/{runId}/
  │
  │         eval-watch.ts
  │              │
  │        ┌─────┴─────┐
  │     read HB     read partial
  │        └─────┬─────┘
  │              ▼
  │        render dashboard
  │        (stale >10min? warn)
```

**职责分离：** session-runner 拥有 heartbeat（当前测试状态），eval-store 拥有部分结果（已完成的测试状态）。Watcher 读取两者。两个组件互不知晓——它们仅通过文件系统共享数据。

**一切非致命：** 所有可观测性 I/O 都包装在 try/catch 中。写入失败永远不会导致测试失败。测试本身是事实来源；可观测性是尽力而为。

**机器可读的诊断信息：** 每个测试结果包含 `exit_reason`（success、timeout、error_max_turns、error_api、exit_code_N）、`timeout_at_turn` 和 `last_tool_call`。这使得 `jq` 查询成为可能，例如：
```bash
jq '.tests[] | select(.exit_reason == "timeout") | .last_tool_call' ~/.gstack-dev/evals/_partial-e2e.json
```

### Eval 持久化（`test/helpers/eval-store.ts`）

`EvalCollector` 累积测试结果并以两种方式写入：

1. **增量写入：** `savePartial()` 在每次测试后写入 `_partial-e2e.json`（原子操作：写入 `.tmp`，`fs.renameSync`）。即使进程被杀也不会丢失。
2. **最终写入：** `finalize()` 写入带时间戳的 eval 文件（例如 `e2e-20260314-143022.json`）。部分文件不会被清理——它与最终文件并存以供可观测。

`eval:compare` 对比两次 eval 运行。`eval:summary` 汇总 `~/.gstack-dev/evals/` 中所有运行的统计数据。

### 测试层级

| 层级 | 内容 | 成本 | 速度 |
|------|------|------|------|
| 1 — 静态验证 | 解析 `$B` 命令，对照注册表验证，可观测性单元测试 | 免费 | <5s |
| 2 — E2E（通过 `claude -p`） | 启动真实 Claude 会话，运行每个技能，扫描错误 | ~$3.85 | ~20min |
| 3 — LLM-as-judge | Sonnet 从清晰度/完整性/可操作性对文档评分 | ~$0.15 | ~30s |

层级 1 在每次 `bun test` 时运行。层级 2+3 受 `EVALS=1` 门控。理念：免费捕获 95% 的问题，仅在判断和集成测试时使用 LLM。

## 刻意不做的事

- **不用 WebSocket 流式传输。** HTTP 请求/响应更简单，可用 curl 调试，且速度足够。流式传输会增加复杂性但收益甚微。
- **不用 MCP 协议。** MCP 每个请求增加 JSON schema 开销且需要持久连接。纯 HTTP + 纯文本输出更省 token 也更易调试。
- **不支持多用户。** 每个工作区一个服务器，一个用户。Token 认证是纵深防御，不是多租户。
- **不支持 Windows/Linux cookie 解密。** macOS Keychain 是唯一支持的凭据存储。Linux（GNOME Keyring/kwallet）和 Windows（DPAPI）在架构上可行但未实现。
- **不自动发现 iframe。** `$B frame` 支持跨框架交互（CSS 选择器、@ref、`--name`、`--url` 匹配），但 ref 系统不会在 `snapshot` 期间自动爬取 iframe。你必须先显式进入框架上下文。
