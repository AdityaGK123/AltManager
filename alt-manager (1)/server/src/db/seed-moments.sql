-- Seed Manager Moments data
-- Top 10 Manager Moments aligned with design principles

INSERT INTO manager_moments (
  id,
  title, 
  description, 
  prompt, 
  category,
  tags
) VALUES 
(
  'bluf-your-message',
  'BLUF Your Message',
  'Practice delivering concise, decision-ready updates to busy stakeholders',
  'You need a decision on Q4 budget allocation for your team''s new analytics tool. Finance needs an answer by 3 PM today to lock vendor contracts. If delayed 24 hours, the vendor discount expires (₹2L loss). Your manager has 2 minutes between meetings.',
  'Communication',
  '["communication", "brevity", "decision-making"]'::jsonb
),
(
  'slack-chaos-into-signal',
  'Turn Slack Chaos into Signal',
  'Transform messy Slack threads into clear status updates with decisions, owners, and dates',
  'Your #product-launch Slack channel has 47 messages today across 6 threads: bug reports, feature requests, timeline questions, and vendor asks. The PM just pinged: "What is the current status?" Launch is in 5 days. Two items are blocking QA.',
  'Communication',
  '["communication", "organization", "status-updates"]'::jsonb
),
(
  'repair-note-after-misstep',
  'Write a Repair Note After a Misstep',
  'Own mistakes professionally and rebuild trust with accountability and prevention plans',
  'You missed a Friday deadline for the client deck, causing the sales team to reschedule Monday''s pitch. The client is frustrated, and your manager wants assurance this will not repeat.',
  'Communication',
  '["communication", "accountability", "trust-building"]'::jsonb
),
(
  'handle-escalation-composure',
  'Handle Escalation with Composure',
  'Respond to urgent escalations without panic while protecting team focus',
  'A client escalation just landed in your inbox at 4:30 PM. The issue affects their demo tomorrow at 10 AM. Your team is heads-down on a different launch deadline tonight. The client CCed your VP asking for immediate resolution.',
  'Communication',
  '["escalation", "composure", "prioritization"]'::jsonb
),
(
  'ask-feedback-growth',
  'Ask for Feedback That Helps You Grow',
  'Request specific, actionable feedback without creating burden for the giver',
  'You want to improve your stakeholder communication after a recent project. Your manager is busy with Q4 planning. You need feedback that is concrete enough to act on, but you do not want to add to their workload.',
  'Growth',
  '["feedback", "self-improvement", "communication"]'::jsonb
),
(
  'pushback-unrealistic-deadlines',
  'Push Back on Unrealistic Deadlines',
  'Negotiate timeline or scope when deadline risks quality or team health',
  'Product asks for a new feature by Friday to demo at a conference. Your team estimates it needs 2 weeks for quality delivery. Cutting corners risks technical debt. The PM says the conference is non-negotiable.',
  'Deadlines',
  '["negotiation", "scope", "quality"]'::jsonb
),
(
  'delegate-without-dropping-ownership',
  'Delegate Without Dropping Ownership',
  'Hand off work clearly while staying accountable for outcomes',
  'You are overloaded this week and need to delegate the vendor contract review to a teammate. The contract needs sign-off by Thursday. Your manager expects you to own the relationship, but you cannot do the detailed review yourself.',
  'Collaboration',
  '["delegation", "ownership", "accountability"]'::jsonb
),
(
  'navigate-ambiguity-requirements',
  'Navigate Ambiguity in Requirements',
  'Move forward when requirements are unclear without building the wrong thing',
  'You are starting a new project but the requirements doc has gaps. Stakeholders are in back-to-back meetings this week. You need to make progress without waiting, but you cannot afford to build the wrong solution.',
  'Organization',
  '["ambiguity", "requirements", "decision-making"]'::jsonb
),
(
  'coach-peer-missed-deliverables',
  'Coach a Peer on Missed Deliverables',
  'Address performance issues directly while preserving relationship and psychological safety',
  'A peer has missed 3 deadlines in the past month, creating extra work for the team. You are not their manager, but the pattern is affecting team morale. You want to help them improve without overstepping or damaging trust.',
  'Collaboration',
  '["coaching", "feedback", "performance"]'::jsonb
),
(
  'celebrate-wins-authentically',
  'Celebrate Wins Authentically',
  'Recognize team achievements in a way that feels genuine and motivating',
  'Your team just shipped a major feature after 6 weeks of intense work. People are tired but proud. You want to celebrate the win in a way that feels authentic and energizing, not performative or generic.',
  'Team Dynamics',
  '["recognition", "celebration", "morale"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
