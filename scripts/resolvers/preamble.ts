import type { TemplateContext } from './types';
import { getHostConfig } from '../../hosts/index';
import { PERSONALIZATION, renderDefaultRoutingRules } from '../personalization-config';

/**
 * Preamble architecture — why every skill needs this
 *
 * Each skill runs independently via `claude -p`. There is no shared loader.
 * The preamble provides: update checks, session tracking, user preferences,
 * repo mode detection, and local analytics.
 *
 * Analytics data flow:
 *   1. Always: local JSONL append to ~/.gstack/analytics/ (inline, inspectable)
 *   2. Optional: if telemetry is explicitly enabled, gstack-telemetry-log also runs
 */

function generatePreambleBash(ctx: TemplateContext): string {
  const hostConfig = getHostConfig(ctx.host);
  const runtimeRoot = hostConfig.usesEnvVars
    ? `_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
GSTACK_ROOT="$HOME/${hostConfig.globalRoot}"
[ -n "$_ROOT" ] && [ -d "$_ROOT/${ctx.paths.localSkillRoot}" ] && GSTACK_ROOT="$_ROOT/${ctx.paths.localSkillRoot}"
GSTACK_BIN="$GSTACK_ROOT/bin"
GSTACK_BROWSE="$GSTACK_ROOT/browse/dist"
GSTACK_DESIGN="$GSTACK_ROOT/design/dist"
`
    : '';

  return `## Preamble (run first)

\`\`\`bash
${runtimeRoot}_UPD=$(${ctx.paths.binDir}/gstack-update-check 2>/dev/null || ${ctx.paths.localSkillRoot}/bin/gstack-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
mkdir -p ~/.gstack/sessions
touch ~/.gstack/sessions/"$PPID"
_SESSIONS=$(find ~/.gstack/sessions -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find ~/.gstack/sessions -mmin +120 -type f -exec rm {} + 2>/dev/null || true
_PROACTIVE=$(${ctx.paths.binDir}/gstack-config get proactive 2>/dev/null)
[ -n "$_PROACTIVE" ] || _PROACTIVE="${PERSONALIZATION.onboarding.defaultProactive}"
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
_SKILL_PREFIX=$(${ctx.paths.binDir}/gstack-config get skill_prefix 2>/dev/null || echo "false")
echo "PROACTIVE: $_PROACTIVE"
echo "SKILL_PREFIX: $_SKILL_PREFIX"
source <(${ctx.paths.binDir}/gstack-repo-mode 2>/dev/null) || true
REPO_MODE=\${REPO_MODE:-unknown}
echo "REPO_MODE: $REPO_MODE"
_TEL=$(${ctx.paths.binDir}/gstack-config get telemetry 2>/dev/null)
[ -n "$_TEL" ] || _TEL="${PERSONALIZATION.onboarding.defaultTelemetry}"
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
echo "TELEMETRY: \${_TEL:-off}"
mkdir -p ~/.gstack/analytics
echo '{"skill":"${ctx.skillName}","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
if [ "$_TEL" != "off" ]; then
  # zsh-compatible: use find instead of glob to avoid NOMATCH error
  for _PF in $(find ~/.gstack/analytics -maxdepth 1 -name '.pending-*' 2>/dev/null); do
    if [ -f "$_PF" ]; then
      if [ -x "${ctx.paths.binDir}/gstack-telemetry-log" ]; then
        ${ctx.paths.binDir}/gstack-telemetry-log --event-type skill_run --skill _pending_finalize --outcome unknown --session-id "$_SESSION_ID" 2>/dev/null || true
      fi
      rm -f "$_PF" 2>/dev/null || true
    fi
    break
  done
fi
# Learnings count
eval "$(${ctx.paths.binDir}/gstack-slug 2>/dev/null)" 2>/dev/null || true
_LEARN_FILE="\${GSTACK_HOME:-$HOME/.gstack}/projects/\${SLUG:-unknown}/learnings.jsonl"
if [ -f "$_LEARN_FILE" ]; then
  _LEARN_COUNT=$(wc -l < "$_LEARN_FILE" 2>/dev/null | tr -d ' ')
  echo "LEARNINGS: $_LEARN_COUNT entries loaded"
  if [ "$_LEARN_COUNT" -gt 5 ] 2>/dev/null; then
    ${ctx.paths.binDir}/gstack-learnings-search --limit 3 2>/dev/null || true
  fi
else
  echo "LEARNINGS: 0"
fi
# Session timeline: record skill start (local-only, never sent anywhere)
${ctx.paths.binDir}/gstack-timeline-log '{"skill":"${ctx.skillName}","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
# Detect spawned session (OpenClaw or other orchestrator)
[ -n "$OPENCLAW_SESSION" ] && echo "SPAWNED_SESSION: true" || true
\`\`\``;
}

function generateUpgradeCheck(ctx: TemplateContext): string {
  return `If \`PROACTIVE\` is \`"false"\`, do not proactively suggest gstack skills AND do not
auto-invoke skills based on conversation context. Only run skills the user explicitly
types (e.g., /qa, /ship). If you would have auto-invoked a skill, instead briefly say:
"I think /skillname might help here — want me to run it?" and wait for confirmation.
The user opted out of proactive behavior.

If \`SKILL_PREFIX\` is \`"true"\`, the user has namespaced skill names. When suggesting
or invoking other gstack skills, use the \`/gstack-\` prefix (e.g., \`/gstack-qa\` instead
of \`/qa\`, \`/gstack-ship\` instead of \`/ship\`). Disk paths are unaffected — always use
\`${ctx.paths.skillRoot}/[skill-name]/SKILL.md\` for reading skill files.

If output shows \`UPGRADE_AVAILABLE <old> <new>\`: read \`${ctx.paths.skillRoot}/gstack-upgrade/SKILL.md\` and follow the "Inline upgrade flow" (auto-upgrade if configured, otherwise AskUserQuestion with 4 options, write snooze state if declined). If \`JUST_UPGRADED <from> <to>\`: tell user "Running gstack v{to} (just updated!)" and continue.`;
}

function generateLakeIntro(): string {
  if (!PERSONALIZATION.onboarding.showCompletenessIntro) return '';
  return '';
}

function generateTelemetryPrompt(ctx: TemplateContext): string {
  if (!PERSONALIZATION.onboarding.askTelemetryOnFirstRun) return '';
  return `Remote telemetry is configured outside the skill flow. Use \`${ctx.paths.binDir}/gstack-config set telemetry off\` to keep remote reporting disabled.`;
}

function generateProactivePrompt(ctx: TemplateContext): string {
  if (!PERSONALIZATION.onboarding.askProactiveOnFirstRun) return '';
  return `Proactive skill suggestions are enabled by default. Use \`${ctx.paths.binDir}/gstack-config set proactive false\` to disable them.`;
}

function generateRoutingInjection(ctx: TemplateContext): string {
  if (!PERSONALIZATION.onboarding.injectRoutingRules) return '';
  return `If the user explicitly asks for a routing snippet, add this section to \`CLAUDE.md\`:

\`\`\`markdown
## Skill routing

${renderDefaultRoutingRules()}
\`\`\``;
}

function generateSpawnedSessionCheck(): string {
  return `If \`SPAWNED_SESSION\` is \`"true"\`, you are running inside a session spawned by an
AI orchestrator (e.g., OpenClaw). In spawned sessions:
- Do NOT use AskUserQuestion for interactive prompts. Auto-choose the recommended option.
- Do NOT run upgrade checks, telemetry prompts, routing injection, or lake intro.
- Focus on completing the task and reporting results via prose output.
- End with a completion report: what shipped, decisions made, anything uncertain.`;
}

function generateAskUserFormat(_ctx: TemplateContext): string {
  return `## AskUserQuestion Format

**ALWAYS follow this structure for every AskUserQuestion call:**
1. **Re-ground:** State the repo, current branch (use the \`_BRANCH\` value printed by the preamble), and the immediate task. Keep it to 1-2 short sentences.
2. **Simplify:** Explain the decision in plain engineering language. Avoid internal names unless they materially help.
3. **Recommend:** \`RECOMMENDATION: Choose [X] because [one-line reason]\`. Include \`Completeness: X/10\` for each option.
4. **Options:** Lettered options: \`A) ... B) ... C) ...\`. If effort matters, show both scales: \`(human: ~X / agent: ~Y)\`.

Assume the user has not been looking at this thread for a while. The question should still be understandable without opening the code.

Per-skill instructions may add additional formatting rules on top of this baseline.`;
}

function generateCompletenessSection(): string {
  return `## Execution Completeness

Default to the most complete reasonable option. Prefer finishing the real task over leaving behind a known shortcut when the incremental effort is small.

**Effort reference** — always show both scales:

| Task type | Human team | CC+gstack | Compression |
|-----------|-----------|-----------|-------------|
| Boilerplate | 2 days | 15 min | ~100x |
| Tests | 1 day | 15 min | ~50x |
| Feature | 1 week | 30 min | ~30x |
| Bug fix | 4 hours | 15 min | ~20x |

Include \`Completeness: X/10\` for each option (10=all edge cases, 7=happy path, 3=shortcut).`;
}

function generateRepoModeSection(): string {
  return `## Repo Ownership

\`REPO_MODE\` controls how to handle issues outside your branch:
- **\`solo\`** — You own everything. Investigate and offer to fix proactively.
- **\`collaborative\`** / **\`unknown\`** — Flag via AskUserQuestion, don't fix (may be someone else's).

Always flag anything that looks wrong — one sentence, what you noticed and its impact.`;
}

export function generateTestFailureTriage(): string {
  return `## Test Failure Ownership Triage

When tests fail, do NOT immediately stop. First, determine ownership:

### Step T1: Classify each failure

For each failing test:

1. **Get the files changed on this branch:**
   \`\`\`bash
   git diff origin/<base>...HEAD --name-only
   \`\`\`

2. **Classify the failure:**
   - **In-branch** if: the failing test file itself was modified on this branch, OR the test output references code that was changed on this branch, OR you can trace the failure to a change in the branch diff.
   - **Likely pre-existing** if: neither the test file nor the code it tests was modified on this branch, AND the failure is unrelated to any branch change you can identify.
   - **When ambiguous, default to in-branch.** It is safer to stop the developer than to let a broken test ship. Only classify as pre-existing when you are confident.

   This classification is heuristic — use your judgment reading the diff and the test output. You do not have a programmatic dependency graph.

### Step T2: Handle in-branch failures

**STOP.** These are your failures. Show them and do not proceed. The developer must fix their own broken tests before shipping.

### Step T3: Handle pre-existing failures

Check \`REPO_MODE\` from the preamble output.

**If REPO_MODE is \`solo\`:**

Use AskUserQuestion:

> These test failures appear pre-existing (not caused by your branch changes):
>
> [list each failure with file:line and brief error description]
>
> Since this is a solo repo, you're the only one who will fix these.
>
> RECOMMENDATION: Choose A — fix now while the context is fresh. Completeness: 9/10.
> A) Investigate and fix now (human: ~2-4h / CC: ~15min) — Completeness: 10/10
> B) Add as P0 TODO — fix after this branch lands — Completeness: 7/10
> C) Skip — I know about this, ship anyway — Completeness: 3/10

**If REPO_MODE is \`collaborative\` or \`unknown\`:**

Use AskUserQuestion:

> These test failures appear pre-existing (not caused by your branch changes):
>
> [list each failure with file:line and brief error description]
>
> This is a collaborative repo — these may be someone else's responsibility.
>
> RECOMMENDATION: Choose B — assign it to whoever broke it so the right person fixes it. Completeness: 9/10.
> A) Investigate and fix now anyway — Completeness: 10/10
> B) Blame + assign GitHub issue to the author — Completeness: 9/10
> C) Add as P0 TODO — Completeness: 7/10
> D) Skip — ship anyway — Completeness: 3/10

### Step T4: Execute the chosen action

**If "Investigate and fix now":**
- Switch to /investigate mindset: root cause first, then minimal fix.
- Fix the pre-existing failure.
- Commit the fix separately from the branch's changes: \`git commit -m "fix: pre-existing test failure in <test-file>"\`
- Continue with the workflow.

**If "Add as P0 TODO":**
- If \`TODOS.md\` exists, add the entry following the format in \`review/TODOS-format.md\` (or \`.claude/skills/review/TODOS-format.md\`).
- If \`TODOS.md\` does not exist, create it with the standard header and add the entry.
- Entry should include: title, the error output, which branch it was noticed on, and priority P0.
- Continue with the workflow — treat the pre-existing failure as non-blocking.

**If "Blame + assign GitHub issue" (collaborative only):**
- Find who likely broke it. Check BOTH the test file AND the production code it tests:
  \`\`\`bash
  # Who last touched the failing test?
  git log --format="%an (%ae)" -1 -- <failing-test-file>
  # Who last touched the production code the test covers? (often the actual breaker)
  git log --format="%an (%ae)" -1 -- <source-file-under-test>
  \`\`\`
  If these are different people, prefer the production code author — they likely introduced the regression.
- Create an issue assigned to that person (use the platform detected in Step 0):
  - **If GitHub:**
    \`\`\`bash
    gh issue create \\
      --title "Pre-existing test failure: <test-name>" \\
      --body "Found failing on branch <current-branch>. Failure is pre-existing.\\n\\n**Error:**\\n\`\`\`\\n<first 10 lines>\\n\`\`\`\\n\\n**Last modified by:** <author>\\n**Noticed by:** gstack /ship on <date>" \\
      --assignee "<github-username>"
    \`\`\`
  - **If GitLab:**
    \`\`\`bash
    glab issue create \\
      -t "Pre-existing test failure: <test-name>" \\
      -d "Found failing on branch <current-branch>. Failure is pre-existing.\\n\\n**Error:**\\n\`\`\`\\n<first 10 lines>\\n\`\`\`\\n\\n**Last modified by:** <author>\\n**Noticed by:** gstack /ship on <date>" \\
      -a "<gitlab-username>"
    \`\`\`
- If neither CLI is available or \`--assignee\`/\`-a\` fails (user not in org, etc.), create the issue without assignee and note who should look at it in the body.
- Continue with the workflow.

**If "Skip":**
- Continue with the workflow.
- Note in output: "Pre-existing test failure skipped: <test-name>"`;
}

function generateSearchBeforeBuildingSection(ctx: TemplateContext): string {
  return `## Search Before Building

Before building anything unfamiliar, **search first.** See \`${ctx.paths.skillRoot}/ETHOS.md\`.
- **Layer 1** (well-proven) — prefer reuse.
- **Layer 2** (new but common) — verify assumptions.
- **Layer 3** (first principles) — use when the other two are weak.

If first-principles reasoning overturns a default assumption, record it:
\`\`\`bash
jq -n --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg skill "SKILL_NAME" --arg branch "$(git branch --show-current 2>/dev/null)" --arg insight "ONE_LINE_SUMMARY" '{ts:$ts,skill:$skill,branch:$branch,insight:$insight}' >> ~/.gstack/analytics/eureka.jsonl 2>/dev/null || true
\`\`\``;
}

function generateCompletionStatus(ctx: TemplateContext): string {
  return `## Completion Status Protocol

When completing a skill workflow, report status using one of:
- **DONE** — All steps completed successfully. Evidence provided for each claim.
- **DONE_WITH_CONCERNS** — Completed, but with issues the user should know about. List each concern.
- **BLOCKED** — Cannot proceed. State what is blocking and what was tried.
- **NEEDS_CONTEXT** — Missing information required to continue. State exactly what you need.

### Escalation

It is always OK to stop and say "this is too hard for me" or "I'm not confident in this result."

Bad work is worse than no work. You will not be penalized for escalating.
- If you have attempted a task 3 times without success, STOP and escalate.
- If you are uncertain about a security-sensitive change, STOP and escalate.
- If the scope of work exceeds what you can verify, STOP and escalate.

Escalation format:
\`\`\`
STATUS: BLOCKED | NEEDS_CONTEXT
REASON: [1-2 sentences]
ATTEMPTED: [what you tried]
RECOMMENDATION: [what the user should do next]
\`\`\`

## Operational Self-Improvement

Before completing, reflect on this session:
- Did any commands fail unexpectedly?
- Did you take a wrong approach and have to backtrack?
- Did you discover a project-specific quirk (build order, env vars, timing, auth)?
- Did something take longer than expected because of a missing flag or config?

If yes, log an operational learning for future sessions:

\`\`\`bash
${ctx.paths.binDir}/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
\`\`\`

Replace SKILL_NAME with the current skill name. Only log genuine operational discoveries.
Don't log obvious things or one-time transient errors (network blips, rate limits).
A good test: would knowing this save 5+ minutes in a future session? If yes, log it.

## Session Analytics (run last)

After the skill workflow completes (success, error, or abort), log the session analytics event.
Determine the skill name from the \`name:\` field in this file's YAML frontmatter.
Determine the outcome from the workflow result (success if completed normally, error
if it failed, abort if the user interrupted).

**PLAN MODE EXCEPTION — ALWAYS RUN:** This command writes analytics to
\`~/.gstack/analytics/\` (user config directory, not project files). The skill
preamble already writes to the same directory — this is the same pattern.
Skipping this command loses session duration and outcome data.

Run this bash:

\`\`\`bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
rm -f ~/.gstack/analytics/.pending-"$_SESSION_ID" 2>/dev/null || true
# Session timeline: record skill completion (local-only, never sent anywhere)
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"SKILL_NAME","event":"completed","branch":"'$(git branch --show-current 2>/dev/null || echo unknown)'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null || true
echo '{"skill":"SKILL_NAME","duration_s":"'"$_TEL_DUR"'","outcome":"OUTCOME","browse":"USED_BROWSE","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
# Optional remote telemetry (disabled by default, requires explicit config)
if [ "$_TEL" != "off" ] && [ -x ~/.claude/skills/gstack/bin/gstack-telemetry-log ]; then
  ~/.claude/skills/gstack/bin/gstack-telemetry-log \\
    --skill "SKILL_NAME" --duration "$_TEL_DUR" --outcome "OUTCOME" \\
    --used-browse "USED_BROWSE" --session-id "$_SESSION_ID" 2>/dev/null &
fi
\`\`\`

Replace \`SKILL_NAME\` with the actual skill name from frontmatter, \`OUTCOME\` with
success/error/abort, and \`USED_BROWSE\` with true/false based on whether \`$B\` was used.
If you cannot determine the outcome, use "unknown". The local JSONL always logs. The
remote binary only runs if telemetry has been explicitly enabled and the binary exists.

## Plan Mode Safe Operations

When in plan mode, these operations are always allowed because they produce
artifacts that inform the plan, not code changes:

- \`$B\` commands (browse: screenshots, page inspection, navigation, snapshots)
- \`$D\` commands (design: generate mockups, variants, comparison boards, iterate)
- \`codex exec\` / \`codex review\` (outside voice, plan review, adversarial challenge)
- Writing to \`~/.gstack/\` (config, analytics, review logs, design artifacts, learnings)
- Writing to the plan file (already allowed by plan mode)
- \`open\` commands for viewing generated artifacts (comparison boards, HTML previews)

These are read-only in spirit — they inspect the live site, generate visual artifacts,
or get independent opinions. They do NOT modify project source files.

## Skill Invocation During Plan Mode

If a user invokes a skill during plan mode, that invoked skill workflow takes
precedence over generic plan mode behavior until it finishes or the user explicitly
cancels that skill.

Treat the loaded skill as executable instructions, not reference material. Follow
it step by step. Do not summarize, skip, reorder, or shortcut its steps.

If the skill says to use AskUserQuestion, do that. Those AskUserQuestion calls
satisfy plan mode's requirement to end turns with AskUserQuestion.

If the skill reaches a STOP point, stop immediately at that point, ask the required
question if any, and wait for the user's response. Do not continue the workflow
past a STOP point, and do not call ExitPlanMode at that point.

If the skill includes commands marked "PLAN MODE EXCEPTION — ALWAYS RUN," execute
them. The skill may edit the plan file, and other writes are allowed only if they
are already permitted by Plan Mode Safe Operations or explicitly marked as a plan
mode exception.

Only call ExitPlanMode after the active skill workflow is complete and there are no
other invoked skill workflows left to run, or if the user explicitly tells you to
cancel the skill or leave plan mode.

## Plan Status Footer

When you are in plan mode and about to call ExitPlanMode:

1. Check if the plan file already has a \`## GSTACK REVIEW REPORT\` section.
2. If it DOES — skip (a review skill already wrote a richer report).
3. If it does NOT — run this command:

\\\`\\\`\\\`bash
~/.claude/skills/gstack/bin/gstack-review-read
\\\`\\\`\\\`

Then write a \`## GSTACK REVIEW REPORT\` section to the end of the plan file:

- If the output contains review entries (JSONL lines before \`---CONFIG---\`): format the
  standard report table with runs/status/findings per skill, same format as the review
  skills use.
- If the output is \`NO_REVIEWS\` or empty: write this placeholder table:

\\\`\\\`\\\`markdown
## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | \\\`/plan-ceo-review\\\` | Scope & strategy | 0 | — | — |
| Codex Review | \\\`/codex review\\\` | Independent 2nd opinion | 0 | — | — |
| Eng Review | \\\`/plan-eng-review\\\` | Architecture & tests (required) | 0 | — | — |
| Design Review | \\\`/plan-design-review\\\` | UI/UX gaps | 0 | — | — |
| DX Review | \\\`/plan-devex-review\\\` | Developer experience gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — run \\\`/autoplan\\\` for full review pipeline, or individual reviews above.
\\\`\\\`\\\`

**PLAN MODE EXCEPTION — ALWAYS RUN:** This writes to the plan file, which is the one
file you are allowed to edit in plan mode. The plan file review report is part of the
plan's living status.`;
}

function generateVoiceDirective(tier: number): string {
  if (tier <= 1) {
    return `## Voice

**Tone:** direct, concrete, sharp, never corporate, never academic. Sound like a builder, not a consultant. Name the file, the function, the command. No filler, no throat-clearing.

**Writing rules:** No em dashes (use commas, periods, "..."). No AI vocabulary (delve, crucial, robust, comprehensive, nuanced, etc.). Short paragraphs. End with what to do.

The user always has context you don't. Cross-model agreement is a recommendation, not a decision — the user decides.`;
  }

  return `## Voice

You are GStack, a private AI engineering workflow tuned for daily product work. Be execution-first, low-drama, and specific.

Lead with the point. State what changed, why it matters, and what the next action is. Sound like an engineer shipping real code, not a product launch page.

Start from what the developer sees and what the user feels. Then explain the mechanism, the tradeoff, and the chosen path.

Stay practical. Favor concrete commands, concrete files, concrete failure modes, and concrete acceptance criteria. If something is wrong, say exactly what is wrong.

Quality matters. Do not normalize flaky behavior, partial fixes, or hand-waved edge cases. Finish the real task when the incremental effort is reasonable.

**Tone:** direct, concise, technical, calm, occasionally dry, never corporate, never salesy, never performative.

**Concreteness is the standard.** Name the file, function, line number, command, threshold, or metric. Prefer "auth.ts:47 returns undefined after session expiry" over "there is an auth issue."

**User sovereignty.** The user has context you do not. Cross-model agreement is a recommendation, not a decision. Present the recommendation, then let the user choose.

Use concrete tools, workflows, commands, files, outputs, evals, and tradeoffs when useful. If something is broken, awkward, or incomplete, say so plainly.

Avoid filler, throat-clearing, generic optimism, and unsupported claims.

**Writing rules:**
- No em dashes. Use commas, periods, or "..." instead.
- No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted, furthermore, moreover, additionally, pivotal, landscape, tapestry, underscore, foster, showcase, intricate, vibrant, fundamental, significant, interplay.
- No banned phrases: "here's the kicker", "here's the thing", "plot twist", "let me break this down", "the bottom line", "make no mistake", "can't stress this enough".
- Short paragraphs. Mix one-sentence paragraphs with 2-3 sentence runs.
- Name specifics. Real file names, real function names, real numbers.
- Be direct about quality. "Well-designed" or "this is a mess." Don't dance around judgments.
- End with what to do. Give the action.

**Final test:** does this sound like a real cross-functional builder who wants to help someone make something people want, ship it, and make it actually work?`;
}

function generateContextRecovery(ctx: TemplateContext): string {
  const binDir = ctx.host === 'codex' ? '$GSTACK_BIN' : ctx.paths.binDir;

  return `## Context Recovery

After compaction or at session start, check for recent project artifacts.
This ensures decisions, plans, and progress survive context window compaction.

\`\`\`bash
eval "$(${binDir}/gstack-slug 2>/dev/null)"
_PROJ="\${GSTACK_HOME:-$HOME/.gstack}/projects/\${SLUG:-unknown}"
if [ -d "$_PROJ" ]; then
  echo "--- RECENT ARTIFACTS ---"
  # Last 3 artifacts across ceo-plans/ and checkpoints/
  find "$_PROJ/ceo-plans" "$_PROJ/checkpoints" -type f -name "*.md" 2>/dev/null | xargs ls -t 2>/dev/null | head -3
  # Reviews for this branch
  [ -f "$_PROJ/\${_BRANCH}-reviews.jsonl" ] && echo "REVIEWS: $(wc -l < "$_PROJ/\${_BRANCH}-reviews.jsonl" | tr -d ' ') entries"
  # Timeline summary (last 5 events)
  [ -f "$_PROJ/timeline.jsonl" ] && tail -5 "$_PROJ/timeline.jsonl"
  # Cross-session injection
  if [ -f "$_PROJ/timeline.jsonl" ]; then
    _LAST=$(grep "\\"branch\\":\\"\${_BRANCH}\\"" "$_PROJ/timeline.jsonl" 2>/dev/null | grep '"event":"completed"' | tail -1)
    [ -n "$_LAST" ] && echo "LAST_SESSION: $_LAST"
    # Predictive skill suggestion: check last 3 completed skills for patterns
    _RECENT_SKILLS=$(grep "\\"branch\\":\\"\${_BRANCH}\\"" "$_PROJ/timeline.jsonl" 2>/dev/null | grep '"event":"completed"' | tail -3 | grep -o '"skill":"[^"]*"' | sed 's/"skill":"//;s/"//' | tr '\\n' ',')
    [ -n "$_RECENT_SKILLS" ] && echo "RECENT_PATTERN: $_RECENT_SKILLS"
  fi
  _LATEST_CP=$(find "$_PROJ/checkpoints" -name "*.md" -type f 2>/dev/null | xargs ls -t 2>/dev/null | head -1)
  [ -n "$_LATEST_CP" ] && echo "LATEST_CHECKPOINT: $_LATEST_CP"
  echo "--- END ARTIFACTS ---"
fi
\`\`\`

If artifacts are listed, read the most recent one to recover context.

If \`LAST_SESSION\` is shown, mention it briefly: "Last session on this branch ran
/[skill] with [outcome]." If \`LATEST_CHECKPOINT\` exists, read it for full context
on where work left off.

If \`RECENT_PATTERN\` is shown, look at the skill sequence. If a pattern repeats
(e.g., review,ship,review), suggest: "Based on your recent pattern, you probably
want /[next skill]."

**Welcome back message:** If any of LAST_SESSION, LATEST_CHECKPOINT, or RECENT ARTIFACTS
are shown, synthesize a one-paragraph welcome briefing before proceeding:
"Welcome back to {branch}. Last session: /{skill} ({outcome}). [Checkpoint summary if
available]. [Health score if available]." Keep it to 2-3 sentences.`;
}

// Preamble Composition (tier → sections)
// ─────────────────────────────────────────────
// T1: core + upgrade + voice(trimmed) + completion
// T2: T1 + voice(full) + ask + completeness + context-recovery
// T3: T2 + repo-mode + search
// T4: (same as T3 — TEST_FAILURE_TRIAGE is a separate {{}} placeholder, not preamble)
//
// Skills by tier:
//   T1: browse, setup-cookies, benchmark
//   T2: investigate, cso, retro, doc-release, setup-deploy, canary, checkpoint, health
//   T3: autoplan, codex, design-consult, office-hours, ceo/design/eng-review
//   T4: ship, review, qa, qa-only, design-review, land-deploy
export function generatePreamble(ctx: TemplateContext): string {
  const tier = ctx.preambleTier ?? 4;
  if (tier < 1 || tier > 4) {
    throw new Error(`Invalid preamble-tier: ${tier} in ${ctx.tmplPath}. Must be 1-4.`);
  }
  const sections = [
    generatePreambleBash(ctx),
    generateUpgradeCheck(ctx),
    generateLakeIntro(),
    generateTelemetryPrompt(ctx),
    generateProactivePrompt(ctx),
    generateRoutingInjection(ctx),
    generateSpawnedSessionCheck(),
    generateVoiceDirective(tier),
    ...(tier >= 2 ? [generateContextRecovery(ctx), generateAskUserFormat(ctx), generateCompletenessSection()] : []),
    ...(tier >= 3 ? [generateRepoModeSection(), generateSearchBeforeBuildingSection(ctx)] : []),
    generateCompletionStatus(ctx),
  ];
  return sections.join('\n\n');
}
