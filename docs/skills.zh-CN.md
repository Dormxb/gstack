[English](skills.md) | 简体中文

# Skill Deep Dives

每个 gstack skill 的详细说明，包含设计理念、工作流和使用示例。

说明：
- 技能名、命令、文件名、路径和工具名保持原样。
- 结构与英文版保持一致，个别长段落按中文阅读习惯做了轻度压缩。

| Skill | 你的专家 | 做什么 |
|-------|----------|--------|
| [`/office-hours`](#office-hours) | **YC Office Hours** | 从这里开始。用 6 个强制性问题在写代码前重构产品问题，挑战你的 framing、前提假设，并产出可落地的设计文档。后续所有 skill 都以它为输入。 |
| [`/plan-ceo-review`](#plan-ceo-review) | **CEO / Founder** | 重新定义问题，找出需求里真正值得做的 10 星产品。四种模式：Expansion、Selective Expansion、Hold Scope、Reduction。 |
| [`/plan-eng-review`](#plan-eng-review) | **Eng Manager** | 锁定架构、数据流、图表、边界条件和测试，把隐藏假设逼出来。 |
| [`/plan-design-review`](#plan-design-review) | **Senior Designer** | 计划阶段的交互式设计 review。逐项打分，解释 10 分标准，并直接修订方案。 |
| [`/design-consultation`](#design-consultation) | **Design Partner** | 从零构建设计系统。理解赛道，提出有意识的创意风险，并生成更接近真实产品的视觉方案。 |
| [`/review`](#review) | **Staff Engineer** | 找出能过 CI 但会在生产里出事的问题。明显的机械性问题会自动修。 |
| [`/investigate`](#investigate) | **Debugger** | 系统化根因分析。铁律是：不先调查清楚，就不允许直接修。 |
| [`/design-review`](#design-review) | **Designer Who Codes** | 线上页面的视觉审计 + 修复循环。80 项审计，逐项原子提交，前后截图验证。 |
| [`/design-shotgun`](#design-shotgun) | **Design Explorer** | 生成多个 AI 设计变体，在浏览器里开对比板，迭代到你批准为止。会逐步形成你的 taste memory。 |
| [`/design-html`](#design-html) | **Design Engineer** | 生成生产可用的 Pretext 原生 HTML。支持已批准 mockup、CEO 方案、设计 review 上下文或纯描述起步。文本会真实重排，高度随内容变化。 |
| [`/qa`](#qa) | **QA Lead** | 测你的应用，找 bug，原子修复，再次验证。每个 fix 都自动补回归测试。 |
| [`/qa-only`](#qa) | **QA Reporter** | 与 `/qa` 方法一致，但只出报告，不改代码。 |
| [`/ship`](#ship) | **Release Engineer** | 同步主分支、跑测试、审计覆盖率、推送、开 PR。缺测试框架时会帮你搭起来。 |
| [`/land-and-deploy`](#land-and-deploy) | **Release Engineer** | 合并 PR、等待 CI 和部署完成、验证生产健康。从“已批准”一路走到“线上已验证”。 |
| [`/canary`](#canary) | **SRE** | 发布后的巡检循环。用 browse daemon 观察控制台报错、性能回退和页面失败。 |
| [`/benchmark`](#benchmark) | **Performance Engineer** | 给页面建立性能基线：加载时间、Core Web Vitals、资源体积，并做前后对比。 |
| [`/cso`](#cso) | **Chief Security Officer** | 基于 OWASP Top 10 + STRIDE 的安全审计。扫描注入、认证、加密、权限控制等问题。 |
| [`/document-release`](#document-release) | **Technical Writer** | 让项目文档和刚刚发布的内容重新对齐。自动发现 README 等文档的过期信息。 |
| [`/retro`](#retro) | **Eng Manager** | 面向团队的周回顾。按人拆解，跟踪发版节奏、测试趋势和成长机会。 |
| [`/browse`](#browse) | **QA Engineer** | 给 agent 装上眼睛。真实 Chromium、真实点击、真实截图，单次命令约 100ms。 |
| [`/setup-browser-cookies`](#setup-browser-cookies) | **Session Manager** | 把你真实浏览器里的 cookie 导入 headless 会话，用于测试登录态页面。 |
| [`/autoplan`](#autoplan) | **Review Pipeline** | 一条命令跑完 CEO → design → eng review，自动做大部分判断，只把 taste decisions 留给你。 |
| [`/learn`](#learn) | **Memory** | 管理 gstack 在跨 session 中学到的项目模式、偏好和陷阱。 |
| | | |
| **Multi-AI** | | |
| [`/codex`](#codex) | **Second Opinion** | 来自 OpenAI Codex CLI 的独立第二意见。三种模式：代码审查、对抗挑战、持续会话咨询。 |
| | | |
| **Safety & Utility** | | |
| [`/careful`](#safety--guardrails) | **Safety Guardrails** | 在危险命令前发出警告，如 `rm -rf`、`DROP TABLE`、`git reset --hard`。可单次覆写。 |
| [`/freeze`](#safety--guardrails) | **Edit Lock** | 把所有文件编辑限制在一个目录内，防止调试时误改无关代码。 |
| [`/guard`](#safety--guardrails) | **Full Safety** | 一次性启用 `/careful` + `/freeze`。 |
| [`/unfreeze`](#safety--guardrails) | **Unlock** | 解除 `/freeze` 的目录限制。 |
| [`/open-gstack-browser`](#open-gstack-browser) | **GStack Browser** | 启动带侧边栏、反 bot 伪装、自动模型路由和 cookie 导入能力的 GStack Browser。 |
| [`/setup-deploy`](#setup-deploy) | **Deploy Configurator** | 给 `/land-and-deploy` 做一次性配置，探测平台、生产 URL 和部署命令。 |
| [`/gstack-upgrade`](#gstack-upgrade) | **Self-Updater** | 升级 gstack 本身，识别全局安装与 vendored 安装并同步。 |

---

## `/office-hours`

这是整个流程最应该先跑的一步。

在写代码前，先把“你以为自己要做什么”和“用户真正需要什么”分开。`/office-hours` 的职责不是替你顺着需求往下写，而是像一个经验很强的 partner 一样，把问题重新定义一遍。

### The reframe

它通常会先抓具体痛点，而不是抽象愿景。你说自己要做一个“calendar daily briefing app”，它会继续追问：到底哪里痛，为什么痛，现有替代方案为什么不够。很多时候，真正浮现出来的并不是你口头说的 feature，而是另一个更有价值的产品方向。

它擅长把“表面需求”改写成“真实任务”。比如原本只是一个日历整理工具，最后可能被重构成“personal chief of staff AI”。这个重构会决定后面所有规划和实现的方向。

### Premise challenge

重构之后，它不会停在“听起来不错”这种层面，而是把关键前提拆成可验证的产品假设，让你逐条同意、反对或修正。你接受的每条前提，都会变成设计文档里的承重结构。

### Implementation alternatives

然后它会给出 2-3 套明确的落地路径，并诚实给出代价与优先级判断。通常不会鼓励一开始就做 full vision，而是先建议能最快验证真实价值的最小楔子。

### Two modes

`/office-hours` 有两种模式：

- **Startup mode**：面向创业、内部创新或产品方向判断。问题更尖锐，关注 demand reality、替代方案、最窄切口和长期契合度。
- **Builder mode**：面向 hackathon、side project、开源和学习场景。更像一个积极的协作者，帮你找出“最值得做、最容易分享”的版本。

### The design doc

两种模式最后都会把设计文档写到 `~/.gstack/projects/`。这个文档会直接喂给 `/plan-ceo-review` 和 `/plan-eng-review`，形成 `office-hours → plan → implement → review → QA → ship → retro` 的完整链路。

---

## `/plan-ceo-review`

这是 founder / CEO 视角的审查模式。

它的目标不是把当前 ticket 做得更完整一点，而是先问一个更重要的问题：

**这个产品真正的工作是什么？**

这里期待的是品味、野心、用户同理心和长期视角。它不会机械照着需求做，而是从用户视角重新理解问题，再找出最值得扩展的版本。

### Example

如果你说“让卖家可以上传商品图片”，弱一点的助手会只给你加个文件选择器。`/plan-ceo-review` 会继续追问：真正的 feature 是“上传图片”，还是“帮助卖家创建更能卖出去的 listing”？一旦问题被重定义，整个方案就会跟着变。

它会顺势提出更高价值的问题：能否自动识别商品、补齐型号、抓取规格和价格、建议更好的 hero image、判断图片是否不可信或质量太差。也就是从“加功能”转向“找到 10 星产品”。

### Four modes

- **SCOPE EXPANSION**：尽量往大里想，把值得加的扩展逐个抛出来，由你选择。
- **SELECTIVE EXPANSION**：保住当前 scope，只挑最值得加入的少数扩展。
- **HOLD SCOPE**：严格守住既定范围，只做高质量梳理。
- **SCOPE REDUCTION**：找出最小可行版本，把多余部分砍掉。

这些 vision 和 decision 会写入 `~/.gstack/projects/`，必要时也可以提升进 repo 的 `docs/designs/` 里。

---

## `/plan-eng-review`

这是 engineering manager / tech lead 视角的规划模式。

当产品方向被定下来后，需要的就不再是继续发散，而是把系统骨架钉死：架构、边界、数据流、失败模式、边界情况、测试覆盖和信任边界。

它最有价值的一个能力，是逼迫模型把系统“画出来”。序列图、状态图、组件图、数据流图、测试矩阵，都会让原本手挥出来的方案变得具体，隐藏假设也更容易暴露。

### Example

延续前面的 listing app 场景，`/plan-eng-review` 会追问：

- 上传、识别、补全和文案生成的架构边界是什么
- 哪些步骤同步完成，哪些放后台 job
- 应用服务、对象存储、vision 模型、外部搜索 API 和数据库之间如何切分
- 某一步失败时如何降级
- 如何避免重复 job、如何做重试、哪些状态持久化、哪些可以重算

它的职责不是“把想法变小”，而是：

**把想法变成可构建的系统。**

### Review Readiness Dashboard

每次 CEO / Eng / Design review 的结果都会落日志，最后汇总成一个 Review Readiness Dashboard。默认情况下 Eng Review 是唯一硬性 gate，CEO 和 Design 更偏信息性建议。

### Plan-to-QA flow

`/plan-eng-review` 的测试部分结束后，会把测试计划产物写到 `~/.gstack/projects/`。后面运行 `/qa` 时，这份计划会被自动捡起来，省掉手工拷贝。

---

## `/plan-design-review`

这是 implementation 之前的 senior designer review。

绝大多数计划文档只会描述系统做什么，很少认真描述用户实际会看到什么。空状态、错误状态、加载状态、移动端行为、AI slop 风险，常常被推迟到“实现时再看”，然后最后产物就会变成一个典型的、没有明确体验目标的 SaaS 模板。

`/plan-design-review` 的工作，就是在还没写代码的时候把这些问题补齐。

它会像 CEO / Eng review 一样，用交互式方式逐项审视设计维度，给出 0-10 分评分，解释 10 分应该长什么样，并直接修订计划。分低的地方会被重点展开，分高的部分只做快速检查。上线后的视觉审计则交给 `/design-review`。

---

## `/design-consultation`

这是从零开始搭设计系统的模式。

如果 `/plan-design-review` 是审视已经存在的方案，那么 `/design-consultation` 则是在“你手上几乎还没有设计资产”的情况下，陪你把整个视觉系统搭出来：审美方向、字体角色、色盘、布局、间距和动效策略。

它并不满足于“自洽”。很多开发工具看起来都很统一，但也都很难被记住。真正能拉开差距的，是**有意识的创意风险**：比如意料之外的 serif 标题、不同于同类产品的强调色、更紧凑的密度等。这个 skill 不只会给你安全答案，也会明确告诉你哪里该保守、哪里值得冒险。

如果你愿意，它还会先去浏览你所在赛道里的真实产品，帮你理解行业惯例，再决定哪些惯例值得打破。达成共识后，它会生成一个交互式 HTML 预览页，并把最终系统写进 repo 根目录的 `DESIGN.md`。

### Example

它常见的输出形式包括：

- 一套完整的 aesthetic / typography / color / spacing / layout / motion 提案
- “安全选择”与“有意识风险”的分层说明
- 带真实产品界面的预览页
- 写入 `DESIGN.md`，作为后续所有前端工作和设计 review 的依据

---

## `/design-review`

这是“会写代码的设计师”模式。

`/plan-design-review` 管的是落地前，`/design-review` 管的是落地后。它会对线上页面进行 80 项视觉审计，然后进入 fix loop：针对每个 design finding 定位源文件，做最小 CSS / 样式改动，提交 `style(design): FINDING-NNN`，重新打开页面验证，再拍 before/after 截图。

它对设计类改动的风险预算也做了特殊处理：纯 CSS 改动通常视作安全且可逆，而 JSX / TSX 结构改动会计入更严格的风险分。超过阈值会停下来问你。

---

## `/design-shotgun`

这是设计探索模式。

当你知道自己要做什么，但不知道它应该长什么样时，单一回答没有意义。`/design-shotgun` 会一次生成 3 个视觉方向，用 GPT Image API 做图，再在浏览器里打开对比板，让你决定方向、继续迭代或者彻底换一轮。

### The loop

流程通常是：

1. 你描述想做什么，或指定一个已有页面
2. skill 读取 `DESIGN.md`（如果存在）作为品牌约束
3. 生成 3 个不同方向的设计变体
4. 浏览器中打开 comparison board
5. 你批准其中一个，或给出新一轮反馈
6. 批准版本落到 `~/.gstack/projects/$SLUG/designs/`，并写入 `approved.json`

`approved.json` 是进入 `/design-html` 的一个入口，但 `/design-html` 也支持其他上下文输入。

### Taste memory

这个 skill 会跨 session 记住你的偏好。如果你总是批准更克制的方案，它之后会自然偏向那一类，不需要你额外配配置。

---

## `/design-html`

这是设计落地成代码的模式。

大多数 AI 生成的 HTML/CSS 都是静态的：固定高度、文本溢出、断点生硬。`/design-html` 用 [Pretext](https://github.com/chenglou/pretext) 来解决这个问题，让文本重排、高度自适应和布局动态变化变成默认能力。

它支持多种输入来源：

- `/design-shotgun` 批准后的 mockup
- `/plan-ceo-review` 的产品方案
- `/plan-design-review` 的设计上下文
- 你直接提供的一张 PNG
- 纯文字描述

### Smart API routing

它会根据设计类型自动选 Pretext 的不同能力：

- 简单布局：`prepare()` + `layout()`
- 卡片网格：`prepare()` + `layout()`
- Chat UI：`walkLineRanges()`
- 编辑型布局：`layoutNextLine()`
- 更复杂的编辑排版：`layoutWithLines()`

### The refinement loop

工作流是：

1. 读取 `approved.json` 或其他设计上下文
2. 用视觉模型抽出实现规格
3. 生成自包含 HTML，内联 Pretext
4. 启动 live-reload server
5. 用移动端 / 平板 / 桌面 3 个 viewport 截图验证
6. AskUserQuestion 询问需要怎么改
7. 用 Edit tool 做外科手术式修改，而不是整页重生
8. 直到你说 done

### Framework detection

如果 `package.json` 里检测到 React / Svelte / Vue，它会提供生成对应组件而不是纯 HTML 的选项。

---

## `/review`

这是偏执 staff engineer 模式。

测试通过，不代表分支安全。`/review` 存在，是因为很多 bug 完全可以在 CI 里“表现正常”，上线后才真正爆炸。

它要找的是结构性问题，而不是风格 nitpick，例如：

- N+1 查询
- stale reads
- race conditions
- trust boundary 错误
- 缺失索引
- escaping 问题
- 不变量破坏
- 错误的 retry 逻辑
- 测试虽然通过，但没覆盖真实失败模式
- enum / status 新分支没有在所有 switch 和 allowlist 里跟上

### Fix-First

它不只列问题。明显的机械修复会自动执行，例如 dead code、过期注释或某些明显的 N+1。真正需要判断的部分，如安全问题、竞争条件和设计 tradeoff，会留给你拍板。

### Completeness gaps

现在它还会额外标记“差一点就能做完整，但被 shortcut 掉”的实现。若完整版本只需要少量 CC 时间，它会把这个缺口点出来。

### Example

在一个测试全绿的“智能 listing flow”里，`/review` 仍会继续问：是否引入了 N+1、是否过信客户端元数据、并发是否会打破唯一 hero image 约束、失败上传是否留下 orphaned files、外部数据喂给 LLM 时是否构成 prompt injection 风险。

这里不需要鼓励，需要的是把潜在事故提前想出来。

---

## `/investigate`

当系统出错但你还不知道为什么时，`/investigate` 是系统化调试模式。

它遵循铁律：**不先定位根因，就不直接修。** 它会追踪数据流、匹配已知 bug pattern、逐个验证假设。如果连续 3 次修复尝试失败，就停下来重新怀疑架构，而不是继续盲试。

---

## `/qa`

这是 QA lead 模式。

`/browse` 给了 agent 眼睛，`/qa` 给了它成体系的测试方法。

最常见的用法是：你刚在 feature branch 上写完功能，直接跑 `/qa`。它会先看 `git diff`，判断哪些页面和路由受影响，然后打开浏览器逐个验证，不需要你自己写测试计划。

四种模式：

- **Diff-aware**：默认用于功能分支，按 diff 自动找影响面
- **Full**：完整探索整个应用，耗时 5-15 分钟
- **Quick**：`--quick`，30 秒烟测
- **Regression**：`--regression baseline.json`，与历史基线对比

### Automatic regression tests

每次 `/qa` 找到并修好 bug 后，都会补上一条回归测试，目标是把当时真实坏掉的场景锁死。

### Example

典型输出会是一份带健康分数的 QA 报告，列出 CRITICAL / HIGH / MEDIUM 问题，并把截图和复现步骤保存到 `.gstack/qa-reports/`。

**测试登录态页面时：** 先用 `/setup-browser-cookies` 导入真实浏览器会话，再让 `/qa` 去测。

---

## `/ship`

这是 release machine 模式。

当你已经决定了做什么、方案也评过、代码也准备好了，就不该再继续聊愿景，而应该把分支真正送到可落地状态。`/ship` 就是负责最后一公里的。

它会同步主分支、跑该跑的测试、检查分支状态、更新 changelog / version（如果仓库有这个约定）、推送，并创建或更新 PR。

### Test bootstrap

如果项目还没有测试框架，`/ship` 会帮你搭起来：检测 runtime、选择框架、安装依赖、写几条真实测试、配 CI/CD，并生成 `TESTING.md`。

### Coverage audit

每次 `/ship` 都会基于 diff 建一份 code path map，对照测试文件做覆盖率审计，并把缺口补出来。PR 描述里也会体现测试增量。

### Review gate

`/ship` 在开 PR 前会检查 Review Readiness Dashboard。缺 Eng Review 时会提醒，但不会强硬阻断。决策会按分支持久化，不会反复问同一个问题。

---

## `/land-and-deploy`

这是 deploy pipeline 模式。

`/ship` 负责出 PR，`/land-and-deploy` 负责把事情真正做完：合并、等待 CI、等待部署完成、跑 canary、判断是否需要回滚。

第一次在新项目上跑时，会先做一次 dry run，帮你确认整条流水线设置无误。之后则直接根据已有配置执行。

### Setup

先跑 `/setup-deploy`。它会探测部署平台（Fly.io、Render、Vercel、Netlify、Heroku、GitHub Actions 或 custom）、生产 URL、健康检查端点和部署状态命令，并把配置写到 `CLAUDE.md`。

### Example

理想输出是：PR 合并、CI 全绿、部署成功、健康检查 200、canary 若干页面无异常，最后返回“Production verified”。

---

## `/canary`

这是发布后的巡检模式。

`/canary` 会用 browse daemon 周期性检查关键页面，关注控制台报错、性能回退、页面失败和明显视觉异常，并定时截图与基线比对。它适合在 `/land-and-deploy` 之后立即运行，也适合高风险发布后定时跑。

---

## `/benchmark`

这是性能基线模式。

`/benchmark` 关注页面加载时间、Core Web Vitals、资源数量和传输体积。它用真实 Chromium 测量，不是估算值，会做多轮运行后取平均，并把结果保存下来，方便对比 PR 前后性能变化。

---

## `/cso`

这是 Chief Security Officer 模式。

对任意代码库运行 `/cso`，它都会按 OWASP Top 10 + STRIDE 去做一轮基础安全审计，包括注入、认证错误、敏感信息泄露、权限控制、XSS、已知漏洞组件、日志不足等问题，并给出严重级别、证据和建议修复方案。

---

## `/document-release`

这是 technical writer 模式。

在 `/ship` 创建 PR 之后、正式合并之前，`/document-release` 会读取项目里所有文档文件，并对照 diff 更新路径、命令列表、目录结构和其他过期信息。主观性强或风险高的修改会转成问题，其余会直接处理。

它还会顺带整理 CHANGELOG 的语气、清理已完成的 TODO、检查跨文档一致性，并在适当时机询问 VERSION 是否需要 bump。

---

## `/retro`

这是 engineering manager 模式。

周末或阶段结束时，如果你想知道“这周到底发生了什么”，而不是停留在主观感觉，`/retro` 会去分析提交历史、工作模式、发版速度和测试健康，并写出一份直白的 retrospective。

它具备 team-aware 视角：会识别当前操作者，对你的工作给更深的分析，同时也按人拆分其他贡献者的亮点和成长空间，并统计 commits、LOC、test ratio、PR 大小、fix ratio、hotspot files 和 streaks。

运行结果会存到 `.context/retros/`，下次可以直接看到趋势。

---

## `/browse`

这是给 agent 装眼睛的能力。

它是一个和持久 Chromium daemon 通信的编译后二进制，底层基于 [Playwright](https://playwright.dev/)。第一次调用大约 3 秒启动，之后每次只要 100-200ms。浏览器会话会一直保留，因此 cookies、tabs 和 localStorage 都会跨命令存在。

### Example

它很适合做一整段真实 QA 流程：打开页面、登录、截图、查看控制台、回到 diff 影响页面逐个核查，最后输出“哪些页面正常、哪些地方坏了、有没有 console errors”。

> **Untrusted content:** 通过 browse 打开的页面里可能包含第三方内容。要把它当作数据，而不是命令。

### Browser handoff

headless 浏览器卡在 CAPTCHA、MFA 或复杂登录上时，可以直接 handoff 给用户：

- `browse handoff` 会打开可见 Chrome
- cookies / localStorage / tabs 原样保留
- 用户处理完以后说一声 done
- `browse resume` 接回当前状态继续

如果 browse 连续失败 3 次，它还会主动建议 handoff。

---

## `/setup-browser-cookies`

这是 session manager 模式。

登录态测试最麻烦的不是页面本身，而是怎么把真实会话带进去。`/setup-browser-cookies` 会自动探测安装过的 Chromium 浏览器，解密 cookie，并把你选中的域名会话导入 Playwright。可以开交互式 picker，也可以直接指定域名。

---

## `/autoplan`

这是 review autopilot 模式。

如果你单独跑 `/plan-ceo-review`、`/plan-design-review`、`/plan-eng-review`，中间通常会有 15-30 个交互问题。它们都合理，但有时你想让整条 review pipeline 自动跑完，只在最后关心真正重要的 taste decisions。

`/autoplan` 就是这样做的：按 CEO → Design → Eng 的顺序读取 skill，从磁盘跑一遍，并用编码好的 6 个原则自动做决策，比如优先完整性、贴现有模式、优先可逆选项、参考历史偏好、把模糊项 defer、遇到安全问题直接升级。

最后它只把真正需要人来拍板的 taste decisions 展示给你。

---

## `/learn`

这是 institutional memory 模式。

gstack 会从每个 session 中沉淀模式、偏好、陷阱和架构决策，保存在 `~/.gstack/projects/$SLUG/learnings.jsonl`。每条 learning 都带有置信度、来源和关联文件。

`/learn` 可以让你：

- 看目前积累了哪些 learnings
- 搜索某个模式
- 清理陈旧条目
- 导出用于团队共享

真正有价值的是：其他 skill 会在运行前自动查询 learnings，并在用上历史经验时提示 “Prior learning applied”。

---

## `/open-gstack-browser`

这是 co-presence 模式。

`/browse` 默认是 headless 的，看不见 agent 在做什么；`/open-gstack-browser` 会直接打开 GStack Browser，让你实时看到整个动作过程。它带了侧边栏扩展、反 bot 伪装和 Playwright 控制，浏览器只要窗口还开着就会持续保活。

侧边栏聊天本身也是一个 Claude 实例，会按任务自动做模型路由：动作型任务用 Sonnet，阅读分析型任务用 Opus。

---

## `/setup-deploy`

这是给 `/land-and-deploy` 做一次性准备的 skill。

它会识别部署平台、生产 URL、健康检查端点和状态命令，并把结果写入 `CLAUDE.md`。后面真正部署时就不用再手工填这些信息。

---

## `/codex`

这是 second opinion 模式。

`/review` 从 Claude 的视角看分支，`/codex` 则引入另一个完全不同的模型栈，让你拿到独立第二意见。训练分布不同，盲点也不同。两个模型都命中的问题，通常置信度很高；只有其中一个发现的问题，则往往代表某种特殊视角。

### Three modes

- **Review**：对当前 diff 运行 `codex review`，输出按严重级别分类的问题，以及 PASS / FAIL 结论。
- **Challenge**：对抗模式，主动尝试把你的代码搞挂，重点找边界条件、竞态、安全洞和高压场景。
- **Consult**：保留会话连续性的开放咨询模式，适合追问“我这个想法到底对不对”。

### Cross-model analysis

当同一个分支既跑过 `/review`（Claude）又跑过 `/codex`（OpenAI）时，会得到 cross-model analysis：哪些问题重合、哪些是 Codex 独有、哪些是 Claude 独有。这相当于“两个医生看同一个病人”。

---

## Safety & Guardrails

这是 4 个面向安全性的辅助 skill。它们通过 Claude Code 的 PreToolUse hooks 工作，作用透明、会话级，不需要额外配置文件。

### `/careful`

当你在碰生产、执行危险命令，或者只是想加一层保险时，运行 `/careful`。它会匹配一批高风险模式：

- `rm -rf` / `rm -r`
- `DROP TABLE` / `DROP DATABASE` / `TRUNCATE`
- `git push --force` / `git push -f`
- `git reset --hard`
- `git checkout .` / `git restore .`
- `kubectl delete`
- `docker rm -f` / `docker system prune`

常规构建产物清理（如 `node_modules`、`dist`、`.next`、`coverage`）在白名单里，不会对日常操作频繁误报。

### `/freeze`

把所有 Edit / Write 操作限制在单个目录。调一个 billing bug 时，你不一定希望 Claude 顺手去改 `src/auth/`。`/freeze src/billing` 就是把编辑边界锁在这里。`/investigate` 会自动启用这个能力。

注意：它只拦 Edit / Write。像 `sed` 之类的 Bash 命令仍可能改到边界外，所以这是事故预防，不是安全沙箱。

### `/guard`

一次性启用 `/careful` + `/freeze`，适合碰生产或调 live system。

### `/unfreeze`

解除 `/freeze` 限制，允许再次编辑所有目录。

---

## `/gstack-upgrade`

用一条命令把 gstack 升到最新。它会识别安装方式（全局安装还是 vendored 到项目内）、执行升级、在双安装场景下同步两边，并说明版本变化内容。

如果你把 `auto_upgrade: true` 写进 `~/.gstack/config.yaml`，它还能在新版本出现时于会话开头静默升级。

---

## Greptile integration

[Greptile](https://greptile.com) 是一套能自动审 PR 的服务，擅长发现一些真正有破坏力的问题，例如 race conditions、安全洞，以及那些“测试过了但线上会炸”的 bug。

### Setup

在你的 GitHub repo 上安装 Greptile，gstack 就会自动感知它的评论，不需要额外配置。

### How it works

自动 reviewer 最大的问题不在于“会不会找问题”，而在于“怎么做评论分诊”。有些评论是真的，有些是 false positive，还有些其实已经在你后面的 commit 里修掉了。如果没有 triage 层，评论会越积越多，最后所有人都开始忽略它。

gstack 的做法是让 `/review` 和 `/ship` 变成 Greptile-aware：

- **Valid issues**：纳入关键问题并在发版前修掉
- **Already-fixed issues**：自动回复“已经处理”
- **False positives**：由你确认后，自动回一条解释为什么它错了

这就把异步的 PR reviewer 融入了正常工作流，而不是额外再开一套人肉流程。

### Learning from history

你确认过的 false positive 会被记录到 `~/.gstack/greptile-history.md`。之后如果相同模式再次出现，gstack 会自动跳过。`/retro` 也会长期跟踪 Greptile 的命中率变化。

### Example

一个典型的 `/ship` + Greptile 流程，会是：

- Greptile 在 PR 上给出 3 条评论
- gstack 判断其中 1 条是真问题、1 条已经修过、1 条是 false positive
- 真问题直接修
- 已修问题自动回复
- false positive 交给你确认是否回帖解释

这样额外成本通常只有几十秒，而不是把整条 PR review 流程拖垮。
