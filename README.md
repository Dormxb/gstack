English | [简体中文](README.zh-CN.md)

# gstack

This repository is an independently maintained fork of [garrytan/gstack](https://github.com/garrytan/gstack), distributed under the same MIT License. It is not an official upstream release.

gstack is a skill pack for structured AI engineering work in Claude Code and Codex. It gives you repeatable roles for planning, review, QA, shipping, documentation, and session memory.

**Who this is for**
- Builders who want a repeatable workflow instead of a blank prompt
- Engineers who want independent review before merge
- People who want local-first memory and predictable defaults

## Quick start

1. Install gstack
2. Run `/office-hours` on the thing you want to build
3. Run `/plan-ceo-review` on the proposal
4. Run `/review` on the branch
5. Run `/qa` on staging
6. Run `/ship` when it is ready

## Install — 30 seconds

**Requirements:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Git](https://git-scm.com/), [Bun](https://bun.sh/) v1.0+, [Node.js](https://nodejs.org/) (Windows only)

### Step 1: Install on your machine

Open Claude Code and paste this:

> Install gstack: run **`git clone --single-branch --depth 1 <your-fork-url> ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`**

That is enough for a machine-wide install. gstack does not rewrite project files during setup.

### Step 2: Add to your repo so teammates get it (optional)

> Add gstack to this project: run **`cp -Rf ~/.claude/skills/gstack .claude/skills/gstack && rm -rf .claude/skills/gstack/.git && cd .claude/skills/gstack && ./setup`**

Real files are committed into the repo, not a submodule, so `git clone` works normally. Everything lives under `.claude/`.
If you want project-specific routing, add it to `CLAUDE.md` yourself. This fork no longer writes or commits that file for you.

### Primary hosts

Claude Code is the primary host. Codex is the primary secondary host for independent review and consultation.

```bash
git clone --single-branch --depth 1 <your-fork-url> ~/gstack
cd ~/gstack && ./setup --host codex
```

### OpenClaw

If you use OpenClaw, install gstack for Claude Code first, then point spawned
coding sessions at those skills. See [docs/OPENCLAW.md](docs/OPENCLAW.md) for
prompt templates, routing examples, and the `gstack-lite` / `gstack-full`
OpenClaw prompts.

### Other AI agents

Other hosts are supported, but they are secondary in this fork. Use
`./setup --host <name>` when you need one explicitly:

| Agent | Flag | Skills install to |
|-------|------|-------------------|
| OpenAI Codex CLI | `--host codex` | `~/.codex/skills/gstack-*/` |
| OpenCode | `--host opencode` | `~/.config/opencode/skills/gstack-*/` |
| Cursor | `--host cursor` | `~/.cursor/skills/gstack-*/` |
| Factory Droid | `--host factory` | `~/.factory/skills/gstack-*/` |
| OpenClaw | `--host openclaw` | `~/.openclaw/skills/gstack/` |
| Slate | `--host slate` | `~/.slate/skills/gstack-*/` |
| Kiro | `--host kiro` | `~/.kiro/skills/gstack-*/` |

If you need to extend host support, see [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md).

## See it work

```
You:    I want to build a daily briefing app for my calendar.
You:    /office-hours
Claude: [asks for the concrete pain]

You:    Multiple calendars, stale events, wrong locations.

Claude: [reframes the problem, challenges scope, writes a design doc]

You:    /plan-ceo-review
You:    /plan-eng-review
You:    /review
You:    /qa https://staging.myapp.com
You:    /ship
```

## The sprint

gstack follows a simple flow:

**Think → Plan → Review → Test → Ship → Learn**

| Skill | Specialist | What it does |
|-------|------------|--------------|
| `/office-hours` | Product framing | Reframes the request before code starts. |
| `/plan-ceo-review` | Strategy review | Pushes on scope, ambition, and product shape. |
| `/plan-eng-review` | Engineering review | Locks architecture, data flow, edge cases, and tests. |
| `/plan-design-review` | Design review | Checks hierarchy, clarity, and visual decisions. |
| `/review` | Code review | Finds issues that pass CI but still break in production. |
| `/investigate` | Debugger | Root-cause debugging before any fix. |
| `/qa` | QA lead | Tests the app in a real browser and verifies fixes. |
| `/ship` | Release engineer | Prepares, validates, and ships the branch. |
| `/codex` | Second opinion | Independent Codex review or consultation. |
| `/document-release` | Technical writer | Updates docs after shipping. |
| `/learn` | Memory | Stores project learnings for later sessions. |

### Which review should I use?

| What you are building | Plan stage | Live audit |
|----------------------|------------|------------|
| UI / product / design | `/plan-design-review` | `/review` or `/qa` |
| API / CLI / architecture | `/plan-eng-review` | `/review` |
| Strategy / scope | `/plan-ceo-review` | `/codex` for a second opinion |

### Secondary tools

These are available, but they are not the default focus in this fork: `/browse`, `/open-gstack-browser`, `/setup-browser-cookies`, `/setup-deploy`, `/land-and-deploy`, `/benchmark`, `/canary`, `/qa-only`, `/cso`, `/autoplan`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/gstack-upgrade`.

## Parallel sprints

gstack is easier to use when a sprint has a clear role boundary. That makes it practical to run several branches in parallel without turning the workspace into noise.

If you want orchestration across several sessions, OpenClaw or
[Conductor](https://conductor.build) can spawn isolated Claude Code sessions on
separate branches. The role boundary matters more than the orchestrator: keep
one session per task, make `/review`, `/qa`, and `/ship` explicit gates, and let
`/learn` carry project memory forward.

## Docs

| Doc | What it covers |
|-----|---------------|
| [Skill Deep Dives](docs/skills.md) / [简体中文](docs/skills.zh-CN.md) | Workflow and examples for every skill |
| [Builder Ethos](ETHOS.md) | Design principles and operating style |
| [Architecture](ARCHITECTURE.md) | System internals |
| [Browser Reference](BROWSER.md) | `/browse` command reference |
| [Contributing](CONTRIBUTING.md) | Development and setup notes |
| [Changelog](CHANGELOG.md) | Version history |

## Privacy & Telemetry

gstack keeps local analytics and supports opt-in telemetry. No code, file paths, repo names, or prompts are sent.

- Telemetry is off by default until enabled in config.
- Local analytics stay on the machine.
- You can change telemetry behavior with `gstack-config set telemetry ...`.

## Troubleshooting

**Skill not showing up?** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` fails?** `cd ~/.claude/skills/gstack && bun install && bun run build`

**Stale install?** Run `/gstack-upgrade` or set `auto_upgrade: true` in `~/.gstack/config.yaml`

**Want shorter commands?** `cd ~/.claude/skills/gstack && ./setup --no-prefix`

**Want namespaced commands?** `cd ~/.claude/skills/gstack && ./setup --prefix`

**Codex says "Skipped loading skill(s) due to invalid SKILL.md"?** `cd ~/.codex/skills/gstack && git pull && ./setup --host codex`

**Windows users:** gstack works on Windows 11 via Git Bash or WSL. Node.js is required in addition to Bun.

**Claude says it can't see the skills?** Re-run `./setup` and confirm the install exists at `~/.claude/skills/gstack` or `.claude/skills/gstack`.

## License

MIT.
