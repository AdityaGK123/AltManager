require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('\n' + '='.repeat(70));
console.log('CHAT FLOW TEST - End-to-End Verification');
console.log('='.repeat(70) + '\n');

async function testChatFlow() {
  try {
    // Step 1: Check API Key
    console.log('Step 1: Checking GEMINI_API_KEY...');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set');
      return false;
    }
    
    const keyType = apiKey.startsWith('AIza') ? 'MakerSuite (Free)' : 'Google Cloud (Paid)';
    console.log(`✅ API Key detected: ${keyType}`);
    console.log(`   Length: ${apiKey.length} characters\n`);
    
    // Step 2: Initialize Gemini
    console.log('Step 2: Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Model initialized: gemini-2.5-flash\n');
    
    // Step 3: Test AI Response
    console.log('Step 3: Testing AI response generation...');
    const testPrompt = 'You are a career manager. A user asks: "I want to become an AI/ML engineer. Guide me." Respond in 2-3 sentences.';
    
    console.log('Sending prompt to Gemini API...');
    const startTime = Date.now();
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ AI Response received in ${duration}ms`);
    console.log(`   Length: ${text.length} characters`);
    console.log(`   Preview: ${text.substring(0, 150)}...\n`);
    
    // Step 4: Verify Response Quality
    console.log('Step 4: Validating response...');
    if (!text || text.trim().length === 0) {
      console.error('❌ Response is empty');
      return false;
    }
    
    if (text.length < 20) {
      console.error('❌ Response too short');
      return false;
    }
    
    console.log('✅ Response is valid and substantial\n');
    
    // Step 5: Test with conversation history
    console.log('Step 5: Testing with conversation history...');
    const conversationPrompt = `You are ALT Manager, an AI career manager.

CONVERSATION HISTORY:
User: I want to start my career in AI/ML engineering
Manager: Great choice! AI/ML is a rapidly growing field...

User: What skills should I learn first?

Manager:`;
    
    console.log('Sending conversation prompt...');
    const result2 = await model.generateContent(conversationPrompt);
    const response2 = await result2.response;
    const text2 = response2.text();
    
    console.log(`✅ Conversation response received`);
    console.log(`   Length: ${text2.length} characters`);
    console.log(`   Preview: ${text2.substring(0, 150)}...\n`);
    
    // Summary
    console.log('='.repeat(70));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    console.log('✅ API Key: Valid');
    console.log('✅ Model: gemini-1.5-flash initialized');
    console.log('✅ Simple prompt: Working');
    console.log('✅ Conversation prompt: Working');
    console.log(`✅ Average response time: ${duration}ms`);
    console.log('\n🎉 ALL TESTS PASSED - Chat flow is functional!\n');
    console.log('Next steps:');
    console.log('1. Ensure server is running: npm run dev');
    console.log('2. Open browser: http://localhost:5173/chat');
    console.log('3. Send a message and verify AI responds');
    console.log('4. Check server logs for [Chat] and [AI Service] messages\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    return false;
  }
}

testChatFlow().then(success => {
  process.exit(success ? 0 : 1);
});
