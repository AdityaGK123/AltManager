import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { momentsAIService } from './momentsAIService.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Conversational Coaching Service
 * Provides intelligent, emotionally aware feedback with rubric-based evaluation
 * Feels like a live dialogue with a supportive manager
 */

export interface RubricEvaluation {
  [key: string]: boolean | number;
}

export interface CoachingFeedback {
  rubric: RubricEvaluation;
  feedback: string; // Natural, human-like coaching feedback
  managerTone: string; // Encouraging, direct, balanced
  score: number; // 0-100
  xpEarned: number;
  strengths: string[]; // What worked well
  improvements: string[]; // Areas to refine
  exemplarRewrite?: string; // Ideal version
  microHabit?: string; // Actionable next step
  templates?: string[]; // Copy-paste templates
  emotionalTone?: string; // Detected tone of user's response
}

export interface ConversationContext {
  transcript: Array<{ role: string; content: string; timestamp?: Date }>;
  turnCount: number;
  momentId: string;
  category: string;
  previousSessions?: Array<{ score: number; feedback: string; date: Date }>;
}

class ConversationalCoachingService {
  private model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  /**
   * Generate conversational coaching feedback with rubric evaluation
   */
  async generateCoachingFeedback(
    momentId: string,
    context: ConversationContext
  ): Promise<CoachingFeedback> {
    const startTime = Date.now();
    console.log(`[Coaching] Generating feedback for ${momentId}`);

    try {
      // Get moment template for rubric
      const template = momentsAIService.getMomentTemplate(momentId);
      if (!template) {
        throw new Error(`Template not found for moment: ${momentId}`);
      }

      // Extract user responses from transcript
      const userResponses = context.transcript
        .filter(t => t.role === 'user')
        .map(t => t.content)
        .join('\n\n');

      // Build coaching prompt
      const prompt = this.buildCoachingPrompt(
        template,
        userResponses,
        context
      );

      // Generate feedback
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse structured feedback
      const feedback = this.parseCoachingResponse(response, template);

      const duration = Date.now() - startTime;
      console.log(`[Coaching] Generated feedback in ${duration}ms`);

      return feedback;
    } catch (error: any) {
      console.error('[Coaching] Error generating feedback:', error);
      throw new Error(`Failed to generate coaching feedback: ${error.message}`);
    }
  }

  /**
   * Build intelligent coaching prompt with rubric and context
   */
  private buildCoachingPrompt(
    template: any,
    userResponses: string,
    context: ConversationContext
  ): string {
    const rubricItems = Object.entries(template.rubric)
      .map(([key, description]) => `- ${key}: ${description}`)
      .join('\n');

    const previousContext = context.previousSessions && context.previousSessions.length > 0
      ? `\n\nPREVIOUS SESSIONS (for growth context):
${context.previousSessions.map((s, i) => `Session ${i + 1}: Score ${s.score}/100 - ${s.feedback.substring(0, 100)}...`).join('\n')}`
      : '';

    return `You are an experienced, emotionally intelligent manager providing coaching feedback on a practice scenario.

SCENARIO: ${template.situation}

RUBRIC (evaluate each criterion):
${rubricItems}

USER'S RESPONSE:
${userResponses}

IDEAL EXAMPLE:
${template.idealResponse.slack || template.idealResponse.email || template.idealResponse.verbal || template.idealResponse.doc}
${previousContext}

INSTRUCTIONS:
1. Evaluate the user's response against each rubric criterion (true/false or 0-5 scale)
2. Calculate overall score (0-100 based on rubric pass rate)
3. Write natural, supportive feedback that feels like a real manager conversation:
   - Start with what they did well (be specific)
   - Identify 1-2 areas to refine (be constructive)
   - Use phrases like "I like how you...", "You could strengthen this by...", "One thing to try..."
   - Be encouraging but honest
4. Detect emotional tone of their response (confident, hesitant, defensive, etc.)
5. Provide an exemplar rewrite if score < 80
6. Suggest one micro-habit they can practice immediately
7. Include 1-2 copy-paste templates they can use

RESPOND IN THIS EXACT JSON FORMAT:
{
  "rubric": {
    "criterion1": true/false or 0-5,
    "criterion2": true/false or 0-5,
    ...
  },
  "score": 0-100,
  "feedback": "Natural, conversational coaching feedback (2-3 sentences)",
  "managerTone": "encouraging|direct|balanced",
  "emotionalTone": "confident|hesitant|defensive|engaged",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Specific improvement 1", "Specific improvement 2"],
  "exemplarRewrite": "Ideal version (if score < 80)",
  "microHabit": "One actionable habit to practice",
  "templates": ["Template 1", "Template 2"]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or extra text.`;
  }

  /**
   * Parse AI response into structured coaching feedback
   */
  private parseCoachingResponse(
    response: string,
    template: any
  ): CoachingFeedback {
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanResponse);

      // Calculate XP based on score
      const xpEarned = this.calculateXP(parsed.score, template.cluster);

      return {
        rubric: parsed.rubric || {},
        feedback: parsed.feedback || 'Great effort! Keep practicing.',
        managerTone: parsed.managerTone || 'balanced',
        score: parsed.score || 0,
        xpEarned,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        exemplarRewrite: parsed.exemplarRewrite,
        microHabit: parsed.microHabit,
        templates: parsed.templates || [],
        emotionalTone: parsed.emotionalTone,
      };
    } catch (error) {
      console.error('[Coaching] Failed to parse response:', error);
      // Fallback to basic feedback
      return {
        rubric: {},
        feedback: 'I see your effort here. Let\'s work on making your message more clear and actionable.',
        managerTone: 'encouraging',
        score: 50,
        xpEarned: 25,
        strengths: ['You engaged with the practice'],
        improvements: ['Focus on clarity and structure'],
      };
    }
  }

  /**
   * Calculate XP earned based on score and category
   */
  private calculateXP(score: number, category: string): number {
    const baseXP = Math.floor(score / 2); // 0-50 XP base
    const categoryMultiplier = 1.0; // Can vary by category difficulty
    const bonusXP = score >= 90 ? 20 : score >= 80 ? 10 : 0;

    return Math.floor(baseXP * categoryMultiplier) + bonusXP;
  }

  /**
   * Generate contextual greeting for coaching session
   */
  generateGreeting(
    userName: string,
    momentTitle: string,
    previousScore?: number
  ): string {
    const greetings = [
      `Hey ${userName}, let's work on ${momentTitle} today. Ready?`,
      `Hi ${userName}! Time to practice ${momentTitle}. Let's make it count.`,
      `${userName}, excited to coach you through ${momentTitle}. Let's dive in!`,
    ];

    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (previousScore !== undefined) {
      if (previousScore >= 80) {
        greeting += ` Last time you scored ${previousScore}% — let's keep that momentum!`;
      } else {
        greeting += ` Last time you scored ${previousScore}%. Let's improve on that today!`;
      }
    }

    return greeting;
  }

  /**
   * Generate contextual roleplay response during practice
   */
  async generateRoleplayResponse(
    momentId: string,
    stakeholderRole: string,
    transcript: Array<{ role: string; content: string }>,
    turnCount: number
  ): Promise<{ reply: string; chips: { good: string[]; risky: string[] } }> {
    const template = momentsAIService.getMomentTemplate(momentId);
    if (!template) {
      throw new Error(`Template not found for moment: ${momentId}`);
    }

    const lastUserMessage = transcript
      .filter(t => t.role === 'user')
      .slice(-1)[0]?.content || '';

    const prompt = `You are a ${stakeholderRole} in a realistic workplace roleplay. 
Persona: ${template.roleplayConfig.persona}

SCENARIO: ${template.situation}

CONVERSATION SO FAR:
${transcript.map(t => `${t.role === 'user' ? 'User' : stakeholderRole}: ${t.content}`).join('\n')}

INSTRUCTIONS:
1. Respond naturally as the ${stakeholderRole} (max ${template.roleplayConfig.maxReplyWords} words)
2. Challenge the user if they're vague or missing key elements
3. Be realistic — busy, focused on decisions, values clarity
4. Identify what's good and what's risky in their last response

RESPOND IN THIS JSON FORMAT:
{
  "reply": "Your natural response as ${stakeholderRole}",
  "chips": {
    "good": ["What worked well"],
    "risky": ["What could be problematic"]
  }
}

Return ONLY valid JSON.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanResponse);
      return {
        reply: parsed.reply || 'Can you clarify that?',
        chips: parsed.chips || { good: [], risky: [] },
      };
    } catch (error) {
      console.error('[Coaching] Error generating roleplay response:', error);
      return {
        reply: 'I need more clarity. What specifically are you asking for?',
        chips: { good: [], risky: ['Response unclear'] },
      };
    }
  }

  /**
   * Generate personalized insight based on progress
   */
  generateInsight(
    category: string,
    currentScore: number,
    previousScore: number | null,
    completionCount: number
  ): { title: string; description: string; type: string } {
    const improvement = previousScore !== null ? currentScore - previousScore : 0;

    if (improvement >= 20) {
      return {
        title: `${category}: Major Improvement!`,
        description: `You improved by ${improvement}% since your last practice. Your ${category.toLowerCase()} skills are leveling up!`,
        type: 'improvement',
      };
    }

    if (currentScore >= 90) {
      return {
        title: `${category}: Excellence Achieved`,
        description: `You scored ${currentScore}% — that's exceptional! You're mastering ${category.toLowerCase()}.`,
        type: 'milestone',
      };
    }

    if (completionCount % 5 === 0) {
      return {
        title: `${category}: Consistency Milestone`,
        description: `You've completed ${completionCount} ${category.toLowerCase()} practices. Consistency builds mastery!`,
        type: 'milestone',
      };
    }

    return {
      title: `${category}: Keep Building`,
      description: `You're making progress in ${category.toLowerCase()}. Each practice strengthens your skills.`,
      type: 'progress',
    };
  }
}

export const conversationalCoachingService = new ConversationalCoachingService();
