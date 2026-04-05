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

**gstack 就是我现在的工作方式。** 它把 Claude Code 变成一支虚拟工程团队：有 CEO 重新思考产品，有工程经理锁定架构，有设计师挡住 AI slop，有审查者挖出生产事故，有 QA 负责人打开真实浏览器，有安全负责人做 OWASP + STRIDE 审计，还有发布工程师负责把 PR 发出去。二十三位专家，八个增强工具，全部是 slash commands，全部是 Markdown，全部免费，MIT license。

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
5. 对你的预发布环境 URL 运行 `/qa`
6. 到这里先停下。你会知道这套东西是不是适合你。

## 安装 — 30 秒

**Requirements:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Git](https://git-scm.com/)、[Bun](https://bun.sh/) v1.0+、[Node.js](https://nodejs.org/)（仅 Windows）

### 第 1 步：安装到你的机器上

打开 Claude Code，把下面这段粘进去。剩下的事 Claude 会处理。

> Install gstack: run **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** then add a "gstack" section to CLAUDE.md that says to use the /browse skill from gstack for all web browsing, never use mcp\_\_claude-in-chrome\_\_\* tools, and lists the available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn. Then ask the user if they also want to add gstack to the current project so teammates get it.

### 第 2 步：加入你的仓库，让队友也能拿到（可选）

> Add gstack to this project: run **`cp -Rf ~/.claude/skills/gstack .claude/skills/gstack && rm -rf .claude/skills/gstack/.git && cd .claude/skills/gstack && ./setup`** then add a "gstack" section to this project's CLAUDE.md that says to use the /browse skill from gstack for all web browsing, never use mcp\_\_claude-in-chrome\_\_\* tools, lists the available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn, and tells Claude that if gstack skills aren't working, run `cd .claude/skills/gstack && ./setup` to build the binary and register skills.

真正提交进仓库的是实际文件，不是 submodule，所以 `git clone` 下来就能直接工作。所有内容都放在 `.claude/` 里。不会改你的 PATH，也不会在后台常驻运行任何东西。

> **想参与贡献，或者需要完整历史？** 上面的命令为了快速安装用了 `--depth 1`。如果你准备贡献代码，或者需要完整 git 历史，请改成完整 clone：
> ```bash
> git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> ```

### 其他 AI Agents

gstack 不只支持 Claude，而是支持 8 个 AI coding agents。全部 31 个 skills 都能在所有已支持的 agent 上工作。`setup` 会自动探测你机器上装了哪些 agent，你也可以手动指定目标 host。

#### Auto-detect（为你机器上的每个 agent 安装）

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup
```

#### OpenAI Codex CLI

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host codex
```

skills 会安装到 `~/.codex/skills/gstack-*/`。如果是 repo-local install，请把仓库 clone 到 `.agents/skills/gstack`。

#### OpenCode

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host opencode
```

skills 会安装到 `~/.config/opencode/skills/gstack-*/`。

#### Cursor

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host cursor
```

skills 会安装到 `~/.cursor/skills/gstack-*/`。

#### Factory Droid

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host factory
```

skills 会安装到 `~/.factory/skills/gstack-*/`。敏感技能会使用 `disable-model-invocation: true`，避免 Droid 自动调用它们。

#### OpenClaw

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host openclaw
```

skills 会安装到 `~/.openclaw/skills/gstack-*/`。工具名会被重写，以适配 OpenClaw 的 tool system（exec、read、write、edit、sessions_spawn）。

#### Slate / Kiro

```bash
./setup --host slate       # Slate (Random Labs)
./setup --host kiro        # Amazon Kiro
```

基于 hooks 的安全技能（careful、freeze、guard）在所有非 Claude host 上都会退化为内联安全提示文案。

**想支持另一个 agent？** 见 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md)。
只需要一个 TypeScript config 文件，不需要改代码。

### 语音输入（AquaVoice、Whisper 等）

gstack 的 skills 带有适合语音触发的 trigger phrases。你只要自然地说出你的意图，比如“跑个安全检查”“测一下这个网站”“做个工程 review”，正确的 skill 就会被触发。你不需要死记 slash command 名字，也不需要记缩写。

## 看它如何工作

```
You:    我想做一个给我的日历用的 daily briefing app。
You:    /office-hours
Claude: [开始追问真实痛点 —— 要具体例子，不要假设]

You:    多个 Google calendars，事件信息经常过时，地点也经常不对。
        每天做准备花太久时间，而且最后产出的结果也不够好……

Claude: 我得先反驳一下你的 framing。你说的是“daily briefing
        app”，但你真正描述出来的，其实是一个个人 chief of
        staff AI。
        [提炼出 5 个你自己都没意识到的能力]
        [挑战 4 个前提 —— 你可以同意、反对，或者调整]
        [生成 3 种实现路径，并附上工作量估算]
        RECOMMENDATION: 明天就把最窄的 wedge 发出去，从真实使用
        里学习。完整愿景是一个 3 个月项目 —— 先把真正能用的
        daily briefing 做出来。
        [写出 design doc → 自动喂给下游 skills]

You:    /plan-ceo-review
        [读取 design doc，挑战 scope，跑完整的 10 个部分 review]

You:    /plan-eng-review
        [输出数据流、状态机、错误路径的 ASCII 图]
        [测试矩阵、失败模式、安全问题]

You:    Approve plan. Exit plan mode.
        [跨 11 个文件写出 2,400 行代码。约 8 分钟。]

You:    /review
        [AUTO-FIXED] 2 issues. [ASK] Race condition → 你批准修复。

You:    /qa https://staging.myapp.com
        [打开真实浏览器，点击完整流程，发现并修掉一个 bug]

You:    /ship
        Tests: 42 → 51 (+9 new). PR: github.com/you/app/pull/42
```

你说的是“daily briefing app”。agent 听出来的却是“你要做一个 chief of staff AI”。因为它听的是你的痛点，不是你表面的功能请求。八条命令，从头跑到尾。这不是 copilot。这是一支团队。

## 一个 sprint 的流程

gstack 不是一堆零散工具，而是一套流程。skills 会按照一个 sprint 的实际顺序运行：

**Think → Plan → Build → Review → Test → Ship → Reflect**

每个 skill 的输出都会喂给下一个 skill。`/office-hours` 写 design doc，`/plan-ceo-review` 会读取它。`/plan-eng-review` 写测试计划，`/qa` 会接着用。`/review` 抓出来的 bug，会由 `/ship` 确认已修复。因为每一步都知道上一步发生了什么，所以不会有东西悄悄漏掉。

| Skill | 你的专家 | 他们做什么 |
|-------|----------|------------|
| `/office-hours` | **YC Office Hours** | 从这里开始。六个强制问题，在你写代码前先重构你的产品问题。会反驳你的 framing、挑战你的前提、生成不同实现方案。design doc 会流向所有下游 skills。 |
| `/plan-ceo-review` | **CEO / Founder** | 重新思考问题。在请求里找出那个潜伏着的 10-star product。四种模式：Expansion、Selective Expansion、Hold Scope、Reduction。 |
| `/plan-eng-review` | **Eng Manager** | 锁定架构、数据流、图、边界情况和测试。把隐藏假设强行拉到台面上。 |
| `/plan-design-review` | **Senior Designer** | 给每个设计维度打 0-10 分，解释 10 分长什么样，再直接修改计划把它推到那个水平。AI Slop detection。交互式进行，每个设计决策一次 AskUserQuestion。 |
| `/plan-devex-review` | **Developer Experience Lead** | 交互式 DX review：探索开发者画像，拿竞品的 TTHW 做 benchmark，设计你的 magical moment，逐步追踪 friction points。三种模式：DX EXPANSION、DX POLISH、DX TRIAGE。20-45 个强制问题。 |
| `/design-consultation` | **Design Partner** | 从零构建完整设计系统。研究竞品和环境，提出有创造性的风险选择，生成逼真的产品 mockups。 |
| `/review` | **Staff Engineer** | 找出那些能过 CI、但会在生产里炸掉的 bug。能自动修掉明显问题。会标出完整性缺口。 |
| `/investigate` | **Debugger** | 系统化 root-cause debugging。铁律：没查清原因之前不修。跟踪数据流，验证假设，连续 3 次修复失败就停。 |
| `/design-review` | **Designer Who Codes** | 先做和 /plan-design-review 同样的审计，再把发现的问题直接修掉。原子提交，前后截图对比。 |
| `/devex-review` | **DX Tester** | 实时开发者体验审计。真的去测试你的 onboarding：浏览文档，跑 getting started 流程，计时 TTHW，截图错误。再和 `/plan-devex-review` 的分数对比 —— 它像回旋镖一样告诉你，计划和现实到底有没有对上。 |
| `/design-shotgun` | **Design Explorer** | 生成多种 AI 设计变体，在浏览器里打开对比板，直到你批准一个方向为止。taste memory 会逐步偏向你的偏好。 |
| `/design-html` | **Design Engineer** | 用 Pretext 生成 production-quality HTML，通过计算式文本布局处理排版。可基于已批准的 mockup、CEO plans、design reviews，或直接从零开始。窗口 resize 时文本会重新流动，高度会跟随内容变化。smart API routing 会为不同设计类型选择合适的 Pretext patterns。支持 React/Svelte/Vue framework detection。 |
| `/qa` | **QA Lead** | 测试你的应用，找 bug，用原子提交修掉，再重新验证。每次修复都会自动生成回归测试。 |
| `/qa-only` | **QA Reporter** | 和 /qa 方法一样，但只报告，不改代码。纯 bug report。 |
| `/cso` | **Chief Security Officer** | OWASP Top 10 + STRIDE threat model。零噪音：17 条 false positive exclusions、8/10+ confidence gate、独立 finding verification。每个 finding 都带一个具体 exploit scenario。 |
| `/ship` | **Release Engineer** | 同步 main、跑测试、审查覆盖率、推送、开 PR。如果你还没有测试框架，它会顺手帮你 bootstrap。 |
| `/land-and-deploy` | **Release Engineer** | 合并 PR，等待 CI 和部署完成，再验证生产环境健康状态。从“已批准”到“生产已确认”，一条命令走完。 |
| `/canary` | **SRE** | 部署后的监控循环。盯控制台错误、性能回退和页面故障。 |
| `/benchmark` | **Performance Engineer** | 建立页面加载时间、Core Web Vitals 和资源体积的 baseline。每个 PR 都做前后对比。 |
| `/document-release` | **Technical Writer** | 把项目里所有文档更新到与你刚发布的内容一致。会自动抓出已经过时的 README。 |
| `/retro` | **Eng Manager** | 团队感知的每周 retro。按人拆分、发货 streak、测试健康度趋势、成长机会。`/retro global` 会跨你的所有项目和 AI tools（Claude Code、Codex、Gemini）一起跑。 |
| `/browse` | **QA Engineer** | 让 agent 拥有眼睛。真实 Chromium 浏览器，真实点击，真实截图。每条命令约 100ms。`/open-gstack-browser` 会启动带侧边栏、anti-bot stealth 和自动模型路由的 GStack Browser。 |
| `/setup-browser-cookies` | **Session Manager** | 把你真实浏览器（Chrome、Arc、Brave、Edge）里的 cookies 导入 headless session。用于测试已登录页面。 |
| `/autoplan` | **Review Pipeline** | 一条命令拿到完整 review 过的计划。自动串行 CEO → design → eng review，并内置决策原则。只把 taste decision 留给你审批。 |
| `/learn` | **Memory** | 管理 gstack 跨 session 学到的东西。查看、搜索、裁剪和导出项目特定的模式、坑点和偏好。learnings 会跨 session 累积，让 gstack 随时间越来越懂你的代码库。 |

### 我该用哪种 review？

| 面向谁构建 | 计划阶段（写代码前） | 线上审计（发布后） |
|-----------|----------------------|--------------------|
| **终端用户**（UI、web app、mobile） | `/plan-design-review` | `/design-review` |
| **开发者**（API、CLI、SDK、docs） | `/plan-devex-review` | `/devex-review` |
| **架构**（数据流、性能、测试） | `/plan-eng-review` | `/review` |
| **以上全都要** | `/autoplan`（运行 CEO → design → eng → DX，并自动判断哪些适用） | — |

### 增强工具

| Skill | 它做什么 |
|-------|-----------|
| `/codex` | **Second Opinion** —— 来自 OpenAI Codex CLI 的独立代码 review。三种模式：review（pass/fail gate）、adversarial challenge、open consultation。当 `/review` 和 `/codex` 都跑过时，会产出 cross-model analysis。 |
| `/careful` | **Safety Guardrails** —— 在 destructive commands（rm -rf、DROP TABLE、force-push）前发出警告。说一句“be careful”即可开启。任何警告都可以手动 override。 |
| `/freeze` | **Edit Lock** —— 把文件编辑限制在一个目录里。调试时防止误改作用域外的文件。 |
| `/guard` | **Full Safety** —— 把 `/careful` 和 `/freeze` 合成一条命令。适合生产环境相关工作。 |
| `/unfreeze` | **Unlock** —— 去掉 `/freeze` 边界。 |
| `/open-gstack-browser` | **GStack Browser** —— 启动带侧边栏、anti-bot stealth、自动模型路由（Sonnet 负责动作，Opus 负责分析）、一键导入 cookies，以及 Claude Code 集成的 GStack Browser。可以清理页面、智能截图、编辑 CSS，并把信息回传到终端。 |
| `/setup-deploy` | **Deploy Configurator** —— 为 `/land-and-deploy` 做一次性初始化。自动探测你的平台、生产 URL 和部署命令。 |
| `/gstack-upgrade` | **Self-Updater** —— 把 gstack 升到最新版。会识别 global install 和 vendored install，两个都同步，并告诉你变了什么。 |

**[每个 skill 的深度说明、示例和设计哲学 →](docs/skills.md)**

## 并行 sprints

gstack 在单个 sprint 下很好用。真正有意思的是同时跑十个。

**Design 是核心。** `/design-consultation` 会从零构建设计系统，研究这个领域，提出有创造性的冒险方向，并写出 `DESIGN.md`。`/design-shotgun` 会生成多个视觉方向，并打开对比板让你挑一个。`/design-html` 会接住你批准的 mockup，生成用 Pretext 实现的 production-quality HTML，窗口 resize 时文本会真正重排，而不是因为写死高度而崩掉。之后 `/design-review` 和 `/plan-eng-review` 会继续读取你选定的方向。设计决策会贯穿整套系统。

**`/qa` 是一次巨大解锁。** 它让我从 6 个并行 worker 提升到 12 个。Claude Code 说出 *"I SEE THE ISSUE"*，然后真的去修、生成回归测试、再验证修复，这彻底改变了我的工作方式。agent 现在真的有眼睛了。

**Smart review routing。** 就像一家运转良好的创业公司那样：CEO 不需要盯基础设施 bug 修复，纯后端改动也不需要 design review。gstack 会追踪已经跑过哪些 reviews，判断接下来该跑哪些，然后直接做正确的事。Review Readiness Dashboard 会在你发货前告诉你当前站位。

**Test everything。** 如果你的项目还没有测试框架，`/ship` 会从零 bootstrap 一套。每次 `/ship` 都会产出 coverage audit。每个 `/qa` 修掉的 bug 都会自动补一条回归测试。目标是 100% test coverage —— 测试让 vibe coding 变得安全，而不是变成 yolo coding。

**`/document-release` 是你一直缺的那个工程师。** 它会读取项目里的每一个文档文件，对照 diff，把所有漂移掉的内容改回来。README、ARCHITECTURE、CONTRIBUTING、CLAUDE.md、TODOS —— 全都自动保持最新。而且现在 `/ship` 会自动调用它，所以不用多打一条命令，文档也能保持同步。

**真实浏览器模式。** `/open-gstack-browser` 会启动 GStack Browser，一个带 anti-bot stealth、自定义 branding，并内置 sidebar extension 的 AI 控制版 Chromium。Google、NYTimes 这类站点也能正常工作，不会动不动就遇到验证码。菜单栏显示的是 “GStack Browser”，不是 “Chrome for Testing”。你平时用的 Chrome 完全不受影响。现有的 browse 命令也都不用改。`$B disconnect` 会回到 headless。只要浏览器窗口还开着，它就会一直活着，不会在你工作时因为 idle timeout 被杀掉。

**Sidebar agent —— 你的 AI 浏览器助手。** 在 Chrome 侧边栏里输入自然语言，一个子 Claude 实例就会执行它。“打开设置页并截图。”“用测试数据把这个表单填完。”“遍历这个列表里的每一项，把价格都提取出来。” 侧边栏会自动把任务路由给合适的模型：Sonnet 负责快速动作（点击、导航、截图），Opus 负责阅读和分析。每个任务最长可跑 5 分钟。sidebar agent 运行在隔离 session 里，不会影响你主窗口里的 Claude Code。侧边栏底部还支持一键导入 cookies。

**Personal automation。** sidebar agent 不只是开发工作流工具。比如：“打开我孩子学校的家长门户，把其他家长的姓名、电话号码和照片加进我的 Google Contacts。” 有两种认证方式：（1）在 headed browser 里登录一次，session 会持久化；或者（2）点击侧边栏底部的 “cookies” 按钮，从你真实的 Chrome 导入 cookies。认证完成后，Claude 会自己浏览目录、提取数据并创建联系人。

**当 AI 卡住时的浏览器交接。** 遇到 CAPTCHA、登录墙或 MFA 提示？`$B handoff` 会在一个可见的 Chrome 窗口中打开完全相同的页面，所有 cookies 和 tabs 都会保留。你手动处理完之后告诉 Claude，`$B resume` 就会从中断的位置继续。agent 在连续失败 3 次后甚至会自动建议你这么做。

**多模型 second opinion。** `/codex` 会从 OpenAI 的 Codex CLI 拿到一份独立 review —— 是完全不同的 AI 在看同一个 diff。三种模式：带 pass/fail gate 的代码 review、主动尝试搞坏你代码的 adversarial challenge，以及带 session continuity 的开放式咨询。当 `/review`（Claude）和 `/codex`（OpenAI）都审过同一个分支后，你会得到 cross-model analysis，看到哪些 findings 是重叠的，哪些只被其中一个模型发现。

**按需开启的安全护栏。** 说一句 “be careful”，`/careful` 就会在 destructive command 前提醒你 —— rm -rf、DROP TABLE、force-push、git reset --hard。`/freeze` 会在调试时把编辑锁到单个目录，避免 Claude “顺手”把无关代码也修了。`/guard` 会同时开启这两者。`/investigate` 则会自动把编辑范围 freeze 到当前调查模块。

**主动 skill 建议。** gstack 会识别你正处在什么阶段 —— brainstorming、reviewing、debugging、testing —— 然后主动推荐合适的 skill。不喜欢？说一句 “stop suggesting”，它会跨 session 记住。

## 10-15 个并行 sprints

gstack 在单个 sprint 上已经很强。真正改变工作方式的是同时跑十个。

[Conductor](https://conductor.build) 可以并行运行多个 Claude Code sessions —— 每个 session 都在自己隔离的 workspace 里。一个 session 在新点子上跑 `/office-hours`，另一个在 PR 上跑 `/review`，第三个在实现功能，第四个在 staging 上跑 `/qa`，另外六个则在其他分支上同时工作。我经常同时跑 10-15 个并行 sprints —— 这是目前比较现实的上限。

真正让并行可控的，是 sprint 结构本身。没有流程，十个 agents 就是十个混乱源。可一旦有了流程 —— think、plan、build、review、test、ship —— 每个 agent 都知道自己该做什么、什么时候该停。你管理他们的方式，就像 CEO 管团队：只在真正重要的决策点上介入，其余时间让系统自己运转。

---

免费，MIT licensed，开源。没有 premium tier，也没有 waitlist。

我把自己构建软件的方式开源了。你可以 fork 它，然后把它改造成你自己的系统。

> **我们在招人。** 想每天发 10K+ LOC，并且一起把 gstack 打磨得更硬？
> 欢迎加入 YC —— [ycombinator.com/software](https://ycombinator.com/software)
> 极具竞争力的薪资和股权。地点：旧金山 Dogpatch District。

## 文档

| Doc | 内容 |
|-----|------|
| [Skill Deep Dives](docs/skills.md) | 每个 skill 的设计哲学、示例和工作流（包含 Greptile integration） |
| [Builder Ethos](ETHOS.md) | Builder philosophy：Boil the Lake、Search Before Building、三层知识体系 |
| [Architecture](ARCHITECTURE.md) | 设计决策与系统内部实现 |
| [Browser Reference](BROWSER.md) | `/browse` 的完整命令参考 |
| [Contributing](CONTRIBUTING.md) | 开发环境搭建、测试、contributor mode 和 dev mode |
| [Changelog](CHANGELOG.md) | 每个版本的新变化 |

## 隐私与遥测

gstack 带有**可选择加入（opt-in）**的使用遥测，用来帮助改进项目。具体行为如下：

- **默认关闭。** 除非你明确同意，否则不会向任何地方发送任何数据。
- **首次运行时，** gstack 会问你是否愿意分享匿名使用数据。你可以直接拒绝。
- **如果你选择加入，会发送什么：** skill 名称、耗时、成功/失败、gstack 版本、操作系统。仅此而已。
- **绝不会发送什么：** 代码、文件路径、仓库名、分支名、提示词，或任何用户生成内容。
- **随时可改：** `gstack-config set telemetry off` 会立刻彻底关闭。

数据存储在 [Supabase](https://supabase.com) 中（开源版 Firebase 替代品）。schema 放在 [`supabase/migrations/`](supabase/migrations/) 里，你可以自己核实到底收集了什么。仓库里的 Supabase publishable key 是公开 key（类似 Firebase API key）—— row-level security policies 会拒绝所有直接访问。telemetry 通过经过校验的 edge functions 上报，这些函数会强制执行 schema 检查、event type allowlist 和字段长度限制。

**本地分析永远可用。** 运行 `gstack-analytics` 就能基于本地 JSONL 文件查看你自己的使用 dashboard，不需要任何远程数据。

## 故障排查

**Skill 没显示出来？** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` 失败？** `cd ~/.claude/skills/gstack && bun install && bun run build`

**安装过旧？** 运行 `/gstack-upgrade`，或者在 `~/.gstack/config.yaml` 里设置 `auto_upgrade: true`

**想要更短的命令？** `cd ~/.claude/skills/gstack && ./setup --no-prefix` —— 从 `/gstack-qa` 切换成 `/qa`。这个选择会在后续升级时被记住。

**想要带命名空间的命令？** `cd ~/.claude/skills/gstack && ./setup --prefix` —— 从 `/qa` 切换成 `/gstack-qa`。如果你同时在用其他 skill packs，这会很有用。

**Codex 提示 “Skipped loading skill(s) due to invalid SKILL.md”？** 说明你的 Codex skill descriptions 过期了。修复命令：`cd ~/.codex/skills/gstack && git pull && ./setup --host codex`；如果是 repo-local install：`cd "$(readlink -f .agents/skills/gstack)" && git pull && ./setup --host codex`

**Windows 用户：** gstack 可以在 Windows 11 上通过 Git Bash 或 WSL 工作。除了 Bun 之外，还需要 Node.js —— Bun 在 Windows 上对 Playwright pipe transport 有一个已知 bug（[bun#4253](https://github.com/oven-sh/bun/issues/4253)）。browse server 会自动回退到 Node.js。请确认 `bun` 和 `node` 都已经在你的 PATH 中。

**Claude 说它看不到这些 skills？** 确保你项目里的 `CLAUDE.md` 有一段 gstack 配置。加上下面这段：

```
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /open-gstack-browser, /qa, /qa-only, /design-review,
/setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex,
/cso, /autoplan, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.
```

## 许可证

MIT。永久免费。去造点东西吧。
