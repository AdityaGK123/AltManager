# Manager Moments - Implementation Guide

## Overview

Manager Moments is a 6-stage practice system for workplace communication skills. This implementation provides a production-ready foundation with 3 complete moments following the exact spec.

## 6-Stage Flow

### Step 1: Situation
- **Format:** 4-6 lines
- **Must include:** 1 ambiguity + 1 pressure + learning objective + actionable task
- **Example:** "It's 2:45 PM. You need approval for Q4 analytics tool budget..."

### Step 2: Stakeholder Comment
- **Format:** 1-2 lines ending with a question
- **Variants:** 2-3 role options (Manager, Peer, Exec)
- **Example:** "I have 2 minutes. What do you need from me now?"

### Step 3: User Response + Rationale
- **Format:** 3-6 lines with required elements
- **Must include:** owner, date/time, boundary, support ask
- **Rationale:** 1-2 lines explaining approach

### Step 4: Diagnosis
- **Format:** 2 "Right" + 2 "Improve" + 1-2 "Blind spots"
- **Rubric:** 5 boolean checks (pass = 4/5)
- **Improve bullets:** Each includes micro-edit suggestion in quotes

### Step 5: Ideal Response
- **Format:** 4-6 lines, channel-specific
- **Includes:** 1-line rationale
- **Optional:** Tone toggle (concise/formal/empathetic)

### Step 6: Practice Loop
- **Features:** Live rubric, 60-90s timer, harder variant unlock
- **Pass criteria:** 4/5 rubric checks

## Length Constraints (Enforced)

| Element | Limit |
|---------|-------|
| Situation/Caselet | ≤180 words |
| Roleplay replies | ≤60 words |
| Exemplar rewrite | ≤90 words |
| Chips | ≤12 words each |
| Micro-habit | ≤15 words |
| Templates | ≤30 words each |

## Implemented Moments

### 1. bluf-your-message
- **Cluster:** Communication
- **Focus:** Concise, decision-ready updates
- **Rubric:** hasBLUF, hasDecisionAskWithTime, includesSingleRisk, nextStepOwnerDate, brevity

### 2. slack-chaos-into-signal
- **Cluster:** Communication
- **Focus:** Convert messy threads to clarity
- **Rubric:** hasClusters, ownersAndDates, decisionAskWithTime, includesLinks, blockersPrioritized

### 3. repair-note-after-misstep
- **Cluster:** Communication
- **Focus:** Rebuild trust with accountability
- **Rubric:** ownsImpact, statesSpecificChange, includesEvidenceToday, preventionDefined, followUpDated

## API Endpoints

### Core Flow
```
POST /api/moments/:id/start
  → Returns: situation, safetyFraming, stakeholderPrompt, sessionId

POST /api/moments/:id/response
  Body: { sessionId, content }
  → Returns: reply, chips, turnCount, isComplete

POST /api/moments/:id/debrief
  Body: { sessionId }
  → Returns: score, right, improve, blindSpots, rubricScores, exemplarRewrite, microHabit, templates
```

### Practice Loop
```
POST /api/moments/:id/variant
  Body: { variantType: 'harder' | 'easier' | 'alternative' }
  → Returns: modified situation with increased pressure

POST /api/moments/:id/rewrite
  Body: { rewrite }
  → Returns: passed, score, rubricScores (live evaluation)
```

### Progress
```
GET /api/moments
  → Returns: all moments with user progress

GET /api/moments/:id/progress
  → Returns: attempts, scores, completion status
```

## Frontend Components

### MomentCard.tsx
- Summary card with start button
- Shows cluster, difficulty, progress
- Button-first interaction

### MomentRunner.tsx
- 6-stage modal flow
- Progressive reveal (one stage at a time)
- Mobile-first responsive

### DebriefPanel.tsx
- Displays Right/Improve/Blind spots
- Rubric checklist with visual checks
- Micro-edit buttons with copy-to-clipboard
- Exemplar with rationale
- Micro-habit and templates

### LiveRubricEditor.tsx
- Real-time rubric checks (flip green as user types)
- 60-90s countdown timer
- Live score display
- Pass/fail indication

## Rubric Scoring Logic

### Deterministic Checks (Boolean)
Each rubric item uses regex/heuristic checks:

```typescript
// Example: BLUF moment
hasBLUF: /^(bluf|decision|approve|need)/i.test(response)
hasDecisionAskWithTime: /\b(by|before|at)\s+\d{1,2}/.test(response)
includesSingleRisk: /(risk|lose|miss|delay|cost)/i.test(response)
```

### Score Calculation
- Each passed check = 1 point
- Total score = sum of passed checks (0-5)
- Pass threshold = 4/5

## Adding New Moments

### 1. Create Template in `momentsAIService.ts`

```typescript
'your-moment-id': {
  cluster: 'Communication',
  situation: `4-6 line situation with ambiguity + pressure...`,
  safetyFraming: "Supportive framing message",
  stakeholderVariants: [
    { role: 'Manager', prompt: 'Question ending with ?' },
    { role: 'Peer', prompt: 'Alternative question?' }
  ],
  roleplayConfig: {
    expectedTurns: 3,
    maxReplyWords: 60,
    persona: 'Stakeholder personality'
  },
  rubric: {
    check1: 'Description of check 1',
    check2: 'Description of check 2',
    check3: 'Description of check 3',
    check4: 'Description of check 4',
    check5: 'Description of check 5'
  },
  idealResponse: {
    slack: `4-6 line ideal response...`,
    rationale: '1-line why it works'
  }
}
```

### 2. Add Rubric Logic in `scoreRubric()`

```typescript
else if (momentId === 'your-moment-id') {
  scores.check1 = /regex/.test(lowerResponse);
  scores.check2 = /regex/.test(lowerResponse);
  // ... etc
}
```

### 3. Seed Database

```sql
INSERT INTO manager_moments (id, title, description, category)
VALUES ('your-moment-id', 'Your Moment Title', 'Description', 'Communication');
```

### 4. Update LiveRubricEditor

Add matching checks in the `useEffect` hook for live evaluation.

## UX Rules

### Mobile-First
- Progressive reveal (never show all steps)
- Touch-friendly targets (min 44x44px)
- Responsive breakpoints

### Button-First
- Default to quick responses
- Typing only for rewrites
- Copy-paste templates

### Chips
- Max 2 per type ("What's Good" / "What's Risky")
- ≤12 words each
- Real-time feedback

### Tone
- GenZ-friendly
- Supportive, not harsh
- Culturally sensitive (Indian workplace norms)

## Testing

### Unit Tests
```bash
# Backend rubric scoring
npm test server/tests/moments.controller.spec.ts
```

### Integration Tests
```bash
# Full flow: start → response → debrief
npm test server/tests/moments.integration.spec.ts
```

### E2E Tests
```bash
# Playwright UI tests
npx playwright test e2e/moments-flow.spec.ts
```

## Performance

- Quick replies: <500ms
- Heavy debriefs: Async with status updates
- Rate limits: Per user, per endpoint
- Input sanitization: Max lengths enforced

## Extension Points

### Add Remaining 27 Moments
1. Copy template structure from existing moments
2. Follow 6-stage spec exactly
3. Add deterministic rubric checks
4. Test with real users

### Add Analytics
```typescript
GET /api/analytics/moments/overview
  → attempts, scores, time-to-pass, practice cadence

GET /api/analytics/skill/:skillId
  → per-skill trend line, trophy levels
```

### Add Peer Examples
```typescript
GET /api/moments/:id/peer-examples
  → anonymized high-scoring responses
  → "Apply" quick-action button
```

## Deployment Checklist

- [ ] Run migrations: `node src/db/run-migration.js src/db/migrations/add_moments_tables_simple.sql`
- [ ] Seed moments: `node src/db/run-migration.js src/db/seed-moments.sql`
- [ ] Set env vars: `GEMINI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`
- [ ] Test all 3 moments end-to-end
- [ ] Verify rubric scoring accuracy
- [ ] Check mobile responsiveness
- [ ] Run E2E tests

## Support

For questions or issues:
1. Check this README
2. Review `momentsAIService.ts` for template examples
3. Test with existing moments first
4. Follow the 6-stage spec exactly

---

**Status:** Production-ready foundation with 3 complete moments
**Next:** Add remaining 27 moments following the same pattern
