import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Moment prompt templates based on Revised Manager Moments spec
const MOMENT_PROMPTS: Record<string, any> = {
  'bluf-your-message': {
    safetyFraming: "This is practice. Real stakeholders expect clarity, not perfection. Focus on the decision, risk, and next step—everything else is noise.",
    caselet: `You need a decision on Q4 budget allocation for your team's new analytics tool. Finance needs an answer by 3 PM today to lock vendor contracts. If delayed 24 hours, the vendor discount expires (₹2L loss). Your manager has 2 minutes between meetings.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Busy, decision-focused, values brevity and clarity',
      initialPrompt: 'I have 2 minutes. What do you need from me now?'
    },
    rubric: {
      hasBLUF: 'Starts with bottom-line-up-front statement',
      hasDecisionAskWithTime: 'Clear decision ask with specific time',
      includesSingleRisk: 'Names one specific risk if delayed',
      nextStepOwnerDate: 'Next step has owner and date',
      brevity: 'Message is ≤5 lines'
    }
  },
  'slack-chaos-into-signal': {
    safetyFraming: "Messy threads are normal. Your job is to create clarity, not judge the chaos. Focus on decisions, owners, and dates.",
    caselet: `Your #product-launch Slack channel has 47 messages today across 6 threads: bug reports, feature requests, timeline questions, and vendor asks. The PM just pinged: "What's the current status?" Launch is in 5 days. Two items are blocking QA.`,
    roleplayConfig: {
      stakeholderRole: 'PM',
      expectedTurns: 3,
      stakeholderPersona: 'Needs quick status, wants to know blockers and owners',
      initialPrompt: 'What is the current status and who owns what?'
    },
    rubric: {
      hasClusters: 'Groups into Decisions/In progress/Blockers',
      ownersAndDates: 'Every item has owner and date',
      decisionAskWithTime: 'One decision ask with time',
      includesLinks: 'Links to 2-3 source messages',
      blockersPrioritized: 'Blockers listed first'
    }
  },
  'repair-note-after-misstep': {
    safetyFraming: "Mistakes happen. Owning them builds trust faster than perfection. Focus on impact, change, and verification.",
    caselet: `You missed a Friday deadline for the client deck, causing the sales team to reschedule Monday's pitch. The client is frustrated, and your manager wants assurance this won't repeat.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Wants accountability and prevention plan',
      initialPrompt: 'We cannot repeat this. How will you prevent it next time?'
    },
    rubric: {
      ownsImpact: 'Names impact without defensiveness',
      statesSpecificChange: 'Specific change made (not vague promise)',
      includesEvidenceToday: 'Evidence or action taken today',
      preventionDefined: 'Clear prevention/guardrail stated',
      followUpDated: 'Follow-up date included'
    }
  },
  'stakeholder-update': {
    safetyFraming: "Executives value clarity over completeness. Lead with status, variance, and what you need from them.",
    caselet: `Your Q4 product launch is 2 weeks away. Original timeline was 6 weeks, but scope increased by 30%. The VP of Product wants a status update before tomorrow's board meeting. Two features are at risk, and you need a decision on scope vs. timeline.`,
    roleplayConfig: {
      stakeholderRole: 'VP of Product',
      expectedTurns: 3,
      stakeholderPersona: 'Executive, time-constrained, needs topline status and decision clarity',
      initialPrompt: 'Give me the update. What do I need to know for the board?'
    },
    rubric: {
      toplineStatus: 'Starts with clear status (on track / at risk / delayed)',
      quantifiedVariance: 'Includes specific metrics or timeline variance',
      decisionAsk: 'Clear decision ask with options',
      impactStated: 'States business impact of delay or risk',
      nextSteps: 'Next steps with owners and dates'
    }
  },
  'difficult-conversation': {
    safetyFraming: "Difficult conversations preserve relationships when done with care. Focus on specific behavior, not character.",
    caselet: `A senior team member has been interrupting others in meetings and dismissing junior engineers' ideas. Two team members privately mentioned feeling unheard. You need to address this behavior while maintaining the relationship and team dynamics.`,
    roleplayConfig: {
      stakeholderRole: 'Senior Team Member',
      expectedTurns: 3,
      stakeholderPersona: 'Defensive initially, values directness, wants to maintain respect',
      initialPrompt: 'You wanted to talk?'
    },
    rubric: {
      usesSBI: 'Uses Situation-Behavior-Impact framework',
      specificExamples: 'Provides specific examples, not generalizations',
      focusesBehavior: 'Focuses on behavior, not character or intent',
      invitesDialogue: 'Invites their perspective',
      statesExpectation: 'States clear expectation going forward'
    }
  },
  'stakeholder-bad-news': {
    safetyFraming: "Bad news shared early with options builds more trust than delayed perfection.",
    caselet: `Your team's API integration project will miss the deadline by 3 weeks due to unexpected vendor delays. The marketing team has already announced the feature launch to customers. The CMO and CTO need to know immediately to decide on communication strategy.`,
    roleplayConfig: {
      stakeholderRole: 'CTO',
      expectedTurns: 3,
      stakeholderPersona: 'Frustrated but solution-focused, needs options and mitigation',
      initialPrompt: 'This is going to impact our customer commitments. What are our options?'
    },
    rubric: {
      leadsWithNews: 'Delivers bad news upfront, no burying the lead',
      providesContext: 'Explains root cause briefly',
      offersOptions: 'Presents 2-3 options with trade-offs',
      ownsMitigation: 'States what you are already doing to mitigate',
      asksForDecision: 'Clear ask for decision or guidance'
    }
  },
  'difficult-performance-conversation': {
    safetyFraming: "Performance conversations are growth opportunities. Be specific, supportive, and clear about expectations.",
    caselet: `A team member has missed 3 consecutive sprint commitments, causing delays for dependent teams. Their code quality has also declined. You have documentation of the issues. You need to address this with clear expectations and support while understanding there may be underlying issues.`,
    roleplayConfig: {
      stakeholderRole: 'Team Member',
      expectedTurns: 3,
      stakeholderPersona: 'Anxious, may be dealing with personal issues, wants to improve',
      initialPrompt: 'I know I have been struggling lately...'
    },
    rubric: {
      specificEvidence: 'Cites specific examples with dates',
      statesImpact: 'Explains impact on team and project',
      setsExpectations: 'Clear expectations for improvement',
      offersSupport: 'Offers specific support or resources',
      agreesOnPlan: 'Agrees on action plan with check-in dates'
    }
  },
  'managing-priorities': {
    safetyFraming: "You cannot do everything. Transparent trade-offs help stakeholders make informed decisions.",
    caselet: `You have 3 urgent requests today: (1) Fix a production bug affecting 20% of users, (2) Prepare slides for tomorrow's executive demo, (3) Review architecture for next quarter's roadmap (due EOD). Each needs 4 hours. Your manager needs to know your plan.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Needs to understand trade-offs and your reasoning',
      initialPrompt: 'Walk me through how you are prioritizing these.'
    },
    rubric: {
      usesMustShouldCould: 'Categorizes using Must/Should/Could framework',
      explainsTradeoffs: 'Explains impact of each choice',
      recommendsPath: 'Recommends a path with reasoning',
      identifiesRisks: 'Names risks of deprioritized items',
      asksForInput: 'Asks for input or alignment'
    }
  },
  'weekly-plan-that-sticks': {
    safetyFraming: "A good plan balances focus time with responsiveness. Build in buffers for the unexpected.",
    caselet: `You have 5 focus-heavy tasks this week: 2 design docs (4 hours each), 3 code reviews (2 hours each), 1 team presentation (3 hours prep), plus daily standups and Slack. Last week, urgent requests derailed your plan by Wednesday. Create a realistic weekly plan.`,
    roleplayConfig: {
      stakeholderRole: 'Peer/Accountability Partner',
      expectedTurns: 3,
      stakeholderPersona: 'Supportive, asks clarifying questions about feasibility',
      initialPrompt: 'Show me your plan. How are you protecting focus time?'
    },
    rubric: {
      identifiesOutcomes: 'Lists outcomes, not just tasks',
      blocksFocusTime: 'Schedules specific focus blocks',
      buildsInBuffer: 'Includes buffer for urgent requests',
      definesUrgentPath: 'States how to reach you for urgent items',
      includesReview: 'Plans end-of-week review'
    }
  },
  'one-page-project-brief': {
    safetyFraming: "Alignment before execution prevents rework. A one-pager forces clarity.",
    caselet: `You are starting a new project to migrate the authentication system to OAuth2. It will take 6 weeks and involve 3 teams. Your manager wants a one-page brief before kickoff to ensure alignment on goals, scope, owners, timeline, and risks.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Wants clarity on scope, risks, and dependencies',
      initialPrompt: 'Walk me through the brief. What are the key risks?'
    },
    rubric: {
      statesGoal: 'Clear goal and success criteria',
      definesScope: 'Scope with in/out boundaries',
      identifiesOwners: 'Owners for each workstream',
      includesTimeline: 'Timeline with key milestones',
      listsRisks: 'Top 3 risks with mitigation'
    }
  },
  'personal-operating-system': {
    safetyFraming: "Systems reduce cognitive load. Build repeatable habits for capture, planning, and execution.",
    caselet: `You feel overwhelmed by scattered tasks across Slack, email, Jira, and handwritten notes. Things slip through the cracks. You want to build a personal system for capturing tasks, planning your week, executing with focus, and reviewing progress.`,
    roleplayConfig: {
      stakeholderRole: 'Coach',
      expectedTurns: 3,
      stakeholderPersona: 'Supportive, asks about your current pain points and habits',
      initialPrompt: 'What is your biggest challenge right now with staying organized?'
    },
    rubric: {
      captureSystem: 'Single inbox for all inputs',
      planningRitual: 'Weekly planning ritual defined',
      executionBlocks: 'Daily execution blocks scheduled',
      reviewCadence: 'Weekly review cadence',
      toolsChosen: 'Specific tools chosen (not too many)'
    }
  },
  'task-prioritization': {
    safetyFraming: "Chaos is normal. Consolidation and status grouping create clarity.",
    caselet: `You have 23 tasks scattered across Jira (8 tickets), Slack saved items (7), email flags (5), and sticky notes (3). Some are urgent, some are waiting on others, some are unclear. Consolidate them into a single source of truth with clear status groups.`,
    roleplayConfig: {
      stakeholderRole: 'Peer',
      expectedTurns: 3,
      stakeholderPersona: 'Curious about your system, wants to learn',
      initialPrompt: 'How are you organizing all of this?'
    },
    rubric: {
      singleSource: 'Consolidates into one tool/list',
      statusGroups: 'Groups by status (To Do / In Progress / Blocked / Done)',
      identifiesBlockers: 'Clearly marks blocked items',
      prioritizesTop3: 'Highlights top 3 priorities',
      includesOwners: 'Adds owners for delegated items'
    }
  },
  'task-brain-dump': {
    safetyFraming: "Your brain is for thinking, not storage. Externalize to create mental space.",
    caselet: `You are feeling mentally overloaded. You have a dozen tasks swirling in your head, causing anxiety and preventing focus. Do a brain dump to get everything out, then identify your top 3 Must items to create traction.`,
    roleplayConfig: {
      stakeholderRole: 'Coach',
      expectedTurns: 3,
      stakeholderPersona: 'Supportive, helps you prioritize and gain clarity',
      initialPrompt: 'Tell me everything on your mind right now. Just list it out.'
    },
    rubric: {
      completeDump: 'Lists all tasks, even small ones',
      categorizesItems: 'Groups into Must/Should/Could',
      identifiesTop3: 'Selects top 3 Must items',
      statesNextAction: 'Defines next action for each Must item',
      setsTimeframe: 'Sets timeframe for Must items'
    }
  },
  'priority-triage': {
    safetyFraming: "Conflicting priorities need transparent trade-off analysis. Present options, recommend a path.",
    caselet: `You have 3 conflicting requests: (1) VP wants a feature demo by Friday, (2) Customer escalation needs immediate fix, (3) Tech debt refactor is blocking next sprint. You can only do 2 well. Present options with trade-offs to your manager.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Needs to understand trade-offs and your recommendation',
      initialPrompt: 'What are our options here?'
    },
    rubric: {
      presentsOptions: 'Presents 2-3 viable options',
      explainsTradeoffs: 'Explains trade-offs for each option',
      recommendsPath: 'Recommends a path with reasoning',
      statesImpact: 'States impact of deprioritized items',
      asksForDecision: 'Asks for decision or guidance'
    }
  },
  'cross-team-collaboration': {
    safetyFraming: "Cross-team work needs explicit alignment on outcomes, roles, and cadence.",
    caselet: `You are starting a 3-month project with the Data Engineering team. You need their pipeline ready in 6 weeks to unblock your API work. Set up a collaboration framework covering outcomes, roles, dependencies, communication cadence, and escalation paths.`,
    roleplayConfig: {
      stakeholderRole: 'Data Engineering Lead',
      expectedTurns: 3,
      stakeholderPersona: 'Collaborative, wants clear expectations and communication',
      initialPrompt: 'Let us align on how we will work together. What do you need from us?'
    },
    rubric: {
      alignsOnOutcomes: 'Aligns on shared outcomes and success criteria',
      definesRoles: 'Defines roles and responsibilities',
      identifiesDependencies: 'Identifies dependencies and handoffs',
      setsCadence: 'Sets communication cadence (standups, syncs)',
      establishesEscalation: 'Establishes escalation path for blockers'
    }
  },
  'boundary-setting': {
    safetyFraming: "Boundaries protect your effectiveness. Set them clearly and offer alternatives.",
    caselet: `You are working with a US-based team (9-hour time difference). They schedule meetings at 9 PM your time and expect Slack responses late at night. This is affecting your health and focus. Set boundaries while maintaining trust and responsiveness.`,
    roleplayConfig: {
      stakeholderRole: 'US-based Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Understanding but needs to know how to reach you',
      initialPrompt: 'I want to make sure we can collaborate effectively across time zones.'
    },
    rubric: {
      statesBoundaries: 'States working hours clearly',
      explainsReason: 'Explains reason (health, focus) without over-justifying',
      offersAlternatives: 'Offers alternatives (async updates, recorded videos)',
      definesUrgentPath: 'Defines urgent escalation path',
      maintainsTrust: 'Reassures commitment to collaboration'
    }
  },
  'team-conflict': {
    safetyFraming: "Conflict is normal. Your role is to de-escalate and refocus on shared outcomes.",
    caselet: `Two team members are in conflict. Engineer A says Engineer B is not pulling their weight. Engineer B says Engineer A is micromanaging. The tension is affecting team morale. Mediate the conflict without taking sides, focusing on shared outcomes and next steps.`,
    roleplayConfig: {
      stakeholderRole: 'Both Team Members',
      expectedTurns: 3,
      stakeholderPersona: 'Defensive, wants to be heard, needs neutral facilitation',
      initialPrompt: 'We need to resolve this. What is going on?'
    },
    rubric: {
      listensToEach: 'Listens to each perspective without judgment',
      identifiesSharedGoal: 'Identifies shared goal or outcome',
      focusesBehavior: 'Focuses on behavior, not character',
      facilitatesAgreement: 'Facilitates agreement on next steps',
      setsFollowUp: 'Sets follow-up check-in'
    }
  },
  'building-confidence': {
    safetyFraming: "Small wins rebuild momentum. Focus on controllable actions with measurable outcomes.",
    caselet: `You have been struggling after a project failure. Your confidence is low, and you are avoiding taking initiative. Plan 3 small, controllable wins this week that are tied to measurable outcomes to rebuild momentum.`,
    roleplayConfig: {
      stakeholderRole: 'Coach',
      expectedTurns: 3,
      stakeholderPersona: 'Supportive, helps you identify achievable wins',
      initialPrompt: 'What are 3 small things you can accomplish this week?'
    },
    rubric: {
      identifiesSmallWins: 'Identifies 3 small, achievable wins',
      ensuresControllable: 'Wins are within your control',
      tiesMeasurable: 'Ties to measurable outcomes',
      setsTimeframe: 'Sets timeframe (this week)',
      buildsOnSuccess: 'Plans how to build on success'
    }
  },
  'receiving-feedback': {
    safetyFraming: "Feedback is a gift. Acknowledge, apply, and verify to show growth.",
    caselet: `Your manager gave you feedback that your updates lack clarity and decision asks. You want to show that you have heard the feedback and are applying it. Respond with acknowledgment, specific changes you will make, and how you will verify improvement.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Wants to see acknowledgment and action plan',
      initialPrompt: 'How are you planning to address the feedback I gave you?'
    },
    rubric: {
      acknowledges: 'Acknowledges feedback without defensiveness',
      statesSpecificChange: 'States specific change you will make',
      providesEvidence: 'Provides evidence or example of application',
      asksForVerification: 'Asks for verification or follow-up',
      setsCheckIn: 'Sets check-in date'
    }
  },
  'taking-ownership': {
    safetyFraming: "Ownership means fixing the issue and preventing recurrence. Show action, not just apology.",
    caselet: `A deliverable you owned was delayed, causing a downstream team to miss their deadline. Take ownership by acknowledging impact, stating what you are doing to fix it, and how you will prevent recurrence.`,
    roleplayConfig: {
      stakeholderRole: 'Downstream Team Lead',
      expectedTurns: 3,
      stakeholderPersona: 'Frustrated, wants accountability and prevention',
      initialPrompt: 'Your delay impacted our timeline. What is the plan?'
    },
    rubric: {
      ownsImpact: 'Acknowledges impact without excuses',
      statesAction: 'States what you are doing to fix it',
      preventionPlan: 'Explains prevention plan',
      offersVerification: 'Offers verification or check-in',
      rebuiltsTrust: 'Rebuilds trust through action'
    }
  },
  'communicate-delay-trust': {
    safetyFraming: "Delays communicated early with mitigation preserve trust. Silence erodes it.",
    caselet: `Your feature will be delayed by 1 week due to unexpected technical complexity. The Product Manager has already communicated the original timeline to stakeholders. Communicate the delay with mitigation, partial value options, and a clear ask.`,
    roleplayConfig: {
      stakeholderRole: 'Product Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Frustrated but solution-focused, needs options',
      initialPrompt: 'I already told stakeholders we would deliver this week. What are our options?'
    },
    rubric: {
      ownsDelay: 'Owns the delay upfront',
      explainsCause: 'Explains cause briefly',
      offersMitigation: 'Offers mitigation or partial value',
      presentsOptions: 'Presents options with trade-offs',
      asksForDecision: 'Asks for decision or guidance'
    }
  },
  'protect-deep-work': {
    safetyFraming: "Deep work requires protection. Set predictable availability with clear urgent paths.",
    caselet: `You need 4 hours of uninterrupted time daily to complete a complex design doc, but you are constantly interrupted by Slack and meetings. Set up a system to protect deep work time while staying responsive to urgent requests.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Supportive, wants to ensure you are still accessible',
      initialPrompt: 'How will you balance focus time with being available to the team?'
    },
    rubric: {
      schedulesFocusBlocks: 'Schedules specific focus blocks',
      communicatesAvailability: 'Communicates availability clearly',
      definesUrgentPath: 'Defines urgent escalation path',
      setsExpectations: 'Sets expectations for response times',
      usesTools: 'Uses tools (calendar blocks, Slack status)'
    }
  },
  'deadline-pushback': {
    safetyFraming: "Impossible deadlines risk quality and burnout. Present options with trade-offs.",
    caselet: `Your manager wants a 6-week project done in 2 weeks for a client demo. The timeline is unrealistic without cutting scope or quality. Push back with options: (1) Deliver partial scope in 2 weeks, (2) Full scope in 6 weeks, (3) Rushed delivery with quality risks.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Under pressure, needs options and your recommendation',
      initialPrompt: 'The client needs this in 2 weeks. Can we make it happen?'
    },
    rubric: {
      acknowledgesPressure: 'Acknowledges the pressure and importance',
      presentsOptions: 'Presents 2-3 options with trade-offs',
      explainsRisks: 'Explains risks of rushing',
      recommendsPath: 'Recommends a path with reasoning',
      asksForDecision: 'Asks for decision or guidance'
    }
  },
  'close-the-loop-feedback': {
    safetyFraming: "Closing the loop shows growth. Share evidence of change and invite continued input.",
    caselet: `Two weeks ago, your manager gave you feedback to be more proactive in standups. You have been applying it. Close the loop by sharing evidence of change and inviting continued feedback.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Appreciates follow-up, wants to see evidence',
      initialPrompt: 'I am glad you are following up. What have you been doing differently?'
    },
    rubric: {
      referencesOriginalFeedback: 'References original feedback',
      providesEvidence: 'Provides specific evidence of change',
      showsImpact: 'Shows impact of change',
      invitesContinuedInput: 'Invites continued feedback',
      setsNextCheckIn: 'Sets next check-in'
    }
  },
  'handle-stinging-feedback': {
    safetyFraming: "Harsh feedback is hard to hear. Respond professionally, ask clarifying questions, and focus on action.",
    caselet: `Your manager gave you harsh feedback in a 1-on-1: "Your work has been sloppy lately, and it is affecting the team." You feel defensive and hurt. Respond professionally without defensiveness, ask for specifics, and focus on action.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Direct, expects accountability and action',
      initialPrompt: 'I need to see improvement. What is your plan?'
    },
    rubric: {
      avoidsDefensiveness: 'Avoids defensiveness or excuses',
      asksForSpecifics: 'Asks for specific examples',
      acknowledgesImpact: 'Acknowledges impact on team',
      focusesOnAction: 'Focuses on action plan',
      setsFollowUp: 'Sets follow-up check-in'
    }
  },
  'feedback-request': {
    safetyFraming: "Good feedback requests are specific, low-effort, and time-bound.",
    caselet: `You want feedback from your manager on your communication skills. Make a specific, low-effort, time-bound request that makes it easy for them to provide actionable feedback.`,
    roleplayConfig: {
      stakeholderRole: 'Manager',
      expectedTurns: 3,
      stakeholderPersona: 'Busy, appreciates specific requests',
      initialPrompt: 'Sure, what specifically do you want feedback on?'
    },
    rubric: {
      isSpecific: 'Specific area (not "general feedback")',
      isLowEffort: 'Low-effort ask (not "write me a review")',
      isTimeBound: 'Time-bound (by Friday, in next 1-on-1)',
      providesContext: 'Provides context for why you are asking',
      makesActionable: 'Makes it easy to give actionable feedback'
    }
  },
  'managing-stress-triggers': {
    safetyFraming: "Stress is normal during high-pressure situations. Protect your output and health with tactics and boundaries.",
    caselet: `You are in the final week of a high-stakes product launch. You are working 12-hour days, sleep-deprived, and feeling overwhelmed. Identify stress triggers and put tactics in place to protect your output and health.`,
    roleplayConfig: {
      stakeholderRole: 'Coach',
      expectedTurns: 3,
      stakeholderPersona: 'Supportive, helps you identify tactics',
      initialPrompt: 'What are your biggest stress triggers right now?'
    },
    rubric: {
      identifiesTriggers: 'Identifies specific stress triggers',
      setsTactics: 'Sets tactics to manage triggers',
      protectsHealth: 'Protects health (sleep, breaks)',
      setBoundaries: 'Sets boundaries where possible',
      asksForSupport: 'Asks for support if needed'
    }
  },
  'decode-team-norms': {
    safetyFraming: "New teams have implicit norms. Make them explicit to adapt faster.",
    caselet: `You joined a new team 2 weeks ago. You notice implicit norms around meeting punctuality, Slack response times, and decision-making. Make these norms explicit by observing patterns and proposing a lightweight team contract.`,
    roleplayConfig: {
      stakeholderRole: 'Team Lead',
      expectedTurns: 3,
      stakeholderPersona: 'Appreciates proactive observation, open to formalizing norms',
      initialPrompt: 'What have you observed about how we work?'
    },
    rubric: {
      identifiesNorms: 'Identifies 3-4 implicit norms',
      providesExamples: 'Provides examples of each norm',
      proposesContract: 'Proposes lightweight team contract',
      invitesInput: 'Invites team input',
      focusesOnCritical: 'Focuses on critical norms (not everything)'
    }
  }
};

interface RoleplayTurn {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface DebriefResult {
  score: number; // 0-4
  evidenceQuotes: string[];
  strengths: string[];
  improvements: string[];
  exemplarRewrite: string;
  microHabit: string;
  templates: string[];
  rubricScores: Record<string, boolean>;
}

export class MomentsService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Get moment configuration
  getMomentConfig(momentKey: string) {
    return MOMENT_PROMPTS[momentKey] || null;
  }

  // Generate AI roleplay response
  async generateRoleplayResponse(
    momentKey: string,
    transcript: RoleplayTurn[],
    turnCount: number
  ): Promise<{ reply: string; chips: { good: string[]; risky: string[] } }> {
    const config = MOMENT_PROMPTS[momentKey];
    if (!config) {
      throw new Error('Invalid moment key');
    }

    const conversationHistory = transcript
      .map(t => `${t.role === 'user' ? 'User' : 'Stakeholder'}: ${t.content}`)
      .join('\n');

    const prompt = `You are roleplaying as a ${config.roleplayConfig.stakeholderRole} in a manager training scenario.

Persona: ${config.roleplayConfig.stakeholderPersona}

Scenario: ${config.caselet}

Conversation so far:
${conversationHistory}

Guidelines:
- Keep responses ≤60 words
- Stay in character as the ${config.roleplayConfig.stakeholderRole}
- React naturally to what the user said
- If turn ${turnCount} of ${config.roleplayConfig.expectedTurns}, start wrapping up
- Be direct and realistic (this is India corporate culture)

Also provide 2 quick feedback chips:
- "What's Good" (1-2 things working, ≤12 words each)
- "What's Risky" (1-2 things to watch, ≤12 words each)

Respond in JSON format:
{
  "reply": "your response as the stakeholder",
  "chipsGood": ["chip1", "chip2"],
  "chipsRisky": ["chip1", "chip2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          reply: parsed.reply || response,
          chips: {
            good: (parsed.chipsGood || []).slice(0, 2),
            risky: (parsed.chipsRisky || []).slice(0, 2)
          }
        };
      }

      // Fallback if JSON parsing fails
      return {
        reply: response.substring(0, 180),
        chips: { good: [], risky: [] }
      };
    } catch (error) {
      console.error('Roleplay generation error:', error);
      // Fallback response
      return {
        reply: "I need more specifics. Can you clarify the decision and timeline?",
        chips: { good: [], risky: ['Response unclear'] }
      };
    }
  }

  // Generate debrief with rubric scoring
  async generateDebrief(
    momentKey: string,
    transcript: RoleplayTurn[]
  ): Promise<DebriefResult> {
    const config = MOMENT_PROMPTS[momentKey];
    if (!config) {
      throw new Error('Invalid moment key');
    }

    const userResponses = transcript
      .filter(t => t.role === 'user')
      .map(t => t.content)
      .join('\n\n');

    const rubricCriteria = Object.entries(config.rubric)
      .map(([key, desc]) => `- ${key}: ${desc}`)
      .join('\n');

    const prompt = `You are evaluating a manager's communication practice for the "${momentKey}" scenario.

Scenario: ${config.caselet}

User's responses:
${userResponses}

Rubric criteria:
${rubricCriteria}

Evaluate and provide:
1. Score (0-4): 0=missing most, 1=weak, 2=basic, 3=good, 4=excellent
2. Evidence quotes (2-3 short quotes from user's text)
3. Strengths (1 thing done well, ≤20 words)
4. Improvements (2 specific things to improve, ≤25 words each)
5. Exemplar rewrite (≤90 words, show ideal version)
6. Micro-habit (1 tiny action to practice daily, ≤15 words)
7. Templates (2 copy-paste templates, ≤30 words each)
8. Rubric scores (true/false for each criterion)

Respond in JSON format:
{
  "score": 0-4,
  "evidenceQuotes": ["quote1", "quote2"],
  "strengths": ["strength"],
  "improvements": ["improvement1", "improvement2"],
  "exemplarRewrite": "ideal version here",
  "microHabit": "tiny daily action",
  "templates": ["template1", "template2"],
  "rubricScores": {
    "criterion1": true,
    "criterion2": false
  }
}

Be honest but supportive. This is India corporate context—direct feedback is valued.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and return
        return {
          score: Math.min(4, Math.max(0, parsed.score || 2)),
          evidenceQuotes: (parsed.evidenceQuotes || []).slice(0, 3),
          strengths: (parsed.strengths || ['Good effort']).slice(0, 1),
          improvements: (parsed.improvements || ['Be more specific', 'Add concrete dates']).slice(0, 2),
          exemplarRewrite: (parsed.exemplarRewrite || '').substring(0, 270),
          microHabit: (parsed.microHabit || 'Practice brevity daily').substring(0, 45),
          templates: (parsed.templates || []).slice(0, 2),
          rubricScores: parsed.rubricScores || {}
        };
      }

      // Fallback scoring
      return this.generateFallbackDebrief(userResponses, config.rubric);
    } catch (error) {
      console.error('Debrief generation error:', error);
      return this.generateFallbackDebrief(userResponses, config.rubric);
    }
  }

  // Fallback debrief if AI fails
  private generateFallbackDebrief(userText: string, rubric: Record<string, string>): DebriefResult {
    const wordCount = userText.split(/\s+/).length;
    const hasTime = /\d+\s*(AM|PM|am|pm|hours?|mins?|today|tomorrow)/i.test(userText);
    const hasDate = /\d{1,2}[-/]\d{1,2}|monday|tuesday|wednesday|thursday|friday/i.test(userText);
    
    let score = 2; // Default to basic
    if (wordCount < 50 && hasTime) score = 3;
    if (wordCount > 150) score = 1;

    return {
      score,
      evidenceQuotes: [userText.substring(0, 80) + '...'],
      strengths: ['You provided a response'],
      improvements: [
        'Be more concise (aim for ≤5 lines)',
        'Add specific dates and owners'
      ],
      exemplarRewrite: 'BLUF: [Decision ask]. Risk if delayed: [specific risk]. Next: [owner] will [action] by [date]. Please confirm by [time].',
      microHabit: 'Start every message with the ask',
      templates: [
        'BLUF: Approve [X] by [time] to hit [goal].',
        'Risk if we wait: [specific impact]. Next: [owner] ships [action] by [date].'
      ],
      rubricScores: Object.keys(rubric).reduce((acc, key) => {
        acc[key] = Math.random() > 0.5; // Random for fallback
        return acc;
      }, {} as Record<string, boolean>)
    };
  }

  // Generate practice variant (harder version)
  async generatePracticeVariant(
    momentKey: string,
    variantType: 'harder' | 'easier' | 'alternative'
  ): Promise<{ caselet: string; roleplayConfig: any }> {
    const config = MOMENT_PROMPTS[momentKey];
    if (!config) {
      throw new Error('Invalid moment key');
    }

    const prompt = `Create a ${variantType} variant of this manager training scenario:

Original: ${config.caselet}

For a ${variantType} variant:
- Harder: Add time pressure, conflicting stakeholder, or missing info
- Easier: Simplify constraints, single stakeholder, clear path
- Alternative: Different context but same skill

Keep caselet ≤180 words. Maintain India corporate context.

Respond in JSON:
{
  "caselet": "new scenario text",
  "stakeholderPersona": "updated persona if needed"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          caselet: parsed.caselet || config.caselet,
          roleplayConfig: {
            ...config.roleplayConfig,
            stakeholderPersona: parsed.stakeholderPersona || config.roleplayConfig.stakeholderPersona
          }
        };
      }
    } catch (error) {
      console.error('Variant generation error:', error);
    }

    // Fallback: return original with note
    return {
      caselet: config.caselet + ' [Variant generation in progress]',
      roleplayConfig: config.roleplayConfig
    };
  }

  // Get peer examples (anonymized)
  async generatePeerExample(momentKey: string, score: number): Promise<string> {
    const config = MOMENT_PROMPTS[momentKey];
    if (!config) return '';

    const prompt = `Generate an anonymized peer example for the "${momentKey}" scenario that scored ${score}/4.

Scenario: ${config.caselet}

Create a realistic example response (≤80 words) that demonstrates a score of ${score}.
Make it feel authentic to India corporate culture.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().substring(0, 240);
    } catch (error) {
      console.error('Peer example generation error:', error);
      return 'Example generation in progress...';
    }
  }
}

export const momentsService = new MomentsService();
