# ALT Manager 2.0 - Implementation Roadmap

Based on the comprehensive redesign document received on October 11, 2025.

## Overview

This document outlines the systematic implementation of ALT Manager 2.0 enhancements, focusing on:
1. Manager Moments 2.0 with 5-step guided flow
2. Like/Save feature for AI recommendations
3. Kirkpatrick-based learning integration
4. 23 new Manager Moments content library
5. Enhanced progress tracking and peer learning

## Implementation Phases

### Phase 1: Database Schema Enhancements (Week 1)
**Status**: Ready to implement

#### 1.1 Enhanced Messages Table
- Add `isLiked` boolean field
- Add `savedAsReference` boolean field
- Extend metadata jsonb for workflow tracking

#### 1.2 New Saved Recommendations Table
```sql
CREATE TABLE saved_recommendations (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  message_id integer REFERENCES messages(id),
  content text NOT NULL,
  skill_area varchar(100),
  saved_at timestamp DEFAULT NOW(),
  applied_in_real_life boolean DEFAULT false,
  application_notes text,
  created_at timestamp DEFAULT NOW()
);
```

#### 1.3 Enhanced Manager Moments Table
- Add `why` text field (value proposition)
- Add `examples` jsonb field (communication templates)
- Add `skillFocus` jsonb array
- Add `rubric` jsonb field
- Add `frameworks` jsonb field
- Add `microHabit` text field
- Add `reflection` text field
- Add `peerExamples` jsonb field

#### 1.4 Enhanced User Moments Table
- Add `transcript` jsonb field (roleplay conversation)
- Add `attemptNumber` integer field
- Add `strengthsIdentified` jsonb array
- Add `improvementsNeeded` jsonb array

#### 1.5 New Peer Examples Table
```sql
CREATE TABLE peer_examples (
  id serial PRIMARY KEY,
  moment_id integer REFERENCES manager_moments(id),
  anonymized_response text NOT NULL,
  outcome varchar(50), -- 'successful' | 'learning_moment'
  context text,
  skills_demonstrated jsonb,
  created_at timestamp DEFAULT NOW()
);
```

### Phase 2: Backend API Enhancements (Week 2)

#### 2.1 New API Endpoints

**Like/Save Feature:**
- `POST /api/messages/:id/like` - Toggle like on message
- `POST /api/messages/:id/save` - Save as reference
- `GET /api/recommendations/saved` - Get user's saved recommendations
- `PATCH /api/recommendations/:id/applied` - Mark as applied in real life
- `POST /api/recommendations/:id/notes` - Add application notes

**Enhanced Manager Moments:**
- `GET /api/moments/:id/caselet` - Get moment caselet with artifacts
- `POST /api/moments/:id/roleplay` - Submit roleplay turn, get persona response
- `POST /api/moments/:id/evaluate` - Evaluate complete roleplay transcript
- `GET /api/moments/:id/peer-examples` - Get peer learning examples
- `POST /api/moments/:id/practice-again` - Start variant practice
- `GET /api/moments/:id/frameworks` - Get applicable frameworks
- `GET /api/moments/:id/templates` - Get communication templates

**Progress Tracking:**
- `GET /api/progress/journey` - Get skill development journey
- `GET /api/progress/competence-level` - Get current competence assessment
- `POST /api/progress/self-report` - Submit real-world application report

#### 2.2 Enhanced AI Service

**New Methods:**
```typescript
// Roleplay persona responses with escalation logic
generatePersonaResponse(transcript, momentContext, turnNumber): Promise<PersonaResponse>

// Evidence-based evaluation with rubric
evaluateRoleplay(transcript, rubric, learningObjectives): Promise<Evaluation>

// Generate micro-habit from user transcript
generateMicroHabit(transcript, skillArea): Promise<string>

// Peer example generation (anonymized)
generatePeerExample(momentId, userResponses): Promise<PeerExample>
```

### Phase 3: Frontend UI Enhancements (Week 3)

#### 3.1 Enhanced Chat Interface

**Components to Create:**
- `MessageLikeButton.tsx` - Like/save functionality
- `SavedRecommendations.tsx` - Display saved items
- `ApplicationTracker.tsx` - Track real-world application
- `RecommendationCard.tsx` - Individual saved recommendation

**Updates to Existing:**
- `ChatPage.tsx` - Add like buttons to assistant messages
- `HomePage.tsx` - Show saved recommendations widget

#### 3.2 Manager Moments 2.0 Components

**New Components:**
- `PsychologicalSafetyFrame.tsx` - Entry screen with safety messaging
- `CaseletView.tsx` - Scenario + artifact display (≤180 words)
- `RoleplayInterface.tsx` - Interactive 3-5 turn practice
- `FeedbackChips.tsx` - "What's Good" / "What's Risky" chips
- `EvidenceBasedDebrief.tsx` - Score + quotes + improvements
- `PeerExamples.tsx` - Community learning examples
- `FrameworkLibrary.tsx` - Applicable frameworks display
- `TemplateLibrary.tsx` - Communication templates (Slack/email)
- `MicroHabitSuggestion.tsx` - Personalized habit recommendation
- `PracticeAgainPrompt.tsx` - Variant practice option

**Enhanced Existing:**
- `MomentDetailPage.tsx` - Implement 5-step flow
- `MomentsPage.tsx` - Add progress journey visualization

#### 3.3 Progress Tracking Enhancements

**New Components:**
- `ProgressJourney.tsx` - Skill development visualization
- `CompetenceLevelIndicator.tsx` - Current level display
- `SkillPathMap.tsx` - Recommended next steps
- `ApplicationLog.tsx` - Real-world application tracking

### Phase 4: Content Library Implementation (Week 4)

#### 4.1 23 Manager Moments Content

**Categories:**
1. Communication Skills (5 moments)
2. Growth & Development (3 moments)
3. Organization & Planning (6 moments)
4. Deadlines & Time Management (3 moments)
5. Feedback & Growth (3 moments)
6. Collaboration & Relationships (2 moments)
7. Wellbeing & Stress Management (1 moment)

**Implementation:**
- Create comprehensive seed data file
- Include all scenarios, examples, frameworks
- Add rubrics for each moment
- Include peer examples for each category

#### 4.2 Communication Templates

**Slack Templates:**
- BLUF updates
- Decision summaries
- Risk flags
- Status updates
- Repair notes

**Email Templates:**
- Stakeholder updates
- Feedback responses
- Project briefs
- Delay communications

### Phase 5: Integration & Testing (Week 5)

#### 5.1 Kirkpatrick Integration

**Level 1 (Reaction):**
- Use existing onboarding questions
- Track user engagement with moments

**Level 2 (Learning):**
- Leverage existing trophy system
- Track competence progression

**Level 3 (Behavior):**
- Like/save feature adoption
- Application tracking

**Level 4 (Results):**
- Correlate with goal achievement
- Track career progression indicators

#### 5.2 Testing Checklist

**Functional Testing:**
- [ ] Like/save functionality works
- [ ] 5-step moment flow complete
- [ ] Roleplay interaction smooth
- [ ] Feedback chips display correctly
- [ ] Peer examples load
- [ ] Templates copy correctly
- [ ] Progress journey updates

**Integration Testing:**
- [ ] Saved recommendations appear in progress
- [ ] Applied items update analytics
- [ ] Trophy system reflects new moments
- [ ] Competence levels calculate correctly

**User Experience Testing:**
- [ ] Mobile responsiveness
- [ ] Button-first interactions
- [ ] Progressive disclosure
- [ ] Loading states
- [ ] Error handling

### Phase 6: Analytics & Optimization (Week 6)

#### 6.1 Success Metrics Implementation

**Engagement Metrics:**
- Manager Moment completion rate
- Average session duration
- Practice round participation
- Like/save adoption rate
- Applied recommendations rate

**Learning Effectiveness:**
- Pre/post rubric score improvement
- Skill confidence increase
- Real workplace application reports
- Peer example engagement

**Technical Performance:**
- API response times
- Mobile responsiveness scores
- Voice feature adoption
- Error rates

#### 6.2 Dashboard Creation

- Admin analytics dashboard
- User progress dashboard
- Competence level tracking
- Application impact visualization

## Technical Considerations

### Database Migrations
- Use Drizzle Kit for schema changes
- Maintain backward compatibility
- Test migrations on staging first

### API Versioning
- Consider /api/v2 for new endpoints
- Maintain v1 for existing functionality
- Gradual migration strategy

### State Management
- Extend Zustand stores for new features
- React Query for server state
- Local storage for offline support

### Performance Optimization
- Lazy load peer examples
- Cache framework/template libraries
- Optimize roleplay response times
- Progressive image loading for artifacts

## Cultural & Generational Alignment

### Indian Workplace Context
- Hierarchy-conscious language in personas
- Saving-face approach in feedback
- Time-bounded asks with approval buffers
- Appropriate deference in templates

### GenZ/GenAlpha Preferences
- Button-first interactions
- Progressive revelation
- Visual feedback
- Mobile-first design
- Quick actions (chips, templates)

## Risk Mitigation

### Technical Risks
- **Risk**: Database migration failures
  **Mitigation**: Comprehensive backup strategy, staging environment testing

- **Risk**: AI service latency
  **Mitigation**: Response caching, optimistic UI updates

- **Risk**: Mobile performance
  **Mitigation**: Code splitting, lazy loading, performance monitoring

### User Experience Risks
- **Risk**: Feature overload
  **Mitigation**: Progressive disclosure, guided onboarding

- **Risk**: Cultural misalignment
  **Mitigation**: User testing with target demographic, feedback loops

## Success Criteria

### Phase 1 Success
- ✅ Database schema updated without data loss
- ✅ All migrations run successfully
- ✅ Backward compatibility maintained

### Phase 2 Success
- ✅ All new API endpoints functional
- ✅ AI service enhancements working
- ✅ Response times < 500ms

### Phase 3 Success
- ✅ All UI components responsive
- ✅ 5-step flow intuitive
- ✅ Mobile experience smooth

### Phase 4 Success
- ✅ All 23 moments loaded
- ✅ Templates accessible
- ✅ Peer examples engaging

### Phase 5 Success
- ✅ All integration tests passing
- ✅ User acceptance testing positive
- ✅ No critical bugs

### Phase 6 Success
- ✅ Analytics tracking correctly
- ✅ Success metrics visible
- ✅ Performance optimized

## Next Steps

1. **Review and Approve** this roadmap
2. **Set up staging environment** for testing
3. **Begin Phase 1** database schema enhancements
4. **Create detailed task breakdown** for each phase
5. **Establish sprint schedule** (2-week sprints recommended)
6. **Set up monitoring** for success metrics

## Timeline Summary

- **Week 1**: Database schema enhancements
- **Week 2**: Backend API development
- **Week 3**: Frontend UI implementation
- **Week 4**: Content library creation
- **Week 5**: Integration & testing
- **Week 6**: Analytics & optimization

**Total Estimated Time**: 6 weeks for full implementation

## Resources Required

- 1 Full-stack developer (primary)
- 1 UI/UX designer (part-time for component design)
- 1 Content writer (for moment scenarios and templates)
- 1 QA tester (for comprehensive testing)
- Access to staging environment
- Google Gemini API quota increase

---

**Document Version**: 1.0
**Last Updated**: October 11, 2025
**Status**: Ready for Implementation
