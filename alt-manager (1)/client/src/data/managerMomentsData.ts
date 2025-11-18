// Manager Moments Data - All 28 Templates
// Organized by category for easy filtering and routing

export interface ManagerMoment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 1 | 2 | 3;
  cluster: string;
  skillFocus: string;
}

export const MANAGER_MOMENTS: ManagerMoment[] = [
  // Communication (7 moments)
  {
    id: 'bluf-your-message',
    title: 'BLUF Your Message',
    description: 'Write concise updates that drive decisions with clear asks, risks, and next steps',
    category: 'Communication',
    difficulty: 1,
    cluster: 'Communication',
    skillFocus: 'Bottom-line-up-front communication'
  },
  {
    id: 'slack-chaos-into-signal',
    title: 'Turn Slack Chaos into Signal',
    description: 'Convert scattered threads into clear decisions, owners, and dates',
    category: 'Communication',
    difficulty: 2,
    cluster: 'Communication',
    skillFocus: 'Information synthesis and clarity'
  },
  {
    id: 'repair-note-after-misstep',
    title: 'Write a Repair Note After a Misstep',
    description: 'Rebuild trust with ownership, specific changes, and verification plans',
    category: 'Communication',
    difficulty: 2,
    cluster: 'Communication',
    skillFocus: 'Accountability and trust repair'
  },
  {
    id: 'stakeholder-update',
    title: 'Prepare Stakeholder Update',
    description: 'Lead with topline status, quantified variance, and decision asks',
    category: 'Communication',
    difficulty: 2,
    cluster: 'Communication',
    skillFocus: 'Executive communication'
  },
  {
    id: 'difficult-conversation',
    title: 'Having a Difficult Conversation',
    description: 'Address behavior issues using SBI framework while preserving relationships',
    category: 'Communication',
    difficulty: 3,
    cluster: 'Communication',
    skillFocus: 'Situation-Behavior-Impact feedback'
  },
  {
    id: 'stakeholder-bad-news',
    title: 'Delivering Bad News to Stakeholders',
    description: 'Share bad news early with facts, options, and solution-oriented approach',
    category: 'Communication',
    difficulty: 3,
    cluster: 'Communication',
    skillFocus: 'Crisis communication'
  },
  {
    id: 'difficult-performance-conversation',
    title: 'Having a Difficult Performance Conversation',
    description: 'Address performance gaps with evidence, expectations, and support',
    category: 'Communication',
    difficulty: 3,
    cluster: 'Communication',
    skillFocus: 'Performance management'
  },

  // Organization (7 moments)
  {
    id: 'managing-priorities',
    title: 'Managing Competing Priorities',
    description: 'Triage tasks using Must/Should/Could framework with clear trade-offs',
    category: 'Organization',
    difficulty: 2,
    cluster: 'Organization',
    skillFocus: 'Priority management'
  },
  {
    id: 'weekly-plan-that-sticks',
    title: 'Weekly Plan That Sticks',
    description: 'Create predictable plans with outcomes, focus blocks, and urgent paths',
    category: 'Organization',
    difficulty: 2,
    cluster: 'Organization',
    skillFocus: 'Time management'
  },
  {
    id: 'one-page-project-brief',
    title: 'One-Page Project Brief',
    description: 'Align teams on goals, scope, owners, timeline, and risks before building',
    category: 'Organization',
    difficulty: 2,
    cluster: 'Organization',
    skillFocus: 'Project planning'
  },
  {
    id: 'personal-operating-system',
    title: 'Personal Operating System',
    description: 'Build repeatable systems for capture, planning, execution, and review',
    category: 'Organization',
    difficulty: 2,
    cluster: 'Organization',
    skillFocus: 'Personal productivity'
  },
  {
    id: 'task-prioritization',
    title: 'Organize Chaotic Workload',
    description: 'Consolidate scattered tasks into single source of truth with status groups',
    category: 'Organization',
    difficulty: 2,
    cluster: 'Organization',
    skillFocus: 'Task organization'
  },
  {
    id: 'task-brain-dump',
    title: 'Get Tasks Out of Your Head',
    description: 'Externalize mental load and create traction on top 3 Must items',
    category: 'Organization',
    difficulty: 1,
    cluster: 'Organization',
    skillFocus: 'Mental clarity'
  },
  {
    id: 'priority-triage',
    title: 'Triage Competing Priorities',
    description: 'Present viable options with trade-offs and recommend path to protect goals',
    category: 'Organization',
    difficulty: 2,
    cluster: 'Organization',
    skillFocus: 'Decision frameworks'
  },

  // Collaboration (3 moments)
  {
    id: 'cross-team-collaboration',
    title: 'Collaborating Across Teams',
    description: 'Align on outcomes, roles, dependencies, and cadence with partner teams',
    category: 'Collaboration',
    difficulty: 2,
    cluster: 'Collaboration',
    skillFocus: 'Cross-functional alignment'
  },
  {
    id: 'boundary-setting',
    title: 'Set Boundaries Without Burning Bridges',
    description: 'Protect work-life balance while maintaining trust and responsiveness',
    category: 'Collaboration',
    difficulty: 2,
    cluster: 'Collaboration',
    skillFocus: 'Boundary management'
  },
  {
    id: 'team-conflict',
    title: 'Navigate Team Conflict',
    description: 'De-escalate tension and move toward shared outcomes without taking sides',
    category: 'Collaboration',
    difficulty: 3,
    cluster: 'Collaboration',
    skillFocus: 'Conflict mediation'
  },

  // Growth (3 moments)
  {
    id: 'building-confidence',
    title: 'Building Confidence Through Small Wins',
    description: 'Regain momentum via small, controllable wins tied to measurable outcomes',
    category: 'Growth',
    difficulty: 1,
    cluster: 'Growth',
    skillFocus: 'Confidence building'
  },
  {
    id: 'receiving-feedback',
    title: 'Receiving Feedback Effectively',
    description: 'Acknowledge, apply, and verify feedback with evidence and follow-up',
    category: 'Growth',
    difficulty: 2,
    cluster: 'Growth',
    skillFocus: 'Feedback reception'
  },
  {
    id: 'taking-ownership',
    title: 'Taking Ownership and Accountability',
    description: 'Own outcomes, fix issues, and prevent recurrence with verification',
    category: 'Growth',
    difficulty: 2,
    cluster: 'Growth',
    skillFocus: 'Accountability'
  },

  // Deadlines (3 moments)
  {
    id: 'communicate-delay-trust',
    title: 'Communicate a Delay Without Eroding Trust',
    description: 'Own delays, present mitigation, offer partial value, and drive decisions',
    category: 'Deadlines',
    difficulty: 2,
    cluster: 'Deadlines',
    skillFocus: 'Delay management'
  },
  {
    id: 'protect-deep-work',
    title: 'Protect Deep Work Time',
    description: 'Set predictable availability with focus blocks and urgent paths',
    category: 'Deadlines',
    difficulty: 2,
    cluster: 'Deadlines',
    skillFocus: 'Focus protection'
  },
  {
    id: 'deadline-pushback',
    title: 'Handle Impossible Deadline',
    description: 'Present options with trade-offs when deadlines risk quality or burnout',
    category: 'Deadlines',
    difficulty: 3,
    cluster: 'Deadlines',
    skillFocus: 'Deadline negotiation'
  },

  // Feedback (3 moments)
  {
    id: 'close-the-loop-feedback',
    title: 'Close the Loop After Feedback',
    description: 'Make progress visible with evidence and invite continued input',
    category: 'Feedback',
    difficulty: 2,
    cluster: 'Feedback',
    skillFocus: 'Feedback follow-through'
  },
  {
    id: 'handle-stinging-feedback',
    title: 'Handle Stinging Feedback',
    description: 'Respond professionally to harsh feedback without defensiveness',
    category: 'Feedback',
    difficulty: 3,
    cluster: 'Feedback',
    skillFocus: 'Emotional regulation'
  },
  {
    id: 'feedback-request',
    title: 'Request Performance Feedback',
    description: 'Make specific, low-effort, time-bound requests for actionable feedback',
    category: 'Feedback',
    difficulty: 1,
    cluster: 'Feedback',
    skillFocus: 'Feedback solicitation'
  },

  // Wellbeing (1 moment)
  {
    id: 'managing-stress-triggers',
    title: 'Managing Stress Triggers',
    description: 'Protect output and health during high-stress situations with tactics and boundaries',
    category: 'Wellbeing',
    difficulty: 2,
    cluster: 'Wellbeing',
    skillFocus: 'Stress management'
  },

  // Team Dynamics (1 moment)
  {
    id: 'decode-team-norms',
    title: 'Decode Team Norms',
    description: 'Make implicit norms explicit and propose lightweight team contract',
    category: 'Team Dynamics',
    difficulty: 2,
    cluster: 'Team Dynamics',
    skillFocus: 'Cultural adaptation'
  }
];

// Helper functions for filtering and categorization
export const getMomentsByCategory = (category: string): ManagerMoment[] => {
  return MANAGER_MOMENTS.filter(moment => moment.category === category);
};

export const getMomentById = (id: string): ManagerMoment | undefined => {
  return MANAGER_MOMENTS.find(moment => moment.id === id);
};

export const getCategories = (): string[] => {
  return Array.from(new Set(MANAGER_MOMENTS.map(m => m.category)));
};

export const getCategoryStats = (category: string) => {
  const moments = getMomentsByCategory(category);
  return {
    total: moments.length,
    beginner: moments.filter(m => m.difficulty === 1).length,
    intermediate: moments.filter(m => m.difficulty === 2).length,
    advanced: moments.filter(m => m.difficulty === 3).length
  };
};
