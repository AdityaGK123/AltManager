import express from 'express';
import { db } from '../db/index.js';
import { conversations, messages, users, userProfiles } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/ai.service.js';
import { cleanupService } from '../services/cleanup.service.js';
import { momService } from '../services/mom.service.js';

const router = express.Router();

// Create new conversation
router.post('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[Chat] POST /conversations - userId:', req.userId);
    const { title } = req.body;

    if (!req.userId) {
      console.error('[Chat] POST /conversations - Missing userId');
      return res.status(401).json({ error: 'User ID not found in request' });
    }

    const [conversation] = await db.insert(conversations).values({
      userId: req.userId,
      title: title || 'New Conversation',
    }).returning();

    console.log('[Chat] POST /conversations - Created conversation:', conversation.id);

    // Trigger cleanup to maintain 5-conversation limit
    cleanupService.cleanupAfterCreate(req.userId).catch(err => {
      console.error('[Chat] Cleanup error (non-blocking):', err);
    });

    res.status(201).json({ conversation });
  } catch (error: any) {
    console.error('[Chat] POST /conversations error:', error);
    console.error('[Chat] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user conversations
router.get('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[Chat] GET /conversations - userId:', req.userId);
    
    if (!req.userId) {
      console.error('[Chat] GET /conversations - Missing userId');
      return res.status(401).json({ error: 'User ID not found in request' });
    }

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, req.userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(5);

    console.log('[Chat] GET /conversations - Found', userConversations.length, 'conversations');
    res.json({ conversations: userConversations });
  } catch (error: any) {
    console.error('[Chat] GET /conversations error:', error);
    console.error('[Chat] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch conversations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[Chat] GET /conversations/:id/messages - conversationId:', req.params.id, 'userId:', req.userId);
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      console.error('[Chat] Invalid conversation ID:', req.params.id);
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!req.userId) {
      console.error('[Chat] Missing userId');
      return res.status(401).json({ error: 'User ID not found in request' });
    }

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== req.userId) {
      console.log('[Chat] Conversation not found or unauthorized');
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    console.log('[Chat] Found', conversationMessages.length, 'messages');
    res.json({ messages: conversationMessages });
  } catch (error: any) {
    console.error('[Chat] GET messages error:', error);
    console.error('[Chat] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send message and get AI response
router.post('/conversations/:id/messages', authenticateToken, async (req: AuthRequest, res) => {
  const startTime = Date.now();
  try {
    console.log('[Chat] ========================================');
    console.log('[Chat] Received message request:', { conversationId: req.params.id, userId: req.userId });
    const conversationId = parseInt(req.params.id);
    const { content } = req.body;

    // Validate input
    if (!content || typeof content !== 'string') {
      console.log('[Chat] ❌ Error: Invalid content provided');
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (content.trim().length === 0) {
      console.log('[Chat] ❌ Error: Empty content');
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    if (content.length > 5000) {
      console.log('[Chat] ❌ Error: Content too long');
      return res.status(400).json({ error: 'Message content is too long (max 5000 characters)' });
    }

    console.log('[Chat] ✅ Message content validated:', content.substring(0, 50) + '...');

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== req.userId) {
      console.log('[Chat] Error: Conversation not found or unauthorized');
      return res.status(404).json({ error: 'Conversation not found' });
    }

    console.log('[Chat] Conversation verified, saving user message...');

    // Save user message
    const [userMessage] = await db.insert(messages).values({
      conversationId,
      role: 'user',
      content,
    }).returning();

    console.log('[Chat] User message saved:', userMessage.id);

    // Get user context
    console.log('[Chat] Fetching user context...');
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!)).limit(1);
    console.log('[Chat] User context:', { email: user?.email, hasProfile: !!profile });

    // Get conversation history
    console.log('[Chat] Fetching conversation history...');
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)
      .limit(20);
    console.log('[Chat] History loaded:', history.length, 'messages');

    // Generate AI response
    const chatHistory = history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    console.log('[Chat] Calling AI service...');
    let aiResponse: string;
    
    try {
      aiResponse = await aiService.chat(chatHistory, {
        name: user?.firstName || user?.email || undefined,
        roleTitle: profile?.roleTitle || undefined,
        experienceYears: profile?.experienceYears || undefined,
        careerGoals: profile?.careerGoals || undefined,
        currentChallenges: profile?.currentChallenges || undefined,
        managerTone: profile?.managerTone || undefined,
      });
    } catch (aiError) {
      console.error('[Chat] ❌ AI Service failed:', aiError);
      throw new Error(`AI service error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
    }
    
    // Validate AI response
    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
      console.error('[Chat] ❌ Invalid AI response received:', aiResponse);
      throw new Error('AI service returned invalid response');
    }
    
    console.log('[Chat] ✅ AI response received:', aiResponse.substring(0, 100) + '...');
    console.log('[Chat] AI response length:', aiResponse.length, 'characters');

    // Save AI message
    console.log('[Chat] Saving AI message...');
    const [assistantMessage] = await db.insert(messages).values({
      conversationId,
      role: 'assistant',
      content: aiResponse,
    }).returning();
    console.log('[Chat] AI message saved:', assistantMessage.id);

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    // Trigger automatic MoM generation (non-blocking)
    momService.autoGenerateMoM(conversationId, req.userId!).catch(err => {
      console.error('[Chat] MoM auto-generation error (non-blocking):', err);
    });

    const duration = Date.now() - startTime;
    console.log('[Chat] ✅ Request completed successfully in', duration, 'ms');
    console.log('[Chat] Sending response to client');
    console.log('[Chat] ========================================');
    
    res.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Chat] ========================================');
    console.error('[Chat] ❌ ERROR after', duration, 'ms');
    console.error('[Chat] Error details:', error);
    
    if (error instanceof Error) {
      console.error('[Chat] Error name:', error.name);
      console.error('[Chat] Error message:', error.message);
      console.error('[Chat] Error stack:', error.stack);
      
      // Determine appropriate status code
      let statusCode = 500;
      let errorMessage = 'Failed to send message';
      
      if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        statusCode = 503;
        errorMessage = 'AI service is temporarily unavailable';
      } else if (error.message.includes('timeout')) {
        statusCode = 504;
        errorMessage = 'AI service request timed out';
      } else if (error.message.includes('rate limit')) {
        statusCode = 429;
        errorMessage = 'Too many requests, please try again later';
      }
      
      console.error('[Chat] Sending error response:', statusCode, errorMessage);
      console.error('[Chat] ========================================');
      
      res.status(statusCode).json({ 
        error: errorMessage, 
        details: error.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('[Chat] Unknown error type:', typeof error);
      console.error('[Chat] ========================================');
      
      res.status(500).json({ 
        error: 'Failed to send message', 
        details: 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// End conversation and generate MoM
router.post('/conversations/:id/end', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[Chat] POST /conversations/:id/end - conversationId:', req.params.id, 'userId:', req.userId);
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      console.error('[Chat] Invalid conversation ID:', req.params.id);
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!req.userId) {
      console.error('[Chat] Missing userId');
      return res.status(401).json({ error: 'User ID not found in request' });
    }

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== req.userId) {
      console.log('[Chat] Conversation not found or unauthorized');
      return res.status(404).json({ error: 'Conversation not found' });
    }

    console.log('[Chat] Ending conversation and generating MoM:', conversationId);

    // Generate MoM for this conversation
    const mom = await momService.generateMoMForConversation(conversationId, req.userId);

    console.log('[Chat] MoM generated successfully for conversation:', conversationId);
    res.json({ 
      success: true,
      message: 'Conversation ended and MoM generated',
      mom,
    });
  } catch (error: any) {
    console.error('[Chat] End conversation error:', error);
    console.error('[Chat] Error stack:', error.stack);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to end conversation';
    let statusCode = 500;
    
    if (error.message?.includes('too short')) {
      errorMessage = 'Conversation is too short to generate meaningful insights. Please have at least 2-3 exchanges before ending the conversation.';
      statusCode = 400;
    } else if (error.message?.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'MoM generation timed out. Please try again.';
      statusCode = 504;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete conversation
router.delete('/conversations/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[Chat] DELETE /conversations/:id - conversationId:', req.params.id, 'userId:', req.userId);
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      console.error('[Chat] Invalid conversation ID:', req.params.id);
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!req.userId) {
      console.error('[Chat] Missing userId');
      return res.status(401).json({ error: 'User ID not found in request' });
    }

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.userId !== req.userId) {
      console.log('[Chat] Conversation not found or unauthorized');
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete messages first
    await db.delete(messages).where(eq(messages.conversationId, conversationId));

    // Delete conversation
    await db.delete(conversations).where(eq(conversations.id, conversationId));

    console.log('[Chat] Conversation deleted successfully:', conversationId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Chat] DELETE conversation error:', error);
    console.error('[Chat] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to delete conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
