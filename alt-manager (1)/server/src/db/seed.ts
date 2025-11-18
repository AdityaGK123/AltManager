import { db } from './index.js';
import { managerMoments } from './schema.js';

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed Manager Moments
  const moments = [
    {
      id: 'handling-unclear-requirements',
      title: 'Handling Unclear Requirements',
      description: 'Learn to navigate ambiguous project requirements and ask the right questions',
      scenario: `You've been assigned a new feature to build, but the requirements document is vague. Your manager sent you a Slack message saying "Build the user dashboard - make it good." You're not sure what metrics to show, what the layout should be, or what "good" means in this context. Your deadline is in 2 weeks.

How would you respond to your manager to get clarity?`,
      artifact: {
        type: 'slack',
        from: 'Manager',
        message: 'Hey! Can you build the user dashboard? Make it good. We need it in 2 weeks. Thanks!',
      },
      category: 'Communication',
      difficulty: 1,
      learningObjectives: [
        'Asking clarifying questions',
        'Managing expectations',
        'Breaking down ambiguous requirements',
      ],
    },
    {
      id: 'receiving-critical-feedback',
      title: 'Receiving Critical Feedback',
      description: 'Practice responding professionally to constructive criticism',
      scenario: `You just finished a code review where your senior colleague pointed out several issues with your implementation. They mentioned that your code lacks proper error handling, has performance issues, and doesn't follow the team's coding standards. You feel defensive because you worked hard on this.

Your senior is waiting for your response in the code review comments. How do you reply?`,
      artifact: {
        type: 'code_review',
        reviewer: 'Senior Engineer',
        comments: [
          'Missing error handling in the API calls',
          'This loop could cause performance issues with large datasets',
          'Please follow our naming conventions as per the style guide',
        ],
      },
      category: 'Feedback',
      difficulty: 2,
      learningObjectives: [
        'Receiving feedback gracefully',
        'Separating ego from work',
        'Professional communication under stress',
      ],
    },
    {
      id: 'prioritizing-conflicting-requests',
      title: 'Prioritizing Conflicting Requests',
      description: 'Learn to manage multiple urgent requests from different stakeholders',
      scenario: `It's Monday morning. You have three urgent requests:
1. Your manager needs a bug fix for production (2 hours)
2. The product team needs you in a planning meeting (1 hour, starting in 30 mins)
3. A senior engineer requested your help with a critical deployment (unknown time)

You also have your planned sprint work that's due by end of week. How do you handle this situation?`,
      artifact: {
        type: 'email_thread',
        emails: [
          { from: 'Manager', subject: 'URGENT: Production bug', time: '9:00 AM' },
          { from: 'Product Manager', subject: 'Planning meeting in 30 mins', time: '9:15 AM' },
          { from: 'Senior Engineer', subject: 'Need help with deployment ASAP', time: '9:20 AM' },
        ],
      },
      category: 'Time Management',
      difficulty: 2,
      learningObjectives: [
        'Prioritization frameworks',
        'Stakeholder communication',
        'Setting boundaries',
      ],
    },
    {
      id: 'speaking-up-in-meetings',
      title: 'Speaking Up in Meetings',
      description: 'Practice contributing valuable input in team discussions',
      scenario: `You're in a sprint planning meeting with 8 people including senior engineers and your manager. The team is discussing the architecture for a new feature. You notice a potential issue with the proposed approach - it might not scale well based on something you learned in your previous project.

However, you're the most junior person in the room and everyone seems aligned on the current approach. What do you do?`,
      artifact: {
        type: 'meeting_context',
        attendees: ['Manager', '3 Senior Engineers', '2 Engineers', '1 Product Manager', 'You'],
        topic: 'Architecture discussion for new feature',
        current_consensus: 'Use approach A',
        your_concern: 'Approach A might not scale based on previous experience',
      },
      category: 'Communication',
      difficulty: 3,
      learningObjectives: [
        'Speaking up with confidence',
        'Framing concerns constructively',
        'Adding value in discussions',
      ],
    },
    {
      id: 'admitting-a-mistake',
      title: 'Admitting a Mistake',
      description: 'Learn to own up to errors professionally and propose solutions',
      scenario: `You accidentally merged code to production that broke the login functionality for 15 minutes before it was caught. About 50 users were affected. Your manager has called an incident review meeting and is asking what happened.

You know it was your mistake - you didn't run the full test suite before merging. How do you handle this situation?`,
      artifact: {
        type: 'incident_report',
        severity: 'High',
        impact: '50 users affected, 15 minutes downtime',
        root_cause: 'Code merged without running full test suite',
        detected_by: 'Monitoring alerts',
      },
      category: 'Accountability',
      difficulty: 3,
      learningObjectives: [
        'Taking ownership of mistakes',
        'Problem-solving under pressure',
        'Building trust through transparency',
      ],
    },
    {
      id: 'negotiating-deadline-extension',
      title: 'Negotiating a Deadline Extension',
      description: 'Practice asking for more time when facing unexpected blockers',
      scenario: `You're working on a feature that was estimated to take 1 week. You're now on day 4 and realize you're only 40% done. The complexity was underestimated, and you've hit several technical blockers that required research and experimentation.

Your manager expects the feature to be ready for demo tomorrow. You know you can't deliver quality work by then. How do you approach this conversation?`,
      artifact: {
        type: 'project_status',
        original_estimate: '1 week (5 days)',
        current_day: 'Day 4',
        completion: '40%',
        demo_scheduled: 'Tomorrow',
        blockers: ['Integration complexity', 'API limitations', 'Performance optimization needed'],
      },
      category: 'Time Management',
      difficulty: 2,
      learningObjectives: [
        'Proactive communication',
        'Managing expectations',
        'Negotiation skills',
      ],
    },
  ];

  try {
    for (const moment of moments) {
      await db.insert(managerMoments).values(moment);
    }
    console.log('✅ Successfully seeded manager moments');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed();
