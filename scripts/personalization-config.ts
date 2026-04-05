export const PERSONALIZATION = {
  brand: {
    displayName: 'gstack',
    tone: 'private, execution-first, low-marketing',
    summary: 'Private AI engineering workflow for day-to-day product delivery.',
  },
  primaryHosts: ['claude', 'codex'] as const,
  coreSkills: [
    'office-hours',
    'plan-ceo-review',
    'plan-eng-review',
    'plan-design-review',
    'review',
    'investigate',
    'qa',
    'ship',
    'codex',
    'document-release',
    'learn',
  ] as const,
  onboarding: {
    showCompletenessIntro: false,
    askTelemetryOnFirstRun: false,
    askProactiveOnFirstRun: false,
    injectRoutingRules: false,
    defaultTelemetry: 'off',
    defaultProactive: true,
    defaultCrossProjectLearnings: false,
    localAnalyticsAlwaysOn: true,
  },
  routing: {
    intro: 'When a request clearly matches a core workflow, invoke the matching skill instead of answering ad hoc.',
    rules: [
      { pattern: 'New product idea, brainstorming, "is this worth building"', skill: '/office-hours' },
      { pattern: 'Product scope, ambition, or strategy review', skill: '/plan-ceo-review' },
      { pattern: 'Architecture, data flow, performance, or test planning', skill: '/plan-eng-review' },
      { pattern: 'UI or UX plan review before implementation', skill: '/plan-design-review' },
      { pattern: 'Bug, regression, broken behavior, root cause analysis', skill: '/investigate' },
      { pattern: 'Code review, diff review, pre-merge review', skill: '/review' },
      { pattern: 'QA, browser verification, staging validation', skill: '/qa' },
      { pattern: 'Ship, push, PR creation, release prep', skill: '/ship' },
      { pattern: 'Independent second opinion or Codex review', skill: '/codex' },
      { pattern: 'Post-ship documentation sync', skill: '/document-release' },
      { pattern: 'Past patterns, learned preferences, prior pitfalls', skill: '/learn' },
    ],
  },
} as const;

const CORE_SKILL_SET = new Set<string>(PERSONALIZATION.coreSkills);
const PROACTIVE_SENTENCE_RE = /\s*Proactively (?:suggest|invoke)[^.]*\.(?:\s+|$)/gi;

export function isCoreSkill(skillName: string): boolean {
  return skillName === 'gstack' || CORE_SKILL_SET.has(skillName);
}

export function isPrimaryHost(host: string): boolean {
  return (PERSONALIZATION.primaryHosts as readonly string[]).includes(host);
}

export function renderDefaultRoutingRules(): string {
  const lines = [
    `**Routing rule:** ${PERSONALIZATION.routing.intro}`,
    '',
    '**Default core workflows:**',
    ...PERSONALIZATION.routing.rules.map(rule => `- ${rule.pattern} → invoke \`${rule.skill}\``),
  ];
  return lines.join('\n');
}

export function sanitizeSkillDescription(description: string, skillName: string): string {
  if (isCoreSkill(skillName)) return description;
  return description
    .replace(PROACTIVE_SENTENCE_RE, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
