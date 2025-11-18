import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 6-Stage Manager Moments Templates - Spec Compliant
const MOMENT_TEMPLATES: Record<string, any> = {
  'bluf-your-message': {
    cluster: 'Communication',
    
    // Step 1: Situation (4-6 lines, 1 ambiguity, 1 pressure, learning objective, actionable task)
    situation: `You need a concise update that drives a decision on Q4 analytics tool budget today. Stakeholders have 2 minutes max.
One key risk exists if we delay; one next step is ready if approved.
Objective: drive a binary yes/no now.
Ask: Write a 3-5 line BLUF that includes: decision ask with a time, one named risk, one next step with owner/date. Keep to <=5 lines.`,
    
    safetyFraming: "This is practice. Real stakeholders expect clarity, not perfection. Focus on the decision, risk, and next step—everything else is noise.",
    
    // Step 2: Stakeholder variants (1-2 lines each, ends with question)
    stakeholderVariants: [
      { role: 'Manager', prompt: 'I have 2 minutes. What do you need from me now?' },
      { role: 'Peer', prompt: 'Cut the fluff—what is the ask and by when?' },
      { role: 'Exec', prompt: 'What is the risk if we delay this decision by 24 hours?' }
    ],
    
    roleplayConfig: {
      expectedTurns: 3,
      maxReplyWords: 60,
      persona: 'Busy, decision-focused, values brevity and clarity'
    },
    
    // Step 4: Rubric (5 items, pass = 4/5)
    rubric: {
      hasBLUF: 'Starts with bottom-line-up-front statement',
      hasDecisionAskWithTime: 'Clear decision ask with specific time',
      includesSingleRisk: 'Names one specific risk if delayed',
      nextStepOwnerDate: 'Next step has owner and date',
      brevity: 'Message is <=5 lines'
    },
    
    // Step 5: Ideal response template
    idealResponse: {
      slack: `BLUF: Approve analytics tool budget (₹8L) to hit Q4 launch.
Risk if we wait 24h: ₹2L vendor discount expires.
Next: Finance locks contract by 3 PM if approved.
Ask: Please confirm by 2:45 PM.`,
      rationale: 'Binary decision, names risk, dates the next move.'
    }
  },
  
  'slack-chaos-into-signal': {
    cluster: 'Communication',
    
    situation: `Your Slack channel on product launch has scattered threads (bugs, asks, FYIs). Decisions are unclear and owners are missing.
Objective: convert noise into decisions, owners, and dates.
Ask: Write a 5-6 line channel summary with clusters (Decisions/In progress/Blockers), explicit owners/dates, one decision ask with a time, and links to 2-3 source messages.`,
    
    safetyFraming: "Messy threads are normal. Your job is to create clarity, not judge the chaos. Focus on decisions, owners, and dates.",
    
    stakeholderVariants: [
      { role: 'Manager', prompt: 'What is the current status and who owns what?' },
      { role: 'Peer', prompt: 'Which items are blocking vs. nice-to-have?' },
      { role: 'PM', prompt: 'What decision do we need, and by when?' }
    ],
    
    roleplayConfig: {
      expectedTurns: 3,
      maxReplyWords: 60,
      persona: 'Needs quick status, wants to know blockers and owners'
    },
    
    rubric: {
      hasClusters: 'Groups into Decisions/In progress/Blockers',
      ownersAndDates: 'Every item has owner and date',
      decisionAskWithTime: 'One decision ask with time',
      includesLinks: 'Links to 2-3 source messages',
      blockersPrioritized: 'Blockers listed first'
    },
    
    idealResponse: {
      slack: `Signal summary: product-launch
Decisions: A) API scope by 2 PM, owner @dev. B) Marketing copy by EOD, owner @pmm.
In progress: Bug fixes (@qa, Thu), vendor integration (@eng, Fri).
Blockers: QA env down → escalate via @infra.
Sources: thread1, thread2. I will post a recap daily at 4 PM.`,
      rationale: 'Converts noise to decisions, owners, dates, and links.'
    }
  },
  
  'repair-note-after-misstep': {
    cluster: 'Communication',
    
    situation: `You missed an expectation on client deck delivery, creating impact for sales team. Trust dipped.
Objective: repair trust with ownership, change, and verification.
Ask: Write a 4-6 line note that includes: incident and impact (owned), specific change made, evidence/action taken today, prevention/guardrail, and a check-in date.`,
    
    safetyFraming: "Mistakes happen. Owning them builds trust faster than perfection. Focus on impact, change, and verification.",
    
    stakeholderVariants: [
      { role: 'Manager', prompt: 'We cannot repeat this. How will you prevent it next time?' },
      { role: 'Peer', prompt: 'It created extra work—what is changing now?' },
      { role: 'Client', prompt: 'I need assurance this will not happen again.' }
    ],
    
    roleplayConfig: {
      expectedTurns: 3,
      maxReplyWords: 60,
      persona: 'Wants accountability and prevention plan'
    },
    
    rubric: {
      ownsImpact: 'Names impact without defensiveness',
      statesSpecificChange: 'Specific change made (not vague promise)',
      includesEvidenceToday: 'Evidence or action taken today',
      preventionDefined: 'Clear prevention/guardrail stated',
      followUpDated: 'Follow-up date included'
    },
    
    idealResponse: {
      email: `I missed Friday deadline for client deck, which caused sales to reschedule Monday pitch—that is on me.
I have changed my Friday review to 2 PM hard stop; today I added calendar blocks for all client deliverables.
To prevent recurrence, I will send 24h-ahead confirmations to stakeholders.
Let us review outcomes on next Friday; I will send a brief before then.`,
      rationale: 'Names impact, shows change now, and commits to verification.'
    }
  },

  // Additional Communication moments
  'stakeholder-update': {
    cluster: 'Communication',
    situation: `Your Q4 product launch is 2 weeks away. Original timeline was 6 weeks, but scope increased by 30%. The VP of Product wants a status update before tomorrow's board meeting.
Objective: Provide executive-level clarity on status, variance, and decision needs.
Ask: Write a 4-5 line update with topline status, quantified variance, business impact, decision ask with options, and next steps with owners/dates.`,
    safetyFraming: "Executives value clarity over completeness. Lead with status, variance, and what you need from them.",
    stakeholderVariants: [
      { role: 'VP of Product', prompt: 'Give me the update. What do I need to know for the board?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Executive, time-constrained, needs topline status and decision clarity' },
    rubric: {
      toplineStatus: 'Starts with clear status',
      quantifiedVariance: 'Includes specific metrics',
      decisionAsk: 'Clear decision ask with options',
      impactStated: 'States business impact',
      nextSteps: 'Next steps with owners and dates'
    },
    idealResponse: { slack: `Status: At risk. Launch delayed 1 week due to 30% scope increase. Decision needed: Cut analytics to hit Nov 15, or full scope by Nov 22. Next: Finalize scope with eng by EOD.`, rationale: 'Topline status, quantified variance, options.' }
  },

  'difficult-conversation': {
    cluster: 'Communication',
    situation: `A senior team member has been interrupting others in meetings and dismissing junior engineers' ideas. Two team members privately mentioned feeling unheard.
Objective: Address behavior using SBI framework while preserving the relationship.
Ask: Prepare a 4-5 line conversation opener using Situation-Behavior-Impact, specific examples, focus on behavior not character, invite their perspective.`,
    safetyFraming: "Difficult conversations preserve relationships when done with care. Focus on specific behavior, not character.",
    stakeholderVariants: [
      { role: 'Senior Team Member', prompt: 'You wanted to talk?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Defensive initially, values directness' },
    rubric: {
      usesSBI: 'Uses Situation-Behavior-Impact framework',
      specificExamples: 'Provides specific examples',
      focusesBehavior: 'Focuses on behavior, not character',
      invitesDialogue: 'Invites their perspective',
      statesExpectation: 'States clear expectation'
    },
    idealResponse: { verbal: `In yesterday's sprint planning, I noticed you interrupted Priya twice. She seemed hesitant to continue. I value your expertise, and I also want everyone to feel heard. What is your take? Let us ensure everyone finishes their thoughts.`, rationale: 'SBI framework, specific, behavior-focused.' }
  },

  'stakeholder-bad-news': {
    cluster: 'Communication',
    situation: `Your team's API integration project will miss the deadline by 3 weeks due to unexpected vendor delays. Marketing has already announced the feature launch to customers.
Objective: Deliver bad news early with options and mitigation.
Ask: Write a 4-6 line message with bad news upfront, brief root cause, 2-3 options with trade-offs, mitigation already underway.`,
    safetyFraming: "Bad news shared early with options builds more trust than delayed perfection.",
    stakeholderVariants: [
      { role: 'CTO', prompt: 'This is going to impact our customer commitments. What are our options?' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Frustrated but solution-focused' },
    rubric: {
      leadsWithNews: 'Delivers bad news upfront',
      providesContext: 'Explains root cause briefly',
      offersOptions: 'Presents 2-3 options with trade-offs',
      ownsMitigation: 'States mitigation underway',
      asksForDecision: 'Clear ask for decision'
    },
    idealResponse: { email: `API integration will miss deadline by 3 weeks (vendor delays). Options: (A) Launch with manual workaround, (B) Delay launch 3 weeks, (C) Partial launch. We are working on workaround prototype. Need decision by EOD.`, rationale: 'Bad news first, options, mitigation stated.' }
  },

  'difficult-performance-conversation': {
    cluster: 'Communication',
    situation: `A team member has missed 3 consecutive sprint commitments, causing delays for dependent teams. Their code quality has also declined.
Objective: Address performance with clear expectations and support.
Ask: Prepare a 5-6 line conversation with specific evidence and dates, impact on team, clear expectations, specific support offered.`,
    safetyFraming: "Performance conversations are growth opportunities. Be specific, supportive, and clear about expectations.",
    stakeholderVariants: [
      { role: 'Team Member', prompt: 'I know I have been struggling lately...' }
    ],
    roleplayConfig: { expectedTurns: 3, maxReplyWords: 60, persona: 'Anxious, wants to improve' },
    rubric: {
      specificEvidence: 'Cites specific examples with dates',
      statesImpact: 'Explains impact on team',
      setsExpectations: 'Clear expectations for improvement',
      offersSupport: 'Offers specific support',
      agreesOnPlan: 'Agrees on action plan'
    },
    idealResponse: { verbal: `I want to discuss sprint performance. In the last 3 sprints, you missed commitments on auth module, causing QA delays. I need you to hit sprint commitments. I can offer pairing sessions with Rahul. Let us create a plan and check in weekly on Fridays.`, rationale: 'Specific dates, impact stated, support offered.' }
  },

  // Organization cluster (7 moments)
  'managing-priorities': {
    cluster: 'Organization',
    situation: `You have 3 urgent requests today: (1) Fix production bug affecting 20% of users, (2) Prepare slides for tomorrow's executive demo, (3) Review architecture for next quarter's roadmap (due EOD). Each needs 4 hours. You have 8 hours.
Objective: Triage using Must/Should/Could framework with transparent trade-offs.
Ask: Write a 4-5 line prioritization plan using Must/Should/Could, explain trade-offs, recommend a path with reasoning, name risks of deprioritized items.`,
    safetyFraming: "You cannot do everything. Transparent trade-offs help stakeholders make informed decisions.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'Walk me through how you are prioritizing these.' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Needs to understand trade-offs and your reasoning' },
    rubric: { usesMustShouldCould: 'Categorizes using Must/Should/Could', explainsTradeoffs: 'Explains impact of each choice', recommendsPath: 'Recommends a path with reasoning', identifiesRisks: 'Names risks of deprioritized items', asksForInput: 'Asks for input or alignment' },
    idealResponse: { slack: `Must: Fix prod bug (20% users impacted). Should: Exec demo slides (can delegate to Priya). Could: Architecture review (can push to tomorrow). Trade-off: Delaying arch review risks Q1 planning timeline. Recommend: I fix bug (4h), Priya does slides (2h), I do arch review tomorrow. Risk: Arch review delayed 1 day. Does this work?`, rationale: 'Must/Should/Could, trade-offs explained, recommendation with reasoning.' }
  },

  'weekly-plan-that-sticks': {
    cluster: 'Organization',
    situation: `You have 5 focus-heavy tasks this week: 2 design docs (4 hours each), 3 code reviews (2 hours each), 1 team presentation (3 hours prep), plus daily standups and Slack. Last week, urgent requests derailed your plan by Wednesday.
Objective: Create predictable plans with outcomes, focus blocks, and urgent paths.
Ask: Write a 5-6 line weekly plan with outcomes (not just tasks), specific focus blocks, buffer for urgent requests, urgent escalation path, and end-of-week review.`,
    safetyFraming: "A good plan balances focus time with responsiveness. Build in buffers for the unexpected.",
    stakeholderVariants: [{ role: 'Peer', prompt: 'Show me your plan. How are you protecting focus time?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Supportive, asks clarifying questions about feasibility' },
    rubric: { identifiesOutcomes: 'Lists outcomes, not just tasks', blocksFocusTime: 'Schedules specific focus blocks', buildsInBuffer: 'Includes buffer for urgent requests', definesUrgentPath: 'States how to reach you for urgent items', includesReview: 'Plans end-of-week review' },
    idealResponse: { doc: `Outcomes: Ship design docs (auth, payments), complete 3 code reviews, deliver team presentation. Focus blocks: Mon/Wed/Fri 9-12 PM (design docs), Tue/Thu 2-4 PM (code reviews). Buffer: 1 hour daily for urgent Slack/meetings. Urgent path: Ping me on Slack; I will respond within 2 hours during work hours. Review: Friday 4 PM—assess what shipped, adjust next week.`, rationale: 'Outcomes listed, focus blocks scheduled, buffer included.' }
  },

  'one-page-project-brief': {
    cluster: 'Organization',
    situation: `You are starting a new project to migrate the authentication system to OAuth2. It will take 6 weeks and involve 3 teams (Backend, Frontend, Security). Your manager wants a one-page brief before kickoff.
Objective: Align teams on goals, scope, owners, timeline, and risks before building.
Ask: Write a 6-8 line brief with clear goal and success criteria, scope with in/out boundaries, owners for each workstream, timeline with key milestones, and top 3 risks with mitigation.`,
    safetyFraming: "Alignment before execution prevents rework. A one-pager forces clarity.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'Walk me through the brief. What are the key risks?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Wants clarity on scope, risks, and dependencies' },
    rubric: { statesGoal: 'Clear goal and success criteria', definesScope: 'Scope with in/out boundaries', identifiesOwners: 'Owners for each workstream', includesTimeline: 'Timeline with key milestones', listsRisks: 'Top 3 risks with mitigation' },
    idealResponse: { doc: `Goal: Migrate auth to OAuth2 for improved security. Success: 100% users migrated, zero downtime. Scope: In—OAuth2 integration, user migration. Out—SSO for enterprise. Owners: Backend (Rahul), Frontend (Priya), Security (Amit). Timeline: Week 1-2 (design), Week 3-4 (dev), Week 5 (testing), Week 6 (migration). Risks: (1) Vendor API changes (mitigation: weekly vendor sync), (2) User migration errors (mitigation: phased rollout), (3) Timeline slip (mitigation: weekly check-ins).`, rationale: 'Goal clear, scope defined, owners named, timeline with milestones.' }
  },

  'personal-operating-system': {
    cluster: 'Organization',
    situation: `You feel overwhelmed by scattered tasks across Slack, email, Jira, and handwritten notes. Things slip through the cracks. You want to build a personal system for capturing tasks, planning your week, executing with focus, and reviewing progress.
Objective: Build repeatable systems for capture, planning, execution, and review.
Ask: Design a 5-6 line personal operating system with single inbox for all inputs, weekly planning ritual, daily execution blocks, weekly review cadence, and specific tools chosen (not too many).`,
    safetyFraming: "Systems reduce cognitive load. Build repeatable habits for capture, planning, and execution.",
    stakeholderVariants: [{ role: 'Coach', prompt: 'What is your biggest challenge right now with staying organized?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Supportive, asks about your current pain points and habits' },
    rubric: { captureSystem: 'Single inbox for all inputs', planningRitual: 'Weekly planning ritual defined', executionBlocks: 'Daily execution blocks scheduled', reviewCadence: 'Weekly review cadence', toolsChosen: 'Specific tools chosen (not too many)' },
    idealResponse: { doc: `Capture: All tasks go into Notion inbox (Slack, email, meetings). Planning: Sunday 6 PM—review inbox, prioritize top 3 Must items for the week. Execution: Daily 9-12 PM focus blocks for Must items, 2-4 PM for Should items. Review: Friday 4 PM—assess what shipped, what slipped, adjust next week. Tools: Notion (tasks), Google Calendar (time blocks), Slack (communication).`, rationale: 'Single inbox, weekly planning, daily execution, weekly review.' }
  },

  'task-prioritization': {
    cluster: 'Organization',
    situation: `You have 23 tasks scattered across Jira (8 tickets), Slack saved items (7), email flags (5), and sticky notes (3). Some are urgent, some are waiting on others, some are unclear. You need to consolidate them.
Objective: Consolidate scattered tasks into single source of truth with status groups.
Ask: Write a 4-5 line consolidation plan with single tool/list, status groups (To Do / In Progress / Blocked / Done), blocked items clearly marked, top 3 priorities highlighted, and owners for delegated items.`,
    safetyFraming: "Chaos is normal. Consolidation and status grouping create clarity.",
    stakeholderVariants: [{ role: 'Peer', prompt: 'How are you organizing all of this?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Curious about your system, wants to learn' },
    rubric: { singleSource: 'Consolidates into one tool/list', statusGroups: 'Groups by status', identifiesBlockers: 'Clearly marks blocked items', prioritizesTop3: 'Highlights top 3 priorities', includesOwners: 'Adds owners for delegated items' },
    idealResponse: { doc: `Consolidating all 23 tasks into Notion board. Status groups: To Do (12), In Progress (5), Blocked (3—waiting on vendor, design, legal), Done (3). Top 3 priorities: (1) Fix prod bug (me, today), (2) Ship design doc (me, Thu), (3) Code review (Priya, Fri). Delegated: 2 tasks to Rahul. Blockers escalated to manager.`, rationale: 'Single source, status groups, blockers marked, top 3 highlighted.' }
  },

  'task-brain-dump': {
    cluster: 'Organization',
    situation: `You are feeling mentally overloaded. You have a dozen tasks swirling in your head, causing anxiety and preventing focus. You need to do a brain dump to get everything out.
Objective: Externalize mental load and create traction on top 3 Must items.
Ask: Do a brain dump (list all tasks, even small ones), categorize into Must/Should/Could, select top 3 Must items, define next action for each Must item, and set timeframe for Must items.`,
    safetyFraming: "Your brain is for thinking, not storage. Externalize to create mental space.",
    stakeholderVariants: [{ role: 'Coach', prompt: 'Tell me everything on your mind right now. Just list it out.' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Supportive, helps you prioritize and gain clarity' },
    rubric: { completeDump: 'Lists all tasks, even small ones', categorizesItems: 'Groups into Must/Should/Could', identifiesTop3: 'Selects top 3 Must items', statesNextAction: 'Defines next action for each Must item', setsTimeframe: 'Sets timeframe for Must items' },
    idealResponse: { doc: `Brain dump: Fix prod bug, design doc, code review, team presentation, 1-on-1s, Slack backlog, email inbox, expense report, team offsite planning, performance reviews, vendor meeting, architecture review. Must: (1) Fix prod bug, (2) Design doc, (3) Code review. Should: Team presentation, 1-on-1s. Could: Expense report, team offsite. Top 3 Must: (1) Fix prod bug (next: identify root cause, today), (2) Design doc (next: outline structure, by Thu), (3) Code review (next: review PR, by Fri).`, rationale: 'Complete dump, categorized, top 3 selected, next actions defined.' }
  },

  'priority-triage': {
    cluster: 'Organization',
    situation: `You have 3 conflicting requests: (1) VP wants a feature demo by Friday, (2) Customer escalation needs immediate fix, (3) Tech debt refactor is blocking next sprint. You can only do 2 well.
Objective: Present viable options with trade-offs and recommend path to protect goals.
Ask: Write a 4-5 line triage with 2-3 viable options, trade-offs for each option, recommended path with reasoning, impact of deprioritized items, and ask for decision or guidance.`,
    safetyFraming: "Conflicting priorities need transparent trade-off analysis. Present options, recommend a path.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'What are our options here?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Needs to understand trade-offs and your recommendation' },
    rubric: { presentsOptions: 'Presents 2-3 viable options', explainsTradeoffs: 'Explains trade-offs for each option', recommendsPath: 'Recommends a path with reasoning', statesImpact: 'States impact of deprioritized items', asksForDecision: 'Asks for decision or guidance' },
    idealResponse: { slack: `Options: (A) Customer fix + VP demo (tech debt delayed 1 sprint), (B) Customer fix + tech debt (VP demo delayed to next week), (C) VP demo + tech debt (customer escalation delayed 2 days). Trade-offs: (A) Next sprint blocked, (B) VP disappointed, (C) Customer churn risk. Recommend: Option A—customer fix + VP demo. Reasoning: Customer retention > sprint velocity. Impact: Tech debt delayed 1 sprint. Need your call by EOD.`, rationale: 'Options presented, trade-offs explained, recommendation with reasoning.' }
  },

  // Collaboration cluster (3 moments)
  'cross-team-collaboration': {
    cluster: 'Collaboration',
    situation: `You are starting a 3-month project with the Data Engineering team. You need their pipeline ready in 6 weeks to unblock your API work. You need to set up a collaboration framework.
Objective: Align on outcomes, roles, dependencies, and cadence with partner teams.
Ask: Write a 5-6 line collaboration framework with shared outcomes and success criteria, roles and responsibilities, dependencies and handoffs, communication cadence (standups, syncs), and escalation path for blockers.`,
    safetyFraming: "Cross-team work needs explicit alignment on outcomes, roles, and cadence.",
    stakeholderVariants: [{ role: 'Data Engineering Lead', prompt: 'Let us align on how we will work together. What do you need from us?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Collaborative, wants clear expectations and communication' },
    rubric: { alignsOnOutcomes: 'Aligns on shared outcomes and success criteria', definesRoles: 'Defines roles and responsibilities', identifiesDependencies: 'Identifies dependencies and handoffs', setsCadence: 'Sets communication cadence', establishesEscalation: 'Establishes escalation path for blockers' },
    idealResponse: { doc: `Shared outcome: API ready for launch by Week 12. Success: API latency <200ms, 99.9% uptime. Roles: Data Eng (pipeline, data quality), API team (endpoints, integration). Dependencies: Pipeline ready by Week 6 (handoff: data schema + sample data). Cadence: Weekly sync (Mondays 10 AM), daily Slack updates in #api-data-collab. Escalation: Blockers escalated to both leads within 24 hours; joint decision by EOD.`, rationale: 'Shared outcomes, roles defined, dependencies identified, cadence set.' }
  },

  'boundary-setting': {
    cluster: 'Collaboration',
    situation: `You are working with a US-based team (9-hour time difference). They schedule meetings at 9 PM your time and expect Slack responses late at night. This is affecting your health and focus.
Objective: Protect work-life balance while maintaining trust and responsiveness.
Ask: Write a 4-5 line boundary-setting message with working hours stated clearly, reason explained (health, focus) without over-justifying, alternatives offered (async updates, recorded videos), urgent escalation path defined, and commitment to collaboration reassured.`,
    safetyFraming: "Boundaries protect your effectiveness. Set them clearly and offer alternatives.",
    stakeholderVariants: [{ role: 'US-based Manager', prompt: 'I want to make sure we can collaborate effectively across time zones.' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Understanding but needs to know how to reach you' },
    rubric: { statesBoundaries: 'States working hours clearly', explainsReason: 'Explains reason without over-justifying', offersAlternatives: 'Offers alternatives', definesUrgentPath: 'Defines urgent escalation path', maintainsTrust: 'Reassures commitment to collaboration' },
    idealResponse: { email: `I want to set clear working hours to maintain focus and health: 9 AM - 6 PM IST (11:30 PM - 8:30 AM PT). For collaboration, I can: (A) Record video updates for async viewing, (B) Send detailed Slack summaries by 6 PM IST, (C) Join meetings 7-8 AM IST (5:30-6:30 PM PT) twice a week. For urgent issues: Ping me on Slack; I will respond within 2 hours during work hours. I am committed to making this work—let us find a sustainable cadence.`, rationale: 'Boundaries stated, reason explained, alternatives offered, trust maintained.' }
  },

  'team-conflict': {
    cluster: 'Collaboration',
    situation: `Two team members are in conflict. Engineer A says Engineer B is not pulling their weight. Engineer B says Engineer A is micromanaging. The tension is affecting team morale.
Objective: De-escalate tension and move toward shared outcomes without taking sides.
Ask: Prepare a 5-6 line mediation approach with listening to each perspective without judgment, identifying shared goal or outcome, focusing on behavior not character, facilitating agreement on next steps, and setting follow-up check-in.`,
    safetyFraming: "Conflict is normal. Your role is to de-escalate and refocus on shared outcomes.",
    stakeholderVariants: [{ role: 'Both Team Members', prompt: 'We need to resolve this. What is going on?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Defensive, wants to be heard, needs neutral facilitation' },
    rubric: { listensToEach: 'Listens to each perspective without judgment', identifiesSharedGoal: 'Identifies shared goal or outcome', focusesBehavior: 'Focuses on behavior, not character', facilitatesAgreement: 'Facilitates agreement on next steps', setsFollowUp: 'Sets follow-up check-in' },
    idealResponse: { verbal: `I want to understand both perspectives. [To A]: What specific behaviors are you seeing? [To B]: What specific behaviors are you experiencing? Our shared goal: Ship the auth module by Friday. Let us focus on what behaviors will help us hit that goal. [To both]: What if we agree on: (1) Daily 15-min sync to align on tasks, (2) Clear task ownership in Jira, (3) Async updates in Slack for visibility. Let us try this for 1 week and check in next Friday.`, rationale: 'Listens to both, identifies shared goal, focuses on behavior, facilitates agreement.' }
  },

  // Growth cluster (3 moments)
  'building-confidence': {
    cluster: 'Growth',
    situation: `You have been struggling after a project failure. Your confidence is low, and you are avoiding taking initiative. You need to plan 3 small, controllable wins this week.
Objective: Regain momentum via small, controllable wins tied to measurable outcomes.
Ask: Identify 3 small, achievable wins this week, ensure they are within your control, tie them to measurable outcomes, set timeframe (this week), and plan how to build on success.`,
    safetyFraming: "Your brain is for thinking, not storage. Externalize to create mental space.",
    stakeholderVariants: [{ role: 'Coach', prompt: 'Tell me everything on your mind right now. Just list it out.' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Supportive, helps you identify achievable wins and build momentum' },
    rubric: { identifiesSmallWins: 'Identifies 3 small, achievable wins', ensuresControllable: 'Wins are within your control', tiesMeasurable: 'Ties to measurable outcomes', setsTimeframe: 'Sets timeframe (this week)', buildsOnSuccess: 'Plans how to build on success' },
    idealResponse: { doc: `Win 1: Ship 1 code review by Wednesday (measurable: PR approved and merged). Win 2: Complete design doc outline by Thursday (measurable: 5 sections drafted). Win 3: Lead 1 standup update by Friday (measurable: share progress on auth module). All within my control, no dependencies. Build on success: Next week, take on 1 medium-sized feature (2-day scope). Track wins in Notion to visualize progress.`, rationale: 'Small wins identified, controllable, measurable, timeframe set, build-on plan.' }
  },

  'receiving-feedback': {
    cluster: 'Growth',
    situation: `Your manager gave you feedback that your updates lack clarity and decision asks. You want to show that you have heard the feedback and are applying it.
Objective: Acknowledge, apply, and verify feedback with evidence and follow-up.
Ask: Respond with acknowledgment of feedback without defensiveness, state specific change you will make, provide evidence or example of application, ask for verification or follow-up, and set check-in date.`,
    safetyFraming: "Feedback is a gift. Acknowledge it, apply it, and verify improvement.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'I want to see acknowledgment and action plan, not defensiveness.' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Wants to see acknowledgment and action plan' },
    rubric: { acknowledges: 'Acknowledges feedback without defensiveness', statesSpecificChange: 'States specific change you will make', providesEvidence: 'Provides evidence or example of application', asksForVerification: 'Asks for verification or follow-up', setsCheckIn: 'Sets check-in date' },
    idealResponse: { email: `Thank you for the feedback on my updates. I hear that they lack clarity and decision asks. Specific change: I will use BLUF format (decision ask upfront, risk, next step with owner/date) for all updates starting today. Evidence: I just sent you a BLUF update on the Q4 analytics tool budget. Ask: Please review and let me know if this format works better. Check-in: Let us review my updates in our 1-on-1 next Friday.`, rationale: 'Acknowledges feedback, states specific change, provides evidence, asks for verification, sets check-in.' }
  },

  'taking-ownership': {
    cluster: 'Growth',
    situation: `You missed a deadline that impacted the sales team. Your manager is disappointed. You need to own the outcome, fix the issue, and prevent recurrence.
Objective: Own outcomes, fix issues, and prevent recurrence with verification.
Ask: Write a 4-5 line ownership message with acknowledgment of impact without defensiveness, specific root cause identified, fix already implemented or in progress, prevention plan stated, and verification or check-in offered.`,
    safetyFraming: "Ownership builds trust. Acknowledge impact, fix the issue, and prevent recurrence.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'This impacted the sales team. What happened and what are you doing about it?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Disappointed, wants accountability and prevention plan' },
    rubric: { acknowledgesImpact: 'Acknowledges impact without defensiveness', identifiesRootCause: 'Identifies specific root cause', statesFix: 'States fix already implemented or in progress', preventionPlan: 'States prevention plan', offersVerification: 'Offers verification or check-in' },
    idealResponse: { email: `I missed the Friday deadline for the client deck, which caused sales to reschedule Monday pitch—that is on me. Root cause: I underestimated design time and did not flag the risk early. Fix: I completed the deck over the weekend; sales has it now. Prevention: I will send 24h-ahead confirmations to stakeholders for all client deliverables. Verification: Let us review my delivery track record in our 1-on-1 next Friday.`, rationale: 'Acknowledges impact, identifies root cause, states fix, prevention plan, offers verification.' }
  },

  // Deadlines cluster (3 moments)
  'communicate-delay-trust': {
    cluster: 'Deadlines',
    situation: `You are going to miss a deadline on a client-facing feature. The marketing team has already announced the launch date. You need to communicate the delay without eroding trust.
Objective: Own delays, present mitigation, offer partial value, and drive decisions.
Ask: Write a 4-5 line delay communication with delay stated upfront with new date, root cause explained briefly, mitigation or partial value offered, impact on stakeholders acknowledged, and clear ask or decision needed.`,
    safetyFraming: "Delays happen. Communicate early, offer mitigation, and drive decisions.",
    stakeholderVariants: [{ role: 'Marketing Lead', prompt: 'We already announced this. How do we handle customer communication?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Frustrated, needs mitigation and customer communication plan' },
    rubric: { statesDelayUpfront: 'States delay upfront with new date', explainsRootCause: 'Explains root cause briefly', offersMitigation: 'Offers mitigation or partial value', acknowledgesImpact: 'Acknowledges impact on stakeholders', asksForDecision: 'Clear ask or decision needed' },
    idealResponse: { email: `The client-facing feature will miss the Nov 15 launch date; new date is Nov 22 (1 week delay). Root cause: Vendor API changes required additional integration work. Mitigation: We can launch core features (login, profile) on Nov 15; full feature set by Nov 22. Impact: Marketing will need to adjust customer communication. Ask: Please confirm if partial launch on Nov 15 works, or if we should delay full launch to Nov 22.`, rationale: 'Delay stated upfront, root cause explained, mitigation offered, impact acknowledged, ask clear.' }
  },

  'protect-deep-work': {
    cluster: 'Deadlines',
    situation: `You have a critical design doc due Friday that requires 8 hours of deep focus. Your calendar is full of meetings, and Slack is constantly pinging. You need to protect deep work time.
Objective: Set predictable availability with focus blocks and urgent paths.
Ask: Write a 4-5 line deep work protection plan with focus blocks scheduled (specific times), meetings declined or rescheduled, Slack status set with urgent path, stakeholders informed proactively, and commitment to responsiveness outside focus blocks.`,
    safetyFraming: "Deep work requires protection. Set focus blocks, inform stakeholders, and offer urgent paths.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'How are you protecting focus time while staying responsive?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Supportive, wants to ensure you hit the deadline' },
    rubric: { schedulesFocusBlocks: 'Schedules focus blocks (specific times)', declinesOrRescheduled: 'Declines or reschedules meetings', setsSlackStatus: 'Sets Slack status with urgent path', informsStakeholders: 'Informs stakeholders proactively', commitsResponsiveness: 'Commits to responsiveness outside focus blocks' },
    idealResponse: { slack: `I have a critical design doc due Friday that requires deep focus. Focus blocks: Wed/Thu/Fri 9 AM - 1 PM (no meetings, Slack off). Meetings: Declined or rescheduled to next week. Slack status: "Deep work—urgent only" (ping me for P0 issues; I will respond within 2 hours). Stakeholders: Informed via email. Responsiveness: I will be fully available 2-6 PM each day for questions, reviews, and syncs.`, rationale: 'Focus blocks scheduled, meetings declined, Slack status set, stakeholders informed, responsiveness committed.' }
  },

  'deadline-pushback': {
    cluster: 'Deadlines',
    situation: `Your manager wants you to deliver a complex feature in 2 weeks. You estimate it will take 4 weeks to do it right. Cutting corners will create tech debt and quality issues.
Objective: Present options with trade-offs when deadlines risk quality or burnout.
Ask: Write a 4-5 line pushback with realistic estimate stated with reasoning, trade-offs of rushing explained (quality, tech debt, burnout), 2-3 options presented (scope cut, timeline extension, partial delivery), recommended path with reasoning, and ask for decision.`,
    safetyFraming: "Unrealistic deadlines create tech debt and burnout. Present options with trade-offs.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'The business needs this in 2 weeks. What are our options?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Under pressure, needs options and trade-offs' },
    rubric: { statesRealisticEstimate: 'States realistic estimate with reasoning', explainsTradeoffs: 'Explains trade-offs of rushing', presentsOptions: 'Presents 2-3 options', recommendsPath: 'Recommends path with reasoning', asksForDecision: 'Asks for decision' },
    idealResponse: { email: `Realistic estimate: 4 weeks to deliver the feature with quality (includes testing, edge cases, documentation). Trade-offs of 2-week deadline: (1) Tech debt (shortcuts will slow future work), (2) Quality issues (higher bug rate), (3) Burnout risk. Options: (A) Cut scope (core features only, 2 weeks), (B) Extend timeline (full feature, 4 weeks), (C) Partial delivery (MVP in 2 weeks, full feature in 4 weeks). Recommend: Option C—MVP in 2 weeks, full feature in 4 weeks. Reasoning: Delivers business value early while maintaining quality. Need your call by EOD.`, rationale: 'Realistic estimate stated, trade-offs explained, options presented, recommendation with reasoning.' }
  },

  // Feedback cluster (3 moments)
  'close-the-loop-feedback': {
    cluster: 'Feedback',
    situation: `Your manager gave you feedback 2 weeks ago to improve your code review comments. You have been applying the feedback but have not closed the loop. You want to show progress.
Objective: Make progress visible with evidence and invite continued input.
Ask: Write a 3-4 line loop-closing message with acknowledgment of original feedback, specific actions taken with evidence, progress or outcome achieved, invitation for continued input or verification, and commitment to ongoing improvement.`,
    safetyFraming: "Closing the loop shows you value feedback. Make progress visible and invite continued input.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'How is the feedback application going?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Wants to see evidence of progress' },
    rubric: { acknowledgesOriginalFeedback: 'Acknowledges original feedback', statesActionsWithEvidence: 'States specific actions taken with evidence', showsProgress: 'Shows progress or outcome achieved', invitesContinuedInput: 'Invites continued input or verification', commitsOngoingImprovement: 'Commits to ongoing improvement' },
    idealResponse: { email: `Thank you for the feedback 2 weeks ago on improving my code review comments. Actions taken: I have been using the "Situation-Behavior-Impact" framework for all code reviews (see PRs #123, #456, #789). Progress: 3 engineers mentioned the comments are more actionable and less vague. Invitation: Please review my recent code review comments and let me know if they meet your expectations. Commitment: I will continue applying this framework and check in with you in our next 1-on-1.`, rationale: 'Acknowledges feedback, states actions with evidence, shows progress, invites input, commits improvement.' }
  },

  'handle-stinging-feedback': {
    cluster: 'Feedback',
    situation: `Your manager gave you harsh feedback in a team meeting: "Your updates are always late and unclear." You feel defensive and embarrassed. You need to respond professionally.
Objective: Respond professionally to harsh feedback without defensiveness.
Ask: Write a 3-4 line response with acknowledgment without defensiveness, request for specific examples or clarification, commitment to improvement with specific change, request for follow-up or verification, and professional tone maintained.`,
    safetyFraming: "Harsh feedback stings. Respond professionally, ask for specifics, and commit to improvement.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'I need you to take this feedback seriously.' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Frustrated, wants to see accountability' },
    rubric: { acknowledgesWithoutDefensiveness: 'Acknowledges without defensiveness', requestsSpecificExamples: 'Requests specific examples or clarification', commitsToImprovement: 'Commits to improvement with specific change', requestsFollowUp: 'Requests follow-up or verification', maintainsProfessionalTone: 'Maintains professional tone' },
    idealResponse: { email: `Thank you for the feedback. I hear that my updates are late and unclear. Request: Can you share 1-2 specific examples so I can understand the pattern better? Commitment: Starting today, I will send all updates by 5 PM using BLUF format (decision ask upfront, risk, next step with owner/date). Follow-up: Let us review my updates in our 1-on-1 next Friday to ensure I am on track.`, rationale: 'Acknowledges without defensiveness, requests specifics, commits to improvement, requests follow-up, professional tone.' }
  },

  'feedback-request': {
    cluster: 'Feedback',
    situation: `You want to improve your presentation skills. You need to request feedback from your manager in a way that makes it easy for them to respond.
Objective: Make specific, low-effort, time-bound requests for actionable feedback.
Ask: Write a 3-4 line feedback request with specific area or skill identified, specific question or focus area stated, low-effort format suggested (1-2 bullets, 5-min chat), time-bound request (by when), and appreciation expressed.`,
    safetyFraming: "Good feedback requests are specific, low-effort, and time-bound.",
    stakeholderVariants: [{ role: 'Manager', prompt: 'What specific feedback are you looking for?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Busy, wants to help but needs specificity' },
    rubric: { identifiesSpecificArea: 'Identifies specific area or skill', statesSpecificQuestion: 'States specific question or focus area', suggestsLowEffortFormat: 'Suggests low-effort format', timesBoundRequest: 'Time-bound request (by when)', expressesAppreciation: 'Expresses appreciation' },
    idealResponse: { email: `I want to improve my presentation skills, specifically around engaging executives in Q&A. Specific question: In my last presentation to the VP, did I handle the Q&A effectively, or did I miss opportunities to drive decisions? Format: 1-2 bullets or a 5-min chat works great. Timing: By Friday if possible. Appreciation: Thank you for taking the time to help me improve.`, rationale: 'Specific area identified, specific question stated, low-effort format suggested, time-bound, appreciation expressed.' }
  },

  // Wellbeing cluster (1 moment)
  'managing-stress-triggers': {
    cluster: 'Wellbeing',
    situation: `You are in a high-stress period with tight deadlines, difficult stakeholders, and personal challenges. You notice stress affecting your sleep, focus, and mood. You need tactics to protect output and health.
Objective: Protect output and health during high-stress situations with tactics and boundaries.
Ask: Write a 4-5 line stress management plan with stress triggers identified, immediate tactics to manage stress (breathing, breaks, exercise), boundaries set to protect health (sleep, work hours), support requested if needed, and commitment to self-care.`,
    safetyFraming: "Stress is normal. Protect your health and output with tactics and boundaries.",
    stakeholderVariants: [{ role: 'Coach', prompt: 'What is causing you the most stress right now?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Supportive, helps you identify tactics and boundaries' },
    rubric: { identifiesStressTriggers: 'Identifies stress triggers', statesImmediateTactics: 'States immediate tactics to manage stress', setsBoundaries: 'Sets boundaries to protect health', requestsSupport: 'Requests support if needed', commitsToSelfCare: 'Commits to self-care' },
    idealResponse: { doc: `Stress triggers: Tight deadlines, difficult stakeholders, personal challenges. Immediate tactics: (1) 5-min breathing breaks every 2 hours, (2) 30-min walk at lunch, (3) No work after 7 PM. Boundaries: 7-8 hours sleep non-negotiable, no weekend work unless P0. Support: I will ask my manager for help prioritizing if workload becomes unmanageable. Self-care: I will track stress levels daily and adjust tactics as needed.`, rationale: 'Stress triggers identified, immediate tactics stated, boundaries set, support requested, self-care committed.' }
  },

  // Team Dynamics cluster (1 moment)
  'decode-team-norms': {
    cluster: 'Team Dynamics',
    situation: `You joined a new team 2 weeks ago. You notice implicit norms around communication, decision-making, and conflict. Some norms feel unclear or unspoken. You want to decode them and propose a lightweight team contract.
Objective: Make implicit norms explicit and propose lightweight team contract.
Ask: Write a 4-5 line team norms proposal with observed norms listed (communication, decision-making, conflict), gaps or unclear areas identified, proposed norms or team contract suggested, invitation for team input or discussion, and commitment to iterate based on feedback.`,
    safetyFraming: "Implicit norms create confusion. Make them explicit and propose a lightweight team contract.",
    stakeholderVariants: [{ role: 'Team Lead', prompt: 'What norms have you observed so far?' }],
    roleplayConfig: { expectedTurns: 2, maxReplyWords: 60, persona: 'Open to discussion, wants team alignment' },
    rubric: { listsObservedNorms: 'Lists observed norms', identifiesGaps: 'Identifies gaps or unclear areas', proposesNorms: 'Proposes norms or team contract', invitesTeamInput: 'Invites team input or discussion', commitsToIterate: 'Commits to iterate based on feedback' },
    idealResponse: { doc: `Observed norms: (1) Communication—Slack for quick questions, email for decisions, (2) Decision-making—Manager has final say, (3) Conflict—Addressed 1-on-1, not in team meetings. Gaps: Unclear when to escalate blockers, unclear how to give feedback to peers. Proposed norms: (1) Escalate blockers within 24 hours, (2) Use SBI framework for peer feedback. Invitation: Let us discuss this in our next team meeting and iterate based on feedback. Commitment: I will draft a lightweight team contract based on our discussion.`, rationale: 'Observed norms listed, gaps identified, proposed norms suggested, team input invited, iteration committed.' }
  }
};

interface RubricScores {
  [key: string]: boolean;
}

interface DebriefResult {
  score: number; // 0-5
  right: string[]; // 2 bullets
  improve: string[]; // 2 bullets with micro-edits
  blindSpots: string[]; // 1-2 bullets
  rubricScores: RubricScores;
  exemplarRewrite: string; // <=90 words
  exemplarRationale: string; // 1 line
  microHabit: string; // <=15 words
  templates: string[]; // <=30 words each
}

export class MomentsAIService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Get moment template
  getMomentTemplate(momentId: string) {
    return MOMENT_TEMPLATES[momentId] || null;
  }

  // Deterministic rubric scoring
  scoreRubric(momentId: string, userResponse: string): RubricScores {
    const template = MOMENT_TEMPLATES[momentId];
    if (!template) return {};

    const rubric = template.rubric;
    const scores: RubricScores = {};
    const lowerResponse = userResponse.toLowerCase();

    // BLUF moment rubric checks
    if (momentId === 'bluf-your-message') {
      scores.hasBLUF = /^(bluf|decision|approve|need)/i.test(userResponse.trim());
      scores.hasDecisionAskWithTime = /\b(by|before|at)\s+\d{1,2}(:\d{2})?\s*(am|pm|AM|PM)?\b/.test(userResponse);
      scores.includesSingleRisk = /(risk|lose|miss|delay|cost)/i.test(lowerResponse);
      scores.nextStepOwnerDate = /\b(next|then|after).*\b(by|on|before)\b/.test(lowerResponse);
      scores.brevity = userResponse.split('\n').filter(l => l.trim()).length <= 5;
    }
    
    // Slack chaos rubric checks
    else if (momentId === 'slack-chaos-into-signal') {
      scores.hasClusters = /(decision|blocker|in progress|status)/i.test(lowerResponse);
      scores.ownersAndDates = /@\w+|owner/.test(lowerResponse) && /\b(by|on|before)\b/.test(lowerResponse);
      scores.decisionAskWithTime = /(decide|confirm|approve).*\b(by|before)\b/.test(lowerResponse);
      scores.includesLinks = /(thread|link|source|http)/i.test(lowerResponse);
      scores.blockersPrioritized = /blocker/i.test(userResponse.substring(0, userResponse.length / 2));
    }
    
    // Repair note rubric checks
    else if (momentId === 'repair-note-after-misstep') {
      scores.ownsImpact = /(on me|my fault|i missed|i caused)/i.test(lowerResponse);
      scores.statesSpecificChange = /(changed|added|implemented|now i)/i.test(lowerResponse);
      scores.includesEvidenceToday = /(today|this morning|already|just)/i.test(lowerResponse);
      scores.preventionDefined = /(prevent|guardrail|will|going forward)/i.test(lowerResponse);
      scores.followUpDated = /\b(review|check|follow.*up).*\b(on|by|next)\b/.test(lowerResponse);
    }

    return scores;
  }

  // Calculate total score from rubric (0-5)
  calculateScore(rubricScores: RubricScores): number {
    const passed = Object.values(rubricScores).filter(v => v).length;
    return Math.min(5, passed);
  }

  // Generate roleplay response (<=60 words)
  async generateRoleplayResponse(
    momentId: string,
    stakeholderRole: string,
    transcript: Array<{ role: string; content: string }>,
    turnCount: number
  ): Promise<{ reply: string; chips: { good: string[]; risky: string[] } }> {
    const template = MOMENT_TEMPLATES[momentId];
    if (!template) throw new Error('Invalid moment');

    const lastUserMsg = transcript.filter(t => t.role === 'user').pop()?.content || '';
    
    const prompt = `You are a ${stakeholderRole} in a roleplay. Persona: ${template.roleplayConfig.persona}

User said: "${lastUserMsg}"

Respond in character (max 60 words). ${turnCount === 1 ? 'Ask a clarifying question or push for specifics.' : turnCount === 2 ? 'Challenge or probe deeper.' : 'Give final reaction or decision.'}`;

    try {
      const result = await this.model.generateContent(prompt);
      const reply = result.response.text().substring(0, 300); // Enforce limit

      // Generate chips (max 12 words each)
      const chips = this.generateChips(lastUserMsg, template.rubric);

      return { reply, chips };
    } catch (error) {
      return {
        reply: 'Can you clarify your ask and timeline?',
        chips: { good: [], risky: [] }
      };
    }
  }

  // Generate real-time chips (<=12 words each)
  private generateChips(userResponse: string, rubric: any): { good: string[]; risky: string[] } {
    const good: string[] = [];
    const risky: string[] = [];

    if (/^(bluf|decision|approve)/i.test(userResponse.trim())) {
      good.push('Strong opening');
    }
    if (/\b(by|before|at)\s+\d{1,2}/.test(userResponse)) {
      good.push('Time-stamped ask');
    }
    if (userResponse.split('\n').length > 6) {
      risky.push('Too long—trim to 5 lines');
    }
    if (!/risk|impact|cost/i.test(userResponse)) {
      risky.push('Missing risk statement');
    }

    return { good: good.slice(0, 2), risky: risky.slice(0, 2) };
  }

  // Generate debrief with rubric scoring
  async generateDebrief(
    momentId: string,
    transcript: Array<{ role: string; content: string }>
  ): Promise<DebriefResult> {
    const template = MOMENT_TEMPLATES[momentId];
    if (!template) throw new Error('Invalid moment');

    const userResponses = transcript.filter(t => t.role === 'user').map(t => t.content).join('\n\n');
    const rubricScores = this.scoreRubric(momentId, userResponses);
    const score = this.calculateScore(rubricScores);

    const prompt = `Analyze this user response for a manager communication exercise:

USER RESPONSE:
${userResponses}

RUBRIC CHECKS:
${JSON.stringify(rubricScores, null, 2)}

Provide:
1. Two "Right" bullets (what worked, with evidence quotes)
2. Two "Improve" bullets (each with a specific micro-edit suggestion in quotes)
3. One "Blind spot" (what they missed)
4. One micro-habit (<=15 words, actionable)
5. Two copy-paste templates (<=30 words each)

Format as JSON:
{
  "right": ["...", "..."],
  "improve": ["... Micro-edit: '...'", "... Micro-edit: '...'"],
  "blindSpots": ["..."],
  "microHabit": "...",
  "templates": ["...", "..."]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        score,
        right: parsed.right || ['Clear intent', 'Attempted structure'],
        improve: parsed.improve || [
          'Add decision ask with time. Micro-edit: "Please confirm by 2:45 PM"',
          'Name specific risk. Micro-edit: "Risk: ₹2L discount expires"'
        ],
        blindSpots: parsed.blindSpots || ['Alternative path if decision is no'],
        rubricScores,
        exemplarRewrite: template.idealResponse.slack || template.idealResponse.email || '',
        exemplarRationale: template.idealResponse.rationale,
        microHabit: parsed.microHabit || 'Start every ask with BLUF',
        templates: parsed.templates || [
          'BLUF: [decision]. Risk: [risk]. Ask: confirm by [time].',
          'Decision needed: [what] by [when]. Impact if delayed: [impact].'
        ]
      };
    } catch (error) {
      // Fallback debrief
      return {
        score,
        right: ['Attempted to communicate clearly', 'Included some key elements'],
        improve: [
          'Add time-stamped decision ask. Micro-edit: "Please confirm by [time]"',
          'State one specific risk. Micro-edit: "Risk if delayed: [impact]"'
        ],
        blindSpots: ['Backup plan if answer is no'],
        rubricScores,
        exemplarRewrite: template.idealResponse.slack || template.idealResponse.email || '',
        exemplarRationale: template.idealResponse.rationale,
        microHabit: 'Always include: decision + risk + time',
        templates: [
          'BLUF: [ask]. Risk: [risk]. Confirm by [time].',
          'Need: [decision] by [when]. Impact: [what happens].'
        ]
      };
    }
  }

  // Generate harder variant
  async generateVariant(momentId: string, variantType: 'harder' | 'easier' | 'alternative'): Promise<any> {
    const template = MOMENT_TEMPLATES[momentId];
    if (!template) throw new Error('Invalid moment');

    const variantPrompts: Record<string, string> = {
      harder: 'Add more pressure: exec asks for alternative path if decision is no',
      easier: 'Reduce pressure: extend timeline by 24 hours',
      alternative: 'Change stakeholder: switch from manager to peer'
    };

    return {
      situation: template.situation + `\n\nVariant (${variantType}): ${variantPrompts[variantType]}`,
      stakeholderVariants: template.stakeholderVariants,
      rubric: template.rubric
    };
  }

  // Evaluate rewrite in practice loop
  evaluateRewrite(momentId: string, rewrite: string): { passed: boolean; rubricScores: RubricScores; score: number } {
    const rubricScores = this.scoreRubric(momentId, rewrite);
    const score = this.calculateScore(rubricScores);
    const passed = score >= 4; // Pass at 4/5

    return { passed, rubricScores, score };
  }
}

export const momentsAIService = new MomentsAIService();
