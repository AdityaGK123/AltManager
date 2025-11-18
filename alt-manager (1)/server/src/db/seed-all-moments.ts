import { db } from './index.js';
import { managerMoments } from './schema.js';

// All 28 Manager Moments matching the frontend data structure
const ALL_MOMENTS = [
  // Communication (7 moments)
  {
    id: 'bluf-your-message',
    title: 'BLUF Your Message',
    description: 'Write concise updates that drive decisions with clear asks, risks, and next steps',
    category: 'Communication',
    difficulty: 1,
    skillFocus: 'Bottom-line-up-front communication',
    scenario: 'Practice writing BLUF messages for stakeholder updates'
  },
  {
    id: 'slack-chaos-into-signal',
    title: 'Turn Slack Chaos into Signal',
    description: 'Convert scattered threads into clear decisions, owners, and dates',
    category: 'Communication',
    difficulty: 2,
    skillFocus: 'Information synthesis and clarity',
    scenario: 'Organize messy Slack threads into actionable summaries'
  },
  {
    id: 'repair-note-after-misstep',
    title: 'Write a Repair Note After a Misstep',
    description: 'Rebuild trust with ownership, specific changes, and verification plans',
    category: 'Communication',
    difficulty: 2,
    skillFocus: 'Accountability and trust repair',
    scenario: 'Write a repair note after missing a deadline'
  },
  {
    id: 'stakeholder-update',
    title: 'Prepare Stakeholder Update',
    description: 'Lead with topline status, quantified variance, and decision asks',
    category: 'Communication',
    difficulty: 2,
    skillFocus: 'Executive communication',
    scenario: 'Prepare a stakeholder update with BLUF and decision asks'
  },
  {
    id: 'difficult-conversation',
    title: 'Having a Difficult Conversation',
    description: 'Address behavior issues using SBI framework while preserving relationships',
    category: 'Communication',
    difficulty: 3,
    skillFocus: 'Situation-Behavior-Impact feedback',
    scenario: 'Have a difficult conversation about team behavior'
  },
  {
    id: 'stakeholder-bad-news',
    title: 'Delivering Bad News to Stakeholders',
    description: 'Share bad news early with facts, options, and solution-oriented approach',
    category: 'Communication',
    difficulty: 3,
    skillFocus: 'Crisis communication',
    scenario: 'Deliver bad news about project delays to stakeholders'
  },
  {
    id: 'difficult-performance-conversation',
    title: 'Having a Difficult Performance Conversation',
    description: 'Address performance gaps with evidence, expectations, and support',
    category: 'Communication',
    difficulty: 3,
    skillFocus: 'Performance management',
    scenario: 'Address ongoing performance issues with a team member'
  },

  // Organization (7 moments)
  {
    id: 'managing-priorities',
    title: 'Managing Competing Priorities',
    description: 'Triage tasks using Must/Should/Could framework with clear trade-offs',
    category: 'Organization',
    difficulty: 2,
    skillFocus: 'Priority management',
    scenario: 'Triage multiple competing priorities from different stakeholders'
  },
  {
    id: 'weekly-plan-that-sticks',
    title: 'Weekly Plan That Sticks',
    description: 'Create predictable plans with outcomes, focus blocks, and urgent paths',
    category: 'Organization',
    difficulty: 2,
    skillFocus: 'Time management',
    scenario: 'Create a weekly plan that balances focus and responsiveness'
  },
  {
    id: 'one-page-project-brief',
    title: 'One-Page Project Brief',
    description: 'Align teams on goals, scope, owners, timeline, and risks before building',
    category: 'Organization',
    difficulty: 2,
    skillFocus: 'Project planning',
    scenario: 'Write a one-page project brief for team alignment'
  },
  {
    id: 'personal-operating-system',
    title: 'Personal Operating System',
    description: 'Build repeatable systems for capture, planning, execution, and review',
    category: 'Organization',
    difficulty: 2,
    skillFocus: 'Personal productivity',
    scenario: 'Design your personal operating system for weekly execution'
  },
  {
    id: 'task-prioritization',
    title: 'Organize Chaotic Workload',
    description: 'Consolidate scattered tasks into single source of truth with status groups',
    category: 'Organization',
    difficulty: 2,
    skillFocus: 'Task organization',
    scenario: 'Organize scattered tasks across multiple tools'
  },
  {
    id: 'task-brain-dump',
    title: 'Get Tasks Out of Your Head',
    description: 'Externalize mental load and create traction on top 3 Must items',
    category: 'Organization',
    difficulty: 1,
    skillFocus: 'Mental clarity',
    scenario: 'Do a brain dump and prioritize top 3 must-do items'
  },
  {
    id: 'priority-triage',
    title: 'Triage Competing Priorities',
    description: 'Present viable options with trade-offs and recommend path to protect goals',
    category: 'Organization',
    difficulty: 2,
    skillFocus: 'Decision frameworks',
    scenario: 'Triage conflicting requests with trade-off analysis'
  },

  // Collaboration (3 moments)
  {
    id: 'cross-team-collaboration',
    title: 'Collaborating Across Teams',
    description: 'Align on outcomes, roles, dependencies, and cadence with partner teams',
    category: 'Collaboration',
    difficulty: 2,
    skillFocus: 'Cross-functional alignment',
    scenario: 'Set up collaboration framework with partner team'
  },
  {
    id: 'boundary-setting',
    title: 'Set Boundaries Without Burning Bridges',
    description: 'Protect work-life balance while maintaining trust and responsiveness',
    category: 'Collaboration',
    difficulty: 2,
    skillFocus: 'Boundary management',
    scenario: 'Set working hours boundaries across time zones'
  },
  {
    id: 'team-conflict',
    title: 'Navigate Team Conflict',
    description: 'De-escalate tension and move toward shared outcomes without taking sides',
    category: 'Collaboration',
    difficulty: 3,
    skillFocus: 'Conflict mediation',
    scenario: 'Mediate conflict between two team members'
  },

  // Growth (3 moments)
  {
    id: 'building-confidence',
    title: 'Building Confidence Through Small Wins',
    description: 'Regain momentum via small, controllable wins tied to measurable outcomes',
    category: 'Growth',
    difficulty: 1,
    skillFocus: 'Confidence building',
    scenario: 'Plan small wins to rebuild confidence after setbacks'
  },
  {
    id: 'receiving-feedback',
    title: 'Receiving Feedback Effectively',
    description: 'Acknowledge, apply, and verify feedback with evidence and follow-up',
    category: 'Growth',
    difficulty: 2,
    skillFocus: 'Feedback reception',
    scenario: 'Respond to feedback and show application'
  },
  {
    id: 'taking-ownership',
    title: 'Taking Ownership and Accountability',
    description: 'Own outcomes, fix issues, and prevent recurrence with verification',
    category: 'Growth',
    difficulty: 2,
    skillFocus: 'Accountability',
    scenario: 'Take ownership of a missed deliverable'
  },

  // Deadlines (3 moments)
  {
    id: 'communicate-delay-trust',
    title: 'Communicate a Delay Without Eroding Trust',
    description: 'Own delays, present mitigation, offer partial value, and drive decisions',
    category: 'Deadlines',
    difficulty: 2,
    skillFocus: 'Delay management',
    scenario: 'Communicate a project delay with mitigation plan'
  },
  {
    id: 'protect-deep-work',
    title: 'Protect Deep Work Time',
    description: 'Set predictable availability with focus blocks and urgent paths',
    category: 'Deadlines',
    difficulty: 2,
    skillFocus: 'Focus protection',
    scenario: 'Protect deep work time while staying responsive'
  },
  {
    id: 'deadline-pushback',
    title: 'Handle Impossible Deadline',
    description: 'Present options with trade-offs when deadlines risk quality or burnout',
    category: 'Deadlines',
    difficulty: 3,
    skillFocus: 'Deadline negotiation',
    scenario: 'Push back on unrealistic deadline with options'
  },

  // Feedback (3 moments)
  {
    id: 'close-the-loop-feedback',
    title: 'Close the Loop After Feedback',
    description: 'Make progress visible with evidence and invite continued input',
    category: 'Feedback',
    difficulty: 2,
    skillFocus: 'Feedback follow-through',
    scenario: 'Close the loop on feedback with evidence of change'
  },
  {
    id: 'handle-stinging-feedback',
    title: 'Handle Stinging Feedback',
    description: 'Respond professionally to harsh feedback without defensiveness',
    category: 'Feedback',
    difficulty: 3,
    skillFocus: 'Emotional regulation',
    scenario: 'Respond to harsh or unfair-feeling feedback'
  },
  {
    id: 'feedback-request',
    title: 'Request Performance Feedback',
    description: 'Make specific, low-effort, time-bound requests for actionable feedback',
    category: 'Feedback',
    difficulty: 1,
    skillFocus: 'Feedback solicitation',
    scenario: 'Request actionable feedback from your manager'
  },

  // Wellbeing (1 moment)
  {
    id: 'managing-stress-triggers',
    title: 'Managing Stress Triggers',
    description: 'Protect output and health during high-stress situations with tactics and boundaries',
    category: 'Wellbeing',
    difficulty: 2,
    skillFocus: 'Stress management',
    scenario: 'Manage stress triggers during high-pressure launch'
  },

  // Team Dynamics (1 moment)
  {
    id: 'decode-team-norms',
    title: 'Decode Team Norms',
    description: 'Make implicit norms explicit and propose lightweight team contract',
    category: 'Team Dynamics',
    difficulty: 2,
    skillFocus: 'Cultural adaptation',
    scenario: 'Decode and document team norms as a new member'
  }
];

async function seedAllMoments() {
  console.log('🌱 Seeding all 28 manager moments...');

  try {
    // Clear existing moments
    await db.delete(managerMoments);
    console.log('🗑️  Cleared existing moments');

    // Insert all moments
    for (const moment of ALL_MOMENTS) {
      await db.insert(managerMoments).values(moment);
    }
    
    console.log(`✅ Successfully seeded ${ALL_MOMENTS.length} manager moments`);
    console.log('\nBreakdown by category:');
    
    const categories = Array.from(new Set(ALL_MOMENTS.map(m => m.category)));
    categories.forEach(cat => {
      const count = ALL_MOMENTS.filter(m => m.category === cat).length;
      console.log(`  - ${cat}: ${count} moments`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  console.log('\n🎉 Seeding complete!');
  process.exit(0);
}

seedAllMoments();
