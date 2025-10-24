import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCoachingSessionSchema, insertSavedAdviceSchema, updateCoachingSessionSchema } from "@shared/schema";
import { z } from "zod";
import { generateConversationSummary, generateDetailedSummary, type ConversationMessage } from "./services/ai-summary";
import { generateCoachResponse } from "./services/ai-coaching";
import { requireAuth } from "./middleware/auth";

// Simple in-memory rate limiter for AI endpoints
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const AI_RATE_LIMIT = 10; // requests per hour
const AI_RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + AI_RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= AI_RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Coaching session routes
  
  // Create a new coaching session
  app.post("/api/coaching-sessions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const validated = insertCoachingSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const session = await storage.createCoachingSession(validated);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating coaching session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user's coaching sessions
  app.get("/api/coaching-sessions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const sessions = await storage.getUserCoachingSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching coaching sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single coaching session by ID
  app.get("/api/coaching-sessions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const session = await storage.getCoachingSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching coaching session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update a coaching session (for adding summary, hearting, etc.)
  app.patch("/api/coaching-sessions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const { id } = req.params;
      const session = await storage.getCoachingSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Validate the update data using schema
      const validated = updateCoachingSessionSchema.parse(req.body);

      const updated = await storage.updateCoachingSession(id, validated);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating coaching session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat with AI coach route
  app.post("/api/coaching-sessions/:id/chat", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check rate limit
      if (!checkRateLimit(userId)) {
        return res.status(429).json({ 
          error: "Rate limit exceeded", 
          message: "You can send up to 10 messages per hour" 
        });
      }

      // Get the session and verify ownership
      const session = await storage.getCoachingSession(id);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Get user profile for context
      const user = await storage.getUser(userId);
      const userProfile = {
        currentRole: user?.currentRole || undefined,
        industry: user?.industry || undefined,
        careerStage: user?.careerStage || undefined,
        fiveYearGoal: user?.fiveYearGoal || undefined,
        biggestChallenge: user?.biggestChallenge || undefined,
        workEnvironment: user?.workEnvironment || undefined,
      };

      // Get conversation history
      const conversationHistory = Array.isArray(session.messages) 
        ? (session.messages as ConversationMessage[])
        : [];

      // Generate AI coach response
      const aiResponse = await generateCoachResponse(
        session.coachType,
        message.trim(),
        conversationHistory,
        userProfile
      );

      // Create message objects
      const userMessage = {
        id: `msg_${Date.now()}_user_${Math.random().toString(36).substr(2, 9)}`,
        content: message.trim(),
        isUser: true,
        timestamp: new Date()
      };

      const coachMessage = {
        id: `msg_${Date.now()}_coach_${Math.random().toString(36).substr(2, 9)}`,
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      // Update session with new messages
      const updatedMessages = [...conversationHistory, userMessage, coachMessage];
      const updatedSession = await storage.updateCoachingSession(id, {
        messages: updatedMessages
      });

      res.json({
        success: true,
        userMessage,
        coachMessage,
        session: updatedSession
      });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Saved advice routes
  
  // Create saved advice
  app.post("/api/saved-advice", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      // Verify the referenced session exists and belongs to the user
      const { sessionId } = req.body;
      if (sessionId) {
        const session = await storage.getCoachingSession(sessionId);
        if (!session || session.userId !== userId) {
          return res.status(403).json({ error: "Session not found or access denied" });
        }
      }

      const validated = insertSavedAdviceSchema.parse({
        ...req.body,
        userId,
      });
      
      const advice = await storage.createSavedAdvice(validated);
      res.json(advice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating saved advice:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user's saved advice
  app.get("/api/saved-advice", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const advice = await storage.getUserSavedAdvice(userId);
      res.json(advice);
    } catch (error) {
      console.error("Error fetching saved advice:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete saved advice
  app.delete("/api/saved-advice/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const { id } = req.params;
      
      // First check if the advice exists and belongs to the user
      const userAdvice = await storage.getUserSavedAdvice(userId);
      const advice = userAdvice.find(a => a.id === id);
      
      if (!advice) {
        return res.status(404).json({ error: "Advice not found or access denied" });
      }

      const deleted = await storage.deleteSavedAdvice(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting saved advice:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Summary generation routes
  
  // Generate AI summary for a coaching session
  app.post("/api/coaching-sessions/:id/generate-summary", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Check rate limit
      if (!checkRateLimit(userId)) {
        return res.status(429).json({ 
          error: "Rate limit exceeded", 
          message: "You can generate up to 10 AI summaries per hour" 
        });
      }

      const { id } = req.params;
      const session = await storage.getCoachingSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Convert stored messages to ConversationMessage format
      const messages = Array.isArray(session.messages) 
        ? (session.messages as ConversationMessage[])
        : [];

      if (messages.length === 0) {
        return res.status(400).json({ error: "No messages to summarize" });
      }

      const summary = await generateConversationSummary(messages, session.coachType);
      
      // Update the session with the generated summary
      const updatedSession = await storage.updateCoachingSession(id, { summary });
      
      res.json({ summary, session: updatedSession });
    } catch (error) {
      console.error("Error generating AI summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Generate detailed AI analysis for a coaching session
  app.post("/api/coaching-sessions/:id/detailed-analysis", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Check rate limit
      if (!checkRateLimit(userId)) {
        return res.status(429).json({ 
          error: "Rate limit exceeded", 
          message: "You can generate up to 10 AI analyses per hour" 
        });
      }

      const { id } = req.params;
      const session = await storage.getCoachingSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: "Session not found" });
      }

      const messages = Array.isArray(session.messages) 
        ? (session.messages as ConversationMessage[])
        : [];

      if (messages.length === 0) {
        return res.status(400).json({ error: "No messages to analyze" });
      }

      const analysis = await generateDetailedSummary(messages, session.coachType);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error generating detailed analysis:", error);
      res.status(500).json({ error: "Failed to generate analysis" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
