# Chat Feature Testing Guide

## Quick Test Checklist

### ✅ Basic Functionality
- [ ] Click "Start Chatting" button
- [ ] Conversation is created
- [ ] Chat interface opens
- [ ] Send a message
- [ ] AI responds within 2-3 seconds
- [ ] Messages persist after page refresh
- [ ] Can create multiple conversations
- [ ] Can switch between conversations

### ✅ UI/UX
- [ ] Loading indicators appear
- [ ] Messages auto-scroll to bottom
- [ ] User messages align right (gradient background)
- [ ] AI messages align left (white background)
- [ ] Timestamps display correctly
- [ ] Empty state shows when no messages
- [ ] Voice input button works (if supported)
- [ ] Mobile responsive layout

### ✅ Error Handling
- [ ] Empty message doesn't send
- [ ] Network error shows user-friendly message
- [ ] Invalid conversation ID returns 404
- [ ] Unauthorized access redirects to login

---

## Detailed Testing Procedures

### 1. First-Time User Flow

**Steps:**
1. Navigate to `/chat`
2. Verify empty state displays:
   - Icon with gradient background
   - "Start Your First Conversation" heading
   - "Start Chatting" button
3. Click "Start Chatting"
4. Verify:
   - Loading indicator appears briefly
   - Redirects to `/chat/:id`
   - Chat interface loads
   - Empty message state shows

**Expected Result:** ✅ User successfully enters chat interface

---

### 2. Send First Message

**Steps:**
1. Type "Hello, I need help with my career" in input field
2. Click send button (or press Enter)
3. Observe:
   - User message appears immediately (right side, gradient)
   - Loading dots appear (left side)
   - AI response appears within 2-3 seconds
   - Messages auto-scroll to bottom

**Expected Result:** ✅ Two-way conversation works smoothly

---

### 3. Multiple Messages

**Steps:**
1. Send 5 consecutive messages:
   - "What are my career options?"
   - "How do I improve my skills?"
   - "Should I switch jobs?"
   - "What about work-life balance?"
   - "Any tips for interviews?"
2. Verify each gets a unique AI response
3. Check all messages display in chronological order

**Expected Result:** ✅ Conversation flows naturally with context

---

### 4. Create Multiple Conversations

**Steps:**
1. Click "New Chat" button in header
2. Verify new conversation created
3. Send a message in new conversation
4. Navigate back to `/chat`
5. Verify both conversations appear in list
6. Click first conversation
7. Verify messages from first conversation load
8. Click second conversation
9. Verify messages from second conversation load

**Expected Result:** ✅ Multiple conversations maintained separately

---

### 5. Page Refresh Persistence

**Steps:**
1. Send 3 messages in a conversation
2. Refresh the page (F5 or Ctrl+R)
3. Verify:
   - Conversation still exists
   - All 3 messages display
   - Can send new messages

**Expected Result:** ✅ Data persists across sessions

---

### 6. Voice Input (Browser-Dependent)

**Steps:**
1. Click microphone icon
2. Allow microphone permission (if prompted)
3. Speak: "I want to discuss my career goals"
4. Verify text appears in input field
5. Click send
6. Verify message sends normally

**Expected Result:** ✅ Voice input works (Chrome/Edge)  
**Note:** Safari/Firefox may not support speech recognition

---

### 7. Mobile Responsiveness

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro
4. Test:
   - Chat list displays correctly
   - Messages are readable
   - Input field is accessible
   - Buttons are touch-friendly
   - No horizontal scroll
5. Repeat for iPad and Android devices

**Expected Result:** ✅ Fully responsive on all devices

---

### 8. Error Handling - Empty Message

**Steps:**
1. Leave input field empty
2. Try to click send button
3. Verify button is disabled
4. Type spaces only
5. Verify button remains disabled

**Expected Result:** ✅ Cannot send empty messages

---

### 9. Error Handling - Network Failure

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to send a message
4. Verify error message appears
5. Set throttling back to "Online"
6. Retry sending message
7. Verify message sends successfully

**Expected Result:** ✅ Graceful error handling with retry

---

### 10. Error Handling - Unauthorized Access

**Steps:**
1. Open DevTools → Application → Local Storage
2. Delete the "token" key
3. Try to send a message
4. Verify:
   - Request fails with 401
   - Automatically redirects to /login

**Expected Result:** ✅ Security enforced, redirects to login

---

### 11. Delete Conversation

**Steps:**
1. Create a test conversation
2. Send 2-3 messages
3. Navigate back to conversation list
4. Delete the conversation (if delete button exists)
5. Verify conversation removed from list
6. Try to access deleted conversation by URL
7. Verify 404 error

**Expected Result:** ✅ Conversation deleted successfully

---

### 12. Long Message Handling

**Steps:**
1. Type a very long message (500+ words)
2. Send the message
3. Verify:
   - Message displays with proper wrapping
   - No horizontal scroll
   - AI responds appropriately

**Expected Result:** ✅ Long messages handled gracefully

---

### 13. Special Characters

**Steps:**
1. Send messages with:
   - Emojis: "I'm feeling 😊 today!"
   - Code: "How do I use `console.log()`?"
   - Links: "Check out https://example.com"
   - Markdown: "**Bold** and *italic*"
2. Verify all display correctly

**Expected Result:** ✅ Special characters render properly

---

### 14. Rapid Message Sending

**Steps:**
1. Send 5 messages rapidly (1 per second)
2. Verify:
   - All messages queue properly
   - AI responds to each
   - No messages lost
   - No duplicate responses

**Expected Result:** ✅ Handles rapid input without issues

---

### 15. Browser Compatibility

**Test in each browser:**

#### Chrome
- [ ] All features work
- [ ] Voice input works
- [ ] Animations smooth

#### Edge
- [ ] All features work
- [ ] Voice input works
- [ ] Animations smooth

#### Firefox
- [ ] All features work
- [ ] Voice input may not work (expected)
- [ ] Animations smooth

#### Safari
- [ ] All features work
- [ ] Voice input may not work (expected)
- [ ] Animations smooth

**Expected Result:** ✅ Core features work in all browsers

---

## Performance Testing

### Load Test (50 Concurrent Users)

**Tools:** Apache JMeter or Artillery

**Test Plan:**
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 50
scenarios:
  - name: "Chat Flow"
    flow:
      - post:
          url: "/api/chat/conversations"
          json:
            title: "Test Conversation"
      - post:
          url: "/api/chat/conversations/{{ conversationId }}/messages"
          json:
            content: "Test message"
```

**Expected Results:**
- ✅ Response time p95 < 2 seconds
- ✅ Error rate < 1%
- ✅ No memory leaks
- ✅ Database connections stable

---

## API Testing

### Using cURL

#### 1. Create Conversation
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Chat"}'
```

**Expected:** `201 Created` with conversation object

#### 2. Get Conversations
```bash
curl http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `200 OK` with conversations array

#### 3. Send Message
```bash
curl -X POST http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello AI"}'
```

**Expected:** `200 OK` with userMessage and assistantMessage

#### 4. Get Messages
```bash
curl http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `200 OK` with messages array

---

## Automated Testing Script

### Node.js Test Script

```javascript
// test-chat-feature.js
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let token = 'YOUR_TOKEN_HERE';

async function testChatFeature() {
  try {
    console.log('🧪 Testing Chat Feature...\n');

    // 1. Create conversation
    console.log('1️⃣ Creating conversation...');
    const convRes = await axios.post(
      `${API_URL}/chat/conversations`,
      { title: 'Test Conversation' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const conversationId = convRes.data.conversation.id;
    console.log(`✅ Created conversation ${conversationId}\n`);

    // 2. Send message
    console.log('2️⃣ Sending message...');
    const msgRes = await axios.post(
      `${API_URL}/chat/conversations/${conversationId}/messages`,
      { content: 'Hello, test message' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ User message: ${msgRes.data.userMessage.content}`);
    console.log(`✅ AI response: ${msgRes.data.assistantMessage.content.substring(0, 50)}...\n`);

    // 3. Get messages
    console.log('3️⃣ Fetching messages...');
    const fetchRes = await axios.get(
      `${API_URL}/chat/conversations/${conversationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Fetched ${fetchRes.data.messages.length} messages\n`);

    // 4. Get conversations
    console.log('4️⃣ Fetching conversations...');
    const listRes = await axios.get(
      `${API_URL}/chat/conversations`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Found ${listRes.data.conversations.length} conversations\n`);

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testChatFeature();
```

**Run:** `node test-chat-feature.js`

---

## Troubleshooting

### Issue: "Start Chatting" button doesn't work

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Authentication token is valid
4. Backend server is running

**Fix:**
```bash
# Restart backend
cd server
npm run dev
```

### Issue: AI responses not appearing

**Check:**
1. GEMINI_API_KEY is set in server/.env
2. API key is valid
3. Check server logs for errors

**Fix:**
```bash
# Verify API key
echo $GEMINI_API_KEY

# Test AI service
curl https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_KEY
```

### Issue: Messages not persisting

**Check:**
1. Database is running
2. DATABASE_URL is correct
3. Tables exist

**Fix:**
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# Verify tables
psql $DATABASE_URL -c "\dt"
```

---

## Success Criteria

✅ **All tests pass**
✅ **No console errors**
✅ **Response time < 2s**
✅ **Works in all major browsers**
✅ **Mobile responsive**
✅ **Data persists**
✅ **Error handling works**

---

**Last Updated:** 2025-10-15  
**Status:** Ready for Testing
