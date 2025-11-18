import { Router } from 'express';
import { db } from '../db/index.js';
import { managerMoments } from '../db/schema.js';

const router = Router();

// Admin endpoint to seed all 28 moments
router.post('/seed-moments', async (req, res) => {
  try {
    console.log('🌱 Seeding all 28 manager moments...');

    // All 28 Manager Moments
    const ALL_MOMENTS = [
      // Communication (7 moments)
      { id: 'bluf-your-message', title: 'BLUF Your Message', description: 'Write concise updates that drive decisions with clear asks, risks, and next steps', prompt: 'Practice writing BLUF messages for stakeholder updates', category: 'Communication' },
      { id: 'slack-chaos-into-signal', title: 'Turn Slack Chaos into Signal', description: 'Convert scattered threads into clear decisions, owners, and dates', prompt: 'Organize messy Slack threads into actionable summaries', category: 'Communication' },
      { id: 'repair-note-after-misstep', title: 'Write a Repair Note After a Misstep', description: 'Rebuild trust with ownership, specific changes, and verification plans', prompt: 'Write a repair note after missing a deadline', category: 'Communication' },
      { id: 'stakeholder-update', title: 'Prepare Stakeholder Update', description: 'Lead with topline status, quantified variance, and decision asks', prompt: 'Prepare a stakeholder update with BLUF and decision asks', category: 'Communication' },
      { id: 'difficult-conversation', title: 'Having a Difficult Conversation', description: 'Address behavior issues using SBI framework while preserving relationships', prompt: 'Have a difficult conversation about team behavior', category: 'Communication' },
      { id: 'stakeholder-bad-news', title: 'Delivering Bad News to Stakeholders', description: 'Share bad news early with facts, options, and solution-oriented approach', prompt: 'Deliver bad news about project delays to stakeholders', category: 'Communication' },
      { id: 'difficult-performance-conversation', title: 'Having a Difficult Performance Conversation', description: 'Address performance gaps with evidence, expectations, and support', prompt: 'Address performance issues with team member', category: 'Communication' },
      
      // Organization (7 moments)
      { id: 'managing-priorities', title: 'Managing Competing Priorities', description: 'Triage tasks using Must/Should/Could framework with clear trade-offs', prompt: 'Triage multiple competing priorities from different stakeholders', category: 'Organization' },
      { id: 'weekly-plan-that-sticks', title: 'Weekly Plan That Sticks', description: 'Create predictable plans with outcomes, focus blocks, and urgent paths', prompt: 'Create a weekly plan that balances focus and responsiveness', category: 'Organization' },
      { id: 'one-page-project-brief', title: 'One-Page Project Brief', description: 'Align teams on goals, scope, owners, timeline, and risks before building', prompt: 'Write a one-page project brief for team alignment', category: 'Organization' },
      { id: 'personal-operating-system', title: 'Personal Operating System', description: 'Build repeatable systems for capture, planning, execution, and review', prompt: 'Design your personal operating system for weekly execution', category: 'Organization' },
      { id: 'task-prioritization', title: 'Organize Chaotic Workload', description: 'Consolidate scattered tasks into single source of truth with status groups', prompt: 'Organize scattered tasks across multiple tools', category: 'Organization' },
      { id: 'task-brain-dump', title: 'Get Tasks Out of Your Head', description: 'Externalize mental load and create traction on top 3 Must items', prompt: 'Do a brain dump and prioritize top 3 must-do items', category: 'Organization' },
      { id: 'priority-triage', title: 'Triage Competing Priorities', description: 'Present viable options with trade-offs and recommend path to protect goals', prompt: 'Triage conflicting requests with trade-off analysis', category: 'Organization' },
      
      // Collaboration (3 moments)
      { id: 'cross-team-collaboration', title: 'Collaborating Across Teams', description: 'Align on outcomes, roles, dependencies, and cadence with partner teams', prompt: 'Set up collaboration framework with partner team', category: 'Collaboration' },
      { id: 'boundary-setting', title: 'Set Boundaries Without Burning Bridges', description: 'Protect work-life balance while maintaining trust and responsiveness', prompt: 'Set working hours boundaries across time zones', category: 'Collaboration' },
      { id: 'team-conflict', title: 'Navigate Team Conflict', description: 'De-escalate tension and move toward shared outcomes without taking sides', prompt: 'Mediate conflict between two team members', category: 'Collaboration' },
      
      // Growth (3 moments)
      { id: 'building-confidence', title: 'Building Confidence Through Small Wins', description: 'Regain momentum via small, controllable wins tied to measurable outcomes', prompt: 'Plan small wins to rebuild confidence after setbacks', category: 'Growth' },
      { id: 'receiving-feedback', title: 'Receiving Feedback Effectively', description: 'Acknowledge, apply, and verify feedback with evidence and follow-up', prompt: 'Respond to feedback and show application', category: 'Growth' },
      { id: 'taking-ownership', title: 'Taking Ownership and Accountability', description: 'Own outcomes, fix issues, and prevent recurrence with verification', prompt: 'Own a mistake and present prevention plan', category: 'Growth' },
      
      // Deadlines (3 moments)
      { id: 'communicate-delay-trust', title: 'Communicate a Delay Without Eroding Trust', description: 'Own delays, present mitigation, offer partial value, and drive decisions', prompt: 'Communicate a project delay with mitigation plan', category: 'Deadlines' },
      { id: 'protect-deep-work', title: 'Protect Deep Work Time', description: 'Set predictable availability with focus blocks and urgent paths', prompt: 'Protect deep work time while staying responsive', category: 'Deadlines' },
      { id: 'deadline-pushback', title: 'Handle Impossible Deadline', description: 'Present options with trade-offs when deadlines risk quality or burnout', prompt: 'Push back on unrealistic deadline with options', category: 'Deadlines' },
      
      // Feedback (3 moments)
      { id: 'close-the-loop-feedback', title: 'Close the Loop After Feedback', description: 'Make progress visible with evidence and invite continued input', prompt: 'Close the loop on feedback with evidence of change', category: 'Feedback' },
      { id: 'handle-stinging-feedback', title: 'Handle Stinging Feedback', description: 'Respond professionally to harsh feedback without defensiveness', prompt: 'Respond to harsh or unfair-feeling feedback', category: 'Feedback' },
      { id: 'feedback-request', title: 'Request Performance Feedback', description: 'Make specific, low-effort, time-bound requests for actionable feedback', prompt: 'Request specific feedback from manager', category: 'Feedback' },
      
      // Wellbeing (1 moment)
      { id: 'managing-stress-triggers', title: 'Managing Stress Triggers', description: 'Protect output and health during high-stress situations with tactics and boundaries', prompt: 'Manage stress during high-pressure period', category: 'Wellbeing' },
      
      // Team Dynamics (1 moment)
      { id: 'decode-team-norms', title: 'Decode Team Norms', description: 'Make implicit norms explicit and propose lightweight team contract', prompt: 'Decode team norms and propose team contract', category: 'Team Dynamics' }
    ];

    // Clear existing moments
    await db.delete(managerMoments);
    console.log('🗑️  Cleared existing moments');

    // Insert all moments
    for (const moment of ALL_MOMENTS) {
      await db.insert(managerMoments).values(moment);
    }
    
    console.log(`✅ Successfully seeded ${ALL_MOMENTS.length} manager moments`);
    
    const categories = Array.from(new Set(ALL_MOMENTS.map(m => m.category)));
    const breakdown = categories.map(cat => ({
      category: cat,
      count: ALL_MOMENTS.filter(m => m.category === cat).length
    }));
    
    res.json({
      success: true,
      message: `Successfully seeded ${ALL_MOMENTS.length} manager moments`,
      breakdown
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed moments' });
  }
});

export default router;
