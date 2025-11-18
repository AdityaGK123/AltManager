import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface MomInput {
  transcript: string;
  date?: string;
}

export interface MomOutput {
  title: string;
  date: string;
  summary: string;
  developmentAreas: string[];
  emotionalTone: string;
  actionItems: string[];
  insights: string[];
  blindspots: string[];
}

export interface TrendAnalysisInput {
  momRecords: Array<{
    date: string;
    developmentAreas: string[];
    emotionalTone: string;
    summary: string;
  }>;
}

export interface TrendAnalysisOutput {
  primaryDevelopmentAreas: Array<{
    area: string;
    frequency: number;
    percentage: number;
    pattern: string;
  }>;
  contentThemeClusters: Array<{
    themeName: string;
    frequency: number;
    sampleTopics: string[];
    evolution: string;
  }>;
  emotionalTrajectory: {
    dominantEmotions: string[];
    emotionalPatterns: string[];
    emotionThemeCorrelations: string[];
    trendDirection: string;
  };
  summaryInsights: string[];
}

export interface BlindspotAnalysisInput {
  momRecords: Array<{
    date: string;
    blindspots: string[];
    actionItems: string[];
    developmentAreas: string[];
    summary: string;
  }>;
}

export interface BlindspotAnalysisOutput {
  recurringBlindspots: Array<{
    pattern: string;
    frequency: number;
    context: string;
    impact: string;
  }>;
  whatRemainsUnsaid: Array<{
    whatIsAvoided: string;
    hypothesis: string;
    potentialCost: string;
  }>;
  operatingAssumptions: Array<{
    assumption: string;
    evidence: string;
    type: 'limiting' | 'empowering';
  }>;
  unrecognizedStrengths: Array<{
    strength: string;
    evidence: string;
    whyNotSeen: string;
  }>;
  growthBlockers: Array<{
    type: 'mindset' | 'behavioral' | 'relational' | 'structural';
    blocker: string;
    severity: number;
  }>;
  metaPatterns: string[];
  developmentHypotheses: string[];
}

export interface ProgressAnalysisInput {
  momRecords: Array<{
    date: string;
    developmentAreas: string[];
    actionItems: string[];
    emotionalTone: string;
    insights: string[];
    summary: string;
  }>;
}

export interface ProgressAnalysisOutput {
  keyThemes: Array<{
    themeName: string;
    progressIcon: '🟢' | '🟡' | '🔴';
    mindsetEvolution: string;
    actionEvidence: string;
    momentumSignal: string;
  }>;
  overallTrajectory: string;
  progressScores: {
    developmentAreaMovement: number;
    actionFollowThrough: number;
    mindsetEvolution: number;
    capabilityBuilding: number;
    overallMomentum: number;
  };
}

export class AnalysisService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateMoM(input: MomInput): Promise<MomOutput> {
    try {
      const prompt = `You are analyzing a conversation between a user and Alt Manager (an AI career coach for early-career professionals in India). Your task is to create a structured Minutes of Meeting (MoM) document.

Input: Full transcript of the conversation between user and Alt Manager

Generate a MoM with exactly these 7 fields:

1. Title + Date
Create a clear, specific title that captures the main topic discussed (5-8 words max)
Include the date of the discussion in DD-MM-YYYY format
Format: "Title | DD-MM-YYYY"

2. 3-Line Summary
Capture the essence of what was discussed in exactly 3 concise sentences
Focus on: the core challenge/topic, what was explored, and the direction identified
Write in past tense, factual tone

3. Development Area(s) Discussed
Identify 1-3 specific development areas from this list: Communication, Stakeholder Management, Prioritization, Conflict Resolution, Feedback Delivery, Time Management, Decision Making, Delegation, Self-Advocacy, Emotional Regulation, Strategic Thinking, Influence, Accountability, Adaptability, Problem Solving
If the topic doesn't fit these categories, create a relevant tag (2-3 words max)
Format as comma-separated tags

4. Emotional Tone
Capture the user's predominant emotional state in 1-3 words
Examples: frustrated, uncertain, confident, defensive, energized, overwhelmed, curious, resigned, hopeful, anxious
If tone shifts significantly during conversation, note both (e.g., "frustrated → hopeful")

5. 3 Action Items
Extract or infer 3 concrete next steps, focusing on:
- Specific actions the user will take
- Questions the user needs to answer or explore
- Commitments made during the discussion
Write in actionable language (verb-led)

6. 3 Insights
Provide exactly 3 insights covering:
- Connecting dots: Patterns or connections surfaced during the discussion
- Aha moments: Points where the user showed realization or engagement
- Thought-provoking questions: Key questions raised that prompted deeper thinking

7. Blindspots Identified
List 2-3 blindspots, drawing from:
- What was unsaid: Important aspects the user didn't mention or avoided
- Assumptions visible: Underlying beliefs the user is operating from that may limit them
- Growth blockers: Patterns, mindsets, or behaviors that might hinder development
- Hidden strengths: Capabilities or qualities the user demonstrated but didn't recognize

Conversation transcript:
${input.transcript}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Title text | ${input.date || new Date().toLocaleDateString('en-GB')}",
  "summary": "Three sentences. Sentence one. Sentence two. Sentence three.",
  "developmentAreas": ["Area1", "Area2"],
  "emotionalTone": "tone description",
  "actionItems": ["Action 1", "Action 2", "Action 3"],
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "blindspots": ["Blindspot 1", "Blindspot 2"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title,
          date: input.date || new Date().toLocaleDateString('en-GB'),
          summary: parsed.summary,
          developmentAreas: parsed.developmentAreas,
          emotionalTone: parsed.emotionalTone,
          actionItems: parsed.actionItems,
          insights: parsed.insights,
          blindspots: parsed.blindspots,
        };
      }
      
      throw new Error('Failed to parse MoM response');
    } catch (error) {
      console.error('MoM Generation Error:', error);
      throw new Error('Failed to generate Minutes of Meeting');
    }
  }

  async analyzeTrends(input: TrendAnalysisInput): Promise<TrendAnalysisOutput> {
    try {
      const prompt = `You are analyzing Minutes of Meeting (MoM) records from Alt Manager coaching sessions for a single user over time. Your task is to identify recurring content themes and emotional patterns.

Input: Collection of MoM records for one user with the date of creation

Your Task: Generate a comprehensive Recurring Themes and Emotional Trends Report with the following sections:

1. Primary Development Areas (Ranked by Frequency)
List all development areas discussed, ranked by frequency of appearance
For each area, include:
- Number of sessions where it appeared
- Percentage of total sessions
- Brief pattern note (e.g., "appeared in 3 consecutive sessions," "recurring monthly")

2. Content Theme Clusters
Identify 3-5 major theme clusters across discussions. For each cluster:
- Theme name: Clear, descriptive label
- Frequency: How often this theme appears
- Sample topics: 2-3 specific examples from the MoMs
- Evolution note: Is this theme increasing, decreasing, or stable over time?

3. Emotional Trajectory
- Dominant emotions: List the top 3-5 emotional states by frequency
- Emotional patterns: Identify any recurring emotional sequences (e.g., "frequently starts frustrated, ends uncertain" or "growing confidence over time")
- Emotion-theme correlations: Which emotions tend to appear with which themes? (e.g., "defensive tone appears consistently in feedback-related discussions")
- Trend direction: Is the overall emotional tone improving, declining, or fluctuating?

4. Summary Insights
Provide 3-4 high-level insights about this user's recurring patterns:
- What keeps coming back that might indicate a core challenge?
- What's NOT being discussed that seems notable given their role/stage?
- How are their concerns evolving (or not evolving)?
- Any cyclical patterns (e.g., certain topics appearing weekly, monthly)?

Output Format:
- Clear section headers
- Bullet points for lists (not more than 50 words)
- Evidence-based observations tied to actual MoM content
- Professional but accessible language

MoM Records (${input.momRecords.length} sessions):
${JSON.stringify(input.momRecords, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "primaryDevelopmentAreas": [
    {"area": "name", "frequency": 5, "percentage": 50, "pattern": "description"}
  ],
  "contentThemeClusters": [
    {"themeName": "name", "frequency": 3, "sampleTopics": ["topic1", "topic2"], "evolution": "increasing"}
  ],
  "emotionalTrajectory": {
    "dominantEmotions": ["emotion1", "emotion2"],
    "emotionalPatterns": ["pattern1", "pattern2"],
    "emotionThemeCorrelations": ["correlation1"],
    "trendDirection": "improving"
  },
  "summaryInsights": ["insight1", "insight2", "insight3"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse trend analysis response');
    } catch (error: any) {
      console.error('[Trend Analysis] Error:', error);
      console.error('[Trend Analysis] Error stack:', error.stack);
      if (error.message?.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error('AI service rate limit reached. Please try again in a few minutes.');
      }
      throw new Error(`Failed to analyze trends: ${error.message || 'Unknown error'}. Please try again.`);
    }
  }

  async analyzeBlindspots(input: BlindspotAnalysisInput): Promise<BlindspotAnalysisOutput> {
    try {
      const prompt = `You are analyzing Minutes of Meeting (MoM) records from Alt Manager coaching sessions for a single user. Your task is to identify patterns in blindspots and surface meta-level developmental insights.

Input: Collection of MoM records for one user for all MoMs available along with the dates when the MoMs were created

Your Task: Generate a comprehensive Blindspots Analysis Report with the following sections:

1. Recurring Blindspots
Identify blindspots that appear across multiple sessions:
- Pattern: What specific blindspot keeps appearing?
- Frequency: How many sessions surfaced this?
- Context: In what situations does this blindspot show up?
- Impact: How might this be limiting the user's growth?

2. Operating Assumptions
Identify underlying beliefs or assumptions visible across sessions:
- Stated assumptions: Beliefs they've explicitly mentioned
- Inferred assumptions: Beliefs implied by their questions, concerns, or framing
- Limiting assumptions: Which assumptions might be constraining their options?
- Empowering assumptions: Which assumptions are serving them well?
Format each as: "User appears to believe that [assumption], evidenced by [specific examples from MoMs]"

3. Unrecognized Strengths
Track strengths the user demonstrates but doesn't acknowledge:
- Capabilities they show in how they approach problems
- Skills evident in their action items or responses
- Qualities visible in how they engage with coaching
- Growth already happening that they haven't named
For each strength:
- What you observe
- Evidence from MoMs (specific examples)
- Why they might not be seeing this in themselves

4. Growth Blockers
Identify patterns that may be impeding development:
- Mindset blockers: Fixed beliefs limiting possibilities
- Behavioral blockers: Repeated actions creating problems
- Relational blockers: Patterns in how they engage with others
- Structural blockers: Environmental factors they have agency to change but aren't addressing
Rank by severity/frequency.

5. Development Hypotheses
Based on the blindspot analysis, propose 2-3 hypotheses about:
- What core belief or experience might be driving multiple blindspots?
- What ONE shift in perspective could unlock progress across multiple areas?
- What's the next level of self-awareness they're ready for?

Output Format:
- Clear section headers
- Specific evidence from MoMs (quote or paraphrase with session reference)
- Balanced tone: developmental, not judgmental
- Distinguish between observation (what you see) and interpretation (what it might mean)
- Prioritize patterns over one-offs
- Keep it short and crisp, emphasize impact over length

MoM Records (${input.momRecords.length} sessions):
${JSON.stringify(input.momRecords, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "recurringBlindspots": [
    {"pattern": "description", "frequency": 3, "context": "when X happens", "impact": "limits Y"}
  ],
  "whatRemainsUnsaid": [
    {"whatIsAvoided": "topic", "hypothesis": "because X", "potentialCost": "missing Y"}
  ],
  "operatingAssumptions": [
    {"assumption": "belief", "evidence": "examples", "type": "limiting"}
  ],
  "unrecognizedStrengths": [
    {"strength": "capability", "evidence": "examples", "whyNotSeen": "reason"}
  ],
  "growthBlockers": [
    {"type": "mindset", "blocker": "description", "severity": 8}
  ],
  "metaPatterns": ["pattern1", "pattern2"],
  "developmentHypotheses": ["hypothesis1", "hypothesis2"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse blindspot analysis response');
    } catch (error: any) {
      console.error('[Blindspot Analysis] Error:', error);
      console.error('[Blindspot Analysis] Error stack:', error.stack);
      if (error.message?.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error('AI service rate limit reached. Please try again in a few minutes.');
      }
      throw new Error(`Failed to analyze blindspots: ${error.message || 'Unknown error'}. Please try again.`);
    }
  }

  async analyzeProgress(input: ProgressAnalysisInput): Promise<ProgressAnalysisOutput> {
    try {
      const prompt = `You are analyzing Minutes of Meeting (MoM) records from Alt Manager coaching sessions for a single user over time. Your task is to identify 2-3 key developmental themes and track progress on each.

Input: Collection of MoM records for one user, arranged chronologically

Generate a Theme-Based Progress Report:

Step 1: Identify 2-3 Key Themes
Based on recurring development areas and discussion patterns, identify the 2-3 most significant themes for this user.

Step 2: Progress Analysis Per Theme
For each theme, provide exactly 2-3 lines covering:
[Theme Name] | [Progress Icon: 🟢 🟡 🔴]
- Mindset evolution: How their thinking/framing has shifted (or not) - with before→after evidence
- Action evidence: What they're doing differently (or stuck on) - cite specific examples from sessions
- Momentum signal: One indicator of progress, stagnation, or regression - with session reference

Step 3: Overall Trajectory (1-2 lines)
One sentence on the big-picture progress story + one forward-looking recommendation.

Also provide progress scores (1-5) for:
- Development area movement
- Action follow-through
- Mindset evolution
- Capability building
- Overall momentum

MoM Records (${input.momRecords.length} sessions):
${JSON.stringify(input.momRecords, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "keyThemes": [
    {
      "themeName": "Theme Name",
      "progressIcon": "🟢",
      "mindsetEvolution": "Shifted from X (S1) to Y (S4)",
      "actionEvidence": "Completed A, initiated B",
      "momentumSignal": "Language changed from problem to solution-focused"
    }
  ],
  "overallTrajectory": "Big picture story. Forward recommendation.",
  "progressScores": {
    "developmentAreaMovement": 4,
    "actionFollowThrough": 3,
    "mindsetEvolution": 4,
    "capabilityBuilding": 3,
    "overallMomentum": 4
  }
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse progress analysis response');
    } catch (error: any) {
      console.error('[Progress Analysis] Error:', error);
      console.error('[Progress Analysis] Error stack:', error.stack);
      if (error.message?.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error('AI service rate limit reached. Please try again in a few minutes.');
      }
      throw new Error(`Failed to analyze progress: ${error.message || 'Unknown error'}. Please try again.`);
    }
  }
}

export const analysisService = new AnalysisService();
