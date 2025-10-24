import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { apiRateLimit } from '../middleware/security';
import { sendContactResponse } from '../services/email';
import { insertContactMessageSchema } from '@shared/schema';

const router = Router();

// Contact form submission with rate limiting
router.post('/contact', apiRateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const validatedData = insertContactMessageSchema.parse(req.body);
    
    // Create contact message
    const contactMessage = await storage.createContactMessage(validatedData);
    
    // Send auto-response email to user
    try {
      await sendContactResponse(validatedData.email, {
        name: validatedData.name,
        originalSubject: validatedData.subject,
        originalMessage: validatedData.message,
        appUrl: process.env.NODE_ENV === 'production' ? 'https://hipoaicoach.com' : 'http://localhost:5000',
        helpUrl: process.env.NODE_ENV === 'production' ? 'https://hipoaicoach.com/help' : 'http://localhost:5000/help',
      });
    } catch (emailError) {
      console.error('Failed to send contact response email:', emailError);
      // Don't fail the request if email fails
    }
    
    // TODO: Send notification to support team
    console.log(`New contact message from ${validatedData.name} (${validatedData.email}): ${validatedData.subject}`);
    
    res.status(201).json({
      message: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.',
      contactId: contactMessage.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({ error: 'Internal server error while processing your message' });
  }
});

export default router;