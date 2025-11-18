import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// API Key Type Detection
type APIKeyType = 'makersuite' | 'google-cloud' | 'unknown';

interface APIKeyInfo {
  type: APIKeyType;
  key: string;
  isValid: boolean;
}

function detectAPIKeyType(apiKey: string): APIKeyInfo {
  if (!apiKey || apiKey.trim().length === 0) {
    return { type: 'unknown', key: '', isValid: false };
  }

  const trimmedKey = apiKey.trim();

  // MakerSuite keys start with 'AIza'
  if (trimmedKey.startsWith('AIza')) {
    return {
      type: 'makersuite',
      key: trimmedKey,
      isValid: trimmedKey.length >= 39 // Typical MakerSuite key length
    };
  }

  // Google Cloud keys are typically JSON service account keys or start with different patterns
  // For now, treat any other format as potential Google Cloud key
  if (trimmedKey.length > 20) {
    return {
      type: 'google-cloud',
      key: trimmedKey,
      isValid: true // Will be validated on first API call
    };
  }

  return { type: 'unknown', key: trimmedKey, isValid: false };
}

// Validate and detect API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ CRITICAL: GEMINI_API_KEY is not set in environment variables');
  console.error('Please add GEMINI_API_KEY to your .env file');
  console.error('Supported formats:');
  console.error('  - MakerSuite (free): AIza... from https://makersuite.google.com/app/apikey');
  console.error('  - Google Cloud (paid): Service account key or API key');
  throw new Error('GEMINI_API_KEY is required');
}

const apiKeyInfo = detectAPIKeyType(process.env.GEMINI_API_KEY);

if (!apiKeyInfo.isValid) {
  console.error('❌ CRITICAL: GEMINI_API_KEY format is invalid');
  console.error('Key type detected:', apiKeyInfo.type);
  console.error('Key length:', apiKeyInfo.key.length);
  throw new Error('GEMINI_API_KEY format is invalid');
}

console.log('🔑 API Key Configuration:');
console.log('  Type:', apiKeyInfo.type === 'makersuite' ? 'Google MakerSuite (Free Tier)' : 'Google Cloud (Paid)');
console.log('  Length:', apiKeyInfo.key.length, 'characters');
console.log('  Preview:', apiKeyInfo.key.substring(0, 10) + '...' + apiKeyInfo.key.substring(apiKeyInfo.key.length - 5));

const genAI = new GoogleGenerativeAI(apiKeyInfo.key);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserContext {
  name?: string;
  roleTitle?: string;
  experienceYears?: number;
  careerGoals?: string;
  currentChallenges?: string;
  managerTone?: string;
}

export class AIService {
  private model;
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds - faster timeout for better UX
  private readonly MAX_RETRIES = 1; // Reduce retries for faster failure
  private readonly apiKeyType: APIKeyType;
  private readonly modelName: string;

  constructor() {
    try {
      this.apiKeyType = apiKeyInfo.type;
      
      // Use gemini-2.5-flash for optimal speed and cost efficiency
      // Flash variant: 3-4s response time, 1M token context, cost-efficient
      this.modelName = 'gemini-2.5-flash';
      
      this.model = genAI.getGenerativeModel({ 
        model: this.modelName,
        // Add safety settings for production stability
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
      
      console.log('✅ AI Service initialized successfully');
      console.log('  Mode:', this.apiKeyType === 'makersuite' ? 'MakerSuite (Free)' : 'Google Cloud (Paid)');
      console.log('  Model:', this.modelName);
      console.log('  Timeout:', this.REQUEST_TIMEOUT + 'ms');
      console.log('  Max Retries:', this.MAX_RETRIES);
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
      throw error;
    }
  }

  getAPIKeyType(): APIKeyType {
    return this.apiKeyType;
  }

  getModelName(): string {
    return this.modelName;
  }

  private buildSystemPrompt(userContext: UserContext, tone: string = 'balanced'): string {
    const toneInstructions = {
      supportive: 'Be warm, encouraging, and empathetic. Focus on building confidence and providing positive reinforcement.',
      direct: 'Be straightforward, concise, and action-oriented. Give clear directives and honest feedback.',
      balanced: 'Balance empathy with directness. Be supportive while maintaining professional accountability.',
    };

    return `You are ALT Manager, an AI career manager for GenZ professionals in India. You act as a real manager, not a coach or mentor.

YOUR ROLE:
- Provide clear direction, set expectations, and hold users accountable
- Offer practical workplace guidance with Indian corporate context
- Use a ${tone} management style: ${toneInstructions[tone as keyof typeof toneInstructions]}
- Speak in a GenZ-friendly but professional tone
- Keep responses concise and actionable (2-3 paragraphs max)

USER CONTEXT:
${userContext.name ? `Name: ${userContext.name}` : ''}
${userContext.roleTitle ? `Role: ${userContext.roleTitle}` : ''}
${userContext.experienceYears !== undefined ? `Experience: ${userContext.experienceYears} years` : ''}
${userContext.careerGoals ? `Career Goals: ${userContext.careerGoals}` : ''}
${userContext.currentChallenges ? `Current Challenges: ${userContext.currentChallenges}` : ''}

GUIDELINES:
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Reference Indian workplace norms when relevant
- Use examples from tech/corporate environments
- Encourage skill development and goal tracking
- Be direct about areas needing improvement
- Celebrate wins and progress

Remember: You're their manager, not their friend. Be supportive but maintain professional boundaries.`;
  }

  private async generateWithTimeout(prompt: string, timeoutMs: number): Promise<string> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`AI request timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    const generatePromise = (async () => {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    })();

    return Promise.race([generatePromise, timeoutPromise]);
  }

  async chat(messages: ChatMessage[], userContext: UserContext): Promise<string> {
    console.log('[AI Service] Starting chat generation...');
    console.log('[AI Service] Mode:', this.apiKeyType === 'makersuite' ? 'MakerSuite' : 'Google Cloud');
    console.log('[AI Service] Model:', this.modelName);
    console.log('[AI Service] Message count:', messages.length);
    console.log('[AI Service] User context:', {
      hasName: !!userContext.name,
      hasRole: !!userContext.roleTitle,
      tone: userContext.managerTone || 'balanced'
    });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI Service] Attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const systemPrompt = this.buildSystemPrompt(userContext, userContext.managerTone || 'balanced');
        
        // Optimize prompt to reduce token count and improve response time
        // Only use last 10 messages for faster processing and lower costs
        const recentHistory = messages.slice(-10);
        const conversationHistory = recentHistory.map(msg => 
          `${msg.role === 'user' ? 'User' : 'Manager'}: ${msg.content}`
        ).join('\n\n');

        const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nManager:`;
        
        console.log('[AI Service] Prompt length:', prompt.length, 'characters');
        console.log('[AI Service] Calling Gemini API...');
        
        const responseText = await this.generateWithTimeout(prompt, this.REQUEST_TIMEOUT);
        
        console.log('[AI Service] ✅ Response received, length:', responseText.length, 'characters');
        console.log('[AI Service] Response preview:', responseText.substring(0, 100) + '...');
        
        return responseText;
      } catch (error) {
        lastError = error as Error;
        console.error(`[AI Service] ❌ Attempt ${attempt} failed:`, error);
        
        if (error instanceof Error) {
          console.error('[AI Service] Error message:', error.message);
          console.error('[AI Service] Error stack:', error.stack);
          
          // Don't retry on certain errors
          if (error.message.includes('API key') || 
              error.message.includes('invalid') ||
              error.message.includes('unauthorized')) {
            console.error('[AI Service] Fatal error detected, not retrying');
            break;
          }
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[AI Service] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    console.error('[AI Service] ❌ All retry attempts exhausted');
    const errorMessage = lastError?.message || 'Unknown error';
    throw new Error(`Failed to generate AI response after ${this.MAX_RETRIES} attempts: ${errorMessage}`);
  }

  async evaluateMomentResponse(
    scenario: string,
    userResponse: string,
    learningObjectives: string[]
  ): Promise<{ score: number; strengths: string[]; improvements: string[]; examples: string[] }> {
    try {
      const prompt = `You are evaluating a GenZ professional's response to a workplace scenario.

SCENARIO:
${scenario}

USER'S RESPONSE:
${userResponse}

LEARNING OBJECTIVES:
${learningObjectives.join('\n')}

Evaluate the response and provide:
1. A score from 0-100
2. 2-3 key strengths
3. 2-3 areas for improvement
4. 2-3 specific examples of better approaches

Format your response as JSON:
{
  "score": <number>,
  "strengths": [<string>],
  "improvements": [<string>],
  "examples": [<string>]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse evaluation response');
    } catch (error) {
      console.error('Evaluation Error:', error);
      throw new Error('Failed to evaluate response');
    }
  }

  async generateMicroHabit(skill: string, context: string): Promise<string> {
    try {
      const prompt = `Generate a micro-habit (small, daily action) to help improve the skill: "${skill}".
Context: ${context}

Provide a single, specific, actionable habit that takes less than 10 minutes daily.
Keep it practical for Indian workplace context.
Format: Just the habit description, no extra text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Micro-habit generation error:', error);
      throw new Error('Failed to generate micro-habit');
    }
  }
}

export const aiService = new AIService();
