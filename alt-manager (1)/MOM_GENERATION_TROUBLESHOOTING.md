# MoM (Minutes of Meeting) Generation Troubleshooting Guide

## Issue: No MoMs Generated After Ending Conversation

### Common Causes

#### 1. **Conversation Too Short** (Most Common)
**Symptom:** Error message: "Conversation is too short to generate meaningful insights"

**Root Cause:** The conversation transcript must be at least 50 characters long.

**Solution:**
- Have at least 2-3 meaningful exchanges with the AI manager before ending the conversation
- Each message should be substantive (not just "hi" or "ok")

**Example of sufficient conversation:**
```
User: "I'm struggling with time management at work. How can I improve?"
AI: "Let's work on this together. Can you tell me about your current daily routine?"
User: "I usually start with emails, but then get distracted by meetings..."
AI: "I see. Let's create a structured approach..."
```

#### 2. **AI Service Error**
**Symptom:** Error related to API key or Gemini service

**Root Cause:** Gemini API key invalid or service unavailable

**Solution:**
- Check server logs for AI service errors
- Verify `GEMINI_API_KEY` in `server/.env` is valid
- Test with: `node server/test-ai-service.cjs`

#### 3. **Database Connection Error**
**Symptom:** Error saving MoM to database

**Root Cause:** PostgreSQL connection issue

**Solution:**
- Check `DATABASE_URL` in `server/.env`
- Verify database is accessible
- Check server logs for database errors

#### 4. **Network/Timeout Error**
**Symptom:** MoM generation times out

**Root Cause:** Gemini API slow response or network issues

**Solution:**
- Wait a moment and try again
- Check internet connection
- Verify Gemini API status

### Diagnostic Steps

#### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when clicking "End Chat & Generate MoM"
4. Check for error messages from the API response

#### Step 2: Check Server Logs
Look for these log messages:
```
[Chat] Ending conversation and generating MoM: <id>
[MoM Service] Building transcript for conversation: <id>
[MoM Service] ✅ Manual MoM created with ID: <id>
```

If you see errors like:
```
[MoM Service] ❌ Error in manual MoM generation: Conversation is too short...
```

This confirms the conversation was too short.

#### Step 3: Verify Database
Run the diagnostic script:
```bash
cd server
node check-moms.js
```

This will show:
- Total MoMs in database
- Recent conversations
- Message count and transcript length for recent conversations

### Fixes Implemented

#### 1. **Improved Error Messages** (server/src/routes/chat.ts)
- Specific error messages for different failure scenarios
- Clear guidance on what went wrong
- Better HTTP status codes (400 for short conversation, 503 for AI service error, etc.)

#### 2. **Toast Notifications** (client/src/pages/ChatPage.tsx)
- Error messages now show as toast notifications
- More visible to users
- Auto-dismiss after 8 seconds

#### 3. **Better Logging**
- Detailed console logs for debugging
- Error stack traces in development mode
- Clear success/failure indicators

### How to Test

#### Test 1: Short Conversation (Should Fail)
1. Start a new conversation
2. Send only 1 message: "Hi"
3. Click "End Chat & Generate MoM"
4. **Expected:** Error message: "Conversation is too short..."

#### Test 2: Proper Conversation (Should Succeed)
1. Start a new conversation
2. Have a meaningful exchange (3-4 messages each side)
3. Click "End Chat & Generate MoM"
4. **Expected:** 
   - Success toast: "Generating analytics insights..."
   - Redirect to Analytics page
   - MoM visible in Analytics page

### Minimum Requirements for MoM Generation

✅ **At least 50 characters** in total transcript  
✅ **At least 2 messages** (1 from user, 1 from AI)  
✅ **Valid Gemini API key** configured  
✅ **Database connection** working  
✅ **Conversation belongs to user** (authentication)  

### Quick Fix Checklist

- [ ] Have at least 2-3 meaningful exchanges before ending conversation
- [ ] Check browser console for error messages
- [ ] Verify Gemini API key is valid (`server/.env`)
- [ ] Check database connection (`DATABASE_URL` in `server/.env`)
- [ ] Restart server if needed: `npm run dev`
- [ ] Clear browser cache and reload page

### Still Not Working?

1. **Check server logs** for detailed error messages
2. **Run diagnostic script**: `node server/check-moms.js`
3. **Test AI service**: `node server/test-ai-service.cjs`
4. **Verify database**: Check PostgreSQL connection
5. **Check API quotas**: Gemini API might have rate limits

### Success Indicators

When MoM generation succeeds, you should see:

1. **Browser Console:**
   ```
   Conversation ended, MoM generated: {id: 1, title: "...", ...}
   [Chat] Analytics auto-generation completed
   ```

2. **Server Logs:**
   ```
   [Chat] Ending conversation and generating MoM: 1
   [MoM Service] ✅ Manual MoM created with ID: 1
   [Chat] MoM generated successfully for conversation: 1
   ```

3. **Analytics Page:**
   - MoM appears in the list
   - Dashboard shows "hasData: true"
   - Can view MoM details

### Related Files

- **Backend:**
  - `server/src/routes/chat.ts` - End conversation endpoint
  - `server/src/services/mom.service.ts` - MoM generation logic
  - `server/src/services/analysis.service.ts` - AI MoM generation

- **Frontend:**
  - `client/src/pages/ChatPage.tsx` - End conversation UI
  - `client/src/pages/AnalyticsPage.tsx` - MoM display

- **Diagnostics:**
  - `server/check-moms.js` - Database diagnostic script
  - `server/test-ai-service.cjs` - AI service test script
