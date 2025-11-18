# Manager Moments - AI Prompt Templates

## Verbatim Templates Used in Production

### BLUF Your Message

**Situation (Step 1):**
```
You need a concise update that drives a decision on Q4 analytics tool budget today. Stakeholders have 2 minutes max.
One key risk exists if we delay; one next step is ready if approved.
Objective: drive a binary yes/no now.
Ask: Write a 3-5 line BLUF that includes: decision ask with a time, one named risk, one next step with owner/date. Keep to <=5 lines.
```

**Safety Framing:**
```
This is practice. Real stakeholders expect clarity, not perfection. Focus on the decision, risk, and next step—everything else is noise.
```

**Stakeholder Variants (Step 2):**
- Manager: "I have 2 minutes. What do you need from me now?"
- Peer: "Cut the fluff—what is the ask and by when?"
- Exec: "What is the risk if we delay this decision by 24 hours?"

**Rubric (Step 4):**
- hasBLUF: Starts with bottom-line-up-front statement
- hasDecisionAskWithTime: Clear decision ask with specific time
- includesSingleRisk: Names one specific risk if delayed
- nextStepOwnerDate: Next step has owner and date
- brevity: Message is <=5 lines

**Ideal Response (Step 5):**
```
BLUF: Approve analytics tool budget (₹8L) to hit Q4 launch.
Risk if we wait 24h: ₹2L vendor discount expires.
Next: Finance locks contract by 3 PM if approved.
Ask: Please confirm by 2:45 PM.
```

**Rationale:** Binary decision, names risk, dates the next move.

---

### Turn Slack Chaos into Signal

**Situation (Step 1):**
```
Your Slack channel on product launch has scattered threads (bugs, asks, FYIs). Decisions are unclear and owners are missing.
Objective: convert noise into decisions, owners, and dates.
Ask: Write a 5-6 line channel summary with clusters (Decisions/In progress/Blockers), explicit owners/dates, one decision ask with a time, and links to 2-3 source messages.
```

**Safety Framing:**
```
Messy threads are normal. Your job is to create clarity, not judge the chaos. Focus on decisions, owners, and dates.
```

**Stakeholder Variants (Step 2):**
- Manager: "What is the current status and who owns what?"
- Peer: "Which items are blocking vs. nice-to-have?"
- PM: "What decision do we need, and by when?"

**Rubric (Step 4):**
- hasClusters: Groups into Decisions/In progress/Blockers
- ownersAndDates: Every item has owner and date
- decisionAskWithTime: One decision ask with time
- includesLinks: Links to 2-3 source messages
- blockersPrioritized: Blockers listed first

**Ideal Response (Step 5):**
```
Signal summary: product-launch
Decisions: A) API scope by 2 PM, owner @dev. B) Marketing copy by EOD, owner @pmm.
In progress: Bug fixes (@qa, Thu), vendor integration (@eng, Fri).
Blockers: QA env down → escalate via @infra.
Sources: thread1, thread2. I will post a recap daily at 4 PM.
```

**Rationale:** Converts noise to decisions, owners, dates, and links.

---

### Write a Repair Note After a Misstep

**Situation (Step 1):**
```
You missed an expectation on client deck delivery, creating impact for sales team. Trust dipped.
Objective: repair trust with ownership, change, and verification.
Ask: Write a 4-6 line note that includes: incident and impact (owned), specific change made, evidence/action taken today, prevention/guardrail, and a check-in date.
```

**Safety Framing:**
```
Mistakes happen. Owning them builds trust faster than perfection. Focus on impact, change, and verification.
```

**Stakeholder Variants (Step 2):**
- Manager: "We cannot repeat this. How will you prevent it next time?"
- Peer: "It created extra work—what is changing now?"
- Client: "I need assurance this will not happen again."

**Rubric (Step 4):**
- ownsImpact: Names impact without defensiveness
- statesSpecificChange: Specific change made (not vague promise)
- includesEvidenceToday: Evidence or action taken today
- preventionDefined: Clear prevention/guardrail stated
- followUpDated: Follow-up date included

**Ideal Response (Step 5):**
```
I missed Friday deadline for client deck, which caused sales to reschedule Monday pitch—that is on me.
I have changed my Friday review to 2 PM hard stop; today I added calendar blocks for all client deliverables.
To prevent recurrence, I will send 24h-ahead confirmations to stakeholders.
Let us review outcomes on next Friday; I will send a brief before then.
```

**Rationale:** Names impact, shows change now, and commits to verification.

---

## AI Generation Prompts

### Roleplay Response Generation

**Prompt Template:**
```
You are a {stakeholderRole} in a roleplay. Persona: {persona}

User said: "{userMessage}"

Respond in character (max 60 words). {turnGuidance}

Turn 1: Ask a clarifying question or push for specifics.
Turn 2: Challenge or probe deeper.
Turn 3: Give final reaction or decision.
```

**Constraints:**
- Max 60 words
- Stay in character
- Match persona tone
- End with question or reaction

---

### Debrief Generation

**Prompt Template:**
```
Analyze this user response for a manager communication exercise:

USER RESPONSE:
{userResponses}

RUBRIC CHECKS:
{rubricScores}

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
}
```

**Constraints:**
- Evidence-based feedback only
- Specific micro-edits in quotes
- Supportive tone, not harsh
- Link to rubric checks

---

### Variant Generation

**Harder Variant:**
```
Original situation + "Variant (harder): Add more pressure: exec asks for alternative path if decision is no"
```

**Easier Variant:**
```
Original situation + "Variant (easier): Reduce pressure: extend timeline by 24 hours"
```

**Alternative Variant:**
```
Original situation + "Variant (alternative): Change stakeholder: switch from manager to peer"
```

---

## Chips Generation (Real-time Feedback)

**"What's Good" Examples:**
- "Strong opening"
- "Time-stamped ask"
- "Clear risk stated"
- "Owner named"

**"What's Risky" Examples:**
- "Too long—trim to 5 lines"
- "Missing risk statement"
- "No time specified"
- "Vague next step"

**Constraints:**
- Max 12 words each
- Max 2 per type
- Real-time as user types
- Actionable guidance

---

## Micro-Habit Examples

- "Start every ask with BLUF"
- "Always include: decision + risk + time"
- "Name owner and date for every next step"
- "Lead with impact, then prevention"
- "Cluster before you post"

**Constraints:**
- <=15 words
- Actionable
- Specific to moment
- Easy to remember

---

## Template Examples

**BLUF Templates:**
- "BLUF: [decision]. Risk: [risk]. Ask: confirm by [time]."
- "Decision needed: [what] by [when]. Impact if delayed: [impact]."

**Status Update Templates:**
- "Status: [on/at risk]. Blocker: [what] (owner [name]). Decision: [ask] by [time]."
- "Decisions: [A], [B]. In progress: [items]. Blockers: [list]."

**Repair Note Templates:**
- "I missed [what], causing [impact]—on me. Changed: [action]. Prevention: [guardrail]. Review: [date]."
- "Impact: [what happened]. Fix: [immediate change]. Prevent: [guardrail]. Follow-up: [when]."

**Constraints:**
- <=30 words each
- Copy-paste ready
- Bracket placeholders
- Channel-appropriate

---

## Length Enforcement

All AI responses enforce these limits programmatically:

| Element | Limit | Enforcement |
|---------|-------|-------------|
| Situation | 180 words | Template pre-written |
| Roleplay reply | 60 words | `.substring(0, 300)` |
| Exemplar | 90 words | Template pre-written |
| Chips | 12 words | Manual curation |
| Micro-habit | 15 words | Template guidance |
| Templates | 30 words | Template pre-written |

---

**Note:** These templates are verbatim from the production system. Do not modify without updating both `momentsAIService.ts` and this documentation.
