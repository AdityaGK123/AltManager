// DON'T DELETE THIS COMMENT
// Using the Gemini AI blueprint integration for coaching conversations
import { GoogleGenAI } from "@google/genai";

// Define coach data for server use (without frontend assets)
const coachData = {
  leadership: {
    name: 'Samuel',
    title: 'Leadership Coach',
    description: 'Transform from successful manager to visionary leader',
    specialties: ['Executive presence', 'Strategic thinking', 'Team leadership', 'Organizational change']
  },
  performance: {
    name: 'Rohan',
    title: 'Performance Coach', 
    description: 'Accelerate your performance to stand out and advance',
    specialties: ['Productivity optimization', 'Goal achievement', 'Skill development', 'Performance reviews']
  },
  career: {
    name: 'Maya',
    title: 'Career Coach',
    description: 'Navigate career transitions and accelerate growth strategically',
    specialties: ['Career planning', 'Job transitions', 'Networking', 'Salary negotiation']
  },
  hipo: {
    name: 'Aria',
    title: 'HiPo Coach',
    description: 'Strategic career guidance for high-potential professionals',
    specialties: ['Strategic thinking', 'Executive presence', 'Leadership pipeline', 'High-impact decisions']
  },
  life: {
    name: 'Zara',
    title: 'Life Coach',
    description: 'Achieve work-life integration and personal fulfillment',
    specialties: ['Work-life balance', 'Stress management', 'Personal goals', 'Wellness']
  },
  empathear: {
    name: 'Arjun',
    title: 'EmpathEAR Coach',
    description: 'Your empathetic listening companion for emotional support',
    specialties: ['Emotional support', 'Active listening', 'Stress relief', 'Mental wellness']
  }
};

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UserProfile {
  currentRole?: string;
  industry?: string;
  careerStage?: string;
  fiveYearGoal?: string;
  biggestChallenge?: string;
  workEnvironment?: string;
}

export async function generateCoachResponse(
  coachType: string,
  userMessage: string,
  conversationHistory: ChatMessage[],
  userProfile?: UserProfile
): Promise<string> {
  if (!userMessage.trim()) {
    return "I'm here to help you. What would you like to discuss today?";
  }

  const coach = coachData[coachType as keyof typeof coachData];
  if (!coach) {
    return "I'm sorry, I couldn't find that coach. Please try again.";
  }

  // Build conversation context
  const historyText = conversationHistory
    .slice(-10) // Keep last 10 messages for context
    .map(msg => `${msg.isUser ? "User" : "Coach"}: ${msg.content}`)
    .join("\n");

  // Build user profile context
  const profileContext = userProfile ? `
User Profile:
- Current Role: ${userProfile.currentRole || "Not specified"}
- Industry: ${userProfile.industry || "Not specified"}
- Career Stage: ${userProfile.careerStage || "Not specified"}
- Five Year Goal: ${userProfile.fiveYearGoal || "Not specified"}
- Biggest Challenge: ${userProfile.biggestChallenge || "Not specified"}
- Work Environment: ${userProfile.workEnvironment || "Not specified"}
` : "";

  const systemPrompt = `You are ${coach.name}, ${coach.description}

Key coaching areas you focus on:
${coach.specialties.map(specialty => `- ${specialty}`).join('\n')}

Context about your coaching style:
- You are warm, empathetic, and culturally sensitive to Indian workplace dynamics
- You provide practical, actionable advice that can be implemented immediately
- You ask thoughtful follow-up questions to understand the user's situation better
- You celebrate small wins and progress
- You keep responses concise (2-3 paragraphs max) and focused
- You use simple, everyday language - avoid jargon
- You acknowledge the unique challenges faced by Indian professionals
- You provide specific examples relevant to Indian work culture when appropriate

${profileContext}

Previous conversation context:
${historyText}

Guidelines:
1. Stay in character as ${coach.name}
2. Keep responses helpful, encouraging, and actionable
3. Ask one thoughtful follow-up question when appropriate
4. If the user seems stuck, offer 2-3 specific next steps
5. Acknowledge Indian cultural context when relevant (hierarchical organizations, family expectations, etc.)
6. Focus on practical solutions that work in Indian professional settings

Respond to the user's message in a natural, conversational way as their personal ${coach.name} coach.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 500, // Keep responses concise
        temperature: 0.7, // Slightly creative but consistent
      },
      contents: `User: ${userMessage}`
    });
    
    const responseText = response.text;
    if (!responseText || responseText.trim().length === 0) {
      return "I'm sorry, I'm having trouble processing your message right now. Could you please try rephrasing it?";
    }

    return responseText.trim();
  } catch (error) {
    console.error(`Error generating ${coach.name} response:`, error);
    
    // Check if it's an API key issue
    if (!process.env.GEMINI_API_KEY) {
      return "I apologize, but I'm not properly configured right now. Please contact support to help resolve this issue. In the meantime, consider talking to a trusted colleague or mentor about your leadership challenges.";
    }
    
    return "I'm experiencing some technical difficulties right now. Please try again in a moment. In the meantime, take a deep breath - we'll work through this together.";
  }
}

// Helper function to create a new message object
export function createChatMessage(
  content: string,
  isUser: boolean,
  id?: string
): ChatMessage {
  return {
    id: id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    isUser,
    timestamp: new Date()
  };
}