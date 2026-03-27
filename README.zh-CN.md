[English](README.md) | 简体中文

# gstack

> "I don't think I've typed like a line of code probably since December, basically, which is an extremely large change." — [Andrej Karpathy](https://fortune.com/2026/03/21/andrej-karpathy-openai-cofounder-ai-agents-coding-state-of-psychosis-openclaw/), No Priors podcast, March 2026

听到 Karpathy 这么说时，我想知道他到底是怎么做到的。一个人，怎么才能像二十人团队一样发货？Peter Steinberger 基本靠 AI agents 单枪匹马构建了 [OpenClaw](https://github.com/openclaw/openclaw)，拿下了 247K GitHub stars。革命已经来了。只要工具到位，一个独立开发者就能比传统团队跑得更快。

我是 [Garry Tan](https://x.com/garrytan)，[Y Combinator](https://www.ycombinator.com/) 的 President & CEO。我和几千家初创公司合作过，Coinbase、Instacart、Rippling 这些公司还只有一两个人在车库里时，我就和他们一起工作。加入 YC 之前，我是 Palantir 最早的一批 eng/PM/designer 之一，联合创办了 Posterous（后来卖给 Twitter），也做过 YC 内部社交网络 Bookface。

**gstack 就是我的答案。** 我做产品已经二十年了，而现在是我输出代码最多的阶段。过去 60 天里，我写了 **600,000+ 行生产代码**（其中 35% 是测试），**每天 10,000-20,000 行**，而且是在全职管理 YC 的同时兼职完成的。下面是我最近一次跨 3 个项目运行 `/retro` 的结果：一周里 **新增 140,751 行、362 次 commits、净增约 115k LOC**。

**2026 年 — 1,237 次贡献，还在继续：**

![GitHub contributions 2026 — 1,237 contributions, massive acceleration in Jan-Mar](docs/images/github-2026.png)

**2013 年 — 我在 YC 做 Bookface 时（772 次贡献）：**

![GitHub contributions 2013 — 772 contributions building Bookface at YC](docs/images/github-2013.png)

还是同一个人，只是时代变了。真正的差别，在于工具。

**gstack 就是我现在的工作方式。** 它把 Claude Code 变成一支虚拟工程团队：有 CEO 重新思考产品，有 eng manager 锁定架构，有 designer 挡住 AI slop，有 reviewer 挖出生产事故，有 QA lead 打开真实浏览器，有 security officer 做 OWASP + STRIDE 审计，还有 release engineer 负责把 PR 发出去。二十位专家，八个增强工具，全部是 slash commands，全部是 Markdown，全部免费，MIT license。

这就是我的开源软件工厂。我每天都在用它。我把它开源出来，是因为这些工具应该人人都能用到。

Fork 它，改进它，把它变成你自己的工具。如果你想吐槽免费开源软件，也没问题，但我更希望你先亲手试一次。

**适合谁用：**
- **Founders 和 CEOs**，尤其是仍然想亲自下场发货的技术型创始人
- **第一次使用 Claude Code 的人**，不想面对一片空白提示词，而是想直接得到结构化角色分工
- **Tech leads 和 staff engineers**，希望每个 PR 都带上严格的 review、QA 和 release automation

## 快速开始

1. 安装 gstack（30 秒，见下文）
2. 运行 `/office-hours`，描述你正在构建什么
3. 针对任意功能想法运行 `/plan-ceo-review`
4. 在任何有变更的分支上运行 `/review`
5. 对你的 staging URL 运行 `/qa`
6. 先做到这里就够了。你会很快知道它是不是适合你。

## 安装 — 30 秒

**要求：** [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Git](https://git-scm.com/), [Bun](https://bun.sh/) v1.0+, [Node.js](https://nodejs.org/)（仅 Windows）

### 第 1 步：安装到你的机器上

打开 Claude Code，把下面这段贴进去。剩下的事 Claude 会处理。

> Install gstack: run **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** then add a "gstack" section to CLAUDE.md that says to use the /browse skill from gstack for all web browsing, never use mcp\_\_claude-in-chrome\_\_\* tools, and lists the available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade. Then ask the user if they also want to add gstack to the current project so teammates get it.

### 第 2 步：加入你的仓库，让队友也能拿到（可选）

> Add gstack to this project: run **`cp -Rf ~/.claude/skills/gstack .claude/skills/gstack && rm -rf .claude/skills/gstack/.git && cd .claude/skills/gstack && ./setup`** then add a "gstack" section to this project's CLAUDE.md that says to use the /browse skill from gstack for all web browsing, never use mcp\_\_claude-in-chrome\_\_\* tools, lists the available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex, /cso, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, and tells Claude that if gstack skills aren't working, run `cd .claude/skills/gstack && ./setup` to build the binary and register skills.

真实文件会直接提交进你的仓库里，而不是作为 submodule，所以别人 `git clone` 下来就能直接工作。所有东西都放在 `.claude/` 里，不会改你的 PATH，也不会在后台偷偷跑服务。

> **想参与贡献，或者需要完整历史？** 上面的命令使用 `--depth 1` 来加快安装。如果你准备参与贡献，或者需要完整 git history，请改用完整 clone：
> ```bash
> git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> ```

### Codex、Gemini CLI 或 Cursor

gstack 适用于任何支持 [SKILL.md standard](https://github.com/anthropics/claude-code) 的 agent。所有 skills 都放在 `.agents/skills/` 中，会被自动发现。

安装到单个仓库：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git .agents/skills/gstack
cd .agents/skills/gstack && ./setup --host codex
```

当 setup 从 `.agents/skills/gstack` 运行时，它会把生成出来的 Codex skills 安装到同一仓库中相邻的位置，而不会写入 `~/.codex/skills`。

为当前用户安装一次：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host codex
```

`setup --host codex` 会在 `~/.codex/skills/gstack` 创建 runtime root，
并把生成后的 Codex skills 链接到顶层。
这样可以避免源仓库 checkout 被重复发现 skills。

或者让 setup 自动检测你已经安装了哪些 agents：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host auto
```

对于兼容 Codex 的 hosts，setup 现在同时支持两种安装方式：从 `.agents/skills/gstack` 进行 repo-local install，或从 `~/.codex/skills/gstack` 进行 user-global install。全部 28 个 skills 都能在所有受支持的 agents 上工作。基于 hook 的 safety skills（careful、freeze、guard）在非 Claude hosts 上会回退为内联安全提示文本。

## 看它如何工作

```text
你:      我想为自己的日历做一个 daily briefing app。
你:      /office-hours
Claude: [开始追问痛点，要求具体例子，而不是泛泛而谈]

你:      我有多个 Google calendars，活动信息经常过期，地点也不对。
         每天准备很久，结果还是不够好……

Claude: 我要先反驳一下你的 framing。你说的是“daily briefing
         app”，但你真正描述出来的，其实是一个 personal chief
         of staff AI。
         [提炼出 5 个你自己都没意识到的能力]
         [质疑 4 个前提，你可以同意、反对或调整]
         [给出 3 种实现路径，并附上工作量估算]
         RECOMMENDATION: 明天先发最窄的 wedge，从真实使用中学习。
         完整愿景是一个 3 个月项目，先把真正可用的 daily briefing
         做出来。
         [写出 design doc → 自动喂给后续 skills]

你:      /plan-ceo-review
         [读取 design doc，质疑范围，执行 10 个部分的 review]

你:      /plan-eng-review
         [输出 data flow、state machines、error paths 的 ASCII 图]
         [测试矩阵、failure modes、安全问题]

你:      Approve plan. Exit plan mode.
         [跨 11 个文件写出 2,400 行代码，约 8 分钟]

你:      /review
         [AUTO-FIXED] 2 个问题。[ASK] Race condition → 你批准修复。

你:      /qa https://staging.myapp.com
         [打开真实浏览器，点完整个流程，找到并修掉一个 bug]

你:      /ship
         Tests: 42 → 51（新增 9 个）。PR: github.com/you/app/pull/42
```

你说的是“daily briefing app”，agent 听出来的却是“你在做一个 chief of staff AI”，因为它听的是你的痛点，而不是你表面的功能请求。八条命令，从头到尾。这不是 copilot，这是团队。

## 一个 sprint 的流程

gstack 不是一组工具的集合，而是一套流程。skills 按照一个 sprint 的真实顺序运行：

**Think → Plan → Build → Review → Test → Ship → Reflect**

每个 skill 都会把结果交给下一个 skill。`/office-hours` 会写 design doc，供 `/plan-ceo-review` 读取；`/plan-eng-review` 会产出 test plan，供 `/qa` 接手；`/review` 会抓出 bug，再由 `/ship` 验证是否已经修好。因为每一步都知道前一步发生了什么，所以不会有东西从缝里漏下去。

| Skill | 对应专家 | 职责 |
|-------|----------|------|
| `/office-hours` | **YC Office Hours** | 从这里开始。6 个强制性问题，在你写代码前重新定义产品。它会顶回你的 framing、质疑前提、给出替代实现路径。产出的 design doc 会流向所有下游 skills。 |
| `/plan-ceo-review` | **CEO / Founder** | 重新思考问题本身。从请求里找出那个真正有机会做到 10-star 的产品。四种模式：Expansion、Selective Expansion、Hold Scope、Reduction。 |
| `/plan-eng-review` | **Eng Manager** | 锁定架构、data flow、图示、边界情况和测试。把隐藏假设强行摊开。 |
| `/plan-design-review` | **Senior Designer** | 按 0-10 给每个设计维度打分，解释 10 分长什么样，然后直接修改 plan 往那里靠。负责识别 AI Slop。交互式流程，每个设计决策只问一个 AskUserQuestion。 |
| `/design-consultation` | **Design Partner** | 从零构建完整设计系统。研究你所在领域的现状，提出稳妥选择和创意风险，生成更接近真实产品的 mockups。 |
| `/review` | **Staff Engineer** | 找出那些能过 CI、却会在生产环境炸掉的 bug。能自动修的先自动修，并指出完整性缺口。 |
| `/investigate` | **Debugger** | 系统化做 root-cause debugging。铁律：不调查，就不修。追踪 data flow、验证假设，连续 3 次修复失败就停。 |
| `/design-review` | **Designer Who Codes** | 先按 `/plan-design-review` 的同样标准审设计，再把发现的问题修掉。使用 atomic commits，并给出 before/after screenshots。 |
| `/qa` | **QA Lead** | 测试你的应用、找 bug、用 atomic commits 修掉，再重新验证。每个修复都会自动生成 regression tests。 |
| `/qa-only` | **QA Reporter** | 方法论与 `/qa` 相同，但只报告，不改代码。输出纯 bug report。 |
| `/cso` | **Chief Security Officer** | 用 OWASP Top 10 + STRIDE threat model 做安全审查。低噪声：排除 17 类 false positives、设置 8/10+ confidence gate、独立验证每一条 finding。每条 finding 都会附带具体 exploit scenario。 |
| `/ship` | **Release Engineer** | 同步 main、跑测试、审 coverage、push、开 PR。如果你的项目还没有测试框架，它会顺手帮你把框架搭起来。 |
| `/land-and-deploy` | **Release Engineer** | 合并 PR，等待 CI 和部署完成，再验证生产健康。从“approved”到“verified in production”只要一条命令。 |
| `/canary` | **SRE** | 部署后的监控循环。盯 console errors、performance regressions 和 page failures。 |
| `/benchmark` | **Performance Engineer** | 建立 page load times、Core Web Vitals 和资源体积的基线，并在每个 PR 上对比前后变化。 |
| `/document-release` | **Technical Writer** | 把项目文档更新到和刚发布的内容一致。会自动抓出过期的 README。 |
| `/retro` | **Eng Manager** | 面向团队的周回顾。按人拆分贡献、跟踪 shipping streaks、测试健康趋势和成长机会。`/retro global` 会跨你所有项目和 AI 工具（Claude Code、Codex、Gemini）运行。 |
| `/browse` | **QA Engineer** | 给 agent 一双眼睛。真实 Chromium 浏览器、真实点击、真实截图。每条命令约 100ms。`$B connect` 会启动一个你能看到的真实 Chrome 窗口，你可以现场看它操作。 |
| `/setup-browser-cookies` | **Session Manager** | 把你真实浏览器（Chrome、Arc、Brave、Edge）的 cookies 导入 headless session，用来测试需要登录的页面。 |
| `/autoplan` | **Review Pipeline** | 一条命令生成经过完整评审的计划。自动串起 CEO → design → eng review，并把决策原则编码进去。只把真正属于 taste 的决策留给你批准。 |

### 增强工具

| Skill | 作用 |
|-------|------|
| `/codex` | **Second Opinion** —— 来自 OpenAI Codex CLI 的独立代码审查。三种模式：review（pass/fail gate）、adversarial challenge、open consultation。当 `/review` 和 `/codex` 都跑过时，还会给出 cross-model analysis。 |
| `/careful` | **Safety Guardrails** —— 在执行破坏性命令前发出警告，例如 rm -rf、DROP TABLE、force-push。说一句 “be careful” 就能激活。你也可以覆盖任何警告。 |
| `/freeze` | **Edit Lock** —— 把文件修改限制在单个目录内，调试时避免误改范围外内容。 |
| `/guard` | **Full Safety** —— 一条命令同时启用 `/careful` + `/freeze`。适合生产环境下的最高安全级别。 |
| `/unfreeze` | **Unlock** —— 解除 `/freeze` 边界。 |
| `/setup-deploy` | **Deploy Configurator** —— 为 `/land-and-deploy` 做一次性初始化。自动识别你的平台、生产 URL 和部署命令。 |
| `/gstack-upgrade` | **Self-Updater** —— 把 gstack 升级到最新版本。能识别是 global install 还是 vendored install，同步两边并展示变更。 |

**[带示例与理念说明的技能深度解析 →](docs/skills.md)**

## 并行 sprints

gstack 跑一个 sprint 已经很好用。十个一起跑时，它才真正变得有意思。

**设计在中心位置。** `/design-consultation` 不只是帮你挑字体。它会研究你所在领域已经有什么，提出稳妥选择，也提出值得冒的创意风险；它会基于你的真实产品生成更像样的 mockups，并写出 `DESIGN.md`。随后 `/design-review` 和 `/plan-eng-review` 会继续读取这些选择。设计决策会流过整个系统。

**`/qa` 是一个巨大的解锁。** 它让我能把并行 worker 数量从 6 提到 12。Claude Code 说出 *"I SEE THE ISSUE"*，然后真的把问题修掉、补上 regression test、再验证修复，这直接改变了我的工作方式。现在 agent 真的有眼睛了。

**聪明的 review 路由。** 就像一家运转良好的创业公司：CEO 不需要看基础设施 bug fix，design review 也不该要求所有 backend 变更都参加。gstack 会跟踪已经跑过哪些 reviews，判断什么 review 是合适的，然后自动做出正确选择。Review Readiness Dashboard 会在你 ship 之前告诉你当前状态。

**所有东西都要测。** 如果项目里没有测试框架，`/ship` 会从零帮你搭起来。每次 `/ship` 都会产出 coverage audit。每个 `/qa` 修掉的 bug 都会补上一条 regression test。目标是 100% test coverage。测试让 vibe coding 更安全，而不是变成 yolo coding。

**`/document-release` 是你以前从未拥有过的那位工程师。** 它会读取项目里的每份文档，对照 diff，把所有已经漂移的地方改回来。README、ARCHITECTURE、CONTRIBUTING、CLAUDE.md、TODOS 都能自动保持最新。现在 `/ship` 还会自动调用它，所以文档保持同步不需要额外命令。

**真实浏览器模式。** `$B connect` 会启动一个由 Playwright 控制、但真实可见的 Chrome 窗口。你可以实时看 Claude 点击、填写和导航，窗口是真窗口，屏幕是同一个屏幕。顶部边缘会有一条轻微的绿色 shimmer，提示哪一个 Chrome 窗口正在由 gstack 控制。现有 browse 命令全部无需修改。`$B disconnect` 则会回到 headless。Chrome extension Side Panel 会显示每条命令的实时活动流，以及一个你可以直接指挥 Claude 的聊天侧栏。这不是在远程控制一个隐藏浏览器，而是一种共驾式 co-presence。

**Sidebar agent：你的 AI 浏览器助手。** 你可以直接在 Chrome side panel 里输入自然语言指令，让一个子 Claude 实例去执行。“打开设置页并截图。”“用测试数据填完这个表单。”“把这张列表里的每一项都点开，把价格提取出来。” 每个任务最多运行 5 分钟。sidebar agent 跑在隔离 session 里，不会干扰你的主 Claude Code 窗口。它就像浏览器里多了一双手。

**个人自动化。** sidebar agent 不只适用于开发工作流。举个例子：“浏览我孩子学校的家长门户，把其他家长的姓名、手机号和照片都加到我的 Google Contacts 里。” 认证有两种方式：(1) 在 headed browser 中手动登录一次，session 会保留下来；或 (2) 运行 `/setup-browser-cookies`，把真实 Chrome 的 cookies 导进来。认证完成后，Claude 会自己浏览目录、提取数据并创建联系人。

**当 AI 卡住时的浏览器交接。** 遇到 CAPTCHA、auth wall 或 MFA prompt？`$B handoff` 会在完全相同的页面打开一个可见的 Chrome，并保留你所有 cookies 和 tabs。你把问题处理掉，告诉 Claude 已完成后，`$B resume` 就会从原地继续。连续失败 3 次后，agent 甚至会主动建议你这样做。

**多 AI 的 second opinion。** `/codex` 会通过 OpenAI 的 Codex CLI 拿到一次独立审查，相当于完全不同的 AI 来看同一个 diff。三种模式：带 pass/fail gate 的 code review、主动尝试把你的代码搞坏的 adversarial challenge，以及支持 session continuity 的 open consultation。当 `/review`（Claude）和 `/codex`（OpenAI）都审过同一个分支时，你会得到一份 cross-model analysis，告诉你哪些 findings 重合，哪些只被某一方发现。

**按需启用的安全护栏。** 说一句 “be careful”，`/careful` 就会在任何破坏性命令前警告你，比如 rm -rf、DROP TABLE、force-push、git reset --hard。`/freeze` 会在调试期间把修改锁在一个目录内，避免 Claude “顺手”改坏无关代码。`/guard` 同时启用两者。`/investigate` 则会自动 freeze 到被调查的模块。

**主动技能建议。** gstack 会识别你当前处于哪个阶段：brainstorming、reviewing、debugging、testing，然后推荐合适的 skill。不想要？说一句 “stop suggesting”，它就会跨会话记住。

## 10-15 个并行 sprints

gstack 用来跑一个 sprint 已经很强，用来同时跑十个时会发生质变。

[Conductor](https://conductor.build) 可以并行运行多个 Claude Code sessions，每个 session 都有自己的隔离 workspace。一个 session 在新想法上跑 `/office-hours`，另一个对 PR 跑 `/review`，第三个实现功能，第四个在 staging 上跑 `/qa`，另外六个继续在其他分支上工作。全部同时进行。我自己经常同时跑 10-15 个并行 sprints，这基本就是当前的现实上限。

sprint 结构，才是并行真正能成立的原因。没有流程，十个 agents 就是十个混乱源；有了流程，也就是 think、plan、build、review、test、ship，每个 agent 都知道自己该做什么、该在什么时候停下。你像 CEO 管团队一样管理它们：关键决策上介入，其余部分让它自己跑。

---

免费，MIT licensed，开源。没有 premium tier，没有 waitlist。

我把自己构建软件的方法开源了。你可以 fork 它，再把它变成你自己的体系。

> **我们在招聘。** 想每天 ship 10K+ LOC，并帮助把 gstack 打磨得更硬？
> 来 YC 吧 —— [ycombinator.com/software](https://ycombinator.com/software)
> 极具竞争力的薪资和股权。地点：San Francisco，Dogpatch District。

## 文档

| 文档 | 内容 |
|-----|------|
| [Skill Deep Dives](docs/skills.md) | 每个 skill 的理念、示例和工作流（包含 Greptile integration） |
| [Builder Ethos](ETHOS.md) | 构建者哲学：Boil the Lake、Search Before Building、三层知识体系 |
| [Architecture](ARCHITECTURE.md) | 设计决策与系统内部实现 |
| [Browser Reference](BROWSER.md) | `/browse` 的完整命令参考 |
| [Contributing](CONTRIBUTING.md) | 开发环境、测试、contributor mode 和 dev mode |
| [Changelog](CHANGELOG.md) | 每个版本的新内容 |

## 隐私与遥测

gstack 包含 **opt-in** 的使用遥测，用于帮助改进项目。下面是它的实际行为：

- **默认关闭。** 除非你明确同意，否则不会向任何地方发送任何数据。
- **首次运行时，** gstack 会问你是否愿意分享匿名使用数据。你可以拒绝。
- **如果你选择开启，会发送什么：** skill 名称、耗时、成功/失败、gstack 版本、操作系统。仅此而已。
- **绝不会发送什么：** 代码、文件路径、仓库名、分支名、prompts，或任何用户生成内容。
- **随时可改：** `gstack-config set telemetry off` 会立即彻底关闭。

数据存储在 [Supabase](https://supabase.com) 中（一个开源的 Firebase 替代方案）。schema 位于 [`supabase/migrations/`](supabase/migrations/)；你可以自行核对到底收集了什么。仓库里的 Supabase publishable key 是公开密钥（和 Firebase API key 类似），row-level security policies 会拒绝所有直接访问。遥测数据会经过校验的 edge functions，那里会强制执行 schema checks、event type allowlists 和字段长度限制。

**本地分析始终可用。** 运行 `gstack-analytics` 即可从本地 JSONL 文件查看你自己的使用面板，不需要任何远程数据。

## 故障排查

**Skill 没显示出来？** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` 失败？** `cd ~/.claude/skills/gstack && bun install && bun run build`

**安装过旧？** 运行 `/gstack-upgrade`，或者在 `~/.gstack/config.yaml` 里设置 `auto_upgrade: true`

**Codex 提示 "Skipped loading skill(s) due to invalid SKILL.md"？** 你的 Codex skill descriptions 过期了。修复方法：`cd ~/.codex/skills/gstack && git pull && ./setup --host codex`；如果是 repo-local install，则执行：`cd "$(readlink -f .agents/skills/gstack)" && git pull && ./setup --host codex`

**Windows 用户：** gstack 可以在 Windows 11 的 Git Bash 或 WSL 中运行。除了 Bun 之外还需要 Node.js，因为 Bun 在 Windows 上对 Playwright pipe transport 有已知问题（[bun#4253](https://github.com/oven-sh/bun/issues/4253)）。browse server 会自动回退到 Node.js。请确保 `bun` 和 `node` 都在你的 PATH 上。

**Claude 说它看不到 skills？** 请确认你项目里的 `CLAUDE.md` 有一个 gstack section。加入下面这段：

```
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse,
/qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro,
/investigate, /document-release, /codex, /cso, /autoplan, /careful, /freeze, /guard,
/unfreeze, /gstack-upgrade.
```

## 许可证

MIT。永久免费。去做点东西吧。
