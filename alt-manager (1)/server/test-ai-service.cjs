require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('='.repeat(60));
console.log('AI SERVICE DIAGNOSTIC TEST');
console.log('='.repeat(60));
console.log('');

// Step 1: Check environment variable
console.log('Step 1: Checking GEMINI_API_KEY...');
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is NOT set in .env file');
  console.log('');
  console.log('Fix:');
  console.log('1. Create/edit server/.env file');
  console.log('2. Add: GEMINI_API_KEY=your_api_key_here');
  console.log('3. Get API key from:');
  console.log('   - MakerSuite (free): https://makersuite.google.com/app/apikey');
  console.log('   - Google Cloud (paid): https://console.cloud.google.com/');
  process.exit(1);
}

// Detect API key type
let keyType = 'Unknown';
if (apiKey.startsWith('AIza')) {
  keyType = 'MakerSuite (Free Tier)';
} else if (apiKey.length > 20) {
  keyType = 'Google Cloud (Paid)';
}

console.log('✅ GEMINI_API_KEY is set');
console.log(`   Type: ${keyType}`);
console.log(`   Length: ${apiKey.length} characters`);
console.log(`   Preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
console.log('');

// Step 2: Initialize Gemini
console.log('Step 2: Initializing Google Gemini AI...');
let genAI, model;

try {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  console.log('✅ Gemini AI initialized successfully');
  console.log('');
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI');
  console.error('Error:', error.message);
  process.exit(1);
}

// Step 3: Test simple prompt
console.log('Step 3: Testing simple prompt...');
console.log('Prompt: "Say hello in one sentence"');
console.log('');

async function testSimplePrompt() {
  try {
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Simple prompt test PASSED');
    console.log(`Response: "${text}"`);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Simple prompt test FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.log('');
    return false;
  }
}

// Step 4: Test chat-like prompt
console.log('Step 4: Testing chat-like prompt...');

async function testChatPrompt() {
  try {
    const systemPrompt = `You are ALT Manager, an AI career manager for GenZ professionals in India.
Keep responses concise and actionable (2-3 paragraphs max).`;

    const conversationHistory = `User: I want to become an AI/ML engineer
Manager:`;

    const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationHistory}`;
    
    console.log('Sending chat prompt...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Chat prompt test PASSED');
    console.log(`Response length: ${text.length} characters`);
    console.log(`Response preview: "${text.substring(0, 100)}..."`);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Chat prompt test FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.log('');
    return false;
  }
}

// Step 5: Test with timeout
console.log('Step 5: Testing with timeout (30s)...');

async function testWithTimeout() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
  );

  try {
    const testPromise = model.generateContent('Explain AI in one sentence');
    const result = await Promise.race([testPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Timeout test PASSED (response received within 30s)');
    console.log(`Response: "${text}"`);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Timeout test FAILED');
    console.error('Error:', error.message);
    console.log('');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('RUNNING DIAGNOSTIC TESTS');
  console.log('='.repeat(60));
  console.log('');

  const test1 = await testSimplePrompt();
  const test2 = await testChatPrompt();
  const test3 = await testWithTimeout();

  console.log('='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Simple Prompt Test:  ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chat Prompt Test:    ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Timeout Test:        ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  if (test1 && test2 && test3) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('The Gemini API is working correctly.');
    console.log('If chat still doesn\'t work, the issue is in the backend code.');
    console.log('');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('');
    console.log('Possible issues:');
    console.log('1. Invalid API key');
    console.log('2. Network connectivity problems');
    console.log('3. API rate limiting');
    console.log('4. Firewall blocking Google APIs');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify API key at: https://makersuite.google.com/app/apikey');
    console.log('2. Check internet connection');
    console.log('3. Try from a different network');
    console.log('');
  }

  console.log('='.repeat(60));
}

// Execute tests
runAllTests().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
