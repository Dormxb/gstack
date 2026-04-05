[English](CHANGELOG.md) | [简体中文](CHANGELOG.zh-CN.md)

# 更新日志

注：较早的历史版本条目采用轻度本地化与适度压缩写法，版本号、命令名与关键结论保持一致。

## [0.15.9.0] - 2026-04-05 — OpenClaw Integration v2

你现在可以把 gstack 连接到 OpenClaw，作为方法论来源使用。OpenClaw 通过 ACP 原生拉起 Claude Code 会话，而 gstack 提供让这些会话更强的规划纪律与思考框架。

### 新增

- **gstack-lite 规划纪律。** 一个只有 15 行的 `CLAUDE.md`，把每个拉起的 Claude Code 会话都变成有纪律的执行者：先读、先计划、消除歧义、自审、再汇报。A/B 测试结果：耗时约 2 倍，但输出质量显著更好。
- **gstack-full 流水线模板。** 面向完整功能交付，把 `/autoplan`、实现、`/ship` 串成一条自治流程。编排器丢一个任务进去，拿回来的是 PR。
- **4 个面向 OpenClaw 的原生方法论技能。** Office hours、CEO review、investigate、retro，适配了不需要编码环境的对话式工作流。
- **4 层调度路由。** Simple（不用 gstack）、Medium（gstack-lite）、Heavy（特定 skill）、Full（完整流水线）。已记录在 `docs/OPENCLAW.md`，并给出 OpenClaw `AGENTS.md` 的路由指引。
- **已拉起会话检测。** 设置 `OPENCLAW_SESSION` 环境变量后，gstack 会自动跳过交互式提问，专注于任务完成。适用于任何编排器，不只 OpenClaw。
- **`includeSkills` host 配置字段。** 与 `skipSkills` 做并集/差集逻辑（include 减 skip），让宿主只生成自己真正需要的技能，而不是“先全量再排除”。
- **`docs/OPENCLAW.md`。** 完整架构文档，解释 gstack 如何与 OpenClaw 集成、prompt-as-bridge 模式，以及明确不做什么（不做 daemon、不做 protocol、不做 Clawvisor）。

### 变更

- OpenClaw host 配置已更新：现在只生成 4 个原生技能，而不是全部 31 个；同时移除了 `staticFiles.SOUL.md`（它引用了一个不存在的文件）。
- `setup` 脚本在 `--host openclaw` 下不再尝试完整安装，而是输出跳转提示。

## [0.15.8.1] - 2026-04-05 — Community PR Triage + Error Polish

关闭了 12 个重复的社区 PR，合并了 2 个已经可落地的 PR（#798、#776），并把友好的 OpenAI 报错扩展到了所有设计命令。现在如果你的组织还没完成验证，不管运行哪个设计命令，拿到的都会是带正确 URL 的清晰提示，而不是一坨原始 JSON。

### 修复

- **所有设计命令都显示友好的 OpenAI 组织验证错误。** 以前只有 `$D generate` 会在组织未验证时给出用户友好的报错。现在 `$D evolve`、`$D iterate`、`$D variants`、`$D check` 也都会显示同样清晰的提示和验证链接。

### 新增

- **Codex 会话发现的 >128KB 回归测试。** 把当前缓冲区限制显式记录下来，这样未来 Codex 版本如果 `session_meta` 更大，也会以清晰方式暴露，而不是静默坏掉。

### 面向贡献者

- 关闭了 12 个重复社区 PR（6 个 Gonzih 安全修复已在 v0.15.7.0 发出，另有 6 个是 stedfn 的重复项）。保留了 #752（design serve 的符号链接缺口）。感谢 @Gonzih、@stedfn、@itstimwhite 的贡献。

## [0.15.8.0] - 2026-04-04 — Smarter Reviews

代码评审现在会从你的决策中学习。某个 finding 如果你已经跳过一次，在相关代码没变化之前，它会保持安静。专项 reviewer 还会自动附上测试桩建议。而那些长期什么都发现不了的专项 reviewer 会被自动 gate 掉，让评审保持快速。

### 新增

- **跨次 review 去重。** 当你在某次 review 里跳过一个 finding，gstack 会记住。下次 review 如果相关代码没变，这个 finding 会继续被压制。不用每个 PR 都重新跳过同一个有意为之的模式。
- **测试桩建议。** 各专项 reviewer 现在可以在每条 finding 旁边附带一个测试骨架，并自动使用你项目检测到的测试框架（Jest、Vitest、RSpec、pytest、Go test）。带测试桩的 finding 会作为 ASK 项展示，由你决定是否创建测试。
- **自适应专项 reviewer gate。** 某个 reviewer 被派发 10 次以上仍然 0 finding，就会被自动 gate。`security` 和 `data-migration` 不受此规则影响，它们永远当成保险机制执行。你也可以用 `--security`、`--performance` 等参数强制开启任意专项 reviewer。
- **review 日志中的专项 reviewer 统计。** 每次 review 都会记录实际运行了哪些专项 reviewer、各自产生了多少 finding、哪些被跳过或被 gate。这既支撑了自适应 gating，也让 `/retro` 拿到更丰富的数据。

## [0.15.7.0] - 2026-04-05 — Security Wave 1

这是针对安全审计（#783）的 14 项修复。design server 不再监听所有网卡；路径穿越、鉴权绕过、CORS 通配、世界可读文件、prompt injection、符号链接竞争条件都已经堵上。也合并了来自 @Gonzih 和 @garagon 的社区 PR。

### 修复

- **Design server 仅绑定 localhost。** 以前绑定到 `0.0.0.0`，意味着同一 WiFi 下的任何人都能访问 mockup 和所有接口。现在只绑定到 `127.0.0.1`，与 browse server 一致。
- **阻止 `/api/reload` 路径穿越。** 以前可以通过 JSON body 里的任意路径读取磁盘上的任意文件（包括 `~/.ssh/id_rsa`）。现在会校验路径必须留在 `cwd` 或 `tmpdir` 内。
- **`/inspector/events` 补上鉴权。** 这个 SSE 端点以前是未鉴权的，而 `/activity/stream` 需要 token。现在两者都统一要求 Bearer 或 `?token=` 校验。
- **Design feedback 的 prompt injection 防护。** 用户反馈现在会包裹在 XML 信任边界标记中，并对标签做转义。累计反馈也限制为最近 5 轮，降低投毒面。
- **收紧文件和目录权限。** 所有 `~/.gstack/` 目录改为 `0o700`，文件改为 `0o600`；`setup` 脚本设置 `umask 077`。鉴权 token、聊天记录、浏览器日志都不再对其他用户可读。
- **修掉 setup 创建符号链接时的 TOCTOU 竞争。** 删除了 `mkdir -p` 之前的存在性检查；在创建链接前会校验目标不是 symlink。
- **移除 CORS 通配符。** Browse server 不再发送 `Access-Control-Allow-Origin: *`。Chrome 扩展依赖 manifest 的 `host_permissions`，不受影响；恶意网站则无法跨域调用这些接口。
- **Cookie picker 强制鉴权。** 之前在 `authToken` 未定义时会跳过鉴权。现在所有数据/动作路由都必须带 Bearer token。
- **`/health` token 只对扩展 Origin 放行。** 鉴权 token 仅在请求来自 `chrome-extension://` 时返回，防止 browse server 暴露到外部隧道时泄漏 token。
- **DNS rebinding 防护支持 IPv6。** 现在会同时校验 AAAA 记录，阻止 `fe80::` 这类链路本地地址。
- **修复 `validateOutputPath` 的 symlink 绕过。** 在词法校验之后再解析真实路径，从而捕获安全目录内部的符号链接逃逸。
- **`restoreState` 的 URL 校验。** 在导航前先校验已保存 URL，防止状态文件被篡改后触发危险跳转。
- **Telemetry 端点改用匿名 key。** 原来使用的是可绕过 RLS 的 service role key；现在改为公用 telemetry 端点使用 anon key。
- **`killAgent` 现在真的会杀掉子进程。** 通过 kill-file + 轮询实现跨进程终止。

## [0.15.6.2] - 2026-04-04 — Anti-Skip Review Rule

所有 review 类技能现在都强制评估每一个 section，不再允许出现“这是策略文档，所以实现章节不适用”这类跳过。某一节如果确实没问题，可以明确写无事可报再继续，但必须先看。

### 新增

- **4 个 review 技能全部加入 anti-skip 规则。** CEO review（sections 1-11）、eng review（sections 1-4）、design review（passes 1-7）、DX review（passes 1-8）现在都要求显式评估每一节。模型不能再用“计划类型不适用”来跳过。
- **CEO review 标题修正。** 把 “10 sections” 更正为 “11 sections”，与实际章节数一致（Section 11 虽然是条件章节，但确实存在）。

## [0.15.6.1] - 2026-04-04

### 修复

- **Skill prefix 自愈。** Setup 现在会在链接技能后，把 `gstack-relink` 当作最后一道一致性检查。如果中断的 setup、陈旧 git 状态或升级过程让 `name:` 字段与 `skill_prefix: false` 不一致，下一次 setup 会自动修正。不会再出现你想要 `/qa`，结果变成 `/gstack-qa` 的情况。

## [0.15.6.0] - 2026-04-04 — Declarative Multi-Host Platform

以前给 gstack 增加一个新的 coding agent，意味着要改 9 个文件，还得理解 `gen-skill-docs.ts` 的内部细节。现在只需要一个 TypeScript 配置文件加一个 re-export，其他地方零代码改动；测试也会自动参数化。

### 新增

- **声明式 host 配置系统。** 每个 host 都是 `hosts/*.ts` 里的一个强类型 `HostConfig` 对象。生成器、setup、skill-check、platform-detect、uninstall、worktree copy 都改为消费配置，而不是硬编码 `switch`。新增 host 只需一个文件和 `hosts/index.ts` 中的一行 re-export。
- **4 个新 host：OpenCode、Slate、Cursor、OpenClaw。** `bun run gen:skill-docs --host all` 现在能为 8 个 host 生成输出，每个都能产出合法的 `SKILL.md`，且不会泄漏 `.claude/skills` 路径。
- **OpenClaw 适配器。** OpenClaw 采用混合策略：路径/frontmatter/detection 用配置完成，语义层工具映射（Bash→exec、Agent→sessions_spawn、AskUserQuestion→普通 prose）通过后处理适配器完成；同时通过 `staticFiles` 配置带上 `SOUL.md`。
- **106 个新测试。** 71 个测试覆盖配置校验、`HOST_PATHS` 推导、导出 CLI、golden-file 回归和逐 host 正确性；35 个参数化 smoke 测试覆盖 7 个外部 host（输出存在、无路径泄漏、frontmatter 合法、freshness 正确、skip 规则正确）。
- **`host-config-export.ts` CLI。** 通过 `list`、`get`、`detect`、`validate`、`symlinks` 命令，把 host 配置暴露给 bash 脚本使用，不需要再手写 YAML 解析。
- **贡献者技能 `/gstack-contrib-add-host`。** 引导新增 host 配置，位于 `contrib/`，不会安装给普通用户。
- **Golden-file 基线。** 用 Claude、Codex、Factory 的 `ship/SKILL.md` 快照，确保这次重构产出的内容与之前字节级一致。
- **README 中的逐 host 安装说明。** 每个支持的 agent 都有自己的可复制安装块。

### 变更

- **`gen-skill-docs.ts` 现在完全由配置驱动。** 原本的 `EXTERNAL_HOST_CONFIG`、frontmatter host 分支、路径/工具重写链式判断、`ALL_HOSTS` 数组、skill skip 逻辑，全都改成从配置查询。
- **`types.ts` 从配置推导 Host 类型。** 不再硬编码 `'claude' | 'codex' | 'factory'`；`HOST_PATHS` 也改为根据各 config 的 `globalRoot` 和 `usesEnvVars` 动态构建。
- **Preamble、co-author trailer、resolver suppression 都改读配置。** `hostConfigDir`、co-author 字符串、suppressedResolvers 都不再通过 per-host `switch` 维护。
- **`skill-check.ts`、`worktree.ts`、`platform-detect` 全部按配置迭代。** 不再需要逐 host 维护分支。

### 修复

- **Sidebar E2E 测试现在自包含。** 修复了 `sidebar-url-accuracy` 的陈旧 URL 断言，并简化了 `sidebar-css-interaction` 任务。3 个 sidebar 测试都能在无外部浏览器依赖的前提下通过。

## [0.15.5.0] - 2026-04-04 — Interactive DX Review + Plan Mode Skill Fix

`/plan-devex-review` 现在更像是和一位真正用过上百个 CLI 工具的开发者关系工程师一起坐下来评审。它不再是机械地给 8 个维度打分，而是先问“你的开发者是谁”，再拿竞品 onboarding 时间做对标，让你先定义“魔法时刻”，再逐步追踪每一个 friction point，最后才评分。

### 新增

- **开发者 persona 盘问。** 评审一开始先确定你的开发者是谁，并给出具体画像（YC 创始人、平台工程师、前端开发者、开源贡献者等）。后续所有问题都会围绕这个 persona 展开。
- **共情叙事作为对话起点。** 在正式打分前，先展示一段第一人称的“我是刚发现你工具的开发者……”叙事，等你反馈修正后，再把修正版写回计划。
- **竞品 DX 对标。** 通过 WebSearch 查找竞品的 TTHW 和 onboarding 做法。你可以选目标档位：Champion（<2 分钟）、Competitive（2-5 分钟）或维持当前路线；之后所有 pass 都围绕这个目标展开。
- **魔法时刻设计。** 你要明确开发者的 “oh wow” 时刻应当如何发生：playground、demo command、视频、还是引导式教程；并同步分析各自的投入与取舍。
- **三种评审模式。** DX EXPANSION（追求最佳同类）、DX POLISH（把每个触点做到滴水不漏）、DX TRIAGE（只修关键缺口，尽快发货）。
- **摩擦点旅程追踪。** 不再是静态表格，而是真正沿着 README/docs 路径追踪，每发现一个 friction point 就问一个 AskUserQuestion。
- **首次开发者角色扮演。** 从指定 persona 视角出发，基于真实文档和代码，输出带时间感的“困惑报告”。

### 修复

- **Plan mode 里的 skill 调用终于可执行。** 当你在 plan mode 中调用一个 skill（例如 `/plan-ceo-review`）时，Claude 现在会把它当成一段要执行的指令，而不是忽略它并尝试退出。加载进来的 skill 会优先于通用的 plan mode 行为，STOP 点也终于会真正停下来。这个修复已经进到所有 skill 的 preamble。

## [0.15.4.0] - 2026-04-03 — Autoplan DX Integration + Docs

`/autoplan` 现在会自动识别面向开发者的计划，并在 Phase 3.5 自动运行 `/plan-devex-review`，包含完整双声道对抗式评审（Claude subagent + Codex）。只要计划里提到 API、CLI、SDK、agent actions 或其他开发者集成点，DX review 就会自动介入，不需要额外命令。

### 新增

- **`/autoplan` 集成 DX review。** 当检测到面向开发者的范围时，Eng review 之后会自动进入 Phase 3.5。包含 DX 专属的双外部视角、共识表和完整 8 维评分卡。触发条件包括 API、CLI、SDK、shell 命令、Claude Code skills、OpenClaw actions、MCP servers，以及任何需要开发者实现或调试的内容。
- **README 中新增 “Which review?” 对比表。** 快速说明什么时候该用面向终端用户的评审、开发者体验评审或架构评审，以及什么时候 `/autoplan` 会一次覆盖全部。
- **安装说明中加入 `/plan-devex-review` 和 `/devex-review`。** 这两个 skill 现在直接出现在可复制安装提示里，让新用户一开始就知道它们存在。

### 变更

- **Autoplan 流程顺序调整。** 现在顺序是 CEO → Design → Eng → DX（原来是 CEO → Design → Eng）。DX 被放到最后，因为它更适合建立在架构已明确的前提上。

## [0.15.3.0] - 2026-04-03 — Developer Experience Review

你现在可以在写代码之前，先审计划的开发者体验质量。`/plan-devex-review` 会对 8 个维度（getting started、API 设计、错误信息、文档、升级路径、开发环境、社区、度量）给出 0-10 分，并跟踪多次评审的趋势。发货后，`/devex-review` 会用 browse 工具真正去测试线上体验，并与计划阶段的分数做对比。

### 新增

- **`/plan-devex-review` skill。** 基于 Addy Osmani 框架的计划阶段 DX 评审。会自动识别产品类型（API、CLI、SDK、库、平台、文档、Claude Code skill），并包含开发者共情模拟、DX 评分卡趋势，以及针对技能本身的 Claude Code Skill DX 条件清单。
- **`/devex-review` skill。** 基于 browse 的线上 DX 审计。会实际测试 docs、getting started 流程、错误信息和 CLI help。每个维度都会标明是 TESTED、INFERRED 还是 N/A，并附截图证据。还支持回旋镖式比较：计划说 TTHW 3 分钟，现实是 8 分钟。
- **DX Hall of Fame 参考。** 可按需加载 Stripe、Vercel、Elm、Rust、htmx、Tailwind 等案例，避免一次性把 prompt 塞爆。
- **`{{DX_FRAMEWORK}}` resolver。** 把 DX 的核心原则、特征和评分规范抽成两个 skill 共享的一段 resolver，压缩到约 150 行，尽量少吃上下文。
- **DX Review 进入 dashboard。** 两个 skill 都会写 review log，并与 CEO、Eng、Design review 一起出现在 Review Readiness Dashboard。

## [0.15.2.1] - 2026-04-02 — Setup Runs Migrations

`git pull && ./setup` 现在会自动应用版本迁移。以前迁移只会在 `/gstack-upgrade` 期间运行，所以用 `git pull` 更新的用户拿不到状态修复（例如 v0.15.1.0 的 skill 目录重构）。现在 `./setup` 会记录上次运行的版本，并在每次执行时自动补齐待执行迁移。

### 修复

- **Setup 会执行待处理迁移。** `./setup` 现在会检查 `~/.gstack/.last-setup-version`，并运行所有更新于该版本之后的迁移脚本。`git pull` 后不会再因为没跑迁移而把技能目录搞坏。
- **兼容带空格路径的迁移循环。** 迁移脚本由 `for` 改为 `while read`，正确处理带空格的路径。
- **全新安装跳过历史迁移。** 新安装只写当前版本标记，不会运行不适用的历史迁移。
- **未来版本迁移保护。** 版本号高于当前 `VERSION` 的迁移会被跳过，避免开发分支上的迁移被提前执行。
- **缺少 VERSION 的保护。** 如果 `VERSION` 文件不存在，就不会写入版本标记，防止永久性污染迁移状态。

## [0.15.2.0] - 2026-04-02 — Voice-Friendly Skill Triggers

你现在可以说“run a security check”，而不是死记 `/cso`。技能支持了更适合语音输入的触发短语，能配合 AquaVoice、Whisper 以及其他语音转文字工具工作。不再需要和那些容易被转错的缩写打架（比如 “CSO” 被转成 “CEO”，最后触发错技能）。

### 新增

- **10 个技能的语音触发词。** 每个 skill 都把自然语言别名直接烘焙进 description。像 “see-so”“security review”“tech review”“code x”“speed test” 这样的短语，即使语音转写把命令名搞坏，也能触发正确的 skill。
- **模板中的 `voice-triggers:` YAML 字段。** 作者只要在 `.tmpl` frontmatter 里维护别名，`gen-skill-docs` 就会在生成时把它们折叠进 description。源文件干净，输出也干净。
- **README 中新增语音输入说明。** 新用户第一天就知道这些技能也能配合语音使用。
- **`voice-triggers` 写进 CONTRIBUTING.md。** frontmatter 合约已更新，贡献者会知道这个字段存在。

## [0.15.1.0] - 2026-04-01 — Design Without Shotgun

现在你不必先跑 `/design-shotgun`，也能直接使用 `/design-html`。这个 skill 会自动检测现有的设计上下文（CEO 计划、design review 产物、已批准 mockup），并询问你想从哪里开始。你可以从计划、自然语言描述，或一张 PNG 开始，而不必局限于已批准 mockup。

### 变更

- **`/design-html` 支持任意起点。** 三种路由模式：(A) 来自 `/design-shotgun` 的已批准 mockup；(B) 有 CEO plan 和/或设计变体，但还没正式批准；(C) 干净起步，只有一段描述。每种模式都会问对应的问题，并按情况继续。
- **缺失上下文时改为 AskUserQuestion。** 不再用 “no approved design found” 直接把流程堵死，而是给出选择：先跑 planning skills、提供一张 PNG，或者直接描述你想要什么并现场开始设计。

### 修复

- **技能现在按顶层名字被发现。** Setup 不再创建目录 symlink，而是创建真实目录，并在目录内放 `SKILL.md` symlink。这修复了 `--no-prefix` 模式下 Claude 自动给技能名加 `gstack-` 前缀的问题。现在 `/qa` 就是 `/qa`，不再变成 `/gstack-qa`。

## [0.15.0.0] - 2026-04-01 — Session Intelligence

你的 AI 会话现在会记得之前发生过什么。计划、评审、checkpoint 和 health score 都能跨上下文压缩和多次会话保留下来。每个 skill 都会写 timeline 事件，而 preamble 会在启动时读取最近产物，让 agent 直接知道你上次停在哪。

### 新增

- **Session timeline。** 每个 skill 都会自动把 start/complete 事件写入 `timeline.jsonl`。纯本地、永不外发，而且不受 telemetry 设置影响，始终开启。`/retro` 现在可以显示诸如“本周：3 次 `/review`、2 次 `/ship`，跨 3 个分支”。
- **上下文恢复。** 在会话启动或上下文压缩之后，preamble 会列出最近的 CEO plans、checkpoints 和 reviews。Agent 会读取最近一条，恢复决策和进度，不再让你重复讲一遍。
- **跨会话注入。** 新会话启动时，preamble 会打印当前分支上次运行的 skill 和最近一个 checkpoint。你在输入任何东西之前，就能看到类似 “Last session: /review (success)” 的提示。
- **预测式 skill 建议。** 如果某个分支最近 3 次会话形成了固定模式（例如 review、ship、review），gstack 会猜测你下一步大概率要做什么并给出建议。
- **欢迎回来消息。** 会话会自动综合出一段简报：当前分支、上次 skill、checkpoint 状态、health score。
- **`/checkpoint` skill。** 保存和恢复工作快照，记录 git 状态、已做决策和剩余工作，也支持跨分支列出，适合 Conductor workspace 之间的 agent 交接。
- **`/health` skill。** 代码质量记分员。包装你项目里的 tsc、biome、knip、shellcheck、tests 等工具，计算一个综合 0-10 分，并跟踪趋势。分数下降时，它会直接指出哪里变差、该去哪里修。
- **Timeline 二进制。** `bin/gstack-timeline-log` 和 `bin/gstack-timeline-read`，用于 append-only 的 JSONL timeline 存储。
- **路由规则。** `/checkpoint` 和 `/health` 已加入 skill routing 注入。

## [0.14.6.0] - 2026-03-31 — Recursive Self-Improvement

gstack 现在会从自己的错误里学习。每次 skill 会话都会捕获操作层失败（CLI 错误、错误做法、项目怪癖），并在未来会话中重新提醒。不需要配置，默认生效。

### 新增

- **运营层自我改进。** 当某个命令失败，或者你踩到了项目特有的坑，gstack 会记下来。下次再来，它就记得了。比如 “bun test 需要 `--timeout 30000`” 或 “登录流程必须先导入 cookie” 这类每次忘记都会白白浪费 10 分钟的事。
- **Preamble 里的 learnings 摘要。** 当你的项目累计 5 条以上 learnings 时，gstack 会在每次会话开始时展示最重要的 3 条，让你一开工就看到。
- **13 个技能接入学习。** office-hours、plan-ceo-review、plan-eng-review、plan-design-review、design-review、design-consultation、cso、qa、qa-only、retro 等，都开始既读取过去 learnings，也贡献新的 learnings。以前只有 review、ship 和 investigate 接上了。

### 变更

- **Contributor mode 被替换。** 旧的 contributor mode 需要手动 opt-in，还会把 markdown 报告写到 `~/.gstack/contributor-logs/`，但在 18 天高频使用里一次都没真正触发。现在换成自动的 operational learning，不需要设置，就能捕获同类信息。

### 修复

- **`learnings-show` E2E 测试的 slug 不匹配。** 原测试把 learnings 写进了一个硬编码路径，而运行时 `gstack-slug` 算出来是另一条路径。现在会动态计算 slug。

## [0.14.5.0] - 2026-03-31 — Ship Idempotency + Skill Prefix Fix

在 push 失败或 PR 创建失败后重新运行 `/ship`，现在不会再次 bump 版本，也不会重复写 CHANGELOG。如果你用的是 `--prefix` 模式，技能名也终于会按你的设置真正生效。

### 修复

- **`/ship` 现在具备幂等性（#649）。** 如果 push 成功但 PR 创建失败（例如 API 故障或限流），重新运行 `/ship` 时会识别已经 bump 过的 `VERSION`，如果远端已经同步则跳过 push，并更新现有 PR body，而不是重新创建一个重复 PR。CHANGELOG 步骤本来就按“用统一条目覆盖”设计，因此无需额外 guard。
- **Skill prefix 现在真的会补丁 `SKILL.md` 的 `name:` 字段（#620、#578）。** `./setup --prefix` 和 `gstack-relink` 现在会同步修改每个 skill frontmatter 里的 `name:`，使之与前缀设置保持一致。以前 symlink 虽然带前缀，但 Claude Code 实际读取的是没前缀的 `name:` 字段，导致前缀完全失效。各种边界情况也都处理好了：`gstack-upgrade` 不会双重加前缀，根 `gstack` skill 永远不加前缀，移除前缀时会恢复原名。
- **`gen-skill-docs` 会在需要重新应用前缀补丁时发出提醒。** 重新生成 `SKILL.md` 后，如果配置中 `skill_prefix: true`，会提示你运行 `gstack-relink`。
- **PR 幂等检查会验证 open 状态。** 现在只有现有 PR 仍处于 `OPEN` 时才会阻止新 PR 创建；已关闭 PR 不再阻塞后续创建。
- **修复 `--no-prefix` 顺序问题。** `gstack-patch-names` 现在会在 `link_claude_skill_dirs` 之前执行，让 symlink 名字反映正确的补丁结果。

### 新增

- **共享辅助脚本 `bin/gstack-patch-names`。** 把 setup 和 `gstack-relink` 共用的 name patch 逻辑提取出来，复用性更好。它能处理无 frontmatter、已加前缀、天生就带前缀目录等边界情况，并采用可移植的 `mktemp + mv` + sed 实现。

### 面向贡献者

- `relink.test.ts` 中新增 4 个 `name:` patch 单测。
- 为 `gen-skill-docs` 的 prefix warning 新增 2 个测试。
- 为 ship 幂等新增 1 个 E2E 测试（周期层）。
- 更新了 `setupMockInstall`，让它写出带正确 frontmatter 的 `SKILL.md`。

## [0.14.4.0] - 2026-03-31 — Review Army: Parallel Specialist Reviewers

每次 `/review` 现在都会并行派发专项 reviewer。以前是一个 agent 硬套一个超长 checklist；现在则是多个聚焦 reviewer 分别负责测试缺口、可维护性、安全、性能、数据迁移、API 合约、对抗式红队。每个 reviewer 都会带着全新上下文独立阅读 diff，输出结构化 JSON finding，主 agent 再统一合并、去重，并在多个 reviewer 同时发现同一问题时提升置信度。小 diff（<50 行）为了速度会直接跳过专项 reviewer；大 diff（200+ 行）则会额外开启 Red Team 做更激进的分析。

### 新增

- **7 个并行专项 reviewer。** 通过 Agent tool 的 subagents 并发运行。常驻：Testing + Maintainability；条件启用：Security（auth 范围）、Performance（后端/前端）、Data Migration（迁移文件）、API Contract（controllers/routes）、Red Team（大 diff 或关键 finding）。
- **JSON finding schema。** 专项 reviewer 输出结构化 JSON，包含 severity、confidence、path、line、category、fix、fingerprint 字段。告别脆弱的管道分隔纯文本。
- **基于 fingerprint 的去重。** 当两个专项 reviewer 命中同一 `file:line:category` 时，该 finding 会被提置信度，并标记为 `MULTI-SPECIALIST CONFIRMED`。
- **PR Quality Score。** 每次 review 都会计算一个 0-10 的质量分：`10 - (critical * 2 + informational * 0.5)`，并写入 review history，供 `/retro` 做趋势分析。
- **3 个新的 diff-scope 信号。** `gstack-diff-scope` 新增 `SCOPE_MIGRATIONS`、`SCOPE_API`、`SCOPE_AUTH`，帮助自动启用正确的专项 reviewer。
- **基于 learnings 的专项 reviewer prompt。** 各专项 reviewer 都会注入本领域历史 learnings，让评审随时间越来越聪明。
- **14 个新的 diff-scope 测试。** 覆盖 9 个 scope 信号，其中包括这次新增的 3 个。
- **7 个新的 E2E 测试。** 包括迁移安全、N+1 检测、交付完整性审计、质量分、JSON schema 合规、red team 激活、多 reviewer 共识等。

### 变更

- **Review checklist 重构。** 已经被专项 reviewer 覆盖的类别（测试缺口、死代码、魔法数字、性能、密码学等）从主 checklist 移除。主 agent 现在聚焦在关键性 pass。
- **Delivery Integrity 增强。** 现有的计划完成度审计不再只回答“缺了什么”，还会追问“为什么缺”。计划文件与实现的偏差会被记录成 learnings。基于 commit message 的推断则只做信息提示，不会持久化。

## [0.14.3.0] - 2026-03-31 — Always-On Adversarial Review + Scope Drift + Plan Mode Design Tools

现在每一次代码评审都会同时运行 Claude 和 Codex 的对抗式分析，不再根据 diff 大小决定是否跳过。一个 5 行的鉴权修改，也会得到和 500 行功能改动同样的跨模型审视。“小 diff 可以跳过 adversarial” 这个旧启发式已经彻底废弃，因为 diff 大小从来就不是风险的好代理。

### 新增

- **始终开启的对抗式评审。** 每次 `/review` 和 `/ship` 都会同时派发一个 Claude adversarial subagent 和一次 Codex adversarial challenge。不再按 tier 跳过。Codex 的 structured review（正式的 P1 pass/fail gate）仍只在大 diff（200+ 行）时运行，因为那时形式化 gate 更有价值。
- **`/ship` 中的 scope drift 检测。** 发货前，`/ship` 现在会检查你是否真的只做了原计划说要做的内容，不多也不少。能发现 “顺手又改了点别的” 这类 scope creep，以及漏掉的需求，结果会出现在 PR body 里。
- **Plan mode 安全操作。** 在 plan mode 里，现在明确允许 browse 截图、设计 mockup、Codex 外部声音，以及写入 `~/.gstack/`。设计相关技能（`/design-consultation`、`/design-shotgun`、`/design-html`、`/plan-design-review`）可以在计划阶段生成视觉产物，而不会再和 plan mode 限制打架。

### 变更

- **Adversarial opt-out 拆分。** 旧配置 `codex_reviews=disabled` 现在只控制 Codex 路径；Claude adversarial subagent 因为又快又免费，始终执行。以前这个开关会把所有东西都关掉。
- **跨模型张力格式统一。** 外部声音的分歧现在也会带上 `RECOMMENDATION` 和 `Completeness` 分数，与 gstack 其他地方的 AskUserQuestion 标准格式保持一致。
- **Scope drift 抽成共享 resolver。** 从 `/review` 中提取为 `generateScopeDrift()`，现在 `/review` 和 `/ship` 共用同一套逻辑。

## [0.14.2.0] - 2026-03-30 — Sidebar CSS Inspector + Per-Tab Agents

Sidebar 现在变成了视觉设计工具。你可以在页面上点任意元素，直接在 Side Panel 里看到完整的 CSS 级联规则、盒模型和计算样式，还能实时改样式立刻看效果。每个浏览器 tab 也都有独立 agent，不再串台。页面清理则交给 LLM：agent 会先快照页面，做语义理解，再移除垃圾元素，同时保留网站原有的辨识度。

### 新增

- **Sidebar 中的 CSS Inspector。** 点击 “Pick Element”，在页面上悬停并选中元素后，sidebar 会显示完整的 CSS 规则级联、specificity badge、源码 `file:line`、盒模型可视化，以及计算样式。体验接近 Chrome DevTools，但直接内嵌在 sidebar 里。
- **实时样式编辑。** `$B style .selector property value` 可通过 CDP 实时修改 CSS 规则，页面即时生效。可用 `$B style --undo` 撤销。
- **Per-tab agents。** 每个浏览器 tab 都有自己的 Claude agent 进程，通过 `BROWSE_TAB` 环境变量隔离。切换浏览器 tab 时，sidebar 会同步切换聊天历史。你可以并行和多个页面对话，而不会相互抢焦点。
- **Tab 跟踪。** 用户自己新开的 tab（Cmd+T、右键“在新标签页中打开”等）也会通过 `context.on('page')` 自动被纳入跟踪。Sidebar 的 tab 栏会实时更新，点击栏中的 tab 可反向切换浏览器；关闭 tab 后也会自动移除。
- **LLM 驱动的页面清理。** 清理按钮会把 prompt 发送给 sidebar agent（它本身就是 LLM）。Agent 先做一轮确定性清理，再对页面做 snapshot、语义分析，并智能移除干扰元素，同时保留品牌识别。无需写死脆弱的 CSS 选择器，几乎任何站点都可用。
- **Pretty screenshots。** `$B prettyscreenshot --cleanup --scroll-to ".pricing" ~/Desktop/hero.png` 一条命令同时完成清理、滚动定位与截图。
- **Stop 按钮。** 当 agent 正在工作时，sidebar 会出现红色 stop 按钮，可以手动取消当前任务。
- **Inspector 的 CSP 降级方案。** 对 CSP 很严的网站（如 SF Chronicle），会通过始终加载的 content script 提供基础拾取能力。依然能看到计算样式、盒模型和同源 CSS 规则；允许时则自动切回完整 CDP 模式。
- **聊天工具栏里的 Cleanup + Screenshot 按钮。** 不再藏在 debug 视图里，而是直接出现在聊天工具栏中；断开连接时会自动禁用，避免报错刷屏。

### 修复

- **Inspector 消息白名单。** `background.js` 的 allowlist 之前漏掉了所有 inspector 消息类型，导致 inspector 在所有页面上都悄悄失效，而不只是 CSP 严格页面。（由 Codex review 发现）
- **Sticky nav 保留。** 清理逻辑不再错误移除网站顶部导航栏。现在会按位置排序 sticky 元素，并保留顶部附近第一个接近全宽的元素。
- **Agent 停不下来。** 系统 prompt 现在明确要求 agent 简洁并在任务完成后停下，不再陷入无尽的 screenshot/highlight 循环。
- **抢焦点问题。** Agent 命令不再把 Chrome 强行切到前台。内部 tab pinning 改为 `bringToFront: false`。
- **聊天消息去重。** 重连后不会再重复展示旧会话的消息。

### 变更

- **Sidebar banner** 现在显示为 “Browser co-pilot”，不再是旧的模式特定文案。
- **输入框 placeholder** 改成 “Ask about this page...”，比旧版本更自然。
- **系统 prompt** 加入了 prompt injection 防护和允许命令白名单，来源于安全审计结果。

## [0.14.1.0] - 2026-03-30 — Comparison Board is the Chooser

设计对比板在评审变体时现在总会自动打开。不再是把图片内联给你看，再问“你喜欢哪一个？”；真正的体验是 comparison board，本身就有评分控件、评论、remix/regenerate 按钮和结构化反馈输出。`/plan-design-review`、`/design-shotgun`、`/design-consultation` 三个设计技能都统一到了这条路径。

### 变更

- **Comparison board 变成强制路径。** 生成设计变体后，agent 会通过 `$D compare --serve` 创建比较面板，并通过 AskUserQuestion 把 URL 发给你。你在面板上打分、评论并点击 Submit，agent 再从 `feedback.json` 读取结构化反馈。不再把轮询循环当作主等待机制。
- **AskUserQuestion 只负责等待，不负责替你选。** Agent 用 AskUserQuestion 告诉你比较面板已经打开，并等待你完成，而不是直接在消息里把变体平铺出来让你二选一。问题里总会包含 board URL，即便你把标签页关丢了也能重新打开。
- **Serve 失败时的回退更好。** 如果 comparison board server 起不来，agent 会先通过 Read 工具把变体内联展示出来，再询问偏好，而不是让你盲选。

### 修复

- **Board URL 修正。** 恢复用的 URL 现在指向 `http://127.0.0.1:<PORT>/`（服务真实监听的位置），而不是会 404 的 `/design-board.html`。

## [0.14.0.0] - 2026-03-30 — Design to Code

你现在可以用一条命令，把已批准的设计 mockup 变成可生产使用的 HTML。`/design-html` 会拿到 `/design-shotgun` 里胜出的设计，生成 Pretext 原生 HTML：文字会在 resize 时真实回流，高度会随内容变化，布局也是动态的。不再出现硬编码 CSS 高度和被截断的文字溢出。

### 新增

- **`/design-html` skill。** 接收来自 `/design-shotgun` 的已批准 mockup，生成自包含 HTML，并用 Pretext 处理动态文字布局。它会针对不同设计类型自动选择合适的 Pretext 模式（简单布局、卡片网格、聊天气泡、编辑式版面等），同时内置一个 refinement loop：你可以在浏览器里预览、反馈、继续迭代，直到满意为止。
- **Vendored Pretext。** 在 `design-html/vendor/pretext.js` 中内置了 30KB 的 Pretext 源码，用于离线、零依赖地产出 HTML。若输出目标是 React/Svelte/Vue 等框架版本，则改用 npm 安装。
- **设计流水线串联。** `/design-shotgun` 的 Step 6 现在会把 `/design-html` 作为下一步建议；`/design-consultation` 在生成 screen-level 设计后也会建议它；`/plan-design-review` 现在会同时把 `/design-shotgun` 和 `/design-html` 纳入推荐链路。

### 变更

- **`/plan-design-review` 的后续步骤扩展。** 过去只会串到其他 review skill；现在还会提供 `/design-shotgun`（探索变体）和 `/design-html`（把已批准 mockup 生成为 HTML）。

## [0.13.10.0] - 2026-03-29 — Office Hours Gets a Reading List

反复使用 `/office-hours` 的用户，现在每次会话都能拿到新的精选资料，而不是一遍遍看到同一个 YC 结尾。系统会从 Garry Tan、Lightcone Podcast、YC Startup School、Paul Graham 等内容里挑选 34 个手工筛选的视频与文章，并根据本次会话的内容做匹配。它也会记住之前给你看过什么，因此同一条推荐不会重复出现。

### 新增

- **`/office-hours` 结尾的轮换式创业者资料。** 34 条精选资源分布在 5 类（Garry Tan 视频、YC Backstory、Lightcone Podcast、YC Startup School、Paul Graham 文章）中。Claude 会依据会话上下文挑 2-3 条，而不是随机丢给你。
- **资源去重日志。** 用 `~/.gstack/projects/$SLUG/resources-shown.jsonl` 跟踪已经展示过的资源，让高频用户持续看到新内容。
- **资源选择分析。** 会把被挑中的资源记录到 `skill-usage.jsonl`，方便你长期观察模式。
- **浏览器打开建议。** 在展示资源后，会询问是否顺手帮你在浏览器里打开，方便稍后阅读。

### 修复

- **构建脚本的 chmod 保险。** `bun build --compile` 的产物现在会额外显式执行 `chmod +x`，避免在 workspace 克隆或文件传输后丢失可执行权限，出现 “permission denied”。

## [0.13.9.0] - 2026-03-29 — Composable Skills

技能现在可以内联加载其他技能了。在模板里写 `{{INVOKE_SKILL:office-hours}}`，生成器就会自动输出正确的 “读文件、跳过 preamble、按说明执行” prose，同时能处理 host 感知路径和可定制的跳过列表。

### 新增

- **`{{INVOKE_SKILL:skill-name}}` resolver。** 组合式 skill 加载成为一等 resolver。它会为 Claude 或 Codex 生成 host 感知的 prose，指引模型去读取另一个 skill 的 `SKILL.md` 并内联执行，同时跳过 preamble 段；还支持通过 `skip=` 参数额外指定要跳过的章节。
- **带参数 resolver 支持。** placeholder 的正则现在支持 `{{NAME:arg1:arg2}}`，使生成阶段可以拥有带参数的 resolver，同时保持对现有 `{{NAME}}` 写法的完全兼容。
- **`{{CHANGELOG_WORKFLOW}}` resolver。** 把 changelog 生成逻辑从 `/ship` 中抽成复用 resolver，并把“先说用户现在能做什么”这类写作指导一并内嵌。
- **Skill 注册 frontmatter `name:`。** Setup 和 `gen-skill-docs` 现在会读取 `SKILL.md` frontmatter 中的 `name:` 作为 symlink 名称来源，从而支持“目录名和调用名不同”的情形（例如 `run-tests/` 目录注册成 `/test`）。
- **主动式 skill 路由。** Skills 现在会询问一次，是否要把 routing rules 写进项目的 `CLAUDE.md`。这样 Claude 能自动调用正确的 skill，而不是直接裸答。你的选择会记在 `~/.gstack/config.yaml`。
- **带注释的配置文件。** `~/.gstack/config.yaml` 第一次创建时会自动写入带说明的头部，把每个设置项解释清楚，方便你随时手改。

### 变更

- **BENEFITS_FROM 现在委托给 INVOKE_SKILL。** 去掉了重复的 skip-list 逻辑；BENEFITS_FROM 只负责“先提出使用前置 skill 的建议”，真正的“去读并执行”指令都来自 INVOKE_SKILL。
- **`/plan-ceo-review` 的中途回退路径改用 INVOKE_SKILL。** 也就是“用户无法清楚说明问题，建议先跑 `/office-hours`”这条路，不再手写内联 prose。
- **更强的路由措辞。** office-hours、investigate、ship 的 description 从 “Proactively suggest” 改成 “Proactively invoke”，提升自动触发可靠性。

### 修复

- **配置 grep 现在锚定行首。** 带注释的 header 行不会再盖过真正的配置值。

## [0.13.8.0] - 2026-03-29 — Security Audit Round 2

Browse 的输出现在会被信任边界标记包裹，这样 agent 能区分页面内容和工具输出；标记也无法被页面内容逃逸。Chrome 扩展开始校验消息发送者，CDP 只绑定 localhost，Bun 安装也加入了校验和验证。

### 修复

- **信任边界标记无法被逃逸。** URL 会被清洗（去掉换行），标记字符串在内容里也会被转义，恶意页面不能再伪造 END 标记逃出不受信任块。

### 新增

- **内容信任边界标记。** 所有会返回页面内容的 browse 命令（`text`、`html`、`links`、`forms`、`accessibility`、`console`、`dialog`、`snapshot`、`diff`、`resume`、`watch stop`）现在都会用 `--- BEGIN/END UNTRUSTED EXTERNAL CONTENT ---` 包裹输出。模型可以明确知道哪些是页面内容，哪些是工具说明。
- **扩展发送者校验。** Chrome 扩展拒绝未知 sender 的消息，并对消息类型实施 allowlist，阻止跨扩展消息伪造。
- **CDP 只绑定 localhost。** `bin/chrome-cdp` 现在会传 `--remote-debugging-address=127.0.0.1` 和 `--remote-allow-origins`，避免远程调试接口被暴露。
- **带校验和验证的 bun 安装。** Browse `SKILL.md` 的 bootstrap 不再直接 `curl | bash`，而是先下载到临时文件，校验 SHA-256 后再执行。

### 移除

- **移除 Factory Droid 支持。** 删除了 `--host factory`、`.factory/` 生成技能、Factory CI 检查及所有 Factory 专用代码路径。

## [0.13.7.0] - 2026-03-29 — Community Wave

合并了 6 个社区修复，并新增了 16 个测试。Telemetry 关闭现在意味着所有地方都真的关闭；技能也终于能按名字被找到；改前缀设置也终于会生效。

### 修复

- **Telemetry 关闭就真的是完全关闭。** 当你把 telemetry 设为 off 时，gstack 不再写任何本地 JSONL 分析文件。以前“关闭”只是不再远程上报，现在则是哪都不写，契约更干净。
- **用 POSIX `-exec rm` 替换 `find -delete`。** 在 Safety Net 这类非 GNU 环境里不再报错。
- **不再预警上下文将耗尽。** `/plan-eng-review` 不再提前提醒你快没上下文了，系统会自行处理 compaction。
- **更新 Sidebar 安全测试。** 跟进 Write 工具回退字符串的变更。
- **`gstack-relink` 不再给 `gstack-upgrade` 重复加前缀。** `skill_prefix=true` 时以前会生成 `gstack-gstack-upgrade`，现在与 `setup` 行为一致。

### 新增

- **技能可发现性。** 每个 skill 的 description 现在都包含 `(gstack)`，便于你在 Claude Code 的命令面板里搜索到它们。
- **`/ship` 的 feature signal 检测。** 版本 bump 现在会额外检查新 route、migration、测试+源码成对变更，以及 `feat/` 分支，能抓住只看 diff 行数时会漏掉的 MINOR 级变化。
- **Sidebar Write 工具。** Sidebar agent 和 headed-mode server 都把 Write 放进了 allowedTools。Write 并没有比 Bash 扩大更多攻击面。
- **Sidebar stderr 捕获。** Sidebar agent 现在会缓存 stderr，并把它附带到 error 和 timeout 消息中，而不是静默吞掉。
- **`bin/gstack-relink`。** 当你通过 `gstack-config set` 修改 `skill_prefix` 后，它可以重建技能 symlink，不用再手动重跑 `./setup`。
- **`bin/gstack-open-url`。** 跨平台 URL 打开器：macOS 用 `open`，Linux 用 `xdg-open`，Windows 用 `start`。

## [0.13.6.0] - 2026-03-29 — GStack Learns

每一次会话，都会让下一次变得更聪明。gstack 现在会跨会话记住模式、坑点和偏好，并用它们去改进 review、plan、debug、ship 等所有流程。你用得越久，它越贴近你的代码库。

### 新增

- **项目级 learnings 系统。** gstack 会在 `/review`、`/ship`、`/investigate` 等技能中自动捕获发现到的模式和坑点，按项目存储到 `~/.gstack/projects/{slug}/learnings.jsonl`，采用 append-only、兼容 Supabase 的 schema。
- **`/learn` skill。** 可以查看学到了什么（`/learn`）、搜索（`/learn search auth`）、清理陈旧条目（`/learn prune`）、导出为 markdown（`/learn export`）、看统计（`/learn stats`），也可以手工添加（`/learn add`）。
- **置信度校准。** 每条 review finding 都会带上 1-10 的置信度。高置信（7+）正常展示，中等（5-6）带 caveat 展示，低置信（<5）直接压掉，减少“狼来了”。
- **“Learning applied” 提示。** 当新的 finding 命中旧 learning 时，gstack 会显式展示：“Prior learning applied: [pattern] (confidence 8/10, from 2026-03-15)”。
- **跨项目发现。** gstack 能在你其他项目的 learnings 中搜索相似模式。默认要先通过一次 AskUserQuestion 获得同意，且始终只在你的本机范围内进行。
- **置信度衰减。** 观察类和推断类 learnings 每 30 天下降 1 点；用户明确表达的偏好则永不衰减。好模式可以永久成立，不确定观察会逐渐淡出。
- **Preamble 显示 learnings 数量。** 每个 skill 启动时都会显示 “LEARNINGS: N entries loaded”。
- **5 个发布周期的路线设计文档。** `docs/designs/SELF_LEARNING_V0.md` 描述了从 R1（GStack Learns）到 R4（`/autoship`，一键全功能）再到 R5（Studio）的路线。

## [0.13.5.1] - 2026-03-29 — Gitignore .factory

### 变更

- **停止跟踪 `.factory/` 目录。** 生成出来的 Factory Droid skill 文件现在会像 `.claude/skills/` 和 `.agents/` 一样被 gitignore，仓库里删除了 29 个生成的 `SKILL.md` 文件。需要时由 `setup` 脚本和 `bun run build` 按需重新生成。

## [0.13.5.0] - 2026-03-29 — Factory Droid Compatibility

gstack 现在可以和 Factory Droid 一起工作。在 Droid 里输入 `/qa`，就能获得与 Claude Code 中一样的 29 个技能。这让 gstack 成为第一个同时兼容 Claude Code、Codex 和 Factory Droid 的 skill 库。

### 新增

- **Factory Droid 支持（`--host factory`）。** 可用 `bun run gen:skill-docs --host factory` 生成原生 Factory 技能，安装到 `.factory/skills/`，并带上合适的 frontmatter（例如对 `/ship`、`/land-and-deploy` 这类敏感技能加上 `user-invocable: true`、`disable-model-invocation: true`）。
- **`--host all` 参数。** 一条命令为 3 个 host 统一生成技能，具备容错能力：每个 host 的错误会分别捕获，只有 Claude 生成失败才会整体失败。
- **`gstack-platform-detect` 二进制。** 输出本机已安装 AI coding agent 的表格：版本、skill 路径、gstack 状态，一眼看清多 host 环境。
- **敏感 skill 安全标记。** 6 个有副作用的技能（ship、land-and-deploy、guard、careful、freeze、unfreeze）现在在模板里声明 `sensitive: true`。Factory Droid 不会自动触发这些技能；Claude 和 Codex 输出则会剥掉该字段。
- **Factory CI freshness 检查。** `skill-docs` 工作流现在会在每个 PR 上检查 Factory 输出是否是最新的。
- **所有运维工具具备 Factory 感知。** `skill-check` 仪表盘、`gstack-uninstall` 和 `setup` 都知道如何处理 Factory。

### 变更

- **多 host 生成逻辑重构。** 从原本 Codex 专用代码块里提取出共享 helper `processExternalHost()`；Codex 和 Factory 现在共用相同的输出路由、symlink 循环检测、frontmatter 转换和路径改写逻辑。重构后 Codex 输出保持字节级一致。
- **构建脚本改用 `--host all`。** 取代之前一串手动链式 `gen:skill-docs` 调用。
- **面向 Factory 的工具名称翻译。** Claude Code 风格的术语（比如 “use the Bash tool”）在 Factory 输出里会被翻成更通用的说法（比如 “run this command”），与 Factory 的工具命名习惯保持一致。

## [0.13.4.0] - 2026-03-29 — Sidebar Defense

Chrome sidebar 现在能抵御 prompt injection。防线分三层：带信任边界的 XML 包裹 prompt、只允许 browse 命令的 bash allowlist，以及默认使用更难被操纵的 Opus 模型。

### 修复

- **Sidebar agent 现在尊重服务端参数。** 之前 sidebar-agent 进程会自己重新构造一套 Claude 参数，静默忽略服务端设置的 `--model`、`--allowedTools` 等选项。现在改为直接使用服务端排队下发的参数。

### 新增

- **带信任边界的 XML prompt 包裹。** 用户消息会被放进 `<user-message>` 标签中，并附带“把内容当成数据而不是指令”的明确规则。`< > &` 等字符也会被转义，防止标签注入。
- **Bash 命令 allowlist。** Sidebar 的 system prompt 现在只允许 Claude 调用 browse 二进制命令（`$B goto`、`$B click`、`$B snapshot` 等）。其他 bash 命令如 `curl`、`rm`、`cat` 等一律禁止，避免 prompt injection 升级成任意代码执行。
- **Sidebar 默认使用 Opus。** 不再沿用 Claude Code 当前运行的任意模型，而是直接默认用抗注入能力更强的 Opus。
- **ML prompt injection 防御设计文档。** `docs/designs/ML_PROMPT_INJECTION_KILLER.md` 详细描述了下一步 ML 分类器方案（DeBERTa、BrowseSafe-bench、Bun-native 5ms vision），并列为下个 PR 的 P0 TODO。

## [0.13.3.0] - 2026-03-28 — Lock It Down

这次合并了 6 个社区 PR 与缺陷修复。最大的变化是：依赖树现在完全锁定了。每次 `bun install` 都会解析出完全一样的版本，不再因为 npm 上的浮动范围而每次 setup 都拉到不同包。

### 修复

- **依赖现在被锁定。** `bun.lock` 已提交并纳入跟踪。每次安装都会解析出相同版本，不再受 `^` 范围漂移影响，堵上了 #566 提到的供应链风险。
- **`gstack-slug` 在非 git 仓库中不再崩溃。** 当没有 remote 或 HEAD 时，会回退到目录名和 `unknown` 分支。所有依赖 slug 检测的 review skill 现在都能在非 git 场景工作。
- **`./setup` 不再在 CI 中卡死。** skill-prefix 提问在 10 秒后会自动选短名字，Conductor workspaces、Docker 构建和无人值守安装都能继续。
- **Browse CLI 可在 Windows 使用。** 服务器锁文件改用 `'wx'` 字符串标记，而不是 Bun 编译产物在 Windows 下处理不好的 `fs.constants` 数值。
- **`/ship` 和 `/review` 能找到你的设计文档。** 计划文件搜索现在会先看 `~/.gstack/projects/`，也就是 `/office-hours` 实际写设计文档的地方。之前会因为目录找错而静默跳过计划校验。
- **`/autoplan` 的双声道现在真的能跑。** 后台 subagents 无法读取文件（Claude Code 限制），导致 Claude 那一路一直悄悄失败。现在改为前台顺序执行，两路声音都能完成后再产出共识表。

### 新增

- **CLAUDE.md 中的社区 PR 护栏。** `ETHOS.md`、宣传材料和 Garry 的口吻现在都被标记为需要用户明确批准才可修改。

## [0.13.2.0] - 2026-03-28 — User Sovereignty

AI 模型现在学会了“建议，而不是越权决定”。当 Claude 和 Codex 都认为应该改 scope 时，它们会把这个分歧明确呈现给你，而不是直接替你做决定。你的方向默认优先，模型共识只是强信号，不是强制命令。

### 新增

- **ETHOS.md 中加入 User Sovereignty 原则。** 第三条核心原则：AI 负责提出建议，用户负责做决定。跨模型一致性只是强信号，不是最终裁决。
- **`/autoplan` 中新增 User Challenge 类别。** 当两个模型都认为你原本的方向应被调整时，会把它送到最终审批闸门，作为 “User Challenge” 而不是自动决策。除非你显式更改方向，否则仍以你的原始方向为准。
- **安全/可行性警告的表述更准确。** 当两个模型都把某事判断为安全风险时，提问会明确指出这是安全问题，而不是审美或偏好分歧。
- **CEO 和 Eng reviews 中的 Outside Voice Integration Rule。** Outside voice 的 finding 在你逐项明确批准之前都只算信息，不会直接生效。
- **所有 skill voice 中加入 User sovereignty 声明。** 每个 skill 都会强调：跨模型一致性只是建议，不是决定。

### 变更

- **Cross-model tension 模板不再说 “your assessment of who's right”。** 现在的措辞是“中性展示两边观点，并说明自己可能缺失什么上下文”。选项也从 Add/Skip 扩充为 Accept/Keep/Investigate/Defer。
- **`/autoplan` 现在有两个 gate，而不是一个。** 一个 gate 用于前提（Phase 1），另一个用于 User Challenge（两个模型都不认同你的方向）。Important Rules 也同步从“前提是唯一 gate”改成了“有两个 gate”。
- **Decision Audit Trail 会记录分类。** 每个自动决策都会标注它是 mechanical、taste，还是 user-challenge。

## [0.13.1.0] - 2026-03-28 — Defense in Depth

Browse server 默认跑在 localhost 且要求 token，因此这些问题只有在你的机器上已经有恶意进程时才真正重要（比如被投毒的 npm postinstall）。这次发布就是为了把攻击面进一步压缩到即使在这种情况下，损害也被限制住。

### 修复

- **从 `/health` 端点移除 auth token。** Token 现在改为通过 `.auth.json` 文件（`0o600` 权限）分发，而不是从一个未鉴权的 HTTP 响应里拿。
- **Cookie picker 的数据路由现在要求 Bearer 鉴权。** HTML picker 页面本身仍然开放（它只是 UI 壳），但所有数据和动作接口都会检查 token。
- **收紧 `/refs` 和 `/activity/*` 的 CORS。** 去掉了通配 Origin 头，网站不能再跨域读到 browse 活动数据。
- **状态文件 7 天自动过期。** Cookie state 文件现在带有时间戳，加载时如果过期会警告；服务启动时也会清理 7 天以前的文件。
- **扩展改用 `textContent` 而不是 `innerHTML`。** 即便服务端提供的数据将来意外带上 markup，也不会再造成 DOM 注入。属于标准的浏览器扩展防御加固。
- **路径校验先解析 symlink 再做边界检查。** `validateReadPath` 现在会调用 `realpathSync`，并正确处理 macOS `/tmp` 的符号链接问题。
- **Freeze hook 改用可移植路径解析。** 现在是 POSIX 兼容的，在没有 coreutils 的 macOS 也能工作，同时修复了 `/project-evil` 能错误命中 `/project` freeze 边界的漏洞。
- **Shell 配置脚本验证输入。** `gstack-config` 现在会拒绝带正则特殊字符的 key，并对 sed pattern 做转义；`gstack-telemetry-log` 也会清洗 branch/repo 名称后再写 JSON。

### 新增

- 覆盖全部上述加固点的 20 个回归测试。

## [0.13.0.0] - 2026-03-27 — Your Agent Can Design Now

gstack 现在能生成真正可看的 UI mockup 了。不是 ASCII 图，也不是一段写着十六进制颜色的文字描述，而是真正可以浏览、对比、选择和迭代的视觉设计。对着一个 UI 想法运行 `/office-hours`，你会在 Chrome 里得到 3 版视觉概念与一个 comparison board，用来挑喜欢的、给其他方案评分，并告诉 agent 应该怎么改。

### 新增

- **Design 二进制（`$D`）。** 一个新的编译型 CLI，封装 OpenAI 的 GPT Image API。包含 `generate`、`variants`、`iterate`、`check`、`compare`、`extract`、`diff`、`verify`、`evolve`、`prompt`、`serve`、`gallery`、`setup` 共 13 个命令，可在约 40 秒内根据结构化设计 brief 生成像素级 UI mockup。
- **Comparison board。** `$D compare` 会生成一个自包含 HTML 页面，把所有变体排出来，并包含星级评分、逐变体反馈、重新生成控件、remix 网格（例如把 A 的布局和 B 的配色组合）、以及 Submit 按钮。反馈通过 HTTP POST 回流给 agent，而不再依赖 DOM 轮询。
- **`/design-shotgun` skill。** 可随时独立运行的设计探索技能：生成多组 AI 设计变体、在浏览器里打开 comparison board，并持续迭代直到你确认方向。带会话记忆（记得之前探索过什么）、taste memory（把你的审美偏好反馈到下一轮生成里）、screenshot-to-variants（对不满意页面截图并要求改进）、可配置变体数量（3-8）。
- **`$D serve` 命令。** 用于 comparison board 反馈闭环的 HTTP server：在 localhost 提供面板、自动打开浏览器、通过 POST 收集反馈。状态可持续保留，跨轮次重新生成也能继续工作，并支持通过 `/api/progress` 轮询实现在同页刷新。
- **`$D gallery` 命令。** 为某个项目生成一条 HTML 时间线，汇总每次设计探索的所有变体与反馈，并按日期组织。
- **设计记忆。** `$D extract` 会用 GPT-4o vision 分析一张已批准 mockup，并把颜色、排版、间距、布局模式写入 `DESIGN.md`。之后同项目下的新 mockup 会自动继承这套视觉语言。
- **视觉 diff。** `$D diff` 可比较两张图片，按区域找差异并评估严重度；`$D verify` 则把线上页面截图和已批准 mockup 做比对，给出 pass/fail gate。
- **基于截图的进化。** `$D evolve` 直接拿你线上页面的截图，根据你的反馈生成“应该长成什么样”的 mockup。从现实页面出发，而不是从空白画布出发。
- **响应式变体。** `$D variants --viewports desktop,tablet,mobile` 可以一次为多个视口尺寸生成 mockup。
- **Design-to-code prompt。** `$D prompt` 可从已批准 mockup 中提取实现指令：精确十六进制颜色、字号、间距、组件结构，尽量消除“从设计到代码”的解释落差。

### 变更

- **`/office-hours` 默认会生成视觉 mockup 探索。** 可跳过。现在会先打开 comparison board 给你反馈，再继续生成 HTML wireframe。
- **`/plan-design-review` 使用 `{{DESIGN_SHOTGUN_LOOP}}` 驱动 comparison board。** 当某个设计维度低于 7/10 时，也能直接生成“10/10 应该长什么样”的 mockup。
- **`/design-consultation` 在 Phase 5 使用 `{{DESIGN_SHOTGUN_LOOP}}` 做 AI mockup 评审。**
- **Comparison board 提交后的生命周期更完整。** 提交后所有输入都会被禁用，并显示“Return to your coding agent”；重新生成期间会出现 spinner 并在新设计准备好后自动刷新；如果 server 已经消失，也会显示可复制 JSON 作为回退。

### 面向贡献者

- Design 二进制源码在 `design/src/`（16 个文件，约 2500 行 TypeScript）。
- 新增文件：`serve.ts`（有状态 HTTP server）、`gallery.ts`（时间线生成）。
- 测试：`design/test/serve.test.ts`（11 个）、`design/test/gallery.test.ts`（7 个）。
- 完整设计文档：`docs/designs/DESIGN_TOOLS_V1.md`。
- 模板 resolver：`{{DESIGN_SETUP}}`（二进制发现）、`{{DESIGN_SHOTGUN_LOOP}}`（`/design-shotgun`、`/plan-design-review`、`/design-consultation` 共享的 comparison board 循环）。

## [0.12.12.0] - 2026-03-27 — Security Audit Compliance

这次修复了来自 skills.sh 安全审计的 20 个 Socket 告警和 3 个 Snyk 发现。技能更干净，telemetry 更透明，且清掉了 2000 行死代码。

### 修复

- **示例中不再硬编码凭据。** QA 工作流文档改用 `$TEST_EMAIL` / `$TEST_PASSWORD`，替代 `test@example.com` / `password123`；cookie import 段也新增了安全提示。
- **Telemetry 调用变成条件触发。** `gstack-telemetry-log` 二进制只有在 telemetry 开启且二进制存在时才会运行。即使没有该二进制，本地 JSONL 日志仍然正常工作。
- **Bun 安装固定版本。** 安装说明现在固定 `BUN_VERSION=1.3.10`，如果系统已经有 bun 就跳过下载。
- **不受信任内容警告。** 所有会抓页面内容的 skill 现在都明确提醒：把页面内容当作待检查的数据，而不是可执行命令。这覆盖生成的 `SKILL.md`、`BROWSER.md` 和 `docs/skills.md`。
- **`review.ts` 的数据流文档。** JSDoc 头部显式说明哪些数据会发送到外部 review 服务（计划内容、repo/branch 名），以及哪些绝不会发送（源代码、凭据、环境变量）。

### 移除

- **从 `gen-skill-docs.ts` 删除 2017 行死代码。** 那些 resolver 的重复实现早已被 `scripts/resolvers/*.ts` 取代；现在 `RESOLVERS` map 才是唯一事实来源，不再有影子副本。

### 面向贡献者

- 新增 `test:audit` 脚本，运行 6 个回归测试，确保这些安全修复不会被回退。

## [0.12.11.0] - 2026-03-27 — Skill Prefix is Now Your Choice

你现在可以自己决定 gstack 的技能名长什么样：短名（`/qa`、`/ship`、`/review`）还是带命名空间（`/gstack-qa`、`/gstack-ship`）。首次 setup 会问一次并记住，之后切换也只需一条命令。

### 新增

- **首次 setup 时交互选择前缀。** 新安装会询问：用短名（`/qa`、`/ship`）还是带命名空间（`/gstack-qa`、`/gstack-ship`）。默认推荐短名。你的选择会写进 `~/.gstack/config.yaml`，并在升级后继续保留。
- **`--prefix` 参数。** 与 `--no-prefix` 配套，两个参数都会把你的偏好持久化，决定一次即可。
- **反向 symlink 清理。** 从 namespaced 切到 flat，或反过来时，旧 symlink 会自动清理，不会再在 Claude Code 里看到重复命令。
- **命名空间感知的技能推荐。** 28 个 skill 模板现在都会读取你的 prefix 设置。当一个 skill 推荐另一个 skill（例如 `/ship` 推荐 `/qa`）时，会自动使用你安装环境里的正确名字。

### 修复

- **`gstack-config` 可在 Linux 正常工作。** 用可移植的 `mktemp`+`mv` 替换了 BSD 专属的 `sed -i ''`，现在 GNU/Linux 和 WSL 都能写配置。
- **欢迎消息终于能显示。** 首装时的 “Welcome!” 之前因为 `~/.gstack/` 目录在 setup 更早阶段就被创建，导致永远不触发。现在通过 `.welcome-seen` sentinel 文件修复。

### 面向贡献者

- prefix 配置系统新增 8 个结构测试（`gen-skill-docs` 测试总数到 223）。

## [0.12.10.0] - 2026-03-27 — Codex Filesystem Boundary

Codex 以前会跑去 `~/.claude/skills/`，跟着 gstack 自己的说明走，而不是好好审你的代码。现在每个 Codex prompt 都会带一段文件系统边界指令，把它钉在仓库范围内。这覆盖了 `/codex`、`/autoplan`、`/review`、`/ship`、`/plan-eng-review`、`/plan-ceo-review`、`/office-hours` 里所有 11 处调用点。

### 修复

- **Codex 会留在 repo 里。** 所有 `codex exec` 和 `codex review` 调用现在都会预先拼接一段 filesystem boundary 指令，明确要求 Codex 忽略 skill 定义文件，防止它把 `SKILL.md` preamble 脚本当成“待分析代码”，白白浪费 8 分钟以上。
- **Rabbit-hole 检测。** 如果 Codex 输出里出现它被 skill 文件带偏的迹象（如 `gstack-config`、`gstack-update-check`、`SKILL.md`、`skills/gstack`），`/codex` 会给出警告并建议重试。
- **5 个回归测试。** 确保 7 个调用 Codex 的 skill 都带上边界文本、Filesystem Boundary 章节存在、rabbit-hole 检测规则存在、且 autoplan 使用的是跨 host 兼容的路径模式。

## [0.12.9.0] - 2026-03-27 — Community PRs: Faster Install, Skill Namespacing, Uninstall

6 个社区 PR 一次性落地。安装更快，技能不再和别的工具撞名，且你终于可以干净地卸载 gstack。

### 新增

- **卸载脚本。** `bin/gstack-uninstall` 会把 gstack 从系统里干净移除：停止 browse daemon、删除所有 skill 安装（Claude/Codex/Kiro），并清理状态。支持 `--force`（跳过确认）和 `--keep-state`（保留配置）。（#323）
- **`/review` 中的 Python 安全模式。** Shell 注入（`subprocess.run(shell=True)`）、LLM 生成 URL 导致的 SSRF、存储型 prompt injection、async/sync 混用、列名安全校验等，现在在 Python 项目里都会自动触发。（#531）
- **无 Codex 时的 office-hours 仍可工作。** “second opinion” 步骤现在会在没有 Codex CLI 时回退到 Claude subagent，让每个用户都能拿到跨模型视角。（#464）

### 变更

- **安装更快（约 30 秒）。** 所有 clone 命令现在都带 `--single-branch --depth 1`。需要完整历史的贡献者依然可以自己拉全量。（#484）
- **技能默认加 `gstack-` 命名空间。** Skill symlink 现在会命名为 `gstack-review`、`gstack-ship` 等，而不是裸 `review`、`ship`，避免与其他 skill pack 冲突。旧 symlink 会在升级时自动清理。可用 `--no-prefix` 退出这一行为。（#503）

### 修复

- **Windows 端口竞争。** `findPort()` 现在改用 `net.createServer()` 探测端口，而不是 `Bun.serve()`，修掉了 Windows 下因 polyfill 的 `stop()` 是 fire-and-forget 而导致的 EADDRINUSE 竞争。（#490）
- **`package.json` 版本同步。** `VERSION` 文件与 `package.json` 版本号现在保持一致（之前卡在 0.12.5.0）。

## [0.12.8.1] - 2026-03-27 — zsh Glob Compatibility

Skill 脚本现在能在 zsh 下正常运行。以前技能模板里的 bash 代码块会直接写 `.github/workflows/*.yaml` 或 `ls ~/.gstack/projects/$SLUG/*-design-*.md` 这类 glob，当没有命中时，zsh 会抛出 “no matches found” 并把技能搞挂。现在统一修复了 13 个模板与 2 个 resolver 里的 38 处用法：复杂模式改成 `find`，简单 `ls` 场景则用 `setopt +o nomatch` 做护栏。

### 修复

- **`.github/workflows/` 下的 glob 改为 `find`。** `/land-and-deploy`、`/setup-deploy`、`/cso` 和 deploy bootstrap resolver 中所有 `cat/for/ls .github/workflows/*.yml` 这类模式都改成了 `find ... -name`。
- **`~/.gstack/` 和 `~/.claude/` 的 glob 增加 `setopt` 护栏。** 设计文档查找、eval 结果列举、测试计划发现、retro 历史检查等 10 个 skill 现在都会在命令前加 `setopt +o nomatch 2>/dev/null || true`；在 bash 里这条是空操作，在 zsh 里则关闭 NOMATCH。
- **测试框架检测的 glob 也加了护栏。** testing resolver 中的 `ls jest.config.* vitest.config.*` 现在也受保护。

## [0.12.8.0] - 2026-03-27 — Codex No Longer Reviews the Wrong Project

在 Conductor 多 workspace 并开的情况下，Codex 以前可能悄悄 review 错项目。原因是 `codex exec -C` 会在命令内联执行 `$(git rev-parse --show-toplevel)`，而它是在后台 shell 继承来的 cwd 里求值；在多 workspace 环境里，这个 cwd 完全可能是另一个项目。

### 修复

- **Codex exec 现在会提前解析 repo root。** `/codex`、`/autoplan` 和 4 个 resolver 里的 12 处 `codex exec` 都会在 bash block 顶部先求值 `_REPO_ROOT`，再把这个值传给 `-C`。不会再在多 workspace 环境下跑错仓库。
- **`codex review` 也补上 cwd 保护。** 由于 `codex review` 不支持 `-C`，现在会在调用前先 `cd "$_REPO_ROOT"`。同一类 bug，不同命令路径。
- **静默 fallback 改成硬失败。** 以前 `|| pwd` 会悄悄用一个随机 cwd 顶上；现在如果不在 git repo 中，会直接报清楚的错误。

### 移除

- **删除 `gen-skill-docs.ts` 中已死的 resolver 副本。** 这些函数数月前就迁移到 `scripts/resolvers/` 了，但从未删除；它们与线上版本已经偏离，还保留着旧的脆弱模式。

### 新增

- **回归测试。** 会扫描所有 `.tmpl`、resolver `.ts` 和生成的 `SKILL.md`，检查是否有 Codex 命令仍在使用内联 `$(git rev-parse --show-toplevel)`，防止问题回归。

## [0.12.7.0] - 2026-03-27 — Community PRs + Security Hardening

合并、评审并测试了 7 个社区贡献，同时对 telemetry、review logging 做了安全加固，并修复了一批 E2E 稳定性问题。

### 新增

- **Skill 发现时过滤 dotfile 目录。** `.git`、`.vscode` 这类隐藏目录不再被当成 skill 模板。
- **review-log 的 JSON 校验闸门。** 非法输入不再被直接追加到 JSONL 文件中。
- **Telemetry 输入清洗。** 所有字符串字段在写 JSONL 之前都会去掉引号、反斜杠和控制字符。
- **按 host 区分的 co-author trailer。** `/ship` 和 `/document-release` 现在会为 Codex 和 Claude 写出正确的 co-author 行。
- **10 个新的安全测试。** 覆盖 telemetry 注入、review-log 校验和 dotfile 过滤。

### 修复

- **以 `./` 开头的路径不再被误判为 CSS 选择器。** `$B screenshot ./path/to/file.png` 现在会把它当文件路径，而不是去页面里找元素。
- **构建链路更稳。** `gen:skill-docs` 失败不再阻止二进制编译继续。
- **更新检查器的 fall-through。** 升级之后现在还会继续检查是否存在更高的远端版本，而不是直接停掉。
- **Flaky E2E 测试稳定化。** `browse-basic`、`ship-base-branch`、`review-dashboard-via` 现在通过只抽取相关 `SKILL.md` 片段，而不是整份 1900 行文件拷进 fixture，稳定通过。
- **移除不可靠的 `journey-think-bigger` 路由测试。** 这个测试的触发信号天然模糊，长期不稳定；其余 10 个旅程测试已经足够覆盖清晰信号。

### 面向贡献者

- 新增 CLAUDE.md 规则：永远不要把完整 `SKILL.md` 文件复制进 E2E fixture，只提取真正相关的段落。

## [0.12.6.0] - 2026-03-27 — Sidebar Knows What Page You're On

Chrome sidebar agent 以前经常跑错页面。如果你手动切到某个站点，sidebar 还会盯着 Playwright 上一次看到的 URL（常常是 demo 用的 Hacker News）。现在它终于知道你眼前实际开的是什么页了。

### 修复

- **Sidebar 使用真实 tab URL。** Chrome 扩展现在会通过 `chrome.tabs.query()` 获取页面真实 URL 并发给服务端。此前 sidebar agent 使用的是 Playwright 的陈旧 `page.url()`，在 headed mode 里手动导航后不会更新。
- **URL 清洗。** 扩展传来的 URL 现在会先校验（仅允许 http/https、剥离控制字符、限制在 2048 字符），再用于 Claude 的 system prompt，避免通过精心构造 URL 做 prompt injection。
- **重连时清理陈旧 sidebar agent。** 每次 `/connect-chrome` 都会先杀掉遗留的 sidebar-agent 进程。旧进程里的 auth token 往往已经过期，会让 sidebar 静默冻结。

### 新增

- **`/connect-chrome` 的预清理步骤。** 连接前先清理陈旧 browse server 和 Chromium profile lock，避免崩溃后误报 “already connected”。
- **Sidebar agent 测试套件（36 个测试）。** 分四层：URL 清洗单测、server HTTP 端点集成测、mock-Claude 回路测试，以及带真实 Claude 的 E2E 测试。除最后一层外都不花钱。

## [0.12.5.1] - 2026-03-27 — Eng Review Now Tells You What to Parallelize

`/plan-eng-review` 现在会自动分析你的计划里哪些部分适合并行执行。当计划包含互不依赖的工作流时，它会输出依赖表、并行 lane 和执行顺序，直接告诉你哪些任务适合拆进独立 git worktree。

### 新增

- **Worktree 并行化策略。** 作为 `/plan-eng-review` 的必备输出之一，会把计划步骤整理成结构化表格，标出模块级依赖、计算可并行 lane，并提示 merge conflict 风险。对单模块或单轨计划则自动跳过。

## [0.12.5.0] - 2026-03-26 — Fix Codex Hangs: 30-Minute Waits Are Gone

`/codex` 里有 3 个 bug 会导致计划评审和对抗检查时，出现 30 分钟以上无输出的卡死。现在这 3 个问题都修掉了。

### 修复

- **计划文件现在对 Codex sandbox 可见。** Codex 在 repo root 内的 sandbox 里运行，之前看不到位于 `~/.claude/plans/` 的计划文件，只能白白花 10+ 次工具调用去搜索。现在直接把计划内容嵌入 prompt，并列出相关源码文件，让它一开始就读到关键上下文。
- **Streaming 输出真的会实时刷。** 以前 Python stdout 缓冲导致进程退出前看不到任何输出。现在在 3 种 Codex 模式里统一加了 `PYTHONUNBUFFERED=1`、`python3 -u` 和 `flush=True`。
- **更合理的 reasoning effort 默认值。** 把硬编码的 `xhigh`（token 23 倍、已知会导致 50+ 分钟 hangs）改成按模式分配：review/challenge 用 `high`，consult 用 `medium`。用户若真的需要最大推理强度，仍可用 `--xhigh` 覆盖。
- **`--xhigh` 在所有模式下都可用。** 之前 challenge 与 consult 的说明里缺少这个覆盖选项提示，是被 adversarial review 抓出来的。

## [0.12.4.0] - 2026-03-26 — Full Commit Coverage in /ship

当你要 ship 一个包含 12 个 commit 的分支，里面既有性能优化、死代码清理、又有测试基础设施改动时，PR 理应把这三类变化都写全。但以前它不会：CHANGELOG 和 PR 总结会偏向最近的提交，静默丢掉更早的重要工作。

### 修复

- **`/ship` Step 5（CHANGELOG）。** 现在会强制先逐个枚举 commit，再按主题分组、写条目，最后交叉检查每个 commit 是否都映射到某个 bullet，避免只记住最近那几个。
- **`/ship` Step 8（PR body）。** 从“照着 CHANGELOG 抄 bullet”改成“显式按 commit 做覆盖”，再按逻辑分组组织；同时会排除纯 `VERSION/CHANGELOG` 元数据提交，因为那只是簿记，不是实际变化。

## [0.12.3.0] - 2026-03-26 — Voice Directive: Every Skill Sounds Like a Builder

每个 gstack skill 现在都有统一 voice。不是人格化表演，也不是故作姿态，而是一组让 Claude 说话更像“今天真发过货、真的关心用户体验是否可用”的指令：直接、具体、尖锐，能说清楚文件、函数、命令，也能把技术工作和用户实际感受连起来。

两档配置：轻技能使用精简版（只包含语气与写作规则）；完整技能使用完整版，加入与上下文相关的语气切换（战略类带一点 YC 合伙人能量，代码评审像资深工程师，调试像好技术博客）、具体性标准、幽默边界和用户结果导向。

### 新增

- **25 个技能统一注入 voice directive。** 通过 `preamble.ts` 生成并由模板 resolver 注入。Tier 1 技能用 4 行版；Tier 2+ 技能用完整版。
- **上下文相关语气。** `/plan-ceo-review` 用 YC partner 风格，`/review` 用 senior eng 风格，`/investigate` 走优秀技术博客路线。
- **具体性标准。** “给出精确命令、使用真实数字、指向确切代码行” 不再只是理想，而是被明确写进规则。
- **用户结果连接。** “这件事重要，因为你的用户会看到一个 3 秒 spinner。” 让“用户的用户”变得真实。
- **LLM eval 测试。** 评估直接度、具体性、去官话、避免 AI 黑话、连接用户结果等多个维度，要求每项都 ≥4/5。

## [0.12.2.0] - 2026-03-26 — Deploy with Confidence: First-Run Dry Run

第一次在某个项目上运行 `/land-and-deploy` 时，它现在会先做一次 dry run。它会检测你的部署基础设施、验证每个命令都能工作，并在真正执行前，把将要发生什么给你说明白。你确认之后，后续就都能自动跑。

如果你的部署配置后来发生变化（平台更换、流程变了、URL 更新了），它也会自动重新触发 dry run。信任不是一次建立后永远不管，而是在地基变化时重新验证。

### 新增

- **首次 dry run。** 会以校验表的形式展示你的部署环境：平台、CLI 状态、生产 URL 可达性、staging 检测、合并方式、merge queue 状态。在任何不可逆动作之前让你确认。
- **先发 staging 的选项。** 如果检测到 staging（来自 `CLAUDE.md` 配置、GitHub Actions workflow 或 Vercel/Netlify preview），可以先发到 staging 验证，再继续发生产。
- **配置衰变检测。** dry-run 确认后会保存部署配置指纹；如果 `CLAUDE.md` 里的 deploy 段或部署 workflow 发生变化，就会自动重新跑 dry run。
- **内联 review gate。** 如果缺少最近的代码评审，会在 merge 前给你一个快速 diff 安全检查入口，抓 SQL 安全、竞态与安全问题。
- **Merge queue 感知。** 当仓库启用了 merge queue 时，会解释当前系统在等待什么。
- **CI 自动部署检测。** 能识别 merge 后会触发的 deploy workflow，并持续监控它们。

### 变更

- **面向用户的文案全面重写。** 所有消息都改为解释“正在发生什么、为什么要这样做，以及具体细节”。首次运行偏 teacher mode，后续运行偏 efficient mode。
- **新增 Voice & Tone 章节。** 明确这个 skill 应该像“坐在开发者旁边的资深 release engineer”，而不是机器人。

## [0.12.1.0] - 2026-03-26 — Smarter Browsing: Network Idle, State Persistence, Iframes

现在每次 click、fill、select 返回前，都会等页面先稳定下来。不会再出现 XHR 还没跑完就拿到陈旧 snapshot 的情况。Chain 新增管道格式，适合更快写多步流程。浏览器会话也可以保存和恢复（cookies + open tabs），iframe 内容终于也能直达。

### 新增

- **Network idle 检测。** `click`、`fill`、`select` 最多会自动等 2 秒，直到网络请求稳定下来。用于捕获交互触发的 XHR/fetch，底层依赖 Playwright 的 `waitForLoadState('networkidle')`。
- **`$B state save/load`。** 可以把浏览器会话（cookies + open tabs）保存成命名文件，并在之后重新加载。文件保存在 `.gstack/browse-states/{name}.json`，权限 `0o600`。V1 只保存 cookies + URLs（不含 localStorage，因为在先 load 再 navigate 时会出问题）。加载会替换当前会话，而不是 merge。
- **`$B frame` 命令。** 允许把命令上下文切换到 iframe：`$B frame iframe`、`$B frame --name checkout`、`$B frame --url stripe` 或 `$B frame @e5`。之后的 click/fill/snapshot 等命令都会在 iframe 内执行。`$B frame main` 可回到主页面。Snapshot 还会显示 `[Context: iframe src="..."]` 头部；脱离的 frame 会自动恢复。
- **Chain 的管道格式。** 当 JSON 解析失败时，chain 现在会接受 `$B chain 'goto url | click @e5 | snapshot -ic'` 这种带引号感知的管道分隔写法。

### 变更

- **Chain 末尾加入 idle wait。** 如果 chain 中最后一条是写操作，执行完所有步骤后会再等一次 network idle 再返回。

### 修复

- **Iframe 的 ref 作用域。** Snapshot ref locator、cursor-interactive 扫描和 cursor locator 现在都使用 frame-aware target，不再总是错误作用于主页面。
- **Detached frame 自动恢复。** `getActiveFrameOrPage()` 会检查 `isDetached()` 并自动恢复。
- **State load 会重置 frame context。** 加载已保存状态时，会清掉当前激活 frame 引用。
- **修复 frame 命令里的 `elementHandle` 泄漏。**
- **Upload 命令支持 frame。** `upload` 现在会用 frame-aware target 去找文件输入框。

## [0.12.0.0] - 2026-03-26 — Headed Mode + Sidebar Agent

你现在可以在真实的 Chrome 窗口里看着 Claude 工作，并通过侧边栏聊天来指挥它。

### 新增

- **带 sidebar agent 的 headed mode。** `$B connect` 会拉起一个可见的 Chrome 窗口，并自动安装 gstack 扩展。Side Panel 里既有每个命令的活动流，也有一个自然语言聊天界面。一个子 Claude 实例会在浏览器里执行你的要求：跳转页面、点击按钮、填写表单、提取数据。每个任务的时间预算提升到 5 分钟。
- **个人自动化。** Sidebar agent 现在不只是做开发任务，还能处理重复性的浏览器劳动：逛学校家长门户、把家长联系方式录到 Google Contacts、填写供应商 onboarding 表单、从 dashboard 抓数据等。你可以直接在 headed browser 登录，或者先用 `/setup-browser-cookies` 导入真实 Chrome 的 cookies。
- **Chrome 扩展。** 包含工具栏徽章（绿色=已连接、灰色=未连接）、带活动流/聊天/refs 标签页的 Side Panel、页面上的 `@ref` overlay，以及显示当前受控窗口的连接 pill。运行 `$B connect` 时会自动加载。
- **`/connect-chrome` skill。** 引导式体验：启动 Chrome、校验扩展、演示活动流，并介绍 sidebar chat。

### 变更

- **Sidebar agent 默认开启。** 过去必须带 `--chat`，现在 headed mode 下始终可用。它的安全模型与 Claude Code 本身一致（Bash、Read、Glob、Grep，作用于 localhost）。
- **Agent 超时提升到 5 分钟。** 多页面任务（跨多个目录导航、填写多页表单）确实需要比过去的 2 分钟更长时间。

## [0.11.21.0] - 2026-03-26

### 修复

- **`/autoplan` 的评审结果现在会计入 ship readiness gate。** 以前 `/autoplan` 明明跑了完整的 CEO + Design + Eng review，`/ship` 里 Eng Review 仍显示 “0 runs”。现在 dashboard 会带来源标记（如 “CLEAR (PLAN via /autoplan)”），让你知道是哪一个工具满足了这一行。
- **`/ship` 不再叫你“先跑 `/review`”。** Ship 在 Step 3.5 本来就会自己跑 pre-landing review，再让你单独跑一次纯属重复。这个 gate 已被移除。
- **`/land-and-deploy` 现在会检查全部 8 类 review。** 以前漏掉了 `review`、`adversarial-review` 和 `codex-plan-review`，导致你即使跑过 `/review`，它也看不到。
- **Dashboard 中的 Outside Voice 行修复。** 以前即使 `/plan-ceo-review` 或 `/plan-eng-review` 已经跑过 outside voice，也会显示 “0 runs”。现在会正确映射 `codex-plan-review` 条目。
- **`/codex review` 现在会跟踪 staleness。** 给 codex review log 条目补上 `commit` 字段，dashboard 才能识别它是否过期。
- **`/autoplan` 不再硬编码 `clean` 状态。** 以前 autoplan 写 review log 时无论有没有问题都记成 `status:"clean"`；现在改成真正的占位 token，由 Claude 在运行时替换为真实值。

## [0.11.20.0] - 2026-03-26

### 新增

- **`/retro` 与 `/ship` 支持 GitLab。** 你现在可以在 GitLab 仓库里运行 `/ship`，它会用 `glab mr create` 创建 merge request；`/retro` 也能在两种平台上检测默认分支。所有使用 `BASE_BRANCH_DETECT` 的 11 个技能都自动拿到 GitHub、GitLab 和原生 git 的回退检测。
- **GitHub Enterprise 与自建 GitLab 检测。** 如果 remote URL 不是 `github.com` 或 `gitlab`，gstack 会额外检查 `gh auth status` / `glab auth status` 来识别已认证的平台，不需要你手动配置。
- **`/document-release` 在 GitLab 可用。** `/ship` 创建 merge request 之后，自动调用的 `/document-release` 现在会通过 `glab` 读取并更新 MR body，而不是悄悄失败。
- **GitLab 的 `/land-and-deploy` 安全闸。** 在 GitLab 仓库里不再静默失败，而是明确提示：GitLab merge 支持尚未实现。

### 修复

- **`gen-skill-docs` 的 resolver 去重。** 模板生成器里有重复的内联 resolver 函数盖住了模块化版本，导致生成的 `SKILL.md` 缺不到最新更新。现在已清理。

## [0.11.19.0] - 2026-03-24

### 修复

- **Auto-upgrade 不再被 description 长度搞坏。** 根 `gstack` skill 的 description 只差 7 个字符就触到 Codex 的 1024 字符上限了，每新增一个 skill 都在逼近上限。现在把 skill 路由表从 description 挪到 body，description 从 1017 缩到 409，留下 615 字的余量。
- **Codex reviews 现在在正确 repo 中执行。** 在多 workspace 场景（如 Conductor）中，Codex 以前可能捡错项目目录。现在所有 `codex exec` 都显式 `-C` 到 git root。

### 新增

- **900 字预警测试。** 任何 Codex skill description 只要超过 900 字就会让测试失败，防止在真正撞线前就发现问题。

## [0.11.18.2] - 2026-03-24

### 修复

- **Windows 版 browse daemon 修复。** Browse server 在 Windows 上起不来，是因为 Bun 要求 `stdio` 必须是数组（`['ignore', 'ignore', 'ignore']`），而不是字符串（`'ignore'`）。此修复解决了 #448、#454、#458。

## [0.11.18.1] - 2026-03-24

### 变更

- **全系统统一成“一次只问一个决策”。** 所有技能现在都把决策拆成一个个独立问题，每个问题只带自己的推荐和选项。不再有把多个无关选择塞成一堵墙文字的大问句。这个规则原先只在 3 个 plan-review 技能中执行，现在扩展到了全部 23+ 个技能。

## [0.11.18.0] - 2026-03-24 — Ship With Teeth

`/ship` 和 `/review` 现在终于开始真正执行它们一直在说的质量门槛。Coverage 审计从“画个图看看”变成了真实 gate；计划完成度会对照 diff 验证；计划里的 verification 步骤也会自动执行。

### 新增

- **`/ship` 的测试覆盖 gate。** AI 判断的覆盖率低于 60% 会硬阻止；60-79% 会弹出提示；80%+ 直接通过。阈值可以通过 `CLAUDE.md` 的 `## Test Coverage` 做项目级配置。
- **`/review` 的 coverage 警示。** 覆盖率偏低现在会在进入 `/ship` 之前就被高亮提醒，让你更早补测试。
- **计划完成度审计。** `/ship` 现在会读取计划文件，抽取所有可执行项，并和 diff 交叉比对，输出 DONE / NOT DONE / PARTIAL / CHANGED 清单。漏掉的项会成为 shipping blocker（你仍可以 override）。
- **计划感知的 scope drift 检测。** `/review` 的 scope drift 现在也会读计划文件，不再只看 `TODOS.md` 和 PR 描述。
- **通过 `/qa-only` 自动验证。** `/ship` 会读取计划中的验证章节，并在本地有 dev server 时内联运行 `/qa-only` 做验证；如果没有 server，也会优雅跳过。
- **共享计划文件发现逻辑。** 优先看对话上下文，找不到再回退到基于内容的 grep。现在计划完成度、plan review 报告和 verification 都共用这套逻辑。
- **Ship 指标日志。** 覆盖率、计划完成比例、verification 结果都会写进 review JSONL，供 `/retro` 做长期趋势分析。
- **`/retro` 中显示计划完成率。** 周报会看到各个已发货分支的计划完成表现。

## [0.11.17.0] - 2026-03-24 — Cleaner Skill Descriptions + Proactive Opt-Out

### 变更

- **Skill description 现在更干净、更易读。** 去掉了每个 skill description 前面又长又丑的 “MANUAL TRIGGER ONLY”，它浪费了 58 个字符，还给 Codex 集成带来构建错误风险。
- **你现在可以关闭主动 skill 建议。** 第一次运行任意 gstack skill 时，会问你是否希望 gstack 在工作流中主动推荐 skill。如果你更喜欢全部手动触发，只需说 no；它会保存为全局设置。之后也可以用 `gstack-config set proactive true/false` 随时切换。

### 修复

- **Telemetry 的 source tagging 不再崩溃。** 修复了 telemetry logger 中 duration guard 和 source 字段校验的边界情况。

## [0.11.16.1] - 2026-03-24 — Installation ID Privacy Fix

### 修复

- **Installation ID 改为随机 UUID，而不是主机名哈希。** 旧方案是 `SHA-256(hostname+username)`，理论上知道你机器身份的人就能算出安装 ID。现在改为写入 `~/.gstack/installation-id` 的随机 UUID，不可从公共输入反推；删除文件即可轮换。
- **RLS 校验脚本处理更多边界情况。** `verify-rls.sh` 现在会把 INSERT 成功视为预期行为（兼容旧客户端），同时正确处理 409 冲突和 204 no-op。

## [0.11.16.0] - 2026-03-24 — Smarter CI + Telemetry Security

### 变更

- **CI 默认只跑 gate 测试，periodic 测试改为每周执行。** 每个 E2E 测试现在都有 `gate`（阻塞 PR）或 `periodic`（每周 cron + 按需）分类。Gate 覆盖功能正确性与安全护栏；periodic 则留给昂贵的 Opus 质量 benchmark、非确定性路由测试和依赖外部服务（Codex、Gemini）的场景。CI 反馈更快、更便宜，而质量 benchmark 依然保留。
- **全局 touchfiles 现在更细粒度。** 以前只要改 `gen-skill-docs.ts` 就会触发全部 56 个 E2E 测试；现在只跑真正依赖它的约 27 个。`llm-judge.ts`、`test-server.ts`、`worktree.ts` 以及 Codex/Gemini session runner 也都做了同样细化。真正全局的文件现在只剩 3 个。
- **新增 `test:gate` 与 `test:periodic` 脚本。** 用 `EVALS_TIER=gate` 或 `EVALS_TIER=periodic` 按层级筛选测试，替代了旧的 `test:e2e:fast`。
- **Telemetry sync 改用 `GSTACK_SUPABASE_URL`。** Edge function 需要的是 Supabase 基础 URL，而不是 REST API 路径；旧的 `GSTACK_TELEMETRY_ENDPOINT` 从 `config.sh` 中删除。
- **Cursor 推进更安全。** 同步脚本会先检查 edge function 返回的 `inserted` 数量，只有插入成功时才推进 cursor；如果一条没插入，就保持原位等下一轮重试。

### 修复

- **Telemetry RLS policy 收紧。** 所有 telemetry 表的 RLS 现在都明确拒绝 anon key 直接访问。所有读写都必须走带 schema 校验、事件类型 allowlist 和字段长度限制的 edge functions。
- **Community dashboard 更快，且有服务端缓存。** 统计现在通过单一 edge function 提供，并带 1 小时服务端缓存，不再依赖多次直接查询。

### 面向贡献者

- `test/helpers/touchfiles.ts` 中的 `E2E_TIERS` map 为每个测试分类，并有一个免费验证测试确保它与 `E2E_TOUCHFILES` 保持同步。
- `EVALS_FAST` / `FAST_EXCLUDED_TESTS` 被移除，统一改用 `EVALS_TIER`。
- CI matrix 中的 `allow_failure` 被删除（gate 测试应当可靠）。
- 新增 `.github/workflows/evals-periodic.yml`，每周一 UTC 06:00 运行 periodic 测试。
- 新增迁移：`supabase/migrations/002_tighten_rls.sql`。
- 新增 smoke test：`supabase/verify-rls.sh`（9 项校验：5 读 + 4 写）。
- 扩展 `test/telemetry.test.ts`，加入字段名校验。
- `browse/dist/` 二进制不再被 git 跟踪（只存 arm64 版本的时代结束，由 `./setup` 现场重建）。

## [0.11.15.0] - 2026-03-24 — E2E Test Coverage for Plan Reviews & Codex

### 新增

- **E2E 测试验证 plan review 报告是否真的写在计划底部。** `/plan-eng-review` 的 `## GSTACK REVIEW REPORT` 产物现在做了真正的端到端测试，一旦不再写入计划文件，测试会第一时间发现。
- **E2E 测试验证每个 plan skill 都会提供 Codex。** 新增 4 个轻量测试，确认 `/office-hours`、`/plan-ceo-review`、`/plan-design-review`、`/plan-eng-review` 都会检查 Codex 可用性、提示用户，并在 Codex 不可用时走回退逻辑。

### 面向贡献者

- `test/skill-e2e-plan.test.ts` 新增 E2E：`plan-review-report`、`codex-offered-eng-review`、`codex-offered-ceo-review`、`codex-offered-office-hours`、`codex-offered-design-review`。
- 更新 touchfile 映射和选择数量断言。
- 把 `touchfiles` 写入 CLAUDE.md 的全局 touchfile 文档。

## [0.11.14.0] - 2026-03-24 — Windows Browse Fix

### 修复

- **Browse engine 现在可在 Windows 使用。** 之前 Windows 上所有 `/browse` 用户都被 3 个叠加 bug 卡住：CLI 退出时 server 进程也跟着死（Bun 的 `unref()` 在 Windows 下并不真正分离）、health check 永远跑不到（Bun 编译产物里的 `process.kill(pid, 0)` 在 Windows 上坏掉）、而且 Chromium 通过 Bun→Node 进程链拉起时 sandbox 还会失败。现在三者都修了。感谢 @fqueiro（PR #191）指出 `detached: true` 的路径。
- **所有平台都优先走 health check。** `ensureServer()` 现在先尝试 HTTP health check，再回退到基于 PID 的检测；不仅对 Windows 更稳，对所有 OS 都更可靠。
- **启动错误写入磁盘。** Server 启动失败时，错误会写到 `~/.gstack/browse-startup-error.log`，这样因为进程分离而看不到 stderr 的 Windows 用户也能排查。
- **Windows 下禁用 Chromium sandbox。** 通过 Bun→Node 链路启动 Chromium 时，sandbox 需要更高权限；现在仅在 Windows 下关闭。

### 面向贡献者

- `browse/test/config.test.ts` 新增 `isServerHealthy()` 和 startup error logging 测试。

## [0.11.13.0] - 2026-03-24 — Worktree Isolation + Infrastructure Elegance

### 新增

- **E2E 测试现在运行在 git worktree 中。** Gemini 与 Codex 测试不再污染你的工作树。每套测试都有独立 worktree，而 AI agent 产生的有价值修改会自动收集成 patch，可通过 `git apply ~/.gstack-dev/harvests/<id>/gemini.patch` 挑回主仓。
- **Harvest 去重。** 如果同一个测试反复产出相同改进，会用 SHA-256 检测并跳过，不会堆一堆重复 patch。
- **`describeWithWorktree()` helper。** 任何 E2E 测试都可以一行启用 worktree 隔离。以后那些需要真实 repo 上下文（git 历史、真实 diff）的测试，也都能用它而不是临时目录。

### 变更

- **Gen-skill-docs 现在是模块化 resolver pipeline。** 原来的 1700 行巨型生成器被拆成 8 个聚焦 resolver 模块（browse、preamble、design、review、testing、utility、constants、codex-helpers）。以后新增 placeholder resolver 不必再往 megafunction 里塞代码。
- **Eval 结果按项目隔离。** 现在保存在 `~/.gstack/projects/$SLUG/evals/`，不再混在全局 `~/.gstack-dev/evals/` 里，多项目用户不会再把结果搅在一起。

### 面向贡献者

- WorktreeManager（`lib/worktree.ts`）是可复用的平台模块，未来诸如 `/batch` 这类技能都可以直接导入。
- 新增 12 个 WorktreeManager 单测，覆盖生命周期、harvest、去重和错误处理。
- 更新 `GLOBAL_TOUCHFILES`，worktree 基础设施变更现在会触发所有 E2E 测试。

## [0.11.12.0] - 2026-03-24 — Triple-Voice Autoplan

现在 `/autoplan` 的每个阶段都会得到两个独立 second opinion：一个来自 Codex（OpenAI 的 frontier model），一个来自全新的 Claude subagent。三个 AI reviewer 从不同角度审你的计划，且每一阶段都会建立在前一阶段的结果上。

### 新增

- **每个 autoplan 阶段都带双外部声音。** CEO review、Design review、Eng review 都会同时运行一次 Codex challenge 和一个独立 Claude subagent。你会得到一张共识表，看到它们在哪些点上同意、哪些点上分歧；分歧会在最终 gate 中作为 taste 决策出现。
- **阶段级联上下文。** Codex 会拿到前一阶段的发现（CEO 的担忧会影响 Design，CEO+Design 会影响 Eng）；Claude subagent 则保持真正独立，用来形成真实的跨模型验证。
- **结构化共识表。** CEO 阶段评 6 个战略维度，Design 使用 litmus scorecard，Eng 评 6 个架构维度，并逐项标记 CONFIRMED / DISAGREE。
- **跨阶段综合。** Phase 4 gate 会额外高亮那些在多个阶段中被独立发现的主题，这通常是高置信度信号。
- **顺序执行约束。** 通过阶段间 STOP 标记和 pre-phase checklist，防止 autoplan 意外把 CEO / Design / Eng 并行化（每一阶段都依赖上一阶段）。
- **阶段切换摘要。** 每个阶段边界都会有简短状态报告，让你不用等整条流水线跑完才知道进度。
- **降级矩阵。** 当 Codex 或 Claude subagent 失败时，autoplan 会以清晰标签优雅降级（`[codex-only]`、`[subagent-only]`、`[single-reviewer mode]`）。

## [0.11.11.0] - 2026-03-23 — Community Wave 3

本轮合并了 10 个社区 PR，涵盖 bug 修复、平台支持和工作流改进。

### 新增

- **Chrome 多 profile cookie 导入。** 现在不只支持 Default profile，还能从任意 Chrome profile 导入 cookie；profile picker 会显示账号邮箱，便于识别，也支持对所有可见 domain 批量导入。
- **Linux Chromium cookie 导入。** 在 Linux 上，Chrome、Chromium、Brave、Edge 的 cookie 导入都可以用了，支持 GNOME Keyring（libsecret）与无头环境下的 “peanuts” 回退方案。
- **Browse 会话里可加载 Chrome 扩展。** 设置 `BROWSE_EXTENSIONS_DIR` 后，你可以把广告拦截、无障碍工具或自定义 header 扩展加载进 browse 测试会话。
- **项目级 gstack 安装。** `setup --local` 可把 gstack 安装到当前项目的 `.claude/skills/`，而不是全局，方便逐项目 pin 版本。
- **Distribution pipeline 检查。** `/office-hours`、`/plan-eng-review`、`/ship`、`/review` 现在会检查新 CLI 工具或库是否有构建/发布流水线，避免“东西做完了但没人能安装”。
- **动态技能发现。** 增加新的 skill 目录不再需要修改硬编码列表；`skill-check` 与 `gen-skill-docs` 会自动从文件系统发现技能。
- **自动触发护栏。** Skill description 中加入更明确的触发条件，防止 Claude Code 仅凭语义相似度就自动误触。原有的主动建议机制保留。

### 修复

- **Browse server 启动崩溃。** 当 `.gstack/` 目录不存在时，browse server 在获取锁前就会失败，导致每次都误以为有其他进程持锁。现在会先创建状态目录。
- **Skill preamble 的 zsh glob 报错。** telemetry 清理循环在没有 pending 文件时不再抛出 `no matches found`。
- **`--force` 现在真的强制升级。** `gstack-upgrade --force` 会清掉 snooze 文件，让你可以在刚 snooze 之后立刻升级。
- **`/review` 的三点 diff。** Scope drift 分析现在正确比较“从分支创建以来的变更”，而不是把 base branch 上累积变更也算进去。
- **CI workflow YAML 解析。** 修复了未加引号的多行 `run:` 导致的 YAML 解析错误，并新增 actionlint CI。

### 社区

- 感谢 @osc、@Explorer1092、@Qike-Li、@francoisaubert1、@itstimwhite、@yinanli1917-cloud 在本轮中的贡献。

## [0.11.10.0] - 2026-03-23 — CI Evals on Ubicloud

### 新增

- **E2E eval 现在会在每个 PR 的 CI 中运行。** 每个 PR 会在 Ubicloud 上拉起 12 个并行 GitHub Actions runner，每个跑一套测试。Docker 镜像预烘焙了 bun、node、Claude CLI 和依赖，基本秒起。结果会作为 PR 评论回传，并附带 pass/fail 与成本拆分。
- **Eval 跑得快了 3 倍。** 所有文件内的 E2E 测试都改为并发执行（`testConcurrentIfSelected`），壁钟时间从约 18 分钟降到 6 分钟左右，瓶颈变成最慢的单个测试，而不是总和。
- **Docker CI 镜像（`Dockerfile.ci`）。** 预装工具链；只要 Dockerfile 或 `package.json` 变更，就会按内容哈希在 GHCR 中自动重建和缓存。

### 修复

- **CI 中的路由测试终于可用。** Skills 现在安装在顶层 `.claude/skills/`，不再嵌套到 `.claude/skills/gstack/`，因此项目级 skill 发现不会因不递归子目录而失败。

### 面向贡献者

- CI 中设置 `EVALS_CONCURRENCY=40` 以最大化并行；本地默认仍是 15。
- Ubicloud runner 约 `$0.006/run`，大约是 GitHub 标准 runner 的 1/10 成本。
- 增加 `workflow_dispatch` 触发器，方便手动重跑。

## [0.11.9.0] - 2026-03-23 — Codex Skill Loading Fix

### 修复

- **Codex 不再用 “invalid SKILL.md” 拒绝 gstack skills。** 已安装技能中的 description 字段过去可能超过 1024 字，导致 Codex 静默跳过。现在构建时若任何 Codex description 超过 1024 就会直接报错；setup 也总会重建 `.agents/` 以防陈旧文件遗留；同时一条一次性迁移会自动清理旧安装里的超长描述。
- **`package.json` 版本与 `VERSION` 保持同步。** 之前已经落后了 6 个 minor 版本；现在有 CI 测试专门防守。

### 新增

- **Codex E2E 测试显式断言没有 skill loading 错误。** 本次修复对应的 “Skipped loading skill(s)” 报错现在成为回归测试；测试会捕获并检查 `stderr`。
- **README 中新增 Codex 排障条目。** 提供在自动迁移生效前，用户可以手动自救的说明。

### 面向贡献者

- `test/gen-skill-docs.test.ts` 会验证所有 `.agents/` description 都不超过 1024 字。
- `gstack-update-check` 新增一次性迁移，用于删除超长的 Codex `SKILL.md` 文件。
- 新增 P1 TODO：Codex→Claude 反向 buddy check skill。

## [0.11.8.0] - 2026-03-23 — zsh Compatibility Fix

### 修复

- **gstack skills 现在可在 zsh 下无错运行。** 每个 skill preamble 里都有一个 `.pending-*` glob，当没有任何 pending telemetry 文件时，zsh 默认的 NOMATCH 行为会在每次调用时都报错。现在统一用 `find` 替代 shell glob，从根上规避这个问题。感谢 @hnshah 的最初报告与 PR #332 修复。Fixes #313。

### 新增

- **zsh glob 安全回归测试。** 新测试会验证所有生成的 `SKILL.md` 都用 `find` 而不是裸 shell glob 来匹配 `.pending-*`。

## [0.11.7.0] - 2026-03-23 — /review → /ship Handoff Fix

### 修复

- **`/review` 现在可以满足 ship readiness gate。** 以前在 `/ship` 之前先跑 `/review`，dashboard 仍然会显示 “NOT CLEARED”，因为 `/review` 不写 log，而 `/ship` 只认 `/plan-eng-review`。现在 `/review` 会持久化自己的结果，所有 dashboard 也都把 `/review`（diff 范围）和 `/plan-eng-review`（计划阶段）视为合法 Eng Review 来源。
- **Ship 中止提示同时提到两种 review 选项。** 当 Eng Review 缺失时，`/ship` 现在会建议你“运行 `/review` 或 `/plan-eng-review`”，而不是只提一个。

### 面向贡献者

- 基于 @malikrohail 的 PR #338。按 eng review 建议做了 DRY 改进：更新共享的 `REVIEW_DASHBOARD` resolver，而不是新造一个 ship 专用 resolver。
- 新增 4 个验证测试，覆盖 review-log 持久化、dashboard 传递和中止提示文本。

## [0.11.6.0] - 2026-03-23 — Infrastructure-First Security Audit

### 新增

- **`/cso` v2：从真正容易出事故的地方开始。** 安全审计现在会先看基础设施攻击面：git 历史中的泄漏密钥、依赖 CVE、CI/CD 流水线配置错误、未验证的 webhooks、Dockerfile 安全，再去看应用代码。共 15 个阶段，覆盖 secrets archaeology、供应链、CI/CD、LLM/AI 安全、skill 供应链、OWASP Top 10、STRIDE，以及主动验证。
- **两种审计模式。** `--daily` 走零噪声扫描，要求 8/10 置信度才报；`--comprehensive` 做深度月度扫描，2/10 就会先提出来让你查。
- **主动验证。** 每条 finding 都会在上报前交给 subagent 独立验证，不再是 grep 到就算。若确认一种漏洞模式，还会自动做 variant analysis，在全代码库里继续找同类问题。
- **趋势跟踪。** Findings 会被 fingerprint 化，并跨多次审计持续跟踪。你能直接看到哪些是新问题、哪些已修复、哪些长期被忽略。
- **基于 diff 的审计。** `--diff` 模式只对当前分支相对 base branch 的差异做审计，非常适合 pre-merge 安全检查。
- **3 个带植入漏洞的 E2E 测试。** 覆盖硬编码 API key、被跟踪的 `.env`、未签名 webhook、未 pin 的 GitHub Actions、rootless Dockerfile 等场景，并已全部通过。

### 变更

- **先识别栈，再扫描。** v1 会不加判断地对每个项目都跑 Ruby/Java/PHP/C# 检查；v2 先识别框架，再优先跑相关检查。
- **正确使用工具。** v1 在 Bash 里直接用 `grep`；v2 改用 Claude Code 原生 `Grep` 工具，结果更稳定，也不会被截断。

## [0.11.5.2] - 2026-03-22 — Outside Voice

### 新增

- **计划评审现在会主动提供独立 second opinion。** 在 `/plan-ceo-review` 或 `/plan-eng-review` 跑完所有章节后，你可以选择再来一个“毫不留情的外部声音”：如果装了 Codex CLI 就用 Codex，否则用一个新的 Claude subagent。它会重新读你的计划，专门找 review 漏掉的逻辑缺口、隐含假设和可行性风险，并原样呈现。可选、推荐，但永远不阻塞发货。
- **跨模型张力检测。** 当 outside voice 与主 review 的结论冲突时，系统会自动把这些分歧提出来，并可转成 TODO，避免丢失。
- **Outside Voice 进入 Review Readiness Dashboard。** `/ship` 现在会把“计划上是否跑过 outside voice”作为单独一行展示，和 CEO/Eng/Design/Adversarial 等项并列。

### 变更

- **`/plan-eng-review` 的 Codex 集成升级。** 旧的硬编码 Step 0.5 被一个更完整的 resolver 取代，加入 Claude subagent 回退、review log 持久化、dashboard 可见性，以及更高的推理强度（`xhigh`）。

## [0.11.5.1] - 2026-03-23 — Inline Office Hours

### 变更

- **不再需要“开另一个窗口”来跑 `/office-hours`。** 当 `/plan-ceo-review` 或 `/plan-eng-review` 建议先跑 `/office-hours` 时，现在会直接在当前会话内联执行。设计文档生成完后，评审会在原地继续。对于中途发现“你其实还没想清楚要做什么”的情形也是一样。
- **移除 handoff note 基础设施。** 旧版为了支持“去另一个窗口再回来”的流程会写 handoff notes，现在这条链路已经不再需要；不过为了兼容旧会话，仍然能读取历史 handoff note。

## [0.11.5.0] - 2026-03-23 — Bash Compatibility Fix

### 修复

- **`gstack-review-read` 与 `gstack-review-log` 在 bash 下不再崩。** 这两个脚本以前用 `source <(gstack-slug)`，在 bash + `set -euo pipefail` 下会静默失败，最终报 `SLUG: unbound variable`。现在改为 `eval "$(gstack-slug)"`，可同时兼容 bash 与 zsh。
- **所有 `SKILL.md` 模板同步更新。** 任何曾指导 agent 运行 `source <(gstack-slug)` 的模板，现在都改成 `eval "$(gstack-slug)"`，并已重生成所有 `SKILL.md`。
- **新增回归测试。** 验证 `eval "$(gstack-slug)"` 在 bash 严格模式下可用，并防止 `source <(.*gstack-slug` 这种模式再次出现在模板或 bin 脚本里。

## [0.11.4.0] - 2026-03-22 — Codex in Office Hours

### 新增

- **你的 brainstorming 现在会拿到 second opinion。** 在 `/office-hours` 的 premise challenge 之后，你可以选择开启 Codex cold read：一个完全没见过当前对话的独立 AI，会重新审视你的问题、回答和前提，帮你 steelman 想法、指出你说过最关键的一句话、挑战一个前提，并给出一个 48 小时原型建议。两个不同模型看到的盲点，经常不一样。
- **Design doc 中的 Cross-Model Perspective。** 如果你启用了 second opinion，设计文档里会自动加入 `## Cross-Model Perspective` 段，保留 Codex 的独立视角，供后续评审继续使用。
- **新的 founder signal：能为被挑战的前提给出理由。** 当 Codex 挑战某个前提，而你不是简单否掉，而是能清楚给出保留它的理由，这会被记录为积极的信号。

## [0.11.3.0] - 2026-03-23 — Design Outside Voices

### 新增

- **每次设计评审都带 second opinion。** `/plan-design-review`、`/design-review`、`/design-consultation` 现在都会并行派发 Codex（OpenAI）和一个新的 Claude subagent 来独立评估设计，再用 litmus scorecard 综合二者结论。跨模型一致 = 高置信，不一致 = 值得深挖。
- **OpenAI 的设计硬规则内置。** 把 OpenAI “Designing Delightful Frontends” 中的 7 条硬拒绝、7 条 litmus checks，以及 landing-page / app-UI 分类器，与 gstack 原有的 10 项 AI slop 黑名单融合进同一套审查规则。
- **每个 PR 里的 Codex 设计视角。** `/ship` 和 `/review` 内部那条轻量设计 review 路径，只要检测到 frontend 文件变更，现在就会自动带上 Codex design check，不需要 opt-in。
- **`/office-hours` brainstorming 里的 outside voices。** 做完 wireframe sketch 之后，你可以在锁方向前先拿一轮 Codex + Claude subagent 的设计反馈。
- **AI slop blacklist 提取为共享常量。** 10 个反模式（紫色渐变、3 栏图标网格、所有东西都居中等）现在只定义一次，并共享给所有设计技能，维护更轻，也不再会漂移。

## [0.11.2.0] - 2026-03-22 — Codex Just Works

### 修复

- **Codex 启动时不再报 “exceeds maximum length of 1024 characters”。** 技能 description 从约 1200 字压缩到约 280 字，远低于限制；每个 skill 都新增了上限测试。
- **不再重复发现同一个 skill。** Codex 以前会同时发现源码 `SKILL.md` 和生成出来的 Codex skills，导致每个 skill 都显示两次。Setup 现在会在 `~/.codex/skills/gstack` 里创建一个最小运行时根目录，只暴露 Codex 真正需要的资产，不再把源码树直接暴露出去。
- **旧式直装会自动迁移。** 如果你过去直接把 gstack clone 到 `~/.codex/skills/gstack`，setup 会检测并把它移动到 `~/.gstack/repos/gstack`，从而避免从源码 checkout 中发现技能。
- **Sidecar 目录不再被当作 skill 链接。** `.agents/skills/gstack` 这个运行时资产目录过去会和真实 skill 一起被 symlink，现在会跳过。

### 新增

- **Repo-local Codex 安装。** 可把 gstack clone 到任意 repo 内的 `.agents/skills/gstack`，然后运行 `./setup --host codex`，技能会安装到 checkout 旁边，不需要全局 `~/.codex/`。生成出来的 preamble 会在运行时自动判断是 repo-local 还是全局路径。
- **Kiro CLI 支持。** `./setup --host kiro` 可为 Kiro agent 平台安装技能，并自动改写路径和 symlink 运行时资产。如果检测到安装了 `kiro-cli`，`--host auto` 也会自动识别。
- **`.agents/` 改为 gitignore。** 生成的 Codex skill 文件不再提交进仓库，而是在 setup 时由模板生成。一次性从仓库中移除了 14000+ 行生成产物。

### 变更

- **`GSTACK_DIR` 更名为 `SOURCE_GSTACK_DIR` / `INSTALL_GSTACK_DIR`。** 让 setup 脚本里“源码路径”和“安装路径”语义更清晰。
- **CI 现在验证 Codex 生成成功，而不是检查提交文件 freshness。** 因为 `.agents/` 已不再提交。

## [0.11.1.1] - 2026-03-22 — Plan Files Always Show Review Status

### 新增

- **每个 plan 文件现在都会显示 review 状态。** 退出 plan mode 时，计划文件会自动带上 `GSTACK REVIEW REPORT` 段，即便你还没跑任何正式 review 也一样。过去只有跑过 `/plan-eng-review`、`/plan-ceo-review`、`/plan-design-review` 或 `/codex review` 后才会出现。现在你始终知道当前状态：哪些 review 已跑、哪些没跑、接下来该做什么。

## [0.11.1.0] - 2026-03-22 — Global Retro: Cross-Project AI Coding Retrospective

### 新增

- **`/retro global`：跨所有项目看你这段时间到底发了什么。** 它会扫描你的 Claude Code、Codex CLI 和 Gemini CLI 会话，把每次会话回溯到 git repo，以 remote 去重后做一份完整 retro：全局连续发货记录、context switching 指标、每个项目的分解和个人贡献、跨工具使用模式。比如运行 `/retro global 14d` 看最近两周。
- **Global retro 中的逐项目个人贡献。** 每个项目现在都会单独显示你的 commit、LOC、关键工作、提交类型占比和 biggest ship。独立项目会标明 “Solo project — all commits are yours.”；团队项目如果你没动代码，则只显示 session 数。
- **`gstack-global-discover`。** 这是 global retro 的底层引擎：在你的机器上发现所有 AI coding 会话，把工作目录解析到 git repo，标准化 SSH/HTTPS remote 做去重，最后输出结构化 JSON。它以编译型二进制随 gstack 分发，不依赖 `bun` 运行时。

### 修复

- **Discovery 脚本只读取会话文件前几 KB。** 不再把几 MB 的 JSONL transcript 全量读进内存，避免有大量历史的机器 OOM。
- **Claude Code session 统计更准确。** 以前会把项目目录里所有 JSONL 文件都算进去；现在只统计时间窗口内修改过的文件。
- **周窗口（`1w`、`2w`）与午夜对齐。** 这样 `/retro global 1w` 与 `/retro global 7d` 的结果保持一致。

## [0.11.0.0] - 2026-03-22 — /cso: Zero-Noise Security Audits

### 新增

- **`/cso`：你的 Chief Security Officer。** 面向整个代码库的安全审计：OWASP Top 10、STRIDE threat modeling、攻击面映射、数据分类、依赖扫描。每条 finding 都带 severity、confidence、具体攻击场景和修复选项。不是 linter，而是真正的 threat model。
- **零噪声误报过滤。** 17 条硬排除和 9 条先例，改编自 Anthropic 的安全评审方法学。DOS 不算 finding，测试文件不算攻击面，React 默认不算 XSS。每条 finding 必须达到 8/10 以上置信度才会出现在报告里。最终结果应当是 3 条真问题，而不是 3 条真问题 + 12 条理论问题。
- **独立 finding 验证。** 每个候选 finding 都会交给一个只知道 finding 本身和误报规则的全新 sub-agent，再做一次独立验证，防止锚定偏差。未通过独立验证的 finding 会被静默丢弃。
- **`browse storage` 自动打码敏感值。** 会同时按 key 名和 value 前缀检测 token、JWT、API key、GitHub PAT、Bearer token。输出会变成 `[REDACTED — 42 chars]`。
- **阻止 Azure metadata endpoint。** `browse goto` 的 SSRF 保护现在覆盖 AWS、GCP、Azure 三大云厂商。

### 修复

- **`gstack-slug` 防 shell 注入加固。** 输出只保留字母数字、点、横杠和下划线。所有剩余 `eval $(gstack-slug)` 的调用也都迁移为 `source <(...)`。
- **DNS rebinding 防护。** `browse goto` 现在会解析域名到 IP，并用 metadata blocklist 做比对，避免域名先指向安全 IP、再切到云 metadata endpoint 的攻击。
- **修复并发启动 server 的竞争。** 通过独占 lockfile，避免两个 CLI 同时杀旧 server 并拉起新实例，导致残留 Chromium 进程。
- **更聪明的 storage 打码。** key 匹配支持下划线边界，不会再把 `keyboardShortcuts` 或 `monkeyPatch` 误判为敏感字段。value 检测也扩展到了 AWS、Stripe、Anthropic、Google、Sendgrid、Supabase 等前缀。
- **修复 CI workflow YAML lint 错误。**

### 面向贡献者

- **在 CONTRIBUTING.md 中记录社区 PR 分流流程。**
- **Storage redaction 测试覆盖。** 新增 4 个测试，覆盖基于 key 与基于 value 的识别。

## [0.10.2.0] - 2026-03-22 — Autoplan Depth Fix

### 修复

- **`/autoplan` 不再把完整评审压缩成一句话。** 过去 autoplan 说 “auto-decide”，模型却理解成“连分析也一并省略”。现在 contract 已明确：auto-decide 替代的是你的判断，不是分析本身。每个评审 section 仍然必须读、必须画图、必须评估。深度应与手动逐个 review 一致。
- **CEO 与 Eng 阶段加入执行清单。** 每个阶段都明确列出必须产出的东西：前提挑战、架构图、测试覆盖图、失败登记、磁盘上的产物等，不再只说“按那个文件的深度去做”。
- **Pre-gate 校验会补抓漏输出。** 在打开最终审批 gate 前，autoplan 现在会先检查一张明确清单；若发现缺项，会在最多 2 次重试内补出，不行才发出警告。
- **Test review 永远不能跳过。** Eng review 中价值最高的测试图示章节被显式标为 NEVER SKIP OR COMPRESS，并要求读真实 diff、映射所有代码路径与覆盖，并写出测试计划产物。

## [0.10.1.0] - 2026-03-22 — Test Coverage Catalog

### 新增

- **测试覆盖审计现在在 plan、ship、review 三处都可用。** 代码路径追踪方法学（ASCII 图、质量评分、gap 检测）被抽成统一 `{{TEST_COVERAGE_AUDIT}}` resolver，供 `/plan-eng-review`、`/ship`、`/review` 三处复用。Plan mode 会在写代码前把缺失测试加进计划；ship mode 会自动生成测试；review mode 则在 pre-landing review 时找出未覆盖路径。
- **`/review` Step 4.75：测试覆盖图。** 在代码落地前，`/review` 现在会为每条改动路径画出 ASCII 覆盖图，标出哪些已测（★★★/★★/★）以及哪些是 GAP。Gaps 会作为 INFORMATIONAL finding 进入 Fix-First 流程，你可现场生成缺失测试。
- **内建 E2E 测试建议。** 覆盖审计能判断什么时候应建议 E2E（关键用户流程、单元测试难覆盖的复杂集成）而不是只写单测，也会对 LLM prompt 变更标记 eval 覆盖需求。
- **回归检测铁律。** 只要改动了既有行为，gstack 就必须写回归测试，不问、不跳过。
- **`/ship` 失败分诊。** 测试在 ship 过程中失败时，覆盖审计会先对失败分类，并给出下一步建议，而不是只把错误堆给你。
- **测试框架自动检测。** 优先读 `CLAUDE.md` 的测试命令，不足时再从 `package.json`、`Gemfile`、`pyproject.toml` 等项目文件自动推断，基本适配任意栈。

### 修复

- **无 `origin` remote 的 repo 中不再崩溃。** `gstack-repo-mode` 现在会优雅处理缺 remote、bare repo 和空 git 输出，默认到 `unknown` mode，不会把 preamble 直接打挂。
- **helper 无输出时 `REPO_MODE` 默认值正确。** 以前 `gstack-repo-mode` 返回空会导致 `REPO_MODE` 未设置，进而触发模板错误。

## [0.10.0.0] - 2026-03-22 — Autoplan

### 新增

- **`/autoplan`：一条命令，拿到完整评审过的计划。** 你给它一个粗糙计划，它会自动跑完整的 CEO → design → eng review 流水线。它会直接从磁盘读取真实 review skill 文件，因此深度和严格程度与逐个手动运行一致；中间决策则通过 6 条编码原则自动完成：completeness、boil lakes、pragmatic、DRY、explicit over clever、bias toward action。审美类分歧（接近的方案、临界 scope、Codex 分歧）会进入最终审批 gate，由你批准、覆盖、追问或修改。流程还会保存 restore point，方便从头重跑，并写出与 `/ship` dashboard 兼容的 review logs。

## [0.9.8.0] - 2026-03-21 — Deploy Pipeline + E2E Performance

### 新增

- **`/land-and-deploy`：合并、部署、验证一条龙。** 从 `/ship` 停下的位置接管后续流程：合并 PR、等待 CI 和部署工作流完成，再在生产 URL 上做 canary 验证。自动识别 Fly.io、Render、Vercel、Netlify、Heroku、GitHub Actions 等部署平台。每个失败点都给出 revert 选项。
- **`/canary`：部署后监控循环。** 借助 browse daemon 监控线上应用的 console error、性能回退和页面失败。会周期性截图、与部署前基线比对，并在异常时提醒。比如可运行 `/canary https://myapp.com --duration 10m`。
- **`/benchmark`：性能回归检测。** 建立页面加载时间、Core Web Vitals 和资源体积基线，并在每个 PR 上比较前后差异，还能做长期趋势追踪，帮你抓住代码评审常看不见的 bundle size 回退。
- **`/setup-deploy`：一次性部署配置。** 自动识别部署平台、生产 URL、健康检查端点和部署状态命令，并把配置写入 `CLAUDE.md`，让后续 `/land-and-deploy` 真正自动化。
- **`/review` 现在包含 Performance & Bundle Impact 分析。** 信息性评审 pass 会检测重依赖、缺失 lazy loading、同步 script 标签和 bundle size 回退，能在发货前发现像 “moment.js 其实只该用 date-fns” 这类问题。

### 变更

- **E2E 测试提速 3-5 倍。** 结构测试默认切到 Sonnet，质量测试继续留给 Opus，全套用时从 50-80 分钟降到约 15-25 分钟。
- **全部 E2E 测试默认带 `--retry 2`。** 给 flaky 测试第二次机会，但不掩盖真实失败。
- **新增 `test:e2e:fast` 层。** 默认跳过最慢的 8 个 Opus 质量测试，用于快速反馈。
- **E2E 时序 telemetry。** 每个测试都会记录 `first_response_ms`、`max_inter_turn_ms` 与使用模型，方便判断并行是否真的有效。

### 修复

- `plan-design-review-plan-mode` 不再相互踩临时目录。
- `ship-local-workflow` 不再浪费大量 turns 去现场读一份超长 `SKILL.md`。
- `design-consultation-core` 的章节匹配支持同义词。

## [0.9.7.0] - 2026-03-21 — Plan File Review Report

### 新增

- **计划文件现在会直接显示 review 覆盖情况。** 任何 review skill 结束后，都会把一张 markdown 表追加到计划文件本身，展示各 review 的触发命令、目的、运行次数、状态和摘要，不必再翻对话历史。
- **Review 日志数据更丰富。** CEO review 记录 scope proposal，eng review 记录发现问题总数，design review 记录前后分数变化，codex review 记录修复数，计划文件报告直接使用这些字段。

## [0.9.6.0] - 2026-03-21 — Auto-Scaled Adversarial Review

### 变更

- **Review 严格度自动按 diff 大小缩放。** 小 diff 跳过 adversarial，中 diff 跑一次跨模型对抗挑战，大 diff 则跑完整的四遍分析（Claude structured、Codex structured gate、Claude adversarial、Codex adversarial）。
- **Claude 也有 adversarial mode。** 一个没有 checklist 偏见的新 Claude subagent，会像攻击者与 chaos engineer 一样找边界条件、竞态和安全洞。
- **Dashboard 行名改为 “Adversarial”。** 反映真实的多模型对抗评审，而不是只叫 “Codex Review”。

## [0.9.5.0] - 2026-03-21 — Builder Ethos

### 新增

- **`ETHOS.md`。** 用一份文档浓缩 gstack 的 builder 哲学：Golden Age、Boil the Lake、Search Before Building、Build for Yourself。
- **所有工作流 skill 都先搜索再建议。** 在建议基础设施模式、并发方式或框架方案前，会先检查运行时内建与当前最佳实践，再进入一二三层知识综合。
- **Eureka moments。** 当第一性原理推导得出与常规共识不同的结论时，gstack 会显式记录并在 `/retro` 中回顾。
- **多个 skill 新增搜索前置。** `/office-hours`、`/plan-eng-review`、`/investigate`、`/design-consultation` 都接入了这一套三层知识综合。
- **CEO review → `/office-hours` handoff 会保留上下文。** 重新回到 CEO review 时不会再丢失前面讨论。

## [0.9.4.1] - 2026-03-20

### 变更

- **`/retro` 不再对大 PR 尺寸“说教”。** 仍然会报告 PR size 分布，但不再把 XL PR 默认判定成问题。

## [0.9.4.0] - 2026-03-20 — Codex Reviews On By Default

### 变更

- **Codex review 默认在 `/ship` 和 `/review` 自动运行。** 不再每次都问你要不要 second opinion。首次使用时只做一次 opt-in，之后即可全自动；可用 `gstack-config set codex_reviews enabled|disabled` 配置。
- **Codex 默认用 `xhigh` 推理强度做 code review。**
- **Codex 评审错误不会污染 dashboard。** 鉴权失败、超时和空响应都会在写日志前被拦截。
- **Codex review log 加入 commit hash。** 终于能和其他 review 一样判断 staleness。

### 修复

- **防止 Codex-for-Codex 递归。** 当 gstack 自己运行在 Codex CLI 下时，会直接剥离 Codex review 步骤。

## [0.9.3.0] - 2026-03-20 — Windows Support

### 修复

- **gstack 可在 Windows 11 上工作。** Setup 不再卡在 Playwright 校验，browse server 会自动回退到 Node.js，以绕过 Bun 在 Windows 上的 pipe 处理问题。
- **路径处理支持 Windows。** `/tmp` 与 Unix 风格路径分隔符都替换为平台感知实现。

### 新增

- **Node.js 的 Bun API polyfill。**
- **Node 版 server 构建脚本。**

## [0.9.2.0] - 2026-03-20 — Gemini CLI E2E Tests

### 新增

- **Gemini CLI 的端到端测试。** 新增 2 个 E2E 测试验证 gstack skill 能被 Gemini CLI 正确发现和执行。
- **Gemini JSONL parser。** `parseGeminiJSONL` 带 10 个单测，覆盖 init、message、tool_use、tool_result、result 等事件。
- **独立测试脚本。** `bun run test:gemini` 与 `bun run test:gemini:all`。

## [0.9.1.0] - 2026-03-20 — Adversarial Spec Review + Skill Chaining

### 新增

- **设计文档在你看到之前先经历对抗式审查。** `/office-hours` 生成的 design doc 会被独立 AI reviewer 最多连审 3 轮，给出 1-10 质量分和修复摘要。
- **Brainstorming 阶段直接产出视觉 wireframe。** 对 UI 想法，`/office-hours` 会用设计系统草生成 HTML wireframe 并截图。
- **Skills 之间会互相协作。** `/plan-ceo-review` 和 `/plan-eng-review` 会在合适时建议先跑 `/office-hours`。
- **Spec review metrics。** 记录迭代次数、问题数、修复数与质量分。

## [0.9.0.1] - 2026-03-19

### 变更

- **Telemetry opt-in 现在默认先推荐社区模式。** 若拒绝，还会给一次匿名模式机会。

### 修复

- **Plan mode 下的 review logs 与 telemetry 持久化修复。**

## [0.9.0] - 2026-03-19 — Works on Codex, Gemini CLI, and Cursor

**gstack 现在可运行在任何支持开放 `SKILL.md` 标准的 AI agent 上。**

- 一次安装，四个 agent：Claude Code、OpenAI Codex CLI、Google Gemini CLI、Cursor。
- `./setup --host auto` 自动检测环境并安装到对应 host。
- 为 Codex 生成的输出会做 frontmatter 精简和路径重写；`/codex` skill 本身不会出现在 Codex 输出里，避免自指。
- CI 会分别校验 Claude 与 Codex 输出 freshness。

## [0.8.6] - 2026-03-19

### 新增

- **本地使用分析。** 运行 `gstack-analytics` 可看技能使用、耗时、成功率。
- **可选社区 telemetry。** 首次运行可选择共享匿名使用数据，不含代码或文件路径。
- **社区健康看板。** `gstack-community-dashboard` 可查看社区整体技能热度、崩溃分布、版本分布。
- **通过 update check 统计安装基数。**
- **Crash clustering 与升级漏斗追踪。**
- **`/retro` 展示 gstack 使用情况。**
- **会话级 pending marker。**

## [0.8.5] - 2026-03-19

### 修复

- `/retro` 现在按完整自然日统计，不会漏掉当天早些时候的提交。
- Review log 现在支持带 `/` 的分支名。
- Skill 模板去掉了 Rails 专属硬编码，转向平台无关。
- `/ship` 从 `CLAUDE.md` 读取测试命令，而不是硬编码。

### 新增

- **平台无关设计原则** 与 `## Testing` 章节写入 `CLAUDE.md`。

## [0.8.4] - 2026-03-19

### 新增

- **`/ship` 自动同步文档。** 创建 PR 后会自动运行 `/document-release`。
- **文档补齐 6 个新技能。** 包括 `/codex`、`/careful`、`/freeze`、`/guard`、`/unfreeze`、`/gstack-upgrade`。
- **Browse handoff 文档化。**
- **主动建议覆盖所有技能。**

## [0.8.3] - 2026-03-19

### 新增

- **Plan reviews 会告诉你下一步该跑什么。**
- **Reviews 记录 commit 并检测 staleness。**
- **`skip_eng_review` 在所有地方统一生效。**
- **Design review lite 也带 commit 追踪。**

### 修复

- Browse 阻止危险 URL（`file://`、`javascript:`、metadata endpoints）。
- `./setup` 在没装 bun 时会给出清晰提示。
- `/debug` 更名为 `/investigate`，避开 Claude 内建命令冲突。
- `gstack-slug` 输出清洗。
- 新增 25 个安全测试。

## [0.8.2] - 2026-03-19

### 新增

- **Headless 浏览器卡住时可交接给真实 Chrome。** `$B handoff` / `$B resume` 可以把 cookies、标签页和当前页面状态带到可见 Chrome，再带回来。
- **连续失败 3 次后自动建议 handoff。**
- **15 个 handoff 相关测试。**

### 变更

- `recreateContext()` 重构为共享 `saveState()` / `restoreState()`。
- `browser.close()` 增加 5 秒超时。

## [0.8.1] - 2026-03-19

### 修复

- **`/qa` 在纯后端改动时也会打开浏览器。** 如果 diff 里推不出具体页面，就自动回退到 Quick smoke test。

## [0.8.0] - 2026-03-19 — Multi-AI Second Opinion

**`/codex`：从完全不同的 AI 那里拿独立第二意见。**

- `/codex review` 运行 Codex CLI 对 diff 做 pass/fail gate。
- `/codex challenge` 走对抗模式，专找线上会坏的路径。
- `/codex <anything>` 打开一段可持续上下文的 Codex 会话。
- 当 `/review` 与 `/codex review` 都跑过时，会给出跨模型分析。
- 同时引入 **主动 skill 建议**：gstack 会根据你所处开发阶段推荐对应 skill，可自然语言关闭。

## [0.7.4] - 2026-03-18

### 变更

- **`/qa` 与 `/design-review` 面对未提交修改时会先问你怎么处理。** 可以提交、stash 或直接中止，不再一上来就拒绝启动。

## [0.7.3] - 2026-03-18

### 新增

- **`/careful` 安全模式。** 会在危险命令前给警告，可逐次覆盖。
- **`/freeze` 目录级写保护。** 限制编辑范围，不只是提示，而是硬阻止。
- **`/guard` 一条命令同时开启两者。**
- **`/debug` 自动把编辑范围 freeze 到最小模块。**
- **本地 skill 使用分析** 与 **`/retro` 中的 skill 使用统计**。

## [0.7.2] - 2026-03-18

### 修复

- `/retro` 日期范围与本地时区修复。

## [0.7.1] - 2026-03-19

### 新增

- **gstack 会在自然时机主动推荐 skill。**
- **生命周期映射表。**
- **可用自然语言 opt-out。**
- **11 个 journey-stage E2E 测试。**
- **Trigger phrase 静态校验。**

### 修复

- `/debug` 与 `/office-hours` 过去没有任何自然语言触发词，现已补齐。

## [0.7.0] - 2026-03-18 — YC Office Hours

**`/office-hours`：在写第一行代码前，先和 YC partner 坐下来聊一轮。**

- Startup 模式：6 个强制问题，直击需求、现状、狭窄楔子、洞察与未来适配。
- Builder 模式：为 side project、学习项目、黑客松等场景提供高质量 brainstorming。
- 两种模式都会产出设计文档，直接喂给 `/plan-ceo-review` 与 `/plan-eng-review`。

**`/debug`：找根因，而不是修表象。**

- 遵循铁律：不先调查根因，就不允许修。
- 追踪数据流、匹配已知 bug 模式、逐一验证假设。
- 连续 3 次修复失败就会停下来反思架构，而不是继续瞎改。

## [0.6.4.1] - 2026-03-18

### 新增

- **Skills 现在可通过自然语言发现。** 之前缺 trigger phrase 的 12 个技能都已补齐。

## [0.6.4.0] - 2026-03-17

### 新增

- **`/plan-design-review` 改为交互式 0-10 评分与修 plan。**
- **CEO review 在检测到 UI scope 时自动带上设计视角。**
- **14/15 个技能实现完整测试覆盖。**
- **Bisect commit 风格。** CLAUDE.md 要求每次 commit 都只做一个逻辑变化。

### 变更

- `/qa-design-review` 更名为 `/design-review`。

## [0.6.3.0] - 2026-03-17

### 新增

- **前端代码变更默认带 design review。**
- **`gstack-diff-scope` 会判断前后端、prompts、tests、docs、config 等范围。**
- **Design review 进入 Review Readiness Dashboard。**
- **Design review detection 的 E2E eval。**

## [0.6.2.0] - 2026-03-17

### 新增

- **Plan reviews 开始借鉴世界级思维模式。** CEO / Eng / Design 各自融入一批来自行业顶尖人物的认知框架。
- **从“检查清单”升级为“latent space 激活”。** 重点不是列举名词，而是让模型真正调动这些思维方式。

## [0.6.1.0] - 2026-03-17

### 新增

- **E2E 与 LLM-judge 只跑你改动真正影响到的测试。**
- **`bun run eval:select` 可预览将要运行的测试。**
- **完整性护栏。** 每个测试都必须在 TOUCHFILES 里有条目，否则 `bun test` 直接失败。

### 变更

- `test:evals` 与 `test:e2e` 改为按 diff 自动选择；新增 `:all` 脚本跑全集。

## 0.6.1 — 2026-03-17 — Boil the Lake

所有 gstack skill 都开始遵循 **Completeness Principle**：当 AI 让边际成本接近零时，默认推荐更完整的实现，而不是“90% 价值的缩水版”。

- AskUserQuestion 里加入 **Completeness score**。
- 估时同时显示人类团队与 Claude Code + gstack 时间。
- 增加反例库与首次 onboarding。
- `/review` 会指出那些其实只多花不到 30 分钟 CC 时间就能做完整的 shortcut 实现。
- CEO / Eng review 会统计最终建议中有多少是“完整方案”。

## 0.6.0.1 — 2026-03-17

- **`/gstack-upgrade` 会自动发现并同步陈旧 vendored copy。**
- **同步更安全。** 若同步过程中 `./setup` 失败，会恢复旧版本。

### 面向贡献者

- `gstack-upgrade/SKILL.md.tmpl` 做了 DRY 重构，更新检查回退逻辑也与 preamble 一致。

## 0.6.0 — 2026-03-17

- **测试覆盖成为 vibe coding 的关键基础设施。** 当项目没有测试框架时，gstack 现在会自动侦测运行时、研究最优方案、引导用户选择、安装、写 3-5 个真实测试、配置 GitHub Actions、生成 `TESTING.md` 并把测试文化写进 `CLAUDE.md`。
- **每个 bug fix 都会自动写回归测试。**
- **`/ship` 加入测试覆盖审计。**
- **`/retro` 跟踪测试健康度。**
- **设计 review 的行为变更也会写回归测试。**

### 面向贡献者

- 引入 `{{TEST_BOOTSTRAP}}` resolver，并接入 qa、ship、qa-design-review。
- 新增大量验证测试与 E2E eval。

## 0.5.4 — 2026-03-17

- **`/plan-eng-review` 永远跑完整评审。** 不再询问“小改动 / 大改动”模式。
- **`/ship` 对 review gate 的 override 会按分支记住。**

## 0.5.3 — 2026-03-17

- **`/plan-ceo-review` 的 scope expansion 现在逐项由你决定。**
- **新增 SELECTIVE EXPANSION 模式。**
- **CEO 视野与扩张方案会持久化保存。**
- **`/ship` gate 更智能。** Eng review 仍是核心 gate，CEO/Design 根据场景推荐。

## 0.5.2 — 2026-03-17

- **`/design-consultation` 会主动呈现 SAFE CHOICES 与 RISKS。**
- **研究真实竞品站点，而不只是搜网页。**
- **Preview page 更像真实产品，而不只是字体与色板展示。**

## 0.5.1 — 2026-03-17

- **Review Readiness Dashboard。** `/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review` 现在都会把结果写入统一 tracker，并展示是否 CLEARED TO SHIP。
- **`/ship` 在创建 PR 前会检查 review 完整度。**
- **`gstack-slug` 抽成共享 helper。**
- **截图在 QA / browse 会话中可直接点击查看。**

## 0.5.0 — 2026-03-16

- **`/plan-design-review`：像资深产品设计师一样审你的网站。**
- **`/qa-design-review`：不只审，还会在源码里迭代修设计问题。**
- **从线上站点反推出真实设计系统，并可保存成 `DESIGN.md`。**
- **AI Slop Score 成为 headline metric。**
- **支持设计基线与回归追踪。**
- **内置 80 项设计审计 checklist。**

## 0.4.5 — 2026-03-16

- **`/review` 和 `/ship` 的 findings 现在会真的被处理。** 明显机械性的直接 auto-fix，真正模糊的再合并成一个问题问你。
- **AUTO-FIX / ASK 的分类被集中到 `review/checklist.md` 中统一管理。**

### 修复

- `$B js` 现在正确支持 `const`、分号、多行和 `await`。
- 点击 `<option>` 不再无限挂住；不适合 click 的场景会明确提示改用 `browse select`。

## 0.4.4 — 2026-03-16

- **新版本能在 1 小时内被检测到。**
- **`/gstack-upgrade` 强制直连 GitHub 做真实检查。**

## 0.4.3 — 2026-03-16

- **新增 `/document-release`。**
- **所有问题都更清晰，始终带项目与分支上下文。**
- **分支名在中途切分支后也能正确跟上。**

## 0.4.2 — 2026-03-16

- **`$B js "await fetch(...)"` 现已开箱即用。**
- **Contributor mode 开始做主动反思，而不仅是被动报错。**
- **`/ship`、`/review`、`/qa`、`/plan-ceo-review` 会识别真实 base branch。**
- **`/retro` 可适配任意默认分支。**
- **新增 `{{BASE_BRANCH_DETECT}}` 占位符。**

## 0.4.1 — 2026-03-16

- **gstack 会在自己搞砸时主动察觉。**
- **多窗口并行使用时问题提示会告诉你这是哪个项目、哪个分支。**
- **每个问题都带推荐。**
- **`/review` 能追踪 enum handler 漏更新。**

## 0.4.0 — 2026-03-16

### 新增

- **`/qa-only`。**
- **`/qa` 的 find-fix-verify 循环。**
- **Plan-to-QA 产物流。**
- **`{{QA_METHODOLOGY}}`。**
- **Eval 效率指标与 commentary 引擎。**
- **Ref staleness 检测。**

### 修复

- SPA 导航后的陈旧 ref 问题。

## 0.3.9 — 2026-03-15

### 新增

- `bin/gstack-config` CLI。
- 更聪明的 update check、auto-upgrade、4 选项升级提示、vendored copy 同步。

### 变更

- README 的升级与排障简化为 `/gstack-upgrade`。

## 0.3.8 — 2026-03-14

### 新增

- **`TODOS.md` 成为单一事实来源。**
- `/ship` 会管理 `TODOS.md`。
- 多个 skill 读取 `TODOS.md`。
- Greptile 分级回复与重排严重度机制。

### 修复

- `.gitignore` 追加失败不再被静默吞掉。

### 变更

- 删除 `TODO.md`，统一收敛进 `TODOS.md`。

## 0.3.7 — 2026-03-14

### 新增

- `screenshot` 支持元素裁切、区域裁切与仅视口模式。

## 0.3.6 — 2026-03-14

### 新增

- **E2E 可观测性体系。**
- `bun run eval:watch` 实时看板。
- 增量 eval 保存、机器可读诊断、API 连通性预检、stream-json NDJSON parser、eval 持久化与 CLI。
- 全部 9 个技能改成 `.tmpl` 模板。
- 3 层 eval 套件与 planted-bug outcome testing。

### 修复

- Browse binary 发现、update check exit code、browse/SKILL 缺 setup block、plan-ceo-review timeout 等问题。

### 变更

- 模板系统扩展为 `{{UPDATE_CHECK}}` + `{{BROWSE_SETUP}}`。
- 命令描述更丰富，setup block 优先工作区路径，judge 从 Haiku 升到 Sonnet 4.6。

## 0.3.3 — 2026-03-13

### 新增

- **SKILL.md 模板系统。**
- **命令注册表与 snapshot flags 元数据。**
- **三级验证：静态校验、E2E、LLM-as-judge。**
- `bun run skill:check`、`bun run dev:skill`、CI freshness workflow。
- `ARCHITECTURE.md`、`conductor.json`、`.env` 传播、`.env.example`。

### 变更

- Build 在编译二进制前先跑 `gen:skill-docs`。
- `SKILL.md` 与 `browse/SKILL.md` 变成生成文件。

## 0.3.2 — 2026-03-13

### 修复

- Cookie import picker 改回 JSON 输出。
- `help` 命令路由修复。
- 全局旧 server 不再遮蔽本地开发改动。
- 崩溃日志路径从 `/tmp` 迁到 `.gstack/`。

### 新增

- **Diff-aware QA mode。**
- **项目级 browse 状态目录 `.gstack/`。**
- **共享配置模块、随机端口、二进制版本跟踪、旧 `/tmp` 清理。**
- **Greptile 集成、本地开发模式、`help` 命令、版本感知 `find-browse`。**

### 变更

- 状态文件、日志位置、原子写、README 与构建流程同步更新。

### 移除

- `CONDUCTOR_PORT` 魔法偏移与旧 fallback。

## 0.3.1 — 2026-03-12

### Phase 3.5：浏览器 cookie 导入

- 支持从真实 Chromium 浏览器解密并导入 cookie。
- 提供交互式 picker UI 与 `--domain` 直导模式。
- 新增 `/setup-browser-cookies`。

## 0.3.0 — 2026-03-12

### Phase 3：/qa 技能

- 新增 `/qa`，带 6 阶段 QA 流程、三种模式、结构化报告与框架识别。

### Phase 2：增强浏览器

- 对话框、上传、元素状态检查、带 ref 的截图、snapshot diff、network idle 等能力齐备。
- 改写 `SKILL.md` 成 QA 导向 playbook。

## 0.0.2 — 2026-03-12

- 修复项目内 `/browse` 安装。
- setup 会重建陈旧二进制并在失败时返回非零。
- 修复 `chain` 吞错误、CLI 无限重启、buffer 无界增长、磁盘 flush 停止、`ln -snf` 嵌套 symlink、升级用 `git pull` 的问题。
- 安装方式简化为 global-first + 可选项目副本。
- README 重构；技能数增至 6（新增 `/retro`）。

## 0.0.1 — 2026-03-11

初始发布。

- 5 个技能：`/plan-ceo-review`、`/plan-eng-review`、`/review`、`/ship`、`/browse`
- 支持 40+ 命令的 headless browser CLI，带 ref 交互与持久 Chromium daemon
- 一条命令安装为 Claude Code skills
- `setup` 脚本负责二进制编译与 skill symlink
