// Complete set of all 28 Manager Moments templates
// This file contains the additional moments to be added to momentsAIService.ts

export const ADDITIONAL_MOMENTS = {
  'stakeholder-update': {
    cluster: 'Communication',
    situation: `Your Q4 product launch is 2 weeks away. Original timeline was 6 weeks, but scope increased by 30%. The VP of Product wants a status update before tomorrow's board meeting. Two features are at risk.
Objective: Provide executive-level clarity on status, variance, and decision needs.
Ask: Write a 4-5 line update with topline status, quantified variance, business impact, decision ask with options, and next steps with owners/dates.`,
    safetyFraming: "Executives value clarity over completeness. Lead with status, variance, and what you need from them.",
    stakeholderVariants: [
      { role: 'VP of Product', prompt: 'Give me the update. What do I need to know for the board?' },
      { role: 'Executive', prompt: 'What is at risk and what decision do you need from me?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Executive, time-constrained, needs topline status and decision clarity' },
    rubric: {
      toplineStatus: 'Starts with clear status (on track / at risk / delayed)',
      quantifiedVariance: 'Includes specific metrics or timeline variance',
      decisionAsk: 'Clear decision ask with options',
      impactStated: 'States business impact of delay or risk',
      nextSteps: 'Next steps with owners and dates'
    },
    idealResponse: { slack: `Status: At risk. Launch delayed 1 week (Nov 15 → Nov 22) due to 30% scope increase.\nImpact: 2 features at risk—analytics dashboard and export.\nDecision needed: (A) Cut analytics to hit Nov 15, or (B) Full scope by Nov 22.\nNext: I will finalize scope with eng by EOD; need your call by tomorrow 10 AM.`, rationale: 'Topline status, quantified variance, options, and clear ask.' }
  },

  'difficult-conversation': {
    cluster: 'Communication',
    situation: `A senior team member has been interrupting others in meetings and dismissing junior engineers' ideas. Two team members privately mentioned feeling unheard. You need to address this behavior.
Objective: Address behavior using SBI framework while preserving the relationship.
Ask: Prepare a 4-5 line conversation opener using Situation-Behavior-Impact, specific examples, focus on behavior not character, invite their perspective, and state clear expectation.`,
    safetyFraming: "Difficult conversations preserve relationships when done with care. Focus on specific behavior, not character.",
    stakeholderVariants: [
      { role: 'Senior Team Member', prompt: 'You wanted to talk?' },
      { role: 'Team Member', prompt: 'Is this about the meeting yesterday?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Defensive initially, values directness, wants to maintain respect' },
    rubric: {
      usesSBI: 'Uses Situation-Behavior-Impact framework',
      specificExamples: 'Provides specific examples, not generalizations',
      focusesBehavior: 'Focuses on behavior, not character or intent',
      invitesDialogue: 'Invites their perspective',
      statesExpectation: 'States clear expectation going forward'
    },
    idealResponse: { verbal: `In yesterday's sprint planning (Situation), I noticed you interrupted Priya twice when she was explaining her approach (Behavior). She seemed hesitant to continue, and the team went quiet (Impact). I value your expertise, and I also want everyone to feel heard. What is your take on this? Going forward, let us ensure everyone gets to finish their thoughts before we jump in.`, rationale: 'SBI framework, specific, behavior-focused, invites dialogue, sets expectation.' }
  },

  'stakeholder-bad-news': {
    cluster: 'Communication',
    situation: `Your team's API integration project will miss the deadline by 3 weeks due to unexpected vendor delays. Marketing has already announced the feature launch to customers. The CMO and CTO need to know immediately.
Objective: Deliver bad news early with options and mitigation.
Ask: Write a 4-6 line message with bad news upfront, brief root cause, 2-3 options with trade-offs, mitigation already underway, and clear decision ask.`,
    safetyFraming: "Bad news shared early with options builds more trust than delayed perfection.",
    stakeholderVariants: [
      { role: 'CTO', prompt: 'This is going to impact our customer commitments. What are our options?' },
      { role: 'CMO', prompt: 'We already announced this. How do we handle customer communication?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Frustrated but solution-focused, needs options and mitigation' },
    rubric: {
      leadsWithNews: 'Delivers bad news upfront, no burying the lead',
      providesContext: 'Explains root cause briefly',
      offersOptions: 'Presents 2-3 options with trade-offs',
      ownsMitigation: 'States what you are already doing to mitigate',
      asksForDecision: 'Clear ask for decision or guidance'
    },
    idealResponse: { email: `API integration will miss deadline by 3 weeks (vendor delays). Options: (A) Launch with manual workaround (slower, 2-week dev), (B) Delay launch 3 weeks (full automation), (C) Partial launch (core features only). We are already working on workaround prototype. Need decision by EOD to adjust customer comms. I will send daily updates.`, rationale: 'Bad news first, options with trade-offs, mitigation stated, clear ask.' }
  },

  'difficult-performance-conversation': {
    cluster: 'Communication',
    situation: `A team member has missed 3 consecutive sprint commitments, causing delays for dependent teams. Their code quality has also declined. You have documentation of the issues.
Objective: Address performance with clear expectations and support.
Ask: Prepare a 5-6 line conversation with specific evidence and dates, impact on team, clear expectations for improvement, specific support offered, and action plan with check-in dates.`,
    safetyFraming: "Performance conversations are growth opportunities. Be specific, supportive, and clear about expectations.",
    stakeholderVariants: [
      { role: 'Team Member', prompt: 'I know I have been struggling lately...' },
      { role: 'Team Member', prompt: 'Is this about the sprint delays?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Anxious, may be dealing with personal issues, wants to improve' },
    rubric: {
      specificEvidence: 'Cites specific examples with dates',
      statesImpact: 'Explains impact on team and project',
      setsExpectations: 'Clear expectations for improvement',
      offersSupport: 'Offers specific support or resources',
      agreesOnPlan: 'Agrees on action plan with check-in dates'
    },
    idealResponse: { verbal: `I want to discuss sprint performance. In the last 3 sprints (Sept 1, 8, 15), you missed commitments on auth module, causing QA delays. The team is blocked. I need you to hit sprint commitments and improve code review feedback. I can offer pairing sessions with Rahul or adjusted scope. Let us create a plan together and check in weekly on Fridays. What support do you need?`, rationale: 'Specific dates, impact stated, expectations clear, support offered, plan agreed.' }
  }
};
