// DON'T DELETE THIS COMMENT
// Using the Gemini AI blueprint integration for conversation summaries
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ConversationMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ConversationSummary {
  keyInsights: string[];
  mainTopics: string[];
  actionItems: string[];
  coachingThemes: string[];
  overallSentiment: string;
  progressIndicators: string[];
}

export async function generateConversationSummary(
  messages: ConversationMessage[],
  coachType: string
): Promise<string> {
  if (!messages || messages.length === 0) {
    return "No conversation to summarize.";
  }

  // Format conversation for AI analysis
  const conversationText = messages
    .map((msg) => `${msg.isUser ? "User" : "Coach"}: ${msg.content}`)
    .join("\n");

  const prompt = `You are analyzing a coaching conversation between a user and a ${coachType} coach. 
Please provide a concise, insightful summary that captures:

1. Key insights and breakthroughs discussed
2. Main topics covered
3. Actionable next steps identified
4. Progress indicators or growth areas
5. Overall tone and sentiment of the session

Conversation:
${conversationText}

Please provide a professional, encouraging summary that helps the user track their coaching journey and progress. Keep it under 200 words and focus on actionable insights.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    
    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Error generating conversation summary:", error);
    return "Summary generation temporarily unavailable. Please try again later.";
  }
}

export async function generateDetailedSummary(
  messages: ConversationMessage[],
  coachType: string
): Promise<ConversationSummary> {
  if (!messages || messages.length === 0) {
    return {
      keyInsights: [],
      mainTopics: [],
      actionItems: [],
      coachingThemes: [],
      overallSentiment: "neutral",
      progressIndicators: []
    };
  }

  const conversationText = messages
    .map((msg) => `${msg.isUser ? "User" : "Coach"}: ${msg.content}`)
    .join("\n");

  const systemPrompt = `You are a professional coaching analysis expert. 
Analyze the following coaching conversation and provide structured insights.
Return your response as valid JSON with this exact structure:
{
  "keyInsights": ["insight1", "insight2"],
  "mainTopics": ["topic1", "topic2"],
  "actionItems": ["action1", "action2"],
  "coachingThemes": ["theme1", "theme2"],
  "overallSentiment": "positive/neutral/challenging",
  "progressIndicators": ["indicator1", "indicator2"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            keyInsights: { type: "array", items: { type: "string" } },
            mainTopics: { type: "array", items: { type: "string" } },
            actionItems: { type: "array", items: { type: "string" } },
            coachingThemes: { type: "array", items: { type: "string" } },
            overallSentiment: { type: "string" },
            progressIndicators: { type: "array", items: { type: "string" } }
          },
          required: ["keyInsights", "mainTopics", "actionItems", "coachingThemes", "overallSentiment", "progressIndicators"]
        }
      },
      contents: `Analyze this ${coachType} coaching conversation:\n\n${conversationText}`
    });
    
    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error("Error generating detailed summary:", error);
    return {
      keyInsights: ["Conversation analysis temporarily unavailable"],
      mainTopics: ["Please try again later"],
      actionItems: ["Contact support if issue persists"],
      coachingThemes: [coachType],
      overallSentiment: "neutral",
      progressIndicators: ["Analysis pending"]
    };
  }
}